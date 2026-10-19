import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { completeAdminRecovery } from "@/lib/auth.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/recovery")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Nouveau mot de passe — Mark Computer" },
    { name: "description", content: "Définissez votre mot de passe d'administration Mark Computer." },
    { property: "og:title", content: "Nouveau mot de passe — Mark Computer" },
    { property: "og:description", content: "Récupération sécurisée de votre accès Mark Computer." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: Recovery,
});
function Recovery() {
  const navigate = useNavigate(), complete = useServerFn(completeAdminRecovery);
  const [ready, setReady] = useState(false), [invalid, setInvalid] = useState(false), [busy, setBusy] = useState(false);
  const [password, setPassword] = useState(""), [confirm, setConfirm] = useState("");
  useEffect(() => {
    let active = true;
    async function verify() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) { if (active) setInvalid(true); return; }
      }
      const { data, error } = await supabase.auth.getUser();
      if (active) { setReady(Boolean(data.user) && !error); setInvalid(!data.user || Boolean(error)); }
      window.history.replaceState(null, "", "/admin/recovery");
    }
    void verify();
    return () => { active = false; };
  }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { toast.error("Les mots de passe ne correspondent pas."); return; }
    setBusy(true);
    try { const result = await complete({ data: { password } }); toast.success("Mot de passe enregistré"); await navigate({ to: result.isAdmin ? "/admin" : "/admin/login", replace: true }); }
    catch { toast.error("Lien expiré ou mot de passe refusé. Demandez un nouveau lien."); }
    finally { setBusy(false); }
  }
  return <div className="container mx-auto max-w-lg py-20"><Lock className="text-brand-blue" /><h1 className="mt-5 text-2xl font-bold">Nouveau mot de passe</h1>{invalid ? <><p role="alert" className="my-6 text-destructive">Ce lien est invalide ou expiré.</p><Button variant="outline" onClick={() => navigate({ to: "/admin/login" })}>Retour à la connexion</Button></> : !ready ? <Loader2 className="mt-8 animate-spin" /> : <form className="mt-8 grid gap-5" onSubmit={submit}><div><Label htmlFor="new-password">Mot de passe (12 caractères minimum)</Label><Input id="new-password" type="password" autoComplete="new-password" required minLength={12} maxLength={200} value={password} onChange={e => setPassword(e.target.value)} /></div><div><Label htmlFor="confirm-password">Confirmer le mot de passe</Label><Input id="confirm-password" type="password" autoComplete="new-password" required value={confirm} onChange={e => setConfirm(e.target.value)} /></div><Button variant="hero" disabled={busy}>{busy && <Loader2 className="animate-spin" />}Enregistrer</Button></form>}</div>;
}