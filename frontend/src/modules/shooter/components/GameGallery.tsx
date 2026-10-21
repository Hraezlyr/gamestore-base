import { lazy, Suspense, useState } from "react";
import { Expand } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { GameScreenshot } from "../types/catalog";
import { GameArtwork } from "./GameArtwork";

const GameLightbox = lazy(() => import("./GameLightbox"));

interface GameGalleryProps {
  title: string;
  cover: string;
  screenshots: GameScreenshot[];
}

export function GameGallery({ title, cover, screenshots }: GameGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [opened, setOpened] = useState(false);
  const reducedMotion = useReducedMotion();
  const sources = [...new Set([cover, ...screenshots.map(image => image.image_url)].filter(Boolean))];
  const slides = sources.map((src, index) => ({ src, alt: `${title} — ${src === cover ? "portada" : `captura ${index + (cover ? 0 : 1)}`}` }));
  const activeIndex = Math.min(selected, slides.length - 1);

  if (!slides.length) return <GameArtwork src="" />;

  return (
    <div className="shooter-gallery">
      <button className="shooter-gallery__preview" type="button" onClick={() => setOpened(true)} aria-label={`Ampliar imagen de ${title}`}>
        <motion.div key={sources[activeIndex]} initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reducedMotion ? 0 : 0.2 }}>
          <GameArtwork src={sources[activeIndex]} eager />
        </motion.div>
        <span className="shooter-gallery__expand"><Expand size={16} aria-hidden="true" /> Ampliar imagen</span>
      </button>
      {slides.length > 1 && <div className="shooter-gallery__thumbnails" role="group" aria-label="Imágenes del juego">
        {slides.map((slide, index) => <button type="button" key={slide.src} aria-label={`Mostrar ${slide.alt}`} aria-pressed={activeIndex === index} onClick={() => setSelected(index)}>
          <GameArtwork src={slide.src} />
        </button>)}
      </div>}
      <p className="shooter-muted">{slides.length} {slides.length === 1 ? "imagen" : "imágenes"} · {activeIndex + 1} / {slides.length}</p>
      {opened && <Suspense fallback={<p role="status">Abriendo galería…</p>}>
        <GameLightbox slides={slides} index={activeIndex} onClose={() => setOpened(false)} reducedMotion={Boolean(reducedMotion)} />
      </Suspense>}
    </div>
  );
}
