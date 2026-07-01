"use client";

import { getHeatmapWeeks } from "@/lib/focus-stats";
import type { DailyFocus } from "@/lib/types";

const LEVELS = ["bg-zinc-800/60", "bg-indigo-900", "bg-indigo-700", "bg-indigo-500", "bg-indigo-400"];

function levelFor(minutes: number): string {
  if (minutes <= 0) return LEVELS[0];
  if (minutes < 30) return LEVELS[1];
  if (minutes < 60) return LEVELS[2];
  if (minutes < 120) return LEVELS[3];
  return LEVELS[4];
}

function formatDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
}

const WEEKDAY_LABELS = ["Пн", "", "Ср", "", "Пт", "", ""];

export function FocusHeatmap({ dailyFocus }: { dailyFocus: DailyFocus }) {
  const weeks = getHeatmapWeeks(dailyFocus, 12);

  return (
    <div>
      <div className="flex gap-2">
        <div className="flex flex-col justify-between py-0.5 text-[10px] text-muted-foreground">
          {WEEKDAY_LABELS.map((label, i) => (
            <div key={i} className="h-[11px] leading-[11px]">
              {label}
            </div>
          ))}
        </div>
        <div className="flex gap-[3px] overflow-x-auto">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day) => (
                <div
                  key={day.date}
                  title={`${formatDate(day.date)}: ${day.minutes} мин фокуса`}
                  className={`h-[11px] w-[11px] rounded-sm ${levelFor(day.minutes)}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
        <span>Меньше</span>
        {LEVELS.map((cls) => (
          <div key={cls} className={`h-[11px] w-[11px] rounded-sm ${cls}`} />
        ))}
        <span>Больше</span>
      </div>
    </div>
  );
}
