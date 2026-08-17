import { Link } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { site } from "@/data/site";
import { categories } from "@/data/categories";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface/40">
      <div className="container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            {site.tagline} Vente de matériel informatique, montage de configurations sur mesure et
            maintenance.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Catalogue
          </h3>
          <ul className="mt-4 grid gap-2 text-sm">
            {categories.slice(0, 7).map((c) => (
              <li key={c.id}>
                <Link
                  to="/produits"
                  search={{ categorie: c.id }}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Services
          </h3>
          <ul className="mt-4 grid gap-2 text-sm">
            <li>
              <Link to="/pc-builder" className="text-muted-foreground hover:text-foreground">
                Configurateur PC
              </Link>
            </li>
            <li>
              <Link to="/promotions" className="text-muted-foreground hover:text-foreground">
                Promotions
              </Link>
            </li>
            <li>
              <Link to="/occasion" className="text-muted-foreground hover:text-foreground">
                Matériel d'occasion
              </Link>
            </li>
            <li>
              <Link to="/a-propos" className="text-muted-foreground hover:text-foreground">
                À propos
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground">
                Contact & SAV
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Magasin
          </h3>
          <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
              {site.address}
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
              <a href={site.phoneHref} className="hover:text-foreground">
                {site.phone}
              </a>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
              <a href={`mailto:${site.email}`} className="hover:text-foreground">
                {site.email}
              </a>
            </li>
            <li className="flex gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
              {site.hours}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container flex flex-col gap-2 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. Tous droits réservés.</p>
          <p>
            Site de démonstration : prix et disponibilités indicatifs, aucun paiement en ligne.
          </p>
        </div>
      </div>
    </footer>
  );
}
