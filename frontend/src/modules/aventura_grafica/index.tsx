import { registerModule } from '../../core/modulesRegistry';
import { ModuleCatalog } from './ModuleCatalog';

registerModule({
  id: 'aventura_grafica',
  name: 'Aventuras Gráficas',
  category: 'traditional', // 'traditional' (HU-01) o 'special' (HU-02)
  component: () => (
    <ModuleCatalog
      endpoint="/api/v1/aventura_grafica/"
      categoryName="Aventuras Gráficas"
    />
  ),
});