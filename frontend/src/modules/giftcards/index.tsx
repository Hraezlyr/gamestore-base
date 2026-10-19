import { registerModule } from '../../core/modulesRegistry';
import { ModuleCatalog } from './ModuleCatalog';

registerModule({
  id: 'giftcards',
  name: 'Tarjetas de Regalo',
  category: 'special', // 'traditional' (HU-01) o 'special' (HU-02)
  component: () => (
    <ModuleCatalog
      endpoint="/api/v1/giftcards/"
      categoryName="Tarjetas de Regalo"
    />
  ),
});
