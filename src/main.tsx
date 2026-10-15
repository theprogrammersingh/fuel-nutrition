import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

import { initServiceWorker } from './services/pwa'

// Initialize Service Worker for PWA offline caching & update lifecycle
if ((import.meta as any).env?.PROD) {
  initServiceWorker();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
