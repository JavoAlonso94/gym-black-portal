import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp, TrendingDown, Percent, Wallet, Bell, Plus, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import { Kpi, PageHeader, Panel } from "@/components/Kpi";
import { Button } from "@/components/ui/button";
import { PaymentDialog } from "@/components/PaymentDialog";
import { PRODUCTS, money } from "@/lib/data";
import { EXP_CATS, addExpense, addPayment, addSupplier, createPO, payExpense, receivePO, remind, useAudit, useExpenses, useIncomes, usePOs, useReceivables, useStock, useSuppliers, type Expense, type Supplier } from "@/lib/erp";

export const Route = createFileRoute("/app/erp")({
  head: () => ({ meta: [{ title: "ERP financiero — Gym Black" }, { name: "description", content: "Cuentas por cobrar y pagar, egresos, proveedores, compras, flujo de caja y auditoría." }, { property: "og:title", content: "ERP financiero — Gym Black" }, { property: "og:description", content: "Cuentas por cobrar y pagar, egresos, proveedores, compras, flujo de caja y auditoría." }] }),
  component: ERP,
});

const TABS = ["Balance y flujo", "Cuentas por cobrar", "Cuentas por pagar y egresos", "Proveedores y compras", "Auditoría"] as const;
const input = "rounded-md border bg-background px-3 py-2 text-sm";

function ERP() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Balance y flujo");
  return (
    <div>
      <PageHeader title="ERP financiero" subtitle="Ingresos, egresos, compras e inventario en tiempo real" />
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={`rounded-full border px-4 py-1.5 text-sm ${tab === t ? "border-primary bg-primary text-primary-foreground" : ""}`}>{t}</button>)}
      </div>
      {tab === "Balance y flujo" && <Balance />}
      {tab === "Cuentas por cobrar" && <Receivables />}
      {tab === "Cuentas por pagar y egresos" && <Payables />}
      {tab === "Proveedores y compras" && <Purchases />}
      {tab === "Auditoría" && <AuditLog />}
    </div>
  );
}

function Balance() {
  const inc = useIncomes(); const exp = useExpenses();
  const ingresos = inc.reduce((s, i) => s + i.amount, 0);
  const paid = exp.filter((e) => e.paid);
  const operativos = paid.filter((e) => e.cat !== "Compras").reduce((s, e) => s + e.amount, 0);
  const egresos = paid.reduce((s, e) => s + e.amount, 0);
  const opMargin = ingresos ? ((ingresos - operativos) / ingresos) * 100 : 0;
  const neta = (ingresos - egresos) * 0.7;
  const bySrc = Object.entries(inc.reduce<Record<string, number>>((a, i) => ({ ...a, [i.source]: (a[i.source] ?? 0) + i.amount }), {})).map(([k, v]) => ({ k, Ingresos: v, Egresos: 0 }));
  const byCat = Object.entries(paid.reduce<Record<string, number>>((a, e) => ({ ...a, [e.cat]: (a[e.cat] ?? 0) + e.amount }), {})).map(([k, v]) => ({ k, Ingresos: 0, Egresos: v }));
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Ingresos" value={money(ingresos)} icon={TrendingUp} hint={`${inc.length} movimientos`} />
        <Kpi label="Egresos pagados" value={money(egresos)} icon={TrendingDown} hint={`${money(exp.filter((e) => !e.paid).reduce((s, e) => s + e.amount, 0))} por pagar`} />
        <Kpi label="Margen operativo" value={`${opMargin.toFixed(1)}%`} icon={Percent} hint="Sin compras de inventario" />
        <Kpi label="Utilidad neta" value={money(neta)} icon={Wallet} hint="Después de ISR estimado 30%" />
      </div>
      <Panel title="Ingresos vs egresos">
        <div className="h-72"><ResponsiveContainer><BarChart data={[...bySrc, ...byCat]}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="k" fontSize={11} stroke="var(--muted-foreground)" /><YAxis fontSize={11} stroke="var(--muted-foreground)" /><Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }} formatter={(v: number) => money(v)} /><Legend /><Bar dataKey="Ingresos" fill="var(--primary)" /><Bar dataKey="Egresos" fill="var(--destructive)" /></BarChart></ResponsiveContainer></div>
      </Panel>
      <Panel title="Últimos ingresos">
        <ul className="divide-y text-sm">{inc.slice(0, 8).map((i) => <li key={i.id} className="flex justify-between py-2"><span>{i.concept} <span className="text-xs text-muted-foreground">· {i.method} · {i.source}</span></span><span className="text-success">+{money(i.amount)}</span></li>)}</ul>
      </Panel>
    </div>
  );
}

