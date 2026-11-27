/**
 * Browser-safe Solana JSON-RPC helpers (no @solana/web3.js).
 * LIVE_READ_ONLY only.
 */

import { Readiness } from '../readiness.js';
import {
  CPX_MAINNET_MINT_ADDRESS,
  MESHSENDER_PROGRAM_ID,
  CPX_DECIMALS_EXPECTED,
  SPL_TOKEN_PROGRAM_ID,
  DEFAULT_MAINNET_RPC,
  SECONDARY_MAINNET_RPC,
} from './mainnetReadOnly.js';

export const PUBLIC_RPC_READINESS = Readiness.LIVE_READ_ONLY;

async function rpc(
  rpcUrl: string,
  method: string,
  params: unknown[]
): Promise<{ ok: true; result: unknown } | { ok: false; error: string }> {
  try {
    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    });
    const json = (await res.json()) as { result?: unknown; error?: { message?: string } };
    if (json.error) return { ok: false, error: json.error.message || 'RPC_ERROR' };
    return { ok: true, result: json.result };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function fetchInspectCpxMint(rpcUrl: string = DEFAULT_MAINNET_RPC) {
  const slot = await rpc(rpcUrl, 'getSlot', []);
  const acc = await rpc(rpcUrl, 'getAccountInfo', [
    CPX_MAINNET_MINT_ADDRESS,
    { encoding: 'jsonParsed' },
  ]);
  if (!acc.ok) {
    return {
      readiness: PUBLIC_RPC_READINESS,
      status: 'RPC_ERROR' as const,
      error: acc.error,
      rpcUrl,
    };
  }
  const value = (acc.result as { value?: { owner?: string; data?: { parsed?: { type?: string; info?: Record<string, unknown> } } } } | null)?.value;
  if (!value) {
    return {
      readiness: PUBLIC_RPC_READINESS,
      status: 'RPC_ERROR' as const,
      error: 'MINT_ACCOUNT_NOT_FOUND',
      rpcUrl,
    };
  }
  const owner = value.owner ?? '';
  const parsedType = value.data?.parsed?.type ?? 'unknown';
  const info = value.data?.parsed?.info ?? {};
  if (owner !== SPL_TOKEN_PROGRAM_ID || parsedType !== 'mint') {
    return {
      readiness: PUBLIC_RPC_READINESS,
      status: 'RPC_ERROR' as const,
      error: `UNEXPECTED_MINT:${owner}:${parsedType}`,
      rpcUrl,
    };
  }
  const supply = await rpc(rpcUrl, 'getTokenSupply', [CPX_MAINNET_MINT_ADDRESS]);
  if (!supply.ok) {
    return {
      readiness: PUBLIC_RPC_READINESS,
      status: 'RPC_ERROR' as const,
      error: supply.error,
      rpcUrl,
    };
  }
  const s = (supply.result as { value: { amount: string; decimals: number; uiAmountString?: string } }).value;
  if (s.decimals !== CPX_DECIMALS_EXPECTED) {
    return {
      readiness: PUBLIC_RPC_READINESS,
      status: 'RPC_ERROR' as const,
      error: `UNEXPECTED_DECIMALS:${s.decimals}`,
      rpcUrl,
    };
  }
  const mintAuthorityFieldPresent = Object.prototype.hasOwnProperty.call(info, 'mintAuthority');
  const freezeAuthorityFieldPresent = Object.prototype.hasOwnProperty.call(info, 'freezeAuthority');
  const mintAuthority =
    !mintAuthorityFieldPresent ? null : info.mintAuthority == null ? null : String(info.mintAuthority);
  const freezeAuthority =
    !freezeAuthorityFieldPresent
      ? null
      : info.freezeAuthority == null
        ? null
        : String(info.freezeAuthority);
  return {
    readiness: PUBLIC_RPC_READINESS,
    status: 'MINT_VERIFIED' as const,
    mintAddress: CPX_MAINNET_MINT_ADDRESS,
    rpcUrl,
    slot: slot.ok ? (slot.result as number) : null,
    accountOwner: owner,
    parsedType,
    decimals: s.decimals,
    supplyRaw: s.amount,
    supplyUi: s.uiAmountString ?? '',
    mintAuthority,
    freezeAuthority,
    mintAuthorityFieldPresent,
    freezeAuthorityFieldPresent,
    mintAuthorityRevoked: mintAuthorityFieldPresent ? info.mintAuthority === null : null,
    freezeAuthorityRevoked: freezeAuthorityFieldPresent ? info.freezeAuthority === null : null,
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
  error?: string;
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
      error: acc.error,
    };
  }
  const value = (acc.result as { value?: { executable?: boolean; owner?: string } | null })?.value;
  if (!value) {
    return {
      readiness: PUBLIC_RPC_READINESS,
      status: 'PROGRAM_NOT_FOUND',
      programId: MESHSENDER_PROGRAM_ID,
      rpcUrl,
      slot: slot.ok ? (slot.result as number) : null,
      executable: null,
      ownerProgram: null,
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
  return { readiness: PUBLIC_RPC_READINESS, results, agreement };
}

export {
  CPX_MAINNET_MINT_ADDRESS,
  MESHSENDER_PROGRAM_ID,
  DEFAULT_MAINNET_RPC,
  SECONDARY_MAINNET_RPC,
};
