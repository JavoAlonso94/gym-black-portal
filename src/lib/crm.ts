import { useSyncExternalStore } from "react";
import { MEMBERS, type Member } from "@/lib/data";

export const STAGES = ["Nuevo prospecto", "Contactado", "Visita o clase muestra agendada", "En negociación", "Convertido a socio", "Perdido"] as const;
export type Stage = (typeof STAGES)[number];
export const CHANNELS = ["Instagram", "WhatsApp", "Walk-in", "Recomendación"] as const;
export type Lead = { id: string; name: string; phone: string; email: string; goal: string; channel: (typeof CHANNELS)[number]; next: string; notes: string; stage: Stage; value: number };
export const BRANCHES = ["Centro", "Norte", "Sur", "Poniente"];
export type Pack = { id: string; name: string; price: number; days: number; branches: string[]; accesses: string; sessions: number; cafe: string; extras: string; active: boolean };
export type PosCharge = { id: string; pack: string; customer: string; price: number };

const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
const sub = (f: () => void) => { subs.add(f); return () => subs.delete(f); };
const hook = <T,>(get: () => T) => () => useSyncExternalStore(sub, get, get);

let members: Member[] = MEMBERS;
export const useMembers = hook(() => members);
export function setMembers(u: Member[] | ((m: Member[]) => Member[])) { members = typeof u === "function" ? u(members) : u; emit(); }

let leads: Lead[] = ([
  ["Karla Mejía", "Bajar de peso", "Instagram", "Nuevo prospecto", 2400],
  ["Tomás Aguilar", "Ganar masa muscular", "WhatsApp", "Contactado", 4500],
  ["Lucía Ibarra", "Tonificar", "Walk-in", "Visita o clase muestra agendada", 3200],
  ["Pablo Serrano", "Preparación maratón", "Recomendación", "En negociación", 9800],
  ["Renata Vidal", "Salud general", "Instagram", "En negociación", 5600],
  ["Óscar Lara", "Fuerza", "WhatsApp", "Convertido a socio", 4500],
  ["Mónica Ríos", "Bajar de peso", "Walk-in", "Perdido", 2400],
  ["Bruno Esquivel", "Ganar masa muscular", "Instagram", "Contactado", 7200],
] as const).map(([name, goal, channel, stage, value], i) => ({
  id: `L${i + 1}`, name, goal, channel, stage, value, phone: `55 ${3100 + i * 53} ${4400 + i * 17}`,
  email: name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(" ", ".") + "@mail.com",
  next: `2026-10-${String(9 + i).padStart(2, "0")}`, notes: "",
}));
export const useLeads = hook(() => leads);
export function saveLead(l: Lead) { leads = leads.some((x) => x.id === l.id) ? leads.map((x) => (x.id === l.id ? l : x)) : [l, ...leads]; emit(); }
export function deleteLead(id: string) { leads = leads.filter((l) => l.id !== id); emit(); }
export function convertLead(l: Lead, plan = "Mensual") {
  const id = `GB-${1001 + members.length + Math.floor(Math.random() * 900)}`;
  const start = new Date("2026-10-08"); const end = new Date(start); end.setDate(end.getDate() + 30);
  setMembers((m) => [{ id, name: l.name, email: l.email, phone: l.phone, plan, status: "Activa", start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10), balance: 0, visits: 0, trainer: "Marco Ruiz", qr: id }, ...m]);
  saveLead({ ...l, stage: "Convertido a socio" });
}

let packs: Pack[] = [
  { id: "k1", name: "Black Total", price: 2490, days: 30, branches: ["Centro", "Norte", "Sur", "Poniente"], accesses: "Ilimitados", sessions: 8, cafe: "12 shakes de cocina", extras: "Evaluación corporal mensual", active: true },
  { id: "k2", name: "Pareja Fitness", price: 1690, days: 30, branches: ["Centro", "Norte"], accesses: "Ilimitados para 2 personas", sessions: 2, cafe: "4 smoothies", extras: "Rutina compartida", active: true },
  { id: "k3", name: "Pase 10 clases + Nutrición", price: 1290, days: 60, branches: ["Centro"], accesses: "10 clases", sessions: 0, cafe: "—", extras: "2 consultas con nutrióloga", active: true },
  { id: "k4", name: "Plan Anual VIP", price: 18900, days: 365, branches: ["Centro", "Norte", "Sur", "Poniente"], accesses: "Ilimitados + invitado", sessions: 48, cafe: "1 shake diario", extras: "Locker privado y toalla", active: true },
];
export const usePacks = hook(() => packs);
export function savePack(p: Pack) { packs = packs.some((x) => x.id === p.id) ? packs.map((x) => (x.id === p.id ? p : x)) : [...packs, p]; emit(); }
export function deletePack(id: string) { packs = packs.filter((p) => p.id !== id); emit(); }

let pos: PosCharge[] = [];
export const usePosCharges = hook(() => pos);
export function sendPackToPos(p: Pack, customer: string) { pos = [...pos, { id: `c${Date.now()}`, pack: p.name, customer, price: p.price }]; emit(); }
export function removePosCharge(id: string) { pos = pos.filter((c) => c.id !== id); emit(); }
export function clearPosCharges() { pos = []; emit(); }
