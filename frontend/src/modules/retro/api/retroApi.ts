import axios from 'axios';

// Definición de la interfaz para TypeScript
export interface RetroGame {
  id?: number;
  title: string;
  description: string;
  price: string;
  stock: number;
  image_url: string;
  subgenre: string;
}

const API_URL = 'http://localhost:8000/api/v1/retro/retro/';

export const getRetroGames = async (): Promise<RetroGame[]> => {
  const response = await axios.get<RetroGame[]>(API_URL);
  return response.data;
};

export const createRetroGame = async (gameData: Omit<RetroGame, 'id'>): Promise<RetroGame> => {
  const response = await axios.post<RetroGame>(API_URL, gameData);
  return response.data;
};
