
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShoppingBag, Menu, X, Sparkles, Loader2, ArrowUpRight, 
  Search, ChevronRight, ArrowRight, Command, Globe, 
  Fingerprint, ArrowDown, ShieldCheck, CheckCircle2,
  MapPin, CreditCard, Box, Hash, User, Target, Cpu, BookOpen,
  History, Layers, Microscope, Dna, Hexagon
} from 'lucide-react';
import { Product, Customer } from '../types';
import { getTrendRadar, getSearchCuration } from '../geminiService';
import { inventoryService } from '../services/inventoryService';
import CustomerAuth from './CustomerAuth';
import Footer from './Footer';

interface StorefrontProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  currentCustomer: Customer | null;
  onCustomerLogin: (customer: Customer) => void;
  onCustomerLogout: () => void;
  onNavigateToCatalog: () => void;
  onNavigateToManifesto: () => void;
  onNavigateToLab: () => void;
}

const Storefront: React.FC<StorefrontProps> = ({ 
  products, setProducts, currentCustomer, onCustomerLogin, onCustomerLogout,
  onNavigateToCatalog, onNavigateToManifesto, onNavigateToLab 
}) => {
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [trendAlert, setTrendAlert] = useState<string>("");
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Auth/Search States
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [aiSearchInsight, setAiSearchInsight] = useState<string | null>(null);
  const [isAiCurating, setIsAiCurating] = useState(false);
  const overlaySearchInputRef = useRef<HTMLInputElement>(null);

  // Checkout States
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'payment'>('cart');
  const [acquisitionSuccess, setAcquisitionSuccess] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    const savedCart = localStorage.getItem('seoul_muse_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
    const fetchTrend = async () => { setTrendAlert(await getTrendRadar()); };
    fetchTrend();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { localStorage.setItem('seoul_muse_cart', JSON.stringify(cart)); }, [cart]);

  // Focus search input when overlay opens
  useEffect(() => {
    if (isSearchActive && overlaySearchInputRef.current) {
      overlaySearchInputRef.current.focus();
    }
  }, [isSearchActive]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (searchQuery.length > 3) {
        setIsAiCurating(true);
        setAiSearchInsight(await getSearchCuration(searchQuery));
        setIsAiCurating(false);
      } else { setAiSearchInsight(null); }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.collection?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, products]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart(prev => [...prev, { ...product, cartId: Date.now() }]);
    setIsCartOpen(true);
    setCheckoutStep('cart');
  };

  const removeFromCart = (cartId: number) => { setCart(prev => prev.filter(item => item.cartId !== cartId)); };

  const handleCheckoutInitiate = () => {
    if (!currentCustomer) {
      setIsAuthOpen(true);
      return;
    }
    handleCheckout(); // Direct acquisition if already identified
  };

  const handleCheckout = async () => {
    if (cart.length === 0 || !currentCustomer) return;
    setIsProcessingCheckout(true);
    try {
      const total = cart.reduce((sum, item) => sum + item.price, 0);
      const order = await inventoryService.placeOrder({
        items: cart.map(i => ({ productId: i.id, name: i.name, quantity: 1, price: i.price })),
        total,
        customerName: currentCustomer.name,
        customerEmail: currentCustomer.email,
        shippingAddress: 'Seoul Terminal 4, Seongsu Atelier Dist.'
      });
      setAcquisitionSuccess(order.id);
      setCart([]);
      setIsCartOpen(false);
      const updatedProducts = await inventoryService.getProducts();
      setProducts(updatedProducts);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] text-[#0f172a] selection:bg-rose-600 selection:text-white pb-0 relative">
      
      {isAuthOpen && (
        <CustomerAuth 
          onSuccess={(c) => { onCustomerLogin(c); setIsAuthOpen(false); }} 
          onClose={() => setIsAuthOpen(false)} 
        />
      )}

      {/* Search Overlay */}
      {isSearchActive && (
        <div className="fixed inset-0 z-[1500] flex flex-col bg-white/95 backdrop-blur-3xl animate-in fade-in duration-500">
          <div className="h-20 md:h-28 px-6 md:px-20 flex items-center justify-between border-b border-black/[0.03]">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-black/20 italic">Universal Registry Search</span>
            <button onClick={() => { setIsSearchActive(false); setSearchQuery(""); }} className="p-4 rounded-full hover:bg-slate-50 transition-all">
              <X size={28} strokeWidth={1} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar py-12 md:py-24 px-6 md:px-20">
            <div className="max-w-7xl mx-auto">
              <div className="relative mb-20">
                <input 
                  ref={overlaySearchInputRef}
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="EXAMINE ARCHIVES..."
                  className="w-full bg-transparent border-none outline-none serif text-5xl md:text-9xl italic font-light tracking-tighter placeholder:text-black/5"
                />
                {isAiCurating && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2">
                    <Loader2 className="animate-spin text-rose-500" size={32} />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                <div className="lg:col-span-8 space-y-20">
                  {searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-20">
                      {searchResults.map(p => (
                        <div key={p.id} className="group cursor-pointer" onClick={() => { onNavigateToCatalog(); setIsSearchActive(false); }}>
                          <div className="aspect-[4/5] bg-slate-50 rounded-[40px] overflow-hidden mb-8 shadow-sm">
                            <img src={p.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={p.name} />
                          </div>
                          <div className="space-y-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-rose-500 italic">{p.category}</span>
                            <h4 className="serif text-3xl italic font-bold tracking-tight">{p.name}</h4>
                            <p className="text-xl font-medium tracking-tighter text-black/30">${p.price.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery.length > 0 ? (
                    <div className="py-20 text-center">
                      <p className="serif text-4xl italic text-black/20">No matching artifacts detected.</p>
                    </div>
                  ) : (
                    <div className="space-y-10">
                      <span className="text-[10px] font-black uppercase tracking-widest text-black/20">Popular Inquiries</span>
                      <div className="flex flex-wrap gap-4">
                        {['Silk Blouse', 'Trench Coat', 'Knits', 'Manifesto'].map(tag => (
                          <button key={tag} onClick={() => setSearchQuery(tag)} className="px-8 py-4 rounded-full border border-black/5 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-4 space-y-12">
                  <div className="bg-slate-50 p-12 rounded-[50px] space-y-8">
                    <div className="flex items-center gap-4 text-rose-500">
                      <Sparkles size={18} />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em]">AI Muse Curation</span>
                    </div>
                    <p className="serif text-xl italic leading-relaxed text-black/60">
                      {aiSearchInsight || "Begin typing to receive editorial insights from the Seoul Muse AI core."}
                    </p>
                  </div>
                  <div className="bg-black p-12 rounded-[50px] text-white space-y-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20">District Insight</span>
                    <p className="serif text-xl italic font-light leading-relaxed">
                      "Market signals suggest a resurgence in industrial minimalism across Seongsu Terminal 4."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {acquisitionSuccess && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl animate-in fade-in duration-1000" onClick={() => setAcquisitionSuccess(null)} />
            <div className="relative bg-white w-full max-w-2xl rounded-[60px] p-12 sm:p-20 text-center shadow-3xl animate-in zoom-in-95 duration-700">
                <div className="w-24 h-24 bg-rose-500 rounded-full mx-auto mb-12 flex items-center justify-center text-white shadow-2xl animate-bounce">
                    <CheckCircle2 size={48} strokeWidth={1} />
                </div>
                <h2 className="serif text-6xl md:text-8xl italic font-light tracking-tighter mb-8">Acquisition <span className="font-bold not-italic text-rose-600">Complete.</span></h2>
                <p className="text-xl serif italic text-black/40 mb-16 leading-relaxed">Recorded for Resident {currentCustomer?.name}. Prepared for dispatch from Seongsu Atelier.</p>
                <div className="bg-slate-50 p-8 rounded-[30px] border border-slate-100 mb-16 flex items-center justify-between">
                    <div className="text-left">
                        <span className="text-[8px] font-black uppercase tracking-[0.5em] text-black/20 block mb-1">Acquisition ID</span>
                        <p className="font-mono text-xs font-black tracking-widest text-rose-600">{acquisitionSuccess}</p>
                    </div>
                    <Hash size={24} className="text-black/5" />
                </div>
                <button onClick={() => setAcquisitionSuccess(null)} className="w-full bg-black text-white py-8 rounded-full font-black uppercase tracking-[0.6em] text-[11px] hover:bg-rose-600 transition-all shadow-xl">Dismiss Protocol</button>
            </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-[100] h-20 md:h-28 flex items-center px-6 md:px-20 justify-between bg-white/60 backdrop-blur-xl border-b border-black/[0.02]">
        <div className="flex items-center gap-12">
            <button className="flex flex-col group text-left" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                <span className="serif text-2xl md:text-3xl font-bold tracking-tighter leading-none">Seoul Muse</span>
                <span className="text-[7px] font-black tracking-[0.6em] text-black/20 mt-1 uppercase">Atelier Archive</span>
            </button>
        </div>
        <div className="flex items-center gap-6">
            {currentCustomer ? (
              <button onClick={onCustomerLogout} className="flex flex-col items-end group">
                <span className="text-[8px] font-black uppercase tracking-widest text-black/20 group-hover:text-rose-500 transition-colors italic">Sign Out Protocol</span>
                <span className="serif text-sm italic font-bold tracking-tighter text-black/80">{currentCustomer.name}</span>
              </button>
            ) : (
              <button onClick={() => setIsAuthOpen(true)} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-black/40 hover:text-black transition-all">
                <User size={16} strokeWidth={1.5} /> Identify
              </button>
            )}
            <button onClick={() => setIsSearchActive(true)} className="p-2 hover:text-rose-600 transition-colors"><Search size={22} strokeWidth={1.2} /></button>
            <button className="relative group p-2" onClick={() => { setIsCartOpen(true); setCheckoutStep('cart'); }}>
                <ShoppingBag size={22} strokeWidth={1.2} />
                {cart.length > 0 && <span className="absolute top-1 right-1 bg-rose-600 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full">{cart.length}</span>}
            </button>
        </div>
      </nav>

      {/* Hero Section - Redesigned with Multi-Layered Animation */}
      <section className="relative h-screen flex items-center px-6 md:px-20 overflow-hidden bg-[#fdfcfb]">
        <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] text-[20rem] md:text-[35rem] font-bold serif pointer-events-none select-none"
            style={{ transform: `translate(-50%, -50%) translateY(${scrollY * 0.1}px)` }}
        >
            MUSE
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center w-full relative z-10">
            <div className="lg:col-span-6 flex flex-col items-start stagger-in">
                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-rose-500 mb-8 italic flex items-center gap-4">
                  <div className="w-12 h-[1px] bg-rose-500/30" />
                  Registry 04 // Spring
                </span>
                <h1 className="serif text-6xl md:text-[11rem] leading-[0.85] font-bold tracking-tighter mb-12">
                   <span className="font-light italic block opacity-90 transition-transform duration-1000" style={{ transform: `translateX(${scrollY * -0.05}px)` }}>Seoul</span> 
                   Metamorphosis
                </h1>
                <p className="max-w-md text-black/40 text-xl italic serif leading-relaxed mb-16">
                   An exploration of structural minimalism and classic editorial drapes. Curated in the industrial heart of Seongsu-dong for the contemporary Muse.
                </p>
                <div className="flex flex-col sm:flex-row gap-6">
                  <button onClick={onNavigateToCatalog} className="bg-black text-white px-16 py-8 rounded-full font-black uppercase text-[11px] tracking-[0.5em] hover:bg-rose-600 transition-all flex items-center gap-10 shadow-2xl group">
                    Examine Archives <ArrowUpRight size={20} className="group-hover:rotate-45 transition-transform" />
                  </button>
                </div>
            </div>
            
            <div className="lg:col-span-6 hidden lg:flex justify-end stagger-in relative">
                {/* Secondary Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-rose-500/5 blur-[120px] rounded-full animate-pulse pointer-events-none" />
                
                {/* Main Hero Asset */}
                <div 
                  className="relative aspect-[4/5] w-full max-w-[550px] rounded-[280px] overflow-hidden shadow-[0_80px_160px_rgba(0,0,0,0.15)] border-[12px] border-white transition-all duration-[2s] group"
                  style={{ transform: `translateY(${scrollY * -0.08}px)` }}
                >
                    <img 
                      src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop" 
                      className="w-full h-full object-cover grayscale brightness-105 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[3s] ease-out" 
                      alt="The Seoul Muse Hero" 
                    />
                    
                    {/* Floating Tech Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-full text-center px-12 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <span className="text-[10px] font-black uppercase tracking-[0.8em] text-white">Structural Synthesis // v.04</span>
                    </div>
                </div>

                {/* Orbiting Detail Asset 1: Fabric Macro */}
                <div 
                  className="absolute -top-10 -left-10 w-48 h-48 rounded-[60px] overflow-hidden border-8 border-white shadow-2xl animate-float"
                  style={{ transform: `translateY(${scrollY * 0.12}px)` }}
                >
                    <img 
                      src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop" 
                      className="w-full h-full object-cover grayscale" 
                      alt="Detail"
                    />
                </div>

                {/* Orbiting Detail Asset 2: Label/Badge */}
                <div 
                  className="absolute bottom-20 -right-12 bg-white p-8 rounded-[40px] shadow-2xl flex flex-col items-center gap-4 animate-float"
                  style={{ animationDelay: '1.5s', transform: `translateY(${scrollY * -0.15}px)` }}
                >
                    <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-lg rotate-12">
                      <Hexagon size={24} strokeWidth={1.5} className="animate-spin-slow" />
                    </div>
                    <div className="text-center">
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-black/20 block">Authentic</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-black">Registry Verified</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-20 animate-bounce cursor-pointer" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
            <span className="text-[9px] font-black uppercase tracking-[0.5em]">Explore the Matrix</span>
            <ArrowDown size={14} />
        </div>
      </section>

      {/* Dynamic Marquee: Aesthetic Frequency */}
      <div className="bg-black py-6 overflow-hidden border-y border-white/5">
        <div className="flex gap-20 animate-marquee whitespace-nowrap">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex gap-20 items-center">
              <span className="text-[10px] font-black uppercase tracking-[1em] text-white/30">Registry Syncing...</span>
              <span className="serif text-2xl italic font-bold text-rose-500">Structural Minimalism</span>
              <span className="text-[10px] font-black uppercase tracking-[1em] text-white/30">04:00 AM Seongsu Time</span>
              <span className="serif text-2xl italic font-bold text-white">Classic Draping</span>
              <span className="text-[10px] font-black uppercase tracking-[1em] text-white/30">Industrial Seoul Grit</span>
            </div>
          ))}
        </div>
      </div>

      {/* Exploration Matrix Section */}
      <section className="px-6 md:px-20 py-40 bg-white">
        <div className="max-w-7xl mx-auto space-y-32">
          <div className="text-center max-w-3xl mx-auto">
             <span className="text-[10px] font-black uppercase tracking-[0.6em] text-black/20 block mb-8">Pillars of the Atelier</span>
             <h2 className="serif text-5xl md:text-8xl italic font-light tracking-tighter leading-none mb-10">Discover Our <span className="not-italic font-bold">World.</span></h2>
             <div className="h-[1px] w-20 bg-rose-500 mx-auto" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Archive Link */}
            <div 
              onClick={onNavigateToCatalog}
              className="group relative h-[700px] rounded-[60px] overflow-hidden cursor-pointer shadow-2xl transition-transform duration-700 hover:-translate-y-4"
            >
               <img 
                src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop" 
                className="absolute inset-0 w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[2s]"
                alt="Archive"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
               <div className="absolute inset-0 p-12 flex flex-col justify-end items-start">
                  <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/40 mb-4 italic">Registry 0.4</span>
                  <h3 className="serif text-5xl italic font-bold text-white mb-6">Archives</h3>
                  <p className="text-white/50 text-base italic serif leading-relaxed mb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 max-w-[280px]">
                    Examine the structural silhouettes and artisanal drapes of our contemporary seasonal archive.
                  </p>
                  <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white group-hover:bg-rose-600 group-hover:border-rose-600 transition-all">
                    <ArrowUpRight size={20} />
                  </div>
               </div>
            </div>

            {/* Manifesto Link */}
            <div 
              onClick={onNavigateToManifesto}
              className="group relative h-[700px] rounded-[60px] overflow-hidden cursor-pointer shadow-2xl transition-transform duration-700 hover:-translate-y-4"
            >
               <img 
                src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop" 
                className="absolute inset-0 w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[2s]"
                alt="Manifesto"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
               <div className="absolute inset-0 p-12 flex flex-col justify-end items-start">
                  <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/40 mb-4 italic">The Protocol</span>
                  <h3 className="serif text-5xl italic font-bold text-white mb-6">Manifesto</h3>
                  <p className="text-white/50 text-base italic serif leading-relaxed mb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 max-w-[280px]">
                    Understanding the core axioms of Seoul Muse: Simplicity, Intention, and Reliability.
                  </p>
                  <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white group-hover:bg-rose-600 group-hover:border-rose-600 transition-all">
                    <ArrowUpRight size={20} />
                  </div>
               </div>
            </div>

            {/* Lab Link */}
            <div 
              onClick={onNavigateToLab}
              className="group relative h-[700px] rounded-[60px] overflow-hidden cursor-pointer shadow-2xl transition-transform duration-700 hover:-translate-y-4"
            >
               <img 
                src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop" 
                className="absolute inset-0 w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[2s]"
                alt="Lab"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
               <div className="absolute inset-0 p-12 flex flex-col justify-end items-start">
                  <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/40 mb-4 italic">Neural Core</span>
                  <h3 className="serif text-5xl italic font-bold text-white mb-6">Synthesis Lab</h3>
                  <p className="text-white/50 text-base italic serif leading-relaxed mb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 max-w-[280px]">
                    Experiment with AI-driven aesthetic synthesis and experimental form generation.
                  </p>
                  <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white group-hover:bg-rose-600 group-hover:border-rose-600 transition-all">
                    <ArrowUpRight size={20} />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Section: The Seongsu Protocol (District Insight) */}
      <section className="relative bg-[#0A0A0A] py-60 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-rose-600/5 blur-[150px] opacity-30" />
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-24 relative z-10">
          <div className="lg:w-1/2 space-y-12">
            <div className="inline-flex items-center gap-6 px-6 py-2 rounded-full border border-white/10 bg-white/5">
              <MapPin size={14} className="text-rose-500" />
              <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/60">Seongsu District Terminal</span>
            </div>
            <h2 className="serif text-6xl md:text-9xl italic font-light text-white leading-[0.85]">The <br/><span className="not-italic font-bold">Industrial</span> <br/>Soul.</h2>
            <p className="text-white/40 text-xl md:text-2xl serif italic leading-relaxed max-w-lg">
              Born amidst the concrete galleries and repurposed factories of Seoul's creative core. We capture the grit and the grace.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-10 border-t border-white/10">
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-rose-500">
                  <History size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Est. 2026</span>
                </div>
                <p className="text-[11px] text-white/20 uppercase tracking-widest leading-loose">Built on the foundations of architectural legacy.</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-rose-500">
                  <Globe size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Local Core</span>
                </div>
                <p className="text-[11px] text-white/20 uppercase tracking-widest leading-loose">Sourced and synthesized in the heart of the city.</p>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2">
            <div className="relative aspect-square w-full rounded-[100px] overflow-hidden border border-white/5 group">
              <img 
                src="https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=1200&auto=format&fit=crop" 
                className="w-full h-full object-cover grayscale opacity-60 group-hover:scale-105 transition-transform duration-[2s]" 
                alt="Classic Muse Portrait"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white animate-pulse">
                    <History size={32} strokeWidth={1} />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cart Drawer Enhanced */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-end">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-md" onClick={() => setIsCartOpen(false)} />
            <div className="relative w-full max-w-xl bg-white h-full shadow-3xl p-10 md:p-24 flex flex-col animate-in slide-in-from-right duration-700">
                <div className="flex justify-between items-center mb-20">
                    <div>
                        <h2 className="serif text-6xl italic leading-none">The <span className="font-bold not-italic text-rose-600">Collection</span></h2>
                    </div>
                    <button onClick={() => setIsCartOpen(false)} className="p-5 rounded-full border border-slate-50 hover:bg-slate-50"><X size={28} strokeWidth={1} /></button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-12 no-scrollbar pr-2">
                    {cart.map((item) => (
                        <div key={item.cartId} className="flex gap-10 items-center group">
                            <img src={item.image} className="w-24 h-32 rounded-[30px] object-cover grayscale group-hover:grayscale-0 transition-all shadow-lg" alt={item.name} />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-black text-[10px] uppercase tracking-[0.3em] opacity-30 truncate">{item.name}</h4>
                                    <button onClick={() => removeFromCart(item.cartId)} className="text-rose-500 hover:scale-125 transition-transform"><X size={14}/></button>
                                </div>
                                <p className="serif text-3xl italic text-rose-600">${item.price}</p>
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && <div className="text-center italic serif text-2xl text-black/10 py-20">Archive Empty.</div>}
                </div>

                <div className="pt-12 mt-8 border-t border-slate-100">
                    <div className="flex justify-between items-baseline mb-12">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 italic">Total Value</span>
                        <span className="serif text-6xl font-bold tracking-tighter text-rose-600">${cart.reduce((a, b) => a + b.price, 0).toFixed(2)}</span>
                    </div>
                    <button 
                      onClick={handleCheckoutInitiate} 
                      disabled={cart.length === 0 || isProcessingCheckout} 
                      className="w-full bg-black text-white py-8 rounded-full font-black text-[11px] uppercase tracking-[0.5em] hover:bg-rose-600 transition-all shadow-xl disabled:bg-slate-200 flex items-center justify-center gap-4"
                    >
                      {isProcessingCheckout ? <Loader2 className="animate-spin" /> : (currentCustomer ? 'Proceed to Acquisition' : 'Identify to Proceed')}
                    </button>
                </div>
            </div>
        </div>
      )}

      <Footer onNavigateToCatalog={onNavigateToCatalog} onNavigateToManifesto={onNavigateToManifesto} onNavigateToLab={onNavigateToLab} />
    </div>
  );
};

export default Storefront;
