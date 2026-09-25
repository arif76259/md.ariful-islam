import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { queries, type Profile } from "@/lib/cms";
import { PageHeader } from "@/components/admin/AdminShell";
import { ImageField } from "@/components/admin/ImageField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Loose = { [K in keyof Profile]?: Profile[K] | undefined };

export const Route = createFileRoute("/admin/_gate/profile")({
  component: ProfileAdmin,
});

const TEXT_FIELDS: Array<[keyof Profile, string, number]> = [
  ["name", "Full name", 120],
  ["headline", "Short title", 160],
  ["email", "Email", 255],
  ["phone", "Phone", 40],
  ["location", "Location", 120],
  ["education", "Education", 200],
  ["current_role_title", "Current role", 200],
  ["focus", "Focus", 200],
  ["linkedin", "LinkedIn URL", 300],
];

function ProfileAdmin() {
  const queryClient = useQueryClient();
  const { data } = useQuery(queries.profile);
  const [form, setForm] = useState<Loose>({});

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!data) return;
      const { id, created_at, updated_at, ...payload } = { ...data, ...form };
      void id;
      void created_at;
      void updated_at;
      const { error } = await supabase
        .from("profile")
        .update(payload as never)
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile published");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  if (!data) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <>
      <PageHeader
        title="Profile"
        description="Your identity, contact details and hero content."
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <a href="/" target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" /> Preview
              </a>
            </Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6 rounded-2xl border border-border bg-surface-2/50 p-6">
          <ImageField
            label="Profile photo"
            aspect="aspect-square"
            value={form.photo_url ?? null}
            onChange={(v) => set("photo_url", v)}
          />
          <ImageField
            label="Site logo (shown in the header instead of initials)"
            aspect="aspect-square"
            value={form.logo_url ?? null}
            onChange={(v) => set("logo_url", v)}
          />
          <div className="space-y-2">
            <Label>Custom initials (used when no logo is uploaded)</Label>
            <Input
              maxLength={4}
              placeholder="e.g. MAI"
              value={form.monogram ?? ""}
              onChange={(e) => set("monogram", e.target.value)}
            />
          </div>

          {TEXT_FIELDS.map(([key, label, max]) => (
            <div key={String(key)} className="space-y-2">
              <Label>{label}</Label>
              <Input
                maxLength={max}
                value={(form[key] as string) ?? ""}
                onChange={(e) => set(key, e.target.value as Profile[typeof key])}
              />
            </div>
          ))}
        </div>

        <div className="space-y-6 rounded-2xl border border-border bg-surface-2/50 p-6">
          <div className="space-y-2">
            <Label>Hero statement</Label>
            <Textarea
              rows={4}
              maxLength={400}
              value={form.statement ?? ""}
              onChange={(e) => set("statement", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              rows={14}
              maxLength={3000}
              value={form.bio ?? ""}
              onChange={(e) => set("bio", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {(form.bio ?? "").length} / 3000 characters
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
