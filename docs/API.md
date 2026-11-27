# API Reference (Hackathon SDK)

All exports are available from `@meshsender/sdk` (`src/index.ts`).

## Readiness

- `Readiness`, `FEATURE_READINESS_MATRIX`

## Network Lab

- `runOfflineStoreCarryForward(input) → OfflineSimulationResult`

## Transport

- `createInternetSimAdapter`, `createBleSimAdapter`, `createWifiDirectSimAdapter`, `createLoraSimAdapter`
- `createPhysicalHardwarePendingStub`, `createDefaultSimTransportBundle`

## Delivery proofs (illustrative)

- `createDemoDeliveryProof`, `verifyDemoDeliveryProof`, `tamperDemoDeliveryProof`
- `digestPayload`, `generateDemoKeyPair`
- Domain: `meshsender.sdk.demo.delivery-proof.v1`

## Relay evidence (illustrative)

- `signDemoRelayHop`, `verifyDemoRelayHop`
- `buildPagedRelayEvidence`, `computeRouteSeedHex`, `foldCommitment`

## Node Passport

- `createDemoPublicPassport`, `verifyPublicPassport`, `createPassportVerifier`

## Solana identifiers (browser-safe, no web3)

- `CPX_MAINNET_MINT_ADDRESS`, `MESHSENDER_PROGRAM_ID`, `DEFAULT_MAINNET_RPC`, `SECONDARY_MAINNET_RPC`
- Source: `src/solana/publicIdentifiers.ts` (dependency-free)

## Solana JSON-RPC fetch (browser-safe)

- `fetchInspectCpxMint`, `fetchInspectProgram`, `fetchInspectProgramDualRpc`

## Solana Node helpers (`LIVE_READ_ONLY`, `@solana/web3.js`)

- `inspectCpxMint`, `inspectMeshProgram`, `inspectCpxWalletBalances`, `inspectTransaction`
- `liveMainnetSnapshot`, `createMainnetConnection`
- Not included in the playground browser bundle

## Economy

- `quoteDeliveryEconomy`
- `simulatePayableRelayReward`, `allocateSequentialRelayRewards`
- `offlineServiceBurnCpxRawFromEurPriceDecimal`
- `nominalRelayRewardCpxRawFromEurPriceDecimal`
- `nodeCapLimitedNominalRaw`, `globalPeriodPoolHardCapRaw`
- `referralSplitRawExactOrFail`, `marketBurnRawExactOrFail`, `first5000Allocation`
- `deriveCommonRewardPeriodId` (requires explicit genesis; DG1 open)
- `applyHighConfidenceWeightOrBlock` (always blocks; DG3 open)

## Pipeline

- `runSimulatedDeliveryPipeline` — sequential per-relay budget; forward timestamps from simulation events
- `extractRelayForwardTimestampsFromEvents`

## Paradox Market

- `hashMarketAgreement`, `simulateBilateralDeal`, `quoteDirectMarketPayment`
- `verifyBilateralAgreement`

## Explicit non-goals

- No production settlement execution
- No proprietary routing / anti-fraud internals
- No seed recovery / Keychain / private wallets
- No Solana signing, spend, or deploy helpers
