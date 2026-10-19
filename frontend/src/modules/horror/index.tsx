import { registerModule } from '../../core/modulesRegistry';
import { ModuleCatalog } from './ModuleCatalog';

registerModule({
  id: 'horror',
  name: 'Terror',
  category: 'traditional',
  component: () => (
    <ModuleCatalog
      endpoint="/api/v1/horror/"
      categoryName="Terror"
    />
  ),
});
