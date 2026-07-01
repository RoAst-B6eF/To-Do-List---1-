import { CheckCircle2, Flame, ShieldCheck, Timer, Trophy, type LucideIcon } from "lucide-react";
import type { DailyFocus, Task } from "./types";
import { getFocusStreak } from "./focus-stats";
import { isOverdue } from "./priority";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  unlocked: boolean;
  /** Прогресс к разблокировке; отсутствует у бинарных достижений. */
  progress?: { current: number; target: number };
}

export function computeAchievements(tasks: Task[], dailyFocus: DailyFocus): Achievement[] {
  const completed = tasks.filter((t) => t.status === "completed").length;
  const totalMinutes = Object.values(dailyFocus).reduce((a, b) => a + b, 0);
  const streak = getFocusStreak(dailyFocus);
  const activeTasks = tasks.filter((t) => t.status === "active");
  const overdueCount = activeTasks.filter((t) => isOverdue(t.deadline)).length;

  return [
    {
      id: "first-task",
      title: "Первый шаг",
      description: "Выполните первую задачу",
      icon: CheckCircle2,
      unlocked: completed >= 1,
      progress: { current: Math.min(completed, 1), target: 1 },
    },
    {
      id: "focus-100",
      title: "100 минут фокуса",
      description: "Наберите 100 минут в фокус-сессиях",
      icon: Timer,
      unlocked: totalMinutes >= 100,
      progress: { current: Math.min(totalMinutes, 100), target: 100 },
    },
    {
      id: "focus-500",
      title: "500 минут фокуса",
      description: "Наберите 500 минут в фокус-сессиях",
      icon: Timer,
      unlocked: totalMinutes >= 500,
      progress: { current: Math.min(totalMinutes, 500), target: 500 },
    },
    {
      id: "streak-3",
      title: "Серия 3 дня",
      description: "Фокусируйтесь 3 дня подряд",
      icon: Flame,
      unlocked: streak >= 3,
      progress: { current: Math.min(streak, 3), target: 3 },
    },
    {
      id: "streak-7",
      title: "Серия 7 дней",
      description: "Фокусируйтесь 7 дней подряд",
      icon: Flame,
      unlocked: streak >= 7,
      progress: { current: Math.min(streak, 7), target: 7 },
    },
    {
      id: "zero-overdue",
      title: "Всё под контролем",
      description: "Ни одной просроченной задачи",
      icon: ShieldCheck,
      unlocked: overdueCount === 0,
    },
    {
      id: "completed-10",
      title: "10 выполненных задач",
      description: "Выполните 10 задач",
      icon: Trophy,
      unlocked: completed >= 10,
      progress: { current: Math.min(completed, 10), target: 10 },
    },
  ];
}
