import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, Flame } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel } from "@/components/Kpi";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/data";
import { useUser } from "@/lib/auth";
import { PaymentDialog } from "@/components/PaymentDialog";
import { recordIncome } from "@/lib/erp";
import { MENU_CATS, placeOrder, useMenu, useOrders, type MenuCat } from "@/lib/kitchen";

export const Route = createFileRoute("/app/pedir")({
  head: () => ({ meta: [{ title: "Pide tu comida post-entreno — Gym Black" }, { name: "description", content: "Pide batidos, bowls y comidas saludables con sus macros." }, { property: "og:title", content: "Pide tu comida post-entreno — Gym Black" }, { property: "og:description", content: "Pide batidos, bowls y comidas saludables con sus macros." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Order,
});

function Order() {
  const user = useUser();
  const menu = useMenu();
  const orders = useOrders();
  const [cat, setCat] = useState<MenuCat | "Todos">("Todos");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [note, setNote] = useState("");
  const [payNow, setPayNow] = useState(true);
  const items = Object.entries(cart).map(([id, q]) => ({ m: menu.find((x) => x.id === id)!, q })).filter((i) => i.m);
  const total = items.reduce((s, i) => s + i.m.price * i.q, 0);
  const macros = items.reduce((a, { m, q }) => ({ kcal: a.kcal + m.kcal * q, p: a.p + m.p * q, c: a.c + m.c * q, f: a.f + m.f * q }), { kcal: 0, p: 0, c: 0, f: 0 });
  const add = (id: string, d: number) => setCart((c) => { const n = { ...c }; const q = (n[id] ?? 0) + d; if (q <= 0) delete n[id]; else n[id] = q; return n; });
  const name = user?.name ?? "Cliente";
  const mine = orders.filter((o) => o.customer === name);

  const [payOpen, setPayOpen] = useState(false);
  const send = () => {
    if (!items.length) { toast.error("Agrega algo a tu pedido"); return; }
    if (payNow) { setPayOpen(true); return; }
    submit();
  };
  const submit = (method?: string) => {
    setPayOpen(false);
    if (method) recordIncome(`Pedido cafetería ${name}`, total, method, "Cocina");
    const o = placeOrder({ customer: name, items: items.map(({ m, q }) => ({ id: m.id, name: m.name, q, price: m.price })), total, source: "App cliente", paid: !!method, note: note || undefined });
    setCart({}); setNote("");
    toast.success(`Pedido #${o.id} enviado a cocina`);
  };

  return (
    <div>
      <PaymentDialog open={payOpen} amount={total} concept="Pedido de cafetería" onClose={() => setPayOpen(false)} onPaid={(m) => submit(m)} />
      <PageHeader title="Pide tu post-entreno" subtitle="Smoothies, shakes proteicos, bowls y comidas con macros" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap gap-2">
            {(["Todos", ...MENU_CATS] as const).map((c) => <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-4 py-1.5 text-sm ${cat === c ? "border-primary bg-primary text-primary-foreground" : ""}`}>{c}</button>)}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {menu.filter((m) => cat === "Todos" || m.cat === cat).map((m) => (
              <div key={m.id} className={`rounded-xl border bg-card p-4 ${m.available ? "" : "opacity-40"}`}>
                <p className="text-xs uppercase tracking-wider text-primary">{m.cat}</p>
                <p className="mt-1 font-semibold">{m.name}</p>
                <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><Flame className="h-3 w-3 text-primary" />{m.kcal} kcal · P {m.p}g · C {m.c}g · G {m.f}g</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-display text-lg font-bold">{money(m.price)}</span>
                  {m.available ? <Button size="sm" variant="outline" onClick={() => add(m.id, 1)}><Plus className="h-3 w-3" />Agregar</Button> : <span className="text-xs">Agotado</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <Panel title="Mi pedido">
            {!items.length && <p className="py-4 text-center text-sm text-muted-foreground">Tu pedido está vacío</p>}
            <ul className="space-y-2 text-sm">
              {items.map(({ m, q }) => (
                <li key={m.id} className="flex items-center gap-2">
                  <span className="flex-1">{m.name}</span>
                  <button aria-label="Menos" onClick={() => add(m.id, -1)} className="rounded border p-1"><Minus className="h-3 w-3" /></button>
                  <span className="w-4 text-center">{q}</span>
                  <button aria-label="Más" onClick={() => add(m.id, 1)} className="rounded border p-1"><Plus className="h-3 w-3" /></button>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
              {[["Kcal", macros.kcal], ["Prot", macros.p + "g"], ["Carbs", macros.c + "g"], ["Grasa", macros.f + "g"]].map(([l, v]) => <div key={l} className="rounded-md border p-2"><p className="font-bold text-primary">{v}</p><p className="text-muted-foreground">{l}</p></div>)}
            </div>
            <textarea className="mt-3 w-full rounded-md border bg-background px-3 py-2 text-sm" rows={2} placeholder="Notas (sin azúcar, leche de almendra...)" value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[true, false].map((v) => <button key={String(v)} onClick={() => setPayNow(v)} className={`rounded-md border py-2 text-xs ${payNow === v ? "border-primary text-primary" : ""}`}>{v ? "Pagar ahora (SPEI, OXXO, Clip)" : "Pagar en caja"}</button>)}
            </div>
            <Button onClick={send} className="mt-3 w-full bg-gold font-semibold">Enviar pedido · {money(total)}</Button>
          </Panel>
          <Panel title="Mis pedidos">
            {!mine.length && <p className="text-sm text-muted-foreground">Aún no tienes pedidos</p>}
            <ul className="space-y-2 text-sm">
              {mine.map((o) => <li key={o.id} className="flex justify-between gap-2"><span>#{o.id} · {o.items.map((i) => i.name).join(", ")}</span><span className="whitespace-nowrap text-xs text-primary">{o.status}</span></li>)}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
