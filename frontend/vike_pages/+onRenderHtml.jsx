console.log(">>> +onRenderHtml.jsx LOADED");
import React from 'react';
import { renderToString } from 'react-dom/server';
import { escapeInject, dangerouslySkipEscape } from 'vike/server';
import AppWrapper from './AppWrapper';
import createEmotionServer from '@emotion/server/create-instance';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

// Create emotion cache for server-side extraction
const cache = createCache({ key: 'css' });
const { extractCriticalToChunks, constructStyleTagsFromChunks } = createEmotionServer(cache);

export default async function onRenderHtml(pageContext) {
  console.log(">>> onRenderHtml CALLED");
  const { urlPathname } = pageContext;
  
  // Scope SSR to storefront only.
  // Admin and User dashboards will be purely CSR to protect sensitive data and hydration.
  const isSSR = !urlPathname.startsWith('/admin') && !urlPathname.startsWith('/user');

  let pageHtml = '';
  let styleTags = '';

  if (isSSR) {
    try {
      const app = (
        <CacheProvider value={cache}>
          <AppWrapper urlPathname={urlPathname} isClient={false} />
        </CacheProvider>
      );
      
      const html = renderToString(app);
      const emotionChunks = extractCriticalToChunks(html);
      styleTags = constructStyleTagsFromChunks(emotionChunks);
      pageHtml = html;
    } catch (e) {
      console.error("SSR Rendering Error Captured:", e);
    }
  }

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>KDS Electronics</title>
        ${dangerouslySkipEscape(styleTags)}
      </head>
      <body>
        <div id="root">${dangerouslySkipEscape(pageHtml)}</div>
      </body>
    </html>`;

  return {
    documentHtml,
    pageContext: {
      urlPathname
    }
  };
}
