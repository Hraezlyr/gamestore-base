export interface BaseGameItem {
  id: number;
  nombre?: string;
  title?: string;
  descripcion?: string;
  description?: string;
  precio?: string | number;
  price?: string | number;
  stock?: number;
  image_url?: string;
  imageUrl?: string;
  boosts?: number;
}

export interface JuegoIndie extends BaseGameItem {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string | number;
  boosts: number;
  stock?: number;
}

export interface SupportDevPayload {
  comment?: string;
}

export interface SupportDevResponse {
  message: string;
  boosts: number;
  comment_received: string;
}