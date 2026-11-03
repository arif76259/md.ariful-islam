import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { Ambassador, Experience, Project } from "@/lib/cms";

export type Article = Tables<"articles">;

export type WorkKind = "role" | "event" | "ambassador" | "project" | "article";

export type WorkLink = { label: string; href: string };

export type WorkNeighbor = { slug: string; title: string };

export type WorkDetail = {
  kind: WorkKind;
  kindLabel: string;
  backHref: string;
  backLabel: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category: string | null;
  metaLabel: string | null;
  metaValue: string | null;
  paragraphs: string[];
  bulletsLabel: string | null;
  bullets: string[];
  tags: string[];
  cover: string | null;
  gallery: string[];
  links: WorkLink[];
  prev: WorkNeighbor | null;
  next: WorkNeighbor | null;
};

const LIST_COLS: Record<string, string> = {
  experiences: "slug, title",
  ambassadors: "slug, brand",
  projects: "slug, name",
  articles: "slug, title",
};

function paragraphsOf(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

async function neighbors(
  table: keyof typeof LIST_COLS,
  slug: string,
  category: { eq?: string; neq?: string } = {},
): Promise<{ prev: WorkNeighbor | null; next: WorkNeighbor | null }> {
  let q = supabase
    .from(table as never)
    .select(LIST_COLS[table] as never)
    .order("sort_order", { ascending: true });
  if (table === "articles") q = q.eq("published", true) as never;
  if (category.eq) q = q.eq("category", category.eq) as never;
  if (category.neq) q = q.neq("category", category.neq) as never;
  const { data, error } = await q;
  if (error) throw error;
  const list = (data ?? []) as unknown as Array<Record<string, unknown>>;
  const idx = list.findIndex((r) => String(r["slug"] ?? "") === slug);
  if (idx === -1) return { prev: null, next: null };
  const toNeighbor = (r: Record<string, unknown> | undefined): WorkNeighbor | null => {
    if (!r) return null;
    return {
      slug: String(r["slug"] ?? ""),
      title: String(r["title"] ?? r["brand"] ?? r["name"] ?? "Untitled"),
    };
  };
  return {
    prev: idx > 0 ? toNeighbor(list[idx - 1]) : null,
    next: idx < list.length - 1 ? toNeighbor(list[idx + 1]) : null,
  };
}

function experienceDetail(e: Experience, next: WorkNeighbor | null, prev: WorkNeighbor | null): WorkDetail {
  const isEvent = e.category === "Event";
  const period = [e.start_date, e.is_current ? "Present" : e.end_date]
    .filter(Boolean)
    .join(" – ");
  return {
    kind: isEvent ? "event" : "role",
    kindLabel: isEvent ? "Event" : "Experience",
    backHref: isEvent ? "/#events" : "/#experience",
    backLabel: isEvent ? "All events" : "All work & roles",
    slug: e.slug ?? "",
    title: e.title,
    subtitle: e.organization || null,
    category: e.category || null,
    metaLabel: period ? "Timeline" : null,
    metaValue: period || null,
    paragraphs: e.description ? [e.description] : [],
    bulletsLabel: e.responsibilities.length > 0 ? "Responsibilities" : null,
    bullets: e.responsibilities ?? [],
    tags: e.skills ?? [],
    cover: e.image_url,
    gallery: e.gallery ?? [],
    links: [],
    prev,
    next,
  };
}

function ambassadorDetail(a: Ambassador, next: WorkNeighbor | null, prev: WorkNeighbor | null): WorkDetail {
  return {
    kind: "ambassador",
    kindLabel: "Ambassador role",
    backHref: "/#ambassador",
    backLabel: "All ambassador roles",
    slug: a.slug ?? "",
    title: a.brand,
    subtitle: a.role_title || null,
    category: null,
    metaLabel: a.period ? "Period" : null,
    metaValue: a.period || null,
    paragraphs: a.description ? [a.description] : [],
    bulletsLabel: a.highlights.length > 0 ? "Highlights" : null,
    bullets: a.highlights ?? [],
    tags: [],
    cover: a.logo_url,
    gallery: a.gallery ?? [],
    links: [],
    prev,
    next,
  };
}

function projectDetail(p: Project, next: WorkNeighbor | null, prev: WorkNeighbor | null): WorkDetail {
  const links: WorkLink[] = [];
  if (p.external_link) links.push({ label: "Visit project", href: p.external_link });
  if (p.github_link) links.push({ label: "Repository", href: p.github_link });
  return {
    kind: "project",
    kindLabel: "Project",
    backHref: "/#projects",
    backLabel: "All projects",
    slug: p.slug ?? "",
    title: p.name,
    subtitle: p.tagline || null,
    category: p.category || null,
    metaLabel: p.status ? "Status" : null,
    metaValue: p.status || null,
    paragraphs: p.description ? [p.description] : [],
    bulletsLabel: p.features.length > 0 ? "Features" : null,
    bullets: p.features ?? [],
    tags: p.tools ?? [],
    cover: p.cover_url,
    gallery: p.gallery ?? [],
    links,
    prev,
    next,
  };
}

function articleDetail(a: Article, next: WorkNeighbor | null, prev: WorkNeighbor | null): WorkDetail {
  return {
    kind: "article",
    kindLabel: a.category || "Case study",
    backHref: "/#insights",
    backLabel: "All case studies & insights",
    slug: a.slug ?? "",
    title: a.title,
    subtitle: a.summary || null,
    category: a.category || null,
    metaLabel: null,
    metaValue: null,
    paragraphs: paragraphsOf(a.body),
    bulletsLabel: null,
    bullets: [],
    tags: [],
    cover: a.cover_url,
    gallery: a.gallery ?? [],
    links: [],
    prev,
    next,
  };
}

async function fetchWorkDetail(slug: string): Promise<WorkDetail | null> {
  const [expRes, ambRes, projRes, artRes] = await Promise.all([
    supabase.from("experiences").select("*").eq("slug", slug).limit(1),
    supabase.from("ambassadors").select("*").eq("slug", slug).limit(1),
    supabase.from("projects").select("*").eq("slug", slug).limit(1),
    supabase.from("articles").select("*").eq("slug", slug).eq("published", true).limit(1),
  ]);
  for (const r of [expRes, ambRes, projRes, artRes]) {
    if (r.error) throw r.error;
  }
  const exp = (expRes.data?.[0] as Experience | undefined) ?? null;
  const amb = (ambRes.data?.[0] as Ambassador | undefined) ?? null;
  const proj = (projRes.data?.[0] as Project | undefined) ?? null;
  const art = (artRes.data?.[0] as Article | undefined) ?? null;

  if (exp) {
    const cat = exp.category === "Event" ? { eq: "Event" } : { neq: "Event" };
    const { prev, next } = await neighbors("experiences", slug, cat);
    return experienceDetail(exp, next, prev);
  }
  if (amb) {
    const { prev, next } = await neighbors("ambassadors", slug);
    return ambassadorDetail(amb, next, prev);
  }
  if (proj) {
    const { prev, next } = await neighbors("projects", slug);
    return projectDetail(proj, next, prev);
  }
  if (art) {
    const { prev, next } = await neighbors("articles", slug);
    return articleDetail(art, next, prev);
  }
  return null;
}

export const workDetailQuery = (slug: string) =>
  queryOptions({
    queryKey: ["work", slug],
    queryFn: () => fetchWorkDetail(slug),
  });
