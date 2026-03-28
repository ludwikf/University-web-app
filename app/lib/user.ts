export type UserRole = "admin" | "devops" | "developer";

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};

const STORAGE_KEY = "currentUser";

export const MOCK_USERS: User[] = [
  {
    id: "mock-admin-1",
    firstName: "Jan",
    lastName: "Kowalski",
    role: "admin",
  },
  {
    id: "mock-dev-1",
    firstName: "Anna",
    lastName: "Nowak",
    role: "developer",
  },
  {
    id: "mock-dev-2",
    firstName: "Piotr",
    lastName: "Zieliński",
    role: "developer",
  },
  {
    id: "mock-devops-1",
    firstName: "Maria",
    lastName: "Wiśniewska",
    role: "devops",
  },
];

export const MOCK_USER: User = MOCK_USERS[0];

export function getMockUsers(): User[] {
  return MOCK_USERS;
}

export function canAssignToTask(user: User): boolean {
  return user.role === "devops" || user.role === "developer";
}

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

function normalizeStoredUser(stored: User | null): User {
  if (!stored) return MOCK_USER;
  if (!stored.role) {
    const match = MOCK_USERS.find((u) => u.id === stored.id);
    if (match) return match;
    return { ...stored, role: "admin" as UserRole };
  }
  return stored;
}

export function getCurrentUser(): User {
  const stored = getStored();
  const user = normalizeStoredUser(stored);
  if (!stored || !stored.role) setStored(user);
  return user;
}

export function setCurrentUser(user: User | null): void {
  setStored(user);
}

export function usersToMap(users: User[]): Map<string, User> {
  return new Map(users.map((u) => [u.id, u]));
}
