import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, StatusBadge } from "@/components/Kpi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PaymentDialog } from "@/components/PaymentDialog";
import { recordIncome } from "@/lib/erp";
import { useMembers, setMembers } from "@/lib/crm";
import { daysLeft, money, type Member, type MemberStatus } from "@/lib/data";

export const Route = createFileRoute("/app/clientes")({
  head: () => ({ meta: [{ title: "Clientes y membresías — Gym Black" }, { name: "description", content: "Directorio de clientes y estado de membresías." }, { property: "og:title", content: "Clientes y membresías — Gym Black" }, { property: "og:description", content: "Directorio de clientes y estado de membresías." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Clients,
});

const FILTERS: ("Todas" | MemberStatus)[] = ["Todas", "Activa", "Vencida", "Congelada"];

function Clients() {
  const list = useMembers(); const setList = setMembers;
  const [q, setQ] = useState("");
  const [f, setF] = useState<(typeof FILTERS)[number]>("Todas");
  const [plan, setPlan] = useState("Todos");
  const [sel, setSel] = useState<Member | null>(null);
  const [adding, setAdding] = useState(false);
  const [nm, setNm] = useState({ name: "", email: "", plan: "Mensual" });

  const rows = useMemo(() => list.filter((m) =>
    (f === "Todas" || m.status === f) && (plan === "Todos" || m.plan === plan) &&
    (m.name + m.id + m.email).toLowerCase().includes(q.toLowerCase())), [list, q, f, plan]);

  const [renew, setRenew] = useState<Member | null>(null);
  const doRenew = (method: string) => {
    if (!renew) return;
    const m = list.find((x) => x.id === renew.id)!;
    if (renew.plan === "__saldo") { recordIncome(`Saldo ${m.name}`, m.balance, method, "Membresías"); update(m, { balance: 0 }, "Pago registrado"); }
    else { const d = new Date(Math.max(Date.parse(m.end), Date.parse("2026-10-08"))); d.setMonth(d.getMonth() + 1); recordIncome(`Renovación ${m.plan} ${m.name}`, 899 + m.balance, method, "Membresías"); update(m, { status: "Activa", end: d.toISOString().slice(0, 10), balance: 0 }, "Membresía renovada"); }
    setRenew(null);
  };
  const update = (m: Member, patch: Partial<Member>, msg: string) => {
    const nu = { ...m, ...patch };
    setList((l) => l.map((x) => (x.id === m.id ? nu : x)));
    setSel(nu);
    toast.success(msg);
  };

  return (
    <div>
      <PageHeader title="Clientes y membresías" subtitle={`${list.length} expedientes registrados`} />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar por nombre, ID o correo" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="flex rounded-md border">
          {FILTERS.map((x) => <button key={x} onClick={() => setF(x)} className={`px-3 py-2 text-xs ${f === x ? "bg-primary text-primary-foreground" : ""}`}>{x}</button>)}
        </div>
        <select value={plan} onChange={(e) => setPlan(e.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm">
          {["Todos", "Mensual", "Trimestral", "Anual", "Estudiante", "Premium VIP"].map((p) => <option key={p}>{p}</option>)}
        </select>
        <Button onClick={() => setAdding(true)} className="bg-gold"><Plus className="h-4 w-4" />Nuevo cliente</Button>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground">
            <tr className="border-b">{["ID", "Cliente", "Plan", "Estado", "Vence", "Saldo"].map((h) => <th key={h} className="p-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} onClick={() => setSel(m)} className="cursor-pointer border-b last:border-0 hover:bg-accent/50">
                <td className="p-3 font-mono text-xs text-muted-foreground">{m.id}</td>
                <td className="p-3"><p className="font-medium">{m.name}</p><p className="text-xs text-muted-foreground">{m.email}</p></td>
                <td className="p-3">{m.plan}</td>
                <td className="p-3"><StatusBadge status={m.status} /></td>
                <td className="p-3">{m.end}</td>
                <td className={`p-3 ${m.balance ? "text-destructive" : "text-muted-foreground"}`}>{money(m.balance)}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Sin resultados</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <DialogContent className="max-w-lg">
          {sel && <>
            <DialogHeader><DialogTitle>{sel.name}</DialogTitle></DialogHeader>
            <div className="flex items-center gap-2"><StatusBadge status={sel.status} /><span className="font-mono text-xs text-muted-foreground">{sel.id}</span></div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {[["Correo", sel.email], ["Teléfono", sel.phone], ["Plan", sel.plan], ["Entrenador", sel.trainer], ["Inicio", sel.start], ["Vencimiento", `${sel.end} (${daysLeft(sel.end)}d)`], ["Visitas del mes", sel.visits], ["Saldo pendiente", money(sel.balance)]].map(([k, v]) => (
                <div key={k as string} className="rounded-md bg-muted p-2"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>
              ))}
            </dl>
            <div className="flex flex-wrap gap-2">
              <Button className="bg-gold" onClick={() => setRenew(sel)}>Renovar 1 mes</Button>
              {sel.status !== "Congelada"
                ? <Button variant="outline" onClick={() => update(sel, { status: "Congelada" }, "Membresía congelada")}>Congelar</Button>
                : <Button variant="outline" onClick={() => update(sel, { status: "Activa" }, "Membresía reactivada")}>Descongelar</Button>}
              {sel.balance > 0 && <Button variant="outline" onClick={() => setRenew({ ...sel, plan: "__saldo" })}>Registrar pago</Button>}
            </div>
          </>}
        </DialogContent>
      </Dialog>

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo cliente</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={(e) => {
            e.preventDefault();
            if (nm.name.length < 3 || !nm.email.includes("@")) { toast.error("Completa nombre y correo válidos"); return; }
            const id = `GB-${1001 + list.length}`;
            const end = new Date("2026-11-08").toISOString().slice(0, 10);
            setList((l) => [{ id, qr: id, name: nm.name, email: nm.email, phone: "—", plan: nm.plan, status: "Activa", start: "2026-10-08", end, balance: 0, visits: 0, trainer: "Marco Ruiz" }, ...l]);
            setAdding(false); setNm({ name: "", email: "", plan: "Mensual" }); toast.success(`Cliente ${id} creado`);
          }}>
            <div className="space-y-1"><Label>Nombre</Label><Input value={nm.name} onChange={(e) => setNm({ ...nm, name: e.target.value })} /></div>
            <div className="space-y-1"><Label>Correo</Label><Input value={nm.email} onChange={(e) => setNm({ ...nm, email: e.target.value })} /></div>
            <div className="space-y-1"><Label>Plan</Label>
              <select value={nm.plan} onChange={(e) => setNm({ ...nm, plan: e.target.value })} className="h-9 w-full rounded-md border bg-background px-3 text-sm">
                {["Mensual", "Trimestral", "Anual", "Estudiante", "Premium VIP"].map((p) => <option key={p}>{p}</option>)}
              </select></div>
            <Button className="w-full bg-gold">Guardar</Button>
          </form>
        </DialogContent>
      </Dialog>
      <PaymentDialog open={!!renew} amount={renew ? (renew.plan === "__saldo" ? renew.balance : 899 + renew.balance) : 0} concept={renew?.plan === "__saldo" ? "Pago de saldo pendiente" : "Renovación de membresía (1 mes)"} onClose={() => setRenew(null)} onPaid={doRenew} />
    </div>
  );
}
