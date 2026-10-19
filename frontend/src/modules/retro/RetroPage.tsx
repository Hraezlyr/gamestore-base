import React, { useEffect, useState } from 'react';
import type { RetroGame } from './types';
import { getRetroGames } from './api/retroApi';
import { RetroProgressCard } from './components/RetroProgressCard';

export const RetroPage: React.FC = () => {
  const [games, setGames] = useState<RetroGame[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRetroGames()
      .then((data) => setGames(data))
      .catch((err) => setError(err.message || 'Error al cargar los juegos'))
      .finally(() => setLoading(false));
  }, []);

  const handleProgressUpdated = (updatedGame: RetroGame) => {
    setGames((prevGames) =>
      prevGames.map((g) => (g.id === updatedGame.id ? updatedGame : g))
    );
  };

  if (loading) {
    return <div style={{ padding: '20px', color: '#fff' }}>Cargando juegos retro...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: '#ff5252' }}>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
      <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>
        🕹️ Módulo Retro - Seguimiento de Progreso
      </h2>

      {games.length === 0 ? (
        <p style={{ color: '#aaa', marginTop: '20px' }}>No hay juegos registrados en la base de datos.</p>
      ) : (
        games.map((game) => (
          <RetroProgressCard
            key={game.id}
            game={game}
            onProgressUpdated={handleProgressUpdated}
          />
        ))
      )}
    </div>
  );
};

export default RetroPage;
