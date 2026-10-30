import React, {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './providers/ThemeProvider.tsx';
import './index.css';
import { GlobalPlayerProvider } from './context/GlobalPlayerContext.tsx';
import { migrateLegacyStorage } from './utils/storage';

migrateLegacyStorage();


createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <ThemeProvider defaultTheme="dark">
        <GlobalPlayerProvider>
          <App />
        </GlobalPlayerProvider>
      </ThemeProvider>
  </StrictMode>,
);
