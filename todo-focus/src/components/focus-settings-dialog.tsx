"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";

export function FocusSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { settings, updateSettings } = useStore();
  const [permission, setPermission] = React.useState<NotificationPermission | "unsupported">(
    "unsupported",
  );

  React.useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, [open]);

  const requestPermission = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const num = (v: string, fallback: number) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Настройки фокуса</DialogTitle>
          <DialogDescription>Длительности, звук и уведомления Pomodoro.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="workMin">Работа, мин</Label>
              <Input
                id="workMin"
                type="number"
                min={1}
                value={settings.workMin}
                onChange={(e) => updateSettings({ workMin: num(e.target.value, settings.workMin) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shortMin">Короткий, мин</Label>
              <Input
                id="shortMin"
                type="number"
                min={1}
                value={settings.shortBreakMin}
                onChange={(e) =>
                  updateSettings({ shortBreakMin: num(e.target.value, settings.shortBreakMin) })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="longMin">Длинный, мин</Label>
              <Input
                id="longMin"
                type="number"
                min={1}
                value={settings.longBreakMin}
                onChange={(e) =>
                  updateSettings({ longBreakMin: num(e.target.value, settings.longBreakMin) })
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rounds">Раундов до длинного перерыва</Label>
            <Input
              id="rounds"
              type="number"
              min={1}
              className="w-24"
              value={settings.roundsUntilLongBreak}
              onChange={(e) =>
                updateSettings({
                  roundsUntilLongBreak: num(e.target.value, settings.roundsUntilLongBreak),
                })
              }
            />
          </div>

          <div className="space-y-2 border-t pt-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={settings.soundEnabled}
                onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
              />
              Звук по окончании сессии
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={settings.notifyOnSessionEnd}
                onChange={(e) => updateSettings({ notifyOnSessionEnd: e.target.checked })}
              />
              Браузерное уведомление по окончании сессии
            </label>
          </div>

          <div className="space-y-2 border-t pt-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={settings.dailySummaryEnabled}
                onChange={(e) => updateSettings({ dailySummaryEnabled: e.target.checked })}
              />
              Ежедневная сводка времени в фокусе
            </label>
            <div className="flex items-center gap-2 pl-6 text-sm text-muted-foreground">
              <span>Присылать в</span>
              <Input
                type="number"
                min={0}
                max={23}
                disabled={!settings.dailySummaryEnabled}
                className="h-8 w-20"
                value={settings.dailySummaryHour}
                onChange={(e) =>
                  updateSettings({
                    dailySummaryHour: Math.min(23, Math.max(0, num(e.target.value, settings.dailySummaryHour))),
                  })
                }
              />
              <span>:00</span>
            </div>
          </div>

          {permission !== "unsupported" && (
            <div className="rounded-lg bg-muted p-3 text-sm">
              {permission === "granted" && "Уведомления разрешены."}
              {permission === "denied" &&
                "Уведомления заблокированы в браузере — разрешите их в настройках сайта."}
              {permission === "default" && (
                <div className="flex items-center justify-between gap-2">
                  <span>Нужно разрешение браузера на уведомления.</span>
                  <Button size="sm" variant="outline" className="rounded-xl" onClick={requestPermission}>
                    Разрешить
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button className="rounded-xl" onClick={() => onOpenChange(false)}>
            Готово
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
