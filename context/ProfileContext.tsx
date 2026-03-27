import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

export type SavedAddress = {
  id: string;
  label: string;
  address: string;
};

type ProfileContextType = {
  addresses: SavedAddress[];
  addAddress: (label: string, address: string) => void;
  removeAddress: (id: string) => void;
};

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);

  useEffect(() => {
    if (!user) { setAddresses([]); return; }
    getDoc(doc(db, 'users', user.uid)).then((snap) => {
      if (snap.exists()) setAddresses(snap.data().addresses ?? []);
    });
  }, [user?.uid]);

  const addAddress = (label: string, address: string) => {
    const newAddr: SavedAddress = { id: Date.now().toString(), label, address };
    const updated = [...addresses, newAddr];
    setAddresses(updated);
    if (user) updateDoc(doc(db, 'users', user.uid), { addresses: updated });
  };

  const removeAddress = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    if (user) updateDoc(doc(db, 'users', user.uid), { addresses: updated });
  };

  return (
    <ProfileContext.Provider value={{ addresses, addAddress, removeAddress }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
