// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { PWAProvider } from './context/PWAContext.tsx'; // <-- IMPORT THE PROVIDER

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <PWAProvider> {/* Wrap the App with the PWA provider */}
        <App />
      </PWAProvider>
    </BrowserRouter>
  </React.StrictMode>,
);