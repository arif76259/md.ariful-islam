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
        { key: "role_title", label: "Role", type: "text", max: 80 },
        { key: "period", label: "Period", type: "text", max: 60 },
        { key: "description", label: "Description", type: "textarea", max: 800 },
        { key: "highlights", label: "Highlights", type: "list" },
        { key: "logo_url", label: "Logo", type: "image" },
        { key: "featured", label: "Featured", type: "switch" },
      ]}
      defaults={{
        brand: "",
        role_title: "",
        period: "",
        description: "",
        highlights: [],
        logo_url: null,
        featured: false,
      }}
    />
  );
}
