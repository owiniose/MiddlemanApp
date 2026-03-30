import React, { createContext, useContext, useState } from 'react';
import { collection, addDoc, serverTimestamp, doc, updateDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { CartItem } from './CartContext';

export type OrderStatus = 'Pending' | 'Preparing' | 'On the way' | 'Delivered' | 'Cancelled';

export type Order = {
  id: string;
  orderNumber?: string;
  vendorId: string;
  vendorName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  address: string;
  phone: string;
  status: OrderStatus;
  createdAt: Date;
};

type OrdersContextType = {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>, customerId: string, customerName: string, extras?: { paymentMethod?: string; paymentReference?: string }) => Promise<{ id: string; orderNumber: string }>;
  cancelOrder: (orderId: string) => void;
  listenToOrders: (customerId: string) => () => void;
};

const OrdersContext = createContext<OrdersContextType | null>(null);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  const addOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'status'>, customerId: string, customerName: string, extras?: { paymentMethod?: string; paymentReference?: string }) => {
    const orderNumber = String(Math.floor(Math.random() * 9_000_000_000) + 1_000_000_000);
    const docRef = await addDoc(collection(db, 'orders'), {
      ...order,
      customerId,
      customerName,
      orderNumber,
      status: 'Pending',
      createdAt: serverTimestamp(),
      ...(extras?.paymentMethod ? { paymentMethod: extras.paymentMethod } : {}),
      ...(extras?.paymentReference ? { paymentReference: extras.paymentReference } : {}),
    });
    return { id: docRef.id, orderNumber };
  };

  const cancelOrder = async (orderId: string) => {
    await updateDoc(doc(db, 'orders', orderId), { status: 'Cancelled' });
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const listenToOrders = (customerId: string) => {
    const q = query(collection(db, 'orders'), where('customerId', '==', customerId));
    const unsub = onSnapshot(q, (snap) => {
      const fetched = snap.docs.map((d) => {
        const data = d.data();
        return {
          ...data,
          id: d.id,
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
        } as Order;
      });
      setOrders(fetched.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    });
    return unsub;
  };

  return (
    <OrdersContext.Provider value={{ orders, addOrder, cancelOrder, listenToOrders }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders must be used within OrdersProvider');
  return ctx;
}
