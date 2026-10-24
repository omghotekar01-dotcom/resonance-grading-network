import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { readSession } from "@/lib/auth";

export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !readSession()) throw redirect({ to: "/" });
  },
  component: AppLayout,
});

function AppLayout() {
  return <AppShell><Outlet /></AppShell>;
}
