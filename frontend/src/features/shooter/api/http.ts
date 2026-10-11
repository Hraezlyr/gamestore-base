const BASE_URL = "/api/v1/shooter";

export async function requestJson<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set("Accept", "application/json");

    if (options.body !== undefined) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const messages: Record<number, string> = {
            401: "Usuario, contraseña o sesión no válidos.",
            403: "No tienes permisos de administración.",
        };

        throw new Error(
            messages[response.status] ??
            `No se pudo completar la solicitud (HTTP ${response.status}).`,
        );
    }

    return response.json();
}