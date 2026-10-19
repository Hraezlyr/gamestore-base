import { useState } from 'react';
import { calculateBuild } from '../api';
import type {
  AttributeKey,
  BaseGameItem,
  BuildCalculatorResponse,
  BuildDistribution,
} from '../types';
import './BuildCalculator.css';

interface BuildCalculatorProps {
  game: BaseGameItem;
  endpoint: string;
  onClose: () => void;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

const ATTRIBUTES: { key: AttributeKey; label: string }[] = [
  { key: 'strength', label: 'Fuerza' },
  { key: 'dexterity', label: 'Destreza' },
  { key: 'magic', label: 'Magia' },
  { key: 'vitality', label: 'Vitalidad' },
];

const EMPTY_DISTRIBUTION: BuildDistribution = {
  strength: 0,
  dexterity: 0,
  magic: 0,
  vitality: 0,
};

export const BuildCalculator = ({ game, endpoint, onClose }: BuildCalculatorProps) => {
  const [targetLevel, setTargetLevel] = useState<number>(Math.min(10, game.max_level));
  const [distribution, setDistribution] = useState<BuildDistribution>(EMPTY_DISTRIBUTION);
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<BuildCalculatorResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalPoints = game.base_points + (targetLevel - 1) * game.points_per_level;
  const spentPoints = ATTRIBUTES.reduce((sum, { key }) => sum + distribution[key], 0);
  const remainingPoints = totalPoints - spentPoints;

  const resetFeedback = () => {
    setStatus('idle');
    setResult(null);
    setErrorMessage(null);
  };

  const handleLevelChange = (value: number) => {
    setTargetLevel(value);
    resetFeedback();
  };

  const handleAttributeChange = (key: AttributeKey, value: number) => {
    setDistribution((current) => ({ ...current, [key]: value }));
    resetFeedback();
  };

  const handleCalculate = async () => {
    setStatus('loading');
    setResult(null);
    setErrorMessage(null);
    try {
      const response = await calculateBuild(endpoint, game.id, {
        target_level: targetLevel,
        ...distribution,
      });
      setResult(response);
      setStatus('success');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error inesperado.');
      setStatus('error');
    }
  };

  return (
    <div className="rpg-modal-overlay" onClick={onClose}>
      <div
        className="rpg-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Calculadora de build de ${game.title}`}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="rpg-modal-header">
          <h3>⚔️ Build: {game.title}</h3>
          <button type="button" className="rpg-modal-close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </header>

        <label className="rpg-field">
          <span>
            Nivel objetivo: <strong>{targetLevel}</strong> / {game.max_level}
          </span>
          <input
            type="range"
            min={1}
            max={game.max_level}
            value={targetLevel}
            onChange={(event) => handleLevelChange(Number(event.target.value))}
          />
        </label>

        <p className={`rpg-points ${remainingPoints < 0 ? 'rpg-points--over' : ''}`}>
          Puntos disponibles: {remainingPoints} de {totalPoints}
        </p>

        {ATTRIBUTES.map(({ key, label }) => (
          <label className="rpg-field" key={key}>
            <span>
              {label}: <strong>{distribution[key]}</strong>
            </span>
            <input
              type="range"
              min={0}
              max={distribution[key] + Math.max(remainingPoints, 0)}
              value={distribution[key]}
              onChange={(event) => handleAttributeChange(key, Number(event.target.value))}
            />
          </label>
        ))}

        <button
          type="button"
          className="rpg-calc-btn"
          onClick={handleCalculate}
          disabled={status === 'loading' || remainingPoints < 0}
        >
          {status === 'loading' ? 'Calculando...' : 'Calcular build'}
        </button>

        {status === 'loading' && <p className="rpg-feedback">Consultando al servidor...</p>}

        {status === 'error' && errorMessage && (
          <p className="rpg-feedback rpg-feedback--error" role="alert">
            {errorMessage}
          </p>
        )}

        {status === 'success' && result && (
          <p className="rpg-feedback rpg-feedback--success" role="status">
            ✅ Build válida para el nivel {result.target_level}: gastaste {result.spent_points} de{' '}
            {result.total_points} puntos y te sobran {result.remaining_points}.
          </p>
        )}
      </div>
    </div>
  );
};
