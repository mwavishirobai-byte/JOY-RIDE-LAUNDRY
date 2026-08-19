import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Truck,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Building,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLaundryCart } from '../context/LaundryCartContext';
import { useAuth } from '../context/AuthContext';
import { ServiceItem, Order, DEFAULT_ELDORET_AREAS } from '../types';
import { formatKES } from '../lib/utils';
import { api, ApiError } from '../lib/api';

interface OrderModalProps {
  availableServices: ServiceItem[];
  onOrderSuccess: (order: Order) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  availableServices,
  onOrderSuccess,
}) => {
  const {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    isOrderModalOpen,
    setIsOrderModalOpen,
    setActiveView,
    setTrackingOrderNumber,
  } = useLaundryCart();

  const { user } = useAuth();

  // Form State
  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');

  const [pickupOption, setPickupOption] = useState<'doorstep_pickup' | 'store_dropoff'>('doorstep_pickup');
  const [pickupAddress, setPickupAddress] = useState(user?.address || '');
  const [pickupArea, setPickupArea] = useState(user?.area || 'Hawai Road & Environs');
  const [pickupDate, setPickupDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [pickupTimeSlot, setPickupTimeSlot] = useState('08:00 AM – 11:00 AM');

  const [deliveryOption, setDeliveryOption] = useState<'doorstep_delivery' | 'store_pickup'>('doorstep_delivery');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [deliveryArea, setDeliveryArea] = useState(user?.area || 'Hawai Road & Environs');
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().slice(0, 10);
  });
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('02:00 PM – 05:00 PM');

  const [paymentMethod, setPaymentMethod] = useState<'pay_on_delivery' | 'mpesa' | 'cash'>('pay_on_delivery');
  const [customerNotes, setCustomerNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  // Sync user details if user signs in
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.fullName);
      if (!customerPhone) setCustomerPhone(user.phone);
      if (!customerEmail) setCustomerEmail(user.email);
      if (!pickupAddress && user.address) setPickupAddress(user.address);
    }
  }, [user]);

  if (!isOrderModalOpen) return null;

  const deliveryFee =
    pickupOption === 'doorstep_pickup' || deliveryOption === 'doorstep_delivery'
      ? subtotal >= 2000
        ? 0
        : 150
      : 0;

  const totalAmount = subtotal + deliveryFee;

  const timeSlots = [
    '08:00 AM – 11:00 AM',
    '11:00 AM – 02:00 PM',
    '02:00 PM – 05:00 PM',
    '05:00 PM – 07:30 PM',
  ];

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError('Please add at least one laundry item to your order.');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setError('Please provide your full name and phone number for delivery contact.');
      return;
    }

    if (pickupOption === 'doorstep_pickup' && !pickupAddress.trim()) {
      setError('Please enter your specific pickup address / estate in Eldoret.');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        pickupOption,
        pickupAddress: pickupOption === 'doorstep_pickup' ? pickupAddress.trim() : 'Joy & Ride Laundry, Hawai Road, Eldoret',
        pickupArea,
        pickupDate,
        pickupTimeSlot,
        deliveryOption,
        deliveryAddress: deliveryOption === 'doorstep_delivery' ? (deliveryAddress.trim() || pickupAddress.trim()) : 'Joy & Ride Laundry, Hawai Road, Eldoret',
        deliveryArea,
        deliveryDate,
        deliveryTimeSlot,
        items: items.map((i) => ({
          serviceId: i.service.id,
          quantity: i.quantity,
          notes: i.notes || '',
        })),
        paymentMethod,
        customerNotes: customerNotes.trim(),
      };

      const created = await api.createOrder(orderPayload);
      setSuccessOrder(created);
      clearCart();
      onOrderSuccess(created);

      // Trigger Confetti Celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (cErr) {
        // ignore
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit laundry order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccessOrder(null);
    setError(null);
    setIsOrderModalOpen(false);
  };

  const handleTrackCreatedOrder = () => {
    if (successOrder) {
      setTrackingOrderNumber(successOrder.orderNumber);
      handleClose();
      setActiveView('tracking');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                {successOrder ? 'Laundry Order Confirmed!' : 'Laundry Order & Pickup Builder'}
              </h3>
              <p className="text-xs text-slate-500">Joy and Ride Laundry • Hawai Road, Eldoret</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {successOrder ? (
            /* Order Success View */
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h4 className="text-2xl font-extrabold text-slate-900">
                  Order Successfully Placed!
                </h4>
                <div className="inline-block px-4 py-1.5 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-800 font-mono font-bold text-sm tracking-wider">
                  Order #{successOrder.orderNumber}
                </div>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Thank you, <span className="font-semibold">{successOrder.customerName}</span>! Our Eldoret team has received your request and will schedule the collection on{' '}
                  <span className="font-semibold">{successOrder.pickupDate} ({successOrder.pickupTimeSlot})</span>.
                </p>
              </div>

              {/* Order Summary Pill */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left max-w-md mx-auto space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Pickup Location:</span>
                  <span className="font-semibold text-slate-800">{successOrder.pickupAddress}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Total:</span>
                  <span className="font-bold text-cyan-700 text-sm">{formatKES(successOrder.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Payment Method:</span>
                  <span className="font-semibold text-slate-800 uppercase">{successOrder.paymentMethod.replace(/_/g, ' ')}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={handleTrackCreatedOrder}
                  className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Track Laundry Status Live</span>
                </button>
                <button
                  onClick={handleClose}
                  className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-sm transition cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            /* Order Creation Form */
            <form id="laundry-order-form" onSubmit={handleSubmitOrder} className="space-y-6">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* 1. Laundry Bag Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-600 text-white text-[11px] flex items-center justify-center font-bold">1</span>
                    Selected Laundry Items
                  </h4>
                  <span className="text-xs text-slate-500">{items.length} services chosen</span>
                </div>

                {items.length === 0 ? (
                  <div className="p-5 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2">
                    <p className="text-xs text-slate-500">Your laundry bag is empty.</p>
                    <p className="text-[11px] text-slate-400">Quickly add a standard service below:</p>
                    <div className="flex flex-wrap justify-center gap-2 pt-1">
                      {availableServices.slice(0, 3).map((srv) => (
                        <button
                          key={srv.id}
                          type="button"
                          onClick={() => addItem(srv, 1)}
                          className="px-3 py-1.5 rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-200 text-xs font-semibold hover:bg-cyan-100 cursor-pointer"
                        >
                          + {srv.name} ({formatKES(srv.basePrice)})
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 border border-slate-200 rounded-xl p-3 divide-y divide-slate-100 max-h-56 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.service.id} className="pt-2 first:pt-0 pb-2 flex items-center justify-between gap-3 text-xs">
                        <div className="flex-1">
                          <span className="font-bold text-slate-800">{item.service.name}</span>
                          <div className="text-slate-500 text-[11px]">
                            {formatKES(item.service.basePrice)} per {item.service.unit}
                          </div>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.service.id, item.quantity - 1)}
                              className="px-2 py-1 text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 font-bold text-slate-800 text-xs min-w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.service.id, item.quantity + 1)}
                              className="px-2 py-1 text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="font-bold text-slate-900 text-xs min-w-16 text-right">
                            {formatKES(item.service.basePrice * item.quantity)}
                          </span>

                          <button
                            type="button"
                            onClick={() => removeItem(item.service.id)}
                            className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Pickup Method & Eldoret Location */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-600 text-white text-[11px] flex items-center justify-center font-bold">2</span>
                  Pickup Preference & Schedule
                </h4>

                {/* Pickup Toggle */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPickupOption('doorstep_pickup')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                      pickupOption === 'doorstep_pickup'
                        ? 'border-cyan-600 bg-cyan-50/80 text-cyan-900 shadow-2xs font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-bold mb-1">
                      <Truck className="w-4 h-4 text-cyan-600" />
                      <span>Doorstep Pickup</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal">Our rider collects from your Eldoret residence</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPickupOption('store_dropoff')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                      pickupOption === 'store_dropoff'
                        ? 'border-cyan-600 bg-cyan-50/80 text-cyan-900 shadow-2xs font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-bold mb-1">
                      <Building className="w-4 h-4 text-cyan-600" />
                      <span>Drop Off In Store</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal">Bring to our Hawai Road laundry desk</p>
                  </button>
                </div>

                {pickupOption === 'doorstep_pickup' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Eldoret Neighborhood / Area <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={pickupArea}
                        onChange={(e) => setPickupArea(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      >
                        {DEFAULT_ELDORET_AREAS.map((area, idx) => (
                          <option key={idx} value={area}>
                            {area}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Pickup Street Address / House No. <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
                        placeholder="e.g. Hawai Road, Plot 14 / Near Pioneer Gate"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Pickup Date & Slot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Pickup Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().slice(0, 10)}
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Preferred Pickup Time Window <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={pickupTimeSlot}
                      onChange={(e) => setPickupTimeSlot(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    >
                      {timeSlots.map((slot, i) => (
                        <option key={i} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Customer Contact Information */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-600 text-white text-[11px] flex items-center justify-center font-bold">3</span>
                  Customer Contact & Notes
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. James Kiprop"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number (M-Pesa) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="0741775878"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="james@example.com"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Special Garment Instructions / Stain Notes
                  </label>
                  <input
                    type="text"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="e.g. Please steam press collars crisp; coffee spot on blue shirt."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-800 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 4. Payment Method & Price Summary */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Laundry Subtotal:</span>
                  <span className="font-semibold text-slate-900">{formatKES(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Eldoret Doorstep Delivery Fee:</span>
                  <span className={`font-semibold ${deliveryFee === 0 ? 'text-emerald-700 font-bold' : 'text-slate-900'}`}>
                    {deliveryFee === 0 ? 'FREE (Order >= KES 2,000)' : formatKES(deliveryFee)}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-sm font-extrabold text-slate-900">Total Payable:</span>
                  <span className="text-lg font-black text-cyan-700">{formatKES(totalAmount)}</span>
                </div>

                {/* Payment Option Selector */}
                <div className="pt-2">
                  <span className="block text-xs font-semibold text-slate-700 mb-1.5">Payment Method:</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pay_on_delivery')}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition ${
                        paymentMethod === 'pay_on_delivery'
                          ? 'border-cyan-600 bg-white font-bold text-cyan-800 shadow-2xs'
                          : 'border-slate-200 bg-slate-100 text-slate-600'
                      }`}
                    >
                      <span>Pay on Delivery / Pickup</span>
                      <span className="block text-[10px] text-slate-400 font-normal">M-Pesa or Cash on inspection</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('mpesa')}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition ${
                        paymentMethod === 'mpesa'
                          ? 'border-emerald-600 bg-white font-bold text-emerald-800 shadow-2xs'
                          : 'border-slate-200 bg-slate-100 text-slate-600'
                      }`}
                    >
                      <span>Direct M-Pesa Till</span>
                      <span className="block text-[10px] text-slate-400 font-normal">Paybill/Till receipt via phone</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || items.length === 0}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-sm font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
                  id="submit-laundry-order-btn"
                >
                  {loading ? (
                    <span>Processing Order...</span>
                  ) : (
                    <>
                      <span>Confirm & Schedule Laundry ({formatKES(totalAmount)})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
