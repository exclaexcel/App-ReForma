"use client";

import { useState } from "react";
import {
  Truck,
  Hammer,
  DollarSign,
  CalendarDays,
  Plus,
  LucideIcon,
} from "lucide-react";
import { ScheduleEvent, EventType, EVENT_TYPE_LABELS } from "@/lib/types";
import { ScheduleEventForm } from "@/components/schedule-event-form";

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
  const [isFormOpen, setIsFormOpen] = useState(false);

  const grouped = groupEventsByWeek(events);
  const weeks = [
    "Esta Semana",
    "Próxima Semana",
    "Nas Próximas 3 Semanas",
    "Futuro",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold dark:text-zinc-100 light:text-stone-900">
          Cronograma da Obra
        </h1>
        <button
          onClick={() => setIsFormOpen(true)}
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
              <h2 className="text-sm font-semibold uppercase tracking-wide dark:text-zinc-400 light:text-stone-600 mb-3">
                {week}
              </h2>

              {weekEvents.length === 0 ? (
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-zinc-800/50 border border-dashed border-stone-200 dark:border-zinc-700 text-center">
                  <p className="text-sm dark:text-zinc-400 light:text-stone-500">
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
                            <h3 className="font-semibold dark:text-zinc-100 light:text-stone-900 truncate">
                              {event.title}
                            </h3>

                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <span className="text-xs dark:text-zinc-400 light:text-stone-500">
                                {dayOfWeek.charAt(0).toUpperCase() +
                                  dayOfWeek.slice(1)}{" "}
                                • {formattedDate}
                              </span>
                              <span className="px-2 py-1 rounded text-xs bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400">
                                {EVENT_TYPE_LABELS[event.event_type]}
                              </span>
                            </div>

                            {event.notes && (
                              <p className="text-sm italic dark:text-zinc-500 light:text-stone-500 mt-2 line-clamp-2">
                                {event.notes}
                              </p>
                            )}
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
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}
