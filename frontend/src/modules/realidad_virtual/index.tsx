import { registerModule } from '../../core/modulesRegistry';
import { ModuleCatalog } from './ModuleCatalog';
registerModule({
  id: 'realidad_virtual',
  name: 'Realidad Virtual',
  category: 'traditional', // 'traditional' (HU-01) o 'special' (HU-02)
  component: () => (
    <ModuleCatalog
    endpoint="/api/v1/realidad_virtual/"
    categoryName="Realidad Virtual"
    />
    ),
});