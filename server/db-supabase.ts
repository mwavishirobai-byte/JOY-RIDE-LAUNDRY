import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, ServiceItem, Order, Booking, DeliveryRecord, Notification, BusinessSettings, AuditLog, OrderStatus, PaymentStatus } from '../src/types';

export const DEFAULT_ELDORET_AREAS = [
  'Hawai Road & Environs', 'Pioneer Estate', 'Elgon View', 'Annex / Moi University Border',
  'Kapsoya Estate', 'West Indies', 'Eldoret CBD', 'Maili Nne', 'Action / Upper Action',
  'Huruma / Kipkaren Road', 'Langas', 'Kimumu', 'Riat / University Way',
  'Chepkoilel (UoE) Area', 'Block 10', 'Old Stadium / Sosiani',
];

const now = () => new Date().toISOString();

export const INITIAL_SERVICES: ServiceItem[] = [
  { id:'srv-wash-fold', name:'Standard Wash & Fold', description:'Everyday clothes meticulously washed with premium eco-detergent, tumble-dried, and neatly folded.', category:'clothing', priceType:'per_kg', basePrice:150, unit:'kg', image:'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=800&q=80', active:true, turnaroundHours:24, popular:true, tags:['Daily Wear','T-shirts','Casual','Fast Service'], createdAt:now(), updatedAt:now() },
  { id:'srv-wash-iron', name:'Executive Wash & Iron', description:'Comprehensive gentle wash, conditioning, precision steam ironed and packed on hangers or crisp folded.', category:'clothing', priceType:'per_kg', basePrice:220, unit:'kg', image:'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=800&q=80', active:true, turnaroundHours:24, popular:true, tags:['Office Wear','Shirts','Trousers','Crisp Finish'], createdAt:now(), updatedAt:now() },
  { id:'srv-duvet-cleaning', name:'Bed Duvet & Quilt Care', description:'Deep sanitary hypoallergenic wash & disinfection for single, double, queen, and king-size duvets.', category:'bedding', priceType:'per_item', basePrice:600, unit:'piece', image:'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80', active:true, turnaroundHours:48, popular:true, tags:['Duvet','Heavy Quilt','Allergen Removal','Fresh Fragrance'], createdAt:now(), updatedAt:now() },
  { id:'srv-heavy-blanket', name:'Heavy Wool & Mink Blanket', description:'Intense dirt extraction and gentle fiber conditioning for heavy wool, fleece, and imported mink blankets.', category:'bedding', priceType:'per_item', basePrice:500, unit:'piece', image:'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=800&q=80', active:true, turnaroundHours:48, popular:false, tags:['Blanket','Winter Warmth','Gentle Drying'], createdAt:now(), updatedAt:now() },
  { id:'srv-bedsheets-linen', name:'Bedsheets & Pillowcases Set', description:'Full sanitization, soft fragrance treatment, and wrinkle-free hot pressing for bed sets.', category:'bedding', priceType:'per_item', basePrice:300, unit:'set (4 pcs)', image:'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80', active:true, turnaroundHours:24, popular:false, tags:['Bedsheets','Hospitality Grade','Sanitized'], createdAt:now(), updatedAt:now() },
  { id:'srv-suit-pressing', name:'Two-Piece Suit Care & Press', description:'Expert fabric brushing, spot stain treatment, and professional 3D steam finishing for suits.', category:'specialized', priceType:'per_item', basePrice:450, unit:'suit', image:'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80', active:true, turnaroundHours:24, popular:true, tags:['Formal Wear','Suits','Blazers','Crease Proof'], createdAt:now(), updatedAt:now() },
  { id:'srv-uniform-cleaning', name:'School & Work Uniforms', description:'Deep stain removal for collars & cuffs, fabric brightening, and sharp crease pressing for uniforms.', category:'clothing', priceType:'per_item', basePrice:200, unit:'pair', image:'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80', active:true, turnaroundHours:24, popular:false, tags:['School Uniforms','Security Guard Uniforms','Corporate'], createdAt:now(), updatedAt:now() },
  { id:'srv-curtains-drapes', name:'Curtains & Window Drapes', description:'Dust extraction, gentle wash, steam restoration, and anti-static treatment for heavy or sheer curtains.', category:'specialized', priceType:'per_item', basePrice:350, unit:'panel', image:'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', active:true, turnaroundHours:48, popular:false, tags:['Curtains','Drapes','Living Room Care'], createdAt:now(), updatedAt:now() },
  { id:'srv-steam-ironing-only', name:'Steam Pressing & Ironing Only', description:'For pre-washed garments requiring immaculate professional hand or steam pressing.', category:'ironing', priceType:'per_item', basePrice:70, unit:'garment', image:'https://images.unsplash.com/photo-1489274495757-95c7c837b101?auto=format&fit=crop&w=800&q=80', active:true, turnaroundHours:12, popular:false, tags:['Pressing Only','Ironing','Quick Service'], createdAt:now(), updatedAt:now() },
  { id:'srv-delicate-silk', name:'Delicates & Wedding Gown Care', description:'pH-neutral specialized bath, spot treatment for delicate lace, silk, and formal gowns.', category:'specialized', priceType:'per_item', basePrice:800, unit:'dress', image:'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80', active:true, turnaroundHours:48, popular:false, tags:['Silk','Wedding Dress','Delicate Hand Wash'], createdAt:now(), updatedAt:now() },
];

