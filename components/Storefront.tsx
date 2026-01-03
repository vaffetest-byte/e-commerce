
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShoppingBag, Menu, X, Sparkles, Loader2, ArrowUpRight, 
  Search, ChevronRight, ArrowRight, Globe, 
  Fingerprint, ShieldCheck, CheckCircle2,
  TrendingUp, Star, LogOut, MousePointer2, Cpu
} from 'lucide-react';
import { Product, Customer, HomeConfig, Language, Currency } from '../types';
import { getTrendRadar, getSearchCuration } from '../geminiService';
import { inventoryService } from '../services/inventoryService';
import { DEFAULT_HOME_CONFIG, TRANSLATIONS, CURRENCY_SYMBOLS } from '../constants';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [trendAlert, setTrendAlert] = useState<string>("");
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [homeConfig, setHomeConfig] = useState<HomeConfig>(DEFAULT_HOME_CONFIG);
  
  const [lang, setLang] = useState<Language>('EN');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [isLocOpen, setIsLocOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isAiCurating, setIsAiCurating] = useState(false);
  const [acquisitionSuccess, setAcquisitionSuccess] = useState<string | null>(null);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: (e.clientX / window.innerWidth) - 0.5, y: (e.clientY / window.innerHeight) - 0.5 });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove);
    
    const fetchData = async () => {
      const config = await inventoryService.getHomeConfig();
      setHomeConfig(config);
      setTrendAlert(await getTrendRadar());
    };
    fetchData();

    const savedCart = localStorage.getItem('seoul_muse_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [products]);

  const featuredProducts = useMemo(() => 
    [...products].sort((a, b) => (b.socialHeat || 0) - (a.socialHeat || 0)).slice(0, 4)
  , [products]);

  const removeFromCart = (cartId: number) => setCart(prev => prev.filter(i => i.cartId !== cartId));

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
        shippingAddress: 'Seongsu Atelier Dist. Terminal 4'
      });
      setAcquisitionSuccess(order.id);
      setCart([]);
      setIsCartOpen(false);
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] text-[#0f172a] selection:bg-rose-600 selection:text-white">
      
      {isAuthOpen && <CustomerAuth onSuccess={(c) => { onCustomerLogin(c); setIsAuthOpen(false); }} onClose={() => setIsAuthOpen(false)} />}

      {/* Localization Modal */}
      {isLocOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xl animate-in fade-in" onClick={() => setIsLocOpen(false)} />
          <div className="relative bg-white/90 backdrop-blur-3xl w-full max-w-md rounded-[50px] p-12 shadow-3xl border border-white/20 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-12">
               <h3 className="serif text-3xl italic font-bold">Registry <span className="not-italic font-black">Sync.</span></h3>
               <button onClick={() => setIsLocOpen(false)} className="p-3 hover:bg-black/5 rounded-full transition-colors"><X size={20}/></button>
            </div>
            <div className="space-y-10">
              <div className="space-y-5">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-black/20 block">Matrix Language</span>
                <div className="flex gap-4">
                  {['EN', 'KR'].map(l => (
                    <button key={l} onClick={() => setLang(l as Language)} className={`flex-1 py-4 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest ${lang === l ? 'bg-black text-white border-black' : 'border-black/5 text-black/20 hover:text-black hover:border-black'}`}>{l}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-5">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-black/20 block">Value Units</span>
                <div className="flex gap-4">
                  {['USD', 'KRW', 'EUR'].map(c => (
                    <button key={c} onClick={() => setCurrency(c as Currency)} className={`flex-1 py-4 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest ${currency === c ? 'bg-rose-500 text-white border-rose-500' : 'border-black/5 text-black/20 hover:text-black hover:border-black'}`}>{c}</button>
                  ))}
                </div>
              </div>
              <button onClick={() => setIsLocOpen(false)} className="w-full bg-black text-white py-6 rounded-full font-black uppercase tracking-[0.3em] text-[10px] mt-6 shadow-2xl hover:bg-rose-600 transition-all">Confirm Synchronisation</button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-[1000] h-24 md:h-32 flex items-center px-6 md:px-24 justify-between transition-all duration-700 ${scrollY > 50 ? 'bg-white/80 backdrop-blur-2xl border-b border-black/[0.03]' : 'bg-transparent'}`}>
        <div className="flex items-center gap-20">
            <button className="flex flex-col group text-left" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                <span className="serif text-2xl md:text-4xl font-bold tracking-tighter leading-none group-hover:text-rose-500 transition-colors">Seoul Muse</span>
                <span className="text-[7px] font-black tracking-[0.6em] text-black/20 mt-1 uppercase hidden xs:block">Neural Archive // V4.2</span>
            </button>
        </div>

        <div className="flex items-center gap-16">
            <div className="hidden lg:flex items-center gap-16 text-[9px] font-black uppercase tracking-[0.4em] text-black/30">
                <button onClick={onNavigateToCatalog} className="hover:text-black transition-all hover:tracking-[0.6em]">{t.archive}</button>
                <button onClick={onNavigateToManifesto} className="hover:text-black transition-all hover:tracking-[0.6em]">{t.manifesto}</button>
                <button onClick={onNavigateToLab} className="hover:text-black transition-all hover:tracking-[0.6em]">{t.lab}</button>
                <div className="h-6 w-[1px] bg-black/5" />
                <button onClick={() => setIsLocOpen(true)} className="flex items-center gap-3 group text-black/20 hover:text-black transition-all">
                  <Globe size={14} className="group-hover:rotate-180 transition-transform duration-1000" /> {lang} / {currency}
                </button>
            </div>
            
            <div className="flex items-center gap-4 sm:gap-10">
                {currentCustomer ? (
                  <button className="hidden sm:flex items-center gap-4 group" onClick={() => { if(window.confirm('Terminate Session?')) onCustomerLogout(); }}>
                    <div className="w-10 h-10 rounded-full bg-slate-50 border border-black/5 flex items-center justify-center group-hover:border-rose-500 transition-all">
                      <Fingerprint size={16} className="text-rose-500" />
                    </div>
                    <span className="text-rose-500 italic serif normal-case text-lg lowercase">@{currentCustomer.name.toLowerCase()}</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsAuthOpen(true)} 
                    className="relative px-8 py-3 rounded-full border border-rose-500 text-rose-500 font-black text-[9px] uppercase tracking-[0.4em] hover:bg-rose-500 hover:text-white transition-all overflow-hidden group shadow-lg shadow-rose-500/10"
                  >
                    <span className="relative z-10">{t.identify}</span>
                    <div className="absolute inset-0 bg-rose-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  </button>
                )}

                <div className="flex items-center gap-6">
                    <button onClick={() => setIsSearchActive(true)} className="p-2 hover:text-rose-500 transition-colors"><Search size={22} strokeWidth={1} /></button>
                    <button className="relative p-2" onClick={() => setIsCartOpen(true)}>
                        <ShoppingBag size={22} strokeWidth={1} />
                        {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-black w-5 h-5 flex items-center justify-center rounded-full animate-in zoom-in">{cart.length}</span>}
                    </button>
                    <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2"><Menu size={24} strokeWidth={1.5}/></button>
                </div>
            </div>
        </div>
      </nav>

      {/* Cinematic Hero Section */}
      <section className="relative h-[110vh] flex items-center px-6 md:px-24 overflow-hidden bg-white">
        {/* Subtle HUD UI */}
        <div className="absolute top-40 left-24 hidden xl:block space-y-6 opacity-30">
            <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                <span className="text-[8px] font-black tracking-[0.8em] uppercase">Status: Operational</span>
            </div>
            <div className="h-[1px] w-48 bg-black/10" />
            <div className="text-[7px] font-mono leading-loose uppercase tracking-widest">
                Lat: 37.5665 N<br/>
                Lng: 126.9780 E<br/>
                Protocol: ARCH_V4
            </div>
        </div>

        {/* Hero Background Elements */}
        <div className="absolute inset-0 z-0 opacity-[0.03] text-[20vw] sm:text-[40rem] font-bold serif pointer-events-none select-none accelerate leading-none"
             style={{ transform: `translate3d(calc(${mousePos.x * -60}px), calc(10% + ${scrollY * 0.2}px), 0)` }}>
            MUSE
        </div>
        
        <div className="scan-line" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center w-full relative z-10 pt-32">
            <div className="lg:col-span-7 flex flex-col items-start stagger-in">
                <div className="inline-flex items-center gap-6 px-6 py-2 rounded-full border border-black/5 bg-slate-50/50 backdrop-blur-md mb-12 shadow-sm">
                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
                    <span className="text-[8px] font-black uppercase tracking-[0.5em] text-rose-500 italic">{homeConfig.hero.registryLabel}</span>
                </div>
                
                <h1 className="serif text-8xl sm:text-9xl md:text-[16rem] leading-[0.75] font-bold tracking-tighter mb-16 text-slate-900">
                   <span className="font-light italic block opacity-90 transition-transform duration-[2s]" 
                    style={{ transform: `translate3d(${scrollY * -0.05}px, 0, 0) rotate(${scrollY * -0.003}deg)` }}>
                    {homeConfig.hero.headingPart1}
                   </span> 
                   <span className="block translate-x-4 md:translate-x-12" style={{ transform: `translate3d(${scrollY * 0.03}px, 0, 0)` }}>
                     {homeConfig.hero.headingPart2}<span className="text-rose-500 font-light">.</span>
                   </span>
                </h1>

                <p className="max-w-xl text-black/40 text-xl md:text-3xl italic serif leading-relaxed mb-20 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
                   {homeConfig.hero.subheading}
                </p>

                <div className="flex flex-col sm:flex-row gap-10 items-center w-full sm:w-auto">
                    <button onClick={onNavigateToCatalog} className="w-full sm:w-auto bg-black text-white px-24 py-10 rounded-full font-black uppercase text-[10px] tracking-[0.5em] hover:bg-rose-600 transition-all flex items-center justify-center gap-12 shadow-3xl group relative overflow-hidden">
                        <span className="relative z-10">Identify Archives</span>
                        <ArrowUpRight size={24} className="relative z-10 group-hover:rotate-45 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                    </button>
                    <div className="flex items-center gap-6 group cursor-pointer" onClick={onNavigateToManifesto}>
                        <div className="w-16 h-16 rounded-full border border-black/10 flex items-center justify-center group-hover:border-rose-500 transition-all duration-700">
                            <MousePointer2 size={20} className="group-hover:text-rose-500 transition-transform group-hover:scale-125" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-black/30 group-hover:text-black transition-colors">The Manifesto</span>
                    </div>
                </div>
            </div>
            
            <div className="lg:col-span-5 flex justify-end relative">
                <div className="relative aspect-[4/5] w-full max-w-[500px] rounded-[240px] overflow-hidden shadow-[0_120px_240px_-40px_rgba(0,0,0,0.15)] border border-black/5 group">
                    <img 
                      src={homeConfig.hero.image} 
                      className="w-full h-full object-cover grayscale brightness-105 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[4s] ease-out" 
                      alt="The Seoul Muse" 
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="absolute top-12 right-12 p-5 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl animate-float">
                        <Sparkles size={24} className="text-rose-500" />
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Grid Collections Preview */}
      <section className="px-6 md:px-24 py-60 bg-[#fdfcfb]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-40 gap-10 reveal">
            <div className="max-w-3xl">
              <span className="text-[9px] font-black uppercase tracking-[0.8em] text-rose-500 block mb-12 italic uppercase">{homeConfig.aura.subheading}</span>
              <h2 className="serif text-7xl sm:text-9xl md:text-[11rem] italic font-light tracking-tighter leading-[0.8]">
                 Featured <br/><span className="not-italic font-bold text-slate-900">{homeConfig.aura.heading.split(' ')[0]}</span>.
              </h2>
            </div>
            <button onClick={onNavigateToCatalog} className="px-16 py-8 rounded-full border border-black/10 text-[10px] font-black uppercase tracking-[0.5em] hover:bg-black hover:text-white transition-all group shadow-sm">
              Enter Gallery <ArrowRight size={20} className="inline ml-10 group-hover:translate-x-3 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-32">
            {featuredProducts.map((p, idx) => (
              <div 
                key={p.id} 
                className="group cursor-pointer reveal stagger-in"
                style={{ transitionDelay: `${idx * 150}ms` }}
                onClick={onNavigateToCatalog}
              >
                <div className="aspect-[3/4] bg-slate-100 rounded-3xl overflow-hidden mb-10 shadow-sm relative hover-zoom">
                  <img src={p.image} className="w-full h-full object-cover grayscale md:group-hover:grayscale-0" alt={p.name} loading="lazy" />
                  <div className="absolute bottom-8 left-8 flex items-center gap-4 bg-white/20 backdrop-blur-xl px-6 py-2 rounded-full border border-white/10">
                        <TrendingUp size={14} className="text-rose-500" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-white">Heat: {p.socialHeat || 90}+</span>
                  </div>
                </div>
                <div className="space-y-4 px-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[8px] font-black uppercase tracking-widest text-black/20 italic">{p.category}</span>
                    <span className="text-xl font-medium tracking-tighter text-rose-500">${p.price.toFixed(2)}</span>
                  </div>
                  <h4 className="serif text-4xl italic font-bold tracking-tight text-slate-800">{p.name}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Synthesis Lab Synthesis UI (Refined Lab) */}
      <section className="relative px-6 md:px-24 py-80 bg-[#050505] overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-rose-600/[0.03] blur-[200px] pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row items-center gap-40">
          <div className="xl:w-3/5 space-y-20 reveal">
            <div className="inline-flex items-center gap-8 px-8 py-4 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-3xl">
              <Cpu size={20} className="text-rose-500" />
              <span className="text-[9px] font-black uppercase tracking-[0.6em] text-white/40">{homeConfig.lab.trackLabel}</span>
            </div>
            <h2 className="serif text-8xl md:text-[14rem] italic text-white leading-[0.7] tracking-tighter">
                Visual <br/><span className="not-italic font-bold text-rose-600">Synthesis</span>.
            </h2>
            <p className="text-white/30 text-2xl md:text-4xl serif italic leading-relaxed max-w-3xl">
                The Lab is the heart of the Seongsu Protocol. Here, AI models curated by Gemini curate the next iteration of the Muse identity.
            </p>
            <button onClick={onNavigateToLab} className="group flex items-center gap-14 text-white/50 hover:text-white transition-all">
                <div className="w-24 h-24 rounded-full border border-white/5 flex items-center justify-center group-hover:border-rose-500 group-hover:bg-rose-500 transition-all duration-700 shadow-2xl">
                    <ArrowUpRight size={40} strokeWidth={1} />
                </div>
                <div className="text-left">
                    <span className="text-[11px] font-black uppercase tracking-[0.8em] block mb-3 text-rose-500">Initialize Lab</span>
                    <span className="serif text-3xl italic font-light">Experimental Protocol</span>
                </div>
            </button>
          </div>
          
          <div className="xl:w-2/5 reveal">
            <div className="relative aspect-square w-full rounded-[140px] overflow-hidden group shadow-3xl border border-white/10 bg-slate-900">
              <img src={homeConfig.lab.image} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[4s]" alt="Neural Terminal" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
              <div className="absolute bottom-20 left-0 w-full text-center px-12">
                  <div className="h-[2px] w-2/3 bg-rose-500/30 mx-auto mb-8 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[1em] text-white/40">Terminal Active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer onNavigateToCatalog={onNavigateToCatalog} onNavigateToManifesto={onNavigateToManifesto} onNavigateToLab={onNavigateToLab} />
    </div>
  );
};

export default Storefront;
