import { Product, InventoryFilters, ProductStatus } from '../types';

const API_URL = 'http://localhost:3001/api/products';

const getHeaders = () => {
  const session = localStorage.getItem('muse_admin_session');
  const token = session ? JSON.parse(session).token : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const inventoryService = {
  // GET with full server-side filtering
  async getProducts(filters: InventoryFilters): Promise<Product[]> {
    const params = new URLSearchParams();

    if (filters.search) params.append('search', filters.search);
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.stockLevel && filters.stockLevel !== 'All') params.append('stockLevel', filters.stockLevel);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await fetch(`${API_URL}?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch inventory');

    const products = await response.json();

    // Map DB fields to Frontend types if needed (e.g. image_url -> image)
    return products.map((p: any) => ({
      ...p,
      image: p.image_url || p.image, // Handle mapping
      createdAt: p.created_at
    }));
  },

  async saveProduct(product: Product): Promise<Product> {
    const isNew = !product.id || product.id.startsWith('new-'); // Simple check if it's new
    // Actually, in our UI 'new' products usually lack an ID or have a logical flag.
    // The previous service generated random IDs. Here we let the DB do it if it's a create.
    // We'll assume if there's no ID or if we are in "creation mode", we call POST.
    // However, the `saveProduct` interface takes a `Product` which has `id`.
    // Let's rely on whether the ID exists in the DB or if the UI sends a specific signal.
    // For now: assume POST if we are creating, PUT if updating. 
    // Best practice: split create/update or check ID. 
    // The UI calls `handleSave` -> `inventoryService.saveProduct`.
    // The UI passes `editingProduct` which might have an ID if editing, or not (or partial) if new.

    const method = product.id && !product.id.includes('p-') ? 'PUT' : 'POST';
    // Wait, the previous mock generated IDs like `p-...`. 
    // Any existing real ID is likely a UUID.

    // Simplified logic: If the ID looks like a UUID, it's an update. If it's missing or from the mock "new" logic, create.
    const isUpdate = product.id && product.id.length > 10 && !product.id.startsWith('p-');

    const url = isUpdate ? `${API_URL}/${product.id}` : API_URL;
    const fetchMethod = isUpdate ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: fetchMethod,
      headers: getHeaders(),
      body: JSON.stringify(product)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save product');
    }

    const saved = await response.json();
    return {
      ...saved,
      image: saved.image_url || saved.image
    };
  },

  async adjustStock(id: string, delta: number): Promise<void> {
    const response = await fetch(`${API_URL}/${id}/stock`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ delta })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to adjust stock');
    }
  },

  async deleteProduct(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!response.ok) throw new Error('Failed to archive product');
  },

  async exportCSV(filters: InventoryFilters): Promise<string> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.stockLevel && filters.stockLevel !== 'All') params.append('stockLevel', filters.stockLevel);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await fetch(`${API_URL}/export/csv?${params.toString()}`, {
      headers: getHeaders()
    });

    if (!response.ok) throw new Error('Failed to export CSV');

    return await response.text();
  }
};