import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ScanFeatures } from "@/lib/types";
import { formatHz } from "@/lib/format";

const DEFINITIONS: Record<keyof ScanFeatures, { label: string; definition: string }> = {
  carrierHz: {
    label: "Carrier frequency",
    definition: "Frequency of the dominant resonance component in the captured response.",
  },
  qFactor: {
    label: "Q factor",
    definition: "Sharpness of the resonance — higher Q means a narrower peak and longer ringdown.",
  },
  dampingRatio: {
    label: "Damping ratio",
    definition: "Energy dissipation as a fraction of critical damping, ζ = 1/(2Q).",
  },
  modulationIndex: {
    label: "Modulation index",
    definition: "Strength of amplitude modulation seen in the response envelope.",
  },
  sidebandPowerDb: {
    label: "Sideband power",
    definition: "Modulation sideband energy relative to the carrier, in decibels.",
  },
  spectralEntropy: {
    label: "Spectral entropy",
    definition: "How evenly energy spreads across the spectrum — 0 is a single pure tone.",
  },
  ringDurationMs: {
    label: "Ring duration",
    definition: "Time for the ringdown to decay below the analysis threshold.",
  },
  signalQualityPct: {
    label: "Signal quality",
    definition: "Acquisition quality score for the capture window.",
  },
};

function fmt(key: keyof ScanFeatures, v: number): string {
  switch (key) {
    case "carrierHz":
      return formatHz(v);
    case "dampingRatio":
      return v.toFixed(4);
    case "ringDurationMs":
      return `${Math.round(v)} ms`;
    case "signalQualityPct":
      return `${Math.round(v)}%`;
    case "sidebandPowerDb":
      return `${v.toFixed(1)} dB`;
    default:
      return v.toFixed(2);
  }
}

export function FeatureGrid({
  features,
  columns = 2,
  className,
}: {
  features: ScanFeatures;
  columns?: 2 | 3;
  className?: string;
}) {
  const keys = Object.keys(DEFINITIONS) as (keyof ScanFeatures)[];
  return (
    <TooltipProvider delayDuration={120}>
      <dl
        className={
          className ??
          (columns === 3
            ? "grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-border sm:grid-cols-3"
            : "grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-border")
        }
      >
        {keys.map((k) => {
          const d = DEFINITIONS[k];
          return (
            <div key={k} className="bg-card px-4 py-3">
              <dt className="flex items-center gap-1 text-[11.5px] text-muted-foreground">
                {d.label}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" aria-label={`About ${d.label}`} className="text-muted-foreground/70 hover:text-foreground">
                      <HelpCircle className="size-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-56 text-[11.5px]">
                    {d.definition}
                  </TooltipContent>
                </Tooltip>
              </dt>
              <dd className="numeric mt-0.5 text-[14px] font-medium text-foreground">
                {fmt(k, features[k])}
              </dd>
            </div>
          );
        })}
      </dl>
    </TooltipProvider>
  );
}
