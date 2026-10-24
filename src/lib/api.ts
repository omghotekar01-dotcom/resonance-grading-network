import {
  MATERIALS,
  MODELS,
  SCANS,
  SCREENING_POLICY,
  STATIONS,
  SUPPLIERS,
  VERIFICATIONS,
} from "./fixtures";
import type {
  DemoInspectionInput,
  Disposition,
  HardwareStatus,
  ManualInspectionInput,
  Material,
  ModelRecord,
  Scan,
  SourceMode,
  Station,
  SupplierQuality,
  SystemStatus,
  VerificationRecord,
  VerificationStatus,
} from "./types";
import { formatPct } from "./format";

// ─────────────────────────────────────────────────────────────────────────────
// ORIGON typed API service layer.
//
// API MODE: fixtures. This preview build is NOT connected to the ORIGON
// Python/SQLite backend or to any ESP32 acquisition hardware. Every function
// below serves the clearly-labeled demonstration fixtures from lib/fixtures.ts
// and keeps new records in an in-memory session store.
//
// When connecting the real local server, replace each function body with a
// fetch against its documented endpoint (noted per function) — the UI and
// these types are already shaped to those contracts.
// ─────────────────────────────────────────────────────────────────────────────

const latency = (ms = 420) => new Promise((r) => setTimeout(r, ms));

