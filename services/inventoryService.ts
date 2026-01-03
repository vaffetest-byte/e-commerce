
import { Product, InventoryFilters, ProductStatus, Order, OrderStatus, Coupon, Customer, HomeConfig, ShippingAddress, SupportTicket, TicketStatus, TicketPriority, AbandonedCart } from '../types';
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

const initLocal = () => {
  if (!localStorage.getItem(KEYS.PRODUCTS)) setLocal(KEYS.PRODUCTS, MOCK_PRODUCTS);
  if (!localStorage.getItem(KEYS.ORDERS)) setLocal(KEYS.ORDERS, MOCK_ORDERS);
  if (!localStorage.getItem(KEYS.COUPONS)) setLocal(KEYS.COUPONS, MOCK_COUPONS);
  if (!localStorage.getItem(KEYS.CUSTOMERS)) setLocal(KEYS.CUSTOMERS, MOCK_CUSTOMERS);
  if (!localStorage.getItem(KEYS.HOME_CONFIG)) setLocal(KEYS.HOME_CONFIG, DEFAULT_HOME_CONFIG);
  if (!localStorage.getItem(KEYS.TICKETS)) setLocal(KEYS.TICKETS, []);
  if (!localStorage.getItem(KEYS.ABANDONED)) {
    const abandoned: AbandonedCart[] = [
      { id: 'abc-1', customerName: 'Min-ji Kim', customerEmail: 'minji@kpop.kr', lastActive: '2h ago', totalValue: 245.00, recoverySent: false, items: [{name: 'Silk Gown'}] }
    ];
    setLocal(KEYS.ABANDONED, abandoned);
  }
};

initLocal();

