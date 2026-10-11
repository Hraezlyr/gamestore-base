import { getModuleById, getRegisteredModules } from "./core/modulesRegistry";
import { useModuleNavigation } from "./core/useModuleNavigation";
import { Sidebar } from "./shared/components/Sidebar";

export default function App() {
  const modules = getRegisteredModules();
  const { activeId, selectModule } = useModuleNavigation(modules);
  const activeModule = getModuleById(activeId);
  const ActiveComponent = activeModule?.component;
  const fullWidth = activeModule?.layout === "full-width";

  return (
    <div className="layout-container">
      <Sidebar modules={modules} activeId={activeId} onSelect={selectModule} />
      <main className="main-content" id="module-content">
        {!fullWidth && <header className="content-header">
          <h1>{activeModule?.name ?? "Catálogo GameStore"}</h1>
        </header>}
        <div className={fullWidth ? "content-body content-body--full-width" : "content-body"}>
          {ActiveComponent ? <ActiveComponent key={activeId} /> : (
            <div className="module-placeholder">
              <p>No hay módulos seleccionados o registrados en el sistema.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
