import { requestJson } from "./http";
import type {
    LoginCredentials,
    TokenPair,
    TokenRefreshResponse,
} from "../types/auth";


export function loginShooter(
    credentials: LoginCredentials,
    signal?: AbortSignal,
): Promise<TokenPair> {
    return requestJson("/auth/token/", {
        method: "POST",
        body: JSON.stringify(credentials),
        signal,
    });
}

export function refreshShooterToken(
    refresh: string,
    signal?: AbortSignal,
): Promise<TokenRefreshResponse> {
    return requestJson("/auth/token/refresh/", {
        method: "POST",
        body: JSON.stringify({ refresh }),
        signal,
    });
}