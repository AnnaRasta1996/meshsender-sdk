/**
 * Network Lab — deterministic offline store-carry-forward simulation.
 * SIMULATED only. No proprietary production routing algorithms.
 */

import { Readiness } from '../readiness.js';
import { sha256Hex } from '../crypto/sha256.js';

export const NETWORK_LAB_READINESS = Readiness.SIMULATED;

export type LabNodeId = string;

export type LabPacket = Readonly<{
  packetId: string;
  from: LabNodeId;
  to: LabNodeId;
  createdAtMs: number;
  expiresAtMs: number;
  payloadDigestHex: string;
  hopCount: number;
  carrierHistory: readonly LabNodeId[];
}>;

export type LabEvent =
  | Readonly<{ type: 'CREATED'; atMs: number; packetId: string }>
  | Readonly<{ type: 'CARRIED'; atMs: number; packetId: string; carrier: LabNodeId }>
  | Readonly<{ type: 'FORWARDED'; atMs: number; packetId: string; from: LabNodeId; to: LabNodeId }>
  | Readonly<{ type: 'DUPLICATE_SUPPRESSED'; atMs: number; packetId: string; at: LabNodeId }>
  | Readonly<{ type: 'EXPIRED'; atMs: number; packetId: string }>
  | Readonly<{ type: 'OUTAGE'; atMs: number; node: LabNodeId; active: boolean }>
  | Readonly<{ type: 'DELIVERED'; atMs: number; packetId: string; via: LabNodeId; hops: number }>;

export type TopologyEdge = Readonly<{ a: LabNodeId; b: LabNodeId }>;

export type MobilityStep = Readonly<{
  atMs: number;
  /** Nodes that meet (in radio range) at this time. */
  meeting: readonly LabNodeId[];
}>;

export type OfflineSimulationInput = Readonly<{
  seed: string;
  nodes: readonly LabNodeId[];
  edges: readonly TopologyEdge[];
  mobility: readonly MobilityStep[];
  outages?: Readonly<Record<string, readonly { startMs: number; endMs: number }[]>>;
  packet: Readonly<{
    packetId: string;
    from: LabNodeId;
    to: LabNodeId;
    createdAtMs: number;
    ttlMs: number;
    payload: string;
  }>;
}>;

export type OfflineSimulationResult = Readonly<{
  readiness: typeof NETWORK_LAB_READINESS;
  delivered: boolean;
  deliveryAtMs: number | null;
  hops: number | null;
  events: readonly LabEvent[];
  finalCarriers: readonly LabNodeId[];
  duplicateSuppressions: number;
  expired: boolean;
  topologyDigestHex: string;
}>;

function undirectedKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function isOutaged(
  node: LabNodeId,
  atMs: number,
  outages: OfflineSimulationInput['outages']
): boolean {
  const windows = outages?.[node] ?? [];
  return windows.some((w) => atMs >= w.startMs && atMs < w.endMs);
}

/**
 * Deterministic SCF demo:
 * - packets move only when carriers meet
 * - duplicates suppressed per node
 * - expiry enforced
 * - no proprietary path-finding; opportunistic forwarding to any live neighbor toward recipient when co-located
 */
