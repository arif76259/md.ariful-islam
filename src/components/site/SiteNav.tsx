import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const LINKS = [
  ["Home", "#home"],
  ["About", "#about"],
  ["Experience", "#experience"],
  ["Events", "#events"],
  ["Ambassador", "#ambassador"],
  ["Projects", "#projects"],
  ["Skills", "#skills"],
  ["Contact", "#contact"],
] as const;

export function SiteNav({
  name,
  role,
  logoUrl,
  monogram,
}: {
  name: string;
  role: string;
  logoUrl?: string | null;
  monogram?: string | null;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const initials =
    (monogram ?? "").trim() ||
    name
      .split(" ")
      .filter(Boolean)
      .slice(-2)
      .map((w) => w[0])
      .join("");

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-border bg-background/70 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-4 px-6 lg:px-12">
        <a href="#home" className="flex items-center gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={name}
              className="h-9 w-9 rounded-lg border border-border object-contain"
            />
          ) : (
            <span className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface-2 font-display text-sm font-bold text-[color:var(--accent)]">
              {initials || "MA"}
            </span>
          )}
          <span className="flex flex-col leading-tight">
            <span className="font-display text-base font-bold tracking-tight">{name}</span>
            <span className="label-mono text-muted-foreground">{role}</span>
          </span>
        </a>


        <nav className="hidden items-center gap-7 xl:flex">
          {LINKS.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a href="#contact">Let&apos;s Connect</a>
          </Button>
          <button
            aria-label="Open menu"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-lg border border-border xl:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background/95 px-6 py-4 backdrop-blur-xl xl:hidden">
          <div className="flex flex-col">
            {LINKS.map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="border-b border-border/60 py-3 text-sm text-muted-foreground last:border-0 hover:text-foreground"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
