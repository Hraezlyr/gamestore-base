import steam from "../assets/stores/steam.svg";
import epic from "../assets/stores/epicgames.svg";
import gog from "../assets/stores/gogdotcom.svg";
import humble from "../assets/stores/humblebundle.svg";
import "../styles/store-icons.css";

const logos: Record<string, string> = {
  steam, epicgames: epic, epicgamesstore: epic,
  gog, gogcom: gog, humblestore: humble, humblebundle: humble,
};
const abbreviations: Record<string, string> = {
  wingamestore: "WGS", gamebillet: "GB", greenmangaming: "GMG",
  fanatical: "F", gamesplanet: "GP", gamersgate: "GG",
};

export function StoreIcon({ name, source }: { name: string; source: string }) {
  const key = name.toLocaleLowerCase().replace(/[^a-z0-9]/g, "");
  const src = /\.svg(?:[?#]|$)/i.test(source) ? source : logos[key];
  const initials = abbreviations[key] ?? name.trim().split(/\s+/).map(word => word[0]).join("").slice(0, 3).toUpperCase();
  return <span className="shooter-store-icon vortex-store-icon" aria-hidden="true">
    {src ? <img src={src} alt="" width={26} height={26} />
      : <span className="vortex-store-monogram">{initials || "PC"}</span>}
  </span>;
}
