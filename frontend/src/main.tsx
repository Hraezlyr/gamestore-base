import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Registrar módulos
import './modules/juegos_indie';
import './modules/realidad_virtual';
import './modules/shooter';
import './modules/aventura_grafica';
import './modules/multijugador';
import './modules/perifericos';
import './modules/simulacion_construccion';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

