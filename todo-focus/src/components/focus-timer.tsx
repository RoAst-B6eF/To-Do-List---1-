"use client";

import * as React from "react";
import { Pause, Play, Plus, RotateCcw, Settings, SkipForward } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { FocusSettingsDialog } from "@/components/focus-settings-dialog";

type Mode = "work" | "short" | "long";

const MODE_LABEL: Record<Mode, string> = {
  work: "Работа",
  short: "Короткий перерыв",
  long: "Длинный перерыв",
};
const NEW_CAT_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

/** Короткий двойной сигнал через Web Audio API — без внешних файлов. */
function playBeep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    [0, 0.18].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.16);
    });
    setTimeout(() => ctx.close(), 500);
  } catch {
    // Web Audio недоступен — молча пропускаем.
  }
}

export function FocusTimer() {
  const { categories, addCategory, logFocus, settings, tasks } = useStore();
  const [categoryId, setCategoryId] = React.useState(categories[0]?.id ?? "");
  const [taskId, setTaskId] = React.useState("");
  const [mode, setMode] = React.useState<Mode>("work");
  const [secondsLeft, setSecondsLeft] = React.useState(settings.workMin * 60);
  const [running, setRunning] = React.useState(false);
  const [round, setRound] = React.useState(1);
  const [newCat, setNewCat] = React.useState("");
  const [adding, setAdding] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const activeTasks = tasks.filter((t) => t.status === "active");

  const durations: Record<Mode, number> = React.useMemo(
    () => ({
      work: settings.workMin * 60,
      short: settings.shortBreakMin * 60,
      long: settings.longBreakMin * 60,
    }),
    [settings.workMin, settings.shortBreakMin, settings.longBreakMin],
  );

  React.useEffect(() => {
    if (categories.length && !categories.find((c) => c.id === categoryId)) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  React.useEffect(() => {
    if (taskId && !activeTasks.find((t) => t.id === taskId)) setTaskId("");
  }, [activeTasks, taskId]);

  // Если длительности поменяли в настройках, а таймер стоит — подхватываем новое значение.
  React.useEffect(() => {
    if (!running) setSecondsLeft(durations[mode]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.workMin, settings.shortBreakMin, settings.longBreakMin]);

  const notifyEnd = React.useCallback(
    (bodyText: string) => {
      if (settings.soundEnabled) playBeep();
      if (
        settings.notifyOnSessionEnd &&
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification("Сессия завершена", { body: bodyText });
      }
    },
    [settings.soundEnabled, settings.notifyOnSessionEnd],
  );

  const advance = React.useCallback(
    (notify: boolean) => {
      let nextMode: Mode = "work";
      if (mode === "work") {
        if (categoryId) logFocus(categoryId, settings.workMin, taskId || undefined);
        nextMode = round % settings.roundsUntilLongBreak === 0 ? "long" : "short";
        setRound((r) => r + 1);
      }
      setMode(nextMode);
      setSecondsLeft(durations[nextMode]);
      setRunning(false);
      if (notify) notifyEnd(`Дальше: ${MODE_LABEL[nextMode]}`);
    },
    [mode, round, categoryId, taskId, logFocus, settings.workMin, settings.roundsUntilLongBreak, durations, notifyEnd],
  );

  const complete = React.useCallback(() => advance(true), [advance]);
  const skip = React.useCallback(() => advance(false), [advance]);

  // Тик таймера
  React.useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  // Завершение сессии
  React.useEffect(() => {
    if (secondsLeft === 0 && running) complete();
  }, [secondsLeft, running, complete]);

  const total = durations[mode];
  const progress = 1 - secondsLeft / total;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const switchMode = (m: Mode) => {
    setMode(m);
    setSecondsLeft(durations[m]);
    setRunning(false);
  };
  const reset = () => {
    setRunning(false);
    setSecondsLeft(durations[mode]);
  };

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Режим фокусировки</span>
          <span className="flex items-center gap-3 text-sm font-normal text-muted-foreground">
            Раунд {round} · Pomodoro
            <button
              onClick={() => setSettingsOpen(true)}
              className="rounded-lg p-1.5 hover:bg-muted hover:text-foreground"
              aria-label="Настройки фокуса"
            >
              <Settings className="h-4 w-4" />
            </button>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        {/* Режимы */}
        <div className="flex gap-1 rounded-xl bg-muted p-1 text-sm">
          {(["work", "short", "long"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={cn(
                "rounded-lg px-3 py-1.5 transition-colors",
                mode === m ? "bg-background shadow-sm" : "text-muted-foreground",
              )}
            >
              {MODE_LABEL[m]}
            </button>
          ))}
        </div>

        <ProgressRing progress={progress} label={`${mm}:${ss}`} />

        {/* Категории фокуса */}
        <div className="w-full space-y-2">
          <p className="text-sm font-medium">Категория фокуса</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryId(c.id)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm transition-colors",
                  categoryId === c.id ? "border-primary" : "hover:bg-muted",
                )}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                {c.name}
              </button>
            ))}

            {adding ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newCat.trim()) {
                    const color = NEW_CAT_COLORS[Math.floor(Math.random() * NEW_CAT_COLORS.length)];
                    addCategory(newCat.trim(), color);
                    setNewCat("");
                    setAdding(false);
                  }
                }}
                className="flex items-center gap-1"
              >
                <Input
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  placeholder="Новая…"
                  className="h-9 w-32"
                  autoFocus
                />
                <Button type="submit" size="sm" className="rounded-xl">
                  Ок
                </Button>
              </form>
            ) : (
              <button
                onClick={() => setAdding(true)}
                className="flex items-center gap-1 rounded-xl border border-dashed px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
              >
                <Plus className="h-3.5 w-3.5" /> Категория
              </button>
            )}
          </div>
        </div>

        {/* Привязка к задаче */}
        <div className="w-full space-y-2">
          <p className="text-sm font-medium">Задача (необязательно)</p>
          <select
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Без привязки к задаче</option>
            {activeTasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* Управление */}
        <div className="flex items-center gap-2">
          <Button onClick={() => setRunning((r) => !r)} size="lg" className="rounded-xl">
            {running ? (
              <>
                <Pause className="h-4 w-4" /> Пауза
              </>
            ) : (
              <>
                <Play className="h-4 w-4" /> Старт
              </>
            )}
          </Button>
          <Button
            onClick={reset}
            variant="outline"
            size="icon"
            className="rounded-xl"
            aria-label="Сброс"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            onClick={skip}
            variant="outline"
            size="icon"
            className="rounded-xl"
            aria-label="Пропустить (засчитать сессию)"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          «Пропустить» засчитывает рабочую сессию в статистику — удобно для демо графика.
        </p>
      </CardContent>

      <FocusSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </Card>
  );
}

function ProgressRing({ progress, label }: { progress: number; label: string }) {
  const r = 88;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-56 w-56">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={r} className="fill-none stroke-muted" strokeWidth="12" />
        <circle
          cx="100"
          cy="100"
          r={r}
          className="fill-none stroke-primary transition-[stroke-dashoffset] duration-500"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - progress)}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-5xl font-bold tabular-nums">{label}</span>
      </div>
    </div>
  );
}
