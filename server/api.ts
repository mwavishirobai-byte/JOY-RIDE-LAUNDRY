import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { User, OrderStatus, PaymentStatus } from '../src/types';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'joy-and-ride-laundry-secure-secret-key-eldoret';

export interface AuthRequest extends Request {
  user?: User;
}

// Middleware: Authenticate JWT token
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    const user = db.findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User account no longer exists' },
      });
    }

    const { passwordHash: _, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired session token' },
    });
  }
}

// Middleware: Require Admin role
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  authenticateToken(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Administrator privileges required' },
      });
    }
    next();
  });
}

// Optional Auth (for guest vs logged-in customer)
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = db.findUserById(decoded.id);
      if (user) {
        const { passwordHash: _, ...safeUser } = user;
        req.user = safeUser;
      }
    } catch {
      // ignore
    }
  }
  next();
}

function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ==================== AUTH ROUTES ====================

// Register customer
router.post('/auth/register', (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, password, address, area } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Full name, email, phone number, and password are required' },
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: { code: 'WEAK_PASSWORD', message: 'Password must be at least 6 characters' },
      });
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'EMAIL_EXISTS', message: 'An account with this email already exists. Please log in.' },
      });
    }

    const user = db.createUser({
      fullName,
      email,
      phone,
      password,
      role: 'customer',
      address,
      area,
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      data: { user, token },
      message: 'Account created successfully',
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message || 'Registration failed' },
    });
  }
});

// Login customer/staff
router.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_CREDENTIALS', message: 'Email and password are required' },
      });
    }

    const rawUser = db.findUserByEmail(email);
    if (!rawUser) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    const valid = bcrypt.compareSync(password, rawUser.passwordHash);
    if (!valid) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    const { passwordHash: _, ...safeUser } = rawUser;
    const token = generateToken(safeUser);

    return res.json({
      success: true,
      data: { user: safeUser, token },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message || 'Login failed' },
    });
  }
});

// Dedicated Admin Login (Strict role check)
router.post('/auth/admin-login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_CREDENTIALS', message: 'Admin email and password are required' },
      });
    }

    const rawUser = db.findUserByEmail(email);
    if (!rawUser) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED_ADMIN', message: 'Invalid administrative credentials' },
      });
    }

    if (rawUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'This account does not have administrative privileges' },
      });
    }

    const valid = bcrypt.compareSync(password, rawUser.passwordHash);
    if (!valid) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED_ADMIN', message: 'Invalid administrative credentials' },
      });
    }

    const { passwordHash: _, ...safeUser } = rawUser;
    const token = generateToken(safeUser);

    db.addAuditLog(safeUser.email, 'admin', 'ADMIN_LOGIN', 'auth', safeUser.id, 'Administrator logged in successfully');

    return res.json({
      success: true,
      data: { user: safeUser, token },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message || 'Admin login failed' },
    });
  }
});

// Current user profile
router.get('/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  return res.json({
    success: true,
    data: { user: req.user },
  });
});

// Update profile
router.put('/auth/profile', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { fullName, phone, address, area } = req.body;
    const updated = db.updateUserProfile(req.user!.id, { fullName, phone, address, area });
    return res.json({
      success: true,
      data: { user: updated },
      message: 'Profile updated successfully',
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
});

// ==================== SERVICES ====================

// Public active services
router.get('/services', (_req: Request, res: Response) => {
  const services = db.getServices(true);
  return res.json({
    success: true,
    data: services,
  });
});

// Admin get all services (including inactive)
router.get('/admin/services', requireAdmin, (_req: Request, res: Response) => {
  const services = db.getServices(false);
  return res.json({
    success: true,
    data: services,
  });
});

// Admin create service
router.post('/admin/services', requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { name, description, category, priceType, basePrice, unit, image, active, turnaroundHours, tags, popular } = req.body;
    if (!name || !category || basePrice === undefined || !unit) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_DATA', message: 'Service name, category, unit, and base price are required' },
      });
    }

    const service = db.createService(
      {
        name,
        description: description || '',
        category,
        priceType: priceType || 'per_item',
        basePrice: Number(basePrice),
        unit,
        image: image || 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=800&q=80',
        active: active !== undefined ? active : true,
        turnaroundHours: Number(turnaroundHours) || 24,
        popular: Boolean(popular),
        tags: Array.isArray(tags) ? tags : [],
      },
      req.user!.email
    );

    return res.status(201).json({
      success: true,
      data: service,
      message: 'Service added successfully',
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
});

