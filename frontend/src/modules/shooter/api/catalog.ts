import { requestJson } from "./http";
import type { PaginatedResponse } from "../types/pagination";
import type {
    ShooterGameDetail,
    ShooterGameSummary,
} from "../types/catalog";


export function getShooterGames(
    page = 1,
    signal?: AbortSignal,
): Promise<PaginatedResponse<ShooterGameSummary>> {
    return requestJson(`/games/?page=${page}`, { signal });
}

export function getShooterGame(
    id: number,
    signal?: AbortSignal,
): Promise<ShooterGameDetail> {
    return requestJson(`/games/${id}/`, { signal });
}
