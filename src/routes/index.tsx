import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { OrigonMark } from "@/components/origon-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, readSession } from "@/lib/auth";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && readSession()) throw redirect({ to: "/overview" });
  },
  head: () => ({
    meta: [
      { title: "Sign in — ORIGON" },
      { name: "description", content: "Sign in to the ORIGON material screening workspace." },
      { property: "og:title", content: "Sign in — ORIGON" },
      { property: "og:description", content: "Listen to your metal. Know your material." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignInPage,
});

function ResonancePanel() {
  return (
    <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-card p-10 lg:flex">
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id="ringFade" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.10" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#ringFade)" />
        {[140, 220, 310, 410].map((r, i) => (
          <circle
            key={r}
            cx="30%"
            cy="28%"
            r={r}
            fill="none"
            stroke="var(--color-primary)"
            strokeOpacity={0.16 - i * 0.03}
            strokeWidth="1.4"
            strokeDasharray={i % 2 === 0 ? "6 10" : undefined}
          />
        ))}
      </svg>
      <div className="relative">
        <div className="flex items-center gap-3">
          <OrigonMark size={34} />
          <span className="text-[17px] font-semibold tracking-[0.16em] text-foreground">ORIGON</span>
        </div>
        <p className="mt-1.5 text-[12px] tracking-wide text-muted-foreground">
          Online Resonance-based Object Grading &amp; Identification Network
        </p>
      </div>
      <div className="relative max-w-md">
        <h1 className="text-[34px] font-semibold leading-[1.15] tracking-[-0.01em] text-foreground">
          Listen to your metal.
        </h1>
        <p className="mt-1 text-[22px] font-medium text-primary">Know your material.</p>
        <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">
          Trace every inspection, understand the evidence, and make more confident quality
          decisions — from controlled acoustic excitation to human-verified outcomes.
        </p>
      </div>
      <p className="relative text-[11.5px] leading-relaxed text-muted-foreground">
        Research-screening prototype. Screening dispositions support human judgment and
        traceability; they are not certified material identification.
      </p>
    </div>
  );
}

function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signIn(email, password);
      await navigate({ to: "/overview" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed. Try again.");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ResonancePanel />
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <OrigonMark size={30} />
            <span className="text-[16px] font-semibold tracking-[0.16em]">ORIGON</span>
          </div>
          <h2 className="text-[22px] font-semibold tracking-tight text-foreground">Sign in</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Access the screening workspace and inspection records.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!error}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!error}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-danger-soft px-3 py-2 text-[12.5px] font-medium text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" />}
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-5 text-[11.5px] leading-relaxed text-muted-foreground">
            Preview build: this session runs against the demonstration dataset. Any valid email
            and a password of 6+ characters will open the demo workspace.
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground/80">
            Research-screening use only — not certified material identification.
          </p>
        </div>
      </div>
    </div>
  );
}
