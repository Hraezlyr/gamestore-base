import { useState } from "react";
import { LoginForm } from "../components/LoginForm";
import { useShooterSession } from "../hooks/useShooterSession";
import { useShooterNavigation } from "../hooks/useShooterNavigation";
import { AdminGames } from "./AdminGames";
import { GameDetail } from "./GameDetail";
import { ShooterCatalog } from "./ShooterCatalog";
import "../styles/shooter.css";
import "../styles/media.css";
import { LayoutGrid, LogIn, LogOut, Settings2 } from "lucide-react";

export function ShooterPage() {
  const { selectedId, view, navigate, openGame } = useShooterNavigation();
  const [catalogRevision, setCatalogRevision] = useState(0);
  const session = useShooterSession();
  const activeView = view === "admin" && !session.authenticated ? "login" : view;

  function showCatalog() {
    if (activeView === "login") session.logout();
    navigate("catalog");
  }

  function logout() {
    session.logout();
    navigate("catalog");
  }

  return (
    <main className="shooter-page">
      <header className="shooter-header">
        <a className="shooter-brand" href="#catalog" aria-label="GameStore, inicio" onClick={event => {
          event.preventDefault();
          showCatalog();
        }}>
          <span aria-hidden="true">GS</span>
          <div>GameStore<small>SHOOTERS / PC</small></div>
        </a>
        <nav className="shooter-nav" aria-label="Navegación del módulo">
          <button type="button" onClick={showCatalog} aria-current={activeView === "catalog" ? "page" : undefined}><LayoutGrid size={15} aria-hidden="true" /> Catálogo</button>
          {session.authenticated ? <>
            <button type="button" aria-current={activeView === "admin" ? "page" : undefined} onClick={() => navigate("admin")}><Settings2 size={15} aria-hidden="true" /> Administración</button>
            <button type="button" onClick={logout}><LogOut size={15} aria-hidden="true" /> Cerrar sesión</button>
          </> : <button type="button" disabled={activeView === "login"} onClick={() => navigate("login")}><LogIn size={15} aria-hidden="true" /> Acceso de administración</button>}
        </nav>
      </header>
      <div className="shooter-content">
        <div hidden={activeView !== "catalog" || selectedId !== null}>
          <ShooterCatalog key={catalogRevision} onSelect={openGame} />
        </div>
        {activeView === "catalog" && selectedId !== null && <GameDetail key={selectedId} id={selectedId} onBack={showCatalog} />}
        {activeView === "login" && <LoginForm onLogin={async credentials => {
          await session.login(credentials);
          navigate("admin");
        }} onCancel={showCatalog} />}
        {activeView === "admin" && <AdminGames request={session.request} onChanged={() => setCatalogRevision(current => current + 1)} />}
      </div>
      <footer>
        <span className="shooter-footer__brand">GameStore <span>/ Shooters PC</span></span>
        <p>
          Catálogo e imágenes de <a href="https://rawg.io/">RAWG</a>.
          {" "}Precios de <a href="https://www.cheapshark.com/">CheapShark</a>.
          {" "}Los precios pueden cambiar después de la sincronización.
        </p>
      </footer>
    </main>
  );
}
