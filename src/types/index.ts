export const DEFAULT_ELDORET_AREAS = [
  'Hawai Road & Environs',
  'Pioneer Estate',
  'Elgon View Estate',
  'Annex / Rivatex',
  'Kapsoya Estate',
  'West Indies',
  'Eldoret CBD & Commercial Center',
  'Maili Nne',
  'Action / Huruma',
  'Langas Estate',
  'Kimumu Estate',
  'Chepkoilel / University of Eldoret',
  'Racecourse / Highlands',
  'Sosiani & Kisumu Road',
];

export type UserRole = 'customer' | 'admin' | 'staff';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  address?: string;
  area?: string;
  createdAt: string;
  updatedAt: string;
}

export type LaundryCategory = 'clothing' | 'bedding' | 'specialized' | 'ironing';

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  category: LaundryCategory;
  priceType: 'per_item' | 'per_kg' | 'fixed' | 'quote';
  basePrice: number;
  unit: string;
  image: string;
  active: boolean;
  turnaroundHours: number;
  popular?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'requested'
  | 'confirmed'
  | 'pickup_scheduled'
  | 'picked_up'
  | 'processing'
  | 'washing'
  | 'drying'
  | 'ironing_folding'
  | 'quality_check'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid_on_delivery' | 'paid_mpesa' | 'paid_cash' | 'unpaid';

export type PaymentMethod = 'mpesa' | 'pay_on_delivery' | 'cash';

export interface OrderItem {
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  category: string;
  notes?: string;
}

export interface StatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  updatedBy: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  pickupOption: 'doorstep_pickup' | 'store_dropoff';
  pickupAddress: string;
  pickupArea: string;
  pickupDate: string;
  pickupTimeSlot: string;
  deliveryOption: 'doorstep_delivery' | 'store_pickup';
  deliveryAddress: string;
  deliveryArea: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  mpesaReference?: string;
  customerNotes?: string;
  adminNotes?: string;
  assignedRider?: string;
  statusHistory: StatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceType: string;
  preferredDate: string;
  preferredTimeSlot: string;
  serviceOption: 'pickup_and_delivery' | 'in_store_service';
  address: string;
  area: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  type: 'pickup' | 'delivery';
  customerName: string;
  customerPhone: string;
  address: string;
  area: string;
  scheduledDate: string;
  scheduledTimeSlot: string;
  status: 'scheduled' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed' | 'rescheduled';
  assignedRider?: string;
  notes?: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'pickup' | 'delivery' | 'system' | 'promotion';
  read: boolean;
  orderId?: string;
  createdAt: string;
}

export interface BusinessSettings {
  businessName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  road: string;
  town: string;
  county: string;
  verifiedMapsUrl: string;
  openingHours: {
    days: string;
    hours: string;
  }[];
  currency: string;
  deliveryFeeConfig: {
    baseFee: number;
    freeDeliveryThreshold: number;
    eldoretAreas: string[];
  };
  announcement: string;
  allowBookings: boolean;
  mpesaPaymentInstructions: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
}

export interface AdminMetrics {
  totalOrdersToday: number;
  pendingOrders: number;
  inProgressOrders: number;
  readyOrders: number;
  pickupsToday: number;
  deliveriesToday: number;
  completedOrders: number;
  cancelledOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  recentOrders: Order[];
}
