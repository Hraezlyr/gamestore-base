import { useEffect, useState } from "react";

import { getShooterGames } from "./api";
import type { PaginatedResponse, ShooterGameSummary } from "./types";

interface CatalogState {
    page: number;
    data: PaginatedResponse<ShooterGameSummary> | null;
    error: string | null;
}

export function useShooterCatalog(page: number) {
    const [state, setState] = useState<CatalogState | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        getShooterGames(page, controller.signal)
            .then((data) => {
                if (controller.signal.aborted) return;

                setState({
                    page,
                    data,
                    error: null,
                });
            })
            .catch((error: unknown) => {
                if (controller.signal.aborted) return;

                setState({
                    page,
                    data: null,
                    error:
                        error instanceof Error
                            ? error.message
                            : "No se pudo cargar el catálogo.",
                });
            });

        return () => controller.abort();
    }, [page]);

    const currentState = state?.page === page ? state : null;

    return {
        data: currentState?.data ?? null,
        error: currentState?.error ?? null,
        loading: currentState === null,
    };
}