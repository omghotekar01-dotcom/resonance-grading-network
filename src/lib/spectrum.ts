import type { Spectrum, SpectrumPeak } from "./types";
import { formatHzShort } from "./format";

// Spectrum rendering helpers. The chart draws a sum-of-Lorentzians resonance
// curve from the recorded peak list — the same shape the acquisition pipeline
// fits, so the plot reflects the stored features rather than inventing data.

export interface SpectrumGeometry {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
}

export const DEFAULT_GEOMETRY: SpectrumGeometry = {
  width: 800,
  height: 320,
  margin: { top: 18, right: 20, bottom: 34, left: 52 },
};

const AMPLITUDE_TOP = -6; // dB
const AMPLITUDE_BOTTOM = -62; // dB

export function amplitudeAt(peaks: SpectrumPeak[], freq: number): number {
  let db = AMPLITUDE_BOTTOM + 2;
  for (const p of peaks) {
    const w = Math.max(p.widthHz, 12) / 2;
    const lorentz = 1 / (1 + Math.pow((freq - p.frequencyHz) / w, 2));
    db += (p.amplitudeDb - AMPLITUDE_BOTTOM - 2) * lorentz;
  }
  return db;
}

function xScale(freq: number, domain: [number, number], g: SpectrumGeometry): number {
  const innerW = g.width - g.margin.left - g.margin.right;
  const [fMin, fMax] = domain;
  return g.margin.left + ((freq - fMin) / (fMax - fMin)) * innerW;
}

function yScale(db: number, g: SpectrumGeometry): number {
  const innerH = g.height - g.margin.top - g.margin.bottom;
  const t = (db - AMPLITUDE_BOTTOM) / (AMPLITUDE_TOP - AMPLITUDE_BOTTOM);
  return g.margin.top + (1 - t) * innerH;
}

export function buildCurvePath(
  peaks: SpectrumPeak[],
  domain: [number, number],
  g: SpectrumGeometry,
): string {
  const [fMin, fMax] = domain;
  const steps = 420;
  let path = "";
  for (let i = 0; i <= steps; i++) {
    const f = fMin + ((fMax - fMin) * i) / steps;
    const x = xScale(f, domain, g).toFixed(2);
    const y = yScale(amplitudeAt(peaks, f), g).toFixed(2);
    path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  return path;
}

export function freqTicks(domain: [number, number], count = 7): number[] {
  const [fMin, fMax] = domain;
  const ticks: number[] = [];
  for (let i = 0; i <= count; i++) {
    ticks.push(Math.round(fMin + ((fMax - fMin) * i) / count));
  }
  return ticks;
}

export function dbTicks(): number[] {
  return [-10, -20, -30, -40, -50, -60];
}

export function peakLabel(freqHz: number): string {
  return formatHzShort(freqHz);
}

export function spectrumToCsv(spectrum: Spectrum): string {
  const rows = ["frequency_hz,amplitude_db,width_hz"];
  for (const p of spectrum.peaks) {
    rows.push(`${p.frequencyHz},${p.amplitudeDb},${p.widthHz}`);
  }
  return rows.join("\n");
}
