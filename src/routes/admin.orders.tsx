import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AdminWorkspace } from "@/components/admin/AdminWorkspace";
export const Route = createFileRoute("/admin/orders")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/admin/login" });
  },
  head: () => ({ meta: [
    { title: "Commandes — Administration Mark Computer" },
    { name: "description", content: "Commandes du magasin Mark Computer." },
    { property: "og:title", content: "Commandes — Mark Computer" },
    { property: "og:description", content: "Administration du magasin Mark Computer : commandes." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: () => <AdminWorkspace section="orders" />,
});
