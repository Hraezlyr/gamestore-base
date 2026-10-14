import { registerModule } from '../../core/modulesRegistry';
import { ModuleCatalog } from './ModuleCatalog';
registerModule({
  id: 'multijugador',
  name: 'Juegos Multijugador',
  category: 'traditional', // 'traditional' (HU-01) o 'special' (HU-02)
  component: () => (
    <ModuleCatalog
      endpoint="/api/v1/multijugador/"
      categoryName="Juegos Multijugador"
    />
),
});
