/**
 * Formatting utilities for the GENESIS app.
 */

/** Format a number with locale-aware comma separation: 1234 → "1,234" */
export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

/** Format weight with unit: formatWeight(80.5, 'kg') → "80.5 kg" */
export function formatWeight(value: number, unit: 'kg' | 'lbs' = 'kg'): string {
  return `${value.toFixed(1)} ${unit}`;
}

/** Format duration in seconds to mm:ss — e.g. 95 → "1:35" */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Format a date string to a short readable form: "Jan 15" */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Format a date to full form: "January 15, 2026" */
export function formatDateFull(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/** Format calories: 2150 → "2,150 kcal" */
export function formatCalories(cal: number): string {
  return `${formatNumber(Math.round(cal))} kcal`;
}

/** Format percentage: 0.823 → "82%" */
export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

/** Format a macro value: formatMacro(145.3, 'g') → "145g" */
export function formatMacro(value: number, unit = 'g'): string {
  return `${Math.round(value)}${unit}`;
}

/** Relative time: "2 min ago", "3 hr ago", "Yesterday" */
export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}
