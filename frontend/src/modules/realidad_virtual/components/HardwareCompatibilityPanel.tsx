import { useState, type FormEvent } from 'react';

const HEADSETS = ['Quest 2', 'Quest 3'] as const;
const GPUS = ['NVIDIA RTX 3060', 'NVIDIA RTX 4090'] as const;
const COMPATIBILITY_LEVELS = ['alta', 'media', 'baja', 'incompatible'] as const;

type Headset = (typeof HEADSETS)[number];
type GPU = (typeof GPUS)[number];
type CompatibilityLevel = (typeof COMPATIBILITY_LEVELS)[number];

interface HardwareCompatibilityRequest {
  visor: Headset;
  gpu: GPU;
}

interface HardwareCompatibilityResponse {
  id: number;
  title: string;
  visor: Headset;
  gpu: GPU;
  compatible: boolean;
  compatibilidad: CompatibilityLevel;
  simulada: boolean;
  detalles: string;
}

interface HardwareCompatibilityPanelProps {
  gameId: number;
  gameTitle: string;
}

function isCompatibilityResponse(value: unknown): value is HardwareCompatibilityResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const response = value as Record<string, unknown>;
  return (
    typeof response.id === 'number' &&
    typeof response.title === 'string' &&
    HEADSETS.some((headset) => headset === response.visor) &&
    GPUS.some((gpu) => gpu === response.gpu) &&
    typeof response.compatible === 'boolean' &&
    COMPATIBILITY_LEVELS.some((level) => level === response.compatibilidad) &&
    typeof response.simulada === 'boolean' &&
    typeof response.detalles === 'string'
  );
}

function getValidationMessage(value: unknown): string | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const body = value as Record<string, unknown>;
  if (typeof body.detail === 'string') {
    return body.detail;
  }

  const messages = Object.values(body).flatMap((entry) => {
    if (typeof entry === 'string') {
      return [entry];
    }
    if (Array.isArray(entry)) {
      return entry.filter((message): message is string => typeof message === 'string');
    }
    return [];
  });

  return messages.length > 0 ? messages.join(' ') : null;
}

export function HardwareCompatibilityPanel({
  gameId,
  gameTitle,
}: HardwareCompatibilityPanelProps) {
  const [visor, setVisor] = useState<Headset>('Quest 3');
  const [gpu, setGpu] = useState<GPU>('NVIDIA RTX 4090');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HardwareCompatibilityResponse | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const payload: HardwareCompatibilityRequest = { visor, gpu };

    try {
      const response = await fetch(
        `/api/v1/realidad_virtual/${gameId}/check-hardware/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);
        throw new Error(
          getValidationMessage(body) ??
            `No se pudo comprobar el equipo (HTTP ${response.status}).`,
        );
      }

      const body: unknown = await response.json();
      if (!isCompatibilityResponse(body)) {
        throw new Error('El servidor devolvió una respuesta de compatibilidad no válida.');
      }

      setResult(body);
    } catch (caught: unknown) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Ocurrió un error inesperado al comprobar el equipo.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="vr-hardware-panel" aria-labelledby={`hardware-title-${gameId}`}>
      <h4 id={`hardware-title-${gameId}`}>Comprobar mi equipo</h4>
      <p className="vr-hardware-game">{gameTitle}</p>
      <form onSubmit={handleSubmit}>
        <label className="vr-hardware-field">
          Visor
          <select
            value={visor}
            onChange={(event) => setVisor(event.target.value as Headset)}
            disabled={loading}
          >
            {HEADSETS.map((headset) => (
              <option value={headset} key={headset}>
                {headset}
              </option>
            ))}
          </select>
        </label>
        <label className="vr-hardware-field">
          GPU
          <select
            value={gpu}
            onChange={(event) => setGpu(event.target.value as GPU)}
            disabled={loading}
          >
            {GPUS.map((option) => (
              <option value={option} key={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <button className="vr-hardware-submit" type="submit" disabled={loading}>
          {loading ? 'Comprobando…' : 'Comprobar compatibilidad'}
        </button>
      </form>

      {loading && (
        <p className="vr-hardware-status" role="status">
          Calculando el resultado simulado…
        </p>
      )}
      {error && (
        <p className="vr-hardware-status is-error" role="alert">
          {error}
        </p>
      )}
      {result && (
        <div
          className={`vr-hardware-result ${result.compatible ? 'is-compatible' : 'is-incompatible'}`}
          role="status"
          aria-live="polite"
        >
          <ul className="vr-hardware-checklist">
            <li>
              <span aria-hidden="true">{result.compatible ? '✓' : '✕'}</span>
              Combinación: {result.visor} + {result.gpu}
            </li>
          </ul>
          <strong>
            {result.compatible
              ? `Resultado: compatible (${result.compatibilidad})`
              : 'Resultado: combinación incompatible'}
          </strong>
          <p>{result.detalles}</p>
        </div>
      )}
    </section>
  );
}
