import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept and patch global fetch for mobile capacitor builds
if (typeof window !== 'undefined') {
  const isCapacitorOrMobileWebView = 
    !!(window as any).Capacitor ||
    window.location.protocol === 'capacitor:' ||
    window.location.origin.startsWith('capacitor://') ||
    navigator.userAgent.toLowerCase().includes('capacitor') ||
    ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && 
     /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent));

  if (isCapacitorOrMobileWebView) {
    console.log('Mobile/Capacitor environment detected. Patching fetch to point towards https://app.mahgate.com');
    const originalFetch = window.fetch;
    window.fetch = function (input, init) {
      let targetUrl = '';
      if (typeof input === 'string') {
        targetUrl = input;
      } else if (input instanceof Request) {
        targetUrl = input.url;
      } else if (input instanceof URL) {
        targetUrl = input.href;
      }

      // Check if URL targets API endpoints
      const hasApi = targetUrl.includes('/api/');
      const isRelativeApi = targetUrl.startsWith('/api') || targetUrl.startsWith('api/');
      const isLocalApi = targetUrl.includes('localhost/api') || targetUrl.includes('127.0.0.1/api') || targetUrl.includes('localhost:3000/api');

      if (isRelativeApi || isLocalApi || (hasApi && (targetUrl.includes('localhost') || targetUrl.includes('capacitor://') || targetUrl.includes('127.0.0.1')))) {
        // Extract the path after /api
        let apiPath = '';
        const apiIndex = targetUrl.indexOf('/api/');
        if (apiIndex !== -1) {
          apiPath = targetUrl.substring(apiIndex);
        } else if (targetUrl.startsWith('/api')) {
          apiPath = targetUrl;
        } else if (targetUrl.startsWith('api/')) {
          apiPath = '/' + targetUrl;
        } else {
          apiPath = '/api';
        }

        const finalUrl = `https://app.mahgate.com${apiPath}`;
        console.log(`[Capacitor Fetch Patch] Redirected: ${targetUrl} -> ${finalUrl}`);

        if (input instanceof Request) {
          const req = new Request(finalUrl, input);
          return originalFetch(req, init);
        }
        return originalFetch(finalUrl, init);
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

