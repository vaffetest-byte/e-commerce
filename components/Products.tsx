
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Plus, Search, Edit2, Trash2, 
  Loader2, ChevronUp, ChevronDown, Download, 
  X, Image as ImageIcon, Check, AlertCircle,
  Link as LinkIcon, Layers,
  Archive, Eye, Filter, CheckSquare, Square,
  UploadCloud
} from 'lucide-react';
import { ProductStatus, Product, InventoryFilters } from '../types';
import { inventoryService } from '../services/inventoryService';

const CATEGORIES = ['All', 'Tops', 'Skirts', 'Co-ords', 'Dresses', 'Accessories'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface ProductsProps {
  onUpdate?: () => void;
}

const Products: React.FC<ProductsProps> = ({ onUpdate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<InventoryFilters>({
    search: '',
    category: 'All',
    status: 'All',
    stockLevel: 'All',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' | null }>({ message: '', type: null });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getProducts(filters);
      setProducts(data);
    } catch (err) {
      showFeedback("Registry connection lost.", "error");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const showFeedback = (message: string, type: 'success' | 'error' | 'info') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: '', type: null }), 4000);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map(p => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleAdjustStock = async (product: Product, delta: number) => {
    if (product.stock + delta < 0) return;
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: p.stock + delta } : p));
    await inventoryService.adjustStock(product.id, delta);
  };

  const handleStatusToggle = async (product: Product) => {
    const nextStatus = product.status === ProductStatus.ACTIVE ? ProductStatus.DRAFT : ProductStatus.ACTIVE;
    await inventoryService.saveProduct({ ...product, status: nextStatus });
    loadInventory();
    if (onUpdate) onUpdate();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Permanently delete this artifact?")) {
      try {
        await inventoryService.deleteProduct(id);
        showFeedback("Artifact terminated.", "success");
        loadInventory();
        if (onUpdate) onUpdate();
      } catch (err: any) {
        showFeedback("Deletion failed.", "error");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedIds.size} artifacts?`)) {
      setLoading(true);
      try {
        const idsToDelete = Array.from(selectedIds) as string[];
        await Promise.all(idsToDelete.map(id => inventoryService.deleteProduct(id)));
        setSelectedIds(new Set());
        showFeedback("Bulk termination complete.", "success");
        loadInventory();
        if (onUpdate) onUpdate();
      } catch (err: any) {
        showFeedback("Bulk protocol failure.", "error");
        loadInventory();
      }
    }
  };

  const handleExport = async () => {
    try {
      const csv = await inventoryService.exportCSV(filters);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seoul-muse-inventory.csv`;
      a.click();
    } catch (err) {
      showFeedback("Export failed.", "error");
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      setEditingProduct(prev => ({ ...prev, image: e.target?.result as string }));
      setIsUploading(false);
      showFeedback("Asset updated.", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setEditingProduct(prev => ({
      ...prev!,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.sku) return;
    setSaving(true);
    try {
      await inventoryService.saveProduct(editingProduct as Product);
      setIsModalOpen(false);
      loadInventory();
      if (onUpdate) onUpdate();
    } catch (err: any) {
      showFeedback(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-32">
      {feedback.type && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[600] px-8 py-4 bg-[#0f172a] text-white rounded-full shadow-2xl border border-white/10 flex items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{feedback.message}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-rose-500 block mb-3 italic">Registry & Logistics</span>
          <h1 className="text-3xl md:text-5xl font-black text-[#0f172a] serif italic">Inventory <span className="not-italic font-extrabold">Command</span></h1>
        </div>
        <div className="flex gap-4">
          <button onClick={handleExport} className="px-6 py-4 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all shadow-sm">
            <Download size={16} />
          </button>
          <button 
            onClick={() => { setEditingProduct({ status: ProductStatus.DRAFT, stock: 0, price: 0, category: 'Tops' }); setIsModalOpen(true); }}
            className="flex-1 md:flex-none bg-[#0f172a] text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl"
          >
            <Plus size={18} className="inline mr-2" /> New Entry
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] md:rounded-[60px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 md:p-12 border-b border-slate-50 flex flex-col md:flex-row gap-6 items-center">
          <div className="relative flex-1 w-full group">
            <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500" />
            <input 
              type="text" 
              placeholder="SEARCH SKU..." 
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none"
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="flex-1 md:flex-none px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Scrollable Container for Tablet/Mobile Table */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-10 py-6"><Square size={16} className="text-slate-200" /></th>
                <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Visual Asset</th>
                <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Stock</th>
                <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Life Cycle</th>
                <th className="px-12 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-rose-500" /></td></tr>
              ) : products.map((product) => (
                <tr key={product.id} className="group hover:bg-[#fdfcfb]">
                  <td className="px-10 py-6"><Square size={16} className="text-slate-100" /></td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm shrink-0">
                        <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-900 truncate">{product.name}</p>
                        <p className="text-[8px] text-rose-500 font-black uppercase tracking-widest">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="inline-flex items-center bg-slate-50 rounded-xl px-4 py-2 gap-4 border border-slate-100">
                      <span className="text-xs font-black text-slate-900">{product.stock}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-black text-slate-900 serif italic">${product.price}</td>
                  <td className="px-8 py-6">
                    <span className="px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest border bg-emerald-50 text-emerald-600 border-emerald-100">
                      {product.status}
                    </span>
                  </td>
                  <td className="px-12 py-6 text-right">
                    <button onClick={() => handleDelete(product.id)} className="p-3 text-slate-200 hover:text-rose-600 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Products;
