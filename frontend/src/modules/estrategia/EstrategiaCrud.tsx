import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { FactionsExplorer } from './components/FactionsExplorer';

interface Game {
  id: number;
  title: string;
  description: string | null;
  price: string;
  stock: number;
  image_url: string | null;
  subgenre: string | null;
}

interface FormState {
  title: string;
  description: string;
  price: string;
  stock: string;
  image_url: string;
  subgenre: string;
}

interface Props {
  endpoint: string;
  categoryName: string;
}

const emptyForm: FormState = {
  title: '',
  description: '',
  price: '',
  stock: '0',
  image_url: '',
  subgenre: '',
};

export function EstrategiaCrud({ endpoint, categoryName }: Props) {
  const [games, setGames] = useState<Game[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [factionsGame, setFactionsGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGames = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`Error ${res.status} al cargar los juegos`);
      const data: unknown = await res.json();
      // Soporta respuesta paginada ({ results: [] }) o lista simple
      if (Array.isArray(data)) {
        setGames(data as Game[]);
      } else if (
        typeof data === 'object' &&
        data !== null &&
        'results' in data &&
        Array.isArray(data.results)
      ) {
        setGames(data.results as Game[]);
      } else {
        setGames([]);
      }
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      price: form.price,
      stock: Number(form.stock),
      image_url: form.image_url.trim() || null,
      subgenre: form.subgenre.trim() || null,
    };

    const isEditing = editingId !== null;
    const url = isEditing ? `${endpoint}${editingId}/` : endpoint;

    try {
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const detail = await res.text();
        throw new Error(`No se pudo guardar (${res.status}): ${detail}`);
      }
      resetForm();
      await loadGames();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (game: Game) => {
    setEditingId(game.id);
    setForm({
      title: game.title,
      description: game.description ?? '',
      price: game.price,
      stock: String(game.stock),
      image_url: game.image_url ?? '',
      subgenre: game.subgenre ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (game: Game) => {
    if (!window.confirm(`¿Eliminar "${game.title}"?`)) return;
    try {
      const res = await fetch(`${endpoint}${game.id}/`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`No se pudo eliminar (${res.status})`);
      if (editingId === game.id) resetForm();
      await loadGames();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const closeFactions = useCallback(() => setFactionsGame(null), []);

  return (
    <section style={{ padding: '1rem', maxWidth: 960, margin: '0 auto' }}>
      <h2>{categoryName}</h2>

      {error && (
        <p role="alert" style={{ color: '#b00020' }}>
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: 'grid', gap: '0.5rem', marginBottom: '2rem' }}
      >
        <h3>{editingId !== null ? 'Editar juego' : 'Agregar juego'}</h3>

        <input
          placeholder="Título"
          value={form.title}
          onChange={(e) => handleChange('title', e.target.value)}
          required
          maxLength={150}
        />
        <textarea
          placeholder="Descripción"
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
        />
        <input
          type="number"
          placeholder="Precio"
          value={form.price}
          onChange={(e) => handleChange('price', e.target.value)}
          required
          min="0"
          step="0.01"
        />
        <input
          type="number"
          placeholder="Stock"
          value={form.stock}
          onChange={(e) => handleChange('stock', e.target.value)}
          required
          min="0"
          step="1"
        />
        <input
          type="url"
          placeholder="URL de portada"
          value={form.image_url}
          onChange={(e) => handleChange('image_url', e.target.value)}
        />
        <input
          placeholder="Subgénero (RTS, 4X, Tower Defense...)"
          value={form.subgenre}
          onChange={(e) => handleChange('subgenre', e.target.value)}
          maxLength={50}
        />

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : editingId !== null ? 'Actualizar' : 'Guardar'}
          </button>
          {editingId !== null && (
            <button type="button" onClick={resetForm}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p>Cargando...</p>
      ) : games.length === 0 ? (
        <p>No hay juegos registrados todavía.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          {games.map((game) => (
            <article
              key={game.id}
              style={{ border: '1px solid #ccc', borderRadius: 8, padding: '0.75rem' }}
            >
              {game.image_url && (
                <img
                  src={game.image_url}
                  alt={game.title}
                  style={{ width: '100%', borderRadius: 4 }}
                />
              )}
              <h4>{game.title}</h4>
              {game.subgenre && <small>{game.subgenre}</small>}
              {game.description && <p>{game.description}</p>}
              <p>
                <strong>${game.price}</strong> · Stock: {game.stock}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => setFactionsGame(game)}>
                  Ver facciones
                </button>
                <button type="button" onClick={() => handleEdit(game)}>
                  Editar
                </button>
                <button type="button" onClick={() => handleDelete(game)}>
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {factionsGame && (
        <FactionsExplorer
          endpoint={endpoint}
          gameId={factionsGame.id}
          gameTitle={factionsGame.title}
          onClose={closeFactions}
        />
      )}
    </section>
  );
}
