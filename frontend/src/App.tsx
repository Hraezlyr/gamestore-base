import { useEffect, useState } from 'react'

interface HealthResponse {
  status?: string;
  detail?: string;
  [key: string]: unknown;
}

function App() {
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/health/')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Estado: ${res.status}`);
        }
        return res.json();
      })
      .then((data: HealthResponse) => {
        setHealthData(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ maxWidth: '600px', margin: '3rem auto', padding: '1.5rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>GameStore</h1>
      <h3 style={{ textAlign: 'center', color: '#666', marginTop: 0 }}>React + TypeScript + Docker</h3>
      
      <div style={{ marginTop: '2rem', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem' }}>
        <h4 style={{ margin: '0 0 1rem 0' }}>Estado del Backend (/api/v1/health/):</h4>

        {loading && <p style={{ color: '#0066cc' }}>Consultando endpoint...</p>}

        {error && (
          <div style={{ background: '#ffebee', color: '#c62828', padding: '1rem', borderRadius: '6px' }}>
            <strong>Error de conexión:</strong> {error}
          </div>
        )}

        {healthData && (
          <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '1rem', borderRadius: '6px' }}>
            <strong>Respuesta exitosa:</strong>
            <pre style={{ margin: '0.5rem 0 0 0', background: 'rgba(0,0,0,0.05)', padding: '0.5rem', borderRadius: '4px' }}>
              {JSON.stringify(healthData, null, 2)}
            </pre>
          </div>
        )}
      </div>
      <h1>Leandro Robelo</h1>
    </div>
  );
}

export default App;