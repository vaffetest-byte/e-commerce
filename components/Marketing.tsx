
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Ticket, Plus, Tag, Calendar, BarChart3, Trash2, 
  Loader2, Sparkles, Sliders, Layout, Image as ImageIcon,
  CheckCircle2, AlertCircle, TrendingUp, Zap, Hexagon,
  Percent, DollarSign, Globe, Layers, ArrowUpRight,
  Mail, ShoppingCart, Clock, Send
} from 'lucide-react';
import { Coupon, HomeConfig, AbandonedCart } from '../types';
import { inventoryService } from '../services/inventoryService';

interface MarketingProps {
  onUpdateCoupon: () => void;
}

const Marketing: React.FC<MarketingProps> = ({ onUpdateCoupon }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'coupons' | 'seasonal' | 'dynamic' | 'abandoned'>('coupons');
  const [homeConfig, setHomeConfig] = useState<HomeConfig | null>(null);

  const fetchRegistryData = useCallback(async () => {
    setLoading(true);
    try {
      const [couponData, configData, abandonedData] = await Promise.all([
        inventoryService.getCoupons(),
        inventoryService.getHomeConfig(),
        inventoryService.getAbandonedCarts()
      ]);
      setCoupons(couponData);
      setHomeConfig(configData);
      setAbandonedCarts(abandonedData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistryData();
  }, [fetchRegistryData]);

  const generateCoupon = async () => {
    const codes = ['MUSE2024', 'SEOULSTYLE', 'ATELIER15', 'ARCHIVE10', 'SILKROAD'];
    const randomCode = codes[Math.floor(Math.random() * codes.length)] + Math.floor(Math.random() * 100);
    
    const newCoupon: Coupon = {
      id: '',
      code: randomCode,
      discountType: 'Percentage',
      value: 15,
      expiryDate: '2024-12-31',
      usageCount: 0,
      status: 'Active'
    };

    await inventoryService.saveCoupon(newCoupon);
    await fetchRegistryData();
    onUpdateCoupon();
  };

  const deleteCoupon = async (id: string) => {
    if (!window.confirm("Terminate this growth campaign permanently? This coupon code will no longer function.")) return;
    await inventoryService.deleteCoupon(id);
    await fetchRegistryData();
    onUpdateCoupon();
  };

  const toggleSeasonal = async () => {
    if (!homeConfig) return;
    const updated = {
      ...homeConfig,
      seasonalOffer: {
        active: !homeConfig.seasonalOffer?.active,
        title: homeConfig.seasonalOffer?.title || 'Seoul Summer Metamorphosis',
        discount: homeConfig.seasonalOffer?.discount || 15
      }
    };
    await inventoryService.saveHomeConfig(updated);
    setHomeConfig(updated);
  };

  const handleSendRecovery = async (id: string) => {
    await inventoryService.sendRecoveryEmail(id);
    alert("Recovery sequence initialized. Email protocol dispatched.");
    fetchRegistryData();
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 pb-12 px-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-rose-500 block mb-6 italic">Growth Logistics // Strategy Matrix</span>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-900 serif italic">Promotional <span className="not-italic font-black text-rose-600">Engine</span></h1>
        </div>
        <div className="flex flex-wrap gap-4 bg-white p-2 rounded-[32px] border border-slate-100 shadow-sm">
            {[
              { id: 'coupons', label: 'Matrix Keys', icon: Ticket },
              { id: 'seasonal', label: 'Seasonal Logic', icon: Layers },
              { id: 'dynamic', label: 'Neural Pricing', icon: Zap },
              { id: 'abandoned', label: 'Recovery Log', icon: ShoppingCart }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-8 py-4 rounded-3xl text-[9px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${activeTab === tab.id ? 'bg-black text-white shadow-xl' : 'text-slate-300 hover:text-slate-900'}`}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
        </div>
      </div>

      {activeTab === 'abandoned' && (
        <div className="space-y-12 animate-in slide-in-from-right-10 duration-500 px-4">
          <div className="flex justify-between items-center mb-8">
             <h3 className="serif text-3xl font-bold italic text-slate-800">Abandoned <span className="not-italic font-light opacity-30">// Recovery</span></h3>
             <div className="bg-rose-50 text-rose-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100">
                {abandonedCarts.length} Critical Units Detected
             </div>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {abandonedCarts.map(cart => (
              <div key={cart.id} className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center group hover:shadow-xl transition-all">
                <div className="flex items-center gap-10">
                  <div className="w-16 h-16 bg-slate-50 rounded-[24px] flex items-center justify-center text-slate-300 group-hover:bg-rose-50 group-hover:text-rose-500 transition-all">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900">{cart.customerName}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{cart.customerEmail}</p>
                    <div className="flex items-center gap-6 mt-4">
                      <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-300">
                        <Clock size={12} /> Last Seen {cart.lastActive}
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-black uppercase text-rose-500">
                        <DollarSign size={12} /> Value: ${cart.totalValue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-8 md:mt-0">
                  {cart.recoverySent ? (
                    <div className="flex items-center gap-3 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                      <CheckCircle2 size={16} /> Dispatched
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleSendRecovery(cart.id)}
                      className="bg-black text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-4 hover:bg-rose-600 transition-all shadow-xl"
                    >
                      <Send size={14} /> Send Protocol
                    </button>
                  )}
                  <button className="p-4 text-slate-200 hover:text-slate-900 transition-colors">
                    <ArrowUpRight size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'coupons' && (
        <div className="space-y-12 animate-in slide-in-from-right-10 duration-500">
          <div className="flex justify-between items-center px-4">
             <h3 className="serif text-3xl font-bold italic text-slate-800">Registry Keys <span className="not-italic font-light opacity-30">// Coupons</span></h3>
             <button 
                onClick={generateCoupon}
                className="bg-black text-white px-10 py-5 rounded-[24px] flex items-center gap-4 font-black uppercase tracking-widest text-[10px] hover:bg-rose-600 transition-all shadow-2xl shadow-slate-100"
              >
                  <Plus size={18} /> Generate New Key
              </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {loading ? (
              <div className="col-span-full py-40 flex justify-center"><Loader2 className="animate-spin text-rose-500" size={32} /></div>
            ) : coupons.length === 0 ? (
              <div className="col-span-full py-40 text-center bg-white rounded-[80px] border border-dashed border-slate-200">
                  <Ticket size={48} className="mx-auto text-slate-100 mb-8" strokeWidth={1} />
                  <p className="text-xl serif italic text-slate-300">No active keys detected in current matrix cycle.</p>
              </div>
            ) : coupons.map(coupon => (
                <div key={coupon.id} className="relative bg-white rounded-[60px] border border-slate-100 overflow-hidden group hover:shadow-3xl transition-all">
                    <div className="absolute top-1/2 -left-4 w-8 h-8 bg-slate-50 border-r border-slate-100 rounded-full -translate-y-1/2" />
                    <div className="absolute top-1/2 -right-4 w-8 h-8 bg-slate-50 border-l border-slate-100 rounded-full -translate-y-1/2" />
                    
                    <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3 bg-slate-900 p-12 flex flex-col items-center justify-center text-center gap-6 relative group-hover:bg-rose-600 transition-colors duration-700">
                            <Hexagon size={32} className="text-rose-500 group-hover:text-white transition-colors" />
                            <div>
                                <h4 className="text-4xl font-black text-white tracking-tighter">{coupon.value}{coupon.discountType === 'Percentage' ? '%' : '$'}</h4>
                                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 mt-2">Matrix Offset</p>
                            </div>
                        </div>
                        <div className="flex-1 p-12 flex flex-col justify-center">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h3 className="text-2xl font-black tracking-widest mb-2 font-mono">{coupon.code}</h3>
                                    <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${coupon.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                        {coupon.status}
                                    </span>
                                </div>
                                <button 
                                    onClick={() => deleteCoupon(coupon.id)} 
                                    className="p-4 text-slate-200 hover:text-rose-600 hover:bg-rose-50 rounded-[20px] transition-all"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-10 pt-10 border-t border-slate-50">
                                <div className="space-y-2">
                                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest block">Operational Until</span>
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <Calendar size={14} className="text-rose-500" />
                                        <span className="text-[10px] font-black uppercase">{coupon.expiryDate}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest block">Registry Redemptions</span>
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <TrendingUp size={14} className="text-emerald-500" />
                                        <span className="text-[10px] font-black uppercase">{coupon.usageCount} Entities</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'seasonal' && homeConfig && (
        <div className="space-y-12 animate-in slide-in-from-right-10 duration-500 max-w-5xl mx-auto">
            <div className="bg-white p-12 md:p-20 rounded-[80px] border border-slate-100 shadow-2xl space-y-16">
               <div className="flex justify-between items-center">
                  <div>
                     <h3 className="serif text-5xl font-light italic tracking-tighter">Seasonal <span className="not-italic font-black">Logic.</span></h3>
                     <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mt-4">Global Matrix Override</p>
                  </div>
                  <button 
                    onClick={toggleSeasonal}
                    className={`w-20 h-10 rounded-full relative transition-all duration-700 ${homeConfig.seasonalOffer?.active ? 'bg-rose-500 shadow-xl shadow-rose-100' : 'bg-slate-200'}`}
                  >
                     <div className={`absolute top-1.5 w-7 h-7 bg-white rounded-full transition-all duration-700 shadow-md ${homeConfig.seasonalOffer?.active ? 'left-11' : 'left-2'}`} />
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Event Designation</label>
                     <input 
                       type="text" 
                       defaultValue={homeConfig.seasonalOffer?.title} 
                       className="w-full px-8 py-6 bg-slate-50 rounded-[30px] text-xs font-black uppercase tracking-widest outline-none border border-transparent focus:border-rose-500" 
                     />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Global Matrix Offset (%)</label>
                     <div className="relative">
                        <input 
                          type="number" 
                          defaultValue={homeConfig.seasonalOffer?.discount} 
                          className="w-full px-8 py-6 bg-slate-50 rounded-[30px] text-xs font-black outline-none border border-transparent focus:border-rose-500" 
                        />
                        <Percent className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                     </div>
                  </div>
               </div>

               <div className="bg-rose-50 p-12 rounded-[50px] border border-rose-100 flex items-center gap-10">
                  <div className="w-20 h-20 bg-rose-500 rounded-[30px] flex items-center justify-center text-white shadow-xl rotate-3">
                     <Sparkles size={32} />
                  </div>
                  <div className="flex-1">
                     <h4 className="text-[11px] font-black uppercase tracking-widest text-rose-950 mb-2">Registry Dynamic Synthesis</h4>
                     <p className="text-xs text-rose-800/60 leading-relaxed italic serif">
                       "Activating seasonal logic applies a global discount coefficient across the entire Atelier Registry. This logic overrides individual product pricing protocols."
                     </p>
                  </div>
               </div>

               <button className="w-full py-10 bg-black text-white rounded-full font-black uppercase tracking-[0.6em] text-[11px] hover:bg-rose-600 transition-all shadow-3xl">
                  Sync Global Matrix
               </button>
            </div>
        </div>
      )}

      {activeTab === 'dynamic' && (
        <div className="space-y-12 animate-in slide-in-from-right-10 duration-500">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { title: 'Market Velocity', val: 'Low', icon: TrendingUp, color: 'text-indigo-500', desc: 'Registry inquiry speed below threshold.' },
                { title: 'Seongsu Heat', val: '94%', icon: Zap, color: 'text-rose-500', desc: 'Regional boutique density increasing.' },
                { title: 'Optimal Surcharge', val: '+4.2%', icon: Globe, color: 'text-emerald-500', desc: 'Neural synthesis suggests value adjustment.' }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-12 rounded-[60px] border border-slate-100 shadow-sm group hover:shadow-2xl transition-all">
                   <div className={`w-14 h-14 rounded-3xl bg-slate-50 flex items-center justify-center ${stat.color} mb-8 group-hover:scale-110 transition-transform`}>
                      <stat.icon size={24} />
                   </div>
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2">{stat.title}</h4>
                   <p className="text-3xl font-black text-slate-900 tracking-tighter mb-4">{stat.val}</p>
                   <p className="text-[9px] text-slate-400 font-medium uppercase leading-relaxed">{stat.desc}</p>
                </div>
              ))}
           </div>

           <div className="bg-[#0A0A0A] p-16 md:p-24 rounded-[80px] text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-[40%] h-full bg-rose-600/5 blur-[120px] pointer-events-none" />
               <div className="relative z-10 grid grid-cols-1 xl:grid-cols-2 gap-20 items-center">
                  <div className="space-y-10">
                     <div className="inline-flex items-center gap-5 px-8 py-4 bg-white/5 border border-white/10 rounded-full">
                        <Sparkles size={18} className="text-rose-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Neural Pricing Active</span>
                     </div>
                     <h3 className="serif text-5xl md:text-8xl font-light italic tracking-tighter leading-[0.9]">
                        Predictive <br/><span className="not-italic font-bold text-rose-600">Value.</span>
                     </h3>
                     <p className="text-2xl md:text-3xl text-white/30 serif italic leading-relaxed max-w-xl">
                        "The Gemini Core is analyzing cross-district sales velocity to optimize artifact value in real-time."
                     </p>
                  </div>
                  <div className="space-y-10">
                      <div className="p-12 bg-white/5 border border-white/10 rounded-[50px] space-y-10">
                         <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Auto-Optimization</span>
                            <div className="w-14 h-7 bg-emerald-500 rounded-full relative">
                               <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full" />
                            </div>
                         </div>
                         <div className="space-y-4">
                            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                               <span className="text-white/20">Variance Threshold</span>
                               <span>±12%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/10 rounded-full">
                               <div className="h-full w-[45%] bg-rose-500 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
                            </div>
                         </div>
                         <button className="w-full py-6 bg-white text-black rounded-full font-black uppercase tracking-[0.4em] text-[10px] hover:bg-rose-600 hover:text-white transition-all">
                            Initialize Synthesis
                         </button>
                      </div>
                  </div>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Marketing;
