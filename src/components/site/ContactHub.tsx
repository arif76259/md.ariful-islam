import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Check, Copy, Loader2, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Reveal, Section, SectionLabel } from "./Reveal";
import type { Profile, SocialLink } from "@/lib/cms";

const PURPOSES = [
  "Event Collaboration",
  "Club Sponsorship",
  "Project Idea",
  "Mentorship",
  "General",
] as const;

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  purpose: z.string().trim().min(1).max(60),
  message: z.string().trim().min(10, "Please write a short message").max(2000),
});

export function ContactHub({ profile, social }: { profile: Profile; social: SocialLink[] }) {
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    purpose: PURPOSES[0] as string,
    message: "",
  });
  // Simple bot trap: real people never fill a hidden field.
  const [honeypot, setHoneypot] = useState("");

  const phoneDigits = profile.phone.replace(/[^\d]/g, "");

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy the address");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (honeypot) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.from("contact_messages").insert({
        name: parsed.data.name,
        email: parsed.data.email,
        purpose: parsed.data.purpose,
        message: parsed.data.message,
      });
      if (error) throw error;
      toast.success("Message sent. I will get back to you soon.");
      setForm({ name: "", email: "", purpose: PURPOSES[0] as string, message: "" });
    } catch {
      toast.error("Could not send the message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Section id="contact" className="atmos">
      <Reveal>
        <SectionLabel index="10">Contact</SectionLabel>
        <h2 className="font-display mt-6 max-w-4xl text-[clamp(2.2rem,6vw,4.5rem)] leading-[1.02] font-bold">
          Let&apos;s build something <span className="text-gradient">worth organizing</span>.
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <div className="flex h-full flex-col gap-4">
            <button
              type="button"
              onClick={copyEmail}
              className="group rounded-2xl border border-border bg-surface-2/50 p-6 text-left transition-colors hover:border-[color:var(--accent)]/45"
            >
              <div className="flex items-center justify-between">
                <Mail className="h-5 w-5 text-[color:var(--accent)]" />
                {copied ? (
                  <span className="label-mono flex items-center gap-1 text-[color:var(--accent)]">
                    <Check className="h-3.5 w-3.5" /> Copied
                  </span>
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </div>
              <p className="label-mono mt-4 text-muted-foreground">Email — click to copy</p>
              <p className="mt-2 text-sm break-words">{profile.email}</p>
            </button>

            <div className="rounded-2xl border border-border bg-surface-2/50 p-6">
              <Phone className="h-5 w-5 text-[color:var(--accent)]" />
              <p className="label-mono mt-4 text-muted-foreground">Phone & WhatsApp</p>
              <p className="mt-2 text-sm">{profile.phone}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <a href={`tel:+${phoneDigits}`}>Call</a>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a
                    href={`https://wa.me/${phoneDigits}`}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Chat on WhatsApp
                  </a>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface-2/50 p-6">
              <MapPin className="h-5 w-5 text-[color:var(--accent)]" />
              <p className="label-mono mt-4 text-muted-foreground">Location</p>
              <p className="mt-2 text-sm">{profile.location}</p>
            </div>

            {social.length > 0 && (
              <div className="rounded-2xl border border-border bg-surface-2/50 p-6">
                <p className="label-mono text-muted-foreground">Connect with me</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {social.map((s) => (
                    <Button key={s.id} asChild variant="outline" size="sm" className="justify-start">
                      <a href={s.url} target="_blank" rel="noreferrer noopener">
                        {s.label}
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <p className="label-mono flex items-center gap-2 text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-[color:var(--accent)]" />
              Usually responds within 24 hours
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <form
            onSubmit={submit}
            className="accent-ring h-full rounded-3xl border border-border bg-surface-2/50 p-7"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="c-name">Your name</Label>
                <Input
                  id="c-name"
                  value={form.name}
                  maxLength={100}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-email">Your email</Label>
                <Input
                  id="c-email"
                  type="email"
                  value={form.email}
                  maxLength={255}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <Label htmlFor="c-purpose">Purpose</Label>
              <select
                id="c-purpose"
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                className="h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-[color:var(--accent)]/40"
              >
                {PURPOSES.map((p) => (
                  <option key={p} value={p} className="bg-background">
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5 space-y-2">
              <Label htmlFor="c-message">Message</Label>
              <Textarea
                id="c-message"
                rows={6}
                value={form.message}
                maxLength={2000}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tell me a little about what you have in mind…"
                required
              />
            </div>

            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
            />

            <Button type="submit" className="mt-6 w-full sm:w-auto" disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send Message
            </Button>
          </form>
        </Reveal>
      </div>
    </Section>
  );
}
