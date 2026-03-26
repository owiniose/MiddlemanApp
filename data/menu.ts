export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  vendorId: string;
  category: string;
};

export type MenuSection = {
  section: string;
  items: MenuItem[];
};

export const MENU_DATA: Record<string, MenuSection[]> = {
  r1: [
    {
      section: 'Popular',
      items: [
        { id: 'r1m1', name: 'Jollof Rice + Chicken', description: 'Party-style jollof with grilled chicken', price: 1800, vendorId: 'r1', category: 'Restaurants' },
        { id: 'r1m2', name: 'Egusi Soup + Fufu', description: 'Melon seed soup with pounded yam', price: 1500, vendorId: 'r1', category: 'Restaurants' },
        { id: 'r1m3', name: 'Afang Soup + Garri', description: 'Calabar-style afang with eba', price: 1600, vendorId: 'r1', category: 'Restaurants' },
      ],
    },
    {
      section: 'Soups & Swallow',
      items: [
        { id: 'r1m4', name: 'Oha Soup + Semo', description: 'Igbo oha soup with semovita', price: 1700, vendorId: 'r1', category: 'Restaurants' },
        { id: 'r1m5', name: 'Banga Soup + Starch', description: 'Delta-style palm nut soup', price: 1800, vendorId: 'r1', category: 'Restaurants' },
      ],
    },
    {
      section: 'Drinks',
      items: [
        { id: 'r1m6', name: 'Chilled Zobo', description: 'Hibiscus drink, lightly sweetened', price: 400, vendorId: 'r1', category: 'Restaurants' },
        { id: 'r1m7', name: 'Bottled Water', description: '75cl', price: 200, vendorId: 'r1', category: 'Restaurants' },
      ],
    },
  ],
  r2: [
    {
      section: 'Chicken',
      items: [
        { id: 'r2m1', name: '2-Piece Chicken', description: 'Crispy fried chicken, 2 pieces', price: 2200, vendorId: 'r2', category: 'Restaurants' },
        { id: 'r2m2', name: 'Chicken Burger', description: 'Grilled chicken fillet with coleslaw', price: 1800, vendorId: 'r2', category: 'Restaurants' },
        { id: 'r2m3', name: 'Chicken Wrap', description: 'Spicy chicken in a soft flour wrap', price: 1500, vendorId: 'r2', category: 'Restaurants' },
      ],
    },
    {
      section: 'Sides',
      items: [
        { id: 'r2m4', name: 'Fries (Large)', description: 'Crispy seasoned fries', price: 800, vendorId: 'r2', category: 'Restaurants' },
        { id: 'r2m5', name: 'Coleslaw', description: 'Creamy homemade coleslaw', price: 400, vendorId: 'r2', category: 'Restaurants' },
        { id: 'r2m6', name: 'Jollof Rice', description: 'Seasoned party jollof', price: 900, vendorId: 'r2', category: 'Restaurants' },
      ],
    },
    {
      section: 'Drinks',
      items: [
        { id: 'r2m7', name: 'Pepsi (50cl)', description: 'Chilled Pepsi', price: 300, vendorId: 'r2', category: 'Restaurants' },
        { id: 'r2m8', name: 'Bottled Water', description: '75cl', price: 200, vendorId: 'r2', category: 'Restaurants' },
      ],
    },
  ],
  r3: [
    {
      section: 'Rice Dishes',
      items: [
        { id: 'r3m1', name: 'Fried Rice + Beef', description: 'Nigerian fried rice with assorted beef', price: 1600, vendorId: 'r3', category: 'Restaurants' },
        { id: 'r3m2', name: 'White Rice + Stew', description: 'Plain rice with tomato beef stew', price: 1200, vendorId: 'r3', category: 'Restaurants' },
        { id: 'r3m3', name: 'Coconut Rice', description: 'Rice cooked in coconut milk', price: 1500, vendorId: 'r3', category: 'Restaurants' },
      ],
    },
    {
      section: 'Proteins',
      items: [
        { id: 'r3m4', name: 'Assorted Beef', description: 'Mixed cow parts, well-seasoned', price: 800, vendorId: 'r3', category: 'Restaurants' },
        { id: 'r3m5', name: 'Grilled Fish', description: 'Whole tilapia, grilled with pepper', price: 1200, vendorId: 'r3', category: 'Restaurants' },
      ],
    },
    {
      section: 'Drinks',
      items: [
        { id: 'r3m6', name: 'Kunu', description: 'Chilled millet drink', price: 300, vendorId: 'r3', category: 'Restaurants' },
        { id: 'r3m7', name: 'Malt Drink', description: 'Cold Malta Guinness', price: 500, vendorId: 'r3', category: 'Restaurants' },
      ],
    },
  ],
  r4: [
    {
      section: 'Snacks',
      items: [
        { id: 'r4m1', name: 'Meat Pie', description: 'Flaky pastry with spiced meat filling', price: 500, vendorId: 'r4', category: 'Restaurants' },
        { id: 'r4m2', name: 'Sausage Roll', description: 'Crispy pastry with pork sausage', price: 350, vendorId: 'r4', category: 'Restaurants' },
        { id: 'r4m3', name: 'Scotch Egg', description: 'Hard-boiled egg wrapped in sausage meat', price: 600, vendorId: 'r4', category: 'Restaurants' },
      ],
    },
    {
      section: 'Full Meals',
      items: [
        { id: 'r4m4', name: 'Jollof Rice + Chicken', description: 'Full meal combo', price: 1800, vendorId: 'r4', category: 'Restaurants' },
        { id: 'r4m5', name: 'Fried Yam + Egg Sauce', description: 'Crispy fried yam with scrambled egg sauce', price: 900, vendorId: 'r4', category: 'Restaurants' },
      ],
    },
    {
      section: 'Drinks',
      items: [
        { id: 'r4m6', name: 'Chivita Juice', description: 'Assorted fruit juice, 50cl', price: 400, vendorId: 'r4', category: 'Restaurants' },
        { id: 'r4m7', name: 'Bottled Water', description: '75cl', price: 200, vendorId: 'r4', category: 'Restaurants' },
      ],
    },
  ],
  s1: [
    {
      section: 'Grains & Staples',
      items: [
        { id: 's1m1', name: 'Rice (5kg)', description: 'Parboiled long grain rice', price: 4500, vendorId: 's1', category: 'Shops' },
        { id: 's1m2', name: 'Semovita (1kg)', description: 'Golden penny semovita', price: 1200, vendorId: 's1', category: 'Shops' },
        { id: 's1m3', name: 'Spaghetti (500g)', description: 'Dangote spaghetti', price: 700, vendorId: 's1', category: 'Shops' },
      ],
    },
    {
      section: 'Proteins',
      items: [
        { id: 's1m4', name: 'Eggs (crate)', description: '30 pieces, fresh farm eggs', price: 3500, vendorId: 's1', category: 'Shops' },
        { id: 's1m5', name: 'Frozen Chicken (1kg)', description: 'Cut and cleaned', price: 2800, vendorId: 's1', category: 'Shops' },
      ],
    },
    {
      section: 'Household',
      items: [
        { id: 's1m6', name: 'Omo Detergent (1kg)', description: 'Washing powder', price: 900, vendorId: 's1', category: 'Shops' },
        { id: 's1m7', name: 'Dettol Soap (3-pack)', description: 'Antibacterial bar soap', price: 1100, vendorId: 's1', category: 'Shops' },
      ],
    },
  ],
  s2: [
    {
      section: 'Beverages',
      items: [
        { id: 's2m1', name: 'Milo (400g)', description: 'Chocolate malt drink', price: 2200, vendorId: 's2', category: 'Shops' },
        { id: 's2m2', name: 'Peak Milk (tin)', description: 'Powdered full cream milk', price: 3500, vendorId: 's2', category: 'Shops' },
        { id: 's2m3', name: 'Lipton Tea (50 bags)', description: 'Yellow label teabags', price: 800, vendorId: 's2', category: 'Shops' },
      ],
    },
    {
      section: 'Snacks',
      items: [
        { id: 's2m4', name: 'Digestive Biscuits', description: 'McVities 400g', price: 1500, vendorId: 's2', category: 'Shops' },
        { id: 's2m5', name: 'Pringles (Original)', description: '165g tube', price: 2000, vendorId: 's2', category: 'Shops' },
      ],
    },
    {
      section: 'Fresh Produce',
      items: [
        { id: 's2m6', name: 'Tomatoes (500g)', description: 'Fresh plum tomatoes', price: 600, vendorId: 's2', category: 'Shops' },
        { id: 's2m7', name: 'Onions (1kg)', description: 'Red onions', price: 700, vendorId: 's2', category: 'Shops' },
      ],
    },
  ],
  s3: [
    {
      section: 'Fresh Produce',
      items: [
        { id: 's3m1', name: 'Plantain (bunch)', description: 'Ripe yellow plantain', price: 1200, vendorId: 's3', category: 'Shops' },
        { id: 's3m2', name: 'Yam (tuber)', description: 'Medium-size water yam', price: 1800, vendorId: 's3', category: 'Shops' },
        { id: 's3m3', name: 'Ugu (bunch)', description: 'Fresh fluted pumpkin leaves', price: 300, vendorId: 's3', category: 'Shops' },
      ],
    },
    {
      section: 'Pantry',
      items: [
        { id: 's3m4', name: 'Palm Oil (1L)', description: 'Unrefined red palm oil', price: 1500, vendorId: 's3', category: 'Shops' },
        { id: 's3m5', name: 'Groundnut Oil (1L)', description: 'Pure groundnut oil', price: 1800, vendorId: 's3', category: 'Shops' },
      ],
    },
  ],
  p1: [
    {
      section: 'Pain Relief',
      items: [
        { id: 'p1m1', name: 'Paracetamol (24 tabs)', description: 'Emzor 500mg tablets', price: 300, vendorId: 'p1', category: 'Pharmacies' },
        { id: 'p1m2', name: 'Ibuprofen (12 tabs)', description: 'Advil 400mg tablets', price: 600, vendorId: 'p1', category: 'Pharmacies' },
        { id: 'p1m3', name: 'Diclofenac Gel', description: 'Topical anti-inflammatory, 30g', price: 1200, vendorId: 'p1', category: 'Pharmacies' },
      ],
    },
    {
      section: 'Vitamins & Supplements',
      items: [
        { id: 'p1m4', name: 'Vitamin C (30 tabs)', description: 'Ascorbic acid 1000mg', price: 800, vendorId: 'p1', category: 'Pharmacies' },
        { id: 'p1m5', name: 'Multivitamin (30 tabs)', description: 'Seven Seas complete', price: 2500, vendorId: 'p1', category: 'Pharmacies' },
        { id: 'p1m6', name: 'Zinc Tablets (20 tabs)', description: 'Immune support, 50mg', price: 600, vendorId: 'p1', category: 'Pharmacies' },
      ],
    },
    {
      section: 'First Aid',
      items: [
        { id: 'p1m7', name: 'Bandage Roll', description: 'Crepe bandage 7.5cm x 4m', price: 500, vendorId: 'p1', category: 'Pharmacies' },
        { id: 'p1m8', name: 'Hand Sanitizer', description: 'Dettol 50ml', price: 700, vendorId: 'p1', category: 'Pharmacies' },
      ],
    },
  ],
  p2: [
    {
      section: 'Malaria & Fever',
      items: [
        { id: 'p2m1', name: 'Lonart DS (3 tabs)', description: 'Artemether/lumefantrine', price: 1500, vendorId: 'p2', category: 'Pharmacies' },
        { id: 'p2m2', name: 'Chloroquine (10 tabs)', description: '250mg tablets', price: 400, vendorId: 'p2', category: 'Pharmacies' },
        { id: 'p2m3', name: 'Paracetamol Syrup', description: 'Emzor, 100ml', price: 500, vendorId: 'p2', category: 'Pharmacies' },
      ],
    },
    {
      section: 'Skincare',
      items: [
        { id: 'p2m4', name: 'Vaseline Lotion (400ml)', description: 'Intensive care', price: 1800, vendorId: 'p2', category: 'Pharmacies' },
        { id: 'p2m5', name: 'Pears Baby Oil', description: 'Pure & gentle, 200ml', price: 1200, vendorId: 'p2', category: 'Pharmacies' },
      ],
    },
    {
      section: 'Diagnostics',
      items: [
        { id: 'p2m6', name: 'Malaria Test Kit', description: 'Rapid diagnostic test', price: 1500, vendorId: 'p2', category: 'Pharmacies' },
        { id: 'p2m7', name: 'Blood Glucose Strips (25)', description: 'Accu-Chek compatible', price: 3500, vendorId: 'p2', category: 'Pharmacies' },
      ],
    },
  ],
  k1: [
    {
      section: 'Delivery Options',
      items: [
        { id: 'k1m1', name: 'Document Delivery', description: 'Envelopes & small docs within Ikorodu', price: 800, vendorId: 'k1', category: 'Packages' },
        { id: 'k1m2', name: 'Small Parcel (up to 2kg)', description: 'Boxed items, same-day', price: 1500, vendorId: 'k1', category: 'Packages' },
        { id: 'k1m3', name: 'Medium Parcel (2–5kg)', description: 'Larger packages, same-day', price: 2500, vendorId: 'k1', category: 'Packages' },
      ],
    },
    {
      section: 'Add-ons',
      items: [
        { id: 'k1m4', name: 'Fragile Handling', description: 'Extra care for breakables', price: 500, vendorId: 'k1', category: 'Packages' },
        { id: 'k1m5', name: 'Proof of Delivery (POD)', description: 'Signed receipt on delivery', price: 300, vendorId: 'k1', category: 'Packages' },
      ],
    },
  ],
  k2: [
    {
      section: 'Parcel Services',
      items: [
        { id: 'k2m1', name: 'Express Document', description: 'Same-day within Lagos', price: 600, vendorId: 'k2', category: 'Packages' },
        { id: 'k2m2', name: 'Parcel (up to 3kg)', description: 'Packed and sealed items', price: 1800, vendorId: 'k2', category: 'Packages' },
        { id: 'k2m3', name: 'Bulk Delivery (5kg+)', description: 'Large items, quoted on weight', price: 3500, vendorId: 'k2', category: 'Packages' },
      ],
    },
    {
      section: 'Add-ons',
      items: [
        { id: 'k2m4', name: 'Insurance Cover', description: 'Up to ₦50,000 item value', price: 500, vendorId: 'k2', category: 'Packages' },
        { id: 'k2m5', name: 'Packaging Box', description: 'Sturdy cardboard box', price: 400, vendorId: 'k2', category: 'Packages' },
      ],
    },
  ],
};

export const ALL_MENU_ITEMS: MenuItem[] = Object.values(MENU_DATA).flatMap((sections) =>
  sections.flatMap((s) => s.items)
);
