
import { 
  Product, InventoryFilters, ProductStatus, Order, 
  OrderStatus, Coupon, Customer, HomeConfig, 
  ShippingAddress, SupportTicket, TicketStatus, 
  TicketPriority, AbandonedCart 
} from '../types';
import { supabase } from './supabaseClient';
import { MOCK_PRODUCTS, MOCK_ORDERS, MOCK_COUPONS, MOCK_CUSTOMERS, DEFAULT_HOME_CONFIG } from '../constants';

const KEYS = {
  PRODUCTS: 'seoul_muse_inventory_v2',
  ORDERS: 'seoul_muse_orders_v2',
  COUPONS: 'seoul_muse_coupons_v2',
  CUSTOMERS: 'seoul_muse_customers_v2',
  HOME_CONFIG: 'seoul_muse_home_config_v3',
  TICKETS: 'seoul_muse_tickets_v1',
  ABANDONED: 'seoul_muse_abandoned_v1'
};

const simpleHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(16);
};

// Local storage helpers for fallbacks
const getLocal = (key: string, fallback: any) => {
  const data = localStorage.getItem(key);
  if (!data) return fallback;
  try {
    const parsed = JSON.parse(data);
    return parsed && (Array.isArray(parsed) ? parsed.length > 0 : true) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const setLocal = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const inventoryService = {
  /**
   * PRODUCTS
   */
  async getProducts(filters?: InventoryFilters): Promise<Product[]> {
    if (supabase) {
      let query = supabase.from('products').select('*');
      
      if (filters) {
        if (filters.search) query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
        if (filters.category && filters.category !== 'All') query = query.eq('category', filters.category);
        if (filters.status && filters.status !== 'All') query = query.eq('status', filters.status);
        if (filters.minPrice !== undefined) query = query.gte('price', filters.minPrice);
        if (filters.maxPrice !== undefined) query = query.lte('price', filters.maxPrice);
        
        query = query.order(filters.sortBy || 'name', { ascending: filters.sortOrder === 'asc' });
      }

      const { data, error } = await query;
      if (!error && data) {
        setLocal(KEYS.PRODUCTS, data); // Sync local cache
        return data as Product[];
      }
    }
    return getLocal(KEYS.PRODUCTS, MOCK_PRODUCTS);
  },

  async saveProduct(product: Product): Promise<Product> {
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .upsert({ ...product, id: product.id || `art-${Date.now()}` })
        .select()
        .single();
      if (!error && data) return data as Product;
    }
    const products = getLocal(KEYS.PRODUCTS, MOCK_PRODUCTS);
    const idx = products.findIndex((p: Product) => p.id === product.id);
    const newProd = { ...product, id: product.id || `art-${Date.now()}` };
    if (idx > -1) products[idx] = newProd;
    else products.push(newProd);
    setLocal(KEYS.PRODUCTS, products);
    return newProd;
  },

  async deleteProduct(id: string): Promise<void> {
    if (supabase) {
      await supabase.from('products').delete().eq('id', id);
    }
    const products = getLocal(KEYS.PRODUCTS, MOCK_PRODUCTS);
    setLocal(KEYS.PRODUCTS, products.filter((p: Product) => p.id !== id));
  },

  async adjustStock(id: string, delta: number): Promise<void> {
    const products = await this.getProducts();
    const product = products.find(p => p.id === id);
    if (product) {
      const newStock = Math.max(0, product.stock + delta);
      if (supabase) {
        await supabase.from('products').update({ stock: newStock }).eq('id', id);
      }
      product.stock = newStock;
      setLocal(KEYS.PRODUCTS, products);
    }
  },

  /**
   * ORDERS
   */
  async getOrders(): Promise<Order[]> {
    if (supabase) {
      const { data, error } = await supabase.from('orders').select('*').order('date', { ascending: false });
      if (!error && data) {
        setLocal(KEYS.ORDERS, data);
        return data as Order[];
      }
    }
    return getLocal(KEYS.ORDERS, MOCK_ORDERS);
  },

  async placeOrder(orderData: Partial<Order>): Promise<Order> {
    const newOrder: Order = {
      id: orderData.id || `#ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: orderData.customerName || 'Anonymous',
      customerEmail: orderData.customerEmail || '',
      date: orderData.date || new Date().toISOString(),
      total: orderData.total || 0,
      subtotal: orderData.subtotal || 0,
      tax: orderData.tax || 0,
      shippingFee: orderData.shippingFee || 0,
      discount: orderData.discount || 0,
      status: orderData.status || OrderStatus.PENDING,
      paymentMethod: orderData.paymentMethod || 'Credit Card',
      items: orderData.items || [],
      shippingAddress: orderData.shippingAddress || 'N/A',
      trackingNumber: orderData.trackingNumber || `SM-TRK-${Math.floor(Math.random() * 1000000)}`
    };

    if (supabase) {
      await supabase.from('orders').insert([newOrder]);
    }

    // Update stock and local
    for (const item of newOrder.items) {
      await this.adjustStock(item.productId, -item.quantity);
    }

    const orders = getLocal(KEYS.ORDERS, MOCK_ORDERS);
    orders.unshift(newOrder);
    setLocal(KEYS.ORDERS, orders);

    // Update customer LTV
    const customers = await this.getCustomers();
    const cIdx = customers.findIndex(c => c.email === newOrder.customerEmail);
    if (cIdx > -1) {
      const updatedCust = {
        ...customers[cIdx],
        totalOrders: customers[cIdx].totalOrders + 1,
        totalSpent: customers[cIdx].totalSpent + newOrder.total
      };
      await this.updateCustomerProfile(updatedCust.id, updatedCust);
    }

    return newOrder;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    if (supabase) {
      await supabase.from('orders').update({ status }).eq('id', orderId);
    }
    const orders = getLocal(KEYS.ORDERS, MOCK_ORDERS);
    const idx = orders.findIndex((o: Order) => o.id === orderId);
    if (idx > -1) {
      orders[idx].status = status;
      setLocal(KEYS.ORDERS, orders);
    }
  },

  async updateOrderTracking(orderId: string, trackingNumber: string): Promise<void> {
    if (supabase) {
      await supabase.from('orders').update({ trackingNumber }).eq('id', orderId);
    }
    const orders = getLocal(KEYS.ORDERS, MOCK_ORDERS);
    const idx = orders.findIndex((o: Order) => o.id === orderId);
    if (idx > -1) {
      orders[idx].trackingNumber = trackingNumber;
      setLocal(KEYS.ORDERS, orders);
    }
  },

  async deleteOrder(id: string): Promise<void> {
    if (supabase) {
      await supabase.from('orders').delete().eq('id', id);
    }
    const orders = getLocal(KEYS.ORDERS, MOCK_ORDERS);
    setLocal(KEYS.ORDERS, orders.filter((o: Order) => o.id !== id));
  },

  /**
   * CUSTOMERS
   */
  async getCustomers(): Promise<Customer[]> {
    if (supabase) {
      const { data, error } = await supabase.from('customers').select('*');
      if (!error && data) {
        setLocal(KEYS.CUSTOMERS, data);
        return data as Customer[];
      }
    }
    return getLocal(KEYS.CUSTOMERS, MOCK_CUSTOMERS);
  },

  async authenticateCustomer(email: string, password?: string): Promise<Customer | null> {
    const normalizedEmail = email.toLowerCase().trim();
    const hashedPassword = password ? simpleHash(password) : undefined;
    
    if (supabase) {
      const query = supabase.from('customers').select('*').eq('email', normalizedEmail);
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const user = data[0] as Customer;
        if (!hashedPassword || user.password === hashedPassword) return user;
      }
    }

    const customers = getLocal(KEYS.CUSTOMERS, MOCK_CUSTOMERS);
    return customers.find((c: any) => c.email.toLowerCase() === normalizedEmail && (!hashedPassword || c.password === hashedPassword)) || null;
  },

  async registerCustomer(customer: Partial<Customer>): Promise<Customer> {
    const normalizedEmail = (customer.email || '').toLowerCase().trim();
    const hashedPassword = customer.password ? simpleHash(customer.password) : '';
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name: customer.name || 'Resident',
      email: normalizedEmail,
      password: hashedPassword,
      totalOrders: 0,
      totalSpent: 0,
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0],
      wishlist: [],
      addresses: []
    };

    if (supabase) {
      await supabase.from('customers').insert([newCustomer]);
    }

    const customers = getLocal(KEYS.CUSTOMERS, MOCK_CUSTOMERS);
    customers.push(newCustomer);
    setLocal(KEYS.CUSTOMERS, customers);
    return newCustomer;
  },

  async updateCustomerProfile(id: string, updates: Partial<Customer>): Promise<Customer> {
    if (supabase) {
      const { data, error } = await supabase.from('customers').update(updates).eq('id', id).select().single();
      if (!error && data) return data as Customer;
    }
    const customers = getLocal(KEYS.CUSTOMERS, MOCK_CUSTOMERS);
    const idx = customers.findIndex((c: Customer) => c.id === id);
    if (idx > -1) {
      customers[idx] = { ...customers[idx], ...updates };
      setLocal(KEYS.CUSTOMERS, customers);
      return customers[idx];
    }
    throw new Error("Customer not found");
  },

  async updateCustomerStatus(id: string, status: 'Active' | 'Blocked'): Promise<void> {
    if (supabase) {
      await supabase.from('customers').update({ status }).eq('id', id);
    }
    const customers = getLocal(KEYS.CUSTOMERS, MOCK_CUSTOMERS);
    const idx = customers.findIndex((c: Customer) => c.id === id);
    if (idx > -1) {
      customers[idx].status = status;
      setLocal(KEYS.CUSTOMERS, customers);
    }
  },

  async toggleWishlist(customerId: string, productId: string): Promise<string[]> {
    const customers = await this.getCustomers();
    const idx = customers.findIndex((c: Customer) => c.id === customerId);
    if (idx > -1) {
      const wishlist = customers[idx].wishlist || [];
      const pIdx = wishlist.indexOf(productId);
      if (pIdx > -1) wishlist.splice(pIdx, 1);
      else wishlist.push(productId);
      
      await this.updateCustomerProfile(customerId, { wishlist });
      return wishlist;
    }
    return [];
  },

  /**
   * COUPONS
   */
  async getCoupons(): Promise<Coupon[]> {
    if (supabase) {
      const { data, error } = await supabase.from('coupons').select('*');
      if (!error && data) {
        setLocal(KEYS.COUPONS, data);
        return data as Coupon[];
      }
    }
    return getLocal(KEYS.COUPONS, MOCK_COUPONS);
  },

  async saveCoupon(coupon: Coupon): Promise<Coupon> {
    const updatedCoupon = { ...coupon, id: coupon.id || `cpn-${Date.now()}` };
    if (supabase) {
      await supabase.from('coupons').upsert(updatedCoupon);
    }
    const coupons = getLocal(KEYS.COUPONS, MOCK_COUPONS);
    const idx = coupons.findIndex((c: Coupon) => c.id === coupon.id);
    if (idx > -1) coupons[idx] = updatedCoupon;
    else coupons.push(updatedCoupon);
    setLocal(KEYS.COUPONS, coupons);
    return updatedCoupon;
  },

  async deleteCoupon(id: string): Promise<void> {
    if (supabase) {
      await supabase.from('coupons').delete().eq('id', id);
    }
    const coupons = getLocal(KEYS.COUPONS, MOCK_COUPONS);
    setLocal(KEYS.COUPONS, coupons.filter((c: Coupon) => c.id !== id));
  },

  /**
   * CONFIG & SUPPORT
   */
  async getHomeConfig(): Promise<HomeConfig> {
    if (supabase) {
      const { data, error } = await supabase.from('site_config').select('value').eq('key', 'home_config').single();
      if (!error && data) return data.value as HomeConfig;
    }
    return getLocal(KEYS.HOME_CONFIG, DEFAULT_HOME_CONFIG);
  },

  async saveHomeConfig(config: HomeConfig): Promise<void> {
    if (supabase) {
      await supabase.from('site_config').upsert({ key: 'home_config', value: config });
    }
    setLocal(KEYS.HOME_CONFIG, config);
  },

  async getTickets(): Promise<SupportTicket[]> {
    if (supabase) {
      const { data, error } = await supabase.from('support_tickets').select('*').order('updatedAt', { ascending: false });
      if (!error && data) return data as SupportTicket[];
    }
    return getLocal(KEYS.TICKETS, []);
  },

  async createTicket(ticketData: Partial<SupportTicket>): Promise<SupportTicket> {
    const newTicket: SupportTicket = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: ticketData.customerId || 'anon',
      customerName: ticketData.customerName || 'Anonymous',
      subject: ticketData.subject || 'General Inquiry',
      message: ticketData.message || '',
      orderId: ticketData.orderId,
      status: TicketStatus.OPEN,
      priority: ticketData.priority || TicketPriority.MEDIUM,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      internalNotes: [],
      replies: []
    };
    
    if (supabase) {
      await supabase.from('support_tickets').insert([newTicket]);
    }
    
    const tickets = getLocal(KEYS.TICKETS, []);
    tickets.unshift(newTicket);
    setLocal(KEYS.TICKETS, tickets);
    return newTicket;
  },

  async updateTicket(ticketId: string, updates: Partial<SupportTicket>): Promise<void> {
    const timestamp = new Date().toISOString();
    if (supabase) {
      await supabase.from('support_tickets').update({ ...updates, updatedAt: timestamp }).eq('id', ticketId);
    }
    const tickets = getLocal(KEYS.TICKETS, []);
    const idx = tickets.findIndex((t: SupportTicket) => t.id === ticketId);
    if (idx > -1) {
      tickets[idx] = { ...tickets[idx], ...updates, updatedAt: timestamp };
      setLocal(KEYS.TICKETS, tickets);
    }
  },

  async addTicketNote(ticketId: string, note: string): Promise<void> {
    const tickets = await this.getTickets();
    const idx = tickets.findIndex((t: SupportTicket) => t.id === ticketId);
    if (idx > -1) {
      const notes = [...tickets[idx].internalNotes, `${new Date().toLocaleString()}: ${note}`];
      await this.updateTicket(ticketId, { internalNotes: notes });
    }
  },

  async addTicketReply(ticketId: string, message: string, sender: string, isAdmin: boolean): Promise<void> {
    const tickets = await this.getTickets();
    const idx = tickets.findIndex((t: SupportTicket) => t.id === ticketId);
    if (idx > -1) {
      const replies = [...tickets[idx].replies, {
        id: `reply-${Date.now()}`,
        sender,
        message,
        timestamp: new Date().toISOString(),
        isAdmin
      }];
      await this.updateTicket(ticketId, { replies });
    }
  },

  /**
   * ABANDONED CARTS
   */
  async getAbandonedCarts(): Promise<AbandonedCart[]> {
    if (supabase) {
      const { data, error } = await supabase.from('abandoned_carts').select('*');
      if (!error && data) return data as AbandonedCart[];
    }
    return getLocal(KEYS.ABANDONED, []);
  },

  async sendRecoveryEmail(id: string): Promise<void> {
    if (supabase) {
      await supabase.from('abandoned_carts').update({ recoverySent: true }).eq('id', id);
    }
    const abandoned = getLocal(KEYS.ABANDONED, []);
    const idx = abandoned.findIndex((a: any) => a.id === id);
    if (idx > -1) {
      abandoned[idx].recoverySent = true;
      setLocal(KEYS.ABANDONED, abandoned);
    }
  },

  /**
   * UTILITIES
   */
  async generateInvoice(order: Order): Promise<string> {
    const header = `SEOUL MUSE ATELIER - INVOICE ${order.id}\n`;
    const details = `Date: ${new Date(order.date).toLocaleDateString()}\nCustomer: ${order.customerName}\nStatus: ${order.status}\n\n`;
    const items = order.items.map(i => `${i.name} x ${i.quantity} @ $${i.price.toFixed(2)}`).join('\n');
    const footer = `\n\nSubtotal: $${order.subtotal.toFixed(2)}\nTax: $${order.tax.toFixed(2)}\nShipping: $${order.shippingFee.toFixed(2)}\nTotal: $${order.total.toFixed(2)}`;
    return header + details + items + footer;
  },

  async exportCSV(filters: InventoryFilters): Promise<string> {
    const products = await this.getProducts(filters);
    const headers = ['SKU', 'Name', 'Stock', 'Price'];
    const rows = products.map(p => [p.sku, p.name, p.stock, p.price].join(','));
    return [headers.join(','), ...rows].join('\n');
  }
};
