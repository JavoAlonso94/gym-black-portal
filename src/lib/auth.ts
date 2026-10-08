import { useSyncExternalStore } from "react";

export type Role = "Administrador" | "Recepcionista" | "Entrenador" | "Cliente";
export const ROLES: Role[] = ["Administrador", "Recepcionista", "Entrenador", "Cliente"];
export type User = { name: string; email: string; role: Role };

const KEY = "gymblack-session";
const listeners = new Set<() => void>();
let cache: User | null | undefined;

function read(): User | null {
  if (typeof window === "undefined") return null;
  if (cache === undefined) {
    try { cache = JSON.parse(localStorage.getItem(KEY) || "null"); } catch { cache = null; }
  }
  return cache ?? null;
}

export function login(u: User) {
  cache = u;
  localStorage.setItem(KEY, JSON.stringify(u));
  listeners.forEach((l) => l());
}
export function logout() {
  cache = null;
  localStorage.removeItem(KEY);
  listeners.forEach((l) => l());
}
export function useUser() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    read,
    () => null,
  );
}
