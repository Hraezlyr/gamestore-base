import { useRef, useState } from "react";
import { ArrowUpRight, Search, SlidersHorizontal } from "lucide-react";
import { GameCard } from "../components/GameCard";
import { Pagination } from "../components/Pagination";
import { QueryError } from "../components/QueryError";
import { CatalogLoading } from "../components/CatalogLoading";
import { AnimatedSection } from "../components/AnimatedSection";
import { useShooterCatalog } from "../hooks/useShooterCatalog";
import { formatPrice } from "../utils/formatters";

export function ShooterCatalog({ onSelect }: { onSelect: (id: number) => void }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState("title");
  const catalogRef = useRef<HTMLElement>(null);
  const { data, error, loading, retry } = useShooterCatalog(page);
  const games = data?.results ?? [];
  const featured = games.find(game => /counter|battlefield|doom|halo/i.test(game.title)) ?? games[0];
  const visible = games.filter(game => game.title.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))
    .sort((a, b) => order === "price"
      ? Number(a.lowest_price) - Number(b.lowest_price) || a.title.localeCompare(b.title)
      : a.title.localeCompare(b.title));

  return (
    <AnimatedSection className="shooter-catalog">
      <header className="vortex-hero">
        {featured?.image_url && <img className="vortex-hero__image" src={featured.image_url} alt="" fetchPriority="high" />}
        <div className="vortex-hero__copy">
          <p className="shooter-eyebrow">Tu próxima sesión empieza aquí</p>
          <h1>Shooters para PC</h1>
          <p className="vortex-hero__lead">Elige tu próximo reto.<br />Encuentra la mejor oferta.<br />Haz que cada partida cuente.</p>
          <div className="vortex-hero__actions">
            <button type="button" onClick={() => catalogRef.current?.scrollIntoView({
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
              block: "start",
            })}>Explorar catálogo <ArrowUpRight size={17} aria-hidden="true" /></button>
            {featured && <button className="vortex-hero__secondary" type="button"
              aria-label={`Ver juego destacado: ${featured.title}`} onClick={() => onSelect(featured.id)}>Ver destacado</button>}
          </div>
          <p className="vortex-hero__note">Juegos para PC · Precios en USD · Reseñas de la comunidad</p>
        </div>
        {featured && <div className="vortex-hero__caption">
          <span>En esta selección</span><strong>{featured.title}</strong>
          <span>Desde {formatPrice(featured.lowest_price, featured.currency)}</span>
        </div>}
      </header>

      <section ref={catalogRef} className="vortex-collection" aria-labelledby="shooter-collection-title">
        <div className="vortex-collection__heading">
          <div><p className="shooter-eyebrow">Encuentra tu siguiente favorito</p>
            <h2 id="shooter-collection-title">Explora el catálogo</h2>
            {data && <p className="vortex-collection__count">{data.count} {data.count === 1 ? "juego disponible" : "juegos disponibles"}</p>}
          </div>
          <div className="vortex-filters">
            <label className="vortex-search"><Search size={16} aria-hidden="true" />
              <span className="shooter-sr-only">Buscar en esta página</span>
              <input type="search" aria-label="Buscar en esta página" placeholder="Buscar en esta página" value={search} onChange={event => setSearch(event.target.value)} />
            </label>
            <label className="vortex-sort"><SlidersHorizontal size={15} aria-hidden="true" />
              <span className="shooter-sr-only">Ordenar juegos de esta página</span>
              <select aria-label="Ordenar juegos de esta página" value={order} onChange={event => setOrder(event.target.value)}>
                <option value="title">Nombre A–Z</option><option value="price">Menor precio</option>
              </select>
            </label>
          </div>
        </div>
        {loading && <CatalogLoading />}
        {error && <QueryError message={error} onRetry={retry} />}
        {data && (visible.length > 0
          ? <div className="shooter-catalog__grid">{visible.map(game => <GameCard key={game.id} game={game} onSelect={onSelect} />)}</div>
          : <div className="shooter-empty"><h3>{games.length ? "No hay coincidencias en esta página" : "La próxima partida está por llegar"}</h3>
            <p>{games.length ? "Prueba otro título o cambia de página." : "No hay juegos disponibles en este momento."}</p>
            {search && <button type="button" onClick={() => setSearch("")}>Limpiar búsqueda</button>}
          </div>)}
        <Pagination page={page} loading={loading} hasNext={Boolean(data?.next)} onChange={next => { setPage(next); setSearch(""); }} />
      </section>
    </AnimatedSection>
  );
}
