import { formatPrice } from "../utils/formatters";
import type { ShooterGameSummary } from "../types/catalog";
import { GameArtwork } from "./GameArtwork";

interface GameCardProps {
  game: ShooterGameSummary;
  onSelect: (id: number) => void;
}

export function GameCard({ game, onSelect }: GameCardProps) {
  return (
    <article className="shooter-game-card">
      <div className="shooter-game-card__cover">
        <GameArtwork src={game.image_url} />
        <span className="shooter-platform">PC</span>
      </div>
      <div className="shooter-game-card__body">
        <span className="shooter-eyebrow">Shooter</span>
        <h2>{game.title}</h2>
        <div className="shooter-game-card__bottom">
          <div className="shooter-price">
            <span>Desde</span>
            <strong>{formatPrice(game.lowest_price, game.currency)}</strong>
          </div>
          <button
            className="shooter-card-link"
            type="button"
            onClick={() => onSelect(game.id)}
            aria-label={`Ver detalles de ${game.title}`}
          >
            Ver detalles <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </article>
  );
}
