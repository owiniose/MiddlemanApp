import React, { createContext, useContext, useState } from 'react';

export type OptionChoice = { name: string; price: number };
export type OptionGroup = {
  name: string;
  required: boolean;
  multiSelect: boolean;
  choices: OptionChoice[];
};

export type SelectedOption = {
  groupName: string;
  choices: { name: string; price: number }[];
};

export type CartItem = {
  id: string;
  cartKey: string;
  name: string;
  description: string;
  price: number;
  qty: number;
  vendorId: string;
  vendorName: string;
  image?: string;
  selectedOptions?: SelectedOption[];
};

type CartContextType = {
  items: CartItem[];
  vendorId: string | null;
  vendorName: string | null;
  count: number;
  total: number;
  addItem: (item: Omit<CartItem, 'qty'>) => void;
  removeItem: (cartKey: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

function itemEffectivePrice(item: CartItem) {
  const optionsExtra = (item.selectedOptions ?? []).reduce(
    (s, g) => s + g.choices.reduce((cs, c) => cs + c.price, 0), 0,
  );
  return item.price + optionsExtra;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [vendorName, setVendorName] = useState<string | null>(null);

  const addItem = (newItem: Omit<CartItem, 'qty'>) => {
    if (vendorId && vendorId !== newItem.vendorId) {
      setItems([{ ...newItem, qty: 1 }]);
      setVendorId(newItem.vendorId);
      setVendorName(newItem.vendorName);
      return;
    }
    setVendorId(newItem.vendorId);
    setVendorName(newItem.vendorName);
    setItems((prev) => {
      const existing = prev.find((i) => i.cartKey === newItem.cartKey);
      if (existing) return prev.map((i) => i.cartKey === newItem.cartKey ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...newItem, qty: 1 }];
    });
  };

  const removeItem = (cartKey: string) => {
    setItems((prev) => {
      const next = prev
        .map((i) => i.cartKey === cartKey ? { ...i, qty: i.qty - 1 } : i)
        .filter((i) => i.qty > 0);
      if (next.length === 0) { setVendorId(null); setVendorName(null); }
      return next;
    });
  };

  const clearCart = () => {
    setItems([]);
    setVendorId(null);
    setVendorName(null);
  };

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + itemEffectivePrice(i) * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, vendorId, vendorName, count, total, addItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
