import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
} from 'lucide-react';
import { useLaundryCart } from '../context/LaundryCartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Booking, DEFAULT_ELDORET_AREAS } from '../types';

export const BookingModal: React.FC = () => {
  const { isBookingModalOpen, setIsBookingModalOpen } = useLaundryCart();
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [serviceType, setServiceType] = useState('Household Laundry & Heavy Duvets');
  const [preferredDate, setPreferredDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('09:00 AM – 12:00 PM');
  const [serviceOption, setServiceOption] = useState<'pickup_and_delivery' | 'in_store_service'>('pickup_and_delivery');
  const [address, setAddress] = useState(user?.address || '');
  const [area, setArea] = useState(user?.area || 'Hawai Road & Environs');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  if (!isBookingModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName || !customerPhone || !preferredDate) {
      setError('Please provide your name, phone number, and preferred date.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.createBooking({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        serviceType,
        preferredDate,
        preferredTimeSlot,
        serviceOption,
        address: address.trim() || 'Hawai Road, Eldoret',
        area,
        notes: notes.trim(),
      });

      setCreatedBooking(res);
    } catch (err: any) {
      setError(err.message || 'Failed to create booking.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCreatedBooking(null);
    setError(null);
    setIsBookingModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Schedule Laundry Appointment</h3>
              <p className="text-xs text-slate-500">Joy and Ride Laundry • Hawai Road, Eldoret</p>
            </div>
          </div>

          <button onClick={handleClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {createdBooking ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Appointment Scheduled!</h4>
              <div className="inline-block px-3 py-1 rounded bg-cyan-50 border border-cyan-200 text-cyan-800 font-mono font-bold text-xs">
                Ref: #{createdBooking.bookingNumber}
              </div>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                We have received your appointment for <span className="font-semibold">{createdBooking.preferredDate}</span> ({createdBooking.preferredTimeSlot}). Our Eldoret desk will confirm via phone/WhatsApp.
              </p>
              <button
                onClick={handleClose}
                className="mt-4 px-6 py-2.5 rounded-xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-700 cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Samuel Mutua"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0741775878"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Service Requirement</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="Household Laundry & Heavy Duvets">Household Laundry & Heavy Duvets</option>
                    <option value="Weekly Office / Executive Suit Plan">Weekly Office / Executive Suit Plan</option>
                    <option value="School & University Uniform Care">School & University Uniform Care</option>
                    <option value="Curtain & Living Fabric Restoration">Curtain & Living Fabric Restoration</option>
                    <option value="Commercial / Guest House Laundry">Commercial / Guest House Laundry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Eldoret Neighborhood</label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    {DEFAULT_ELDORET_AREAS.map((a, i) => (
                      <option key={i} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Date *</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().slice(0, 10)}
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Time Window</label>
                  <select
                    value={preferredTimeSlot}
                    onChange={(e) => setPreferredTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="09:00 AM – 12:00 PM">09:00 AM – 12:00 PM (Morning)</option>
                    <option value="12:00 PM – 03:00 PM">12:00 PM – 03:00 PM (Midday)</option>
                    <option value="03:00 PM – 06:00 PM">03:00 PM – 06:00 PM (Afternoon)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Specific Location Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Hawai Road, Pioneer Estate Gate 2"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Additional Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special timing or volume details..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  {loading ? 'Submitting...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
