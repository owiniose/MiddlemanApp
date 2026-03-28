import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, addDoc, setDoc, doc, collection, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCxQEiVPP3FWbcpnF14KvsZz6Xv3UCTGUo',
  authDomain: 'middleman-app-168a2.firebaseapp.com',
  projectId: 'middleman-app-168a2',
  storageBucket: 'middleman-app-168a2.firebasestorage.app',
  messagingSenderId: '493830757954',
  appId: '1:493830757954:web:127a2cb707f17482bb57db',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const EMAIL = 'chickenrepublic@middlemanapp.com';
const PASSWORD = 'ChickenRepublic@2025';

const menuItems = [
  // Family & Crew Meals
  { name: 'New Big Crew Meal', description: 'Full Rotisserie Chicken with 4 portions of Spaghetti/Fried/Jollof Rice, 2 portions of Coleslaw/Moin-Moin/Dodo Cubes, and 4 PET drinks', price: 9500, section: 'Family & Crew Meals' },
  { name: 'Pot Lovers Meal', description: '8 pieces Fried Chicken with 4 portions of Spaghetti/Fried Rice/Jollof Rice/Rice & Beans, 2 portions of Dodo Cubes/Moin Moin/Coleslaw, and 4 PET drinks', price: 9000, section: 'Family & Crew Meals' },
  { name: 'MEGA Pot Lovers Meal', description: '10 pieces Fried Chicken with 6 portions of Spaghetti/Fried Rice/Jollof Rice/Rice & Beans, 4 portions of Dodo Cubes/Moin Moin/Coleslaw, and 6 PET drinks', price: 12000, section: 'Family & Crew Meals' },

  // Regular Meals
  { name: 'EggStar Meal with Coca-Cola', description: 'Egg with sauce served with White Rice or Spaghetti plus a Coca-Cola', price: 650, section: 'Regular Meals' },
  { name: 'Refuel Meal', description: '1 piece Fried Chicken with Fried Rice/Jollof Rice/White Rice/Spaghetti and sauce', price: 900, section: 'Regular Meals' },
  { name: 'Refuel Rice & Beans Meal', description: '1 piece Fried Chicken with Rice & Beans plus Pepper Sauce', price: 1000, section: 'Regular Meals' },
  { name: 'Refuel Dodo Meal', description: '1 piece Fried Chicken with Spaghetti/Fried/Jollof Rice/Rice & Beans plus Plantain Cubes', price: 1200, section: 'Regular Meals' },
  { name: 'Refuel Dodo Max Meal', description: '1 piece Fried Chicken with Spaghetti/Fried/Jollof Rice/Rice & Beans, Plantain Cubes, and a PET drink', price: 1350, section: 'Regular Meals' },
  { name: 'Refuel Max Meal', description: '1 piece Fried Chicken with Fried Rice/Jollof Rice/White Rice/Spaghetti, sauce, Coleslaw/Moin Moin, and a PET drink', price: 1350, section: 'Regular Meals' },
  { name: 'Refuel Max Rice & Beans Meal', description: '1 piece Fried Chicken with Rice & Beans, Sauce, Coleslaw/Moin Moin, and a PET drink', price: 1450, section: 'Regular Meals' },
  { name: 'New Spicy Yam Max Meal', description: '1 piece Fried Chicken with Spicy Yam, Moin Moin/Coleslaw, Pepper Sauce, and a PET drink', price: 1600, section: 'Regular Meals' },
  { name: 'Express Meal with Chips', description: '1 piece Fried Chicken with Regular Chips and a PET drink', price: 1800, section: 'Regular Meals' },
  { name: 'Citizens Meal', description: '2 pieces Fried Chicken with Fried/Jollof Rice/Rice & Beans/Spaghetti/White Rice, sauce, and a PET drink', price: 2000, section: 'Regular Meals' },
  { name: 'New Citizens Spicy Yam Meal', description: '2 pieces Fried Chicken with Spicy Yam, Pepper Sauce, and a PET drink', price: 2000, section: 'Regular Meals' },
  { name: 'Citizens Meal with Chips', description: '2 pieces Fried Chicken with Regular Chips and a PET drink', price: 2200, section: 'Regular Meals' },

  // Burgers, Wraps & ChickWhizz
  { name: 'Original ChickWhizz', description: 'ChickWhizz sandwich with Fried Chicken, Lettuce, and Secret Mayo Sauce', price: 1300, section: 'Burgers, Wraps & ChickWhizz' },
  { name: 'Original ChickWhizz Meal', description: 'ChickWhizz sandwich with Regular Chips and a PET drink', price: 2300, section: 'Burgers, Wraps & ChickWhizz' },
  { name: 'NEW Spicy ChickWhizz', description: 'Spicy ChickWhizz sandwich with Fried Chicken, Lettuce, and Spicy Sauce', price: 1400, section: 'Burgers, Wraps & ChickWhizz' },
  { name: 'NEW Spicy ChickWhizz Meal', description: 'Spicy ChickWhizz sandwich with Regular Chips and a PET drink', price: 2400, section: 'Burgers, Wraps & ChickWhizz' },
  { name: 'Double ChickWhizz', description: 'Double ChickWhizz sandwich with Fried Chicken, Lettuce, and Secret Mayo', price: 1500, section: 'Burgers, Wraps & ChickWhizz' },
  { name: 'Double ChickWhizz Meal', description: 'Double ChickWhizz sandwich with Regular Chips and a PET drink', price: 2500, section: 'Burgers, Wraps & ChickWhizz' },
  { name: 'NEW Double Spicy ChickWhizz', description: 'Double Spicy ChickWhizz sandwich with Fried Chicken, Lettuce, and Spicy Sauce', price: 1600, section: 'Burgers, Wraps & ChickWhizz' },
  { name: 'NEW Double Spicy ChickWhizz Meal', description: 'Double Spicy ChickWhizz sandwich with Regular Chips and a PET drink', price: 2600, section: 'Burgers, Wraps & ChickWhizz' },
  { name: 'WrapStar', description: 'Fried Chicken with Lettuce and Secret Sauce in a Tortilla Wrap', price: 1600, section: 'Burgers, Wraps & ChickWhizz' },
  { name: 'WrapStar Meal', description: 'WrapStar with Regular Chips and a PET drink', price: 2600, section: 'Burgers, Wraps & ChickWhizz' },
  { name: 'Chief Burger', description: 'Chief Burger with Fried Chicken, Lettuce, Cheese, and Secret Sauce on a Fresh Bun', price: 1900, section: 'Burgers, Wraps & ChickWhizz' },
  { name: 'Chief Burger Meal', description: 'Chief Burger with Regular Chips and a PET drink', price: 3100, section: 'Burgers, Wraps & ChickWhizz' },
  { name: 'Big Boyz Meal', description: 'Chief Burger with 1 piece Fried Chicken, Spaghetti/Fried Rice/Jollof Rice/Rice & Beans, Coleslaw, and a Monster Energy drink', price: 3500, section: 'Burgers, Wraps & ChickWhizz' },

  // Chicken
  { name: 'Soulfully Spiced Fried Chicken (1 piece)', description: 'Available in Traditional, Crunchy, or Rotisserie', price: 800, section: 'Chicken' },
  { name: 'Chicken Salad', description: 'Garden fresh salad with Rotisserie Chicken and dressing', price: 1600, section: 'Chicken' },

  // Sides & Extras
  { name: 'Dodo Cubes (Plantain)', description: 'Single portion of golden fried Plantain cubes', price: 450, section: 'Sides & Extras' },
  { name: 'Coleslaw', description: 'Single portion of garden fresh Coleslaw with Mayonnaise', price: 450, section: 'Sides & Extras' },
  { name: 'Pasta Salad', description: 'Single portion of Pasta Salad with fresh veggies and mayo dressing', price: 450, section: 'Sides & Extras' },
  { name: 'Newly Improved Moin-Moin', description: 'Single portion of Moin Moin', price: 450, section: 'Sides & Extras' },
  { name: 'Pepper Sauce', description: 'Small tub of Pepper Sauce with West African herbs and spices', price: 250, section: 'Sides & Extras' },
  { name: 'Fried Rice', description: 'Single portion of Fried Rice', price: 600, section: 'Sides & Extras' },
  { name: 'Rice & Beans with Sauce', description: 'Single portion of Rice & Beans with sauce', price: 700, section: 'Sides & Extras' },
  { name: 'Only Chips (Regular)', description: 'Portion of golden fried chips', price: 700, section: 'Sides & Extras' },
  { name: 'NEW Spicy Yam + Sauce', description: 'Spicy Yam Chips with signature pepper sauce (Regular or Large)', price: 800, section: 'Sides & Extras' },

  // Pies
  { name: 'Chicken Pie', description: 'Hot fresh pie with Chicken filling', price: 500, section: 'Pies' },
  { name: 'Meat Pie', description: 'Hot fresh pie with Beef filling', price: 500, section: 'Pies' },
];

