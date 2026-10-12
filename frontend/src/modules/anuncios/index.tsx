import React from 'react';
import { registerModule } from '../../core/modulesRegistry';
import { ModuleCatalog } from './ModuleCatalog';

registerModule({
  id: 'anuncios',
  name: 'Anuncios',
  category: 'traditional',
  component: () =>
    React.createElement(ModuleCatalog, {
      endpoint: 'http://127.0.0.1:8000/api/anuncios/',
      categoryName: 'Anuncios',
    }),
});