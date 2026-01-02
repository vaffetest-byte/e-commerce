
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Search, Filter, Edit2, Trash2, Sparkles, 
  Loader2, ChevronUp, ChevronDown, Download, 
  X, Image as ImageIcon, Check, AlertCircle,
  ArrowUpDown, Wand2
} from 'lucide-react';
import { ProductStatus, Product, InventoryFilters } from '../types';
import { generateProductDescription } from '../geminiService';
import { inventoryService } from '../services/inventoryService';

const CATEGORIES = ['All', 'Tops', 'Skirts', 'Co-ords', 'Dresses', 'Accessories'];

const Products: React.FC = () => {
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [aiDescription, setAiDescription] = useState('');
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getProducts(filters);
      setProducts(data);
    } catch (err) {
      console.error("Failed to load inventory", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const handleAdjustStock = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    const updated = { ...product, stock: newStock };
    await inventoryService.saveProduct(updated);
    loadInventory();
  };

  const handleStatusToggle = async (product: Product) => {
    const nextStatus = product.status === ProductStatus.ACTIVE ? ProductStatus.DRAFT : ProductStatus.ACTIVE;
    await inventoryService.saveProduct({ ...product, status: nextStatus });
    loadInventory();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure? This product will be removed from the active catalog.")) {
      await inventoryService.deleteProduct(id);
      loadInventory();
    }
  };

  const handleExport = async () => {
    const csv = await inventoryService.exportCSV(filters);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const generateAIContent = async () => {
    if (!editingProduct?.name || !editingProduct?.category) {
      alert("Please provide a name and category first.");
      return;
    }
    setIsGeneratingDesc(true);
    const desc = await generateProductDescription(editingProduct.name, editingProduct.category);
    setAiDescription(desc || '');
    setIsGeneratingDesc(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.sku) return;
    
    setSaving(true);
    try {
      // Ensure we have all required fields for the service
      const productToSave: Product = {
        id: editingProduct.id || `p-${Math.random().toString(36).substr(2, 9)}`,
        name: editingProduct.name,
        sku: editingProduct.sku,
        price: editingProduct.price || 0,
        stock: editingProduct.stock || 0,
        status: editingProduct.status || ProductStatus.DRAFT,
        category: editingProduct.category || 'Tops',
        image: editingProduct.image || 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=800'
      };

      await inventoryService.saveProduct(productToSave);
      setIsModalOpen(false);
      setEditingProduct(null);
      setAiDescription('');
      loadInventory();
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.ACTIVE: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case ProductStatus.DRAFT: return 'bg-amber-50 text-amber-600 border-amber-100';
      case ProductStatus.ARCHIVED: return 'bg-rose-50 text-rose-600 border-rose-100';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 block mb-4">Stock Intelligence</span>
          <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900">Inventory Control</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleExport}
            className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:shadow-xl transition-all"
          >
            <Download size={16} />
            Export Data
          </button>
          <button 
            onClick={() => {
              setEditingProduct({ status: ProductStatus.DRAFT, stock: 0, price: 0, category: 'Tops' });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl hover:bg-rose-500 transition-all font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-200"
          >
            <Plus size={18} />
            Catalog New Item
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 space-y-8">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <div className="relative flex-1 group">
            <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors" />
            <input 
              type="text" 
              placeholder="QUERY BY NAME OR SKU..." 
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-[24px] text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-rose-500/5 focus:bg-white focus:border-rose-200 transition-all"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <select 
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:bg-white transition-all"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
            </select>

            <select 
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
              className="px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:bg-white transition-all"
            >
              <option value="All">ALL STATUS</option>
              <option value={ProductStatus.ACTIVE}>ACTIVE</option>
              <option value={ProductStatus.DRAFT}>DRAFT</option>
              <option value={ProductStatus.ARCHIVED}>ARCHIVED</option>
            </select>

            <select 
              value={filters.stockLevel}
              onChange={(e) => setFilters({ ...filters, stockLevel: e.target.value as any })}
              className="px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:bg-white transition-all"
            >
              <option value="All">ANY STOCK</option>
              <option value="Low">LOW STOCK (&lt;10)</option>
              <option value="Out">OUT OF STOCK</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto -mx-8">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-12 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <button 
                    className="flex items-center gap-2"
                    onClick={() => setFilters({...filters, sortBy: 'name', sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'})}
                  >
                    Product Detail <ArrowUpDown size={10} />
                  </button>
                </th>
                <th className="px-12 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">SKU</th>
                <th className="px-12 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                   <button 
                    className="flex items-center gap-2"
                    onClick={() => setFilters({...filters, sortBy: 'stock', sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'})}
                  >
                    Quantity <ArrowUpDown size={10} />
                  </button>
                </th>
                <th className="px-12 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <button 
                    className="flex items-center gap-2"
                    onClick={() => setFilters({...filters, sortBy: 'price', sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'})}
                  >
                    Price <ArrowUpDown size={10} />
                  </button>
                </th>
                <th className="px-12 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-12 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-32 text-center">
                    <Loader2 size={32} className="animate-spin mx-auto text-rose-500 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Synchronizing Ledger...</p>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-32 text-center">
                    <AlertCircle size={32} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">No objects match your query.</p>
                  </td>
                </tr>
              ) : products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-12 py-8">
                    <div className="flex items-center gap-6">
                      <img src={product.image} className="w-16 h-16 rounded-[20px] object-cover bg-slate-100 shadow-md border border-slate-100" />
                      <div>
                        <p className="text-sm font-black text-slate-900 tracking-tight">{product.name}</p>
                        <p className="text-[9px] text-rose-500 font-black uppercase tracking-widest mt-1">{product.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-12 py-8 text-[11px] font-black text-slate-400 tracking-widest">{product.sku}</td>
                  <td className="px-12 py-8">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-center">
                        <button 
                          onClick={() => handleAdjustStock(product, 1)}
                          className="p-1 hover:text-rose-500 text-slate-300 transition-colors"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <span className={`text-lg font-black tracking-tighter ${product.stock < 10 ? 'text-rose-500' : 'text-slate-900'}`}>
                          {product.stock}
                        </span>
                        <button 
                          onClick={() => handleAdjustStock(product, -1)}
                          className="p-1 hover:text-rose-500 text-slate-300 transition-colors"
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>
                      <div className="hidden sm:block w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-700 ${product.stock < 10 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${Math.min(100, (product.stock / 50) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-12 py-8 text-lg font-black text-slate-900 tracking-tighter">${product.price.toFixed(2)}</td>
                  <td className="px-12 py-8">
                    <button 
                      onClick={() => handleStatusToggle(product)}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all hover:scale-105 active:scale-95 ${getStatusColor(product.status)}`}
                    >
                      {product.status}
                    </button>
                  </td>
                  <td className="px-12 py-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                          onClick={() => {
                            setEditingProduct(product);
                            setIsModalOpen(true);
                          }}
                          className="p-3 text-slate-300 hover:text-slate-900 hover:bg-white hover:shadow-lg rounded-2xl transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-3xl bg-white rounded-[60px] shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-12 pt-12 pb-6 border-b border-slate-50 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest block mb-2">Item Definition</span>
                <h2 className="text-3xl font-black tracking-tighter">{editingProduct?.id ? 'Adjust Object' : 'Register New Object'}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-4 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-12 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Object Name</label>
                   <input 
                    type="text" 
                    value={editingProduct?.name || ''} 
                    onChange={e => setEditingProduct({...editingProduct!, name: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-500/5 font-bold uppercase text-[11px] tracking-widest"
                    required
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Unique SKU</label>
                   <input 
                    type="text" 
                    value={editingProduct?.sku || ''} 
                    onChange={e => setEditingProduct({...editingProduct!, sku: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-500/5 font-bold uppercase text-[11px] tracking-widest"
                    required
                   />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-8">
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (USD)</label>
                   <input 
                    type="number" 
                    value={editingProduct?.price || 0} 
                    onChange={e => setEditingProduct({...editingProduct!, price: parseFloat(e.target.value)})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-500/5 font-bold text-[11px]"
                    required
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Stock</label>
                   <input 
                    type="number" 
                    value={editingProduct?.stock || 0} 
                    onChange={e => setEditingProduct({...editingProduct!, stock: parseInt(e.target.value)})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-500/5 font-bold text-[11px]"
                    required
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                   <select 
                    value={editingProduct?.category || ''} 
                    onChange={e => setEditingProduct({...editingProduct!, category: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-500/5 font-bold uppercase text-[11px] tracking-widest"
                   >
                     {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Aesthetic Description (AI-Powered)</label>
                  <button 
                    type="button"
                    onClick={generateAIContent}
                    disabled={isGeneratingDesc}
                    className="flex items-center gap-2 text-[9px] font-black text-rose-500 hover:text-rose-600 transition-colors disabled:opacity-50"
                  >
                    {isGeneratingDesc ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                    Magic Wand
                  </button>
                </div>
                <textarea 
                  value={aiDescription}
                  onChange={(e) => setAiDescription(e.target.value)}
                  placeholder="USE THE MAGIC WAND TO GENERATE..."
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-rose-500/5 font-medium text-[11px] h-32 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Visual Reference (URL)</label>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    value={editingProduct?.image || ''} 
                    onChange={e => setEditingProduct({...editingProduct!, image: e.target.value})}
                    className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-500/5 font-bold text-[11px]"
                    placeholder="https://images.unsplash.com/..."
                    required
                   />
                   <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 overflow-hidden">
                      {editingProduct?.image ? <img src={editingProduct.image} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-300" />}
                   </div>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-[24px] font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
                >
                  Discard Changes
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex-1 py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase text-[10px] tracking-widest hover:bg-rose-500 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  Commit Definition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
