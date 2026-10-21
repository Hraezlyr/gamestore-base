export type MoveCategory = 'Normal' | 'Especial' | 'Super';

export interface Move {
  id: number;
  name: string;
  category: MoveCategory;
  input_command: string;
  damage: number;
  description?: string;
}

export interface FightingCharacter {
  id: number;
  name: string;
  game_title: string;
  description: string;
}