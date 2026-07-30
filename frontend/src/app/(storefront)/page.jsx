import React from 'react';
import Link from 'next/link';
import { ChevronRight, Star } from 'lucide-react';
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '../constants/mockData';
import styles from './Homepage.module.css';

// Server Components
import QuickToolsGrid from '../components/home/QuickToolsGrid';
import FeaturedManufacturers from '../components/home/FeaturedManufacturers';
// Client Components
import HeroCarousel from '../components/home/HeroCarousel';
import AddToCartButton from '../components/common/AddToCartButton';

// Mock list of categories for the sidebar
const sidebarCategories = [
  { name: "Industrial Tools", path: "/products?category=Industrial%20Tools", active: true },
  { name: "Electrical Supplies", path: "/products?category=Electrical%20Supplies", active: true },
  { name: "Safety Gear", path: "/products?category=Safety%20Gear", active: true },
  { name: "Office Equipment", path: "/products?category=Office%20Equipment", active: true },
  { name: "Connectors & Terminals", path: "/products", active: false },
  { name: "Cables & Wires", path: "/products", active: false },
  { name: "Semiconductors", path: "/products", active: false },
  { name: "Power Supplies", path: "/products", active: false },
];

export default function HomePage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* SECTION 1: HERO CONTAINER (Sidebar + Banner) */}
      <section className={styles.heroSection}>
        {/* Left Side: Product Category Sidebar */}
        <div className={styles.categorySidebar}>
          <div className={styles.sidebarTitle}>
            <span className="uppercase text-sm tracking-wider">Products</span>
            <Link href="/products" className="text-xs text-blue-300 hover:text-white transition-colors">
              VIEW ALL
            </Link>
          </div>
          <ul className="overflow-y-auto flex-grow custom-scrollbar">
            {sidebarCategories.map((cat, i) => (
              <li key={i}>
                <Link 
                  href={cat.path} 
                  className={`${styles.sidebarItem} ${cat.active ? '' : 'pointer-events-none'}`}
                  aria-disabled={!cat.active}
                >
                  <span className={cat.active ? 'text-slate-800 font-bold' : 'text-gray-400'}>
                    {cat.name}
                  </span>
                  {cat.active ? (
                    <ChevronRight size={14} className="text-gray-400" />
                  ) : (
                    <span className="text-[10px] uppercase font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                      Soon
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Side: Promotion Banner Carousel */}
        <HeroCarousel />
      </section>

      {/* SECTION 2: 3-COLUMN TOOLS & SERVICES GRID */}
      <section>
        <QuickToolsGrid />
      </section>

      {/* SECTION 3: FEATURED CATEGORIES GRID */}
      <section>
        <div className="flex justify-between items-baseline mb-6">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Featured Product Categories
          </h2>
          <Link href="/products" className="hidden sm:flex items-center text-blue-600 font-bold hover:text-blue-800 transition-colors">
            All Categories <ChevronRight size={18} className="ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {MOCK_CATEGORIES.slice(0, 4).map((cat) => (
            <Link href={cat.path} key={cat.id} className="group flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="relative h-40 bg-gray-50 overflow-hidden">
                <img
                  src={
                    cat.name.includes("Tool") ? "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=500" :
                    cat.name.includes("Electrical") ? "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&q=80&w=500" :
                    "https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?auto=format&fit=crop&q=80&w=500"
                  }
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md text-blue-600">
                  {/* Category icon placeholder */}
                  <span className="font-bold text-lg">{cat.name.charAt(0)}</span>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-1">
                <h3 className="font-bold text-slate-800 leading-tight">{cat.name}</h3>
                <span className="text-xs font-semibold text-gray-500">{cat.count} Products</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 4: FEATURED MANUFACTURERS */}
      <FeaturedManufacturers />

      {/* SECTION 5: FEATURED PRODUCTS GRID */}
      <section className="mb-12">
        <div className="flex justify-between items-baseline mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Featured Components
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Top industrial supplies in stock. Tier-based pricing applies at checkout.
            </p>
          </div>
          <Link href="/products" className="hidden sm:flex items-center text-blue-600 font-bold hover:text-blue-800 transition-colors">
            Browse Catalog <ChevronRight size={18} className="ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {MOCK_PRODUCTS.slice(0, 4).map((product) => (
            <div key={product.id} className="group relative bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              
              {/* Badges */}
              <div className="absolute top-3 left-3 z-10">
                {product.stock === 0 && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-black rounded uppercase tracking-wide">Out of Stock</span>
                )}
                {product.stock > 0 && product.stock <= 30 && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-[10px] font-black rounded uppercase tracking-wide">Low Stock</span>
                )}
              </div>

              {/* Product Image */}
              <Link href={`/product/${product.id}`} className="block h-48 bg-white p-4 relative flex items-center justify-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </Link>

              {/* Product Details */}
              <div className="p-4 flex flex-col flex-grow border-t border-gray-100">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">
                  {product.category}
                </span>
                
                <Link href={`/product/${product.id}`} className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 h-10 mb-2 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </Link>

                <div className="flex items-center gap-1 mb-3">
                  <div className="flex text-yellow-400">
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} className="text-gray-200" />
                  </div>
                  <span className="text-xs font-medium text-gray-400">(24)</span>
                </div>

                <div className="flex flex-col gap-1 min-h-[40px] mb-4">
                  {product.specs?.slice(0, 2).map((spec, i) => (
                    <p key={i} className="text-xs text-gray-500 font-medium truncate flex items-center">
                      <span className="text-blue-400 text-[8px] mr-1.5">●</span> {spec}
                    </p>
                  ))}
                </div>

                {/* Price and Cart */}
                <div className="mt-auto flex items-end justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">B2B Price</span>
                    <span className="text-lg font-black text-blue-600 leading-none mt-0.5">
                      ₹{product.price.toLocaleString()}
                    </span>
                  </div>
                  <AddToCartButton product={product} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}
