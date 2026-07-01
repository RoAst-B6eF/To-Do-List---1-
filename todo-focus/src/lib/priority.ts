export type TaskPriority = "overdue" | "red" | "yellow" | "green" | "gray";

const MS_PER_DAY = 86_400_000;

/** Сколько суток до дедлайна (дробное; отрицательное = просрочено). */
export function getDaysLeft(deadline: Date | string, now: Date = new Date()): number {
  const d = typeof deadline === "string" ? new Date(deadline) : deadline;
  return (d.getTime() - now.getTime()) / MS_PER_DAY;
}

/**
 * Автоматический приоритет по дедлайну.
 * Категории ВЗАИМОИСКЛЮЧАЮЩИЕ — проверяем от самого срочного к наименее срочному.
 */
export function getTaskPriority(deadline: Date | string, now: Date = new Date()): TaskPriority {
  const d = getDaysLeft(deadline, now);
  if (d < 0) return "overdue"; // дедлайн уже прошёл
  if (d <= 3) return "red"; // ≤ 3 суток (включая ровно 3)
  if (d <= 5) return "yellow"; // 3 < d ≤ 5
  if (d <= 7) return "green"; // 5 < d ≤ 7
  return "gray"; // > 7
}

/** «Горит»: задача ещё в будущем, но до дедлайна ≤ 2 суток. Отдельный флаг/фильтр. */
export function isBurningSoon(deadline: Date | string, now: Date = new Date()): boolean {
  const d = getDaysLeft(deadline, now);
  return d >= 0 && d <= 2;
}

/** Просрочено: дедлайн в прошлом. */
export function isOverdue(deadline: Date | string, now: Date = new Date()): boolean {
  return getDaysLeft(deadline, now) < 0;
}

/** Дедлайн приходится на сегодняшнюю календарную дату. */
export function isToday(deadline: Date | string, now: Date = new Date()): boolean {
  const d = new Date(deadline);
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function formatDeadline(deadline: string): string {
  return new Date(deadline).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Человеко-читаемый относительный срок с тоном для окраски. */
export function formatRelativeDeadline(
  deadline: string,
  now: Date = new Date(),
): { text: string; tone: "overdue" | "today" | "future" } {
  const d = getDaysLeft(deadline, now);
  if (d < 0) {
    const n = Math.floor(-d);
    return { text: n < 1 ? "просрочено" : `просрочено на ${n} дн.`, tone: "overdue" };
  }
  if (isToday(deadline, now)) return { text: "сегодня", tone: "today" };
  const n = Math.max(1, Math.ceil(d));
  return { text: `через ${n} дн.`, tone: "future" };
}

export interface PriorityConfig {
  label: string;
  /** Tailwind-класс цвета маркера (bg-*) */
  dotClass: string;
  /** «Горит» — пульсирующая анимация (только у просроченных) */
  burning: boolean;
}

export const PRIORITY_CONFIG: Record<TaskPriority, PriorityConfig> = {
  overdue: { label: "Просрочено", dotClass: "bg-rose-900", burning: true },
  red: { label: "Высокий", dotClass: "bg-red-500", burning: false },
  yellow: { label: "Средний", dotClass: "bg-yellow-400", burning: false },
  green: { label: "Низкий", dotClass: "bg-green-500", burning: false },
  gray: { label: "Не срочно", dotClass: "bg-zinc-400", burning: false },
};
