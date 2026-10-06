// Server-only: answers visitor questions strictly from published portfolio data.
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import { createLovableAiGatewayRunIdFetch } from "./run-id.server";

export type QaTurn = { role: "user" | "assistant"; content: string };

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient(url, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

const strip = (rows: unknown[] | null) =>
  (rows ?? []).map((r) => {
    const o = { ...(r as Record<string, unknown>) };
    for (const k of ["id", "created_at", "updated_at", "sort_order", "cover_url", "image_url", "photo_url", "logo_url", "gallery", "og_image"]) delete o[k];
    for (const k of Object.keys(o)) if (o[k] === null || o[k] === "") delete o[k];
    return o;
  });

async function loadContext() {
  const sb = publicClient();
  const t = (name: string) => sb.from(name as never).select("*");
  const [profile, education, experiences, ambassadors, projects, skills, community, articles] = await Promise.all([
    t("profile").limit(1),
    t("education"),
    t("experiences"),
    t("ambassadors"),
    t("projects"),
    t("skills"),
    t("community_impacts"),
    sb.from("articles").select("title, summary, body").eq("published", true),
  ]);
  return JSON.stringify({
    profile: strip(profile.data as unknown[]),
    education: strip(education.data as unknown[]),
    experiences: strip(experiences.data as unknown[]),
    ambassador_roles: strip(ambassadors.data as unknown[]),
    projects: strip(projects.data as unknown[]),
    skills: strip(skills.data as unknown[]),
    community_impact: strip(community.data as unknown[]),
    case_studies: strip(articles.data as unknown[]),
  });
}

export async function answerPortfolioQuestion(history: QaTurn[]) {
  const context = await loadContext();
  const apiKey = process.env["LOVABLE_API_KEY"]!;
  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  const messages: ModelMessage[] = [
    {
      role: "system",
      content: [
        "You are the portfolio assistant on Md. Ariful Islam's personal website. Answer visitor questions about his education, experience, events, ambassador roles, projects, skills and community work.",
        "Use ONLY the published portfolio data below. If the answer is not in the data, say you don't have that information and suggest using the Contact section. Never invent facts, numbers, dates, employers or achievements. Present student experience honestly; do not inflate it into corporate experience. Project statuses must match the data exactly.",
        "Refer to him in third person. Reply in the visitor's language (Bengali or English). Keep answers concise: at most ~120 words, plain text, short lists allowed. Politely decline unrelated requests.",
        "PORTFOLIO DATA (JSON):",
        context,
      ].join("\n"),
    },
    ...history.map((m) => ({ role: m.role, content: m.content }) as ModelMessage),
  ];
  let lastError: unknown;
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    onError: ({ error }) => { lastError = error; },
    messages,
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  try {
    return (await result.text).trim();
  } catch (e) {
    console.error("qa stream error", lastError);
    throw lastError ?? e;
  }
}
