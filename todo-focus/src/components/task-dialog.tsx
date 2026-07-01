"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import type { Task } from "@/lib/types";

/** ISO -> значение для <input type="datetime-local"> в локальном времени. */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}`;
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  /** Если передана — режим просмотра/редактирования; иначе — создание. */
  task?: Task | null;
}) {
  const { addTask, updateTask } = useStore();
  const isEdit = !!task;

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [deadline, setDeadline] = React.useState("");
  const [error, setError] = React.useState("");

  // Префилл при открытии: создание — пусто, редактирование — данные задачи.
  React.useEffect(() => {
    if (!open) return;
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setDeadline(toLocalInput(task.deadline));
    } else {
      setTitle("");
      setDescription("");
      setDeadline("");
    }
    setError("");
  }, [open, task]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Введите название задачи");
      return;
    }
    if (!deadline) {
      setError("Укажите дедлайн");
      return;
    }
    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      deadline: new Date(deadline).toISOString(),
    };
    if (isEdit && task) updateTask(task.id, payload);
    else addTask(payload);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Задача" : "Новая задача"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Просмотр и редактирование. Приоритет пересчитается по дедлайну."
              : "Приоритет рассчитается автоматически по дедлайну."}
            {isEdit && !!task?.focusMinutes && (
              <span className="mt-1 block text-foreground">
                🍅 В фокусе на этой задаче: {task.focusMinutes} мин
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Сдать отчёт"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Описание</Label>
            <Textarea
              id="desc"
              value={description}
              maxLength={1000}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Детали задачи…"
              className="min-h-[120px]"
            />
            <p className="text-right text-xs text-muted-foreground">{description.length}/1000</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline">Дедлайн</Label>
            <Input
              id="deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" className="rounded-xl">
              {isEdit ? "Сохранить" : "Создать"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
