/**
 * Browser-safe Solana JSON-RPC helpers (no @solana/web3.js).
 * LIVE_READ_ONLY only. Bounded timeouts + HTTP/JSON-RPC validation + mint fallback.
 */

import { Readiness } from '../readiness.js';
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

export type RpcFailureKind =
  | 'HTTP_FORBIDDEN'
  | 'HTTP_RATE_LIMITED'
  | 'HTTP_ERROR'
  | 'NETWORK_FAILURE'
  | 'TIMEOUT'
  | 'MALFORMED_RESPONSE'
  | 'JSON_RPC_ERROR'
  | 'ACCOUNT_NOT_FOUND';

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

/** Public Phantom token explore link (read-only browse; no signing). */
export function publicPhantomTokenUrl(
  mintAddress: string = CPX_MAINNET_MINT_ADDRESS
): string {
  return `https://phantom.app/tokens/solana/${mintAddress}`;
}

export const PUBLIC_EXPLORER_LINKS = {
  cpxMintSolscan: publicSolscanTokenUrl(CPX_MAINNET_MINT_ADDRESS),
  cpxMintPhantom: publicPhantomTokenUrl(CPX_MAINNET_MINT_ADDRESS),
  programSolscan: publicSolscanAccountUrl(MESHSENDER_PROGRAM_ID),
} as const;

function classifyHttpStatus(status: number): RpcFailureKind {
  if (status === 403) return 'HTTP_FORBIDDEN';
  if (status === 429) return 'HTTP_RATE_LIMITED';
  return 'HTTP_ERROR';
}

async function rpc(
  rpcUrl: string,
  method: string,
  params: unknown[],
  timeoutMs: number = PUBLIC_RPC_TIMEOUT_MS
): Promise<RpcCallResult> {
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
      return {
        ok: false,
        kind: classifyHttpStatus(res.status),
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

export type MintInspectionBrowser =
  | Readonly<{
      readiness: typeof PUBLIC_RPC_READINESS;
      status: 'MINT_VERIFIED';
      mintAddress: typeof CPX_MAINNET_MINT_ADDRESS;
      rpcUrl: string;
      usedFallback: boolean;
      primaryError?: { kind: RpcFailureKind; error: string; rpcUrl: string };
      slot: number | null;
      accountOwner: string;
      parsedType: string;
      decimals: number;
      supplyRaw: string;
      supplyUi: string;
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
      explorer: PUBLIC_EXPLORER_LINKS,
    };
  }
  const value = (
    acc.result as {
      value?: {
        owner?: string;
        data?: { parsed?: { type?: string; info?: Record<string, unknown> } };
      } | null;
    } | null
  )?.value;
  if (!value) {
    return {
      readiness: PUBLIC_RPC_READINESS,
      status: 'RPC_ERROR',
      mintAddress: CPX_MAINNET_MINT_ADDRESS,
      error: 'MINT_ACCOUNT_NOT_FOUND',
      failureKind: 'ACCOUNT_NOT_FOUND',
      rpcUrl,
      usedFallback: false,
      explorer: PUBLIC_EXPLORER_LINKS,
    };
  }
  const owner = value.owner ?? '';
  const parsedType = value.data?.parsed?.type ?? 'unknown';
  const info = value.data?.parsed?.info ?? {};
  if (owner !== SPL_TOKEN_PROGRAM_ID || parsedType !== 'mint') {
    return {
      readiness: PUBLIC_RPC_READINESS,
      status: 'RPC_ERROR',
      mintAddress: CPX_MAINNET_MINT_ADDRESS,
      error: `UNEXPECTED_MINT:${owner}:${parsedType}`,
      failureKind: 'MALFORMED_RESPONSE',
      rpcUrl,
      usedFallback: false,
      explorer: PUBLIC_EXPLORER_LINKS,
    };
  }
  // Prefer getTokenSupply; if RPC forbids indexed methods (common on free publicnode),
  // fall back to decimals/supply already present in jsonParsed mint info.
  const supply = await rpc(rpcUrl, 'getTokenSupply', [CPX_MAINNET_MINT_ADDRESS]);
  let decimals: number | null = null;
  let supplyRaw: string | null = null;
  let supplyUi = '';
  if (supply.ok) {
    const s = (
      supply.result as { value: { amount: string; decimals: number; uiAmountString?: string } }
    ).value;
    if (!s || typeof s.decimals !== 'number' || typeof s.amount !== 'string') {
      return {
        readiness: PUBLIC_RPC_READINESS,
        status: 'RPC_ERROR',
        mintAddress: CPX_MAINNET_MINT_ADDRESS,
        error: 'MALFORMED_TOKEN_SUPPLY',
        failureKind: 'MALFORMED_RESPONSE',
        rpcUrl,
        usedFallback: false,
        explorer: PUBLIC_EXPLORER_LINKS,
      };
    }
    decimals = s.decimals;
    supplyRaw = s.amount;
    supplyUi = s.uiAmountString ?? '';
  } else if (
    supply.kind === 'HTTP_FORBIDDEN' ||
    supply.kind === 'HTTP_RATE_LIMITED' ||
    supply.kind === 'JSON_RPC_ERROR'
  ) {
    const parsedDecimals = info.decimals;
    const parsedSupply = info.supply;
    if (typeof parsedDecimals === 'number' && typeof parsedSupply === 'string') {
      decimals = parsedDecimals;
      supplyRaw = parsedSupply;
      supplyUi = '';
    } else {
      return {
        readiness: PUBLIC_RPC_READINESS,
        status: 'RPC_ERROR',
        mintAddress: CPX_MAINNET_MINT_ADDRESS,
        error: supply.error,
        failureKind: supply.kind,
        rpcUrl,
        usedFallback: false,
        explorer: PUBLIC_EXPLORER_LINKS,
      };
    }
  } else {
    return {
      readiness: PUBLIC_RPC_READINESS,
      status: 'RPC_ERROR',
      mintAddress: CPX_MAINNET_MINT_ADDRESS,
      error: supply.error,
      failureKind: supply.kind,
      rpcUrl,
      usedFallback: false,
      explorer: PUBLIC_EXPLORER_LINKS,
    };
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
      explorer: PUBLIC_EXPLORER_LINKS,
    };
  }
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
    slot: slot.ok ? (slot.result as number) : null,
    accountOwner: owner,
    parsedType,
    decimals,
    supplyRaw,
    supplyUi,
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
 * CPX mint inspection with secondary RPC fallback when primary fails.
 * Explicit rpcUrl disables automatic fallback.
 */
