import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, User, Menu, Heart, X, Sparkles, Loader2, ArrowRight, Instagram, Youtube, Zap, Camera, Bookmark, Play, ArrowUpRight } from 'lucide-react';
import { Product } from '../types';
import { getFashionAdvice, getTrendRadar } from '../geminiService';

interface StorefrontProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const Storefront: React.FC<StorefrontProps> = ({ products, setProducts }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [stylingAdvice, setStylingAdvice] = useState<Record<string, string>>({});
  const [loadingAdvice, setLoadingAdvice] = useState<string | null>(null);
  const [trendAlert, setTrendAlert] = useState<string>("Seoul is dreaming of silk ribbons...");

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        const trend = await getTrendRadar();
        // Defensive: Force to primitive string
        setTrendAlert(String(trend || "Ribbon-core is taking over the streets of Hongdae!"));
      } catch (e) {
        setTrendAlert("Ribbon-core is taking over the streets of Hongdae!");
      }
    };
    fetchTrend();
  }, []);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart([...cart, product]);
    setIsCartOpen(true);
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: p.stock - 1 } : p));
  };

  const fetchAdvice = async (productName: string, id: string) => {
    if (stylingAdvice[id]) return;
    setLoadingAdvice(id);
    try {
      const advice = await getFashionAdvice(productName);
      // Defensive: Force to primitive string
      const safeAdvice = String(advice || "Vibe: Romantic | Pair with: Pearl Earrings | Occasion: Seoul Cafe Hopping");
      setStylingAdvice(prev => ({ ...prev, [id]: safeAdvice }));
    } catch (e) {
      setStylingAdvice(prev => ({ ...prev, [id]: "Vibe: Romantic | Pair with: Pearl Earrings | Occasion: Seoul Cafe Hopping" }));
    } finally {
      setLoadingAdvice(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffcfc] text-slate-900 overflow-x-hidden">
      {/* Editorial Header */}
      <nav className="fixed top-0 w-full z-[100] bg-white/10 backdrop-blur-xl border-b border-black/5 h-20 flex items-center px-12 justify-between">
        <div className="flex items-center gap-12">
            <span className="serif text-3xl font-bold italic tracking-tighter">Seoul Muse</span>
            <div className="hidden lg:flex items-center gap-8 uppercase text-[10px] font-black tracking-[0.3em] opacity-40">
                <a href="#" className="hover:opacity-100 transition-opacity">Archive</a>
                <a href="#" className="hover:opacity-100 transition-opacity">Manifesto</a>
                <a href="#" className="hover:opacity-100 transition-opacity">Lab</a>
            </div>
        </div>
        <div className="flex items-center gap-8">
            <div className="relative group cursor-pointer" onClick={() => setIsCartOpen(true)}>
                <ShoppingBag size={20} strokeWidth={1.5} />
                {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">
                        {cart.length}
                    </span>
                )}
            </div>
            <Menu size={20} strokeWidth={1.5} className="cursor-pointer" />
        </div>
      </nav>

      {/* The "Magazine Cover" Hero */}
      <section className="relative h-screen flex flex-col md:flex-row items-center px-6 md:px-24 pt-32 pb-12 gap-12">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-rose-50/50 -z-10" />
        
        {/* Left Text Layer */}
        <div className="w-full md:w-1/2 flex flex-col justify-center relative z-10">
            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-rose-500 mb-8 block">Volume 04 — The Silk Road</span>
            <h1 className="serif text-[5rem] md:text-[10rem] leading-[0.85] font-light mb-12 italic">
                Aesthetic <br />
                <span className="not-italic font-bold tracking-tighter ml-12">Reverie</span>
            </h1>
            <p className="max-w-md text-slate-400 font-medium leading-relaxed mb-12">
                A curated dialogue between Seoul's underground scene and classic feminine silhouettes. Discover the Muse within.
            </p>
            <div className="flex items-center gap-8">
                <button className="bg-black text-white px-12 py-6 rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-rose-500 transition-all flex items-center gap-4 group shadow-2xl">
                    View Lookbook
                    <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
                <div className="flex -space-x-4">
                    {[1,2,3].map(i => (
                        <div key={i} className="w-12 h-12 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="Muse" />
                        </div>
                    ))}
                    <div className="w-12 h-12 rounded-full border-2 border-white bg-rose-500 flex items-center justify-center text-[10px] font-black text-white">
                        +8k
                    </div>
                </div>
            </div>
        </div>

        {/* Right Visual Layer */}
        <div className="w-full md:w-1/2 h-full relative">
            <div className="relative w-full h-full rounded-[100px] overflow-hidden group shadow-2xl">
                <img 
                    src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=2000" 
                    className="w-full h-full object-cover grayscale transition-all duration-[3000ms] group-hover:grayscale-0 group-hover:scale-105"
                    alt="Hero Muse"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-12 left-12">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[40px] text-white">
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2 block">Current Exhibit</span>
                        <h4 className="serif text-2xl italic">The Seongsu Edit</h4>
                    </div>
                </div>
            </div>
            
            {/* Floating Accents */}
            <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full border border-black/5 flex items-center justify-center text-[8px] font-black uppercase tracking-[0.5em] animate-spin-slow">
                <span className="absolute inset-0 flex items-center justify-center text-center p-4">Seoul Muse • Est 2024 • Seoul Muse</span>
            </div>
        </div>
      </section>

      {/* Live Trend Radar - Floating Bento */}
      <section className="px-6 md:px-24 py-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-slate-900 rounded-[60px] p-16 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 text-white/5 group-hover:text-rose-500/10 transition-colors">
                    <Sparkles size={200} />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-12 h-px bg-rose-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500">Live Seoul Radar</span>
                    </div>
                    <h2 className="serif text-5xl md:text-7xl italic leading-tight mb-8">
                        "{trendAlert}"
                    </h2>
                    <p className="text-white/40 max-w-lg font-medium leading-relaxed">
                        Our Gemini-powered Lab is currently tracing social heat across the Gangnam and Hongdae districts to bring you the next viral silhouette.
                    </p>
                </div>
            </div>
            <div className="bg-rose-100 rounded-[60px] p-12 flex flex-col justify-center items-center text-center gap-8">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl">
                    <Play size={24} className="text-rose-500 fill-rose-500 ml-1" />
                </div>
                <h3 className="serif text-3xl font-bold">Behind the Seams</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Watch the Spring Film</p>
            </div>
        </div>
      </section>

      {/* Dynamic Product Grid */}
      <section className="px-6 md:px-24 py-20 bg-white">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12">
            <div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 block mb-4">Curated Objects</span>
                <h2 className="serif text-6xl italic">The Spring <span className="not-italic font-bold tracking-tighter">Inventory</span></h2>
            </div>
            <div className="flex gap-8 overflow-x-auto no-scrollbar pb-2">
                {['All', 'Dresses', 'Tops', 'Skirts', 'Co-ords'].map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`whitespace-nowrap uppercase text-[10px] font-black tracking-[0.4em] transition-all ${
                            activeCategory === cat ? 'text-rose-500 border-b border-rose-500 pb-2' : 'text-slate-300 hover:text-slate-500'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-32">
            {products.filter(p => activeCategory === 'All' || p.category === activeCategory).map(product => (
                <div key={product.id} className="group relative">
                    <div className="aspect-[4/5] rounded-[60px] overflow-hidden mb-8 relative shadow-xl transition-all duration-700 hover:shadow-3xl bg-slate-100">
                        <img 
                            src={product.image} 
                            alt={product.name} 
                            className={`w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110 ${product.stock <= 0 ? 'grayscale brightness-50' : ''}`}
                        />
                        
                        {product.stock <= 0 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.4em] border border-white/20">
                                    Archive Only
                                </span>
                            </div>
                        )}

                        {product.stock > 0 && (
                            <div className="absolute inset-x-8 bottom-8 translate-y-20 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                <button 
                                    onClick={() => addToCart(product)}
                                    className="w-full bg-white/95 backdrop-blur-md text-black py-5 rounded-[30px] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-rose-500 hover:text-white transition-all shadow-2xl"
                                >
                                    Secure Item — ${product.price}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="px-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="serif text-3xl font-bold tracking-tight mb-1 group-hover:text-rose-500 transition-colors">
                                    {product.name}
                                </h3>
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">{product.category} • SKU-{product.sku}</p>
                            </div>
                            <span className="serif text-2xl italic text-rose-500">${product.price}</span>
                        </div>

                        {/* AI Stylist */}
                        {!stylingAdvice[product.id] ? (
                            <button 
                                onClick={() => fetchAdvice(product.name, product.id)}
                                disabled={loadingAdvice === product.id}
                                className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-rose-300 hover:text-rose-500 transition-colors disabled:opacity-50"
                            >
                                {loadingAdvice === product.id ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                Digital Stylist Entry
                            </button>
                        ) : (
                            <div className="bg-slate-50 p-6 rounded-[30px] mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                <p className="text-[11px] leading-relaxed font-bold text-slate-500 italic">
                                    "{stylingAdvice[product.id]}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-slate-900 text-white py-32 px-12 md:px-24 mt-40">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-24">
            <div className="md:col-span-2">
                <span className="serif text-5xl italic block mb-12">Seoul Muse</span>
                <p className="max-w-md text-white/30 font-medium leading-relaxed">
                    Designed in Seoul, distributed globally. We are a collection of dreamers redefining the digital boutique experience.
                </p>
            </div>
            <div>
                <h5 className="text-[10px] font-black uppercase tracking-[0.4em] mb-10 text-rose-500">Network</h5>
                <ul className="space-y-6 text-[11px] font-bold tracking-widest uppercase opacity-40">
                    <li className="hover:opacity-100 transition-opacity cursor-pointer">Instagram</li>
                    <li className="hover:opacity-100 transition-opacity cursor-pointer">Discord</li>
                    <li className="hover:opacity-100 transition-opacity cursor-pointer">Muse Lab</li>
                </ul>
            </div>
            <div>
                <h5 className="text-[10px] font-black uppercase tracking-[0.4em] mb-10 text-rose-500">Concierge</h5>
                <ul className="space-y-6 text-[11px] font-bold tracking-widest uppercase opacity-40">
                    <li className="hover:opacity-100 transition-opacity cursor-pointer">Shipping</li>
                    <li className="hover:opacity-100 transition-opacity cursor-pointer">Returns</li>
                    <li className="hover:opacity-100 transition-opacity cursor-pointer">Sizing</li>
                </ul>
            </div>
        </div>
      </footer>

      {/* Mini Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-12 flex flex-col animate-in slide-in-from-right duration-500">
                <div className="flex justify-between items-center mb-12">
                    <h2 className="serif text-4xl italic">Bag ({cart.length})</h2>
                    <X className="cursor-pointer opacity-20 hover:opacity-100" onClick={() => setIsCartOpen(false)} />
                </div>
                <div className="flex-1 overflow-y-auto space-y-12">
                    {cart.map((item, idx) => (
                        <div key={idx} className="flex gap-6 items-center">
                            <img src={item.image} className="w-20 h-28 object-cover rounded-2xl shadow-lg" alt={item.name} />
                            <div>
                                <h4 className="font-black text-xs uppercase tracking-widest mb-2">{item.name}</h4>
                                <p className="serif text-xl italic text-rose-500">${item.price}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="pt-12 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-8">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Subtotal</span>
                        <span className="serif text-3xl font-bold">${cart.reduce((a, b) => a + b.price, 0)}</span>
                    </div>
                    <button className="w-full bg-black text-white py-6 rounded-full font-black text-[10px] uppercase tracking-[0.3em] hover:bg-rose-500 transition-all shadow-2xl">
                        Checkout Securely
                    </button>
                </div>
            </div>
        </div>
      )}

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Storefront;