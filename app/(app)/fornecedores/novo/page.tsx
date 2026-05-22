import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SupplierForm } from "@/components/supplier-form";

export default async function NovoFornecedorPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!project) redirect("/");

  return <SupplierForm projectId={project.id} />;
}
