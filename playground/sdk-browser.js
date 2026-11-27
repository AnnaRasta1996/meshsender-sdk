/**
 * Browser mirror of MeshSender Open SDK demo algorithms (no bundler).
 * Keep behavior aligned with src/* TypeScript modules.
 * Uses Web Crypto + tweetnacl from CDN (loaded by index.html).
 */
(function (global) {
  const Readiness = {
    LIVE_READ_ONLY: 'LIVE_READ_ONLY',
    VERIFIED_SYNTHETIC: 'VERIFIED_SYNTHETIC',
    SIMULATED: 'SIMULATED',
    PENDING: 'PENDING',
  };

  const CPX_MAINNET_MINT_ADDRESS = '9s3CcNwhvPKWi1i5hJSQgRLDrmjQXAkQgRsrDkgiEb6X';
  const MESHSENDER_PROGRAM_ID = 'GSRFUJcMMZdSgqueeGd9mWhUfrSF33QHVELNNWbvpKNg';
  const CPX_RAW_SCALE = 1000000n;

  function b64encode(bytes) {
    let s = '';
    bytes.forEach((b) => (s += String.fromCharCode(b)));
    return btoa(s);
  }
  function b64decode(str) {
    const bin = atob(str);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  async function sha256Hex(text) {
    const data = new TextEncoder().encode(text);
    const dig = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(dig)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  function parseDecimalToRational(decimal) {
    const trimmed = String(decimal).trim();
    if (!/^\d+(\.\d+)?$/.test(trimmed)) throw new Error('INVALID_DECIMAL');
    const [whole, frac = ''] = trimmed.split('.');
    const denominator = frac.length === 0 ? 1n : 10n ** BigInt(frac.length);
    const numerator = BigInt(whole) * denominator + BigInt(frac || '0');
    return { numerator, denominator };
  }
  function rationalCpxToRawDg2(r) {
    const scaled = r.numerator * CPX_RAW_SCALE;
    const q = scaled / r.denominator;
    const rem = scaled % r.denominator;
    if (rem === 0n) return q;
    return rem * 2n >= r.denominator ? q + 1n : q;
  }
  function offlineBurnRaw(price) {
    const burnEur = parseDecimalToRational('0.0005');
    const p = parseDecimalToRational(price);
    const cpx = {
      numerator: burnEur.numerator * p.denominator,
      denominator: burnEur.denominator * p.numerator,
    };
    return rationalCpxToRawDg2(cpx);
  }
  function nominalRelayRaw(price) {
    const eur = parseDecimalToRational('0.005');
    const p = parseDecimalToRational(price);
    let uncapped = {
      numerator: eur.numerator * p.denominator,
      denominator: eur.denominator * p.numerator,
    };
    if (uncapped.numerator > uncapped.denominator) {
      uncapped = { numerator: 1n, denominator: 1n };
    }
    return rationalCpxToRawDg2(uncapped);
  }
  function marketBurnRaw(principalRaw) {
    const rem = (principalRaw * 1n) % 1000n;
    if (rem !== 0n) throw new Error('MARKET_BURN_INEXACT');
    return principalRaw / 1000n;
  }
  function rawToCpx(raw) {
    const whole = raw / CPX_RAW_SCALE;
    const frac = raw % CPX_RAW_SCALE;
    return `${whole}.${frac.toString().padStart(6, '0')}`;
  }

  function runOfflineSim(input) {
    const edgeSet = new Set(
      input.edges.map((e) => (e.a < e.b ? `${e.a}|${e.b}` : `${e.b}|${e.a}`))
    );
    let carriers = new Set([input.packet.from]);
    const seen = new Map(input.nodes.map((n) => [n, new Set()]));
    seen.get(input.packet.from).add(input.packet.packetId);
    let hops = 0;
    let delivered = false;
    let deliveryAtMs = null;
    let duplicates = 0;
    const expiresAtMs = input.packet.createdAtMs + input.packet.ttlMs;
    for (const step of input.mobility) {
      if (delivered) break;
      if (step.atMs >= expiresAtMs) break;
      const meeting = step.meeting.filter((n) => input.nodes.includes(n));
      const carriersHere = meeting.filter((n) => carriers.has(n));
      if (!carriersHere.length) continue;
      for (const peer of meeting) {
        if (carriers.has(peer)) continue;
        if (seen.get(peer).has(input.packet.packetId)) {
          duplicates++;
          continue;
        }
        seen.get(peer).add(input.packet.packetId);
        carriers.add(peer);
        hops++;
        if (peer === input.packet.to) {
          delivered = true;
          deliveryAtMs = step.atMs;
          break;
        }
      }
    }
    return {
      readiness: Readiness.SIMULATED,
      delivered,
      deliveryAtMs,
      hops: delivered ? hops : null,
      duplicates,
      edgeCount: edgeSet.size,
    };
  }

  function createProof(claims, secretKey, publicKeyB64) {
    const nacl = global.nacl;
    const msg = [
      'meshsender.sdk.demo.delivery-proof.v1',
      claims.messageId,
      claims.fromNodeId,
      claims.toNodeId,
      String(claims.deliveredAtMs),
      String(claims.hops),
      claims.ingressTransport,
      claims.payloadDigestHex,
    ].join('|');
    const sig = nacl.sign.detached(nacl.util.decodeUTF8(msg), secretKey);
    return {
      ...claims,
      protocol: 'meshsender.sdk.demo.delivery-proof.v1',
      signerPublicKeyB64: publicKeyB64,
      signatureB64: b64encode(sig),
      readiness: Readiness.VERIFIED_SYNTHETIC,
      disclosure: 'ILLUSTRATIVE_SDK_DEMO_PROTOCOL',
    };
  }
  function verifyProof(proof) {
    const nacl = global.nacl;
    const msg = [
      proof.protocol,
      proof.messageId,
      proof.fromNodeId,
      proof.toNodeId,
      String(proof.deliveredAtMs),
      String(proof.hops),
      proof.ingressTransport,
      proof.payloadDigestHex,
    ].join('|');
    try {
      return nacl.sign.detached.verify(
        nacl.util.decodeUTF8(msg),
        b64decode(proof.signatureB64),
        b64decode(proof.signerPublicKeyB64)
      );
    } catch {
      return false;
    }
  }

  async function liveSolana() {
    const rpc = 'https://api.mainnet-beta.solana.com';
    async function rpcCall(method, params) {
      const res = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error.message || 'RPC_ERROR');
      return json.result;
    }
    const supply = await rpcCall('getTokenSupply', [CPX_MAINNET_MINT_ADDRESS]);
    const program = await rpcCall('getAccountInfo', [
      MESHSENDER_PROGRAM_ID,
      { encoding: 'base64' },
    ]);
    return {
      readiness: Readiness.LIVE_READ_ONLY,
      mint: CPX_MAINNET_MINT_ADDRESS,
      decimals: supply.value.decimals,
      supplyUi: supply.value.uiAmountString,
      programExecutable: !!(program && program.value && program.value.executable),
      writesEnabled: false,
    };
  }

  global.MeshSenderSDKBrowser = {
    Readiness,
    CPX_MAINNET_MINT_ADDRESS,
    MESHSENDER_PROGRAM_ID,
    runOfflineSim,
    createProof,
    verifyProof,
    offlineBurnRaw,
    nominalRelayRaw,
    marketBurnRaw,
    rawToCpx,
    sha256Hex,
    liveSolana,
    b64encode,
  };
})(window);
