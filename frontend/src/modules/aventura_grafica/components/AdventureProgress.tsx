import React, { useState } from 'react';

interface AdventureProps {
  adventureId: number;
  totalChapters: number;
  initialChapter: number;
}

interface ProgressResponse {
  message: string;
  current_chapter: number;
  progress_percentage: number;
}

export const AdventureProgress: React.FC<AdventureProps> = ({ adventureId, totalChapters, initialChapter }) => {
  const [chapter, setChapter] = useState<number>(initialChapter);
  const [progress, setProgress] = useState<number>((initialChapter / totalChapters) * 100);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpdateProgress = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/v1/aventura_grafica/${adventureId}/log-progress/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chapter }),
      });

      const data: ProgressResponse | { error: string } = await response.json();

      if (!response.ok) {
        throw new Error(('error' in data ? data.error : 'Error al actualizar el progreso'));
      }

      const successData = data as ProgressResponse;
      setProgress(successData.progress_percentage);
      setSuccess(`¡Progreso guardado! Avance: ${successData.progress_percentage}%`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error desconocido');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h3 className="text-lg font-bold mb-2">Progreso de la Aventura Gráfica</h3>
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div className="bg-blue-600 h-4 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="text-sm text-gray-600 mt-1">{progress.toFixed(1)}% completado</p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Capítulo:</label>
        <input
          type="number"
          min="0"
          max={totalChapters}
          value={chapter}
          onChange={(e) => setChapter(Number(e.target.value))}
          className="border p-2 rounded w-full"
        />
      </div>

      <button
        onClick={handleUpdateProgress}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Guardando...' : 'Registrar Progreso'}
      </button>

      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      {success && <p className="text-green-500 mt-2 text-sm">{success}</p>}
    </div>
  );
};