import React from 'react';
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Building2,
  Home,
  Navigation,
} from 'lucide-react';
import { DEFAULT_ELDORET_AREAS } from '../../server/db';
import { useLaundryCart } from '../context/LaundryCartContext';

interface PickupDeliverySectionProps {
  businessPhone: string;
}

export const PickupDeliverySection: React.FC<PickupDeliverySectionProps> = ({ businessPhone }) => {
  const { setIsOrderModalOpen } = useLaundryCart();

  const pickupSlots = [
    { title: 'Morning Slot', time: '08:00 AM – 11:00 AM', desc: 'Ideal for before-work dropoff or morning pickups' },
    { title: 'Midday Slot', time: '11:00 AM – 02:00 PM', desc: 'Flexible lunch-hour pickups and school uniform care' },
    { title: 'Afternoon Slot', time: '02:00 PM – 05:00 PM', desc: 'Standard afternoon collection across Eldoret' },
    { title: 'Evening Express', time: '05:00 PM – 07:30 PM', desc: 'After-work home delivery and weekend rush' },
  ];

  return (
    <section id="pickup-delivery" className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold uppercase tracking-wider">
            Eldoret Wide Coverage
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Pickup & Delivery in Eldoret
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Whether you are situated along Hawai Road or anywhere across Eldoret town, we collect, professionally wash, and return your garments directly to your doorstep.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Serviced Areas Card */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Eldoret Serviced Neighborhoods</h3>
                <p className="text-xs text-slate-500">Daily scheduled routes across Uasin Gishu county</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DEFAULT_ELDORET_AREAS.map((area, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-cyan-200 transition text-slate-700 text-xs font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>{area}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-cyan-50/80 border border-cyan-200/80 flex items-start gap-3 text-cyan-900 text-xs leading-relaxed">
              <ShieldCheck className="w-5 h-5 text-cyan-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-sm text-cyan-950">Free Pickup Qualification:</span>
                Enjoy <span className="font-semibold">FREE doorstep pickup & delivery</span> on all laundry orders totaling <span className="font-bold">KES 2,000 or more</span>. For smaller loads, our standard flat delivery fee is only KES 150 within Eldoret.
              </div>
            </div>
          </div>

          {/* Time Slots & Dropoff Card */}
          <div className="lg:col-span-5 space-y-6">
            {/* Delivery Time Slots */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Convenient Daily Time Windows</h3>
                  <p className="text-xs text-slate-500">Choose a window that fits your schedule</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {pickupSlots.map((slot, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{slot.title}</span>
                      <span className="text-xs font-semibold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded">
                        {slot.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{slot.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* In-Store Dropoff Option */}
            <div className="bg-gradient-to-br from-slate-900 to-cyan-950 rounded-2xl p-6 text-white space-y-3 shadow-md">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <Building2 className="w-4 h-4" />
                In-Store Dropoff & Collection
              </div>
              <h4 className="text-lg font-bold text-white">Prefer to drop off in person?</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Visit our physical laundry station located directly on <span className="font-semibold text-white">Hawai Road, Eldoret</span>. Walk-ins are welcomed 7 days a week!
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setIsOrderModalOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                >
                  Schedule Your Laundry Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
