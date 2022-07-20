import "./polyfills";

import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './pages/app';

import { WagmiConfig, createClient } from 'wagmi';
import { ethers, getDefaultProvider } from 'ethers';

import { ContextWrapper } from './context';
import './styles/globals.css';

let client = createClient({
  autoConnect: true,
  provider: getDefaultProvider(),
});

const setClient = (provider: any) => {
  client = createClient({
    autoConnect: true,
    provider,
  });
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <WagmiConfig client={client}>
      <ContextWrapper setClient={setClient}>
        <App />
      </ContextWrapper>
    </WagmiConfig>
  </React.StrictMode>
)
