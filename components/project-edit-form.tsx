"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Project } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { computeInstallmentDueDate } from "@/lib/utils";

export function ProjectEditForm({ project }: { project: Project }) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState(project.name);
  const [budget, setBudget] = useState(String(project.total_budget).replace(".", ","));
  const [startDate, setStartDate] = useState(project.start_date ?? "");
  const [endDate, setEndDate] = useState(project.end_date ?? "");
  const [cardDueDay, setCardDueDay] = useState(
    project.card_due_day != null ? String(project.card_due_day) : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function recalculatePendingCardInstallments(dueDay: number) {
    const { data: expenses, error: expError } = await supabase
      .from("expenses")
      .select("id, expense_date")
      .eq("project_id", project.id)
      .eq("status", "ativo");

    if (expError) throw expError;
    if (!expenses?.length) return 0;

    const expenseIds = expenses.map((e) => e.id);
    const expenseDateById = new Map(expenses.map((e) => [e.id, e.expense_date]));

    const { data: installments, error: instError } = await supabase
      .from("installments")
      .select("id, expense_id, installment_number, payment_method, status")
      .in("expense_id", expenseIds)
      .eq("payment_method", "cartao_credito")
      .eq("status", "pending");

    if (instError) throw instError;
    if (!installments?.length) return 0;

    let updated = 0;
    for (const row of installments) {
      const expenseDate = expenseDateById.get(row.expense_id);
      if (!expenseDate) continue;
      const due_date = computeInstallmentDueDate(
        expenseDate,
        row.installment_number - 1,
        "cartao_credito",
        dueDay
      );
      const { error: updError } = await supabase
        .from("installments")
        .update({ due_date })
        .eq("id", row.id)
        .eq("status", "pending");
      if (updError) throw updError;
      updated += 1;
    }
    return updated;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const parsedBudget = parseFloat(budget.replace(",", "."));
    if (isNaN(parsedBudget) || parsedBudget < 0) {
      setError("Informe um orçamento válido.");
      setLoading(false);
      return;
    }

    let parsedCardDueDay: number | null = null;
    if (cardDueDay.trim() !== "") {
      parsedCardDueDay = parseInt(cardDueDay, 10);
      if (isNaN(parsedCardDueDay) || parsedCardDueDay < 1 || parsedCardDueDay > 28) {
        setError("Dia do cartão deve ser um número entre 1 e 28.");
        setLoading(false);
        return;
      }
    }

    const { error: updateError } = await supabase
      .from("projects")
      .update({
        name: name.trim() || project.name,
        total_budget: parsedBudget,
        start_date: startDate || null,
        end_date: endDate || null,
        card_due_day: parsedCardDueDay,
      })
      .eq("id", project.id);

    if (updateError) {
      setError("Erro ao salvar. Tente novamente.");
      setLoading(false);
      return;
    }

    try {
      if (parsedCardDueDay != null) {
        await recalculatePendingCardInstallments(parsedCardDueDay);
      }
      toast.success("Obra atualizada");
      router.push("/");
      router.refresh();
    } catch {
      setError("Obra salva, mas falhou ao recalcular vencimentos do cartão. Tente salvar de novo.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da obra</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget">Orçamento total (R$)</Label>
        <Input
          id="budget"
          type="text"
          inputMode="decimal"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="startDate">Data de início</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Previsão de término</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cardDueDay">Dia do vencimento do cartão</Label>
        <Input
          id="cardDueDay"
          type="number"
          inputMode="numeric"
          min={1}
          max={28}
          placeholder="Ex: 10"
          value={cardDueDay}
          onChange={(e) => setCardDueDay(e.target.value)}
        />
        <p className="text-xs text-stone-500 dark:text-zinc-400">
          Usado no fluxo de caixa e no atraso de parcelas no crédito (1–28). Ao salvar, recalcula
          vencimentos pendentes de cartão.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-900/30 border border-red-800 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Salvar alterações"}
      </Button>
    </form>
  );
}
