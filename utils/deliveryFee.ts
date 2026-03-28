import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export type DeliveryZone = {
  name: string;
  fee: number;
  keywords: string[];
};

type ZonesConfig = {
  zones: DeliveryZone[];
  defaultFee: number;
  defaultZoneName: string;
};

// Kept for backwards-compat with Checkout.tsx badge display
export const CITY_FEE = 2000;
export const OUTSKIRTS_FEE = 2500;

const FALLBACK: ZonesConfig = {
  zones: [
    { name: 'Uyo City', fee: 2000, keywords: ['uyo'] },
    {
      name: 'Outskirts',
      fee: 2500,
      keywords: [
        'ikot ekpene', 'eastern obolo', 'mkpat enin', 'oruk anam',
        'nsit ubium', 'nsit atai', 'nsit ibom', 'ibiono ibom',
        'ibesikpo', 'ukanafun', 'uruan', 'ibiono', 'etinan',
        'ikono', 'abak', 'oron', 'eket', 'itu', 'ini',
      ],
    },
  ],
  defaultFee: 2000,
  defaultZoneName: 'Uyo City',
};

let config: ZonesConfig = FALLBACK;

/**
 * Call once at app startup. Loads zones from Firestore and seeds the
 * document with defaults if it doesn't exist yet.
 */
export async function initDeliveryZones(): Promise<void> {
  try {
    const ref = doc(db, 'settings', 'deliveryZones');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      config = snap.data() as ZonesConfig;
    } else {
      await setDoc(ref, FALLBACK);
    }
  } catch {
    // Stay on fallback — app still works offline
  }
}

export function getDeliveryFee(address: string): number {
  const text = address.toLowerCase();
  for (const zone of config.zones) {
    if (zone.keywords.some((k) => text.includes(k))) return zone.fee;
  }
  return config.defaultFee;
}

export function getDeliveryZone(address: string): string {
  const text = address.toLowerCase();
  for (const zone of config.zones) {
    if (zone.keywords.some((k) => text.includes(k))) return zone.name;
  }
  return config.defaultZoneName;
}
