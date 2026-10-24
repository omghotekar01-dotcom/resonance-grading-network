import { Link } from "@tanstack/react-router";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function CopyField({ value, className }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable (permissions/insecure context) — silently ignore.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title="Copy to clipboard"
      className={cn(
        "group inline-flex max-w-full items-center gap-1.5 rounded-md px-1 py-0.5 text-left font-mono text-[12.5px] text-foreground transition-colors hover:bg-muted",
        className,
      )}
    >
      <span className="truncate">{value}</span>
      {copied ? (
        <Check className="size-3.5 shrink-0 text-success" aria-label="Copied" />
      ) : (
        <Copy className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </button>
  );
}

export function MonoLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("font-mono text-[12.5px] text-foreground", className)}>{children}</span>;
}

export function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <dt className="shrink-0 text-[12.5px] text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right text-[13px] font-medium text-foreground">{children}</dd>
    </div>
  );
}

export function SectionCard({
  title,
  description,
  children,
  className,
  contentClassName,
  action,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  action?: React.ReactNode;
}) {
  return (
    <section className={cn("surface", className)}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 px-5 pb-3 pt-4">
          <div>
            {title && <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>}
            {description && <p className="mt-0.5 text-[12.5px] text-muted-foreground">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={cn("px-5 pb-5", contentClassName)}>{children}</div>
    </section>
  );
}

export function InlineLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="font-medium text-primary underline-offset-2 hover:underline"
    >
      {children}
    </Link>
  );
}
