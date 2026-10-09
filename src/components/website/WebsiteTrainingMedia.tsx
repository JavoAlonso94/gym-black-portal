import { useWebsiteSettings } from "@/lib/website-customization";
import strength from "@/assets/web-strength.jpg";
import conditioning from "@/assets/web-conditioning.jpg";
import community from "@/assets/web-community.jpg";
import strengthVideo from "@/assets/web-strength-video.mp4";
import cardioVideo from "@/assets/web-cardio-video.mp4";
import strengthWebm from "@/assets/web-strength-video.webm";
import cardioWebm from "@/assets/web-cardio-video.webm";
import strengthPoster from "@/assets/web-strength-poster.jpg";
import cardioPoster from "@/assets/web-cardio-poster.jpg";

const photos = [
  { image: strength, title: "Fuerza", alt: "Mujer realizando una sentadilla con mancuerna" },
  { image: conditioning, title: "Condición", alt: "Dos personas entrenando con cuerdas de batalla" },
  { image: community, title: "Equilibrio", alt: "Grupo de personas estirando sobre colchonetas" },
];
const videos = [
  { src: strengthVideo.url, webm: strengthWebm.url, poster: strengthPoster.url, title: "Entrenamiento de fuerza" },
  { src: cardioVideo.url, webm: cardioWebm.url, poster: cardioPoster.url, title: "Cardio en equipo" },
];

export function WebsiteTrainingMedia({ id }: { id: string }) {
  const settings = useWebsiteSettings(id);
  const customImages = [settings.strengthImage, settings.conditioningImage, settings.communityImage];
  return <section className="border-t px-6 py-14 md:py-16">
    <div className="mx-auto max-w-7xl">
      <p className="text-xs uppercase text-primary">Gym Black / En movimiento</p>
      <h2 className="mt-3 text-3xl font-bold">{settings.mediaTitle}</h2>
      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {photos.map((photo, index) => <figure key={photo.title}>
          <img src={customImages[index]} alt={photo.alt} loading="lazy" width={1536} height={1024} className="aspect-[3/2] w-full rounded-lg object-cover" />
          <figcaption className="mt-3 text-sm font-semibold">{photo.title}</figcaption>
        </figure>)}
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {videos.map(video => <figure key={video.title}>
          <video controls playsInline preload="none" poster={video.poster} aria-label={video.title} className="aspect-video w-full rounded-lg bg-muted object-contain">
            <source src={video.webm} type="video/webm" />
            <source src={video.src} type="video/mp4" />
            Tu navegador no admite este video.
          </video>
          <figcaption className="mt-3 text-sm font-semibold">{video.title}</figcaption>
        </figure>)}
      </div>
      <p className="mt-6 text-xs text-muted-foreground">Imágenes y videos ilustrativos generados con IA; no corresponden a las instalaciones ni a los socios de Gym Black.</p>
    </div>
  </section>;
}