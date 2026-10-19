import { requestJson } from "./http";
import type { AdminGame, GameInput } from "../types/admin";
import type { PaginatedResponse } from "../types/pagination";

function authorization(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

export async function checkAdminAccess(accessToken: string): Promise<void> {
  await requestJson("/admin/games/?page_size=1", { headers: authorization(accessToken) });
}

export function getAdminGames(accessToken: string, page = 1, signal?: AbortSignal): Promise<PaginatedResponse<AdminGame>> {
  return requestJson(`/admin/games/?page=${page}`, { headers: authorization(accessToken), signal });
}

export function createAdminGame(accessToken: string, input: GameInput): Promise<AdminGame> {
  return requestJson("/admin/games/", { method: "POST", headers: authorization(accessToken), body: JSON.stringify(input) });
}

export function updateAdminGame(accessToken: string, id: number, input: GameInput): Promise<AdminGame> {
  return requestJson(`/admin/games/${id}/`, { method: "PATCH", headers: authorization(accessToken), body: JSON.stringify(input) });
}

export function deleteAdminGame(accessToken: string, id: number): Promise<void> {
  return requestJson(`/admin/games/${id}/`, { method: "DELETE", headers: authorization(accessToken) });
}
