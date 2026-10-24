export type PreferredSourceMode = "demo" | "manual" | "live";

export const SOURCE_MODES: { value: PreferredSourceMode; label: string; description: string }[] = [
  { value: "demo", label: "Demo", description: "Deterministic synthetic inspection data" },
  { value: "manual", label: "Manual", description: "Operator-entered feature values" },
  { value: "live", label: "Live", description: "Physical acquisition from a connected station" },
];

const KEY = "origon.preferredSource";

export function readPreferredSourceMode(): PreferredSourceMode {
  if (typeof window === "undefined") return "demo";
  const v = window.localStorage.getItem(KEY);
  return v === "manual" || v === "live" || v === "demo" ? v : "demo";
}

export function writePreferredSourceMode(mode: PreferredSourceMode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, mode);
}
