import { useMemo, useState } from "react";
import { Banknote, CreditCard, Landmark, Store, Smartphone, Upload, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { money } from "@/lib/data";

export const METHODS = ["Efectivo", "SPEI", "OXXO Pay", "Clip Terminal", "Link Clip"] as const;
export type Method = (typeof METHODS)[number];
const icons = { Efectivo: Banknote, SPEI: Landmark, "OXXO Pay": Store, "Clip Terminal": CreditCard, "Link Clip": Smartphone };

const digits = (n: number, seed: number) => Array.from({ length: n }, (_, i) => String((seed * (i + 7) * 31 + i * 13) % 10)).join("");

function Barcode({ code }: { code: string }) {
  return (
    <div className="flex h-14 items-stretch justify-center gap-px rounded bg-foreground p-2">
      {code.split("").flatMap((d, i) => [<span key={i} className="bg-background" style={{ width: 1 + (Number(d) % 3) }} />, <span key={`g${i}`} style={{ width: 1 + (Number(d) % 2) }} />])}
    </div>
  );
}

export function PaymentDialog({ open, amount, concept, onClose, onPaid }: { open: boolean; amount: number; concept: string; onClose: () => void; onPaid: (method: Method) => void }) {
  const [m, setM] = useState<Method>("Efectivo");
  const [proof, setProof] = useState<string>("");
  const [step, setStep] = useState(0);
  const seed = useMemo(() => Math.floor(Math.random() * 9000) + 1000, [open]);
  const ref = `GB${seed}`;
  const clabe = `646180${digits(11, seed)}${seed % 10}`;
  const oxxo = digits(14, seed + 3);
  const link = `https://pay.clip.mx/gymblack/${ref.toLowerCase()}`;
  const limit = new Date("2026-10-11").toLocaleDateString("es-MX", { dateStyle: "long" });
  const done = () => { onPaid(m); setStep(0); setProof(""); setM("Efectivo"); };
  const copy = (t: string) => { navigator.clipboard?.writeText(t); toast.success("Copiado"); };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setStep(0); onClose(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Cobrar {money(amount)}</DialogTitle></DialogHeader>
        <p className="-mt-2 text-xs text-muted-foreground">{concept}</p>
        <div className="grid grid-cols-5 gap-1">
          {METHODS.map((x) => { const I = icons[x]; return <button key={x} onClick={() => { setM(x); setStep(0); }} className={`flex flex-col items-center gap-1 rounded-md border p-2 text-[10px] ${m === x ? "border-primary text-primary" : ""}`}><I className="h-4 w-4" />{x}</button>; })}
        </div>
        <div className="rounded-lg border bg-background/40 p-4 text-sm">
          {m === "Efectivo" && <p>Recibe {money(amount)} en efectivo y confirma.</p>}
          {m === "SPEI" && <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-primary">Ficha de transferencia SPEI</p>
            <div className="flex justify-between"><span className="text-muted-foreground">Banco</span><span>STP</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Beneficiario</span><span>Gym Black S.A. de C.V.</span></div>
            <div className="flex items-center justify-between"><span className="text-muted-foreground">CLABE</span><button onClick={() => copy(clabe)} className="flex items-center gap-1 font-mono">{clabe}<Copy className="h-3 w-3" /></button></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Concepto / Ref.</span><span className="font-mono">{ref}</span></div>
            <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-md border border-dashed p-3 text-xs"><Upload className="h-4 w-4 text-primary" />{proof || "Subir comprobante (PDF o imagen)"}<input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setProof(e.target.files?.[0]?.name ?? "")} /></label>
            {proof && step === 0 && <Button size="sm" variant="outline" className="w-full" onClick={() => { setStep(1); toast.success(`Comprobante validado: referencia ${ref} y monto coinciden`); }}>Validar comprobante</Button>}
            {step === 1 && <p className="flex items-center gap-1 text-xs text-success"><Check className="h-3 w-3" />Comprobante validado</p>}
          </div>}
          {m === "OXXO Pay" && <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-primary">Ficha OXXO Pay</p>
            <Barcode code={oxxo} />
            <p className="text-center font-mono tracking-widest">{oxxo.replace(/(\d{4})(?=\d)/g, "$1 ")}</p>
            <div className="flex justify-between"><span className="text-muted-foreground">Monto</span><span>{money(amount)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Fecha límite</span><span>{limit}</span></div>
            {step === 0 && <Button size="sm" variant="outline" className="w-full" onClick={() => { setStep(1); toast.success("OXXO confirmó el pago en tienda"); }}>Simular pago en tienda</Button>}
            {step === 1 && <p className="flex items-center gap-1 text-xs text-success"><Check className="h-3 w-3" />Pago confirmado por OXXO</p>}
          </div>}
          {m === "Clip Terminal" && <div className="space-y-2 text-center">
            <p className="text-xs uppercase tracking-wider text-primary">Terminal Clip</p>
            <div className="mx-auto w-40 whitespace-pre-line rounded-xl border-2 border-primary/50 p-3 font-mono text-xs">{step === 0 ? `${money(amount)}\nAcerque o inserte tarjeta` : "APROBADA ✓"}</div>
            {step === 0 && <Button size="sm" variant="outline" className="w-full" onClick={() => { toast("Procesando en terminal Clip..."); setTimeout(() => setStep(1), 900); }}>Enviar cobro a terminal</Button>}
          </div>}
          {m === "Link Clip" && <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-primary">Link de pago Clip</p>
            <button onClick={() => copy(link)} className="flex w-full items-center justify-between gap-2 rounded-md border px-2 py-1.5 font-mono text-xs"><span className="truncate">{link}</span><Copy className="h-3 w-3 shrink-0" /></button>
            {step === 0 && <Button size="sm" variant="outline" className="w-full" onClick={() => { setStep(1); toast.success("El cliente pagó con el link"); }}>Simular pago del cliente</Button>}
            {step === 1 && <p className="flex items-center gap-1 text-xs text-success"><Check className="h-3 w-3" />Pago recibido por link</p>}
          </div>}
        </div>
        <Button className="bg-gold font-semibold" disabled={m !== "Efectivo" && step === 0} onClick={done}>Confirmar cobro</Button>
      </DialogContent>
    </Dialog>
  );
}
