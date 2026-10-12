import { useState } from "react";
import { Store } from "lucide-react";

function StoreImage({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <Store size={20} aria-hidden="true" />;
  return <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} />;
}

export function StoreIcon({ src }: { src: string }) {
  return <span className="shooter-store-icon" aria-hidden="true">
    {src ? <StoreImage key={src} src={src} /> : <Store size={20} />}
  </span>;
}
