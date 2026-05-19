"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Category, Expense, PaymentMethod, PAYMENT_METHOD_LABELS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, Loader2, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";

type ExpenseFormProps = {
  projectId: string;
  categories: Category[];
  initialExpense?: Expense;
};

export function ExpenseForm({ projectId, categories, initialExpense }: ExpenseFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(initialExpense);

  const today = new Date().toISOString().split("T")[0];

  const [amount, setAmount] = useState(
    initialExpense ? String(initialExpense.amount).replace(".", ",") : ""
  );
  const [date, setDate] = useState(initialExpense?.expense_date ?? today);
  const [description, setDescription] = useState(initialExpense?.description ?? "");
  const [categoryId, setCategoryId] = useState(initialExpense?.category_id ?? "");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    initialExpense?.payment_method ?? "pix"
  );
  const [isPaid, setIsPaid] = useState(initialExpense?.is_paid ?? false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(
    initialExpense?.receipt_url ?? null
  );
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptFile(file);
    const url = URL.createObjectURL(file);
    setReceiptPreview(url);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const parsedAmount = parseFloat(amount.replace(",", "."));
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setError("Informe um valor válido.");
        return;
      }

      let receiptUrl: string | null = initialExpense?.receipt_url ?? null;

      if (receiptFile) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const fileName = `${user!.id}/${Date.now()}-${receiptFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("receipts")
          .upload(fileName, receiptFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from("receipts")
          .getPublicUrl(uploadData.path);
        receiptUrl = urlData.publicUrl;
      }

      const payload = {
        category_id: categoryId || null,
        description,
        amount: parsedAmount,
        expense_date: date,
        payment_method: paymentMethod,
        is_paid: isPaid,
        receipt_url: receiptUrl,
      };

      if (isEditing && initialExpense) {
        const { error: updateError } = await supabase
          .from("expenses")
          .update(payload)
          .eq("id", initialExpense.id);
        if (updateError) throw updateError;
        router.push("/despesas");
        router.refresh();
      } else {
        const { error: insertError } = await supabase.from("expenses").insert({
          project_id: projectId,
          ...payload,
        });
        if (insertError) throw insertError;
        router.push("/");
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao salvar despesa.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!initialExpense) return;
    if (!window.confirm("Excluir esta despesa? Esta ação não pode ser desfeita.")) return;
    setDeleting(true);
    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from("expenses")
        .delete()
        .eq("id", initialExpense.id);
      if (deleteError) throw deleteError;
      router.push("/despesas");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao excluir despesa.";
      setError(message);
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-dvh bg-zinc-900 pb-8">
      <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800 z-10 px-4 py-4 flex items-center gap-3">
        <Link
          href={isEditing ? "/despesas" : "/"}
          className="text-zinc-400 hover:text-zinc-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold text-zinc-100 flex-1">
          {isEditing ? "Editar Lançamento" : "Novo Lançamento"}
        </h1>
        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-500 hover:text-red-400 disabled:opacity-50 p-1"
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
          <Label htmlFor="amount">Valor (R$)</Label>
          <Input
            id="amount"
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus={!isEditing}
            required
            className="text-2xl font-bold h-14"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            type="text"
            placeholder="Ex: Cimento e areia"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color_hex }}
                      />
                      {cat.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Forma de Pagamento</Label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][]).map(
              ([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPaymentMethod(key)}
                  className={`rounded-xl border py-2 px-2 text-xs font-medium transition-colors ${
                    paymentMethod === key
                      ? "border-orange-600 bg-orange-700/20 text-orange-400"
                      : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-800 p-4">
          <Checkbox
            id="is_paid"
            checked={isPaid}
            onCheckedChange={(v) => setIsPaid(Boolean(v))}
          />
          <Label htmlFor="is_paid" className="cursor-pointer">
            Já está pago
          </Label>
        </div>

        <div className="space-y-2">
          <Label>Comprovante (opcional)</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
          {receiptPreview ? (
            <div className="relative rounded-xl overflow-hidden border border-zinc-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={receiptPreview}
                alt="Comprovante"
                className="w-full h-40 object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setReceiptFile(null);
                  setReceiptPreview(null);
                }}
                className="absolute top-2 right-2 rounded-full bg-zinc-900/80 p-1.5 text-zinc-300 text-xs"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 bg-zinc-800/50 py-6 text-sm text-zinc-500 hover:border-zinc-600 hover:text-zinc-400 transition-colors"
            >
              <Camera className="h-5 w-5" />
              Tirar foto ou escolher da galeria
            </button>
          )}
        </div>

        {error && (
          <div className="rounded-xl bg-red-900/30 border border-red-800 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isEditing ? (
            "Salvar Alterações"
          ) : (
            "Salvar Lançamento"
          )}
        </Button>
      </form>
    </div>
  );
}
