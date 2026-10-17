export interface JuegoIndie {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string | number;
  boosts: number;
  title?: string;
  price?: string | number;
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