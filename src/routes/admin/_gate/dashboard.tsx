import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, Images, Plus, Sparkles, UploadCloud, User, Users } from "lucide-react";
import { queries } from "@/lib/cms";
import { PageHeader } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/_gate/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const experiences = useQuery(queries.experiences);
  const projects = useQuery(queries.projects);
  const ambassadors = useQuery(queries.ambassadors);
  const media = useQuery(queries.media);

  const events = (experiences.data ?? []).filter((e) => e.category === "Event");
  const stats = [
    ["Experience entries", (experiences.data?.length ?? 0) - events.length, Briefcase],
    ["Events", events.length, Sparkles],
    ["Projects", projects.data?.length ?? 0, Sparkles],
    ["Ambassador roles", ambassadors.data?.length ?? 0, Users],
    ["Media files", media.data?.length ?? 0, Images],
  ] as const;

  const recent = [...(experiences.data ?? []), ...(projects.data ?? [])]
    .sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1))
    .slice(0, 5);

  return (
    <>
      <PageHeader
        title="Welcome back, Ariful."
        description="Everything on the public site is managed from here."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(([label, value, Icon]) => (
          <div key={label} className="rounded-2xl border border-border bg-surface-2/50 p-5">
            <div className="flex items-center justify-between">
              <p className="label-mono text-muted-foreground">{label}</p>
              <Icon className="h-4 w-4 text-[color:var(--accent)]" />
            </div>
            <p className="font-display mt-4 text-3xl font-bold">
              {String(value).padStart(2, "0")}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-border bg-surface-2/50 p-6">
          <p className="label-mono text-muted-foreground">Recent updates</p>
          <div className="mt-4 divide-y divide-border">
            {recent.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-4 py-3">
                <p className="truncate text-sm">
                  {"title" in r ? r.title : r.name}
                </p>
                <p className="label-mono shrink-0 text-muted-foreground">
                  {new Date(r.updated_at).toLocaleDateString()}
                </p>
              </div>
            ))}
            {recent.length === 0 && (
              <p className="py-3 text-sm text-muted-foreground">No content yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface-2/50 p-6">
          <p className="label-mono text-muted-foreground">Quick actions</p>
          <div className="mt-4 grid gap-2">
            <Button asChild variant="outline" className="justify-start">
              <Link to="/admin/experience">
                <Plus className="h-4 w-4" /> Add experience
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link to="/admin/projects">
                <Plus className="h-4 w-4" /> Add project
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link to="/admin/media">
                <UploadCloud className="h-4 w-4" /> Upload photo
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link to="/admin/profile">
                <User className="h-4 w-4" /> Edit profile
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
