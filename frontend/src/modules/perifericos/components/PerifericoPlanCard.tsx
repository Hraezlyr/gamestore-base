import { useEffect, useState } from 'react';
import type { BaseGameItem } from '../types';

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

interface PerifericoPlanCardProps {
	item: BaseGameItem;
	apiBaseUrl?: string;
}

const PERIODICITIES = [1, 3, 12] as const;

const styles = `
.pc-card {
	background: #000; color: #fff; border: 1px solid #2a2a2a;
	border-radius: 14px; padding: 16px; font-size: 14px;
	display: flex; flex-direction: column; gap: 14px;
}
.pc-head { display: flex; gap: 14px; align-items: flex-start; }
.pc-img {
	width: 93px; height: 93px; flex: none; border-radius: 10px;
	background: #fff; object-fit: contain;
}
.pc-img-empty {
	display: flex; align-items: center; justify-content: center;
	color: #888; font-size: 12px;
}
.pc-title { margin: 0 0 4px; font-size: 17px; font-weight: 600; }
.pc-ref { margin: 0 0 6px; color: #d4d4d4; }
.pc-badge {
	display: inline-block; padding: 2px 8px; border-radius: 6px;
	background: #052e16; color: #4ade80; font-size: 12px; font-weight: 500;
}
.pc-divider { border: 0; border-top: 1px solid #2a2a2a; margin: 0; }
.pc-section { margin: 0; font-weight: 600; font-size: 15px; }
.pc-fieldset { border: 0; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.pc-legend { padding: 0; margin-bottom: 12px; color: #d4d4d4; }
.pc-radio { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.pc-radio input { width: 18px; height: 18px; margin: 0; accent-color: #fff; cursor: pointer; }
.pc-radio input:focus-visible { outline: 2px solid #4ade80; outline-offset: 2px; }
.pc-row { display: flex; justify-content: space-between; align-items: baseline; }
.pc-summary { display: flex; flex-direction: column; gap: 12px; }
.pc-save { color: #4ade80; font-weight: 600; }
.pc-total { font-weight: 700; }
.pc-total .pc-amount { font-size: 18px; }
.pc-msg { margin: 0; color: #d4d4d4; }
.pc-error { margin: 0; color: #f87171; }
`;

function money(value: string | number): string {
	return `$${Number(value).toFixed(2)}`;
}

function optionLabel(plan: PlanResult): string {
	const months = plan.periodicity === 1 ? '1 mes' : `${plan.periodicity} meses`;
	const discount =
		plan.discount_percentage > 0
			? `${plan.discount_percentage}% de descuento`
			: 'sin descuento';
	return `${months} — ${discount}`;
}

export default function PerifericoPlanCard({
	item,
	apiBaseUrl = '/api/v1',
}: PerifericoPlanCardProps) {
	const [selected, setSelected] = useState<number>(12);
	const [plans, setPlans] = useState<Record<number, PlanResult>>({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		let cancelled = false;

		async function loadPlans() {
			setLoading(true);
			setError('');

			try {
				const results = await Promise.all(
					PERIODICITIES.map(async (periodicity) => {
						const response = await fetch(
							`${apiBaseUrl}/perifericos/${item.id}/calculate-plan/`,
							{
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({ periodicity }),
							}
						);

						if (!response.ok) {
							throw new Error('No se pudo calcular el plan.');
						}

						return (await response.json()) as PlanResult;
					})
				);

				if (cancelled) return;

				const byPeriodicity: Record<number, PlanResult> = {};
				for (const plan of results) {
					byPeriodicity[plan.periodicity] = plan;
				}
				setPlans(byPeriodicity);
			} catch (err: unknown) {
				if (!cancelled) {
					setError(
						err instanceof Error
							? err.message
							: 'Ocurrió un error inesperado.'
					);
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		}

		loadPlans();

		return () => {
			cancelled = true;
		};
	}, [item.id, apiBaseUrl]);

	const current = plans[selected];
	const annual = plans[12];
	const radioName = `periodicity-${item.id}`;

	return (
		<article className="pc-card">
			<style>{styles}</style>

			<div className="pc-head">
				{item.image_url ? (
					<img className="pc-img" src={item.image_url} alt={item.title} />
				) : (
					<div className="pc-img pc-img-empty">Sin imagen</div>
				)}
				<div>
					<h3 className="pc-title">{item.title}</h3>
					<p className="pc-ref">
						Precio de referencia: {money(item.price)}/mes
					</p>
					{annual && annual.discount_percentage > 0 && (
						<span className="pc-badge">
							{annual.discount_percentage}% de descuento anual
						</span>
					)}
				</div>
			</div>

			<hr className="pc-divider" />

			<p className="pc-section">Calcula tu plan</p>

			{loading && <p className="pc-msg">Calculando planes...</p>}
			{error && (
				<p className="pc-error" role="alert">
					{error}
				</p>
			)}

			{!loading && !error && (
				<>
					<fieldset className="pc-fieldset">
						<legend className="pc-legend">
							Selecciona la periodicidad
						</legend>
						{PERIODICITIES.map((periodicity) => {
							const plan = plans[periodicity];
							if (!plan) return null;
							return (
								<label key={periodicity} className="pc-radio">
									<input
										type="radio"
										name={radioName}
										value={periodicity}
										checked={selected === periodicity}
										onChange={() => setSelected(periodicity)}
									/>
									{optionLabel(plan)}
								</label>
							);
						})}
					</fieldset>

					<hr className="pc-divider" />

					{current && (
						<div className="pc-summary" role="status">
							<div className="pc-row">
								<span>Subtotal</span>
								<strong>{money(current.subtotal)}</strong>
							</div>
							<div className="pc-row">
								<span>Ahorro</span>
								<span className="pc-save">
									{money(current.savings)}
								</span>
							</div>
							<div className="pc-row pc-total">
								<span>Precio final</span>
								<span className="pc-amount">
									{money(current.final_price)}
								</span>
							</div>
						</div>
					)}
				</>
			)}
		</article>
	);
}
