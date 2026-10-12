import type { GameOffer } from "../types/catalog";
import { StoreOffer } from "./StoreOffer";
import "../styles/offers.css";

export function GameOffers({ offers, lowestPrice }: { offers: GameOffer[]; lowestPrice: string }) {
  return (
    <section className="shooter-game-offers" aria-label="Ofertas por tienda">
      <h2>Disponible en</h2>
      <ul className="shooter-store-offers">
        {offers.map(offer => (
          <li key={offer.id}>
            <StoreOffer offer={offer} isBestPrice={Number(offer.price) === Number(lowestPrice)} />
          </li>
        ))}
      </ul>
    </section>
  );
}
