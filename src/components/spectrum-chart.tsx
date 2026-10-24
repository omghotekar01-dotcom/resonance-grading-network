import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { amplitudeAt, buildCurvePath, dbTicks, DEFAULT_GEOMETRY, freqTicks, type SpectrumGeometry } from "@/lib/spectrum";
import type { Spectrum } from "@/lib/types";
import { formatHz } from "@/lib/format";

// Scientific resonance-spectrum plot.
// Draws the sum-of-Lorentzians curve reconstructed from the stored peak list,
// with honest axes, subtle grid, carrier marker, and hover readout.

interface SpectrumChartProps {
  spectrum: Spectrum;
  carrierHz?: number | null;
  highlightRegionHz?: [number, number] | null;
  compareSpectrum?: Spectrum | null;
  compareLabel?: string;
  seriesLabel: string;
  height?: number;
  className?: string;
  compact?: boolean;
}

export function SpectrumChart({
  spectrum,
  carrierHz,
  highlightRegionHz,
  compareSpectrum,
  compareLabel,
  seriesLabel,
  height = 300,
  className,
  compact = false,
}: SpectrumChartProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<{ x: number; freq: number; db: number } | null>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(w);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const g: SpectrumGeometry = {
    width: width || 760,
    height,
    margin: { top: 18, right: compact ? 12 : 20, bottom: 34, left: compact ? 44 : 52 },
  };
  const domain = spectrum.domainHz;
  const mainPath = buildCurvePath(spectrum.peaks, domain, g);
  const comparePath = compareSpectrum ? buildCurvePath(compareSpectrum.peaks, domain, g) : null;
  const innerW = g.width - g.margin.left - g.margin.right;

  const xOf = useCallback(
    (freq: number) => g.margin.left + ((freq - domain[0]) / (domain[1] - domain[0])) * innerW,
    [g.margin.left, innerW, domain],
  );
  const fOf = useCallback(
    (px: number) => domain[0] + ((px - g.margin.left) / innerW) * (domain[1] - domain[0]),
    [g.margin.left, innerW, domain],
  );
  const yOf = useCallback(
    (db: number) => {
      const innerH = g.height - g.margin.top - g.margin.bottom;
      const t = (db - -62) / (-6 - -62);
      return g.margin.top + (1 - t) * innerH;
    },
    [g.height, g.margin.top, g.margin.bottom],
  );

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    if (px < g.margin.left || px > g.width - g.margin.right) {
      setHover(null);
      return;
    }
    const freq = fOf(px);
    setHover({ x: px, freq, db: amplitudeAt(spectrum.peaks, freq) });
  }

  return (
    <div ref={wrapperRef} className={cn("relative w-full", className)}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${g.width} ${height}`}
        role="img"
        aria-label={`Resonance spectrum, ${seriesLabel}. Frequency ${domain[0]} to ${domain[1]} hertz on the horizontal axis, amplitude in decibels on the vertical axis.`}
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
        className="block touch-pan-y"
      >
        {/* grid */}
        {dbTicks().map((db) => (
          <g key={db}>
            <line
              x1={g.margin.left}
              x2={g.width - g.margin.right}
              y1={yOf(db)}
              y2={yOf(db)}
              stroke="var(--color-border)"
              strokeWidth="1"
            />
            {!compact && (
              <text
                x={g.margin.left - 8}
                y={yOf(db) + 3.5}
                textAnchor="end"
                className="fill-muted-foreground"
                fontSize="10.5"
                fontFamily="var(--font-mono)"
              >
                {db}
              </text>
            )}
          </g>
        ))}
        {freqTicks(domain, compact ? 5 : 7).map((f) => {
          const x = xOf(f);
          return (
            <g key={f}>
              <line x1={x} x2={x} y1={g.margin.top} y2={height - g.margin.bottom} stroke="var(--color-border)" strokeWidth="1" opacity="0.6" />
              <text
                x={x}
                y={height - g.margin.bottom + 16}
                textAnchor="middle"
                className="fill-muted-foreground"
                fontSize="10.5"
                fontFamily="var(--font-mono)"
              >
                {f >= 1000 ? `${(f / 1000).toFixed(f % 1000 === 0 ? 0 : 1)}k` : f}
              </text>
            </g>
          );
        })}

        {/* axis labels */}
        {!compact && (
          <>
            <text
              x={g.margin.left + innerW / 2}
              y={height - 2}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize="11"
            >
              Frequency (Hz)
            </text>
            <text
              x={14}
              y={g.margin.top + (height - g.margin.top - g.margin.bottom) / 2}
              textAnchor="middle"
              transform={`rotate(-90 14 ${g.margin.top + (height - g.margin.top - g.margin.bottom) / 2})`}
              className="fill-muted-foreground"
              fontSize="11"
            >
              Amplitude (dB)
            </text>
          </>
        )}

        {/* highlight region */}
        {highlightRegionHz && (
          <rect
            x={xOf(highlightRegionHz[0])}
            y={g.margin.top}
            width={xOf(highlightRegionHz[1]) - xOf(highlightRegionHz[0])}
            height={height - g.margin.top - g.margin.bottom}
            fill="var(--color-primary)"
            opacity="0.07"
            rx="4"
          />
        )}

        {/* carrier marker */}
        {carrierHz != null && carrierHz >= domain[0] && carrierHz <= domain[1] && (
          <g>
            <line
              x1={xOf(carrierHz)}
              x2={xOf(carrierHz)}
              y1={g.margin.top}
              y2={height - g.margin.bottom}
              stroke="var(--color-teal)"
              strokeWidth="1.4"
              strokeDasharray="5 4"
              opacity="0.8"
            />
            {!compact && (
              <text
                x={xOf(carrierHz) + 6}
                y={g.margin.top + 11}
                className="fill-teal"
                fontSize="10.5"
                fontWeight="600"
              >
                Carrier {formatHz(carrierHz)}
              </text>
            )}
          </g>
        )}

        {/* comparison trace */}
        {comparePath && (
          <path
            d={comparePath}
            fill="none"
            stroke="var(--color-muted-foreground)"
            strokeWidth="1.6"
            strokeDasharray="6 4"
            opacity="0.75"
          />
        )}

        {/* main trace */}
        <path
          d={mainPath}
          fill="none"
          stroke="var(--color-teal)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* hover cursor */}
        {hover && (
          <g>
            <line
              x1={hover.x}
              x2={hover.x}
              y1={g.margin.top}
              y2={height - g.margin.bottom}
              stroke="var(--color-foreground)"
              strokeWidth="1"
              opacity="0.25"
            />
            <circle cx={hover.x} cy={yOf(hover.db)} r="3.2" fill="var(--color-teal)" stroke="var(--color-card)" strokeWidth="1.5" />
          </g>
        )}
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute top-2 z-10 rounded-lg border border-border bg-popover px-2.5 py-1.5 text-[11.5px] shadow-[var(--shadow-pop)]"
          style={{
            left: Math.min(Math.max(hover.x - 50, 4), g.width - 110),
          }}
        >
          <div className="numeric font-medium text-foreground">{formatHz(hover.freq)}</div>
          <div className="numeric text-muted-foreground">{hover.db.toFixed(1)} dB</div>
        </div>
      )}

      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded bg-teal" />
          {seriesLabel}
        </span>
        {comparePath && compareLabel && (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded bg-muted-foreground/60" style={{ backgroundImage: "repeating-linear-gradient(90deg, currentColor 0 4px, transparent 4px 7px)" }} />
            {compareLabel}
          </span>
        )}
      </div>
    </div>
  );
}
