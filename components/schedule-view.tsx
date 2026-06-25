"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Truck,
  Hammer,
  DollarSign,
  CalendarDays,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ScheduleEvent, EventType, EVENT_TYPE_LABELS } from "@/lib/types";
import { ScheduleEventForm } from "@/components/schedule-event-form";
import { ConfirmDialog } from "@/components/confirm-dialog";

type ScheduleViewProps = {
  events: ScheduleEvent[];
  projectId: string;
  userId: string;
};

const EVENT_ICONS: Record<EventType, LucideIcon> = {
  entrega_material: Truck,
  servico_mao_obra: Hammer,
  pagamento: DollarSign,
  visita_tecnica: CalendarDays,
};

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function getWeekLabel(eventDate: string): string {
  const event = new Date(eventDate + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventStart = getWeekStart(event);
  const currentWeekStart = getWeekStart(today);

  const msPerDay = 24 * 60 * 60 * 1000;
  const diffWeeks = Math.floor(
    (eventStart.getTime() - currentWeekStart.getTime()) / (msPerDay * 7)
  );

  if (diffWeeks === 0) return "Esta Semana";
  if (diffWeeks === 1) return "Próxima Semana";
  if (diffWeeks >= 2 && diffWeeks <= 4) return "Nas Próximas 3 Semanas";
  return "Futuro";
}

function groupEventsByWeek(
  events: ScheduleEvent[]
): Record<string, ScheduleEvent[]> {
  const grouped: Record<string, ScheduleEvent[]> = {
    "Esta Semana": [],
    "Próxima Semana": [],
    "Nas Próximas 3 Semanas": [],
    Futuro: [],
  };

  events.forEach((event) => {
    const week = getWeekLabel(event.event_date);
    if (grouped[week]) {
      grouped[week].push(event);
    }
  });

  return grouped;
}

export function ScheduleView({
  events,
  projectId,
  userId,
}: ScheduleViewProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<ScheduleEvent | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const grouped = groupEventsByWeek(events);
  const weeks = [
    "Esta Semana",
    "Próxima Semana",
    "Nas Próximas 3 Semanas",
    "Futuro",
  ];

  async function handleDelete(event: ScheduleEvent) {
    setDeletingId(event.id);
    const toastId = toast.loading("Deletando...");
    try {
      const { error } = await supabase
        .from("schedule_events")
        .delete()
        .eq("id", event.id);
      if (error) throw error;
      toast.success("Evento deletado", { id: toastId });
      router.refresh();
      setShowDeleteDialog(false);
      setEventToDelete(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao deletar evento.";
      toast.error(message, { id: toastId });
    } finally {
      setDeletingId(null);
    }
  }

  function handleEdit(event: ScheduleEvent) {
    setEditingEvent(event);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingEvent(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-stone-900 dark:text-zinc-100">
          Cronograma da Obra
        </h1>
        <button
          onClick={() => {
            setEditingEvent(null);
            setIsFormOpen(true);
          }}
          aria-label="Novo evento"
          className="p-2 rounded-lg bg-orange-700 hover:bg-orange-800 text-white transition-colors"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      <div className="space-y-6">
        {weeks.map((week) => {
          const weekEvents = grouped[week] || [];
          const showWeek = weekEvents.length > 0 || week !== "Futuro";

          if (!showWeek) return null;

          return (
            <div key={week}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-600 dark:text-zinc-400 mb-3">
                {week}
              </h2>

              {weekEvents.length === 0 ? (
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-zinc-800/50 border border-dashed border-stone-200 dark:border-zinc-700 text-center">
                  <p className="text-sm text-stone-500 dark:text-zinc-400">
                    Nenhum evento previsto
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {weekEvents.map((event) => {
                    const IconComponent = EVENT_ICONS[event.event_type];
                    const eventDateObj = new Date(event.event_date);
                    const dayOfWeek = eventDateObj.toLocaleDateString("pt-BR", {
                      weekday: "short",
                    });
                    const formattedDate = eventDateObj.toLocaleDateString(
                      "pt-BR",
                      { day: "2-digit", month: "2-digit" }
                    );

                    return (
                      <div
                        key={event.id}
                        className="p-4 rounded-xl bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700/60 hover:border-stone-300 dark:hover:border-zinc-600 transition-colors"
                      >
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 mt-1">
                            <IconComponent className="h-6 w-6 text-orange-500" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-stone-900 dark:text-zinc-100 truncate">
                              {event.title}
                            </h3>

                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <span className="text-xs text-stone-500 dark:text-zinc-400">
                                {dayOfWeek.charAt(0).toUpperCase() +
                                  dayOfWeek.slice(1)}{" "}
                                • {formattedDate}
                              </span>
                              <span className="px-2 py-1 rounded text-xs bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400">
                                {EVENT_TYPE_LABELS[event.event_type]}
                              </span>
                            </div>

                            {event.notes && (
                              <p className="text-sm italic text-stone-500 dark:text-zinc-500 mt-2 line-clamp-2">
                                {event.notes}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => handleEdit(event)}
                              disabled={deletingId === event.id}
                              aria-label="Editar evento"
                              className="p-2 rounded-lg text-zinc-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors disabled:opacity-40"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEventToDelete(event);
                                setShowDeleteDialog(true);
                              }}
                              disabled={deletingId === event.id}
                              aria-label="Deletar evento"
                              className="p-2 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-40"
                            >
                              {deletingId === event.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isFormOpen && (
        <ScheduleEventForm
          projectId={projectId}
          userId={userId}
          initialEvent={editingEvent ?? undefined}
          onClose={closeForm}
        />
      )}

      <ConfirmDialog
        open={showDeleteDialog}
        title="Deletar evento?"
        description="Esta ação não pode ser desfeita."
        actionLabel="Deletar"
        onConfirm={() => eventToDelete && handleDelete(eventToDelete)}
        onCancel={() => {
          setShowDeleteDialog(false);
          setEventToDelete(null);
        }}
        isLoading={deletingId !== null}
      />
    </div>
  );
}
