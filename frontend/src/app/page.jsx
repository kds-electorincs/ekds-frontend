import React from 'react';
import StorefrontLayout from '../layouts/StorefrontLayout';
import HomeClient from './HomeClient';
import { serverCatalogService } from '../services/serverApi';

export const metadata = {
  title: 'KDS Electronics | Authorized Electronic Component Distributor',
  description: 'Source 100% genuine semiconductors, passives, electromechanical components, and BOM fulfillment for OEM and EMS manufacturers worldwide.',
  openGraph: {
    title: 'KDS Electronics | B2B Electronic Component Marketplace',
    description: 'Verified lot traceability, instant volume tier discounts, and authorized component distribution.',
    type: 'website',
    siteName: 'KDS Electronics',
  },
};

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    serverCatalogService.getCategories(),
    serverCatalogService.getProducts({ size: 16, currency: 'INR' })
  ]);

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'KDS Electronics',
    url: 'https://kdselectronics.com',
    description: 'Authorized Global Distributor of Electronic Components & Semiconductors',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-8022150210',
      contactType: 'sales',
      areaServed: 'Worldwide',
      availableLanguage: ['English', 'Hindi']
    }
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'KDS Electronics',
    url: 'https://kdselectronics.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://kdselectronics.com/products?search={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <StorefrontLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <HomeClient 
        initialCategories={categories || []} 
        initialProducts={products || []} 
      />
    </StorefrontLayout>
  );
}
