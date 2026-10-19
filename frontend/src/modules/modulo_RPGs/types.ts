export interface BaseGameItem {
  id: number;
  title: string;
  price: string | number;
  stock: number;
  image_url: string | null;
  description: string | null;
  subgenre: string | null;
  max_level: number;
  base_points: number;
  points_per_level: number;
}

export type AttributeKey = 'strength' | 'dexterity' | 'magic' | 'vitality';

export type BuildDistribution = Record<AttributeKey, number>;

export interface BuildCalculatorPayload extends BuildDistribution {
  target_level: number;
}

export interface BuildCalculatorResponse {
  game_id: number;
  target_level: number;
  total_points: number;
  spent_points: number;
  remaining_points: number;
  distribution: BuildDistribution;
}