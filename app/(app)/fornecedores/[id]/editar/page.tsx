import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SupplierForm } from "@/components/supplier-form";
import { Supplier } from "@/lib/types";

export default async function EditSupplierPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: supplier } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!supplier) redirect("/fornecedores");

  const { data: ownerProject } = await supabase
    .from("projects")
    .select("id")
    .eq("id", supplier.project_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!ownerProject) redirect("/fornecedores");

  return (
    <SupplierForm
      projectId={supplier.project_id}
      initialSupplier={supplier as Supplier}
    />
  );
}
