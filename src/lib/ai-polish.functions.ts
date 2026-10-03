import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({
  kind: z.enum(["project", "experience", "case_study"]),
  notes: z.string().min(1).max(6000),
  title: z.string().max(200).nullable().optional(),
  summary: z.string().max(400).nullable().optional(),
  description: z.string().max(20000).nullable().optional(),
});

export type PolishInput = z.infer<typeof inputSchema>;

export const polishEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { polishPortfolioEntry } = await import("@/lib/ai/gateway.server");
    return polishPortfolioEntry(data.kind, data.notes, {
      title: data.title ?? null,
      summary: data.summary ?? null,
      description: data.description ?? null,
    });
  });
