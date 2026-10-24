import { createFileRoute } from "@tanstack/react-router";
import { GitCommitHorizontal } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { listModels } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { ModelRecord } from "@/lib/types";

export const Route = createFileRoute("/_app/models")({
  loader: async () => ({ models: await listModels() }),
  head: () => ({
    meta: [
      { title: "Model Registry — ORIGON" },
      { name: "description", content: "Registered screening models, versions, and validation status." },
      { property: "og:title", content: "Model Registry — ORIGON" },
      { property: "og:description", content: "Registered screening models, versions, and validation status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ModelsPage,
});

function ModelsPage() {
  const { models } = Route.useLoaderData();
  return (
    <div className="space-y-5">
      <PageHeader
        title="Model Registry"
        description="Governance record for screening models. Confidence shown anywhere in the app is model confidence, not independently evaluated accuracy."
      />

      <div className="space-y-4">
        {models.map((m) => (
          <ModelCard key={m.id} model={m} />
        ))}
      </div>
    </div>
  );
}

function ModelCard({ model: m }: { model: ModelRecord }) {
  return (
    <article className="surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <GitCommitHorizontal className="size-4 text-muted-foreground" />
            <h2 className="text-[15px] font-semibold text-foreground">{m.name}</h2>
            <span className="font-mono text-[12px] text-muted-foreground">{m.version}</span>
          </div>
          <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-muted-foreground">
            {m.algorithm}
          </p>
        </div>
        <Badge
          className={
            m.deploymentState.startsWith("Active")
              ? "bg-info-soft text-primary hover:bg-info-soft"
              : "bg-muted text-muted-foreground hover:bg-muted"
          }
        >
          {m.deploymentState}
        </Badge>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 text-[12.5px] md:grid-cols-4">
        <div>
          <dt className="text-muted-foreground">Feature schema</dt>
          <dd className="numeric mt-0.5 font-medium">{m.featureSchemaVersion}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Training samples</dt>
          <dd className="mt-0.5 font-medium">{m.trainingSampleCount ?? "Not recorded"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Validation</dt>
          <dd className="mt-0.5 font-medium text-warning">Not established</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Registered</dt>
          <dd className="mt-0.5 font-medium">{formatDate(m.registeredAt)}</dd>
        </div>
      </dl>

      <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-[11.5px] leading-relaxed text-muted-foreground">
        {m.notes}
      </p>
    </article>
  );
}
