import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RoomManager } from "@/components/room-manager";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ComodoosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("id, name")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!project) redirect("/");

  const { data: rooms, error: roomsError } = await supabase
    .from("rooms")
    .select("*")
    .eq("project_id", project.id)
    .order("name");

  if (roomsError) throw roomsError;

  return (
    <div className="min-h-dvh bg-zinc-900 pb-8">
      <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800 z-10 px-4 py-4 flex items-center gap-3">
        <Link href="/" className="text-zinc-400 hover:text-zinc-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-zinc-100">Cômodos</h1>
          <p className="text-xs text-zinc-500 truncate">{project.name}</p>
        </div>
      </div>
      <div className="px-4 pt-6">
        <RoomManager projectId={project.id} initialRooms={rooms ?? []} />
      </div>
    </div>
  );
}
