import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ExpenseForm } from "@/components/expense-form";
import { getLatestProject } from "@/lib/queries/getProject";

export default async function NovoPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const project = await getLatestProject(supabase, user.id);

  if (!project) redirect("/");

  const [{ data: categories, error: catError }, { data: rooms, error: roomError }] =
    await Promise.all([
      supabase.from("categories").select("*").eq("project_id", project.id).order("name"),
      supabase.from("rooms").select("*").eq("project_id", project.id).order("name"),
    ]);

  if (catError) throw catError;
  if (roomError) throw roomError;

  return (
    <ExpenseForm
      projectId={project.id}
      categories={categories ?? []}
      rooms={rooms ?? []}
    />
  );
}
