import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChefHat, Pencil, Plus, Trash2, ArrowRight, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel } from "@/components/Kpi";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { money } from "@/lib/data";
import { MENU_CATS, STATUSES, deleteMenuItem, markPaid, saveMenuItem, setOrderStatus, toggleAvailable, useMenu, useOrders, type MenuItem } from "@/lib/kitchen";

export const Route = createFileRoute("/app/cocina")({
  head: () => ({ meta: [{ title: "Cocina y cafetería fitness — Gym Black" }, { name: "description", content: "Comandas de cocina, Smoothie & Protein Bar y gestión de menú con macros." }, { property: "og:title", content: "Cocina y cafetería fitness — Gym Black" }, { property: "og:description", content: "Comandas de cocina, Smoothie & Protein Bar y gestión de menú con macros." }] }),
  component: Kitchen,
});

const colors: Record<string, string> = { Pendiente: "border-destructive/60", "En preparación": "border-info/60", "Listo para entregar": "border-success/60", Entregado: "border-border" };

function Kitchen() {
  const [tab, setTab] = useState<"comandas" | "menu">("comandas");
  return (
    <div>
      <PageHeader title="Cocina y cafetería fitness" subtitle="Smoothie & Protein Bar · comidas saludables · bowls · snacks" />
      <div className="mb-6 flex gap-2">
        {(["comandas", "menu"] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={`rounded-full border px-4 py-1.5 text-sm ${tab === t ? "border-primary bg-primary text-primary-foreground" : ""}`}>{t === "comandas" ? "Comandas" : "Gestión de menú"}</button>)}
      </div>
      {tab === "comandas" ? <Board /> : <MenuAdmin />}
    </div>
  );
}

function Board() {
  const orders = useOrders();
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {STATUSES.map((s, si) => {
        const list = orders.filter((o) => o.status === s);
        return (
          <Panel key={s} title={`${s} (${list.length})`}>
            <div className="space-y-3">
              {!list.length && <p className="py-4 text-center text-xs text-muted-foreground">Sin comandas</p>}
              {list.map((o) => (
                <div key={o.id} className={`rounded-lg border-l-4 bg-background/40 p-3 text-sm ${colors[s]}`}>
                  <div className="flex justify-between"><span className="font-semibold">#{o.id} · {o.customer}</span><span className="text-xs text-muted-foreground">{o.time}</span></div>
                  <p className="text-xs text-primary">{o.source} · {o.paid ? "Pagado" : "Por cobrar"}</p>
                  <ul className="my-2 text-xs">{o.items.map((i) => <li key={i.id}>{i.q}× {i.name}</li>)}</ul>
                  {o.note && <p className="text-xs italic text-muted-foreground">Nota: {o.note}</p>}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {!o.paid && <Button size="sm" variant="outline" onClick={() => { markPaid(o.id); toast.success(`Cobrado ${money(o.total)}`); }}><CreditCard className="h-3 w-3" />Cobrar</Button>}
                    {si < STATUSES.length - 1 && <Button size="sm" className="bg-gold" onClick={() => setOrderStatus(o.id, STATUSES[si + 1]!)}>{STATUSES[si + 1]}<ArrowRight className="h-3 w-3" /></Button>}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        );
      })}
    </div>
  );
}

const empty: MenuItem = { id: "", name: "", cat: "Smoothies", price: 0, kcal: 0, p: 0, c: 0, f: 0, available: true };

function MenuAdmin() {
  const menu = useMenu();
  const [edit, setEdit] = useState<MenuItem | null>(null);
  const num = (k: keyof MenuItem) => (e: React.ChangeEvent<HTMLInputElement>) => setEdit((x) => x && { ...x, [k]: Number(e.target.value) });
  return (
    <Panel title="Menú con macros" action={<Button size="sm" className="bg-gold" onClick={() => setEdit({ ...empty, id: `m${Date.now()}` })}><Plus className="h-4 w-4" />Nuevo platillo</Button>}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground"><tr><th className="py-2">Platillo</th><th>Categoría</th><th>Precio</th><th>Kcal</th><th>P/C/G (g)</th><th>Disponible</th><th /></tr></thead>
          <tbody>
            {menu.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="py-2 font-medium">{m.name}</td><td>{m.cat}</td><td>{money(m.price)}</td><td>{m.kcal}</td><td>{m.p}/{m.c}/{m.f}</td>
                <td><button onClick={() => toggleAvailable(m.id)} className={`rounded-full px-2 py-0.5 text-xs ${m.available ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>{m.available ? "Sí" : "Agotado"}</button></td>
                <td className="whitespace-nowrap text-right">
                  <button aria-label="Editar" onClick={() => setEdit(m)} className="p-1"><Pencil className="h-4 w-4" /></button>
                  <button aria-label="Eliminar" onClick={() => { deleteMenuItem(m.id); toast.success("Platillo eliminado"); }} className="p-1 text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><ChefHat className="h-4 w-4 text-primary" />Platillo</DialogTitle></DialogHeader>
          {edit && <form className="grid gap-3 text-sm" onSubmit={(e) => { e.preventDefault(); if (!edit.name) return toast.error("Escribe un nombre"); saveMenuItem(edit); setEdit(null); toast.success("Menú actualizado"); }}>
            <input className="rounded-md border bg-background px-3 py-2" placeholder="Nombre" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
            <select className="rounded-md border bg-background px-3 py-2" value={edit.cat} onChange={(e) => setEdit({ ...edit, cat: e.target.value as MenuItem["cat"] })}>{MENU_CATS.map((c) => <option key={c}>{c}</option>)}</select>
            <div className="grid grid-cols-3 gap-2">
              {([["price", "Precio"], ["kcal", "Kcal"], ["p", "Proteína"], ["c", "Carbs"], ["f", "Grasa"]] as const).map(([k, l]) => (
                <label key={k} className="text-xs text-muted-foreground">{l}<input type="number" min={0} className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-foreground" value={edit[k]} onChange={num(k)} /></label>
              ))}
            </div>
            <Button type="submit" className="bg-gold">Guardar</Button>
          </form>}
        </DialogContent>
      </Dialog>
    </Panel>
  );
}
