"use client";

import { AnimatePresence } from "framer-motion";
import { TaskItem } from "./task-item";
import { useStore } from "@/lib/store";
import type { Task } from "@/lib/types";

export function TaskList({
  tasks,
  onOpen,
  onRequestDelete,
  emptyMessage = "Задач нет.",
}: {
  tasks: Task[];
  onOpen: (task: Task) => void;
  onRequestDelete: (task: Task) => void;
  emptyMessage?: string;
}) {
  const { toggleComplete } = useStore();

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={toggleComplete}
            onOpen={onOpen}
            onRequestDelete={onRequestDelete}
          />
        ))}
      </AnimatePresence>
    </ul>
  );
}
