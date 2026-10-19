import { useCallback } from "react";
import { getShooterGame } from "../api/catalog";
import { useApiQuery } from "./useApiQuery";

export function useShooterGame(id: number) {
  const loader = useCallback((signal: AbortSignal) => getShooterGame(id, signal), [id]);
  const { data, ...query } = useApiQuery(loader);
  return { game: data, ...query };
}
