import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Registra tu módulo personalizado de terror (añade esta línea)
import './modules/modulo_asignado';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);