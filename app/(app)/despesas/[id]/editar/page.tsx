import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ExpenseForm } from "@/components/expense-form";
import { getStoragePath } from "@/lib/utils";

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

  // Verify ownership: ensure the expense's project belongs to the logged-in user
  const { data: ownerProject } = await supabase
    .from("projects")
    .select("id")
    .eq("id", expense.project_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!ownerProject) redirect("/despesas");

  const [
    { data: categories, error: catError },
    { data: rooms, error: roomError },
    { data: suppliers, error: supError },
  ] = await Promise.all([
    supabase.from("categories").select("*").eq("project_id", expense.project_id).order("name"),
    supabase.from("rooms").select("*").eq("project_id", expense.project_id).order("name"),
    supabase.from("suppliers").select("*").eq("project_id", expense.project_id).order("name"),
  ]);

  if (catError) throw catError;
  if (roomError) throw roomError;
  if (supError) throw supError;

  let initialSignedUrl: string | null = null;
  if (expense.receipt_url) {
    const path = getStoragePath(expense.receipt_url);
    const { data: signedData } = await supabase.storage
      .from("receipts")
      .createSignedUrl(path, 3600);
    initialSignedUrl = signedData?.signedUrl ?? null;
  }

  return (
    <ExpenseForm
      projectId={expense.project_id}
      categories={categories ?? []}
      rooms={rooms ?? []}
      suppliers={suppliers ?? []}
      initialExpense={expense}
      initialSignedUrl={initialSignedUrl}
    />
  );
}
