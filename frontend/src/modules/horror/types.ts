export interface HorrorGameItem {
  id: number;
  title: string;
  price: string | number;
  stock: number;
  image_url?: string | null;
  description?: string | null;
  subgenre?: string | null;
}
