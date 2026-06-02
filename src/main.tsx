import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept and patch global fetch for mobile capacitor builds
if (typeof window !== 'undefined') {
  const isCapacitor = 
    !!(window as any).Capacitor ||
    window.location.protocol === 'capacitor:' ||
    window.location.origin.startsWith('capacitor://') ||
    navigator.userAgent.toLowerCase().includes('capacitor');

  if (isCapacitor) {
    console.log('Mobile/Capacitor environment detected. Patching fetch to point towards https://app.mahgate.com');
    const originalFetch = window.fetch;
    window.fetch = function (input, init) {
      let url = '';
      if (typeof input === 'string') {
        url = input;
      } else if (input instanceof Request) {
        url = input.url;
      } else if (input instanceof URL) {
        url = input.href;
      }

      // Convert relative /api endpoints or local loopback API requests to production domain
      if (
        url.startsWith('/api') || 
        url.startsWith('http://localhost/api') || 
        url.startsWith('capacitor://localhost/api')
      ) {
        const cleanPath = url.replace(/^(capacitor:\/\/localhost|http:\/\/localhost)?\/?api/, '/api');
        const targetUrl = `https://app.mahgate.com${cleanPath}`;

        if (input instanceof Request) {
          const req = new Request(targetUrl, input);
          return originalFetch(req, init);
        }
        return originalFetch(targetUrl, init);
      }
      
      return originalFetch(input, init);
    };
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

