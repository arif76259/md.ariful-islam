import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/_gate/security")({
  component: SecurityAdmin,
});

function SecurityAdmin() {
  const qc = useQueryClient();
  const factors = useQuery({
    queryKey: ["mfa_factors"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      return data.totp.filter((f) => f.status === "verified");
    },
  });
  const [enroll, setEnroll] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function start() {
    setBusy(true);
    try {
      // remove stale unverified factors first
      const { data: all } = await supabase.auth.mfa.listFactors();
      for (const f of all?.all ?? []) {
        if (f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: `Authenticator ${Date.now()}`,
      });
      if (error) throw error;
      setEnroll({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start setup");
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    if (!enroll) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: enroll.id,
        code: code.trim(),
      });
      if (error) throw error;
      const { data: codes, error: codesError } = await supabase.rpc("generate_backup_codes");
      if (codesError) throw codesError;
      setBackupCodes((codes ?? []).map((r: { code: string }) => r.code));
      toast.success("2FA is on. Save your backup codes now.");
      setEnroll(null);
      setCode("");
      qc.invalidateQueries({ queryKey: ["mfa_factors"] });
      qc.invalidateQueries({ queryKey: ["backup_code_count"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Wrong code");
    } finally {
      setBusy(false);
    }
  }

  async function regenerateCodes() {
    if (!confirm("Replace all existing backup codes with 8 new ones?")) return;
    setBusy(true);
    try {
      const { data: codes, error } = await supabase.rpc("generate_backup_codes");
      if (error) throw error;
      setBackupCodes((codes ?? []).map((r: { code: string }) => r.code));
      qc.invalidateQueries({ queryKey: ["backup_code_count"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not generate codes");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Turn off 2FA for your account?")) return;
    const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("2FA turned off");
    qc.invalidateQueries({ queryKey: ["mfa_factors"] });
  }

  const active = factors.data ?? [];

  return (
    <>
      <PageHeader
        title="Security (2FA)"
        description="Require a 6-digit code from Google Authenticator (or any authenticator app) at every login."
      />
      <div className="max-w-xl space-y-6 rounded-2xl border border-border bg-surface-2/50 p-6">
        {factors.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : active.length > 0 ? (
          <div className="space-y-4">
            <p className="flex items-center gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-[color:var(--accent)]" /> 2FA is turned on.
            </p>
            {active.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
                <span>Authenticator app</span>
                <Button variant="ghost" size="sm" onClick={() => remove(f.id)}>
                  <Trash2 className="h-4 w-4" /> Turn off
                </Button>
              </div>
            ))}
          </div>
        ) : enroll ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              1. Open Google Authenticator → tap + → Scan QR code.
            </p>
            <img src={enroll.qr} alt="2FA QR code" className="h-48 w-48 rounded-xl bg-foreground p-2" />
            <p className="text-xs text-muted-foreground">
              Can't scan? Enter this key manually: <code className="break-all">{enroll.secret}</code>
            </p>
            <div className="space-y-2">
              <Label>2. Enter the 6-digit code shown in the app</Label>
              <Input
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
              />
            </div>
            <Button onClick={verify} disabled={busy || code.length !== 6}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Verify & turn on
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">2FA is off. Turn it on to protect your dashboard even if your password leaks.</p>
            <Button onClick={start} disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Set up 2FA
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
