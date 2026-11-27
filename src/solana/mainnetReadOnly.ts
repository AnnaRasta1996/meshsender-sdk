/**
 * Solana — LIVE_READ_ONLY mainnet inspection.
 * Never signs, spends, deploys, or mutates economic gates.
 * Public mint + program IDs only — no private wallet labels/addresses exported.
 */

import {
  Connection,
  PublicKey,
  clusterApiUrl,
  type ParsedAccountData,
} from '@solana/web3.js';
import { Readiness } from '../readiness.js';

export const SOLANA_READINESS = Readiness.LIVE_READ_ONLY;

/** Canonical Chaos Paradox (CPX) mainnet mint. */
export const CPX_MAINNET_MINT_ADDRESS =
  '9s3CcNwhvPKWi1i5hJSQgRLDrmjQXAkQgRsrDkgiEb6X' as const;

/** Mesh settlement program ID (separate from the CPX SPL mint). */
export const MESHSENDER_PROGRAM_ID =
  'GSRFUJcMMZdSgqueeGd9mWhUfrSF33QHVELNNWbvpKNg' as const;

export const CPX_DECIMALS_EXPECTED = 6 as const;
export const SPL_TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as const;
export const DEFAULT_MAINNET_RPC = clusterApiUrl('mainnet-beta');
export const SECONDARY_MAINNET_RPC = 'https://solana-rpc.publicnode.com';

export type SolanaStatusCode =
  | 'MINT_VERIFIED'
  | 'PROGRAM_EXECUTABLE'
  | 'PROGRAM_NOT_FOUND'
  | 'PROGRAM_NOT_EXECUTABLE'
  | 'RPC_ERROR'
  | 'TX_FOUND'
  | 'TX_NOT_FOUND'
  | 'TX_FAILED_ON_CHAIN'
  | 'WALLET_OK';

export type MintInspection =
  | Readonly<{
      readiness: typeof SOLANA_READINESS;
      status: 'MINT_VERIFIED';
      mintAddress: typeof CPX_MAINNET_MINT_ADDRESS;
      clusterHint: string;
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
      notes: string;
    }>
  | Readonly<{
      readiness: typeof SOLANA_READINESS;
      status: 'RPC_ERROR';
      mintAddress: typeof CPX_MAINNET_MINT_ADDRESS;
      error: string;
      rpcUrl: string;
    }>;

export type ProgramInspection = Readonly<{
  readiness: typeof SOLANA_READINESS;
  status: 'PROGRAM_EXECUTABLE' | 'PROGRAM_NOT_FOUND' | 'PROGRAM_NOT_EXECUTABLE' | 'RPC_ERROR';
  programId: typeof MESHSENDER_PROGRAM_ID;
  rpcUrl: string;
  clusterHint: string;
  slot: number | null;
  executable: boolean | null;
  ownerProgram: string | null;
  dataLength: number | null;
  lamports: number | null;
  error?: string;
}>;

export type CpxTokenAccountBalance = Readonly<{
  tokenAccount: string;
  amountRaw: string;
  decimals: number;
  uiAmountString: string | null;
}>;

export type CpxWalletBalanceInspection =
  | Readonly<{
      readiness: typeof SOLANA_READINESS;
      status: 'WALLET_OK';
      ownerAddress: string;
      mintAddress: typeof CPX_MAINNET_MINT_ADDRESS;
      tokenAccounts: readonly CpxTokenAccountBalance[];
      totalAmountRaw: string;
      totalUiAmountString: string;
    }>
  | Readonly<{
      readiness: typeof SOLANA_READINESS;
      status: 'RPC_ERROR';
      ownerAddress: string;
      error: string;
    }>;

export type BalanceInspection = Readonly<{
  readiness: typeof SOLANA_READINESS;
  address: string;
  lamports: number;
  sol: number;
}>;

