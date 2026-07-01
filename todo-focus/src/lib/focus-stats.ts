import type { DailyFocus } from "./types";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Серия дней подряд с фокус-сессией, заканчивая сегодня или вчера.
 * Сегодняшний день не обнуляет серию, если фокуса ещё не было — считаем от вчера.
 */
export function getFocusStreak(dailyFocus: DailyFocus, now: Date = new Date()): number {
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);
  if (!dailyFocus[toDateKey(cursor)]) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while ((dailyFocus[toDateKey(cursor)] ?? 0) > 0) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export interface BestDay {
  date: string;
  minutes: number;
}

/** Дата с максимальным накопленным фокусом за всё время. */
export function getBestDay(dailyFocus: DailyFocus): BestDay | null {
  let best: BestDay | null = null;
  for (const [date, minutes] of Object.entries(dailyFocus)) {
    if (!best || minutes > best.minutes) best = { date, minutes };
  }
  return best;
}

export interface HeatmapDay {
  date: string;
  minutes: number;
}

/**
 * Сетка последних `weeks` недель для heatmap-календаря, выровненная по неделям Пн-Вс.
 * Возвращает массив недель, каждая — 7 дней (Пн..Вс).
 */
export function getHeatmapWeeks(dailyFocus: DailyFocus, weeks = 12, now: Date = new Date()): HeatmapDay[][] {
  const end = new Date(now);
  end.setHours(0, 0, 0, 0);

  const mondayIndex = (jsDay: number) => (jsDay + 6) % 7; // 0=Пн..6=Вс

  const start = new Date(end);
  start.setDate(start.getDate() - (weeks * 7 - 1));
  start.setDate(start.getDate() - mondayIndex(start.getDay()));

  const days: HeatmapDay[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const key = toDateKey(cursor);
    days.push({ date: key, minutes: dailyFocus[key] ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  const result: HeatmapDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    result.push(days.slice(i, i + 7));
  }
  return result;
}