// Session store — starts from fixtures, accumulates records made in this session.
let scans: Scan[] = [...SCANS].sort(
  (a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime(),
);
let verifications: VerificationRecord[] = [...VERIFICATIONS];
let nextScanSeq = 513;
let nextVerSeq = 20;

export const SCREENING_GATES = SCREENING_POLICY;

// Provisional screening gates — identical logic to the demonstrator's policy.
// UI-only callers must use this function rather than re-deriving decisions.
export function decideDisposition(confidence: number, anomalyScore: number): Disposition {
  if (anomalyScore >= 0.6 || confidence < 0.6) return "verify";
  if (anomalyScore >= 0.35 || confidence < 0.8) return "flag";
  return "accept";
}

function verificationStatusFor(scanId: string): VerificationStatus {
  const recs = verifications.filter((v) => v.scanId === scanId);
  if (recs.length === 0) return "none";
  return recs[0].outcome === "mismatch" ? "mismatch" : "verified";
}

function recomputeVerificationRollups() {
  scans = scans.map((s) => ({ ...s, verificationStatus: verificationStatusFor(s.id) }));
}

// ---- Reads ------------------------------------------------------------------

/** GET /api/materials */
export async function listMaterials(): Promise<Material[]> {
  await latency(260);
  return MATERIALS;
}

/** GET /api/models */
export async function listModels(): Promise<ModelRecord[]> {
  await latency(260);
  return MODELS;
}

/** GET /api/scans */
export async function listScans(): Promise<Scan[]> {
  await latency(320);
  recomputeVerificationRollups();
  return scans;
}

/** GET /api/scans/{id} */
export async function getScan(id: string): Promise<Scan | null> {
  await latency(240);
  return scans.find((s) => s.id === id) ?? null;
}

/** GET /api/verifications */
export async function listVerifications(): Promise<VerificationRecord[]> {
  await latency(260);
  return verifications;
}

/** GET /api/hardware/status */
export async function getHardwareStatus(): Promise<HardwareStatus> {
  await latency(300);
  return {
    gatewayOnline: false,
    stations: STATIONS,
    message:
      "No acquisition gateway is connected. Live captures are unavailable; Demo and Manual sources remain usable.",
  };
}

/** GET /api/system */
export async function getSystemStatus(): Promise<SystemStatus> {
  await latency(300);
  return {
    serviceState: "Operational — local demonstrator (fixture mirror)",
    datastore: "SQLite in the local ORIGON server; this preview mirrors it with in-browser fixtures",
    runtime: "Static frontend preview, browser session store",
    frontendVersion: "ORIGON frontend v0.4.0",
    demoDatasetResettable: true,
    entityCounts: [
      { label: "Scans", count: scans.length },
      { label: "Verification records", count: verifications.length },
      { label: "Materials", count: MATERIALS.length },
      { label: "Registered models", count: MODELS.length },
      { label: "Stations", count: STATIONS.length },
    ],
  };
}

/** GET /api/analytics/supplier-quality */
export async function getSupplierQuality(): Promise<SupplierQuality[]> {
  await latency(420);
  return SUPPLIERS.map((supplier) => {
    const rows = scans.filter((s) => s.supplier === supplier);
    const verRows = verifications.filter((v) => rows.some((s) => s.id === v.scanId));
    const anomalies = rows.map((s) => s.anomalyScore);
    return {
      supplier,
      batches: new Set(rows.map((r) => r.batchCode)).size,
      inspections: rows.length,
      verifiedSamples: verRows.length,
      verifiedMismatches: verRows.filter((v) => v.outcome === "mismatch").length,
      avgAnomaly: anomalies.length
        ? anomalies.reduce((a, b) => a + b, 0) / anomalies.length
        : null,
    };
  });
}

// ---- Writes -----------------------------------------------------------------

function buildSpectrumFromCarrier(
  carrierHz: number,
  qFactor: number,
  amplitude: number,
): Scan["spectrum"] {
  const widthHz = Math.max(carrierHz / Math.max(qFactor, 4), 18);
  const peaks = [
    { frequencyHz: carrierHz, amplitudeDb: amplitude, widthHz },
    {
      frequencyHz: carrierHz * 2,
      amplitudeDb: amplitude - 24,
      widthHz: widthHz * 1.8,
    },
    {
      frequencyHz: carrierHz / 2,
      amplitudeDb: amplitude - 27,
      widthHz: widthHz * 1.4,
    },
  ];
  return { domainHz: [200, 6000], noiseFloorDb: -58, peaks };
}

function nextScanId(): string {
  return `SCN-2026-0${nextScanSeq++}`;
}

function scanFromInput(args: {
  input: DemoInspectionInput | ManualInspectionInput;
  source: SourceMode;
  sourceLabel: string;
  carrierHz: number;
  qFactor: number;
  dampingRatio: number;
  modulationIndex: number;
  sidebandPowerDb: number;
  spectralEntropy: number;
  ringDurationMs: number;
  signalQualityPct: number;
  peakAmplitudeDb: number;
  predictedMaterialCode: string;
  confidence: number;
  anomalyScore: number;
  rationale: string;
}): Scan {
  const { input } = args;
  return {
    id: nextScanId(),
    partCode: input.partCode.trim().toUpperCase(),
    batchCode: input.batchCode.trim().toUpperCase(),
    supplier: input.supplier,
    stationId: input.stationId,
    source: args.source,
    sourceLabel: args.sourceLabel,
    capturedAt: new Date().toISOString(),
    expectedMaterialCode: input.expectedMaterialCode,
    predictedMaterialCode: args.predictedMaterialCode,
    confidence: args.confidence,
    anomalyScore: args.anomalyScore,
    disposition: decideDisposition(args.confidence, args.anomalyScore),
    modelVersion: "origon-screen-gates v0.3.1",
    features: {
      carrierHz: args.carrierHz,
      qFactor: args.qFactor,
      dampingRatio: args.dampingRatio,
      modulationIndex: args.modulationIndex,
      sidebandPowerDb: args.sidebandPowerDb,
      spectralEntropy: args.spectralEntropy,
      ringDurationMs: args.ringDurationMs,
      signalQualityPct: args.signalQualityPct,
    },
    spectrum: buildSpectrumFromCarrier(args.carrierHz, args.qFactor, args.peakAmplitudeDb),
    rationale: args.rationale,
    verificationStatus: "none",
  };
}

/**
 * POST /api/scans/simulate — deterministic synthetic inspection.
 * The predicted material follows the selected demo source material; anomaly
 * injection degrades the response the same way the local demonstrator does.
 */
export async function createDemoScan(input: DemoInspectionInput): Promise<Scan> {
  await latency(1400);
  const material = MATERIALS.find((m) => m.code === input.sourceMaterialCode);
  const reference = material?.referenceCarrierHz ?? 2500;
  const drift = input.injectAnomaly ? 0.062 : 0.004;
  const carrierHz = Math.round(reference * (1 + drift));
  const qFactor = input.injectAnomaly ? 46 : 96;
  const confidence = input.injectAnomaly ? 0.62 : 0.92;
  const anomalyScore = input.injectAnomaly ? 0.63 : 0.15;
  const newScan = scanFromInput({
    input,
    source: "demo",
    sourceLabel: "Demo data",
    carrierHz,
    qFactor,
    dampingRatio: Number((1 / (2 * qFactor)).toFixed(4)),
    modulationIndex: input.injectAnomaly ? 0.42 : 0.12,
    sidebandPowerDb: input.injectAnomaly ? -12 : -24,
    spectralEntropy: input.injectAnomaly ? 0.64 : 0.35,
    ringDurationMs: input.injectAnomaly ? 152 : 408,
    signalQualityPct: input.injectAnomaly ? 76 : 94,
    peakAmplitudeDb: input.injectAnomaly ? -27 : -17.5,
    predictedMaterialCode: input.sourceMaterialCode,
    confidence,
    anomalyScore,
    rationale: input.injectAnomaly
      ? "Anomaly injection was enabled for this demonstration record: damping and sideband energy were degraded, so the screen raised a verification request."
      : "Demonstration response matches the selected simulated source-material reference band; no anomaly flags raised.",
  });
  scans = [newScan, ...scans];
  return newScan;
}

/**
 * POST /api/scans/manual — operator-entered feature values.
 * The screening gates run exactly as on captured data; the record is labeled
 * Manual and its spectrum is reconstructed from the entered features.
 */
export async function createManualScan(input: ManualInspectionInput): Promise<Scan> {
  await latency(1200);
  const qFactor = input.qFactor;
  const dampingRatio = Number((1 / (2 * qFactor)).toFixed(4));
  // Provisional scoring over operator-entered values (same gates family as
  // the demonstrator): strong Q and a reference-band carrier score well.
  const material = MATERIALS.find((m) => m.code === input.expectedMaterialCode);
  const reference = material?.referenceCarrierHz ?? 2500;
  const carrierOffset = Math.abs(input.carrierHz - reference) / reference;
  const confidence = Math.max(0.4, Math.min(0.95, 0.95 - carrierOffset * 1.6 - (0.55 - Math.min(qFactor, 140) / 140) * 0.35 - input.modulationIndex * 0.25));
  const anomalyScore = Math.max(0.05, Math.min(0.95, carrierOffset * 1.4 + (1 - Math.min(qFactor, 120) / 120) * 0.45 + input.modulationIndex * 0.35));
  const newScan = scanFromInput({
    input,
    source: "manual",
    sourceLabel: "Manual entry",
    carrierHz: input.carrierHz,
    qFactor,
    dampingRatio,
    modulationIndex: input.modulationIndex,
    sidebandPowerDb: -22 - input.modulationIndex * 10,
    spectralEntropy: Math.min(0.8, 0.3 + input.modulationIndex * 0.7),
    ringDurationMs: Math.round(Math.min(480, qFactor * 4.4)),
    signalQualityPct: Math.round(Math.max(62, 97 - input.modulationIndex * 40)),
    peakAmplitudeDb: -20 - input.modulationIndex * 8,
    predictedMaterialCode: input.expectedMaterialCode,
    confidence: Number(confidence.toFixed(2)),
    anomalyScore: Number(anomalyScore.toFixed(2)),
    rationale:
      "Screening gates applied to operator-entered feature values. No acoustic signal was captured; the plotted curve is reconstructed from the entered features.",
  });
  scans = [newScan, ...scans];
  return newScan;
}

/**
 * POST /api/verifications — records an external verification against a scan.
 * The historical prediction is never modified; only the roll-up status and
 * this linked record change.
 */
export async function addVerification(args: {
  scanId: string;
  verifiedMaterialCode: string;
  method: string;
  evidenceNote: string;
  reviewedBy: string;
}): Promise<VerificationRecord> {
  await latency(900);
  const target = scans.find((s) => s.id === args.scanId);
  if (!target) throw new Error("Inspection record not found.");
  const outcome: VerificationRecord["outcome"] =
    args.verifiedMaterialCode === target.predictedMaterialCode ? "match" : "mismatch";
  const record: VerificationRecord = {
    id: `VER-0${nextVerSeq++}`,
    scanId: args.scanId,
    verifiedMaterialCode: args.verifiedMaterialCode,
    method: args.method,
    evidenceNote: args.evidenceNote.trim(),
    reviewedBy: args.reviewedBy,
    createdAt: new Date().toISOString(),
    outcome,
  };
  verifications = [record, ...verifications];
  recomputeVerificationRollups();
  return record;
}

/** POST /api/hardware/test-connection — honest, fixture-backed probe. */
export async function testStationConnection(stationId: string): Promise<{
  ok: boolean;
  message: string;
}> {
  await latency(1500);
  const station = STATIONS.find((s) => s.id === stationId);
  if (!station) return { ok: false, message: "Unknown station identifier." };
  if (station.state === "connected") {
    return { ok: true, message: `${station.name} responded to the handshake.` };
  }
  if (station.state === "commissioning") {
    return {
      ok: false,
      message: `${station.name} is in commissioning and not yet answering handshakes. No live acquisition is possible.`,
    };
  }
  return {
    ok: false,
    message: `${station.name} did not respond. Acquisition electronics were last heard from on ${new Date(station.lastCommunicationAt ?? Date.now()).toLocaleDateString("en-GB")}. Reconnect the ESP32 gateway to enable live capture.`,
  };
}

/** POST /api/demo/seed (reset) — restores the pristine demonstration dataset. */
export async function resetDemoDataset(): Promise<void> {
  await latency(700);
  scans = [...SCANS].sort(
    (a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime(),
  );
  verifications = [...VERIFICATIONS];
  nextScanSeq = 513;
  nextVerSeq = 20;
}

// ---- Derived helpers used by screens ---------------------------------------

export function sourceModeBadge(mode: SourceMode): { label: string; tone: "teal" | "neutral" | "info" } {
  switch (mode) {
    case "live":
      return { label: "Live", tone: "teal" };
    case "demo":
      return { label: "Demo", tone: "neutral" };
    case "manual":
      return { label: "Manual", tone: "info" };
  }
}

export function confidenceBandLabel(c: number): string {
  return formatPct(c, 0);
}

export function dispositionsOf(rows: Scan[]): Record<Disposition, number> {
  const out: Record<Disposition, number> = { accept: 0, flag: 0, verify: 0 };
  for (const s of rows) out[s.disposition]++;
  return out;
}

export { scans as sessionScans, verifications as sessionVerifications };
export type { Station };
