import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Scale, Percent, Ruler, Activity } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { Kpi, PageHeader, Panel } from "@/components/Kpi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/lib/auth";

export const Route = createFileRoute("/app/progreso")({
  head: () => ({ meta: [{ title: "Perfil y progreso — Gym Black" }, { name: "description", content: "Registro de medidas corporales y evolución física." }, { property: "og:title", content: "Perfil y progreso — Gym Black" }, { property: "og:description", content: "Registro de medidas corporales y evolución física." }] }),
  component: Progress,
});

type M = { fecha: string; peso: number; grasa: number; cintura: number; brazo: number };
const INIT: M[] = [
  { fecha: "2026-05-01", peso: 86.4, grasa: 24.1, cintura: 94, brazo: 34 },
  { fecha: "2026-06-01", peso: 84.9, grasa: 22.8, cintura: 92, brazo: 34.5 },
  { fecha: "2026-07-01", peso: 83.2, grasa: 21.5, cintura: 90, brazo: 35 },
  { fecha: "2026-08-01", peso: 82.5, grasa: 20.2, cintura: 88.5, brazo: 35.6 },
  { fecha: "2026-09-01", peso: 81.3, grasa: 19.1, cintura: 87, brazo: 36 },
  { fecha: "2026-10-01", peso: 80.6, grasa: 18.4, cintura: 86, brazo: 36.4 },
];
const tip = { contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 } };

function Progress() {
  const user = useUser();
  const [data, setData] = useState<M[]>(INIT);
  const [metric, setMetric] = useState<"peso" | "grasa" | "medidas">("peso");
  const [f, setF] = useState({ fecha: "2026-10-08", peso: "", grasa: "", cintura: "", brazo: "" });
  const first = data[0]!, last = data[data.length - 1]!;
  const imc = (last.peso / 1.78 ** 2).toFixed(1);
  const d = (k: keyof M) => ((last[k] as number) - (first[k] as number)).toFixed(1);

  return (
    <div>
      <PageHeader title="Perfil y progreso" subtitle={`${user?.name ?? ""} · ${user?.role ?? ""} · Estatura 1.78 m · Objetivo: recomposición`} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Peso actual" value={`${last.peso} kg`} hint={`${d("peso")} kg desde inicio`} icon={Scale} />
        <Kpi label="% Grasa" value={`${last.grasa}%`} hint={`${d("grasa")} pts`} icon={Percent} />
        <Kpi label="Cintura" value={`${last.cintura} cm`} hint={`${d("cintura")} cm`} icon={Ruler} />
        <Kpi label="IMC" value={imc} hint="Rango saludable 18.5–24.9" icon={Activity} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel title="Evolución física" className="xl:col-span-2" action={
          <div className="flex rounded-md border text-xs">
            {(["peso", "grasa", "medidas"] as const).map((m) => <button key={m} onClick={() => setMetric(m)} className={`px-3 py-1 capitalize ${metric === m ? "bg-primary text-primary-foreground" : ""}`}>{m}</button>)}
          </div>}>
          <div className="h-80">
            <ResponsiveContainer>
              <LineChart data={data}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="fecha" stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} domain={["auto", "auto"]} />
                <Tooltip {...tip} />
                <Legend />
                {metric === "peso" && <Line type="monotone" dataKey="peso" name="Peso (kg)" stroke="var(--chart-1)" strokeWidth={3} dot={{ r: 4 }} />}
                {metric === "grasa" && <Line type="monotone" dataKey="grasa" name="% Grasa" stroke="var(--chart-1)" strokeWidth={3} dot={{ r: 4 }} />}
                {metric === "medidas" && <>
                  <Line type="monotone" dataKey="cintura" name="Cintura (cm)" stroke="var(--chart-1)" strokeWidth={3} />
                  <Line type="monotone" dataKey="brazo" name="Brazo (cm)" stroke="var(--chart-2)" strokeWidth={3} />
                </>}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Registrar medidas">
          <form className="space-y-3" onSubmit={(e) => {
            e.preventDefault();
            const vals = [f.peso, f.grasa, f.cintura, f.brazo].map(Number);
            if (vals.some((v) => !v || v <= 0)) { toast.error("Completa todas las medidas con valores válidos"); return; }
            setData((l) => [...l, { fecha: f.fecha, peso: vals[0], grasa: vals[1], cintura: vals[2], brazo: vals[3] }].sort((a, b) => a.fecha.localeCompare(b.fecha)));
            setF({ ...f, peso: "", grasa: "", cintura: "", brazo: "" });
            toast.success("Medidas registradas");
          }}>
            <div className="space-y-1"><Label>Fecha</Label><Input type="date" value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} /></div>
            {([["peso", "Peso (kg)"], ["grasa", "% Grasa"], ["cintura", "Cintura (cm)"], ["brazo", "Brazo (cm)"]] as const).map(([k, l]) => (
              <div key={k} className="space-y-1"><Label>{l}</Label><Input type="number" step="0.1" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>
            ))}
            <Button className="w-full bg-gold">Guardar registro</Button>
          </form>
        </Panel>
      </div>
      <Panel title="Historial" className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground"><tr className="border-b">{["Fecha", "Peso", "% Grasa", "Cintura", "Brazo"].map((h) => <th key={h} className="p-2">{h}</th>)}</tr></thead>
            <tbody>{[...data].reverse().map((r) => <tr key={r.fecha + r.peso} className="border-b last:border-0"><td className="p-2">{r.fecha}</td><td className="p-2">{r.peso} kg</td><td className="p-2">{r.grasa}%</td><td className="p-2">{r.cintura} cm</td><td className="p-2">{r.brazo} cm</td></tr>)}</tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
