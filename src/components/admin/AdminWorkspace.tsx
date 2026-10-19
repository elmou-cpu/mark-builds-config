import { useEffect, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, LogOut, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AdminNav } from "./AdminNav";
import { supabase } from "@/integrations/supabase/client";
import { getAdminStatus } from "@/lib/admin.functions";
import { listOrders, updateOrderStatus, cancelOrder, ORDER_STATUSES, PAYMENT_STATUSES, type AdminOrder, type OrderStatus, type PaymentStatus } from "@/lib/orders.functions";
import { listContactMessages, updateMessageStatus, MESSAGE_STATUSES, type MessageStatus } from "@/lib/contact.functions";
import { listAdminCategories, saveCategory, deleteCategory, reassignCategory, type AdminCategory } from "@/lib/categories.functions";
import { listAdmins, inviteAdmin, revokeAdmin } from "@/lib/staff.functions";
import { getStoreSettings, updateStoreSettings, type StoreSettings } from "@/lib/settings.functions";
import { listAuditEntries } from "@/lib/audit.functions";
import { formatPrice } from "@/lib/format";

export type AdminSection = "orders" | "messages" | "categories" | "staff" | "settings" | "activity";
const titles: Record<AdminSection, string> = { orders: "Commandes", messages: "Messages clients", categories: "Catégories", staff: "Équipe", settings: "Réglages du magasin", activity: "Journal d'activité" };
const labels: Record<string, string> = { nouvelle: "Nouvelle", confirmee: "Confirmée", prete: "Prête", expediee: "Expédiée", livree: "Livrée", annulee: "Annulée", impaye: "Impayé", paye: "Payé", rembourse: "Remboursé", echoue: "Échoué", nouveau: "Nouveau", lu: "Lu", resolu: "Résolu" };
const date = (value: string) => new Date(value).toLocaleString("fr-DZ");

