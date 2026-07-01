export type TaskStatus = "active" | "completed";

export interface Task {
  id: string;
  title: string;
  description?: string;
  /** ISO datetime */
  deadline: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
  /** Суммарное время фокуса, привязанное к этой задаче, мин. */
  focusMinutes?: number;
}

export interface FocusCategory {
  id: string;
  name: string;
  /** HEX-цвет для маркера и графика */
  color: string;
}

/** weekday (Пн..Вс) -> categoryId -> минуты фокуса */
export type WeeklyFocus = Record<string, Record<string, number>>;

/** ISO-дата (YYYY-MM-DD) -> минуты фокуса за день */
export type DailyFocus = Record<string, number>;

export interface FocusSettings {
  workMin: number;
  shortBreakMin: number;
  longBreakMin: number;
  roundsUntilLongBreak: number;
  soundEnabled: boolean;
  notifyOnSessionEnd: boolean;
  dailySummaryEnabled: boolean;
  /** Час (0-23), в который присылается сводка за день. */
  dailySummaryHour: number;
}
