"use client";

import * as React from "react";
import { useStore } from "@/lib/store";

function todayKey(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Раз в минуту проверяет, не пора ли прислать сводку по времени в фокусе за день. */
export function FocusDailyNotifier() {
  const { settings, todayFocusMinutes, lastSummaryDate, markSummaryNotified } = useStore();

  React.useEffect(() => {
    const check = () => {
      if (!settings.dailySummaryEnabled) return;
      if (typeof window === "undefined" || !("Notification" in window)) return;
      if (Notification.permission !== "granted") return;
      if (lastSummaryDate === todayKey()) return;
      if (new Date().getHours() < settings.dailySummaryHour) return;

      const h = Math.floor(todayFocusMinutes / 60);
      const m = todayFocusMinutes % 60;
      const body =
        todayFocusMinutes > 0
          ? `Сегодня вы провели в фокусе ${h} ч ${m} мин.`
          : "Сегодня вы ещё не запускали режим фокусировки.";
      new Notification("Итоги дня", { body });
      markSummaryNotified();
    };

    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, [settings.dailySummaryEnabled, settings.dailySummaryHour, todayFocusMinutes, lastSummaryDate, markSummaryNotified]);

  return null;
}
