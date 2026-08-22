/**
 * Single source of truth for rendering KDS storefront/cart/order prices.
 *
 * Prices on the wire are integers in "scaled units" — 1/10**priceScale of
 * one major currency unit (priceScale is currently 4; read it from the
 * response, never hardcode 10000). See mdfiles/KDS_Frontend_Currency_Guide.md.
 *
 * Never do FX arithmetic here or anywhere else in the client — the backend
 * is the single conversion point. These helpers only scale/format/sum
 * numbers that are already in the requested display currency.
 */

// Sentinel for "no price to show" — a null fromPriceScaled/unitPriceScaled,
// or an empty priceBreaks array. Never render "0" or "Free" for this.
export const CONTACT_US = 'Contact us';

/**
 * Format a unit price. Defaults to 4 decimals per the guide's rendering
 * rule — this catalog sells components that cost fractions of a cent.
 */
export function formatPrice(scaled, scale, currency, decimals = 4) {
  if (scaled == null) return CONTACT_US;
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(scaled / 10 ** scale);
}

/**
 * Format a line/order total — always 2 decimals, because a total is a real
 * amount of money someone pays.
 */
export function formatTotal(scaled, scale, currency) {
  if (scaled == null) return CONTACT_US;
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(scaled / 10 ** scale);
}

/**
 * Applicable price-break tier for a given order quantity: the highest
 * minQuantity that is <= qty. Price breaks are minimum-quantity tiers only
 * (no maxQuantity). Returns null for an empty/missing breaks array — same
 * "Contact us" path as a null fromPriceScaled.
 */
export function getTierForQty(priceBreaks, qty) {
  if (!priceBreaks || priceBreaks.length === 0) return null;
  return [...priceBreaks]
    .filter((pb) => pb.minQuantity <= qty)
    .sort((a, b) => b.minQuantity - a.minQuantity)[0] ?? null;
}

/**
 * Line total for a quantity. Rounds the unit price FIRST (toFixed(4)),
 * then multiplies by qty — never multiply the raw scaled value and round
 * at the end. This keeps the line total agreeing with the unit price the
 * customer sees displayed, and matches the backend's own rounding order.
 */
export function computeLineTotal(unitScaled, scale, qty) {
  if (unitScaled == null) return null;
  const unit = Number((unitScaled / 10 ** scale).toFixed(4));
  return unit * qty;
}
