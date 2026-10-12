export interface AdminGame {
    id: number;
    title: string;
    description: string;
    image_url: string;
    rawg_id: number | null;
    cheapshark_id: string | null;
    steam_app_id: string;
    created_at: string;
    updated_at: string;
}

export interface GameInput {
    title: string;
    description: string;
    image_url: string;
}