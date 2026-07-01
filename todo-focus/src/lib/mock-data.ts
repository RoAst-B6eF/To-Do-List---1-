import type { DailyFocus, FocusCategory, FocusSettings, Task, WeeklyFocus } from "./types";

/** ISO-строка для дедлайна со сдвигом в днях от текущего момента. */
function iso(daysFromNow: number, hour = 18, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export function seedTasks(): Task[] {
  const now = new Date().toISOString();
  return [
    {
      id: "t1",
      title: "Сдать отчёт по проекту",
      description: "Финальная версия квартального отчёта для команды.",
      deadline: iso(-1), // просрочено
      status: "active",
      createdAt: now,
    },
    {
      id: "t2",
      title: "Созвон с дизайнером",
      description: "Обсудить макеты главного экрана.",
      deadline: iso(0, 21), // сегодня + горит + красный
      status: "active",
      createdAt: now,
    },
    {
      id: "t3",
      title: "Подготовить презентацию",
      description: "Слайды для демо новой фичи.",
      deadline: iso(2), // красный + горит
      status: "active",
      createdAt: now,
    },
    {
      id: "t4",
      title: "Код-ревью PR #142",
      description: "Проверить изменения в модуле авторизации.",
      deadline: iso(4), // жёлтый
      status: "active",
      createdAt: now,
    },
    {
      id: "t5",
      title: "Написать тесты",
      description: "Покрыть юнит-тестами сервис задач.",
      deadline: iso(6), // зелёный
      status: "active",
      createdAt: now,
    },
    {
      id: "t6",
      title: "Спланировать спринт",
      description: "Набросать задачи на следующие две недели.",
      deadline: iso(10), // серый
      status: "active",
      createdAt: now,
    },
    {
      id: "t7",
      title: "Обновить документацию",
      description: "Актуализировать README репозитория.",
      deadline: iso(3),
      status: "completed",
      createdAt: now,
      completedAt: now,
    },
  ];
}

export function seedCategories(): FocusCategory[] {
  return [
    { id: "c1", name: "Работа над проектами", color: "#6366f1" },
    { id: "c2", name: "Учёба", color: "#10b981" },
    { id: "c3", name: "Чтение", color: "#f59e0b" },
  ];
}

export function seedFocusSettings(): FocusSettings {
  return {
    workMin: 25,
    shortBreakMin: 5,
    longBreakMin: 15,
    roundsUntilLongBreak: 4,
    soundEnabled: true,
    notifyOnSessionEnd: true,
    dailySummaryEnabled: false,
    dailySummaryHour: 20,
  };
}

export function seedProfileName(): string {
  return "Александр";
}

/** ~12 недель правдоподобной истории фокуса с гарантированной свежей серией и рекордным днём. */
export function seedDailyFocus(): DailyFocus {
  const map: DailyFocus = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  const key = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  for (let i = 83; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (Math.random() < 0.35) continue; // день без фокуса — правдоподобные пропуски
    map[key(d)] = Math.round((20 + Math.random() * 100) / 5) * 5;
  }

  // Гарантированная серия последних дней (не включая сегодня), чтобы streak был ненулевым сразу
  for (let i = 5; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    map[key(d)] = Math.round((30 + Math.random() * 60) / 5) * 5;
  }

  // Рекордный день
  const recordDay = new Date(today);
  recordDay.setDate(recordDay.getDate() - 20);
  map[key(recordDay)] = 240;

  return map;
}

export function seedWeekly(categories: FocusCategory[]): WeeklyFocus {
  const [a, b, c] = categories.map((x) => x.id);
  return {
    Пн: { [a]: 50, [b]: 25, [c]: 0 },
    Вт: { [a]: 75, [b]: 0, [c]: 25 },
    Ср: { [a]: 25, [b]: 50, [c]: 25 },
    Чт: { [a]: 100, [b]: 25, [c]: 0 },
    Пт: { [a]: 50, [b]: 50, [c]: 50 },
    Сб: { [a]: 0, [b]: 25, [c]: 75 },
    Вс: { [a]: 25, [b]: 0, [c]: 25 },
  };
}
