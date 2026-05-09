"use client";

import * as React from "react";
import { useSyncExternalStore } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/app/lib/user";
import {
  NOTIFICATIONS_ADDED_EVENT,
  NOTIFICATIONS_CHANGED_EVENT,
  NOTIFICATIONS_STORAGE_KEY,
  type Notification,
  type NotificationsAddedDetail,
  getNotificationById,
  getNotifications,
  markNotificationRead,
} from "@/app/lib/notifications";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type NotificationContextValue = {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  refresh: () => void;
};

const NotificationContext = React.createContext<NotificationContextValue | null>(
  null
);

const SERVER_NOTIFICATIONS_SNAPSHOT: Notification[] = [];

let clientSnapshotCache: {
  json: string;
  snapshot: Notification[];
} | null = null;

function getClientNotificationSnapshot(): Notification[] {
  const list = getNotifications();
  const json = JSON.stringify(list);
  if (!clientSnapshotCache || clientSnapshotCache.json !== json) {
    clientSnapshotCache = { json, snapshot: list };
  }
  return clientSnapshotCache.snapshot;
}

function subscribeNotifications(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  const onStorage = (e: StorageEvent) => {
    if (e.key === NOTIFICATIONS_STORAGE_KEY || e.key === null) {
      onStoreChange();
    }
  };
  window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, handler);
  window.addEventListener(NOTIFICATIONS_ADDED_EVENT, handler);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, handler);
    window.removeEventListener(NOTIFICATIONS_ADDED_EVENT, handler);
    window.removeEventListener("storage", onStorage);
  };
}

function priorityLabel(p: Notification["priority"]): string {
  switch (p) {
    case "high":
      return "Wysoki";
    case "medium":
      return "Średni";
    case "low":
      return "Niski";
    default:
      return p;
  }
}

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const fullList = useSyncExternalStore(
    subscribeNotifications,
    getClientNotificationSnapshot,
    () => SERVER_NOTIFICATIONS_SNAPSHOT
  );

  const [popupQueue, setPopupQueue] = React.useState<string[]>([]);

  React.useEffect(() => {
    const onAdded = (e: Event) => {
      const ce = e as CustomEvent<NotificationsAddedDetail>;
      const ids = ce.detail?.ids;
      if (!ids?.length) return;
      const user = getCurrentUser();
      const list = getNotifications();
      const eligible = ids.filter((id) => {
        const n = list.find((x) => x.id === id);
        return (
          n &&
          n.recipientId === user.id &&
          !n.isRead &&
          (n.priority === "medium" || n.priority === "high")
        );
      });
      if (eligible.length) {
        setPopupQueue((q) => [...new Set([...q, ...eligible])]);
      }
    };
    window.addEventListener(NOTIFICATIONS_ADDED_EVENT, onAdded as EventListener);
    return () =>
      window.removeEventListener(
        NOTIFICATIONS_ADDED_EVENT,
        onAdded as EventListener
      );
  }, []);

  const refresh = React.useCallback(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
    }
  }, []);

  const user = getCurrentUser();
  const mine = React.useMemo(() => {
    return fullList
      .filter((n) => n.recipientId === user.id)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [fullList, user.id]);

  const unreadCount = React.useMemo(
    () => mine.filter((n) => !n.isRead).length,
    [mine]
  );

  const markAsRead = React.useCallback(
    (id: string) => {
      markNotificationRead(id);
      refresh();
    },
    [refresh]
  );

  const value = React.useMemo<NotificationContextValue>(
    () => ({
      notifications: mine,
      unreadCount,
      markAsRead,
      refresh,
    }),
    [mine, unreadCount, markAsRead, refresh]
  );

  const activePopupId = popupQueue[0] ?? null;
  const activePopup =
    activePopupId != null
      ? fullList.find((n) => n.id === activePopupId) ??
        getNotificationById(activePopupId)
      : null;

  function closePopup() {
    setPopupQueue((q) => q.slice(1));
  }

  function closePopupAndMarkRead() {
    if (activePopupId) markNotificationRead(activePopupId);
    refresh();
    setPopupQueue((q) => q.slice(1));
  }

  React.useEffect(() => {
    if (activePopupId && !activePopup) {
      setPopupQueue((q) => q.slice(1));
    }
  }, [activePopupId, activePopup]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Dialog
        open={Boolean(activePopup)}
        onOpenChange={(open) => {
          if (!open) closePopup();
        }}
      >
        {activePopup ? (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-start justify-between gap-2">
                <DialogTitle>{activePopup.title}</DialogTitle>
                <span
                  className={cn(
                    "shrink-0 rounded-md px-2 py-0.5 text-xs font-medium",
                    activePopup.priority === "high" &&
                      "bg-destructive/15 text-destructive",
                    activePopup.priority === "medium" &&
                      "bg-secondary text-secondary-foreground",
                    activePopup.priority === "low" &&
                      "bg-muted text-muted-foreground"
                  )}
                >
                  {priorityLabel(activePopup.priority)}
                </span>
              </div>
              <DialogDescription className="text-left text-foreground/90 whitespace-pre-wrap">
                {activePopup.message}
              </DialogDescription>
              <p className="text-xs text-muted-foreground">
                {new Date(activePopup.date).toLocaleString("pl-PL")}
              </p>
            </DialogHeader>
            <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={closePopup}>
                Zamknij
              </Button>
              <Button onClick={closePopupAndMarkRead}>
                Oznacz jako przeczytane
              </Button>
              <Link
                href={`/notifications/${activePopup.id}`}
                className={cn(
                  buttonVariants({ variant: "secondary" }),
                  "inline-flex text-center no-underline"
                )}
                onClick={() => closePopup()}
              >
                Otwórz szczegóły
              </Link>
            </DialogFooter>
          </DialogContent>
        ) : null}
      </Dialog>
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = React.useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications musi być użyty wewnątrz NotificationProvider");
  }
  return ctx;
}