export function runOfflineStoreCarryForward(
  input: OfflineSimulationInput
): OfflineSimulationResult {
  const edgeSet = new Set(input.edges.map((e) => undirectedKey(e.a, e.b)));
  const topologyDigestHex = sha256Hex(
    JSON.stringify({
      seed: input.seed,
      nodes: [...input.nodes].sort(),
      edges: [...edgeSet].sort(),
    })
  );

  const events: LabEvent[] = [];
  const seenByNode = new Map<LabNodeId, Set<string>>();
  for (const n of input.nodes) seenByNode.set(n, new Set());

  const expiresAtMs = input.packet.createdAtMs + input.packet.ttlMs;
  let packet: LabPacket = {
    packetId: input.packet.packetId,
    from: input.packet.from,
    to: input.packet.to,
    createdAtMs: input.packet.createdAtMs,
    expiresAtMs,
    payloadDigestHex: sha256Hex(input.packet.payload),
    hopCount: 0,
    carrierHistory: [input.packet.from],
  };

  let carriers = new Set<LabNodeId>([input.packet.from]);
  seenByNode.get(input.packet.from)!.add(packet.packetId);
  events.push({ type: 'CREATED', atMs: input.packet.createdAtMs, packetId: packet.packetId });

  let delivered = false;
  let deliveryAtMs: number | null = null;
  let duplicateSuppressions = 0;
  let expired = false;

  const mobility = [...input.mobility].sort((a, b) => a.atMs - b.atMs);

  for (const step of mobility) {
    if (delivered) break;
    if (step.atMs >= expiresAtMs) {
      expired = true;
      events.push({ type: 'EXPIRED', atMs: expiresAtMs, packetId: packet.packetId });
      break;
    }

    const liveMeeting = step.meeting.filter(
      (n) => input.nodes.includes(n) && !isOutaged(n, step.atMs, input.outages)
    );
    for (const n of input.nodes) {
      if (isOutaged(n, step.atMs, input.outages)) {
        events.push({ type: 'OUTAGE', atMs: step.atMs, node: n, active: true });
      }
    }

    const carriersHere = liveMeeting.filter((n) => carriers.has(n));
    if (carriersHere.length === 0) continue;

    for (const carrier of carriersHere) {
      events.push({ type: 'CARRIED', atMs: step.atMs, packetId: packet.packetId, carrier });
    }

    // Opportunistic: any live meeting peer can receive a copy if connected by topology edge to a carrier.
    for (const peer of liveMeeting) {
      if (carriers.has(peer)) continue;
      const canReceive = carriersHere.some((c) => edgeSet.has(undirectedKey(c, peer)));
      if (!canReceive && !carriersHere.includes(peer)) continue;
      // Co-location alone (meeting) models radio contact for demo topology.
      const contactOk =
        canReceive ||
        carriersHere.some((c) => liveMeeting.includes(c) && liveMeeting.includes(peer));
      if (!contactOk) continue;

      const seen = seenByNode.get(peer)!;
      if (seen.has(packet.packetId)) {
        duplicateSuppressions += 1;
        events.push({
          type: 'DUPLICATE_SUPPRESSED',
          atMs: step.atMs,
          packetId: packet.packetId,
          at: peer,
        });
        continue;
      }
      seen.add(packet.packetId);
      const fromCarrier = carriersHere[0]!;
      carriers.add(peer);
      packet = {
        ...packet,
        hopCount: packet.hopCount + 1,
        carrierHistory: [...packet.carrierHistory, peer],
      };
      events.push({
        type: 'FORWARDED',
        atMs: step.atMs,
        packetId: packet.packetId,
        from: fromCarrier,
        to: peer,
      });

      if (peer === packet.to) {
        delivered = true;
        deliveryAtMs = step.atMs;
        events.push({
          type: 'DELIVERED',
          atMs: step.atMs,
          packetId: packet.packetId,
          via: peer,
          hops: packet.hopCount,
        });
        break;
      }
    }
  }

  if (!delivered && !expired) {
    // End of mobility without delivery — check expiry vs last time.
    const last = mobility[mobility.length - 1]?.atMs ?? input.packet.createdAtMs;
    if (last >= expiresAtMs) {
      expired = true;
      events.push({ type: 'EXPIRED', atMs: expiresAtMs, packetId: packet.packetId });
    }
  }

  return {
    readiness: NETWORK_LAB_READINESS,
    delivered,
    deliveryAtMs,
    hops: delivered ? packet.hopCount : null,
    events,
    finalCarriers: [...carriers],
    duplicateSuppressions,
    expired,
    topologyDigestHex,
  };
}
