/**
 * Browser-safe Solana JSON-RPC helpers (no @solana/web3.js).
 * LIVE_READ_ONLY only. Bounded timeouts + HTTP/JSON-RPC validation + mint fallback.
 */

import { Readiness } from '../readiness.js';
import { rawToCpxDecimal } from '../economy/canonicalQuotes.js';
import {
  CPX_MAINNET_MINT_ADDRESS,
  MESHSENDER_PROGRAM_ID,
  CPX_DECIMALS_EXPECTED,
  SPL_TOKEN_PROGRAM_ID,
  DEFAULT_MAINNET_RPC,
  SECONDARY_MAINNET_RPC,
} from './publicIdentifiers.js';

export const PUBLIC_RPC_READINESS = Readiness.LIVE_READ_ONLY;
export const PUBLIC_RPC_TIMEOUT_MS = 12_000 as const;
/** Prefer known-working publicnode for browser mint reads. */
export const BROWSER_PREFERRED_MINT_RPC = SECONDARY_MAINNET_RPC;
export const BROWSER_FALLBACK_MINT_RPC = DEFAULT_MAINNET_RPC;
export const RPC_ENDPOINT_COOLDOWN_MS = 60_000 as const;

export type RpcFailureKind =
  | 'HTTP_FORBIDDEN'
  | 'HTTP_RATE_LIMITED'
  | 'HTTP_ERROR'
  | 'NETWORK_FAILURE'
  | 'TIMEOUT'
  | 'MALFORMED_RESPONSE'
  | 'JSON_RPC_ERROR'
  | 'ACCOUNT_NOT_FOUND'
  | 'ENDPOINT_COOLDOWN';

export type RpcCallResult =
  | { ok: true; result: unknown }
  | {
      ok: false;
      kind: RpcFailureKind;
      error: string;
      httpStatus: number | null;
    };

export function publicSolscanTokenUrl(
  mintAddress: string = CPX_MAINNET_MINT_ADDRESS
): string {
  return `https://solscan.io/token/${mintAddress}`;
}

export function publicSolscanAccountUrl(address: string): string {
  return `https://solscan.io/account/${address}`;
}

/** Public Phantom.com token link (read-only browse; no signing). */
export function publicPhantomTokenUrl(
  mintAddress: string = CPX_MAINNET_MINT_ADDRESS
): string {
  return `https://phantom.com/tokens/solana/${mintAddress}`;
}

export const PUBLIC_EXPLORER_LINKS = {
  cpxMintSolscan: publicSolscanTokenUrl(CPX_MAINNET_MINT_ADDRESS),
  cpxMintPhantom: publicPhantomTokenUrl(CPX_MAINNET_MINT_ADDRESS),
  programSolscan: publicSolscanAccountUrl(MESHSENDER_PROGRAM_ID),
} as const;

/** Per-session cooldown for forbidden / rate-limited endpoints. */
const rpcCooldownUntilMs = new Map<string, number>();

export function resetRpcEndpointCooldownsForTests(): void {
  rpcCooldownUntilMs.clear();
}

function noteEndpointCooldown(rpcUrl: string, kind: RpcFailureKind): void {
  if (kind === 'HTTP_FORBIDDEN' || kind === 'HTTP_RATE_LIMITED') {
    rpcCooldownUntilMs.set(rpcUrl, Date.now() + RPC_ENDPOINT_COOLDOWN_MS);
  }
}

function endpointCooldownRemainingMs(rpcUrl: string): number {
  const until = rpcCooldownUntilMs.get(rpcUrl) ?? 0;
  return Math.max(0, until - Date.now());
}

function classifyHttpStatus(status: number): RpcFailureKind {
  if (status === 403) return 'HTTP_FORBIDDEN';
  if (status === 429) return 'HTTP_RATE_LIMITED';
  return 'HTTP_ERROR';
}

/** Exact six-decimal UI from raw integer string (never blank when raw valid). */
export function formatCpxSupplyUiFromRaw(supplyRaw: string): string {
  return rawToCpxDecimal(BigInt(supplyRaw));
}

