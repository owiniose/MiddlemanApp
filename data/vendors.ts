export type Vendor = {
  id: string;
  title: string;
  subtitle: string;
  rating: string;
  deliveryTime: string;
  minOrder: string;
  category: string;
  image: string;
};

const img = (id: string) => `https://images.unsplash.com/photo-${id}?w=600&auto=format&fit=crop&q=80`;

export const VENDORS: Record<string, Vendor[]> = {
  Restaurants: [
    { id: 'r1', title: 'Calabar-Igbo Restaurant', subtitle: 'Local Nigerian cuisine', rating: '4.0', deliveryTime: '30–40 min', minOrder: '₦500', category: 'Restaurants', image: img('1504674900247-0877df9cc836') },
    { id: 'r2', title: 'Chicken Republic', subtitle: 'Fast food & grills', rating: '4.2', deliveryTime: '25–35 min', minOrder: '₦700', category: 'Restaurants', image: img('1567620905732-2d1ec7ab7445') },
    { id: 'r3', title: 'Mama Cass', subtitle: 'Nigerian home cooking', rating: '4.1', deliveryTime: '35–45 min', minOrder: '₦600', category: 'Restaurants', image: img('1555396273-367ea4eb4db5') },
    { id: 'r4', title: 'Tantalizers', subtitle: 'Snacks & full meals', rating: '3.9', deliveryTime: '20–30 min', minOrder: '₦400', category: 'Restaurants', image: img('1568901346375-23c9450c58cd') },
  ],
  Shops: [
    { id: 's1', title: 'FoodCo Supermarket', subtitle: 'Groceries & household', rating: '4.3', deliveryTime: '40–55 min', minOrder: '₦1,000', category: 'Shops', image: img('1542838132-92c53300491e') },
    { id: 's2', title: 'Shoprite Express', subtitle: 'Everyday essentials', rating: '4.5', deliveryTime: '35–50 min', minOrder: '₦1,500', category: 'Shops', image: img('1604719312566-8912e9c8a213') },
    { id: 's3', title: 'Prince Ebeano', subtitle: 'Fresh produce & goods', rating: '4.0', deliveryTime: '30–45 min', minOrder: '₦800', category: 'Shops', image: img('1488459716781-31db52582fe9') },
  ],
  Pharmacies: [
    { id: 'p1', title: 'MedPlus Pharmacy', subtitle: 'Drugs & health products', rating: '4.6', deliveryTime: '20–30 min', minOrder: '₦500', category: 'Pharmacies', image: img('1587854692152-cbe660dbde88') },
    { id: 'p2', title: 'HealthPlus', subtitle: 'Pharmacy & wellness', rating: '4.4', deliveryTime: '25–35 min', minOrder: '₦500', category: 'Pharmacies', image: img('1584308666744-24d5c474f2ae') },
  ],
  Packages: [
    { id: 'k1', title: 'QuickSend Courier', subtitle: 'Same-day delivery', rating: '4.2', deliveryTime: '60–90 min', minOrder: '₦800', category: 'Packages', image: img('1566576912321-d58ddd7a6088') },
    { id: 'k2', title: 'SpeedEx Logistics', subtitle: 'Documents & parcels', rating: '4.0', deliveryTime: '45–75 min', minOrder: '₦600', category: 'Packages', image: img('1586528116311-ad8dd3c8310d') },
  ],
};

export const ALL_VENDORS: Vendor[] = Object.values(VENDORS).flat();
export const VENDOR_BY_ID: Record<string, Vendor> = Object.fromEntries(ALL_VENDORS.map((v) => [v.id, v]));