// Admin update service
router.put('/admin/services/:id', requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const updated = db.updateService(req.params.id, req.body, req.user!.email);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: { code: 'SERVICE_NOT_FOUND', message: 'Service does not exist' },
      });
    }
    return res.json({
      success: true,
      data: updated,
      message: 'Service updated successfully',
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
});

// Admin delete service
router.delete('/admin/services/:id', requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const deleted = db.deleteService(req.params.id, req.user!.email);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: { code: 'SERVICE_NOT_FOUND', message: 'Service does not exist' },
      });
    }
    return res.json({
      success: true,
      message: 'Service removed successfully',
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
});

// ==================== ORDERS ====================

// Place a new order
router.post('/orders', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      pickupOption,
      pickupAddress,
      pickupArea,
      pickupDate,
      pickupTimeSlot,
      deliveryOption,
      deliveryAddress,
      deliveryArea,
      deliveryDate,
      deliveryTimeSlot,
      items,
      paymentMethod,
      customerNotes,
    } = req.body;

    if (!customerName || !customerPhone || !items || !items.length) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ORDER', message: 'Name, phone number, and at least one laundry item are required' },
      });
    }

    let customerId = req.user?.id;
    const finalEmail = (customerEmail || req.user?.email || `customer-${customerPhone.replace(/\D/g, '')}@joyridelaundry.co.ke`).toLowerCase();

    // If not authenticated, find or create customer record
    if (!customerId) {
      let existing = db.findUserByEmail(finalEmail);
      if (!existing) {
        const guestUser = db.createUser({
          fullName: customerName,
          email: finalEmail,
          phone: customerPhone,
          password: 'GuestUser' + Math.random().toString(36).slice(2, 8),
          role: 'customer',
          address: pickupAddress || deliveryAddress || '',
          area: pickupArea || deliveryArea || 'Hawai Road & Environs',
        });
        customerId = guestUser.id;
      } else {
        customerId = existing.id;
      }
    }

    const order = db.createOrder({
      customerId,
      customerName,
      customerPhone,
      customerEmail: finalEmail,
      pickupOption: pickupOption || 'doorstep_pickup',
      pickupAddress: pickupAddress || 'Hawai Road, Eldoret',
      pickupArea: pickupArea || 'Hawai Road & Environs',
      pickupDate: pickupDate || new Date().toISOString().slice(0, 10),
      pickupTimeSlot: pickupTimeSlot || '08:00 AM - 11:00 AM',
      deliveryOption: deliveryOption || 'doorstep_delivery',
      deliveryAddress: deliveryAddress || pickupAddress || 'Hawai Road, Eldoret',
      deliveryArea: deliveryArea || pickupArea || 'Hawai Road & Environs',
      deliveryDate: deliveryDate || new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
      deliveryTimeSlot: deliveryTimeSlot || '02:00 PM - 05:00 PM',
      items,
      paymentMethod: paymentMethod || 'pay_on_delivery',
      customerNotes,
    });

    return res.status(201).json({
      success: true,
      data: order,
      message: 'Laundry order created successfully',
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
});

// Customer's orders
router.get('/orders', authenticateToken, (req: AuthRequest, res: Response) => {
  const orders = db.getOrders({ customerId: req.user!.id });
  return res.json({
    success: true,
    data: orders,
  });
});

// Get single order (if customer owns it or admin)
router.get('/orders/:id', optionalAuth, (req: AuthRequest, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({
      success: false,
      error: { code: 'ORDER_NOT_FOUND', message: 'The requested order could not be found' },
    });
  }

  // If user is logged in and not admin and doesn't own order
  if (req.user && req.user.role !== 'admin' && req.user.id !== order.customerId) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'You do not have permission to view this order' },
    });
  }

  return res.json({
    success: true,
    data: order,
  });
});

