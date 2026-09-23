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
  const [mode, setMode] = useState<"login" | "setup">("login");
  const [loading, setLoading] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin/dashboard", replace: true });
    });
    supabase
      .rpc("has_any_admin" as never)
      .then(() => undefined)
      .catch(() => undefined);
  }, [navigate]);

  useEffect(() => {
    // Offer first-time setup when the admin account has not been created yet.
    supabase
      .from("user_roles")
      .select("id")
      .limit(1)
      .then(({ data }) => setNeedsSetup((data ?? []).length === 0));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      if (mode === "setup") {
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { emailRedirectTo: `${window.location.origin}/admin/login` },
        });
        if (error) throw error;
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (signInError) throw signInError;

      const { data: claimed, error: claimError } = await supabase.rpc("claim_admin");
      if (claimError) throw claimError;
      if (!claimed) {
        await supabase.auth.signOut();
        throw new Error("This account is not authorised for the admin area.");
      }
      if (!remember) sessionStorage.setItem("admin-session-only", "1");
      toast.success("Welcome back, Ariful.");
      navigate({ to: "/admin/dashboard", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
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
              autoComplete={mode === "setup" ? "new-password" : "current-password"}
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
            {mode === "setup" ? "Create admin account" : "Login"}
          </Button>

          {needsSetup && (
            <p className="text-center text-xs text-muted-foreground">
              {mode === "login" ? "No admin account yet?" : "Already have an account?"}{" "}
              <button
                type="button"
                className="text-[color:var(--accent)] underline-offset-4 hover:underline"
                onClick={() => setMode(mode === "login" ? "setup" : "login")}
              >
                {mode === "login" ? "Create the first one" : "Sign in instead"}
              </button>
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <a href="/" className="hover:text-foreground">
            ← Back to the public site
          </a>
        </p>
      </div>
    </main>
  );
}
