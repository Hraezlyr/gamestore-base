import { registerModule } from '../../core/modulesRegistry';
import { ModuleCatalog } from './ModuleCatalog';

registerModule({
  id: 'simulacion_construccion',
  name: 'Simulación y Construcción',
  category: 'traditional',
  component: () => (
    <ModuleCatalog
      endpoint="/api/v1/simulacion_construccion/"
      categoryName="Simulación y Construcción"
    />
  ),
});