import { HttpError } from "./errors";

const BASE_URL = "/api/v1/shooter";

export async function requestJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body !== undefined) headers.set("Content-Type", "application/json");

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const messages: Record<number, string> = {
      400: "Revisa los campos del formulario.",
      401: "Usuario, contraseña o sesión no válidos.",
      403: "No tienes permisos de administración.",
      404: "El juego o la página ya no están disponibles.",
    };
    const fields: Record<string, string[]> = {};
    const body: unknown = await response.json().catch(() => null);
    if (body && typeof body === "object") {
      for (const [field, value] of Object.entries(body)) {
        if (Array.isArray(value)) fields[field] = value.filter((item): item is string => typeof item === "string");
      }
    }
    throw new HttpError(response.status, messages[response.status] ?? `No se pudo completar la solicitud (HTTP ${response.status}).`, fields);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}
