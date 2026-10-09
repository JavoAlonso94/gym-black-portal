import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell, RolePicker } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, ROLES, type Role } from "@/lib/auth";

export const Route = createFileRoute("/registro")({
  head: () => ({
    meta: [
      { title: "Crear cuenta — Gym Black" },
      { name: "description", content: "Regístrate en Gym Black y elige tu rol." },
      { property: "og:title", content: "Crear cuenta — Gym Black" },
      { property: "og:description", content: "Regístrate en Gym Black y elige tu rol." },
          { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Register,
});

function Register() {
  const nav = useNavigate();
  const [f, setF] = useState({ name: "", email: "", pass: "" });
  const [role, setRole] = useState<Role>("Cliente");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (f.name.length < 3) { toast.error("Escribe tu nombre completo"); return; }
    if (!f.email.includes("@")) { toast.error("Correo inválido"); return; }
    if (f.pass.length < 6) { toast.error("La contraseña debe tener al menos 6 caracteres"); return; }
    login({ name: f.name, email: f.email, role });
    toast.success("Cuenta creada");
    nav({ to: "/app" });
  };
  return (
    <AuthShell title="Crear cuenta" subtitle="Únete a la comunidad Gym Black.">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5"><Label>Nombre completo</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Correo</Label><Input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Contraseña</Label><Input type="password" value={f.pass} onChange={(e) => setF({ ...f, pass: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Rol</Label><RolePicker value={role} onChange={setRole} roles={ROLES} /></div>
        <Button type="submit" className="w-full bg-gold font-semibold uppercase tracking-wider">Registrarme</Button>
        <p className="text-center text-sm text-muted-foreground">¿Ya tienes cuenta? <Link to="/" className="text-primary hover:underline">Inicia sesión</Link></p>
      </form>
    </AuthShell>
  );
}
