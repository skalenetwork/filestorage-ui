import "./polyfills";

import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './pages/app';
import { ContextWrapper } from './context';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ContextWrapper>
      <App />
    </ContextWrapper>
  </React.StrictMode>
)
