import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/ResourceManager";

export const Route = createFileRoute("/admin/_gate/community")({
  component: CommunityAdmin,
});

function CommunityAdmin() {
  return (
    <ResourceManager
      table="community_impacts"
      queryKey="community_impacts"
      title="Community impact"
      description="Verified community activities and the numbers behind them."
      titleKey="label"
      subtitleKey="metric"
      fields={[
        { key: "metric", label: "Number", type: "text", max: 20 },
        { key: "label", label: "Label", type: "text", required: true, max: 120 },
        { key: "description", label: "Description", type: "textarea", max: 400 },
      ]}
      defaults={{ metric: "", label: "", description: "" }}
    />
  );
}
