"use client";

import type { Achievement } from "@/lib/achievements";
import { cn } from "@/lib/utils";

export function AchievementsGrid({ achievements }: { achievements: Achievement[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {achievements.map((a) => (
        <div
          key={a.id}
          className={cn(
            "flex flex-col items-center gap-2 rounded-xl border p-4 text-center shadow-sm transition-colors",
            a.unlocked ? "border-indigo-500/40 bg-indigo-500/5" : "border-border bg-card opacity-60",
          )}
        >
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              a.unlocked ? "bg-indigo-500/15 text-indigo-400" : "bg-muted text-muted-foreground",
            )}
          >
            <a.icon className="h-5 w-5" />
          </div>
          <div className="text-xs font-medium">{a.title}</div>
          <div className="text-[11px] text-muted-foreground">{a.description}</div>
          {a.progress && !a.unlocked && (
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-indigo-500"
                style={{ width: `${Math.min(100, (a.progress.current / a.progress.target) * 100)}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
