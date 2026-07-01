"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListTodo, Timer, User } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Задачи", icon: ListTodo },
  { href: "/focus", label: "Фокус", icon: Timer },
  { href: "/profile", label: "Профиль", icon: User },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-4 sm:gap-6">
          <span className="font-semibold">✦ To-Do &amp; Focus</span>
          <nav className="flex items-center gap-1">
            {LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm transition-colors",
                    active ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <l.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{l.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
