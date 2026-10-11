import { useState } from "react";

function ArtworkImage({ src, eager }: { src: string; eager: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <ArtworkPlaceholder />;
  return <img src={src} alt="" loading={eager ? "eager" : "lazy"} onError={() => setFailed(true)} />;
}

function ArtworkPlaceholder() {
  return <div className="shooter-artwork__placeholder" aria-hidden="true"><span>GS</span><span>SHOOTERS / PC</span></div>;
}

export function GameArtwork({ src, eager = false }: { src: string; eager?: boolean }) {
  return <div className="shooter-artwork">{src ? <ArtworkImage key={src} src={src} eager={eager} /> : <ArtworkPlaceholder />}</div>;
}
