// Server-only AI Gateway helpers (Lovable AI). Never import from client code.
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output, type ModelMessage, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createLovableAiGatewayRunIdFetch } from "./run-id.server";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";

function createResponsesProvider(runId?: string) {
  const apiKey = process.env["LOVABLE_API_KEY"]!;
  const runIdFetch = createLovableAiGatewayRunIdFetch(runId);
  const provider = createOpenAI({
    baseURL: `${GATEWAY_URL.replace(/\/+$/, "").replace(/\/v1$/, "")}/v1`,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  return { provider, runIdFetch };
}

const polishedSchema = z.strictObject({
  title: z.string(),
  summary: z.string(),
  description: z.string(),
});

export type PolishKind = "project" | "experience" | "case_study";

const KIND_INSTRUCTIONS: Record<PolishKind, string> = {
  project:
    "Write it as a project entry. The summary is one crisp one-liner (max 90 characters). The description is 1-2 short paragraphs, factual and concrete.",
  experience:
    "Write it as a work experience / role entry. The summary is one crisp one-liner (max 90 characters). The description is 1-2 short paragraphs focused on responsibility, coordination and outcomes already in the notes.",
  case_study:
    "Write it as a case study entry. The summary is one crisp one-liner (max 90 characters). The description is 2-4 short paragraphs telling what was organized, decisions made and what it resulted in.",
};

function buildMessages(kind: PolishKind, notes: string, current?: { title?: string | null; summary?: string | null; description?: string | null }): ModelMessage[] {
  const contextLines: string[] = [];
  if (current?.title) contextLines.push(`Current title: ${current.title}`);
  if (current?.summary) contextLines.push(`Current summary: ${current.summary}`);
  if (current?.description) contextLines.push(`Current description: ${current.description}`);
  return [
    {
      role: "system",
      content: [
        "You turn rough notes into a polished portfolio entry for a personal portfolio website.",
        "The owner is a BBA student and student leader; entries must stay credible student experience, never corporate or invented.",
        `Entry type: ${kind}.`,
        KIND_INSTRUCTIONS[kind],
        "CRITICAL rules: preserve every fact exactly — names, organizations, numbers, dates, periods, metrics. Never invent achievements, statistics, company names or claims that are not in the notes. Never use first person. Write in clean, professional English. Do not add marketing fluff or superlatives.",
      ].join("\n"),
    },
    {
      role: "user",
      content: [
        "Rough notes from the owner:",
        '"""',
        notes,
        '"""',
        contextLines.length ? ["Existing entry (context only, do not invent facts):", ...contextLines].join("\n") : "",
      ]
        .filter(Boolean)
        .join("\n"),
    },
  ];
}

export async function polishPortfolioEntry(
  kind: PolishKind,
  notes: string,
  current?: { title?: string | null; summary?: string | null; description?: string | null },
): Promise<z.infer<typeof polishedSchema>> {
  const { provider } = createResponsesProvider();
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    messages: buildMessages(kind, notes, current),
    output: Output.object({ schema: polishedSchema }),
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
    const output = await result.output;
    return {
      title: output.title.trim(),
      summary: output.summary.trim(),
      description: output.description.trim(),
    };
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error) && typeof error.text === "string") {
      try {
        const parsed = JSON.parse(error.text) as Record<string, unknown>;
        const title = String(parsed["title"] ?? "").trim();
        const summary = String(parsed["summary"] ?? "").trim();
        const description = String(parsed["description"] ?? "").trim();
        if (title && description) return { title, summary, description };
      } catch {
        // fall through
      }
    }
    throw error instanceof Error ? error : new Error("AI polish failed");
  }
}
