export interface RatingPayload {
  score: number;
  comment: string;
}

export interface RatingSummary {
  rating_average: number | null;
  rating_count: number;
    user_rating: SavedRating | null;
}

export interface SavedRating extends RatingPayload {
  id: number;
  created_at: string;
}

export interface RatingUser {
  id: number;
  username: string;
}

export interface RatingResponse extends RatingSummary {
  rating: SavedRating;
}

export interface PublicReview extends SavedRating {
  author: string;
}

export interface ReviewPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: PublicReview[];
}
