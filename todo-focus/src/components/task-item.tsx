"use client";

import { motion } from "framer-motion";
import { Check, Timer, Trash2 } from "lucide-react";
import { PriorityDot } from "./priority-dot";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  formatDeadline,
  formatRelativeDeadline,
  getTaskPriority,
  isBurningSoon,
  isOverdue,
} from "@/lib/priority";
import type { Task } from "@/lib/types";

export function TaskItem({
  task,
  onToggle,
  onOpen,
  onRequestDelete,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onOpen: (task: Task) => void;
  onRequestDelete: (task: Task) => void;
}) {
  const isCompleted = task.status === "completed";
  const priority = getTaskPriority(task.deadline);
  const overdue = !isCompleted && isOverdue(task.deadline);
  const burning = !isCompleted && isBurningSoon(task.deadline);
  const rel = formatRelativeDeadline(task.deadline);
  const relClass =
    rel.tone === "overdue"
      ? "text-rose-500"
      : rel.tone === "today"
        ? "text-red-500"
        : "text-muted-foreground";

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm",
        overdue && "border-rose-900/40",
        isCompleted && "opacity-60",
      )}
    >
      <button
        onClick={() => onToggle(task.id)}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
          isCompleted
            ? "border-primary bg-primary text-primary-foreground"
            : "text-transparent hover:border-primary hover:text-muted-foreground",
        )}
        aria-label={isCompleted ? "Вернуть в активные" : "Отметить выполненной"}
      >
        <Check className="h-3 w-3" />
      </button>

      {isCompleted ? (
        <span className="inline-block h-3 w-3 shrink-0 rounded-full bg-zinc-500" />
      ) : (
        <PriorityDot priority={priority} />
      )}

      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpen(task)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen(task);
          }
        }}
        className="min-w-0 flex-1 cursor-pointer rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
        title="Открыть задачу"
      >
        <div className="flex items-center gap-2">
          <p className={cn("truncate font-medium", isCompleted && "text-muted-foreground line-through")}>
            {task.title}
          </p>
          {overdue && <Badge className="bg-rose-900 text-rose-50 hover:bg-rose-900">Просрочено</Badge>}
          {!overdue && burning && <Badge variant="destructive">Горит</Badge>}
          {!!task.focusMinutes && (
            <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
              <Timer className="h-3 w-3" /> {task.focusMinutes} мин
            </span>
          )}
        </div>
        {task.description && (
          <p className="truncate text-sm text-muted-foreground">{task.description}</p>
        )}
      </div>

      <div className="hidden shrink-0 flex-col items-end text-xs sm:flex">
        <span className="text-muted-foreground">{formatDeadline(task.deadline)}</span>
        <span className={isCompleted ? "text-muted-foreground" : relClass}>
          {isCompleted ? "выполнено" : rel.text}
        </span>
      </div>

      <button
        onClick={() => onRequestDelete(task)}
        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Удалить задачу"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </motion.li>
  );
}
