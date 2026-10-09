import { useState } from "react";
import { TemplateEditor } from "./TemplateEditor";
import { defaultSettings, themeStyle, useWebsiteCustomization } from "@/lib/website-customization";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Check, Eye, LayoutTemplate } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TEMPLATES, selectTemplate, useSelectedTemplate } from "@/lib/website";
export function TemplateGallery({ embedded = false }: { embedded?: boolean }) {
  const selected = useSelectedTemplate();
  const [editing, setEditing] = useState<string | null>(null);
  const { designs, imageUrls } = useWebsiteCustomization();
  return <div className={embedded ? "" : "min-h-screen bg-background px-5 py-8 md:px-10"}>
    <div className="mx-auto max-w-7xl">
      {!embedded && <Button asChild variant="ghost" className="mb-8"><Link to="/"><ArrowLeft /> Volver al acceso</Link></Button>}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div><p className="mb-3 flex items-center gap-2 text-xs uppercase text-primary"><LayoutTemplate className="size-4" /> Gym Black / Página web</p><h1 className="text-3xl font-bold md:text-4xl">Una identidad. Tres estilos.</h1></div>
        <Button asChild variant="outline"><Link to="/web/$plantilla" params={{ plantilla: selected }}>Abrir sitio elegido <ArrowUpRight /></Link></Button>
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        {TEMPLATES.map((t, i) => { const settings = designs[t.id] ?? defaultSettings(t.id); return <article key={t.id} className="overflow-hidden rounded-lg border bg-card">
          <div className="website relative aspect-[4/3] overflow-hidden bg-background" data-template={t.id} style={themeStyle(settings)}>
            <img src={imageUrls[settings.heroImage] ?? settings.heroImage} alt={t.id === "balance" ? "Personas estirando después de entrenar" : "Personas entrenando en el gimnasio"} width={1536} height={1024} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-photo-shade/45" />
            <div className="relative flex h-full flex-col justify-between p-6 text-photo-foreground">
              <div className="flex items-center justify-between text-[10px] font-bold"><span>GYM BLACK</span><span>ENTRENA · NUTRE · SUPERA</span></div>
              <div><p className="mb-2 text-[10px] uppercase">{t.tag}</p><h2 className="break-words text-3xl font-extrabold">{settings.headline}</h2><p className="mt-2 max-w-56 break-words text-xs">{settings.subtitle}</p><span className="mt-4 inline-flex items-center gap-2 bg-primary px-3 py-2 text-[10px] font-semibold text-primary-foreground">Conoce nuestros planes <ArrowUpRight className="size-3" /></span></div>
              <div className="flex gap-5 text-[9px]"><span>FUERZA</span><span>NUTRICIÓN</span><span>COMUNIDAD</span></div>
            </div>
          </div>
          <div className="p-5"><div className="flex items-center justify-between gap-2"><h2 className="text-lg font-bold">{t.name}</h2><span className="text-xs text-muted-foreground">0{i + 1}</span></div><p className="mt-2 min-h-10 text-sm text-muted-foreground">{t.description}</p><p className="mt-4 border-t pt-3 text-xs text-muted-foreground">Inicio · Planes · Cocina · Contacto</p>
            <div className="mt-5 flex gap-2"><Button asChild variant="outline" className="flex-1"><Link to="/web/$plantilla" params={{ plantilla: t.id }}><Eye /> Vista previa</Link></Button><Button className="flex-1" variant={selected === t.id ? "secondary" : "default"} onClick={() => { selectTemplate(t.id); toast.success(`${t.name} elegida para esta sesión`); }}>{selected === t.id ? <><Check /> Elegida</> : "Elegir plantilla"}</Button></div>
            <Button variant="outline" className="mt-3 w-full" onClick={() => setEditing(t.id)}>Personalizar</Button>
          </div>
        </article>; })}
      </div>
      {editing && <TemplateEditor key={editing} id={editing} onClose={() => setEditing(null)} />}
    </div>
  </div>;
}
