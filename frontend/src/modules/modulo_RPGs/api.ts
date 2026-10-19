import type { BuildCalculatorPayload, BuildCalculatorResponse } from './types';

function extractErrorMessage(data: unknown, status: number): string {
  if (typeof data === 'object' && data !== null) {
    const messages = Object.values(data as Record<string, unknown>).flatMap((value) =>
      Array.isArray(value) ? value.map((item) => String(item)) : [String(value)],
    );
    if (messages.length > 0) {
      return messages.join(' ');
    }
  }
  return `Error ${status}: no se pudo calcular la build.`;
}

export async function calculateBuild(
  endpoint: string,
  gameId: number,
  payload: BuildCalculatorPayload,
): Promise<BuildCalculatorResponse> {
  const response = await fetch(`${endpoint}${gameId}/build-calculator/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(extractErrorMessage(data, response.status));
  }
  return data as BuildCalculatorResponse;
}
