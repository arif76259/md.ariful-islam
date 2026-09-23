import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/ResourceManager";

export const Route = createFileRoute("/admin/_gate/projects")({
  component: ProjectsAdmin,
});

function ProjectsAdmin() {
  return (
    <ResourceManager
      table="projects"
      queryKey="projects"
      title="Projects"
      description="Concepts and ongoing work shown in the project showcase."
      titleKey="name"
      subtitleKey="status"
      fields={[
        { key: "name", label: "Name", type: "text", required: true, max: 100 },
        { key: "tagline", label: "Tagline", type: "text", max: 140 },
        { key: "description", label: "Description", type: "textarea", max: 1500 },
        {
          key: "status",
          label: "Status",
          type: "text",
          max: 60,
          help: "e.g. Concept, Ongoing / Growing, Live",
        },
        { key: "category", label: "Category", type: "text", max: 60 },
        { key: "cover_url", label: "Cover image", type: "image" },
        { key: "gallery", label: "Gallery image URLs", type: "list" },
        { key: "features", label: "Features", type: "list" },
        { key: "tools", label: "Tools / technologies", type: "list" },
        { key: "external_link", label: "External link", type: "text", max: 300 },
        { key: "github_link", label: "GitHub link", type: "text", max: 300 },
        { key: "featured", label: "Featured", type: "switch" },
      ]}
      defaults={{
        name: "",
        tagline: "",
        description: "",
        status: "Concept",
        category: "",
        cover_url: null,
        gallery: [],
        features: [],
        tools: [],
        external_link: "",
        github_link: "",
        featured: false,
      }}
    />
  );
}