async function rpc(
  rpcUrl: string,
  method: string,
  params: unknown[],
  timeoutMs: number = PUBLIC_RPC_TIMEOUT_MS
): Promise<RpcCallResult> {
  const coolMs = endpointCooldownRemainingMs(rpcUrl);
  if (coolMs > 0) {
    return {
      ok: false,
      kind: 'ENDPOINT_COOLDOWN',
      error: `ENDPOINT_COOLDOWN_${coolMs}MS`,
      httpStatus: null,
    };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      signal: controller.signal,
    });
    if (!res.ok) {
      let bodyHint = '';
      try {
        bodyHint = (await res.text()).slice(0, 180);
      } catch {
        bodyHint = '';
      }
      const kind = classifyHttpStatus(res.status);
      noteEndpointCooldown(rpcUrl, kind);
      return {
        ok: false,
        kind,
        error: `HTTP_${res.status}${bodyHint ? `:${bodyHint}` : ''}`,
        httpStatus: res.status,
      };
    }
    let json: unknown;
    try {
      json = await res.json();
    } catch {
      return {
        ok: false,
        kind: 'MALFORMED_RESPONSE',
        error: 'RESPONSE_NOT_JSON',
        httpStatus: res.status,
      };
    }
    if (
      !json ||
      typeof json !== 'object' ||
      !('jsonrpc' in json) ||
      (json as { jsonrpc?: unknown }).jsonrpc !== '2.0'
    ) {
      return {
        ok: false,
        kind: 'MALFORMED_RESPONSE',
        error: 'INVALID_JSONRPC_ENVELOPE',
        httpStatus: res.status,
      };
    }
    const envelope = json as { result?: unknown; error?: { message?: string; code?: number } };
    if (envelope.error) {
      return {
        ok: false,
        kind: 'JSON_RPC_ERROR',
        error: envelope.error.message || `JSON_RPC_${envelope.error.code ?? 'ERROR'}`,
        httpStatus: res.status,
      };
    }
    if (!('result' in envelope)) {
      return {
        ok: false,
        kind: 'MALFORMED_RESPONSE',
        error: 'MISSING_RESULT_FIELD',
        httpStatus: res.status,
      };
    }
    return { ok: true, result: envelope.result };
  } catch (e) {
    const name = e instanceof Error ? e.name : '';
    const message = e instanceof Error ? e.message : String(e);
    if (name === 'AbortError' || /aborted/i.test(message)) {
      return { ok: false, kind: 'TIMEOUT', error: `RPC_TIMEOUT_${timeoutMs}MS`, httpStatus: null };
    }
    return { ok: false, kind: 'NETWORK_FAILURE', error: message, httpStatus: null };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Only explicit `value === null` is account-not-found.
 * Missing/wrong shape → malformed RPC_ERROR path.
 */
function readAccountValue(
  result: unknown
):
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; kind: 'ACCOUNT_NOT_FOUND' | 'MALFORMED_RESPONSE'; error: string } {
  if (result === null || typeof result !== 'object' || Array.isArray(result)) {
    return { ok: false, kind: 'MALFORMED_RESPONSE', error: 'ACCOUNT_RESULT_NOT_OBJECT' };
  }
  if (!('value' in result)) {
    return { ok: false, kind: 'MALFORMED_RESPONSE', error: 'ACCOUNT_VALUE_FIELD_MISSING' };
  }
  const value = (result as { value: unknown }).value;
  if (value === null) {
    return { ok: false, kind: 'ACCOUNT_NOT_FOUND', error: 'ACCOUNT_VALUE_NULL' };
  }
  if (typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, kind: 'MALFORMED_RESPONSE', error: 'ACCOUNT_VALUE_NOT_OBJECT' };
  }
  return { ok: true, value: value as Record<string, unknown> };
}

