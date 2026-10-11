import { useId, useState } from "react";
import type { FormEvent } from "react";
import { useFormSubmission } from "../hooks/useFormSubmission";
import type { AdminGame, GameInput } from "../types/admin";

interface GameFormProps {
  game: AdminGame | null;
  onSave: (input: GameInput) => Promise<void>;
  onCancel: () => void;
}

export function GameForm({ game, onSave, onCancel }: GameFormProps) {
  const id = useId();
  const [input, setInput] = useState<GameInput>({
    title: game?.title ?? "", description: game?.description ?? "", image_url: game?.image_url ?? "",
  });
  const { submitting, error, fields, submit } = useFormSubmission(onSave);

  function change(field: keyof GameInput, value: string) {
    setInput(current => ({ ...current, [field]: value }));
  }
  function fieldErrors(field: keyof GameInput) {
    return fields[field] && <p id={`${id}-${field}-error`}>{fields[field].join(" ")}</p>;
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submit({ ...input, title: input.title.trim() });
  }

  return (
    <section className="shooter-editor">
      <p className="shooter-eyebrow">Gestión del catálogo</p>
      <h1>{game ? "Editar juego" : "Nuevo juego"}</h1>
      {game?.rawg_id && <p>La sincronización puede actualizar el título y la imagen con los datos de origen.</p>}
      <form className="shooter-form" onSubmit={handleSubmit}>
        <fieldset disabled={submitting}>
          <legend>Datos del juego</legend>
          <label htmlFor={`${id}-title`}>Título</label>
          <input id={`${id}-title`} name="title" value={input.title} maxLength={255} required onChange={e => change("title", e.target.value)} aria-invalid={Boolean(fields.title)} aria-describedby={fields.title ? `${id}-title-error` : undefined} />
          {fieldErrors("title")}
          <label htmlFor={`${id}-description`}>Descripción</label>
          <textarea id={`${id}-description`} name="description" rows={5} value={input.description} onChange={e => change("description", e.target.value)} aria-invalid={Boolean(fields.description)} aria-describedby={fields.description ? `${id}-description-error` : undefined} />
          {fieldErrors("description")}
          <label htmlFor={`${id}-image_url`}>URL de imagen</label>
          <input id={`${id}-image_url`} name="image_url" type="url" maxLength={1000} value={input.image_url} onChange={e => change("image_url", e.target.value)} aria-invalid={Boolean(fields.image_url)} aria-describedby={fields.image_url ? `${id}-image_url-error` : undefined} />
          {fieldErrors("image_url")}
          <div className="shooter-actions">
            <button className="shooter-button--primary" type="submit">{submitting ? "Guardando…" : "Guardar juego"}</button>
            <button type="button" onClick={onCancel}>Cancelar</button>
          </div>
        </fieldset>
        {error && <p role="alert">{error}</p>}
      </form>
    </section>
  );
}
