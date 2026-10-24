// ORIGON domain types.
// These mirror the intended ORIGON API contracts (/api/scans, /api/materials,
// /api/models, /api/verifications, /api/analytics/supplier-quality, /api/system,
// /api/hardware/status). In this preview build they are backed by the
// clearly-labeled fixture store in lib/fixtures.ts.

export type SourceMode = "live" | "demo" | "manual";
export type Disposition = "accept" | "flag" | "verify";
export type VerificationStatus = "none" | "verified" | "mismatch";

export interface Material {
  code: string;
  name: string;
  family: string;
  densityGCm3: number | null;
  composition: string;
  referenceCarrierHz: number | null;
  profileStatus: "simulated-reference";
  profileNote: string;
}

export interface SpectrumPeak {
  frequencyHz: number;
  amplitudeDb: number;
  widthHz: number;
}

export interface Spectrum {
  domainHz: [number, number];
  noiseFloorDb: number;
  peaks: SpectrumPeak[];
}

export interface ScanFeatures {
  carrierHz: number;
  qFactor: number;
  dampingRatio: number;
  modulationIndex: number;
  sidebandPowerDb: number;
  spectralEntropy: number;
  ringDurationMs: number;
  signalQualityPct: number;
}

export interface VerificationRecord {
  id: string;
  scanId: string;
  verifiedMaterialCode: string;
  method: string;
  evidenceNote: string;
  reviewedBy: string;
  createdAt: string;
  outcome: "match" | "mismatch";
}

export interface Scan {
  id: string;
  partCode: string;
  batchCode: string;
  supplier: string;
  stationId: string;
  source: SourceMode;
  sourceLabel: string;
  capturedAt: string;
  expectedMaterialCode: string;
  predictedMaterialCode: string;
  confidence: number;
  anomalyScore: number;
  disposition: Disposition;
  modelVersion: string;
  features: ScanFeatures;
  spectrum: Spectrum;
  rationale: string;
  verificationStatus: VerificationStatus;
}

export interface ModelRecord {
  id: string;
  name: string;
  version: string;
  algorithm: string;
  deploymentState: string;
  featureSchemaVersion: string;
  trainingSampleCount: number | null;
  validationStatus: "not-established";
  registeredAt: string;
  notes: string;
}

export type StationState = "not_connected" | "connected" | "commissioning";

export interface Station {
  id: string;
  name: string;
  location: string;
  state: StationState;
  deviceIdentifier: string;
  transport: string;
  lastCommunicationAt: string | null;
  notes: string;
}

export interface SystemStatus {
  serviceState: string;
  datastore: string;
  runtime: string;
  frontendVersion: string;
  demoDatasetResettable: boolean;
  entityCounts: { label: string; count: number }[];
}

export interface SupplierQuality {
  supplier: string;
  batches: number;
  inspections: number;
  verifiedSamples: number;
  verifiedMismatches: number;
  avgAnomaly: number | null;
}

export interface SignInResult {
  email: string;
  displayName: string;
}

// ---- New-inspection inputs (mapped to /api/scans/simulate, /api/scans/manual) ----

export interface DemoInspectionInput {
  partCode: string;
  batchCode: string;
  supplier: string;
  stationId: string;
  expectedMaterialCode: string;
  sourceMaterialCode: string;
  injectAnomaly: boolean;
}

export interface ManualInspectionInput {
  partCode: string;
  batchCode: string;
  supplier: string;
  stationId: string;
  expectedMaterialCode: string;
  carrierHz: number;
  qFactor: number;
  modulationIndex: number;
}

export interface HardwareStatus {
  gatewayOnline: boolean;
  stations: Station[];
  message: string;
}
