import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getLatestProject } from "@/lib/queries/getProject";
import { RoomManager } from "@/components/room-manager";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ComodoosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const project = await getLatestProject(supabase, user.id);

  if (!project) redirect("/");

  const { data: rooms, error: roomsError } = await supabase
    .from("rooms")
    .select("*")
    .eq("project_id", project.id)
    .order("name");

  if (roomsError) throw roomsError;

  return (
    <div className="min-h-dvh bg-stone-50 dark:bg-zinc-900 pb-8">
      <div className="sticky top-0 bg-stone-50/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-stone-200 dark:border-zinc-800 z-10 px-4 py-4 flex items-center gap-3">
        <Link href="/" className="text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-stone-900 dark:text-zinc-100">Cômodos</h1>
          <p className="text-xs text-stone-500 dark:text-zinc-500 truncate">{project.name}</p>
        </div>
      </div>
      <div className="px-4 pt-6">
        <RoomManager projectId={project.id} initialRooms={rooms ?? []} />
      </div>
    </div>
  );
}
