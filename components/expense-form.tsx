"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Category, Room, Expense, PaymentMethod, PAYMENT_METHOD_LABELS, ExpenseType, EXPENSE_TYPES, EXPENSE_TYPE_LABELS, Supplier } from "@/lib/types";
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
import { ConfirmDialog } from "@/components/confirm-dialog";

type ExpenseFormProps = {
  projectId: string;
  categories: Category[];
  rooms?: Room[];
  suppliers?: Supplier[];
  initialExpense?: Expense;
  initialSignedUrl?: string | null;
};

export function ExpenseForm({ projectId, categories, rooms = [], suppliers = [], initialExpense, initialSignedUrl }: ExpenseFormProps) {
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
  const [roomId, setRoomId] = useState(initialExpense?.room_id ?? "");
  const [expenseType, setExpenseType] = useState<ExpenseType>(
    initialExpense?.expense_type ?? "outro"
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    initialExpense?.payment_method ?? "pix"
  );
  const [supplierId, setSupplierId] = useState(initialExpense?.supplier_id ?? "");
  const [isPaid, setIsPaid] = useState(initialExpense?.is_paid ?? false);
  const [paidAt, setPaidAt] = useState(initialExpense?.paid_at ?? today);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(
    initialSignedUrl ?? null
  );
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [invoicePreview, setInvoicePreview] = useState<string | null>(
    initialExpense?.invoice_url ?? null
  );
  const [invoiceNumber, setInvoiceNumber] = useState(initialExpense?.invoice_number ?? "");
  const [invoiceValue, setInvoiceValue] = useState(
    initialExpense?.invoice_value ? String(initialExpense.invoice_value).replace(".", ",") : ""
  );
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, field: "receipt" | "invoice") {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("O arquivo deve ter no máximo 5 MB.");
      e.target.value = "";
      return;
    }
    setError(null);
    const url = URL.createObjectURL(file);
    if (field === "receipt") {
      setReceiptFile(file);
      setReceiptPreview(url);
    } else {
      setInvoiceFile(file);
      setInvoicePreview(url);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const toastId = toast.loading("Salvando...");

    try {
      const supabase = createClient();
      const parsedAmount = parseFloat(amount.replace(",", "."));
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setError("Informe um valor válido.");
        toast.dismiss(toastId);
        return;
      }

      let receiptUrl: string | null = initialExpense?.receipt_url ?? null;
      let invoiceUrl: string | null = initialExpense?.invoice_url ?? null;

      if (receiptFile || invoiceFile) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError("Sessão expirada. Por favor, faça login novamente.");
          toast.dismiss(toastId);
          return;
        }

        if (receiptFile) {
          const fileName = `${user.id}/${Date.now()}-receipt-${receiptFile.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("receipts")
            .upload(fileName, receiptFile);
          if (uploadError) throw uploadError;
          receiptUrl = uploadData.path;
        }

        if (invoiceFile) {
          const fileName = `${user.id}/${Date.now()}-invoice-${invoiceFile.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("receipts")
            .upload(fileName, invoiceFile);
          if (uploadError) throw uploadError;
          invoiceUrl = uploadData.path;
        }
      }

      const parsedInvoiceValue = invoiceValue
        ? parseFloat(invoiceValue.replace(",", "."))
        : null;

      const payload = {
        category_id: categoryId || null,
        room_id: roomId || null,
        supplier_id: supplierId || null,
        expense_type: expenseType,
        description,
        amount: parsedAmount,
        expense_date: date,
        payment_method: paymentMethod,
        is_paid: isPaid,
        paid_at: isPaid ? paidAt : null,
        receipt_url: receiptUrl,
        invoice_url: invoiceUrl,
        invoice_number: invoiceNumber || null,
        invoice_value: parsedInvoiceValue,
      };

      if (isEditing && initialExpense) {
        const { error: updateError } = await supabase
          .from("expenses")
          .update(payload)
          .eq("id", initialExpense.id);
        if (updateError) throw updateError;
        toast.success("Despesa atualizada", { id: toastId });
        router.push("/despesas");
        router.refresh();
      } else {
        const { error: insertError } = await supabase.from("expenses").insert({
          project_id: projectId,
          ...payload,
        });
        if (insertError) throw insertError;
        toast.success("Despesa lançada com sucesso", { id: toastId });
        router.push("/despesas");
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao salvar despesa.";
      setError(message);
      toast.error(message, { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!initialExpense) return;
    setDeleting(true);
    const toastId = toast.loading("Deletando...");
    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from("expenses")
        .delete()
        .eq("id", initialExpense.id);
      if (deleteError) throw deleteError;
      toast.success("Despesa excluída", { id: toastId });
      router.push("/despesas");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao excluir despesa.";
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
          href={isEditing ? "/despesas" : "/"}
          className="text-stone-500 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors duration-150"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold dark:text-zinc-100 text-stone-900 flex-1">
          {isEditing ? "Editar Lançamento" : "Novo Lançamento"}
        </h1>
        {isEditing && (
          <button
            type="button"
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleting}
            aria-label="Excluir despesa"
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

        {suppliers.length > 0 && (
          <div className="space-y-2">
            <Label>Fornecedor</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar fornecedor (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sem fornecedor</SelectItem>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}{s.specialty ? ` · ${s.specialty}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label>Tipo de Despesa *</Label>
          <Select value={expenseType} onValueChange={(val) => setExpenseType(val as ExpenseType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {EXPENSE_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-stone-500 dark:text-zinc-400">
            {expenseType === "mao_obra" && "Requer comprovante de pagamento"}
            {expenseType === "material" && "Requer comprovante e nota fiscal"}
            {expenseType === "loja" && "Requer comprovante e nota fiscal"}
            {expenseType === "servico" && "Requer comprovante (NF quando PJ)"}
            {expenseType === "outro" && "Sem requisitos específicos"}
          </p>
        </div>

        {rooms.length > 0 && (
          <div className="space-y-2">
            <Label>Cômodo</Label>
            <Select value={roomId} onValueChange={setRoomId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar cômodo" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label>Forma de Pagamento</Label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][]).map(
              ([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPaymentMethod(key)}
                  className={`rounded-xl border py-2 px-2 text-xs font-medium transition-all duration-200 active:scale-95 ${
                    paymentMethod === key
                      ? "border-orange-600 bg-orange-700/20 text-orange-400"
                      : "border-stone-300 dark:border-zinc-700 bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-zinc-400 hover:border-stone-400 dark:hover:border-zinc-600 hover:bg-stone-200"
                  }`}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-stone-200/60 dark:border-zinc-700/60 bg-stone-100 dark:bg-zinc-800 p-4 shadow-sm transition-all duration-200">
          <Checkbox
            id="is_paid"
            checked={isPaid}
            onCheckedChange={(v) => setIsPaid(Boolean(v))}
          />
          <Label htmlFor="is_paid" className="cursor-pointer dark:text-zinc-100 text-stone-900">
            Já está pago
          </Label>
        </div>

        {isPaid && (
          <div className="space-y-2">
            <Label htmlFor="paid_at">Data do Pagamento</Label>
            <Input
              id="paid_at"
              type="date"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              required
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>
            Comprovante de Pagamento
            {expenseType !== "outro" && <span className="text-red-500"> *</span>}
            {expenseType === "outro" && " (opcional)"}
          </Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            capture="environment"
            onChange={(e) => handleFileChange(e, "receipt")}
            className="hidden"
          />
          {receiptPreview ? (
            <div className="relative rounded-xl overflow-hidden border border-stone-200/60 dark:border-zinc-700/60 shadow-sm">
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
                className="absolute top-2 right-2 rounded-full bg-stone-900/80 dark:bg-zinc-900/80 p-1.5 text-stone-100 dark:text-zinc-300 text-xs hover:bg-stone-900 dark:hover:bg-zinc-900 transition-colors duration-150"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 dark:border-zinc-700 bg-stone-100/50 dark:bg-zinc-800/50 py-6 text-sm text-stone-400 dark:text-zinc-500 hover:border-stone-400 dark:hover:border-zinc-600 hover:text-stone-600 dark:hover:text-zinc-400 transition-all duration-200 active:scale-95"
            >
              <Camera className="h-5 w-5" />
              Tirar foto, escolher da galeria ou PDF
            </button>
          )}
        </div>

        {(expenseType === "material" || expenseType === "loja" || expenseType === "servico") && (
          <>
            <div className="space-y-2">
              <Label>
                Nota Fiscal
                {(expenseType === "material" || expenseType === "loja") && (
                  <span className="text-red-500"> *</span>
                )}
                {expenseType === "servico" && " (opcional, se PJ)"}
              </Label>
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Número da NF"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="text-sm"
                />
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="Valor da NF (R$)"
                  value={invoiceValue}
                  onChange={(e) => setInvoiceValue(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Arquivo da Nota Fiscal</Label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => handleFileChange(e, "invoice")}
                className="hidden"
                id="invoice-input"
              />
              {invoicePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-stone-200/60 dark:border-zinc-700/60 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={invoicePreview}
                    alt="Nota Fiscal"
                    className="w-full h-40 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setInvoiceFile(null);
                      setInvoicePreview(null);
                    }}
                    className="absolute top-2 right-2 rounded-full bg-stone-900/80 dark:bg-zinc-900/80 p-1.5 text-stone-100 dark:text-zinc-300 text-xs hover:bg-stone-900 dark:hover:bg-zinc-900 transition-colors duration-150"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="invoice-input"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 dark:border-zinc-700 bg-stone-100/50 dark:bg-zinc-800/50 py-6 text-sm text-stone-400 dark:text-zinc-500 hover:border-stone-400 dark:hover:border-zinc-600 hover:text-stone-600 dark:hover:text-zinc-400 transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  <Camera className="h-5 w-5" />
                  Tirar foto, escolher da galeria ou PDF
                </label>
              )}
            </div>
          </>
        )}

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
            "Salvar Lançamento"
          )}
        </Button>
      </form>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Excluir despesa?"
        description="Esta ação não pode ser desfeita."
        actionLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        isLoading={deleting}
      />
    </div>
  );
}
