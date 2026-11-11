import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/ResourceManager";

export const Route = createFileRoute("/admin/_gate/ambassadors")({
  component: AmbassadorsAdmin,
});

function AmbassadorsAdmin() {
  return (
    <ResourceManager
      table="ambassadors"
      queryKey="ambassadors"
      title="Ambassador roles"
      description="Brand and campus ambassador programmes."
      titleKey="brand"
      subtitleKey="role_title"
      fields={[
        { key: "brand", label: "Brand", type: "text", required: true, max: 80 },
        { key: "slug", label: "Page link", type: "text", max: 100, placeholder: "Auto-created from brand", help: "Your page will be /work/your-link. Leave blank to create it from the brand name." },
        { key: "role_title", label: "Role", type: "text", max: 80 },
        { key: "period", label: "Period", type: "text", max: 60 },
        { key: "description", label: "Description", type: "textarea", max: 800 },
        { key: "highlights", label: "Highlights", type: "list" },
        { key: "logo_url", label: "Cover photo or brand logo", type: "image" },
        { key: "gallery", label: "Photo gallery", type: "gallery" },
        { key: "featured", label: "Featured", type: "switch" },
      ]}
      defaults={{
        brand: "",
        slug: "",
        role_title: "",
        period: "",
        description: "",
        highlights: [],
        logo_url: null,
        gallery: [],
        featured: false,
      }}
    />
  );
}
