import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css';
import './modules/multijugador';

// Registrar módulos
//import './modules/_template'
import './modules/juegos_indie';
import './modules/realidad_virtual'; 
// === IMPORTACIONES DE MÓDULOS (AUTO-REGISTRO) ===
// Cada nuevo módulo importado aquí se registrará de inmediato en el Sidebar
import './modules/shooter';
import './modules/_template';
import './modules/aventura_grafica';
// ===============================================

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
