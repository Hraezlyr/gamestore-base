import { useEffect, useState } from 'react';
import type {
  Faction,
  FactionsQuery,
  FactionsResponse,
  StyleFilter,
} from '../factionTypes';

interface Props {
  /** Ej.: "/api/v1/estrategia/" (con la barra final) */
  endpoint: string;
  gameId: number;
  gameTitle: string;
  onClose: () => void;
}

type Status = 'loading' | 'error' | 'success';

const TABS: { key: StyleFilter; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'ofensivo', label: 'Ofensivo' },
  { key: 'defensivo', label: 'Defensivo' },
  { key: 'economico', label: 'Económico' },
];

function buildUrl(endpoint: string, gameId: number, query: FactionsQuery): string {
  const params = new URLSearchParams();
  if (query.style) params.set('style', query.style);
  const qs = params.toString();
  return `${endpoint}${gameId}/factions/${qs ? `?${qs}` : ''}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFactionsResponse(value: unknown): value is FactionsResponse {
  return (
    isRecord(value) &&
    typeof value.count === 'number' &&
    Array.isArray(value.factions)
  );
}

/** Convierte la respuesta de error del backend en un mensaje legible. */
function readErrorMessage(body: unknown, httpStatus: number): string {
  if (httpStatus === 404) return 'Este juego no existe o fue eliminado (404).';
  if (isRecord(body)) {
    if (typeof body.detail === 'string') return body.detail;
    const styleErrors = body.style;
    if (Array.isArray(styleErrors) && typeof styleErrors[0] === 'string') {
      return styleErrors[0];
    }
  }
  return `El servidor respondió con error ${httpStatus}.`;
}

export function FactionsExplorer({ endpoint, gameId, gameTitle, onClose }: Props) {
  const [style, setStyle] = useState<StyleFilter>('todas');
  const [status, setStatus] = useState<Status>('loading');
  const [data, setData] = useState<FactionsResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  // Cargar facciones cada vez que cambia el filtro o se pide reintentar.
  useEffect(() => {
    const controller = new AbortController();
    const query: FactionsQuery = style === 'todas' ? {} : { style };

    const load = async () => {
      try {
        const res = await fetch(buildUrl(endpoint, gameId, query), {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        const body: unknown = await res.json().catch(() => null);
        if (!res.ok) throw new Error(readErrorMessage(body, res.status));
        if (!isFactionsResponse(body)) {
          throw new Error('La respuesta del servidor no tiene el formato esperado.');
        }
        setData(body);
        setStatus('success');
      } catch (e) {
        if (controller.signal.aborted) return; // cambió la pestaña: ignorar
        setErrorMsg(e instanceof Error ? e.message : 'Error desconocido');
        setStatus('error');
      }
    };

    load();
    return () => controller.abort();
  }, [endpoint, gameId, style, reloadKey]);

  // Cerrar con la tecla Esc.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const selectStyle = (next: StyleFilter) => {
    if (next === style) return;
    setStatus('loading');
    setStyle(next);
  };

  const retry = () => {
    setStatus('loading');
    setReloadKey((k) => k + 1);
  };

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 1000,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Facciones de ${gameTitle}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1c1c1c',
          color: '#f2f2f2',
          borderRadius: 10,
          width: 'min(760px, 100%)',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.25rem',
        }}
      >
        <header
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <h3 style={{ margin: 0 }}>Facciones · {gameTitle}</h3>
          <button type="button" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </header>

        <div
          role="tablist"
          aria-label="Filtrar por estilo de juego"
          style={{ display: 'flex', gap: '0.25rem', margin: '1rem 0', flexWrap: 'wrap' }}
        >
          {TABS.map((tab) => {
            const active = tab.key === style;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => selectStyle(tab.key)}
                style={{
                  padding: '0.4rem 0.9rem',
                  border: 'none',
                  borderBottom: active ? '3px solid #4da3ff' : '3px solid transparent',
                  background: active ? '#2a2a2a' : 'transparent',
                  color: 'inherit',
                  cursor: 'pointer',
                  fontWeight: active ? 700 : 400,
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div role="tabpanel">
          {status === 'loading' && <p role="status">Cargando facciones...</p>}

          {status === 'error' && (
            <div role="alert" style={{ color: '#ff6b6b' }}>
              <p>{errorMsg}</p>
              <button type="button" onClick={retry}>
                Reintentar
              </button>
            </div>
          )}

          {status === 'success' && data && (
            <>
              <p role="status" style={{ color: '#5fd38d', marginTop: 0 }}>
                ✓ {data.count} {data.count === 1 ? 'facción cargada' : 'facciones cargadas'}
              </p>

              {data.factions.length === 0 ? (
                <p>No hay facciones registradas para este estilo.</p>
              ) : (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {data.factions.map((faction) => (
                    <FactionCard key={faction.id} faction={faction} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FactionCard({ faction }: { faction: Faction }) {
  return (
    <article
      style={{ border: '1px solid #3a3a3a', borderRadius: 8, padding: '0.75rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
        <h4 style={{ margin: 0 }}>{faction.name}</h4>
        <span
          style={{
            background: '#2f4a6b',
            borderRadius: 12,
            padding: '0.1rem 0.6rem',
            fontSize: '0.8rem',
            whiteSpace: 'nowrap',
          }}
        >
          {faction.play_style_display}
        </span>
      </div>

      {faction.description && <p style={{ margin: '0.5rem 0' }}>{faction.description}</p>}

      {faction.advantages.length > 0 && (
        <>
          <strong>Ventajas</strong>
          <ul style={{ margin: '0.25rem 0 0.5rem 1.25rem' }}>
            {faction.advantages.map((adv) => (
              <li key={adv}>{adv}</li>
            ))}
          </ul>
        </>
      )}

      {faction.unique_units.length > 0 && (
        <>
          <strong>Unidades únicas</strong>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            {faction.unique_units.map((unit) => (
              <span
                key={unit}
                style={{
                  background: '#333',
                  borderRadius: 4,
                  padding: '0.1rem 0.5rem',
                  fontSize: '0.85rem',
                }}
              >
                {unit}
              </span>
            ))}
          </div>
        </>
      )}
    </article>
  );
}
