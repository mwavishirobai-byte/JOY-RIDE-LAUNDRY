import React, { createContext, useContext, useState } from 'react';
import { ServiceItem } from '../types';

export interface CartItem {
  service: ServiceItem;
  quantity: number;
  notes?: string;
}

interface LaundryCartContextType {
  items: CartItem[];
  addItem: (service: ServiceItem, quantity?: number) => void;
  updateQuantity: (serviceId: string, quantity: number) => void;
  removeItem: (serviceId: string) => void;
  clearCart: () => void;
  subtotal: number;
  totalItemsCount: number;
  isOrderModalOpen: boolean;
  setIsOrderModalOpen: (open: boolean) => void;
  isBookingModalOpen: boolean;
  setIsBookingModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isAdminLoginModalOpen: boolean;
  setIsAdminLoginModalOpen: (open: boolean) => void;
  trackingOrderNumber: string | null;
  setTrackingOrderNumber: (num: string | null) => void;
  activeView: 'home' | 'services' | 'how-it-works' | 'pickup' | 'tracking' | 'contact' | 'customer-portal' | 'admin-portal';
  setActiveView: (view: 'home' | 'services' | 'how-it-works' | 'pickup' | 'tracking' | 'contact' | 'customer-portal' | 'admin-portal') => void;
}

const LaundryCartContext = createContext<LaundryCartContextType | undefined>(undefined);

export const LaundryCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [trackingOrderNumber, setTrackingOrderNumber] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'home' | 'services' | 'how-it-works' | 'pickup' | 'tracking' | 'contact' | 'customer-portal' | 'admin-portal'>('home');

  const addItem = (service: ServiceItem, quantity: number = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.service.id === service.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx].quantity += quantity;
        return next;
      }
      return [...prev, { service, quantity, notes: '' }];
    });
  };

  const updateQuantity = (serviceId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((i) => i.service.id !== serviceId);
      }
      return prev.map((i) => (i.service.id === serviceId ? { ...i, quantity } : i));
    });
  };

  const removeItem = (serviceId: string) => {
    setItems((prev) => prev.filter((i) => i.service.id !== serviceId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((sum, item) => sum + item.service.basePrice * item.quantity, 0);
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <LaundryCartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        totalItemsCount,
        isOrderModalOpen,
        setIsOrderModalOpen,
        isBookingModalOpen,
        setIsBookingModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isAdminLoginModalOpen,
        setIsAdminLoginModalOpen,
        trackingOrderNumber,
        setTrackingOrderNumber,
        activeView,
        setActiveView,
      }}
    >
      {children}
    </LaundryCartContext.Provider>
  );
};

export function useLaundryCart() {
  const ctx = useContext(LaundryCartContext);
  if (!ctx) {
    throw new Error('useLaundryCart must be used within a LaundryCartProvider');
  }
  return ctx;
}
