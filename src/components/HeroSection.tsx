import React, { useState } from 'react';
import {
  Sparkles,
  Truck,
  Clock,
  ShieldCheck,
  Phone,
  MessageCircle,
  Search,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useLaundryCart } from '../context/LaundryCartContext';

interface HeroSectionProps {
  businessPhone: string;
  businessWhatsapp: string;
  onTrackOrder: (orderNumber: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  businessPhone,
  businessWhatsapp,
  onTrackOrder,
}) => {
  const { setIsOrderModalOpen, setIsBookingModalOpen, setActiveView } = useLaundryCart();
  const [trackInput, setTrackInput] = useState('');

  const cleanWhatsappNumber = businessWhatsapp.replace(/\D/g, '');
  const formattedWhatsapp = cleanWhatsappNumber.startsWith('0')
    ? `254${cleanWhatsappNumber.slice(1)}`
    : cleanWhatsappNumber;

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackInput.trim()) {
      onTrackOrder(trackInput.trim().toUpperCase());
    }
  };

  return (
    <div className="relative overflow-hidden bg-slate-900 text-white">
      {/* Background Graphic & Pattern */}
      <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-15"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=1920&q=80')`,
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-cyan-950/80" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline, CTAs, Highlights */}
          <div className="lg:col-span-7 space-y-6">
            {/* Location & Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wide">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hawai Road, Eldoret • Professional Laundry Care</span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Fresh, Pristine Laundry with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                Doorstep Pickup & Delivery
              </span>{' '}
              in Eldoret.
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Joy and Ride Laundry brings effortless laundry care right to your home or office. From daily wear and executive suits to heavy duvets and blankets, we wash, steam iron, and fold with uncompromising hygiene.
            </p>

            {/* Key Value Points */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2 text-sm text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Hawai Rd & Eldoret Wide</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>24–48h Turnaround</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Eco & Hypoallergenic</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <button
                onClick={() => setIsOrderModalOpen(true)}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-base shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition duration-200 flex items-center gap-2 cursor-pointer"
                id="hero-order-pickup-btn"
              >
                <Truck className="w-5 h-5" />
                <span>Order Laundry Pickup</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveView('services')}
                className="px-5 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700 text-slate-100 font-medium text-base hover:text-white transition cursor-pointer"
                id="hero-view-services-btn"
              >
                <span>View Rates & Services</span>
              </button>
            </div>

            {/* Direct Contact Links */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-slate-400">
              <span className="font-medium text-slate-300">Quick Contact:</span>
              <a
                href={`tel:${businessPhone}`}
                className="inline-flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200 font-semibold transition"
              >
                <Phone className="w-4 h-4" />
                <span>{businessPhone}</span>
              </a>
              <a
                href={`https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent('Hello Joy and Ride Laundry, I would like to book a pickup along Hawai Road / Eldoret.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Right Column: Quick Tracker & Schedule Card */}
          <div className="lg:col-span-5 space-y-4">
            {/* Quick Track Order Card */}
            <div className="bg-slate-800/90 backdrop-blur-md p-6 rounded-2xl border border-slate-700/80 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Track Laundry Order</h3>
                    <p className="text-xs text-slate-400">Check live washing & delivery status</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-900/60 text-cyan-300 border border-cyan-700/40">
                  REAL-TIME
                </span>
              </div>

              <form onSubmit={handleTrackSubmit} className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={trackInput}
                    onChange={(e) => setTrackInput(e.target.value)}
                    placeholder="Enter Order # (e.g., JRL-20260819-1234)"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent uppercase tracking-wider"
                    id="hero-track-order-input"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!trackInput.trim()}
                  className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                  id="hero-track-order-submit-btn"
                >
                  <Search className="w-4 h-4" />
                  <span>Check Status</span>
                </button>
              </form>
            </div>

            {/* Quick Schedule Feature Banner */}
            <div className="bg-gradient-to-br from-cyan-950/60 to-blue-950/60 border border-cyan-800/40 rounded-2xl p-5 text-slate-200">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-white text-sm">Need a customized or recurring pickup?</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    We cater for households, student uniforms, guest houses, and corporate offices in Eldoret.
                  </p>
                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 mt-1 cursor-pointer"
                  >
                    <span>Schedule an Appointment</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
