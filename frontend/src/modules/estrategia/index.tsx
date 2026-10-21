import { registerModule } from '../../core/modulesRegistry';
import { EstrategiaCrud } from './EstrategiaCrud';

registerModule({
  id: 'estrategia',
  name: 'Juegos de Estrategia',
  category: 'traditional', // 'traditional' (HU-01) o 'special' (HU-02)
  component: () => (
    <EstrategiaCrud
      endpoint="/api/v1/estrategia/"
      categoryName="Juegos de Estrategia"
    />
  ),
});
