import { useEffect, useState } from "react";

import { ShooterPage } from "./features/shooter/pages/ShooterPage";

interface HealthResponse {
  status?: string;
  detail?: string;
  [key: string]: unknown;
}

function HealthPage() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/v1/health/", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        return response.json();
      })
      .then((result: HealthResponse) => {
        if (!controller.signal.aborted) setData(result);
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;

        setError(
          cause instanceof Error ? cause.message : "Error de conexión",
        );
      });

    return () => controller.abort();
  }, []);

  return (
    <main>
      <h1>GameStore</h1>
      <h2>Estado del backend</h2>

      {!data && !error && <p role="status">Consultando…</p>}
      {error && <p role="alert">{error}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </main>
  );
}

function App() {
  const path = window.location.pathname;

  if (path === "/shooter" || path === "/shooter/") {
    return <ShooterPage />;
  }

  return <HealthPage />;
}

export default App;