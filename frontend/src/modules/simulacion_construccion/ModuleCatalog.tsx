import { useState, useEffect } from 'react';
import type { SimulationGame, DLC, ToggleDLCPayload } from './types';

interface ModuleCatalogProps {
  endpoint: string;
  categoryName?: string;
}

export const ModuleCatalog = ({ endpoint }: ModuleCatalogProps) => {
  const [games, setGames] = useState<SimulationGame[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingDlcId, setTogglingDlcId] = useState<number | null>(null);

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.statusText}`);
      }
      const data = await response.json();
      setGames(Array.isArray(data) ? data : data.results || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar los juegos.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [endpoint]);

  const handleToggleDLC = async (gameId: number, dlcId: number) => {
    try {
      setTogglingDlcId(dlcId);
      const payload: ToggleDLCPayload = { dlc_id: dlcId };

      const response = await fetch(`${endpoint}${gameId}/toggle-dlc/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('No se pudo cambiar el estado del DLC.');
      }

      const updatedGame: SimulationGame = await response.json();

      setGames((prevGames: SimulationGame[]) =>
        prevGames.map((g: SimulationGame) => (g.id === gameId ? updatedGame : g))
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cambiar el estado del DLC.';
      alert(message);
    } finally {
      setTogglingDlcId(null);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando juegos y DLCs...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Módulo de Simulación - Gestión de DLCs</h2>
      {games.length === 0 ? (
        <p>No hay juegos registrados en la categoría.</p>
      ) : (
        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {games.map((game: SimulationGame) => (
            <div
              key={game.id}
              style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: '#1e1e1e',
                color: '#fff',
              }}
            >
              <h3>{game.title}</h3>
              <p>{game.description}</p>
              <p><strong>Subgénero:</strong> {game.subgenre || 'N/A'}</p>

              <div style={{ margin: '15px 0', padding: '10px', backgroundColor: '#2a2a2a', borderRadius: '6px' }}>
                <strong>Almacenamiento Total Usado:</strong>{' '}
                <span style={{ color: '#4caf50', fontSize: '1.1em' }}>
                  {Number(game.total_installed_size_gb || 0).toFixed(2)} GB
                </span>
              </div>

              <h4>Complementos (DLCs):</h4>
              {(!game.dlcs || game.dlcs.length === 0) ? (
                <p style={{ fontSize: '0.9em', color: '#888' }}>No hay DLCs disponibles para este juego.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {game.dlcs.map((dlc: DLC) => (
                    <li
                      key={dlc.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: '1px solid #333',
                      }}
                    >
                      <span>
                        {dlc.name} ({Number(dlc.size_gb).toFixed(2)} GB)
                      </span>
                      <button
                        onClick={() => handleToggleDLC(game.id, dlc.id)}
                        disabled={togglingDlcId === dlc.id}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: dlc.is_installed ? '#f44336' : '#2196F3',
                          color: '#fff',
                          fontWeight: 'bold',
                        }}
                      >
                        {togglingDlcId === dlc.id
                          ? 'Cargando...'
                          : dlc.is_installed
                          ? 'Desinstalar'
                          : 'Instalar'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};