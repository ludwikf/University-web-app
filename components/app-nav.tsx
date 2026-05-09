"use client";

import Link from "next/link";
import { useNotifications } from "@/app/contexts/notification-context";
import { getCurrentUser } from "@/app/lib/user";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function AppNav() {
  const { unreadCount } = useNotifications();

  return (
    <header className="border-b border-border bg-background">
      <div className="flex flex-wrap items-center justify-between gap-3 px-[30px] py-3">
        <nav className="flex flex-wrap items-center gap-4 text-sm">
          <Link
            href="/"
            className="font-semibold tracking-tight text-foreground hover:underline"
          >
            Project Manager
          </Link>
          <Separator
            orientation="vertical"
            className="hidden h-4 w-px sm:block"
          />
          <Link
            href="/notifications"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Powiadomienia
          </Link>
        </nav>
        <div className="flex flex-wrap items-center gap-3">
          <UserWithBadge unreadCount={unreadCount} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function UserWithBadge({ unreadCount }: { unreadCount: number }) {
  const { firstName, lastName, role } = getCurrentUser();

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>
        Zalogowany:{" "}
        <span className="font-medium text-foreground">
          {firstName} {lastName}
        </span>{" "}
        <span className="text-muted-foreground">({role})</span>
      </span>
      <Link
        href="/notifications"
        className={cn(
          "relative inline-flex min-h-6 min-w-6 items-center justify-center rounded-full border border-transparent text-center text-xs font-semibold transition-colors",
          unreadCount > 0
            ? "border-destructive/30 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        )}
        aria-label={
          unreadCount > 0
            ? `Powiadomienia, ${unreadCount} nieprzeczytanych`
            : "Powiadomienia, brak nieprzeczytanych"
        }
      >
        {unreadCount > 99 ? "99+" : unreadCount}
      </Link>
    </div>
  );
}
