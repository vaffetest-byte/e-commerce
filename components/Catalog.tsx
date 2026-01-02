
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, Menu, X, Sparkles, Loader2, 
  ArrowUpRight, Search, ChevronRight, SlidersHorizontal,
  ArrowRight, Info, Eye
} from 'lucide-react';
import { Product } from '../types';
import { getFashionAdvice, getTrendRadar, generateProductDescription } from '../geminiService';
import { inventoryService } from '../services/inventoryService';
import Footer from './Footer';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    <div className="min-h-screen bg-[#fdfcfb] text-[#0f172a] selection:bg-rose-600 selection:text-white pb-0">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[800] lg:hidden animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-white/98 backdrop-blur-3xl" />
          <div className="relative h-full flex flex-col p-8 pt-32">
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-6 right-6 p-4 hover:bg-slate-50 rounded-full transition-all group"
            >
              <X size={32} strokeWidth={1} className="group-hover:rotate-90 transition-transform duration-500" />
            </button>
            <div className="space-y-12 stagger-in">
              <span className="text-[10px] font-black uppercase tracking-[1em] text-rose-500 block mb-4 italic">Navigation Registry</span>
              <div className="flex flex-col gap-10">
                <button 
                  onClick={() => { onNavigateToHome(); setIsMobileMenuOpen(false); }} 
                  className="serif text-6xl italic font-light text-left hover:text-rose-600 transition-colors transform hover:translate-x-4 duration-500"
                >
                  Home Office
                </button>
                <button 
                  onClick={() => { onNavigateToManifesto(); setIsMobileMenuOpen(false); }} 
                  className="serif text-6xl italic font-light text-left hover:text-rose-600 transition-colors transform hover:translate-x-4 duration-500"
                >
                  Manifesto
                </button>
                <button 
                  onClick={() => { onNavigateToLab(); setIsMobileMenuOpen(false); }} 
                  className="serif text-6xl italic font-light text-left hover:text-rose-600 transition-colors transform hover:translate-x-4 duration-500"
                >
                  Experimental Lab
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editorial Navigation Responsive */}
      <nav className="fixed top-0 w-full z-[100] h-20 md:h-32 flex items-center px-6 md:px-20 justify-between bg-white/70 backdrop-blur-2xl border-b border-black/[0.03]">
        <div className="flex items-center gap-12 md:gap-24">
            <div className="flex flex-col group cursor-pointer" onClick={onNavigateToHome}>
                <span className="serif text-2xl md:text-5xl font-bold tracking-tighter leading-none">Seoul Muse</span>
                <span className="hidden sm:block text-[8px] font-black uppercase tracking-[0.8em] text-black/20 mt-1">Archive No. 2026</span>
            </div>
            <div className="hidden lg:flex items-center gap-16 uppercase text-[9px] font-black tracking-[0.5em] text-black/30">
                <button onClick={() => setIsMobileMenuOpen(true)} className="flex items-center gap-3 hover:text-rose-500 transition-colors uppercase">
                  <SlidersHorizontal size={14} /> Matrix
                </button>
                <button onClick={onNavigateToManifesto} className="hover:text-rose-500 transition-colors uppercase">Manifesto</button>
                <button onClick={onNavigateToLab} className="hover:text-rose-500 transition-colors uppercase">Lab</button>
            </div>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 md:gap-12">
            <button className="relative p-2 group" onClick={() => setIsCartOpen(true)}>
                <ShoppingBag size={24} strokeWidth={1} className="group-hover:text-rose-600 transition-colors" />
                {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[8px] font-black w-5 h-5 flex items-center justify-center rounded-full">
                        {cart.length}
                    </span>
                )}
            </button>
            <button className="p-2" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu size={24} strokeWidth={1} />
            </button>
        </div>
      </nav>

      {/* Catalog Hero Responsive */}
      <header className="relative pt-32 sm:pt-40 md:pt-64 pb-12 sm:pb-20 md:pb-32 px-6 md:px-20 overflow-hidden text-center bg-[#fdfcfb]">
        <div className="max-w-7xl mx-auto stagger-in">
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.5em] md:tracking-[0.8em] text-black/20 block mb-6 sm:mb-8 md:mb-12 uppercase">Seoul Designed silhouettes.</span>
          <h1 className="serif text-5xl sm:text-6xl md:text-[12rem] leading-[0.9] italic tracking-tighter mb-6 sm:mb-8 md:mb-12">
            The <span className="not-italic font-bold">Collection</span>
          </h1>
          <p className="max-w-2xl mx-auto text-black/40 text-base sm:text-lg md:text-2xl leading-relaxed serif italic">
            An exploration of contemporary form and industrial texture. Each piece is a numbered entry in our evolving archive.
          </p>
        </div>
      </header>

      {/* Grid Filter Bar Responsive */}
      <div className="sticky top-20 sm:top-24 md:top-32 z-[90] px-4 md:px-20 py-4 md:py-8 pointer-events-none">
        <div className="max-w-fit mx-auto bg-white/80 backdrop-blur-xl rounded-full border border-black/[0.05] p-1.5 md:p-2 flex items-center gap-1 md:gap-2 pointer-events-auto shadow-sm overflow-x-auto no-scrollbar max-w-[90vw]">
          {['All', 'Tops', 'Dresses', 'Skirts'].map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 sm:px-5 md:px-8 py-2 md:py-3 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-black text-white shadow-xl' : 'text-black/30 hover:bg-slate-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid Responsive */}
      <section className="px-6 md:px-20 pt-8 sm:pt-10 md:pt-20 pb-40 md:pb-60">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 sm:gap-x-8 md:gap-x-12 gap-y-12 sm:gap-y-24 md:gap-y-48">
          {filteredProducts.map((product, idx) => {
            const isAsymmetric = idx % 5 === 2;
            return (
              <div 
                key={product.id} 
                className={`group flex flex-col items-start cursor-pointer animate-in fade-in duration-1000 ${isAsymmetric ? 'md:mt-32' : ''}`}
                onClick={() => openQuickView(product)}
              >
                <div className="relative w-full aspect-[4/5] bg-slate-50 overflow-hidden mb-6 md:mb-12 rounded-[2px] shadow-sm">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    onError={handleImageError}
                    className="w-full h-full object-cover grayscale md:hover:grayscale-0 transition-all duration-[2s]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center sm:opacity-0 group-hover:opacity-100 transition-all">
                    <div className="bg-white/90 backdrop-blur-md px-6 md:px-10 py-3 md:py-5 rounded-full flex items-center gap-3 md:gap-4 shadow-2xl">
                      <Eye size={14} className="text-rose-500 md:w-4 md:h-4" />
                      <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em]">Observe</span>
                    </div>
                  </div>
                  {product.stock === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm">
                      <span className="text-[9px] font-black uppercase tracking-[0.4em] text-black/40">Archived</span>
                    </div>
                  )}
                </div>

                <div className="w-full px-1">
                  <div className="flex justify-between items-baseline mb-2 md:mb-4">
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-rose-500 italic opacity-60">{product.category}</span>
                    <span className="text-[9px] font-bold text-black/10 tracking-widest">{product.sku}</span>
                  </div>
                  <h3 className="serif text-3xl sm:text-4xl md:text-5xl italic font-light leading-none mb-3 md:mb-4 group-hover:translate-x-2 transition-transform duration-700">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between border-b border-black/5 pb-4 md:pb-6">
                    <p className="text-base sm:text-lg md:text-xl font-medium tracking-tighter text-black/30">${product.price.toFixed(2)}</p>
                    <ArrowRight size={14} className="text-black/5 md:w-4 md:h-4 group-hover:text-rose-500 transition-all group-hover:translate-x-2" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="py-24 sm:py-40 md:py-80 text-center max-w-4xl mx-auto px-6">
          <div className="w-12 sm:w-16 md:w-20 h-[1px] bg-black/10 mx-auto mb-10 sm:mb-12 md:mb-20" />
          <h2 className="serif text-3xl sm:text-4xl md:text-8xl italic font-light leading-snug tracking-tight text-black/80">
            "Form follows <span className="font-bold not-italic">emotion</span>."
          </h2>
          <div className="mt-8 sm:mt-12 flex flex-col items-center gap-4">
            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-black/20">Designed in Seongsu-dong.</span>
          </div>
        </div>
      </section>

      {/* Quick View Modal Responsive */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-3xl animate-in fade-in duration-700" onClick={() => setSelectedProduct(null)} />
          <div className="relative bg-white w-full max-w-[1200px] h-[90vh] md:h-auto md:max-h-[90vh] overflow-y-auto rounded-[8px] shadow-3xl border border-black/[0.03] animate-in zoom-in-95 duration-700 flex flex-col md:flex-row no-scrollbar">
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 sm:top-6 right-4 sm:right-6 z-50 p-2 sm:p-3 hover:bg-slate-50 rounded-full transition-all"
            >
              <X size={20} strokeWidth={1} className="sm:w-6 sm:h-6" />
            </button>

            <div className="md:w-1/2 min-h-[40vh] md:min-h-0 bg-slate-100 overflow-hidden">
              <img 
                src={selectedProduct.image} 
                alt={selectedProduct.name}
                onError={handleImageError}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="md:w-1/2 p-6 sm:p-8 md:p-20 flex flex-col justify-center">
              <div className="mb-6 sm:mb-10 md:mb-16">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 block mb-3 sm:mb-4 italic">Catalog Entry</span>
                <h2 className="serif text-3xl sm:text-5xl md:text-7xl italic font-light leading-tight mb-4 sm:mb-6">{selectedProduct.name}</h2>
                <span className="text-2xl sm:text-3xl font-bold tracking-tighter text-slate-300">$ {selectedProduct.price.toFixed(2)}</span>
              </div>

              <div className="space-y-6 sm:space-y-8 mb-8 sm:mb-12">
                <div className="relative pl-6">
                  <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/20" />
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-black/20 mb-2 uppercase">Poetic Registry</p>
                  <p className="serif text-lg sm:text-xl md:text-2xl italic leading-relaxed text-black/60">
                    {loadingAction === selectedProduct.id ? 'Loading...' : (productDesc[selectedProduct.id] || 'Structural elegance.')}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => addToCart(selectedProduct)}
                  disabled={selectedProduct.stock <= 0}
                  className="flex-1 bg-black text-white py-5 sm:py-6 md:py-8 rounded-full font-black uppercase tracking-[0.4em] text-[10px] md:text-[11px] hover:bg-rose-600 transition-all shadow-xl flex items-center justify-center gap-4 disabled:opacity-20"
                >
                  <ShoppingBag size={18} /> Add to Archive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editorial Footer */}
      <Footer 
        onNavigateToCatalog={() => {}} 
        onNavigateToManifesto={onNavigateToManifesto} 
        onNavigateToLab={onNavigateToLab} 
      />
    </div>
  );
};

export default Catalog;
