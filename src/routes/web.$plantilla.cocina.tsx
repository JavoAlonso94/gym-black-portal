import { createFileRoute } from "@tanstack/react-router";
import { WebsiteKitchen } from "@/components/website/WebsitePages";
import { getTemplate, websiteHead } from "@/lib/website";
export const Route = createFileRoute("/web/$plantilla/cocina")({ head: ({ params }) => websiteHead(`Cocina ${getTemplate(params.plantilla)?.name ?? ""}`, "Consulta smoothies, batidos de proteína, bowls y comidas saludables con sus macronutrientes en Gym Black."), component: Page });
function Page() { return <WebsiteKitchen id={Route.useParams().plantilla} />; }
