import { useCallback, useState } from "react";
import { checkAdminAccess } from "../api/admin";
import { loginShooter, refreshShooterToken } from "../api/auth";
import { SessionManager } from "../services/session";
import type { LoginCredentials } from "../types/auth";

export function useShooterSession() {
  const [authenticated, setAuthenticated] = useState(false);
  const [manager] = useState(() => new SessionManager({
    login: loginShooter, refresh: refreshShooterToken, checkAccess: checkAdminAccess,
  }, setAuthenticated));

  const login = useCallback((credentials: LoginCredentials) => manager.login(credentials), [manager]);
  const logout = useCallback(() => manager.logout(), [manager]);
  const request = useCallback(<T,>(operation: (token: string) => Promise<T>, signal?: AbortSignal) =>
    manager.request(operation, signal), [manager]);
  return { authenticated, login, logout, request };
}
