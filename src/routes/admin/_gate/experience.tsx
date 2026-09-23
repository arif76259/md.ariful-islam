import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager, type FieldDef } from "@/components/admin/ResourceManager";

export const Route = createFileRoute("/admin/_gate/experience")({
  component: ExperienceAdmin,
});

export const experienceFields: FieldDef[] = [
  { key: "title", label: "Title", type: "text", required: true, max: 120 },
  { key: "organization", label: "Organization", type: "text", max: 120 },
  { key: "category", label: "Category", type: "text", max: 40, help: "e.g. Leadership, Event, Community, Scouting" },
  { key: "start_date", label: "Start date", type: "text", max: 40 },
  { key: "end_date", label: "End date", type: "text", max: 40 },
  { key: "is_current", label: "Current position", type: "switch" },
  { key: "description", label: "Description", type: "textarea", max: 1000 },
  { key: "responsibilities", label: "Responsibilities", type: "list" },
  { key: "skills", label: "Skills", type: "list" },
  { key: "image_url", label: "Image", type: "image" },
  { key: "featured", label: "Featured", type: "switch" },
];

export const experienceDefaults = {
  title: "",
  organization: "",
  category: "Leadership",
  start_date: "",
  end_date: "",
  is_current: false,
  description: "",
  responsibilities: [],
  skills: [],
  image_url: null,
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
    />
  );
}
