import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, UserCheck, Target, Percent, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Kpi, PageHeader, Panel } from "@/components/Kpi";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { money } from "@/lib/data";
import { CHANNELS, STAGES, convertLead, deleteLead, saveLead, useLeads, type Lead } from "@/lib/crm";

export const Route = createFileRoute("/app/crm")({
  head: () => ({ meta: [{ title: "CRM de prospectos — Gym Black" }, { name: "description", content: "Pipeline comercial de leads, seguimiento y conversión a socios." }, { property: "og:title", content: "CRM de prospectos — Gym Black" }, { property: "og:description", content: "Pipeline comercial de leads, seguimiento y conversión a socios." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: CRM,
});

const input = "w-full rounded-md border bg-background px-3 py-2 text-sm";

function CRM() {
  const leads = useLeads();
  const [edit, setEdit] = useState<Lead | null>(null);
  const active = leads.filter((l) => l.stage !== "Convertido a socio" && l.stage !== "Perdido");
  const won = leads.filter((l) => l.stage === "Convertido a socio").length;
  const closed = won + leads.filter((l) => l.stage === "Perdido").length;
  const rate = leads.length ? Math.round((won / leads.length) * 100) : 0;

  const convert = (l: Lead) => { convertLead(l); toast.success(`${l.name} ahora es socio en Clientes`); };
  const blank = (): Lead => ({ id: `L${Date.now()}`, name: "", phone: "", email: "", goal: "", channel: "Instagram", next: "2026-10-10", notes: "", stage: "Nuevo prospecto", value: 2400 });

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title="CRM de prospectos" subtitle={`${leads.length} prospectos · ${closed} cerrados`} />
        <Button className="bg-gold" onClick={() => setEdit(blank())}><Plus className="h-4 w-4" />Nuevo prospecto</Button>
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Kpi label="Leads activos" value={active.length} icon={Target} hint="En seguimiento" />
        <Kpi label="Tasa de conversión" value={`${rate}%`} icon={Percent} hint={`${won} convertidos`} />
        <Kpi label="Valor en pipeline" value={money(active.reduce((s, l) => s + l.value, 0))} icon={Wallet} hint="Estimado de leads activos" />
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((s) => {
          const list = leads.filter((l) => l.stage === s);
          return (
            <div key={s} className="w-72 shrink-0 rounded-xl border bg-card p-3">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider">{s} <span className="text-primary">({list.length})</span></p>
              <div className="space-y-2">
                {list.map((l) => (
                  <div key={l.id} className="rounded-lg border bg-background/40 p-3 text-sm">
                    <div className="flex justify-between gap-2"><p className="font-semibold">{l.name}</p><span className="text-xs text-primary">{money(l.value)}</span></div>
                    <p className="text-xs text-muted-foreground">{l.goal} · {l.channel}</p>
                    <p className="text-xs text-muted-foreground">Seguimiento: {l.next}</p>
                    <select aria-label="Etapa" className="mt-2 w-full rounded border bg-background px-2 py-1 text-xs" value={l.stage} onChange={(e) => saveLead({ ...l, stage: e.target.value as Lead["stage"] })}>{STAGES.map((x) => <option key={x}>{x}</option>)}</select>
                    <div className="mt-2 flex gap-1">
                      {l.stage !== "Convertido a socio" && <Button size="sm" className="h-7 flex-1 bg-gold text-xs" onClick={() => convert(l)}><UserCheck className="h-3 w-3" />Convertir a socio</Button>}
                      <button aria-label="Editar" onClick={() => setEdit(l)} className="rounded border p-1.5"><Pencil className="h-3 w-3" /></button>
                      <button aria-label="Eliminar" onClick={() => deleteLead(l.id)} className="rounded border p-1.5 text-destructive"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Prospecto</DialogTitle></DialogHeader>
          {edit && <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); if (!edit.name) { toast.error("Escribe un nombre"); return; } saveLead(edit); setEdit(null); toast.success("Prospecto guardado"); }}>
            <input className={input} placeholder="Nombre" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <input className={input} placeholder="Teléfono" value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} />
              <input className={input} placeholder="Email" value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} />
            </div>
            <input className={input} placeholder="Objetivo físico" value={edit.goal} onChange={(e) => setEdit({ ...edit, goal: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <select className={input} value={edit.channel} onChange={(e) => setEdit({ ...edit, channel: e.target.value as Lead["channel"] })}>{CHANNELS.map((c) => <option key={c}>{c}</option>)}</select>
              <select className={input} value={edit.stage} onChange={(e) => setEdit({ ...edit, stage: e.target.value as Lead["stage"] })}>{STAGES.map((c) => <option key={c}>{c}</option>)}</select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-muted-foreground">Próximo seguimiento<input type="date" className={input} value={edit.next} onChange={(e) => setEdit({ ...edit, next: e.target.value })} /></label>
              <label className="text-xs text-muted-foreground">Valor estimado<input type="number" className={input} value={edit.value} onChange={(e) => setEdit({ ...edit, value: Number(e.target.value) })} /></label>
            </div>
            <textarea className={input} rows={3} placeholder="Notas" value={edit.notes} onChange={(e) => setEdit({ ...edit, notes: e.target.value })} />
            <Button type="submit" className="bg-gold">Guardar</Button>
          </form>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
