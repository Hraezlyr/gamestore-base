import React, { useState, useEffect } from 'react';
import type { Move } from '../types';

interface MoveListAccordionProps {
  characterId: number;
}

export const MoveListAccordion: React.FC<MoveListAccordionProps> = ({ characterId }) => {
  const [moves, setMoves] = useState<Move[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [openMoveId, setOpenMoveId] = useState<number | null>(null);

  const fetchMoves = async (category: string) => {
    setLoading(true);
    setError(null);
    try {
      const query = category ? `?category=${category}` : '';
      const response = await fetch(`/api/v1/fighting/${characterId}/move-list/${query}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener los movimientos');
      }

      const data: Move[] = await response.json();
      setMoves(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado al cargar los movimientos');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (characterId) {
      fetchMoves(categoryFilter);
    }
  }, [characterId, categoryFilter]);

  const toggleAccordion = (id: number) => {
    setOpenMoveId(openMoveId === id ? null : id);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h3 style={{ color: '#ffffff', marginBottom: '16px' }}>Lista de Movimientos y Comandos</h3>

      {/* Selector de Categoría */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        {['', 'Normal', 'Especial', 'Super'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: categoryFilter === cat ? '#3b82f6' : '#27272a',
              color: '#ffffff',
              fontWeight: categoryFilter === cat ? 'bold' : 'normal',
            }}
          >
            {cat === '' ? 'Todos' : cat}
          </button>
        ))}
      </div>

      {/* Estado: Cargando */}
      {loading && <p style={{ color: '#a1a1aa' }}>Cargando lista de movimientos...</p>}

      {/* Estado: Error */}
      {error && (
        <div style={{ color: '#f87171', padding: '10px', border: '1px solid #f87171', borderRadius: '4px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Estado: Éxito con Lista Vacía */}
      {!loading && !error && moves.length === 0 && (
        <p style={{ color: '#a1a1aa' }}>No se encontraron movimientos registrados para esta categoría.</p>
      )}

      {/* Estado: Éxito / Renderizado de Acordeón */}
      {!loading && !error && moves.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {moves.map((move) => {
            const isOpen = openMoveId === move.id;
            return (
              <div key={move.id} style={{ border: '1px solid #3f3f46', borderRadius: '6px', overflow: 'hidden' }}>
                <div
                  onClick={() => toggleAccordion(move.id)}
                  style={{
                    backgroundColor: '#18181b',
                    padding: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: '#ffffff'
                  }}
                >
                  <span style={{ fontWeight: 'bold' }}>
                    [{move.category}] {move.name}
                  </span>
                  <span>{isOpen ? '▲' : '▼'}</span>
                </div>

                {isOpen && (
                  <div style={{ padding: '12px', backgroundColor: '#27272a', color: '#e4e4e7' }}>
                    <p style={{ margin: '4px 0' }}>
                      <strong>Comando de Teclas:</strong>{' '}
                      <code style={{ background: '#3f3f46', padding: '2px 6px', borderRadius: '4px', color: '#60a5fa' }}>
                        {move.input_command}
                      </code>
                    </p>
                    <p style={{ margin: '4px 0' }}>
                      <strong>Daño por Golpe:</strong> {move.damage} pts
                    </p>
                    {move.description && (
                      <p style={{ margin: '4px 0' }}>
                        <strong>Detalles:</strong> {move.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};