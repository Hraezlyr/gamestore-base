import { useState } from "react";

import { GameCard } from "./GameCard";
import { useShooterCatalog } from "./useShooterCatalog";

interface ShooterCatalogProps {
    onSelect: (id: number) => void;
}

export function ShooterCatalog({ onSelect }: ShooterCatalogProps) {
    const [page, setPage] = useState(1);
    const { data, error, loading } = useShooterCatalog(page);

    return (
        <section className="shooter-catalog">
            <h1>Shooters para PC</h1>

            {loading && <p role="status">Cargando juegos…</p>}

            {error && <p role="alert">{error}</p>}

            {data && (
                <>
                    <p>{data.count} juegos disponibles</p>

                    {data.results.length === 0 ? (
                        <p>No hay juegos disponibles en este momento.</p>
                    ) : (
                        <div className="shooter-catalog__grid">
                            {data.results.map((game) => (
                                <GameCard
                                    key={game.id}
                                    game={game}
                                    onSelect={onSelect}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            <nav aria-label="Páginas del catálogo">
                <button
                    type="button"
                    disabled={loading || page === 1}
                    onClick={() => setPage((current) => current - 1)}
                >
                    Anterior
                </button>

                <span>Página {page}</span>

                <button
                    type="button"
                    disabled={loading || !data?.next}
                    onClick={() => setPage((current) => current + 1)}
                >
                    Siguiente
                </button>
            </nav>
        </section>
    );
}