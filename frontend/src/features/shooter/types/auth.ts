export interface LoginCredentials {
    username: string;
    password: string;
}

export interface TokenPair {
    access: string;
    refresh: string;
}

export interface TokenRefreshResponse {
    access: string;
    refresh?: string;
}