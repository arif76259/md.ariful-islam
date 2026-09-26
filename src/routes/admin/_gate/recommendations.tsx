import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Linkedin, Loader2, Plus, Star, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Recommendation } from "@/lib/cms";

export const Route = createFileRoute("/admin/_gate/recommendations")({
  component: RecommendationsAdmin,
});

type Tab = "pending" | "approved" | "all";

const EMPTY = {
  author_name: "",
  author_title: "",
  author_organization: "",
  relationship: "",
  message: "",
  author_linkedin_url: "",
};

function RecommendationsAdmin() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("pending");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [deleting, setDeleting] = useState<Recommendation | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["recommendations_admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recommendations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Recommendation[];
    },
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["recommendations_admin"] });
    void queryClient.invalidateQueries({ queryKey: ["recommendations_public"] });
  };

  const rows = useMemo(
    () => (data ?? []).filter((r) => (tab === "all" ? true : r.status === tab)),
    [data, tab],
  );
  const pendingCount = (data ?? []).filter((r) => r.status === "pending").length;

  const patch = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<Recommendation> }) => {
      const { error } = await supabase.from("recommendations").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (row: Recommendation) => {
      const { error } = await supabase.from("recommendations").delete().eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      setDeleting(null);
      toast.success("Deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const create = useMutation({
    mutationFn: async () => {
      if (form.author_name.trim().length < 2) throw new Error("Name is required");
      if (form.message.trim().length < 10) throw new Error("Write at least a sentence");
      const { error } = await supabase.from("recommendations").insert({
        author_name: form.author_name.trim(),
        author_title: form.author_title.trim(),
        author_organization: form.author_organization.trim(),
        relationship: form.relationship.trim(),
        message: form.message.trim(),
        author_linkedin_url: form.author_linkedin_url.trim() || null,
        status: "approved",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      setAdding(false);
      setForm({ ...EMPTY });
      toast.success("Added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = (key: keyof typeof EMPTY) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <>
      <PageHeader
        title="Recommendations"
        description="Review feedback submitted by visitors, then approve what appears on your site."
        action={
          <Button onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" />
            Add recommendation
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {(["pending", "approved", "all"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg border px-3 py-1.5 text-sm capitalize transition-colors ${
              tab === t
                ? "border-border bg-sidebar-accent text-foreground"
                : "border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
            {t === "pending" && pendingCount > 0 && (
              <span className="ml-2 rounded-full bg-[color:var(--accent)] px-2 py-0.5 text-[10px] font-bold text-background">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading
        </div>
      ) : rows.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface-2/40 p-8 text-sm text-muted-foreground">
          Nothing here yet.
        </p>
      ) : (
        <div className="grid gap-4">
          {rows.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-surface-2/40 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    {r.author_name}
                    {r.featured && <Star className="h-3.5 w-3.5 text-[color:var(--accent)]" />}
                    {r.author_linkedin_url && (
                      <a href={r.author_linkedin_url} target="_blank" rel="noreferrer noopener">
                        <Linkedin className="h-3.5 w-3.5 text-muted-foreground" />
                      </a>
                    )}
                  </p>
                  <p className="label-mono text-muted-foreground">
                    {[r.author_title, r.author_organization, r.relationship]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <span
                  className={`label-mono rounded-full border px-2.5 py-1 ${
                    r.status === "approved"
                      ? "border-[color:var(--accent)]/40 text-[color:var(--accent)]"
                      : r.status === "rejected"
                        ? "border-border text-muted-foreground line-through"
                        : "border-border text-muted-foreground"
                  }`}
                >
                  {r.status}
                </span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{r.message}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {r.status !== "approved" && (
                  <Button
                    size="sm"
                    onClick={() => patch.mutate({ id: r.id, values: { status: "approved" } })}
                  >
                    <Check className="h-4 w-4" /> Approve
                  </Button>
                )}
                {r.status !== "rejected" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => patch.mutate({ id: r.id, values: { status: "rejected" } })}
                  >
                    <X className="h-4 w-4" /> Reject
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => patch.mutate({ id: r.id, values: { featured: !r.featured } })}
                >
                  <Star className="h-4 w-4" /> {r.featured ? "Unfeature" : "Feature"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setDeleting(r)}>
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add recommendation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="a-name">Name *</Label>
              <Input
                id="a-name"
                maxLength={80}
                value={form.author_name}
                onChange={(e) => set("author_name")(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="a-title">Role</Label>
                <Input
                  id="a-title"
                  maxLength={120}
                  value={form.author_title}
                  onChange={(e) => set("author_title")(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="a-org">Organization</Label>
                <Input
                  id="a-org"
                  maxLength={120}
                  value={form.author_organization}
                  onChange={(e) => set("author_organization")(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="a-rel">Relationship</Label>
              <Input
                id="a-rel"
                maxLength={60}
                value={form.relationship}
                onChange={(e) => set("relationship")(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="a-msg">Message *</Label>
              <Textarea
                id="a-msg"
                rows={5}
                maxLength={1200}
                value={form.message}
                onChange={(e) => set("message")(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="a-li">LinkedIn</Label>
              <Input
                id="a-li"
                maxLength={300}
                value={form.author_linkedin_url}
                onChange={(e) => set("author_linkedin_url")(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button onClick={() => create.mutate()} disabled={create.isPending}>
              {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this recommendation?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleting && remove.mutate(deleting)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
