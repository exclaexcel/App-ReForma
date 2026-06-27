"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Supplier, SupplierSpecialty, SUPPLIER_SPECIALTIES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowLeft, Trash2, Star, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/confirm-dialog";

type SupplierFormProps = {
  projectId: string;
  initialSupplier?: Supplier;
};

export function SupplierForm({ projectId, initialSupplier }: SupplierFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialSupplier);

  const [name, setName] = useState(initialSupplier?.name ?? "");
  const [specialty, setSpecialty] = useState<SupplierSpecialty | "">(
    (initialSupplier?.specialty as SupplierSpecialty) ?? ""
  );
  const [whatsapp, setWhatsapp] = useState(initialSupplier?.whatsapp ?? "");
  const [budgetUrl, setBudgetUrl] = useState(initialSupplier?.budget_url ?? "");
  const [rating, setRating] = useState<number | null>(initialSupplier?.rating ?? null);
  const [notes, setNotes] = useState(initialSupplier?.notes ?? "");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const toastId = toast.loading("Salvando...");

    try {
      const supabase = createClient();

      // Validate budget URL if provided
      const trimmedBudgetUrl = budgetUrl.trim();
      if (trimmedBudgetUrl) {
        try {
          new URL(trimmedBudgetUrl);
        } catch {
          setError("Link do orçamento inválido. Use uma URL completa (ex: https://...)");
          toast.dismiss(toastId);
          setLoading(false);
          return;
        }
      }

      const payload = {
        name: name.trim(),
        specialty: specialty || null,
        whatsapp: whatsapp.trim() || null,
        budget_url: trimmedBudgetUrl || null,
        rating,
        notes: notes.trim() || null,
      };

      if (isEditing && initialSupplier) {
        const { error: updateError } = await supabase
          .from("suppliers")
          .update(payload)
          .eq("id", initialSupplier.id);
        if (updateError) throw updateError;
        toast.success("Fornecedor atualizado", { id: toastId });
        router.push("/fornecedores");
        router.refresh();
      } else {
        const { error: insertError } = await supabase
          .from("suppliers")
          .insert({ project_id: projectId, ...payload });
        if (insertError) throw insertError;
        toast.success("Fornecedor cadastrado", { id: toastId });
        router.push("/fornecedores");
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao salvar fornecedor.";
      setError(message);
      toast.error(message, { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!initialSupplier) return;
    setDeleting(true);
    const toastId = toast.loading("Deletando...");
    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from("suppliers")
        .delete()
        .eq("id", initialSupplier.id);
      if (deleteError) throw deleteError;
      toast.success("Fornecedor excluído", { id: toastId });
      router.push("/fornecedores");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao excluir fornecedor.";
      setError(message);
      toast.error(message, { id: toastId });
      setDeleting(false);
    }
    setShowDeleteDialog(false);
  }

  return (
    <div className="min-h-dvh bg-stone-50 dark:bg-zinc-900 pb-24">
      <div className="sticky top-0 bg-stone-50/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-stone-200 dark:border-zinc-800 z-10 px-4 py-4 flex items-center gap-3">
        <Link
          href="/fornecedores"
          className="dark:text-zinc-400 dark:hover:text-zinc-100 text-stone-500 hover:text-stone-900 transition-colors duration-150"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold dark:text-zinc-100 text-stone-900 flex-1">
          {isEditing ? "Editar Fornecedor" : "Novo Fornecedor"}
        </h1>
        {isEditing && (
          <button
            type="button"
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleting}
            aria-label="Excluir fornecedor"
            className="text-red-500 hover:text-red-400 disabled:opacity-50 p-3 transition-colors duration-150"
          >
            {deleting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Trash2 className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            type="text"
            placeholder="Ex: João Elétrica"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="text-2xl font-bold h-14"
          />
        </div>

        <div className="space-y-2">
          <Label>Especialidade</Label>
          <Select value={specialty} onValueChange={(v) => setSpecialty(v as SupplierSpecialty)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar especialidade" />
            </SelectTrigger>
            <SelectContent>
              {SUPPLIER_SPECIALTIES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            type="tel"
            pattern="[\d\s\(\)\-\+]{10,15}"
            placeholder="Ex: (11) 99999-9999"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget_url">Link do Orçamento</Label>
          <div className="flex gap-2">
            <Input
              id="budget_url"
              type="url"
              placeholder="Ex: https://drive.google.com/..."
              value={budgetUrl}
              onChange={(e) => setBudgetUrl(e.target.value)}
            />
            {budgetUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.open(budgetUrl, "_blank")}
                aria-label="Abrir orçamento em nova aba"
                className="px-3"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Avaliação</Label>
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => {
              const value = i + 1;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(rating === value ? null : value)}
                  className="p-1 transition-transform active:scale-90"
                >
                  <Star
                    className={cn(
                      "h-7 w-7 transition-colors",
                      rating != null && value <= rating
                        ? "fill-orange-400 text-orange-400"
                        : "text-zinc-600 dark:text-zinc-600 text-stone-300"
                    )}
                  />
                </button>
              );
            })}
            {rating != null && (
              <span className="text-xs text-zinc-500 dark:text-zinc-500 text-stone-400 ml-1">
                {rating}/5
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Observações</Label>
          <textarea
            id="notes"
            placeholder="Ex: Trabalho impecável na instalação elétrica do 2º andar"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-0 resize-none"
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-100 dark:bg-red-900/30 border border-red-300/60 dark:border-red-800/60 px-4 py-3 text-sm text-red-700 dark:text-red-400 shadow-sm shadow-red-900/10">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isEditing ? (
            "Salvar Alterações"
          ) : (
            "Salvar Fornecedor"
          )}
        </Button>
      </form>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Excluir fornecedor?"
        description="Esta ação não pode ser desfeita."
        actionLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        isLoading={deleting}
      />
    </div>
  );
}
