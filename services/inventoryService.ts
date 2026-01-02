
import { Product, InventoryFilters, ProductStatus, Order, OrderStatus, Coupon, Customer } from '../types';
import { supabase } from './supabaseClient';
import { MOCK_PRODUCTS, MOCK_ORDERS, MOCK_COUPONS, MOCK_CUSTOMERS } from '../constants';

const KEYS = {
  PRODUCTS: 'seoul_muse_inventory_v2',
  ORDERS: 'seoul_muse_orders_v2',
  COUPONS: 'seoul_muse_coupons_v2',
  CUSTOMERS: 'seoul_muse_customers_v2',
};

// Local storage helpers for fallback mode
const getLocal = (key: string, fallback: any) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
};

const setLocal = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Initialize local storage if empty (for resilient fallback)
const initLocal = () => {
  if (!localStorage.getItem(KEYS.PRODUCTS)) setLocal(KEYS.PRODUCTS, MOCK_PRODUCTS);
  if (!localStorage.getItem(KEYS.ORDERS)) setLocal(KEYS.ORDERS, MOCK_ORDERS);
  if (!localStorage.getItem(KEYS.COUPONS)) setLocal(KEYS.COUPONS, MOCK_COUPONS);
  if (!localStorage.getItem(KEYS.CUSTOMERS)) setLocal(KEYS.CUSTOMERS, MOCK_CUSTOMERS);
};

initLocal();

