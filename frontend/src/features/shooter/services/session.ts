import { HttpError } from "../api/errors";
import type { LoginCredentials, TokenPair, TokenRefreshResponse } from "../types/auth";

export interface SessionApi {
  login: (credentials: LoginCredentials) => Promise<TokenPair>;
  refresh: (token: string) => Promise<TokenRefreshResponse>;
  checkAccess: (token: string) => Promise<void>;
}

export class SessionManager {
  private tokens: TokenPair | null = null;
  private version = 0;
  private renewal: Promise<string> | null = null;
  private readonly api: SessionApi;
  private readonly onChange: (authenticated: boolean) => void;

  constructor(api: SessionApi, onChange: (authenticated: boolean) => void) {
    this.api = api;
    this.onChange = onChange;
  }

  async login(credentials: LoginCredentials): Promise<void> {
    const version = ++this.version;
    const tokens = await this.api.login(credentials);
    await this.api.checkAccess(tokens.access);
    if (version !== this.version) throw new Error("El inicio de sesión fue cancelado.");
    this.tokens = tokens;
    this.onChange(true);
  }

  logout(): void {
    this.version++;
    this.tokens = null;
    this.renewal = null;
    this.onChange(false);
  }

  private renew(): Promise<string> {
    if (this.renewal) return this.renewal;
    const tokens = this.tokens;
    if (!tokens) return Promise.reject(new Error("Inicia sesión para continuar."));
    const version = this.version;
    const pending = this.api.refresh(tokens.refresh).then(result => {
      if (version !== this.version) throw new Error("La sesión ha finalizado.");
      this.tokens = { access: result.access, refresh: result.refresh ?? tokens.refresh };
      return result.access;
    }).catch(error => {
      if (version === this.version && error instanceof HttpError && error.status === 401) this.logout();
      throw error;
    }).finally(() => {
      if (this.renewal === pending) this.renewal = null;
    });
    this.renewal = pending;
    return pending;
  }

  async request<T>(operation: (token: string) => Promise<T>, signal?: AbortSignal): Promise<T> {
    const tokens = this.tokens;
    if (!tokens) throw new Error("Inicia sesión para continuar.");
    signal?.throwIfAborted();
    const version = this.version;
    try {
      const result = await operation(tokens.access);
      if (version !== this.version) throw new Error("La sesión ha finalizado.");
      return result;
    } catch (error) {
      if (version !== this.version || !(error instanceof HttpError) || error.status !== 401) throw error;
      const access = this.tokens?.access !== tokens.access && this.tokens
        ? this.tokens.access : await this.renew();
      signal?.throwIfAborted();
      try {
        const result = await operation(access);
        if (version !== this.version) throw new Error("La sesión ha finalizado.", { cause: error });
        return result;
      } catch (retryError) {
        if (version === this.version && retryError instanceof HttpError && retryError.status === 401) this.logout();
        throw retryError;
      }
    }
  }
}
