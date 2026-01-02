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
      showFeedback("Registry connection lost. Retrying...", "error");
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
    const confirmation = window.confirm(
      "CRITICAL ACTION REQUIRED\n\nAre you sure you want to permanently delete this product? This action cannot be undone.\n\nThe artifact will be removed from search results, inventory, and all customer shopping sessions."
    );

    if (confirmation) {
      try {
        await inventoryService.deleteProduct(id);
        showFeedback("Artifact permanently removed from registry.", "success");
        loadInventory();
        if (onUpdate) onUpdate(); // Sync global state
      } catch (err: any) {
        showFeedback(err.message || "Deletion failed.", "error");
      }
    }
  };

  const handleBulkDelete = async () => {
    const confirmation = window.confirm(
      `BULK DELETION SECURITY PROTOCOL\n\nAre you sure you want to delete ${selectedIds.size} selected products? This action cannot be undone.\n\nAll selected items will be immediately purged from the system.`
    );

    if (confirmation) {
      setLoading(true);
      try {
        const idsToDelete = Array.from(selectedIds) as string[];
        await Promise.all(idsToDelete.map(id => inventoryService.deleteProduct(id)));
        setSelectedIds(new Set());
        showFeedback(`${idsToDelete.length} artifacts terminated successfully.`, "success");
        loadInventory();
        if (onUpdate) onUpdate(); // Sync global state
      } catch (err: any) {
        showFeedback("Bulk termination protocol failure. Check registry logs.", "error");
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
      a.download = `seoul-muse-inventory-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showFeedback("Export protocol failed.", "error");
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showFeedback("Invalid artifact: Please select an image file.", "error");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      showFeedback("Constraint Violation: File exceeds 5MB threshold.", "error");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    const startTime = Date.now();
    const duration = 800;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(Math.floor((elapsed / duration) * 95), 95);
      setUploadProgress(progress);
      if (elapsed >= duration) clearInterval(interval);
    }, 50);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setEditingProduct(prev => ({ ...prev, image: base64 }));
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        showFeedback("Visual asset updated.", "success");
      }, 200);
    };
    reader.onerror = () => {
      setIsUploading(false);
      showFeedback("File system error during asset mapping.", "error");
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
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
    if (!editingProduct?.name || !editingProduct?.sku) {
      showFeedback("Validation Error: Identifier and Name required.", "error");
      return;
    }
    
    setSaving(true);
    try {
      const productToSave: Product = {
        id: editingProduct.id || '',
        name: editingProduct.name as string,
        sku: editingProduct.sku as string,
        price: editingProduct.price || 0,
        stock: editingProduct.stock || 0,
        status: editingProduct.status || ProductStatus.DRAFT,
        category: editingProduct.category || 'Tops',
        collection: editingProduct.collection || '',
        image: editingProduct.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800'
      };

      await inventoryService.saveProduct(productToSave);
      showFeedback("Registry state synchronized.", "success");
      setIsModalOpen(false);
      setEditingProduct(null);
      loadInventory();
      if (onUpdate) onUpdate();
    } catch (err: any) {
      showFeedback(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-32">
      {feedback.type && (
        <div className={`fixed top-12 left-1/2 -translate-x-1/2 z-[600] px-10 py-5 rounded-full shadow-2xl border flex items-center gap-4 animate-in slide-in-from-top-10 transition-all ${
          feedback.type === 'error' ? 'bg-rose-900 border-rose-800 text-white' : 
          feedback.type === 'success' ? 'bg-[#0f172a] border-slate-800 text-white' : 
          'bg-slate-50 border-slate-100 text-slate-900'
        }`}>
          {feedback.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{feedback.message}</span>
        </div>
      )}

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
            onClick={() => { setEditingProduct({ status: ProductStatus.DRAFT, stock: 0, price: 0, category: 'Tops', collection: '', image: '' }); setIsModalOpen(true); }}
            className="bg-[#0f172a] text-white px-10 py-5 rounded-[28px] font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:scale-105 transition-transform active:scale-95"
          >
            <Plus size={18} className="inline mr-2" /> New Entry
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[60px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-12 border-b border-slate-50 flex flex-col lg:flex-row gap-8 items-center">
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
            <div className="flex items-center gap-4 px-8 py-2 bg-slate-50 border border-slate-100 rounded-[28px]">
                <Filter size={14} className="text-slate-400" />
                <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div className="flex items-center gap-4 px-8 py-2 bg-slate-50 border border-slate-100 rounded-[28px]">
                <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value as any })} className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer">
                    <option value="All">All Lifecycles</option>
                    <option value={ProductStatus.ACTIVE}>Active Only</option>
                    <option value={ProductStatus.DRAFT}>Drafts Only</option>
                </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-10 py-6">
                    <button onClick={toggleSelectAll} className="text-slate-300 hover:text-rose-500 transition-colors">
                        {selectedIds.size === products.length && products.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>
                </th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Visual Asset</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Velocity (Stock)</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price Point</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Life Cycle</th>
                <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={7} className="py-32 text-center"><Loader2 className="animate-spin mx-auto text-rose-500" size={32} /></td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={7} className="py-20 text-center text-slate-300 italic text-sm">No artifacts matching current criteria.</td></tr>
              ) : products.map((product) => (
                <tr key={product.id} className={`group hover:bg-[#fdfcfb] transition-all ${selectedIds.has(product.id) ? 'bg-rose-50/20' : ''}`}>
                  <td className="px-10 py-10">
                    <button onClick={() => toggleSelect(product.id)} className={`transition-colors ${selectedIds.has(product.id) ? 'text-rose-500' : 'text-slate-200 group-hover:text-slate-400'}`}>
                        {selectedIds.has(product.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>
                  </td>
                  <td className="px-8 py-10">
                    <div className="flex items-center gap-8">
                      <div className="w-16 h-16 rounded-[24px] overflow-hidden bg-slate-100 border border-slate-100 shadow-sm relative group/img">
                        <img src={product.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye size={16} className="text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 tracking-tight leading-none mb-2">{product.name}</p>
                        <div className="flex items-center gap-3">
                            <p className="text-[9px] text-rose-500 font-black uppercase tracking-[0.4em] italic">{product.category}</p>
                            <span className="text-[9px] text-slate-300 font-bold tracking-widest">{product.sku}</span>
                        </div>
                      </div>
                    </div>
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
                  <td className="px-12 py-10 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingProduct(product); setIsModalOpen(true); }} className="p-4 text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-lg rounded-2xl transition-all"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(product.id)} className="p-4 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:shadow-lg rounded-2xl transition-all"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedIds.size > 0 && (
          <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[400] bg-[#0f172a] text-white px-12 py-6 rounded-full shadow-3xl border border-white/10 flex items-center gap-12 animate-in slide-in-from-bottom-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{selectedIds.size} Artifacts Selected</span>
              <div className="h-6 w-[1px] bg-white/10" />
              <div className="flex items-center gap-6">
                <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest hover:text-rose-500 transition-all">
                    <Archive size={16} /> Archive All
                </button>
                <button onClick={handleBulkDelete} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:scale-105 transition-all">
                    <Trash2 size={16} /> Terminate Selected
                </button>
              </div>
              <button onClick={() => setSelectedIds(new Set())} className="p-2 hover:bg-white/10 rounded-full transition-all">
                <X size={16} />
              </button>
          </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-900/10 backdrop-blur-md">
          <div className="fixed inset-0" onClick={() => setIsModalOpen(false)} />
          <form 
            onSubmit={handleSave} 
            className="relative w-full max-w-[1000px] bg-white rounded-[70px] p-24 shadow-[0_60px_100px_-20px_rgba(0,0,0,0.1)] border border-white animate-in zoom-in-95"
          >
            <div className="flex justify-between items-start mb-16">
              <div>
                <span className="text-[12px] font-black uppercase tracking-[0.5em] text-rose-500 block mb-6 italic">Entry Form // Atelier</span>
                <h2 className="serif text-[72px] font-bold text-[#0f172a] leading-none">Register Object</h2>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-6 rounded-full bg-slate-50 hover:bg-rose-50 transition-colors">
                <X size={32} className="text-slate-300" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-20 items-start">
              <div className="md:col-span-4 flex flex-col gap-10">
                <div 
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`aspect-[4/5] rounded-[100px] overflow-hidden bg-[#f8fafc] border-2 shadow-inner flex flex-col items-center justify-center relative group cursor-pointer transition-all duration-500 ${
                    isDragging ? 'border-rose-500 bg-rose-50/20' : 'border-slate-50 hover:border-rose-200'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                  
                  {isUploading && (
                    <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-12">
                      <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mb-6">
                        <div 
                          className="bg-rose-500 h-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }} 
                        />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Syncing Asset...</span>
                    </div>
                  )}

                  {editingProduct?.image ? (
                    <img src={editingProduct.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]" />
                  ) : (
                    <div className="flex flex-col items-center gap-6 opacity-20 group-hover:opacity-40 transition-opacity">
                      <UploadCloud size={64} strokeWidth={1} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Select Asset</span>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-rose-500/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                     <span className="bg-white/90 px-8 py-3 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">Update Asset</span>
                  </div>
                </div>
                <div className="bg-rose-50/50 p-8 rounded-[40px] border border-rose-100">
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] text-center leading-relaxed">
                    Visual artifacts must <br/> be high-res 4:5 aspect <br/> ratio. Max 5MB threshold.
                  </p>
                </div>
              </div>

              <div className="md:col-span-8 space-y-12">
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 ml-6 italic">Object Name</label>
                    <input 
                      name="name"
                      value={editingProduct?.name || ''} 
                      onChange={handleChange} 
                      placeholder="PETAL RIBBON SILK" 
                      className="w-full p-8 bg-[#f8fafc] rounded-[40px] text-[13px] font-black uppercase tracking-widest text-[#0f172a] focus:ring-4 focus:ring-rose-500/5 transition-all outline-none" 
                      required 
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 ml-6 italic">Identity SKU</label>
                    <input 
                      name="sku"
                      value={editingProduct?.sku || ''} 
                      onChange={handleChange} 
                      placeholder="SM-001" 
                      className="w-full p-8 bg-[#f8fafc] rounded-[40px] text-[13px] font-black uppercase tracking-widest text-[#0f172a] focus:ring-4 focus:ring-rose-500/5 transition-all outline-none" 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 ml-6 italic">Collection Theme</label>
                    <div className="relative">
                        <Layers size={18} className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input 
                            name="collection"
                            value={editingProduct?.collection || ''} 
                            onChange={handleChange} 
                            placeholder="SEOUL METAMORPHOSIS" 
                            className="w-full pl-20 pr-8 py-8 bg-[#f8fafc] rounded-[40px] text-[13px] font-black uppercase tracking-widest text-[#0f172a] focus:ring-4 focus:ring-rose-500/5 transition-all outline-none" 
                        />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 ml-6 italic">Department</label>
                    <select 
                      name="category"
                      value={editingProduct?.category || 'Tops'} 
                      onChange={handleChange}
                      className="w-full p-8 bg-[#f8fafc] rounded-[40px] text-[13px] font-black uppercase tracking-widest text-[#0f172a] outline-none appearance-none cursor-pointer"
                    >
                      {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 ml-6 italic">Price Point ($)</label>
                    <input 
                      name="price"
                      type="number" 
                      step="0.01"
                      value={editingProduct?.price || ''} 
                      onChange={handleChange} 
                      placeholder="42" 
                      className="w-full p-8 bg-[#f8fafc] rounded-[40px] text-[13px] font-black tracking-widest text-[#0f172a] focus:ring-4 focus:ring-rose-500/5 transition-all outline-none" 
                      required 
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 ml-6 italic">Initial Reserve</label>
                    <input 
                      name="stock"
                      type="number" 
                      value={editingProduct?.stock || ''} 
                      onChange={handleChange} 
                      placeholder="45" 
                      className="w-full p-8 bg-[#f8fafc] rounded-[40px] text-[13px] font-black tracking-widest text-[#0f172a] focus:ring-4 focus:ring-rose-500/5 transition-all outline-none" 
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 ml-6 italic">Direct Asset Mapping (URL)</label>
                    <div className="relative">
                      <LinkIcon size={18} className="absolute left-8 top-1/2 -translate-y-1/2 text-rose-500/30" />
                      <input 
                        name="image"
                        type="url"
                        value={editingProduct?.image || ''} 
                        onChange={handleChange} 
                        placeholder="HTTPS://IMAGES.UNSPLASH.COM/..." 
                        className="w-full pl-20 pr-8 py-8 bg-rose-50/30 rounded-[40px] text-[12px] font-bold text-[#0f172a] focus:ring-4 focus:ring-rose-500/10 transition-all outline-none border border-rose-100/50" 
                      />
                    </div>
                </div>
              </div>
            </div>

            <div className="flex gap-10 mt-20">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="flex-1 py-10 bg-[#f1f5f9] text-[#0f172a] rounded-[50px] font-black uppercase tracking-[0.5em] text-[12px] hover:bg-slate-200 transition-all active:scale-95"
              >
                Discard Draft
              </button>
              <button 
                type="submit" 
                disabled={saving || isUploading} 
                className="flex-1 py-10 bg-[#0f172a] text-white rounded-[50px] font-black uppercase tracking-[0.5em] text-[12px] hover:bg-[#1e293b] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-6 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
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