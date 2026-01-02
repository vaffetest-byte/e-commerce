
import { Product, InventoryFilters, ProductStatus } from '../types';
import { MOCK_PRODUCTS } from '../constants';

const STORAGE_KEY = 'seoul_muse_inventory';

// Simulating a production database/API service
export const inventoryService = {
  // GET all products with filtering and sorting (Simulates server-side logic)
  async getProducts(filters: InventoryFilters): Promise<Product[]> {
    await new Promise(r => setTimeout(r, 600)); // Network delay
    
    let products = JSON.parse(localStorage.getItem(STORAGE_KEY) || JSON.stringify(MOCK_PRODUCTS));
    
    // Search
    if (filters.search) {
      const s = filters.search.toLowerCase();
      products = products.filter((p: Product) => 
        p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s)
      );
    }
    
    // Status Filter
    if (filters.status !== 'All') {
      products = products.filter((p: Product) => p.status === filters.status);
    }
    
    // Category Filter
    if (filters.category !== 'All') {
      products = products.filter((p: Product) => p.category === filters.category);
    }
    
    // Stock Level Filter
    if (filters.stockLevel === 'Low') {
      products = products.filter((p: Product) => p.stock > 0 && p.stock < 10);
    } else if (filters.stockLevel === 'Out') {
      products = products.filter((p: Product) => p.stock === 0);
    }
    
    // Sorting
    products.sort((a: any, b: any) => {
      const factor = filters.sortOrder === 'asc' ? 1 : -1;
      if (a[filters.sortBy] < b[filters.sortBy]) return -1 * factor;
      if (a[filters.sortBy] > b[filters.sortBy]) return 1 * factor;
      return 0;
    });

    return products;
  },

  async saveProduct(product: Product): Promise<Product> {
    const products = JSON.parse(localStorage.getItem(STORAGE_KEY) || JSON.stringify(MOCK_PRODUCTS));
    const index = products.findIndex((p: Product) => p.id === product.id);
    
    if (index > -1) {
      products[index] = product;
    } else {
      products.push({ ...product, id: `p-${Math.random().toString(36).substr(2, 9)}`, createdAt: new Date().toISOString() });
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return product;
  },

  async deleteProduct(id: string): Promise<void> {
    const products = JSON.parse(localStorage.getItem(STORAGE_KEY) || JSON.stringify(MOCK_PRODUCTS));
    const filtered = products.filter((p: Product) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  async exportCSV(filters: InventoryFilters): Promise<string> {
    const products = await this.getProducts(filters);
    const headers = ['ID', 'Name', 'SKU', 'Price', 'Stock', 'Status', 'Category'];
    const rows = products.map(p => [p.id, p.name, p.sku, p.price, p.stock, p.status, p.category].join(','));
    return [headers.join(','), ...rows].join('\n');
  }
};