export const inventoryService = {
  /**
   * PRODUCTS
   */
  async getProducts(filters?: InventoryFilters): Promise<Product[]> {
    if (supabase) {
      try {
        let query = supabase.from('products').select('*');
        if (filters) {
          if (filters.search) {
            query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,collection.ilike.%${filters.search}%`);
          }
          if (filters.status && filters.status !== 'All') {
            query = query.eq('status', filters.status);
          }
          if (filters.category && filters.category !== 'All') {
            query = query.eq('category', filters.category);
          }
          if (filters.stockLevel === 'Low') {
            query = query.lt('stock', 20).gt('stock', 0);
          } else if (filters.stockLevel === 'Out') {
            query = query.eq('stock', 0);
          }
          const sortOrder = filters.sortOrder === 'asc' ? true : false;
          query = query.order(filters.sortBy || 'name', { ascending: sortOrder });
        } else {
          query = query.order('name', { ascending: true });
        }
        const { data, error } = await query;
        if (!error) return data || [];
        console.error("Supabase query error:", error);
      } catch (e) {
        console.error("Supabase connection failed:", e);
      }
    }

    // Fallback Logic: Local Storage
    let products = getLocal(KEYS.PRODUCTS, MOCK_PRODUCTS);
    if (filters) {
      if (filters.search) {
        const s = filters.search.toLowerCase();
        products = products.filter((p: Product) => 
          p.name.toLowerCase().includes(s) || 
          p.sku.toLowerCase().includes(s) ||
          (p.collection && p.collection.toLowerCase().includes(s))
        );
      }
      if (filters.status !== 'All') products = products.filter((p: Product) => p.status === filters.status);
      if (filters.category !== 'All') products = products.filter((p: Product) => p.category === filters.category);
      
      products.sort((a: any, b: any) => {
        const factor = filters.sortOrder === 'asc' ? 1 : -1;
        const valA = a[filters.sortBy] ?? '';
        const valB = b[filters.sortBy] ?? '';
        return valA < valB ? -1 * factor : 1 * factor;
      });
    }
    return products;
  },

  async saveProduct(product: Product): Promise<Product> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .upsert({ ...product, updatedAt: new Date().toISOString() })
          .select()
          .single();
        if (!error) return data;
        if (error.code === '23505') throw new Error(`SKU Conflict: Identifier "${product.sku}" is already registered.`);
      } catch (e: any) {
        if (e.message?.includes('SKU')) throw e;
      }
    }

    const products = getLocal(KEYS.PRODUCTS, MOCK_PRODUCTS);
    const idx = products.findIndex((p: Product) => p.id === product.id);
    const updated = { ...product, updatedAt: new Date().toISOString() };
    if (idx > -1) products[idx] = updated;
    else products.push({ ...updated, id: product.id || `art-${Date.now()}` });
    setLocal(KEYS.PRODUCTS, products);
    return updated;
  },

  async adjustStock(id: string, delta: number): Promise<void> {
    if (supabase) {
      try {
        const { data: p } = await supabase.from('products').select('stock').eq('id', id).single();
        if (p) {
          const newStock = Math.max(0, p.stock + delta);
          await supabase.from('products').update({ stock: newStock }).eq('id', id);
          return;
        }
      } catch (e) {}
    }

    const products = getLocal(KEYS.PRODUCTS, MOCK_PRODUCTS);
    const idx = products.findIndex((p: Product) => p.id === id);
    if (idx > -1) {
      products[idx].stock = Math.max(0, products[idx].stock + delta);
      setLocal(KEYS.PRODUCTS, products);
    }
  },

  async deleteProduct(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) return;
    }
    const products = getLocal(KEYS.PRODUCTS, MOCK_PRODUCTS);
    setLocal(KEYS.PRODUCTS, products.filter((p: Product) => p.id !== id));
  },

  /**
   * ORDERS
   */
  async getOrders(): Promise<Order[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('orders').select('*').order('date', { ascending: false });
        if (!error) return data || [];
      } catch (e) {}
    }
    return getLocal(KEYS.ORDERS, MOCK_ORDERS);
  },

  async placeOrder(orderData: Partial<Order>): Promise<Order> {
    const newOrder: Order = {
      id: `#ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: orderData.customerName || 'Anonymous Muse',
      customerEmail: orderData.customerEmail || 'resident@seoulmuse.com',
      date: new Date().toISOString().split('T')[0],
      total: orderData.total || 0,
      status: OrderStatus.PAID,
      paymentMethod: orderData.paymentMethod || 'Neural Pay',
      items: orderData.items || [],
      shippingAddress: orderData.shippingAddress || 'Seongsu Atelier'
    };

    if (supabase) {
      try {
        const { data, error } = await supabase.from('orders').insert(newOrder).select().single();
        if (!error) return data;
      } catch (e) {}
    }

    const orders = getLocal(KEYS.ORDERS, MOCK_ORDERS);
    orders.unshift(newOrder);
    setLocal(KEYS.ORDERS, orders);
    return newOrder;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
      if (!error) return;
    }
    const orders = getLocal(KEYS.ORDERS, MOCK_ORDERS);
    const idx = orders.findIndex((o: Order) => o.id === orderId);
    if (idx > -1) {
      orders[idx].status = status;
      setLocal(KEYS.ORDERS, orders);
    }
  },

  /**
   * COUPONS
   */
  async getCoupons(): Promise<Coupon[]> {
    if (supabase) {
      const { data, error } = await supabase.from('coupons').select('*').order('code', { ascending: true });
      if (!error) return data || [];
    }
    return getLocal(KEYS.COUPONS, MOCK_COUPONS);
  },

  async saveCoupon(coupon: Coupon): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('coupons').upsert({ ...coupon, id: coupon.id || `cp-${Date.now()}` });
      if (!error) return;
    }
    const coupons = getLocal(KEYS.COUPONS, MOCK_COUPONS);
    const idx = coupons.findIndex((c: Coupon) => c.id === coupon.id);
    if (idx > -1) coupons[idx] = coupon;
    else coupons.push({ ...coupon, id: coupon.id || `cp-${Date.now()}` });
    setLocal(KEYS.COUPONS, coupons);
  },

  async deleteCoupon(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (!error) return;
    }
    const coupons = getLocal(KEYS.COUPONS, MOCK_COUPONS);
    setLocal(KEYS.COUPONS, coupons.filter((c: Coupon) => c.id !== id));
  },

  /**
   * CUSTOMERS
   */
  async getCustomers(): Promise<Customer[]> {
    if (supabase) {
      const { data, error } = await supabase.from('customers').select('*').order('joinedDate', { ascending: false });
      if (!error) return data || [];
    }
    return getLocal(KEYS.CUSTOMERS, MOCK_CUSTOMERS);
  },

  /**
   * UTILITIES
   */
  async exportCSV(filters: InventoryFilters): Promise<string> {
    const products = await this.getProducts(filters);
    const headers = ['SKU', 'Name', 'Category', 'Collection', 'Stock', 'Price', 'Status'];
    const rows = products.map(p => [
      p.sku, `"${p.name.replace(/"/g, '""')}"`, p.category, `"${(p.collection || '').replace(/"/g, '""')}"`, p.stock, p.price, p.status
    ].join(','));
    return [headers.join(','), ...rows].join('\n');
  }
};
