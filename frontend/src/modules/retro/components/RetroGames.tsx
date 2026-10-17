import React, { useEffect, useState } from 'react';
import { getRetroGames, type RetroGame } from '../api/retroApi';

export const RetroGames: React.FC = () => {
  const [games, setGames] = useState<RetroGame[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getRetroGames()
      .then((data) => {
        setGames(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error al cargar los juegos retro:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Cargando catálogo retro...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Catálogo de Juegos Retro</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
        {games.map((game) => (
          <div key={game.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
            {game.image_url && (
              <img 
                src={game.image_url} 
                alt={game.title} 
                style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }} 
              />
            )}
            <h3>{game.title}</h3>
            <p>{game.description}</p>
            <p><strong>Subgénero:</strong> {game.subgenre}</p>
            <p><strong>Precio:</strong> ${game.price}</p>
            <p><strong>Stock:</strong> {game.stock}</p>
          </div>
        ))}
      </div>
    </div>
  );
};