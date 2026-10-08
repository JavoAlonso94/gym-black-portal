export type MemberStatus = "Activa" | "Vencida" | "Congelada";
export type Member = {
  id: string; name: string; email: string; phone: string; plan: string;
  status: MemberStatus; start: string; end: string; balance: number; visits: number; trainer: string; qr: string;
};

const names = ["Sofía Hernández","Diego Ramírez","Valeria López","Carlos Mendoza","Fernanda Torres","Andrés Castillo","Mariana Flores","Luis Gutiérrez","Daniela Morales","Jorge Vargas","Camila Reyes","Ricardo Ortiz","Paola Jiménez","Emilio Navarro","Regina Cruz","Héctor Salinas","Ximena Rojas","Alejandro Peña"];
const plans = ["Mensual", "Trimestral", "Anual", "Estudiante", "Premium VIP"];
const trainers = ["Marco Ruiz", "Ana Beltrán", "Iván Soto"];
const statuses: MemberStatus[] = ["Activa","Activa","Activa","Vencida","Activa","Congelada"];

function fmt(d: Date) { return d.toISOString().slice(0, 10); }
const today = new Date("2026-10-08");

export const MEMBERS: Member[] = names.map((name, i) => {
  const status = statuses[i % statuses.length];
  const start = new Date(today); start.setDate(start.getDate() - (20 + i * 9));
  const end = new Date(today);
  end.setDate(end.getDate() + (status === "Vencida" ? -(i + 2) : (i % 4) * 6 + 2));
  return {
    id: `GB-${1001 + i}`, name,
    email: name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(" ", ".") + "@mail.com",
    phone: `55 ${String(4100 + i * 37).padStart(4, "0")} ${String(2200 + i * 91).slice(0, 4)}`,
    plan: plans[i % plans.length], status, start: fmt(start), end: fmt(end),
    balance: status === "Vencida" ? 650 + i * 20 : i % 5 === 0 ? 300 : 0,
    visits: 8 + ((i * 7) % 40), trainer: trainers[i % 3], qr: `GB-${1001 + i}`,
  };
});

export function daysLeft(end: string) {
  return Math.round((new Date(end).getTime() - today.getTime()) / 86400000);
}

export const REVENUE = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map((d, i) => ({
  day: d, membresias: [8200, 6400, 9100, 7300, 10400, 5600, 2900][i], tienda: [2100, 1800, 2600, 2300, 3400, 2900, 1200][i],
}));
export const TRAFFIC = ["6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22"].map((h, i) => ({
  hora: `${h}:00`, personas: [22, 48, 61, 40, 28, 19, 15, 21, 18, 16, 24, 45, 72, 80, 64, 38, 12][i],
}));

export const ACTIVITY = [
  { t: "Hace 3 min", text: "Sofía Hernández registró entrada (QR)" },
  { t: "Hace 12 min", text: "Venta POS #4821 — $485.00 (Proteína Whey)" },
  { t: "Hace 25 min", text: "Diego Ramírez renovó plan Trimestral" },
  { t: "Hace 40 min", text: "Acceso rechazado: Fernanda Torres (membresía congelada)" },
  { t: "Hace 1 h", text: "Ana Beltrán asignó rutina 'Hipertrofia A' a Mariana Flores" },
  { t: "Hace 2 h", text: "Nuevo registro: Alejandro Peña (Premium VIP)" },
];

export type Product = { id: string; name: string; cat: "Suplementos" | "Ropa" | "Bebidas"; price: number; stock: number };
export const PRODUCTS: Product[] = [
  { id: "p1", name: "Proteína Whey 2lb", cat: "Suplementos", price: 485, stock: 14 },
  { id: "p2", name: "Creatina 300g", cat: "Suplementos", price: 390, stock: 22 },
  { id: "p3", name: "Pre-entreno Black Fire", cat: "Suplementos", price: 520, stock: 8 },
  { id: "p4", name: "BCAA 250g", cat: "Suplementos", price: 340, stock: 11 },
  { id: "p5", name: "Playera Dry-Fit Gym Black", cat: "Ropa", price: 299, stock: 30 },
  { id: "p6", name: "Sudadera Oversize Gold", cat: "Ropa", price: 690, stock: 12 },
  { id: "p7", name: "Guantes de entrenamiento", cat: "Ropa", price: 250, stock: 18 },
  { id: "p8", name: "Shaker 700ml", cat: "Ropa", price: 120, stock: 40 },
  { id: "p9", name: "Agua 1L", cat: "Bebidas", price: 20, stock: 96 },
  { id: "p10", name: "Bebida isotónica", cat: "Bebidas", price: 32, stock: 60 },
  { id: "p11", name: "Batido proteico RTD", cat: "Bebidas", price: 65, stock: 25 },
  { id: "p12", name: "Café americano", cat: "Bebidas", price: 35, stock: 50 },
];

export type Exercise = { id: string; name: string; group: string; equip: string; level: string };
export const MUSCLES = ["Pecho", "Espalda", "Piernas", "Hombros", "Brazos", "Core"];
export const EXERCISES: Exercise[] = [
  ["Press banca plano","Pecho","Barra","Intermedio"],["Aperturas con mancuerna","Pecho","Mancuernas","Principiante"],["Fondos en paralelas","Pecho","Peso corporal","Intermedio"],["Press inclinado","Pecho","Mancuernas","Intermedio"],
  ["Dominadas","Espalda","Peso corporal","Avanzado"],["Remo con barra","Espalda","Barra","Intermedio"],["Jalón al pecho","Espalda","Polea","Principiante"],["Peso muerto","Espalda","Barra","Avanzado"],
  ["Sentadilla trasera","Piernas","Barra","Intermedio"],["Prensa 45°","Piernas","Máquina","Principiante"],["Zancadas","Piernas","Mancuernas","Principiante"],["Peso muerto rumano","Piernas","Barra","Intermedio"],
  ["Press militar","Hombros","Barra","Intermedio"],["Elevaciones laterales","Hombros","Mancuernas","Principiante"],["Face pull","Hombros","Polea","Principiante"],
  ["Curl con barra","Brazos","Barra","Principiante"],["Extensión de tríceps","Brazos","Polea","Principiante"],["Curl martillo","Brazos","Mancuernas","Principiante"],
  ["Plancha","Core","Peso corporal","Principiante"],["Rueda abdominal","Core","Rueda","Avanzado"],["Elevación de piernas","Core","Peso corporal","Intermedio"],
].map(([name, group, equip, level], i) => ({ id: `e${i}`, name, group, equip, level }));

export const money = (n: number) => n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
