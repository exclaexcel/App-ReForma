"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { EventType, EVENT_TYPE_LABELS, ScheduleEvent } from "@/lib/types";

type ScheduleEventFormProps = {
  projectId: string;
  userId: string;
  onClose: () => void;
  initialEvent?: ScheduleEvent;
};

export function ScheduleEventForm({
  projectId,
  userId,
  onClose,
  initialEvent,
}: ScheduleEventFormProps) {
  const router = useRouter();
  const isEditing = !!initialEvent;

  const [title, setTitle] = useState(initialEvent?.title ?? "");
  const [eventType, setEventType] = useState<EventType>(
    initialEvent?.event_type ?? "entrega_material"
  );
  const [eventDate, setEventDate] = useState(initialEvent?.event_date ?? "");
  const [notes, setNotes] = useState(initialEvent?.notes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventTypes: EventType[] = [
    "entrega_material",
    "servico_mao_obra",
    "pagamento",
    "visita_tecnica",
  ];

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

    try {
      const supabase = createClient();

      if (isEditing && initialEvent) {
        await supabase
          .from("schedule_events")
          .update({
            title,
            event_type: eventType,
            event_date: eventDate,
            notes: notes || null,
          })
          .eq("id", initialEvent.id);
      } else {
        await supabase.from("schedule_events").insert({
          project_id: projectId,
          user_id: userId,
          title,
          event_type: eventType,
          event_date: eventDate,
          notes: notes || null,
        });
      }

      router.refresh();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao salvar evento. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-[430px] bg-white dark:bg-zinc-800 rounded-t-2xl p-6 space-y-4 max-h-[85vh] overflow-y-scroll touch-pan-y">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-zinc-100">
            {isEditing ? "Editar Evento" : "Novo Evento"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-stone-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-stone-600 dark:text-zinc-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm text-stone-700 dark:text-zinc-300">
              Título
            </Label>
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
            <Label className="text-sm text-stone-700 dark:text-zinc-300">
              Tipo de Evento
            </Label>
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
            <Label className="text-sm text-stone-700 dark:text-zinc-300">
              Data
            </Label>
            <Input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              disabled={loading}
              className="mt-1 bg-stone-50 dark:bg-zinc-700 border-stone-200 dark:border-zinc-600 dark:text-zinc-100 text-stone-900"
            />
          </div>

          <div>
            <Label className="text-sm text-stone-700 dark:text-zinc-300">
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

          <div className="flex gap-2 pt-4 pb-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 font-medium"
            >
              Cancelar
            </button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-700 hover:bg-orange-800 text-white py-3 font-medium"
            >
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
