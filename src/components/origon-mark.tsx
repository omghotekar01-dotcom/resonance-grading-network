import { cn } from "@/lib/utils";

/**
 * ORIGON brand mark — concentric resonance contours around an excited center,
 * with a fine measured trace. Scales cleanly from favicon to hero size.
 */
export function OrigonMark({
  size = 28,
  className,
  animated = false,
}: {
  size?: number;
  className?: string;
  animated?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={cn("text-primary", className)}
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="4.5" fill="currentColor" />
      <circle
        cx="24"
        cy="24"
        r="11.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="58 15"
        opacity="0.85"
      />
      <circle
        cx="24"
        cy="24"
        r="19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="88 32"
        opacity="0.45"
        className={animated ? "origon-mark-pulse" : undefined}
      />
      <path
        d="M4 34 h6 l3 -8 3 14 3 -10 3 4 h22"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
        transform="translate(0 -2) scale(0.92 0.92)"
      />
    </svg>
  );
}

export function OrigonWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <OrigonMark size={26} />
      <span className="text-[15px] font-semibold tracking-[0.14em] text-foreground">ORIGON</span>
    </span>
  );
}
