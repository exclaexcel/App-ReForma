import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ExpenseForm } from "@/components/expense-form";
import { getLatestProject } from "@/lib/queries/getProject";
import type { Card } from "@/lib/types";

export default async function NovoPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const project = await getLatestProject(supabase, user.id);

  if (!project) redirect("/");

  const [
    { data: categories, error: catError },
    { data: suppliers, error: supError },
    { data: cards, error: cardsError },
  ] = await Promise.all([
    supabase.from("categories").select("*").eq("project_id", project.id).order("name"),
    supabase.from("suppliers").select("*").eq("project_id", project.id).order("name"),
    supabase
      .from("cards")
      .select("id, project_id, name, due_day, closing_day, created_at")
      .eq("project_id", project.id)
      .order("name"),
  ]);

  if (catError) throw catError;
  if (supError) throw supError;
  // Migration cards ainda não aplicada → lista vazia (crédito pede cadastro).
  const projectCards = (cardsError ? [] : (cards ?? [])) as Card[];

  return (
    <ExpenseForm
      projectId={project.id}
      categories={categories ?? []}
      suppliers={suppliers ?? []}
      cards={projectCards}
    />
  );
}
