import React from 'react';
import {
  CalendarCheck,
  Sparkles,
  Shirt,
  Truck,
  CheckCircle2,
  PhoneCall,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useLaundryCart } from '../context/LaundryCartContext';

export const HowItWorksSection: React.FC = () => {
  const { setIsOrderModalOpen } = useLaundryCart();

  const steps = [
    {
      number: '01',
      title: 'Schedule Pickup or Drop Off',
      description:
        'Choose your preferred time slot online, call 0741775878, or drop your garments at our Hawai Road laundry location in Eldoret.',
      icon: CalendarCheck,
      color: 'from-blue-600 to-cyan-600',
    },
    {
      number: '02',
      title: 'Inspection & Gentle Wash',
      description:
        'Our specialists sort garments by fabric care tag, pretreat tough stains, and wash using hypoallergenic, color-safe detergents.',
      icon: Sparkles,
      color: 'from-cyan-600 to-teal-600',
    },
    {
      number: '03',
      title: 'Steam Pressing & Crisp Folding',
      description:
        'Garments are gently dried, precision steam pressed, and neatly packed in protective covers or placed on crisp hangers.',
      icon: Shirt,
      color: 'from-teal-600 to-emerald-600',
    },
    {
      number: '04',
      title: 'Fast Delivery to your Doorstep',
      description:
        'Our Eldoret dispatch team delivers fresh, sanitized clothes straight to your home or office on schedule. Pay with M-Pesa or Cash.',
      icon: Truck,
      color: 'from-indigo-600 to-blue-600',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
            Simple 4-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How Joy and Ride Laundry Works
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            We make laundry in Eldoret effortless so you can focus on work, family, and life.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between"
              >
                {/* Step Number Top Pill */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${step.color} text-white flex items-center justify-center shadow-md shadow-cyan-600/10`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-slate-300">
                    {step.number}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-1.5 text-xs font-semibold text-cyan-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Joy & Ride Quality Standard</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 bg-linear-to-r from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="space-y-2 text-center sm:text-left">
            <h4 className="text-xl font-bold text-white">Ready for fresh laundry this week?</h4>
            <p className="text-sm text-slate-300 max-w-xl">
              Book online in under 60 seconds or call our Hawai Road desk at 0741775878.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsOrderModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition cursor-pointer shadow-sm"
            >
              Request Doorstep Pickup
            </button>
            <a
              href="tel:0741775878"
              className="px-4 py-3 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-white font-medium text-sm transition flex items-center gap-1.5"
            >
              <PhoneCall className="w-4 h-4 text-cyan-400" />
              <span>Call 0741775878</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
