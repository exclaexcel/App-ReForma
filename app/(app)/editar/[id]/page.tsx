import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ExpenseForm } from "@/components/expense-form";
import { Expense } from "@/lib/types";

export default async function EditarPage({ params }: { params: { id: string } }) {
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

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("project_id", expense.project_id)
    .order("name");

  return (
    <ExpenseForm
      projectId={expense.project_id}
      categories={categories ?? []}
      initialExpense={expense as Expense}
    />
  );
}
