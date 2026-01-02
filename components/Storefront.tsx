import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, Sparkles, Loader2, ArrowUpRight, Search, Instagram, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { getFashionAdvice, getTrendRadar } from '../geminiService';
import { inventoryService } from '../services/inventoryService';

interface StorefrontProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onNavigateToCatalog: () => void;
  onNavigateToManifesto: () => void;
  onNavigateToLab: () => void;
}

const Storefront: React.FC<StorefrontProps> = ({ products, setProducts, onNavigateToCatalog, onNavigateToManifesto, onNavigateToLab }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [stylingAdvice, setStylingAdvice] = useState<Record<string, string>>({});
  const [loadingAdvice, setLoadingAdvice] = useState<string | null>(null);
  const [trendAlert, setTrendAlert] = useState<string>("");
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  // Initialize cart from persistent storage
  useEffect(() => {
    const savedCart = localStorage.getItem('seoul_muse_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
    
    const fetchTrend = async () => {
      const trend = await getTrendRadar();
      setTrendAlert(trend);
    };
    fetchTrend();
  }, []);

  // Sync cart to storage
  useEffect(() => {
    localStorage.setItem('seoul_muse_cart', JSON.stringify(cart));
  }, [cart]);

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
      // Group items for order
      const items = cart.reduce((acc: any[], item: any) => {
        const existing = acc.find(i => i.productId === item.id);
        if (existing) existing.quantity += 1;
        else acc.push({ productId: item.id, name: item.name, quantity: 1, price: item.price });
        return acc;
      }, []);

      const total = cart.reduce((sum, item) => sum + item.price, 0);
      
      await inventoryService.placeOrder({
        items,
        total,
        customerName: 'Muse Resident',
        customerEmail: 'resident@seoulmuse.com'
      });

      setCart([]);
      setIsCartOpen(false);
      alert("Order Manifested. Your collection is being prepared in Seongsu.");
      
      // Sync products to reflect stock change
      const updatedProducts = await inventoryService.getProducts();
      setProducts(updatedProducts);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const fetchAdvice = async (productName: string, id: string) => {
    if (stylingAdvice[id]) return;
    setLoadingAdvice(id);
    try {
      const advice = await getFashionAdvice(productName);
      setStylingAdvice(prev => ({ ...prev, [id]: String(advice) }));
    } finally {
      setLoadingAdvice(null);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop'; 
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] text-[#0f172a] selection:bg-rose-600 selection:text-white pb-32">
      {/* Editorial Navigation */}
      <nav className="fixed top-0 w-full z-[100] h-28 flex items-center px-8 md:px-20 justify-between bg-white/60 backdrop-blur-xl border-b border-black/[0.02]">
        <div className="flex items-center gap-20">
            <div className="flex flex-col group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                <span className="serif text-4xl font-bold tracking-tighter leading-none">Seoul Muse</span>
            </div>
            <div className="hidden lg:flex items-center gap-14 uppercase text-[10px] font-black tracking-[0.4em] text-black/30">
                <button onClick={onNavigateToCatalog} className="hover:text-rose-500 transition-colors uppercase">The Archives</button>
                <button onClick={onNavigateToManifesto} className="hover:text-rose-500 transition-colors uppercase">Manifesto</button>
                <button onClick={onNavigateToLab} className="hover:text-rose-500 transition-colors uppercase">Lab</button>
            </div>
        </div>
        <div className="flex items-center gap-10">
            <div className="hidden sm:flex items-center gap-4 text-[10px] font-bold text-black/40">
                <Search size={18} strokeWidth={1.5} />
                <span className="tracking-[0.2em]">Curated Search</span>
            </div>
            <div className="relative cursor-pointer group p-2" onClick={() => setIsCartOpen(true)}>
                <ShoppingBag size={24} strokeWidth={1.2} className="group-hover:text-rose-600 transition-colors" />
                {cart.length > 0 && (
                    <span className="absolute top-1 right-1 bg-rose-600 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full">
                        {cart.length}
                    </span>
                )}
            </div>
            <Menu size={24} strokeWidth={1.2} className="cursor-pointer hover:text-rose-600 transition-colors" />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center px-8 md:px-20 pt-40 pb-20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] text-[35rem] font-bold serif leading-none select-none pointer-events-none z-0">
          MUSE
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center w-full relative z-10">
            <div className="lg:col-span-5 flex flex-col items-start stagger-in">
                <div className="flex items-center gap-4 mb-12">
                    <span className="h-[1px] w-14 bg-rose-500" />
                    <span className="text-[11px] font-black uppercase tracking-[0.6em] text-rose-500">Collection No. 04</span>
                </div>
                <h1 className="serif text-[5.5rem] md:text-[9.5rem] leading-[0.8] mb-14">
                    <span className="font-light italic tracking-tight block">Seoul</span>
                    <span className="font-bold tracking-tighter block mt-6">Metamorphosis</span>
                </h1>
                <p className="max-w-md text-black/40 font-medium leading-relaxed mb-20 text-xl italic serif">
                  An exploration of industrial structure and soft draping. Designed in Seongsu-dong, made for the world.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-12">
                    <button 
                      onClick={onNavigateToCatalog}
                      className="bg-black text-white px-16 py-8 rounded-full font-black uppercase text-[11px] tracking-[0.4em] hover:bg-rose-600 transition-all flex items-center gap-10 group shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]"
                    >
                        Explore Exhibit <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                </div>
            </div>

            <div className="lg:col-span-7 relative flex items-center justify-center lg:justify-end">
                <div className="relative aspect-[4/5] w-full max-w-[640px] rounded-[180px] overflow-hidden shadow-[0_80px_120px_-40px_rgba(0,0,0,0.18)] border-[6px] border-white group">
                    <img 
                        src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=2000&auto=format&fit=crop" 
                        alt="Editorial Visual"
                        onError={handleImageError}
                        className="w-full h-full object-cover transition-transform duration-[6s] group-hover:scale-110 ease-out"
                        loading="eager"
                    />
                    <div className="absolute bottom-12 left-12 w-[340px] z-20 animate-in slide-in-from-bottom-10 duration-1000">
                      <div className="bg-black/20 backdrop-blur-3xl p-10 rounded-[60px] border border-white/10 shadow-2xl transition-transform group-hover:-translate-y-4 duration-1000">
                          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/50 block mb-4">Current Exhibit</span>
                          <h4 className="serif text-5xl text-white italic leading-none mb-8">The Seongsu Edit</h4>
                          <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.4em] text-white/30 border-t border-white/5 pt-6">
                              <span>2024 • Seoul Muse</span>
                              <ChevronRight size={16} className="text-rose-500" />
                          </div>
                      </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* AI Trend Sync Banner */}
      <section className="px-8 md:px-20 mb-40">
        <div className="bg-white border border-black/[0.04] p-12 rounded-[70px] flex flex-col md:flex-row items-center justify-between gap-10 shadow-sm relative group overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-rose-600" />
            <div className="flex items-center gap-12">
                <div className="w-16 h-16 bg-rose-50 rounded-[30px] flex items-center justify-center text-rose-500 group-hover:rotate-12 transition-transform">
                    <Sparkles size={30} />
                </div>
                <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-black/20 block mb-2">Seoul Trend Sync</span>
                    <p className="serif text-2xl italic font-medium leading-tight">"{trendAlert || 'Analyzing architectural movements in Cheongdam...'}"</p>
                </div>
            </div>
        </div>
      </section>

      {/* Featured Grid */}
      <section className="px-8 md:px-20 py-10 bg-white">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-48 gap-16">
            <div>
                <span className="text-[11px] font-black uppercase tracking-[0.6em] text-rose-500 block mb-8 italic">Spring / Summer Highlights</span>
                <h2 className="serif text-8xl md:text-[11rem] italic leading-none overflow-hidden">
                   <span className="block hover:translate-x-6 transition-transform duration-1000 cursor-default">The Current</span>
                   <span className="font-bold not-italic tracking-tighter block ml-20 md:ml-60">Artifacts</span>
                </h2>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-72 gap-x-16">
            {products.slice(0, 4).map((product, idx) => {
                const isLeft = idx % 2 === 0;
                return (
                    <div key={product.id} className={`group relative flex flex-col ${isLeft ? 'items-start' : 'items-end md:mt-32'}`}>
                        <div className="relative aspect-[3/4] w-full max-w-xl rounded-[120px] overflow-hidden shadow-[0_80px_100px_-30px_rgba(0,0,0,0.1)] bg-[#F9F8F6] border border-black/[0.03] product-card-reveal flex items-center justify-center">
                            <img 
                                src={product.image} 
                                alt={product.name} 
                                onError={handleImageError}
                                className={`w-full h-full object-cover transition-all duration-[3s] ${product.stock <= 0 ? 'grayscale opacity-50' : ''}`}
                            />
                            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors duration-1000" />
                            <div className="absolute inset-x-12 bottom-12 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-1000">
                                <button 
                                    onClick={() => addToCart(product)}
                                    className="w-full bg-white text-black py-8 rounded-full font-black uppercase tracking-[0.5em] text-[11px] hover:bg-rose-600 hover:text-white transition-all shadow-3xl"
                                >
                                    Acquire Exhibit — ${product.price}
                                </button>
                            </div>
                        </div>

                        <div className={`mt-16 px-8 w-full max-w-lg ${!isLeft ? 'text-right' : ''}`}>
                            <div className={`flex flex-col ${!isLeft ? 'items-end' : 'items-start'} gap-5 mb-10`}>
                                <span className="text-[11px] font-black uppercase tracking-[0.6em] text-rose-500 italic">{product.category}</span>
                                <h3 className="serif text-6xl font-light italic leading-none group-hover:text-rose-600 transition-colors duration-700">
                                    {product.name}
                                </h3>
                            </div>
                            <button 
                                onClick={() => fetchAdvice(product.name, product.id)}
                                disabled={loadingAdvice === product.id}
                                className={`flex items-center gap-5 text-[11px] font-black uppercase tracking-[0.5em] text-black/30 hover:text-rose-600 transition-all disabled:opacity-50 ${!isLeft ? 'flex-row-reverse' : ''}`}
                            >
                                {loadingAdvice === product.id ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={18} />}
                                Analyst Styling Protocol
                            </button>
                            {stylingAdvice[product.id] && (
                                <div className="glass-dark p-12 rounded-[60px] mt-10 text-white animate-in zoom-in-95 duration-700 relative overflow-hidden text-left">
                                    <p className="text-[12px] leading-relaxed font-bold italic whitespace-pre-line uppercase tracking-[0.25em] opacity-80">
                                        {stylingAdvice[product.id]}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
      </section>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[500] flex justify-end">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-1000" onClick={() => setIsCartOpen(false)} />
            <div className="relative w-full max-w-xl bg-white h-full shadow-3xl p-20 md:p-28 flex flex-col animate-in slide-in-from-right duration-700">
                <div className="flex justify-between items-center mb-32">
                    <h2 className="serif text-7xl italic leading-none">Your <br/><span className="font-bold not-italic tracking-tighter">Collection</span></h2>
                    <button onClick={() => setIsCartOpen(false)} className="group p-5 rounded-full border border-black/5 hover:border-rose-500 transition-all">
                        <X className="text-black/30 group-hover:text-rose-500 transition-colors" size={36} strokeWidth={1} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-20 no-scrollbar pr-6">
                    {cart.map((item) => (
                        <div key={item.cartId} className="flex gap-12 items-center group animate-in slide-in-from-bottom-6">
                            <div className="w-32 h-44 rounded-[50px] overflow-hidden shadow-2xl grayscale group-hover:grayscale-0 transition-all">
                                <img src={item.image} className="w-full h-full object-cover" alt={item.name} onError={handleImageError} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-black text-[12px] uppercase tracking-[0.4em] mb-4 opacity-30">{item.name}</h4>
                                    <button onClick={() => removeFromCart(item.cartId)} className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={16}/></button>
                                </div>
                                <p className="serif text-4xl italic text-rose-600">${item.price}</p>
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center opacity-10 italic grayscale text-center">
                            <ShoppingBag size={100} strokeWidth={0.3} className="mb-12" />
                            <p className="serif text-4xl">Archive Empty.</p>
                        </div>
                    )}
                </div>
                <div className="pt-24 mt-12 border-t border-black/[0.04]">
                    <div className="flex justify-between items-center mb-20">
                        <span className="text-[12px] font-black uppercase tracking-[0.6em] opacity-30 italic">Total Value</span>
                        <span className="serif text-6xl font-bold tracking-tighter text-rose-600">${cart.reduce((a, b) => a + b.price, 0).toFixed(2)}</span>
                    </div>
                    <button 
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || isProcessingCheckout}
                        className="w-full bg-black text-white py-10 rounded-full font-black text-[12px] uppercase tracking-[0.6em] hover:bg-rose-600 transition-all shadow-3xl flex items-center justify-center gap-4 disabled:bg-slate-300"
                    >
                        {isProcessingCheckout && <Loader2 className="animate-spin" size={20} />}
                        {isProcessingCheckout ? 'Fulfilling...' : 'Acquire Collection'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Storefront;