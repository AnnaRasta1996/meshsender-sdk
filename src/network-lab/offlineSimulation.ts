/**
 * Network Lab — deterministic offline store-carry-forward simulation.
 * SIMULATED only. No proprietary production routing algorithms.
 *
 * Rules:
 * - Forwarding requires topology edge + co-presence + live (non-outaged) nodes.
 * - Each carrier keeps its own route history from the sender.
 * - Successful delivery hop count = edges on the recipient's route (path.length - 1).
 * - Mobility before packet creation is ignored; expiry is enforced.
 * - Duplicate suppression is per-node (second offer of same packetId).
 */

import { Readiness } from '../readiness.js';
import { sha256Hex } from '../crypto/sha256.js';

export const NETWORK_LAB_READINESS = Readiness.SIMULATED;

export type LabNodeId = string;

export type LabEvent =
  | Readonly<{ type: 'CREATED'; atMs: number; packetId: string }>
  | Readonly<{ type: 'CARRIED'; atMs: number; packetId: string; carrier: LabNodeId }>
  | Readonly<{
      type: 'FORWARDED';
      atMs: number;
      packetId: string;
      from: LabNodeId;
      to: LabNodeId;
      routeAfter: readonly LabNodeId[];
    }>
  | Readonly<{ type: 'DUPLICATE_SUPPRESSED'; atMs: number; packetId: string; at: LabNodeId }>
  | Readonly<{ type: 'EXPIRED'; atMs: number; packetId: string }>
  | Readonly<{ type: 'OUTAGE'; atMs: number; node: LabNodeId; active: boolean }>
  | Readonly<{
      type: 'DELIVERED';
      atMs: number;
      packetId: string;
      via: LabNodeId;
      hops: number;
      route: readonly LabNodeId[];
    }>
  | Readonly<{ type: 'IGNORED_MOBILITY_BEFORE_CREATE'; atMs: number }>;

export type TopologyEdge = Readonly<{ a: LabNodeId; b: LabNodeId }>;

export type MobilityStep = Readonly<{
  atMs: number;
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
  /** Edges on successful delivery route; null if not delivered. */
  hops: number | null;
  /** Recipient route history on success. */
  deliveryRoute: readonly LabNodeId[] | null;
  /** Per-carrier route from sender. */
  carrierRoutes: Readonly<Record<string, readonly LabNodeId[]>>;
  events: readonly LabEvent[];
  finalCarriers: readonly LabNodeId[];
  duplicateSuppressions: number;
  expired: boolean;
  topologyDigestHex: string;
  payloadDigestHex: string;
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

export function runOfflineStoreCarryForward(
  input: OfflineSimulationInput
): OfflineSimulationResult {
  if (!input.nodes.includes(input.packet.from) || !input.nodes.includes(input.packet.to)) {
    throw new Error('PACKET_ENDPOINT_NOT_IN_NODES');
  }
  const edgeSet = new Set(input.edges.map((e) => undirectedKey(e.a, e.b)));
  const topologyDigestHex = sha256Hex(
    JSON.stringify({
      seed: input.seed,
      nodes: [...input.nodes].sort(),
      edges: [...edgeSet].sort(),
    })
  );
  const payloadDigestHex = sha256Hex(input.packet.payload);
  const expiresAtMs = input.packet.createdAtMs + input.packet.ttlMs;

  const events: LabEvent[] = [];
  const carrierRoutes = new Map<LabNodeId, LabNodeId[]>();
  carrierRoutes.set(input.packet.from, [input.packet.from]);
  const hasPacket = new Set<LabNodeId>([input.packet.from]);

  events.push({ type: 'CREATED', atMs: input.packet.createdAtMs, packetId: input.packet.packetId });

  let delivered = false;
  let deliveryAtMs: number | null = null;
  let deliveryRoute: LabNodeId[] | null = null;
  let hops: number | null = null;
  let duplicateSuppressions = 0;
  let expired = false;

  const mobility = [...input.mobility].sort((a, b) => a.atMs - b.atMs);

  for (const step of mobility) {
    if (delivered || expired) break;

    if (step.atMs < input.packet.createdAtMs) {
      events.push({ type: 'IGNORED_MOBILITY_BEFORE_CREATE', atMs: step.atMs });
      continue;
    }

    if (step.atMs >= expiresAtMs) {
      expired = true;
      events.push({ type: 'EXPIRED', atMs: expiresAtMs, packetId: input.packet.packetId });
      break;
    }

    for (const n of input.nodes) {
      if (isOutaged(n, step.atMs, input.outages)) {
        events.push({ type: 'OUTAGE', atMs: step.atMs, node: n, active: true });
      }
    }

    const liveMeeting = step.meeting.filter(
      (n) => input.nodes.includes(n) && !isOutaged(n, step.atMs, input.outages)
    );
    const carriersHere = liveMeeting.filter((n) => hasPacket.has(n));
    if (carriersHere.length === 0) continue;

    for (const carrier of carriersHere) {
      events.push({
        type: 'CARRIED',
        atMs: step.atMs,
        packetId: input.packet.packetId,
        carrier,
      });
    }

    // Deterministic peer order for reproducibility.
    const peers = [...liveMeeting].sort();
    for (const peer of peers) {
      if (delivered) break;
      const donors = carriersHere
        .filter((c) => c !== peer && edgeSet.has(undirectedKey(c, peer)))
        .sort();
      if (donors.length === 0) continue;

      if (hasPacket.has(peer)) {
        duplicateSuppressions += 1;
        events.push({
          type: 'DUPLICATE_SUPPRESSED',
          atMs: step.atMs,
          packetId: input.packet.packetId,
          at: peer,
        });
        continue;
      }

      const fromCarrier = donors[0]!;
      const parentRoute = carrierRoutes.get(fromCarrier)!;
      const routeAfter = [...parentRoute, peer];
      carrierRoutes.set(peer, routeAfter);
      hasPacket.add(peer);
      events.push({
        type: 'FORWARDED',
        atMs: step.atMs,
        packetId: input.packet.packetId,
        from: fromCarrier,
        to: peer,
        routeAfter,
      });

      if (peer === input.packet.to) {
        delivered = true;
        deliveryAtMs = step.atMs;
        deliveryRoute = routeAfter;
        hops = routeAfter.length - 1;
        events.push({
          type: 'DELIVERED',
          atMs: step.atMs,
          packetId: input.packet.packetId,
          via: peer,
          hops,
          route: routeAfter,
        });
      }
    }
  }

  if (!delivered && !expired) {
    const last = mobility[mobility.length - 1]?.atMs ?? input.packet.createdAtMs;
    if (last >= expiresAtMs) {
      expired = true;
      events.push({ type: 'EXPIRED', atMs: expiresAtMs, packetId: input.packet.packetId });
    }
  }

  const carrierRoutesObj: Record<string, readonly LabNodeId[]> = {};
  for (const [k, v] of carrierRoutes) carrierRoutesObj[k] = v;

  return {
    readiness: NETWORK_LAB_READINESS,
    delivered,
    deliveryAtMs,
    hops,
    deliveryRoute,
    carrierRoutes: carrierRoutesObj,
    events,
    finalCarriers: [...hasPacket],
    duplicateSuppressions,
    expired,
    topologyDigestHex,
    payloadDigestHex,
  };
}
