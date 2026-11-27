/**
 * End-to-end pipeline: successful simulated delivery → proof → relay evidence → economy.
 * Never fabricates fallback delivery success.
 */

import {
  runOfflineStoreCarryForward,
  type OfflineSimulationInput,
  type OfflineSimulationResult,
} from '../network-lab/offlineSimulation.js';
import {
  createDeliveryProofFromSimulation,
  verifyDemoDeliveryProof,
  type DemoDeliveryProof,
} from '../delivery-proofs/demoProof.js';
import {
  buildPagedRelayEvidence,
  buildRelayHopsFromDeliveryRoute,
  verifyPagedRelayEvidence,
  type DemoRelayEvidenceBundle,
} from '../relay-evidence/pagedCommitment.js';
import { generateDemoKeyPair, type DemoKeyPair } from '../crypto/ed25519.js';
import { digestPayload } from '../delivery-proofs/demoProof.js';
import { quoteDeliveryEconomy } from '../economy/canonicalQuotes.js';

export type SimulatedDeliveryPipelineResult =
  | Readonly<{
      ok: true;
      simulation: OfflineSimulationResult;
      recipientSigner: DemoKeyPair;
      proof: DemoDeliveryProof;
      proofVerified: true;
      relay?: {
        bundle: DemoRelayEvidenceBundle;
        expectedSigners: readonly string[];
        verified: true;
      };
      economy: ReturnType<typeof quoteDeliveryEconomy>;
    }>
  | Readonly<{
      ok: false;
      reason: 'DELIVERY_NOT_SUCCESSFUL' | 'PROOF_VERIFY_FAILED' | 'RELAY_VERIFY_FAILED';
      simulation: OfflineSimulationResult;
      detail?: string;
    }>;

export function runSimulatedDeliveryPipeline(input: {
  simulationInput: OfflineSimulationInput;
  cpxEurPriceDecimal?: string;
  alreadyCountedNodePeriodRaw?: bigint;
  rewardReserveRawAtPeriodStart?: bigint;
  globalAlreadyPaidRaw?: bigint;
  buildRelay?: boolean;
}): SimulatedDeliveryPipelineResult {
  const simulation = runOfflineStoreCarryForward(input.simulationInput);
  if (
    !simulation.delivered ||
    simulation.deliveryAtMs == null ||
    simulation.hops == null ||
    !simulation.deliveryRoute
  ) {
    return { ok: false, reason: 'DELIVERY_NOT_SUCCESSFUL', simulation };
  }

  const recipientSigner = generateDemoKeyPair();
  const proof = createDeliveryProofFromSimulation({
    messageId: input.simulationInput.packet.packetId,
    fromNodeId: input.simulationInput.packet.from,
    toNodeId: input.simulationInput.packet.to,
    deliveredAtMs: simulation.deliveryAtMs,
    hops: simulation.hops,
    ingressTransport: 'ble',
    payloadDigestHex: simulation.payloadDigestHex,
    recipientSigner,
  });
  const proofCheck = verifyDemoDeliveryProof(proof, recipientSigner.publicKeyB64);
  if (!proofCheck.ok) {
    return {
      ok: false,
      reason: 'PROOF_VERIFY_FAILED',
      simulation,
      detail: proofCheck.reason,
    };
  }

  const economy = quoteDeliveryEconomy({
    cpxEurPriceDecimal: input.cpxEurPriceDecimal ?? '0.0005',
    alreadyCountedNodePeriodRaw: input.alreadyCountedNodePeriodRaw ?? 0n,
    rewardReserveRawAtPeriodStart: input.rewardReserveRawAtPeriodStart,
    globalAlreadyPaidRaw: input.globalAlreadyPaidRaw,
  });

  let relay:
    | {
        bundle: DemoRelayEvidenceBundle;
        expectedSigners: readonly string[];
        verified: true;
      }
    | undefined = undefined;

  if (input.buildRelay !== false && simulation.deliveryRoute.length >= 3) {
    const intermediates = simulation.deliveryRoute.length - 2;
    const hopSigners = Array.from({ length: intermediates }, () => generateDemoKeyPair());
    const times = hopSigners.map((_, i) => (simulation.deliveryAtMs ?? 0) - (intermediates - i));
    const built = buildRelayHopsFromDeliveryRoute({
      messageId: input.simulationInput.packet.packetId,
      deliveryRoute: simulation.deliveryRoute,
      hopSigners,
      forwardedAtMsByHop: times,
      rewardRawDecimal: economy.actualPayableRaw.toString(),
    });
    const bundle = buildPagedRelayEvidence({
      messageId: input.simulationInput.packet.packetId,
      intentDigestHex: digestPayload(`intent:${input.simulationInput.packet.packetId}`),
      nonceB64: 'cGlwZWxpbmUtbm9uY2U=',
      senderDigestHex: digestPayload(input.simulationInput.packet.from),
      recipientDigestHex: digestPayload(input.simulationInput.packet.to),
      hops: built.hops,
      expectedSignerPublicKeysB64: built.expectedSignerPublicKeysB64,
    });
    const v = verifyPagedRelayEvidence({
      bundle,
      expectedSignerPublicKeysB64: built.expectedSignerPublicKeysB64,
      expectedRootCommitmentHex: bundle.rootCommitmentHex,
    });
    if (!v.ok) {
      return {
        ok: false,
        reason: 'RELAY_VERIFY_FAILED',
        simulation,
        detail: v.reason,
      };
    }
    relay = {
      bundle,
      expectedSigners: built.expectedSignerPublicKeysB64,
      verified: true,
    };
  }

  return {
    ok: true,
    simulation,
    recipientSigner,
    proof,
    proofVerified: true,
    relay,
    economy,
  };
}
