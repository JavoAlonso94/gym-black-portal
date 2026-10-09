import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutDashboard, Users, QrCode, ShoppingCart, Dumbbell, LineChart, LogOut, Menu, X, ChefHat, CupSoda, Target, Package, Landmark, PanelsTopLeft } from "lucide-react";
import logo from "@/assets/gym-black-logo.jpg";
import { logout, useUser } from "@/lib/auth";

export const Route = createFileRoute("/app")({ ssr: false, component: AppLayout });

const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/clientes", label: "Clientes", icon: Users },
  { to: "/app/crm", label: "CRM prospectos", icon: Target },
  { to: "/app/paquetes", label: "Paquetes", icon: Package },
  { to: "/app/erp", label: "ERP financiero", icon: Landmark },
  { to: "/app/acceso", label: "Control de acceso", icon: QrCode },
  { to: "/app/pos", label: "Punto de venta", icon: ShoppingCart },
  { to: "/app/cocina", label: "Cocina y cafetería", icon: ChefHat },
  { to: "/app/pedir", label: "Pedir comida", icon: CupSoda },
  { to: "/app/rutinas", label: "Rutinas", icon: Dumbbell },
  { to: "/app/progreso", label: "Perfil y progreso", icon: LineChart },
  { to: "/app/plantillas", label: "Página web", icon: PanelsTopLeft },
] as const;

function AppLayout() {
  const user = useUser();
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  useEffect(() => { if (ready && !user) nav({ to: "/", replace: true }); }, [ready, user, nav]);
  useEffect(() => setOpen(false), [path]);
  if (!user) return null;

  const side = (
    <aside className="flex h-full w-64 flex-col border-r bg-sidebar p-4">
      <img src={logo} alt="Gym Black" className="mx-auto mb-6 h-28 w-full rounded-lg object-cover object-center" />
      <nav className="flex-1 space-y-1">
        {NAV.map((n) => {
          const active = n.to === "/app" ? path === "/app" || path === "/app/" : path.startsWith(n.to);
          return (
            <Link key={n.to} to={n.to}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${active ? "bg-sidebar-accent text-primary" : "text-sidebar-foreground/80 hover:bg-sidebar-accent"}`}>
              <n.icon className="h-4 w-4" />{n.label}
            </Link>
          );
        })}
      </nav>
      <div className="rounded-lg border p-3">
        <p className="truncate text-sm font-semibold capitalize">{user.name}</p>
        <p className="text-xs text-primary">{user.role}</p>
        <button onClick={() => { logout(); nav({ to: "/", replace: true }); }}
          className="mt-3 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"><LogOut className="h-3 w-3" />Cerrar sesión</button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen w-full">
      <div className="sticky top-0 hidden h-screen lg:block">{side}</div>
      {open && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          {side}
          <button aria-label="Cerrar menú" className="flex-1 bg-background/70" onClick={() => setOpen(false)}><X className="ml-auto mr-4 h-5 w-5" /></button>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b px-4 lg:hidden">
          <button aria-label="Abrir menú" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
          <span className="font-display text-sm font-bold tracking-brand"><span className="text-primary">GYM</span> BLACK</span>
        </header>
        <main className="flex-1 p-4 md:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
