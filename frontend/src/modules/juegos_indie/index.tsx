import React from 'react';
import { registerModule } from '../../core/modulesRegistry';
import { ModuleCatalog } from './ModuleCatalog';

registerModule({
  id: 'juegos_indie',
  name: 'Juegos Indie',
  category: 'traditional',
  component: () =>
    React.createElement(ModuleCatalog, {
      endpoint: '/api/v1/juegos_indie/',
      categoryName: 'Juegos Indie',
    }),
});

export default ModuleCatalog;
export { ModuleCatalog };