export const INITIAL_SETTINGS: BusinessSettings = {
  businessName:'Joy and Ride Laundry', tagline:'Premium laundry care with doorstep pickup and fast delivery across Eldoret', phone:'0741775878', whatsapp:'0741775878', email:'joyridelaundry@gmail.com', address:'Hawai Road, Eldoret, Kenya', road:'Hawai Road', town:'Eldoret', county:'Uasin Gishu', verifiedMapsUrl:'https://www.google.com/maps/search/?api=1&query=Hawai+Road+Eldoret+Kenya',
  openingHours:[{days:'Monday – Friday',hours:'7:00 AM – 7:30 PM'},{days:'Saturday',hours:'7:30 AM – 7:00 PM'},{days:'Sunday',hours:'8:30 AM – 5:00 PM'}], currency:'KES',
  deliveryFeeConfig:{baseFee:150,freeDeliveryThreshold:2000,eldoretAreas:DEFAULT_ELDORET_AREAS},
  announcement:'Fresh, hygienic laundry in Eldoret! Free doorstep pickup available along Hawai Road, Pioneer, Elgon View, Annex & CBD.', allowBookings:true,
  mpesaPaymentInstructions:'M-Pesa Paybill / Till Number or Pay on Delivery upon inspection. Contact 0741775878 for business till verification.',
};

type State = { users:any[]; services:any[]; orders:any[]; bookings:any[]; deliveries:any[]; notifications:any[]; settings:any; auditLogs:any[] };