function Receivables() {
  const list = useReceivables();
  const [auto, setAuto] = useState(true);
  const [pay, setPay] = useState<{ id: string; amount: number; name: string } | null>(null);
  const [amt, setAmt] = useState<Record<string, number>>({});
  const overdue = list.filter((r) => r.paid < r.amount && r.due < "2026-10-08");
  useEffect(() => { if (auto && overdue.some((r) => r.reminders === 0)) { remind(overdue.filter((r) => r.reminders === 0).map((r) => r.id)); toast("Recordatorios automáticos enviados por WhatsApp y correo"); } }, [auto, overdue]);
  const total = list.reduce((s, r) => s + r.amount - r.paid, 0);
  return (
    <Panel title={`Cartera de adeudos · ${money(total)}`} action={<div className="flex items-center gap-3 text-xs"><label className="flex items-center gap-1"><input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />Recordatorios automáticos</label><Button size="sm" variant="outline" onClick={() => { remind(list.filter((r) => r.paid < r.amount).map((r) => r.id)); toast.success("Recordatorios enviados"); }}><Bell className="h-3 w-3" />Recordar a todos</Button></div>}>
      <div className="overflow-x-auto"><table className="w-full text-sm">
        <thead className="text-left text-xs uppercase text-muted-foreground"><tr><th className="py-2">Cliente</th><th>Concepto</th><th>Vence</th><th>Adeudo</th><th>Abonado</th><th>Saldo</th><th>Recordatorios</th><th>Abono</th></tr></thead>
        <tbody>{list.map((r) => { const bal = r.amount - r.paid; return (
          <tr key={r.id} className="border-t">
            <td className="py-2 font-medium">{r.customer}</td><td>{r.concept}</td><td className={r.due < "2026-10-08" && bal ? "text-destructive" : ""}>{r.due}</td><td>{money(r.amount)}</td><td>{money(r.paid)}</td>
            <td className={bal ? "font-semibold text-primary" : "text-success"}>{bal ? money(bal) : "Liquidado"}</td><td>{r.reminders}</td>
            <td>{bal > 0 && <div className="flex gap-1"><input type="number" min={1} max={bal} placeholder={String(bal)} className="w-20 rounded border bg-background px-2 py-1" value={amt[r.id] ?? ""} onChange={(e) => setAmt({ ...amt, [r.id]: Number(e.target.value) })} /><Button size="sm" className="bg-gold" onClick={() => setPay({ id: r.id, amount: Math.min(bal, amt[r.id] || bal), name: r.customer })}>Abonar</Button></div>}</td>
          </tr>); })}</tbody>
      </table></div>
      <PaymentDialog open={!!pay} amount={pay?.amount ?? 0} concept={`Abono de ${pay?.name}`} onClose={() => setPay(null)} onPaid={(m) => { if (pay) { addPayment(pay.id, pay.amount, m); toast.success("Abono registrado"); setAmt({ ...amt, [pay.id]: 0 }); } setPay(null); }} />
    </Panel>
  );
}

function Payables() {
  const exp = useExpenses();
  const [f, setF] = useState<Omit<Expense, "id">>({ date: "2026-10-08", cat: "Servicios", concept: "", amount: 0, paid: false, due: "2026-10-15" });
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Panel title="Registrar gasto">
        <form className="grid gap-2" onSubmit={(e) => { e.preventDefault(); if (!f.concept || f.amount <= 0) { toast.error("Concepto y monto requeridos"); return; } addExpense(f); setF({ ...f, concept: "", amount: 0 }); toast.success("Gasto registrado"); }}>
          <select className={input} value={f.cat} onChange={(e) => setF({ ...f, cat: e.target.value as Expense["cat"] })}>{EXP_CATS.map((c) => <option key={c}>{c}</option>)}</select>
          <input className={input} placeholder="Concepto" value={f.concept} onChange={(e) => setF({ ...f, concept: e.target.value })} />
          <input className={input} type="number" placeholder="Monto" value={f.amount || ""} onChange={(e) => setF({ ...f, amount: Number(e.target.value) })} />
          <label className="text-xs text-muted-foreground">Fecha de vencimiento<input type="date" className={`${input} w-full`} value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.paid} onChange={(e) => setF({ ...f, paid: e.target.checked })} />Ya está pagado</label>
          <Button type="submit" className="bg-gold"><Plus className="h-4 w-4" />Guardar</Button>
        </form>
      </Panel>
      <Panel title="Egresos y cuentas por pagar" className="lg:col-span-2">
        <ul className="divide-y text-sm">{exp.map((e) => (
          <li key={e.id} className="flex items-center justify-between gap-2 py-2">
            <div><p className="font-medium">{e.concept}</p><p className="text-xs text-muted-foreground">{e.cat} · vence {e.due}</p></div>
            <div className="flex items-center gap-2"><span>{money(e.amount)}</span>{e.paid ? <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs text-success">Pagado</span> : <Button size="sm" variant="outline" onClick={() => { payExpense(e.id); toast.success("Pago registrado"); }}>Pagar</Button>}</div>
          </li>))}</ul>
      </Panel>
    </div>
  );
}

