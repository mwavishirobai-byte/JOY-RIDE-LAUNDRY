import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import {
  User,
  ServiceItem,
  Order,
  Booking,
  DeliveryRecord,
  Notification,
  BusinessSettings,
  AuditLog,
  OrderStatus,
  PaymentStatus,
} from '../src/types';

interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  services: ServiceItem[];
  orders: Order[];
  bookings: Booking[];
  deliveries: DeliveryRecord[];
  notifications: Notification[];
  settings: BusinessSettings;
  auditLogs: AuditLog[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const DEFAULT_ELDORET_AREAS = [
  'Hawai Road & Environs',
  'Pioneer Estate',
  'Elgon View',
  'Annex / Moi University Border',
  'Kapsoya Estate',
  'West Indies',
  'Eldoret CBD',
  'Maili Nne',
  'Action / Upper Action',
  'Huruma / Kipkaren Road',
  'Langas',
  'Kimumu',
  'Riat / University Way',
  'Chepkoilel (UoE) Area',
  'Block 10',
  'Old Stadium / Sosiani',
];

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'srv-wash-fold',
    name: 'Standard Wash & Fold',
    description: 'Everyday clothes meticulously washed with premium eco-detergent, tumble-dried, and neatly folded.',
    category: 'clothing',
    priceType: 'per_kg',
    basePrice: 150,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=800&q=80',
    active: true,
    turnaroundHours: 24,
    popular: true,
    tags: ['Daily Wear', 'T-shirts', 'Casual', 'Fast Service'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-wash-iron',
    name: 'Executive Wash & Iron',
    description: 'Comprehensive gentle wash, conditioning, precision steam ironed and packed on hangers or crisp folded.',
    category: 'clothing',
    priceType: 'per_kg',
    basePrice: 220,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=800&q=80',
    active: true,
    turnaroundHours: 24,
    popular: true,
    tags: ['Office Wear', 'Shirts', 'Trousers', 'Crisp Finish'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-duvet-cleaning',
    name: 'Bed Duvet & Quilt Care',
    description: 'Deep sanitary hypoallergenic wash & disinfection for single, double, queen, and king-size duvets.',
    category: 'bedding',
    priceType: 'per_item',
    basePrice: 600,
    unit: 'piece',
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
    active: true,
    turnaroundHours: 48,
    popular: true,
    tags: ['Duvet', 'Heavy Quilt', 'Allergen Removal', 'Fresh Fragrance'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-heavy-blanket',
    name: 'Heavy Wool & Mink Blanket',
    description: 'Intense dirt extraction and gentle fiber conditioning for heavy wool, fleece, and imported mink blankets.',
    category: 'bedding',
    priceType: 'per_item',
    basePrice: 500,
    unit: 'piece',
    image: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=800&q=80',
    active: true,
    turnaroundHours: 48,
    popular: false,
    tags: ['Blanket', 'Winter Warmth', 'Gentle Drying'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-bedsheets-linen',
    name: 'Bedsheets & Pillowcases Set',
    description: 'Full sanitization, soft fragrance treatment, and wrinkle-free hot pressing for bed sets.',
    category: 'bedding',
    priceType: 'per_item',
    basePrice: 300,
    unit: 'set (4 pcs)',
    image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80',
    active: true,
    turnaroundHours: 24,
    popular: false,
    tags: ['Bedsheets', 'Hospitality Grade', 'Sanitized'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-suit-pressing',
    name: 'Two-Piece Suit Care & Press',
    description: 'Expert fabric brushing, spot stain treatment, and professional 3D steam finishing for suits.',
    category: 'specialized',
    priceType: 'per_item',
    basePrice: 450,
    unit: 'suit',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    active: true,
    turnaroundHours: 24,
    popular: true,
    tags: ['Formal Wear', 'Suits', 'Blazers', 'Crease Proof'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-uniform-cleaning',
    name: 'School & Work Uniforms',
    description: 'Deep stain removal for collars & cuffs, fabric brightening, and sharp crease pressing for uniforms.',
    category: 'clothing',
    priceType: 'per_item',
    basePrice: 200,
    unit: 'pair',
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80',
    active: true,
    turnaroundHours: 24,
    popular: false,
    tags: ['School Uniforms', 'Security Guard Uniforms', 'Corporate'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-curtains-drapes',
    name: 'Curtains & Window Drapes',
    description: 'Dust extraction, gentle wash, steam restoration, and anti-static treatment for heavy or sheer curtains.',
    category: 'specialized',
    priceType: 'per_item',
    basePrice: 350,
    unit: 'panel',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    active: true,
    turnaroundHours: 48,
    popular: false,
    tags: ['Curtains', 'Drapes', 'Living Room Care'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-steam-ironing-only',
    name: 'Steam Pressing & Ironing Only',
    description: 'For pre-washed garments requiring immaculate professional hand or steam pressing.',
    category: 'ironing',
    priceType: 'per_item',
    basePrice: 70,
    unit: 'garment',
    image: 'https://images.unsplash.com/photo-1489274495757-95c7c837b101?auto=format&fit=crop&w=800&q=80',
    active: true,
    turnaroundHours: 12,
    popular: false,
    tags: ['Pressing Only', 'Ironing', 'Quick Service'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-delicate-silk',
    name: 'Delicates & Wedding Gown Care',
    description: 'pH-neutral specialized bath, spot treatment for delicate lace, silk, and formal gowns.',
    category: 'specialized',
    priceType: 'per_item',
    basePrice: 800,
    unit: 'dress',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
    active: true,
    turnaroundHours: 48,
    popular: false,
    tags: ['Silk', 'Wedding Dress', 'Delicate Hand Wash'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_SETTINGS: BusinessSettings = {
  businessName: 'Joy and Ride Laundry',
  tagline: 'Premium laundry care with doorstep pickup and fast delivery across Eldoret',
  phone: '0741775878',
  whatsapp: '0741775878',
  email: 'joyridelaundry@gmail.com',
  address: 'Hawai Road, Eldoret, Kenya',
  road: 'Hawai Road',
  town: 'Eldoret',
  county: 'Uasin Gishu',
  verifiedMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Hawai+Road+Eldoret+Kenya',
  openingHours: [
    { days: 'Monday – Friday', hours: '7:00 AM – 7:30 PM' },
    { days: 'Saturday', hours: '7:30 AM – 7:00 PM' },
    { days: 'Sunday', hours: '8:30 AM – 5:00 PM' },
  ],
  currency: 'KES',
  deliveryFeeConfig: {
    baseFee: 150,
    freeDeliveryThreshold: 2000,
    eldoretAreas: DEFAULT_ELDORET_AREAS,
  },
  announcement: 'Fresh, hygienic laundry in Eldoret! Free doorstep pickup available along Hawai Road, Pioneer, Elgon View, Annex & CBD.',
  allowBookings: true,
  mpesaPaymentInstructions: 'M-Pesa Paybill / Till Number or Pay on Delivery upon inspection. Contact 0741775878 for business till verification.',
};

class Database {
  private data: DatabaseSchema;
  private sseClients: Set<(event: string, data: any) => void> = new Set();

  constructor() {
    this.data = this.loadDatabase();
    this.ensureAdminUser();
  }

  private loadDatabase(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: parsed.users || [],
          services: parsed.services || INITIAL_SERVICES,
          orders: parsed.orders || [],
          bookings: parsed.bookings || [],
          deliveries: parsed.deliveries || [],
          notifications: parsed.notifications || [],
          settings: parsed.settings || INITIAL_SETTINGS,
          auditLogs: parsed.auditLogs || [],
        };
      } catch (err) {
        console.error('Error loading database file, initializing defaults:', err);
      }
    }

    const initial: DatabaseSchema = {
      users: [],
      services: INITIAL_SERVICES,
      orders: [],
      bookings: [],
      deliveries: [],
      notifications: [],
      settings: INITIAL_SETTINGS,
      auditLogs: [],
    };
    this.saveDatabase(initial);
    return initial;
  }

  private saveDatabase(dataToSave?: DatabaseSchema) {
    try {
      const data = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database file:', err);
    }
  }

  private ensureAdminUser() {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@joyridelaundry.co.ke').toLowerCase();
    const existingAdmin = this.data.users.find((u) => u.email.toLowerCase() === adminEmail);

    if (!existingAdmin) {
      const adminPassword = process.env.ADMIN_PASSWORD || 'EldoretJoy@2026';
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(adminPassword, salt);

      const adminUser: User & { passwordHash: string } = {
        id: 'usr-admin-' + crypto.randomUUID().slice(0, 8),
        fullName: 'Joy and Ride Admin',
        email: adminEmail,
        phone: '0741775878',
        role: 'admin',
        address: 'Hawai Road, Eldoret',
        area: 'Hawai Road & Environs',
        passwordHash,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.data.users.push(adminUser);
      this.saveDatabase();
      this.addAuditLog('system', 'system', 'INITIALIZE_ADMIN', 'users', adminUser.id, `Created default admin account for ${adminEmail}`);
    }
  }

  // Real-time SSE
  public subscribeSSE(listener: (event: string, data: any) => void) {
    this.sseClients.add(listener);
    return () => {
      this.sseClients.delete(listener);
    };
  }

  public broadcast(event: string, payload: any) {
    for (const client of this.sseClients) {
      try {
        client(event, payload);
      } catch (e) {
        // client likely disconnected
      }
    }
  }

  // Audit Logs
  public addAuditLog(actorEmail: string, actorRole: string, action: string, entity: string, entityId: string, details: string) {
    const log: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      timestamp: new Date().toISOString(),
      actorEmail,
      actorRole,
      action,
      entity,
      entityId,
      details,
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.saveDatabase();
  }

  public getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  // Users
  public getUsers() {
    return this.data.users.map(({ passwordHash, ...user }) => user);
  }

  public findUserByEmail(email: string) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string) {
    return this.data.users.find((u) => u.id === id);
  }

  public createUser(userData: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role?: 'customer' | 'admin';
    address?: string;
    area?: string;
  }): User {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(userData.password, salt);

    const newUser: User & { passwordHash: string } = {
      id: 'usr-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      fullName: userData.fullName,
      email: userData.email.toLowerCase(),
      phone: userData.phone,
      role: userData.role || 'customer',
      address: userData.address || '',
      area: userData.area || 'Hawai Road & Environs',
      passwordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.users.push(newUser);
    this.saveDatabase();
    this.addAuditLog(newUser.email, newUser.role, 'USER_REGISTERED', 'users', newUser.id, `User account created: ${newUser.fullName} (${newUser.phone})`);

    const { passwordHash: _, ...safeUser } = newUser;
    return safeUser;
  }

  public updateUserProfile(id: string, updates: Partial<Pick<User, 'fullName' | 'phone' | 'address' | 'area'>>): User | null {
    const userIndex = this.data.users.findIndex((u) => u.id === id);
    if (userIndex === -1) return null;

    const user = this.data.users[userIndex];
    const updated = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.data.users[userIndex] = updated;
    this.saveDatabase();

    const { passwordHash: _, ...safeUser } = updated;
    return safeUser;
  }

  // Services
  public getServices(onlyActive = false): ServiceItem[] {
    if (onlyActive) {
      return this.data.services.filter((s) => s.active);
    }
    return this.data.services;
  }

  public getServiceById(id: string): ServiceItem | undefined {
    return this.data.services.find((s) => s.id === id);
  }

  public createService(serviceData: Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt'>, actorEmail: string): ServiceItem {
    const newService: ServiceItem = {
      ...serviceData,
      id: 'srv-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 5),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.services.push(newService);
    this.saveDatabase();
    this.addAuditLog(actorEmail, 'admin', 'CREATE_SERVICE', 'services', newService.id, `Created service: ${newService.name} (KES ${newService.basePrice}/${newService.unit})`);
    this.broadcast('SERVICE_UPDATED', { service: newService, action: 'create' });
    return newService;
  }

  public updateService(id: string, updates: Partial<ServiceItem>, actorEmail: string): ServiceItem | null {
    const idx = this.data.services.findIndex((s) => s.id === id);
    if (idx === -1) return null;

    const updated: ServiceItem = {
      ...this.data.services[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.data.services[idx] = updated;
    this.saveDatabase();
    this.addAuditLog(actorEmail, 'admin', 'UPDATE_SERVICE', 'services', id, `Updated service: ${updated.name}`);
    this.broadcast('SERVICE_UPDATED', { service: updated, action: 'update' });
    return updated;
  }

  public deleteService(id: string, actorEmail: string): boolean {
    const idx = this.data.services.findIndex((s) => s.id === id);
    if (idx === -1) return false;

    const srvName = this.data.services[idx].name;
    this.data.services.splice(idx, 1);
    this.saveDatabase();
    this.addAuditLog(actorEmail, 'admin', 'DELETE_SERVICE', 'services', id, `Deleted service: ${srvName}`);
    this.broadcast('SERVICE_UPDATED', { serviceId: id, action: 'delete' });
    return true;
  }

  // Orders
  public getOrders(filters?: { customerId?: string; status?: OrderStatus; search?: string }): Order[] {
    let result = [...this.data.orders];

    if (filters?.customerId) {
      result = result.filter((o) => o.customerId === filters.customerId);
    }

    if (filters?.status) {
      result = result.filter((o) => o.orderStatus === filters.status);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.toLowerCase().includes(q) ||
          o.pickupAddress.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find((o) => o.id === id || o.orderNumber === id);
  }

  public createOrder(orderPayload: {
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
    items: { serviceId: string; quantity: number; notes?: string }[];
    paymentMethod: 'mpesa' | 'pay_on_delivery' | 'cash';
    customerNotes?: string;
  }): Order {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `JRL-${dateStr}-${randomSeq}`;

    // Calculate real prices from database services
    let subtotal = 0;
    const populatedItems = orderPayload.items.map((item) => {
      const service = this.getServiceById(item.serviceId);
      const unitPrice = service ? service.basePrice : 150;
      const unit = service ? service.unit : 'item';
      const serviceName = service ? service.name : 'Custom Laundry Care';
      const category = service ? service.category : 'clothing';
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      return {
        serviceId: item.serviceId,
        serviceName,
        quantity: item.quantity,
        unitPrice,
        unit,
        category,
        notes: item.notes || '',
      };
    });

    const deliveryFee =
      orderPayload.deliveryOption === 'doorstep_delivery' || orderPayload.pickupOption === 'doorstep_pickup'
        ? subtotal >= this.data.settings.deliveryFeeConfig.freeDeliveryThreshold
          ? 0
          : this.data.settings.deliveryFeeConfig.baseFee
        : 0;

    const totalAmount = subtotal + deliveryFee;

    const newOrder: Order = {
      id: 'ord-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      orderNumber,
      customerId: orderPayload.customerId,
      customerName: orderPayload.customerName,
      customerPhone: orderPayload.customerPhone,
      customerEmail: orderPayload.customerEmail,
      pickupOption: orderPayload.pickupOption,
      pickupAddress: orderPayload.pickupAddress,
      pickupArea: orderPayload.pickupArea,
      pickupDate: orderPayload.pickupDate,
      pickupTimeSlot: orderPayload.pickupTimeSlot,
      deliveryOption: orderPayload.deliveryOption,
      deliveryAddress: orderPayload.deliveryAddress,
      deliveryArea: orderPayload.deliveryArea,
      deliveryDate: orderPayload.deliveryDate,
      deliveryTimeSlot: orderPayload.deliveryTimeSlot,
      items: populatedItems,
      subtotal,
      deliveryFee,
      totalAmount,
      orderStatus: 'requested',
      paymentStatus: 'pending',
      paymentMethod: orderPayload.paymentMethod,
      customerNotes: orderPayload.customerNotes || '',
      statusHistory: [
        {
          status: 'requested',
          timestamp: new Date().toISOString(),
          note: 'Laundry order request submitted online.',
          updatedBy: orderPayload.customerName,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.orders.unshift(newOrder);

    // Create Pickup / Delivery entry
    if (newOrder.pickupOption === 'doorstep_pickup') {
      const pickupDelivery: DeliveryRecord = {
        id: 'del-p-' + Date.now().toString(36),
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        type: 'pickup',
        customerName: newOrder.customerName,
        customerPhone: newOrder.customerPhone,
        address: newOrder.pickupAddress,
        area: newOrder.pickupArea,
        scheduledDate: newOrder.pickupDate,
        scheduledTimeSlot: newOrder.pickupTimeSlot,
        status: 'scheduled',
        notes: newOrder.customerNotes,
        updatedAt: new Date().toISOString(),
      };
      this.data.deliveries.unshift(pickupDelivery);
    }

    if (newOrder.deliveryOption === 'doorstep_delivery') {
      const dropDelivery: DeliveryRecord = {
        id: 'del-d-' + Date.now().toString(36),
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        type: 'delivery',
        customerName: newOrder.customerName,
        customerPhone: newOrder.customerPhone,
        address: newOrder.deliveryAddress,
        area: newOrder.deliveryArea,
        scheduledDate: newOrder.deliveryDate,
        scheduledTimeSlot: newOrder.deliveryTimeSlot,
        status: 'scheduled',
        notes: newOrder.customerNotes,
        updatedAt: new Date().toISOString(),
      };
      this.data.deliveries.unshift(dropDelivery);
    }

    // Customer Notification
    this.createNotification({
      userId: newOrder.customerId,
      title: 'Laundry Order Received!',
      message: `Your order #${newOrder.orderNumber} has been received. Our Eldoret team will confirm your pickup/service shortly.`,
      type: 'order',
      orderId: newOrder.id,
    });

    this.saveDatabase();
    this.addAuditLog(newOrder.customerEmail, 'customer', 'CREATE_ORDER', 'orders', newOrder.id, `Order placed: #${newOrder.orderNumber} (KES ${newOrder.totalAmount})`);
    this.broadcast('ORDER_CREATED', { order: newOrder });

    return newOrder;
  }

  public updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    actorEmail: string,
    note?: string,
    paymentStatus?: PaymentStatus
  ): Order | null {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return null;

    const oldStatus = order.orderStatus;
    order.orderStatus = newStatus;
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }
    order.updatedAt = new Date().toISOString();

    const statusNote = note || `Status updated from ${oldStatus.replace(/_/g, ' ')} to ${newStatus.replace(/_/g, ' ')}`;

    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: statusNote,
      updatedBy: actorEmail,
    });

    // Send customer notification for key status events
    let customerNoticeTitle = `Order Status: ${newStatus.replace(/_/g, ' ').toUpperCase()}`;
    let customerNoticeMsg = `Your laundry order #${order.orderNumber} is now: ${newStatus.replace(/_/g, ' ')}. ${note || ''}`;

    if (newStatus === 'ready') {
      customerNoticeTitle = 'Laundry Ready!';
      customerNoticeMsg = `Great news! Your laundry (#${order.orderNumber}) is freshly cleaned, pressed, and ready.`;
    } else if (newStatus === 'out_for_delivery') {
      customerNoticeTitle = 'Out for Delivery';
      customerNoticeMsg = `Our Eldoret rider is on the way to deliver your order #${order.orderNumber} to ${order.deliveryAddress}.`;
    } else if (newStatus === 'delivered' || newStatus === 'completed') {
      customerNoticeTitle = 'Laundry Delivered / Completed';
      customerNoticeMsg = `Thank you for choosing Joy and Ride Laundry for order #${order.orderNumber}! We hope you love your fresh clothes.`;
    }

    this.createNotification({
      userId: order.customerId,
      title: customerNoticeTitle,
      message: customerNoticeMsg,
      type: 'order',
      orderId: order.id,
    });

    this.saveDatabase();
    this.addAuditLog(actorEmail, 'admin', 'UPDATE_ORDER_STATUS', 'orders', order.id, `Status updated to ${newStatus} for #${order.orderNumber}`);
    this.broadcast('ORDER_STATUS_CHANGED', { order, oldStatus, newStatus });

    return order;
  }

  public updateOrderDetails(
    orderId: string,
    updates: Partial<Pick<Order, 'assignedRider' | 'adminNotes' | 'paymentStatus' | 'mpesaReference'>>,
    actorEmail: string
  ): Order | null {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) return null;

    Object.assign(order, updates);
    order.updatedAt = new Date().toISOString();

    this.saveDatabase();
    this.addAuditLog(actorEmail, 'admin', 'UPDATE_ORDER_DETAILS', 'orders', order.id, `Updated details for #${order.orderNumber}`);
    this.broadcast('ORDER_UPDATED', { order });
    return order;
  }

  // Bookings
  public getBookings(customerId?: string): Booking[] {
    if (customerId) {
      return this.data.bookings.filter((b) => b.customerId === customerId);
    }
    return this.data.bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createBooking(bookingData: Omit<Booking, 'id' | 'bookingNumber' | 'createdAt' | 'updatedAt' | 'status'>): Booking {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const seq = Math.floor(100 + Math.random() * 900);
    const bookingNumber = `BK-${dateStr}-${seq}`;

    const newBooking: Booking = {
      ...bookingData,
      id: 'bk-' + Date.now().toString(36),
      bookingNumber,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.bookings.unshift(newBooking);
    this.createNotification({
      userId: newBooking.customerId,
      title: 'Booking Request Received',
      message: `Your booking appointment #${bookingNumber} for ${newBooking.preferredDate} (${newBooking.preferredTimeSlot}) has been scheduled.`,
      type: 'pickup',
    });

    this.saveDatabase();
    this.addAuditLog(newBooking.customerEmail, 'customer', 'CREATE_BOOKING', 'bookings', newBooking.id, `Booking #${bookingNumber} created`);
    this.broadcast('BOOKING_CREATED', { booking: newBooking });
    return newBooking;
  }

  public updateBookingStatus(id: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled', actorEmail: string): Booking | null {
    const booking = this.data.bookings.find((b) => b.id === id);
    if (!booking) return null;

    booking.status = status;
    booking.updatedAt = new Date().toISOString();

    this.saveDatabase();
    this.addAuditLog(actorEmail, 'admin', 'UPDATE_BOOKING_STATUS', 'bookings', id, `Booking status changed to ${status}`);
    this.broadcast('BOOKING_UPDATED', { booking });
    return booking;
  }

  // Deliveries
  public getDeliveries(): DeliveryRecord[] {
    return this.data.deliveries.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public updateDeliveryStatus(
    id: string,
    updates: Partial<Pick<DeliveryRecord, 'status' | 'assignedRider' | 'notes'>>,
    actorEmail: string
  ): DeliveryRecord | null {
    const delivery = this.data.deliveries.find((d) => d.id === id);
    if (!delivery) return null;

    Object.assign(delivery, updates);
    delivery.updatedAt = new Date().toISOString();

    this.saveDatabase();
    this.addAuditLog(actorEmail, 'admin', 'UPDATE_DELIVERY_STATUS', 'deliveries', id, `Delivery ${delivery.type} status changed to ${delivery.status}`);
    this.broadcast('DELIVERY_UPDATED', { delivery });
    return delivery;
  }

  // Notifications
  public getNotifications(userId: string): Notification[] {
    return this.data.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createNotification(payload: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification {
    const notif: Notification = {
      ...payload,
      id: 'notif-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 5),
      read: false,
      createdAt: new Date().toISOString(),
    };

    this.data.notifications.unshift(notif);
    this.saveDatabase();
    this.broadcast('NOTIFICATION_CREATED', { notification: notif });
    return notif;
  }

  public markNotificationAsRead(id: string, userId: string): boolean {
    const notif = this.data.notifications.find((n) => n.id === id && n.userId === userId);
    if (!notif) return false;
    notif.read = true;
    this.saveDatabase();
    return true;
  }

  public markAllNotificationsAsRead(userId: string): boolean {
    let changed = false;
    this.data.notifications.forEach((n) => {
      if (n.userId === userId && !n.read) {
        n.read = true;
        changed = true;
      }
    });
    if (changed) this.saveDatabase();
    return true;
  }

  // Settings
  public getSettings(): BusinessSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<BusinessSettings>, actorEmail: string): BusinessSettings {
    this.data.settings = {
      ...this.data.settings,
      ...updates,
    };
    this.saveDatabase();
    this.addAuditLog(actorEmail, 'admin', 'UPDATE_SETTINGS', 'settings', 'global', 'Updated business settings');
    this.broadcast('SETTINGS_UPDATED', { settings: this.data.settings });
    return this.data.settings;
  }

  // Metrics
  public getAdminMetrics() {
    const todayStr = new Date().toISOString().slice(0, 10);
    const orders = this.data.orders;

    const totalOrdersToday = orders.filter((o) => o.createdAt.startsWith(todayStr)).length;
    const pendingOrders = orders.filter((o) => ['requested', 'confirmed'].includes(o.orderStatus)).length;
    const inProgressOrders = orders.filter((o) =>
      ['pickup_scheduled', 'picked_up', 'processing', 'washing', 'drying', 'ironing_folding', 'quality_check'].includes(o.orderStatus)
    ).length;
    const readyOrders = orders.filter((o) => ['ready', 'out_for_delivery'].includes(o.orderStatus)).length;
    const completedOrders = orders.filter((o) => ['delivered', 'completed'].includes(o.orderStatus)).length;
    const cancelledOrders = orders.filter((o) => o.orderStatus === 'cancelled').length;

    const pickupsToday = this.data.deliveries.filter((d) => d.type === 'pickup' && d.scheduledDate === todayStr).length;
    const deliveriesToday = this.data.deliveries.filter((d) => d.type === 'delivery' && d.scheduledDate === todayStr).length;

    const totalCustomers = this.data.users.filter((u) => u.role === 'customer').length;
    const totalRevenue = orders
      .filter((o) => o.orderStatus !== 'cancelled' && ['paid_on_delivery', 'paid_mpesa', 'paid_cash'].includes(o.paymentStatus))
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      totalOrdersToday,
      pendingOrders,
      inProgressOrders,
      readyOrders,
      pickupsToday,
      deliveriesToday,
      completedOrders,
      cancelledOrders,
      totalCustomers,
      totalRevenue,
      recentOrders: orders.slice(0, 8),
    };
  }
}

export const db = new Database();
