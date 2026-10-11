import { useState } from "react";
import { ArrowLeft, LogIn } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
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
    <AnimatedSection className="shooter-login">
      <button type="button" onClick={onCancel} disabled={submitting}><ArrowLeft size={16} aria-hidden="true" /> Volver al catálogo</button>
      <p className="shooter-eyebrow">GameStore / Administración</p>
      <h1>Acceso de administración</h1>
      <p className="shooter-muted">Inicia sesión con tu cuenta de administrador para gestionar el catálogo.</p>
      <form className="shooter-form" onSubmit={handleSubmit}>
        <fieldset disabled={submitting}>
          <legend>Credenciales</legend>
          <label htmlFor="shooter-username">Usuario</label>
          <input id="shooter-username" name="username" autoComplete="username" value={username} onChange={event => setUsername(event.target.value)} required />
          <label htmlFor="shooter-password">Contraseña</label>
          <input id="shooter-password" name="password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required />
          <button className="shooter-button--primary" type="submit"><LogIn size={16} aria-hidden="true" />{submitting ? "Iniciando sesión…" : "Iniciar sesión"}</button>
        </fieldset>
        {error && <p role="alert">{error}</p>}
      </form>
    </AnimatedSection>
  );
}
