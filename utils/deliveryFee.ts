/**
 * Delivery fee zones for Uyo, Akwa Ibom.
 * Base city rate: ₦2,000
 * Outskirts rate: ₦2,500
 */

export const CITY_FEE = 2000;
export const OUTSKIRTS_FEE = 2500;

/**
 * Towns/LGAs outside Uyo city centre that attract the outskirts rate.
 * Order matters: longer/more-specific phrases are checked first.
 */
const OUTSKIRT_AREAS = [
  'ikot ekpene',   // must come before plain 'eket'
  'eastern obolo',
  'mkpat enin',
  'oruk anam',
  'nsit ubium',
  'nsit atai',
  'nsit ibom',
  'ibiono ibom',
  'ibesikpo',
  'ukanafun',
  'uruan',
  'ibiono',
  'etinan',
  'ikono',
  'abak',
  'oron',
  'eket',
  'itu',
  'ini',
];

export function getDeliveryFee(address: string): number {
  const text = address.toLowerCase();

  // If the address explicitly mentions Uyo city, keep it at city rate
  if (text.includes('uyo')) return CITY_FEE;

  // Check for outskirt area names
  if (OUTSKIRT_AREAS.some((area) => text.includes(area))) return OUTSKIRTS_FEE;

  // Default — assume within Uyo
  return CITY_FEE;
}

export function getDeliveryZone(address: string): string {
  return getDeliveryFee(address) === CITY_FEE ? 'Uyo city' : 'Outskirts';
}
