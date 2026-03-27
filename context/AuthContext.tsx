import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export type UserRole = 'customer' | 'vendor';

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  vendorId?: string;
  phone?: string;
};

export type VendorStoreInfo = {
  storeName: string;
  category: string;
  area: string;
  deliveryTime: string;
};

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, role: UserRole, storeInfo?: VendorStoreInfo) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (snap.exists()) setProfile(snap.data() as UserProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signUp = async (email: string, password: string, name: string, role: UserRole, storeInfo?: VendorStoreInfo) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    let vendorId: string | undefined;
    if (role === 'vendor' && storeInfo) {
      const vendorRef = await addDoc(collection(db, 'vendors'), {
        name: storeInfo.storeName,
        category: storeInfo.category,
        area: storeInfo.area,
        deliveryTime: storeInfo.deliveryTime || '30–45 min',
        minOrder: '₦500',
        rating: '0.0',
        open: true,
        ownerId: cred.user.uid,
        createdAt: serverTimestamp(),
      });
      vendorId = vendorRef.id;
    }

    const profileData: UserProfile = {
      uid: cred.user.uid,
      name,
      email,
      role,
      ...(vendorId ? { vendorId } : {}),
    };
    await setDoc(doc(db, 'users', cred.user.uid), profileData);
    setProfile(profileData);
  };

  const logIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logOut = async () => {
    await signOut(auth);
    setProfile(null);
  };

  const updateProfile = async (data: { name?: string; phone?: string }) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), data);
    setProfile((p) => p ? { ...p, ...data } : p);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, logIn, logOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
