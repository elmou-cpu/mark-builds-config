import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Clock, Loader2, Mail, MapPin, Phone, Send } from "lucide-react";
import { toast } from "sonner";

import { submitContactMessage } from "@/lib/contact.functions";
import { toSafeMessage } from "@/lib/errors";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { site } from "@/data/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & SAV — Mark Computer Blida" },
      {
        name: "description",
        content:
          "Contactez Mark Computer à Blida : adresse, téléphone, horaires et formulaire de demande de devis ou de maintenance.",
      },
      { property: "og:title", content: "Contact & SAV — Mark Computer" },
      {
        property: "og:description",
        content: "Adresse, téléphone et horaires du magasin Mark Computer à Blida.",
      },
      { property: "og:url", content: "/contact" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

const subjects = [
  "Demande de devis",
  "Disponibilité d'un produit",
  "Configuration sur mesure",
  "Maintenance / réparation",
  "Autre question",
];

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [subject, setSubject] = useState(subjects[0] ?? "Autre question");
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", message: "" });
  const send = useServerFn(submitContactMessage);

  const update = (key: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await send({ data: { ...form, subject } });
      setSent(true);
      setForm({ fullName: "", phone: "", email: "", message: "" });
      toast.success("Votre message a bien été enregistré.");
    } catch (error) {
      toast.error("Message non envoyé", {
        description: toSafeMessage(error, "Veuillez réessayer dans quelques instants."),
      });
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="container py-10">
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Nous contacter</h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        Une question sur un produit, un devis ou une réparation ? Passez au magasin, appelez-nous ou
        écrivez via le formulaire.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <form className="rounded-xl border border-border bg-surface/50 p-6" onSubmit={submit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                required
                minLength={2}
                maxLength={120}
                placeholder="Votre nom"
                value={form.fullName}
                onChange={update("fullName")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                required
                maxLength={30}
                placeholder="0X XX XX XX XX"
                value={form.phone}
                onChange={update("phone")}
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                required
                maxLength={200}
                placeholder="vous@exemple.com"
                value={form.email}
                onChange={update("email")}
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="subject">Sujet</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger id="subject">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                required
                minLength={10}
                maxLength={4000}
                rows={6}
                placeholder="Décrivez votre besoin, votre budget ou la panne constatée…"
                value={form.message}
                onChange={update("message")}
              />
            </div>
          </div>

          <Button
            variant="hero"
            size="lg"
            type="submit"
            className="mt-6 w-full sm:w-auto"
            disabled={submitting}
          >
            {submitting ? <Loader2 className="animate-spin" /> : <Send />} Envoyer le message
          </Button>
          {sent && (
            <p className="mt-4 text-sm text-success">
              Merci ! Votre demande a bien été enregistrée, nous revenons vers vous rapidement.
            </p>
          )}
        </form>

        <div className="grid gap-4">
          <div className="rounded-xl border border-border bg-surface/50 p-6">
            <h2 className="font-display text-lg font-bold">Le magasin</h2>
            <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
                {site.address}
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
                <a href={site.phoneHref} className="hover:text-foreground">
                  {site.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
                <a href={`mailto:${site.email}`} className="hover:text-foreground">
                  {site.email}
                </a>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
                Tous les jours : {site.hours}
              </li>
            </ul>
            <Button variant="hero" className="mt-6 w-full" asChild>
              <a href={site.phoneHref}>Appeler maintenant</a>
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            <iframe
              title="Carte du magasin Mark Computer à Blida"
              src="https://www.openstreetmap.org/export/embed.html?bbox=2.8%2C36.45%2C2.87%2C36.49&layer=mapnik"
              className="h-64 w-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
