import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager, type FieldDef } from "@/components/admin/ResourceManager";

export const Route = createFileRoute("/admin/_gate/experience")({
  component: ExperienceAdmin,
});

export const experienceFields: FieldDef[] = [
  { key: "title", label: "Title", type: "text", required: true, max: 120 },
  { key: "slug", label: "Page link", type: "text", max: 100, placeholder: "Auto-created from title", help: "Your page will be /work/your-link. Leave blank to create it from the title." },
  { key: "organization", label: "Organization", type: "text", max: 120 },
  { key: "category", label: "Category", type: "text", max: 40, help: "e.g. Leadership, Event, Community, Scouting" },
  { key: "start_date", label: "Start date", type: "text", max: 40 },
  { key: "end_date", label: "End date", type: "text", max: 40 },
  { key: "is_current", label: "Current position", type: "switch" },
  { key: "description", label: "Description", type: "textarea", max: 1000 },
  { key: "responsibilities", label: "Responsibilities", type: "list" },
  { key: "skills", label: "Skills", type: "list" },
  { key: "image_url", label: "Cover photo", type: "image" },
  { key: "gallery", label: "Photo gallery", type: "gallery" },
  { key: "featured", label: "Featured", type: "switch" },
];

export const experienceDefaults = {
  title: "",
  slug: "",
  organization: "",
  category: "Leadership",
  start_date: "",
  end_date: "",
  is_current: false,
  description: "",
  responsibilities: [],
  skills: [],
  image_url: null,
  gallery: [],
  featured: false,
};

function ExperienceAdmin() {
  return (
    <ResourceManager
      table="experiences"
      queryKey="experiences"
      title="Experience"
      description="Roles, leadership positions and appointments shown on the public site."
      fields={experienceFields}
      defaults={experienceDefaults}
      titleKey="title"
      subtitleKey="organization"
      filter={(r) => r["category"] !== "Event"}
      aiPolish={{ kind: "experience", titleKey: "title", descriptionKey: "description" }}
    />
  );
}
