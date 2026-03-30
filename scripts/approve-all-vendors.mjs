import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyCxQEiVPP3FWbcpnF14KvsZz6Xv3UCTGUo',
  authDomain: 'middleman-app-168a2.firebaseapp.com',
  projectId: 'middleman-app-168a2',
});

const db = getFirestore(app);

const snap = await getDocs(collection(db, 'vendors'));
let count = 0;
for (const d of snap.docs) {
  if (d.data().approved !== true) {
    await updateDoc(doc(db, 'vendors', d.id), { approved: true });
    console.log(`✅ Approved: ${d.data().name}`);
    count++;
  }
}
console.log(`\nDone — ${count} vendor(s) approved.`);
process.exit(0);
