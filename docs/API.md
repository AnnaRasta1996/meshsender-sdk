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

## Solana (`LIVE_READ_ONLY`)

- `CPX_MAINNET_MINT_ADDRESS`, `MESHSENDER_PROGRAM_ID`
- `inspectCpxMint`, `inspectMeshProgram`, `inspectAddressBalance`, `inspectTransaction`
- `liveMainnetSnapshot`, `createMainnetConnection`

## Economy

- `quoteDeliveryEconomy`
- `offlineServiceBurnCpxRawFromEurPriceDecimal`
- `nominalRelayRewardCpxRawFromEurPriceDecimal`
- `nodeCapLimitedNominalRaw`, `globalPeriodPoolHardCapRaw`
- `referralSplitRawExactOrFail`, `marketBurnRawExactOrFail`, `first5000Allocation`
- `deriveCommonRewardPeriodId` (requires explicit genesis; DG1 open)
- `applyHighConfidenceWeightOrBlock` (always blocks; DG3 open)

## Paradox Market

- `hashMarketAgreement`, `simulateBilateralDeal`, `quoteDirectMarketPayment`
- `verifyBilateralAgreement`

## Explicit non-goals

- No production settlement execution
- No proprietary routing / anti-fraud internals
- No seed recovery / Keychain / private wallets
- No Solana signing, spend, or deploy helpers
