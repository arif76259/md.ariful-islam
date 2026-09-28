import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Copy, Link2, Loader2, Trash2, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createAdminUser } from "@/lib/team.functions";
import { PageHeader } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/_gate/team")({ component: Team });

function Team() {
  const qc = useQueryClient();
  const createFn = useServerFn(createAdminUser);
  const admins = useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_admins");
      if (error) throw error;
      return data ?? [];
    },
  });
  const invites = useQuery({
    queryKey: ["admin_invites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_invites")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const [me, setMe] = useState<string | null>(null);
  useState(() => {
    void supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null));
  });
  const [inviteEmail, setInviteEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const link = (t: string) => `${window.location.origin}/admin/join?token=${t}`;

  async function createInvite() {
    const uid = (await supabase.auth.getUser()).data.user?.id;
    if (!uid) return;
    const { data, error } = await supabase
      .from("admin_invites")
      .insert({ created_by: uid, email: inviteEmail.trim() || null })
      .select("token")
      .single();
    if (error) return toast.error(error.message);
    await navigator.clipboard.writeText(link(data.token)).catch(() => {});
    toast.success("Invite link created and copied");
    setInviteEmail("");
    qc.invalidateQueries({ queryKey: ["admin_invites"] });
  }

  async function addDirect(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 10) return toast.error("Password must be at least 10 characters");
    setBusy(true);
    try {
      await createFn({ data: { email, password } });
      toast.success("Admin account created");
      setEmail("");
      setPassword("");
      qc.invalidateQueries({ queryKey: ["admins"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create admin");
    } finally {
      setBusy(false);
    }
  }

  async function revoke(id: string) {
    if (!confirm("Remove admin access for this person?")) return;
    const { error } = await supabase.rpc("revoke_admin", { _user_id: id });
    if (error) return toast.error(error.message);
    toast.success("Access removed");
    qc.invalidateQueries({ queryKey: ["admins"] });
  }

  async function cancelInvite(id: string) {
    const { error } = await supabase.from("admin_invites").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin_invites"] });
  }

  const card = "rounded-2xl border border-border bg-surface-2/50 p-6";

  return (
    <>
      <PageHeader title="Team" description="Choose who can manage your website." />
      <div className="grid gap-5 lg:grid-cols-2">
        <div className={card}>
          <p className="label-mono text-muted-foreground">Active admins</p>
          <div className="mt-4 divide-y divide-border">
            {(admins.data ?? []).map((a) => (
              <div key={a.user_id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm">{a.email}</p>
                  <p className="label-mono text-muted-foreground">
                    Since {new Date(a.joined_at).toLocaleDateString()}
                    {a.user_id === me && " · You"}
                  </p>
                </div>
                {a.user_id !== me && (
                  <Button size="sm" variant="outline" onClick={() => revoke(a.user_id)}>
                    <Trash2 className="h-3.5 w-3.5" /> Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={addDirect} className={`${card} space-y-4`}>
          <p className="label-mono text-muted-foreground">Add admin directly</p>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Temporary password</Label>
            <Input
              type="text"
              required
              minLength={10}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 10 characters"
            />
          </div>
          <Button type="submit" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Create admin
          </Button>
        </form>

        <div className={`${card} lg:col-span-2`}>
          <p className="label-mono text-muted-foreground">Invite links (single use, 7 days)</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Input
              type="email"
              placeholder="Restrict to email (optional)"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <Button onClick={createInvite}>
              <Link2 className="h-4 w-4" /> Generate link
            </Button>
          </div>
          <div className="mt-4 divide-y divide-border">
            {(invites.data ?? []).map((i) => {
              const state = i.used_at ? "Used" : new Date(i.expires_at) < new Date() ? "Expired" : "Pending";
              return (
                <div key={i.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm">{i.email ?? "Anyone with the link"}</p>
                    <p className="label-mono text-muted-foreground">
                      {state} · expires {new Date(i.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {state === "Pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          navigator.clipboard.writeText(link(i.token)).then(() => toast.success("Copied"))
                        }
                      >
                        <Copy className="h-3.5 w-3.5" /> Copy
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => cancelInvite(i.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
            {invites.data?.length === 0 && (
              <p className="py-3 text-sm text-muted-foreground">No invites yet.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
