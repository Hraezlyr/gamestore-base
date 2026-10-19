import React from 'react';
import { registerModule } from '../../core/modulesRegistry';
import { RetroPage } from './RetroPage';

registerModule({
  id: 'retro',
  name: 'Retro',
  category: 'traditional',
  component: () => React.createElement(RetroPage),
});

export default RetroPage;
export { RetroPage };
