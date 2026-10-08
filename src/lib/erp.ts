import { useSyncExternalStore } from "react";
import { PRODUCTS } from "@/lib/data";
import { MEMBERS } from "@/lib/data";

const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
const sub = (f: () => void) => { subs.add(f); return () => subs.delete(f); };
const hook = <T,>(get: () => T) => () => useSyncExternalStore(sub, get, get);
const now = () => new Date().toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" });
const uid = () => Math.random().toString(36).slice(2, 8).toUpperCase();

export type Audit = { id: string; at: string; user: string; module: string; action: string; amount: number; type: "Ingreso" | "Egreso" | "Ajuste" };
let audit: Audit[] = [];
export const useAudit = hook(() => audit);
export function log(module: string, action: string, amount = 0, type: Audit["type"] = "Ajuste", user = "Sistema") {
  audit = [{ id: uid(), at: now(), user, module, action, amount, type }, ...audit]; emit();
}

export type Income = { id: string; at: string; concept: string; method: string; amount: number; source: string };
let incomes: Income[] = [
  { id: "I1", at: "2026-10-07", concept: "Membresías semana", method: "Tarjeta", amount: 49800, source: "Membresías" },
  { id: "I2", at: "2026-10-07", concept: "Ventas tienda semana", method: "Efectivo", amount: 16300, source: "POS" },
  { id: "I3", at: "2026-10-07", concept: "Cafetería semana", method: "Clip", amount: 8900, source: "Cocina" },
];
export const useIncomes = hook(() => incomes);
export function recordIncome(concept: string, amount: number, method: string, source: string) {
  incomes = [{ id: uid(), at: "2026-10-08", concept, method, amount, source }, ...incomes];
  log(source, `${concept} · ${method}`, amount, "Ingreso");
}

export const EXP_CATS = ["Renta", "Servicios", "Nómina", "Mantenimiento", "Insumos de cocina", "Compras"] as const;
export type Expense = { id: string; date: string; cat: (typeof EXP_CATS)[number]; concept: string; amount: number; paid: boolean; due: string };
let expenses: Expense[] = [
  { id: "E1", date: "2026-10-01", cat: "Renta", concept: "Renta local Centro", amount: 28000, paid: true, due: "2026-10-01" },
  { id: "E2", date: "2026-10-03", cat: "Servicios", concept: "Luz CFE", amount: 6400, paid: true, due: "2026-10-05" },
  { id: "E3", date: "2026-10-05", cat: "Nómina", concept: "Nómina entrenadores quincena", amount: 21000, paid: false, due: "2026-10-15" },
  { id: "E4", date: "2026-10-06", cat: "Mantenimiento", concept: "Servicio caminadoras", amount: 3800, paid: false, due: "2026-10-12" },
  { id: "E5", date: "2026-10-07", cat: "Insumos de cocina", concept: "Frutas y verduras", amount: 2900, paid: true, due: "2026-10-07" },
];
export const useExpenses = hook(() => expenses);
export function addExpense(e: Omit<Expense, "id">) { expenses = [{ ...e, id: uid() }, ...expenses]; log("Egresos", `Registro: ${e.concept}${e.paid ? " (pagado)" : ""}`, e.amount, e.paid ? "Egreso" : "Ajuste"); }
export function payExpense(id: string) { const e = expenses.find((x) => x.id === id); expenses = expenses.map((x) => (x.id === id ? { ...x, paid: true } : x)); if (e) log("Cuentas por pagar", `Pago: ${e.concept}`, e.amount, "Egreso"); }

export type Supplier = { id: string; name: string; cat: "Suplementos" | "Equipamiento" | "Insumos alimenticios"; contact: string; phone: string };
let suppliers: Supplier[] = [
  { id: "S1", name: "NutriMax Distribuciones", cat: "Suplementos", contact: "Laura Peña", phone: "55 2211 4400" },
  { id: "S2", name: "IronPro Equipamiento", cat: "Equipamiento", contact: "Raúl Mena", phone: "55 3344 1200" },
  { id: "S3", name: "Fresh Market Central", cat: "Insumos alimenticios", contact: "Gaby Solís", phone: "55 7788 9911" },
];
export const useSuppliers = hook(() => suppliers);
export function addSupplier(s: Omit<Supplier, "id">) { suppliers = [...suppliers, { ...s, id: uid() }]; log("Proveedores", `Alta proveedor ${s.name}`); }

let stock: Record<string, number> = Object.fromEntries(PRODUCTS.map((p) => [p.id, p.stock]));
export const useStock = hook(() => stock);
export function changeStock(delta: Record<string, number>) { stock = { ...stock }; for (const [k, v] of Object.entries(delta)) stock[k] = (stock[k] ?? 0) + v; emit(); }

export type PO = { id: string; supplier: string; date: string; lines: { pid: string; name: string; q: number; cost: number }[]; total: number; status: "Pendiente" | "Recibida" };
let pos: PO[] = [];
export const usePOs = hook(() => pos);
export function createPO(supplier: string, lines: PO["lines"]) {
  const total = lines.reduce((s, l) => s + l.q * l.cost, 0);
  pos = [{ id: `OC-${100 + pos.length + 1}`, supplier, date: "2026-10-08", lines, total, status: "Pendiente" }, ...pos];
  log("Compras", `Orden de compra a ${supplier}`, total);
}
export function receivePO(id: string) {
  const po = pos.find((p) => p.id === id); if (!po || po.status === "Recibida") return;
  pos = pos.map((p) => (p.id === id ? { ...p, status: "Recibida" } : p));
  changeStock(Object.fromEntries(po.lines.map((l) => [l.pid, l.q])));
  expenses = [{ id: uid(), date: "2026-10-08", cat: "Compras", concept: `${po.id} ${po.supplier}`, amount: po.total, paid: false, due: "2026-10-22" }, ...expenses];
  log("Inventario", `${po.id} recibida: +${po.lines.reduce((s, l) => s + l.q, 0)} piezas`, po.total);
}

export type Receivable = { id: string; customer: string; concept: string; amount: number; paid: number; due: string; reminders: number };
let receivables: Receivable[] = MEMBERS.filter((m) => m.balance > 0).map((m, i) => ({ id: `R${i + 1}`, customer: m.name, concept: `Membresía ${m.plan}`, amount: m.balance, paid: 0, due: m.end, reminders: 0 }));
export const useReceivables = hook(() => receivables);
export function addPayment(id: string, amount: number, method: string) {
  const r = receivables.find((x) => x.id === id); if (!r) return;
  receivables = receivables.map((x) => (x.id === id ? { ...x, paid: Math.min(x.amount, x.paid + amount) } : x));
  recordIncome(`Abono ${r.customer}`, amount, method, "Cuentas por cobrar");
}
export function remind(ids: string[]) { receivables = receivables.map((x) => (ids.includes(x.id) ? { ...x, reminders: x.reminders + 1 } : x)); log("Cuentas por cobrar", `Recordatorio enviado a ${ids.length} cliente(s)`); }
