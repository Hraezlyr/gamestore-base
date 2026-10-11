import { formatPrice } from "../utils/formatters";
import { useShooterGame } from "../hooks/useShooterGame";
import { QueryError } from "../components/QueryError";
import { GameArtwork } from "../components/GameArtwork";

interface GameDetailProps {
    id: number;
    onBack: () => void;
}

export function GameDetail({ id, onBack }: GameDetailProps) {
    const { game, error, loading, retry } = useShooterGame(id);

    return (
        <section className="shooter-game-detail">
            <button type="button" onClick={onBack}>
                Volver al catálogo
            </button>

            {loading && <p role="status">Cargando juego…</p>}

            {error && <QueryError message={error} onRetry={retry} />}

            {game && (
                <>
                    <div className="shooter-game-detail__hero">
                        <GameArtwork src={game.image_url} eager />
                        <div className="shooter-game-detail__intro">
                            <p className="shooter-eyebrow">Shooter / PC</p>
                            <h1>{game.title}</h1>
                            <p className="shooter-game-detail__description">{game.description || "Compara las ofertas disponibles y elige dónde empezar tu próxima partida."}</p>
                            <div className="shooter-price"><span>Mejor precio disponible</span><strong>{formatPrice(game.lowest_price, game.currency)}</strong></div>
                            <p className="shooter-muted">{game.offers.length} {game.offers.length === 1 ? "oferta disponible" : "ofertas disponibles"} · Precios en USD</p>
                        </div>
                    </div>

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
                                {game.offers.map((offer) => (
                                    <tr key={offer.id} className={Number(offer.price) === Number(game.lowest_price) ? "shooter-offer--best" : undefined}>
                                        <th scope="row">{offer.store_name}{Number(offer.price) === Number(game.lowest_price) && <span className="shooter-best-price">Mejor precio</span>}</th>
                                        <td>
                                            {formatPrice(offer.price, offer.currency)}
                                        </td>
                                        <td>
                                            {formatPrice(offer.retail_price, offer.currency)}
                                        </td>
                                        <td>
                                            {new Date(offer.last_synced_at).toLocaleString(
                                                "es-NI",
                                            )}
                                        </td>
                                        <td><a className="shooter-purchase-link" href={offer.purchase_url} target="_blank" rel="noopener noreferrer" aria-label={`Ver oferta en ${offer.store_name}`}>Ver oferta <span aria-hidden="true">↗</span></a></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="shooter-muted">La compra se realiza en la tienda seleccionada. Comprueba el precio y la disponibilidad antes de comprar.</p>
                </>
            )}
        </section>
    );
}
