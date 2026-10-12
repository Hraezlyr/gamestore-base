import React from 'react';

export interface ModuleDefinition {
  id: string;                               // Identificador único (ej: 'rpg', 'shooters')
  name: string;                             // Título para el sidebar (ej: 'RPG / Rol')
  category: 'traditional' | 'special';      // Agrupación HU-01 o HU-02
  component: React.ComponentType;           // Componente React que renderiza el catálogo
}

// Registro global en memoria
const registeredModules: Record<string, ModuleDefinition> = {};

export const registerModule = (module: ModuleDefinition): void => {
  registeredModules[module.id] = module;
};

export const getRegisteredModules = (): ModuleDefinition[] => {
  return Object.values(registeredModules);
};

export const getModuleById = (id: string): ModuleDefinition | undefined => {
  return registeredModules[id];
};