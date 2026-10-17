export interface DLC {
  id: number;
  name: string;
  size_gb: number | string;
  is_installed: boolean;
}

export interface SimulationGame {
  id: number;
  title: string;
  description: string;
  price: string;
  stock: number;
  image_url: string;
  subgenre: string;
  dlcs: DLC[];
  total_installed_size_gb: number | string;
}

export interface ToggleDLCPayload {
  dlc_id: number;
}