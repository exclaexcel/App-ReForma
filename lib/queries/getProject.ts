import type { SupabaseClient } from "@supabase/supabase-js";
import type { Project } from "@/lib/types";

export async function getLatestProject(
  supabase: SupabaseClient,
  userId: string
): Promise<Project | null> {
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}
