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
    store_icon_url: string;
    price: string;
    retail_price: string;
    currency: string;
    last_synced_at: string;
    purchase_url: string;
}

export interface ShooterGameDetail extends ShooterGameSummary {
    description: string;
    screenshots: GameScreenshot[];
    offers: GameOffer[];
}

export interface GameScreenshot {
    id: number;
    image_url: string;
}
