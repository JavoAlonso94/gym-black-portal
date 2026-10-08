import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Users, DoorOpen, DollarSign, AlertTriangle, Bell } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { Kpi, Panel, PageHeader } from "@/components/Kpi";
import { ACTIVITY, MEMBERS, REVENUE, TRAFFIC, daysLeft, money } from "@/lib/data";
import { useUser } from "@/lib/auth";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Dashboard — Gym Black" }, { name: "description", content: "KPIs, ingresos y afluencia del gimnasio." }, { property: "og:title", content: "Dashboard — Gym Black" }, { property: "og:description", content: "KPIs, ingresos y afluencia del gimnasio." }] }),
  component: Dashboard,
});

const tip = { contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }, labelStyle: { color: "var(--foreground)" } };

function Dashboard() {
  const user = useUser();
  const [range, setRange] = useState<"semana" | "hoy">("semana");
  const active = MEMBERS.filter((m) => m.status === "Activa").length;
  const debt = MEMBERS.reduce((s, m) => s + m.balance, 0);
  const expiring = MEMBERS.filter((m) => m.status === "Activa" && daysLeft(m.end) <= 7).sort((a, b) => daysLeft(a.end) - daysLeft(b.end));

  return (
    <div>
      <PageHeader title={`Hola, ${user?.name ?? ""}`} subtitle="Resumen operativo de hoy — jueves 8 de octubre" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Miembros activos" value={active * 23} hint="+4.2% vs mes anterior" icon={Users} />
        <Kpi label="Asistencias hoy" value={187} hint="Pico esperado 19:00" icon={DoorOpen} />
        <Kpi label="Ingresos hoy" value={money(12840)} hint="Membresías + tienda" icon={DollarSign} />
        <Kpi label="Adeudos" value={money(debt)} hint={`${MEMBERS.filter((m) => m.balance).length} clientes con saldo`} icon={AlertTriangle} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel title="Ingresos" className="xl:col-span-2" action={
          <div className="flex rounded-md border text-xs">
            {(["semana", "hoy"] as const).map((r) => (
              <button key={r} onClick={() => setRange(r)} className={`px-3 py-1 capitalize ${range === r ? "bg-primary text-primary-foreground" : ""}`}>{r}</button>
            ))}
          </div>}>
          <div className="h-72">
            <ResponsiveContainer>
              {range === "semana" ? (
                <BarChart data={REVENUE}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip {...tip} formatter={(v: number) => money(v)} cursor={{ fill: "var(--accent)" }} />
                  <Legend />
                  <Bar dataKey="membresias" name="Membresías" stackId="a" fill="var(--chart-1)" />
                  <Bar dataKey="tienda" name="Tienda" stackId="a" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={TRAFFIC.map((t) => ({ hora: t.hora, ingresos: t.personas * 68 }))}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="hora" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip {...tip} formatter={(v: number) => money(v)} />
                  <Area dataKey="ingresos" name="Ingresos" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.2} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Membresías por vencer" action={<Bell className="h-4 w-4 text-warning" />}>
          <ul className="space-y-3">
            {expiring.slice(0, 6).map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2 text-sm">
                <div><p className="font-medium">{m.name}</p><p className="text-xs text-muted-foreground">{m.plan} · vence {m.end}</p></div>
                <button onClick={() => toast.success(`Recordatorio enviado a ${m.name}`)} className="rounded-md border border-warning/40 px-2 py-1 text-xs text-warning hover:bg-warning/10">
                  {daysLeft(m.end)}d · Avisar
                </button>
              </li>
            ))}
          </ul>
          <Link to="/app/clientes" className="mt-4 block text-xs text-primary hover:underline">Ver todos los clientes →</Link>
        </Panel>
        <Panel title="Afluencia por hora (hoy)" className="xl:col-span-2">
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={TRAFFIC}>
                <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--chart-1)" stopOpacity={0.5} /><stop offset="1" stopColor="var(--chart-1)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="hora" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip {...tip} />
                <Area type="monotone" dataKey="personas" name="Personas" stroke="var(--chart-1)" fill="url(#g)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Actividad reciente">
          <ul className="space-y-3">
            {ACTIVITY.map((a, i) => (
              <li key={i} className="border-l-2 border-primary/60 pl-3 text-sm"><p>{a.text}</p><p className="text-xs text-muted-foreground">{a.t}</p></li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
