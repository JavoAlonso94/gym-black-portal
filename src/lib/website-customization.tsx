import { createContext, useContext, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getTemplate, food, gym } from "@/lib/website";
import strength from "@/assets/web-strength.jpg";
import conditioning from "@/assets/web-conditioning.jpg";
import community from "@/assets/web-community.jpg";

export type WebsiteSettings = {
  headline: string; subtitle: string; eyebrow: string; plansButton: string; visitButton: string;
  introTitle: string; introText: string; mediaTitle: string; footerText: string;
  heroImage: string; introImage: string; strengthImage: string; conditioningImage: string; communityImage: string;
  primary: string; background: string; foreground: string;
};
export const IMAGE_KEYS = ["heroImage", "introImage", "strengthImage", "conditioningImage", "communityImage"] as const;
export function defaultSettings(id: string): WebsiteSettings {
  const t = getTemplate(id);
  return {
    headline: t?.headline ?? "GYM BLACK", subtitle: t?.subtitle ?? "", eyebrow: "Entrenamiento / Nutrición / Comunidad",
    plansButton: "Conoce los planes", visitButton: "Agenda tu visita",
    introTitle: "Tu entrenamiento no termina en la última repetición.",
    introText: "Haz de tu bienestar una rutina. Combina tu membresía con sesiones de entrenamiento y nuestra cocina fitness.",
    mediaTitle: "La energía se entrena.", footerText: "Entrenamiento, bienestar y nutrición.",
    heroImage: t?.image ?? strength, introImage: id === "balance" ? gym : food,
    strengthImage: strength, conditioningImage: conditioning, communityImage: community,
    primary: id === "performance" ? "#C6ED48" : id === "balance" ? "#286346" : "#D0AF55",
    background: id === "balance" ? "#F7FAF8" : "#141414", foreground: id === "balance" ? "#263E32" : "#F3F2ED",
  };
}
export function readableColor(hex: string) {
  const rgb = hex.replace("#", "").match(/.{2}/g)?.map(x => parseInt(x, 16)) ?? [0, 0, 0];
  return ((rgb[0] ?? 0) * 299 + (rgb[1] ?? 0) * 587 + (rgb[2] ?? 0) * 114) / 1000 > 150 ? "#141414" : "#FAFAFA";
}
export function themeStyle(settings: WebsiteSettings): CSSProperties {
  return {
    "--primary": settings.primary, "--ring": settings.primary, "--primary-foreground": readableColor(settings.primary),
    "--background": settings.background, "--foreground": settings.foreground,
    "--card": settings.background, "--card-foreground": settings.foreground,
    "--muted": `color-mix(in srgb, ${settings.background} 92%, ${settings.foreground})`,
    "--muted-foreground": `color-mix(in srgb, ${settings.foreground} 78%, ${settings.background})`,
    "--border": `color-mix(in srgb, ${settings.background} 75%, ${settings.foreground})`,
  } as CSSProperties;
}
function sanitizeSettings(id: string, raw: unknown): WebsiteSettings {
  const defaults = defaultSettings(id);
  if (!raw || typeof raw !== "object") return defaults;
  const values = raw as Record<string, unknown>;
  for (const key of Object.keys(defaults) as (keyof WebsiteSettings)[]) {
    const value = values[key];
    if (typeof value !== "string") continue;
    if (["primary", "background", "foreground"].includes(key)) {
      if (/^#[0-9a-f]{6}$/i.test(value)) defaults[key] = value;
    } else if ((IMAGE_KEYS as readonly string[]).includes(key)) {
      if (value.startsWith("storage:") || value.startsWith("/")) defaults[key] = value;
    } else defaults[key] = value.slice(0, 1200);
  }
  return defaults;
}
type DesignContext = {
  user: User | null; loading: boolean; error: string;
  designs: Record<string, WebsiteSettings>; imageUrls: Record<string, string>;
  apply: (id: string, settings: WebsiteSettings) => void;
  save: (id: string, settings: WebsiteSettings) => Promise<void>;
  upload: (id: string, file: File) => Promise<string>;
};
const Context = createContext<DesignContext | null>(null);
export function WebsiteCustomizationProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [designs, setDesigns] = useState<Record<string, WebsiteSettings>>({});
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  useEffect(() => {
    let active = true;
    let sequence = 0;
    async function load(next: User | null) {
      const current = ++sequence;
      setUser(next); setLoading(true); setError(""); setDesigns({}); setImageUrls({});
      if (!next) { setLoading(false); return; }
      const { data, error: readError } = await supabase.from("website_customizations").select("template_id, settings").eq("owner_id", next.id);
      if (!active || current !== sequence) return;
      if (readError) { setError("No se pudieron cargar tus diseños. Vuelve a abrir el editor para intentarlo."); setLoading(false); return; }
      const nextDesigns: Record<string, WebsiteSettings> = {};
      const urls: Record<string, string> = {};
      for (const row of data ?? []) {
        const settings = sanitizeSettings(row.template_id, row.settings);
        nextDesigns[row.template_id] = settings;
        for (const key of IMAGE_KEYS) {
          const path = settings[key];
          if (path.startsWith("storage:")) {
            const { data: signed } = await supabase.storage.from("website-images").createSignedUrl(path.slice(8), 86400);
            if (signed) urls[path] = signed.signedUrl;
          }
        }
      }
      if (active && current === sequence) { setDesigns(nextDesigns); setImageUrls(urls); setLoading(false); }
    }
    void supabase.auth.getUser().then(({ data }) => { if (active) void load(data.user); });
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) setTimeout(() => { if (active) void load(session?.user ?? null); }, 0);
    });
    return () => { active = false; subscription.subscription.unsubscribe(); };
  }, []);
  const apply = (id: string, settings: WebsiteSettings) => setDesigns(previous => ({ ...previous, [id]: settings }));
  async function save(id: string, settings: WebsiteSettings) {
    if (!user) throw new Error("Inicia sesión para guardar tu diseño.");
    const { error: saveError } = await supabase.from("website_customizations").upsert({ owner_id: user.id, template_id: id, settings, updated_at: new Date().toISOString() });
    if (saveError) throw new Error("No se pudo guardar el diseño. Tus cambios siguen en el editor.");
    apply(id, settings);
  }
  async function upload(id: string, file: File) {
    if (!user) throw new Error("Inicia sesión para subir tus fotos.");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error("Elige una imagen JPG, PNG o WebP de hasta 5 MB.");
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${user.id}/${id}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("website-images").upload(path, file);
    if (uploadError) throw new Error("No se pudo subir la imagen. Inténtalo de nuevo.");
    const { data, error: signError } = await supabase.storage.from("website-images").createSignedUrl(path, 86400);
    if (signError || !data) throw new Error("La foto se subió, pero no se pudo abrir su vista previa.");
    const value = `storage:${path}`;
    setImageUrls(previous => ({ ...previous, [value]: data.signedUrl }));
    return value;
  }
  return <Context.Provider value={{ user, loading, error, designs, imageUrls, apply, save, upload }}>{children}</Context.Provider>;
}
export function useWebsiteCustomization() {
  const context = useContext(Context);
  if (!context) throw new Error("Website customization provider missing");
  return context;
}
export function useWebsiteSettings(id: string) {
  const { designs, imageUrls } = useWebsiteCustomization();
  const settings = { ...(designs[id] ?? defaultSettings(id)) };
  for (const key of IMAGE_KEYS) if (settings[key].startsWith("storage:")) settings[key] = imageUrls[settings[key]] ?? defaultSettings(id)[key];
  return settings;
}