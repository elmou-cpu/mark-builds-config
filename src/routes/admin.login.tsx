import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Espace administration — Mark Computer" },
      { name: "description", content: "Connexion réservée à l'équipe Mark Computer." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Espace administration — Mark Computer" },
      { property: "og:description", content: "Connexion réservée à l'équipe Mark Computer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("Connexion impossible", { description: "Email ou mot de passe incorrect." });
      return;
    }
    toast.success("Connecté");
    navigate({ to: "/admin", replace: true });
  };

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-16">
      <div className="surface-panel w-full max-w-md rounded-2xl p-6 sm:p-8">
        <div className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-surface-2">
          <Lock className="h-5 w-5 text-brand-blue" />
        </div>
        <h1 className="mt-5 text-2xl font-bold">Espace administration</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Accès réservé à l'équipe Mark Computer.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" variant="hero" className="w-full" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />} Se connecter
          </Button>
        </form>
      </div>
    </div>
  );
}
