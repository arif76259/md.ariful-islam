import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity, CalendarDays, Eye, Globe, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { PageHeader } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/_gate/analytics")({
  component: Analytics,
});

type Pageview = Tables<"pageviews">;

async function fetchPageviews(): Promise<Pageview[]> {
  const { data, error } = await supabase
    .from("pageviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error) throw error;
  return data ?? [];
}

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

function deviceLabel(ua: string) {
  if (/Mobile|Android|iPhone/i.test(ua)) return "Mobile";
  if (/iPad|Tablet/i.test(ua)) return "Tablet";
  return "Desktop";
}

function Analytics() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["pageviews"],
    queryFn: fetchPageviews,
    refetchInterval: 60_000,
  });
  const views = data ?? [];

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const today = views.filter((v) => now - new Date(v.created_at).getTime() < day).length;
  const week = views.filter((v) => now - new Date(v.created_at).getTime() < 7 * day).length;
  const month = views.filter((v) => now - new Date(v.created_at).getTime() < 30 * day).length;

  // Unique visitors approximated by distinct user agents.
  const unique = new Set(views.map((v) => v.user_agent)).size;

  // Last 30 days series.
  const series: { day: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * day).toISOString().slice(0, 10);
    series.push({ day: d, count: 0 });
  }
  const byDay = new Map(series.map((s) => [s.day, s]));
  for (const v of views) {
    const s = byDay.get(dayKey(v.created_at));
    if (s) s.count++;
  }
  const max = Math.max(1, ...series.map((s) => s.count));

  const topOf = (key: (v: Pageview) => string) => {
    const counts = new Map<string, number>();
    for (const v of views) {
      const k = key(v) || "Direct";
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  };
  const topPages = topOf((v) => v.path);
  const topReferrers = topOf((v) => {
    if (!v.referrer) return "";
    try {
      return new URL(v.referrer).hostname;
    } catch {
      return v.referrer;
    }
  });
  const devices = topOf((v) => deviceLabel(v.user_agent));

  const stats = [
    ["Total views", views.length, Eye],
    ["Unique visitors", unique, Globe],
    ["Last 24 hours", today, Activity],
    ["Last 7 days", week, TrendingUp],
    ["Last 30 days", month, CalendarDays],
  ] as const;

  return (
    <>
      <PageHeader
        title="Visitor analytics"
        description="Traffic on your public website. Counts update automatically as people visit."
      />

      {isError && (
        <p className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
          Could not load analytics.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(([label, value, Icon]) => (
          <div key={label} className="rounded-2xl border border-border bg-surface-2/50 p-5">
            <div className="flex items-center justify-between">
              <p className="label-mono text-muted-foreground">{label}</p>
              <Icon className="h-4 w-4 text-[color:var(--accent)]" />
            </div>
            <p className="font-display mt-4 text-3xl font-bold">
              {isLoading ? "—" : String(value).padStart(2, "0")}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface-2/50 p-6">
        <p className="label-mono text-muted-foreground">Views — last 30 days</p>
        <div className="mt-6 flex h-40 items-end gap-1">
          {series.map((s) => (
            <div
              key={s.day}
              title={`${s.day}: ${s.count} view${s.count === 1 ? "" : "s"}`}
              className="flex-1 rounded-t bg-[color:var(--accent)]/80 transition-all hover:bg-[color:var(--accent)]"
              style={{ height: `${Math.max(2, (s.count / max) * 100)}%` }}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between label-mono text-muted-foreground">
          <span>{series[0]?.day}</span>
          <span>{series[series.length - 1]?.day}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {(
          [
            ["Top pages", topPages],
            ["Traffic sources", topReferrers],
            ["Devices", devices],
          ] as const
        ).map(([title, rows]) => (
          <div key={title} className="rounded-2xl border border-border bg-surface-2/50 p-6">
            <p className="label-mono text-muted-foreground">{title}</p>
            <div className="mt-4 divide-y divide-border">
              {rows.map(([label, count]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <p className="truncate text-sm">{label}</p>
                  <p className="label-mono shrink-0 text-muted-foreground">{count}</p>
                </div>
              ))}
              {rows.length === 0 && (
                <p className="py-3 text-sm text-muted-foreground">No data yet.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface-2/50 p-6">
        <p className="label-mono text-muted-foreground">Recent visits</p>
        <div className="mt-4 divide-y divide-border">
          {views.slice(0, 10).map((v) => (
            <div key={v.id} className="flex items-center justify-between gap-4 py-2.5">
              <p className="truncate text-sm">
                {v.path} <span className="text-muted-foreground">· {deviceLabel(v.user_agent)}</span>
              </p>
              <p className="label-mono shrink-0 text-muted-foreground">
                {new Date(v.created_at).toLocaleString()}
              </p>
            </div>
          ))}
          {views.length === 0 && !isLoading && (
            <p className="py-3 text-sm text-muted-foreground">
              No visits recorded yet. They will appear here once people open your published site.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
