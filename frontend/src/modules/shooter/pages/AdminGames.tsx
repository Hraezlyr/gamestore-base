import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AnimatedSection } from "../components/AnimatedSection";
import { DeleteGameDialog } from "../components/DeleteGameDialog";
import { GameForm } from "../components/GameForm";
import { Pagination } from "../components/Pagination";
import { QueryError } from "../components/QueryError";
import { useAdminGames } from "../hooks/useAdminGames";
import { useAdminGameActions } from "../hooks/useAdminGameActions";
import type { SessionManager } from "../services/session";
import type { AdminGame, GameInput } from "../types/admin";

interface AdminGamesProps {
  request: SessionManager["request"];
  onChanged: () => void;
}
type Editor = { kind: "create" } | { kind: "edit"; game: AdminGame };

export function AdminGames({ request, onChanged }: AdminGamesProps) {
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [deleting, setDeleting] = useState<AdminGame | null>(null);
  const [message, setMessage] = useState("");
  const { data, error, loading, retry } = useAdminGames(request, page);
  const actions = useAdminGameActions(request);

  async function save(input: GameInput) {
    if (editor?.kind === "edit") await actions.update(editor.game.id, input);
    else await actions.create(input);
    setEditor(null);
    setMessage("Juego guardado.");
    retry();
    onChanged();
  }
  async function remove() {
    if (!deleting) return;
    await actions.remove(deleting.id);
    setDeleting(null);
    setMessage("Juego eliminado.");
    if (page > 1 && data?.results.length === 1) setPage(page - 1);
    else retry();
    onChanged();
  }

  if (editor) return <GameForm key={editor.kind === "edit" ? editor.game.id : "new"} game={editor.kind === "edit" ? editor.game : null} onSave={save} onCancel={() => setEditor(null)} />;

  return (
    <AnimatedSection className="shooter-admin">
      <div className="shooter-section-heading"><div><p className="shooter-eyebrow">Gestión del catálogo</p><h1>Administración de juegos</h1></div>
      <button className="shooter-button--primary" type="button" onClick={() => setEditor({ kind: "create" })}><Plus size={16} aria-hidden="true" /> Nuevo juego</button></div>
      {message && <p className="shooter-notice shooter-notice--success" role="status">{message}</p>}
      {loading && <p role="status">Cargando juegos…</p>}
      {error && <QueryError message={error} onRetry={retry} />}
      {data && <>
        <p>{data.count} {data.count === 1 ? "juego registrado" : "juegos registrados"}</p>
        {data.results.length === 0 ? <p>No hay juegos registrados.</p> :
          <div className="shooter-table-wrapper"><table>
            <caption>Juegos registrados, incluidos los que no tienen ofertas</caption>
            <thead><tr><th scope="col">Título</th><th scope="col">Proveedor de precios</th><th scope="col">Acciones</th></tr></thead>
            <tbody>{data.results.map(game => <tr key={game.id}>
              <th scope="row">{game.title}</th>
              <td><span className={`shooter-status ${game.cheapshark_id ? "shooter-status--linked" : ""}`}>{game.cheapshark_id ? "Vinculado" : "Pendiente de vinculación"}</span></td>
              <td><div className="shooter-actions">
                <button type="button" aria-label={`Editar ${game.title}`} onClick={() => setEditor({ kind: "edit", game })}><Pencil size={14} aria-hidden="true" /> Editar</button>
                <button className="shooter-button--danger" type="button" aria-label={`Eliminar ${game.title}`} onClick={() => setDeleting(game)}><Trash2 size={14} aria-hidden="true" /> Eliminar</button>
              </div></td>
            </tr>)}</tbody>
          </table></div>}
      </>}
      <Pagination page={page} loading={loading} hasNext={Boolean(data?.next)} onChange={setPage} />
      {deleting && <DeleteGameDialog game={deleting} onDelete={remove} onCancel={() => setDeleting(null)} />}
    </AnimatedSection>
  );
}
