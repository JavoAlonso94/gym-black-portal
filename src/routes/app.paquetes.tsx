import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, ShoppingCart, Ticket, Dumbbell, CupSoda, MapPin, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/Kpi";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { money } from "@/lib/data";
import { BRANCHES, deletePack, savePack, sendPackToPos, useLeads, useMembers, usePacks, type Pack } from "@/lib/crm";

export const Route = createFileRoute("/app/paquetes")({
  head: () => ({ meta: [{ title: "Paquetes comerciales — Gym Black" }, { name: "description", content: "Catálogo, creación y venta de paquetes combinados de membresía, entrenador y cafetería." }, { property: "og:title", content: "Paquetes comerciales — Gym Black" }, { property: "og:description", content: "Catálogo, creación y venta de paquetes combinados de membresía, entrenador y cafetería." }] }),
  component: Packs,
});

const input = "w-full rounded-md border bg-background px-3 py-2 text-sm";

function Packs() {
  const packs = usePacks();
  const members = useMembers();
  const leads = useLeads().filter((l) => l.stage !== "Convertido a socio" && l.stage !== "Perdido");
  const [edit, setEdit] = useState<Pack | null>(null);
  const [sell, setSell] = useState<Pack | null>(null);
  const [who, setWho] = useState("");

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title="Paquetes comerciales" subtitle="Membresía, entrenador y cafetería en un solo plan" />
        <Button className="bg-gold" onClick={() => setEdit({ id: `k${Date.now()}`, name: "", price: 0, days: 30, branches: ["Centro"], accesses: "Ilimitados", sessions: 0, cafe: "", extras: "", active: true })}><Plus className="h-4 w-4" />Crear paquete</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {packs.map((p) => (
          <div key={p.id} className={`flex flex-col rounded-xl border bg-card p-5 ${p.active ? "" : "opacity-50"}`}>
            <p className="font-display text-lg font-bold">{p.name}</p>
            <p className="mt-1 font-display text-2xl font-bold text-primary">{money(p.price)}</p>
            <ul className="mt-4 flex-1 space-y-2 text-sm">
              <li className="flex gap-2"><CalendarDays className="h-4 w-4 shrink-0 text-primary" />Vigencia {p.days} días</li>
              <li className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-primary" />{p.branches.join(", ")}</li>
              <li className="flex gap-2"><Ticket className="h-4 w-4 shrink-0 text-primary" />Accesos: {p.accesses}</li>
              <li className="flex gap-2"><Dumbbell className="h-4 w-4 shrink-0 text-primary" />{p.sessions} sesiones con entrenador</li>
              <li className="flex gap-2"><CupSoda className="h-4 w-4 shrink-0 text-primary" />Cafetería: {p.cafe || "—"}</li>
              {p.extras && <li className="text-xs text-muted-foreground">+ {p.extras}</li>}
            </ul>
            <div className="mt-4 flex gap-2">
              <Button size="sm" className="flex-1 bg-gold" disabled={!p.active} onClick={() => { setSell(p); setWho(members[0]?.name ?? ""); }}><ShoppingCart className="h-3 w-3" />Vender</Button>
              <button aria-label="Editar" onClick={() => setEdit(p)} className="rounded border p-2"><Pencil className="h-3 w-3" /></button>
              <button aria-label="Eliminar" onClick={() => { deletePack(p.id); toast.success("Paquete eliminado"); }} className="rounded border p-2 text-destructive"><Trash2 className="h-3 w-3" /></button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Paquete</DialogTitle></DialogHeader>
          {edit && <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); if (!edit.name || !edit.branches.length) { toast.error("Agrega nombre y al menos una sucursal"); return; } savePack(edit); setEdit(null); toast.success("Paquete guardado"); }}>
            <input className={input} placeholder="Nombre del paquete" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
            <div className="grid grid-cols-3 gap-2">
              <label className="text-xs text-muted-foreground">Precio<input type="number" min={0} className={input} value={edit.price} onChange={(e) => setEdit({ ...edit, price: Number(e.target.value) })} /></label>
              <label className="text-xs text-muted-foreground">Vigencia (días)<input type="number" min={1} className={input} value={edit.days} onChange={(e) => setEdit({ ...edit, days: Number(e.target.value) })} /></label>
              <label className="text-xs text-muted-foreground">Sesiones<input type="number" min={0} className={input} value={edit.sessions} onChange={(e) => setEdit({ ...edit, sessions: Number(e.target.value) })} /></label>
            </div>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Sucursales permitidas</p>
              <div className="flex flex-wrap gap-2">{BRANCHES.map((b) => { const on = edit.branches.includes(b); return <button type="button" key={b} onClick={() => setEdit({ ...edit, branches: on ? edit.branches.filter((x) => x !== b) : [...edit.branches, b] })} className={`rounded-full border px-3 py-1 text-xs ${on ? "border-primary text-primary" : ""}`}>{b}</button>; })}</div>
            </div>
            <input className={input} placeholder="Accesos (ej. Ilimitados)" value={edit.accesses} onChange={(e) => setEdit({ ...edit, accesses: e.target.value })} />
            <input className={input} placeholder="Consumos en cafetería (ej. 8 shakes)" value={edit.cafe} onChange={(e) => setEdit({ ...edit, cafe: e.target.value })} />
            <input className={input} placeholder="Beneficios extra" value={edit.extras} onChange={(e) => setEdit({ ...edit, extras: e.target.value })} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={edit.active} onChange={(e) => setEdit({ ...edit, active: e.target.checked })} />Disponible para venta</label>
            <Button type="submit" className="bg-gold">Guardar</Button>
          </form>}
        </DialogContent>
      </Dialog>

      <Dialog open={!!sell} onOpenChange={(o) => !o && setSell(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Vender {sell?.name}</DialogTitle></DialogHeader>
          <select className={input} value={who} onChange={(e) => setWho(e.target.value)}>
            <optgroup label="Socios">{members.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}</optgroup>
            <optgroup label="Prospectos">{leads.map((l) => <option key={l.id} value={l.name}>{l.name} (prospecto)</option>)}</optgroup>
          </select>
          <p className="text-sm">Total: <span className="font-bold text-primary">{money(sell?.price ?? 0)}</span></p>
          <Button className="bg-gold" onClick={() => { if (sell && who) { sendPackToPos(sell, who); toast.success(`Enviado a caja: ${sell.name} para ${who}`); setSell(null); } }}>Enviar al punto de venta</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
