"use client";

import * as React from "react";
import type { DailyFocus, FocusCategory, FocusSettings, Task, WeeklyFocus } from "./types";
import {
  seedCategories,
  seedDailyFocus,
  seedFocusSettings,
  seedProfileName,
  seedTasks,
  seedWeekly,
} from "./mock-data";

interface StoreValue {
  tasks: Task[];
  categories: FocusCategory[];
  weekly: WeeklyFocus;
  dailyFocus: DailyFocus;
  settings: FocusSettings;
  totalFocusMinutes: number;
  todayFocusMinutes: number;
  profileName: string;
  setProfileName: (name: string) => void;
  addTask: (t: Pick<Task, "title" | "description" | "deadline">) => void;
  updateTask: (id: string, patch: Partial<Pick<Task, "title" | "description" | "deadline">>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  addCategory: (name: string, color: string) => void;
  logFocus: (categoryId: string, minutes: number, taskId?: string) => void;
  updateSettings: (patch: Partial<FocusSettings>) => void;
  markSummaryNotified: () => void;
  lastSummaryDate: string;
}

const StoreContext = React.createContext<StoreValue | null>(null);
const LS_KEY = "todo-focus-state-v1";
const WEEKDAYS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

/** Локальная дата в формате YYYY-MM-DD (для ключей дневной статистики). */
function todayKey(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [categories, setCategories] = React.useState<FocusCategory[]>([]);
  const [weekly, setWeekly] = React.useState<WeeklyFocus>({});
  const [settings, setSettings] = React.useState<FocusSettings>(seedFocusSettings());
  const [dailyFocus, setDailyFocus] = React.useState<DailyFocus>({});
  const [lastSummaryDate, setLastSummaryDate] = React.useState("");
  const [profileName, setProfileName] = React.useState("");

  // Инициализация на клиенте (localStorage + сиды), чтобы не было hydration mismatch.
  React.useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null;
    const cats = seedCategories();
    if (raw) {
      try {
        const s = JSON.parse(raw);
        setTasks(s.tasks ?? seedTasks());
        setCategories(s.categories ?? cats);
        setWeekly(s.weekly ?? seedWeekly(s.categories ?? cats));
        setSettings({ ...seedFocusSettings(), ...(s.settings ?? {}) });
        setDailyFocus(s.dailyFocus ?? seedDailyFocus());
        setLastSummaryDate(s.lastSummaryDate ?? "");
        setProfileName(s.profileName ?? seedProfileName());
      } catch {
        setTasks(seedTasks());
        setCategories(cats);
        setWeekly(seedWeekly(cats));
        setSettings(seedFocusSettings());
        setDailyFocus(seedDailyFocus());
        setProfileName(seedProfileName());
      }
    } else {
      setTasks(seedTasks());
      setCategories(cats);
      setWeekly(seedWeekly(cats));
      setSettings(seedFocusSettings());
      setDailyFocus(seedDailyFocus());
      setProfileName(seedProfileName());
    }
    setMounted(true);
  }, []);

  // Персист
  React.useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({
        tasks,
        categories,
        weekly,
        settings,
        dailyFocus,
        lastSummaryDate,
        profileName,
      }),
    );
  }, [mounted, tasks, categories, weekly, settings, dailyFocus, lastSummaryDate, profileName]);

  const addTask: StoreValue["addTask"] = (t) =>
    setTasks((prev) => [
      {
        id: crypto.randomUUID(),
        title: t.title,
        description: t.description,
        deadline: t.deadline,
        status: "active",
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

  const updateTask: StoreValue["updateTask"] = (id, patch) =>
    setTasks((p) => p.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const deleteTask = (id: string) => setTasks((p) => p.filter((t) => t.id !== id));

  const toggleComplete = (id: string) =>
    setTasks((p) =>
      p.map((t) =>
        t.id === id
          ? {
              ...t,
              status: t.status === "active" ? "completed" : "active",
              completedAt: t.status === "active" ? new Date().toISOString() : undefined,
            }
          : t,
      ),
    );

  const addCategory = (name: string, color: string) =>
    setCategories((p) => [...p, { id: crypto.randomUUID(), name, color }]);

  const logFocus: StoreValue["logFocus"] = (categoryId, minutes, taskId) => {
    const today = WEEKDAYS[new Date().getDay()];
    setWeekly((p) => ({
      ...p,
      [today]: { ...(p[today] ?? {}), [categoryId]: (p[today]?.[categoryId] ?? 0) + minutes },
    }));
    const key = todayKey();
    setDailyFocus((p) => ({ ...p, [key]: (p[key] ?? 0) + minutes }));
    if (taskId) {
      setTasks((p) =>
        p.map((t) => (t.id === taskId ? { ...t, focusMinutes: (t.focusMinutes ?? 0) + minutes } : t)),
      );
    }
  };

  const updateSettings: StoreValue["updateSettings"] = (patch) =>
    setSettings((p) => ({ ...p, ...patch }));

  const markSummaryNotified = () => setLastSummaryDate(todayKey());

  const totalFocusMinutes = React.useMemo(
    () =>
      Object.values(weekly).reduce(
        (sum, day) => sum + Object.values(day).reduce((a, b) => a + b, 0),
        0,
      ),
    [weekly],
  );

  const todayFocusMinutes = dailyFocus[todayKey()] ?? 0;

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Загрузка…
      </div>
    );
  }

  return (
    <StoreContext.Provider
      value={{
        tasks,
        categories,
        weekly,
        dailyFocus,
        settings,
        totalFocusMinutes,
        todayFocusMinutes,
        profileName,
        setProfileName,
        addTask,
        updateTask,
        deleteTask,
        toggleComplete,
        addCategory,
        logFocus,
        updateSettings,
        markSummaryNotified,
        lastSummaryDate,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
