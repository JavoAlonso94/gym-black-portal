import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel } from "@/components/Kpi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EXERCISES, MEMBERS, MUSCLES, type Exercise } from "@/lib/data";

export const Route = createFileRoute("/app/rutinas")({
  head: () => ({ meta: [{ title: "Rutinas y ejercicios — Gym Black" }, { name: "description", content: "Catálogo de ejercicios y constructor de rutinas." }, { property: "og:title", content: "Rutinas y ejercicios — Gym Black" }, { property: "og:description", content: "Catálogo de ejercicios y constructor de rutinas." }] }),
  component: Routines,
});

type Item = { ex: Exercise; sets: number; reps: number; rest: number };

function Routines() {
  const [group, setGroup] = useState("Todos");
  const [q, setQ] = useState("");
  const [name, setName] = useState("Hipertrofia A");
  const [member, setMember] = useState(MEMBERS[0].id);
  const [items, setItems] = useState<Item[]>([]);
  const [saved, setSaved] = useState<{ name: string; member: string; n: number }[]>([]);

  const list = EXERCISES.filter((e) => (group === "Todos" || e.group === group) && e.name.toLowerCase().includes(q.toLowerCase()));
  const upd = (i: number, p: Partial<Item>) => setItems((l) => l.map((x, j) => (j === i ? { ...x, ...p } : x)));
  const move = (i: number, d: number) => setItems((l) => { const n = [...l]; const j = i + d; if (j < 0 || j >= n.length) return l; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const mins = Math.round(items.reduce((s, i) => s + i.sets * (40 + i.rest), 0) / 60);

  return (
    <div>
      <PageHeader title="Rutinas y ejercicios" subtitle="Arma rutinas personalizadas desde el catálogo" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Catálogo de ejercicios">
          <div className="mb-3 flex flex-wrap gap-2">
            {["Todos", ...MUSCLES].map((m) => <button key={m} onClick={() => setGroup(m)} className={`rounded-full border px-3 py-1 text-xs ${group === m ? "border-primary bg-primary text-primary-foreground" : ""}`}>{m}</button>)}
          </div>
          <Input placeholder="Buscar ejercicio" value={q} onChange={(e) => setQ(e.target.value)} className="mb-3" />
          <ul className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
            {list.map((e) => (
              <li key={e.id} className="flex items-center justify-between rounded-md bg-muted p-3">
                <div><p className="text-sm font-medium">{e.name}</p><p className="text-xs text-muted-foreground">{e.group} · {e.equip} · {e.level}</p></div>
                <button aria-label={`Agregar ${e.name}`} onClick={() => { setItems((l) => [...l, { ex: e, sets: 4, reps: 10, rest: 90 }]); toast.success(`${e.name} agregado`); }} className="rounded-md bg-primary p-1.5 text-primary-foreground"><Plus className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Constructor de rutina" action={<span className="text-xs text-muted-foreground">{items.length} ejercicios · ~{mins} min</span>}>
          <div className="mb-4 grid gap-2 sm:grid-cols-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la rutina" />
            <select value={member} onChange={(e) => setMember(e.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm">
              {MEMBERS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          {!items.length && <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">Agrega ejercicios con el botón +</p>}
          <ol className="space-y-2">
            {items.map((it, i) => (
              <li key={i} className="rounded-md border p-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-primary-foreground">{i + 1}</span>
                  <p className="flex-1 text-sm font-medium">{it.ex.name}<span className="ml-2 text-xs text-primary">{it.ex.group}</span></p>
                  <button aria-label="Subir" onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" /></button>
                  <button aria-label="Bajar" onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" /></button>
                  <button aria-label="Eliminar" onClick={() => setItems((l) => l.filter((_, j) => j !== i))} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  {([["sets", "Series"], ["reps", "Reps"], ["rest", "Descanso (s)"]] as const).map(([k, l]) => (
                    <label key={k} className="text-muted-foreground">{l}
                      <Input type="number" min={1} value={it[k]} onChange={(e) => upd(i, { [k]: Number(e.target.value) })} className="mt-1 h-8" /></label>
                  ))}
                </div>
              </li>
            ))}
          </ol>
          <Button className="mt-4 w-full bg-gold" onClick={() => {
            if (!items.length) return toast.error("Agrega al menos un ejercicio");
            const m = MEMBERS.find((x) => x.id === member)!;
            setSaved((s) => [{ name, member: m.name, n: items.length }, ...s]); setItems([]);
            toast.success(`Rutina "${name}" asignada a ${m.name}`);
          }}><Save className="h-4 w-4" />Guardar y asignar</Button>
          {!!saved.length && <div className="mt-4 space-y-1 border-t pt-4 text-sm">
            <p className="text-xs uppercase text-muted-foreground">Rutinas asignadas</p>
            {saved.map((s, i) => <p key={i}>{s.name} → <span className="text-primary">{s.member}</span> <span className="text-muted-foreground">({s.n} ej.)</span></p>)}
          </div>}
        </Panel>
      </div>
    </div>
  );
}
