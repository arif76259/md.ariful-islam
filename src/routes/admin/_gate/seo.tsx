import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { queries, type SiteSettings } from "@/lib/cms";
import { PageHeader } from "@/components/admin/AdminShell";
import { ImageField } from "@/components/admin/ImageField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/_gate/seo")({
  component: SeoAdmin,
});

function SeoAdmin() {
  const queryClient = useQueryClient();
  const { data } = useQuery(queries.settings);
  const [form, setForm] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (data) setForm(data as unknown as Record<string, unknown>);
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!data) return;
      if (!form.seo_title?.trim()) throw new Error("Page title is required");
      const { error } = await supabase
        .from("site_settings")
        .update({
          seo_title: form.seo_title,
          seo_description: form.seo_description,
          og_title: form.og_title,
          og_description: form.og_description,
          og_image: form.og_image,
          keywords: form.keywords,
        })
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site_settings"] });
      toast.success("SEO settings published");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!data) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <>
      <PageHeader
        title="SEO"
        description="How the site appears in search results and when shared."
        action={
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
          </Button>
        }
      />

      <div className="grid max-w-3xl gap-6 rounded-2xl border border-border bg-surface-2/50 p-6">
        <div className="space-y-2">
          <Label>Page title</Label>
          <Input
            maxLength={70}
            value={form.seo_title ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, seo_title: e.target.value }))}
          />
          <p className="text-xs text-muted-foreground">{(form.seo_title ?? "").length} / 70</p>
        </div>
        <div className="space-y-2">
          <Label>Meta description</Label>
          <Textarea
            rows={3}
            maxLength={160}
            value={form.seo_description ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, seo_description: e.target.value }))}
          />
          <p className="text-xs text-muted-foreground">
            {(form.seo_description ?? "").length} / 160
          </p>
        </div>
        <div className="space-y-2">
          <Label>Social share title</Label>
          <Input
            maxLength={70}
            value={form.og_title ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, og_title: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Social share description</Label>
          <Textarea
            rows={3}
            maxLength={200}
            value={form.og_description ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, og_description: e.target.value }))}
          />
        </div>
        <ImageField
          label="Social share image (1200 × 630 recommended)"
          value={form.og_image ?? null}
          onChange={(v) => setForm((s) => ({ ...s, og_image: v }))}
        />
        <div className="space-y-2">
          <Label>Keywords</Label>
          <Input
            maxLength={300}
            value={form.keywords ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, keywords: e.target.value }))}
          />
          <p className="text-xs text-muted-foreground">Comma separated.</p>
        </div>
      </div>
    </>
  );
}
