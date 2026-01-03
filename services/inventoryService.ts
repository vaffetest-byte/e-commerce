
import { Product, InventoryFilters, ProductStatus, Order, OrderStatus, Coupon, Customer, HomeConfig } from '../types';
import { supabase } from './supabaseClient';
import { MOCK_PRODUCTS, MOCK_ORDERS, MOCK_COUPONS, MOCK_CUSTOMERS, DEFAULT_HOME_CONFIG } from '../constants';

const KEYS = {
  PRODUCTS: 'seoul_muse_inventory_v2',
  ORDERS: 'seoul_muse_orders_v2',
  COUPONS: 'seoul_muse_coupons_v2',
  CUSTOMERS: 'seoul_muse_customers_v2',
  HOME_CONFIG: 'seoul_muse_home_config_v3' // Incremented version to force sync new girl image
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
};

initLocal();

export const inventoryService = {
  async getProducts(filters?: InventoryFilters): Promise<Product[]> {
    if (supabase) {
      try {
        let query = supabase.from('products').select('*');
        if (filters) {
          if (filters.search) query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
          if (filters.status && filters.status !== 'All') query = query.eq('status', filters.status);
          if (filters.category && filters.category !== 'All') query = query.eq('category', filters.category);
          const sortOrder = filters.sortOrder === 'asc' ? true : false;
          query = query.order(filters.sortBy || 'name', { ascending: sortOrder });
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.error("Supabase connection error:", e);
      }
    }
    return getLocal(KEYS.PRODUCTS, MOCK_PRODUCTS);
  },

  async saveProduct(product: Product): Promise<Product> {
    if (supabase) {
      const { data, error } = await supabase.from('products').upsert(product).select().single();
      if (!error) return data;
    }
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
    if (supabase) {
      await supabase.from('products').delete().eq('id', id);
    }
  },

  async getOrders(): Promise<Order[]> {
    if (supabase) {
      const { data, error } = await supabase.from('orders').select('*').order('date', { ascending: false });
      if (!error && data && data.length > 0) return data;
    }
    return getLocal(KEYS.ORDERS, MOCK_ORDERS);
  },

  async placeOrder(orderData: Partial<Order>): Promise<Order> {
    const newOrder: Order = {
      id: `#ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: orderData.customerName || 'Anonymous',
      customerEmail: orderData.customerEmail || '',
      date: new Date().toISOString(),
      total: orderData.total || 0,
      status: OrderStatus.PENDING,
      paymentMethod: orderData.paymentMethod || 'Credit Card',
      items: orderData.items || [],
      shippingAddress: orderData.shippingAddress || 'N/A'
    };

    for (const item of newOrder.items) {
      await this.adjustStock(item.productId, -item.quantity);
    }

    if (supabase) {
      const { error } = await supabase.from('orders').insert(newOrder);
      if (error) console.error("Supabase Order Error:", error);
    }

    const orders = getLocal(KEYS.ORDERS, MOCK_ORDERS);
    orders.unshift(newOrder);
    setLocal(KEYS.ORDERS, orders);
    return newOrder;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    const orders = getLocal(KEYS.ORDERS, MOCK_ORDERS);
    const idx = orders.findIndex((o: Order) => o.id === orderId);
    
    if (idx > -1) {
      const prevStatus = orders[idx].status;
      orders[idx].status = status;
      if (status === OrderStatus.CANCELLED && prevStatus !== OrderStatus.CANCELLED) {
        for (const item of orders[idx].items) {
          await this.adjustStock(item.productId, item.quantity);
        }
      }
      setLocal(KEYS.ORDERS, orders);
    }
    if (supabase) {
      await supabase.from('orders').update({ status }).eq('id', orderId);
    }
  },

  async adjustStock(id: string, delta: number): Promise<void> {
    const products = getLocal(KEYS.PRODUCTS, MOCK_PRODUCTS);
    const idx = products.findIndex((p: Product) => p.id === id);
    if (idx > -1) {
      products[idx].stock = Math.max(0, products[idx].stock + delta);
      setLocal(KEYS.PRODUCTS, products);
      if (supabase) {
        await supabase.from('products').update({ stock: products[idx].stock }).eq('id', id);
      }
    }
  },

  async deleteOrder(id: string): Promise<void> {
    const orders = getLocal(KEYS.ORDERS, MOCK_ORDERS);
    setLocal(KEYS.ORDERS, orders.filter((o: Order) => o.id !== id));
    if (supabase) await supabase.from('orders').delete().eq('id', id);
  },

  async authenticateCustomer(email: string, password?: string): Promise<Customer | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('password', password)
        .single();
      if (!error && data) return data;
    }
    const customers = getLocal(KEYS.CUSTOMERS, MOCK_CUSTOMERS);
    return customers.find((c: any) => c.email.toLowerCase() === email.toLowerCase() && (!password || c.password === password)) || null;
  },

  async registerCustomer(customer: Partial<Customer>): Promise<Customer> {
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name: customer.name || 'Resident',
      email: customer.email || '',
      password: customer.password || '',
      totalOrders: 0,
      totalSpent: 0,
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    if (supabase) {
      const { error } = await supabase.from('customers').insert(newCustomer);
      if (error) console.error("Supabase Customer Registry Error:", error);
    }

    const customers = getLocal(KEYS.CUSTOMERS, MOCK_CUSTOMERS);
    customers.push(newCustomer);
    setLocal(KEYS.CUSTOMERS, customers);
    return newCustomer;
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

  async getCustomers(): Promise<Customer[]> { 
    if (supabase) {
        const { data } = await supabase.from('customers').select('*');
        if (data && data.length > 0) return data;
    }
    return getLocal(KEYS.CUSTOMERS, MOCK_CUSTOMERS); 
  },
  async exportCSV(filters: InventoryFilters): Promise<string> {
    const products = await this.getProducts(filters);
    const headers = ['SKU', 'Name', 'Stock', 'Price'];
    const rows = products.map(p => [p.sku, p.name, p.stock, p.price].join(','));
    return [headers.join(','), ...rows].join('\n');
  }
};
