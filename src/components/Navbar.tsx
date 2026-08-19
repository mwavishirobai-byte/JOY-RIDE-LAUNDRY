import React, { useState } from 'react';
import {
  Phone,
  MessageCircle,
  MapPin,
  ShoppingBag,
  User as UserIcon,
  Shield,
  Menu,
  X,
  Sparkles,
  Search,
  Bell,
  Clock,
} from 'lucide-react';
import { useLaundryCart } from '../context/LaundryCartContext';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../lib/useRealtime';

interface NavbarProps {
  businessPhone?: string;
  businessWhatsapp?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  businessPhone = '0741775878',
  businessWhatsapp = '0741775878',
}) => {
  const { totalItemsCount, subtotal, setIsOrderModalOpen, setIsAuthModalOpen, setIsAdminLoginModalOpen, activeView, setActiveView } =
    useLaundryCart();
  const { user, isAdmin, logout } = useAuth();
  const { isConnected } = useRealtime();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const cleanWhatsappNumber = businessWhatsapp.replace(/\D/g, '');
  const formattedWhatsapp = cleanWhatsappNumber.startsWith('0')
    ? `254${cleanWhatsappNumber.slice(1)}`
    : cleanWhatsappNumber;

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services & Pricing' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'pickup', label: 'Pickup & Delivery' },
    { id: 'tracking', label: 'Track Order' },
    { id: 'contact', label: 'Location & Contact' },
  ];

  const handleNavClick = (viewId: any) => {
    setActiveView(viewId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Notice / Announcement & Contact Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
              <MapPin className="w-3.5 h-3.5" />
              Hawai Road, Eldoret, Kenya
            </span>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="hidden md:inline-flex items-center gap-1 text-slate-300">
              <Clock className="w-3 h-3 text-slate-400" />
              Mon–Sat: 7:00 AM – 7:30 PM | Sun: 8:30 AM – 5:00 PM
            </span>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {/* Realtime SSE indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400" title={isConnected ? 'Live server connection active' : 'Connecting to live updates...'}>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-[11px]">{isConnected ? 'Live Updates' : 'Connecting'}</span>
            </div>

            <a
              href={`tel:${businessPhone}`}
              className="flex items-center gap-1 text-slate-200 hover:text-white transition font-medium"
              id="top-call-btn"
            >
              <Phone className="w-3 h-3 text-cyan-400" />
              <span>{businessPhone}</span>
            </a>
            <a
              href={`https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent('Hello Joy and Ride Laundry, I would like to inquire about laundry pickup in Eldoret.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition font-medium"
              id="top-whatsapp-btn"
            >
              <MessageCircle className="w-3 h-3" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
            id="brand-logo-btn"
          >
            <div className="w-11 h-11 rounded-xl bg-linear-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-cyan-600/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl tracking-tight text-slate-900">
                  Joy & Ride <span className="text-cyan-600">Laundry</span>
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-600 tracking-wider uppercase block -mt-0.5">
                Hawai Road • Eldoret
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = activeView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                    isActive
                      ? 'text-cyan-700 bg-cyan-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  id={`nav-link-${link.id}`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Actions: Laundry Bag, User/Account, Admin */}
          <div className="flex items-center gap-2.5">
            {/* Laundry Bag Button */}
            <button
              onClick={() => setIsOrderModalOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-medium text-sm shadow-sm hover:shadow-md transition cursor-pointer"
              id="laundry-bag-btn"
              title="View laundry bag and place order"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Laundry Bag</span>
              {totalItemsCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold bg-white text-cyan-700 rounded-full min-w-5 h-5">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* User Account / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-sm font-medium transition cursor-pointer"
                  id="user-menu-btn"
                >
                  <div className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-xs">
                    {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden md:inline max-w-28 truncate">{user.fullName}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">{user.fullName}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setActiveView('customer-portal');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 flex items-center gap-2"
                      id="dropdown-customer-dashboard-btn"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      My Orders & Profile
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setActiveView('admin-portal');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-purple-700 hover:bg-purple-50 flex items-center gap-2 font-medium"
                        id="dropdown-admin-dashboard-btn"
                      >
                        <Shield className="w-4 h-4 text-purple-600" />
                        Admin Dashboard
                      </button>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                          setActiveView('home');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                        id="logout-btn"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-sm font-medium hover:bg-slate-50 transition cursor-pointer"
                id="login-register-btn"
              >
                <UserIcon className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              id="mobile-menu-toggle-btn"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 shadow-lg">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = activeView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium transition ${
                    isActive ? 'bg-cyan-50 text-cyan-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setIsOrderModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 px-4 bg-cyan-600 text-white rounded-xl font-medium text-center shadow-xs flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Schedule Laundry Pickup</span>
            </button>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <a
                href={`tel:${businessPhone}`}
                className="py-2.5 px-3 bg-slate-100 text-slate-800 rounded-lg text-sm font-medium text-center flex items-center justify-center gap-1.5"
              >
                <Phone className="w-4 h-4 text-cyan-600" />
                <span>Call Us</span>
              </a>
              <a
                href={`https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent('Hello Joy and Ride Laundry, I need laundry service.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 bg-emerald-600 text-white rounded-lg text-sm font-medium text-center flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
