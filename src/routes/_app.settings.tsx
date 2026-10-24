import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { readSession, signOut } from "@/lib/auth";
import { SOURCE_MODES, readPreferredSourceMode, writePreferredSourceMode } from "@/lib/preferences";
import { getHardwareStatus } from "@/lib/api";

export const Route = createFileRoute("/_app/settings")({
  loader: async () => ({ hardware: await getHardwareStatus() }),
  head: () => ({
    meta: [
      { title: "Settings — ORIGON" },
      { name: "description", content: "Session, source preferences, and workspace information." },
      { property: "og:title", content: "Settings — ORIGON" },
      { property: "og:description", content: "Session, source preferences, and workspace information." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { hardware } = Route.useLoaderData();
  const navigate = useNavigate();
  const session = readSession();
  const [mode, setMode] = useState(readPreferredSourceMode());

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader title="Settings" description="Workspace preferences for this browser session." />

      <section className="surface p-5">
        <h2 className="text-[15px] font-semibold">Default inspection source</h2>
        <p className="mt-0.5 text-[12.5px] text-muted-foreground">
          Preselects the acquisition source when you start a new inspection.
        </p>
        <RadioGroup
          value={mode}
          onValueChange={(v) => {
            const value = v as typeof mode;
            setMode(value);
            writePreferredSourceMode(value);
          }}
          className="mt-4 gap-2"
        >
          {SOURCE_MODES.map((m) => {
            const unavailable = m.value === "live" && !hardware.gatewayOnline;
            return (
              <Label
                key={m.value}
                htmlFor={`mode-${m.value}`}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3.5 font-normal transition-colors hover:bg-muted has-[button[data-state=checked]]:border-primary/40 has-[button[data-state=checked]]:bg-accent"
              >
                <RadioGroupItem id={`mode-${m.value}`} value={m.value} className="mt-0.5" />
                <span>
                  <span className="text-[13.5px] font-medium text-foreground">{m.label}</span>
                  <span className="block text-[12px] text-muted-foreground">
                    {m.description}
                    {unavailable && " — currently unavailable: no station connected."}
                  </span>
                </span>
              </Label>
            );
          })}
        </RadioGroup>
      </section>

      <section className="surface p-5">
        <h2 className="text-[15px] font-semibold">Session</h2>
        <dl className="mt-3 space-y-2 text-[13px]">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Signed in as</dt>
            <dd className="font-medium">{session?.displayName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-mono text-[12px]">{session?.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Workspace</dt>
            <dd className="font-medium">Demonstration dataset (fixture store)</dd>
          </div>
        </dl>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => {
            signOut();
            navigate({ to: "/" });
          }}
        >
          <LogOut className="size-4" /> Sign out
        </Button>
      </section>

      <p className="text-[11.5px] leading-relaxed text-muted-foreground">
        ORIGON is a research-screening prototype. Screening dispositions support human judgment
        and evidence traceability; they are not certified material identification or safety
        release authorization.
      </p>
    </div>
  );
}
