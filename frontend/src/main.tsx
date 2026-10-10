import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// === IMPORTACIONES DE MÓDULOS (AUTO-REGISTRO) ===
// Cada nuevo módulo importado aquí se registrará de inmediato en el Sidebar
import './modules/_template';
// ===============================================

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);