
import { useState } from 'react';

interface PlanResult {
    product_id: number;
    title: string;
    periodicity: number;
    monthly_price: string;
    subtotal: string;
    discount_percentage: number;
    savings: string;
    final_price: string;
}

interface CalculatePlanProps {
    productId: number;
    apiBaseUrl?: string;
}

export default function CalculatePlan({
    productId,
    apiBaseUrl = '/api/v1'
}: CalculatePlanProps) {
    const [periodicity, setPeriodicity] = useState<number>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<PlanResult | null>(null);

    async function calculatePlan() {
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await fetch(
                `${apiBaseUrl}/perifericos/${productId}/calculate-plan/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ periodicity })
                }
            );

            const data: unknown = await response.json();

            if (!response.ok) {
                const message =
                typeof data === 'object' &&
                data !== null &&
                'error' in data &&
                typeof data.error === 'string'
                ? data.error
                : 'No se pudo calcular el plan.';

                throw new Error(message);
            }

            setResult(data as PlanResult);
        } catch (err: unknown) {
            setError(
                err instanceof Error
                ? err.message
                : 'Ocurrio un error inesperado.'
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <section>
        <h3>Calcular plan de compra</h3>

        <label htmlFor="periodicity">Periodicidad:</label>
        <select
        id="periodicity"
        value={periodicity}
        onChange={(event) =>
            setPeriodicity(Number(event.target.value))
        }
        >
        <option value={1}>1 mes</option>
        <option value={3}>3 meses</option>
        <option value={12}>12 meses</option>
        </select>

        <button
        type="button"
        onClick={calculatePlan}
        disabled={loading}
        >
        {loading ? 'Calculando...' : 'Calcular'}
        </button>

        {error && <p role="alert">{error}</p>}

        {result && (
            <div role="status">
            <h4>{result.title}</h4>
            <p>Subtotal: ${result.subtotal}</p>
            <p>Descuento: {result.discount_percentage}%</p>
            <p>Ahorro total: ${result.savings}</p>
            <p>Precio final: ${result.final_price}</p>
            </div>
        )}
        </section>
    );
}
