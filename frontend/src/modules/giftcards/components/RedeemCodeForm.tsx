import React, { useState } from 'react';
import type {
  RedeemCodeErrorResponse,
  RedeemCodePayload,
  RedeemCodeResponse,
  RedeemStatus,
} from './redeemTypes';
import './redeem-code.css';

interface RedeemCodeFormProps {
  endpoint: string;
}

const CODE_REGEX = /^[A-Z0-9]{4}-[A-Z0-9]{4}$/;

/** Formatea la entrada como XXXX-XXXX (mayúsculas, sin caracteres extra). */
export const formatCode = (raw: string): string => {
  const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  return clean.length > 4 ? `${clean.slice(0, 4)}-${clean.slice(4)}` : clean;
};

const buildRedeemUrl = (endpoint: string): string =>
  `${endpoint.replace(/\/+$/, '')}/redeem-code/`;

export const RedeemCodeForm: React.FC<RedeemCodeFormProps> = ({ endpoint }) => {
  const [code, setCode] = useState<string>('');
  const [status, setStatus] = useState<RedeemStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RedeemCodeResponse | null>(null);
  const [totalCredited, setTotalCredited] = useState<number>(0);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!CODE_REGEX.test(code)) {
      setStatus('error');
      setError('Ingresa un código con el formato XXXX-XXXX.');
      return;
    }

    const payload: RedeemCodePayload = { code };
    setStatus('loading');
    setError(null);
    setResult(null);

    try {
      const response = await fetch(buildRedeemUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as RedeemCodeErrorResponse;
        throw new Error(body.detail ?? body.code?.[0] ?? `Error HTTP ${response.status}`);
      }

      const data = (await response.json()) as RedeemCodeResponse;
      setResult(data);
      setTotalCredited((prev) => prev + Number(data.credited_amount));
      setStatus('success');
      setCode('');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'No se pudo canjear el código.');
    }
  };

  return (
    <section className="redeem-card" aria-label="Canjear código de regalo">
      <h3>Canjear código de regalo</h3>
      <form className="redeem-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="redeem-input"
          value={code}
          onChange={(e) => setCode(formatCode(e.target.value))}
          placeholder="XXXX-XXXX"
          maxLength={9}
          autoComplete="off"
          aria-label="Código de regalo"
          disabled={status === 'loading'}
        />
        <button type="submit" className="redeem-button" disabled={status === 'loading' || code.length === 0}>
          {status === 'loading' ? 'Canjeando...' : 'Canjear'}
        </button>
      </form>

      {status === 'error' && error && (
        <p className="redeem-feedback redeem-error" role="alert">
          {error}
        </p>
      )}

      {status === 'success' && result && (
        <p className="redeem-feedback redeem-success" role="status">
          {result.message} Saldo acreditado en esta sesión: ${totalCredited.toFixed(2)}
        </p>
      )}
    </section>
  );
};
