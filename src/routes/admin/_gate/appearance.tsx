import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { queries, THEME_PRESETS, type SiteSettings } from "@/lib/cms";
import { PageHeader } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

type Loose = { [K in keyof SiteSettings]?: SiteSettings[K] | undefined };

export const Route = createFileRoute("/admin/_gate/appearance")({
  component: AppearanceAdmin,
});

function AppearanceAdmin() {
  const queryClient = useQueryClient();
  const { data } = useQuery(queries.settings);
  const [form, setForm] = useState<Loose>({});

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!data) return;
      const { error } = await supabase
        .from("site_settings")
        .update({
          theme_preset: form.theme_preset,
          primary_accent: form.primary_accent,
          secondary_accent: form.secondary_accent,
          background_tone: form.background_tone,
          border_intensity: form.border_intensity,
          gradient_intensity: form.gradient_intensity,
        } as never)
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site_settings"] });
      toast.success("Appearance published");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!data) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const colors: Array<["primary_accent" | "secondary_accent" | "background_tone", string]> = [
    ["primary_accent", "Primary accent"],
    ["secondary_accent", "Secondary accent"],
    ["background_tone", "Background tone"],
  ];

  return (
    <>
      <PageHeader
        title="Appearance"
        description="Colour grading for the public site. Changes apply everywhere once published."
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <a href="/" target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" /> Preview
              </a>
            </Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Publish
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8 rounded-2xl border border-border bg-surface-2/50 p-6">
          <div>
            <Label>Presets</Label>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(THEME_PRESETS).map(([name, preset]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setForm((s) => ({ ...s, theme_preset: name, ...preset }))}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
                    form.theme_preset === name
                      ? "border-[color:var(--accent)] text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${preset.primary_accent}, ${preset.secondary_accent})`,
                    }}
                  />
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {colors.map(([key, label]) => (
              <div key={String(key)} className="space-y-2">
                <Label>{label}</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="h-10 w-12 cursor-pointer rounded-md border border-border bg-transparent"
                    value={(form[key] as string) ?? "#000000"}
                    onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))}
                  />
                  <Input
                    value={(form[key] as string) ?? ""}
                    maxLength={9}
                    onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Border intensity — {form.border_intensity ?? 0}%</Label>
              <Slider
                value={[Number(form.border_intensity ?? 14)]}
                max={40}
                step={1}
                onValueChange={([v]) => setForm((s) => ({ ...s, border_intensity: v }))}
              />
            </div>
            <div className="space-y-3">
              <Label>Gradient intensity — {form.gradient_intensity ?? 0}%</Label>
              <Slider
                value={[Number(form.gradient_intensity ?? 60)]}
                max={100}
                step={1}
                onValueChange={([v]) => setForm((s) => ({ ...s, gradient_intensity: v }))}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border p-6" style={{ background: form.background_tone ?? undefined }}>
          <p className="label-mono text-muted-foreground">Live preview</p>
          <h3
            className="font-display mt-4 text-3xl font-bold"
            style={{
              backgroundImage: `linear-gradient(120deg, ${form.primary_accent}, ${form.secondary_accent})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Md. Ariful Islam
          </h3>
          <p className="mt-2 text-sm text-white/60">BBA Student • Student Leader</p>
          <div
            className="mt-6 rounded-xl p-4"
            style={{
              border: `1px solid rgba(255,255,255,${Number(form.border_intensity ?? 14) / 100})`,
              background: `linear-gradient(135deg, ${form.primary_accent}${Math.round(
                (Number(form.gradient_intensity ?? 60) / 100) * 40,
              )
                .toString(16)
                .padStart(2, "0")}, transparent)`,
            }}
          >
            <p className="text-sm text-white/80">Sample card with your current grading.</p>
          </div>
        </div>
      </div>
    </>
  );
}