function Purchases() {
  const sups = useSuppliers(); const pos = usePOs(); const stock = useStock();
  const [ns, setNs] = useState<Omit<Supplier, "id">>({ name: "", cat: "Suplementos", contact: "", phone: "" });
  const [sup, setSup] = useState(sups[0]?.name ?? "");
  const [lines, setLines] = useState<Record<string, { q: number; cost: number }>>({});
  const sel = Object.entries(lines).filter(([, l]) => l.q > 0);
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Catálogo de proveedores">
          <ul className="mb-4 divide-y text-sm">{sups.map((s) => <li key={s.id} className="py-2"><p className="font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.cat} · {s.contact} · {s.phone}</p></li>)}</ul>
          <form className="grid grid-cols-2 gap-2" onSubmit={(e) => { e.preventDefault(); if (!ns.name) return; addSupplier(ns); setNs({ ...ns, name: "", contact: "", phone: "" }); toast.success("Proveedor agregado"); }}>
            <input className={input} placeholder="Proveedor" value={ns.name} onChange={(e) => setNs({ ...ns, name: e.target.value })} />
            <select className={input} value={ns.cat} onChange={(e) => setNs({ ...ns, cat: e.target.value as Supplier["cat"] })}>{["Suplementos", "Equipamiento", "Insumos alimenticios"].map((c) => <option key={c}>{c}</option>)}</select>
            <input className={input} placeholder="Contacto" value={ns.contact} onChange={(e) => setNs({ ...ns, contact: e.target.value })} />
            <input className={input} placeholder="Teléfono" value={ns.phone} onChange={(e) => setNs({ ...ns, phone: e.target.value })} />
            <Button type="submit" variant="outline" className="col-span-2"><Plus className="h-4 w-4" />Agregar proveedor</Button>
          </form>
        </Panel>
        <Panel title="Nueva orden de compra">
          <select className={`${input} mb-3 w-full`} value={sup} onChange={(e) => setSup(e.target.value)}>{sups.map((s) => <option key={s.id}>{s.name}</option>)}</select>
          <div className="max-h-64 space-y-1 overflow-y-auto text-sm">{PRODUCTS.map((p) => (
            <div key={p.id} className="flex items-center gap-2"><span className="flex-1">{p.name} <span className="text-xs text-muted-foreground">(stock {stock[p.id]})</span></span>
              <input aria-label="Cantidad" type="number" min={0} placeholder="Cant." className="w-16 rounded border bg-background px-2 py-1" value={lines[p.id]?.q || ""} onChange={(e) => setLines({ ...lines, [p.id]: { cost: lines[p.id]?.cost ?? Math.round(p.price * 0.55), q: Number(e.target.value) } })} />
              <input aria-label="Costo" type="number" min={0} className="w-20 rounded border bg-background px-2 py-1" value={lines[p.id]?.cost ?? Math.round(p.price * 0.55)} onChange={(e) => setLines({ ...lines, [p.id]: { q: lines[p.id]?.q ?? 0, cost: Number(e.target.value) } })} />
            </div>))}</div>
          <Button className="mt-3 w-full bg-gold" onClick={() => { if (!sel.length) { toast.error("Agrega cantidades"); return; } createPO(sup, sel.map(([pid, l]) => ({ pid, name: PRODUCTS.find((p) => p.id === pid)!.name, ...l }))); setLines({}); toast.success("Orden de compra creada"); }}>Crear orden · {money(sel.reduce((s, [, l]) => s + l.q * l.cost, 0))}</Button>
        </Panel>
      </div>
      <Panel title="Órdenes de compra">
        {!pos.length && <p className="text-sm text-muted-foreground">Sin órdenes todavía</p>}
        <ul className="divide-y text-sm">{pos.map((o) => (
          <li key={o.id} className="flex items-center justify-between gap-2 py-2">
            <div><p className="font-medium">{o.id} · {o.supplier}</p><p className="text-xs text-muted-foreground">{o.lines.map((l) => `${l.q}× ${l.name}`).join(", ")}</p></div>
            <div className="flex items-center gap-2"><span>{money(o.total)}</span>{o.status === "Recibida" ? <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs text-success">Recibida</span> : <Button size="sm" variant="outline" onClick={() => { receivePO(o.id); toast.success("Mercancía recibida e inventario actualizado"); }}><PackageCheck className="h-3 w-3" />Recibir</Button>}</div>
          </li>))}</ul>
      </Panel>
    </div>
  );
}

function AuditLog() {
  const a = useAudit();
  return (
    <Panel title="Libro de auditoría financiera">
      {!a.length && <p className="text-sm text-muted-foreground">Aún no hay movimientos en esta sesión. Cobra, registra gastos o recibe compras para verlos aquí.</p>}
      <div className="overflow-x-auto"><table className="w-full text-sm">
        <thead className="text-left text-xs uppercase text-muted-foreground"><tr><th className="py-2">Folio</th><th>Fecha</th><th>Usuario</th><th>Módulo</th><th>Movimiento</th><th>Tipo</th><th className="text-right">Monto</th></tr></thead>
        <tbody>{a.map((x) => <tr key={x.id} className="border-t"><td className="py-2 font-mono text-xs">{x.id}</td><td>{x.at}</td><td>{x.user}</td><td>{x.module}</td><td>{x.action}</td><td className={x.type === "Ingreso" ? "text-success" : x.type === "Egreso" ? "text-destructive" : "text-muted-foreground"}>{x.type}</td><td className="text-right">{x.amount ? money(x.amount) : "—"}</td></tr>)}</tbody>
      </table></div>
    </Panel>
  );
}
