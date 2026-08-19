import React, { useState, useEffect } from 'react';
import {
  User,
  ShoppingBag,
  Calendar,
  Bell,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLaundryCart } from '../context/LaundryCartContext';
import { api } from '../lib/api';
import { Order, Booking, Notification, DEFAULT_ELDORET_AREAS } from '../types';
import { formatKES, formatDateTime, getStatusBadgeInfo } from '../lib/utils';
import { useRealtime } from '../lib/useRealtime';

export const CustomerDashboard: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { setActiveView, setTrackingOrderNumber, setIsOrderModalOpen } = useLaundryCart();
  const [activeTab, setActiveTab] = useState<'orders' | 'bookings' | 'notifications' | 'profile'>('orders');

  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Form
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [area, setArea] = useState(user?.area || 'Hawai Road & Environs');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  const { subscribe } = useRealtime();

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordList, bkList, notifList] = await Promise.all([
        api.getCustomerOrders().catch(() => []),
        api.getCustomerBookings().catch(() => []),
        api.getNotifications().catch(() => []),
      ]);
      setOrders(ordList);
      setBookings(bkList);
      setNotifications(notifList);
    } catch (err) {
      console.error('Error fetching customer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Real-time synchronization for customer data
  useEffect(() => {
    const unsubOrder = subscribe('ORDER_CREATED', () => loadData());
    const unsubStatus = subscribe('ORDER_STATUS_CHANGED', () => loadData());
    const unsubNotif = subscribe('NOTIFICATION_CREATED', () => loadData());

    return () => {
      unsubOrder();
      unsubStatus();
      unsubNotif();
    };
  }, [subscribe]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    try {
      await updateProfile({ fullName, phone, address, area });
      setProfileMessage('Profile updated successfully!');
      setTimeout(() => setProfileMessage(null), 3000);
    } catch (err: any) {
      setProfileMessage(err.message || 'Failed to update profile.');
    }
  };

  const handleMarkAllNotifications = async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  return (
    <div className="py-10 bg-slate-50 min-h-[80vh]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-cyan-600 to-blue-700 text-white flex items-center justify-center font-extrabold text-xl shadow-md shadow-cyan-600/20">
              {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">{user?.fullName}</h2>
              <p className="text-xs text-slate-500 font-medium">
                {user?.email} • {user?.phone} • {user?.area || 'Eldoret'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOrderModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>New Laundry Order</span>
            </button>
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Dashboard Tabs & Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-3 border border-slate-200 shadow-xs space-y-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-cyan-50 text-cyan-800 font-extrabold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-cyan-600" />
                My Laundry Orders
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 font-bold">
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-cyan-50 text-cyan-800 font-extrabold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-600" />
                Booked Appointments
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 font-bold">
                {bookings.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'notifications'
                  ? 'bg-cyan-50 text-cyan-800 font-extrabold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-600" />
                Notifications
              </span>
              {unreadNotifs > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                  {unreadNotifs}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-cyan-50 text-cyan-800 font-extrabold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-600" />
                My Profile & Address
              </span>
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="lg:col-span-9 space-y-4">
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base">Your Laundry Orders</h3>
                  <span className="text-xs text-slate-500">Live order status updates</span>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 space-y-3">
                    <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                    <h4 className="font-bold text-slate-800 text-base">No orders placed yet</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Ready to schedule fresh laundry pickup in Eldoret? Select services to get started.
                    </p>
                    <button
                      onClick={() => setIsOrderModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-700 cursor-pointer"
                    >
                      Book First Order
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((ord) => {
                      const badge = getStatusBadgeInfo(ord.orderStatus);
                      return (
                        <div
                          key={ord.id}
                          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-cyan-300 transition space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-900 text-sm">
                                  #{ord.orderNumber}
                                </span>
                                <span className="text-xs text-slate-400">
                                  • {formatDateTime(ord.createdAt)}
                                </span>
                              </div>
                              <span className="text-xs text-slate-600 block mt-0.5">
                                Pickup: {ord.pickupAddress} ({ord.pickupDate})
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${badge.bg} ${badge.text} ${badge.border}`}
                              >
                                {badge.label}
                              </span>
                              <button
                                onClick={() => {
                                  setTrackingOrderNumber(ord.orderNumber);
                                  setActiveView('tracking');
                                }}
                                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-cyan-50 text-slate-700 hover:text-cyan-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                              >
                                <span>Track</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <span className="text-slate-600">
                              {ord.items.map((i) => `${i.quantity}x ${i.serviceName}`).join(', ')}
                            </span>
                            <div className="font-bold text-cyan-700 text-sm">
                              {formatKES(ord.totalAmount)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base">Your Booked Appointments</h3>
                </div>

                {bookings.length === 0 ? (
                  <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 space-y-3">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
                    <h4 className="font-bold text-slate-800 text-base">No appointments booked</h4>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((bk) => (
                      <div
                        key={bk.id}
                        className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-slate-900">
                            Ref: #{bk.bookingNumber}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                            {bk.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-800">{bk.serviceType}</h4>
                        <p className="text-xs text-slate-500">
                          Date: <span className="font-semibold text-slate-700">{bk.preferredDate}</span> ({bk.preferredTimeSlot})
                        </p>
                        {bk.notes && <p className="text-[11px] text-slate-400 italic">{bk.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base">In-App Notifications</h3>
                  {unreadNotifs > 0 && (
                    <button
                      onClick={handleMarkAllNotifications}
                      className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No notifications yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100 space-y-2">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`pt-3 first:pt-0 p-3 rounded-xl transition ${
                          n.read ? 'bg-white' : 'bg-cyan-50/40 border border-cyan-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-xs text-slate-800">{n.title}</h4>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {formatDateTime(n.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 text-base">Your Profile & Default Address</h3>

                {profileMessage && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                    {profileMessage}
                  </div>
                )}

                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Phone (M-Pesa)</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Eldoret Area / Estate</label>
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

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. Hawai Road, Plot 22"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
