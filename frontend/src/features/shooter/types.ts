export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface ShooterGameSummary {
    id: number;
    title: string;
    image_url: string;
    lowest_price: string;
    currency: string;
}

export interface GameOffer {
    id: number;
    store_id: number;
    store_name: string;
    price: string;
    retail_price: string;
    currency: string;
    last_synced_at: string;
}

export interface ShooterGameDetail extends ShooterGameSummary {
    description: string;
    offers: GameOffer[];
}