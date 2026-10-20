const API_BASE_URL = process.env.INTERNAL_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || process.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * Server-side data fetching helper with Next.js cache control and targeted tagging
 */
export async function serverFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const config = {
    method: options.method || 'GET',
    headers,
    // Default to dynamic fetching or configurable tags to guarantee fresh admin data
    next: {
      tags: options.tags || [],
      revalidate: typeof options.revalidate === 'number' ? options.revalidate : 0
    },
    cache: options.cache || (options.revalidate ? undefined : 'no-store')
  };

  if (options.body) {
    config.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      // Return null or throw based on caller
      if (res.status === 404) return null;
      console.error(`[ServerFetch Error] ${res.status} ${res.statusText} for ${url}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error(`[ServerFetch Exception] Failed to fetch ${url}:`, error.message);
    return null;
  }
}

export const serverCatalogService = {
  getCategories: async () => {
    const data = await serverFetch('/store/categories', { tags: ['categories'], revalidate: 60 });
    return data?.content || data?.data?.content || data?.data || data || [];
  },

  getProducts: async ({ size = 16, currency = 'INR', page = 0 } = {}) => {
    const query = new URLSearchParams({ size: String(size), currency, page: String(page) }).toString();
    const data = await serverFetch(`/store/products?${query}`, { tags: ['products'], revalidate: 60 });
    return data?.content || data?.data?.content || data?.data || data || [];
  },

  getProduct: async (idOrSlug, currency = 'INR') => {
    const data = await serverFetch(`/store/products/${idOrSlug}?currency=${currency}`, { tags: [`product-${idOrSlug}`], revalidate: 60 });
    return data?.data || data;
  }
};
