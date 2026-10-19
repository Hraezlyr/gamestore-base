export interface RetroGame {
  id: number;
  title: string;
  description?: string;
  price: number;
  total_chapters: number;
  current_chapter: number;
  progress_percentage: number;
}

export interface LogProgressPayload {
  chapter: number;
}
