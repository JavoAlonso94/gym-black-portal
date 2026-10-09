import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/recuperar")({
  head: () => ({
    meta: [
      { title: "Recuperar contraseña — Gym Black" },
      { name: "description", content: "Restablece el acceso a tu cuenta de Gym Black." },
      { property: "og:title", content: "Recuperar contraseña — Gym Black" },
      { property: "og:description", content: "Restablece el acceso a tu cuenta de Gym Black." },
          { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Recover,
});

function Recover() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [code, setCode] = useState("");
  return (
    <AuthShell title="Recuperar contraseña" subtitle="Te enviaremos un código de verificación (simulado).">
      {step === 1 && (
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (!email.includes("@")) { toast.error("Correo inválido"); return; } setStep(2); toast.success("Código enviado: 123456"); }}>
          <div className="space-y-1.5"><Label>Correo</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <Button className="w-full bg-gold font-semibold">Enviar código</Button>
        </form>
      )}
      {step === 2 && (
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (code !== "123456") { toast.error("Código incorrecto (usa 123456)"); return; } setStep(3); }}>
          <div className="space-y-1.5"><Label>Código de 6 dígitos</Label><Input value={code} maxLength={6} onChange={(e) => setCode(e.target.value)} /></div>
          <Button className="w-full bg-gold font-semibold">Verificar</Button>
        </form>
      )}
      {step === 3 && (
        <div className="space-y-4 rounded-xl border bg-card p-6 text-center">
          <MailCheck className="mx-auto h-10 w-10 text-primary" />
          <p>Tu contraseña fue restablecida. Ya puedes iniciar sesión.</p>
        </div>
      )}
      <p className="mt-6 text-center text-sm"><Link to="/" className="text-primary hover:underline">Volver a iniciar sesión</Link></p>
    </AuthShell>
  );
}
