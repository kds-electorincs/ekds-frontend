import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import styles from '../../app/(storefront)/Homepage.module.css';

const MANUFACTURERS = [
  { name: 'Texas Instruments', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Texas_Instruments_logo.svg/512px-Texas_Instruments_logo.svg.png' },
  { name: '3M', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/3M_wordmark.svg/512px-3M_wordmark.svg.png' },
  { name: 'Fluke', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Fluke_Corporation_logo.svg/512px-Fluke_Corporation_logo.svg.png' },
  { name: 'Stanley', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Stanley_Hand_Tools_logo.svg/512px-Stanley_Hand_Tools_logo.svg.png' },
  { name: 'Omron', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/OMRON_Logo.svg/512px-OMRON_Logo.svg.png' },
  { name: 'Schneider Electric', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Schneider_Electric_2007.svg/512px-Schneider_Electric_2007.svg.png' }
];

export default function FeaturedManufacturers() {
  return (
    <div className="mt-12 mb-8">
      <div className="flex justify-between items-baseline mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Trusted Global Manufacturers
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Genuine components sourced directly from industry leaders.
          </p>
        </div>
        <Link 
          href="/products" 
          className="hidden sm:flex items-center text-blue-600 font-bold hover:text-blue-800 transition-colors"
        >
          View Linecard
          <ArrowRight size={18} className="ml-1" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {MANUFACTURERS.map((mfg, idx) => (
          <Link href={`/products?brand=${encodeURIComponent(mfg.name)}`} key={idx} className={styles.manufacturerCard}>
            <img 
              src={mfg.logo} 
              alt={mfg.name} 
              className="max-h-12 max-w-[80%] object-contain"
              loading="lazy"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