export type MintInspectionBrowser =
  | Readonly<{
      readiness: typeof PUBLIC_RPC_READINESS;
      status: 'MINT_VERIFIED';
      mintAddress: typeof CPX_MAINNET_MINT_ADDRESS;
      rpcUrl: string;
      usedFallback: boolean;
      primaryError?: { kind: RpcFailureKind; error: string; rpcUrl: string };
      slot: number | null;
      inspectedAtIso: string;
      accountOwner: string;
      parsedType: string;
      decimals: number;
      supplyRaw: string;
      supplyUi: string;
      supplySource: 'jsonParsed_mint' | 'getTokenSupply';
      mintAuthority: string | null;
      freezeAuthority: string | null;
      mintAuthorityFieldPresent: boolean;
      freezeAuthorityFieldPresent: boolean;
      mintAuthorityRevoked: boolean | null;
      freezeAuthorityRevoked: boolean | null;
      explorer: typeof PUBLIC_EXPLORER_LINKS;
    }>
  | Readonly<{
      readiness: typeof PUBLIC_RPC_READINESS;
      status: 'RPC_ERROR';
      mintAddress: typeof CPX_MAINNET_MINT_ADDRESS;
      error: string;
      failureKind: RpcFailureKind;
      rpcUrl: string;
      usedFallback: boolean;
      inspectedAtIso: string;
      primary?: {
        rpcUrl: string;
        failureKind: RpcFailureKind;
        error: string;
      };
      secondary?: {
        rpcUrl: string;
        failureKind: RpcFailureKind;
        error: string;
      };
      explorer: typeof PUBLIC_EXPLORER_LINKS;
    }>;

