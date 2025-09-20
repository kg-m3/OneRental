import 'mapbox-gl/dist/mapbox-gl.css'; 
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
