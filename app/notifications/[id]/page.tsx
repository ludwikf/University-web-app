"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useNotifications } from "@/app/contexts/notification-context";
import { getNotificationById } from "@/app/lib/notifications";
import { getCurrentUser } from "@/app/lib/user";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotificationDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { notifications, markAsRead } = useNotifications();
  const user = getCurrentUser();

  const n =
    notifications.find((x) => x.id === id) ?? getNotificationById(id) ?? null;

  React.useEffect(() => {
    if (!n || n.recipientId !== user.id || n.isRead) return;
    markAsRead(n.id);
  }, [n, user.id, markAsRead]);

  if (!id || !n) {
    return (
      <div className="space-y-4 px-[30px] py-10">
        <p className="text-muted-foreground">Nie znaleziono powiadomienia.</p>
        <Link href="/notifications" className={cn(buttonVariants())}>
          Lista powiadomień
        </Link>
      </div>
    );
  }

  if (n.recipientId !== user.id) {
    return (
      <div className="space-y-4 px-[30px] py-10">
        <p className="text-muted-foreground">
          To powiadomienie nie jest skierowane do Ciebie.
        </p>
        <Link href="/notifications" className={cn(buttonVariants())}>
          Lista powiadomień
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 px-[30px] py-8">
      <div className="flex flex-wrap gap-2">
        <Link
          href="/notifications"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          ← Wszystkie powiadomienia
        </Link>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          Strona główna
        </Link>
      </div>
      <article className="space-y-4 rounded-xl border border-border bg-card p-6">
        <header className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {new Date(n.date).toLocaleString("pl-PL")}
          </p>
          <h1 className="text-xl font-semibold tracking-tight">{n.title}</h1>
          <p className="text-xs font-medium text-muted-foreground">
            Priorytet:{" "}
            {n.priority === "high"
              ? "wysoki"
              : n.priority === "medium"
                ? "średni"
                : "niski"}
          </p>
        </header>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {n.message}
        </p>
        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          {!n.isRead ? (
            <Button size="sm" onClick={() => markAsRead(n.id)}>
              Oznacz jako przeczytane
            </Button>
          ) : (
            <span className="text-sm text-muted-foreground">Przeczytane</span>
          )}
        </div>
      </article>
    </div>
  );
}
