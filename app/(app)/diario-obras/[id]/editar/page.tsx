import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TaskForm } from "@/components/task-form";
import { Task } from "@/lib/types";

export default async function EditTaskPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: task } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!task) redirect("/diario-obras");

  // Ownership check
  const { data: ownerProject } = await supabase
    .from("projects")
    .select("id")
    .eq("id", task.project_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!ownerProject) redirect("/diario-obras");

  const { data: rooms } = await supabase
    .from("rooms")
    .select("*")
    .eq("project_id", task.project_id)
    .order("name");

  return (
    <TaskForm
      projectId={task.project_id}
      rooms={rooms ?? []}
      initialTask={task as Task}
    />
  );
}