// Public Track Order (By Order Number + optional phone verify)
router.get('/orders/track/:orderNumber', (req: Request, res: Response) => {
  const order = db.getOrderById(req.params.orderNumber);
  if (!order) {
    return res.status(404).json({
      success: false,
      error: { code: 'ORDER_NOT_FOUND', message: 'No laundry order found with this tracking number' },
    });
  }

  // Return safe tracking view
  return res.json({
    success: true,
    data: {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      pickupOption: order.pickupOption,
      pickupArea: order.pickupArea,
      pickupDate: order.pickupDate,
      pickupTimeSlot: order.pickupTimeSlot,
      deliveryOption: order.deliveryOption,
      deliveryArea: order.deliveryArea,
      deliveryDate: order.deliveryDate,
      deliveryTimeSlot: order.deliveryTimeSlot,
      items: order.items,
      totalAmount: order.totalAmount,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      assignedRider: order.assignedRider,
      statusHistory: order.statusHistory,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    },
  });
});

// Admin get all orders
router.get('/admin/orders', requireAdmin, (req: Request, res: Response) => {
  const { status, search } = req.query;
  const orders = db.getOrders({
    status: status as OrderStatus,
    search: search as string,
  });
  return res.json({
    success: true,
    data: orders,
  });
});

// Admin update order status
router.put('/admin/orders/:id/status', requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { status, note, paymentStatus } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_STATUS', message: 'Status is required' },
      });
    }

    const order = db.updateOrderStatus(req.params.id, status as OrderStatus, req.user!.email, note, paymentStatus as PaymentStatus);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: { code: 'ORDER_NOT_FOUND', message: 'Order does not exist' },
      });
    }

    return res.json({
      success: true,
      data: order,
      message: `Order #${order.orderNumber} status updated to ${status}`,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
});

// Admin update order details (assigned rider, admin notes, payment)
router.put('/admin/orders/:id/details', requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const order = db.updateOrderDetails(req.params.id, req.body, req.user!.email);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: { code: 'ORDER_NOT_FOUND', message: 'Order does not exist' },
      });
    }
    return res.json({
      success: true,
      data: order,
      message: 'Order details updated',
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
});

// ==================== BOOKINGS ====================

// Create booking
router.post('/bookings', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const { customerName, customerPhone, customerEmail, serviceType, preferredDate, preferredTimeSlot, serviceOption, address, area, notes } =
      req.body;

    if (!customerName || !customerPhone || !preferredDate) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_DATA', message: 'Name, phone, and preferred date are required' },
      });
    }

    let customerId = req.user?.id;
    const finalEmail = (customerEmail || req.user?.email || `${customerPhone.replace(/\D/g, '')}@joyridelaundry.co.ke`).toLowerCase();

    if (!customerId) {
      let existing = db.findUserByEmail(finalEmail);
      if (!existing) {
        const guestUser = db.createUser({
          fullName: customerName,
          email: finalEmail,
          phone: customerPhone,
          password: 'GuestUser' + Math.random().toString(36).slice(2, 8),
          role: 'customer',
          address,
          area,
        });
        customerId = guestUser.id;
      } else {
        customerId = existing.id;
      }
    }

    const booking = db.createBooking({
      customerId,
      customerName,
      customerPhone,
      customerEmail: finalEmail,
      serviceType: serviceType || 'General Laundry Care',
      preferredDate,
      preferredTimeSlot: preferredTimeSlot || '09:00 AM - 12:00 PM',
      serviceOption: serviceOption || 'pickup_and_delivery',
      address: address || 'Hawai Road, Eldoret',
      area: area || 'Hawai Road & Environs',
      notes,
    });

    return res.status(201).json({
      success: true,
      data: booking,
      message: 'Booking appointment requested successfully',
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
});