function StatusSelect({ value, values, onChange, disabled = false }: { value: string; values: readonly string[]; onChange: (value: string) => void; disabled?: boolean }) {
  return <Select value={value} onValueChange={onChange} disabled={disabled}><SelectTrigger className="w-full min-w-32"><SelectValue /></SelectTrigger><SelectContent>{values.map(v => <SelectItem key={v} value={v}>{labels[v] ?? v}</SelectItem>)}</SelectContent></Select>;
}
function State({ pending, error, empty, children }: { pending: boolean; error: boolean; empty: boolean; children: ReactNode }) {
  if (pending) return <Loader2 aria-label="Chargement" className="my-12 animate-spin" />;
  if (error) return <p role="alert" className="my-12 text-destructive">Chargement impossible. Réessayez dans quelques instants.</p>;
  if (empty) return <p className="my-12 text-muted-foreground">Aucun résultat.</p>;
  return children;
}
export function AdminWorkspace({ section }: { section: AdminSection }) {
  const navigate = useNavigate();
  const client = useQueryClient();
  const status = useServerFn(getAdminStatus);
  const access = useQuery({ queryKey: ["admin", "access"], queryFn: () => status(), retry: false, staleTime: 0 });
  async function signOut() { await client.cancelQueries(); client.clear(); await supabase.auth.signOut(); await navigate({ to: "/admin/login", replace: true }); }
  return <div className="container py-10"><AdminNav /><div className="mb-8 flex flex-wrap items-center justify-between gap-4"><h1 className="text-3xl font-bold">{titles[section]}</h1><Button variant="outline" onClick={signOut}><LogOut />Déconnexion</Button></div>
    {access.isPending ? <Loader2 className="animate-spin" /> : !access.data?.isAdmin ? <p role="alert">Accès refusé.</p> : <>{section === "orders" && <Orders />}{section === "messages" && <Messages />}{section === "categories" && <Categories />}{section === "staff" && <Staff />}{section === "settings" && <Settings />}{section === "activity" && <Activity />}</>}
  </div>;
}
function useAction(key: string) {
  const client = useQueryClient();
  const [busy, setBusy] = useState(false);
  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    try { await action(); await Promise.all([client.invalidateQueries({ queryKey: ["admin", key] }), client.invalidateQueries({ queryKey: ["catalog"] }), client.invalidateQueries({ queryKey: ["store-settings"] })]); toast.success("Modification enregistrée"); return true; }
    catch { toast.error("Action impossible. Vérifiez vos informations et réessayez."); return false; }
    finally { setBusy(false); }
  };
  return { busy, run };
}
function Orders() {
  const fetch = useServerFn(listOrders), update = useServerFn(updateOrderStatus), cancel = useServerFn(cancelOrder);
  const q = useQuery({ queryKey: ["admin", "orders"], queryFn: () => fetch(), retry: false });
  const [filter, setFilter] = useState("all"), [selected, setSelected] = useState<AdminOrder | null>(null), [reason, setReason] = useState("");
  const { busy, run } = useAction("orders");
  const rows = (q.data ?? []).filter(o => filter === "all" || o.status === filter);
  const current = q.data?.find(o => o.id === selected?.id) ?? selected;
  return <><div className="mb-6 max-w-xs"><StatusSelect value={filter} values={["all", ...ORDER_STATUSES]} onChange={setFilter} /></div><State pending={q.isPending} error={q.isError} empty={rows.length === 0}><div className="divide-y divide-border">{rows.map(o => <div key={o.id} className="flex flex-wrap items-center justify-between gap-4 py-5"><div><p className="font-semibold">{o.orderNumber}</p><p className="text-sm text-muted-foreground">{o.customerName} · {date(o.createdAt)}</p><p className="mt-1 text-sm">{labels[o.status]} · {labels[o.paymentStatus]}</p></div><div className="flex items-center gap-4"><strong>{formatPrice(o.total)}</strong><Button variant="outline" onClick={() => { setSelected(o); setReason(""); }}>Ouvrir</Button></div></div>)}</div></State>
    <Dialog open={Boolean(current)} onOpenChange={open => !open && setSelected(null)}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{current?.orderNumber}</DialogTitle><DialogDescription>Commande client</DialogDescription></DialogHeader>{current && <><p className="text-sm">{current.customerName} · {current.customerPhone}<br />{current.customerEmail}<br />{current.wilaya} — {current.deliveryMode === "retrait" ? "Retrait" : current.address}</p>{current.notes && <p className="whitespace-pre-wrap text-sm text-muted-foreground">{current.notes}</p>}<ul className="divide-y divide-border">{current.items.map(i => <li key={i.id} className="flex justify-between gap-4 py-3 text-sm"><span>{i.quantity} × {i.productName}<small className="block text-muted-foreground">{i.productSku}</small></span><span>{formatPrice(i.lineTotal)}</span></li>)}</ul><dl className="text-sm"><div className="flex justify-between"><dt>Livraison</dt><dd>{formatPrice(current.shippingFee)}</dd></div><div className="flex justify-between"><dt>TVA incluse</dt><dd>{formatPrice(current.taxAmount)}</dd></div><div className="mt-2 flex justify-between font-bold"><dt>Total</dt><dd>{formatPrice(current.total)}</dd></div></dl><div className="grid gap-4 sm:grid-cols-2"><div><Label>Statut</Label><StatusSelect value={current.status} values={current.status === "annulee" ? ["annulee"] : ORDER_STATUSES.filter(s => s !== "annulee")} disabled={busy || current.status === "annulee"} onChange={v => void run(() => update({ data: { id: current.id, status: v as OrderStatus } }))} /></div><div><Label>Paiement</Label><StatusSelect value={current.paymentStatus} values={PAYMENT_STATUSES} disabled={busy} onChange={v => void run(() => update({ data: { id: current.id, paymentStatus: v as PaymentStatus } }))} /></div></div>{current.status !== "annulee" && <div className="space-y-3 border-t border-border pt-4"><Label htmlFor="cancel-reason">Motif d'annulation</Label><Textarea id="cancel-reason" maxLength={500} value={reason} onChange={e => setReason(e.target.value)} /><Button variant="destructive" disabled={busy || !reason.trim()} onClick={() => void run(() => cancel({ data: { id: current.id, reason } }))}>Annuler la commande</Button></div>}{current.cancellationReason && <p className="text-sm">Annulation : {current.cancellationReason}</p>}</>}</DialogContent></Dialog>
  </>;
}
function Messages() {
  const fetch = useServerFn(listContactMessages), update = useServerFn(updateMessageStatus);
  const q = useQuery({ queryKey: ["admin", "messages"], queryFn: () => fetch(), retry: false });
  const { busy, run } = useAction("messages");
  return <State pending={q.isPending} error={q.isError} empty={!q.data?.length}><div className="divide-y divide-border">{q.data?.map(m => <article key={m.id} className="py-6"><div className="flex flex-wrap justify-between gap-4"><div><h2 className="font-semibold">{m.subject || "Demande client"}</h2><p className="text-sm text-muted-foreground">{m.fullName} · {date(m.createdAt)}</p><p className="text-sm">{m.email} · {m.phone}</p></div><div className="w-36"><StatusSelect value={m.status} values={MESSAGE_STATUSES} disabled={busy} onChange={v => void run(() => update({ data: { id: m.id, status: v as MessageStatus } }))} /></div></div><p className="mt-4 whitespace-pre-wrap break-words text-sm">{m.message}</p></article>)}</div></State>;
}
function Categories() {
  const fetch = useServerFn(listAdminCategories), save = useServerFn(saveCategory), remove = useServerFn(deleteCategory), move = useServerFn(reassignCategory);
  const q = useQuery({ queryKey: ["admin", "categories"], queryFn: () => fetch(), retry: false });
  const { busy, run } = useAction("categories");
  const [form, setForm] = useState<(AdminCategory & { isNew: boolean }) | null>(null), [target, setTarget] = useState("");
  return <><Button variant="hero" onClick={() => setForm({ id: "", name: "", label: "", sortOrder: 0, active: true, productCount: 0, isNew: true })}><Plus />Nouvelle catégorie</Button><State pending={q.isPending} error={q.isError} empty={!q.data?.length}><div className="mt-6 divide-y divide-border">{q.data?.map(c => <div key={c.id} className="flex flex-wrap justify-between gap-4 py-4"><div><p className="font-semibold">{c.name}</p><p className="text-sm text-muted-foreground">{c.productCount} produits · {c.active ? "Visible" : "Masquée"} · Position {c.sortOrder}</p></div><Button variant="outline" onClick={() => { setForm({ ...c, isNew: false }); setTarget(""); }}>Modifier</Button></div>)}</div></State><Dialog open={Boolean(form)} onOpenChange={o => !o && setForm(null)}><DialogContent><DialogHeader><DialogTitle>{form?.isNew ? "Nouvelle catégorie" : "Modifier la catégorie"}</DialogTitle><DialogDescription>Catalogue</DialogDescription></DialogHeader>{form && <form className="space-y-4" onSubmit={e => { e.preventDefault(); void run(() => save({ data: form })).then(ok => ok && setForm(null)); }}><div><Label htmlFor="category-id">Identifiant</Label><Input id="category-id" value={form.id} disabled={!form.isNew} pattern="[a-z0-9-]+" minLength={2} required onChange={e => setForm({ ...form, id: e.target.value })} /></div><div><Label htmlFor="category-name">Nom</Label><Input id="category-name" value={form.name} minLength={2} required onChange={e => setForm({ ...form, name: e.target.value })} /></div><div><Label htmlFor="category-position">Position</Label><Input id="category-position" type="number" min={0} max={999} value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: Number(e.target.value) })} /></div><div className="flex items-center justify-between"><Label>Visible</Label><Switch checked={form.active} onCheckedChange={active => setForm({ ...form, active })} /></div><Button type="submit" variant="hero" disabled={busy}>Enregistrer</Button>{!form.isNew && <div className="space-y-3 border-t border-border pt-4">{form.productCount > 0 && <><Label>Déplacer les produits vers</Label><Select value={target} onValueChange={setTarget}><SelectTrigger><SelectValue placeholder="Catégorie de destination" /></SelectTrigger><SelectContent>{q.data?.filter(c => c.id !== form.id).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><Button type="button" variant="outline" disabled={busy || !target} onClick={() => void run(() => move({ data: { from: form.id, to: target } })).then(ok => ok && setForm(null))}>Déplacer les produits</Button></>}<Button type="button" variant="destructive" disabled={busy || form.productCount > 0} onClick={() => void run(() => remove({ data: { id: form.id } })).then(ok => ok && setForm(null))}><Trash2 />Supprimer la catégorie vide</Button></div>}</form>}</DialogContent></Dialog></>;
}
function Staff() {
  const fetch = useServerFn(listAdmins), invite = useServerFn(inviteAdmin), revoke = useServerFn(revokeAdmin);
  const q = useQuery({ queryKey: ["admin", "staff"], queryFn: () => fetch(), retry: false });
  const { busy, run } = useAction("staff");
  const [email, setEmail] = useState(""), [removing, setRemoving] = useState<string | null>(null);
  return <><form className="mb-8 flex max-w-xl flex-wrap items-end gap-3" onSubmit={e => { e.preventDefault(); void run(() => invite({ data: { email, redirectTo: `${window.location.origin}/admin/recovery` } })).then(ok => ok && setEmail("")); }}><div className="min-w-48 flex-1"><Label htmlFor="staff-email">Email du nouvel administrateur</Label><Input id="staff-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} /></div><Button variant="hero" disabled={busy}>Inviter</Button></form><State pending={q.isPending} error={q.isError} empty={!q.data?.length}><div className="divide-y divide-border">{q.data?.map(s => <div key={s.userId} className="flex flex-wrap items-center justify-between gap-4 py-5"><div><p className="break-all font-semibold">{s.email} {s.isSelf && "(vous)"}</p><p className="text-sm text-muted-foreground">{s.confirmed ? "Email confirmé" : "Invitation en attente"}</p></div><Button variant="outline" disabled={busy || s.isSelf} onClick={() => setRemoving(s.userId)}>Retirer l'accès</Button></div>)}</div></State><Dialog open={Boolean(removing)} onOpenChange={o => !o && setRemoving(null)}><DialogContent><DialogHeader><DialogTitle>Retirer cet administrateur ?</DialogTitle><DialogDescription>Son compte ne pourra plus accéder aux données du magasin.</DialogDescription></DialogHeader><Button variant="destructive" disabled={busy} onClick={() => removing && void run(() => revoke({ data: { userId: removing } })).then(ok => ok && setRemoving(null))}>Confirmer le retrait</Button></DialogContent></Dialog></>;
}
function Settings() {
  const fetch = useServerFn(getStoreSettings), save = useServerFn(updateStoreSettings);
  const q = useQuery({ queryKey: ["admin", "settings"], queryFn: () => fetch(), retry: false });
  const [form, setForm] = useState<StoreSettings | null>(null);
  const { busy, run } = useAction("settings");
  useEffect(() => { if (q.data) setForm(q.data); }, [q.data]);
  return <State pending={q.isPending} error={q.isError} empty={false}>{form && <form className="grid max-w-xl gap-5" onSubmit={e => { e.preventDefault(); void run(() => save({ data: form })); }}><div><Label htmlFor="delivery-fee">Livraison (DZD)</Label><Input id="delivery-fee" type="number" min={0} required value={form.deliveryFee} onChange={e => setForm({ ...form, deliveryFee: Number(e.target.value) })} /></div><div><Label htmlFor="free-delivery">Livraison gratuite dès (DZD, vide = désactivée)</Label><Input id="free-delivery" type="number" min={0} value={form.freeDeliveryThreshold ?? ""} onChange={e => setForm({ ...form, freeDeliveryThreshold: e.target.value ? Number(e.target.value) : null })} /></div><div><Label htmlFor="tax-rate">TVA incluse (%)</Label><Input id="tax-rate" type="number" min={0} max={100} step="0.01" value={Number((form.taxRate * 100).toFixed(2))} onChange={e => setForm({ ...form, taxRate: Number(e.target.value) / 100 })} /></div><div><Label htmlFor="stock-default">Seuil de stock faible par défaut</Label><Input id="stock-default" type="number" min={0} max={1000} value={form.defaultLowStockThreshold} onChange={e => setForm({ ...form, defaultLowStockThreshold: Number(e.target.value) })} /></div><div><Label htmlFor="notification-email">Email du magasin pour les alertes</Label><Input id="notification-email" type="email" value={form.notificationEmail} onChange={e => setForm({ ...form, notificationEmail: e.target.value })} /></div><Button variant="hero" disabled={busy}>Enregistrer</Button></form>}</State>;
}
function Activity() {
  const fetch = useServerFn(listAuditEntries);
  const q = useQuery({ queryKey: ["admin", "activity"], queryFn: () => fetch(), retry: false });
  return <State pending={q.isPending} error={q.isError} empty={!q.data?.length}><ol className="divide-y divide-border">{q.data?.map(e => <li key={e.id} className="py-4"><p className="font-medium">{e.action} — {e.entity_label || e.entity_type}</p><p className="break-all text-sm text-muted-foreground">{e.actor_email} · {date(e.created_at)}</p></li>)}</ol></State>;
}