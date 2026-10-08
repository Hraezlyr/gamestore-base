import React from 'react';
import { registerModule } from '../../core/modulesRegistry';
import { ModuleCatalog } from './ModuleCatalog';

registerModule({
  id: 'template',
  name: 'Módulo Plantilla',
  category: 'traditional',
  component: () =>
    React.createElement(ModuleCatalog, {
      endpoint: '/api/v1/template/',
      categoryName: 'Módulo Plantilla',
    }),
});