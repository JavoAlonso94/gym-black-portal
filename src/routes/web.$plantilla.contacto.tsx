import { createFileRoute } from "@tanstack/react-router";
import { WebsiteContact } from "@/components/website/WebsitePages";
import { getTemplate, websiteHead } from "@/lib/website";
export const Route = createFileRoute("/web/$plantilla/contacto")({ head: ({ params }) => websiteHead(`Contacto ${getTemplate(params.plantilla)?.name ?? ""}`, "Descubre cómo comenzar tu entrenamiento y solicita una visita de demostración en Gym Black."), component: WebsiteContact });