class SupabaseDatabase {
  private client: SupabaseClient;
  private data: State = { users:[], services:INITIAL_SERVICES, orders:[], bookings:[], deliveries:[], notifications:[], settings:INITIAL_SETTINGS, auditLogs:[] };
  private sseClients = new Set<(event:string,data:any)=>void>();
  public readonly ready: Promise<void>;
  private persistQueue: Promise<void> = Promise.resolve();

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
    this.client = createClient(url, key, { auth: { persistSession:false, autoRefreshToken:false } });
    this.ready = this.initialize();
  }

  private async initialize() {
    const { data, error } = await this.client.from('app_state').select('data').eq('id','main').maybeSingle();
    if (error) throw new Error(`Supabase app_state read failed: ${error.message}`);
    if (data?.data) {
      const parsed = data.data as Partial<State>;
      this.data = { users:parsed.users || [], services:parsed.services?.length ? parsed.services : INITIAL_SERVICES, orders:parsed.orders || [], bookings:parsed.bookings || [], deliveries:parsed.deliveries || [], notifications:parsed.notifications || [], settings:parsed.settings || INITIAL_SETTINGS, auditLogs:parsed.auditLogs || [] };
    } else {
      await this.persist();
    }
    await this.ensureAdminUser();
  }

  private schedulePersist() {
    this.persistQueue = this.persistQueue.then(() => this.persist()).catch((e) => console.error('Supabase persistence failed:', e));
  }

  private async persist() {
    const { error } = await this.client.from('app_state').upsert({ id:'main', data:this.data, updated_at:now() }, { onConflict:'id' });
    if (error) throw new Error(error.message);
  }

  private async ensureAdminUser() {
    const email = (process.env.ADMIN_EMAIL || 'admin@joyridelaundry.co.ke').toLowerCase();
    if (this.data.users.some((u) => u.email?.toLowerCase() === email)) return;
    const password = process.env.ADMIN_PASSWORD;
    if (!password) {
      console.warn('ADMIN_PASSWORD is not configured; no default admin account was created.');
      return;
    }
    const admin:any = { id:'usr-admin-' + crypto.randomUUID().slice(0,8), fullName:'Joy and Ride Admin', email, phone:'0741775878', role:'admin', address:'Hawai Road, Eldoret', area:'Hawai Road & Environs', passwordHash:bcrypt.hashSync(password,10), createdAt:now(), updatedAt:now() };
    this.data.users.push(admin);
    this.addAuditLog('system','system','INITIALIZE_ADMIN','users',admin.id,`Created admin account for ${email}`);
    await this.persist();
  }

  public subscribeSSE(listener:(event:string,data:any)=>void){ this.sseClients.add(listener); return () => this.sseClients.delete(listener); }
  public broadcast(event:string,payload:any){ for(const client of this.sseClients){ try{client(event,payload);}catch{} } }

  public addAuditLog(actorEmail:string, actorRole:string, action:string, entity:string, entityId:string, details:string){
    const log:any={id:'log-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),timestamp:now(),actorEmail,actorRole,action,entity,entityId,details};
    this.data.auditLogs.unshift(log); this.data.auditLogs=this.data.auditLogs.slice(0,500); this.schedulePersist();
  }
  public getAuditLogs(){ return this.data.auditLogs; }

  public getUsers(){ return this.data.users.map(({passwordHash,...u})=>u); }
  public findUserByEmail(email:string){ return this.data.users.find(u=>u.email?.toLowerCase()===email.toLowerCase()); }
  public findUserById(id:string){ return this.data.users.find(u=>u.id===id); }
  public createUser(input:any){
    const user:any={id:'usr-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6),fullName:input.fullName,email:input.email.toLowerCase(),phone:input.phone,role:input.role||'customer',address:input.address||'',area:input.area||'Hawai Road & Environs',passwordHash:bcrypt.hashSync(input.password,10),createdAt:now(),updatedAt:now()};
    this.data.users.push(user); this.schedulePersist(); this.addAuditLog(user.email,user.role,'USER_REGISTERED','users',user.id,`User account created: ${user.fullName} (${user.phone})`); const {passwordHash,...safe}=user; return safe;
  }
  public updateUserProfile(id:string, updates:any){ const i=this.data.users.findIndex(u=>u.id===id); if(i<0)return null; this.data.users[i]={...this.data.users[i],...updates,updatedAt:now()}; this.schedulePersist(); const {passwordHash,...safe}=this.data.users[i]; return safe; }

  public getServices(onlyActive=false){ return onlyActive?this.data.services.filter(s=>s.active):this.data.services; }
  public getServiceById(id:string){ return this.data.services.find(s=>s.id===id); }
  public createService(input:any, actorEmail:string){ const s:any={...input,id:'srv-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,5),createdAt:now(),updatedAt:now()}; this.data.services.push(s); this.schedulePersist(); this.addAuditLog(actorEmail,'admin','CREATE_SERVICE','services',s.id,`Created service: ${s.name} (KES ${s.basePrice}/${s.unit})`); this.broadcast('SERVICE_UPDATED',{service:s,action:'create'}); return s; }
  public updateService(id:string,updates:any,actorEmail:string){ const i=this.data.services.findIndex(s=>s.id===id); if(i<0)return null; const s:any={...this.data.services[i],...updates,updatedAt:now()}; this.data.services[i]=s; this.schedulePersist(); this.addAuditLog(actorEmail,'admin','UPDATE_SERVICE','services',id,`Updated service: ${s.name}`); this.broadcast('SERVICE_UPDATED',{service:s,action:'update'}); return s; }
  public deleteService(id:string,actorEmail:string){ const i=this.data.services.findIndex(s=>s.id===id); if(i<0)return false; const name=this.data.services[i].name; this.data.services.splice(i,1); this.schedulePersist(); this.addAuditLog(actorEmail,'admin','DELETE_SERVICE','services',id,`Deleted service: ${name}`); this.broadcast('SERVICE_UPDATED',{serviceId:id,action:'delete'}); return true; }

  public getOrders(filters:any={}){ let r=[...this.data.orders]; if(filters.customerId)r=r.filter(o=>o.customerId===filters.customerId); if(filters.status)r=r.filter(o=>o.orderStatus===filters.status); if(filters.search){const q=filters.search.toLowerCase();r=r.filter(o=>[o.orderNumber,o.customerName,o.customerPhone,o.pickupAddress].some(v=>String(v||'').toLowerCase().includes(q)));} return r.sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()); }
  public getOrderById(id:string){ return this.data.orders.find(o=>o.id===id||o.orderNumber===id); }
  public createOrder(p:any){
    const date=new Date().toISOString().slice(0,10).replace(/-/g,''); const orderNumber=`JRL-${date}-${Math.floor(1000+Math.random()*9000)}`; let subtotal=0;
    const items=(p.items||[]).map((item:any)=>{const s=this.getServiceById(item.serviceId);const unitPrice=s?s.basePrice:150;const lineTotal=unitPrice*item.quantity;subtotal+=lineTotal;return {serviceId:item.serviceId,serviceName:s?.name||'Custom Laundry Care',quantity:item.quantity,unitPrice,unit:s?.unit||'item',category:s?.category||'clothing',notes:item.notes||''};});
    const deliveryFee=(p.deliveryOption==='doorstep_delivery'||p.pickupOption==='doorstep_pickup')?(subtotal>=this.data.settings.deliveryFeeConfig.freeDeliveryThreshold?0:this.data.settings.deliveryFeeConfig.baseFee):0;
    const order:any={id:'ord-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6),orderNumber,customerId:p.customerId,customerName:p.customerName,customerPhone:p.customerPhone,customerEmail:p.customerEmail,pickupOption:p.pickupOption,pickupAddress:p.pickupAddress,pickupArea:p.pickupArea,pickupDate:p.pickupDate,pickupTimeSlot:p.pickupTimeSlot,deliveryOption:p.deliveryOption,deliveryAddress:p.deliveryAddress,deliveryArea:p.deliveryArea,deliveryDate:p.deliveryDate,deliveryTimeSlot:p.deliveryTimeSlot,items,subtotal,deliveryFee,totalAmount:subtotal+deliveryFee,orderStatus:'requested',paymentStatus:'pending',paymentMethod:p.paymentMethod,customerNotes:p.customerNotes||'',statusHistory:[{status:'requested',timestamp:now(),note:'Laundry order request submitted online.',updatedBy:p.customerName}],createdAt:now(),updatedAt:now()};
    this.data.orders.unshift(order);
    if(order.pickupOption==='doorstep_pickup')this.data.deliveries.unshift({id:'del-p-'+Date.now().toString(36),orderId:order.id,orderNumber:order.orderNumber,type:'pickup',customerName:order.customerName,customerPhone:order.customerPhone,address:order.pickupAddress,area:order.pickupArea,scheduledDate:order.pickupDate,scheduledTimeSlot:order.pickupTimeSlot,status:'scheduled',notes:order.customerNotes,updatedAt:now()});
    if(order.deliveryOption==='doorstep_delivery')this.data.deliveries.unshift({id:'del-d-'+Date.now().toString(36),orderId:order.id,orderNumber:order.orderNumber,type:'delivery',customerName:order.customerName,customerPhone:order.customerPhone,address:order.deliveryAddress,area:order.deliveryArea,scheduledDate:order.deliveryDate,scheduledTimeSlot:order.deliveryTimeSlot,status:'scheduled',notes:order.customerNotes,updatedAt:now()});
    this.createNotification({userId:order.customerId,title:'Laundry Order Received!',message:`Your order #${order.orderNumber} has been received. Our Eldoret team will confirm your pickup/service shortly.`,type:'order',orderId:order.id});
    this.schedulePersist(); this.addAuditLog(order.customerEmail,'customer','CREATE_ORDER','orders',order.id,`Order placed: #${order.orderNumber} (KES ${order.totalAmount})`); this.broadcast('ORDER_CREATED',{order}); return order;
  }
  public updateOrderStatus(id:string,status:OrderStatus,actorEmail:string,note?:string,paymentStatus?:PaymentStatus){ const o=this.data.orders.find(x=>x.id===id); if(!o)return null; const old=o.orderStatus;o.orderStatus=status;if(paymentStatus)o.paymentStatus=paymentStatus;o.updatedAt=now();o.statusHistory.push({status,timestamp:now(),note:note||`Status updated from ${old} to ${status}`,updatedBy:actorEmail});this.createNotification({userId:o.customerId,title:`Order Status: ${String(status).replace(/_/g,' ').toUpperCase()}`,message:`Your laundry order #${o.orderNumber} is now: ${String(status).replace(/_/g,' ')}. ${note||''}`,type:'order',orderId:o.id});this.schedulePersist();this.addAuditLog(actorEmail,'admin','UPDATE_ORDER_STATUS','orders',o.id,`Status updated to ${status} for #${o.orderNumber}`);this.broadcast('ORDER_STATUS_CHANGED',{order:o,oldStatus:old,newStatus:status});return o; }
  public updateOrderDetails(id:string,updates:any,actorEmail:string){const o=this.data.orders.find(x=>x.id===id);if(!o)return null;Object.assign(o,updates);o.updatedAt=now();this.schedulePersist();this.addAuditLog(actorEmail,'admin','UPDATE_ORDER_DETAILS','orders',o.id,`Updated details for #${o.orderNumber}`);this.broadcast('ORDER_UPDATED',{order:o});return o;}

  public getBookings(customerId?:string){const r=customerId?this.data.bookings.filter(b=>b.customerId===customerId):this.data.bookings;return [...r].sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());}
  public createBooking(input:any){const date=new Date().toISOString().slice(0,10).replace(/-/g,'');const b:any={...input,id:'bk-'+Date.now().toString(36),bookingNumber:`BK-${date}-${Math.floor(100+Math.random()*900)}`,status:'pending',createdAt:now(),updatedAt:now()};this.data.bookings.unshift(b);this.createNotification({userId:b.customerId,title:'Booking Request Received',message:`Your booking appointment #${b.bookingNumber} for ${b.preferredDate} (${b.preferredTimeSlot}) has been scheduled.`,type:'pickup'});this.schedulePersist();this.addAuditLog(b.customerEmail,'customer','CREATE_BOOKING','bookings',b.id,`Booking #${b.bookingNumber} created`);this.broadcast('BOOKING_CREATED',{booking:b});return b;}
  public updateBookingStatus(id:string,status:any,actorEmail:string){const b=this.data.bookings.find(x=>x.id===id);if(!b)return null;b.status=status;b.updatedAt=now();this.schedulePersist();this.addAuditLog(actorEmail,'admin','UPDATE_BOOKING_STATUS','bookings',id,`Booking status changed to ${status}`);this.broadcast('BOOKING_UPDATED',{booking:b});return b;}

  public getDeliveries(){return [...this.data.deliveries].sort((a,b)=>new Date(b.updatedAt).getTime()-new Date(a.updatedAt).getTime());}
  public updateDeliveryStatus(id:string,updates:any,actorEmail:string){const d=this.data.deliveries.find(x=>x.id===id);if(!d)return null;Object.assign(d,updates);d.updatedAt=now();this.schedulePersist();this.addAuditLog(actorEmail,'admin','UPDATE_DELIVERY_STATUS','deliveries',id,`Delivery ${d.type} status changed to ${d.status}`);this.broadcast('DELIVERY_UPDATED',{delivery:d});return d;}

  public getNotifications(userId:string){return this.data.notifications.filter(n=>n.userId===userId).sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());}
  public createNotification(input:any){const n:any={...input,id:'notif-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,5),read:false,createdAt:now()};this.data.notifications.unshift(n);this.schedulePersist();this.broadcast('NOTIFICATION_CREATED',{notification:n});return n;}
  public markNotificationAsRead(id:string,userId:string){const n=this.data.notifications.find(x=>x.id===id&&x.userId===userId);if(!n)return false;n.read=true;this.schedulePersist();return true;}
  public markAllNotificationsAsRead(userId:string){let changed=false;for(const n of this.data.notifications){if(n.userId===userId&&!n.read){n.read=true;changed=true;}}if(changed)this.schedulePersist();return true;}

  public getSettings(){return this.data.settings;}
  public updateSettings(updates:any,actorEmail:string){this.data.settings={...this.data.settings,...updates};this.schedulePersist();this.addAuditLog(actorEmail,'admin','UPDATE_SETTINGS','settings','global','Updated business settings');this.broadcast('SETTINGS_UPDATED',{settings:this.data.settings});return this.data.settings;}
  public getAdminMetrics(){const today=new Date().toISOString().slice(0,10),orders=this.data.orders;return {totalOrdersToday:orders.filter(o=>o.createdAt.startsWith(today)).length,pendingOrders:orders.filter(o=>['requested','confirmed'].includes(o.orderStatus)).length,inProgressOrders:orders.filter(o=>['pickup_scheduled','picked_up','processing','washing','drying','ironing_folding','quality_check'].includes(o.orderStatus)).length,readyOrders:orders.filter(o=>['ready','out_for_delivery'].includes(o.orderStatus)).length,pickupsToday:this.data.deliveries.filter(d=>d.type==='pickup'&&d.scheduledDate===today).length,deliveriesToday:this.data.deliveries.filter(d=>d.type==='delivery'&&d.scheduledDate===today).length,completedOrders:orders.filter(o=>['delivered','completed'].includes(o.orderStatus)).length,cancelledOrders:orders.filter(o=>o.orderStatus==='cancelled').length,totalCustomers:this.data.users.filter(u=>u.role==='customer').length,totalRevenue:orders.filter(o=>o.orderStatus!=='cancelled'&&['paid_on_delivery','paid_mpesa','paid_cash'].includes(o.paymentStatus)).reduce((s,o)=>s+o.totalAmount,0),recentOrders:orders.slice(0,8)};}
}

export const db = new SupabaseDatabase();
export const dbReady = db.ready;
