import React, { useEffect, useState } from 'react';
import { GameCard } from '../../shared/components/GameCard';
import type { BaseGameItem } from './types';
interface ModuleCatalogProps {
  endpoint: string;
  categoryName: string;
}

export const ModuleCatalog: React.FC<ModuleCatalogProps> = ({ endpoint, categoryName }) => {
  const [items, setItems] = useState<BaseGameItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(endpoint)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: No se pudo consultar ${endpoint}`);
        }
        return res.json();
      })
      .then((data: BaseGameItem[]) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [endpoint]);

  if (loading) {
    return <div className="state-message">Cargando catálogo de {categoryName}...</div>;
  }

  if (error) {
    return (
      <div className="state-message error">
        <p>No se pudo conectar con el backend:</p>
        <code>{error}</code>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="state-message empty">
        <p>No hay títulos registrados aún en {categoryName}.</p>
      </div>
    );
  }

  return (
    <div className="catalog-grid">
      {items.map((item) => (
        <GameCard
          key={item.id}
          title={item.title}
          price={item.price}
          stock={item.stock}
          imageUrl={item.image_url}
          category={categoryName}
          description={item.description}
        />
      ))}
    </div>
  );
};