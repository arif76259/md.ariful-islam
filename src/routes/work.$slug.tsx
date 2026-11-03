import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, ErrorComponentProps, Link, notFound, useRouter } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/Sections";
import { PageviewTracker } from "@/components/site/PageviewTracker";
import { PortfolioAssistant } from "@/components/site/PortfolioAssistant";
import { queries } from "@/lib/cms";
import { workDetailQuery, type WorkDetail } from "@/lib/work";

export const Route = createFileRoute("/work/$slug")({
  loader: async ({ params, context }) => {
    const work = await context.queryClient.ensureQueryData(workDetailQuery(params.slug));
    if (!work) throw notFound();
    return work;
  },
  head: ({ loaderData }) => {
    const w = loaderData as WorkDetail | undefined;
    if (!w) {
      return { meta: [{ title: "Work | Md. Ariful Islam" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${w.title} | Md. Ariful Islam`;
    const desc =
      w.subtitle ??
      w.paragraphs[0]?.slice(0, 200) ??
      `Details about ${w.title} — work by Md. Ariful Islam.`;
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: w.cover ? "summary_large_image" : "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: desc },
    ];
    if (w.cover) {
      meta.push({ property: "og:image", content: w.cover });
      meta.push({ name: "twitter:image", content: w.cover });
    }
    return { meta };
  },
  component: WorkPage,
  errorComponent: WorkError,
  notFoundComponent: WorkNotFound,
});

function WorkError({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="text-center">
        <p className="label-mono text-muted-foreground">Something went wrong</p>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {error instanceof Error ? error.message : String(error)}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Retry
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function WorkNotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="label-mono text-muted-foreground">404</p>
        <h1 className="font-display mt-4 text-3xl font-bold">This work page doesn&apos;t exist</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The link may be outdated. Browse the work on the homepage instead.
        </p>
        <Button asChild className="mt-8">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}

function WorkPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(workDetailQuery(slug));
  const profile = useQuery(queries.profile);
  const social = useQuery(queries.social);
  if (!data) throw notFound();
  const w = data;
  const p = profile.data;

  const facts: Array<[string, string]> = [
    ["Type", w.kindLabel],
    ...(w.metaLabel && w.metaValue ? ([[w.metaLabel, w.metaValue]] as Array<[string, string]>) : []),
    ...(w.category ? ([["Category", w.category]] as Array<[string, string]>) : []),
  ];

  return (
    <div className="min-h-screen">
      <SiteNav
        name={p?.name ?? "Md. Ariful Islam"}
        role={p?.headline.split("•")[0]?.trim() || "Portfolio"}
        logoUrl={p?.logo_url ?? null}
        monogram={p?.monogram ?? "AI"}
      />

      <main className="px-6 pt-28 pb-24 lg:px-12">
        <article className="mx-auto w-full max-w-5xl">
          <Link
            to="/"
            className="label-mono inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {w.backLabel}
          </Link>

          <header className="mt-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="label-mono rounded-full border border-border px-3 py-1.5 text-[color:var(--accent)]">
                {w.kindLabel}
              </span>
              {w.category && (
                <span className="label-mono rounded-full border border-border px-3 py-1.5 text-muted-foreground">
                  {w.category}
                </span>
              )}
              {w.metaValue && (
                <span className="label-mono text-muted-foreground">{w.metaValue}</span>
              )}
            </div>
            <h1 className="font-display mt-5 text-[clamp(2.2rem,5.5vw,4rem)] leading-[1.05] font-bold">
              {w.title}
            </h1>
            {w.subtitle && <p className="mt-3 text-lg text-muted-foreground">{w.subtitle}</p>}
          </header>

          {w.cover && (
            <img
              src={w.cover}
              alt={w.title}
              className="accent-ring mt-10 aspect-[16/9] w-full rounded-3xl border border-border object-cover"
            />
          )}

          <div className="mt-12 grid gap-12 lg:grid-cols-[1.6fr_0.9fr]">
            <div>
              <div className="space-y-6">
                {w.paragraphs.map((para, i) => (
                  <p
                    key={i}
                    className="whitespace-pre-line text-lg leading-relaxed text-muted-foreground"
                  >
                    {para}
                  </p>
                ))}
              </div>

              {w.bullets.length > 0 && (
                <div className="mt-10">
                  <p className="label-mono text-[color:var(--accent)]">{w.bulletsLabel}</p>
                  <ul className="mt-4 space-y-3">
                    {w.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--accent)]" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {w.links.length > 0 && (
                <div className="mt-10 flex flex-wrap gap-3">
                  {w.links.map((l) => (
                    <Button asChild key={l.href} variant="outline">
                      <a href={l.href} target="_blank" rel="noreferrer">
                        {l.label} <ExternalLink className="ml-1 h-3.5 w-3.5" />
                      </a>
                    </Button>
                  ))}
                </div>
              )}
            </div>

            <aside className="space-y-5">
              <div className="rounded-3xl border border-border bg-surface-2/50 p-6">
                <p className="label-mono text-muted-foreground">Details</p>
                <dl className="mt-4 space-y-3">
                  {facts.map(([label, value]) => (
                    <div key={label} className="flex flex-wrap justify-between gap-2">
                      <dt className="text-xs text-muted-foreground">{label}</dt>
                      <dd className="text-right text-sm font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              {w.tags.length > 0 && (
                <div className="rounded-3xl border border-border bg-surface-2/50 p-6">
                  <p className="label-mono text-muted-foreground">Tags</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {w.tags.map((t) => (
                      <span
                        key={t}
                        className="label-mono rounded-full border border-border px-2.5 py-1 text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>

          {w.gallery.length > 0 && (
            <div className="mt-14">
              <p className="label-mono text-muted-foreground">Photo gallery</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {w.gallery.map((g, i) => (
                  <img
                    key={g + i}
                    src={g}
                    alt=""
                    loading="lazy"
                    className="aspect-[4/3] w-full rounded-2xl border border-border object-cover"
                  />
                ))}
              </div>
            </div>
          )}

          {(w.prev || w.next) && (
            <nav className="mt-16 grid gap-4 border-t border-border/60 pt-8 sm:grid-cols-2">
              {w.prev ? (
                <Link
                  to="/work/$slug"
                  params={{ slug: w.prev.slug }}
                  className="group rounded-2xl border border-border bg-surface-2/50 p-5 transition-colors hover:border-[color:var(--accent)]/45"
                >
                  <span className="label-mono flex items-center gap-1 text-muted-foreground transition-colors group-hover:text-foreground">
                    <ArrowLeft className="h-3.5 w-3.5" /> Previous
                  </span>
                  <p className="font-display mt-2 font-semibold">{w.prev.title}</p>
                </Link>
              ) : (
                <span />
              )}
              {w.next ? (
                <Link
                  to="/work/$slug"
                  params={{ slug: w.next.slug }}
                  className="group rounded-2xl border border-border bg-surface-2/50 p-5 text-right transition-colors hover:border-[color:var(--accent)]/45"
                >
                  <span className="label-mono flex items-center justify-end gap-1 text-muted-foreground transition-colors group-hover:text-foreground">
                    Next <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                  <p className="font-display mt-2 font-semibold">{w.next.title}</p>
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </article>
      </main>

      {p && <SiteFooter profile={p} social={social.data ?? []} />}

      <PageviewTracker />
      <PortfolioAssistant />
    </div>
  );
}
