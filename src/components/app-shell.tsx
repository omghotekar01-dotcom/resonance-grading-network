import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  AudioWaveform,
  BadgeCheck,
  Boxes,
  Building2,
  ClipboardList,
  Command as CommandIcon,
  Database,
  GitCommitHorizontal,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Plug,
  Plus,
  Search,
  Settings,
  TriangleAlert,
  Waypoints,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { OrigonMark, OrigonWordmark } from "@/components/origon-mark";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { readSession, signOut } from "@/lib/auth";
import { SOURCE_MODES, readPreferredSourceMode } from "@/lib/preferences";

const NAV_GROUPS = [
  {
    label: "Workspace",
    items: [
      { to: "/overview", label: "Overview", icon: LayoutDashboard },
      { to: "/inspections/new", label: "New Inspection", icon: Plus },
      { to: "/inspections", label: "Inspections", icon: ClipboardList },
      { to: "/materials", label: "Material Library", icon: Boxes },
    ],
  },
  {
    label: "Quality",
    items: [
      { to: "/verification", label: "Verification Desk", icon: BadgeCheck },
      { to: "/quality", label: "Quality & Suppliers", icon: Building2 },
    ],
  },
  {
    label: "Research & Evidence",
    items: [
      { to: "/models", label: "Model Registry", icon: GitCommitHorizontal },
      { to: "/signals", label: "Signal Analysis", icon: AudioWaveform },
      { to: "/traceability", label: "Traceability", icon: Waypoints },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/hardware", label: "Hardware & Stations", icon: Plug },
      { to: "/system", label: "Database & System", icon: Database },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
] as const;

const PAGE_TITLES: Record<string, string> = {
  "/overview": "Overview",
  "/inspections": "Inspections",
  "/inspections/new": "New Inspection",
  "/verification": "Verification Desk",
  "/materials": "Material Library",
  "/quality": "Quality & Suppliers",
  "/models": "Model Registry",
  "/signals": "Signal Analysis",
  "/traceability": "Traceability",
  "/hardware": "Hardware & Stations",
  "/system": "Database & System",
  "/settings": "Settings",
};

const MOBILE_TABS = [
  { to: "/overview", label: "Overview", icon: LayoutDashboard },
  { to: "/inspections", label: "Inspections", icon: ClipboardList },
  { to: "/inspections/new", label: "New", icon: Plus, primary: true },
  { to: "/verification", label: "Review", icon: BadgeCheck },
] as const;

function isActivePath(pathname: string, to: string): boolean {
  if (to === "/inspections") return pathname === "/inspections" || (pathname.startsWith("/inspections/") && pathname !== "/inspections/new");
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const session = readSession();
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    setMoreSheetOpen(false);
  }, [location.pathname]);

  const handleSignOut = () => {
    signOut();
    navigate({ to: "/" });
  };

  const pageTitle = useMemo(() => {
    if (location.pathname.startsWith("/inspections/")) return "Inspection detail";
    return PAGE_TITLES[location.pathname] ?? "ORIGON";
  }, [location.pathname]);

  const sourceMode = readPreferredSourceMode();

  const goTo = (to: string) => {
    setPaletteOpen(false);
    navigate({ to });
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-screen bg-background">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 lg:flex",
            collapsed ? "w-[68px]" : "w-[236px]",
          )}
        >
          <div className={cn("flex h-14 items-center border-b border-border", collapsed ? "justify-center px-2" : "px-4")}>
            {collapsed ? (
              <Link to="/overview" aria-label="ORIGON overview">
                <OrigonMark size={26} />
              </Link>
            ) : (
              <Link to="/overview" aria-label="ORIGON overview">
                <OrigonWordmark />
              </Link>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Primary">
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="mb-3">
                {!collapsed && <p className="section-label px-3 pb-1.5 pt-1">{group.label}</p>}
                {collapsed && <div className="mx-3 mb-2 border-t border-border" />}
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = isActivePath(location.pathname, item.to);
                    const link = (
                      <Link
                        to={item.to}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-3 py-[7px] text-[13px] font-medium transition-colors",
                          collapsed && "justify-center px-0",
                          active
                            ? "bg-accent text-primary"
                            : "text-foreground/80 hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <item.icon className={cn("size-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </Link>
                    );
                    return (
                      <li key={item.to}>
                        {collapsed ? (
                          <Tooltip>
                            <TooltipTrigger asChild>{link}</TooltipTrigger>
                            <TooltipContent side="right">{item.label}</TooltipContent>
                          </Tooltip>
                        ) : (
                          link
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <div className="border-t border-border p-2">
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[12.5px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
              {!collapsed && "Collapse"}
            </button>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-card/85 px-4 backdrop-blur-md md:px-6">
            <MobileMenuButton onOpenMore={() => setMoreSheetOpen(true)} />

            <h2 className="truncate text-[15px] font-semibold text-foreground">{pageTitle}</h2>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                className="hidden h-8 w-52 items-center gap-2 rounded-lg border border-border bg-background px-2.5 text-[12.5px] text-muted-foreground transition-colors hover:bg-muted sm:flex"
              >
                <Search className="size-3.5" />
                <span>Search…</span>
                <kbd className="ml-auto flex items-center gap-0.5 rounded border border-border bg-card px-1 py-0.5 font-mono text-[10px]">
                  <CommandIcon className="size-2.5" />K
                </kbd>
              </button>

              <SourceModeChip mode={sourceMode} />

              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="hidden items-center gap-1.5 rounded-full bg-warning-soft px-2.5 py-1 text-[11.5px] font-medium text-warning md:inline-flex">
                    <TriangleAlert className="size-3" />
                    No station connected
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-60 text-[11.5px]">
                  No acquisition hardware is reachable, so live capture is unavailable. Demo and Manual sources remain usable.
                </TooltipContent>
              </Tooltip>

              <Button asChild size="sm" className="hidden md:inline-flex">
                <Link to="/inspections/new">
                  <Plus className="size-4" />
                  New inspection
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Account menu"
                    className="flex size-8 items-center justify-center rounded-full bg-primary text-[12px] font-semibold text-primary-foreground"
                  >
                    {(session?.displayName ?? "O").slice(0, 1).toUpperCase()}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="text-[13px] font-medium text-foreground">{session?.displayName}</div>
                    <div className="truncate text-[11.5px] font-normal text-muted-foreground">{session?.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => goTo("/settings")}>
                    <Settings className="size-4" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="size-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 pb-24 pt-6 md:px-8 lg:pb-10">{children}</main>
        </div>

        {/* Mobile bottom navigation */}
        <nav
          className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-border bg-card/95 backdrop-blur-md lg:hidden"
          aria-label="Primary mobile"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {MOBILE_TABS.map((tab) => {
            const active = isActivePath(location.pathname, tab.to);
            if (tab.primary) {
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  className="flex flex-1 items-center justify-center"
                  aria-label="New inspection"
                >
                  <span className="flex size-11 -translate-y-1 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-lift)]">
                    <Plus className="size-5" />
                  </span>
                </Link>
              );
            }
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10.5px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <tab.icon className="size-[18px]" />
                {tab.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreSheetOpen(true)}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 text-[10.5px] font-medium text-muted-foreground"
          >
            <MoreHorizontal className="size-[18px]" />
            More
          </button>
        </nav>

        {/* Mobile secondary navigation sheet */}
        <Sheet open={moreSheetOpen} onOpenChange={setMoreSheetOpen}>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <SheetHeader className="pb-1">
              <SheetTitle className="text-left text-[15px]">All sections</SheetTitle>
            </SheetHeader>
            <div className="max-h-[60vh] overflow-y-auto px-4 pb-8">
              {NAV_GROUPS.map((group) => (
                <div key={group.label} className="mb-4">
                  <p className="section-label pb-1.5">{group.label}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {group.items.map((item) => {
                      const active = isActivePath(location.pathname, item.to);
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setMoreSheetOpen(false)}
                          className={cn(
                            "flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-[13px] font-medium",
                            active ? "border-primary/30 bg-accent text-primary" : "bg-card text-foreground",
                          )}
                        >
                          <item.icon className={cn("size-4", active ? "text-primary" : "text-muted-foreground")} />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={handleSignOut}
                className="mt-2 flex w-full items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-[13px] font-medium text-destructive"
              >
                <LogOut className="size-4" /> Sign out
              </button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Command palette */}
        <Dialog open={paletteOpen} onOpenChange={setPaletteOpen}>
          <DialogContent className="top-[20%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-lg">
            <DialogTitle className="sr-only">Command palette</DialogTitle>
            <DialogDescription className="sr-only">Navigate to any section or run an action.</DialogDescription>
            <Command>
              <CommandInput placeholder="Search sections and actions…" />
              <CommandList className="max-h-80">
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Navigate">
                  {NAV_GROUPS.flatMap((g) => g.items).map((item) => (
                    <CommandItem key={item.to} value={`${item.label} ${item.to}`} onSelect={() => goTo(item.to)}>
                      <item.icon className="size-4 text-muted-foreground" />
                      {item.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandGroup heading="Actions">
                  <CommandItem value="new inspection" onSelect={() => goTo("/inspections/new")}>
                    <Plus className="size-4 text-muted-foreground" />
                    New inspection
                  </CommandItem>
                  <CommandItem value="sign out" onSelect={handleSignOut}>
                    <LogOut className="size-4 text-muted-foreground" />
                    Sign out
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

function MobileMenuButton({ onOpenMore }: { onOpenMore: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpenMore}
      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted lg:hidden"
      aria-label="Open navigation"
    >
      <Menu className="size-4.5" />
    </button>
  );
}

function SourceModeChip({ mode }: { mode: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="hidden items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11.5px] font-medium text-muted-foreground xl:inline-flex">
          <span className="size-1.5 rounded-full bg-primary" />
          Default source: {SOURCE_MODES.find((m) => m.value === mode)?.label ?? mode}
        </span>
      </TooltipTrigger>
      <TooltipContent className="text-[11.5px]">
        Preselected source for your next inspection. Change it in Settings or in the New Inspection flow.
      </TooltipContent>
    </Tooltip>
  );
}

export { NAV_GROUPS, isActivePath };
