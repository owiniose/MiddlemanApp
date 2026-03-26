import React, { createContext, useContext, useState } from 'react';

export type SavedAddress = {
  id: string;
  label: string;
  address: string;
};

type ProfileContextType = {
  name: string;
  phone: string;
  email: string;
  addresses: SavedAddress[];
  updateProfile: (data: { name: string; phone: string; email: string }) => void;
  addAddress: (label: string, address: string) => void;
  removeAddress: (id: string) => void;
};

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);

  const updateProfile = (data: { name: string; phone: string; email: string }) => {
    setName(data.name);
    setPhone(data.phone);
    setEmail(data.email);
  };

  const addAddress = (label: string, address: string) => {
    setAddresses((prev) => [...prev, { id: Date.now().toString(), label, address }]);
  };

  const removeAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <ProfileContext.Provider value={{ name, phone, email, addresses, updateProfile, addAddress, removeAddress }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
