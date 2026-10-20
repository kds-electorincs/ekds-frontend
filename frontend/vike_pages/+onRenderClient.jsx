import React from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import AppWrapper from './AppWrapper';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

const cache = createCache({ key: 'css' });

let root;

export default async function onRenderClient(pageContext) {
  const { urlPathname } = pageContext;
  
  const isSSR = !urlPathname.startsWith('/admin') && !urlPathname.startsWith('/user');

  const app = (
    <CacheProvider value={cache}>
      <AppWrapper urlPathname={urlPathname} isClient={true} />
    </CacheProvider>
  );

  const container = document.getElementById('root');
  
  // If the container has content and we expected SSR, hydrate.
  if (isSSR && container.innerHTML !== '') {
    hydrateRoot(container, app);
  } else {
    // If Admin/CSR fallback, or HMR, render normally
    if (!root) {
      root = createRoot(container);
    }
    root.render(app);
  }
}
