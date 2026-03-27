import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCxQEiVPP3FWbcpnF14KvsZz6Xv3UCTGUo',
  authDomain: 'middleman-app-168a2.firebaseapp.com',
  projectId: 'middleman-app-168a2',
  storageBucket: 'middleman-app-168a2.firebasestorage.app',
  messagingSenderId: '493830757954',
  appId: '1:493830757954:web:127a2cb707f17482bb57db',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
