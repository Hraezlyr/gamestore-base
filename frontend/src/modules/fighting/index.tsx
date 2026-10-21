import React from 'react';
import { registerModule } from '../../core/modulesRegistry';
import { MoveListAccordion } from './components/MoveListAccordion';

export const FightingModule: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#ffffff' }}>
        Juegos de Lucha
      </h1>
      <p style={{ color: '#aaa', marginBottom: '24px' }}>
        Explora y filtra la lista de comandos y movimientos por categoría.
      </p>
      <MoveListAccordion characterId={1} />
    </div>
  );
};

registerModule({
  id: 'fighting',
  name: 'Juegos de Lucha',
  category: 'traditional',
  component: FightingModule,
});

export default FightingModule;