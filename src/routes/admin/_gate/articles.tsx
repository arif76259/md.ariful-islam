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
        { key: "slug", label: "Page link", type: "text", max: 100, placeholder: "Auto-created from title", help: "Your page will be /work/your-link. Leave blank to create it from the title." },
        { key: "category", label: "Category", type: "text", max: 60, help: "e.g. Case Study, Event Recap, Insight" },
        { key: "summary", label: "Short summary", type: "textarea", max: 300 },
        { key: "body", label: "Full article", type: "textarea", max: 20000, help: "Leave an empty line between paragraphs." },
        { key: "cover_url", label: "Cover photo", type: "image" },
        { key: "gallery", label: "Photo gallery", type: "gallery" },
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
      aiPolish={{ kind: "case_study", titleKey: "title", summaryKey: "summary", descriptionKey: "body" }}
    />
  );
}
