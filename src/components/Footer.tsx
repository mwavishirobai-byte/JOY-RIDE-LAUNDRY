import React from 'react';
import {
  Sparkles,
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  Shield,
  Heart,
  ChevronRight,
  Truck,
} from 'lucide-react';
import { BusinessSettings } from '../types';
import { useLaundryCart } from '../context/LaundryCartContext';
import { useAuth } from '../context/AuthContext';

interface FooterProps {
  settings: BusinessSettings;
}

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  const { setActiveView, setIsOrderModalOpen, setIsBookingModalOpen, setIsAdminLoginModalOpen } = useLaundryCart();
  const { isAdmin } = useAuth();

  const cleanWhatsapp = settings.whatsapp.replace(/\D/g, '');
  const formattedWhatsapp = cleanWhatsapp.startsWith('0') ? `254${cleanWhatsapp.slice(1)}` : cleanWhatsapp;

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
      {/* Top Banner / CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-blue-950/80 rounded-3xl p-8 sm:p-10 border border-cyan-800/40 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6 mb-12">
          <div className="space-y-2 text-center lg:text-left">
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
              Eldoret's Reliable Laundry Partner
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Ready for clean, crisp, and fresh clothes?
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              We pick up from your Eldoret doorstep, professionally sanitize and press your garments, and return them ready to wear.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsOrderModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs shadow-lg transition cursor-pointer"
            >
              Order Pickup Now
            </button>
            <a
              href={`https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent('Hello Joy and Ride Laundry, I would like to book a laundry pickup.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700 transition"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>

        {/* 4-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-slate-850">
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-cyan-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white block tracking-tight">
                  Joy and Ride Laundry
                </span>
                <span className="text-[11px] text-cyan-400 font-semibold block -mt-1">
                  Eldoret, Kenya
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              Joy and Ride Laundry is Eldoret's dedicated eco-friendly garment and fabric care provider. Conveniently located on Hawai Road, offering scheduled doorstep collections, heavy duvet washing, and executive suit steam pressing.
            </p>

            <div className="flex items-center gap-3 pt-1 text-slate-300">
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Hawai Road, Eldoret
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Quick Navigation</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    setActiveView('home');
                    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-cyan-400 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>Services & Pricing</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveView('home');
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-cyan-400 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>How It Works</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveView('home');
                    document.getElementById('pickup-delivery')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-cyan-400 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>Eldoret Pickup Routes</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveView('tracking');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-cyan-400 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>Track Laundry Status</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="hover:text-cyan-400 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <span>Book Bulk / Commercial Laundry</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Contact & Support</h4>
            <div className="space-y-2">
              <a
                href={`tel:${settings.phone}`}
                className="flex items-center gap-2 text-slate-300 hover:text-white transition"
              >
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Call {settings.phone}</span>
              </a>

              <a
                href={`https://wa.me/${formattedWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-300 hover:text-white transition"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>WhatsApp: {settings.whatsapp}</span>
              </a>

              <a
                href={`mailto:${settings.email}`}
                className="flex items-center gap-2 text-slate-300 hover:text-white transition break-all"
              >
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{settings.email}</span>
              </a>
            </div>
          </div>

          {/* Working Hours */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Working Hours</h4>
            <div className="space-y-1.5 text-[11px]">
              <div className="text-slate-300">
                <span className="font-semibold block text-white">Mon – Fri:</span>
                7:00 AM – 7:30 PM
              </div>
              <div className="text-slate-300">
                <span className="font-semibold block text-white">Saturday:</span>
                7:30 AM – 7:00 PM
              </div>
              <div className="text-slate-300">
                <span className="font-semibold block text-white">Sunday:</span>
                8:30 AM – 5:00 PM
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} Joy and Ride Laundry. All rights reserved. Hawai Road, Eldoret, Kenya.
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (isAdmin) {
                  setActiveView('admin-portal');
                } else {
                  setIsAdminLoginModalOpen(true);
                }
              }}
              className="hover:text-slate-300 flex items-center gap-1 transition cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>Staff Portal</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
