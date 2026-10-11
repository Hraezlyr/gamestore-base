import { useState } from "react";
import type { FormEvent } from "react";
import { useFormSubmission } from "../hooks/useFormSubmission";
import type { LoginCredentials } from "../types/auth";

interface LoginFormProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  onCancel: () => void;
}

export function LoginForm({ onLogin, onCancel }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { submitting, error, submit } = useFormSubmission(onLogin);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await submit({ username: username.trim(), password })) setPassword("");
  }
  return (
    <section>
      <button type="button" onClick={onCancel} disabled={submitting}>Volver al catálogo</button>
      <h1>Acceso de administración</h1>
      <form className="shooter-form" onSubmit={handleSubmit}>
        <fieldset disabled={submitting}>
          <legend>Credenciales</legend>
          <label htmlFor="shooter-username">Usuario</label>
          <input id="shooter-username" name="username" autoComplete="username" value={username} onChange={event => setUsername(event.target.value)} required />
          <label htmlFor="shooter-password">Contraseña</label>
          <input id="shooter-password" name="password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required />
          <button type="submit">{submitting ? "Iniciando sesión…" : "Iniciar sesión"}</button>
        </fieldset>
        {error && <p role="alert">{error}</p>}
      </form>
    </section>
  );
}
