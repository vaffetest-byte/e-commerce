
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Plus, Search, Edit2, Trash2, 
  Loader2, Download, 
  X, Image as ImageIcon, Check, AlertCircle,
  UploadCloud, FileText, Package, Save,
  AlertTriangle, Square, MoreVertical,
  Layers, Tag as TagIcon
} from 'lucide-react';
import { ProductStatus, Product, InventoryFilters } from '../types';
import { inventoryService } from '../services/inventoryService';

const CATEGORIES = ['All', 'Tops', 'Skirts', 'Co-ords', 'Dresses', 'Outerwear', 'Accessories'];

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);
  
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

  const handleAdjustStock = async (product: Product, delta: number) => {
    if (product.stock + delta < 0) return;
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: p.stock + delta } : p));
    await inventoryService.adjustStock(product.id, delta);
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

  const handleBulkUpload = () => {
    const simulationData: Product[] = [
      { id: 'b1', name: 'Bulk Silk Scarf', sku: 'BS-01', price: 25, stock: 100, status: ProductStatus.ACTIVE, category: 'Accessories', image: 'https://images.unsplash.com/photo-1583209814613-512c2b3d5932?q=80&w=1200' },
      { id: 'b2', name: 'Bulk Tech T-Shirt', sku: 'BT-02', price: 45, stock: 50, status: ProductStatus.ACTIVE, category: 'Tops', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200' },
    ];
    
    if (window.confirm("Simulate bulk product upload (2 items)?")) {
      setSaving(true);
      setTimeout(async () => {
        for (const p of simulationData) {
          await inventoryService.saveProduct(p);
        }
        showFeedback("Bulk Registry Sync Complete.", "success");
        setSaving(false);
        loadInventory();
      }, 1000);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setEditingProduct(prev => ({ ...prev, image: e.target?.result as string }));
      showFeedback("Asset cached for sync.", "info");
    };
    reader.readAsDataURL(file);
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
      showFeedback("Registry Synchronized.", "success");
    } catch (err: any) {
      showFeedback(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-32">
      {feedback.type && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[600] px-8 py-4 bg-[#0f172a] text-white rounded-full shadow-2xl border border-white/10 flex items-center gap-4 animate-in slide-in-from-top-10`}>
          <div className={`w-2 h-2 rounded-full ${feedback.type === 'success' ? 'bg-emerald-500' : feedback.type === 'error' ? 'bg-rose-500' : 'bg-indigo-500'}`} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{feedback.message}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-rose-500 block mb-3 italic">Registry & Logistics Matrix</span>
          <h1 className="text-3xl md:text-5xl font-black text-[#0f172a] serif italic">Inventory <span className="not-italic font-extrabold text-slate-800">Command</span></h1>
        </div>
        <div className="flex gap-4">
          <button onClick={handleBulkUpload} className="px-6 py-4 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all shadow-sm flex items-center gap-3">
             <UploadCloud size={16} /> Bulk Upload
          </button>
          <button onClick={handleExport} className="px-6 py-4 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all shadow-sm">
            <Download size={16} />
          </button>
          <button 
            onClick={() => { setEditingProduct({ status: ProductStatus.ACTIVE, stock: 0, price: 0, category: 'Tops', tags: [] }); setIsModalOpen(true); }}
            className="flex-1 md:flex-none bg-[#0f172a] text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:bg-rose-600 transition-all"
          >
            <Plus size={18} className="inline mr-2" /> New Entry
          </button>
        </div>
      </div>

      {/* Registry Table */}
      <div className="bg-white rounded-[32px] md:rounded-[60px] border border-slate-100 shadow-sm overflow-hidden relative">
        <div className="p-8 md:p-12 border-b border-slate-50 flex flex-col md:flex-row gap-6 items-center">
          <div className="relative flex-1 w-full group">
            <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500" />
            <input 
              type="text" 
              placeholder="SEARCH REGISTRY..." 
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none transition-all focus:bg-white focus:ring-4 focus:ring-rose-500/5"
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="flex-1 md:flex-none px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-slate-100">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-10 py-6 w-16"><Square size={16} className="text-slate-200" /></th>
                <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Artifact</th>
                <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Stock Node</th>
                <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Pricing</th>
                <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Visibility</th>
                <th className="px-12 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Terminal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-rose-500" /></td></tr>
              ) : products.map((product) => (
                <tr key={product.id} className="group hover:bg-slate-50/30 transition-all">
                  <td className="px-10 py-6"><Square size={16} className="text-slate-100 group-hover:text-rose-200 transition-colors" /></td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md shrink-0 border border-slate-100">
                        <img src={product.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={product.name} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 truncate tracking-tight">{product.name}</p>
                        <div className="flex items-center gap-3">
                           <span className="text-[9px] text-rose-500 font-black uppercase tracking-widest">{product.sku}</span>
                           <span className="w-1 h-1 rounded-full bg-slate-200" />
                           <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">{product.category}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="inline-flex items-center gap-6">
                       <button onClick={() => handleAdjustStock(product, -1)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                          <X size={14} strokeWidth={3} />
                       </button>
                       <div className={`px-5 py-2 rounded-xl flex items-center justify-center border font-black text-xs min-w-[60px] ${product.stock < 10 ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-slate-50 border-slate-100 text-slate-900'}`}>
                          {product.stock}
                       </div>
                       <button onClick={() => handleAdjustStock(product, 1)} className="p-2 text-slate-300 hover:text-emerald-500 transition-colors">
                          <Plus size={14} strokeWidth={3} />
                       </button>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                       <span className="font-black text-slate-900 serif italic text-xl">${product.price}</span>
                       {product.discountPrice && <span className="text-[9px] text-rose-500 font-bold line-through">${product.discountPrice}</span>}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest border ${product.status === ProductStatus.ACTIVE ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-12 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => { setEditingProduct(product); setIsModalOpen(true); }} className="p-3 text-slate-200 hover:text-indigo-600 transition-colors">
                          <Edit2 size={16} />
                       </button>
                       <button onClick={() => handleDelete(product.id)} className="p-3 text-slate-200 hover:text-rose-600 transition-colors">
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

      {/* Product Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-10">
          <div className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-md animate-in fade-in" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-4xl h-full md:h-auto md:max-h-[90vh] rounded-[40px] md:rounded-[60px] shadow-3xl overflow-hidden animate-in zoom-in-95 flex flex-col md:flex-row">
            
            {/* Visual Sidebar */}
            <div className="md:w-1/3 bg-slate-950 p-10 text-white flex flex-col justify-between">
              <div>
                 <div className="flex items-center gap-4 mb-10 opacity-30">
                    <Layers size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Artifact Dossier</span>
                 </div>
                 <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-slate-900 border border-white/5 relative group">
                    {editingProduct.image ? (
                      <img src={editingProduct.image} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white/10 p-10 text-center">
                        <ImageIcon size={48} strokeWidth={1} className="mb-6" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No Visual Cache Detected</p>
                      </div>
                    )}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <UploadCloud size={32} />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                 </div>
                 <p className="mt-8 text-[9px] text-white/20 uppercase tracking-[0.2em] italic text-center">Protocol: Visual Sync Active</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="flex items-center gap-3 text-white/20 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mt-10">
                 <X size={16} /> Abort Entry
              </button>
            </div>

            {/* Form Area */}
            <div className="flex-1 p-10 md:p-16 overflow-y-auto no-scrollbar bg-white">
               <h2 className="serif text-4xl italic font-light tracking-tighter mb-12">Registry <span className="not-italic font-black">Input.</span></h2>
               <form onSubmit={handleSave} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Artifact Label</label>
                        <input type="text" value={editingProduct.name || ''} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full px-8 py-4 bg-slate-50 rounded-2xl text-[11px] font-bold uppercase outline-none border border-transparent focus:border-rose-500" required />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">SKU Code</label>
                        <input type="text" value={editingProduct.sku || ''} onChange={(e) => setEditingProduct({...editingProduct, sku: e.target.value})} className="w-full px-8 py-4 bg-slate-50 rounded-2xl text-[11px] font-black text-rose-500 uppercase outline-none border border-transparent focus:border-rose-500" required />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Base Price ($)</label>
                        <input type="number" value={editingProduct.price || 0} onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} className="w-full px-8 py-4 bg-slate-50 rounded-2xl text-[11px] font-black outline-none border border-transparent focus:border-rose-500" required />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Discount ($)</label>
                        <input type="number" value={editingProduct.discountPrice || 0} onChange={(e) => setEditingProduct({...editingProduct, discountPrice: parseFloat(e.target.value)})} className="w-full px-8 py-4 bg-slate-50 rounded-2xl text-[11px] font-black outline-none border border-transparent focus:border-rose-500" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Registry Units</label>
                        <input type="number" value={editingProduct.stock || 0} onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})} className="w-full px-8 py-4 bg-slate-50 rounded-2xl text-[11px] font-black outline-none border border-transparent focus:border-rose-500" required />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Aesthetic Cluster</label>
                        <select value={editingProduct.category || 'Tops'} onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full px-8 py-4 bg-slate-50 rounded-2xl text-[11px] font-black uppercase outline-none border border-transparent focus:border-rose-500">
                           {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Registry Visibility</label>
                        <select value={editingProduct.status || ProductStatus.ACTIVE} onChange={(e) => setEditingProduct({...editingProduct, status: e.target.value as ProductStatus})} className="w-full px-8 py-4 bg-slate-50 rounded-2xl text-[11px] font-black uppercase outline-none border border-transparent focus:border-rose-500">
                           {Object.values(ProductStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Registry Descriptor</label>
                     <textarea value={editingProduct.description || ''} onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full px-8 py-6 bg-slate-50 rounded-[30px] text-[11px] font-bold outline-none border border-transparent focus:border-rose-500 min-h-[120px]" placeholder="EDITORIAL PERSPECTIVE..." />
                  </div>

                  <button 
                    type="submit" 
                    disabled={saving}
                    className="w-full bg-[#0f172a] text-white py-8 rounded-full font-black uppercase tracking-[0.5em] text-[11px] hover:bg-rose-600 transition-all shadow-3xl flex items-center justify-center gap-4 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                    Sync Artifact with Registry
                  </button>
               </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
