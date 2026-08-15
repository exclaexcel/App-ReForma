"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_CATEGORIES } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { HardHat, Loader2 } from "lucide-react";

export function CreateFirstProject({ userId }: { userId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardClosingDay, setCardClosingDay] = useState("");
  const [cardDueDay, setCardDueDay] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const parsedBudget = parseFloat(budget.replace(",", "."));
    if (isNaN(parsedBudget) || parsedBudget < 0) {
      setError("Informe um orçamento válido.");
      setLoading(false);
      return;
    }

    const hasCardFields =
      cardName.trim() !== "" || cardClosingDay.trim() !== "" || cardDueDay.trim() !== "";

    let parsedClosing: number | null = null;
    let parsedDue: number | null = null;
    if (hasCardFields) {
      if (!cardName.trim()) {
        setError("Informe o nome do cartão.");
        setLoading(false);
        return;
      }
      parsedClosing = parseInt(cardClosingDay, 10);
      parsedDue = parseInt(cardDueDay, 10);
      if (
        isNaN(parsedClosing) ||
        parsedClosing < 1 ||
        parsedClosing > 28 ||
        isNaN(parsedDue) ||
        parsedDue < 1 ||
        parsedDue > 28
      ) {
        setError("Fechamento e vencimento do cartão devem ser entre 1 e 28.");
        setLoading(false);
        return;
      }
    }

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        user_id: userId,
        name: name || "Minha Reforma",
        total_budget: parsedBudget,
        start_date: startDate || null,
        end_date: endDate || null,
        card_due_day: parsedDue,
      })
      .select()
      .maybeSingle();

    if (projectError || !project) {
      setError("Erro ao criar obra. Tente novamente.");
      setLoading(false);
      return;
    }

    const { error: categoriesError } = await supabase
      .from("categories")
      .insert(DEFAULT_CATEGORIES.map((cat) => ({ ...cat, project_id: project.id })));

    if (categoriesError) {
      setError("Obra criada, mas erro ao adicionar categorias.");
      setLoading(false);
      return;
    }

    if (parsedClosing != null && parsedDue != null) {
      const { error: cardError } = await supabase.from("cards").insert({
        project_id: project.id,
        name: cardName.trim(),
        closing_day: parsedClosing,
        due_day: parsedDue,
      });
      if (cardError) {
        setError("Obra criada, mas erro ao adicionar o cartão. Configure em Editar obra.");
        setLoading(false);
        return;
      }
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh gap-6 px-6 text-center bg-stone-50 dark:bg-zinc-900">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-700/20 border border-orange-700/30">
        <HardHat className="h-8 w-8 text-orange-600 dark:text-orange-500" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-stone-900 dark:text-zinc-100">Configure sua obra</h2>
        <p className="text-sm text-stone-500 dark:text-zinc-500 mt-1">
          Crie sua primeira obra para começar
        </p>
      </div>

      <form onSubmit={handleCreate} className="w-full max-w-sm space-y-4 text-left">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da obra</Label>
          <Input
            id="name"
            placeholder="Ex: Reforma Apartamento Centro"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="budget">Orçamento total (R$)</Label>
          <Input
            id="budget"
            inputMode="decimal"
            placeholder="Ex: 30000"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="startDate">Início (opcional)</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">Término (opcional)</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div className="rounded-xl border border-stone-200 dark:border-zinc-700 p-3 space-y-3">
          <p className="text-xs font-medium text-stone-600 dark:text-zinc-400">Cartão (opcional)</p>
          <div className="space-y-2">
            <Label htmlFor="cardName">Nome</Label>
            <Input
              id="cardName"
              placeholder="Ex: Nubank"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="cardClosingDay">Fechamento</Label>
              <Input
                id="cardClosingDay"
                type="number"
                inputMode="numeric"
                min={1}
                max={28}
                placeholder="Ex: 12"
                value={cardClosingDay}
                onChange={(e) => setCardClosingDay(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardDueDay">Vencimento</Label>
              <Input
                id="cardDueDay"
                type="number"
                inputMode="numeric"
                min={1}
                max={28}
                placeholder="Ex: 25"
                value={cardDueDay}
                onChange={(e) => setCardDueDay(e.target.value)}
              />
            </div>
          </div>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" className="w-full h-12" disabled={loading}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Criar obra e começar"}
        </Button>
      </form>
    </div>
  );
}
