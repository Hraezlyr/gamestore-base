import React, { useState, useEffect } from 'react';
import { Sidebar } from './shared/components/Sidebar';
import { getRegisteredModules, getModuleById } from './core/modulesRegistry';

export const App: React.FC = () => {
  const modules = getRegisteredModules();
  const [activeId, setActiveId] = useState<string>(modules[0]?.id || '');

  useEffect(() => {
    if (!activeId && modules.length > 0) {
      setActiveId(modules[0].id);
    }
  }, [modules, activeId]);

  const activeModule = getModuleById(activeId);
  const ActiveComponent = activeModule?.component;

  return (
    <div className="layout-container">
      <Sidebar modules={modules} activeId={activeId} onSelect={setActiveId} />
      <main className="main-content">
        <header className="content-header">
          <h1>{activeModule ? activeModule.name : 'Catálogo GameStore'}</h1>
        </header>
        <section className="content-body">
          {ActiveComponent ? (
            <ActiveComponent />
          ) : (
            <div className="module-placeholder">
              <p>No hay módulos seleccionados o registrados en el sistema.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default App;