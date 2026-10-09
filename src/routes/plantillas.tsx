import { createFileRoute } from "@tanstack/react-router";
import { TemplateGallery } from "@/components/website/TemplateGallery";
import { websiteHead } from "@/lib/website";
export const Route = createFileRoute("/plantillas")({ head: () => websiteHead("Plantillas web", "Explora tres diseños completos para la página web de Gym Black: Signature, Performance y Balance."), component: TemplateGallery });
