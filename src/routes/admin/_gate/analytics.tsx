import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Activity,
  CalendarDays,
  CalendarIcon,
  Eye,
  Globe,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { PageHeader } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function endOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(23, 59, 59, 999);
  return c;
}

function eachDay(from: Date, to: Date): string[] {
  const days: string[] = [];
  const cur = startOfDay(from);
  while (cur.getTime() <= startOfDay(to).getTime()) {
    days.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

function deviceLabel(ua: string) {
  if (/Mobile|Android|iPhone/i.test(ua)) return "Mobile";
  if (/iPad|Tablet/i.test(ua)) return "Tablet";
  return "Desktop";
}

function DatePickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Date;
  onChange: (d: Date) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start gap-2 text-left font-normal">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          {format(value, "d MMM yyyy")}
          <span className="sr-only">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(d) => {
            if (d) {
              onChange(d);
              setOpen(false);
            }
          }}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}

function Analytics() {
  const now = new Date();
  const defaultFrom = new Date(startOfDay(now).getTime() - 6 * 24 * 60 * 60 * 1000);

  const [rangeFrom, setRangeFrom] = useState<Date>(defaultFrom);
  const [rangeTo, setRangeTo] = useState<Date>(startOfDay(now));

  const { data, isLoading, isError } = useQuery({
    queryKey: ["pageviews"],
    queryFn: fetchPageviews,
    refetchInterval: 60_000,
  });
  const views = data ?? [];

  const views24h = views.filter(
    (v) => now.getTime() - new Date(v.created_at).getTime() < 24 * 60 * 60 * 1000,
  ).length;
  const views7d = views.filter(
    (v) => now.getTime() - new Date(v.created_at).getTime() < 7 * 24 * 60 * 60 * 1000,
  ).length;
  const views30d = views.filter(
    (v) => now.getTime() - new Date(v.created_at).getTime() < 30 * 24 * 60 * 60 * 1000,
  ).length;

  // Unique visitors approximated by distinct user agents.
  const unique = new Set(views.map((v) => v.user_agent)).size;

  const stats = [
    ["Total views", views.length, Eye],
    ["Unique visitors", unique, Globe],
    ["Last 24 hours", views24h, Activity],
    ["Last 7 days", views7d, TrendingUp],
    ["Last 30 days", views30d, CalendarDays],
  ] as const;

  // ---- Selected date range ----
  const range = useMemo(() => {
    const start = startOfDay(rangeFrom).getTime();
    const end = endOfDay(rangeTo).getTime();
    const inRange = views.filter((v) => {
      const t = new Date(v.created_at).getTime();
      return t >= start && t <= end;
    });
    const days = eachDay(rangeFrom, rangeTo);
    const counts = new Map(days.map((d) => [d, 0]));
    for (const v of inRange) {
      const k = dayKey(v.created_at);
      if (counts.has(k)) counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    const uniqueInRange = new Set(inRange.map((v) => v.user_agent)).size;
    const pages = new Map<string, number>();
    for (const v of inRange) {
      const k = v.path || "Unknown";
      pages.set(k, (pages.get(k) ?? 0) + 1);
    }
    const topPages = [...pages.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    return { inRange, uniqueInRange, days, series: [...counts.entries()], topPages };
  }, [views, rangeFrom, rangeTo]);

  const rangeMax = Math.max(1, ...range.series.map(([, c]) => c));

  const applyPreset = (days: number) => {
    const today = startOfDay(new Date());
    setRangeFrom(new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000));
    setRangeTo(today);
  };

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

      {/* Custom date range */}
      <div className="mt-6 rounded-2xl border border-border bg-surface-2/50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="label-mono text-muted-foreground">Custom date range</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => applyPreset(7)}>
              Last 7 days
            </Button>
            <Button variant="ghost" size="sm" onClick={() => applyPreset(30)}>
              Last 30 days
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setRangeFrom(startOfDay(new Date()));
                setRangeTo(startOfDay(new Date()));
              }}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const t = startOfDay(new Date());
                setRangeFrom(new Date(t.getFullYear(), t.getMonth(), 1));
                setRangeTo(t);
              }}
            >
              This month
            </Button>
            <DatePickerField label="From" value={rangeFrom} onChange={setRangeFrom} />
            <span className="label-mono text-muted-foreground">to</span>
            <DatePickerField label="To" value={rangeTo} onChange={setRangeTo} />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Reset range to last 7 days"
              onClick={() => applyPreset(7)}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface/60 p-4">
            <div className="flex items-center justify-between">
              <p className="label-mono text-muted-foreground">Visits in range</p>
              <Eye className="h-4 w-4 text-[color:var(--accent)]" />
            </div>
            <p className="font-display mt-3 text-2xl font-bold">
              {isLoading ? "—" : range.inRange.length}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface/60 p-4">
            <div className="flex items-center justify-between">
              <p className="label-mono text-muted-foreground">Unique visitors</p>
              <Globe className="h-4 w-4 text-[color:var(--accent)]" />
            </div>
            <p className="font-display mt-3 text-2xl font-bold">
              {isLoading ? "—" : range.uniqueInRange}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface/60 p-4">
            <div className="flex items-center justify-between">
              <p className="label-mono text-muted-foreground">Days covered</p>
              <CalendarDays className="h-4 w-4 text-[color:var(--accent)]" />
            </div>
            <p className="font-display mt-3 text-2xl font-bold">{range.days.length}</p>
          </div>
        </div>

        <p className="label-mono mt-6 text-muted-foreground">
          Views — {format(rangeFrom, "d MMM yyyy")} → {format(rangeTo, "d MMM yyyy")}
        </p>
        <div className="mt-4 flex h-32 items-end gap-1 overflow-x-auto">
          {range.series.map(([day, count]) => (
            <div
              key={day}
              title={`${day}: ${count} view${count === 1 ? "" : "s"}`}
              className="min-w-[6px] flex-1 rounded-t bg-[color:var(--accent)]/80 transition-all hover:bg-[color:var(--accent)]"
              style={{ height: `${Math.max(2, (count / rangeMax) * 100)}%` }}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between label-mono text-muted-foreground">
          <span>{range.series[0]?.[0]}</span>
          <span>{range.series[range.series.length - 1]?.[0]}</span>
        </div>

        {range.topPages.length > 0 && (
          <div className="mt-6 border-t border-border pt-4">
            <p className="label-mono text-muted-foreground">Top pages in range</p>
            <div className="mt-2 divide-y divide-border">
              {range.topPages.map(([label, count]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <p className="truncate text-sm">{label}</p>
                  <p className="label-mono shrink-0 text-muted-foreground">{count}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Last 30 days chart */}
      <Last30Days views={views} isLoading={isLoading} />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <TopLists views={views} />
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

function Last30Days({ views, isLoading }: { views: Pageview[]; isLoading: boolean }) {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const series: { day: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    series.push({ day: new Date(now - i * day).toISOString().slice(0, 10), count: 0 });
  }
  const byDay = new Map(series.map((s) => [s.day, s]));
  for (const v of views) {
    const s = byDay.get(dayKey(v.created_at));
    if (s) s.count++;
  }
  const max = Math.max(1, ...series.map((s) => s.count));

  return (
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
      {isLoading && <p className="mt-3 text-xs text-muted-foreground">Loading…</p>}
    </div>
  );
}

function TopLists({ views }: { views: Pageview[] }) {
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

  return (
    <>
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
            {rows.length === 0 && <p className="py-3 text-sm text-muted-foreground">No data yet.</p>}
          </div>
        </div>
      ))}
    </>
  );
}
