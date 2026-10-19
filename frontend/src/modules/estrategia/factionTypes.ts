/** Tipos del Sprint 2 (módulo estrategia): endpoint GET /{id}/factions/ */

export type PlayStyle = 'ofensivo' | 'defensivo' | 'economico';

/** 'todas' no se envía al backend: significa "sin filtro". */
export type StyleFilter = 'todas' | PlayStyle;

/** Parámetros de envío (query string) de la acción `factions`. */
export interface FactionsQuery {
  style?: PlayStyle;
}

export interface Faction {
  id: number;
  name: string;
  description: string;
  play_style: PlayStyle;
  play_style_display: string;
  advantages: string[];
  unique_units: string[];
}

/** Respuesta 200 del servidor. */
export interface FactionsResponse {
  game: number;
  style: PlayStyle | null;
  count: number;
  factions: Faction[];
}

/** Cuerpo de error del servidor (400 devuelve `style`, 404 devuelve `detail`). */
export interface ApiErrorBody {
  detail?: string;
  style?: string[];
}
