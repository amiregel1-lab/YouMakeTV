export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(value);
}

export function subscriberPrice(price: number) {
  if (price === 0) return 0;
  return Math.floor(Math.round(price * 100) / 2) / 100;
}

export function roundToCents(value: number) {
  return Math.round(value * 100) / 100;
}
