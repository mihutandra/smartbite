import { type SupermarketProduct } from "../types/supermarket";

export function formatCurrency(value: string, currency: string) {
  const amount = Number(value);
  const currencyLabel = currency.toUpperCase() === "RON" ? "lei" : currency.toLowerCase();

  if (!Number.isFinite(amount)) {
    return `${value} ${currencyLabel}`;
  }

  return `${amount.toFixed(2)} ${currencyLabel}`;
}

export function formatShortDate(value: string) {
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return `${day}.${month}.${year}`;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function calculateDiscountPercentage(product: SupermarketProduct) {
  const originalPrice = Number(product.original_price);
  const discountPrice = Number(product.discount_price);

  if (!Number.isFinite(originalPrice) || !Number.isFinite(discountPrice) || originalPrice <= 0) {
    return 0;
  }

  return Math.max(0, Math.round(((originalPrice - discountPrice) / originalPrice) * 100));
}

export function calculateSavings(product: SupermarketProduct) {
  const originalPrice = Number(product.original_price);
  const discountPrice = Number(product.discount_price);

  if (!Number.isFinite(originalPrice) || !Number.isFinite(discountPrice)) {
    return "0.00";
  }

  return Math.max(0, originalPrice - discountPrice).toFixed(2);
}

export function getCategoryLabel(product: SupermarketProduct) {
  return product.category_name?.trim() || "Altele";
}
