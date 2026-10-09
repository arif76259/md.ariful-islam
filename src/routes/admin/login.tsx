import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Portfolio Admin — Sign in" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Private administration area." },
    ],
  }),
  component: AdminLogin,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [mfaFactor, setMfaFactor] = useState<string | null>(null);
  const [otp, setOtp] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin/dashboard", replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid details");
      return;
    }
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (signInError) throw signInError;

      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
        const { data: f } = await supabase.auth.mfa.listFactors();
        const factor = f?.totp.find((x) => x.status === "verified");
        if (factor) {
          setMfaFactor(factor.id);
          return;
        }
      }
      await finish();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!mfaFactor) return;
    setLoading(true);
    try {
      if (useBackup) {
        const { data: ok, error } = await supabase.rpc("redeem_backup_code", { _code: otp.trim() });
        if (error) throw error;
        if (!ok) throw new Error("Invalid or already-used backup code.");
        toast.success("Backup code accepted. 2FA was reset — set it up again from Security after logging in.");
      } else {
        const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: mfaFactor, code: otp.trim() });
        if (error) throw new Error("Wrong or expired code. Try again.");
      }
      await finish();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function finish() {
    {
      const { data: isAdmin, error: roleError } = await supabase.rpc("is_admin");
      if (roleError) throw roleError;
      if (!isAdmin) {
        await supabase.auth.signOut();
        throw new Error("This account is not authorised for the admin area.");
      }
      if (!remember) sessionStorage.setItem("admin-session-only", "1");
      toast.success("Welcome back, Ariful.");
      navigate({ to: "/admin/dashboard", replace: true });
    }
  }


  return (
    <main className="atmos grid min-h-screen place-items-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="label-mono inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-[color:var(--accent)]" /> Private area
          </span>
          <h1 className="font-display mt-6 text-3xl font-bold tracking-tight">MD. ARIFUL ISLAM</h1>
          <p className="label-mono mt-2 text-muted-foreground">Portfolio Admin</p>
        </div>

        {mfaFactor ? (
          <form
            onSubmit={verifyOtp}
            className="accent-ring space-y-5 rounded-3xl border border-border bg-surface-2/70 p-8 backdrop-blur-xl"
          >
            <div className="space-y-2">
              <Label htmlFor="otp">6-digit code from your authenticator app</Label>
              <Input
                id="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Verify
            </Button>
            <button
              type="button"
              className="w-full text-xs text-muted-foreground hover:text-foreground"
              onClick={async () => {
                await supabase.auth.signOut();
                setMfaFactor(null);
                setOtp("");
              }}
            >
              Use a different account
            </button>
          </form>
        ) : (
        <form
          onSubmit={submit}
          className="accent-ring space-y-5 rounded-3xl border border-border bg-surface-2/70 p-8 backdrop-blur-xl"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              maxLength={255}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              maxLength={128}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={remember}
              onCheckedChange={(v) => setRemember(Boolean(v))}
            />
            <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
              Remember me
            </Label>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Login
          </Button>

        </form>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <a href="/" className="hover:text-foreground">
            ← Back to the public site
          </a>
        </p>
      </div>
    </main>
  );
}
