import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(1000) }))
    .min(1)
    .max(12),
});

// Simple per-instance throttle to protect AI credits from abuse.
const hits: number[] = [];

export const askPortfolio = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data }) => {
    const now = Date.now();
    while (hits.length && now - hits[0]! > 60_000) hits.shift();
    if (hits.length >= 20) return { ok: false as const, error: "Too many questions right now. Please try again in a minute." };
    hits.push(now);
    try {
      const { answerPortfolioQuestion } = await import("./ai/qa.server");
      const answer = await answerPortfolioQuestion(data.messages);
      if (!answer) return { ok: false as const, error: "No answer could be generated for that question." };
      return { ok: true as const, answer };
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      if (status === 429) return { ok: false as const, error: "The assistant is busy. Please try again shortly." };
      if (status === 402 || status === 403) return { ok: false as const, error: "The assistant is temporarily unavailable." };
      console.error("askPortfolio failed", e);
      return { ok: false as const, error: "Something went wrong. Please try again." };
    }
  });
