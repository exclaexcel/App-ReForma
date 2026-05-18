import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ExpenseForm } from "@/components/expense-form";

export default async function NovoPage() {
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
    .single();

  if (!project) redirect("/");

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("project_id", project.id)
    .order("name");

  return <ExpenseForm projectId={project.id} categories={categories ?? []} />;
}
