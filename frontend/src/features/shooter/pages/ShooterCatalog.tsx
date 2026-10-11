import { useState } from "react";
import { GameCard } from "../components/GameCard";
import { Pagination } from "../components/Pagination";
import { QueryError } from "../components/QueryError";
import { useShooterCatalog } from "../hooks/useShooterCatalog";

export function ShooterCatalog({ onSelect }: { onSelect: (id: number) => void }) {
  const [page, setPage] = useState(1);
  const { data, error, loading, retry } = useShooterCatalog(page);
  return (
    <section className="shooter-catalog">
      <h1>Shooters para PC</h1>
      {loading && <p role="status">Cargando juegos…</p>}
      {error && <QueryError message={error} onRetry={retry} />}
      {data && <>
        <p>{data.count} juegos disponibles</p>
        {data.results.length === 0 ? <p>No hay juegos disponibles en este momento.</p> :
          <div className="shooter-catalog__grid">
            {data.results.map(game => <GameCard key={game.id} game={game} onSelect={onSelect} />)}
          </div>}
      </>}
      <Pagination page={page} loading={loading} hasNext={Boolean(data?.next)} onChange={setPage} />
    </section>
  );
}
