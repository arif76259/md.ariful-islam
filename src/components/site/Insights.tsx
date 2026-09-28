import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Reveal, Section, SectionLabel } from "./Reveal";
import type { Tables } from "@/integrations/supabase/types";

type Article = Tables<"articles">;

export function InsightsSection({ items }: { items: Article[] }) {
  const [open, setOpen] = useState<Article | null>(null);
  if (items.length === 0) return null;
  return (
    <Section id="insights">
      <Reveal>
        <SectionLabel index="—">Case Studies & Insights</SectionLabel>
        <h2 className="font-display mt-6 max-w-3xl text-[clamp(2rem,5vw,3.8rem)] leading-[1.04] font-bold">
          Behind the <span className="text-gradient">work</span>.
        </h2>
      </Reveal>
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((a, i) => (
          <Reveal key={a.id} delay={i * 0.05}>
            <button
              type="button"
              onClick={() => setOpen(a)}
              className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-surface-2/50 text-left transition-colors hover:border-[color:var(--accent)]/45"
            >
              {a.cover_url && (
                <img src={a.cover_url} alt={a.title} loading="lazy" className="aspect-[16/10] w-full object-cover" />
              )}
              <div className="flex flex-1 flex-col p-6">
                <p className="label-mono text-[color:var(--accent)]">{a.category}</p>
                <h3 className="font-display mt-3 text-xl font-bold">{a.title}</h3>
                <p className="mt-3 flex-1 text-sm text-muted-foreground">{a.summary}</p>
                <span className="label-mono mt-5 flex items-center gap-1 text-muted-foreground group-hover:text-foreground">
                  Read <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>
          </Reveal>
        ))}
      </div>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
          {open && (
            <article>
              {open.cover_url && (
                <img src={open.cover_url} alt={open.title} className="mb-6 aspect-[16/9] w-full rounded-xl object-cover" />
              )}
              <p className="label-mono text-[color:var(--accent)]">{open.category}</p>
              <DialogTitle className="font-display mt-2 text-3xl font-bold">{open.title}</DialogTitle>
              <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground">
                {open.body.split(/\n\s*\n/).map((p, i) => (
                  <p key={i} className="whitespace-pre-line">{p}</p>
                ))}
              </div>
              {open.gallery.length > 0 && (
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {open.gallery.map((g) => (
                    <img key={g} src={g} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-lg object-cover" />
                  ))}
                </div>
              )}
            </article>
          )}
        </DialogContent>
      </Dialog>
    </Section>
  );
}
