import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'
import './index.css';

// Registrar módulos
import './modules/juegos_indie';
import './modules/realidad_virtual';
import './modules/shooter';
import './modules/_template'
import './modules/modulo_RPGs';
import './modules/aventura_grafica';
// ===============================================
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
