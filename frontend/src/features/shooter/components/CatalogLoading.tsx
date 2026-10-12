export function CatalogLoading() {
  return <div role="status" aria-label="Cargando juegos">
    <span className="shooter-sr-only">Cargando juegos…</span>
    <div className="shooter-catalog__grid" aria-hidden="true">
      {Array.from({ length: 8 }, (_, index) => <div key={index} className="shooter-skeleton"><div /><span /><span /></div>)}
    </div>
  </div>;
}
