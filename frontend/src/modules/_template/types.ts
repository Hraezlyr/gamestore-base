export interface BaseGameItem {
  id: number;
  title: string;
  price: string | number;
  stock: number;
  image_url?: string;
  description?: string;
}