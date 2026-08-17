/**
 * Formatting Utilities — currency, dates, and status-label helpers used
 * throughout the panel and site views. Kept dependency-free (no
 * date-fns/dayjs) using native Intl APIs, per the "minimize external
 * packages" instruction.
 */

/** Formats a number as Nigerian Naira, e.g. 360000 → "₦360,000". */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Formats an ISO date string as "27 June 2026". */
export function formatDate(isoString) {
  if (!isoString) return '—';
  return new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(isoString)
  );
}

/** Formats an ISO date string as "27 Jun 2026, 3:45 PM". */
export function formatDateTime(isoString) {
  if (!isoString) return '—';
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(isoString));
}

/** Relative time, e.g. "3 hours ago" — used in audit trails and recent activity feeds. */
export function formatRelativeTime(isoString) {
  if (!isoString) return '—';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffSec = Math.round(diffMs / 1000);
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [unit, secondsInUnit] of units) {
    const value = Math.floor(diffSec / secondsInUnit);
    if (value >= 1) {
      const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
      return rtf.format(-value, unit);
    }
  }
  return 'just now';
}

/** Capitalizes and de-underscores an enum value, e.g. "not_paid" → "Not Paid". */
export function humanizeEnum(value) {
  if (!value) return '';
  return value
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Formats bytes as a human-readable size, e.g. 3145728 → "3.0 MB". Used in file upload UI. */
export function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`;
}

/** Formats Nigerian phone numbers for display/input (removes spaces to match backend regex) */
export function formatNigerianPhone(value) {
  if (!value) return '';
  return value.replace(/[^\d+]/g, '');
}