import { useRouter, useParams } from 'next/navigation';
"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {   as RouterLink } from 'react-router-dom';
import { ShoppingCart, FileText, Download, Gavel, MessageCircle, Heart, CheckCircle2, AlertCircle, Clock, ChevronRight, Minus, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { productPublicService, categoryPublicService } from '../../services/apiServices';
import BreadcrumbNavigation from '../../components/user/BreadcrumbNavigation';
import notification from '../../utils/notification';

const CDN_BASE = import.meta.env?.VITE_CDN_BASE_URL || 'https://d1sswqar085ync.cloudfront.net';

const ProductDetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [recentProducts, setRecentProducts] = useState([]);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const { addToCart, setIsCartOpen } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(false);
      try {
        const prod = await productPublicService.getProduct(id);
        const cat = await categoryPublicService.getCategory(prod.categoryId);
        setProduct(prod);
        setCategory(cat);

        // Save to recently viewed
        const recentlyViewed = JSON.parse(sessionStorage.getItem('recentlyViewed') || '[]');
        const updated = [prod.id, ...recentlyViewed.filter(pId => pId !== prod.id)].slice(0, 5);
        sessionStorage.setItem('recentlyViewed', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => setShowStickyBar(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
    </div>
  );
  
  if (error || !product) return (
    <div className="text-center text-red-600 font-medium py-20">Failed to load product information.</div>
  );

  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  const imageUrl = primaryImage ? `${CDN_BASE}/${primaryImage.objectKey}` : 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=500';

  const formatPrice = (unitPriceMinor, currencyCode = 'INR') => {
    const amount = unitPriceMinor / 100;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsCartOpen(true);
  };

  const handleWhatsAppRFQ = () => {
    const message = `Hello Archana Electronics, I would like to request a wholesale quotation for:\nProduct: ${product.name}\nPart ID: ${product.id}\nQuantity: ${quantity} units\nLink: ${window.location.href}`;
    window.open(`https://wa.me/918022150210?text=${encodeURIComponent(message)}`, '_blank');
  };

  const defaultPackage = product.packagingOptions?.[0];
  const defaultPrice = defaultPackage?.priceBreaks?.[0];

  return (
    <div className="pb-24">
      {/* Breadcrumbs */}
      <div className="mb-4">
        <BreadcrumbNavigation paths={[
          { label: 'Products', link: '/products' },
          { label: category?.name || 'Category', link: `/category/${category?.id}` },
          { label: product.mpn || 'Product' }
        ]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Images */}
        <div className="lg:col-span-5">
          <div className="border border-gray-200 rounded-sm bg-white p-4 flex items-center justify-center min-h-[400px]">
            <img src={imageUrl} alt={product.name} className="max-w-full max-h-[400px] object-contain mix-blend-multiply" />
          </div>
        </div>

        {/* Right Column: Key Details & Purchasing */}
        <div className="lg:col-span-7 flex flex-col">
          
          {/* Header Info */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{product.name}</h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 mb-4">
              <div><span className="font-semibold text-gray-900">Digi-Key Part Number:</span> {product.id}</div>
              <div><span className="font-semibold text-gray-900">Manufacturer Part Number:</span> {product.mpn}</div>
              <div><span className="font-semibold text-gray-900">Manufacturer:</span> <a href="#" className="text-blue-600 hover:underline">{product.manufacturer}</a></div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 mb-8">
            {/* Pricing & Stock Card */}
            <div className="flex-1 bg-gray-50 border border-gray-200 p-5 rounded-sm">
              <div className="flex items-center gap-2 mb-4">
                {product.totalStock > 0 ? (
                  <span className="flex items-center text-green-700 text-sm font-bold bg-green-100 px-2 py-1 rounded-sm"><CheckCircle2 className="w-4 h-4 mr-1"/> {product.totalStock.toLocaleString()} In Stock</span>
                ) : (
                  <span className="flex items-center text-red-600 text-sm font-bold bg-red-50 px-2 py-1 rounded-sm"><AlertCircle className="w-4 h-4 mr-1"/> Out of Stock</span>
                )}
                {product.restockLeadDays != null && (
                  <span className="flex items-center text-gray-600 text-sm"><Clock className="w-4 h-4 mr-1"/> Ships in {product.restockLeadDays} days</span>
                )}
              </div>

              {/* Volume Pricing Table */}
              {defaultPackage?.priceBreaks?.length > 0 ? (
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Volume Pricing ({defaultPackage.displayName})</h3>
                  <div className="border border-gray-200 rounded-sm bg-white overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 font-semibold text-gray-700 border-r border-gray-200">Qty</th>
                          <th className="px-3 py-2 font-semibold text-gray-700 border-r border-gray-200 text-right">Unit Price</th>
                          <th className="px-3 py-2 font-semibold text-gray-700 text-right">Ext Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {defaultPackage.priceBreaks.map((tier, idx) => {
                          const isHighlighted = quantity >= tier.minQuantity && (!defaultPackage.priceBreaks[idx+1] || quantity < defaultPackage.priceBreaks[idx+1].minQuantity);
                          return (
                            <tr key={tier.id} className={`border-t border-gray-100 ${isHighlighted ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                              <td className="px-3 py-1.5 border-r border-gray-200 text-gray-700">{tier.minQuantity.toLocaleString()}</td>
                              <td className="px-3 py-1.5 border-r border-gray-200 font-semibold text-right text-gray-900">{formatPrice(tier.unitPriceMinor, tier.currency)}</td>
                              <td className="px-3 py-1.5 text-right text-gray-500">{formatPrice(tier.unitPriceMinor * tier.minQuantity, tier.currency)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="mb-6 text-xl font-bold text-gray-900">Contact for Price</div>
              )}

              {/* Add to Cart Controls */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center border border-gray-300 rounded-sm bg-white h-10">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 text-gray-500 hover:text-red-600 transition-colors"><Minus className="w-4 h-4" /></button>
                  <input type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} className="w-16 text-center font-semibold text-gray-900 outline-none appearance-none" />
                  <button onClick={() => setQuantity(quantity + 1)} className="px-3 text-gray-500 hover:text-red-600 transition-colors"><Plus className="w-4 h-4" /></button>
                </div>
                <button 
                  onClick={handleAddToCart}
                  disabled={product.totalStock === 0 && !product.restockLeadDays}
                  className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-sm font-bold transition-colors ${
                    product.totalStock > 0 || product.restockLeadDays ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </button>
              </div>

              {/* RFQ / B2B Actions */}
              <div className="flex gap-2">
                <button onClick={() => { notification.success(`Quotation request submitted!`); router.push('/user/quotations'); }} className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold border border-gray-300 bg-white hover:bg-gray-50 rounded-sm transition-colors text-gray-700">
                  <Gavel className="w-4 h-4" /> Request Quote
                </button>
                <button onClick={handleWhatsAppRFQ} className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold border border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 rounded-sm transition-colors">
                  <MessageCircle className="w-4 h-4" /> WhatsApp RFQ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 border-b-2 border-gray-900 pb-2 mb-6 inline-block">Product Attributes</h2>
        
        {category?.segments ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {category.segments.map(segment => {
              if (!segment.active || product.meta?.hidden_segments?.includes(segment.id)) return null;
              
              const visibleAttrs = segment.attributes.filter(attr => attr.active && !product.meta?.hidden_attributes?.includes(attr.id));
              if (visibleAttrs.length === 0) return null;

              return (
                <div key={segment.id}>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">{segment.name}</h3>
                  <div className="border border-gray-200 rounded-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <tbody className="divide-y divide-gray-200">
                        {visibleAttrs.map((attr, idx) => {
                          const val = product.specs?.[attr.attrKey];
                          const display = val != null ? `${val}${attr.unit ? ' ' + attr.unit : ''}` : '-';
                          return (
                            <tr key={attr.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <th className="px-4 py-2 text-gray-600 font-medium w-1/2 border-r border-gray-200">{attr.attrKey}</th>
                              <td className="px-4 py-2 font-semibold text-gray-900 w-1/2">{display}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No detailed specifications available for this product.</p>
        )}
      </div>

      {product.documents?.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 border-b-2 border-gray-900 pb-2 mb-6 inline-block">Documents & Media</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {product.documents.map(doc => (
              <a key={doc.id} href={`${CDN_BASE}/${doc.objectKey}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 border border-gray-200 rounded-sm hover:border-red-500 hover:shadow-sm transition-all group bg-white">
                <FileText className="w-8 h-8 text-gray-400 group-hover:text-red-600 transition-colors" />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-bold text-gray-900 truncate group-hover:text-red-600 transition-colors">{doc.displayName || doc.objectKey}</span>
                  <span className="text-xs text-gray-500 uppercase">{doc.contentType}</span>
                </div>
                <Download className="w-4 h-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar for long pages */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 animate-in slide-in-from-bottom">
          <div className="container mx-auto px-4 max-w-7xl py-3 flex items-center justify-between">
            <div className="flex items-center gap-4 hidden sm:flex">
              <img src={imageUrl} alt={product.name} className="w-12 h-12 object-contain border border-gray-200 rounded-sm p-1" />
              <div className="flex flex-col max-w-md">
                <span className="text-sm font-bold text-gray-900 truncate">{product.name}</span>
                <span className="text-sm font-bold text-red-600">{defaultPrice ? formatPrice(defaultPrice.unitPriceMinor, defaultPrice.currency) : ''}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center border border-gray-300 rounded-sm bg-white h-10">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 text-gray-500 hover:text-red-600 transition-colors"><Minus className="w-4 h-4" /></button>
                <input type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} className="w-12 text-center font-semibold text-gray-900 outline-none appearance-none bg-transparent" />
                <button onClick={() => setQuantity(quantity + 1)} className="px-3 text-gray-500 hover:text-red-600 transition-colors"><Plus className="w-4 h-4" /></button>
              </div>
              <button 
                onClick={handleAddToCart}
                disabled={product.totalStock === 0 && !product.restockLeadDays}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 h-10 px-6 rounded-sm font-bold transition-colors ${
                  product.totalStock > 0 || product.restockLeadDays ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
