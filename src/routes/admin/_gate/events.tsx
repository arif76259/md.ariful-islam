import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { experienceDefaults, experienceFields } from "./experience";

export const Route = createFileRoute("/admin/_gate/events")({
  component: EventsAdmin,
});

function EventsAdmin() {
  return (
    <ResourceManager
      table="experiences"
      queryKey="experiences"
      title="Events"
      description="Events, competitions and workshops. Keep the category set to “Event”."
      fields={experienceFields}
      defaults={{ ...experienceDefaults, category: "Event" }}
      titleKey="title"
      subtitleKey="organization"
      filter={(r) => r.category === "Event"}
    />
  );
}
