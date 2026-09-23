import { motion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  QrCode,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, Section, SectionLabel } from "./Reveal";
import type {
  Ambassador,
  CaseStep,
  CommunityImpact,
  Experience,
  Profile,
  Project,
  Skill,
  SocialLink,
} from "@/lib/cms";

/* ---------------------------------- Hero --------------------------------- */

export function Hero({ profile }: { profile: Profile }) {
  const [first, ...rest] = profile.name.split(" ");
  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join("");

  return (
    <section id="home" className="atmos relative min-h-screen px-6 pt-32 pb-20 lg:px-12">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[1.25fr_0.75fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="label-mono inline-flex items-center gap-2 rounded-full border border-border bg-surface-2/60 px-3 py-1.5 text-muted-foreground"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" />
            {profile.location || "Sylhet, Bangladesh"}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="font-display mt-8 text-[clamp(2.6rem,8vw,6.5rem)] leading-[0.95] font-bold"
          >
            {first}
            <br />
            <span className="text-gradient">{rest.join(" ")}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="label-mono mt-7 text-muted-foreground"
          >
            {profile.headline}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground"
          >
            &ldquo;{profile.statement}&rdquo;
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <Button asChild size="lg" className="group">
              <a href="#experience">
                Explore My Work
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#contact">Let&apos;s Connect</a>
            </Button>
            {profile.linkedin && (
              <Button asChild size="lg" variant="ghost">
                <a href={profile.linkedin} target="_blank" rel="noreferrer">
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </a>
              </Button>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div className="accent-ring overflow-hidden rounded-3xl border border-border bg-surface-2">
            {profile.photo_url ? (
              <img
                src={profile.photo_url}
                alt={profile.name}
                className="aspect-[4/5] w-full object-cover"
                loading="eager"
              />
            ) : (
              <div className="font-display grid aspect-[4/5] w-full place-items-center bg-[radial-gradient(60%_60%_at_50%_20%,color-mix(in_oklab,var(--accent)_25%,transparent),transparent)] text-7xl font-bold text-muted-foreground">
                {initials}
              </div>
            )}
          </div>
          <div className="glass absolute -bottom-5 -left-5 rounded-2xl px-4 py-3">
            <p className="label-mono text-muted-foreground">Current role</p>
            <p className="mt-1 max-w-[16rem] text-sm font-medium">{profile.current_role_title}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* --------------------------------- About --------------------------------- */

export function About({ profile }: { profile: Profile }) {
  const facts = [
    ["Education", profile.education],
    ["Current role", profile.current_role_title],
    ["Location", profile.location],
    ["Focus", profile.focus],
  ] as const;

  return (
    <Section id="about">
      <Reveal>
        <SectionLabel index="01">Philosophy & Background</SectionLabel>
        <h2 className="font-display mt-6 max-w-3xl text-[clamp(2rem,4.5vw,3.4rem)] leading-tight font-bold">
          Building experience by taking <span className="text-gradient">responsibility</span>.
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal delay={0.05}>
          <div className="space-y-6 text-lg leading-relaxed whitespace-pre-line text-muted-foreground">
            {profile.bio}
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="grid gap-4 sm:grid-cols-2">
            {facts.map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-border bg-surface-2/60 p-5 transition-colors hover:border-[color:var(--accent)]/40"
              >
                <p className="label-mono text-muted-foreground">{label}</p>
                <p className="mt-2 text-sm leading-relaxed">{value}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ------------------------------- Experience ------------------------------- */

function ExperienceCard({ item }: { item: Experience }) {
  const period = [item.start_date, item.is_current ? "Present" : item.end_date]
    .filter(Boolean)
    .join(" – ");
  return (
    <div className="group relative rounded-2xl border border-border bg-surface-2/50 p-6 transition-all hover:border-[color:var(--accent)]/45 hover:bg-surface-3/60">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="label-mono text-[color:var(--accent)]">{item.category}</span>
        <span className="label-mono text-muted-foreground">{period}</span>
      </div>
      <h3 className="font-display mt-4 text-xl font-semibold">{item.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{item.organization}</p>
      {item.description && (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
      )}
      {item.responsibilities.length > 0 && (
        <ul className="mt-5 space-y-2">
          {item.responsibilities.map((r) => (
            <li key={r} className="flex gap-2 text-sm text-muted-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--accent)]" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      )}
      {item.skills.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {item.skills.map((s) => (
            <span
              key={s}
              className="label-mono rounded-full border border-border px-2.5 py-1 text-muted-foreground"
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function ExperienceSection({ items }: { items: Experience[] }) {
  const roles = items.filter((i) => i.category !== "Event");
  return (
    <Section id="experience">
      <Reveal>
        <SectionLabel index="02">Field Record & Track Record</SectionLabel>
        <h2 className="font-display mt-6 max-w-3xl text-[clamp(2rem,4.5vw,3.4rem)] leading-tight font-bold">
          Roles, responsibility and <span className="text-gradient">execution</span>.
        </h2>
      </Reveal>
      <div className="mt-14 grid gap-5 md:grid-cols-2">
        {roles.map((item, i) => (
          <Reveal key={item.id} delay={i * 0.04}>
            <ExperienceCard item={item} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function EventsSection({ items }: { items: Experience[] }) {
  const events = items.filter((i) => i.category === "Event");
  if (events.length === 0) return null;
  return (
    <Section id="events">
      <Reveal>
        <SectionLabel index="03">Events & Operations</SectionLabel>
        <h2 className="font-display mt-6 max-w-3xl text-[clamp(2rem,4.5vw,3.4rem)] leading-tight font-bold">
          Events that actually <span className="text-gradient">ran on time</span>.
        </h2>
      </Reveal>
      <div className="mt-14 space-y-5">
        {events.map((item, i) => (
          <Reveal key={item.id} delay={i * 0.04}>
            <ExperienceCard item={item} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------- Ambassador ------------------------------- */

export function AmbassadorSection({ items }: { items: Ambassador[] }) {
  if (items.length === 0) return null;
  return (
    <Section id="ambassador">
      <Reveal>
        <SectionLabel index="04">Brand Integration</SectionLabel>
        <h2 className="font-display mt-6 max-w-3xl text-[clamp(2rem,4.5vw,3.4rem)] leading-tight font-bold">
          Connecting brands with <span className="text-gradient">campus</span>.
        </h2>
      </Reveal>
      <div className="mt-14 grid gap-5 lg:grid-cols-2">
        {items.map((a, i) => (
          <Reveal key={a.id} delay={i * 0.06}>
            <div className="h-full rounded-3xl border border-border bg-surface-2/50 p-8 transition-colors hover:border-[color:var(--accent)]/45">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-2xl font-bold tracking-tight">{a.brand}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{a.role_title}</p>
                </div>
                <span className="label-mono rounded-full border border-border px-3 py-1.5 text-muted-foreground">
                  {a.period}
                </span>
              </div>
              {a.description && (
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{a.description}</p>
              )}
              <ul className="mt-6 space-y-2">
                {a.highlights.map((h) => (
                  <li key={h} className="flex gap-2 text-sm text-muted-foreground">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--accent)]" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* --------------------------- Digital operations --------------------------- */

export function DigitalOps({ steps, skills }: { steps: CaseStep[]; skills: Skill[] }) {
  const digital = skills.filter((s) => s.group_name === "Digital Operations");
  const marketing = skills.filter((s) => s.group_name === "Marketing & Communication");
  return (
    <Section id="digital-ops">
      <Reveal>
        <SectionLabel index="05">Digital Operations</SectionLabel>
        <h2 className="font-display mt-6 max-w-3xl text-[clamp(2rem,4.5vw,3.4rem)] leading-tight font-bold">
          Practical tools, <span className="text-gradient">real workflows</span>.
        </h2>
        <p className="mt-5 max-w-2xl text-muted-foreground">
          Spreadsheet, form and automation work used to run registrations, ticketing and
          participant data for campus events.
        </p>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="mt-12 rounded-3xl border border-border bg-surface-2/50 p-6 lg:p-10">
          <div className="label-mono flex items-center gap-2 text-muted-foreground">
            <QrCode className="h-4 w-4 text-[color:var(--accent)]" /> QR ticketing workflow
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            {steps.map((s, i) => (
              <div
                key={s.id}
                className="relative rounded-2xl border border-border bg-background/60 p-5"
              >
                <span className="label-mono text-[color:var(--accent)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-3 font-display text-base font-semibold">{s.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {[
          ["Tools & digital skills", digital],
          ["Marketing & communication", marketing],
        ].map(([title, list]) => (
          <Reveal key={title as string} delay={0.1}>
            <div className="h-full rounded-3xl border border-border bg-surface-2/50 p-8">
              <p className="label-mono text-muted-foreground">{title as string}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {(list as Skill[]).map((s) => (
                  <span
                    key={s.id}
                    className="rounded-full border border-border bg-background/60 px-3 py-1.5 text-sm text-muted-foreground"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* -------------------------------- Projects -------------------------------- */

export function ProjectsSection({ items }: { items: Project[] }) {
  if (items.length === 0) return null;
  return (
    <Section id="projects">
      <Reveal>
        <SectionLabel index="06">Projects</SectionLabel>
        <h2 className="font-display mt-6 max-w-3xl text-[clamp(2rem,4.5vw,3.4rem)] leading-tight font-bold">
          Ideas being built into <span className="text-gradient">something real</span>.
        </h2>
      </Reveal>
      <div className="mt-14 space-y-5">
        {items.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.05}>
            <article className="grid gap-8 rounded-3xl border border-border bg-surface-2/50 p-8 transition-colors hover:border-[color:var(--accent)]/45 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
              <div>
                <span className="label-mono text-[color:var(--accent)]">
                  Project {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display mt-4 text-3xl font-bold tracking-tight">{p.name}</h3>
                {p.tagline && <p className="mt-2 text-sm text-muted-foreground">{p.tagline}</p>}
                <span className="label-mono mt-5 inline-block rounded-full border border-border px-3 py-1.5 text-muted-foreground">
                  {p.status}
                </span>
                {p.cover_url && (
                  <img
                    src={p.cover_url}
                    alt={p.name}
                    loading="lazy"
                    className="mt-6 aspect-video w-full rounded-2xl border border-border object-cover"
                  />
                )}
                {(p.external_link || p.github_link) && (
                  <div className="mt-6 flex gap-2">
                    {p.external_link && (
                      <Button asChild variant="outline" size="sm">
                        <a href={p.external_link} target="_blank" rel="noreferrer">
                          Visit <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                    {p.github_link && (
                      <Button asChild variant="ghost" size="sm">
                        <a href={p.github_link} target="_blank" rel="noreferrer">
                          Repository
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
              <div>
                <p className="leading-relaxed text-muted-foreground">{p.description}</p>
                {p.features.length > 0 && (
                  <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--accent)]" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {p.tools.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {p.tools.map((t) => (
                      <span
                        key={t}
                        className="label-mono rounded-full border border-border px-2.5 py-1 text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* -------------------------------- Community -------------------------------- */

export function CommunitySection({ items }: { items: CommunityImpact[] }) {
  if (items.length === 0) return null;
  return (
    <Section id="community">
      <Reveal>
        <SectionLabel index="07">Community</SectionLabel>
        <h2 className="font-display mt-6 max-w-3xl text-[clamp(2rem,4.5vw,3.4rem)] leading-tight font-bold">
          ZERO Organization — <span className="text-gradient">community work</span>.
        </h2>
      </Reveal>
      <div className="mt-14 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.05}>
            <div className="h-full rounded-2xl border border-border bg-surface-2/50 p-6">
              <p className="font-display text-4xl font-bold text-[color:var(--accent)]">
                {c.metric}
              </p>
              <p className="mt-3 text-sm font-medium">{c.label}</p>
              {c.description && (
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {c.description}
                </p>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* --------------------------------- Skills --------------------------------- */

export function SkillsSection({ items }: { items: Skill[] }) {
  const groups = items.reduce<Record<string, Skill[]>>((acc, s) => {
    (acc[s.group_name] ??= []).push(s);
    return acc;
  }, {});
  return (
    <Section id="skills">
      <Reveal>
        <SectionLabel index="08">Skills</SectionLabel>
        <h2 className="font-display mt-6 max-w-3xl text-[clamp(2rem,4.5vw,3.4rem)] leading-tight font-bold">
          What I bring to a <span className="text-gradient">team</span>.
        </h2>
      </Reveal>
      <div className="mt-14 grid gap-5 lg:grid-cols-3">
        {Object.entries(groups).map(([group, list], i) => (
          <Reveal key={group} delay={i * 0.05}>
            <div className="h-full rounded-3xl border border-border bg-surface-2/50 p-8">
              <p className="label-mono text-muted-foreground">{group}</p>
              <div className="mt-6 space-y-4">
                {list.map((s) => (
                  <div key={s.id}>
                    <div className="flex justify-between text-sm">
                      <span>{s.name}</span>
                      <span className="text-muted-foreground">{s.level}%</span>
                    </div>
                    <div className="mt-2 h-1 w-full rounded-full bg-surface-3">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${s.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                        className="h-1 rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* --------------------------------- Contact --------------------------------- */

export function ContactSection({
  profile,
  social,
}: {
  profile: Profile;
  social: SocialLink[];
}) {
  return (
    <Section id="contact" className="atmos">
      <Reveal>
        <SectionLabel index="09">Contact</SectionLabel>
        <h2 className="font-display mt-6 max-w-4xl text-[clamp(2.2rem,6vw,4.5rem)] leading-[1.02] font-bold">
          Let&apos;s build something <span className="text-gradient">worth organizing</span>.
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {[
          [Mail, "Email", profile.email, `mailto:${profile.email}`],
          [Phone, "Phone", profile.phone, `tel:${profile.phone.replace(/[^+\d]/g, "")}`],
          [MapPin, "Location", profile.location, null],
        ].map(([Icon, label, value, href], i) => {
          const I = Icon as typeof Mail;
          const inner = (
            <div className="h-full rounded-2xl border border-border bg-surface-2/50 p-6 transition-colors hover:border-[color:var(--accent)]/45">
              <I className="h-5 w-5 text-[color:var(--accent)]" />
              <p className="label-mono mt-4 text-muted-foreground">{label as string}</p>
              <p className="mt-2 text-sm break-words">{value as string}</p>
            </div>
          );
          return (
            <Reveal key={label as string} delay={i * 0.05}>
              {href ? (
                <a href={href as string} className="block h-full">
                  {inner}
                </a>
              ) : (
                inner
              )}
            </Reveal>
          );
        })}
      </div>

      {social.length > 0 && (
        <Reveal delay={0.1}>
          <div className="mt-8 flex flex-wrap gap-3">
            {social.map((s) => (
              <Button key={s.id} asChild variant="outline" size="sm">
                <a href={s.url} target="_blank" rel="noreferrer">
                  {s.label} <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </Button>
            ))}
          </div>
        </Reveal>
      )}
    </Section>
  );
}

export function SiteFooter({ profile }: { profile: Profile }) {
  return (
    <footer className="border-t border-border px-6 py-10 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4">
        <p className="label-mono text-muted-foreground">
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p className="label-mono text-muted-foreground">{profile.location}</p>
      </div>
    </footer>
  );
}
