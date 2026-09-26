import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<"profile">;
export type Experience = Tables<"experiences">;
export type Ambassador = Tables<"ambassadors">;
export type Project = Tables<"projects">;
export type Skill = Tables<"skills">;
export type CommunityImpact = Tables<"community_impacts">;
export type CaseStep = Tables<"case_steps">;
export type SocialLink = Tables<"social_links">;
export type MediaItem = Tables<"media">;
export type SiteSettings = Tables<"site_settings">;
export type Recommendation = Tables<"recommendations">;

async function one<T>(table: string) {
  const { data, error } = await supabase.from(table as never).select("*").limit(1);
  if (error) throw error;
  return ((data as unknown as T[])[0] ?? null) as T | null;
}

async function many<T>(table: string, order = "sort_order") {
  const { data, error } = await supabase
    .from(table as never)
    .select("*")
    .order(order, { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as T[];
}

export const cms = {
  profile: () => one<Profile>("profile"),
  settings: () => one<SiteSettings>("site_settings"),
  experiences: () => many<Experience>("experiences"),
  ambassadors: () => many<Ambassador>("ambassadors"),
  projects: () => many<Project>("projects"),
  skills: () => many<Skill>("skills"),
  community: () => many<CommunityImpact>("community_impacts"),
  caseSteps: () => many<CaseStep>("case_steps"),
  social: () => many<SocialLink>("social_links"),
  media: () => many<MediaItem>("media", "created_at"),
  recommendations: async () => {
    const { data, error } = await supabase
      .from("recommendations")
      .select("*")
      .eq("status", "approved")
      .order("featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Recommendation[];
  },
};

export const queries = {
  profile: { queryKey: ["profile"], queryFn: cms.profile },
  settings: { queryKey: ["site_settings"], queryFn: cms.settings },
  experiences: { queryKey: ["experiences"], queryFn: cms.experiences },
  ambassadors: { queryKey: ["ambassadors"], queryFn: cms.ambassadors },
  projects: { queryKey: ["projects"], queryFn: cms.projects },
  skills: { queryKey: ["skills"], queryFn: cms.skills },
  community: { queryKey: ["community_impacts"], queryFn: cms.community },
  caseSteps: { queryKey: ["case_steps"], queryFn: cms.caseSteps },
  social: { queryKey: ["social_links"], queryFn: cms.social },
  media: { queryKey: ["media"], queryFn: cms.media },
  recommendations: { queryKey: ["recommendations_public"], queryFn: cms.recommendations },
};

export const THEME_PRESETS: Record<
  string,
  { primary_accent: string; secondary_accent: string; background_tone: string }
> = {
  Obsidian: { primary_accent: "#7c7cff", secondary_accent: "#22d3ee", background_tone: "#0b0b0f" },
  Midnight: { primary_accent: "#4f7dff", secondary_accent: "#7bd0ff", background_tone: "#080b14" },
  Indigo: { primary_accent: "#8b5cf6", secondary_accent: "#c084fc", background_tone: "#0c0a16" },
  Electric: { primary_accent: "#2f6bff", secondary_accent: "#00e5ff", background_tone: "#07090f" },
  Minimal: { primary_accent: "#d8b26a", secondary_accent: "#e8e6e1", background_tone: "#0f0f0f" },
};

/** Ten-year signed URL for an object in the private media bucket. */
export async function signedUrl(path: string) {
  const { data, error } = await supabase.storage
    .from("media")
    .createSignedUrl(path, 60 * 60 * 24 * 3650);
  if (error) throw error;
  return data.signedUrl;
}

export async function uploadMedia(file: File) {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;
  const url = await signedUrl(path);
  const { data, error: insErr } = await supabase
    .from("media")
    .insert({ name: file.name, url, path, kind: file.type || "image", size_bytes: file.size })
    .select()
    .single();
  if (insErr) throw insErr;
  return data as MediaItem;
}

export async function deleteMedia(item: MediaItem) {
  if (item.path) await supabase.storage.from("media").remove([item.path]);
  const { error } = await supabase.from("media").delete().eq("id", item.id);
  if (error) throw error;
}

export function validateImage(file: File) {
  const ok = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
  if (!ok.includes(file.type)) return "Use a JPG, PNG, WEBP, GIF or AVIF image.";
  if (file.size > 10 * 1024 * 1024) return "Image must be smaller than 10 MB.";
  return null;
}
