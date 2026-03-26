import React, { createContext, useContext, useState } from 'react';
import { CartItem } from './CartContext';

export type OrderStatus = 'Preparing' | 'On the way' | 'Delivered';

export type Order = {
  id: string;
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
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => string;
  cancelOrder: (orderId: string) => void;
};

const OrdersContext = createContext<OrdersContextType | null>(null);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  const addOrder = (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    const id = `ORD-${Date.now()}`;
    setOrders((prev) => [
      { ...order, id, createdAt: new Date(), status: 'Preparing' },
      ...prev,
    ]);
    return id;
  };

  const cancelOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  return (
    <OrdersContext.Provider value={{ orders, addOrder, cancelOrder }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders must be used within OrdersProvider');
  return ctx;
}