async function inspectCpxMintOnRpc(rpcUrl: string): Promise<MintInspectionBrowser> {
  const inspectedAtIso = new Date().toISOString();
  const slot = await rpc(rpcUrl, 'getSlot', []);
  const acc = await rpc(rpcUrl, 'getAccountInfo', [
    CPX_MAINNET_MINT_ADDRESS,
    { encoding: 'jsonParsed' },
  ]);
  if (!acc.ok) {
    return {
      readiness: PUBLIC_RPC_READINESS,
      status: 'RPC_ERROR',
      mintAddress: CPX_MAINNET_MINT_ADDRESS,
      error: acc.error,
      failureKind: acc.kind,
      rpcUrl,
      usedFallback: false,
      inspectedAtIso,
      explorer: PUBLIC_EXPLORER_LINKS,
    };
  }
  const parsedAcc = readAccountValue(acc.result);
  if (!parsedAcc.ok) {
    return {
      readiness: PUBLIC_RPC_READINESS,
      status: 'RPC_ERROR',
      mintAddress: CPX_MAINNET_MINT_ADDRESS,
      error:
        parsedAcc.kind === 'ACCOUNT_NOT_FOUND' ? 'MINT_ACCOUNT_NOT_FOUND' : parsedAcc.error,
      failureKind: parsedAcc.kind,
      rpcUrl,
      usedFallback: false,
      inspectedAtIso,
      explorer: PUBLIC_EXPLORER_LINKS,
    };
  }
  const value = parsedAcc.value;
  const owner = typeof value.owner === 'string' ? value.owner : '';
  const data = value.data;
  const parsed =
    data && typeof data === 'object' && !Array.isArray(data)
      ? (data as { parsed?: { type?: unknown; info?: Record<string, unknown> } }).parsed
      : undefined;
  const parsedType = typeof parsed?.type === 'string' ? parsed.type : 'unknown';
  const info =
    parsed?.info && typeof parsed.info === 'object' && !Array.isArray(parsed.info)
      ? parsed.info
      : {};
  if (owner !== SPL_TOKEN_PROGRAM_ID || parsedType !== 'mint') {
    return {
      readiness: PUBLIC_RPC_READINESS,
      status: 'RPC_ERROR',
      mintAddress: CPX_MAINNET_MINT_ADDRESS,
      error: `UNEXPECTED_MINT:${owner}:${parsedType}`,
      failureKind: 'MALFORMED_RESPONSE',
      rpcUrl,
      usedFallback: false,
      inspectedAtIso,
      explorer: PUBLIC_EXPLORER_LINKS,
    };
  }

  let decimals: number | null = null;
  let supplyRaw: string | null = null;
  let supplySource: 'jsonParsed_mint' | 'getTokenSupply' = 'jsonParsed_mint';

  // Prefer validated jsonParsed mint supply/decimals directly when available.
  if (typeof info.decimals === 'number' && typeof info.supply === 'string') {
    try {
      BigInt(info.supply);
      decimals = info.decimals;
      supplyRaw = info.supply;
      supplySource = 'jsonParsed_mint';
    } catch {
      decimals = null;
      supplyRaw = null;
    }
  }

  if (decimals == null || supplyRaw == null) {
    const supply = await rpc(rpcUrl, 'getTokenSupply', [CPX_MAINNET_MINT_ADDRESS]);
    if (!supply.ok) {
      return {
        readiness: PUBLIC_RPC_READINESS,
        status: 'RPC_ERROR',
        mintAddress: CPX_MAINNET_MINT_ADDRESS,
        error: supply.error,
        failureKind: supply.kind,
        rpcUrl,
        usedFallback: false,
        inspectedAtIso,
        explorer: PUBLIC_EXPLORER_LINKS,
      };
    }
    const s = (
      supply.result as { value?: { amount?: unknown; decimals?: unknown; uiAmountString?: unknown } }
    )?.value;
    if (
      !s ||
      typeof s.decimals !== 'number' ||
      typeof s.amount !== 'string'
    ) {
      return {
        readiness: PUBLIC_RPC_READINESS,
        status: 'RPC_ERROR',
        mintAddress: CPX_MAINNET_MINT_ADDRESS,
        error: 'MALFORMED_TOKEN_SUPPLY',
        failureKind: 'MALFORMED_RESPONSE',
        rpcUrl,
        usedFallback: false,
        inspectedAtIso,
        explorer: PUBLIC_EXPLORER_LINKS,
      };
    }
    try {
      BigInt(s.amount);
    } catch {
      return {
        readiness: PUBLIC_RPC_READINESS,
        status: 'RPC_ERROR',
        mintAddress: CPX_MAINNET_MINT_ADDRESS,
        error: 'MALFORMED_TOKEN_SUPPLY_RAW',
        failureKind: 'MALFORMED_RESPONSE',
        rpcUrl,
        usedFallback: false,
        inspectedAtIso,
        explorer: PUBLIC_EXPLORER_LINKS,
      };
    }
    decimals = s.decimals;
    supplyRaw = s.amount;
    supplySource = 'getTokenSupply';
  }

  if (decimals !== CPX_DECIMALS_EXPECTED || supplyRaw == null) {
    return {
      readiness: PUBLIC_RPC_READINESS,
      status: 'RPC_ERROR',
      mintAddress: CPX_MAINNET_MINT_ADDRESS,
      error: `UNEXPECTED_DECIMALS:${decimals}`,
      failureKind: 'MALFORMED_RESPONSE',
      rpcUrl,
      usedFallback: false,
      inspectedAtIso,
      explorer: PUBLIC_EXPLORER_LINKS,
    };
  }

  const supplyUi = formatCpxSupplyUiFromRaw(supplyRaw);
  const mintAuthorityFieldPresent = Object.prototype.hasOwnProperty.call(info, 'mintAuthority');
  const freezeAuthorityFieldPresent = Object.prototype.hasOwnProperty.call(
    info,
    'freezeAuthority'
  );
  const mintAuthority =
    !mintAuthorityFieldPresent
      ? null
      : info.mintAuthority == null
        ? null
        : String(info.mintAuthority);
  const freezeAuthority =
    !freezeAuthorityFieldPresent
      ? null
      : info.freezeAuthority == null
        ? null
        : String(info.freezeAuthority);
  return {
    readiness: PUBLIC_RPC_READINESS,
    status: 'MINT_VERIFIED',
    mintAddress: CPX_MAINNET_MINT_ADDRESS,
    rpcUrl,
    usedFallback: false,
    slot: slot.ok && typeof slot.result === 'number' ? slot.result : null,
    inspectedAtIso,
    accountOwner: owner,
    parsedType,
    decimals,
    supplyRaw,
    supplyUi,
    supplySource,
    mintAuthority,
    freezeAuthority,
    mintAuthorityFieldPresent,
    freezeAuthorityFieldPresent,
    mintAuthorityRevoked: mintAuthorityFieldPresent ? info.mintAuthority === null : null,
    freezeAuthorityRevoked: freezeAuthorityFieldPresent ? info.freezeAuthority === null : null,
    explorer: PUBLIC_EXPLORER_LINKS,
  };
}

/**
 * CPX mint inspection. Browser default: publicnode first, then mainnet-beta.
 * Respects per-session cooldown for forbidden/rate-limited endpoints.
 */
