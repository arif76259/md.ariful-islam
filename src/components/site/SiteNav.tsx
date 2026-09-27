import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const WORK_LINKS = [
  ["Work & Roles", "#experience"],
  ["Organized Events", "#events"],
  ["Ambassador Roles", "#ambassador"],
  ["Projects & Concepts", "#projects"],
] as const;

const LINKS = [
  ["Home", "#home"],
  ["About", "#about"],
  ["Skills", "#skills"],
  ["Recommendations", "#recommendations"],
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
  const [expOpen, setExpOpen] = useState(false);
  const [mobileExp, setMobileExp] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setExpOpen(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setExpOpen(false), 140);
  };

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

        <nav className="hidden items-center gap-7 lg:flex">
          <a
            href="#home"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </a>
          <a
            href="#about"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            About
          </a>

          <div className="relative" onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
            <button
              type="button"
              aria-expanded={expOpen}
              onClick={() => setExpOpen((v) => !v)}
              className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Experience
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-300 ${expOpen ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`absolute top-full left-1/2 w-64 -translate-x-1/2 pt-3 transition-all duration-200 ${
                expOpen
                  ? "pointer-events-auto translate-y-0 opacity-100"
                  : "pointer-events-none -translate-y-1 opacity-0"
              }`}
            >
              <div className="overflow-hidden rounded-2xl border border-border bg-background/90 p-2 shadow-xl backdrop-blur-xl">
                {WORK_LINKS.map(([label, href]) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setExpOpen(false)}
                    className="block rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {LINKS.slice(2).map(([label, href]) => (
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
            className="grid h-10 w-10 place-items-center rounded-lg border border-border lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background/95 px-6 py-4 backdrop-blur-xl lg:hidden">
          <div className="flex flex-col">
            {LINKS.slice(0, 2).map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="border-b border-border/60 py-3 text-sm text-muted-foreground hover:text-foreground"
              >
                {label}
              </a>
            ))}

            <button
              type="button"
              onClick={() => setMobileExp((v) => !v)}
              className="flex items-center justify-between border-b border-border/60 py-3 text-sm text-muted-foreground hover:text-foreground"
            >
              Experience
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-300 ${mobileExp ? "rotate-180" : ""}`}
              />
            </button>
            {mobileExp && (
              <div className="flex flex-col border-b border-border/60 pl-4">
                {WORK_LINKS.map(([label, href]) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="py-2.5 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {label}
                  </a>
                ))}
              </div>
            )}

            {LINKS.slice(2).map(([label, href]) => (
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
