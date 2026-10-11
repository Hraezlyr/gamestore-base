import { useEffect, useState } from "react";

import { getShooterGame } from "./api";
import type { ShooterGameDetail } from "./types";

interface GameState {
    id: number;
    data: ShooterGameDetail | null;
    error: string | null;
}

export function useShooterGame(id: number) {
    const [state, setState] = useState<GameState | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        getShooterGame(id, controller.signal)
            .then((data) => {
                if (controller.signal.aborted) return;

                setState({ id, data, error: null });
            })
            .catch((error: unknown) => {
                if (controller.signal.aborted) return;

                setState({
                    id,
                    data: null,
                    error:
                        error instanceof Error
                            ? error.message
                            : "No se pudo cargar el juego.",
                });
            });

        return () => controller.abort();
    }, [id]);

    const currentState = state?.id === id ? state : null;

    return {
        game: currentState?.data ?? null,
        error: currentState?.error ?? null,
        loading: currentState === null,
    };
}