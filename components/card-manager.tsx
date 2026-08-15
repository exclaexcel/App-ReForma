"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { computeInstallmentDueDate } from "@/lib/utils";

type CardManagerProps = {
  projectId: string;
};

function parseDay(value: string, label: string): number | null {
  const n = parseInt(value, 10);
  if (isNaN(n) || n < 1 || n > 28) {
    toast.error(`${label} deve ser um número entre 1 e 28.`);
    return null;
  }
  return n;
}

export function CardManager({ projectId }: CardManagerProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [closingDay, setClosingDay] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Card | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("cards")
      .select("id, project_id, name, due_day, closing_day, created_at")
      .eq("project_id", projectId)
      .order("name");

    if (error) {
      toast.error("Erro ao carregar cartões.");
      setCards([]);
    } else {
      setCards((data ?? []) as Card[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function recalculatePendingForCard(card: {
    id: string;
    due_day: number;
    closing_day: number;
  }) {
    const supabase = createClient();
    const { data: expenses, error: expError } = await supabase
      .from("expenses")
      .select("id, expense_date")
      .eq("project_id", projectId)
      .eq("card_id", card.id)
      .eq("status", "ativo");

    if (expError) throw expError;
    if (!expenses?.length) return 0;

    const expenseIds = expenses.map((e) => e.id);
    const expenseDateById = new Map(expenses.map((e) => [e.id, e.expense_date]));

    const { data: installments, error: instError } = await supabase
      .from("installments")
      .select("id, expense_id, installment_number")
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
        card.due_day,
        card.closing_day
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

  function resetForm() {
    setName("");
    setClosingDay("");
    setDueDay("");
    setEditingId(null);
  }

  function startEdit(card: Card) {
    setEditingId(card.id);
    setName(card.name);
    setClosingDay(String(card.closing_day));
    setDueDay(String(card.due_day));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Informe o nome do cartão.");
      return;
    }
    const parsedClosing = parseDay(closingDay, "Dia de fechamento");
    if (parsedClosing == null) return;
    const parsedDue = parseDay(dueDay, "Dia de vencimento");
    if (parsedDue == null) return;

    setSaving(true);
    const supabase = createClient();

    try {
      if (editingId) {
        const { error } = await supabase
          .from("cards")
          .update({
            name: trimmed,
            closing_day: parsedClosing,
            due_day: parsedDue,
          })
          .eq("id", editingId);

        if (error) throw error;

        const n = await recalculatePendingForCard({
          id: editingId,
          due_day: parsedDue,
          closing_day: parsedClosing,
        });
        toast.success(
          n > 0
            ? `Cartão atualizado · ${n} vencimento${n !== 1 ? "s" : ""} pendente${n !== 1 ? "s" : ""} recalculado${n !== 1 ? "s" : ""}`
            : "Cartão atualizado"
        );
      } else {
        const { error } = await supabase.from("cards").insert({
          project_id: projectId,
          name: trimmed,
          closing_day: parsedClosing,
          due_day: parsedDue,
        });
        if (error) throw error;
        toast.success("Cartão criado.");
      }
      resetForm();
      await load();
    } catch {
      toast.error(
        editingId ? "Não foi possível atualizar o cartão." : "Não foi possível criar o cartão."
      );
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!toDelete) return;
    setDeleting(true);
    const supabase = createClient();

    const { count } = await supabase
      .from("expenses")
      .select("id", { count: "exact", head: true })
      .eq("card_id", toDelete.id)
      .neq("status", "cancelado");

    if ((count ?? 0) > 0) {
      toast.error("Há despesas usando este cartão. Reatribua antes de excluir.");
      setDeleting(false);
      setToDelete(null);
      return;
    }

    const { error } = await supabase.from("cards").delete().eq("id", toDelete.id);
    if (error) {
      toast.error("Erro ao excluir cartão.");
    } else {
      toast.success("Cartão excluído.");
      if (editingId === toDelete.id) resetForm();
      await load();
    }
    setDeleting(false);
    setToDelete(null);
  }

  return (
    <div className="space-y-4 rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4">
      <div>
        <h2 className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Cartões</h2>
        <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1">
          Fechamento (corte) + vencimento da fatura. Compra até o dia do corte vence neste ciclo;
          depois do corte, no próximo.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
        </div>
      ) : cards.length === 0 ? (
        <p className="text-sm text-stone-500 dark:text-zinc-500 py-2">Nenhum cartão ainda.</p>
      ) : (
        <ul className="divide-y divide-stone-100 dark:divide-zinc-700/80">
          {cards.map((card) => (
            <li key={card.id} className="flex items-center gap-3 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-900 dark:text-zinc-100 truncate">
                  {card.name}
                </p>
                <p className="text-xs text-stone-500 dark:text-zinc-400">
                  Fecha dia {card.closing_day} · paga dia {card.due_day}
                </p>
              </div>
              <button
                type="button"
                onClick={() => startEdit(card)}
                aria-label={`Editar ${card.name}`}
                className="p-2 text-stone-400 hover:text-orange-700 dark:hover:text-orange-500"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setToDelete(card)}
                aria-label={`Excluir ${card.name}`}
                className="p-2 text-stone-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={handleSave}
        className="space-y-3 pt-1 border-t border-stone-100 dark:border-zinc-700"
      >
        <p className="text-xs font-medium text-stone-600 dark:text-zinc-400">
          {editingId ? "Editar cartão" : "Novo cartão"}
        </p>
        <div className="space-y-2">
          <Label htmlFor="cardName">Nome</Label>
          <Input
            id="cardName"
            placeholder="Ex: Nubank, Inter"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="cardClosing">Fechamento</Label>
            <Input
              id="cardClosing"
              type="number"
              inputMode="numeric"
              min={1}
              max={28}
              placeholder="Ex: 12"
              value={closingDay}
              onChange={(e) => setClosingDay(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cardDue">Vencimento</Label>
            <Input
              id="cardDue"
              type="number"
              inputMode="numeric"
              min={1}
              max={28}
              placeholder="Ex: 25"
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="flex-1 h-11" disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : editingId ? (
              "Salvar cartão"
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </>
            )}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" className="h-11" onClick={resetForm}>
              Cancelar
            </Button>
          )}
        </div>
      </form>

      <ConfirmDialog
        open={!!toDelete}
        title="Excluir cartão?"
        description={
          toDelete
            ? `Remover “${toDelete.name}”? Despesas vinculadas precisam ser reatribuídas antes.`
            : ""
        }
        actionLabel="Excluir"
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
