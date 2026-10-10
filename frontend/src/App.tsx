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

feature/Leandro-prueba
        {error && (
          <div style={{ background: '#ffebee', color: '#c62828', padding: '1rem', borderRadius: '6px' }}>
            <strong>Error de conexión:</strong> {error}
          </div>
        )}

        {healthData && (
          <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '1rem', borderRadius: '6px' }}>
            <strong>Respuesta exitosa:</strong>
            <pre style={{ margin: '0.5rem 0 0 0', background: 'rgba(0,0,0,0.05)', padding: '0.5rem', borderRadius: '4px' }}>
              {JSON.stringify(healthData, null, 2)}
            </pre>
          </div>
        )}
      </div>
      <h1>Leandro Mora </h1>

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
 develop
    </div>
  );
};

export default App;