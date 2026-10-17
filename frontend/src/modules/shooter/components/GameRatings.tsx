import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Star, X } from "lucide-react";
import { useFormSubmission } from "../hooks/useFormSubmission";
import { useApiQuery } from "../hooks/useApiQuery";
import { getRatingSummary, rateGame } from "../api/ratings";
import type { RatingPayload, RatingSummary } from "../types/rating";
import type { RatingSession } from "../hooks/useRatingSession";
import { RatingAccountDialog } from "./RatingAccountDialog";
import "../styles/ratings.css";

export function GameRatings({ gameId, title, session, onRated }: {
  gameId: number;
  title: string;
  session: RatingSession;
  onRated: () => void;
}) {
  const { authenticated, request } = session;
  const loadSummary = useCallback((signal: AbortSignal) => authenticated
    ? request(token => getRatingSummary(gameId, signal, token), signal)
    : getRatingSummary(gameId, signal), [gameId, authenticated, request]);
  const { data, loading, error, retry } = useApiQuery(loadSummary);
  const [savedSummary, setSummary] = useState<RatingSummary | null>(null);
  const summary = savedSummary ?? data;
  const [open, setOpen] = useState(false);
  const [accountMode, setAccountMode] = useState<"login" | "register" | null>(null);
  const [success, setSuccess] = useState(false);
  const openerRef = useRef<HTMLButtonElement>(null);

  function closeDialog() {
    setOpen(false);
    openerRef.current?.focus();
  }

  return (
    <section className="shooter-ratings" aria-label="Calificaciones de la comunidad">
      <p aria-live="polite">
        <Star size={18} aria-hidden="true" />
        {loading && !summary ? "Cargando calificaciones…" : error && !summary ? "Calificaciones no disponibles" : summary && summary.rating_count > 0 && summary.rating_average !== null
          ? `${summary.rating_average.toFixed(1)} de 5 · ${summary.rating_count} ${summary.rating_count === 1 ? "calificación" : "calificaciones"}`
          : "Sin calificaciones todavía"}
      </p>
      {error && !summary && <p role="alert">{error} <button type="button" onClick={retry}>Reintentar calificaciones</button></p>}
      {authenticated ? <>
        <p>Sesión: {session.user?.username} <button type="button" onClick={session.logout}>Cerrar sesión</button></p>
        {summary?.user_rating ? <div>
          <p>Ya calificaste este juego. Tu calificación: {summary.user_rating.score} de 5.</p>
          <p>{summary.user_rating.comment}</p>
        </div> : <button ref={openerRef} type="button" disabled={loading || !summary}
          onClick={() => { setSuccess(false); setOpen(true); }}>Calificar juego</button>}
      </> : <div className="shooter-actions">
        <button ref={openerRef} type="button" onClick={() => setAccountMode("login")}>Iniciar sesión para calificar</button>
      </div>}
      {success && <p role="status">¡Gracias! Tu reseña se guardó y el promedio está actualizado.</p>}
      {accountMode && <RatingAccountDialog initialMode={accountMode} onClose={() => setAccountMode(null)} onLogin={async credentials => {
        await session.login(credentials);
        setAccountMode(null);
      }} />}
      {open && <RatingDialog title={title} onClose={closeDialog} onSave={async input => {
        const response = await session.request(token => rateGame(gameId, input, token));
        setSummary(response);
        onRated();
        setSuccess(true);
        closeDialog();
      }} />}
    </section>
  );
}

function RatingDialog({ title, onClose, onSave }: {
  title: string;
  onClose: () => void;
  onSave: (input: RatingPayload) => Promise<void>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const labelId = useId();
  const commentId = useId();
  const errorId = useId();
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const { submitting, error, fields, submit } = useFormSubmission(onSave);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  return (
    <dialog ref={dialogRef} className="shooter-rating-dialog" aria-labelledby={labelId}
      onCancel={event => { event.preventDefault(); if (!submitting) onClose(); }}>
      <div className="shooter-rating-dialog__heading">
        <h2 id={labelId}>Calificar {title}</h2>
        <button type="button" disabled={submitting} aria-label="Cerrar calificación" onClick={onClose}><X size={20} aria-hidden="true" /></button>
      </div>
      <p>Comparte tu experiencia con la comunidad.</p>
      <form onSubmit={event => { event.preventDefault(); void submit({ score, comment }); }}>
        <fieldset disabled={submitting} className="shooter-rating-stars" aria-describedby={fields.score ? errorId : undefined}>
          <legend>Puntuación (1 a 5 estrellas)</legend>
          <div>
            {[1, 2, 3, 4, 5].map(value => (
              <label key={value}>
                <input type="radio" name="score" value={value} required checked={score === value}
                  onChange={() => setScore(value)} aria-label={`${value} ${value === 1 ? "estrella" : "estrellas"}`} />
                <Star size={32} aria-hidden="true" fill={value <= score ? "currentColor" : "none"} />
              </label>
            ))}
          </div>
        </fieldset>
        {fields.score && <p id={errorId} role="alert">{fields.score.join(" ")}</p>}
        <label htmlFor={commentId}>Tu reseña</label>
        <textarea id={commentId} required maxLength={2000} rows={4} value={comment} disabled={submitting}
          onChange={event => setComment(event.target.value)} aria-invalid={Boolean(fields.comment)}
          aria-describedby={fields.comment ? `${commentId}-error` : undefined} />
        <p className="shooter-rating-dialog__hint">{comment.length}/2000 caracteres</p>
        {fields.comment && <p id={`${commentId}-error`} role="alert">{fields.comment.join(" ")}</p>}
        {error && <p role="alert">{error}</p>}
        <div className="shooter-actions">
          <button type="submit" disabled={submitting || score === 0 || !comment.trim()}>{submitting ? "Enviando…" : "Enviar reseña"}</button>
          <button type="button" disabled={submitting} onClick={onClose}>Cancelar</button>
        </div>
      </form>
    </dialog>
  );
}