export type TransactionInspection = Readonly<{
  readiness: typeof SOLANA_READINESS;
  status: 'TX_FOUND' | 'TX_NOT_FOUND' | 'TX_FAILED_ON_CHAIN' | 'RPC_ERROR';
  signature: string;
  slot: number | null;
  err: unknown;
  fee: number | null;
  note: 'READ_ONLY_INSPECTION_NOT_A_SUCCESS_CLAIM';
  error?: string;
}>;

export type DualRpcProgramCheck = Readonly<{
  readiness: typeof SOLANA_READINESS;
  programId: typeof MESHSENDER_PROGRAM_ID;
  results: readonly ProgramInspection[];
  agreement:
    | 'ALL_EXECUTABLE'
    | 'ALL_NOT_FOUND'
    | 'ALL_NOT_EXECUTABLE'
    | 'MIXED_OR_ERROR';
}>;

export function createMainnetConnection(rpcUrl: string = DEFAULT_MAINNET_RPC): Connection {
  return new Connection(rpcUrl, 'confirmed');
}

function authorityFromParsed(
  info: Record<string, unknown>,
  field: 'mintAuthority' | 'freezeAuthority'
): { value: string | null; fieldPresent: boolean; revoked: boolean | null } {
  if (!(field in info)) {
    // Missing data must NEVER mean revoked.
    return { value: null, fieldPresent: false, revoked: null };
  }
  const raw = info[field];
  if (raw === null) {
    return { value: null, fieldPresent: true, revoked: true };
  }
  if (raw === undefined) {
    return { value: null, fieldPresent: false, revoked: null };
  }
  return { value: String(raw), fieldPresent: true, revoked: false };
}

export async function inspectCpxMint(
  connection: Connection = createMainnetConnection(),
  rpcUrl: string = DEFAULT_MAINNET_RPC
): Promise<MintInspection> {
  try {
    const mint = new PublicKey(CPX_MAINNET_MINT_ADDRESS);
    const slot = await connection.getSlot().catch(() => null);
    const parsed = await connection.getParsedAccountInfo(mint);
    if (!parsed.value) {
      return {
        readiness: SOLANA_READINESS,
        status: 'RPC_ERROR',
        mintAddress: CPX_MAINNET_MINT_ADDRESS,
        error: 'MINT_ACCOUNT_NOT_FOUND',
        rpcUrl,
      };
    }
    const owner = parsed.value.owner.toBase58();
    const data = parsed.value.data as ParsedAccountData;
    const parsedType = String((data as ParsedAccountData)?.parsed?.type ?? 'unknown');
    const info =
      ((data as ParsedAccountData)?.parsed?.info as Record<string, unknown> | undefined) ?? {};
    if (owner !== SPL_TOKEN_PROGRAM_ID) {
      return {
        readiness: SOLANA_READINESS,
        status: 'RPC_ERROR',
        mintAddress: CPX_MAINNET_MINT_ADDRESS,
        error: `UNEXPECTED_MINT_OWNER:${owner}`,
        rpcUrl,
      };
    }
    if (parsedType !== 'mint') {
      return {
        readiness: SOLANA_READINESS,
        status: 'RPC_ERROR',
        mintAddress: CPX_MAINNET_MINT_ADDRESS,
        error: `UNEXPECTED_PARSED_TYPE:${parsedType}`,
        rpcUrl,
      };
    }
    const supply = await connection.getTokenSupply(mint);
    const mintAuth = authorityFromParsed(info, 'mintAuthority');
    const freezeAuth = authorityFromParsed(info, 'freezeAuthority');
    const decimals = supply.value.decimals;
    if (decimals !== CPX_DECIMALS_EXPECTED) {
      return {
        readiness: SOLANA_READINESS,
        status: 'RPC_ERROR',
        mintAddress: CPX_MAINNET_MINT_ADDRESS,
        error: `UNEXPECTED_DECIMALS:${decimals}`,
        rpcUrl,
      };
    }
    return {
      readiness: SOLANA_READINESS,
      status: 'MINT_VERIFIED',
      mintAddress: CPX_MAINNET_MINT_ADDRESS,
      clusterHint: rpcUrl.includes('mainnet') ? 'mainnet-beta' : rpcUrl,
      slot,
      accountOwner: owner,
      parsedType,
      decimals,
      supplyRaw: supply.value.amount,
      supplyUi: supply.value.uiAmountString ?? String(supply.value.uiAmount ?? ''),
      mintAuthority: mintAuth.value,
      freezeAuthority: freezeAuth.value,
      mintAuthorityFieldPresent: mintAuth.fieldPresent,
      freezeAuthorityFieldPresent: freezeAuth.fieldPresent,
      mintAuthorityRevoked: mintAuth.revoked,
      freezeAuthorityRevoked: freezeAuth.revoked,
      notes:
        'CPX is the SPL token mint. Settlement program ID is separate and must not be confused with the mint.',
    };
  } catch (e) {
    return {
      readiness: SOLANA_READINESS,
      status: 'RPC_ERROR',
      mintAddress: CPX_MAINNET_MINT_ADDRESS,
      error: e instanceof Error ? e.message : String(e),
      rpcUrl,
    };
  }
}

