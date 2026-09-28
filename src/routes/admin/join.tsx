import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/join")({
  ssr: false,
  validateSearch: (s) => z.object({ token: z.string().optional() }).parse(s),
  head: () => ({
    meta: [
      { title: "Join the admin team" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Join,
});

function Join() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (password.length < 10) return toast.error("Password must be at least 10 characters");
    setBusy(true);
    try {
      let { error } = await supabase.auth.signUp({ email, password });
      if (error && /registered|exists/i.test(error.message)) {
        ({ error } = await supabase.auth.signInWithPassword({ email, password }));
      }
      if (error) throw error;
      const { data: ok, error: rErr } = await supabase.rpc("redeem_admin_invite", { _token: token });
      if (rErr || !ok) {
        await supabase.auth.signOut();
        throw new Error("This invite link is invalid, expired or already used.");
      }
      toast.success("Welcome to the team");
      navigate({ to: "/admin/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not join");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="atmos grid min-h-screen place-items-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-4 rounded-3xl border border-border bg-surface-2/50 p-8"
      >
        <h1 className="font-display text-2xl font-bold">Join the admin team</h1>
        {!token ? (
          <p className="text-sm text-muted-foreground">This page needs a valid invite link.</p>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                required
                minLength={10}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Accept invite
            </Button>
          </>
        )}
      </form>
    </div>
  );
}
