"use client";

import * as React from "react";
import { CalendarClock, Flame, ListTodo, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PRIORITY_CONFIG, type TaskPriority } from "@/lib/priority";
import { cn } from "@/lib/utils";

export type SidebarView = "all" | "today" | "burning" | `priority:${TaskPriority}`;

export interface SidebarCounts {
  all: number;
  today: number;
  burning: number;
  overdue: number;
  red: number;
  yellow: number;
  green: number;
  gray: number;
}

const PRIORITY_ORDER: TaskPriority[] = ["overdue", "red", "yellow", "green", "gray"];
const PRIORITY_LABEL: Record<TaskPriority, string> = {
  overdue: "Просрочено",
  red: "Красный",
  yellow: "Жёлтый",
  green: "Зелёный",
  gray: "Серый",
};

interface SidebarProps {
  active: SidebarView;
  onSelect: (v: SidebarView) => void;
  search: string;
  onSearchChange: (q: string) => void;
  counts: SidebarCounts;
}

export function Sidebar({ active, onSelect, search, onSearchChange, counts }: SidebarProps) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col gap-4 md:flex">
      {/* Поиск */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск задач…"
          className="rounded-xl pl-9 shadow-sm"
        />
      </div>

      <nav className="flex flex-col gap-1">
        <NavItem
          icon={<ListTodo className="h-4 w-4" />}
          label="Все задачи"
          count={counts.all}
          active={active === "all"}
          onClick={() => onSelect("all")}
        />
        <NavItem
          icon={<CalendarClock className="h-4 w-4" />}
          label="Сегодня"
          count={counts.today}
          active={active === "today"}
          onClick={() => onSelect("today")}
        />
        <NavItem
          icon={<Flame className="h-4 w-4 text-red-500" />}
          label="Горит"
          count={counts.burning}
          active={active === "burning"}
          onClick={() => onSelect("burning")}
        />

        <p className="px-3 pb-1 pt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          По важности
        </p>
        {PRIORITY_ORDER.map((p) => {
          const cfg = PRIORITY_CONFIG[p];
          const view = `priority:${p}` as SidebarView;
          return (
            <NavItem
              key={p}
              icon={
                <span
                  className={cn("h-3 w-3 rounded-full", cfg.dotClass, cfg.burning && "animate-pulse")}
                />
              }
              label={PRIORITY_LABEL[p]}
              count={counts[p]}
              active={active === view}
              onClick={() => onSelect(view)}
            />
          );
        })}
      </nav>
    </aside>
  );
}

function NavItem({
  icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-muted",
        active && "bg-muted font-medium",
      )}
    >
      <span className="flex h-4 w-4 items-center justify-center">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {typeof count === "number" && <span className="text-xs text-muted-foreground">{count}</span>}
    </button>
  );
}
