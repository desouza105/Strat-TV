import React, {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { SettingsProvider } from './context/SettingsContext.tsx';
import { GlobalPlayerProvider } from './context/GlobalPlayerContext.tsx';

document.documentElement.classList.add('dark');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <GlobalPlayerProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </GlobalPlayerProvider>
    </SettingsProvider>
  </StrictMode>,
);