export async function fetchInspectCpxMint(
  rpcUrl?: string,
  options?: {
    fallbackRpcUrl?: string;
    enableFallback?: boolean;
    preferBrowserOrder?: boolean;
  }
): Promise<MintInspectionBrowser> {
  const preferBrowser = options?.preferBrowserOrder ?? rpcUrl === undefined;
  const primaryUrl =
    rpcUrl ??
    (preferBrowser ? BROWSER_PREFERRED_MINT_RPC : DEFAULT_MAINNET_RPC);
  const enableFallback = options?.enableFallback ?? rpcUrl === undefined;
  const fallbackUrl =
    options?.fallbackRpcUrl ??
    (preferBrowser ? BROWSER_FALLBACK_MINT_RPC : SECONDARY_MAINNET_RPC);

  const primary = await inspectCpxMintOnRpc(primaryUrl);
  if (primary.status === 'MINT_VERIFIED') {
    return { ...primary, usedFallback: false };
  }
  if (!enableFallback || fallbackUrl === primaryUrl) {
    return primary;
  }
  const secondary = await inspectCpxMintOnRpc(fallbackUrl);
  if (secondary.status === 'MINT_VERIFIED') {
    return {
      ...secondary,
      usedFallback: true,
      primaryError: {
        kind: primary.failureKind,
        error: primary.error,
        rpcUrl: primary.rpcUrl,
      },
    };
  }
  return {
    readiness: PUBLIC_RPC_READINESS,
    status: 'RPC_ERROR',
    mintAddress: CPX_MAINNET_MINT_ADDRESS,
    error: `BOTH_RPC_FAILED:primary=${primary.failureKind}:${primary.error};secondary=${secondary.failureKind}:${secondary.error}`,
    failureKind: secondary.failureKind,
    rpcUrl: fallbackUrl,
    usedFallback: true,
    inspectedAtIso: new Date().toISOString(),
    primary: {
      rpcUrl: primary.rpcUrl,
      failureKind: primary.failureKind,
      error: primary.error,
    },
    secondary: {
      rpcUrl: secondary.rpcUrl,
      failureKind: secondary.failureKind,
      error: secondary.error,
    },
    explorer: PUBLIC_EXPLORER_LINKS,
  };
}

export async function fetchInspectProgram(
  rpcUrl: string = DEFAULT_MAINNET_RPC
): Promise<{
  readiness: typeof PUBLIC_RPC_READINESS;
  status: 'PROGRAM_EXECUTABLE' | 'PROGRAM_NOT_FOUND' | 'PROGRAM_NOT_EXECUTABLE' | 'RPC_ERROR';
  programId: typeof MESHSENDER_PROGRAM_ID;
  rpcUrl: string;
  slot: number | null;
  executable: boolean | null;
  ownerProgram: string | null;
  failureKind?: RpcFailureKind;
  error?: string;
  explorer: typeof PUBLIC_EXPLORER_LINKS;
}> {
  const slot = await rpc(rpcUrl, 'getSlot', []);
  const acc = await rpc(rpcUrl, 'getAccountInfo', [MESHSENDER_PROGRAM_ID, { encoding: 'base64' }]);
  if (!acc.ok) {
    return {
      readiness: PUBLIC_RPC_READINESS,
      status: 'RPC_ERROR',
      programId: MESHSENDER_PROGRAM_ID,
      rpcUrl,
      slot: null,
      executable: null,
      ownerProgram: null,
      failureKind: acc.kind,
      error: acc.error,
      explorer: PUBLIC_EXPLORER_LINKS,
    };
  }
  const parsed = readAccountValue(acc.result);
  if (!parsed.ok) {
    if (parsed.kind === 'ACCOUNT_NOT_FOUND') {
      return {
        readiness: PUBLIC_RPC_READINESS,
        status: 'PROGRAM_NOT_FOUND',
        programId: MESHSENDER_PROGRAM_ID,
        rpcUrl,
        slot: slot.ok && typeof slot.result === 'number' ? slot.result : null,
        executable: null,
        ownerProgram: null,
        failureKind: 'ACCOUNT_NOT_FOUND',
        explorer: PUBLIC_EXPLORER_LINKS,
      };
    }
    return {
      readiness: PUBLIC_RPC_READINESS,
      status: 'RPC_ERROR',
      programId: MESHSENDER_PROGRAM_ID,
      rpcUrl,
      slot: null,
      executable: null,
      ownerProgram: null,
      failureKind: 'MALFORMED_RESPONSE',
      error: parsed.error,
      explorer: PUBLIC_EXPLORER_LINKS,
    };
  }
  const executable = parsed.value.executable === true;
  const ownerProgram =
    typeof parsed.value.owner === 'string' ? parsed.value.owner : null;
  return {
    readiness: PUBLIC_RPC_READINESS,
    status: executable ? 'PROGRAM_EXECUTABLE' : 'PROGRAM_NOT_EXECUTABLE',
    programId: MESHSENDER_PROGRAM_ID,
    rpcUrl,
    slot: slot.ok && typeof slot.result === 'number' ? slot.result : null,
    executable,
    ownerProgram,
    explorer: PUBLIC_EXPLORER_LINKS,
  };
}

