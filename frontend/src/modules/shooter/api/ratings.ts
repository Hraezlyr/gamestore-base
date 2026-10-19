import { HttpError } from "../api/errors";
import type { RatingPayload, RatingResponse, RatingSummary, RatingUser, ReviewPage } from "../types/rating";
import type { RegistrationPayload } from "../types/registration";

export function registerRatingAccount(input: RegistrationPayload): Promise<RatingUser> {
  return requestRatingJson("register/", { method: "POST", body: JSON.stringify(input) });
}

export function rateGame(id: number, input: RatingPayload, token: string): Promise<RatingResponse> {
  return requestRatingJson(`${id}/rate/`, {
    method: "POST",
    body: JSON.stringify(input),
  }, token);
}

export function getRatingSummary(id: number, signal?: AbortSignal, token?: string) {
  return requestRatingJson<RatingSummary>(`${id}/rate/`, { signal }, token);
}

export function getRatingAccount(token: string): Promise<RatingUser> {
  return requestRatingJson("account/", {}, token);
}

export function getGameReviews(id: number, page: number, signal: AbortSignal): Promise<ReviewPage> {
  return requestRatingJson(`${id}/reviews/?page=${page}`, { signal });
}

async function requestRatingJson<T>(path: string, options: RequestInit, token?: string): Promise<T> {
  const headers = new Headers({ Accept: "application/json" });
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`/api/v1/shooter/${path}`, {
    ...options,
    headers,
  });
  if (!response.ok) {
    const fields: Record<string, string[]> = {};
    const body: unknown = await response.json().catch(() => null);
    if (body && typeof body === "object") {
      for (const [field, value] of Object.entries(body)) {
        if (Array.isArray(value)) fields[field] = value.filter((item): item is string => typeof item === "string");
      }
    }
    const message = body && typeof body === "object" && "detail" in body && typeof body.detail === "string"
      ? body.detail
      : response.status === 400 ? "Revisa los campos del formulario."
      : response.status === 401 ? "Inicia sesión para calificar."
      : "No se pudieron consultar o guardar las calificaciones.";
    throw new HttpError(response.status, message, fields);
  }
  return response.json();
}
