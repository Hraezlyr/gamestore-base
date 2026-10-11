import { useEffect, useRef } from "react";
import { useFormSubmission } from "../hooks/useFormSubmission";
import type { AdminGame } from "../types/admin";

export function DeleteGameDialog({ game, onDelete, onCancel }: {
  game: AdminGame;
  onDelete: () => Promise<void>;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const { submitting, error, submit } = useFormSubmission(onDelete);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog ref={ref} className="shooter-delete-dialog" aria-labelledby="delete-game-title" onCancel={event => {
      event.preventDefault();
      if (!submitting) onCancel();
    }}>
      <h2 id="delete-game-title">Eliminar {game.title}</h2>
      <p>Se eliminarán el juego y sus ofertas.</p>
      {game.rawg_id && <p>Una futura importación puede volver a añadir este juego.</p>}
      {error && <p role="alert">{error}</p>}
      <div className="shooter-actions">
        <button className="shooter-button--danger" type="button" disabled={submitting} onClick={() => { void submit(undefined); }}>{submitting ? "Eliminando…" : "Confirmar eliminación"}</button>
        <button type="button" disabled={submitting} onClick={onCancel} autoFocus>Cancelar</button>
      </div>
    </dialog>
  );
}
