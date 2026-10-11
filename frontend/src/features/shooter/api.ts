import type {
    PaginatedResponse,
    ShooterGameDetail,
    ShooterGameSummary,
} from "./types";

const BASE_URL = "/api/v1/shooter";

async function getJson<T>(
    path: string,
    signal?: AbortSignal,
): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
        headers: {
            Accept: "application/json",
        },
        signal,
    });

    if (!response.ok) {
        throw new Error(
            `No se pudo completar la consulta (HTTP ${response.status}).`,
        );
    }

    return response.json();
}

export function getShooterGames(
    page = 1,
    signal?: AbortSignal,
): Promise<PaginatedResponse<ShooterGameSummary>> {
    return getJson(`/games/?page=${page}`, signal);
}

export function getShooterGame(
    id: number,
    signal?: AbortSignal,
): Promise<ShooterGameDetail> {
    return getJson(`/games/${id}/`, signal);
}