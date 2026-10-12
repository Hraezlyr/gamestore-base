import { useCallback, useEffect, useState } from "react";

type QueryLoader<T> = (signal: AbortSignal) => Promise<T>;

interface QueryState<T> {
    loader: QueryLoader<T>;
    attempt: number;
    data: T | null;
    error: string | null;
}

export function useApiQuery<T>(loader: QueryLoader<T>) {
    const [attempt, setAttempt] = useState(0);
    const [state, setState] = useState<QueryState<T> | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        loader(controller.signal)
            .then((data) => {
                if (controller.signal.aborted) return;

                setState({ loader, attempt, data, error: null });
            })
            .catch((cause: unknown) => {
                if (controller.signal.aborted) return;

                setState({
                    loader,
                    attempt,
                    data: null,
                    error:
                        cause instanceof Error
                            ? cause.message
                            : "No se pudieron cargar los datos.",
                });
            });

        return () => controller.abort();
    }, [loader, attempt]);

    const retry = useCallback(() => {
        setAttempt((current) => current + 1);
    }, []);

    const currentState =
        state?.loader === loader && state.attempt === attempt
            ? state
            : null;

    return {
        data: currentState?.data ?? null,
        error: currentState?.error ?? null,
        loading: currentState === null,
        retry,
    };
}