import { useQuery } from "@tanstack/react-query";
import { queries, type SiteSettings } from "@/lib/cms";

export function themeCss(s: Partial<SiteSettings> | null | undefined) {
  if (!s) return "";
  return `:root{--accent:${s.primary_accent ?? "#7c7cff"};--accent-2:${
    s.secondary_accent ?? "#22d3ee"
  };--background:${s.background_tone ?? "#0b0b0f"};--border-alpha:${
    (s.border_intensity ?? 14) / 100
  };--gradient-alpha:${(s.gradient_intensity ?? 60) / 100};}`;
}

/** Applies CMS appearance settings site-wide. */
export function ThemeVars() {
  const { data } = useQuery(queries.settings);
  return <style dangerouslySetInnerHTML={{ __html: themeCss(data) }} />;
}
