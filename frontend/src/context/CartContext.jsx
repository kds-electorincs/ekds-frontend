/**
 * CartContext — API-backed server cart
 *
 * The cart lives on the backend (KDS Cart API). This context is the single
 * source of truth for all cart state in the frontend.
 *
 * Design rules enforced here (from KDS spec):
 *   - No guest cart — API calls only fire when a user is logged in.
 *   - POST  = increment (Add to Cart button)
 *   - PATCH = absolute set (Cart page stepper)
 *   - Every mutation response IS the new cart state — no follow-up GET.
 *   - Unit prices displayed to 4 decimal places.
 *   - Checkout is blocked while unavailableLineCount > 0.
 */
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

// Helper: divide a scaled integer by 10^priceScale
const unscalePrice = (scaledInt, priceScale = 4) => {
  if (scaledInt == null) return null;
  return scaledInt / Math.pow(10, priceScale);
};

// Helper: format INR amount from scaled integer
const formatInr = (scaledInt, priceScale = 4) => {
  const value = unscalePrice(scaledInt, priceScale);
  if (value == null) return '—';
  return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Helper: format unit price to 4 decimal places (required by spec §2)
const formatUnitPrice = (scaledInt, priceScale = 4, symbol = '₹') => {
  const value = unscalePrice(scaledInt, priceScale);
  if (value == null) return '—';
  return `${symbol}${value.toFixed(4)}`;
};

// Human-readable reason labels for unavailable lines (spec §6)
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

  // Full CartResponse from the server
  const [cartResponse, setCartResponse] = useState(null);
  // UI loading state for cart operations
  const [cartLoading, setCartLoading] = useState(false);
  // Whether the cart drawer is open
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Track currency preference (mirrors CurrencyContext selection)
  const [displayCurrency, setDisplayCurrency] = useState(
    sessionStorage.getItem('currency') || 'INR'
  );

  // Debounce ref for quantity updates to avoid rapid PATCH storms
  const debounceRef = useRef({});

  // ─── Derived state from CartResponse ───────────────────────────────────────
  const cartItems = cartResponse?.items ?? [];
  const availableItems = cartItems.filter((i) => i.available);
  const unavailableItems = cartItems.filter((i) => !i.available);
  const priceScale = cartResponse?.priceScale ?? 4;
  const subtotalInrScaled = cartResponse?.subtotalInrScaled ?? 0;
  const subtotalScaled = cartResponse?.subtotalScaled ?? 0;
  // gst*/grandTotal* — authoritative, computed server-side (CartResponse).
  // Checkout must read these directly rather than deriving a GST estimate
  // client-side (guide §5/§7 — never do this kind of money math locally).
  const gstTotalScaled = cartResponse?.gstTotalScaled ?? 0;
  const gstTotalInrScaled = cartResponse?.gstTotalInrScaled ?? 0;
  const grandTotalScaled = cartResponse?.grandTotalScaled ?? 0;
  const grandTotalInrScaled = cartResponse?.grandTotalInrScaled ?? 0;
  const responseCurrency = cartResponse?.currency ?? displayCurrency;
  const unavailableLineCount = cartResponse?.unavailableLineCount ?? 0;
  const availableLineCount = cartResponse?.availableLineCount ?? 0;

  // Convenience: total item count for the badge
  const cartItemCount = cartItems.length;

  // Convenience: INR total as a display string
  const cartTotalInr = formatInr(subtotalInrScaled, priceScale);

  // ─── Load cart from server ──────────────────────────────────────────────────
  const fetchCart = useCallback(async (currency) => {
    if (!user) return; // No guest cart
    try {
      setCartLoading(true);
      const data = await cartService.getCart(currency || displayCurrency);
      setCartResponse(data);
    } catch (err) {
      console.error('[CartContext] Failed to load cart:', err?.message);
    } finally {
      setCartLoading(false);
    }
  }, [user, displayCurrency]);

  // Load cart when user logs in, and whenever currency changes
  useEffect(() => {
    if (user) {
      fetchCart(displayCurrency);
    } else {
      // User logged out — clear local state
      setCartResponse(null);
    }
  }, [user, displayCurrency]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Add to cart (POST — INCREMENTS quantity) ───────────────────────────────
  // Use this from the Product page "Add to Cart" button.
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

  // ─── Update quantity (PATCH — ABSOLUTE value) ───────────────────────────────
  // Use this from the Cart page quantity stepper.
  // Debounced: rapid clicks collapse into one PATCH call after 400ms.
  const updateCartItem = useCallback((packagingOptionId, quantity) => {
    if (!user) return;

    // Optimistic local update — replace qty in state immediately for snappy UI
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

    // Clear any pending debounce for this line
    if (debounceRef.current[packagingOptionId]) {
      clearTimeout(debounceRef.current[packagingOptionId]);
    }

    // Schedule the PATCH after 400ms of inactivity
    debounceRef.current[packagingOptionId] = setTimeout(async () => {
      try {
        const data = await cartService.updateItem(Number(packagingOptionId), Number(quantity));
        // Reconcile with server response (price breaks may have changed)
        setCartResponse(data);
      } catch (err) {
        const detail = err?.response?.data?.detail || 'Failed to update quantity';
        notification.error(detail);
        // Roll back by reloading cart from server
        fetchCart();
      }
    }, 400);
  }, [user, fetchCart]);

  // ─── Remove single line ──────────────────────────────────────────────────────
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

  // ─── Fix invalid line quantity (BELOW_MOQ / INVALID_MULTIPLE) ───────────────
  // Snaps quantity to the nearest valid value and sends a PATCH.
  const fixCartItemQuantity = useCallback(async (item) => {
    const { packagingOptionId, minOrderQuantity, orderMultiple } = item;
    const moq = minOrderQuantity ?? 1;
    const step = orderMultiple ?? 1;
    // Nearest valid quantity >= MOQ that satisfies the multiple constraint
    let fixed = moq;
    if (item.quantity > moq) {
      const excess = (item.quantity - moq) % step;
      fixed = excess === 0 ? item.quantity : item.quantity - excess + step;
      fixed = Math.max(fixed, moq);
    }
    updateCartItem(packagingOptionId, fixed);
  }, [updateCartItem]);

  // ─── Clear entire cart ───────────────────────────────────────────────────────
  const clearCart = useCallback(async () => {
    if (!user) return;
    try {
      setCartLoading(true);
      await cartService.clearCart(); // 204, no body
      setCartResponse(null);
      notification.info('Cart cleared');
    } catch (err) {
      notification.error('Failed to clear cart');
      console.error('[CartContext] clearCart failed:', err?.message);
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const toggleCartDrawer = () => setIsCartOpen((prev) => !prev);

  // Validate whether a given qty is valid for a cart item (client-side check)
  const isValidQuantity = (quantity, minOrderQuantity, orderMultiple) => {
    const moq = minOrderQuantity ?? 1;
    const step = orderMultiple ?? 1;
    return quantity >= moq && (quantity - moq) % step === 0;
  };

  // Get the human-readable label for an unavailability reason
  const getReasonLabel = (reason) => REASON_LABELS[reason] ?? reason;

  return (
    <CartContext.Provider
      value={{
        // Cart data
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
        cartItemCount,
        cartTotalInr,

        // UI state
        cartLoading,
        isCartOpen,
        setIsCartOpen,
        toggleCartDrawer,
        displayCurrency,
        setDisplayCurrency,

        // Operations
        fetchCart,
        addToCart,
        updateCartItem,
        removeCartItem,
        fixCartItemQuantity,
        clearCart,

        // Helpers
        unscalePrice,
        formatInr,
        formatUnitPrice,
        isValidQuantity,
        getReasonLabel,

        // Legacy aliases — kept for backward compatibility with any remaining
        // components that still use the old API. These will be removed once all
        // consumers are updated.
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
