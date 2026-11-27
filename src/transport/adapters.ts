/**
 * Transport — public adapter interfaces + simulated adapters.
 * Physical BLE / Wi-Fi Direct / LoRa hardware remains PENDING.
 */

import { Readiness } from '../readiness.js';

export type TransportKind = 'internet' | 'ble' | 'wifi_direct' | 'lora';

export type TransportEnvelope = Readonly<{
  id: string;
  kind: TransportKind;
  fromNodeId: string;
  toNodeId: string;
  payloadB64: string;
  createdAtMs: number;
}>;

export type TransportSendResult =
  | Readonly<{ ok: true; readiness: typeof Readiness.SIMULATED; deliveredAtMs: number }>
  | Readonly<{ ok: false; readiness: typeof Readiness.SIMULATED | typeof Readiness.PENDING; reason: string }>;

export interface MeshTransportAdapter {
  readonly kind: TransportKind;
  readonly readiness: typeof Readiness.SIMULATED | typeof Readiness.PENDING;
  send(envelope: TransportEnvelope): Promise<TransportSendResult>;
}

type SimState = {
  latencyMs: number;
  failRate: number;
  rng: () => number;
};

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function createSimulatedAdapter(
  kind: TransportKind,
  opts?: Partial<SimState>
): MeshTransportAdapter {
  const state: SimState = {
    latencyMs: opts?.latencyMs ?? 25,
    failRate: opts?.failRate ?? 0,
    rng: opts?.rng ?? mulberry32(kind.length * 997),
  };
  return {
    kind,
    readiness: Readiness.SIMULATED,
    async send(envelope) {
      if (envelope.kind !== kind) {
        return { ok: false, readiness: Readiness.SIMULATED, reason: 'KIND_MISMATCH' };
      }
      if (state.rng() < state.failRate) {
        return { ok: false, readiness: Readiness.SIMULATED, reason: 'SIMULATED_DROP' };
      }
      const deliveredAtMs = envelope.createdAtMs + state.latencyMs;
      return { ok: true, readiness: Readiness.SIMULATED, deliveredAtMs };
    },
  };
}

export function createInternetSimAdapter(opts?: Partial<SimState>): MeshTransportAdapter {
  return createSimulatedAdapter('internet', { latencyMs: 15, ...opts });
}

export function createBleSimAdapter(opts?: Partial<SimState>): MeshTransportAdapter {
  return createSimulatedAdapter('ble', { latencyMs: 40, ...opts });
}

export function createWifiDirectSimAdapter(opts?: Partial<SimState>): MeshTransportAdapter {
  return createSimulatedAdapter('wifi_direct', { latencyMs: 30, ...opts });
}

export function createLoraSimAdapter(opts?: Partial<SimState>): MeshTransportAdapter {
  return createSimulatedAdapter('lora', { latencyMs: 120, ...opts });
}

/** Explicit non-functional placeholders for physical hardware. */
export function createPhysicalHardwarePendingStub(
  kind: Exclude<TransportKind, 'internet'>
): MeshTransportAdapter {
  return {
    kind,
    readiness: Readiness.PENDING,
    async send() {
      return {
        ok: false,
        readiness: Readiness.PENDING,
        reason: 'PHYSICAL_HARDWARE_PENDING',
      };
    },
  };
}

export function createDefaultSimTransportBundle(): Record<TransportKind, MeshTransportAdapter> {
  return {
    internet: createInternetSimAdapter(),
    ble: createBleSimAdapter(),
    wifi_direct: createWifiDirectSimAdapter(),
    lora: createLoraSimAdapter(),
  };
}
