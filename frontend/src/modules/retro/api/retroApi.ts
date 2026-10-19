import type { RetroGame, LogProgressPayload } from '../types';

const BASE_URL = '/api/v1/retro';

export const getRetroGames = async (): Promise<RetroGame[]> => {
  const response = await fetch(`${BASE_URL}/`);
  if (!response.ok) {
    throw new Error('Error al obtener la lista de juegos retro');
  }
  return response.json();
};

export const logProgress = async (
  gameId: number, 
  payload: LogProgressPayload
): Promise<RetroGame> => {
  const response = await fetch(`${BASE_URL}/${gameId}/log-progress/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al registrar el progreso');
  }

  return response.json();
};
