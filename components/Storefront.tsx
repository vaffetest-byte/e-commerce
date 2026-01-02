
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ShoppingBag, Menu, X, Sparkles, Loader2, ArrowUpRight, Search, Instagram, ChevronRight, ArrowRight, RefreshCw, Command } from 'lucide-react';
import { Product } from '../types';
import { getFashionAdvice, getTrendRadar, getSearchCuration } from '../geminiService';
import { inventoryService } from '../services/inventoryService';
import Footer from './Footer';

interface StorefrontProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onNavigateToCatalog: () => void;
  onNavigateToManifesto: () => void;
  onNavigateToLab: () => void;
}

const Storefront: React.FC<StorefrontProps> = ({ products, setProducts, onNavigateToCatalog, onNavigateToManifesto, onNavigateToLab }) => {
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stylingAdvice, setStylingAdvice] = useState<Record<string, string>>({});
  const [loadingAdvice, setLoadingAdvice] = useState<string | null>(null);
  const [trendAlert, setTrendAlert] = useState<string>("");
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [aiSearchInsight, setAiSearchInsight] = useState<string | null>(null);
  const [isAiCurating, setIsAiCurating] = useState(false);
  const overlaySearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedCart = localStorage.getItem('seoul_muse_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
    
    const fetchTrend = async () => {
      const trend = await getTrendRadar();
      setTrendAlert(trend);
    };
    fetchTrend();
  }, []);

  // Registry Revalidation
  useEffect(() => {
    if (products.length > 0 && cart.length > 0) {
      const validProductIds = new Set(products.map(p => p.id));
      const validatedCart = cart.filter(item => validProductIds.has(item.id));
      
      if (validatedCart.length !== cart.length) {
        setIsSyncing(true);
        setCart(validatedCart);
        setTimeout(() => setIsSyncing(false), 2000);
      }
    }
  }, [products]);

  useEffect(() => {
    localStorage.setItem('seoul_muse_cart', JSON.stringify(cart));
  }, [cart]);

  // AI Search Intelligence Trigger
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (searchQuery.length > 3) {
        setIsAiCurating(true);
        const insight = await getSearchCuration(searchQuery);
        setAiSearchInsight(insight);
        setIsAiCurating(false);
      } else {
        setAiSearchInsight(null);
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query) ||
      (p.collection && p.collection.toLowerCase().includes(query))
    );
  }, [searchQuery, products]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert("Artifact archived: Out of stock.");
      return;
    }
    setCart(prev => [...prev, { ...product, cartId: Date.now() }]);
    setIsCartOpen(true);
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
        items: cart.map(i => ({ productId: i.id, name: i.name, quantity: 1, price: i.price })),
        total,
        customerName: 'Muse Resident',
        customerEmail: 'resident@seoulmuse.com'
      });
      setCart([]);
      setIsCartOpen(false);
      const updated = await inventoryService.getProducts();
      setProducts(updated);
      alert("Acquisition Finalized.");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop'; 
  };

  const openSearch = () => {
    setIsSearchActive(true);
    setTimeout(() => overlaySearchInputRef.current?.focus(), 100);
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] text-[#0f172a] selection:bg-rose-600 selection:text-white pb-0 relative">
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
                  onClick={() => { onNavigateToCatalog(); setIsMobileMenuOpen(false); }} 
                  className="serif text-5xl italic font-light text-left hover:text-rose-600 transition-colors transform hover:translate-x-4 duration-500"
                >
                  The Archives
                </button>
                <button 
                  onClick={() => { onNavigateToManifesto(); setIsMobileMenuOpen(false); }} 
                  className="serif text-5xl italic font-light text-left hover:text-rose-600 transition-colors transform hover:translate-x-4 duration-500"
                >
                  Manifesto
                </button>
                <button 
                  onClick={() => { onNavigateToLab(); setIsMobileMenuOpen(false); }} 
                  className="serif text-5xl italic font-light text-left hover:text-rose-600 transition-colors transform hover:translate-x-4 duration-500"
                >
                  Experimental Lab
                </button>
              </div>
            </div>
            <div className="mt-auto border-t border-black/5 pt-12">
               <span className="text-[9px] font-black uppercase tracking-[0.4em] text-black/20 block mb-4">Seoul Muse // Seongsu-dong</span>
               <p className="serif text-xl italic text-black/40">Redefining the space around the body.</p>
            </div>
          </div>
        </div>
      )}

      {/* Search Overlay Responsive */}
      {isSearchActive && (
        <div className="fixed inset-0 z-[600] bg-white/95 backdrop-blur-3xl animate-in fade-in duration-500 flex flex-col p-6 md:p-20 overflow-hidden">
          <div className="max-w-7xl mx-auto w-full flex flex-col h-full">
            <div className="flex justify-between items-center mb-10 md:mb-16">
              <div className="flex items-center gap-4 md:gap-6">
                 <Command size={20} className="text-rose-500" />
                 <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-black/20 italic">Curated Registry / Semantic Search</span>
              </div>
              <button 
                onClick={() => setIsSearchActive(false)}
                className="p-3 md:p-4 hover:bg-slate-50 rounded-full transition-all group"
              >
                <X size={24} md:size={32} strokeWidth={1} className="group-hover:rotate-90 transition-transform duration-500" />
              </button>
            </div>

            <div className="relative mb-12 md:mb-20 group">
              <Search className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-black/10 group-focus-within:text-rose-500 transition-colors" size={24} md:size={32} strokeWidth={1.5} />
              <input 
                ref={overlaySearchInputRef}
                type="text"
                placeholder="AESTHETIC QUERY"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 md:pl-24 pr-4 md:pr-10 py-6 md:py-10 bg-transparent border-b border-black/5 focus:border-rose-500 outline-none text-2xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter placeholder:text-black/5 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-20 flex-1 overflow-y-auto no-scrollbar">
              <div className="lg:col-span-4 space-y-8 md:space-y-12">
                <div className="p-8 md:p-12 bg-black text-white rounded-[40px] md:rounded-[60px] shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl pointer-events-none" />
                  <div className="flex items-center gap-4 mb-6 md:mb-8">
                    <Sparkles size={16} md:size={20} className="text-rose-500" />
                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Muse Stylist Insight</span>
                  </div>
                  <div className="min-h-[100px] md:min-h-[140px] flex flex-col justify-center">
                    {isAiCurating ? (
                      <div className="flex items-center gap-4 text-white/30 italic text-sm">
                        <Loader2 size={14} className="animate-spin" />
                        Analyzing...
                      </div>
                    ) : (
                      <p className="serif text-lg md:text-2xl italic leading-relaxed text-white/90">
                        {aiSearchInsight || (searchQuery ? "Our AI is curating..." : "What is the mood of your archive today?")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4 md:space-y-6">
                   <h4 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-black/20">Trending Moods</h4>
                   <div className="flex flex-wrap gap-2 md:gap-3">
                      {['Seongsu Industrial', 'Cheongdam Chic', 'Minimalist', 'Silk Draping'].map(mood => (
                        <button 
                          key={mood}
                          onClick={() => setSearchQuery(mood)}
                          className="px-4 md:px-6 py-2 md:py-3 rounded-full border border-black/5 hover:border-rose-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all hover:bg-rose-50"
                        >
                          {mood}
                        </button>
                      ))}
                   </div>
                </div>
              </div>

              <div className="lg:col-span-8 pb-40">
                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10">
                    {searchResults.map((p, idx) => (
                      <div 
                        key={p.id} 
                        onClick={() => { addToCart(p); setIsSearchActive(false); }}
                        className="flex gap-6 md:gap-8 items-center bg-slate-50/50 p-4 md:p-6 rounded-[30px] md:rounded-[40px] hover:bg-white hover:shadow-2xl transition-all border border-transparent hover:border-rose-100 group cursor-pointer animate-in fade-in slide-in-from-bottom-8 fill-mode-forwards"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="w-20 h-28 md:w-24 md:h-32 rounded-[18px] md:rounded-[24px] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700 shadow-md shrink-0">
                          <img src={p.image} className="w-full h-full object-cover" alt={p.name} onError={handleImageError} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest block mb-1">{p.category}</span>
                          <h4 className="serif text-xl md:text-3xl italic leading-tight mb-2 truncate group-hover:text-rose-600 transition-colors">{p.name}</h4>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold tracking-tighter opacity-30">$ {p.price}</span>
                            <ArrowRight size={16} className="text-rose-500 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full py-20 flex flex-col items-center justify-center text-center opacity-10">
                    <Search size={80} md:size={120} strokeWidth={0.5} className="mb-6" />
                    <p className="serif text-2xl md:text-4xl italic">Archive empty.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editorial Navigation Responsive */}
      <nav className="fixed top-0 w-full z-[100] h-20 md:h-28 flex items-center px-6 md:px-20 justify-between bg-white/60 backdrop-blur-xl border-b border-black/[0.02]">
        <div className="flex items-center gap-12 md:gap-20">
            <div className="flex flex-col group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                <span className="serif text-2xl md:text-4xl font-bold tracking-tighter leading-none">Seoul Muse</span>
            </div>
            <div className="hidden lg:flex items-center gap-14 uppercase text-[10px] font-black tracking-[0.4em] text-black/30">
                <button onClick={onNavigateToCatalog} className="hover:text-rose-500 transition-colors uppercase">The Archives</button>
                <button onClick={onNavigateToManifesto} className="hover:text-rose-500 transition-colors uppercase">Manifesto</button>
                <button onClick={onNavigateToLab} className="hover:text-rose-500 transition-colors uppercase">Lab</button>
            </div>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 md:gap-10">
            <div 
              onClick={openSearch}
              className="hidden sm:flex items-center gap-4 px-6 py-2 rounded-full border border-black/[0.03] bg-black/[0.02] cursor-pointer hover:bg-white hover:shadow-sm transition-all w-48"
            >
                <Search size={16} strokeWidth={2} className="text-black/20" />
                <span className="text-[10px] font-black tracking-[0.2em] text-black/20">SEARCH</span>
            </div>
            <div className="sm:hidden cursor-pointer p-2" onClick={openSearch}>
                <Search size={22} strokeWidth={1.2} />
            </div>
            <div className="relative cursor-pointer group p-2" onClick={() => setIsCartOpen(true)}>
                <ShoppingBag size={22} strokeWidth={1.2} className="group-hover:text-rose-600 transition-colors" />
                {cart.length > 0 && (
                    <span className="absolute top-1 right-1 bg-rose-600 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full">
                        {cart.length}
                    </span>
                )}
            </div>
            {/* Working Sandwich Button */}
            <Menu 
              className="lg:hidden cursor-pointer hover:text-rose-600 transition-colors" 
              size={22} 
              strokeWidth={1.2} 
              onClick={() => setIsMobileMenuOpen(true)}
            />
        </div>
      </nav>

      {/* Hero Section Responsive */}
      <section className="relative min-h-screen flex items-center px-6 md:px-20 pt-32 pb-20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] text-[10rem] sm:text-[15rem] md:text-[35rem] font-bold serif leading-none select-none pointer-events-none z-0">
          MUSE
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 items-center w-full relative z-10">
            <div className="lg:col-span-5 flex flex-col items-start stagger-in">
                <div className="flex items-center gap-4 mb-8 md:mb-12">
                    <span className="h-[1px] w-8 md:w-14 bg-rose-500" />
                    <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-rose-500">Collection No. 04</span>
                </div>
                <h1 className="serif text-5xl sm:text-6xl md:text-[9.5rem] leading-[0.9] sm:leading-[0.85] mb-10 md:mb-14">
                    <span className="font-light italic tracking-tight block">Seoul</span>
                    <span className="font-bold tracking-tighter block mt-4 md:mt-6">Metamorphosis</span>
                </h1>
                <p className="max-w-md text-black/40 font-medium leading-relaxed mb-12 md:mb-20 text-base sm:text-lg md:text-xl italic serif">
                  An exploration of industrial structure and soft draping. Designed in Seongsu-dong.
                </p>
                <button 
                  onClick={onNavigateToCatalog}
                  className="w-full sm:w-auto bg-black text-white px-10 md:px-16 py-6 md:py-8 rounded-full font-black uppercase text-[10px] md:text-[11px] tracking-[0.4em] hover:bg-rose-600 transition-all flex items-center justify-center gap-6 md:gap-10 group shadow-2xl"
                >
                    Explore Exhibit <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
            </div>

            <div className="lg:col-span-7 relative flex items-center justify-center lg:justify-end">
                <div className="relative aspect-[4/5] w-full max-w-[500px] lg:max-w-[640px] rounded-[60px] sm:rounded-[100px] md:rounded-[180px] overflow-hidden shadow-2xl border-[4px] md:border-[6px] border-white group">
                    <img 
                        src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=2000&auto=format&fit=crop" 
                        alt="Editorial Visual"
                        onError={handleImageError}
                        className="w-full h-full object-cover transition-transform duration-[6s] group-hover:scale-110 ease-out"
                    />
                </div>
            </div>
        </div>
      </section>

      {/* Featured Grid Responsive */}
      <section className="px-6 md:px-20 py-16 md:py-24 bg-white">
        <div className="mb-16 md:mb-48">
            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.6em] text-rose-500 block mb-6 italic">Artifact Highlights</span>
            <h2 className="serif text-4xl sm:text-6xl md:text-[11rem] italic leading-tight sm:leading-none overflow-hidden">
               <span className="block hover:translate-x-6 transition-transform duration-1000">Current</span>
               <span className="font-bold not-italic tracking-tighter block ml-4 sm:ml-60">Artifacts</span>
            </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-16 md:gap-y-72 gap-x-16">
            {products.slice(0, 4).map((product, idx) => {
                const isLeft = idx % 2 === 0;
                return (
                    <div key={product.id} className={`group relative flex flex-col ${isLeft ? 'items-start' : 'items-end md:mt-32'}`}>
                        <div className="relative aspect-[3/4] w-full max-w-xl rounded-[40px] sm:rounded-[60px] md:rounded-[120px] overflow-hidden shadow-xl bg-[#F9F8F6] border border-black/[0.03] flex items-center justify-center">
                            <img 
                                src={product.image} 
                                alt={product.name} 
                                onError={handleImageError}
                                className={`w-full h-full object-cover transition-all duration-[3s] ${product.stock <= 0 ? 'grayscale opacity-50' : ''}`}
                            />
                            <div className="absolute inset-x-6 md:inset-x-12 bottom-6 md:bottom-12 md:translate-y-10 md:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-1000">
                                <button 
                                    onClick={() => addToCart(product)}
                                    className="w-full bg-white text-black py-4 sm:py-6 md:py-8 rounded-full font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-[10px] md:text-[11px] hover:bg-rose-600 hover:text-white transition-all shadow-3xl"
                                >
                                    Acquire — ${product.price}
                                </button>
                            </div>
                        </div>

                        <div className={`mt-8 md:mt-10 px-4 w-full max-w-lg ${!isLeft ? 'text-right' : ''}`}>
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-rose-500 italic block mb-2">{product.category}</span>
                            <h3 className="serif text-3xl sm:text-4xl md:text-6xl font-light italic leading-none group-hover:text-rose-600 transition-colors duration-700">
                                {product.name}
                            </h3>
                        </div>
                    </div>
                );
            })}
        </div>
      </section>

      {/* Cart Drawer Responsive */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[700] flex justify-end">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-1000" onClick={() => setIsCartOpen(false)} />
            <div className="relative w-full max-w-xl bg-white h-full shadow-3xl p-6 sm:p-8 md:p-28 flex flex-col animate-in slide-in-from-right duration-700">
                <div className="flex justify-between items-center mb-8 sm:mb-16 md:mb-32">
                    <h2 className="serif text-4xl sm:text-5xl md:text-7xl italic leading-none">Your <br/><span className="font-bold not-italic tracking-tighter text-rose-600">Collection</span></h2>
                    <button onClick={() => setIsCartOpen(false)} className="group p-2 sm:p-3 md:p-5 rounded-full border border-black/5 hover:border-rose-500 transition-all">
                        <X size={24} md:size={36} strokeWidth={1} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-8 sm:space-y-12 md:space-y-20 no-scrollbar">
                    {cart.map((item) => (
                        <div key={item.cartId} className="flex gap-4 sm:gap-6 md:gap-12 items-center group animate-in slide-in-from-bottom-6">
                            <div className="w-16 h-24 sm:w-20 sm:h-28 md:w-32 md:h-44 rounded-[20px] sm:rounded-[30px] md:rounded-[50px] overflow-hidden shadow-2xl grayscale group-hover:grayscale-0 transition-all">
                                <img src={item.image} className="w-full h-full object-cover" alt={item.name} onError={handleImageError} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1 sm:mb-2">
                                    <h4 className="font-black text-[9px] sm:text-[10px] uppercase tracking-[0.3em] opacity-30 truncate">{item.name}</h4>
                                    <button onClick={() => removeFromCart(item.cartId)} className="text-rose-500 p-1"><X size={14}/></button>
                                </div>
                                <p className="serif text-xl sm:text-2xl md:text-4xl italic text-rose-600">${item.price}</p>
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center opacity-10 italic grayscale text-center">
                            <ShoppingBag size={80} strokeWidth={0.3} className="mb-8" />
                            <p className="serif text-2xl sm:text-3xl">Archive Empty.</p>
                        </div>
                    )}
                </div>
                <div className="pt-8 md:pt-24 mt-4 sm:mt-8 border-t border-black/[0.04]">
                    <div className="flex justify-between items-center mb-6 sm:mb-10 md:mb-20">
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] opacity-30 italic">Total Value</span>
                        <span className="serif text-3xl sm:text-4xl md:text-6xl font-bold tracking-tighter text-rose-600">${cart.reduce((a, b) => a + b.price, 0).toFixed(2)}</span>
                    </div>
                    <button 
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || isProcessingCheckout}
                        className="w-full bg-black text-white py-5 sm:py-6 md:py-10 rounded-full font-black text-[10px] sm:text-[11px] uppercase tracking-[0.5em] hover:bg-rose-600 transition-all shadow-3xl flex items-center justify-center gap-4 disabled:bg-slate-300"
                    >
                        {isProcessingCheckout && <Loader2 className="animate-spin" size={18} />}
                        {isProcessingCheckout ? 'Fulfilling...' : 'Acquire Collection'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Editorial Footer */}
      <Footer 
        onNavigateToCatalog={onNavigateToCatalog} 
        onNavigateToManifesto={onNavigateToManifesto} 
        onNavigateToLab={onNavigateToLab} 
      />
    </div>
  );
};

export default Storefront;