export async function fetchInspectCpxMint(
  rpcUrl?: string,
  options?: { fallbackRpcUrl?: string; enableFallback?: boolean }
): Promise<MintInspectionBrowser> {
  const primaryUrl = rpcUrl ?? DEFAULT_MAINNET_RPC;
  const enableFallback = options?.enableFallback ?? rpcUrl === undefined;
  const fallbackUrl = options?.fallbackRpcUrl ?? SECONDARY_MAINNET_RPC;
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
  const value = (acc.result as { value?: { executable?: boolean; owner?: string } | null })
    ?.value;
  if (!value) {
    return {
      readiness: PUBLIC_RPC_READINESS,
      status: 'PROGRAM_NOT_FOUND',
      programId: MESHSENDER_PROGRAM_ID,
      rpcUrl,
      slot: slot.ok ? (slot.result as number) : null,
      executable: null,
      ownerProgram: null,
      failureKind: 'ACCOUNT_NOT_FOUND',
      explorer: PUBLIC_EXPLORER_LINKS,
    };
  }
  return {
    readiness: PUBLIC_RPC_READINESS,
    status: value.executable ? 'PROGRAM_EXECUTABLE' : 'PROGRAM_NOT_EXECUTABLE',
    programId: MESHSENDER_PROGRAM_ID,
    rpcUrl,
    slot: slot.ok ? (slot.result as number) : null,
    executable: !!value.executable,
    ownerProgram: value.owner ?? null,
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
 */
export async function fetchHistoricalRpcSnapshot(): Promise<{
  readiness: typeof PUBLIC_RPC_READINESS;
  presentation: 'HISTORICAL_SNAPSHOT_NOT_LIVE';
  capturedAtIso: string;
  mint: MintInspectionBrowser;
  programDualRpc: Awaited<ReturnType<typeof fetchInspectProgramDualRpc>>;
  writesEnabled: false;
  explorer: typeof PUBLIC_EXPLORER_LINKS;
}> {
  const capturedAtIso = new Date().toISOString();
  const mint = await fetchInspectCpxMint();
  const programDualRpc = await fetchInspectProgramDualRpc();
  return {
    readiness: PUBLIC_RPC_READINESS,
    presentation: 'HISTORICAL_SNAPSHOT_NOT_LIVE',
    capturedAtIso,
    mint,
    programDualRpc,
    writesEnabled: false,
    explorer: PUBLIC_EXPLORER_LINKS,
  };
}
