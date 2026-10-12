import { registerModule } from '../../core/modulesRegistry';
import { ModuleCatalog } from './ModuleCatalog';

registerModule({
  id: 'deportes',
  name: 'Deportes',
  category: 'traditional', // 'traditional' (HU-01) o 'special' (HU-02)
  component: () => (
    <ModuleCatalog
      endpoint="/api/v1/deportes/"
      categoryName="Deportes"
    />
  ),
});