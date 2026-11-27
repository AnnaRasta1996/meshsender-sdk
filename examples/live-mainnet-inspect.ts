import {
  liveMainnetSnapshot,
  createMainnetConnection,
  CPX_MAINNET_MINT_ADDRESS,
  MESHSENDER_PROGRAM_ID,
} from '../src/index.ts';

const snap = await liveMainnetSnapshot(createMainnetConnection());
console.log({
  readiness: snap.readiness,
  mint: CPX_MAINNET_MINT_ADDRESS,
  program: MESHSENDER_PROGRAM_ID,
  decimals: snap.mint.decimals,
  supplyUi: snap.mint.supplyUi,
  mintAuthorityRevoked: snap.mint.mintAuthorityRevoked,
  freezeAuthorityRevoked: snap.mint.freezeAuthorityRevoked,
  programExecutable: snap.program.executable,
  writesEnabled: snap.writesEnabled,
});