async function seed() {
  console.log('Creating Chicken Republic vendor account...');

  // 1. Create auth user
  const cred = await createUserWithEmailAndPassword(auth, EMAIL, PASSWORD);
  const uid = cred.user.uid;
  console.log('Auth user created:', uid);

  // 2. Create vendor document
  const vendorRef = await addDoc(collection(db, 'vendors'), {
    name: 'Chicken Republic',
    category: 'Restaurants',
    area: 'Lagos',
    deliveryTime: '20–35 min',
    minOrder: '₦650',
    rating: '4.5',
    open: true,
    ownerId: uid,
    createdAt: serverTimestamp(),
  });
  console.log('Vendor document created:', vendorRef.id);

  // 3. Create user profile
  await setDoc(doc(db, 'users', uid), {
    uid,
    name: 'Chicken Republic',
    email: EMAIL,
    role: 'vendor',
    vendorId: vendorRef.id,
  });
  console.log('User profile created');

  // 4. Add all menu items
  console.log(`Adding ${menuItems.length} menu items...`);
  for (const item of menuItems) {
    await addDoc(collection(db, 'menuItems'), {
      ...item,
      vendorId: vendorRef.id,
      image: null,
      available: true,
      createdAt: serverTimestamp(),
    });
    process.stdout.write('.');
  }

  console.log('\n\nDone!');
  console.log('─────────────────────────────');
  console.log('  Vendor:   Chicken Republic');
  console.log(`  Email:    ${EMAIL}`);
  console.log(`  Password: ${PASSWORD}`);
  console.log(`  VendorID: ${vendorRef.id}`);
  console.log('─────────────────────────────');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
