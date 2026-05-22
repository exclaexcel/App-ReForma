import { Task, TaskStatus, TASK_STATUS_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock, MapPin } from "lucide-react";
import Link from "next/link";

type TaskListItemProps = {
  task: Task;
  href?: string;
};

const statusIcon: Record<TaskStatus, React.ReactNode> = {
  pendente: <Circle className="h-4 w-4 text-zinc-500" />,
  em_andamento: <Clock className="h-4 w-4 text-orange-400" />,
  concluido: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
};

const statusColor: Record<TaskStatus, string> = {
  pendente: "text-zinc-500",
  em_andamento: "text-orange-400",
  concluido: "text-emerald-400",
};

export function TaskListItem({ task, href }: TaskListItemProps) {
  const status = (task.status ?? "pendente") as TaskStatus;

  const sharedClass =
    "w-full flex items-center gap-3 py-3 text-left rounded-xl px-2 transition-all duration-200 active:scale-95 border-b dark:border-zinc-800/40 border-stone-200/40 dark:hover:bg-zinc-800/50 hover:bg-stone-100/30 dark:active:bg-zinc-800 active:bg-stone-100";

  const content = (
    <>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800/60 border border-zinc-700/40">
        {statusIcon[status]}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium dark:text-zinc-100 text-stone-900 truncate",
            status === "concluido" && "line-through dark:text-zinc-500 text-stone-400"
          )}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {task.rooms?.name && (
            <span className="flex items-center gap-0.5 text-xs dark:text-zinc-500 text-stone-500 truncate">
              <MapPin className="h-3 w-3 shrink-0" />
              {task.rooms.name}
            </span>
          )}
        </div>
      </div>

      <span className={cn("text-xs font-medium shrink-0", statusColor[status])}>
        {TASK_STATUS_LABELS[status]}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={sharedClass}>
        {content}
      </Link>
    );
  }

  return <div className={sharedClass}>{content}</div>;
}
