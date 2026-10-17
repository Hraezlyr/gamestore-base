import { useEffect, useId, useRef, useState } from "react";
import { useFormSubmission } from "../hooks/useFormSubmission";
import type { LoginCredentials } from "../types/auth";
import { registerRatingAccount } from "../api/ratings";
import type { RegistrationPayload } from "../types/registration";

export function RatingAccountDialog({ initialMode, onClose, onLogin }: {
  initialMode: "login" | "register";
  onClose: () => void;
  onLogin: (credentials: LoginCredentials) => Promise<void>;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [mode, setMode] = useState(initialMode);
  const [submittedMode, setSubmittedMode] = useState(initialMode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [created, setCreated] = useState(false);
  const registering = mode === "register";
  const { submitting, error, fields, submit } = useFormSubmission(async (input: RegistrationPayload) => {
    if (registering) {
      await registerRatingAccount(input);
      setMode("login");
      setCreated(true);
      setPassword("");
      setConfirmation("");
    } else await onLogin({ username: input.username, password: input.password });
  });
  const showErrors = mode === submittedMode;
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    dialog?.showModal();
    return () => { dialog?.close(); if (previous instanceof HTMLElement) previous.focus(); };
  }, []);

  return (
    <dialog ref={ref} className="shooter-rating-dialog" aria-labelledby={`${id}-title`}
      onCancel={event => { event.preventDefault(); if (!submitting) onClose(); }}>
      <h2 id={`${id}-title`}>{registering ? "Crear cuenta" : "Iniciar sesión para calificar"}</h2>
      <p>{registering ? "Crea tu cuenta de GameStore para compartir tu reseña." : "Cada cuenta puede calificar una sola vez cada juego."}</p>
      {created && <p role="status">Cuenta creada. Ya puedes iniciar sesión.</p>}
      <form onSubmit={event => {
        event.preventDefault(); setSubmittedMode(mode);
        void submit({ username, password, password_confirm: confirmation });
      }}>
        <label htmlFor={`${id}-username`}>Usuario</label>
        <input id={`${id}-username`} autoComplete="username" required maxLength={150} disabled={submitting}
          value={username} onChange={event => setUsername(event.target.value)} />
        <label htmlFor={`${id}-password`}>Contraseña</label>
        <input id={`${id}-password`} type="password" autoComplete={registering ? "new-password" : "current-password"}
          required minLength={registering ? 8 : undefined} maxLength={128} disabled={submitting}
          value={password} onChange={event => setPassword(event.target.value)} />
        {registering && <>
          <p>Usa al menos 8 caracteres y evita contraseñas comunes.</p>
          <label htmlFor={`${id}-confirm`}>Confirmar contraseña</label>
          <input id={`${id}-confirm`} type="password" autoComplete="new-password" required maxLength={128}
            disabled={submitting} value={confirmation} onChange={event => setConfirmation(event.target.value)} />
        </>}
        {showErrors && error && <div role="alert"><p>{error}</p>
          {Object.entries(fields).map(([field, messages]) => <p key={field}>{messages.join(" ")}</p>)}
        </div>}
        <div className="shooter-actions">
          <button type="submit" disabled={submitting}>{submitting ? "Procesando…" : registering ? "Crear cuenta" : "Iniciar sesión"}</button>
          <button type="button" disabled={submitting} onClick={onClose}>Cancelar</button>
        </div>
        <button className="shooter-account-switch" type="button" disabled={submitting} onClick={() => {
          setMode(registering ? "login" : "register"); setPassword(""); setConfirmation(""); setCreated(false);
        }}>{registering ? "Ya tengo cuenta: iniciar sesión" : "No tengo cuenta: registrarme"}</button>
      </form>
    </dialog>
  );
}
