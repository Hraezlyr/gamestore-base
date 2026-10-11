import { formatPrice } from "./formatters";
import type { ShooterGameSummary } from "./types";

interface GameCardProps {
    game: ShooterGameSummary;
    onSelect: (id: number) => void;
}

export function GameCard({ game, onSelect }: GameCardProps) {
    return (
        <article className="shooter-game-card">
            {game.image_url && (
                <img
                    src={game.image_url}
                    alt=""
                    loading="lazy"
                    className="shooter-game-card__image"
                />
            )}

            <h2>{game.title}</h2>

            <p>
                Desde {formatPrice(game.lowest_price, game.currency)}
            </p>

            <button
                type="button"
                onClick={() => onSelect(game.id)}
                aria-label={`Ver detalles de ${game.title}`}
            >
                Ver detalles
            </button>
        </article>
    );
}