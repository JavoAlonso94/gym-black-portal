import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, XCircle, ScanLine } from "lucide-react";
import { PageHeader, Panel, StatusBadge } from "@/components/Kpi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MEMBERS, daysLeft, type Member } from "@/lib/data";

export const Route = createFileRoute("/app/acceso")({
  head: () => ({ meta: [{ title: "Control de acceso QR — Gym Black" }, { name: "description", content: "Valida el acceso de los miembros con código QR." }, { property: "og:title", content: "Control de acceso QR — Gym Black" }, { property: "og:description", content: "Valida el acceso de los miembros con código QR." }] }),
  component: Access,
});

type Result = { ok: boolean; reason: string; member?: Member; code: string; time: string };

function validate(code: string): Result {
  const time = new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const m = MEMBERS.find((x) => x.qr === code.trim().toUpperCase());
  if (!m) return { ok: false, reason: "Código QR no reconocido", code, time };
  if (m.status === "Congelada") return { ok: false, reason: "Membresía congelada", member: m, code, time };
  if (m.status === "Vencida" || daysLeft(m.end) < 0) return { ok: false, reason: "Membresía vencida", member: m, code, time };
  if (m.balance > 0) return { ok: true, reason: "Autorizado — tiene saldo pendiente", member: m, code, time };
  return { ok: true, reason: "Acceso autorizado", member: m, code, time };
}

function Access() {
  const [scanning, setScanning] = useState(false);
  const [code, setCode] = useState("");
  const [res, setRes] = useState<Result | null>(null);
  const [log, setLog] = useState<Result[]>([]);

  const run = (c: string) => {
    setScanning(true); setRes(null);
    setTimeout(() => { const r = validate(c); setRes(r); setLog((l) => [r, ...l].slice(0, 12)); setScanning(false); }, 1100);
  };

  return (
    <div>
      <PageHeader title="Control de acceso QR" subtitle="Escanea la credencial del miembro o ingresa el código manualmente" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Escáner">
          <div className={`relative mx-auto flex aspect-square max-w-sm items-center justify-center overflow-hidden rounded-xl border-2 transition-colors ${res ? (res.ok ? "border-success" : "border-destructive") : "border-primary/40"} bg-sidebar`}>
            {["left-3 top-3 border-l-4 border-t-4", "right-3 top-3 border-r-4 border-t-4", "bottom-3 left-3 border-b-4 border-l-4", "bottom-3 right-3 border-b-4 border-r-4"].map((c) => <span key={c} className={`absolute h-10 w-10 border-primary ${c}`} />)}
            {scanning && <div className="absolute inset-x-6 top-1/2 h-0.5 animate-pulse bg-primary shadow-[0_0_20px_var(--primary)]" />}
            {!scanning && !res && <div className="text-center text-muted-foreground"><ScanLine className="mx-auto h-14 w-14 text-primary" /><p className="mt-2 text-sm">Listo para escanear</p></div>}
            {scanning && <p className="text-sm text-primary">Validando…</p>}
            {res && !scanning && (
              <div className="animate-in zoom-in p-6 text-center">
                {res.ok ? <CheckCircle2 className="mx-auto h-20 w-20 text-success" /> : <XCircle className="mx-auto h-20 w-20 text-destructive" />}
                <p className={`mt-3 text-xl font-bold ${res.ok ? "text-success" : "text-destructive"}`}>{res.ok ? "ACCESO AUTORIZADO" : "ACCESO RECHAZADO"}</p>
                <p className="text-sm text-muted-foreground">{res.reason}</p>
                {res.member && <p className="mt-2 font-semibold">{res.member.name}</p>}
              </div>
            )}
          </div>
          <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (code) run(code); }}>
            <Input placeholder="Ej. GB-1001" value={code} onChange={(e) => setCode(e.target.value)} />
            <Button className="bg-gold" disabled={scanning}>Validar</Button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground">Simular credencial:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {MEMBERS.slice(0, 8).map((m) => (
              <button key={m.id} disabled={scanning} onClick={() => { setCode(m.qr); run(m.qr); }} className="rounded-md border px-2 py-1 text-xs hover:border-primary">
                {m.name.split(" ")[0]} · <span className="text-muted-foreground">{m.status}</span>
              </button>
            ))}
            <button disabled={scanning} onClick={() => run("XX-0000")} className="rounded-md border border-destructive/40 px-2 py-1 text-xs text-destructive">QR inválido</button>
          </div>
        </Panel>
        <Panel title="Bitácora de accesos">
          {!log.length && <p className="text-sm text-muted-foreground">Aún no hay registros en esta sesión.</p>}
          <ul className="space-y-2">
            {log.map((r, i) => (
              <li key={i} className="flex items-center justify-between rounded-md bg-muted p-3 text-sm">
                <div className="flex items-center gap-3">
                  {r.ok ? <CheckCircle2 className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-destructive" />}
                  <div><p className="font-medium">{r.member?.name ?? r.code}</p><p className="text-xs text-muted-foreground">{r.reason}</p></div>
                </div>
                <div className="text-right text-xs text-muted-foreground">{r.time}{r.member && <div className="mt-1"><StatusBadge status={r.member.status} /></div>}</div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
