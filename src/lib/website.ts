import { useSyncExternalStore } from "react";
import gym from "@/assets/web-gym.jpg";
import food from "@/assets/web-food.jpg";
import strength from "@/assets/web-strength.jpg";
import conditioning from "@/assets/web-conditioning.jpg";
import community from "@/assets/web-community.jpg";
export const TEMPLATES = [
  { id: "signature", name: "Black Signature", tag: "Premium · Fuerza", description: "Carbón, dorado y fotografía a gran escala.", headline: "GYM BLACK", subtitle: "Disciplina. Fuerza. Enfoque. Resultados.", image: strength },
  { id: "performance", name: "Black Performance", tag: "Deportivo · Intensidad", description: "Contraste eléctrico, titulares contundentes y ritmo deportivo.", headline: "GYM BLACK", subtitle: "Tu siguiente nivel empieza aquí.", image: conditioning },
  { id: "balance", name: "Black Balance", tag: "Wellness · Nutrición", description: "Luz, verde natural y una experiencia centrada en bienestar.", headline: "Gym Black", subtitle: "Entrena fuerte. Nutre tu equilibrio.", image: community },
] as const;
export function getTemplate(id: string) { return TEMPLATES.find(t => t.id === id); }
let selected = "signature";
const listeners = new Set<() => void>();
export function selectTemplate(id: string) { if (!getTemplate(id)) return; selected = id; listeners.forEach(f => f()); }
export function useSelectedTemplate() { return useSyncExternalStore(cb => { listeners.add(cb); return () => { listeners.delete(cb); }; }, () => selected, () => "signature"); }
export function websiteHead(title: string, description: string) { return { meta: [{ title: `${title} — Gym Black` }, { name: "description", content: description }, { property: "og:title", content: `${title} — Gym Black` }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }; }
export { gym, food };
