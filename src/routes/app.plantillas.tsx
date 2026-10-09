import { createFileRoute } from "@tanstack/react-router";
import { TemplateGallery } from "@/components/website/TemplateGallery";
import { websiteHead } from "@/lib/website";
export const Route = createFileRoute("/app/plantillas")({ head: () => websiteHead("Gestionar página web", "Elige y previsualiza las plantillas del sitio público de Gym Black."), component: () => <TemplateGallery embedded /> });
