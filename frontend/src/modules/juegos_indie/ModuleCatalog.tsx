import React, { useEffect, useState } from 'react';
import { GameCard } from '../../shared/components/GameCard';
import type { BaseGameItem, SupportDevPayload, SupportDevResponse } from './types';

interface ModuleCatalogProps {
  endpoint?: string;
  categoryName?: string;
}

export const ModuleCatalog: React.FC<ModuleCatalogProps> = ({
  endpoint = '/api/v1/juegos_indie/',
  categoryName = 'Juegos Indie',
}) => {
  const [items, setItems] = useState<BaseGameItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para la acción interactiva de Support / Boost
  const [selectedGame, setSelectedGame] = useState<BaseGameItem | null>(null);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchItems = () => {
    setLoading(true);
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
  };

  useEffect(() => {
    fetchItems();
  }, [endpoint]);

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGame) return;

    setSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    const payload: SupportDevPayload = { comment };

    try {
      const res = await fetch(`/api/v1/juegos_indie/${selectedGame.id}/support-dev/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('No se pudo registrar el apoyo al desarrollador.');
      }

      const data: SupportDevResponse = await res.json();
      setActionSuccess(data.message);

      // Actualizar el estado local para reflejar los boosts dinámicamente
      setItems((prev) =>
        prev.map((item) =>
          item.id === selectedGame.id ? { ...item, boosts: data.boosts } : item
        )
      );

      setComment('');
      setTimeout(() => {
        setSelectedGame(null);
        setActionSuccess(null);
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError('Ocurrió un error inesperado al enviar el impulso.');
      }
    } finally {
      setSubmitting(false);
    }
  };

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
    <div className="p-4">
      <div className="catalog-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col justify-between shadow-md">
            <GameCard
              title={item.title || item.nombre || ''}
              price={item.price || item.precio || 0}
              stock={item.stock ?? 10}
              imageUrl={item.image_url}
              category={categoryName}
              description={item.description || item.descripcion}
            />

            <div className="mt-4 pt-3 border-t border-gray-700 flex items-center justify-between">
              <span className="text-yellow-400 font-bold text-sm">
                🚀 {item.boosts ?? 0} Boosts
              </span>
              <button
                onClick={() => setSelectedGame(item)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1.5 px-3 rounded text-sm transition"
              >
                Apoyar Dev 🚀
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal emergente interactivo de apoyo */}
      {selectedGame && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 text-white p-6 rounded-lg max-w-md w-full border border-purple-500 shadow-xl">
            <h3 className="text-xl font-bold mb-2">
              Apoyar a {selectedGame.title || selectedGame.nombre}
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Envía un impulso para destacar este proyecto indie y apoyar a sus creadores.
            </p>

            {actionSuccess && (
              <div className="mb-4 p-3 bg-green-600 text-white rounded text-sm font-medium">
                {actionSuccess}
              </div>
            )}

            {actionError && (
              <div className="mb-4 p-3 bg-red-600 text-white rounded text-sm font-medium">
                {actionError}
              </div>
            )}

            <form onSubmit={handleSupportSubmit}>
              <label className="block mb-2 text-xs font-semibold text-gray-300 uppercase">
                Mensaje de aliento (opcional):
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="¡Excelente trabajo! Sigan adelante."
                className="w-full p-2.5 rounded bg-gray-800 text-white border border-gray-700 mb-4 focus:outline-none focus:border-purple-500 text-sm"
                rows={3}
                disabled={submitting}
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGame(null);
                    setActionError(null);
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded text-sm disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Enviando...' : 'Enviar Boost 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleCatalog;