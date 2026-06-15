// Shared, non-content constants — URL bases live here so they can be swapped in one place.

export const CAL_BASE_URL = 'https://cal.com';

export function calBookingUrl(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return `${CAL_BASE_URL}/${slug}`;
}
