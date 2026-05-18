import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ExpenseEditForm } from "@/components/expense-edit-form";

export default async function EditExpensePage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: expense } = await supabase
    .from("expenses")
    .select("*, categories(id, name, color_hex)")
    .eq("id", params.id)
    .maybeSingle();

  if (!expense) redirect("/despesas");

  const [{ data: categories, error: catError }, { data: rooms, error: roomError }] = await Promise.all([
    supabase.from("categories").select("*").eq("project_id", expense.project_id).order("name"),
    supabase.from("rooms").select("*").eq("project_id", expense.project_id).order("name"),
  ]);

  if (catError) throw catError;
  if (roomError) throw roomError;

  return (
    <ExpenseEditForm
      expense={expense}
      categories={categories ?? []}
      rooms={rooms ?? []}
    />
  );
}
