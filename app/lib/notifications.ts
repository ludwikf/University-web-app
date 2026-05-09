import { MOCK_USERS } from "./user";

export type ISOString = string;
export type UserID = string;

export type NotificationPriority = "low" | "medium" | "high";

export type Notification = {
  id: string;
  title: string;
  message: string;
  date: ISOString;
  priority: NotificationPriority;
  isRead: boolean;
  recipientId: UserID;
};

export const NOTIFICATIONS_STORAGE_KEY = "app-notifications";
const STORAGE_KEY = NOTIFICATIONS_STORAGE_KEY;

export const NOTIFICATIONS_ADDED_EVENT = "app:notifications-added" as const;
export const NOTIFICATIONS_CHANGED_EVENT = "app:notifications-changed" as const;

export type NotificationsAddedDetail = { ids: string[] };

function getStored(): Notification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidNotification);
  } catch {
    return [];
  }
}

function isValidNotification(x: unknown): x is Notification {
  if (!x || typeof x !== "object") return false;
  const n = x as Record<string, unknown>;
  return (
    typeof n.id === "string" &&
    typeof n.title === "string" &&
    typeof n.message === "string" &&
    typeof n.date === "string" &&
    (n.priority === "low" ||
      n.priority === "medium" ||
      n.priority === "high") &&
    typeof n.isRead === "boolean" &&
    typeof n.recipientId === "string"
  );
}

function setStored(list: Notification[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function dispatchChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
}

function dispatchAdded(ids: string[]): void {
  if (typeof window === "undefined" || ids.length === 0) return;
  window.dispatchEvent(
    new CustomEvent(NOTIFICATIONS_ADDED_EVENT, {
      detail: { ids } as NotificationsAddedDetail,
    })
  );
}

export function getNotifications(): Notification[] {
  return getStored();
}

export function getNotificationById(id: string): Notification | null {
  return getStored().find((n) => n.id === id) ?? null;
}

export function getNotificationsForRecipient(
  recipientId: UserID
): Notification[] {
  return getStored()
    .filter((n) => n.recipientId === recipientId)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getUnreadCountForRecipient(recipientId: UserID): number {
  return getStored().filter((n) => n.recipientId === recipientId && !n.isRead)
    .length;
}

export function saveNotifications(list: Notification[]): void {
  setStored(list);
  dispatchChanged();
}

export function appendNotifications(
  items: Array<{
    title: string;
    message: string;
    priority: NotificationPriority;
    recipientId: UserID;
  }>
): string[] {
  if (items.length === 0) return [];
  const existing = getStored();
  const now = new Date().toISOString();
  const added: Notification[] = items.map((item) => ({
    id: crypto.randomUUID(),
    date: now,
    isRead: false,
    title: item.title,
    message: item.message,
    priority: item.priority,
    recipientId: item.recipientId,
  }));
  setStored([...existing, ...added]);
  const ids = added.map((a) => a.id);
  dispatchChanged();
  dispatchAdded(ids);
  return ids;
}

export function markNotificationRead(id: string): void {
  const all = getStored();
  const idx = all.findIndex((n) => n.id === id);
  if (idx === -1) return;
  if (all[idx].isRead) return;
  all[idx] = { ...all[idx], isRead: true };
  setStored(all);
  dispatchChanged();
}

export function markNotificationsRead(ids: string[]): void {
  if (ids.length === 0) return;
  const setIds = new Set(ids);
  const all = getStored().map((n) =>
    setIds.has(n.id) ? { ...n, isRead: true } : n
  );
  setStored(all);
  dispatchChanged();
}

export function markAllReadForRecipient(recipientId: UserID): void {
  const all = getStored().map((n) =>
    n.recipientId === recipientId ? { ...n, isRead: true } : n
  );
  setStored(all);
  dispatchChanged();
}

export function getAdminUserIds(): UserID[] {
  return MOCK_USERS.filter((u) => u.role === "admin").map((u) => u.id);
}

export function notifyProjectCreated(
  projectTitle: string,
  creatorId?: UserID
): void {
  const admins = getAdminUserIds();
  const items: Array<{
    recipientId: UserID;
    priority: NotificationPriority;
    title: string;
    message: string;
  }> = admins.map((recipientId) => ({
    recipientId,
    priority: "high",
    title: "Utworzono nowy projekt",
    message: `Dodano projekt „${projectTitle}”.`,
  }));
  if (creatorId && !admins.includes(creatorId)) {
    items.push({
      recipientId: creatorId,
      priority: "medium",
      title: "Utworzono nowy projekt",
      message: `Zapisano Twój projekt „${projectTitle}”.`,
    });
  }
  appendNotifications(items);
}

export function notifyTaskAssigned(
  assigneeId: UserID,
  taskName: string,
  storyName: string
): void {
  appendNotifications([
    {
      recipientId: assigneeId,
      priority: "high",
      title: "Przypisanie do zadania",
      message: `Przypisano Cię do zadania „${taskName}” w historyjce „${storyName}”.`,
    },
  ]);
}

export function notifyNewTaskForStoryOwner(
  ownerId: UserID,
  taskName: string,
  storyName: string
): void {
  appendNotifications([
    {
      recipientId: ownerId,
      priority: "medium",
      title: "Nowe zadanie w historyjce",
      message: `W historyjce „${storyName}” utworzono zadanie „${taskName}”.`,
    },
  ]);
}

export function notifyTaskDeletedForStoryOwner(
  ownerId: UserID,
  taskName: string,
  storyName: string
): void {
  appendNotifications([
    {
      recipientId: ownerId,
      priority: "medium",
      title: "Usunięto zadanie",
      message: `Z historyjki „${storyName}” usunięto zadanie „${taskName}”.`,
    },
  ]);
}

export function notifyTaskStatusForStoryOwner(
  ownerId: UserID,
  taskName: string,
  storyName: string,
  newStatus: "doing" | "done"
): void {
  const priority: NotificationPriority =
    newStatus === "done" ? "medium" : "low";
  const label = newStatus === "done" ? "zakończone" : "w trakcie";
  appendNotifications([
    {
      recipientId: ownerId,
      priority,
      title: "Zmiana statusu zadania",
      message: `Zadanie „${taskName}” w historyjce „${storyName}” ma status: ${label}.`,
    },
  ]);
}
