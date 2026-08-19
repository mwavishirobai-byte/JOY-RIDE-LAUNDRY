import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  ShoppingBag,
  Truck,
  Layers,
  Calendar,
  Users,
  Settings,
  FileText,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Package,
  Send,
  Eye,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLaundryCart } from '../../context/LaundryCartContext';
import { api, ApiError } from '../../lib/api';
import {
  Order,
  OrderStatus,
  PaymentStatus,
  ServiceItem,
  Booking,
  DeliveryRecord,
  BusinessSettings,
  AuditLog,
  AdminMetrics,
  User,
  DEFAULT_ELDORET_AREAS,
} from '../../types';
import { formatKES, formatDateTime, getStatusBadgeInfo } from '../../lib/utils';
import { useRealtime } from '../../lib/useRealtime';

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const { setActiveView, setIsAdminLoginModalOpen } = useLaundryCart();
  const { subscribe, isConnected } = useRealtime();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'deliveries' | 'services' | 'bookings' | 'customers' | 'settings' | 'audit'
  >('overview');

  // Data States
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<(User & { orderCount: number; totalSpent: number; lastOrderDate?: string })[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Selected State
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusUpdateNote, setStatusUpdateNote] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Service Edit / Create Modal State
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    category: 'clothing',
    priceType: 'per_item',
    basePrice: 150,
    unit: 'item',
    image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=800&q=80',
    active: true,
    turnaroundHours: 24,
    popular: false,
  });

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const loadAllData = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const [mRes, oRes, sRes, dRes, bRes, cRes, setRes, aRes] = await Promise.all([
        api.getAdminMetrics().catch(() => null),
        api.getAdminOrders().catch(() => []),
        api.getAdminServices().catch(() => []),
        api.getAdminDeliveries().catch(() => []),
        api.getAdminBookings().catch(() => []),
        api.getAdminCustomers().catch(() => []),
        api.getAdminSettings().catch(() => null),
        api.getAdminAuditLogs().catch(() => []),
      ]);

      if (mRes) setMetrics(mRes);
      setOrders(oRes);
      setServices(sRes);
      setDeliveries(dRes);
      setBookings(bRes);
      setCustomers(cRes);
      if (setRes) setSettings(setRes);
      setAuditLogs(aRes);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Real-time synchronization
  useEffect(() => {
    const unsub = subscribe('*', () => {
      loadAllData();
    });
    return () => unsub();
  }, [subscribe, loadAllData]);

  if (!isAdmin) {
    return (
      <div className="py-20 bg-slate-900 text-white min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-slate-700 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Administrator Privileges Required</h2>
          <p className="text-xs text-slate-300">
            This management console is strictly restricted to authorized Joy and Ride Laundry staff and administrators.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => setIsAdminLoginModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition cursor-pointer"
            >
              Sign In as Administrator
            </button>
            <button
              onClick={() => setActiveView('home')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition cursor-pointer"
            >
              Return to Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle Order Status Change
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, paymentStatus?: PaymentStatus) => {
    try {
      const updated = await api.updateOrderStatus(orderId, status, statusUpdateNote, paymentStatus);
      showNotice(`Order #${updated.orderNumber} updated to ${status}`);
      setStatusUpdateNote('');
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
      loadAllData();
    } catch (err: any) {
      showNotice(err.message || 'Failed to update order status');
    }
  };

  // Handle Order Details Update (Assigned rider, admin notes, payment)
  const handleUpdateOrderDetails = async (orderId: string, payload: any) => {
    try {
      const updated = await api.updateOrderDetails(orderId, payload);
      showNotice(`Details updated for #${updated.orderNumber}`);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
      loadAllData();
    } catch (err: any) {
      showNotice(err.message || 'Failed to update order details');
    }
  };

  // Handle Service Save (Create / Edit)
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService) {
        await api.updateService(editingService.id, serviceForm);
        showNotice(`Service "${serviceForm.name}" updated!`);
      } else {
        await api.createService(serviceForm);
        showNotice(`Service "${serviceForm.name}" created!`);
      }
      setServiceModalOpen(false);
      setEditingService(null);
      loadAllData();
    } catch (err: any) {
      showNotice(err.message || 'Failed to save service');
    }
  };

  // Handle Service Delete
  const handleDeleteService = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the catalogue?`)) {
      try {
        await api.deleteService(id);
        showNotice(`Service "${name}" removed.`);
        loadAllData();
      } catch (err: any) {
        showNotice(err.message || 'Failed to delete service');
      }
    }
  };

  // Handle Booking Status
  const handleUpdateBookingStatus = async (id: string, status: string) => {
    try {
      await api.updateBookingStatus(id, status);
      showNotice(`Booking status updated to ${status}`);
      loadAllData();
    } catch (err: any) {
      showNotice(err.message || 'Failed to update booking');
    }
  };

  // Handle Delivery Status
  const handleUpdateDeliveryStatus = async (id: string, payload: any) => {
    try {
      await api.updateDelivery(id, payload);
      showNotice('Delivery schedule updated');
      loadAllData();
    } catch (err: any) {
      showNotice(err.message || 'Failed to update delivery');
    }
  };

  // Handle Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      await api.updateAdminSettings(settings);
      showNotice('Business settings updated successfully!');
      loadAllData();
    } catch (err: any) {
      showNotice(err.message || 'Failed to save settings');
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter;
    const q = orderSearchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.toLowerCase().includes(q) ||
      o.pickupAddress.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  const orderStatusOptions: OrderStatus[] = [
    'requested',
    'confirmed',
    'pickup_scheduled',
    'picked_up',
    'processing',
    'washing',
    'drying',
    'ironing_folding',
    'quality_check',
    'ready',
    'out_for_delivery',
    'delivered',
    'completed',
    'cancelled',
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Admin Top Header */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-600/30">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm sm:text-base text-white">Joy and Ride Management Console</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-900/60 text-purple-300 border border-purple-700/50">
                ADMIN
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Hawai Road, Eldoret • Persistent Database Active</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span>{isConnected ? 'Realtime Connected' : 'Connecting'}</span>
          </div>

          <button
            onClick={loadAllData}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="Refresh database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setActiveView('home')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer"
          >
            View Customer Site
          </button>

          <button
            onClick={() => {
              logout();
              setActiveView('home');
            }}
            className="px-3 py-1.5 rounded-lg bg-rose-900/40 hover:bg-rose-900/70 border border-rose-700/40 text-xs font-bold text-rose-300 transition cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="bg-purple-600 text-white text-xs font-semibold py-2 px-4 text-center shadow-md animate-in slide-in-from-top-2">
          {actionNotice}
        </div>
      )}

      {/* Main Admin Grid */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Admin Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-slate-950/60 border-r border-slate-800 p-3 space-y-1 shrink-0">
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: TrendingUp },
            { id: 'orders', label: 'Orders & Statuses', icon: ShoppingBag, count: metrics?.pendingOrders },
            { id: 'deliveries', label: 'Pickup & Delivery Dispatch', icon: Truck, count: metrics?.pickupsToday },
            { id: 'services', label: 'Services & Pricing', icon: Layers },
            { id: 'bookings', label: 'Appointments / Bookings', icon: Calendar },
            { id: 'customers', label: 'Customers Directory', icon: Users },
            { id: 'settings', label: 'Business & Eldoret Settings', icon: Settings },
            { id: 'audit', label: 'Audit Logs', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isCurrent
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 font-bold'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isCurrent ? 'text-purple-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Admin Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
          {/* ================= 1. OVERVIEW TAB ================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-white">Business Operations Overview</h2>
                <p className="text-xs text-slate-400">Live operational data for Joy and Ride Laundry, Hawai Road</p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-1">
                  <span className="text-[11px] text-slate-400 font-semibold block">Total Revenue</span>
                  <div className="text-xl font-black text-emerald-400">{formatKES(metrics?.totalRevenue || 0)}</div>
                  <span className="text-[10px] text-slate-500">Paid & Delivered orders</span>
                </div>

                <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-1">
                  <span className="text-[11px] text-slate-400 font-semibold block">Orders Today</span>
                  <div className="text-xl font-black text-cyan-400">{metrics?.totalOrdersToday || 0}</div>
                  <span className="text-[10px] text-slate-500">{metrics?.pendingOrders || 0} pending confirmation</span>
                </div>

                <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-1">
                  <span className="text-[11px] text-slate-400 font-semibold block">In Washing / Care</span>
                  <div className="text-xl font-black text-purple-400">{metrics?.inProgressOrders || 0}</div>
                  <span className="text-[10px] text-slate-500">{metrics?.readyOrders || 0} ready for delivery</span>
                </div>

                <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-1">
                  <span className="text-[11px] text-slate-400 font-semibold block">Total Registered Customers</span>
                  <div className="text-xl font-black text-amber-400">{metrics?.totalCustomers || 0}</div>
                  <span className="text-[10px] text-slate-500">Eldoret community members</span>
                </div>
              </div>

              {/* Recent Orders in Overview */}
              <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">Recent Laundry Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-purple-400 hover:text-purple-300 cursor-pointer"
                  >
                    View All Orders →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400">
                        <th className="pb-2.5 font-bold">Order #</th>
                        <th className="pb-2.5 font-bold">Customer</th>
                        <th className="pb-2.5 font-bold">Phone</th>
                        <th className="pb-2.5 font-bold">Pickup Location</th>
                        <th className="pb-2.5 font-bold">Amount</th>
                        <th className="pb-2.5 font-bold">Status</th>
                        <th className="pb-2.5 font-bold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60">
                      {orders.slice(0, 6).map((ord) => {
                        const badge = getStatusBadgeInfo(ord.orderStatus);
                        return (
                          <tr key={ord.id} className="hover:bg-slate-750/50">
                            <td className="py-2.5 font-mono font-bold text-cyan-400">{ord.orderNumber}</td>
                            <td className="py-2.5 font-medium text-slate-200">{ord.customerName}</td>
                            <td className="py-2.5 text-slate-400">{ord.customerPhone}</td>
                            <td className="py-2.5 text-slate-300 truncate max-w-40">{ord.pickupAddress}</td>
                            <td className="py-2.5 font-bold text-white">{formatKES(ord.totalAmount)}</td>
                            <td className="py-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badge.bg} ${badge.text} ${badge.border}`}>
                                {badge.label}
                              </span>
                            </td>
                            <td className="py-2.5 text-right">
                              <button
                                onClick={() => {
                                  setSelectedOrder(ord);
                                  setActiveTab('orders');
                                }}
                                className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-[11px] cursor-pointer"
                              >
                                Manage
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= 2. ORDERS MANAGEMENT TAB ================= */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-white">Orders & Lifecycle Management</h2>
                  <p className="text-xs text-slate-400">Update washing stages and trigger live customer updates</p>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-wrap items-center gap-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                <div className="relative flex-1 min-w-48">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Search by Order #, Customer Name, Phone, or Estate..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  {['all', 'requested', 'confirmed', 'washing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap cursor-pointer transition ${
                        orderStatusFilter === st
                          ? 'bg-purple-600 text-white font-bold'
                          : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {st.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders List */}
              <div className="grid grid-cols-1 gap-4">
                {filteredOrders.length === 0 ? (
                  <div className="bg-slate-800/40 rounded-2xl p-12 text-center border border-slate-700/60">
                    <p className="text-xs text-slate-400">No orders match the selected filter or search.</p>
                  </div>
                ) : (
                  filteredOrders.map((ord) => {
                    const badge = getStatusBadgeInfo(ord.orderStatus);
                    return (
                      <div
                        key={ord.id}
                        className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 space-y-4 shadow-xs hover:border-purple-500/50 transition"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/80 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-cyan-400 text-sm">
                                #{ord.orderNumber}
                              </span>
                              <span className="text-xs font-bold text-white">{ord.customerName}</span>
                              <a
                                href={`tel:${ord.customerPhone}`}
                                className="text-xs text-cyan-300 hover:underline inline-flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3" />
                                {ord.customerPhone}
                              </a>
                            </div>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              Placed on {formatDateTime(ord.createdAt)} • Pickup: {ord.pickupAddress} ({ord.pickupArea})
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              {badge.label}
                            </span>
                          </div>
                        </div>

                        {/* Order Items & Pricing */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1">
                            <span className="text-slate-400 font-semibold block">Laundry Items:</span>
                            <p className="text-slate-200">
                              {ord.items.map((i) => `${i.quantity}x ${i.serviceName}`).join(', ')}
                            </p>
                            {ord.customerNotes && (
                              <p className="text-amber-300 text-[11px] mt-1 italic">
                                Note: {ord.customerNotes}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1 sm:text-right">
                            <div className="text-slate-400 font-semibold">Total Amount:</div>
                            <div className="font-extrabold text-cyan-300 text-sm">{formatKES(ord.totalAmount)}</div>
                            <div className="text-[11px] text-slate-400">
                              Payment: <span className="font-bold uppercase text-slate-300">{ord.paymentStatus.replace(/_/g, ' ')}</span> ({ord.paymentMethod})
                            </div>
                          </div>
                        </div>

                        {/* Admin Action Bar (Status Selector & Rider Assigner) */}
                        <div className="pt-3 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-300">Set Status:</span>
                            <select
                              value={ord.orderStatus}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              {orderStatusOptions.map((st) => (
                                <option key={st} value={st}>
                                  {st.replace(/_/g, ' ').toUpperCase()}
                                </option>
                              ))}
                            </select>

                            {/* Payment Status Quick Toggle */}
                            <select
                              value={ord.paymentStatus}
                              onChange={(e) => handleUpdateOrderDetails(ord.id, { paymentStatus: e.target.value })}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-emerald-300 text-xs font-bold focus:outline-none"
                            >
                              <option value="pending">Payment: Pending</option>
                              <option value="paid_mpesa">Paid via M-Pesa</option>
                              <option value="paid_cash">Paid in Cash</option>
                              <option value="paid_on_delivery">Paid on Delivery</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              defaultValue={ord.assignedRider || ''}
                              placeholder="Assign Eldoret Rider..."
                              onBlur={(e) => {
                                if (e.target.value !== (ord.assignedRider || '')) {
                                  handleUpdateOrderDetails(ord.id, { assignedRider: e.target.value.trim() });
                                }
                              }}
                              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none w-36"
                            />
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition cursor-pointer"
                            >
                              Details & History
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Order Details Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-slate-900 text-white rounded-2xl max-w-2xl w-full border border-slate-700 p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-cyan-400">Order #{selectedOrder.orderNumber}</h3>
                    <p className="text-xs text-slate-400">Placed: {formatDateTime(selectedOrder.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-800/80 rounded-xl">
                    <div>
                      <span className="text-slate-400 block">Customer:</span>
                      <span className="font-bold text-white">{selectedOrder.customerName}</span>
                      <span className="text-slate-400 block">{selectedOrder.customerPhone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Pickup & Area:</span>
                      <span className="font-bold text-white">{selectedOrder.pickupAddress}</span>
                      <span className="text-slate-400 block">{selectedOrder.pickupDate} ({selectedOrder.pickupTimeSlot})</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-800/80 rounded-xl space-y-2">
                    <span className="text-slate-400 font-bold block">Status Event Note:</span>
                    <input
                      type="text"
                      value={statusUpdateNote}
                      onChange={(e) => setStatusUpdateNote(e.target.value)}
                      placeholder="Add a timestamped progress note (e.g. Ironed and ready for pickup)..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>

                  {/* Audit History Log */}
                  <div className="p-3 bg-slate-800/80 rounded-xl space-y-2">
                    <span className="text-slate-400 font-bold block">Status History Timeline:</span>
                    <div className="max-h-40 overflow-y-auto space-y-1.5 divide-y divide-slate-700/60">
                      {selectedOrder.statusHistory.map((h, i) => (
                        <div key={i} className="pt-1.5 first:pt-0 flex justify-between">
                          <div>
                            <span className="font-bold text-cyan-300 capitalize">{h.status.replace(/_/g, ' ')}</span>
                            {h.note && <p className="text-slate-300 text-[11px]">{h.note}</p>}
                          </div>
                          <span className="text-[10px] text-slate-500">{formatDateTime(h.timestamp)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= 3. PICKUP & DELIVERY DISPATCH TAB ================= */}
          {activeTab === 'deliveries' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-white">Pickup & Delivery Route Dispatch</h2>
                <p className="text-xs text-slate-400">Manage Eldoret collection and dropoff routes</p>
              </div>

              <div className="space-y-3">
                {deliveries.length === 0 ? (
                  <div className="bg-slate-800/40 rounded-2xl p-10 text-center border border-slate-700/60">
                    <p className="text-xs text-slate-400">No pickup or delivery schedules logged yet.</p>
                  </div>
                ) : (
                  deliveries.map((del) => (
                    <div
                      key={del.id}
                      className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 flex flex-wrap items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              del.type === 'pickup' ? 'bg-cyan-900/60 text-cyan-300' : 'bg-emerald-900/60 text-emerald-300'
                            }`}
                          >
                            {del.type}
                          </span>
                          <span className="font-mono font-bold text-white text-xs">#{del.orderNumber}</span>
                          <span className="text-xs font-bold text-slate-200">• {del.customerName}</span>
                          <span className="text-xs text-slate-400">({del.customerPhone})</span>
                        </div>
                        <p className="text-xs text-slate-300">
                          {del.address} ({del.area}) • Scheduled: <span className="font-semibold text-cyan-300">{del.scheduledDate} ({del.scheduledTimeSlot})</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <select
                          value={del.status}
                          onChange={(e) => handleUpdateDeliveryStatus(del.id, { status: e.target.value })}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-white"
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="assigned">Assigned</option>
                          <option value="picked_up">Picked Up</option>
                          <option value="in_transit">In Transit</option>
                          <option value="delivered">Delivered</option>
                          <option value="failed">Failed / Rescheduled</option>
                        </select>

                        <input
                          type="text"
                          defaultValue={del.assignedRider || ''}
                          placeholder="Rider name..."
                          onBlur={(e) => {
                            if (e.target.value !== (del.assignedRider || '')) {
                              handleUpdateDeliveryStatus(del.id, { assignedRider: e.target.value.trim() });
                            }
                          }}
                          className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 w-32"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ================= 4. SERVICE CATALOGUE TAB ================= */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-white">Laundry Service Catalogue & Rates</h2>
                  <p className="text-xs text-slate-400">Add or edit prices in KES, units, and active status</p>
                </div>
                <button
                  onClick={() => {
                    setEditingService(null);
                    setServiceForm({
                      name: '',
                      description: '',
                      category: 'clothing',
                      priceType: 'per_item',
                      basePrice: 150,
                      unit: 'item',
                      image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=800&q=80',
                      active: true,
                      turnaroundHours: 24,
                      popular: false,
                    });
                    setServiceModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Service</span>
                </button>
              </div>

              {/* Service Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    className={`bg-slate-800/90 rounded-2xl p-4 border transition flex flex-col justify-between space-y-3 ${
                      srv.active ? 'border-slate-700' : 'border-rose-900/60 opacity-60'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-white text-sm">{srv.name}</h4>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            srv.active ? 'bg-emerald-900/60 text-emerald-300' : 'bg-rose-900/60 text-rose-300'
                          }`}
                        >
                          {srv.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{srv.description}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-extrabold text-cyan-400">{formatKES(srv.basePrice)}</span>
                        <span className="text-slate-500">/ {srv.unit}</span>
                        <span className="text-slate-400">• {srv.turnaroundHours}h turnaround</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-700 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setEditingService(srv);
                          setServiceForm({
                            name: srv.name,
                            description: srv.description,
                            category: srv.category,
                            priceType: srv.priceType,
                            basePrice: srv.basePrice,
                            unit: srv.unit,
                            image: srv.image,
                            active: srv.active,
                            turnaroundHours: srv.turnaroundHours,
                            popular: !!srv.popular,
                          });
                          setServiceModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-200 flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Price</span>
                      </button>

                      <button
                        onClick={() => handleDeleteService(srv.id, srv.name)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/60 cursor-pointer"
                        title="Delete service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Service Edit / Create Modal */}
          {serviceModalOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-slate-900 text-white rounded-2xl max-w-lg w-full border border-slate-700 p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-base">
                    {editingService ? `Edit ${editingService.name}` : 'Add Laundry Service'}
                  </h3>
                  <button onClick={() => setServiceModalOpen(false)} className="text-slate-400 hover:text-white">
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveService} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Service Name *</label>
                    <input
                      type="text"
                      required
                      value={serviceForm.name}
                      onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                      placeholder="e.g. Bed Duvet Cleaning"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Category</label>
                      <select
                        value={serviceForm.category}
                        onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      >
                        <option value="clothing">Everyday Clothing</option>
                        <option value="bedding">Bedding & Duvets</option>
                        <option value="specialized">Suits & Delicates</option>
                        <option value="ironing">Steam Ironing Only</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Rate in KES *</label>
                      <input
                        type="number"
                        required
                        value={serviceForm.basePrice}
                        onChange={(e) => setServiceForm({ ...serviceForm, basePrice: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-cyan-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Unit Description</label>
                      <input
                        type="text"
                        required
                        value={serviceForm.unit}
                        onChange={(e) => setServiceForm({ ...serviceForm, unit: e.target.value })}
                        placeholder="e.g. kg, piece, suit"
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Turnaround Time (Hours)</label>
                      <input
                        type="number"
                        required
                        value={serviceForm.turnaroundHours}
                        onChange={(e) => setServiceForm({ ...serviceForm, turnaroundHours: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={serviceForm.active}
                        onChange={(e) => setServiceForm({ ...serviceForm, active: e.target.checked })}
                        className="rounded text-purple-600"
                      />
                      <span>Active on public website</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={serviceForm.popular}
                        onChange={(e) => setServiceForm({ ...serviceForm, popular: e.target.checked })}
                        className="rounded text-purple-600"
                      />
                      <span>Featured / Popular</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setServiceModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
                    >
                      Save Service
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ================= 5. BOOKINGS TAB ================= */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-white">Booked Laundry Appointments</h2>
                <p className="text-xs text-slate-400">Commercial & Household scheduling requests</p>
              </div>

              <div className="space-y-3">
                {bookings.length === 0 ? (
                  <div className="bg-slate-800/40 rounded-2xl p-10 text-center border border-slate-700/60">
                    <p className="text-xs text-slate-400">No booking appointments logged yet.</p>
                  </div>
                ) : (
                  bookings.map((bk) => (
                    <div
                      key={bk.id}
                      className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 flex flex-wrap items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-purple-400 text-xs">#{bk.bookingNumber}</span>
                          <span className="font-bold text-white text-xs">{bk.customerName}</span>
                          <span className="text-slate-400 text-xs">({bk.customerPhone})</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-200">{bk.serviceType}</h4>
                        <p className="text-[11px] text-slate-400">
                          {bk.preferredDate} ({bk.preferredTimeSlot}) • {bk.address} ({bk.area})
                        </p>
                        {bk.notes && <p className="text-[11px] text-amber-300 italic">{bk.notes}</p>}
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={bk.status}
                          onChange={(e) => handleUpdateBookingStatus(bk.id, e.target.value)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ================= 6. CUSTOMERS DIRECTORY TAB ================= */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-white">Registered Customers Directory</h2>
                <p className="text-xs text-slate-400">Customer account profiles and lifetime laundry spending</p>
              </div>

              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400">
                      <th className="pb-3 font-bold">Customer Name</th>
                      <th className="pb-3 font-bold">Email</th>
                      <th className="pb-3 font-bold">Phone</th>
                      <th className="pb-3 font-bold">Eldoret Area</th>
                      <th className="pb-3 font-bold">Orders Placed</th>
                      <th className="pb-3 font-bold">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-750/40">
                        <td className="py-2.5 font-bold text-white">{c.fullName}</td>
                        <td className="py-2.5 text-slate-400">{c.email}</td>
                        <td className="py-2.5 font-mono text-cyan-300">{c.phone}</td>
                        <td className="py-2.5 text-slate-300">{c.area || 'Eldoret'}</td>
                        <td className="py-2.5 font-bold text-purple-400">{c.orderCount} orders</td>
                        <td className="py-2.5 font-bold text-emerald-400">{formatKES(c.totalSpent)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 7. BUSINESS SETTINGS TAB ================= */}
          {activeTab === 'settings' && settings && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h2 className="text-xl font-extrabold text-white">Joy and Ride Business Settings</h2>
                <p className="text-xs text-slate-400">Configure phone, WhatsApp, Hawai Road map pin, and rates</p>
              </div>

              <form onSubmit={handleSaveSettings} className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Business Name</label>
                    <input
                      type="text"
                      value={settings.businessName}
                      onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Tagline</label>
                    <input
                      type="text"
                      value={settings.tagline}
                      onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Phone (Calls)</label>
                    <input
                      type="text"
                      value={settings.phone}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">WhatsApp Number</label>
                    <input
                      type="text"
                      value={settings.whatsapp}
                      onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Physical Address</label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Verified Google Maps / Location URL</label>
                  <input
                    type="text"
                    value={settings.verifiedMapsUrl}
                    onChange={(e) => setSettings({ ...settings, verifiedMapsUrl: e.target.value })}
                    placeholder="https://maps.google.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Base Delivery Fee (KES)</label>
                    <input
                      type="number"
                      value={settings.deliveryFeeConfig.baseFee}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          deliveryFeeConfig: { ...settings.deliveryFeeConfig, baseFee: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Free Delivery Threshold (KES)</label>
                    <input
                      type="number"
                      value={settings.deliveryFeeConfig.freeDeliveryThreshold}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          deliveryFeeConfig: {
                            ...settings.deliveryFeeConfig,
                            freeDeliveryThreshold: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Top Announcement Banner</label>
                  <input
                    type="text"
                    value={settings.announcement}
                    onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    Save Business Configuration
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= 8. AUDIT LOGS TAB ================= */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-white">System & Administrative Audit Trail</h2>
                <p className="text-xs text-slate-400">Timestamped record of all security and administrative operations</p>
              </div>

              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400">
                      <th className="pb-3 font-bold">Timestamp</th>
                      <th className="pb-3 font-bold">Actor</th>
                      <th className="pb-3 font-bold">Action</th>
                      <th className="pb-3 font-bold">Entity</th>
                      <th className="pb-3 font-bold">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 font-mono text-[11px]">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-750/40">
                        <td className="py-2.5 text-slate-400">{formatDateTime(log.timestamp)}</td>
                        <td className="py-2.5 text-purple-300 font-bold">{log.actorEmail}</td>
                        <td className="py-2.5 text-cyan-300 font-bold">{log.action}</td>
                        <td className="py-2.5 text-slate-300">{log.entity}</td>
                        <td className="py-2.5 text-slate-200 font-sans text-xs">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
