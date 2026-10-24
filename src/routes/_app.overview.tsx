import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ClipboardList, FileSearch, ShieldCheck, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { InspectionTable } from "@/components/inspection-table";
import { SpectrumChart } from "@/components/spectrum-chart";
import { DispositionBadge, AnomalyBar, SourceBadge } from "@/components/status-badges";
import { Button } from "@/components/ui/button";
import { getHardwareStatus, listScans, listVerifications } from "@/lib/api";
import { formatRelative } from "@/lib/format";
import type { Scan } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/overview")({
  loader: async () => ({
    scans: await listScans(),
    verifications: await listVerifications(),
    hardware: await getHardwareStatus(),
  }),
  head: () => ({
    meta: [
      { title: "Overview — ORIGON" },
      { name: "description", content: "Material screening, decisions, and verification at a glance." },
      { property: "og:title", content: "Overview — ORIGON" },
      { property: "og:description", content: "Material screening, decisions, and verification at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OverviewPage,
});

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <div className={cn("surface px-5 py-4", className)}>
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-medium text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground/70" />
      </div>
      <p className="numeric mt-1.5 text-[26px] font-semibold leading-none tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-1.5 text-[11.5px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function OverviewPage() {
  const { scans, verifications } = Route.useLoaderData();
  const today = new Date().toDateString();
  const inspectionsToday = scans.filter(
    (s) => new Date(s.capturedAt).toDateString() === today,
  ).length;
  const requiringAttention = scans.filter(
    (s) => (s.disposition === "flag" || s.disposition === "verify") && s.verificationStatus === "none",
  );
  const pendingVerify = scans.filter(
    (s) => s.disposition === "verify" && s.verificationStatus === "none",
  );
  const verified = verifications;
  const agreement = verified.length
    ? Math.round((verified.filter((v) => v.outcome === "match").length / verified.length) * 100)
    : null;
  const latest = scans[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description="Material screening, decisions, and verification at a glance."
        actions={
          <Button asChild>
            <Link to="/inspections/new">New inspection</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard
          label="Inspections today"
          value={String(inspectionsToday)}
          hint="Demonstration dataset, local day"
          icon={ClipboardList}
        />
        <MetricCard
          label="Requiring attention"
          value={String(requiringAttention.length)}
          hint="Flagged or verify, not yet reviewed"
          icon={FileSearch}
        />
        <MetricCard
          label="Pending verifications"
          value={String(pendingVerify.length)}
          hint="Screening requested external verification"
          icon={ShieldCheck}
        />
        <MetricCard
          label="Verified agreement rate"
          value={agreement != null ? `${agreement}%` : "Not available"}
          hint={verified.length ? `${verified.length} external verifications` : "No external evidence yet"}
          icon={TrendingUp}
        />
      </div>

      {latest && (
        <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
          <section className="surface p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-[15px] font-semibold">Latest resonance spectrum</h2>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  <span className="font-mono">{latest.id}</span> · {latest.partCode} · captured{" "}
                  {formatRelative(latest.capturedAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <SourceBadge source={latest.source} label={latest.sourceLabel} size="sm" />
                <Button asChild variant="outline" size="sm">
                  <Link to="/inspections/$scanId" params={{ scanId: latest.id }}>
                    View complete trace <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
            <SpectrumChart
              spectrum={latest.spectrum}
              carrierHz={latest.features.carrierHz}
              seriesLabel={`${latest.id} · ${latest.sourceLabel}`}
              highlightRegionHz={[
                latest.features.carrierHz * 0.97,
                latest.features.carrierHz * 1.03,
              ]}
              height={280}
            />
          </section>

          <LatestResultPanel scan={latest} />
        </div>
      )}

      <section className="surface">
        <header className="flex items-center justify-between px-5 pb-2 pt-4">
          <h2 className="text-[15px] font-semibold">Recent inspections</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/inspections">
              View all <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </header>
        <div className="px-2 pb-3">
          <InspectionTable scans={scans.slice(0, 6)} compact />
        </div>
      </section>
    </div>
  );
}

function LatestResultPanel({ scan }: { scan: Scan }) {
  return (
    <section className="surface flex flex-col p-5">
      <p className="section-label">Latest screening result</p>
      <p className="mt-2 text-[12.5px] text-muted-foreground">Predicted material</p>
      <p className="mt-0.5 text-[30px] font-semibold leading-none tracking-tight text-foreground">
        {scan.predictedMaterialCode}
      </p>
      <p className="mt-1 text-[12px] text-muted-foreground">
        Expected {scan.expectedMaterialCode} · model {scan.modelVersion}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-muted px-3.5 py-3">
          <p className="text-[11.5px] text-muted-foreground">Model confidence</p>
          <p className="numeric mt-0.5 text-[19px] font-semibold text-foreground">
            {Math.round(scan.confidence * 100)}%
          </p>
        </div>
        <div className="rounded-xl bg-muted px-3.5 py-3">
          <p className="text-[11.5px] text-muted-foreground">Anomaly score</p>
          <AnomalyBar value={scan.anomalyScore} className="mt-1" />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-[12px] text-muted-foreground">Disposition</span>
        <DispositionBadge disposition={scan.disposition} />
      </div>

      <p className="mt-4 text-[12.5px] leading-relaxed text-muted-foreground">{scan.rationale}</p>

      <div className="mt-auto flex flex-col gap-2 pt-4">
        <Button asChild variant="outline" size="sm">
          <Link to="/inspections/$scanId" params={{ scanId: scan.id }}>
            View complete trace
          </Link>
        </Button>
        {scan.verificationStatus === "none" && scan.disposition !== "accept" && (
          <Button asChild size="sm">
            <Link to="/verification" search={{ scan: scan.id }}>
              Add verification
            </Link>
          </Button>
        )}
      </div>
    </section>
  );
}
