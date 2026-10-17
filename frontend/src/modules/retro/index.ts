import { registerModule } from '../../core/modulesRegistry';
import { RetroGames } from './components/RetroGames';

registerModule({
  id: 'retro',
  name: 'Retro / Clásicos',
  category: 'traditional',
  component: RetroGames,
});

export default RetroGames;
