import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

interface GameLightboxProps {
  slides: { src: string; alt: string }[];
  index: number;
  onClose: () => void;
  reducedMotion: boolean;
}

export default function GameLightbox({ slides, index, onClose, reducedMotion }: GameLightboxProps) {
  return <Lightbox
    open
    close={onClose}
    index={index}
    slides={slides}
    plugins={[Zoom]}
    carousel={{ finite: true }}
    animation={reducedMotion ? { fade: 0, swipe: 0, zoom: 0 } : undefined}
    labels={{ Close: "Cerrar galería", Next: "Imagen siguiente", Previous: "Imagen anterior", "Zoom in": "Ampliar imagen", "Zoom out": "Reducir imagen" }}
  />;
}
