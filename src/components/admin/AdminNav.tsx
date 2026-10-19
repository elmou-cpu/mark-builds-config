import { Link } from "@tanstack/react-router";
import { Package, ShoppingBag, Mail, Tags, Users, Settings, History } from "lucide-react";
import { Button } from "@/components/ui/button";

const items = [
  { to: "/admin", label: "Produits", icon: Package },
  { to: "/admin/orders", label: "Commandes", icon: ShoppingBag },
  { to: "/admin/messages", label: "Messages", icon: Mail },
  { to: "/admin/categories", label: "Catégories", icon: Tags },
  { to: "/admin/staff", label: "Équipe", icon: Users },
  { to: "/admin/settings", label: "Réglages", icon: Settings },
  { to: "/admin/activity", label: "Activité", icon: History },
] as const;

export function AdminNav() {
  return <nav aria-label="Administration" className="mb-8 flex flex-wrap gap-2 border-b border-border pb-5">
    {items.map(({ to, label, icon: Icon }) => <Button key={to} variant="ghost" size="sm" asChild>
      <Link to={to} activeProps={{ className: "bg-accent text-accent-foreground" }} activeOptions={{ exact: true }}><Icon />{label}</Link>
    </Button>)}
  </nav>;
}