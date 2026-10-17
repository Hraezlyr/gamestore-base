import { useMemo } from "react";
import { createAdminGame, deleteAdminGame, updateAdminGame } from "../api/admin";
import type { SessionManager } from "../services/session";
import type { GameInput } from "../types/admin";

export function useAdminGameActions(request: SessionManager["request"]) {
  return useMemo(() => ({
    create: (input: GameInput) => request(token => createAdminGame(token, input)),
    update: (id: number, input: GameInput) => request(token => updateAdminGame(token, id, input)),
    remove: (id: number) => request(token => deleteAdminGame(token, id)),
  }), [request]);
}
