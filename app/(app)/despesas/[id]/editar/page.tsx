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

  // Redirect if expense is cancelled
  if (expense.status === "cancelado") redirect("/despesas");

  // Verify ownership: ensure the expense's project belongs to the logged-in user
  const { data: ownerProject } = await supabase
    .from("projects")
    .select("id")
    .eq("id", expense.project_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!ownerProject) redirect("/despesas");

  const [{ data: categories, error: catError }, { data: suppliers, error: supError }] =
    await Promise.all([
      supabase.from("categories").select("*").eq("project_id", expense.project_id).order("name"),
      supabase.from("suppliers").select("*").eq("project_id", expense.project_id).order("name"),
    ]);

  if (catError) throw catError;
  if (supError) throw supError;

  const { data: installments, error: installmentsError } = await supabase
    .from("installments")
    .select(
      "id, amount, status, due_date, installment_number, paid_at, payment_method, total_installments"
    )
    .eq("expense_id", expense.id)
    .order("installment_number", { ascending: true });

  if (installmentsError) throw installmentsError;

  let initialSignedUrl: string | null = null;
  if (expense.receipt_url) {
    const path = getStoragePath(expense.receipt_url);
    const { data: signedData } = await supabase.storage
      .from("receipts")
      .createSignedUrl(path, 60 * 60 * 24 * 7);
    initialSignedUrl = signedData?.signedUrl ?? null;
  }

  return (
    <ExpenseForm
      projectId={expense.project_id}
      categories={categories ?? []}
      suppliers={suppliers ?? []}
      initialExpense={expense}
      initialSignedUrl={initialSignedUrl}
      initialInstallments={installments ?? []}
    />
  );
}
