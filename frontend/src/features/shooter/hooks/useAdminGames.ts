import { useCallback } from "react";
import { getAdminGames } from "../api/admin";
import type { SessionManager } from "../services/session";
import { useApiQuery } from "./useApiQuery";

export function useAdminGames(request: SessionManager["request"], page: number) {
  const loader = useCallback(
    (signal: AbortSignal) => request(token => getAdminGames(token, page, signal), signal),
    [request, page],
  );
  return useApiQuery(loader);
}
