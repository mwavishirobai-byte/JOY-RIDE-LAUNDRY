import { BusinessSettings, ServiceItem, Order, Booking, DeliveryRecord, Notification, AdminMetrics, AuditLog, User } from '../types';

const API_BASE = '/api';

export class ApiError extends Error {
  code: string;
  constructor(message: string, code: string = 'UNKNOWN_ERROR') {
    super(message);
    this.code = code;
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('jrl_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await res.json().catch(() => ({
    success: false,
    error: { code: 'HTTP_ERROR', message: `Server returned ${res.status}` },
  }));

  if (!res.ok || !json.success) {
    const errorMsg = json.error?.message || 'An unexpected error occurred';
    const errorCode = json.error?.code || 'REQUEST_FAILED';
    throw new ApiError(errorMsg, errorCode);
  }

  return json.data as T;
}

export const api = {
  // Public
  getPublicSettings: () => request<BusinessSettings>('/settings/public'),
  getPublicServices: () => request<ServiceItem[]>('/services'),
  trackOrder: (orderNumber: string) => request<Order>(`/orders/track/${encodeURIComponent(orderNumber)}`),

  // Orders & Bookings
  createOrder: (data: any) =>
    request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getCustomerOrders: () => request<Order[]>('/orders'),
  getOrder: (id: string) => request<Order>(`/orders/${id}`),

  createBooking: (data: any) =>
    request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getCustomerBookings: () => request<Booking[]>('/bookings'),

  // Notifications
  getNotifications: () => request<Notification[]>('/notifications'),
  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PUT',
    }),
  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/notifications/read-all', {
      method: 'PUT',
    }),

  // Auth
  register: (data: any) =>
    request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  login: (data: any) =>
    request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  adminLogin: (data: any) =>
    request<{ user: User; token: string }>('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMe: () => request<{ user: User }>('/auth/me'),
  updateProfile: (data: any) =>
    request<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Admin
  getAdminMetrics: () => request<AdminMetrics>('/admin/metrics'),
  getAdminOrders: (params?: { status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<Order[]>(`/admin/orders${qs}`);
  },
  updateOrderStatus: (id: string, status: string, note?: string, paymentStatus?: string) =>
    request<Order>(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, note, paymentStatus }),
    }),
  updateOrderDetails: (id: string, data: any) =>
    request<Order>(`/admin/orders/${id}/details`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getAdminServices: () => request<ServiceItem[]>('/admin/services'),
  createService: (data: any) =>
    request<ServiceItem>('/admin/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateService: (id: string, data: any) =>
    request<ServiceItem>(`/admin/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteService: (id: string) =>
    request<{ success: boolean }>(`/admin/services/${id}`, {
      method: 'DELETE',
    }),

  getAdminBookings: () => request<Booking[]>('/admin/bookings'),
  updateBookingStatus: (id: string, status: string) =>
    request<Booking>(`/admin/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  getAdminDeliveries: () => request<DeliveryRecord[]>('/admin/deliveries'),
  updateDelivery: (id: string, data: any) =>
    request<DeliveryRecord>(`/admin/deliveries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getAdminCustomers: () => request<(User & { orderCount: number; totalSpent: number; lastOrderDate?: string })[]>('/admin/customers'),
  getAdminSettings: () => request<BusinessSettings>('/admin/settings'),
  updateAdminSettings: (data: Partial<BusinessSettings>) =>
    request<BusinessSettings>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getAdminAuditLogs: () => request<AuditLog[]>('/admin/audit-logs'),
};
