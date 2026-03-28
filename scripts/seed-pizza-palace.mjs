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

const EMAIL = 'pizzapalace@middlemanapp.com';
const PASSWORD = 'PizzaPalace@2025';

const pizzaOptions = [
  {
    name: 'Size',
    required: true,
    multiSelect: false,
    choices: [
      { name: 'Small (6")', price: 0 },
      { name: 'Medium (10")', price: 1000 },
      { name: 'Large (14")', price: 2000 },
    ],
  },
  {
    name: 'Crust',
    required: true,
    multiSelect: false,
    choices: [
      { name: 'Thin Crust', price: 0 },
      { name: 'Classic Crust', price: 0 },
      { name: 'Stuffed Crust', price: 500 },
    ],
  },
  {
    name: 'Extra Toppings',
    required: false,
    multiSelect: true,
    choices: [
      { name: 'Mushrooms', price: 300 },
      { name: 'Olives', price: 300 },
      { name: 'Onions', price: 200 },
      { name: 'Jalapeños', price: 200 },
      { name: 'Extra Cheese', price: 400 },
    ],
  },
];

const menuItems = [
  {
    name: 'Margherita Pizza',
    description: 'Classic tomato sauce, fresh mozzarella, and basil on a hand-tossed base',
    price: 3500,
    section: 'Pizzas',
    options: pizzaOptions,
  },
  {
    name: 'Pepperoni Pizza',
    description: 'Loaded with premium pepperoni slices on a rich tomato and cheese base',
    price: 4000,
    section: 'Pizzas',
    options: pizzaOptions,
  },
  {
    name: 'BBQ Chicken Pizza',
    description: 'Smoky BBQ sauce, grilled chicken, red onions, and mozzarella',
    price: 4500,
    section: 'Pizzas',
    options: pizzaOptions,
  },
  {
    name: 'Pasta Arrabbiata',
    description: 'Spicy tomato sauce with garlic and fresh herbs',
    price: 2800,
    section: 'Pasta',
    options: [
      {
        name: 'Pasta Type',
        required: true,
        multiSelect: false,
        choices: [
          { name: 'Penne', price: 0 },
          { name: 'Spaghetti', price: 0 },
          { name: 'Fusilli', price: 0 },
        ],
      },
      {
        name: 'Add Protein',
        required: false,
        multiSelect: false,
        choices: [
          { name: 'None', price: 0 },
          { name: 'Grilled Chicken', price: 600 },
          { name: 'Beef', price: 700 },
        ],
      },
    ],
  },
  {
    name: 'Garlic Bread',
    description: 'Toasted bread with garlic butter and herbs, crispy on the outside',
    price: 1200,
    section: 'Sides',
    options: [
      {
        name: 'Size',
        required: true,
        multiSelect: false,
        choices: [
          { name: 'Regular (4 pieces)', price: 0 },
          { name: 'Large (8 pieces)', price: 400 },
        ],
      },
    ],
  },
  {
    name: 'Pepsi',
    description: 'Chilled 50cl bottle',
    price: 600,
    section: 'Drinks',
    options: [],
  },
  {
    name: 'Coca-Cola',
    description: 'Chilled 50cl bottle',
    price: 600,
    section: 'Drinks',
    options: [],
  },
  {
    name: 'Fanta Orange',
    description: 'Chilled 50cl bottle',
    price: 600,
    section: 'Drinks',
    options: [],
  },
];

async function seed() {
  console.log('Creating Pizza Palace vendor account...');

  const cred = await createUserWithEmailAndPassword(auth, EMAIL, PASSWORD);
  const uid = cred.user.uid;
  console.log('Auth user created:', uid);

  const vendorRef = await addDoc(collection(db, 'vendors'), {
    name: 'Pizza Palace',
    category: 'Restaurants',
    area: 'Victoria Island, Lagos',
    deliveryTime: '25–40 min',
    minOrder: '₦1200',
    rating: '4.7',
    open: true,
    ownerId: uid,
    createdAt: serverTimestamp(),
  });
  console.log('Vendor document created:', vendorRef.id);

  await setDoc(doc(db, 'users', uid), {
    uid,
    name: 'Pizza Palace',
    email: EMAIL,
    role: 'vendor',
    vendorId: vendorRef.id,
  });
  console.log('User profile created');

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
  console.log('  Vendor:   Pizza Palace');
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
