import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProjectEditForm } from "@/components/project-edit-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function EditProjectPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!project) redirect("/");

  return (
    <div className="min-h-dvh bg-zinc-900 pb-8">
      <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800 z-10 px-4 py-4 flex items-center gap-3">
        <Link href="/" className="text-zinc-400 hover:text-zinc-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold text-zinc-100">Editar Obra</h1>
      </div>
      <div className="px-4 pt-6">
        <ProjectEditForm project={project} />
      </div>
    </div>
  );
}
