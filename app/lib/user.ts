export type User = {
  id: string;
  firstName: string;
  lastName: string;
};

const STORAGE_KEY = "currentUser";

export const MOCK_USER: User = {
  id: "mock-user-1",
  firstName: "Jan",
  lastName: "Kowalski",
};

function getStored(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStored(user: User | null): void {
  if (typeof window === "undefined") return;
  if (user === null) localStorage.removeItem(STORAGE_KEY);
  else localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function getCurrentUser(): User {
  const stored = getStored();
  if (stored) return stored;
  setStored(MOCK_USER);
  return MOCK_USER;
}

export function setCurrentUser(user: User | null): void {
  setStored(user);
}
