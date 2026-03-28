import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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

const EMAIL = 'owiniose@yahoo.com';
const PASSWORD = 'owiniose@yahoo.com';

try {
  const cred = await createUserWithEmailAndPassword(auth, EMAIL, PASSWORD);
  await setDoc(doc(db, 'users', cred.user.uid), {
    uid: cred.user.uid,
    name: 'Admin',
    email: EMAIL,
    role: 'admin',
  });
  console.log('✅ Admin account created:', cred.user.uid);
} catch (e) {
  console.error('❌ Error:', e.message);
}
process.exit(0);
