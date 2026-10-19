import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AdminWorkspace } from "@/components/admin/AdminWorkspace";
export const Route = createFileRoute("/admin/categories")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/admin/login" });
  },
  head: () => ({ meta: [
    { title: "Catégories — Administration Mark Computer" },
    { name: "description", content: "Catégories du magasin Mark Computer." },
    { property: "og:title", content: "Catégories — Mark Computer" },
    { property: "og:description", content: "Administration du magasin Mark Computer : catégories." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: () => <AdminWorkspace section="categories" />,
});