export const inventoryService = {
  async getProducts(filters?: InventoryFilters): Promise<Product[]> {
    let data = getLocal(KEYS.PRODUCTS, MOCK_PRODUCTS);
    
    if (filters) {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        data = data.filter((p: Product) => 
          p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
        );
      }
      if (filters.status && filters.status !== 'All') {
        data = data.filter((p: Product) => p.status === filters.status);
      }
      if (filters.category && filters.category !== 'All') {
        data = data.filter((p: Product) => p.category === filters.category);
      }
      if (filters.minPrice !== undefined) data = data.filter((p: Product) => p.price >= filters.minPrice!);
      if (filters.maxPrice !== undefined) data = data.filter((p: Product) => p.price <= filters.maxPrice!);

      const order = filters.sortOrder === 'asc' ? 1 : -1;
      data.sort((a: any, b: any) => {
        const valA = a[filters.sortBy || 'name'];
        const valB = b[filters.sortBy || 'name'];
        if (typeof valA === 'string') return valA.localeCompare(valB) * order;
        return (valA - valB) * order;
      });
    }
    return data;
  },

  async saveProduct(product: Product): Promise<Product> {
    const products = getLocal(KEYS.PRODUCTS, MOCK_PRODUCTS);
    const idx = products.findIndex((p: Product) => p.id === product.id);
    if (idx > -1) products[idx] = product;
    else products.push({ ...product, id: `art-${Date.now()}` });
    setLocal(KEYS.PRODUCTS, products);
    return product;
  },

  async getHomeConfig(): Promise<HomeConfig> {
    return getLocal(KEYS.HOME_CONFIG, DEFAULT_HOME_CONFIG);
  },

  async saveHomeConfig(config: HomeConfig): Promise<void> {
    setLocal(KEYS.HOME_CONFIG, config);
  },

  async deleteProduct(id: string): Promise<void> {
    const products = getLocal(KEYS.PRODUCTS, MOCK_PRODUCTS);
    setLocal(KEYS.PRODUCTS, products.filter((p: Product) => p.id !== id));
  },

  async toggleWishlist(customerId: string, productId: string): Promise<string[]> {
    const customers = getLocal(KEYS.CUSTOMERS, MOCK_CUSTOMERS);
    const idx = customers.findIndex((c: Customer) => c.id === customerId);
    if (idx > -1) {
      const wishlist = customers[idx].wishlist || [];
      const pIdx = wishlist.indexOf(productId);
      if (pIdx > -1) wishlist.splice(pIdx, 1);
      else wishlist.push(productId);
      customers[idx].wishlist = wishlist;
      setLocal(KEYS.CUSTOMERS, customers);
      return wishlist;
    }
    return [];
  },

  async getOrders(): Promise<Order[]> {
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

    for (const item of newOrder.items) {
      await this.adjustStock(item.productId, -item.quantity);
    }

    const orders = getLocal(KEYS.ORDERS, MOCK_ORDERS);
    orders.unshift(newOrder);
    setLocal(KEYS.ORDERS, orders);

    const customers = getLocal(KEYS.CUSTOMERS, MOCK_CUSTOMERS);
    const cIdx = customers.findIndex((c: Customer) => c.email === newOrder.customerEmail);
    if (cIdx > -1) {
      customers[cIdx].totalOrders += 1;
      customers[cIdx].totalSpent += newOrder.total;
      setLocal(KEYS.CUSTOMERS, customers);
    }

    return newOrder;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    const orders = getLocal(KEYS.ORDERS, MOCK_ORDERS);
    const idx = orders.findIndex((o: Order) => o.id === orderId);
    if (idx > -1) {
      orders[idx].status = status;
      setLocal(KEYS.ORDERS, orders);
    }
  },

  async updateOrderTracking(orderId: string, trackingNumber: string): Promise<void> {
    const orders = getLocal(KEYS.ORDERS, MOCK_ORDERS);
    const idx = orders.findIndex((o: Order) => o.id === orderId);
    if (idx > -1) {
      orders[idx].trackingNumber = trackingNumber;
      setLocal(KEYS.ORDERS, orders);
    }
  },

  async adjustStock(id: string, delta: number): Promise<void> {
    const products = getLocal(KEYS.PRODUCTS, MOCK_PRODUCTS);
    const idx = products.findIndex((p: Product) => p.id === id);
    if (idx > -1) {
      products[idx].stock = Math.max(0, products[idx].stock + delta);
      setLocal(KEYS.PRODUCTS, products);
    }
  },

  async deleteOrder(id: string): Promise<void> {
    const orders = getLocal(KEYS.ORDERS, MOCK_ORDERS);
    setLocal(KEYS.ORDERS, orders.filter((o: Order) => o.id !== id));
  },

  async authenticateCustomer(email: string, password?: string): Promise<Customer | null> {
    const normalizedEmail = email.toLowerCase().trim();
    const hashedPassword = password ? simpleHash(password) : undefined;
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
    const customers = getLocal(KEYS.CUSTOMERS, MOCK_CUSTOMERS);
    customers.push(newCustomer);
    setLocal(KEYS.CUSTOMERS, customers);
    return newCustomer;
  },

  async updateCustomerProfile(id: string, updates: Partial<Customer>): Promise<Customer> {
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
    const customers = getLocal(KEYS.CUSTOMERS, MOCK_CUSTOMERS);
    const idx = customers.findIndex((c: Customer) => c.id === id);
    if (idx > -1) {
      customers[idx].status = status;
      setLocal(KEYS.CUSTOMERS, customers);
    }
  },

  async getCoupons(): Promise<Coupon[]> { return getLocal(KEYS.COUPONS, MOCK_COUPONS); },
  async saveCoupon(coupon: Coupon): Promise<Coupon> {
    const coupons = getLocal(KEYS.COUPONS, MOCK_COUPONS);
    const idx = coupons.findIndex((c: Coupon) => c.id === coupon.id);
    const updatedCoupon = { ...coupon, id: coupon.id || `cpn-${Date.now()}` };
    if (idx > -1) coupons[idx] = updatedCoupon;
    else coupons.push(updatedCoupon);
    setLocal(KEYS.COUPONS, coupons);
    return updatedCoupon;
  },
  async deleteCoupon(id: string): Promise<void> {
    const coupons = getLocal(KEYS.COUPONS, MOCK_COUPONS);
    setLocal(KEYS.COUPONS, coupons.filter((c: Coupon) => c.id !== id));
  },
  async getCustomers(): Promise<Customer[]> { return getLocal(KEYS.CUSTOMERS, MOCK_CUSTOMERS); },
  
  // Support Ticket Methods
  async getTickets(): Promise<SupportTicket[]> {
    return getLocal(KEYS.TICKETS, []);
  },

  async createTicket(ticketData: Partial<SupportTicket>): Promise<SupportTicket> {
    const tickets = getLocal(KEYS.TICKETS, []);
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
    tickets.unshift(newTicket);
    setLocal(KEYS.TICKETS, tickets);
    return newTicket;
  },

  async updateTicket(ticketId: string, updates: Partial<SupportTicket>): Promise<void> {
    const tickets = getLocal(KEYS.TICKETS, []);
    const idx = tickets.findIndex((t: SupportTicket) => t.id === ticketId);
    if (idx > -1) {
      tickets[idx] = { ...tickets[idx], ...updates, updatedAt: new Date().toISOString() };
      setLocal(KEYS.TICKETS, tickets);
    }
  },

  async addTicketNote(ticketId: string, note: string): Promise<void> {
    const tickets = getLocal(KEYS.TICKETS, []);
    const idx = tickets.findIndex((t: SupportTicket) => t.id === ticketId);
    if (idx > -1) {
      tickets[idx].internalNotes.push(`${new Date().toLocaleString()}: ${note}`);
      setLocal(KEYS.TICKETS, tickets);
    }
  },

  async addTicketReply(ticketId: string, message: string, sender: string, isAdmin: boolean): Promise<void> {
    const tickets = getLocal(KEYS.TICKETS, []);
    const idx = tickets.findIndex((t: SupportTicket) => t.id === ticketId);
    if (idx > -1) {
      tickets[idx].replies.push({
        id: `reply-${Date.now()}`,
        sender,
        message,
        timestamp: new Date().toISOString(),
        isAdmin
      });
      tickets[idx].updatedAt = new Date().toISOString();
      setLocal(KEYS.TICKETS, tickets);
    }
  },

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
  },

  // Abandoned Cart methods
  async getAbandonedCarts(): Promise<AbandonedCart[]> {
    return getLocal(KEYS.ABANDONED, []);
  },

  async sendRecoveryEmail(id: string): Promise<void> {
    const abandoned = getLocal(KEYS.ABANDONED, []);
    const idx = abandoned.findIndex((a: any) => a.id === id);
    if (idx > -1) {
      abandoned[idx].recoverySent = true;
      setLocal(KEYS.ABANDONED, abandoned);
    }
  }
};
