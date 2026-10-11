import { useState } from "react";
import { LoginForm } from "../components/LoginForm";
import { useShooterSession } from "../hooks/useShooterSession";
import { useShooterNavigation } from "../hooks/useShooterNavigation";
import { AdminGames } from "./AdminGames";
import { GameDetail } from "./GameDetail";
import { ShooterCatalog } from "./ShooterCatalog";
import "../styles/shooter.css";

export function ShooterPage() {
  const { selectedId, view, navigate, openGame } = useShooterNavigation();
  const [catalogRevision, setCatalogRevision] = useState(0);
  const session = useShooterSession();
  const activeView = view === "admin" && !session.authenticated ? "login" : view;

  function logout() {
    session.logout();
    navigate("catalog");
  }

  return (
    <main className="shooter-page">
      <nav className="shooter-actions" aria-label="Navegación del módulo">
        <button type="button" onClick={() => {
          if (activeView === "login") session.logout();
          navigate("catalog");
        }}>Catálogo</button>
        {session.authenticated ? <>
          <button type="button" onClick={() => navigate("admin")}>Administración</button>
          <button type="button" onClick={logout}>Cerrar sesión</button>
        </> : <button type="button" disabled={activeView === "login"} onClick={() => navigate("login")}>Acceso de administración</button>}
      </nav>
      <div hidden={activeView !== "catalog" || selectedId !== null}>
        <ShooterCatalog key={catalogRevision} onSelect={openGame} />
      </div>
      {activeView === "catalog" && selectedId !== null && <GameDetail key={selectedId} id={selectedId} onBack={() => navigate("catalog")} />}
      {activeView === "login" && <LoginForm onLogin={async credentials => {
        await session.login(credentials);
        navigate("admin");
      }} onCancel={() => navigate("catalog")} />}
      {activeView === "admin" && <AdminGames request={session.request} onChanged={() => setCatalogRevision(current => current + 1)} />}
    </main>
  );
}
