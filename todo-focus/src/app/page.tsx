"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Sidebar, type SidebarView } from "@/components/sidebar";
import { TaskList } from "@/components/task-list";
import { TaskDialog } from "@/components/task-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { getTaskPriority, isBurningSoon, isToday, type TaskPriority } from "@/lib/priority";
import type { Task } from "@/lib/types";

function titleFor(view: SidebarView): string {
  if (view === "all") return "Все задачи";
  if (view === "today") return "Сегодня";
  if (view === "burning") return "Горит";
  const map: Record<string, string> = {
    overdue: "Просрочено",
    red: "Высокий приоритет",
    yellow: "Средний приоритет",
    green: "Низкий приоритет",
    gray: "Не срочно",
  };
  return map[view.split(":")[1]] ?? "Задачи";
}

function emptyMessageFor(view: SidebarView, hasSearch: boolean): string {
  if (hasSearch) return "Ничего не найдено по запросу.";
  if (view === "today") return "На сегодня задач нет 🎉";
  if (view === "burning") return "Ничего не горит — так держать 🔥";
  if (view === "priority:overdue") return "Просроченных задач нет 👍";
  if (view.startsWith("priority:")) return "Задач этой важности нет.";
  return "Задач нет. Создайте первую кнопкой «Новая задача».";
}

export default function TasksPage() {
  const { tasks, deleteTask } = useStore();
  const [view, setView] = React.useState<SidebarView>("all");
  const [search, setSearch] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<Task | null>(null);

  const openCreate = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };
  const openEdit = (t: Task) => {
    setEditingTask(t);
    setDialogOpen(true);
  };

  const active = React.useMemo(() => tasks.filter((t) => t.status === "active"), [tasks]);

  const counts = React.useMemo(() => {
    const by = (p: TaskPriority) => active.filter((t) => getTaskPriority(t.deadline) === p).length;
    return {
      all: active.length,
      today: active.filter((t) => isToday(t.deadline)).length,
      burning: active.filter((t) => isBurningSoon(t.deadline)).length,
      overdue: by("overdue"),
      red: by("red"),
      yellow: by("yellow"),
      green: by("green"),
      gray: by("gray"),
    };
  }, [active]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const match = (t: Task) =>
      !q ||
      t.title.toLowerCase().includes(q) ||
      (t.description ?? "").toLowerCase().includes(q);

    let list = active.filter(match);
    if (view === "today") list = list.filter((t) => isToday(t.deadline));
    else if (view === "burning") list = list.filter((t) => isBurningSoon(t.deadline));
    else if (view.startsWith("priority:")) {
      const p = view.split(":")[1] as TaskPriority;
      list = list.filter((t) => getTaskPriority(t.deadline) === p);
    }
    list = [...list].sort((a, b) => +new Date(a.deadline) - +new Date(b.deadline));

    // Выполненные показываем только в «Все задачи» — внизу списка.
    if (view === "all") {
      const done = tasks
        .filter((t) => t.status === "completed")
        .filter(match)
        .sort(
          (a, b) =>
            +new Date(b.completedAt ?? b.deadline) - +new Date(a.completedAt ?? a.deadline),
        );
      return [...list, ...done];
    }
    return list;
  }, [tasks, active, view, search]);

  return (
    <div className="mx-auto flex w-full max-w-6xl gap-6 p-4 md:p-6">
      <Sidebar
        active={view}
        onSelect={setView}
        search={search}
        onSearchChange={setSearch}
        counts={counts}
      />
      <section className="min-w-0 flex-1">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl font-semibold">{titleFor(view)}</h1>
            <span className="text-sm text-muted-foreground">{filtered.length}</span>
          </div>
          <Button onClick={openCreate} className="rounded-xl">
            <Plus className="h-4 w-4" /> Новая задача
          </Button>
        </div>

        <TaskList
          tasks={filtered}
          onOpen={openEdit}
          onRequestDelete={setConfirmDelete}
          emptyMessage={emptyMessageFor(view, search.trim().length > 0)}
        />

        <TaskDialog open={dialogOpen} onOpenChange={setDialogOpen} task={editingTask} />

        <ConfirmDialog
          open={!!confirmDelete}
          onOpenChange={(o) => {
            if (!o) setConfirmDelete(null);
          }}
          title="Удалить задачу?"
          description={
            confirmDelete ? `«${confirmDelete.title}» будет удалена безвозвратно.` : undefined
          }
          confirmText="Удалить"
          onConfirm={() => {
            if (confirmDelete) deleteTask(confirmDelete.id);
            setConfirmDelete(null);
          }}
        />
      </section>
    </div>
  );
}
