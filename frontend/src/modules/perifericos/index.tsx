import React from 'react';
import { registerModule } from '../../core/modulesRegistry';
import { ModuleCatalog } from './ModuleCatalog';

registerModule({
  id: 'Perifericos',
  name: 'Perifericos',
  category: 'traditional',
  component: () =>
    React.createElement(ModuleCatalog, {
      endpoint: '/api/v1/perifericos/',
      categoryName: 'Perifericos',
    }),
});
