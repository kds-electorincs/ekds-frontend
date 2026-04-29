export const MOCK_CATEGORIES = [
  { id: 1, name: 'Industrial Tools', icon: '🛠️', count: 120, path: '/products?category=industrial' },
  { id: 2, name: 'Electrical Supplies', icon: '⚡', count: 85, path: '/products?category=electrical' },
  { id: 3, name: 'Safety Gear', icon: '🦺', count: 45, path: '/products?category=safety' },
  { id: 4, name: 'Office Equipment', icon: '🖨️', count: 60, path: '/products?category=office' },
];

export const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Heavy Duty Drill Machine',
    price: 299,
    category: 'Industrial Tools',
    stock: 25,
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=500',
    description: 'High-performance industrial drill machine for heavy duty operations.',
    specs: ['750W Motor', 'Keyless Chuck', 'Variable Speed Control'],
    bulkPricing: [
      { min: 1, price: 299 },
      { min: 5, price: 279 },
      { min: 10, price: 249 },
    ]
  },
  {
    id: '2',
    name: 'Professional Hard Hat',
    price: 45,
    category: 'Safety Gear',
    stock: 150,
    image: 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?auto=format&fit=crop&q=80&w=500',
    description: 'Safety first! Impact-resistant hard hat with adjustable strap.',
    specs: ['ANSI Z89.1 Certified', 'Suspension System', 'Ventilated Design'],
    bulkPricing: [
      { min: 1, price: 45 },
      { min: 20, price: 38 },
      { min: 50, price: 32 },
    ]
  },
  {
    id: '3',
    name: 'Industrial LED Floodlight',
    price: 89,
    category: 'Electrical Supplies',
    stock: 40,
    image: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&q=80&w=500',
    description: 'Energy-efficient 100W LED floodlight for warehouse illumination.',
    specs: ['10000 Lumens', 'IP65 Waterproof', '50,000 Hours Life'],
    bulkPricing: [
      { min: 1, price: 89 },
      { min: 10, price: 75 },
    ]
  },
  {
    id: '4',
    name: 'Steel Toe Work Boots',
    price: 120,
    category: 'Safety Gear',
    stock: 0,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=500',
    description: 'Durable leather boots with steel toe protection and anti-slip sole.',
    specs: ['Genuine Leather', 'Oil Resistant', 'Puncture Proof'],
    bulkPricing: [
      { min: 1, price: 120 },
      { min: 10, price: 105 },
    ]
  },
];
