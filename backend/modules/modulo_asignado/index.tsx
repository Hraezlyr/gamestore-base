import { registerModule } from '../../core/modulesRegistry';
import { ModuleCatalog } from './ModuleCatalog';

registerModule({
  id: 'modulo_asignado',
  name: 'Terror Games',
  category: 'traditional',
  component: () => (
    <ModuleCatalog
      endpoint="/api/v1/modulo_asignado/"
      categoryName="Terror Games"
    />
  ),
});