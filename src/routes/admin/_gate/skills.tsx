import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/ResourceManager";

export const Route = createFileRoute("/admin/_gate/skills")({
  component: SkillsAdmin,
});

function SkillsAdmin() {
  return (
    <ResourceManager
      table="skills"
      queryKey="skills"
      title="Skills"
      description="Grouped skills shown in the skills and digital operations sections."
      titleKey="name"
      subtitleKey="group_name"
      fields={[
        { key: "name", label: "Skill", type: "text", required: true, max: 80 },
        {
          key: "group_name",
          label: "Group",
          type: "text",
          max: 60,
          help: "Digital Operations, Marketing & Communication, Core…",
        },
        { key: "level", label: "Level (0–100)", type: "number" },
      ]}
      defaults={{ name: "", group_name: "Core", level: 80 }}
    />
  );
}
