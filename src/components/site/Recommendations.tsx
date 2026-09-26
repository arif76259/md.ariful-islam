import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Linkedin, Loader2, MessageSquareQuote, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Reveal, Section, SectionLabel } from "./Reveal";
import type { Recommendation } from "@/lib/cms";

const schema = z.object({
  author_name: z.string().trim().min(2, "Please enter your name").max(80),
  author_title: z.string().trim().max(120).optional().or(z.literal("")),
  author_organization: z.string().trim().max(120).optional().or(z.literal("")),
  relationship: z.string().trim().max(60).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Please write at least a sentence")
    .max(1200, "Please keep it under 1200 characters"),
  author_linkedin_url: z
    .string()
    .trim()
    .url("Enter a valid link")
    .max(300)
    .optional()
    .or(z.literal("")),
});

const EMPTY = {
  author_name: "",
  author_title: "",
  author_organization: "",
  relationship: "",
  message: "",
  author_linkedin_url: "",
};

function SubmitDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const queryClient = useQueryClient();

  const submit = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Please check the form");
      const v = parsed.data;
      const { error } = await supabase.from("recommendations").insert({
        author_name: v.author_name,
        author_title: v.author_title ?? "",
        author_organization: v.author_organization ?? "",
        relationship: v.relationship ?? "",
        message: v.message,
        author_linkedin_url: v.author_linkedin_url ? v.author_linkedin_url : null,
        status: "pending",
        featured: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Thank you! Your message will appear after review.");
      setForm({ ...EMPTY });
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["recommendations_public"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = (key: keyof typeof EMPTY) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <MessageSquareQuote className="h-4 w-4" />
          Leave a Recommendation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Leave a recommendation</DialogTitle>
          <DialogDescription>
            Share a few words about working with me. Submissions are reviewed before they appear on
            this site.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rec-name">Your name *</Label>
            <Input
              id="rec-name"
              maxLength={80}
              value={form.author_name}
              onChange={(e) => set("author_name")(e.target.value)}
              placeholder="Full name"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rec-title">Your role</Label>
              <Input
                id="rec-title"
                maxLength={120}
                value={form.author_title}
                onChange={(e) => set("author_title")(e.target.value)}
                placeholder="e.g. Faculty Advisor"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rec-org">Organization</Label>
              <Input
                id="rec-org"
                maxLength={120}
                value={form.author_organization}
                onChange={(e) => set("author_organization")(e.target.value)}
                placeholder="e.g. AIBA Business Club"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rec-rel">How do you know me?</Label>
            <Input
              id="rec-rel"
              maxLength={60}
              value={form.relationship}
              onChange={(e) => set("relationship")(e.target.value)}
              placeholder="Mentor, teammate, co-organizer…"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rec-msg">Your recommendation *</Label>
            <Textarea
              id="rec-msg"
              rows={5}
              maxLength={1200}
              value={form.message}
              onChange={(e) => set("message")(e.target.value)}
              placeholder="Write your feedback or recommendation…"
            />
            <p className="label-mono text-muted-foreground">{form.message.length}/1200</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rec-li">LinkedIn profile (optional)</Label>
            <Input
              id="rec-li"
              maxLength={300}
              value={form.author_linkedin_url}
              onChange={(e) => set("author_linkedin_url")(e.target.value)}
              placeholder="https://www.linkedin.com/in/…"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => submit.mutate()} disabled={submit.isPending}>
            {submit.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RecommendationsSection({ items }: { items: Recommendation[] }) {
  return (
    <Section id="recommendations">
      <Reveal>
        <SectionLabel index="09">Recommendations</SectionLabel>
        <h2 className="font-display mt-6 max-w-3xl text-[clamp(2rem,4.5vw,3.4rem)] leading-tight font-bold">
          Words from people I have <span className="text-gradient">worked with</span>.
        </h2>
        <p className="mt-6 max-w-2xl text-muted-foreground">
          Mentors, teammates and co-organizers are welcome to share their experience of working with
          me. Every message is reviewed before it is published here.
        </p>
      </Reveal>

      {items.length > 0 && (
        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((r, i) => (
            <Reveal key={r.id} delay={i * 0.05}>
              <figure className="flex h-full flex-col rounded-3xl border border-border bg-surface-2/50 p-7">
                <Quote className="h-5 w-5 text-[color:var(--accent)]" />
                <blockquote className="mt-5 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {r.message}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-border/60 pt-5">
                  {r.author_avatar_url ? (
                    <img
                      src={r.author_avatar_url}
                      alt={r.author_name}
                      loading="lazy"
                      className="h-10 w-10 rounded-full border border-border object-cover"
                    />
                  ) : (
                    <span className="grid h-10 w-10 place-items-center rounded-full border border-border bg-surface-3 font-display text-xs font-bold text-[color:var(--accent)]">
                      {r.author_name
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join("")}
                    </span>
                  )}
                  <div className="min-w-0 leading-tight">
                    <p className="truncate text-sm font-medium">{r.author_name}</p>
                    <p className="label-mono truncate text-muted-foreground">
                      {[r.author_title, r.author_organization].filter(Boolean).join(" · ") ||
                        r.relationship}
                    </p>
                  </div>
                  {r.author_linkedin_url && (
                    <a
                      href={r.author_linkedin_url}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={`${r.author_name} on LinkedIn`}
                      className="ml-auto text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      )}

      <Reveal>
        <div className="mt-12 flex flex-wrap items-center gap-4">
          <SubmitDialog />
          <p className="text-sm text-muted-foreground">
            Your message stays private until it is approved.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
