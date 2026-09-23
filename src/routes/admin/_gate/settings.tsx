import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/_gate/settings")({
  component: SettingsAdmin,
});

function SettingsAdmin() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (next.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({
      password: next,
      current_password: current,
    } as never);
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Password updated");
      setCurrent("");
      setNext("");
    }
  }

  return (
    <>
      <ResourceManager
        table="social_links"
        queryKey="social_links"
        title="Settings"
        description="Social links shown in the contact section and footer."
        titleKey="label"
        subtitleKey="url"
        fields={[
          { key: "label", label: "Label", type: "text", required: true, max: 60 },
          { key: "url", label: "URL", type: "text", required: true, max: 300 },
          { key: "icon", label: "Icon", type: "text", max: 40, help: "linkedin, mail, phone, globe" },
        ]}
        defaults={{ label: "", url: "", icon: "globe" }}
      />

      <form
        onSubmit={changePassword}
        className="mt-10 max-w-md space-y-4 rounded-2xl border border-border bg-surface-2/50 p-6"
      >
        <h2 className="font-display text-lg font-bold">Change password</h2>
        <div className="space-y-2">
          <Label>Current password</Label>
          <Input
            type="password"
            value={current}
            autoComplete="current-password"
            onChange={(e) => setCurrent(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>New password</Label>
          <Input
            type="password"
            value={next}
            autoComplete="new-password"
            onChange={(e) => setNext(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Update password
        </Button>
      </form>
    </>
  );
}
