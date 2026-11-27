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

/** Canonical Chaos Paradox (CPX) mainnet mint (from MeshSender mainnetTokenIdentity). */
export const CPX_MAINNET_MINT_ADDRESS =
  '9s3CcNwhvPKWi1i5hJSQgRLDrmjQXAkQgRsrDkgiEb6X' as const;

/** Mesh settlement / mesh program ID (owner-authorized public identifier). */
export const MESHSENDER_PROGRAM_ID =
  'GSRFUJcMMZdSgqueeGd9mWhUfrSF33QHVELNNWbvpKNg' as const;

export const CPX_DECIMALS_EXPECTED = 6 as const;
export const DEFAULT_MAINNET_RPC = clusterApiUrl('mainnet-beta');

export type MintInspection = Readonly<{
  readiness: typeof SOLANA_READINESS;
  mintAddress: typeof CPX_MAINNET_MINT_ADDRESS;
  decimals: number;
  supplyRaw: string;
  supplyUi: string;
  mintAuthority: string | null;
  freezeAuthority: string | null;
  mintAuthorityRevoked: boolean;
  freezeAuthorityRevoked: boolean;
}>;

export type ProgramInspection = Readonly<{
  readiness: typeof SOLANA_READINESS;
  programId: typeof MESHSENDER_PROGRAM_ID;
  executable: boolean;
  ownerProgram: string;
  dataLength: number;
  lamports: number;
}>;

export type BalanceInspection = Readonly<{
  readiness: typeof SOLANA_READINESS;
  address: string;
  lamports: number;
  sol: number;
}>;

export type TransactionInspection = Readonly<{
  readiness: typeof SOLANA_READINESS;
  signature: string;
  slot: number | null;
  err: unknown;
  fee: number | null;
  note: 'READ_ONLY_INSPECTION_NOT_A_SUCCESS_CLAIM';
}>;

export function createMainnetConnection(rpcUrl: string = DEFAULT_MAINNET_RPC): Connection {
  return new Connection(rpcUrl, 'confirmed');
}

export async function inspectCpxMint(
  connection: Connection = createMainnetConnection()
): Promise<MintInspection> {
  const mint = new PublicKey(CPX_MAINNET_MINT_ADDRESS);
  const supply = await connection.getTokenSupply(mint);
  const parsed = await connection.getParsedAccountInfo(mint);
  const data = parsed.value?.data as ParsedAccountData | undefined;
  const info = (data?.parsed as { info?: Record<string, unknown> } | undefined)?.info ?? {};
  const mintAuthority =
    info.mintAuthority === null || info.mintAuthority === undefined
      ? null
      : String(info.mintAuthority);
  const freezeAuthority =
    info.freezeAuthority === null || info.freezeAuthority === undefined
      ? null
      : String(info.freezeAuthority);
  const decimals = supply.value.decimals;
  return {
    readiness: SOLANA_READINESS,
    mintAddress: CPX_MAINNET_MINT_ADDRESS,
    decimals,
    supplyRaw: supply.value.amount,
    supplyUi: supply.value.uiAmountString ?? String(supply.value.uiAmount ?? ''),
    mintAuthority,
    freezeAuthority,
    mintAuthorityRevoked: mintAuthority === null,
    freezeAuthorityRevoked: freezeAuthority === null,
  };
}

export async function inspectMeshProgram(
  connection: Connection = createMainnetConnection()
): Promise<ProgramInspection> {
  const programId = new PublicKey(MESHSENDER_PROGRAM_ID);
  const info = await connection.getAccountInfo(programId);
  if (!info) {
    return {
      readiness: SOLANA_READINESS,
      programId: MESHSENDER_PROGRAM_ID,
      executable: false,
      ownerProgram: 'NOT_FOUND',
      dataLength: 0,
      lamports: 0,
    };
  }
  return {
    readiness: SOLANA_READINESS,
    programId: MESHSENDER_PROGRAM_ID,
    executable: info.executable,
    ownerProgram: info.owner.toBase58(),
    dataLength: info.data.length,
    lamports: info.lamports,
  };
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
  const tx = await connection.getTransaction(signature.trim(), {
    maxSupportedTransactionVersion: 0,
  });
  return {
    readiness: SOLANA_READINESS,
    signature: signature.trim(),
    slot: tx?.slot ?? null,
    err: tx?.meta?.err ?? null,
    fee: tx?.meta?.fee ?? null,
    note: 'READ_ONLY_INSPECTION_NOT_A_SUCCESS_CLAIM',
  };
}

export async function liveMainnetSnapshot(
  connection: Connection = createMainnetConnection()
): Promise<{
  readiness: typeof SOLANA_READINESS;
  mint: MintInspection;
  program: ProgramInspection;
  writesEnabled: false;
}> {
  const [mint, program] = await Promise.all([
    inspectCpxMint(connection),
    inspectMeshProgram(connection),
  ]);
  return {
    readiness: SOLANA_READINESS,
    mint,
    program,
    writesEnabled: false,
  };
}
