import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell, RolePicker } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, ROLES, type Role } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión — Gym Black" },
      { name: "description", content: "Accede a la plataforma de gestión de Gym Black." },
      { property: "og:title", content: "Iniciar sesión — Gym Black" },
      { property: "og:description", content: "Accede a la plataforma de gestión de Gym Black." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@gymblack.mx");
  const [pass, setPass] = useState("demo1234");
  const [role, setRole] = useState<Role>("Administrador");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || pass.length < 4) { toast.error("Credenciales inválidas"); return; }
    login({ name: (email.split("@")[0] ?? "").replace(/\./g, " "), email, role });
    toast.success(`Bienvenido, ${role}`);
    nav({ to: "/app" });
  };

  return (
    <AuthShell title="Iniciar sesión" subtitle="Ingresa con tu cuenta (modo demostración).">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5"><Label>Correo</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="space-y-1.5">
          <div className="flex justify-between"><Label>Contraseña</Label>
            <Link to="/recuperar" className="text-xs text-primary hover:underline">¿Olvidaste tu contraseña?</Link></div>
          <Input type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
        </div>
        <div className="space-y-1.5"><Label>Entrar como</Label><RolePicker value={role} onChange={setRole} roles={ROLES} /></div>
        <Button type="submit" className="w-full bg-gold font-semibold uppercase tracking-wider">Entrar</Button>
        <p className="text-center text-sm text-muted-foreground">¿No tienes cuenta? <Link to="/registro" className="text-primary hover:underline">Regístrate</Link></p>
        <div className="border-t pt-4 text-center"><Button asChild variant="outline" className="w-full"><Link to="/plantillas">Explorar plantillas web</Link></Button></div>
      </form>
    </AuthShell>
  );
}
