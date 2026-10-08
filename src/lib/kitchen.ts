import { useSyncExternalStore } from "react";

export type MenuCat = "Smoothies" | "Proteicos" | "Comidas" | "Bowls" | "Snacks";
export type MenuItem = { id: string; name: string; cat: MenuCat; price: number; kcal: number; p: number; c: number; f: number; available: boolean };
export type OrderStatus = "Pendiente" | "En preparación" | "Listo para entregar" | "Entregado";
export type Order = { id: number; customer: string; items: { id: string; name: string; q: number; price: number }[]; total: number; status: OrderStatus; source: "POS" | "App cliente"; paid: boolean; time: string; note?: string };

export const MENU_CATS: MenuCat[] = ["Smoothies", "Proteicos", "Comidas", "Bowls", "Snacks"];
export const STATUSES: OrderStatus[] = ["Pendiente", "En preparación", "Listo para entregar", "Entregado"];

let menu: MenuItem[] = ([
  ["Green Power Smoothie", "Smoothies", 85, 210, 6, 38, 3],
  ["Berry Recovery", "Smoothies", 90, 240, 8, 44, 4],
  ["Mango Tropical", "Smoothies", 85, 230, 5, 48, 2],
  ["Whey Chocolate Shake", "Proteicos", 95, 320, 35, 28, 7],
  ["Peanut Gainer", "Proteicos", 110, 520, 38, 52, 18],
  ["Vanilla Iso Shake", "Proteicos", 95, 260, 32, 22, 4],
  ["Pechuga con arroz y brócoli", "Comidas", 145, 520, 45, 55, 10],
  ["Salmón con quinoa", "Comidas", 189, 610, 42, 48, 24],
  ["Wrap de pavo integral", "Comidas", 120, 430, 32, 40, 14],
  ["Poke Bowl de atún", "Bowls", 165, 540, 38, 58, 16],
  ["Açaí Bowl", "Bowls", 125, 380, 8, 64, 11],
  ["Burrito Bowl fit", "Bowls", 140, 560, 36, 62, 15],
  ["Barra proteica casera", "Snacks", 45, 210, 15, 22, 7],
  ["Hummus con vegetales", "Snacks", 60, 180, 7, 18, 9],
  ["Yogurt griego con granola", "Snacks", 55, 240, 18, 28, 6],
] as const).map(([name, cat, price, kcal, p, c, f], i) => ({ id: `m${i}`, name, cat, price, kcal, p, c, f, available: true }));

let orders: Order[] = [
  { id: 301, customer: "Sofía Hernández", items: [{ id: "m3", name: "Whey Chocolate Shake", q: 1, price: 95 }], total: 95, status: "Pendiente", source: "App cliente", paid: true, time: "18:42" },
  { id: 302, customer: "Diego Ramírez", items: [{ id: "m6", name: "Pechuga con arroz y brócoli", q: 1, price: 145 }, { id: "m1", name: "Berry Recovery", q: 1, price: 90 }], total: 235, status: "En preparación", source: "POS", paid: true, time: "18:35" },
  { id: 303, customer: "Valeria López", items: [{ id: "m10", name: "Açaí Bowl", q: 1, price: 125 }], total: 125, status: "Listo para entregar", source: "App cliente", paid: false, time: "18:20", note: "Sin miel" },
];

const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
const subscribe = (f: () => void) => { subs.add(f); return () => subs.delete(f); };

export const useMenu = () => useSyncExternalStore(subscribe, () => menu, () => menu);
export const useOrders = () => useSyncExternalStore(subscribe, () => orders, () => orders);

export function saveMenuItem(item: MenuItem) {
  menu = menu.some((m) => m.id === item.id) ? menu.map((m) => (m.id === item.id ? item : m)) : [...menu, item];
  emit();
}
export function deleteMenuItem(id: string) { menu = menu.filter((m) => m.id !== id); emit(); }
export function toggleAvailable(id: string) { menu = menu.map((m) => (m.id === id ? { ...m, available: !m.available } : m)); emit(); }

export function placeOrder(o: Omit<Order, "id" | "status" | "time">) {
  const order: Order = { ...o, id: Math.max(300, ...orders.map((x) => x.id)) + 1, status: "Pendiente", time: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) };
  orders = [order, ...orders]; emit(); return order;
}
export function setOrderStatus(id: number, status: OrderStatus) { orders = orders.map((o) => (o.id === id ? { ...o, status } : o)); emit(); }
export function markPaid(id: number) { orders = orders.map((o) => (o.id === id ? { ...o, paid: true } : o)); emit(); }