// Customer bookings
router.get('/bookings', authenticateToken, (req: AuthRequest, res: Response) => {
  const bookings = db.getBookings(req.user!.id);
  return res.json({
    success: true,
    data: bookings,
  });
});

// Admin bookings
router.get('/admin/bookings', requireAdmin, (_req: Request, res: Response) => {
  const bookings = db.getBookings();
  return res.json({
    success: true,
    data: bookings,
  });
});

// Admin update booking status
router.put('/admin/bookings/:id/status', requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const booking = db.updateBookingStatus(req.params.id, status, req.user!.email);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: { code: 'BOOKING_NOT_FOUND', message: 'Booking does not exist' },
      });
    }
    return res.json({
      success: true,
      data: booking,
      message: `Booking #${booking.bookingNumber} marked as ${status}`,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
});

// ==================== DELIVERIES & PICKUPS ====================

router.get('/admin/deliveries', requireAdmin, (_req: Request, res: Response) => {
  const deliveries = db.getDeliveries();
  return res.json({
    success: true,
    data: deliveries,
  });
});

router.put('/admin/deliveries/:id', requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const delivery = db.updateDeliveryStatus(req.params.id, req.body, req.user!.email);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        error: { code: 'DELIVERY_NOT_FOUND', message: 'Delivery record does not exist' },
      });
    }
    return res.json({
      success: true,
      data: delivery,
      message: 'Delivery schedule updated',
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
});

// ==================== NOTIFICATIONS ====================

router.get('/notifications', authenticateToken, (req: AuthRequest, res: Response) => {
  const notifications = db.getNotifications(req.user!.id);
  return res.json({
    success: true,
    data: notifications,
  });
});

router.put('/notifications/:id/read', authenticateToken, (req: AuthRequest, res: Response) => {
  const success = db.markNotificationAsRead(req.params.id, req.user!.id);
  return res.json({ success });
});

router.put('/notifications/read-all', authenticateToken, (req: AuthRequest, res: Response) => {
  const success = db.markAllNotificationsAsRead(req.user!.id);
  return res.json({ success });
});

// ==================== SETTINGS & METRICS ====================

// Public settings
router.get('/settings/public', (_req: Request, res: Response) => {
  const settings = db.getSettings();
  return res.json({
    success: true,
    data: settings,
  });
});

// Admin settings
router.get('/admin/settings', requireAdmin, (_req: Request, res: Response) => {
  const settings = db.getSettings();
  return res.json({
    success: true,
    data: settings,
  });
});

router.put('/admin/settings', requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const updated = db.updateSettings(req.body, req.user!.email);
    return res.json({
      success: true,
      data: updated,
      message: 'Business settings saved successfully',
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
});

// Admin metrics
router.get('/admin/metrics', requireAdmin, (_req: Request, res: Response) => {
  const metrics = db.getAdminMetrics();
  return res.json({
    success: true,
    data: metrics,
  });
});

// Admin customers list
router.get('/admin/customers', requireAdmin, (_req: Request, res: Response) => {
  const customers = db.getUsers().filter((u) => u.role === 'customer');
  const allOrders = db.getOrders();

  const customerStats = customers.map((c) => {
    const userOrders = allOrders.filter((o) => o.customerId === c.id);
    const totalSpent = userOrders
      .filter((o) => o.orderStatus !== 'cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    return {
      ...c,
      orderCount: userOrders.length,
      totalSpent,
      lastOrderDate: userOrders[0]?.createdAt,
    };
  });

  return res.json({
    success: true,
    data: customerStats,
  });
});

// Admin audit logs
router.get('/admin/audit-logs', requireAdmin, (_req: Request, res: Response) => {
  const logs = db.getAuditLogs();
  return res.json({
    success: true,
    data: logs,
  });
});

// ==================== REALTIME SSE STREAM ====================

router.get('/realtime/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial ping
  res.write(`data: ${JSON.stringify({ event: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);

  const unsubscribe = db.subscribeSSE((event, payload) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  });

  const keepAliveTimer = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 25000);

  req.on('close', () => {
    clearInterval(keepAliveTimer);
    unsubscribe();
  });
});

export default router;
