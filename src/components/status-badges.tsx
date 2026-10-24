import { CircleCheck, CircleX, FileSearch, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Disposition, SourceMode, VerificationStatus } from "@/lib/types";

export function DispositionBadge({
  disposition,
  size = "default",
}: {
  disposition: Disposition;
  size?: "default" | "sm";
}) {
  const map: Record<
    Disposition,
    { label: string; cls: string; Icon: typeof Flag }
  > = {
    accept: {
      label: "Accept",
      cls: "bg-success-soft text-success",
      Icon: CircleCheck,
    },
    flag: {
      label: "Flag",
      cls: "bg-warning-soft text-warning",
      Icon: Flag,
    },
    verify: {
      label: "Verify",
      cls: "bg-info-soft text-primary",
      Icon: FileSearch,
    },
  };
  const { label, cls, Icon } = map[disposition];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-[12px]",
        cls,
      )}
    >
      <Icon className="size-3" />
      {label}
    </span>
  );
}

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  if (status === "verified") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-[12px] font-medium text-success">
        <CircleCheck className="size-3" />
        Verified · match
      </span>
    );
  }
  if (status === "mismatch") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-danger-soft px-2.5 py-1 text-[12px] font-medium text-destructive">
        <CircleX className="size-3" />
        Verified · mismatch
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[12px] font-medium text-muted-foreground">
      Awaiting review
    </span>
  );
}

export function SourceBadge({
  source,
  label,
  size = "default",
}: {
  source: SourceMode;
  label?: string;
  size?: "default" | "sm";
}) {
  const tone =
    source === "live"
      ? "bg-teal-soft text-teal"
      : source === "manual"
        ? "bg-info-soft text-primary"
        : "bg-muted text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-[12px]",
        tone,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          source === "live" ? "bg-teal" : source === "manual" ? "bg-primary" : "bg-muted-foreground/60",
        )}
      />
      {label ?? (source === "live" ? "Live" : source === "manual" ? "Manual" : "Demo")}
    </span>
  );
}

export function AnomalyBar({ value, className }: { value: number; className?: string }) {
  const tone = value >= 0.6 ? "bg-destructive" : value >= 0.35 ? "bg-warning" : "bg-success";
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="numeric text-[13px] font-medium text-foreground">{value.toFixed(2)}</span>
      <span className="h-1 w-14 overflow-hidden rounded-full bg-muted">
        <span className={cn("block h-full rounded-full", tone)} style={{ width: `${Math.round(value * 100)}%` }} />
      </span>
    </span>
  );
}
