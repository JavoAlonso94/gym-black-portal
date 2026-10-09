import { Link, Outlet } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/gym-black-logo.jpg";
import { getTemplate } from "@/lib/website";
import { themeStyle, useWebsiteSettings } from "@/lib/website-customization";
export function WebsiteLayout({ id }: { id: string }) {
  const t = getTemplate(id);
  const settings = useWebsiteSettings(id);
  const [open, setOpen] = useState(false);
  if (!t) return null;
  const nav = <><Link to="/web/$plantilla" params={{ plantilla: id }} onClick={() => setOpen(false)}>Inicio</Link><Link to="/web/$plantilla/planes" params={{ plantilla: id }} onClick={() => setOpen(false)}>Planes</Link><Link to="/web/$plantilla/cocina" params={{ plantilla: id }} onClick={() => setOpen(false)}>Cocina fitness</Link><Link to="/web/$plantilla/contacto" params={{ plantilla: id }} onClick={() => setOpen(false)}>Contacto</Link></>;
  return <div className="website min-h-screen bg-background text-foreground" data-template={id} style={themeStyle(settings)}>
    <div className="border-b bg-muted px-5 py-2"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 text-xs"><Link to="/plantillas" className="flex items-center gap-2"><ArrowLeft className="size-3" /> Plantillas</Link><span>{t.name} · Vista previa</span><span className="text-muted-foreground">Contenido de demostración</span></div></div>
    <header className="relative z-10 border-b"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
      <Link to="/web/$plantilla" params={{ plantilla: id }} className="flex items-center gap-3"><img src={logo} alt="" width={56} height={48} className="h-12 w-14 rounded object-cover" /><span className="font-display text-lg font-bold">GYM BLACK</span></Link>
      <nav aria-label="Sitio Gym Black" className="hidden items-center gap-6 text-sm md:flex">{nav}</nav><div className="flex gap-2"><Button asChild variant="outline" className="hidden sm:inline-flex"><Link to="/">Acceso socios <ArrowUpRight /></Link></Button><Button variant="ghost" size="icon" aria-label={open ? "Cerrar navegación" : "Abrir navegación"} className="md:hidden" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button></div>
    </div>{open && <nav className="flex flex-col gap-5 border-t px-6 py-5 text-sm md:hidden" aria-label="Navegación móvil">{nav}<Link to="/">Acceso socios</Link></nav>}</header>
    <main><Outlet /></main>
    <footer className="border-t bg-muted px-5 py-10"><div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3"><div><h2 className="text-xl font-bold">GYM BLACK</h2><p className="mt-3 text-xs text-muted-foreground">DISCIPLINA · FUERZA · ENFOQUE · RESULTADOS</p></div><nav className="flex flex-wrap gap-5 text-sm">{nav}</nav><div className="text-sm text-muted-foreground">{settings.footerText}<p className="mt-2">© {new Date().getFullYear()} Gym Black</p></div></div></footer>
  </div>;
}
