import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, Trash2, Receipt, Calculator } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel } from "@/components/Kpi";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PRODUCTS, money, type Product } from "@/lib/data";
import { placeOrder, useMenu } from "@/lib/kitchen";

export const Route = createFileRoute("/app/pos")({
  head: () => ({ meta: [{ title: "Punto de venta y caja — Gym Black" }, { name: "description", content: "Venta de suplementos, ropa y bebidas con corte de caja." }, { property: "og:title", content: "Punto de venta y caja — Gym Black" }, { property: "og:description", content: "Venta de suplementos, ropa y bebidas con corte de caja." }] }),
  component: POS,
});

type Sale = { folio: number; items: { p: Product; q: number }[]; total: number; method: string; time: string };
const CATS = ["Todos", "Suplementos", "Ropa", "Bebidas", "Cafetería"] as const;

function POS() {
  const [cat, setCat] = useState<(typeof CATS)[number]>("Todos");
  const [stock, setStock] = useState<Record<string, number>>(Object.fromEntries(PRODUCTS.map((p) => [p.id, p.stock])));
  const [cart, setCart] = useState<Record<string, number>>({});
  const [method, setMethod] = useState("Efectivo");
  const [sales, setSales] = useState<Sale[]>([]);
  const [ticket, setTicket] = useState<Sale | null>(null);
  const [cut, setCut] = useState(false);
  const menu = useMenu();
  const [kcart, setKcart] = useState<Record<string, number>>({});
  const [customer, setCustomer] = useState("");
  const kitems = Object.entries(kcart).map(([id, q]) => ({ m: menu.find((x) => x.id === id)!, q })).filter((i) => i.m);
  const addK = (id: string, d: number) => setKcart((c) => { const n = { ...c }; const q = (n[id] ?? 0) + d; if (q <= 0) delete n[id]; else n[id] = q; return n; });

  const items = Object.entries(cart).map(([id, q]) => ({ p: PRODUCTS.find((x) => x.id === id)!, q }));
  const subtotal = items.reduce((s, i) => s + i.p.price * i.q, 0) + kitems.reduce((s, i) => s + i.m.price * i.q, 0);
  const iva = subtotal * 0.16 / 1.16;
  const add = (p: Product, d = 1) => setCart((c) => {
    const q = (c[p.id] ?? 0) + d;
    if (q > (stock[p.id] ?? 0)) { toast.error("Sin stock suficiente"); return c; }
    const n = { ...c }; if (q <= 0) delete n[p.id]; else n[p.id] = q; return n;
  });

  const pay = () => {
    if (!items.length && !kitems.length) { toast.error("El carrito está vacío"); return; }
    if (kitems.length) {
      const o = placeOrder({ customer: customer || "Mostrador", items: kitems.map(({ m, q }) => ({ id: m.id, name: m.name, q, price: m.price })), total: kitems.reduce((s, i) => s + i.m.price * i.q, 0), source: "POS", paid: true });
      toast.success(`Comanda #${o.id} enviada a cocina`);
    }
    const all = [...items, ...kitems.map(({ m, q }) => ({ p: { id: m.id, name: m.name, cat: "Bebidas" as const, price: m.price, stock: 0 }, q }))];
    const sale: Sale = { folio: 4822 + sales.length, items: all, total: subtotal, method, time: new Date().toLocaleTimeString("es-MX") };
    setStock((s) => { const n = { ...s }; items.forEach((i) => (n[i.p.id] = (n[i.p.id] ?? 0) - i.q)); return n; });
    setSales((s) => [sale, ...s]); setCart({}); setKcart({}); setCustomer(""); setTicket(sale);
  };

  const byMethod = sales.reduce<Record<string, number>>((a, s) => ({ ...a, [s.method]: (a[s.method] ?? 0) + s.total }), {});
  const totalSales = sales.reduce((s, x) => s + x.total, 0);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title="Punto de venta y caja" subtitle={`${sales.length} ventas en el turno · ${money(totalSales)}`} />
        <Button variant="outline" onClick={() => setCut(true)}><Calculator className="h-4 w-4" />Corte de caja</Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap gap-2">
            {CATS.map((c) => <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-4 py-1.5 text-sm ${cat === c ? "border-primary bg-primary text-primary-foreground" : ""}`}>{c}</button>)}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {cat === "Cafetería" && menu.filter((m) => m.available).map((m) => (
              <button key={m.id} onClick={() => addK(m.id, 1)} className="rounded-xl border bg-card p-4 text-left transition hover:border-primary">
                <p className="text-xs uppercase tracking-wider text-primary">{m.cat}</p>
                <p className="mt-1 font-semibold">{m.name}</p>
                <div className="mt-3 flex items-end justify-between"><span className="font-display text-lg font-bold">{money(m.price)}</span><span className="text-xs text-muted-foreground">{m.kcal} kcal · P{m.p}g</span></div>
              </button>
            ))}
            {cat !== "Cafetería" && PRODUCTS.filter((p) => cat === "Todos" || p.cat === cat).map((p) => (
              <button key={p.id} onClick={() => add(p)} disabled={!stock[p.id]} className="rounded-xl border bg-card p-4 text-left transition hover:border-primary disabled:opacity-40">
                <p className="text-xs uppercase tracking-wider text-primary">{p.cat}</p>
                <p className="mt-1 font-semibold">{p.name}</p>
                <div className="mt-3 flex items-end justify-between"><span className="font-display text-lg font-bold">{money(p.price)}</span><span className="text-xs text-muted-foreground">Stock {stock[p.id]}</span></div>
              </button>
            ))}
          </div>
        </div>
        <Panel title="Carrito" className="h-fit lg:sticky lg:top-8">
          {kitems.length > 0 && <div className="mb-3 space-y-2 border-b pb-3">
            <p className="text-xs uppercase tracking-wider text-primary">Cafetería (va a cocina)</p>
            {kitems.map(({ m, q }) => <div key={m.id} className="flex items-center gap-2 text-sm"><span className="flex-1">{m.name}</span><button aria-label="Menos" onClick={() => addK(m.id, -1)} className="rounded border p-1"><Minus className="h-3 w-3" /></button><span className="w-5 text-center">{q}</span><button aria-label="Más" onClick={() => addK(m.id, 1)} className="rounded border p-1"><Plus className="h-3 w-3" /></button></div>)}
            <input className="w-full rounded-md border bg-background px-2 py-1.5 text-sm" placeholder="Nombre del cliente" value={customer} onChange={(e) => setCustomer(e.target.value)} />
          </div>}
          {!items.length && !kitems.length && <p className="py-6 text-center text-sm text-muted-foreground">Agrega productos del catálogo</p>}
          <ul className="space-y-3">
            {items.map(({ p, q }) => (
              <li key={p.id} className="flex items-center gap-2 text-sm">
                <div className="flex-1"><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{money(p.price)} c/u</p></div>
                <button aria-label="Menos" onClick={() => add(p, -1)} className="rounded border p-1"><Minus className="h-3 w-3" /></button>
                <span className="w-5 text-center">{q}</span>
                <button aria-label="Más" onClick={() => add(p, 1)} className="rounded border p-1"><Plus className="h-3 w-3" /></button>
                <button aria-label="Quitar" onClick={() => add(p, -q)} className="p-1 text-destructive"><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t pt-4 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{money(subtotal - iva)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>IVA (16%)</span><span>{money(iva)}</span></div>
            <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-primary">{money(subtotal)}</span></div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {["Efectivo", "Tarjeta", "Transferencia"].map((m) => <button key={m} onClick={() => setMethod(m)} className={`rounded-md border py-2 text-xs ${method === m ? "border-primary text-primary" : ""}`}>{m}</button>)}
          </div>
          <Button onClick={pay} className="mt-4 w-full bg-gold font-semibold"><Receipt className="h-4 w-4" />Cobrar {money(subtotal)}</Button>
        </Panel>
      </div>

      <Dialog open={!!ticket} onOpenChange={(o) => !o && setTicket(null)}>
        <DialogContent className="max-w-sm font-mono text-sm">
          <DialogHeader><DialogTitle className="text-center font-display">GYM BLACK</DialogTitle></DialogHeader>
          {ticket && <div>
            <p className="text-center text-xs text-muted-foreground">Ticket #{ticket.folio} · {ticket.time}</p>
            <div className="my-3 border-y border-dashed py-3">
              {ticket.items.map((i) => <div key={i.p.id} className="flex justify-between"><span>{i.q}× {i.p.name}</span><span>{money(i.p.price * i.q)}</span></div>)}
            </div>
            <div className="flex justify-between font-bold"><span>TOTAL</span><span>{money(ticket.total)}</span></div>
            <p className="text-xs text-muted-foreground">Pago: {ticket.method}</p>
            <p className="mt-4 text-center text-[10px] tracking-brand text-muted-foreground">DISCIPLINA • FUERZA • ENFOQUE</p>
            <Button className="mt-4 w-full bg-gold" onClick={() => { setTicket(null); toast.success("Ticket impreso"); }}>Imprimir y cerrar</Button>
          </div>}
        </DialogContent>
      </Dialog>

      <Dialog open={cut} onOpenChange={setCut}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Corte de caja</DialogTitle></DialogHeader>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Fondo inicial</span><span>{money(1500)}</span></div>
            {["Efectivo", "Tarjeta", "Transferencia"].map((m) => <div key={m} className="flex justify-between"><span>{m}</span><span>{money(byMethod[m] ?? 0)}</span></div>)}
            <div className="flex justify-between border-t pt-2"><span>Ventas ({sales.length})</span><span>{money(totalSales)}</span></div>
            <div className="flex justify-between font-bold text-primary"><span>Efectivo esperado en caja</span><span>{money(1500 + (byMethod["Efectivo"] ?? 0))}</span></div>
          </div>
          <Button className="w-full bg-gold" onClick={() => { setSales([]); setCut(false); toast.success("Corte de caja realizado"); }}>Cerrar turno</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
