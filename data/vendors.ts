export type Vendor = {
  id: string;
  title: string;
  subtitle: string;
  rating: string;
  deliveryTime: string;
  minOrder: string;
  category: string;
};

export const VENDORS: Record<string, Vendor[]> = {
  Restaurants: [
    { id: 'r1', title: 'Calabar-Igbo Restaurant', subtitle: 'Local Nigerian cuisine', rating: '4.0', deliveryTime: '30–40 min', minOrder: '₦500', category: 'Restaurants' },
    { id: 'r2', title: 'Chicken Republic', subtitle: 'Fast food & grills', rating: '4.2', deliveryTime: '25–35 min', minOrder: '₦700', category: 'Restaurants' },
    { id: 'r3', title: 'Mama Cass', subtitle: 'Nigerian home cooking', rating: '4.1', deliveryTime: '35–45 min', minOrder: '₦600', category: 'Restaurants' },
    { id: 'r4', title: 'Tantalizers', subtitle: 'Snacks & full meals', rating: '3.9', deliveryTime: '20–30 min', minOrder: '₦400', category: 'Restaurants' },
  ],
  Shops: [
    { id: 's1', title: 'FoodCo Supermarket', subtitle: 'Groceries & household', rating: '4.3', deliveryTime: '40–55 min', minOrder: '₦1,000', category: 'Shops' },
    { id: 's2', title: 'Shoprite Express', subtitle: 'Everyday essentials', rating: '4.5', deliveryTime: '35–50 min', minOrder: '₦1,500', category: 'Shops' },
    { id: 's3', title: 'Prince Ebeano', subtitle: 'Fresh produce & goods', rating: '4.0', deliveryTime: '30–45 min', minOrder: '₦800', category: 'Shops' },
  ],
  Pharmacies: [
    { id: 'p1', title: 'MedPlus Pharmacy', subtitle: 'Drugs & health products', rating: '4.6', deliveryTime: '20–30 min', minOrder: '₦500', category: 'Pharmacies' },
    { id: 'p2', title: 'HealthPlus', subtitle: 'Pharmacy & wellness', rating: '4.4', deliveryTime: '25–35 min', minOrder: '₦500', category: 'Pharmacies' },
  ],
  Packages: [
    { id: 'k1', title: 'QuickSend Courier', subtitle: 'Same-day delivery', rating: '4.2', deliveryTime: '60–90 min', minOrder: '₦800', category: 'Packages' },
    { id: 'k2', title: 'SpeedEx Logistics', subtitle: 'Documents & parcels', rating: '4.0', deliveryTime: '45–75 min', minOrder: '₦600', category: 'Packages' },
  ],
};

export const ALL_VENDORS: Vendor[] = Object.values(VENDORS).flat();
