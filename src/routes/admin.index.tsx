import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2, LogOut, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProductFormDialog } from "@/components/admin/ProductFormDialog";
import { AdminNav } from "@/components/admin/AdminNav";
import { listAdminCategories } from "@/lib/categories.functions";
import { supabase } from "@/integrations/supabase/client";
import { deleteProduct, listAdminProducts } from "@/lib/admin.functions";
import { catalogQueryOptions } from "@/lib/catalog-query";
import { formatPrice } from "@/lib/format";
import type { AdminProduct } from "@/lib/catalog-types";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/admin/login" });
  },
  head: () => ({
    meta: [
      { title: "Tableau de bord produits — Mark Computer" },
      { name: "description", content: "Gestion du catalogue Mark Computer." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Tableau de bord produits — Mark Computer" },
      { property: "og:description", content: "Gestion du catalogue Mark Computer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchProducts = useServerFn(listAdminProducts);
  const removeProduct = useServerFn(deleteProduct);
  const fetchCategories = useServerFn(listAdminCategories);
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AdminProduct | null>(null);

  const productsQuery = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => fetchProducts(),
    retry: false,
  });

  const categoriesQuery = useQuery({ queryKey: ["admin", "categories"], queryFn: () => fetchCategories(), retry: false });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => removeProduct({ data: { id } }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "products"] }),
        queryClient.invalidateQueries({ queryKey: ["catalog"] }),
      ]);
      toast.success("Produit supprimé");
      setPendingDelete(null);
    },
    onError: (error: Error) =>
      toast.error("Suppression impossible", { description: error.message }),
  });

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  };

  if (productsQuery.isLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (productsQuery.isError) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold">Accès refusé</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Ce compte n'a pas les droits d'administration du catalogue.
        </p>
        <Button className="mt-6" variant="outline" onClick={signOut}>
          <LogOut /> Se déconnecter
        </Button>
      </div>
    );
  }

  const products = productsQuery.data ?? [];
  const term = search.trim().toLowerCase();
  const searched = term
    ? products.filter((p) =>
        `${p.name} ${p.brand} ${p.sku}`.toLowerCase().includes(term),
      )
    : products;
  const filtered = lowStockOnly ? searched.filter(p => p.stock <= p.lowStockThreshold) : searched;

  const categories = (categoriesQuery.data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return (
    <div className="container py-10">
      <AdminNav />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1 text-xs text-muted-foreground">
            <Package className="h-3.5 w-3.5 text-brand-blue" /> Administration
          </p>
          <h1 className="mt-4 text-2xl font-bold sm:text-3xl">Catalogue produits</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {products.length} produits · {products.filter((p) => p.active).length} visibles en ligne
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="hero"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus /> Ajouter un produit
          </Button>
          <Button variant="outline" onClick={signOut}>
            <LogOut /> Déconnexion
          </Button>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Input
          className="max-w-sm"
          placeholder="Rechercher un produit…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant={lowStockOnly ? "secondary" : "outline"} onClick={() => setLowStockOnly(v => !v)} aria-pressed={lowStockOnly}>Stock faible ({products.filter(p => p.stock <= p.lowStockThreshold).length})</Button>
      </div>

      {/* Mobile: cards. Desktop: table. */}
      <div className="mt-6 grid gap-3 md:hidden">
        {filtered.map((product) => (
          <div key={product.id} className="surface-panel rounded-xl p-4">
            <div className="flex gap-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2">
                {product.image && (
                  <img src={product.image} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.brand}</p>
                <p className="mt-1 text-sm font-medium">{formatPrice(product.price)}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant={product.active ? "default" : "secondary"}>
                {product.active ? "En ligne" : "Masqué"}
              </Badge>
              <Badge variant="outline">Stock {product.stock}</Badge>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setEditing(product);
                  setFormOpen(true);
                }}
              >
                <Pencil /> Modifier
              </Button>
              <Button size="sm" variant="outline" onClick={() => setPendingDelete(product)}>
                <Trash2 />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 hidden overflow-hidden rounded-xl border border-border md:block">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Produit</th>
              <th className="px-4 py-3">Prix</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">État</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded border border-border bg-surface-2">
                      {product.image && (
                        <img src={product.image} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.brand}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{formatPrice(product.price)}</td>
                <td className="px-4 py-3">{product.stock}</td>
                <td className="px-4 py-3">
                  <Badge variant={product.active ? "default" : "secondary"}>
                    {product.active ? "En ligne" : "Masqué"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditing(product);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil /> Modifier
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setPendingDelete(product)}>
                      <Trash2 />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-muted-foreground">Aucun produit trouvé.</p>
      )}

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editing}
        categories={categories}
      />

      <AlertDialog open={pendingDelete !== null} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.name} sera retiré définitivement du catalogue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
