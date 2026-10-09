import { createFileRoute, notFound } from "@tanstack/react-router";
import { WebsiteLayout } from "@/components/website/WebsiteLayout";
import { getTemplate } from "@/lib/website";
export const Route = createFileRoute("/web/$plantilla")({ beforeLoad: ({ params }) => { if (!getTemplate(params.plantilla)) throw notFound(); }, component: Layout });
function Layout() { const { plantilla } = Route.useParams(); return <WebsiteLayout id={plantilla} />; }
