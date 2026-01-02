import { Product, InventoryFilters, ProductStatus } from '../types';
import { MOCK_PRODUCTS } from '../constants';

const STORAGE_KEY = 'seoul_muse_inventory_v2';
const LOG_KEY = 'seoul_muse_audit_logs';

export const inventoryService = {
  // GET with full server-side simulation (Filter/Sort/Search)
  async getProducts(filters: InventoryFilters): Promise<Product[]> {
    let products = JSON.parse(localStorage.getItem(STORAGE_KEY) || JSON.stringify(MOCK_PRODUCTS));
    
    // Filter out Archived (Soft Delete)
    products = products.filter((p: Product) => p.status !== ProductStatus.ARCHIVED);

    // Search Logic
    if (filters.search) {
      const s = filters.search.toLowerCase();
      products = products.filter((p: Product) => 
        p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s)
      );
    }
    
    if (filters.status !== 'All') {
      products = products.filter((p: Product) => p.status === filters.status);
    }
    
    if (filters.category !== 'All') {
      products = products.filter((p: Product) => p.category === filters.category);
    }
    
    if (filters.stockLevel === 'Low') {
      products = products.filter((p: Product) => p.stock > 0 && p.stock < 10);
    } else if (filters.stockLevel === 'Out') {
      products = products.filter((p: Product) => p.stock === 0);
    }
    
    products.sort((a: any, b: any) => {
      const factor = filters.sortOrder === 'asc' ? 1 : -1;
      return a[filters.sortBy] < b[filters.sortBy] ? -1 * factor : 1 * factor;
    });

    return products;
  },

  async saveProduct(product: Product): Promise<Product> {
    const products = JSON.parse(localStorage.getItem(STORAGE_KEY) || JSON.stringify(MOCK_PRODUCTS));
    
    // SKU Uniqueness Check
    const existingSku = products.find((p: Product) => p.sku === product.sku && p.id !== product.id);
    if (existingSku) throw new Error("SKU already exists in registry.");

    const index = products.findIndex((p: Product) => p.id === product.id);
    const updatedProduct = { ...product, updatedAt: new Date().toISOString() };
    
    if (index > -1) {
      products[index] = updatedProduct;
      this.logAction(product.id, 'UPDATE', `Product details modified.`);
    } else {
      updatedProduct.id = `p-${Math.random().toString(36).substr(2, 9)}`;
      updatedProduct.createdAt = new Date().toISOString();
      products.push(updatedProduct);
      this.logAction(updatedProduct.id, 'CREATE', `Product registered in system.`);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return updatedProduct;
  },

  async adjustStock(id: string, delta: number): Promise<void> {
    const products = JSON.parse(localStorage.getItem(STORAGE_KEY) || JSON.stringify(MOCK_PRODUCTS));
    const index = products.findIndex((p: Product) => p.id === id);
    if (index === -1) return;

    const newStock = Math.max(0, products[index].stock + delta);
    products[index].stock = newStock;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    
    this.logAction(id, 'STOCK_ADJUST', `Stock changed by ${delta}. New total: ${newStock}`);
  },

  async deleteProduct(id: string): Promise<void> {
    const products = JSON.parse(localStorage.getItem(STORAGE_KEY) || JSON.stringify(MOCK_PRODUCTS));
    const index = products.findIndex((p: Product) => p.id === id);
    if (index > -1) {
      products[index].status = ProductStatus.ARCHIVED; // Soft Delete
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
      this.logAction(id, 'ARCHIVE', `Product moved to archive.`);
    }
  },

  logAction(productId: string, action: string, message: string) {
    const logs = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
    logs.push({
      timestamp: new Date().toISOString(),
      productId,
      action,
      message,
      user: 'admin@seoulmuse.com'
    });
    localStorage.setItem(LOG_KEY, JSON.stringify(logs.slice(-100))); // Keep last 100
  },

  async exportCSV(filters: InventoryFilters): Promise<string> {
    const products = await this.getProducts(filters);
    const headers = ['SKU', 'Name', 'Category', 'Stock', 'Price', 'Status'];
    const rows = products.map(p => [p.sku, p.name, p.category, p.stock, p.price, p.status].join(','));
    return [headers.join(','), ...rows].join('\n');
  }
};