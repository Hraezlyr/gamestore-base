import { useCallback } from "react";
import { getShooterGames } from "../api/catalog";
import { useApiQuery } from "./useApiQuery";

export function useShooterCatalog(page: number) {
  const loader = useCallback((signal: AbortSignal) => getShooterGames(page, signal), [page]);
  return useApiQuery(loader);
}
