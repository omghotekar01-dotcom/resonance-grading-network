import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FlaskConical } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { listMaterials } from "@/lib/api";
import { formatHz } from "@/lib/format";
import type { Material } from "@/lib/types";

export const Route = createFileRoute("/_app/materials")({
  loader: async () => ({ materials: await listMaterials() }),
  head: () => ({
    meta: [
      { title: "Material Library — ORIGON" },
      { name: "description", content: "Reference resonance profiles and material properties." },
      { property: "og:title", content: "Material Library — ORIGON" },
      { property: "og:description", content: "Reference resonance profiles and material properties." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MaterialsPage,
});

function MaterialsPage() {
  const { materials } = Route.useLoaderData();
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState<string>("all");

  const families = Array.from(new Set(materials.map((m) => m.family)));
  const q = query.trim().toLowerCase();
  const rows = materials.filter(
    (m) =>
      (family === "all" || m.family === family) &&
      (!q || `${m.code} ${m.name} ${m.family} ${m.composition}`.toLowerCase().includes(q)),
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Material Library"
        description="Reference profiles used by screening. All profiles in this build are simulated references, not experimentally verified fingerprints."
      />

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search code, name, composition…"
          className="h-9 w-full sm:w-72"
          aria-label="Search materials"
        />
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setFamily("all")}
            className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${family === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            All families
          </button>
          {families.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFamily(f)}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${family === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {rows.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((m) => (
            <MaterialCard key={m.code} material={m} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FlaskConical}
          title="No matching materials"
          description="No reference profiles match the current search."
        />
      )}
    </div>
  );
}

function MaterialCard({ material: m }: { material: Material }) {
  return (
    <article className="surface flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-mono text-[15px] font-semibold text-foreground">{m.code}</h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{m.name}</p>
        </div>
        <Badge variant="secondary" className="shrink-0 text-[11px]">
          {m.family}
        </Badge>
      </div>

      <dl className="mt-4 space-y-2 text-[12.5px]">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Reference carrier</dt>
          <dd className="numeric font-medium text-foreground">
            {m.referenceCarrierHz ? formatHz(m.referenceCarrierHz) : "Not available"}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Density</dt>
          <dd className="numeric font-medium text-foreground">
            {m.densityGCm3 ? `${m.densityGCm3.toFixed(2)} g/cm³` : "Not available"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Composition</dt>
          <dd className="mt-0.5 font-medium text-foreground">{m.composition}</dd>
        </div>
      </dl>

      <div className="mt-4 rounded-lg bg-warning-soft px-3 py-2 text-[11.5px] leading-relaxed text-warning">
        Simulated reference profile — {m.profileNote}
      </div>
    </article>
  );
}
