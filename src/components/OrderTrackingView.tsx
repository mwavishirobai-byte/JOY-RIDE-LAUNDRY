import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  Sparkles,
  Phone,
  MessageCircle,
  AlertCircle,
  Package,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { api, ApiError } from '../lib/api';
import { formatKES, formatDateTime, getStatusBadgeInfo } from '../lib/utils';
import { useRealtime } from '../lib/useRealtime';
import { useLaundryCart } from '../context/LaundryCartContext';

interface OrderTrackingViewProps {
  initialOrderNumber?: string | null;
  businessPhone: string;
  businessWhatsapp: string;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  initialOrderNumber,
  businessPhone,
  businessWhatsapp,
}) => {
  const { trackingOrderNumber, setTrackingOrderNumber } = useLaundryCart();
  const [searchInput, setSearchInput] = useState(initialOrderNumber || trackingOrderNumber || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { subscribe, isConnected } = useRealtime();

  const cleanWhatsapp = businessWhatsapp.replace(/\D/g, '');
  const formattedWhatsapp = cleanWhatsapp.startsWith('0') ? `254${cleanWhatsapp.slice(1)}` : cleanWhatsapp;

  const fetchOrder = async (orderNum: string) => {
    if (!orderNum.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const data = await api.trackOrder(orderNum.trim());
      setOrder(data);
      setTrackingOrderNumber(data.orderNumber);
    } catch (err: any) {
      setError(err.message || 'No order found with this tracking number. Please check the number and retry.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const numToSearch = initialOrderNumber || trackingOrderNumber;
    if (numToSearch) {
      setSearchInput(numToSearch);
      fetchOrder(numToSearch);
    }
  }, [initialOrderNumber, trackingOrderNumber]);

  // Real-time synchronization: If current order status changes, update view live!
  useEffect(() => {
    const unsubscribeStatus = subscribe('ORDER_STATUS_CHANGED', (payload: { order: Order; oldStatus: string; newStatus: string }) => {
      if (order && payload.order.id === order.id) {
        setOrder(payload.order);
      }
    });

    const unsubscribeUpdate = subscribe('ORDER_UPDATED', (payload: { order: Order }) => {
      if (order && payload.order.id === order.id) {
        setOrder(payload.order);
      }
    });

    return () => {
      unsubscribeStatus();
      unsubscribeUpdate();
    };
  }, [order, subscribe]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(searchInput);
  };

  // 10 Key milestone stages for progress bar
  const stages: { key: OrderStatus[]; label: string; desc: string }[] = [
    { key: ['requested'], label: 'Requested', desc: 'Order placed online' },
    { key: ['confirmed', 'pickup_scheduled'], label: 'Confirmed & Scheduled', desc: 'Eldoret pickup assigned' },
    { key: ['picked_up'], label: 'Picked Up', desc: 'In transit to Hawai Rd facility' },
    { key: ['processing', 'washing', 'drying'], label: 'Washing & Eco-Care', desc: 'Hypoallergenic sanitization' },
    { key: ['ironing_folding', 'quality_check'], label: 'Steam Press & QC', desc: 'Crisp finish & packaging' },
    { key: ['ready'], label: 'Ready for Delivery', desc: 'Packed and prepared' },
    { key: ['out_for_delivery'], label: 'Out for Delivery', desc: 'Rider on route to your address' },
    { key: ['delivered', 'completed'], label: 'Delivered / Completed', desc: 'Order fulfilled' },
  ];

  const getStageIndex = (status: OrderStatus): number => {
    if (status === 'cancelled') return -1;
    for (let i = stages.length - 1; i >= 0; i--) {
      if (stages[i].key.includes(status)) return i;
    }
    return 0;
  };

  const currentStageIndex = order ? getStageIndex(order.orderStatus) : -1;
  const badgeInfo = order ? getStatusBadgeInfo(order.orderStatus) : null;

  return (
    <div className="py-12 bg-slate-50 min-h-[75vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Search Bar & Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Live Eldoret Tracking
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Track Your Laundry Order
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            Enter your order number below to check real-time washing, steam pressing, and doorstep delivery progress in Eldoret.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto pt-2 flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="e.g. JRL-20260819-1234"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 uppercase tracking-wider shadow-xs"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchInput.trim()}
              className="px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold text-sm shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Track</span>
            </button>
          </form>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 max-w-lg mx-auto">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Tracking Lookup Notice</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Order Details Card */}
        {order && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden animate-in fade-in space-y-6">
            {/* Top Bar with Status Badge */}
            <div className="p-6 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-black text-cyan-400">
                    #{order.orderNumber}
                  </span>
                  <span className="text-xs text-slate-400">({order.customerName})</span>
                </div>
                <p className="text-xs text-slate-300">
                  Placed on {formatDateTime(order.createdAt)} • Joy and Ride Hawai Road Hub
                </p>
              </div>

              <div className="flex items-center gap-3">
                {badgeInfo && (
                  <span
                    className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider border ${badgeInfo.bg} ${badgeInfo.text} ${badgeInfo.border} shadow-sm`}
                  >
                    {badgeInfo.label}
                  </span>
                )}
              </div>
            </div>

            {/* Live Visual Timeline */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Live Laundry Lifecycle
                </h4>
                {isConnected && (
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Real-time Auto Synchronized
                  </span>
                )}
              </div>

              {/* Progress Stepper */}
              <div className="relative">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {stages.map((stg, idx) => {
                    const isPassed = currentStageIndex >= idx;
                    const isCurrent = currentStageIndex === idx;

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border transition ${
                          isCurrent
                            ? 'bg-cyan-50/90 border-cyan-500 shadow-xs'
                            : isPassed
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-white border-slate-100 opacity-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                              isPassed
                                ? 'bg-cyan-600 text-white'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                          </div>
                          <span
                            className={`text-xs font-bold ${
                              isCurrent ? 'text-cyan-900 font-extrabold' : 'text-slate-700'
                            }`}
                          >
                            {stg.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{stg.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Details & Delivery Breakdown */}
            <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Pickup & Delivery Info */}
              <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-cyan-600" />
                  Pickup & Delivery Details
                </h4>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 block">Pickup Address:</span>
                    <span className="font-semibold text-slate-800">
                      {order.pickupAddress} ({order.pickupArea})
                    </span>
                    <span className="text-slate-500 block text-[11px]">
                      Scheduled: {order.pickupDate} ({order.pickupTimeSlot})
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block">Delivery Address:</span>
                    <span className="font-semibold text-slate-800">
                      {order.deliveryAddress} ({order.deliveryArea})
                    </span>
                    <span className="text-slate-500 block text-[11px]">
                      Target Delivery: {order.deliveryDate} ({order.deliveryTimeSlot})
                    </span>
                  </div>

                  {order.assignedRider && (
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Assigned Eldoret Rider:</span>
                      <span className="font-bold text-cyan-800">{order.assignedRider}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items & Payment Info */}
              <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-cyan-600" />
                    Laundry Items Summary
                  </h4>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto divide-y divide-slate-100 text-xs">
                    {order.items.map((item, i) => (
                      <div key={i} className="pt-1.5 first:pt-0 flex justify-between">
                        <span className="text-slate-700">
                          {item.quantity}x {item.serviceName}
                        </span>
                        <span className="font-semibold text-slate-900">
                          {formatKES(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>{formatKES(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Fee:</span>
                    <span>{order.deliveryFee === 0 ? 'FREE' : formatKES(order.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-slate-900 text-sm pt-1">
                    <span>Total Amount:</span>
                    <span className="text-cyan-700">{formatKES(order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>Payment Status:</span>
                    <span className="font-bold uppercase text-slate-700">{order.paymentStatus.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status History Logs */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="px-6 pb-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-cyan-600" />
                    Timestamped Audit Updates
                  </h4>
                  <div className="space-y-2 text-xs divide-y divide-slate-200/60">
                    {order.statusHistory.map((hist, i) => (
                      <div key={i} className="pt-2 first:pt-0 flex items-start justify-between gap-4">
                        <div>
                          <span className="font-bold text-slate-800 capitalize">
                            {hist.status.replace(/_/g, ' ')}
                          </span>
                          {hist.note && <p className="text-slate-600 text-[11px] mt-0.5">{hist.note}</p>}
                        </div>
                        <span className="text-[11px] text-slate-400 shrink-0">
                          {formatDateTime(hist.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* WhatsApp & Call Direct Support */}
            <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-600">
                Questions about order <span className="font-semibold text-slate-800">#{order.orderNumber}</span>?
              </span>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent(`Hello Joy and Ride Laundry, inquiring about Order #${order.orderNumber}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Desk</span>
                </a>
                <a
                  href={`tel:${businessPhone}`}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call 0741775878</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
