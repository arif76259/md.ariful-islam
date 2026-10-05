import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/ResourceManager";

export const Route = createFileRoute("/admin/_gate/education")({
  component: EducationAdmin,
});

function EducationAdmin() {
  return (
    <ResourceManager
      table="education"
      queryKey="education"
      title="Education"
      description="Degrees, college and school shown in the Education section."
      titleKey="degree"
      subtitleKey="institution"
      fields={[
        { key: "degree", label: "Degree / certificate", type: "text", required: true, max: 140 },
        { key: "institution", label: "Institution", type: "text", max: 160 },
        { key: "period", label: "Session / timeline", type: "text", max: 60, help: "e.g. 2023 – Present" },
        { key: "field", label: "Major / group", type: "text", max: 120 },
        { key: "description", label: "Short note", type: "textarea", max: 600 },
        { key: "achievements", label: "Achievements / activities", type: "list", help: "One per line." },
      ]}
      defaults={{ degree: "", institution: "", period: "", field: "", description: "", achievements: [] }}
    />
  );
}
