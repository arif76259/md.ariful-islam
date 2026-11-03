import { ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Reveal, Section, SectionLabel } from "./Reveal";
import type { Tables } from "@/integrations/supabase/types";

type Article = Tables<"articles">;

export function InsightsSection({ items }: { items: Article[] }) {
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
            <Link
              to="/work/$slug"
              params={{ slug: a.slug ?? "" }}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface-2/50 transition-colors hover:border-[color:var(--accent)]/45"
            >
              {a.cover_url && (
                <img
                  src={a.cover_url}
                  alt={a.title}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover"
                />
              )}
              <div className="flex flex-1 flex-col p-6">
                <p className="label-mono text-[color:var(--accent)]">{a.category}</p>
                <h3 className="font-display mt-3 text-xl font-bold">{a.title}</h3>
                <p className="mt-3 flex-1 text-sm text-muted-foreground">{a.summary}</p>
                <span className="label-mono mt-5 flex items-center gap-1 text-muted-foreground transition-colors group-hover:text-foreground">
                  Read full story <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
