import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ImageUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { getImagePreview, saveProduct } from "@/lib/admin.functions";
import {
  PRODUCT_CONDITIONS,
  PRODUCT_STATUSES,
  slugify,
  type AdminProduct,
} from "@/lib/catalog-types";

interface CategoryOption {
  id: string;
  name: string;
}

interface FormState {
  name: string;
  slug: string;
  brand: string;
  categoryId: string;
  price: string;
  oldPrice: string;
  description: string;
  stock: string;
  status: string;
  condition: string;
  badge: string;
  sku: string;
  tags: string;
  featured: boolean;
  active: boolean;
  imagePath: string | null;
  imageUrl: string | null;
}

const emptyForm = (categoryId: string): FormState => ({
  name: "",
  slug: "",
  brand: "",
  categoryId,
  price: "",
  oldPrice: "",
  description: "",
  stock: "0",
  status: "disponible",
  condition: "neuf",
  badge: "",
  sku: "",
  tags: "",
  featured: false,
  active: true,
  imagePath: null,
  imageUrl: null,
});

const fromProduct = (product: AdminProduct): FormState => ({
  name: product.name,
  slug: product.slug,
  brand: product.brand,
  categoryId: product.category,
  price: String(product.price),
  oldPrice: product.oldPrice ? String(product.oldPrice) : "",
  description: product.description,
  stock: String(product.stock),
  status: product.status,
  condition: product.condition,
  badge: product.badge ?? "",
  sku: product.sku,
  tags: product.tags.join(", "),
  featured: Boolean(product.featured),
  active: product.active,
  imagePath: product.imagePath,
  imageUrl: product.image || null,
});

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  categories,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: AdminProduct | null;
  categories: CategoryOption[];
}) {
  const queryClient = useQueryClient();
  const save = useServerFn(saveProduct);
  const preview = useServerFn(getImagePreview);
  const [form, setForm] = useState<FormState>(emptyForm(categories[0]?.id ?? ""));
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(product ? fromProduct(product) : emptyForm(categories[0]?.id ?? ""));
  }, [open, product, categories]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const mutation = useMutation({
    mutationFn: async () => {
      const price = Number(form.price);
      const stock = Number(form.stock);
      if (!form.name.trim()) throw new Error("Le nom est obligatoire.");
      if (!Number.isFinite(price) || price < 0) throw new Error("Prix invalide.");
      if (!Number.isFinite(stock) || stock < 0) throw new Error("Stock invalide.");
      const slug = (form.slug.trim() ? form.slug : slugify(`${form.brand} ${form.name}`)) || "";
      return save({
        data: {
          ...(product ? { id: product.id } : {}),
          name: form.name.trim(),
          slug: slugify(slug),
          brand: form.brand.trim(),
          categoryId: form.categoryId,
          price,
          oldPrice: form.oldPrice.trim() ? Number(form.oldPrice) : null,
          description: form.description,
          stock,
          status: form.status as never,
          condition: form.condition as never,
          badge: form.badge.trim() ? form.badge.trim() : null,
          sku: form.sku.trim(),
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          featured: form.featured,
          active: form.active,
          imagePath: form.imagePath,
          specifications: product?.specifications ?? {},
        },
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "products"] }),
        queryClient.invalidateQueries({ queryKey: ["catalog"] }),
      ]);
      toast.success(product ? "Produit mis à jour" : "Produit ajouté");
      onOpenChange(false);
    },
    onError: (error: Error) => toast.error("Enregistrement impossible", { description: error.message }),
  });

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `products/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      const { url } = await preview({ data: { path } });
      set("imagePath", path);
      set("imageUrl", url);
      toast.success("Image téléversée");
    } catch (error) {
      toast.error("Téléversement impossible", { description: (error as Error).message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? "Modifier le produit" : "Nouveau produit"}</DialogTitle>
          <DialogDescription>
            Les changements apparaissent immédiatement sur le site public.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Nom du produit</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="RTX 5070 Gaming OC 12GB"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Marque</Label>
            <Input id="brand" value={form.brand} onChange={(e) => set("brand", e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Catégorie</Label>
            <Select value={form.categoryId} onValueChange={(v) => set("categoryId", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Prix (DZD)</Label>
            <Input
              id="price"
              inputMode="numeric"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="oldPrice">Ancien prix (optionnel)</Label>
            <Input
              id="oldPrice"
              inputMode="numeric"
              value={form.oldPrice}
              onChange={(e) => set("oldPrice", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              inputMode="numeric"
              value={form.stock}
              onChange={(e) => set("stock", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Disponibilité</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>État</Label>
            <Select value={form.condition} onValueChange={(v) => set("condition", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CONDITIONS.map((condition) => (
                  <SelectItem key={condition.value} value={condition.value}>
                    {condition.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="badge">Étiquette (optionnel)</Label>
            <Input id="badge" value={form.badge} onChange={(e) => set("badge", e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">Référence</Label>
            <Input id="sku" value={form.sku} onChange={(e) => set("sku", e.target.value)} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="tags">Mots-clés (séparés par des virgules)</Label>
            <Input id="tags" value={form.tags} onChange={(e) => set("tags", e.target.value)} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={5}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div className="space-y-3 sm:col-span-2">
            <Label>Photo du produit</Label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2">
                {form.imageUrl ? (
                  <img src={form.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-muted-foreground">
                    <ImageUp className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadImage(file);
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  {uploading ? "Téléversement en cours…" : "JPG ou PNG, 10 Mo maximum."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Visible sur le site</p>
              <p className="text-xs text-muted-foreground">Désactivez pour masquer le produit.</p>
            </div>
            <Switch checked={form.active} onCheckedChange={(v) => set("active", v)} />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Mettre en vedette</p>
              <p className="text-xs text-muted-foreground">Affiché sur la page d'accueil.</p>
            </div>
            <Switch checked={form.featured} onCheckedChange={(v) => set("featured", v)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button variant="hero" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="animate-spin" />} Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
