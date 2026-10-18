import React from 'react';
import { registerModule } from '../../core/modulesRegistry';
import { ModuleCatalog } from './ModuleCatalog';

registerModule({
  id: 'rpg',
  name: 'RPG / Rol',
  category: 'traditional',
  component: () =>
    React.createElement(ModuleCatalog, {
      endpoint: '/api/v1/rpg/',
      categoryName: 'RPG',
    }),
});
