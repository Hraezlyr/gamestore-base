import { formatPrice } from "../utils/formatters";
import { useShooterGame } from "../hooks/useShooterGame";
import { QueryError } from "../components/QueryError";
import { ArrowLeft } from "lucide-react";
import { AnimatedSection } from "../components/AnimatedSection";
import { GameGallery } from "../components/GameGallery";
import { GameOffers } from "../components/GameOffers";

interface GameDetailProps {
    id: number;
    onBack: () => void;
}

export function GameDetail({ id, onBack }: GameDetailProps) {
    const { game, error, loading, retry } = useShooterGame(id);

    return (
        <AnimatedSection className="shooter-game-detail">
            <button type="button" onClick={onBack}>
                <ArrowLeft size={16} aria-hidden="true" /> Volver al catálogo
            </button>

            {loading && <p role="status">Cargando juego…</p>}

            {error && <QueryError message={error} onRetry={retry} />}

            {game && (
                <>
                    <div className="shooter-game-detail__hero">
                        <GameGallery title={game.title} cover={game.image_url} screenshots={game.screenshots ?? []} />
                        <div className="shooter-game-detail__intro">
                            <p className="shooter-eyebrow">Shooter / PC</p>
                            <h1>{game.title}</h1>
                            <p className="shooter-game-detail__description">{game.description || "Compara las ofertas disponibles y elige dónde empezar tu próxima partida."}</p>
                            <div className="shooter-price"><span>Mejor precio disponible</span><strong>{formatPrice(game.lowest_price, game.currency)}</strong></div>
                            <p className="shooter-muted">{game.offers.length} {game.offers.length === 1 ? "oferta disponible" : "ofertas disponibles"} · Precios en USD</p>
                            <GameOffers offers={game.offers} lowestPrice={game.lowest_price} />
                        </div>
                    </div>

                </>
            )}
        </AnimatedSection>
    );
}
