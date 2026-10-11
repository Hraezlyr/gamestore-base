import React from 'react';
import type { ModuleDefinition } from '../../core/modulesRegistry';

interface SidebarProps {
  modules: ModuleDefinition[];
  activeId: string;
  onSelect: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ modules, activeId, onSelect }) => {
  const traditional = modules.filter((m) => m.category === 'traditional');
  const special = modules.filter((m) => m.category === 'special');

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>🎮 GameStore</h2>
      </div>

      <nav className="sidebar-nav" aria-label="Catálogos de GameStore">
        {traditional.length > 0 && (
          <div className="sidebar-group">
            <span className="sidebar-category">Géneros</span>
            <ul>
              {traditional.map((mod) => (
                <li key={mod.id}>
                  <button
                    type="button"
                    className={`sidebar-link ${activeId === mod.id ? 'active' : ''}`}
                    aria-current={activeId === mod.id ? 'page' : undefined}
                    onClick={() => onSelect(mod.id)}
                  >
                    {mod.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {special.length > 0 && (
          <div className="sidebar-group">
            <span className="sidebar-category">Especiales y servicios</span>
            <ul>
              {special.map((mod) => (
                <li key={mod.id}>
                  <button
                    type="button"
                    className={`sidebar-link ${activeId === mod.id ? 'active' : ''}`}
                    aria-current={activeId === mod.id ? 'page' : undefined}
                    onClick={() => onSelect(mod.id)}
                  >
                    {mod.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </aside>
  );
};