export async function inspectMeshProgram(
  connection: Connection = createMainnetConnection(),
  rpcUrl: string = DEFAULT_MAINNET_RPC
): Promise<ProgramInspection> {
  try {
    const programId = new PublicKey(MESHSENDER_PROGRAM_ID);
    const slot = await connection.getSlot().catch(() => null);
    const info = await connection.getAccountInfo(programId);
    if (!info) {
      return {
        readiness: SOLANA_READINESS,
        status: 'PROGRAM_NOT_FOUND',
        programId: MESHSENDER_PROGRAM_ID,
        rpcUrl,
        clusterHint: rpcUrl.includes('mainnet') ? 'mainnet-beta' : rpcUrl,
        slot,
        executable: null,
        ownerProgram: null,
        dataLength: null,
        lamports: null,
      };
    }
    return {
      readiness: SOLANA_READINESS,
      status: info.executable ? 'PROGRAM_EXECUTABLE' : 'PROGRAM_NOT_EXECUTABLE',
      programId: MESHSENDER_PROGRAM_ID,
      rpcUrl,
      clusterHint: rpcUrl.includes('mainnet') ? 'mainnet-beta' : rpcUrl,
      slot,
      executable: info.executable,
      ownerProgram: info.owner.toBase58(),
      dataLength: info.data.length,
      lamports: info.lamports,
    };
  } catch (e) {
    return {
      readiness: SOLANA_READINESS,
      status: 'RPC_ERROR',
      programId: MESHSENDER_PROGRAM_ID,
      rpcUrl,
      clusterHint: rpcUrl,
      slot: null,
      executable: null,
      ownerProgram: null,
      dataLength: null,
      lamports: null,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function inspectMeshProgramDualRpc(
  rpcUrls: readonly string[] = [DEFAULT_MAINNET_RPC, SECONDARY_MAINNET_RPC]
): Promise<DualRpcProgramCheck> {
  const results: ProgramInspection[] = [];
  for (const url of rpcUrls) {
    results.push(await inspectMeshProgram(createMainnetConnection(url), url));
  }
  const statuses = new Set(results.map((r) => r.status));
  let agreement: DualRpcProgramCheck['agreement'] = 'MIXED_OR_ERROR';
  if (statuses.size === 1 && statuses.has('PROGRAM_EXECUTABLE')) agreement = 'ALL_EXECUTABLE';
  else if (statuses.size === 1 && statuses.has('PROGRAM_NOT_FOUND')) agreement = 'ALL_NOT_FOUND';
  else if (statuses.size === 1 && statuses.has('PROGRAM_NOT_EXECUTABLE'))
    agreement = 'ALL_NOT_EXECUTABLE';
  return {
    readiness: SOLANA_READINESS,
    programId: MESHSENDER_PROGRAM_ID,
    results,
    agreement,
  };
}

export async function inspectCpxWalletBalances(
  ownerAddress: string,
  connection: Connection = createMainnetConnection()
): Promise<CpxWalletBalanceInspection> {
  try {
    const owner = new PublicKey(ownerAddress.trim());
    const mint = new PublicKey(CPX_MAINNET_MINT_ADDRESS);
    const resp = await connection.getParsedTokenAccountsByOwner(owner, { mint });
    const tokenAccounts: CpxTokenAccountBalance[] = resp.value.map((v) => {
      const info = (v.account.data as ParsedAccountData).parsed.info as {
        tokenAmount?: { amount?: string; decimals?: number; uiAmountString?: string };
      };
      const ta = info.tokenAmount ?? {};
      return {
        tokenAccount: v.pubkey.toBase58(),
        amountRaw: String(ta.amount ?? '0'),
        decimals: Number(ta.decimals ?? CPX_DECIMALS_EXPECTED),
        uiAmountString: ta.uiAmountString ?? null,
      };
    });
    let total = 0n;
    for (const a of tokenAccounts) total += BigInt(a.amountRaw);
    const whole = total / 1_000_000n;
    const frac = total % 1_000_000n;
    return {
      readiness: SOLANA_READINESS,
      status: 'WALLET_OK',
      ownerAddress: owner.toBase58(),
      mintAddress: CPX_MAINNET_MINT_ADDRESS,
      tokenAccounts,
      totalAmountRaw: total.toString(),
      totalUiAmountString: `${whole}.${frac.toString().padStart(6, '0')}`,
    };
  } catch (e) {
    return {
      readiness: SOLANA_READINESS,
      status: 'RPC_ERROR',
      ownerAddress: ownerAddress.trim(),
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function inspectAddressBalance(
  address: string,
  connection: Connection = createMainnetConnection()
): Promise<BalanceInspection> {
  const pk = new PublicKey(address.trim());
  const lamports = await connection.getBalance(pk);
  return {
    readiness: SOLANA_READINESS,
    address: pk.toBase58(),
    lamports,
    sol: lamports / 1_000_000_000,
  };
}

export async function inspectTransaction(
  signature: string,
  connection: Connection = createMainnetConnection()
): Promise<TransactionInspection> {
  try {
    const tx = await connection.getTransaction(signature.trim(), {
      maxSupportedTransactionVersion: 0,
    });
    if (!tx) {
      return {
        readiness: SOLANA_READINESS,
        status: 'TX_NOT_FOUND',
        signature: signature.trim(),
        slot: null,
        err: null,
        fee: null,
        note: 'READ_ONLY_INSPECTION_NOT_A_SUCCESS_CLAIM',
      };
    }
    const failed = tx.meta?.err != null;
    return {
      readiness: SOLANA_READINESS,
      status: failed ? 'TX_FAILED_ON_CHAIN' : 'TX_FOUND',
      signature: signature.trim(),
      slot: tx.slot,
      err: tx.meta?.err ?? null,
      fee: tx.meta?.fee ?? null,
      note: 'READ_ONLY_INSPECTION_NOT_A_SUCCESS_CLAIM',
    };
  } catch (e) {
    return {
      readiness: SOLANA_READINESS,
      status: 'RPC_ERROR',
      signature: signature.trim(),
      slot: null,
      err: null,
      fee: null,
      note: 'READ_ONLY_INSPECTION_NOT_A_SUCCESS_CLAIM',
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function liveMainnetSnapshot(
  connection: Connection = createMainnetConnection(),
  rpcUrl: string = DEFAULT_MAINNET_RPC
): Promise<{
  readiness: typeof SOLANA_READINESS;
  mint: MintInspection;
  program: ProgramInspection;
  programDualRpc: DualRpcProgramCheck;
  writesEnabled: false;
}> {
  const [mint, program, programDualRpc] = await Promise.all([
    inspectCpxMint(connection, rpcUrl),
    inspectMeshProgram(connection, rpcUrl),
    inspectMeshProgramDualRpc(),
  ]);
  return {
    readiness: SOLANA_READINESS,
    mint,
    program,
    programDualRpc,
    writesEnabled: false,
  };
}