export async function fetchInspectProgramDualRpc(
  rpcUrls: readonly string[] = [DEFAULT_MAINNET_RPC, SECONDARY_MAINNET_RPC]
) {
  const results = [];
  for (const url of rpcUrls) results.push(await fetchInspectProgram(url));
  const statuses = new Set(results.map((r) => r.status));
  let agreement:
    | 'ALL_EXECUTABLE'
    | 'ALL_NOT_FOUND'
    | 'ALL_NOT_EXECUTABLE'
    | 'MIXED_OR_ERROR' = 'MIXED_OR_ERROR';
  if (statuses.size === 1 && statuses.has('PROGRAM_EXECUTABLE')) agreement = 'ALL_EXECUTABLE';
  else if (statuses.size === 1 && statuses.has('PROGRAM_NOT_FOUND')) agreement = 'ALL_NOT_FOUND';
  else if (statuses.size === 1 && statuses.has('PROGRAM_NOT_EXECUTABLE'))
    agreement = 'ALL_NOT_EXECUTABLE';
  return {
    readiness: PUBLIC_RPC_READINESS,
    results,
    agreement,
    explorer: PUBLIC_EXPLORER_LINKS,
  };
}

/**
 * Optional timestamped RPC snapshot. Explicitly historical — never presented as live ticker.
 * When existing genuine results are provided, reuses them (no redundant requests).
 */
export async function fetchHistoricalRpcSnapshot(existing?: {
  mint?: MintInspectionBrowser;
  programDualRpc?: Awaited<ReturnType<typeof fetchInspectProgramDualRpc>>;
}): Promise<{
  readiness: typeof PUBLIC_RPC_READINESS;
  presentation: 'HISTORICAL_SNAPSHOT_NOT_LIVE';
  capturedAtIso: string;
  reusedExistingResults: boolean;
  mint: MintInspectionBrowser;
  programDualRpc: Awaited<ReturnType<typeof fetchInspectProgramDualRpc>>;
  writesEnabled: false;
  explorer: typeof PUBLIC_EXPLORER_LINKS;
}> {
  const capturedAtIso = new Date().toISOString();
  if (existing?.mint && existing?.programDualRpc) {
    return {
      readiness: PUBLIC_RPC_READINESS,
      presentation: 'HISTORICAL_SNAPSHOT_NOT_LIVE',
      capturedAtIso,
      reusedExistingResults: true,
      mint: existing.mint,
      programDualRpc: existing.programDualRpc,
      writesEnabled: false,
      explorer: PUBLIC_EXPLORER_LINKS,
    };
  }
  const mint = existing?.mint ?? (await fetchInspectCpxMint());
  const programDualRpc =
    existing?.programDualRpc ?? (await fetchInspectProgramDualRpc());
  return {
    readiness: PUBLIC_RPC_READINESS,
    presentation: 'HISTORICAL_SNAPSHOT_NOT_LIVE',
    capturedAtIso,
    reusedExistingResults: !!(existing?.mint || existing?.programDualRpc),
    mint,
    programDualRpc,
    writesEnabled: false,
    explorer: PUBLIC_EXPLORER_LINKS,
  };
}
