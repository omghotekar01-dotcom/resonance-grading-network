import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/page-header";
import { InspectionTable } from "@/components/inspection-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listScans } from "@/lib/api";
import type { Disposition, SourceMode, VerificationStatus } from "@/lib/types";

export const Route = createFileRoute("/_app/inspections")({
  loader: async () => ({ scans: await listScans() }),
  head: () => ({
    meta: [
      { title: "Inspections — ORIGON" },
      { name: "description", content: "Search and inspect every screening record and its trace." },
      { property: "og:title", content: "Inspections — ORIGON" },
      { property: "og:description", content: "Search and inspect every screening record and its trace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InspectionsPage,
});

function InspectionsPage() {
  const { scans } = Route.useLoaderData();
  const [query, setQuery] = useState("");
  const [disposition, setDisposition] = useState<"all" | Disposition>("all");
  const [source, setSource] = useState<"all" | SourceMode>("all");
  const [verification, setVerification] = useState<"all" | VerificationStatus>("all");
  const [sort, setSort] = useState<"captured" | "confidence" | "anomaly">("captured");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = scans.filter((s) => {
      if (
        q &&
        ![s.id, s.partCode, s.batchCode, s.supplier, s.predictedMaterialCode, s.expectedMaterialCode]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
        return false;
      if (disposition !== "all" && s.disposition !== disposition) return false;
      if (source !== "all" && s.source !== source) return false;
      if (verification !== "all" && s.verificationStatus !== verification) return false;
      return true;
    });
    switch (sort) {
      case "confidence":
        return [...filtered].sort((a, b) => a.confidence - b.confidence);
      case "anomaly":
        return [...filtered].sort((a, b) => b.anomalyScore - a.anomalyScore);
      default:
        return filtered;
    }
  }, [scans, query, disposition, source, verification, sort]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Inspections"
        description="Every screening record with its source, prediction, and verification lineage."
      />

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search ID, part, batch, supplier, material…"
          className="h-9 w-full sm:w-72"
          aria-label="Search inspections"
        />
        <Select value={disposition} onValueChange={(v) => setDisposition(v as typeof disposition)}>
          <SelectTrigger className="h-9 w-[150px]" aria-label="Filter by disposition">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All dispositions</SelectItem>
            <SelectItem value="accept">Accept</SelectItem>
            <SelectItem value="flag">Flag</SelectItem>
            <SelectItem value="verify">Verify</SelectItem>
          </SelectContent>
        </Select>
        <Select value={source} onValueChange={(v) => setSource(v as typeof source)}>
          <SelectTrigger className="h-9 w-[140px]" aria-label="Filter by source">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            <SelectItem value="live">Live</SelectItem>
            <SelectItem value="demo">Demo</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>
        <Select value={verification} onValueChange={(v) => setVerification(v as typeof verification)}>
          <SelectTrigger className="h-9 w-[170px]" aria-label="Filter by verification">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All verification</SelectItem>
            <SelectItem value="none">Awaiting review</SelectItem>
            <SelectItem value="verified">Verified · match</SelectItem>
            <SelectItem value="mismatch">Verified · mismatch</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger className="h-9 w-[170px]" aria-label="Sort records">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="captured">Newest first</SelectItem>
            <SelectItem value="confidence">Lowest confidence</SelectItem>
            <SelectItem value="anomaly">Highest anomaly</SelectItem>
          </SelectContent>
        </Select>
        <p className="ml-auto text-[12px] text-muted-foreground">
          {rows.length} of {scans.length} records
        </p>
      </div>

      <section className="surface px-2 py-2">
        {rows.length ? (
          <InspectionTable scans={rows} />
        ) : (
          <EmptyState
            icon={ClipboardList}
            title="No matching records"
            description="No inspection records match the current search and filters. Try clearing a filter."
            className="py-10"
          />
        )}
      </section>
    </div>
  );
}
