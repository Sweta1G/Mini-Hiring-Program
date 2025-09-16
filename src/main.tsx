
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';


import { initializeDatabase, seedDatabase } from './lib/db';

async function enableMocksAndRender() {
  if (import.meta.env.DEV) {
    // Prompt for HR name on first load (for demo/dev only)
    let hrName = localStorage.getItem('hrName');
    if (!hrName) {
      hrName = window.prompt('Enter your HR name for initial timeline events:', 'Kraya') || 'Kraya';
      localStorage.setItem('hrName', hrName);
    }
    await seedDatabase(hrName);
    const { worker } = await import('./lib/api');
    await worker.start();
  }
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

enableMocksAndRender();
