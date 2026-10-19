import React, { useState } from 'react';
import type { RetroGame } from '../types';
import { logProgress } from '../api/retroApi';

interface RetroProgressCardProps {
  game: RetroGame;
  onProgressUpdated: (updatedGame: RetroGame) => void;
}

export const RetroProgressCard: React.FC<RetroProgressCardProps> = ({ game, onProgressUpdated }) => {
  const [chapter, setChapter] = useState<number>(game.current_chapter || 0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updated = await logProgress(game.id, { chapter });
      onProgressUpdated(updated);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: '1px solid #333', borderRadius: '8px', padding: '16px', margin: '12px 0', background: '#1e1e1e', color: '#fff' }}>
      <h3 style={{ margin: '0 0 8px 0' }}>{game.title}</h3>
      <p style={{ margin: '4px 0', color: '#aaa' }}>
        Capítulo: {game.current_chapter} / {game.total_chapters}
      </p>

      {/* Barra de progreso */}
      <div style={{ background: '#444', borderRadius: '4px', height: '16px', overflow: 'hidden', margin: '10px 0' }}>
        <div 
          style={{ 
            width: `${game.progress_percentage}%`, 
            background: '#00e676', 
            height: '100%', 
            transition: 'width 0.4s ease' 
          }} 
        />
      </div>
      <p style={{ fontSize: '0.9em', color: '#00e676' }}>Progreso: {game.progress_percentage}%</p>

      <form onSubmit={handleSubmit} style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <label style={{ fontSize: '0.9em' }}>
          Capítulo actual:
          <input 
            type="number" 
            min="0" 
            max={game.total_chapters} 
            value={chapter} 
            onChange={(e) => setChapter(Number(e.target.value))}
            style={{ marginLeft: '8px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #555', width: '60px' }}
          />
        </label>
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '6px 12px', borderRadius: '4px', background: '#2196f3', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          {loading ? 'Guardando...' : 'Registrar'}
        </button>
      </form>

      {error && <p style={{ color: '#ff5252', marginTop: '8px', fontSize: '0.85em' }}>{error}</p>}
    </div>
  );
};
