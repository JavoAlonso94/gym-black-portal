import { createFileRoute } from "@tanstack/react-router";
import { WebsiteHome } from "@/components/website/WebsitePages";
import { getTemplate, websiteHead } from "@/lib/website";
export const Route = createFileRoute("/web/$plantilla/")({ head: ({ params }) => websiteHead(`Inicio ${getTemplate(params.plantilla)?.name ?? "Gym Black"}`, "Entrena con propósito en Gym Black. Descubre membresías, entrenamiento personalizado y cocina fitness."), component: Page });
function Page() { return <WebsiteHome id={Route.useParams().plantilla} />; }
