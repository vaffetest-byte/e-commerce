import { Product, InventoryFilters, ProductStatus, Order, OrderStatus, Coupon, Customer } from '../types';
import { MOCK_PRODUCTS, MOCK_ORDERS, MOCK_COUPONS, MOCK_CUSTOMERS } from '../constants';

const KEYS = {
  PRODUCTS: 'seoul_muse_inventory_v2',
  ORDERS: 'seoul_muse_orders_v2',
  COUPONS: 'seoul_muse_coupons_v2',
  CUSTOMERS: 'seoul_muse_customers_v2',
  LOGS: 'seoul_muse_audit_logs',
  CART: 'seoul_muse_cart',
  WISHLIST: 'seoul_muse_wishlist'
};

// Initialize localStorage if empty
const initStore = () => {
  if (!localStorage.getItem(KEYS.PRODUCTS)) localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(MOCK_PRODUCTS));
  if (!localStorage.getItem(KEYS.ORDERS)) localStorage.setItem(KEYS.ORDERS, JSON.stringify(MOCK_ORDERS));
  if (!localStorage.getItem(KEYS.COUPONS)) localStorage.setItem(KEYS.COUPONS, JSON.stringify(MOCK_COUPONS));
  if (!localStorage.getItem(KEYS.CUSTOMERS)) localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(MOCK_CUSTOMERS));
};

initStore();

export const inventoryService = {
  // --- PRODUCT ENGINE ---
  async getProducts(filters: InventoryFilters): Promise<Product[]> {
    let products = JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]');
    products = products.filter((p: Product) => p.status !== ProductStatus.ARCHIVED);

    if (filters.search) {
      const s = filters.search.toLowerCase();
      products = products.filter((p: Product) => p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s));
    }
    if (filters.status !== 'All') products = products.filter((p: Product) => p.status === filters.status);
    if (filters.category !== 'All') products = products.filter((p: Product) => p.category === filters.category);
    
    products.sort((a: any, b: any) => {
      const factor = filters.sortOrder === 'asc' ? 1 : -1;
      return a[filters.sortBy] < b[filters.sortBy] ? -1 * factor : 1 * factor;
    });

    return products;
  },

  async saveProduct(product: Product): Promise<Product> {
    const products = JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]');
    const existingSku = products.find((p: Product) => p.sku === product.sku && p.id !== product.id);
    if (existingSku) throw new Error("SKU Collision: Identifier already exists in registry.");

    const index = products.findIndex((p: Product) => p.id === product.id);
    const updatedProduct = { ...product, updatedAt: new Date().toISOString() };
    
    if (index > -1) {
      products[index] = updatedProduct;
    } else {
      updatedProduct.id = `art-${Math.random().toString(36).substr(2, 9)}`;
      updatedProduct.createdAt = new Date().toISOString();
      products.push(updatedProduct);
    }
    
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
    return updatedProduct;
  },

  async adjustStock(id: string, delta: number): Promise<void> {
    const products = JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]');
    const index = products.findIndex((p: Product) => p.id === id);
    if (index === -1) return;

    const newStock = Math.max(0, products[index].stock + delta);
    products[index].stock = newStock;
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },

  async deleteProduct(id: string): Promise<void> {
    const products = JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]');
    const index = products.findIndex((p: Product) => p.id === id);
    if (index > -1) {
      products[index].status = ProductStatus.ARCHIVED;
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
    }
  },

  // --- ORDER FULFILLMENT ---
  async getOrders(): Promise<Order[]> {
    return JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]');
  },

  async placeOrder(orderData: Partial<Order>): Promise<Order> {
    const orders = await this.getOrders();
    const products = JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]');
    
    // Verify stock availability for all items before committing
    for (const item of orderData.items || []) {
      const p = products.find((prod: Product) => prod.id === item.productId);
      if (!p || p.stock < item.quantity) throw new Error(`Insufficient stock for artifact: ${item.name}`);
    }

    // Deduct stock
    for (const item of orderData.items || []) {
      const idx = products.findIndex((prod: Product) => prod.id === item.productId);
      products[idx].stock -= item.quantity;
    }
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));

    const newOrder: Order = {
      id: `#ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: orderData.customerName || 'Anonymous Muse',
      customerEmail: orderData.customerEmail || 'muse@seoulmuse.com',
      date: new Date().toISOString().split('T')[0],
      total: orderData.total || 0,
      status: OrderStatus.PAID,
      paymentMethod: orderData.paymentMethod || 'Checkout',
      items: orderData.items || [],
      shippingAddress: orderData.shippingAddress || 'Seongsu-dong Atelier'
    };

    orders.unshift(newOrder);
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    return newOrder;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    const orders = await this.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx > -1) {
      orders[idx].status = status;
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    }
  },

  // --- MARKETING & COUPONS ---
  async getCoupons(): Promise<Coupon[]> {
    return JSON.parse(localStorage.getItem(KEYS.COUPONS) || '[]');
  },

  async saveCoupon(coupon: Coupon): Promise<void> {
    const coupons = await this.getCoupons();
    const idx = coupons.findIndex(c => c.id === coupon.id);
    if (idx > -1) coupons[idx] = coupon;
    else coupons.push({ ...coupon, id: `cp-${Math.random().toString(36).substr(2, 5)}` });
    localStorage.setItem(KEYS.COUPONS, JSON.stringify(coupons));
  },

  async deleteCoupon(id: string): Promise<void> {
    const coupons = await this.getCoupons();
    const filtered = coupons.filter(c => c.id !== id);
    localStorage.setItem(KEYS.COUPONS, JSON.stringify(filtered));
  },

  // --- DATA EXPORT ---
  async exportCSV(filters: InventoryFilters): Promise<string> {
    const products = await this.getProducts(filters);
    const headers = ['SKU', 'Name', 'Category', 'Stock', 'Price', 'Status'];
    const rows = products.map(p => [p.sku, p.name, p.category, p.stock, p.price, p.status].join(','));
    return [headers.join(','), ...rows].join('\n');
  }
};