import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Sparkles, 
  Loader2, ChevronUp, ChevronDown, Download, 
  X, Image as ImageIcon, Check, AlertCircle,
  ArrowUpDown, Wand2, Upload
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
  const [saving, setSaving] = useState(false);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getProducts(filters);
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const handleAdjustStock = async (product: Product, delta: number) => {
    if (product.stock + delta < 0) return;
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: p.stock + delta } : p));
    await inventoryService.adjustStock(product.id, delta);
  };

  const handleStatusToggle = async (product: Product) => {
    const nextStatus = product.status === ProductStatus.ACTIVE ? ProductStatus.DRAFT : ProductStatus.ACTIVE;
    await inventoryService.saveProduct({ ...product, status: nextStatus });
    loadInventory();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Archive this product? It will be hidden from the storefront.")) {
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
    a.download = `inventory-report.csv`;
    a.click();
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
      const productToSave: Product = {
        id: editingProduct.id || '',
        name: editingProduct.name,
        sku: editingProduct.sku,
        price: editingProduct.price || 0,
        stock: editingProduct.stock || 0,
        status: editingProduct.status || ProductStatus.DRAFT,
        category: editingProduct.category || 'Tops',
        image: editingProduct.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800'
      };

      await inventoryService.saveProduct(productToSave);
      setIsModalOpen(false);
      setEditingProduct(null);
      loadInventory();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-rose-500 block mb-4 italic">Registry & Logistics</span>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 serif italic">Inventory <span className="not-italic font-extrabold text-[#0f172a]">Command</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleExport} className="flex items-center gap-3 px-8 py-5 bg-white border border-slate-100 rounded-[28px] text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all shadow-sm">
            <Download size={16} /> Export CSV
          </button>
          <button 
            onClick={() => { setEditingProduct({ status: ProductStatus.DRAFT, stock: 0, price: 0, category: 'Tops', image: '' }); setIsModalOpen(true); }}
            className="bg-[#0f172a] text-white px-10 py-5 rounded-[28px] font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:scale-105 transition-transform active:scale-95"
          >
            <Plus size={18} className="inline mr-2" /> New Entry
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-[60px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] p-12 overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-8 items-center mb-12">
          <div className="relative flex-1 group">
            <Search size={20} className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Filter by SKU or artifact name..." 
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-20 pr-10 py-6 bg-slate-50 border border-slate-100 rounded-[32px] text-[11px] font-bold uppercase tracking-widest focus:ring-4 focus:ring-rose-500/5 transition-all outline-none"
            />
          </div>
          <div className="flex gap-4">
            <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="px-8 py-6 bg-slate-50 border border-slate-100 rounded-[28px] text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-colors">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value as any })} className="px-8 py-6 bg-slate-50 border border-slate-100 rounded-[28px] text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-colors">
              <option value="All">All Visibility</option>
              <option value={ProductStatus.ACTIVE}>Live Store</option>
              <option value={ProductStatus.DRAFT}>Hidden Draft</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto -mx-12">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-16 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Visual Asset</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU Identifier</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Velocity (Stock)</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Acquisition Price</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Life Cycle</th>
                <th className="px-16 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="py-32 text-center"><Loader2 className="animate-spin mx-auto text-rose-500" size={32} /></td></tr>
              ) : products.map((product) => (
                <tr key={product.id} className="group hover:bg-[#fdfcfb] transition-all">
                  <td className="px-16 py-10">
                    <div className="flex items-center gap-8">
                      <div className="w-16 h-16 rounded-[24px] overflow-hidden bg-slate-100 border border-slate-100 shadow-sm">
                        <img src={product.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 tracking-tight leading-none mb-2">{product.name}</p>
                        <p className="text-[9px] text-rose-500 font-black uppercase tracking-[0.4em] italic">{product.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-10">
                    <span className="text-[11px] font-black text-slate-400 tracking-[0.2em]">{product.sku}</span>
                  </td>
                  <td className="px-8 py-10 text-center">
                    <div className="inline-flex items-center bg-slate-50 rounded-2xl p-2 gap-4 border border-slate-100">
                      <button onClick={() => handleAdjustStock(product, -1)} className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all"><ChevronDown size={14}/></button>
                      <span className={`text-sm font-black w-8 ${product.stock < 10 ? 'text-rose-500' : 'text-slate-900'}`}>{product.stock}</span>
                      <button onClick={() => handleAdjustStock(product, 1)} className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all"><ChevronUp size={14}/></button>
                    </div>
                  </td>
                  <td className="px-8 py-10 font-black text-slate-900 serif text-lg italic">${product.price.toFixed(2)}</td>
                  <td className="px-8 py-10">
                    <button 
                      onClick={() => handleStatusToggle(product)} 
                      className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] border transition-all ${
                        product.status === ProductStatus.ACTIVE 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                        : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'
                      }`}
                    >
                      {product.status}
                    </button>
                  </td>
                  <td className="px-16 py-10 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingProduct(product); setIsModalOpen(true); }} className="p-4 text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-lg rounded-2xl transition-all"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(product.id)} className="p-4 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:shadow-lg rounded-2xl transition-all"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && products.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-40 text-center text-slate-300 italic serif text-2xl">
                    No artifacts found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Designer Register Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-900/10">
          <div className="fixed inset-0" onClick={() => setIsModalOpen(false)} />
          <form 
            onSubmit={handleSave} 
            className="relative w-full max-w-3xl bg-white rounded-[70px] p-16 space-y-12 animate-in zoom-in-95 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-50"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-rose-500 block mb-4 italic">Entry Form // Atelier</span>
                <h2 className="text-5xl font-black tracking-tighter text-[#0f172a] serif italic leading-none">Register <span className="not-italic font-extrabold text-[#0f172a]">Object</span></h2>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-4 rounded-full bg-slate-50 hover:bg-rose-50 transition-colors group">
                <X size={24} className="text-slate-300 group-hover:text-rose-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
              {/* Image Selection Area */}
              <div className="md:col-span-4 flex flex-col gap-4">
                <div className="aspect-[3/4] rounded-[50px] overflow-hidden bg-[#f8fafc] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center group relative cursor-pointer hover:border-rose-200 transition-all">
                  {editingProduct?.image ? (
                    <>
                      <img src={editingProduct.image} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white border border-white/20 px-6 py-3 rounded-full backdrop-blur-md">Replace Vision</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-slate-300 group-hover:text-rose-400">
                      <div className="p-6 bg-white rounded-full shadow-sm">
                        <Upload size={32} strokeWidth={1.5} />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest">Asset Upload</span>
                    </div>
                  )}
                  <input 
                    type="url" 
                    name="image"
                    value={editingProduct?.image || ''} 
                    onChange={handleChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    placeholder="URL ONLY FOR DEMO"
                  />
                </div>
                <div className="bg-rose-50 p-4 rounded-3xl border border-rose-100/50">
                   <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest text-center">Visual artifacts must be high-res 4:5 aspect ratio.</p>
                </div>
              </div>

              {/* Data Inputs Area */}
              <div className="md:col-span-8 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-300 ml-4 italic">Object Name</label>
                    <input 
                      name="name"
                      value={editingProduct?.name || ''} 
                      onChange={handleChange} 
                      placeholder="HONGDAE TENNIS MINI SKIRT" 
                      className="w-full p-7 bg-[#f8fafc] rounded-[32px] text-[11px] font-black uppercase tracking-widest text-[#0f172a] placeholder:text-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all shadow-sm" 
                      required 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-300 ml-4 italic">Identity SKU</label>
                    <input 
                      name="sku"
                      value={editingProduct?.sku || ''} 
                      onChange={handleChange} 
                      placeholder="SM-002" 
                      className="w-full p-7 bg-[#f8fafc] rounded-[32px] text-[11px] font-black uppercase tracking-widest text-[#0f172a] placeholder:text-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all shadow-sm" 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-300 ml-4 italic">Price Point ($)</label>
                    <input 
                      name="price"
                      type="number" 
                      step="0.01"
                      value={editingProduct?.price || ''} 
                      onChange={handleChange} 
                      placeholder="35.00" 
                      className="w-full p-7 bg-[#f8fafc] rounded-[32px] text-[11px] font-black tracking-widest text-[#0f172a] placeholder:text-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all shadow-sm" 
                      required 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-300 ml-4 italic">Initial Reserve</label>
                    <input 
                      name="stock"
                      type="number" 
                      value={editingProduct?.stock || ''} 
                      onChange={handleChange} 
                      placeholder="120" 
                      className="w-full p-7 bg-[#f8fafc] rounded-[32px] text-[11px] font-black tracking-widest text-[#0f172a] placeholder:text-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all shadow-sm" 
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-300 ml-4 italic">Department</label>
                    <select 
                      name="category"
                      value={editingProduct?.category || 'Tops'} 
                      onChange={handleChange}
                      className="w-full p-7 bg-[#f8fafc] rounded-[32px] text-[11px] font-black uppercase tracking-widest text-[#0f172a] outline-none focus:ring-4 focus:ring-slate-100 transition-all shadow-sm appearance-none cursor-pointer"
                    >
                      {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
              </div>
            </div>

            <div className="flex gap-8 pt-8">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="flex-1 py-7 bg-[#f1f5f9] text-[#0f172a] rounded-[32px] font-black uppercase tracking-[0.4em] text-[11px] hover:bg-slate-200 transition-all active:scale-95"
              >
                Discard Draft
              </button>
              <button 
                type="submit" 
                disabled={saving} 
                className="flex-1 py-7 bg-[#0f172a] text-white rounded-[32px] font-black uppercase tracking-[0.4em] text-[11px] hover:bg-[#1e293b] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-4"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Check size={18} />}
                {saving ? 'Syncing...' : 'Confirm Entry'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Products;