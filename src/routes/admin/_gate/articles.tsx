import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/ResourceManager";

export const Route = createFileRoute("/admin/_gate/articles")({
  component: ArticlesAdmin,
});

function ArticlesAdmin() {
  return (
    <ResourceManager
      table="articles"
      queryKey="articles"
      title="Case Studies & Insights"
      description="Detailed write-ups about your events and projects. Only published articles appear on the site."
      titleKey="title"
      subtitleKey="category"
      fields={[
        { key: "title", label: "Title", type: "text", required: true, max: 140 },
        { key: "category", label: "Category", type: "text", max: 60, help: "e.g. Case Study, Event Recap, Insight" },
        { key: "summary", label: "Short summary", type: "textarea", max: 300 },
        { key: "body", label: "Full article", type: "textarea", max: 20000, help: "Leave an empty line between paragraphs." },
        { key: "cover_url", label: "Cover photo", type: "image" },
        { key: "gallery", label: "More photos (image links)", type: "list", help: "Upload in Media, then paste the copied link — one per line." },
        { key: "published", label: "Published", type: "switch" },
        { key: "featured", label: "Featured", type: "switch" },
      ]}
      defaults={{
        title: "",
        category: "Case Study",
        summary: "",
        body: "",
        cover_url: null,
        gallery: [],
        published: false,
        featured: false,
      }}
    />
  );
}
