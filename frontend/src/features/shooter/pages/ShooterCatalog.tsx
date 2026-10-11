import { useState } from "react";
import { GameCard } from "../components/GameCard";
import { Pagination } from "../components/Pagination";
import { QueryError } from "../components/QueryError";
import { useShooterCatalog } from "../hooks/useShooterCatalog";
import { CatalogLoading } from "../components/CatalogLoading";

export function ShooterCatalog({ onSelect }: { onSelect: (id: number) => void }) {
  const [page, setPage] = useState(1);
  const { data, error, loading, retry } = useShooterCatalog(page);
  return (
    <section className="shooter-catalog">
      <header className="shooter-hero">
        <div>
          <p className="shooter-eyebrow">GameStore / Colección PC</p>
          <h1>Shooters para PC</h1>
          <p className="shooter-hero__headline">Tu próxima partida<br />empieza aquí.</p>
          <p className="shooter-hero__description">Explora el catálogo, compara precios por tienda y encuentra tu próximo juego.</p>
          <div className="shooter-hero__tags"><span>Solo PC</span><span>Precios en USD</span><span>Varias tiendas</span></div>
        </div>
        <div className="shooter-hero__mark" aria-hidden="true"><span>GS</span><small>READY TO PLAY</small></div>
      </header>
      <div className="shooter-section-heading"><h2>Explora el catálogo</h2>{data && <span>{data.count} {data.count === 1 ? "juego disponible" : "juegos disponibles"}</span>}</div>
      {loading && <CatalogLoading />}
      {error && <QueryError message={error} onRetry={retry} />}
      {data && <>
        {data.results.length === 0 ? <div className="shooter-empty"><h3>La próxima partida está por llegar</h3><p>No hay juegos disponibles en este momento.</p></div> :
          <div className="shooter-catalog__grid">
            {data.results.map(game => <GameCard key={game.id} game={game} onSelect={onSelect} />)}
          </div>}
      </>}
      <Pagination page={page} loading={loading} hasNext={Boolean(data?.next)} onChange={setPage} />
    </section>
  );
}
