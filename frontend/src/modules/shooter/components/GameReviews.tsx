import { useCallback, useState } from "react";
import { Star } from "lucide-react";
import { useApiQuery } from "../hooks/useApiQuery";
import { getGameReviews } from "../api/ratings";

export function GameReviews({ gameId }: { gameId: number }) {
  const [page, setPage] = useState(1);
  const loader = useCallback((signal: AbortSignal) => getGameReviews(gameId, page, signal), [gameId, page]);
  const { data, loading, error, retry } = useApiQuery(loader);

  return (
    <section className="shooter-reviews" aria-label="Reseñas de la comunidad" aria-busy={loading}>
      <h2>Reseñas de la comunidad</h2>
      {loading && <p>Cargando reseñas…</p>}
      {error && <p role="alert">{error} <button type="button" onClick={retry}>Reintentar reseñas</button></p>}
      {data && <>
        {data.count === 0 && <p>Todavía no hay reseñas. Comparte tu experiencia.</p>}
        <ul className="shooter-reviews__list">
          {data.results.map(review => <li key={review.id}>
            <article aria-label={`Reseña de ${review.author}`}>
              <header>
                <strong>{review.author}</strong>
                <span><Star size={18} aria-hidden="true" /> {review.score} de 5</span>
                <time dateTime={review.created_at}>{new Date(review.created_at).toLocaleDateString("es")}</time>
              </header>
              <p>{review.comment}</p>
            </article>
          </li>)}
        </ul>
        {(data.previous || data.next) && <nav className="shooter-actions" aria-label="Páginas de reseñas">
          <button type="button" disabled={!data.previous} onClick={() => setPage(page - 1)}>Reseñas anteriores</button>
          <span>Página {page}</span>
          <button type="button" disabled={!data.next} onClick={() => setPage(page + 1)}>Más reseñas</button>
        </nav>}
      </>}
    </section>
  );
}
