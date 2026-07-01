"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FocusTimer } from "@/components/focus-timer";
import { WeeklyChart } from "@/components/weekly-chart";
import { useStore } from "@/lib/store";

export default function FocusPage() {
  const { totalFocusMinutes } = useStore();
  const h = Math.floor(totalFocusMinutes / 60);
  const m = totalFocusMinutes % 60;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 p-4 md:grid-cols-2 md:p-6">
      <FocusTimer />
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-baseline justify-between">
            <span>Статистика за неделю</span>
            <span className="text-sm font-normal text-muted-foreground">
              Всего: {h} ч {m} мин
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WeeklyChart />
        </CardContent>
      </Card>
    </div>
  );
}
