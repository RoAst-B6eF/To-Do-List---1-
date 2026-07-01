"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PRIORITY_CONFIG, type TaskPriority } from "@/lib/priority";
import { cn } from "@/lib/utils";

export function PriorityDot({
  priority,
  className,
}: {
  priority: TaskPriority;
  className?: string;
}) {
  const cfg = PRIORITY_CONFIG[priority];
  const reduce = useReducedMotion();
  const burn = cfg.burning && !reduce; // уважаем prefers-reduced-motion

  return (
    <motion.span
      role="img"
      aria-label={cfg.label}
      title={cfg.label}
      className={cn("inline-block h-3 w-3 shrink-0 rounded-full", cfg.dotClass, className)}
      animate={
        burn
          ? {
              boxShadow: [
                "0 0 0 0 rgba(136,19,55,0.7)",
                "0 0 0 7px rgba(136,19,55,0)",
              ],
              scale: [1, 1.18, 1],
            }
          : undefined
      }
      transition={burn ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : undefined}
    />
  );
}
