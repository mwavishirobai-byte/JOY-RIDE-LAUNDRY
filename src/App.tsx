import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LaundryCartProvider, useLaundryCart } from './context/LaundryCartContext';
import { api } from './lib/api';
import { ServiceItem, BusinessSettings, Order } from './types';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ServicesSection } from './components/ServicesSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { PickupDeliverySection } from './components/PickupDeliverySection';
import { LocationContactSection } from './components/LocationContactSection';
import { OrderModal } from './components/OrderModal';
import { BookingModal } from './components/BookingModal';
import { AuthModal } from './components/AuthModal';
import { OrderTrackingView } from './components/OrderTrackingView';
import { CustomerDashboard } from './components/CustomerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { Footer } from './components/Footer';
import { useRealtime } from './lib/useRealtime';
import { MessageCircle, ShoppingBag, Sparkles } from 'lucide-react';

import { DEFAULT_ELDORET_AREAS } from '../server/db';

const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: 'Joy and Ride Laundry',
  tagline: "Eldoret's Premier Eco-Friendly Laundry & Dry Cleaning Service",
  phone: '0741775878',
  whatsapp: '0741775878',
  email: 'joyridelaundry@gmail.com',
  address: 'Hawai Road, Eldoret, Uasin Gishu County, Kenya',
  road: 'Hawai Road',
  town: 'Eldoret',
  county: 'Uasin Gishu County',
  verifiedMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Hawai+Road+Eldoret+Kenya',
  openingHours: [
    { days: 'Monday – Friday', hours: '07:00 AM – 07:30 PM' },
    { days: 'Saturday', hours: '07:30 AM – 07:00 PM' },
    { days: 'Sunday & Public Holidays', hours: '08:30 AM – 05:00 PM' },
  ],
  currency: 'KES',
  deliveryFeeConfig: {
    baseFee: 150,
    freeDeliveryThreshold: 2000,
    eldoretAreas: DEFAULT_ELDORET_AREAS,
  },
  announcement: '✨ Free Pickup & Doorstep Delivery in Eldoret on orders of KES 2,000+! Call 0741775878',
  allowBookings: true,
  mpesaPaymentInstructions: 'Paybill: 247247 | Account: JOYRIDE or direct M-Pesa to 0741775878 on delivery.',
};

function MainApp() {
  const { activeView, setActiveView, trackingOrderNumber, setIsOrderModalOpen } = useLaundryCart();
  const { user, isAdmin } = useAuth();
  const { subscribe } = useRealtime();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetchInitialData = useCallback(async () => {
    try {
      const [srvList, setRes] = await Promise.all([
        api.getPublicServices().catch(() => []),
        api.getPublicSettings().catch(() => DEFAULT_SETTINGS),
      ]);
      setServices(srvList);
      if (setRes && setRes.businessName) {
        setSettings(setRes);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Real-time synchronization for services & settings
  useEffect(() => {
    const unsubService = subscribe('SERVICE_UPDATED', () => {
      api.getPublicServices().then((list) => setServices(list));
    });
    const unsubSettings = subscribe('SETTINGS_UPDATED', (payload: { settings: BusinessSettings }) => {
      if (payload.settings) setSettings(payload.settings);
    });

    return () => {
      unsubService();
      unsubSettings();
    };
  }, [subscribe]);

  const handleOrderCreatedSuccess = (order: Order) => {
    // Optionally trigger toast or state update
  };

  const cleanWhatsapp = settings.whatsapp.replace(/\D/g, '');
  const formattedWhatsapp = cleanWhatsapp.startsWith('0') ? `254${cleanWhatsapp.slice(1)}` : cleanWhatsapp;

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col antialiased selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Announcement Bar */}
      {settings.announcement && (
        <div className="bg-gradient-to-r from-cyan-800 via-blue-900 to-slate-900 text-white text-xs font-semibold py-2 px-4 text-center tracking-wide flex items-center justify-center gap-2 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
          <span>{settings.announcement}</span>
        </div>
      )}

      {/* Main Sticky Navbar */}
      <Navbar settings={settings} />

      {/* View Switcher */}
      <main className="flex-1">
        {activeView === 'home' && (
          <div className="animate-in fade-in duration-150">
            <HeroSection
              businessPhone={settings.phone}
              businessWhatsapp={settings.whatsapp}
              address={settings.address}
            />
            <ServicesSection services={services} />
            <HowItWorksSection />
            <PickupDeliverySection businessPhone={settings.phone} />
            <LocationContactSection settings={settings} />
          </div>
        )}

        {activeView === 'tracking' && (
          <div className="animate-in fade-in duration-150">
            <OrderTrackingView
              initialOrderNumber={trackingOrderNumber}
              businessPhone={settings.phone}
              businessWhatsapp={settings.whatsapp}
            />
          </div>
        )}

        {activeView === 'customer-portal' && (
          <div className="animate-in fade-in duration-150">
            <CustomerDashboard />
          </div>
        )}

        {activeView === 'admin-portal' && (
          <div className="animate-in fade-in duration-150">
            <AdminDashboard />
          </div>
        )}
      </main>

      {/* Modals */}
      <OrderModal
        availableServices={services}
        onOrderSuccess={handleOrderCreatedSuccess}
      />
      <BookingModal />
      <AuthModal />
      <AdminLoginModal />

      {/* Footer */}
      {activeView !== 'admin-portal' && <Footer settings={settings} />}

      {/* Floating Action Quick Access (Mobile & Desktop) */}
      {activeView !== 'admin-portal' && (
        <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5">
          {/* Quick WhatsApp FAB */}
          <a
            href={`https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent('Hello Joy and Ride Laundry, I would like to inquire about laundry services.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:scale-105 transition cursor-pointer"
            aria-label="Chat on WhatsApp"
            title="Chat with Joy & Ride on WhatsApp"
          >
            <MessageCircle className="w-6 h-6" />
          </a>

          {/* Quick Schedule Laundry Button */}
          <button
            onClick={() => setIsOrderModalOpen(true)}
            className="px-4 py-2.5 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-xl shadow-cyan-600/30 flex items-center gap-2 hover:scale-102 transition cursor-pointer"
            id="floating-order-btn"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Order Pickup</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LaundryCartProvider>
        <MainApp />
      </LaundryCartProvider>
    </AuthProvider>
  );
}
