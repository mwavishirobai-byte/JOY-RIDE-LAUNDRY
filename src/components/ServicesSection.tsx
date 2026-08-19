import React, { useState } from 'react';
import {
  Sparkles,
  ShoppingBag,
  Plus,
  Minus,
  Clock,
  Tag,
  Check,
  Info,
  Layers,
  Shirt,
  Bed,
  Flame,
} from 'lucide-react';
import { ServiceItem, LaundryCategory } from '../types';
import { formatKES } from '../lib/utils';
import { useLaundryCart } from '../context/LaundryCartContext';

interface ServicesSectionProps {
  services: ServiceItem[];
  loading?: boolean;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ services, loading }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { items, addItem, updateQuantity, setIsOrderModalOpen } = useLaundryCart();

  const categories: { id: string; label: string; icon: any }[] = [
    { id: 'all', label: 'All Services', icon: Layers },
    { id: 'clothing', label: 'Everyday Clothing', icon: Shirt },
    { id: 'bedding', label: 'Bedding & Duvets', icon: Bed },
    { id: 'specialized', label: 'Suits & Delicates', icon: Sparkles },
    { id: 'ironing', label: 'Steam Ironing', icon: Flame },
  ];

  const filteredServices = services.filter((srv) => {
    if (!srv.active) return false;
    if (selectedCategory === 'all') return true;
    return srv.category === selectedCategory;
  });

  const getItemQuantityInCart = (serviceId: string): number => {
    const found = items.find((i) => i.service.id === serviceId);
    return found ? found.quantity : 0;
  };

  return (
    <section id="services-section" className="py-16 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100/80 text-cyan-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Transparent Eldoret Rates
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Our Laundry & Garment Care Services
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Select items or laundry weight below to calculate your estimated total and request doorstep pickup along Hawai Road and across Eldoret.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-700 text-white shadow-md shadow-cyan-700/20'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
                id={`cat-tab-${cat.id}`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-4">
                <div className="h-44 bg-slate-200 rounded-xl" />
                <div className="h-6 bg-slate-200 rounded-md w-3/4" />
                <div className="h-4 bg-slate-100 rounded-md w-full" />
                <div className="h-8 bg-slate-200 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-lg mx-auto space-y-3">
            <Info className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-800 text-lg">No active services in this category</h3>
            <p className="text-sm text-slate-500">
              Please check other categories or contact Joy and Ride Laundry directly at 0741775878.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const qty = getItemQuantityInCart(service.id);

              return (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between group"
                  id={`service-card-${service.id}`}
                >
                  {/* Service Image & Badges */}
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={service.image}
                      alt={service.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                    {/* Popular Badge */}
                    {service.popular && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500 text-white shadow-sm flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Popular Choice
                      </span>
                    )}

                    {/* Turnaround Badge */}
                    <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-900/80 backdrop-blur-xs text-slate-100 flex items-center gap-1.5 border border-white/10">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      {service.turnaroundHours}h Ready Time
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-slate-900 text-lg leading-snug">
                          {service.name}
                        </h3>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
                        {service.description}
                      </p>

                      {/* Tags */}
                      {service.tags && service.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {service.tags.slice(0, 3).map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price and Cart Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs text-slate-400 block font-medium">Standard Rate</span>
                        <span className="text-lg font-extrabold text-cyan-700">
                          {formatKES(service.basePrice)}
                        </span>
                        <span className="text-xs font-medium text-slate-500"> / {service.unit}</span>
                      </div>

                      {/* Quantity or Add Button */}
                      {qty === 0 ? (
                        <button
                          onClick={() => addItem(service, 1)}
                          className="px-3.5 py-2 rounded-xl bg-cyan-50 text-cyan-700 hover:bg-cyan-600 hover:text-white border border-cyan-200 font-semibold text-xs transition duration-150 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          id={`add-srv-${service.id}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Bag</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 bg-cyan-50 border border-cyan-300 rounded-xl p-1">
                          <button
                            onClick={() => updateQuantity(service.id, qty - 1)}
                            className="w-7 h-7 rounded-lg bg-white text-cyan-800 hover:bg-cyan-200 flex items-center justify-center font-bold text-sm shadow-2xs cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-bold text-cyan-900 min-w-5 text-center">
                            {qty}
                          </span>
                          <button
                            onClick={() => updateQuantity(service.id, qty + 1)}
                            className="w-7 h-7 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 flex items-center justify-center font-bold text-sm shadow-2xs cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Cart Floating Bar or Checkout Button */}
        {items.length > 0 && (
          <div className="mt-12 p-5 bg-gradient-to-r from-slate-900 to-cyan-950 text-white rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">
                  {items.reduce((s, i) => s + i.quantity, 0)} Items Selected in Laundry Bag
                </h4>
                <p className="text-xs text-slate-300">
                  Ready to choose your pickup and delivery address in Eldoret?
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOrderModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition shadow-md flex items-center gap-2 cursor-pointer"
              id="checkout-bag-bar-btn"
            >
              <span>Complete Laundry Order</span>
              <span className="text-xs bg-slate-900/40 text-slate-950 px-2 py-0.5 rounded font-mono">
                {formatKES(items.reduce((s, i) => s + i.service.basePrice * i.quantity, 0))}
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
