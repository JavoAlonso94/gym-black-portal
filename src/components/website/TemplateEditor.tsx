import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Eye, RotateCcw, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { getTemplate } from "@/lib/website";
import { defaultSettings, themeStyle, useWebsiteCustomization, type WebsiteSettings } from "@/lib/website-customization";

const textFields = [
  ["headline", "Título principal"], ["subtitle", "Subtítulo"], ["eyebrow", "Texto superior"],
  ["plansButton", "Botón de planes"], ["visitButton", "Botón de visita"], ["introTitle", "Título de bienvenida"],
  ["introText", "Texto de bienvenida"], ["mediaTitle", "Título de fotos y videos"], ["footerText", "Texto del pie de página"],
] as const;
const imageFields = [["heroImage", "Foto principal"], ["introImage", "Foto de bienvenida"], ["strengthImage", "Foto de fuerza"], ["conditioningImage", "Foto de condición"], ["communityImage", "Foto de equilibrio"]] as const;

export function TemplateEditor({ id, onClose }: { id: string; onClose: () => void }) {
  const context = useWebsiteCustomization();
  const [draft, setDraft] = useState<WebsiteSettings>(() => context.designs[id] ?? defaultSettings(id));
  const [tab, setTab] = useState("Textos");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signup, setSignup] = useState(false);
  const [dirty, setDirty] = useState(false);
  const set = (key: keyof WebsiteSettings, value: string) => { setDraft(previous => ({ ...previous, [key]: value })); setDirty(true); setNotice(""); };
  async function auth() {
    setBusy(true); setNotice("");
    const result = signup
      ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/plantillas` } })
      : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (result.error) setNotice(result.error.message);
    else if (signup && !result.data.session) setNotice("Revisa tu correo y confirma tu cuenta; después inicia sesión aquí.");
  }
  async function save() {
    setBusy(true); setNotice("");
    try { await context.save(id, draft); setDirty(false); setNotice("Diseño guardado en tu cuenta."); toast.success("Diseño guardado"); }
    catch (error) { setNotice(error instanceof Error ? error.message : "No se pudo guardar."); }
    finally { setBusy(false); }
  }
  const hero = context.imageUrls[draft.heroImage] ?? draft.heroImage;
  return <Dialog open onOpenChange={open => { if (!open && (!dirty || window.confirm("¿Cerrar sin guardar los cambios?"))) onClose(); }}>
    <DialogContent className="max-h-[92svh] max-w-6xl overflow-y-auto">
      <DialogHeader><DialogTitle>Personalizar {getTemplate(id)?.name}</DialogTitle><DialogDescription>{context.user ? "Tu diseño personal" : "Vista previa de tu diseño"}</DialogDescription></DialogHeader>
      <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="min-w-0">
          <div className="mb-6 flex gap-2" role="tablist" aria-label="Personalización">{["Textos", "Imágenes", "Colores"].map(t => <Button key={t} role="tab" aria-selected={tab === t} variant={tab === t ? "default" : "outline"} onClick={() => setTab(t)}>{t}</Button>)}</div>
          <div className="space-y-4">
            {tab === "Textos" && textFields.map(([key, label]) => <div key={key} className="space-y-2"><Label htmlFor={`edit-${key}`}>{label}</Label><Textarea id={`edit-${key}`} value={draft[key]} maxLength={key === "introText" ? 1200 : 250} onChange={e => set(key, e.target.value)} /></div>)}
            {tab === "Imágenes" && imageFields.map(([key, label]) => <div key={key} className="space-y-2 border-b pb-4"><Label htmlFor={`edit-${key}`}>{label}</Label><img src={context.imageUrls[draft[key]] ?? draft[key]} alt={label} className="aspect-[3/2] w-full rounded object-cover" /><div className="flex items-center gap-3"><Upload className="size-4 shrink-0 text-primary" /><Input id={`edit-${key}`} type="file" accept="image/jpeg,image/png,image/webp" disabled={busy || !context.user} onChange={async e => { const file = e.target.files?.[0]; if (!file) return; setBusy(true); try { set(key, await context.upload(id, file)); } catch (error) { setNotice(error instanceof Error ? error.message : "No se pudo subir."); } finally { setBusy(false); } }} /></div></div>)}
            {tab === "Colores" && ([["primary", "Color de acento"], ["background", "Color de fondo"], ["foreground", "Color de texto"]] as const).map(([key, label]) => <div key={key} className="flex items-center justify-between gap-4 border-b py-3"><Label htmlFor={`edit-${key}`}>{label}</Label><Input id={`edit-${key}`} type="color" className="h-11 w-16 cursor-pointer p-1" value={draft[key]} onChange={e => set(key, e.target.value)} /></div>)}
          </div>
        </div>
        <div className="min-w-0 lg:sticky lg:top-0 lg:self-start">
          <div className="website overflow-hidden rounded-lg border bg-background text-foreground" data-template={id} style={themeStyle(draft)}>
            <div className="relative flex min-h-80 items-end overflow-hidden p-6"><img src={hero} alt="Vista previa de la foto principal" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-photo-shade/60" /><div className="relative min-w-0 text-photo-foreground"><p className="text-xs break-words">{draft.eyebrow}</p><h2 className="mt-4 break-words text-3xl font-bold">{draft.headline}</h2><p className="mt-3 break-words">{draft.subtitle}</p><div className="mt-5 flex flex-wrap gap-2"><span className="rounded bg-primary px-3 py-2 text-sm break-words text-primary-foreground">{draft.plansButton}</span><span className="rounded border px-3 py-2 text-sm break-words">{draft.visitButton}</span></div></div></div>
            <div className="p-6"><h3 className="break-words text-xl font-bold">{draft.introTitle}</h3><p className="mt-3 break-words text-sm text-muted-foreground">{draft.introText}</p><h3 className="mt-6 break-words font-semibold">{draft.mediaTitle}</h3><p className="mt-5 border-t pt-4 break-words text-xs text-muted-foreground">{draft.footerText}</p></div>
          </div>
          {!context.user && <form className="mt-6 space-y-3 border-t pt-5" onSubmit={e => { e.preventDefault(); void auth(); }}><h3 className="font-semibold">{signup ? "Crear cuenta para guardar" : "Inicia sesión para guardar y subir fotos"}</h3><Label htmlFor="design-email">Correo electrónico</Label><Input id="design-email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required /><Label htmlFor="design-password">Contraseña</Label><Input id="design-password" type="password" autoComplete={signup ? "new-password" : "current-password"} minLength={8} value={password} onChange={e => setPassword(e.target.value)} required /><div className="flex flex-wrap gap-2"><Button type="submit" disabled={busy}>{signup ? "Crear cuenta" : "Iniciar sesión"}</Button><Button type="button" variant="outline" disabled={busy} onClick={async () => { setBusy(true); try { const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/plantillas` }); if (result.error) setNotice(result.error.message); } finally { setBusy(false); } }}>Continuar con Google</Button><Button type="button" variant="ghost" onClick={() => setSignup(!signup)}>{signup ? "Ya tengo cuenta" : "Crear cuenta"}</Button></div></form>}
          <div className="mt-5 flex flex-wrap gap-2"><Button disabled={busy || !context.user || context.loading || !!context.error} onClick={() => void save()}><Save />{busy ? "Guardando…" : "Guardar cambios"}</Button><Button asChild variant="outline"><Link to="/web/$plantilla" params={{ plantilla: id }} onClick={() => { context.apply(id, draft); onClose(); }}><Eye />Previsualizar sitio</Link></Button><Button variant="ghost" size="icon" aria-label="Restaurar diseño original" title="Restaurar diseño original" disabled={busy} onClick={() => { if (window.confirm("¿Restaurar los textos, imágenes y colores originales?")) { setDraft(defaultSettings(id)); setDirty(true); } }}><RotateCcw /></Button></div>
          <p role="status" className="mt-3 text-sm text-muted-foreground">{notice || context.error || (context.loading ? "Cargando tu cuenta…" : dirty ? "Cambios sin guardar" : "")}</p>
        </div>
      </div>
    </DialogContent>
  </Dialog>;
}