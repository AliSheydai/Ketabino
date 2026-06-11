// File Path: utils/format.ts
// Persian-friendly formatting helpers

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fa-IR').format(amount) + ' ریال';
}

export function formatCoins(coins: number): string {
  return new Intl.NumberFormat('fa-IR').format(coins) + ' سکه';
}

export function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(isoString));
}

export function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'لحظاتی پیش';
  if (minutes < 60) return `${minutes} دقیقه پیش`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ساعت پیش`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} روز پیش`;
  return formatDate(isoString);
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '…';
}

export function starRating(rating: number): string {
  const full = Math.floor(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}
