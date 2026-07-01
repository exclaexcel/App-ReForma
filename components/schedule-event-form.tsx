"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X, Camera } from "lucide-react";
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
import { createClient } from "@/lib/supabase/client";
import {
  EventType,
  EVENT_TYPE_LABELS,
  ScheduleEvent,
  EventStatus,
  Room,
  Supplier,
  Expense,
} from "@/lib/types";

type ScheduleEventFormProps = {
  projectId: string;
  onClose: () => void;
  initialEvent?: ScheduleEvent;
  suppliers?: Supplier[];
  rooms?: Room[];
  expenses?: Expense[];
};

export function ScheduleEventForm({
  projectId,
  onClose,
  initialEvent,
  suppliers = [],
  rooms = [],
  expenses = [],
}: ScheduleEventFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!initialEvent;

  const [title, setTitle] = useState(initialEvent?.title ?? "");
  const [eventType, setEventType] = useState<string>(
    (initialEvent?.event_type as string) ?? "entrega_material"
  );
  const [eventDate, setEventDate] = useState(initialEvent?.start_date ?? "");
  const [notes, setNotes] = useState(initialEvent?.notes ?? "");
  const [supplierId, setSupplierId] = useState(initialEvent?.supplier_id ?? "");
  const [roomId, setRoomId] = useState(initialEvent?.room_id ?? "");
  const [expenseId, setExpenseId] = useState(initialEvent?.expense_id ?? "");
  const [status, setStatus] = useState<EventStatus | null>(initialEvent?.status ?? "pendente");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialEvent?.photo_url ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventTypes: EventType[] = [
    "entrega_material",
    "servico_mao_obra",
    "pagamento",
    "visita_tecnica",
  ];

  const statusOptions: EventStatus[] = ["pendente", "confirmado", "concluído"];

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("O arquivo deve ter no máximo 5 MB.");
      e.target.value = "";
      return;
    }
    setError(null);
    const url = URL.createObjectURL(file);
    setPhotoFile(file);
    setPhotoPreview(url);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Título é obrigatório");
      return;
    }

    if (!eventDate) {
      setError("Data é obrigatória");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Salvando...");

    try {
      const supabase = createClient();
      let photoUrl: string | null = initialEvent?.photo_url ?? null;

      if (photoFile) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError("Sessão expirada. Por favor, faça login novamente.");
          toast.dismiss(toastId);
          return;
        }

        if (initialEvent?.photo_url) {
          await supabase.storage.from("receipts").remove([initialEvent.photo_url]);
        }

        const fileName = `${user.id}/${Date.now()}-photo-${photoFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("receipts")
          .upload(fileName, photoFile);
        if (uploadError) throw uploadError;
        photoUrl = uploadData.path;
      }

      const payload = {
        title,
        event_type: eventType,
        start_date: eventDate,
        notes: notes || null,
        supplier_id: supplierId || null,
        room_id: roomId || null,
        expense_id: expenseId || null,
        status,
        photo_url: photoUrl,
      };

      if (isEditing && initialEvent) {
        await supabase.from("schedule_events").update(payload).eq("id", initialEvent.id);
        toast.success("Evento atualizado", { id: toastId });
      } else {
        await supabase.from("schedule_events").insert({
          project_id: projectId,
          ...payload,
        });
        toast.success("Evento criado com sucesso", { id: toastId });
      }

      router.refresh();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao salvar evento.";
      setError(message);
      toast.error(message, { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-[430px] bg-white dark:bg-zinc-800 rounded-t-2xl max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto flex-1 p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-stone-900 dark:text-zinc-100">
                {isEditing ? "Editar Evento" : "Novo Evento"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1 hover:bg-stone-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-stone-600 dark:text-zinc-400" />
              </button>
            </div>

            <div>
              <Label className="text-sm dark:text-zinc-300 text-stone-700">Título</Label>
              <Input
                type="text"
                placeholder="Ex: Entrega de Pisos"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                className="mt-1 bg-stone-50 dark:bg-zinc-700 border-stone-200 dark:border-zinc-600 dark:text-zinc-100 text-stone-900"
              />
            </div>

            <div>
              <Label className="text-sm dark:text-zinc-300 text-stone-700">Tipo de Evento</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {eventTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setEventType(type)}
                    disabled={loading}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
                      eventType === type
                        ? "border-orange-600 bg-orange-700/20 text-orange-500 dark:text-orange-400"
                        : "border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-700 text-stone-600 dark:text-zinc-400 hover:border-orange-400 dark:hover:border-orange-600"
                    }`}
                  >
                    {EVENT_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm dark:text-zinc-300 text-stone-700">Data</Label>
              <Input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                disabled={loading}
                className="mt-1 bg-stone-50 dark:bg-zinc-700 border-stone-200 dark:border-zinc-600 dark:text-zinc-100 text-stone-900"
              />
            </div>

            {suppliers.length > 0 && (
              <div>
                <Label className="text-sm dark:text-zinc-300 text-stone-700">
                  Fornecedor (opcional)
                </Label>
                <Select value={supplierId} onValueChange={setSupplierId}>
                  <SelectTrigger className="mt-1 bg-stone-50 dark:bg-zinc-700 border-stone-200 dark:border-zinc-600">
                    <SelectValue placeholder="Selecionar fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sem fornecedor</SelectItem>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {rooms.length > 0 && (
              <div>
                <Label className="text-sm dark:text-zinc-300 text-stone-700">
                  Cômodo (opcional)
                </Label>
                <Select value={roomId} onValueChange={setRoomId}>
                  <SelectTrigger className="mt-1 bg-stone-50 dark:bg-zinc-700 border-stone-200 dark:border-zinc-600">
                    <SelectValue placeholder="Selecionar cômodo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sem cômodo</SelectItem>
                    {rooms.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {expenses.length > 0 && (
              <div>
                <Label className="text-sm dark:text-zinc-300 text-stone-700">
                  Despesa (opcional)
                </Label>
                <Select value={expenseId} onValueChange={setExpenseId}>
                  <SelectTrigger className="mt-1 bg-stone-50 dark:bg-zinc-700 border-stone-200 dark:border-zinc-600">
                    <SelectValue placeholder="Selecionar despesa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sem despesa</SelectItem>
                    {expenses.map((exp) => (
                      <SelectItem key={exp.id} value={exp.id}>
                        {exp.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className="text-sm dark:text-zinc-300 text-stone-700">Status</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {statusOptions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    disabled={loading}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
                      status === s
                        ? "border-orange-600 bg-orange-700/20 text-orange-500 dark:text-orange-400"
                        : "border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-700 text-stone-600 dark:text-zinc-400 hover:border-orange-400 dark:hover:border-orange-600"
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm dark:text-zinc-300 text-stone-700">Foto (opcional)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              {photoPreview ? (
                <div className="relative rounded-lg overflow-hidden border border-stone-200 dark:border-zinc-700 mt-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoPreview} alt="Foto" className="w-full h-32 object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                    className="absolute top-1 right-1 rounded-full bg-stone-900/80 dark:bg-zinc-900/80 p-1 text-stone-100 dark:text-zinc-300 text-xs hover:bg-stone-900 dark:hover:bg-zinc-900 transition-colors duration-150"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full mt-1 flex items-center justify-center gap-2 rounded-lg border border-dashed border-stone-300 dark:border-zinc-700 bg-stone-100/50 dark:bg-zinc-800/50 py-4 text-sm text-stone-400 dark:text-zinc-500 hover:border-stone-400 dark:hover:border-zinc-600 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  Adicionar foto
                </button>
              )}
            </div>

            <div>
              <Label className="text-sm dark:text-zinc-300 text-stone-700">
                Observações (opcional)
              </Label>
              <textarea
                placeholder="Adicione detalhes do evento..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loading}
                rows={3}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-zinc-700 border border-stone-200 dark:border-zinc-600 dark:text-zinc-100 text-stone-900 placeholder:text-stone-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          <div className="flex gap-2 px-4 pt-3 border-t border-stone-200 dark:border-zinc-700 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-700 hover:bg-orange-800 text-white"
            >
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
