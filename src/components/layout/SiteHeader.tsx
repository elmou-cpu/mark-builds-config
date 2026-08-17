import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Menu, Phone, Search, ShoppingCart, Truck, Wrench } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SearchDialog } from "@/components/search/SearchDialog";
import { site } from "@/data/site";
import { useShop } from "@/store/shop";

const nav = [
  { to: "/produits", label: "Produits" },
  { to: "/gaming", label: "Gaming" },
  { to: "/laptops", label: "Laptops" },
  { to: "/pc-builder", label: "PC Builder" },
  { to: "/promotions", label: "Promotions" },
  { to: "/occasion", label: "Occasion" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { cartCount, wishlist, setCartOpen } = useShop();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className="border-b border-border bg-surface/70">
        <div className="container flex h-9 items-center justify-between gap-4 text-[0.7rem] text-muted-foreground">
          <p className="flex items-center gap-2 truncate">
            <Truck className="h-3.5 w-3.5 shrink-0 text-brand-blue" />
            <span className="truncate">Livraison dans les {site.wilayas} wilayas</span>
          </p>
          <p className="hidden items-center gap-2 sm:flex">
            <Wrench className="h-3.5 w-3.5 text-brand-purple" />
            Montage & maintenance en atelier
          </p>
          <a href={site.phoneHref} className="flex items-center gap-2 hover:text-foreground">
            <Phone className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{site.phoneLocal}</span>
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="container grid h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <Logo />

          <nav className="hidden min-w-0 justify-center lg:flex" aria-label="Navigation principale">
            <ul className="flex items-center gap-1">
              {nav.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    activeProps={{ className: "text-foreground bg-surface-2" }}
                    inactiveProps={{ className: "text-muted-foreground" }}
                    className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Rechercher"
              onClick={() => setSearchOpen(true)}
            >
              <Search />
            </Button>
            <Button variant="ghost" size="icon" asChild aria-label="Favoris">
              <Link to="/favoris" className="relative">
                <Heart />
                {wishlist.length > 0 && <span className="badge-count">{wishlist.length}</span>}
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Panier"
              className="relative"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart />
              {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
            </Button>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background">
                <SheetTitle className="mb-6">Menu</SheetTitle>
                <ul className="grid gap-1">
                  {nav.map((item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        activeProps={{ className: "bg-surface-2 text-foreground" }}
                        className="block rounded-md px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      to="/a-propos"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-md px-3 py-3 text-sm font-medium text-muted-foreground"
                    >
                      À propos
                    </Link>
                  </li>
                </ul>
                <Button variant="hero" className="mt-6 w-full" asChild>
                  <a href={site.phoneHref}>Appeler le magasin</a>
                </Button>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
