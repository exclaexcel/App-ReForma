import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TaskForm } from "@/components/task-form";

export default async function NovaTarefaPage() {
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

  const { data: rooms } = await supabase
    .from("rooms")
    .select("*")
    .eq("project_id", project.id)
    .order("name");

  return <TaskForm projectId={project.id} rooms={rooms ?? []} />;
}
