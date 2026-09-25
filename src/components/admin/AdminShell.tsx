import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Briefcase,
  CalendarDays,
  ExternalLink,
  Gauge,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  Palette,
  Search,
  Settings,
  Share2,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/profile", label: "Profile", icon: User },
  { to: "/admin/experience", label: "Experience", icon: Briefcase },
  { to: "/admin/events", label: "Events", icon: CalendarDays },
  { to: "/admin/ambassadors", label: "Ambassadors", icon: Users },
  { to: "/admin/projects", label: "Projects", icon: Sparkles },
  { to: "/admin/skills", label: "Skills", icon: Gauge },
  { to: "/admin/community", label: "Community", icon: Share2 },
  { to: "/admin/media", label: "Media", icon: Images },
  { to: "/admin/appearance", label: "Appearance", icon: Palette },
  { to: "/admin/seo", label: "SEO", icon: Search },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 border-r border-border bg-sidebar transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-border px-5">
          {profile?.logo_url ? (
            <img
              src={profile.logo_url}
              alt="Logo"
              className="h-8 w-8 rounded-lg border border-border object-contain"
            />
          ) : (
            <span className="grid h-8 w-8 place-items-center rounded-lg border border-border font-display text-xs font-bold text-[color:var(--accent)]">
              {badge}
            </span>
          )}
          <div className="leading-tight">
            <p className="font-display text-sm font-bold">Console</p>
            <p className="label-mono text-muted-foreground">Portfolio CMS</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to as string}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="grid h-9 w-9 place-items-center rounded-lg border border-border lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="leading-tight">
              <p className="text-sm font-medium">Md. Ariful Islam</p>
              <p className="label-mono text-muted-foreground">Administrator</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <a href="/" target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">View Website</span>
              </a>
            </Button>
            <button
              className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>
        <main className="min-w-0 flex-1 p-4 lg:p-8">{children}</main>
      </div>

      {open && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string | undefined;
  action?: React.ReactNode | undefined;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
