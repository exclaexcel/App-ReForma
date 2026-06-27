import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLatestProject } from "@/lib/queries/getProject";
import { ScheduleView } from "@/components/schedule-view";

export default async function AgendaPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const project = await getLatestProject(supabase, user.id);
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <p className="text-center text-stone-600 dark:text-zinc-400">
          Nenhum projeto encontrado. Crie um projeto primeiro.
        </p>
      </div>
    );
  }

  const { data: events = [] } = await supabase
    .from("schedule_events")
    .select("*")
    .eq("project_id", project.id)
    .order("start_date", { ascending: true });

  return (
    <div className="px-4 pt-6 pb-4">
      <ScheduleView
        events={events || []}
        projectId={project.id}
      />
    </div>
  );
}
