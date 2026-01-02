import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, Menu, X, Sparkles, Loader2, 
  ArrowUpRight, Search, ChevronRight, SlidersHorizontal,
  ArrowRight, Info, Eye
} from 'lucide-react';
import { Product } from '../types';
import { getFashionAdvice, getTrendRadar, generateProductDescription } from '../geminiService';
import { inventoryService } from '../services/inventoryService';

interface CatalogProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onNavigateToHome: () => void;
  onNavigateToManifesto: () => void;
  onNavigateToLab: () => void;
}

const Catalog: React.FC<CatalogProps> = ({ products, setProducts, onNavigateToHome, onNavigateToManifesto, onNavigateToLab }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeCollection, setActiveCollection] = useState('All');
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productAdvice, setProductAdvice] = useState<Record<string, string>>({});
  const [productDesc, setProductDesc] = useState<Record<string, string>>({});
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('seoul_muse_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('seoul_muse_cart', JSON.stringify(cart));
  }, [cart]);

  // Dynamically extract unique collections from products
  const availableCollections = useMemo(() => {
    const cols = new Set<string>();
    products.forEach(p => {
      if (p.collection) cols.add(p.collection);
    });
    return ['All', ...Array.from(cols)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const catMatch = activeCategory === 'All' || p.category === activeCategory;
      const colMatch = activeCollection === 'All' || p.collection === activeCollection;
      return catMatch && colMatch;
    });
  }, [products, activeCategory, activeCollection]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart(prev => [...prev, { ...product, cartId: Date.now() }]);
    setIsCartOpen(true);
    setSelectedProduct(null);
  };

  const removeFromCart = (cartId: number) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessingCheckout(true);
    try {
      const total = cart.reduce((sum, item) => sum + item.price, 0);
      await inventoryService.placeOrder({
        items: cart.map(item => ({ productId: item.id, name: item.name, quantity: 1, price: item.price })),
        total,
        customerName: 'Muse Resident',
        customerEmail: 'resident@seoulmuse.com'
      });
      setCart([]);
      setIsCartOpen(false);
      const updated = await inventoryService.getProducts();
      setProducts(updated);
      alert("Artifact Acquisition Complete.");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const openQuickView = async (product: Product) => {
    setSelectedProduct(product);
    if (!productDesc[product.id] || !productAdvice[product.id]) {
      setLoadingAction(product.id);
      const [desc, advice] = await Promise.all([
        generateProductDescription(product.name, product.category),
        getFashionAdvice(product.name)
      ]);
      setProductDesc(prev => ({ ...prev, [product.id]: desc }));
      setProductAdvice(prev => ({ ...prev, [product.id]: advice }));
      setLoadingAction(null);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop';
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] text-[#0f172a] selection:bg-rose-600 selection:text-white pb-32">
      {/* Editorial Navigation */}
      <nav className="fixed top-0 w-full z-[100] h-32 flex items-center px-8 md:px-20 justify-between bg-white/70 backdrop-blur-2xl border-b border-black/[0.03]">
        <div className="flex items-center gap-24">
            <div className="flex flex-col group cursor-pointer" onClick={onNavigateToHome}>
                <span className="serif text-5xl font-bold tracking-tighter leading-none">Seoul Muse</span>
                <span className="text-[8px] font-black uppercase tracking-[0.8em] text-black/20 mt-1">Archive No. 2026</span>
            </div>
            <div className="hidden lg:flex items-center gap-16 uppercase text-[9px] font-black tracking-[0.5em] text-black/30">
                <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-3 hover:text-rose-500 transition-colors uppercase">
                  <SlidersHorizontal size={14} /> Matrix
                </button>
                <button onClick={onNavigateToManifesto} className="hover:text-rose-500 transition-colors uppercase">Manifesto</button>
                <button onClick={onNavigateToLab} className="hover:text-rose-500 transition-colors uppercase">Lab</button>
            </div>
        </div>
        <div className="flex items-center gap-12">
            <button className="relative p-2 group" onClick={() => setIsCartOpen(true)}>
                <ShoppingBag size={24} strokeWidth={1} className="group-hover:text-rose-600 transition-colors" />
                {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[8px] font-black w-5 h-5 flex items-center justify-center rounded-full">
                        {cart.length}
                    </span>
                )}
            </button>
            <button className="p-2" onClick={() => setIsFilterOpen(true)}>
                <Menu size={24} strokeWidth={1} />
            </button>
        </div>
      </nav>

      {/* Catalog Hero */}
      <header className="relative pt-64 pb-32 px-8 md:px-20 overflow-hidden text-center bg-[#fdfcfb]">
        <div className="max-w-7xl mx-auto stagger-in">
          <span className="text-[10px] font-black uppercase tracking-[0.8em] text-black/20 block mb-12">Curated silhouettes. Designed in Seoul.</span>
          <h1 className="serif text-[8rem] md:text-[12rem] leading-[0.85] italic tracking-tighter mb-12">
            The <span className="not-italic font-bold">Collection</span>
          </h1>
          <p className="max-w-2xl mx-auto text-black/40 text-xl md:text-2xl leading-relaxed serif italic">
            An exploration of contemporary form and industrial texture. Each piece is a numbered entry in our evolving archive.
          </p>
        </div>
      </header>

      {/* Grid Filter Bar (Floating) */}
      <div className="sticky top-32 z-[90] px-8 md:px-20 py-8 pointer-events-none">
        <div className="max-w-fit mx-auto bg-white/80 backdrop-blur-xl rounded-full border border-black/[0.05] p-2 flex items-center gap-2 pointer-events-auto shadow-sm">
          {['All', 'Tops', 'Dresses', 'Skirts'].map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-black text-white shadow-xl' : 'text-black/30 hover:bg-slate-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      <section className="px-8 md:px-20 pt-20 pb-60">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-48">
          {filteredProducts.map((product, idx) => {
            const isAsymmetric = idx % 5 === 2; // Create fashion magazine spacing
            return (
              <div 
                key={product.id} 
                className={`group flex flex-col items-start cursor-pointer animate-in fade-in duration-1000 ${isAsymmetric ? 'md:mt-32' : ''}`}
                onClick={() => openQuickView(product)}
              >
                <div className="relative w-full aspect-[4/5] bg-slate-50 overflow-hidden mb-12 product-card-reveal rounded-[2px]">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    onError={handleImageError}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-[2s]"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.05] transition-colors" />
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                    <div className="bg-white/90 backdrop-blur-md px-10 py-5 rounded-full flex items-center gap-4 shadow-2xl">
                      <Eye size={16} className="text-rose-500" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em]">Observe Piece</span>
                    </div>
                  </div>

                  {product.stock === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm">
                      <span className="text-[10px] font-black uppercase tracking-[0.6em] text-black/40">Archived</span>
                    </div>
                  )}
                </div>

                <div className="w-full px-2">
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-rose-500 italic opacity-60">{product.category}</span>
                    <span className="text-[10px] font-bold text-black/10 tracking-widest">{product.sku}</span>
                  </div>
                  <h3 className="serif text-5xl italic font-light leading-none mb-4 group-hover:translate-x-3 transition-transform duration-700">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between border-b border-black/5 pb-6">
                    <p className="text-xl font-medium tracking-tighter text-black/30">${product.price.toFixed(2)}</p>
                    <ArrowRight size={16} className="text-black/5 group-hover:text-rose-500 transition-all group-hover:translate-x-2" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Editorial Break Section */}
        <div className="py-80 text-center max-w-4xl mx-auto px-8">
          <div className="w-20 h-[1px] bg-black/10 mx-auto mb-20" />
          <h2 className="serif text-6xl md:text-8xl italic font-light leading-snug tracking-tight text-black/80">
            "Form follows <span className="font-bold not-italic">emotion</span>."
          </h2>
          <div className="mt-20 flex flex-col items-center gap-6">
            <span className="text-[10px] font-black uppercase tracking-[0.8em] text-black/20">Designed in Seongsu-dong. Made for the world.</span>
            <Sparkles size={24} className="text-rose-500/20" />
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 md:p-10">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-3xl animate-in fade-in duration-700" onClick={() => setSelectedProduct(null)} />
          <div className="relative bg-white w-full max-w-[1200px] max-h-[90vh] overflow-y-auto rounded-[4px] shadow-3xl border border-black/[0.03] animate-in zoom-in-95 duration-700 flex flex-col lg:flex-row no-scrollbar">
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-8 right-8 z-50 p-4 hover:bg-slate-50 rounded-full transition-all"
            >
              <X size={28} strokeWidth={1} />
            </button>

            <div className="lg:w-1/2 aspect-[4/5] lg:aspect-auto h-full bg-slate-100 overflow-hidden">
              <img 
                src={selectedProduct.image} 
                alt={selectedProduct.name}
                onError={handleImageError}
                className="w-full h-full object-cover animate-in fade-in duration-1000"
              />
            </div>

            <div className="lg:w-1/2 p-12 md:p-24 flex flex-col justify-center">
              <div className="mb-16">
                <span className="text-[11px] font-black uppercase tracking-[0.6em] text-rose-500 block mb-6 italic">{selectedProduct.category} Catalog Entry</span>
                <h2 className="serif text-7xl italic font-light leading-none mb-8">{selectedProduct.name}</h2>
                {selectedProduct.collection && (
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-4 block">Part of the {selectedProduct.collection}</span>
                )}
                <div className="flex items-center gap-10">
                  <span className="text-4xl font-bold tracking-tighter text-slate-300">$ {selectedProduct.price.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-12 mb-20">
                <div className="relative pl-8">
                  <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/20" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20 mb-4 flex items-center gap-3">
                    <Info size={14} /> Poetic Registry
                  </p>
                  <p className="serif text-2xl italic leading-relaxed text-black/60">
                    {loadingAction === selectedProduct.id ? 'Loading archives...' : (productDesc[selectedProduct.id] || 'A masterclass in structural elegance.')}
                  </p>
                </div>

                <div className="bg-[#fdfcfb] border border-black/[0.02] p-10 rounded-2xl">
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-black/20 mb-4">Styling Protocol</p>
                  <p className="text-[12px] font-bold uppercase tracking-[0.2em] leading-relaxed text-black/80">
                    {loadingAction === selectedProduct.id ? 'Refining advice...' : (productAdvice[selectedProduct.id] || 'Curating protocol...')}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <button 
                  onClick={() => addToCart(selectedProduct)}
                  disabled={selectedProduct.stock <= 0}
                  className="flex-1 bg-black text-white py-8 rounded-full font-black uppercase tracking-[0.5em] text-[11px] hover:bg-rose-600 transition-all shadow-xl flex items-center justify-center gap-4 disabled:opacity-20"
                >
                  <ShoppingBag size={18} /> Add to Archive
                </button>
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="px-12 py-8 border border-black/5 hover:bg-slate-50 rounded-full font-black uppercase tracking-[0.5em] text-[11px] transition-all"
                >
                  Return to Collection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Side Drawer */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[400] flex justify-end">
            <div className="fixed inset-0 bg-black/10 backdrop-blur-sm transition-opacity duration-1000" onClick={() => setIsFilterOpen(false)} />
            <div className="relative w-full max-w-md bg-white h-full shadow-3xl p-16 md:p-24 flex flex-col animate-in slide-in-from-right duration-700">
                <div className="flex justify-between items-center mb-24">
                    <h2 className="serif text-5xl italic leading-none">Catalog <br/><span className="font-bold not-italic tracking-tighter">Architecture</span></h2>
                    <button onClick={() => setIsFilterOpen(false)} className="p-4 hover:bg-slate-50 rounded-full transition-all">
                        <X size={32} strokeWidth={1} />
                    </button>
                </div>
                
                <div className="space-y-20 flex-1 overflow-y-auto no-scrollbar">
                    <div className="space-y-10">
                      <span className="text-[10px] font-black uppercase tracking-[0.6em] text-black/20 block border-b border-black/5 pb-4">Department</span>
                      <div className="flex flex-col gap-6">
                        {['All', 'Tops', 'Skirts', 'Co-ords', 'Dresses'].map(cat => (
                          <button 
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`flex items-center justify-between py-2 text-left transition-all ${activeCategory === cat ? 'text-rose-500' : 'text-black/40 hover:text-black'}`}
                          >
                            <span className="text-[13px] font-bold uppercase tracking-[0.2em]">{cat}</span>
                            {activeCategory === cat && <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-10">
                      <span className="text-[10px] font-black uppercase tracking-[0.6em] text-black/20 block border-b border-black/5 pb-4">Collection Epoch</span>
                      <div className="flex flex-col gap-6">
                        {availableCollections.map(col => (
                          <button 
                            key={col}
                            onClick={() => setActiveCollection(col)}
                            className={`flex items-center justify-between py-2 text-left transition-all ${activeCollection === col ? 'text-rose-500' : 'text-black/40 hover:text-black'}`}
                          >
                            <span className="text-[13px] font-bold uppercase tracking-[0.2em]">{col}</span>
                            {activeCollection === col && <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />}
                          </button>
                        ))}
                      </div>
                    </div>
                </div>

                <div className="pt-16 border-t border-black/5">
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="w-full bg-black text-white py-8 rounded-full font-black uppercase tracking-[0.6em] text-[10px] shadow-2xl hover:bg-rose-600 transition-all"
                  >
                    Apply Matrix
                  </button>
                </div>
            </div>
        </div>
      )}

      {/* Shared Cart Drawer (Simplified for Catalog) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[500] flex justify-end">
            <div className="fixed inset-0 bg-black/10 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />
            <div className="relative w-full max-w-xl bg-white h-full shadow-3xl p-16 md:p-24 flex flex-col animate-in slide-in-from-right duration-700">
                <div className="flex justify-between items-center mb-24">
                    <h2 className="serif text-6xl italic leading-none">Your <br/><span className="font-bold not-italic tracking-tighter text-rose-600">Archive</span></h2>
                    <button onClick={() => setIsCartOpen(false)} className="p-4 hover:bg-slate-50 rounded-full">
                        <X className="text-black/30" size={32} strokeWidth={1} />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-12 no-scrollbar pr-4">
                    {cart.map((item) => (
                        <div key={item.cartId} className="flex gap-10 items-center animate-in slide-in-from-bottom-6 duration-700">
                            <div className="w-24 h-32 bg-slate-50 overflow-hidden rounded-[2px] shadow-md grayscale hover:grayscale-0 transition-all">
                                <img src={item.image} className="w-full h-full object-cover" alt={item.name} onError={handleImageError} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-black text-[9px] uppercase tracking-[0.4em] opacity-40">{item.name}</h4>
                                    <button onClick={() => removeFromCart(item.cartId)} className="text-black/20 hover:text-rose-600 p-1"><X size={14}/></button>
                                </div>
                                <p className="serif text-3xl italic text-black/80">${item.price}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-20 mt-12 border-t border-black/[0.05]">
                    <div className="flex justify-between items-end mb-16">
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-20">Collective Value</span>
                        <span className="serif text-6xl font-bold tracking-tighter text-black">${cart.reduce((a, b) => a + b.price, 0).toFixed(2)}</span>
                    </div>
                    <button 
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || isProcessingCheckout}
                        className="w-full bg-black text-white py-10 rounded-full font-black text-[11px] uppercase tracking-[0.6em] hover:bg-rose-600 transition-all shadow-2xl flex items-center justify-center gap-6 disabled:opacity-20"
                    >
                        {isProcessingCheckout && <Loader2 className="animate-spin" size={18} />}
                        {isProcessingCheckout ? 'Fulfilling...' : 'Acquire Collection'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;