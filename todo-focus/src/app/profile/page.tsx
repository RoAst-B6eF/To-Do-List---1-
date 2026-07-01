"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, Flame, ListTodo, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FocusHeatmap } from "@/components/focus-heatmap";
import { AchievementsGrid } from "@/components/achievements-grid";
import { useStore } from "@/lib/store";
import { isBurningSoon, isOverdue } from "@/lib/priority";
import { getBestDay, getFocusStreak } from "@/lib/focus-stats";
import { computeAchievements } from "@/lib/achievements";

function formatBestDay(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("ru-RU", { day: "2-digit", month: "long" });
}

function streakWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "день";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "дня";
  return "дней";
}

export default function ProfilePage() {
  const { tasks, dailyFocus, profileName, setProfileName } = useStore();
  const active = tasks.filter((t) => t.status === "active");
  const completed = tasks.filter((t) => t.status === "completed").length;
  const burning = active.filter((t) => isBurningSoon(t.deadline)).length;
  const overdue = active.filter((t) => isOverdue(t.deadline)).length;

  const streak = getFocusStreak(dailyFocus);
  const bestDay = getBestDay(dailyFocus);
  const achievements = React.useMemo(
    () => computeAchievements(tasks, dailyFocus),
    [tasks, dailyFocus],
  );

  const stats = [
    { label: "Выполнено", value: completed, icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Активные", value: active.length, icon: ListTodo, color: "text-sky-500" },
    { label: "Горит", value: burning, icon: Flame, color: "text-red-500" },
    { label: "Просрочено", value: overdue, icon: AlertTriangle, color: "text-rose-700" },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl p-4 md:p-6">
      <div className="mb-1 flex flex-wrap items-center gap-1 text-2xl font-semibold">
        <span>Привет,</span>
        <Input
          value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
          placeholder="Ваше имя"
          style={{ width: `${Math.max(profileName.length || "Ваше имя".length, 2) + 1}ch` }}
          className="h-auto max-w-[220px] border-none bg-transparent px-1 py-0 text-2xl font-semibold shadow-none focus-visible:ring-1"
        />
        <span>!</span>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        Сводная статистика по вашим задачам и фокус-сессиям.
      </p>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card className="rounded-xl border-orange-500/30 bg-orange-500/5 shadow-sm">
          <CardContent className="flex items-center gap-4 p-6">
            <Flame className="h-9 w-9 text-orange-500" />
            <div>
              <div className="text-sm text-muted-foreground">Серия фокус-сессий</div>
              <div className="text-2xl font-bold">
                {streak} {streakWord(streak)} подряд
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm">
          <CardContent className="flex items-center gap-4 p-6">
            <Trophy className="h-9 w-9 text-amber-400" />
            <div>
              <div className="text-sm text-muted-foreground">Лучший день</div>
              <div className="text-2xl font-bold">{bestDay ? `${bestDay.minutes} мин` : "—"}</div>
              {bestDay && (
                <div className="text-xs text-muted-foreground">{formatBestDay(bestDay.date)}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="rounded-xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {s.label}
              </CardTitle>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Активность за 12 недель</CardTitle>
        </CardHeader>
        <CardContent>
          <FocusHeatmap dailyFocus={dailyFocus} />
        </CardContent>
      </Card>

      <Card className="mt-6 rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Достижения</CardTitle>
        </CardHeader>
        <CardContent>
          <AchievementsGrid achievements={achievements} />
        </CardContent>
      </Card>
    </div>
  );
}
