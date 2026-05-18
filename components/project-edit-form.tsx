"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Project } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";

export function ProjectEditForm({ project }: { project: Project }) {
  const supabase = createClient();

  const [name, setName] = useState(project.name);
  const [budget, setBudget] = useState(String(project.total_budget).replace(".", ","));
  const [startDate, setStartDate] = useState(project.start_date ?? "");
  const [endDate, setEndDate] = useState(project.end_date ?? "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    const parsedBudget = parseFloat(budget.replace(",", "."));
    if (isNaN(parsedBudget) || parsedBudget < 0) {
      setError("Informe um orçamento válido.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("projects")
      .update({
        name: name.trim() || project.name,
        total_budget: parsedBudget,
        start_date: startDate || null,
        end_date: endDate || null,
      })
      .eq("id", project.id);

    if (updateError) {
      setError("Erro ao salvar. Tente novamente.");
    } else {
      setSuccess(true);
    }
    setLoading(false);
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

      {error && (
        <div className="rounded-xl bg-red-900/30 border border-red-800 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl bg-emerald-900/30 border border-emerald-800 px-4 py-3 text-sm text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Obra atualizada com sucesso!
        </div>
      )}

      <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Salvar alterações"}
      </Button>
    </form>
  );
}
