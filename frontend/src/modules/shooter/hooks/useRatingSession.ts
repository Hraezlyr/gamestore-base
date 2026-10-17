import { useCallback, useState } from "react";
import { SessionManager } from "../services/session";
import { loginShooter, refreshShooterToken } from "../api/auth";
import type { LoginCredentials } from "../types/auth";
import { getRatingAccount } from "../api/ratings";
import type { RatingUser } from "../types/rating";

export function useRatingSession() {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<RatingUser | null>(null);
  const [manager] = useState(() => new SessionManager({
    login: loginShooter,
    refresh: refreshShooterToken,
    checkAccess: async token => { setUser(await getRatingAccount(token)); },
  }, active => {
    setAuthenticated(active);
    if (!active) setUser(null);
  }));

  const login = useCallback((credentials: LoginCredentials) => manager.login(credentials), [manager]);
  const logout = useCallback(() => manager.logout(), [manager]);
  const request = useCallback(<T,>(operation: (token: string) => Promise<T>, signal?: AbortSignal) =>
    manager.request(operation, signal), [manager]);
  return { authenticated, user, login, logout, request };
}

export type RatingSession = ReturnType<typeof useRatingSession>;
