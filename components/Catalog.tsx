
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShoppingBag, Menu, X, Sparkles, Loader2, 
  ArrowUpRight, Search, ChevronRight, SlidersHorizontal,
  ArrowRight, Info, Eye, CheckCircle2, Hash, LogOut,
  Heart, Filter, Star, ChevronDown, Trash2, Globe
} from 'lucide-react';
import { Product, Customer, InventoryFilters, Currency, Language } from '../types';
import { getFashionAdvice, getTrendRadar, generateProductDescription } from '../geminiService';
import { inventoryService } from '../services/inventoryService';
import { EXCHANGE_RATES, CURRENCY_SYMBOLS, TRANSLATIONS } from '../constants';
import CustomerAuth from './CustomerAuth';
import Footer from './Footer';
import CheckoutProcess from './CheckoutProcess';

interface CatalogProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  currentCustomer: Customer | null;
  onCustomerLogin: (customer: Customer) => void;
  onCustomerLogout: () => void;
  onNavigateToHome: () => void;
  onNavigateToManifesto: () => void;
  onNavigateToLab: () => void;
}

const Catalog: React.FC<CatalogProps> = ({ 
  products, 
  setProducts, 
  currentCustomer,
  onCustomerLogin,
  onCustomerLogout,
  onNavigateToHome, 
  onNavigateToManifesto, 
  onNavigateToLab 
}) => {
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Localization Settings
  const [currency, setCurrency] = useState<Currency>('USD');
  const [lang, setLang] = useState<Language>('EN');
  const [isLocOpen, setIsLocOpen] = useState(false);

  // Advanced Filter States
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'price' | 'name' | 'rating'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [minRating, setMinRating] = useState(0);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productAdvice, setProductAdvice] = useState<Record<string, string>>({});
  const [productDesc, setProductDesc] = useState<Record<string, string>>({});
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [acquisitionSuccess, setAcquisitionSuccess] = useState<string | null>(null);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const savedCart = localStorage.getItem('seoul_muse_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('seoul_muse_cart', JSON.stringify(cart));
  }, [cart]);

  const formatPrice = (usdAmount: number) => {
    const rate = EXCHANGE_RATES[currency] || 1;
    const converted = usdAmount * rate;
    const symbol = CURRENCY_SYMBOLS[currency];
    return currency === 'KRW' ? `${symbol}${Math.round(converted).toLocaleString()}` : `${symbol}${converted.toFixed(2)}`;
  };

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const catMatch = activeCategory === 'All' || p.category === activeCategory;
      const priceMatch = p.price >= priceRange[0] && p.price <= priceRange[1];
      const ratingMatch = (p.rating || 0) >= minRating;
      return catMatch && priceMatch && ratingMatch;
    });

    const order = sortOrder === 'asc' ? 1 : -1;
    result.sort((a: any, b: any) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      if (typeof valA === 'string') return valA.localeCompare(valB) * order;
      return (valA - valB) * order;
    });

    return result;
  }, [products, activeCategory, sortBy, sortOrder, priceRange, minRating]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart(prev => [...prev, { ...product, cartId: Date.now() }]);
    setIsCartOpen(true);
    setSelectedProduct(null);
  };

  const removeFromCart = (cartId: number) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const toggleWishlist = async (id: string) => {
    if (!currentCustomer) {
      setIsAuthOpen(true);
      return;
    }
    await inventoryService.toggleWishlist(currentCustomer.id, id);
    const updated = await inventoryService.authenticateCustomer(currentCustomer.email);
    if (updated) onCustomerLogin(updated);
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

  return (
    <div className="min-h-screen bg-[#fdfcfb] text-[#0f172a] selection:bg-rose-600 selection:text-white pb-0">
      
      {isAuthOpen && (
        <CustomerAuth 
          onSuccess={(c) => { onCustomerLogin(c); setIsAuthOpen(false); }} 
          onClose={() => setIsAuthOpen(false)} 
        />
      )}

      {isLocOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setIsLocOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-[40px] p-12 shadow-3xl animate-in zoom-in-95">
            <h3 className="serif text-3xl italic font-bold mb-10">Matrix <span className="not-italic font-black">Sync.</span></h3>
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Language Protocol</span>
                <div className="grid grid-cols-2 gap-4">
                  {['EN', 'KR'].map(l => (
                    <button key={l} onClick={() => setLang(l as Language)} className={`py-4 rounded-2xl border transition-all text-[10px] font-black ${lang === l ? 'bg-black text-white border-black' : 'border-slate-100 text-slate-400'}`}>{l}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Value Matrix (Currency)</span>
                <div className="grid grid-cols-3 gap-4">
                  {['USD', 'KRW', 'EUR'].map(c => (
                    <button key={c} onClick={() => setCurrency(c as Currency)} className={`py-4 rounded-2xl border transition-all text-[10px] font-black ${currency === c ? 'bg-rose-500 text-white border-rose-500' : 'border-slate-100 text-slate-400'}`}>{c}</button>
                  ))}
                </div>
              </div>
              <button onClick={() => setIsLocOpen(false)} className="w-full bg-black text-white py-6 rounded-full font-black uppercase tracking-widest text-[11px] mt-4">Confirm Registry Sync</button>
            </div>
          </div>
        </div>
      )}

      {isCheckoutOpen && (
        <CheckoutProcess 
          cart={cart} 
          customer={currentCustomer} 
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={(id) => {
             setAcquisitionSuccess(id);
             setIsCheckoutOpen(false);
             setCart([]);
          }}
        />
      )}

      {/* Acquisition Success Overlay */}
      {acquisitionSuccess && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl" onClick={() => setAcquisitionSuccess(null)} />
            <div className="relative bg-white w-full max-w-2xl rounded-[60px] p-12 sm:p-20 text-center shadow-3xl animate-in zoom-in-95 duration-700">
                <div className="w-24 h-24 bg-rose-500 rounded-full mx-auto mb-12 flex items-center justify-center text-white shadow-2xl animate-bounce">
                    <CheckCircle2 size={48} strokeWidth={1} />
                </div>
                <h2 className="serif text-6xl italic font-light tracking-tighter mb-8">Acquisition <span className="font-bold not-italic text-rose-600">Complete.</span></h2>
                <p className="text-xl serif italic text-black/40 mb-16">Stored in Protocol Archive {acquisitionSuccess}. Ready for Dispatch.</p>
                <button onClick={() => setAcquisitionSuccess(null)} className="w-full bg-black text-white py-8 rounded-full font-black uppercase tracking-[0.6em] text-[11px] hover:bg-rose-600 transition-all">Dismiss Protocol</button>
            </div>
        </div>
      )}

      {/* Mobile Menu & Identity Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[1500] lg:hidden animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-white/98 backdrop-blur-3xl" />
          <div className="relative h-full flex flex-col p-8 pt-32">
            <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-6 right-6 p-4 hover:bg-slate-50 rounded-full transition-all group">
              <X size={32} strokeWidth={1} className="group-hover:rotate-90 transition-transform duration-500" />
            </button>
            <div className="space-y-12 stagger-in">
              <span className="text-[10px] font-black uppercase tracking-[1em] text-rose-500 block mb-4 italic">Registry Navigation</span>
              <div className="flex flex-col gap-8">
                {currentCustomer ? (
                  <div className="flex flex-col gap-4 mb-8">
                    <span className="text-[10px] font-black uppercase tracking-widest text-black/20">Identified Resident</span>
                    <div className="flex items-center justify-between">
                      <span className="serif text-4xl italic text-rose-500 font-bold tracking-tight lowercase">@{currentCustomer.name.toLowerCase()}</span>
                      <button onClick={onCustomerLogout} className="p-4 bg-slate-50 rounded-full text-black/40 hover:text-rose-600 transition-all"><LogOut size={20}/></button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setIsAuthOpen(true); setIsMobileMenuOpen(false); }} className="w-full bg-rose-600 text-white py-6 rounded-full font-black uppercase tracking-[0.4em] text-[10px] mb-8 shadow-xl">Identify / Sign Up</button>
                )}
                <button onClick={() => { onNavigateToHome(); setIsMobileMenuOpen(false); }} className="serif text-6xl italic font-light text-left hover:text-rose-600 transition-colors">{t.archive}</button>
                <button onClick={() => { onNavigateToManifesto(); setIsMobileMenuOpen(false); }} className="serif text-6xl italic font-light text-left hover:text-rose-600 transition-colors">{t.manifesto}</button>
                <button onClick={() => { onNavigateToLab(); setIsMobileMenuOpen(false); }} className="serif text-6xl italic font-light text-left hover:text-rose-600 transition-colors">{t.lab}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-[100] h-20 md:h-32 flex items-center px-6 md:px-20 justify-between bg-white/70 backdrop-blur-2xl border-b border-black/[0.03]">
        <div className="flex items-center gap-12 md:gap-24">
            <div className="flex flex-col group cursor-pointer" onClick={onNavigateToHome}>
                <span className="serif text-2xl md:text-5xl font-bold tracking-tighter leading-none">Seoul Muse</span>
                <span className="hidden sm:block text-[8px] font-black uppercase tracking-[0.8em] text-black/20 mt-1 uppercase">Metamorphosis Registry</span>
            </div>
            <div className="hidden lg:flex items-center gap-16 uppercase text-[9px] font-black tracking-[0.5em] text-black/30">
                <button onClick={() => setIsMobileMenuOpen(true)} className="flex items-center gap-3 hover:text-rose-500 transition-colors uppercase">
                  <SlidersHorizontal size={14} /> Matrix
                </button>
                <button onClick={onNavigateToManifesto} className="hover:text-rose-500 transition-colors uppercase">{t.manifesto}</button>
                <button onClick={onNavigateToLab} className="hover:text-rose-500 transition-colors uppercase">{t.lab}</button>
                <div className="h-6 w-[1px] bg-black/5" />
                <button onClick={() => setIsLocOpen(true)} className="flex items-center gap-3 hover:text-rose-500 transition-all font-black text-slate-400">
                  <Globe size={14} /> {lang} / {currency}
                </button>
                <div className="h-6 w-[1px] bg-black/5" />
                {currentCustomer ? (
                  <button className="flex items-center gap-2 group hover:text-rose-500 transition-colors uppercase">
                    <span className="text-rose-500 italic serif normal-case text-xs lowercase">@{currentCustomer.name.toLowerCase()}</span>
                  </button>
                ) : (
                  <button onClick={() => setIsAuthOpen(true)} className="hover:text-rose-500 transition-all font-black text-rose-600">{t.identify}</button>
                )}
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
            <button className="p-2 lg:hidden" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu size={24} strokeWidth={1} />
            </button>
        </div>
      </nav>

      <header className="relative pt-32 sm:pt-40 md:pt-64 pb-12 sm:pb-20 md:pb-32 px-6 md:px-20 overflow-hidden text-center bg-[#fdfcfb]">
        <div className="max-w-7xl mx-auto stagger-in">
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.5em] md:tracking-[0.8em] text-black/20 block mb-6 sm:mb-8 md:mb-12 uppercase">Seoul Designed silhouettes.</span>
          <h1 className="serif text-5xl sm:text-6xl md:text-[12rem] leading-[0.9] italic tracking-tighter mb-6 sm:mb-8 md:mb-12">
            The <span className="not-italic font-bold">{t.collection}</span>
          </h1>
          <p className="max-w-2xl mx-auto text-black/40 text-base sm:text-lg md:text-2xl leading-relaxed serif italic">
            An exploration of contemporary form and industrial texture. Each piece is a numbered entry in our evolving archive.
          </p>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="sticky top-20 sm:top-24 md:top-32 z-[90] px-4 md:px-20 py-4 md:py-8 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between items-center pointer-events-auto">
            <div className="bg-white/80 backdrop-blur-xl rounded-full border border-black/[0.05] p-1.5 md:p-2 flex items-center gap-1 md:gap-2 shadow-sm overflow-x-auto no-scrollbar max-w-fit">
              {['All', 'Tops', 'Dresses', 'Skirts', 'Outerwear'].map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 sm:px-8 py-2 md:py-3 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-black text-white' : 'text-black/30 hover:bg-slate-50'}`}>
                  {cat}
                </button>
              ))}
            </div>
            <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="bg-white/80 backdrop-blur-xl p-4 rounded-full border border-black/[0.05] shadow-sm flex items-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                <Filter size={14} /> Matrix Filters
            </button>
        </div>
      </div>

      {/* Catalog Grid */}
      <section className="px-6 md:px-20 pt-8 pb-40">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-48">
          {filteredProducts.map((product, idx) => (
            <div key={product.id} className="group flex flex-col items-start cursor-pointer animate-in fade-in duration-1000">
              <div className="relative w-full aspect-[4/5] bg-slate-50 overflow-hidden mb-12 rounded-[2px] shadow-sm">
                <img src={product.image} className="w-full h-full object-cover grayscale md:hover:grayscale-0 transition-all duration-[2s]" alt={product.name} onClick={() => openQuickView(product)} />
                <button onClick={() => toggleWishlist(product.id)} className="absolute top-8 right-8 p-4 bg-white/80 backdrop-blur-xl rounded-full text-slate-400 hover:text-rose-500 transition-all shadow-xl">
                  <Heart size={20} fill={currentCustomer?.wishlist?.includes(product.id) ? 'currentColor' : 'none'} className={currentCustomer?.wishlist?.includes(product.id) ? 'text-rose-500' : ''} />
                </button>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                  <div className="bg-white/90 backdrop-blur-md px-10 py-5 rounded-full flex items-center gap-4 shadow-2xl">
                    <Eye size={16} className="text-rose-500" />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]">Observe</span>
                  </div>
                </div>
              </div>

              <div className="w-full px-1" onClick={() => openQuickView(product)}>
                <div className="flex justify-between items-baseline mb-4">
                  <span className="text-[8px] font-black uppercase tracking-[0.3em] text-rose-500 italic opacity-60">{product.category}</span>
                  <div className="flex items-center gap-2">
                     <Star size={10} className="fill-amber-400 text-amber-400" />
                     <span className="text-[9px] font-black text-black/30">{product.rating || 'N/A'}</span>
                  </div>
                </div>
                <h3 className="serif text-5xl italic font-light leading-none mb-4 group-hover:translate-x-2 transition-transform duration-700">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between border-b border-black/5 pb-6">
                  <p className="text-xl font-medium tracking-tighter text-black/30">{formatPrice(product.price)}</p>
                  <ArrowRight size={16} className="text-black/5 group-hover:text-rose-50 transition-all group-hover:translate-x-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick View Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-3xl animate-in fade-in duration-700" onClick={() => setSelectedProduct(null)} />
          <div className="relative bg-white w-full max-w-[1300px] h-[95vh] md:h-auto md:max-h-[90vh] overflow-y-auto rounded-[40px] shadow-3xl flex flex-col md:flex-row no-scrollbar">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-8 right-8 z-50 p-4 hover:bg-slate-50 rounded-full transition-all">
              <X size={24} strokeWidth={1} />
            </button>

            <div className="md:w-1/2 bg-slate-50 p-8 flex flex-col">
              <div className="aspect-[4/5] rounded-[40px] overflow-hidden mb-8 shadow-2xl">
                 <img src={selectedProduct.image} className="w-full h-full object-cover" alt={selectedProduct.name} />
              </div>
            </div>

            <div className="md:w-1/2 p-10 md:p-24 space-y-16">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 block mb-6 italic">Artifact Registry // Dossier</span>
                <h2 className="serif text-5xl md:text-7xl italic font-light leading-tight mb-6">{selectedProduct.name}</h2>
                <div className="flex justify-between items-baseline">
                   <span className="text-3xl font-bold tracking-tighter text-slate-300">{formatPrice(selectedProduct.price)}</span>
                </div>
              </div>

              <div className="space-y-10">
                <div className="relative pl-8">
                  <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-black/20 mb-4">Poetic Registry Statement</p>
                  <p className="serif text-2xl italic leading-relaxed text-black/60 italic">
                    {loadingAction === selectedProduct.id ? 'Analyzing neural cache...' : (productDesc[selectedProduct.id] || selectedProduct.description || 'Structural elegance.')}
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <button onClick={() => addToCart(selectedProduct)} className="flex-[2] bg-black text-white py-8 rounded-full font-black uppercase tracking-[0.4em] text-[11px] hover:bg-rose-600 transition-all shadow-xl flex items-center justify-center gap-4">
                   <ShoppingBag size={18} /> Add to Acquisition Registry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[3000] flex justify-end">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-md" onClick={() => setIsCartOpen(false)} />
            <div className="relative w-full max-w-xl bg-white h-full shadow-3xl p-10 md:p-20 flex flex-col animate-in slide-in-from-right duration-700">
                <div className="flex justify-between items-center mb-16">
                    <h2 className="serif text-5xl italic font-light">{t.collection}.</h2>
                    <button onClick={() => setIsCartOpen(false)} className="p-4 hover:bg-slate-50 rounded-full"><X size={28} strokeWidth={1} /></button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-12 no-scrollbar pr-2">
                    {cart.map((item) => (
                        <div key={item.cartId} className="flex gap-10 items-center group">
                            <div className="w-24 h-32 rounded-3xl overflow-hidden shadow-lg shrink-0">
                               <img src={item.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt={item.name} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-black text-[10px] uppercase tracking-[0.3em] opacity-30 truncate">{item.name}</h4>
                                    <button onClick={() => removeFromCart(item.cartId)} className="text-rose-500 hover:scale-125 transition-transform"><Trash2 size={16}/></button>
                                </div>
                                <div className="flex justify-between items-baseline">
                                   <p className="serif text-3xl italic text-rose-600">{formatPrice(item.price)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-12 mt-12 border-t border-slate-100">
                    <div className="flex justify-between items-baseline mb-12">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 italic">{t.total}</span>
                        <span className="serif text-6xl font-bold tracking-tighter text-rose-600">{formatPrice(cart.reduce((a, b) => a + b.price, 0))}</span>
                    </div>
                    <button 
                      onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} 
                      disabled={cart.length === 0} 
                      className="w-full bg-black text-white py-8 rounded-full font-black text-[11px] uppercase tracking-[0.5em] hover:bg-rose-600 transition-all shadow-xl disabled:bg-slate-200"
                    >
                      {currentCustomer ? 'Execute Acquisition Protocol' : 'Identify to Proceed'}
                    </button>
                </div>
            </div>
        </div>
      )}

      <Footer onNavigateToCatalog={() => {}} onNavigateToManifesto={onNavigateToManifesto} onNavigateToLab={onNavigateToLab} />
    </div>
  );
};

export default Catalog;
