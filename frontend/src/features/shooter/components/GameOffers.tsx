import { ArrowUpRight } from "lucide-react";
import type { GameOffer } from "../types/catalog";
import { formatPrice } from "../utils/formatters";
import { StoreIcon } from "./StoreIcon";

export function GameOffers({ offers, lowestPrice }: { offers: GameOffer[]; lowestPrice: string }) {
  return (
    <div className="shooter-game-detail__offers">
      <table>
        <caption>Precios por tienda</caption>
        <thead>
          <tr>
            <th scope="col">Tienda</th>
            <th scope="col">Precio actual</th>
            <th scope="col">Precio regular</th>
            <th scope="col">Última sincronización</th>
            <th scope="col">Oferta</th>
          </tr>
        </thead>
        <tbody>
          {offers.map(offer => {
            const isBestPrice = Number(offer.price) === Number(lowestPrice);
            return (
              <tr key={offer.id} className={isBestPrice ? "shooter-offer--best" : undefined}>
                <th scope="row">
                  <div className="shooter-store-name">
                    <StoreIcon src={offer.store_icon_url} />
                    <div>{offer.store_name}{isBestPrice && <span className="shooter-best-price">Mejor precio</span>}</div>
                  </div>
                </th>
                <td>{formatPrice(offer.price, offer.currency)}</td>
                <td>{formatPrice(offer.retail_price, offer.currency)}</td>
                <td>{new Date(offer.last_synced_at).toLocaleString("es-NI")}</td>
                <td>
                  <a className="shooter-purchase-link" href={offer.purchase_url} target="_blank" rel="noopener noreferrer" aria-label={`Ver oferta en ${offer.store_name}`}>
                    Ver oferta <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
