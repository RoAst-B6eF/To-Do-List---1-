import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { StoreProvider } from "@/lib/store";
import { AppNav } from "@/components/app-nav";
import { FocusDailyNotifier } from "@/components/focus-daily-notifier";

export const metadata: Metadata = {
  title: "To-Do & Focus",
  description: "Задачник с авто-приоритетами и режимом фокусировки",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <StoreProvider>
            <div className="flex min-h-screen flex-col">
              <AppNav />
              <main className="flex-1">{children}</main>
            </div>
            <FocusDailyNotifier />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
