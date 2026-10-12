import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { cartService } from '../services/apiServices';
import { useAuth } from './AuthContext';
import notification from '../utils/notification';

const CartContext = createContext(null);

const unscalePrice = (scaledInt, priceScale = 4) => {
  if (scaledInt == null) return null;
  return scaledInt / Math.pow(10, priceScale);
};

const formatInr = (scaledInt, priceScale = 4) => {
  const value = unscalePrice(scaledInt, priceScale);
  if (value == null) return '—';
  return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatUnitPrice = (scaledInt, priceScale = 4, symbol = '₹') => {
  const value = unscalePrice(scaledInt, priceScale);
  if (value == null) return '—';
  return `${symbol}${value.toFixed(4)}`;
};

const REASON_LABELS = {
  PACKAGING_INACTIVE: 'No longer available',
  PRODUCT_INACTIVE: 'Product discontinued',
  NO_PRICE: 'Price on request',
  BELOW_MOQ: 'Below minimum order quantity',
  INVALID_MULTIPLE: 'Quantity must match order multiple',
  EXCEEDS_QTY_CAP: 'Quantity exceeds maximum per line',
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  const [cartResponse, setCartResponse] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedStateCode, setSelectedStateCode] = useState(null);

  const [displayCurrency, setDisplayCurrency] = useState(
    sessionStorage.getItem('currency') || 'INR'
  );

  const debounceRef = useRef({});

  // ─── Derived state ─────────────────────────────────────────────────────────
  const cartItems = cartResponse?.items ?? [];
  const availableItems = cartItems.filter((i) => i.available);
  const unavailableItems = cartItems.filter((i) => !i.available);
  const priceScale = cartResponse?.priceScale ?? 4;
  const subtotalInrScaled = cartResponse?.subtotalInrScaled ?? 0;
  const subtotalScaled = cartResponse?.subtotalScaled ?? 0;
  const gstTotalScaled = cartResponse?.gstTotalScaled ?? 0;
  const gstTotalInrScaled = cartResponse?.gstTotalInrScaled ?? 0;
  const grandTotalScaled = cartResponse?.grandTotalScaled ?? 0;
  const grandTotalInrScaled = cartResponse?.grandTotalInrScaled ?? 0;
  const responseCurrency = cartResponse?.currency ?? displayCurrency;
  const unavailableLineCount = cartResponse?.unavailableLineCount ?? 0;
  const availableLineCount = cartResponse?.availableLineCount ?? 0;
  const deliveryEstimate = cartResponse?.deliveryEstimate ?? null;

  const cartItemCount = cartItems.length;
  const cartTotalInr = formatInr(subtotalInrScaled, priceScale);

  // ─── Load cart from server ──────────────────────────────────────────────────
  const fetchCart = useCallback(async (currency, stateCode) => {
    if (!user) return;
    try {
      setCartLoading(true);
      const data = await cartService.getCart(
        currency || displayCurrency,
        stateCode !== undefined ? stateCode : selectedStateCode
      );
      setCartResponse(data);
    } catch (err) {
      console.error('[CartContext] Failed to load cart:', err?.message);
    } finally {
      setCartLoading(false);
    }
  }, [user, displayCurrency, selectedStateCode]);

  useEffect(() => {
    if (user) {
      fetchCart(displayCurrency, selectedStateCode);
    } else {
      setCartResponse(null);
    }
  }, [user, displayCurrency, selectedStateCode]);

  const addToCart = useCallback(async (packagingOptionId, quantity = 1) => {
    if (!user) {
      notification.warning('Please log in to add items to your cart.');
      return;
    }
    try {
      setCartLoading(true);
      const data = await cartService.addItem(Number(packagingOptionId), Number(quantity));
      setCartResponse(data);
      setIsCartOpen(true);
      notification.success('Item added to cart');
    } catch (err) {
      const detail = err?.response?.data?.detail || 'Failed to add item to cart';
      notification.error(detail);
      console.error('[CartContext] addToCart failed:', err?.message);
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  const updateCartItem = useCallback((packagingOptionId, quantity) => {
    if (!user) return;

    setCartResponse((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((item) =>
          item.packagingOptionId === packagingOptionId
            ? { ...item, quantity }
            : item
        ),
      };
    });

    if (debounceRef.current[packagingOptionId]) {
      clearTimeout(debounceRef.current[packagingOptionId]);
    }

    debounceRef.current[packagingOptionId] = setTimeout(async () => {
      try {
        const data = await cartService.updateItem(Number(packagingOptionId), Number(quantity));
        setCartResponse(data);
      } catch (err) {
        const detail = err?.response?.data?.detail || 'Failed to update quantity';
        notification.error(detail);
        fetchCart();
      }
    }, 400);
  }, [user, fetchCart]);

  const removeCartItem = useCallback(async (packagingOptionId) => {
    if (!user) return;
    try {
      setCartLoading(true);
      const data = await cartService.removeItem(Number(packagingOptionId));
      setCartResponse(data);
      notification.info('Item removed from cart');
    } catch (err) {
      const detail = err?.response?.data?.detail || 'Failed to remove item';
      notification.error(detail);
      console.error('[CartContext] removeCartItem failed:', err?.message);
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  const fixCartItemQuantity = useCallback(async (item) => {
    const { packagingOptionId, minOrderQuantity, orderMultiple } = item;
    const moq = minOrderQuantity ?? 1;
    const step = orderMultiple ?? 1;
    let fixed = moq;
    if (item.quantity > moq) {
      const excess = (item.quantity - moq) % step;
      fixed = excess === 0 ? item.quantity : item.quantity - excess + step;
      fixed = Math.max(fixed, moq);
    }
    updateCartItem(packagingOptionId, fixed);
  }, [updateCartItem]);

  const clearCart = useCallback(async () => {
    if (!user) return;
    try {
      setCartLoading(true);
      await cartService.clearCart();
      setCartResponse(null);
      notification.info('Cart cleared');
    } catch (err) {
      notification.error('Failed to clear cart');
      console.error('[CartContext] clearCart failed:', err?.message);
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  const toggleCartDrawer = () => setIsCartOpen((prev) => !prev);

  const isValidQuantity = (quantity, minOrderQuantity, orderMultiple) => {
    const moq = minOrderQuantity ?? 1;
    const step = orderMultiple ?? 1;
    return quantity >= moq && (quantity - moq) % step === 0;
  };

  const getReasonLabel = (reason) => REASON_LABELS[reason] ?? reason;

  return (
    <CartContext.Provider
      value={{
        cartResponse,
        cartItems,
        availableItems,
        unavailableItems,
        priceScale,
        subtotalInrScaled,
        subtotalScaled,
        gstTotalScaled,
        gstTotalInrScaled,
        grandTotalScaled,
        grandTotalInrScaled,
        responseCurrency,
        unavailableLineCount,
        availableLineCount,
        deliveryEstimate,
        cartItemCount,
        cartTotalInr,

        cartLoading,
        isCartOpen,
        setIsCartOpen,
        toggleCartDrawer,
        displayCurrency,
        setDisplayCurrency,
        selectedStateCode,
        setSelectedStateCode,

        fetchCart,
        addToCart,
        updateCartItem,
        removeCartItem,
        fixCartItemQuantity,
        clearCart,

        unscalePrice,
        formatInr,
        formatUnitPrice,
        isValidQuantity,
        getReasonLabel,

        addItem: addToCart,
        removeFromCart: removeCartItem,
        updateQuantity: updateCartItem,
        cartTotal: unscalePrice(subtotalInrScaled, priceScale),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
