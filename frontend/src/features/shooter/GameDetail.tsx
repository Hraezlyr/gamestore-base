import { formatPrice } from "./formatters";
import { useShooterGame } from "./useShooterGame";

interface GameDetailProps {
    id: number;
    onBack: () => void;
}

export function GameDetail({ id, onBack }: GameDetailProps) {
    const { game, error, loading } = useShooterGame(id);

    return (
        <section className="shooter-game-detail">
            <button type="button" onClick={onBack}>
                Volver al catálogo
            </button>

            {loading && <p role="status">Cargando juego…</p>}

            {error && <p role="alert">{error}</p>}

            {game && (
                <>
                    <h1>{game.title}</h1>

                    {game.image_url && (
                        <img
                            src={game.image_url}
                            alt=""
                            className="shooter-game-detail__image"
                        />
                    )}

                    {game.description && <p>{game.description}</p>}

                    <p>
                        Desde {formatPrice(game.lowest_price, game.currency)}
                    </p>

                    <div className="shooter-game-detail__offers">
                        <table>
                            <caption>Precios por tienda</caption>

                            <thead>
                                <tr>
                                    <th scope="col">Tienda</th>
                                    <th scope="col">Precio actual</th>
                                    <th scope="col">Precio regular</th>
                                    <th scope="col">Última sincronización</th>
                                </tr>
                            </thead>

                            <tbody>
                                {game.offers.map((offer) => (
                                    <tr key={offer.id}>
                                        <th scope="row">{offer.store_name}</th>
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
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </section>
    );
}