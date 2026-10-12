import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './modules/realidad_virtual';
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'


// Registrar módulos
//import './modules/_template'
import './modules/juegos_indie' 
// === IMPORTACIONES DE MÓDULOS (AUTO-REGISTRO) ===
// Cada nuevo módulo importado aquí se registrará de inmediato en el Sidebar
import './modules/shooter';
import './modules/_template';
// ===============================================

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />

  </React.StrictMode>,
)

  </React.StrictMode>
);
