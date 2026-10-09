import { createFileRoute } from "@tanstack/react-router";
import { WebsitePlans } from "@/components/website/WebsitePages";
import { getTemplate, websiteHead } from "@/lib/website";
export const Route = createFileRoute("/web/$plantilla/planes")({ head: ({ params }) => websiteHead(`Planes ${getTemplate(params.plantilla)?.name ?? ""}`, "Explora membresías y paquetes Gym Black con entrenamiento, accesos y beneficios de cafetería."), component: Page });
function Page() { return <WebsitePlans id={Route.useParams().plantilla} />; }
