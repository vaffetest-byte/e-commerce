
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShoppingBag, Menu, X, Sparkles, Loader2, ArrowUpRight, 
  Search, ChevronRight, ArrowRight, Command, Globe, 
  Fingerprint, ArrowDown, ShieldCheck, CheckCircle2,
  MapPin, CreditCard, Box, Hash, User, Target, Cpu, BookOpen,
  History, Layers, Microscope, Dna, Hexagon, Eye, MousePointer2
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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Auth/Search States
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [aiSearchInsight, setAiSearchInsight] = useState<string | null>(null);
  const [isAiCurating, setIsAiCurating] = useState(false);
  const overlaySearchInputRef = useRef<HTMLInputElement>(null);

  // Checkout States
  const [acquisitionSuccess, setAcquisitionSuccess] = useState<string | null>(null);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: (e.clientX / window.innerWidth) - 0.5, y: (e.clientY / window.innerHeight) - 0.5 });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove);
    
    const savedCart = localStorage.getItem('seoul_muse_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
    
    const fetchTrend = async () => { setTrendAlert(await getTrendRadar()); };
    fetchTrend();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => { 
    localStorage.setItem('seoul_muse_cart', JSON.stringify(cart)); 
  }, [cart]);

  // Intersection Observer for scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [products]);

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
    const q = searchQuery.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q) ||
      p.collection?.toLowerCase().includes(q)
    );
  }, [searchQuery, products]);

  const featuredProducts = useMemo(() => {
    return products.slice(0, 4);
  }, [products]);

  const removeFromCart = (cartId: number) => { 
    setCart(prev => prev.filter(item => item.cartId !== cartId)); 
  };

  const handleCheckoutInitiate = () => {
    if (!currentCustomer) {
      setIsAuthOpen(true);
      return;
    }
    handleCheckout();
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

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="min-h-screen bg-[#fdfcfb] text-[#0f172a] selection:bg-rose-600 selection:text-white pb-0 relative scroll-container">
      
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
                  className="w-full bg-transparent border-none outline-none serif text-4xl sm:text-5xl md:text-9xl italic font-light tracking-tighter placeholder:text-black/5"
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
                            <img src={p.image} className="w-full h-full object-cover grayscale md:group-hover:grayscale-0 transition-all duration-700 accelerate" alt={p.name} loading="lazy" />
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-[100] h-20 md:h-28 flex items-center px-6 md:px-20 justify-between bg-white/70 backdrop-blur-xl border-b border-black/[0.02] accelerate">
        <div className="flex items-center gap-12">
            <button className="flex flex-col group text-left" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                <span className="serif text-xl sm:text-3xl font-bold tracking-tighter leading-none">Seoul Muse</span>
                <span className="text-[7px] font-black tracking-[0.6em] text-black/20 mt-1 uppercase hidden xs:block">Atelier Archive</span>
            </button>
        </div>
        <div className="flex items-center gap-4 sm:gap-10">
            <div className="hidden lg:flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-black/40">
                <button onClick={onNavigateToCatalog} className="hover:text-rose-500 transition-colors">Archive</button>
                <button onClick={onNavigateToManifesto} className="hover:text-rose-500 transition-colors">Manifesto</button>
                <button onClick={onNavigateToLab} className="hover:text-rose-500 transition-colors">Lab</button>
            </div>
            <div className="h-6 w-[1px] bg-black/5 hidden lg:block" />
            <div className="flex items-center gap-4 sm:gap-6">
                <button onClick={() => setIsSearchActive(true)} className="p-2 hover:text-rose-600 transition-colors"><Search size={22} strokeWidth={1.2} /></button>
                <button className="relative group p-2" onClick={() => setIsCartOpen(true)}>
                    <ShoppingBag size={22} strokeWidth={1.2} />
                    {cart.length > 0 && <span className="absolute top-1 right-1 bg-rose-600 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full">{cart.length}</span>}
                </button>
            </div>
        </div>
      </nav>

      {/* Cinematic Hero Section */}
      <section className="relative min-h-[110vh] flex items-center px-6 md:px-20 overflow-hidden bg-white">
        {/* Background Parallax Layer */}
        <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] text-[15rem] sm:text-[40rem] font-bold serif pointer-events-none select-none accelerate leading-none"
            style={{ transform: `translate3d(calc(-50% + ${mousePos.x * -50}px), calc(-50% + ${scrollY * 0.15}px), 0)` }}
        >
            MUSE
        </div>

        {/* Scan Line HUD Element */}
        <div className="scan-line" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center w-full relative z-10 py-32">
            <div className="lg:col-span-7 flex flex-col items-start stagger-in">
                <div className="inline-flex items-center gap-6 px-6 py-2 rounded-full border border-black/5 bg-slate-50 mb-10">
                    <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.5em] text-rose-500 italic">Neural Sync: Active // Terminal 4</span>
                </div>
                
                <h1 className="serif text-6xl sm:text-8xl md:text-[14rem] leading-[0.8] font-bold tracking-tighter mb-12 accelerate">
                   <span className="font-light italic block opacity-90 transition-transform duration-[2s] ease-out" 
                    style={{ transform: `translate3d(${scrollY * -0.06}px, 0, 0) rotate(${scrollY * -0.01}deg)` }}>
                    Structural
                   </span> 
                   Elegance.
                </h1>

                <p className="max-w-xl text-black/50 text-xl md:text-3xl italic serif leading-relaxed mb-16 transition-all duration-700">
                   "A dialogue between the body and the grid." Curated in the industrial center of Seongsu-dong for the digital-native Muse.
                </p>

                <div className="flex flex-col sm:flex-row gap-8 items-center w-full sm:w-auto">
                    <button onClick={onNavigateToCatalog} className="w-full sm:w-auto bg-black text-white px-16 py-8 rounded-full font-black uppercase text-[11px] tracking-[0.5em] hover:bg-rose-600 transition-all flex items-center justify-center gap-10 shadow-3xl group relative overflow-hidden">
                        <span className="relative z-10">Identify Archives</span>
                        <ArrowUpRight size={20} className="relative z-10 group-hover:rotate-45 transition-transform" />
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    </button>
                    <div className="flex items-center gap-6 group cursor-pointer" onClick={onNavigateToManifesto}>
                        <div className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center group-hover:border-rose-500 transition-colors">
                            <MousePointer2 size={16} className="group-hover:text-rose-500" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 group-hover:text-black">The Protocol</span>
                    </div>
                </div>
            </div>
            
            <div className="lg:col-span-5 hidden lg:flex justify-end stagger-in relative">
                {/* Floating Detail Elements */}
                <div 
                    className="absolute -top-10 -right-10 w-48 h-48 bg-white p-4 rounded-[60px] shadow-3xl z-20 flex flex-col items-center justify-center animate-float border border-black/5"
                    style={{ animationDelay: '1s' }}
                >
                    <Hexagon size={32} className="text-rose-500 mb-3 animate-spin-slow" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-black/40">Verified</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-black">Registry Entry</span>
                </div>

                <div 
                  className="relative aspect-[4/5] w-full max-w-[480px] rounded-[240px] overflow-hidden shadow-[0_100px_200px_rgba(0,0,0,0.1)] border-[1px] border-black/5 transition-all duration-[2.5s] group accelerate"
                  style={{ transform: `translate3d(calc(${mousePos.x * 30}px), calc(-50px + ${scrollY * -0.1}px), 0)` }}
                >
                    <img 
                      src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop" 
                      className="w-full h-full object-cover grayscale brightness-105 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[3s] ease-out" 
                      alt="Hero Look" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="absolute bottom-16 left-0 w-full text-center px-12 opacity-0 group-hover:opacity-100 transition-all duration-1000 translate-y-10 group-hover:translate-y-0">
                      <span className="text-[10px] font-black uppercase tracking-[0.8em] text-white">Spring Matrix // v.04</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 opacity-30 animate-bounce cursor-pointer group" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
            <div className="h-20 w-[1px] bg-black/10 group-hover:bg-rose-500 transition-colors" />
            <span className="text-[9px] font-black uppercase tracking-[0.6em] rotate-90 origin-left ml-2">Dive</span>
        </div>
      </section>

      {/* Dynamic Lookbook Section */}
      <section className="bg-black py-40 sm:py-60 overflow-hidden relative">
        <div className="absolute inset-0 bg-rose-600/5 blur-[150px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 mb-32 reveal">
            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-rose-500 mb-8 block italic">District Narrative // Registry Log</span>
            <h2 className="serif text-6xl md:text-[10rem] italic text-white leading-none tracking-tighter">The <span className="not-italic font-bold text-rose-600">Seongsu</span> Frequency.</h2>
        </div>

        <div className="flex gap-10 md:gap-20 overflow-x-auto no-scrollbar px-6 md:px-20 pb-20">
            {[
                { title: 'Industrial Grit', desc: 'Synthesizing raw concrete with soft silk drapes.', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200' },
                { title: 'Digital Silk', desc: 'Minimalist forms defined by shadow and light.', img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200' },
                { title: 'Atelier Core', desc: 'Architectural silhouettes for the modern inhabitant.', img: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200' }
            ].map((look, i) => (
                <div key={i} className="min-w-[320px] md:min-w-[550px] group reveal" style={{ transitionDelay: `${i * 150}ms` }}>
                    <div className="aspect-[4/5] bg-slate-900 rounded-[80px] overflow-hidden mb-10 border border-white/5 relative">
                        <img src={look.img} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[2s]" alt={look.title} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
                        <div className="absolute bottom-12 left-12">
                             <span className="text-[9px] font-black uppercase tracking-[0.4em] text-rose-500 mb-2 block">Protocol // 0{i+1}</span>
                             <h4 className="serif text-4xl italic text-white font-bold">{look.title}</h4>
                        </div>
                    </div>
                    <p className="text-white/30 text-lg serif italic leading-relaxed max-w-sm px-6">"{look.desc}"</p>
                </div>
            ))}
        </div>
      </section>

      {/* Aesthetic Marquee Overlay */}
      <div className="bg-white py-12 border-y border-black/[0.03] overflow-hidden">
        <div className="flex gap-20 animate-marquee whitespace-nowrap">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-20 items-center">
              <span className="text-[10px] font-black uppercase tracking-[1em] text-black/10">Registry Archive SYNC</span>
              <span className="serif text-4xl italic font-bold text-rose-500">Seoul Metamorphosis</span>
              <span className="text-[10px] font-black uppercase tracking-[1em] text-black/10">Terminal 4 Seongsu</span>
              <span className="serif text-4xl italic font-bold text-black">Structural Minimalism</span>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Registry Showcase */}
      <section className="px-6 md:px-20 py-40 sm:py-60 bg-[#fdfcfb]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-10 reveal">
            <div className="max-w-2xl">
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-rose-500 block mb-10 italic">High Traffic Artifacts</span>
              <h2 className="serif text-5xl sm:text-9xl italic font-light tracking-tighter leading-[0.85]">The <br/><span className="not-italic font-bold">Aura</span> Selection.</h2>
            </div>
            <button onClick={onNavigateToCatalog} className="px-12 py-6 rounded-full border border-black/10 text-[11px] font-black uppercase tracking-[0.5em] hover:bg-black hover:text-white transition-all group">
              Browse Full Catalog <ArrowRight size={18} className="inline ml-6 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-24">
            {featuredProducts.map((p, idx) => (
              <div 
                key={p.id} 
                className={`group cursor-pointer reveal stagger-in relative`}
                style={{ animationDelay: `${idx * 150}ms` }}
                onClick={onNavigateToCatalog}
              >
                {/* Visual Artifact */}
                <div className="aspect-[4/5] bg-slate-100 rounded-[2px] overflow-hidden mb-10 shadow-sm relative accelerate">
                  <img src={p.image} className="w-full h-full object-cover grayscale md:group-hover:grayscale-0 md:group-hover:scale-105 transition-all duration-[1.5s]" alt={p.name} loading="lazy" />
                  
                  {/* Heat Indication Overlay */}
                  <div className="absolute top-6 left-6 flex items-center gap-3">
                        <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-white drop-shadow-lg">Aura: {p.socialHeat || 90}+</span>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 md:group-hover:opacity-100 transition-all duration-700 bg-white/10 backdrop-blur-sm">
                    <div className="bg-black text-white px-8 py-4 rounded-full flex items-center gap-3 shadow-3xl">
                      <Eye size={14} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Examine</span>
                    </div>
                  </div>
                </div>

                {/* Narrative Data */}
                <div className="space-y-4 px-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[9px] font-black uppercase tracking-widest text-black/20 italic">{p.collection}</span>
                    <span className="text-xl font-medium tracking-tighter text-rose-500">${p.price.toFixed(2)}</span>
                  </div>
                  <h4 className="serif text-3xl italic font-bold tracking-tight text-slate-800 leading-none">{p.name}</h4>
                  <div className="h-[1px] w-full bg-black/5 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Synthesis Call: The Matrix Lab */}
      <section className="relative px-6 md:px-20 py-60 bg-[#050505] overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-rose-600/5 blur-[200px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row items-center gap-24 relative z-10">
          <div className="xl:w-3/5 space-y-16 reveal">
            <div className="inline-flex items-center gap-6 px-8 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl">
              <Cpu size={18} className="text-rose-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/60">Neural Core Synthesis // Alpha</span>
            </div>
            
            <h2 className="serif text-6xl md:text-[12rem] italic text-white leading-[0.8] tracking-tighter">
                Dream in <br/><span className="not-italic font-bold text-rose-600">Digital.</span>
            </h2>

            <p className="text-white/30 text-xl md:text-3xl serif italic leading-relaxed max-w-2xl">
                Collaborate with our AI core to synthesize experimental aesthetic configurations. Push the boundaries of the Seongsu Protocol.
            </p>

            <button onClick={onNavigateToLab} className="group flex items-center gap-10 text-white/50 hover:text-white transition-all">
                <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center group-hover:border-rose-500 group-hover:bg-rose-600 transition-all duration-700">
                    <ArrowUpRight size={32} strokeWidth={1} />
                </div>
                <div className="text-left">
                    <span className="text-[10px] font-black uppercase tracking-[0.6em] block mb-2">Initialize Lab</span>
                    <span className="serif text-2xl italic font-light">Experimental Track 04</span>
                </div>
            </button>
          </div>

          <div className="xl:w-2/5 reveal" style={{ transitionDelay: '300ms' }}>
             <div className="aspect-square w-full rounded-[120px] bg-white/[0.02] border border-white/10 p-12 flex items-center justify-center relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-rose-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <Dna size={120} strokeWidth={0.5} className="text-white/10 group-hover:text-rose-500 transition-all duration-[2s] group-hover:rotate-180" />
                <div className="absolute bottom-16 text-center w-full">
                    <span className="text-[9px] font-black uppercase tracking-[1em] text-white/10">Synthesis in Progress</span>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-end">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-md" onClick={() => setIsCartOpen(false)} />
            <div className="relative w-full max-w-xl bg-white h-full shadow-3xl p-8 sm:p-24 flex flex-col animate-in slide-in-from-right duration-500 accelerate">
                <div className="flex justify-between items-center mb-12 sm:mb-20">
                    <h2 className="serif text-4xl sm:text-6xl italic leading-none">The <span className="font-bold not-italic text-rose-600">Collection</span></h2>
                    <button onClick={() => setIsCartOpen(false)} className="p-4 rounded-full border border-slate-50 hover:bg-slate-50"><X size={24} strokeWidth={1} /></button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-10 no-scrollbar">
                    {cart.map((item) => (
                        <div key={item.cartId} className="flex gap-8 items-center group">
                            <img src={item.image} className="w-20 h-24 sm:w-24 sm:h-32 rounded-2xl object-cover grayscale shadow-sm" alt={item.name} />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-black text-[9px] uppercase tracking-[0.3em] opacity-30 truncate">{item.name}</h4>
                                    <button onClick={() => removeFromCart(item.cartId)} className="text-rose-500 p-2"><X size={14}/></button>
                                </div>
                                <p className="serif text-2xl sm:text-3xl italic text-rose-600">${item.price}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-8 mt-8 border-t border-slate-100">
                    <div className="flex justify-between items-baseline mb-8">
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30 italic">Total Value</span>
                        <span className="serif text-4xl sm:text-6xl font-bold tracking-tighter text-rose-600">${cart.reduce((a, b) => a + b.price, 0).toFixed(2)}</span>
                    </div>
                    <button 
                      onClick={handleCheckoutInitiate} 
                      disabled={cart.length === 0 || isProcessingCheckout} 
                      className="w-full bg-black text-white py-6 rounded-full font-black text-[10px] uppercase tracking-[0.5em] hover:bg-rose-600 transition-all disabled:opacity-30 flex items-center justify-center gap-4"
                    >
                      {isProcessingCheckout ? <Loader2 className="animate-spin" /> : 'Confirm Acquisition'}
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
