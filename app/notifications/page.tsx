"use client";

import Link from "next/link";
import { useNotifications } from "@/app/contexts/notification-context";
import { markAllReadForRecipient } from "@/app/lib/notifications";
import { getCurrentUser } from "@/app/lib/user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function priorityBadge(p: "low" | "medium" | "high") {
  switch (p) {
    case "high":
      return "bg-destructive/15 text-destructive";
    case "medium":
      return "bg-secondary text-secondary-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, refresh } =
    useNotifications();
  const user = getCurrentUser();

  function markAll() {
    markAllReadForRecipient(user.id);
    refresh();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-[30px] py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          Powiadomienia
        </h1>
        <div className="flex flex-wrap gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAll}>
              Oznacz wszystkie jako przeczytane
            </Button>
          )}
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
          >
            Wróć do aplikacji
          </Link>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Nieprzeczytane: <span className="font-medium text-foreground">{unreadCount}</span>
      </p>

      {notifications.length === 0 ? (
        <p className="text-sm text-muted-foreground">Brak powiadomień.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li key={n.id}>
              <Card
                className={cn(
                  "gap-2 py-3 transition-opacity",
                  n.isRead && "opacity-70"
                )}
              >
                <CardHeader className="flex-row flex-wrap items-start justify-between gap-2 space-y-0 px-4 pb-0">
                  <div className="min-w-0 flex-1 space-y-1">
                    <CardTitle className="text-base leading-snug">
                      <Link
                        href={`/notifications/${n.id}`}
                        className="hover:underline"
                      >
                        {n.title}
                      </Link>
                    </CardTitle>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {n.message}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-md px-2 py-0.5 text-xs font-medium",
                      priorityBadge(n.priority)
                    )}
                  >
                    {n.priority === "high"
                      ? "Wysoki"
                      : n.priority === "medium"
                        ? "Średni"
                        : "Niski"}
                  </span>
                </CardHeader>
                <CardContent className="px-4 pt-0">
                  <p className="text-xs text-muted-foreground">
                    {new Date(n.date).toLocaleString("pl-PL")}
                  </p>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2 border-t px-4 pt-2">
                  <Link
                    href={`/notifications/${n.id}`}
                    className={cn(
                      buttonVariants({ variant: "secondary", size: "sm" })
                    )}
                  >
                    Szczegóły
                  </Link>
                  {!n.isRead && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markAsRead(n.id)}
                    >
                      Oznacz jako przeczytane
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
