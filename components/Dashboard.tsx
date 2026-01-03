
import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { 
  TrendingUp, Sparkles, Loader2, Globe, 
  Activity, Target, AlertTriangle, 
  ArrowRight, ShoppingBag, UserPlus, Package,
  DollarSign, Hexagon, ShieldCheck,
  RotateCcw, ChevronRight, Cpu, ArrowUpRight
} from 'lucide-react';
import { MOCK_STATS, MOCK_PRODUCTS, MOCK_ORDERS } from '../constants';
import { getDashboardInsight } from '../geminiService';

const Dashboard: React.FC = () => {
  const [insight, setInsight] = useState<string>("");
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [activeFinanceTab, setActiveFinanceTab] = useState<'revenue' | 'refunds' | 'taxes'>('revenue');

  useEffect(() => {
    const fetchAI = async () => {
      if (!insight) setLoadingInsight(true);
      try {
        const text = await getDashboardInsight(MOCK_STATS);
        setInsight(String(text));
      } catch (e) {
        setInsight("Analyzing the current market velocity in Cheongdam-dong...");
      } finally {
        setLoadingInsight(false);
      }
    };
    fetchAI();
  }, []);

  const financeMetrics = useMemo(() => {
    const revenue = MOCK_ORDERS.reduce((s, o) => s + o.total, 0);
    const tax = MOCK_ORDERS.reduce((s, o) => s + (o.tax || 0), 0);
    const shipping = MOCK_ORDERS.reduce((s, o) => s + (o.shippingFee || 0), 0);
    return { revenue, tax, shipping };
  }, []);

  const recentActivities = [
    { type: 'order', label: 'New Acquisition', detail: 'ORD-9902 by Chloe B.', time: '2m ago', icon: ShoppingBag, color: 'text-rose-500' },
    { type: 'stock', label: 'Stock Alert', detail: 'Satin Slip (0 remaining)', time: '14m ago', icon: AlertTriangle, color: 'text-amber-500' },
    { type: 'customer', label: 'New Resident', detail: 'Min-ji Kim joined', time: '1h ago', icon: UserPlus, color: 'text-indigo-500' },
    { type: 'product', label: 'Catalog Mod', detail: 'Oversized Knit Price adj.', time: '3h ago', icon: Package, color: 'text-emerald-500' },
  ];

  return (
    <div className="space-y-16 animate-in fade-in duration-1000 pb-32">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-slate-100 pb-16 px-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-rose-500 block mb-6 italic">Market Intelligence Command</span>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-[#0A0A0A] serif italic leading-none">Editorial <span className="not-italic font-bold text-rose-600">Stats</span>.</h1>
        </div>
        <div className="flex gap-6 items-center bg-white p-3 rounded-[32px] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 px-8 py-4 bg-emerald-50 text-emerald-600 rounded-2xl shadow-inner">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-[9px] font-black uppercase tracking-widest">Neural Stream Active</span>
            </div>
            <button className="px-8 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-black/20 hover:text-rose-500 transition-colors uppercase">Flush Cache</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-16">
            {/* KPI Matrix */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { label: 'Revenue', val: `$${MOCK_STATS.totalRevenue.toLocaleString()}`, trend: '+12%', icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' },
                  { label: 'Orders', val: MOCK_STATS.totalOrders, trend: '+5%', icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { label: 'Conv.', val: '3.4%', trend: '+0.2%', icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
                  { label: 'Refunds', val: '1.2%', trend: '-0.5%', icon: RotateCcw, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((s, i) => (
                <div key={i} className="bg-white p-10 rounded-[50px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group">
                    <div className={`w-14 h-14 ${s.bg} ${s.color} rounded-[22px] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-sm`}>
                        <s.icon size={24} />
                    </div>
                    <div className="flex justify-between items-baseline mb-2">
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-black/20">{s.label}</p>
                        <span className="text-[9px] font-bold text-emerald-500">{s.trend}</span>
                    </div>
                    <h3 className="text-4xl font-bold text-[#0A0A0A] tracking-tighter">{s.val}</h3>
                </div>
                ))}
            </div>

            {/* AI Intelligence Deck */}
            <div className="relative rounded-[70px] bg-[#0A0A0A] p-12 md:p-20 overflow-hidden group shadow-3xl">
                <div className="absolute top-0 right-0 w-[60%] h-full bg-rose-600/[0.04] blur-[150px] pointer-events-none" />
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="scan-line" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row gap-16 items-start">
                    <div className="shrink-0">
                        <div className="w-20 h-20 rounded-[35px] bg-rose-600 flex items-center justify-center text-white shadow-[0_30px_60px_-10px_rgba(225,29,72,0.4)] group-hover:rotate-12 transition-transform duration-1000">
                            <Sparkles size={32} strokeWidth={1.5} />
                        </div>
                    </div>
                    <div className="flex-1 w-full">
                        <div className="flex items-center gap-6 mb-10">
                            <div className="h-[1px] w-14 bg-rose-600" />
                            <span className="text-[10px] font-black uppercase tracking-[0.8em] text-rose-500">Gemini Neural Protocol</span>
                        </div>
                        <div className="max-w-4xl">
                            {loadingInsight ? (
                                <div className="flex items-center gap-8 text-white/20 italic text-2xl font-light serif">
                                    <Loader2 size={24} className="animate-spin text-rose-500" />
                                    Synthesizing Atelier Data Streams...
                                </div>
                            ) : (
                                <div className="text-white text-3xl md:text-5xl font-light serif italic leading-[1.3] tracking-tight whitespace-pre-line opacity-90">
                                    {insight}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Financial Deck */}
            <div className="bg-white rounded-[70px] border border-slate-100 shadow-sm overflow-hidden flex flex-col xl:flex-row min-h-[500px]">
               <div className="p-16 xl:w-2/5 bg-slate-50 border-r border-slate-100 flex flex-col justify-between">
                  <div>
                    <h3 className="serif text-5xl font-bold italic tracking-tighter mb-6">Finance <br/><span className="not-italic font-black text-rose-600">Audit</span>.</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300 italic">Registry Liquidity // 2026.04</p>
                  </div>
                  
                  <div className="space-y-4">
                     {[
                       { id: 'revenue', label: 'Gross Inflow', icon: DollarSign },
                       { id: 'refunds', label: 'Refund Matrix', icon: RotateCcw },
                       { id: 'taxes', label: 'Tax Geometry', icon: Hexagon }
                     ].map(tab => (
                       <button 
                         key={tab.id}
                         onClick={() => setActiveFinanceTab(tab.id as any)}
                         className={`w-full flex items-center justify-between p-8 rounded-[30px] transition-all ${activeFinanceTab === tab.id ? 'bg-white shadow-3xl text-slate-900 border border-black/5' : 'text-slate-400 hover:text-slate-900'}`}
                       >
                          <div className="flex items-center gap-6">
                             <tab.icon size={20} className={activeFinanceTab === tab.id ? 'text-rose-500' : ''} />
                             <span className="text-[11px] font-black uppercase tracking-widest">{tab.label}</span>
                          </div>
                          <ChevronRight size={16} className={`transition-all ${activeFinanceTab === tab.id ? 'opacity-100 translate-x-2' : 'opacity-0'}`} />
                       </button>
                     ))}
                  </div>

                  <div className="pt-12 border-t border-slate-200">
                     <div className="flex justify-between items-baseline">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Total Value Stored</span>
                        <p className="text-5xl font-black tracking-tighter text-slate-900">${financeMetrics.revenue.toLocaleString()}</p>
                     </div>
                  </div>
               </div>

               <div className="flex-1 p-16 bg-white flex flex-col justify-center">
                  <div className="animate-in fade-in zoom-in-95 duration-700">
                     {activeFinanceTab === 'revenue' && (
                        <div className="space-y-16">
                           <div className="flex justify-between items-end">
                              <div>
                                 <span className="text-[11px] font-black uppercase tracking-widest text-rose-500 block mb-3">Liquidity Velocity</span>
                                 <h4 className="text-3xl font-black tracking-tight text-slate-800 uppercase">Operational Inflow Stream</h4>
                              </div>
                              <div className="text-right">
                                 <span className="text-3xl font-black tracking-tighter text-slate-900">$4.1k Avg</span>
                              </div>
                           </div>
                           <div className="h-64 w-full bg-slate-50/50 rounded-[50px] p-10 flex items-center justify-center border border-black/[0.02]">
                              <ResponsiveContainer width="100%" height="100%">
                                 <BarChart data={MOCK_STATS.revenueChart}>
                                    <Bar dataKey="amount" radius={[15, 15, 15, 15]}>
                                       {MOCK_STATS.revenueChart.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={index === 2 ? '#e11d48' : '#e2e8f0'} />
                                       ))}
                                    </Bar>
                                 </BarChart>
                              </ResponsiveContainer>
                           </div>
                        </div>
                     )}
                     
                     {activeFinanceTab === 'refunds' && (
                        <div className="bg-rose-50/50 p-12 rounded-[60px] border border-rose-100 space-y-10">
                           <div className="flex items-center gap-8 mb-10">
                              <div className="w-16 h-16 bg-rose-500 rounded-[28px] flex items-center justify-center text-white shadow-2xl">
                                 <ShieldCheck size={32} strokeWidth={1.5} />
                              </div>
                              <div>
                                 <h4 className="text-2xl font-black uppercase tracking-widest text-rose-950">Refund Protocol Alpha</h4>
                                 <p className="text-[10px] font-bold text-rose-500/60 uppercase tracking-[0.4em] mt-2">Matrix Sanitation Verified</p>
                              </div>
                           </div>
                           <div className="grid grid-cols-2 gap-12 pt-10 border-t border-rose-100">
                              <div className="space-y-2">
                                 <p className="text-[9px] font-black text-rose-950/40 uppercase tracking-widest">Process Count</p>
                                 <p className="text-4xl font-black text-rose-600">12 Units</p>
                              </div>
                              <div className="space-y-2">
                                 <p className="text-[9px] font-black text-rose-950/40 uppercase tracking-widest">Wipe Value</p>
                                 <p className="text-4xl font-black text-rose-600">$1.4k</p>
                              </div>
                           </div>
                        </div>
                     )}

                     {activeFinanceTab === 'taxes' && (
                        <div className="p-12 rounded-[60px] border border-slate-100 space-y-10 bg-slate-50/30">
                           <div className="flex justify-between items-center py-6 border-b border-black/5">
                              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">VAT Matrix (10%)</span>
                              <p className="text-3xl font-black text-slate-900">${financeMetrics.tax.toFixed(0)}</p>
                           </div>
                           <div className="flex justify-between items-center py-6 border-b border-black/5">
                              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Logistics Accrual</span>
                              <p className="text-3xl font-black text-slate-900">${financeMetrics.shipping.toFixed(0)}</p>
                           </div>
                           <div className="pt-10 flex justify-between items-baseline">
                              <span className="text-[14px] font-black uppercase tracking-[0.6em] text-rose-500 italic">Total Liability</span>
                              <p className="text-7xl font-bold text-rose-600 italic serif tracking-tighter">${(financeMetrics.tax + financeMetrics.shipping).toFixed(0)}</p>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>
        </div>

        {/* Sidebar: Activity Monitor */}
        <div className="lg:col-span-4 space-y-12">
            <div className="bg-white p-12 rounded-[60px] border border-slate-100 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-16">
                    <h3 className="text-3xl font-black tracking-tighter serif italic text-slate-900">Activity Monitor</h3>
                    <div className="flex items-center gap-3">
                       <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Live</span>
                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    </div>
                </div>
                <div className="space-y-10">
                    {recentActivities.map((act, i) => (
                        <div key={i} className="flex gap-8 group cursor-default">
                            <div className={`w-12 h-12 rounded-[20px] bg-slate-50 flex items-center justify-center ${act.color} group-hover:bg-white group-hover:shadow-2xl transition-all shrink-0`}>
                                <act.icon size={20} strokeWidth={2} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline gap-2 mb-2">
                                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-900 truncate">{act.label}</span>
                                    <span className="text-[9px] font-bold text-slate-300 shrink-0">{act.time}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium leading-tight truncate uppercase tracking-tighter">{act.detail}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="w-full py-6 border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-[0.5em] mt-16 hover:bg-black hover:text-white transition-all flex items-center justify-center gap-5 group">
                    Full Registry Audit <ArrowRight size={14} className="group-hover:translate-x-3 transition-transform" />
                </button>
            </div>

            <div className="bg-rose-50/40 p-12 rounded-[60px] border border-rose-100/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <AlertTriangle size={80} strokeWidth={1} />
                </div>
                <h3 className="text-[11px] font-black tracking-[0.4em] uppercase text-rose-950 mb-10 flex items-center gap-4">
                    <ShieldCheck size={18} className="text-rose-600" /> Fulfillment Alerts
                </h3>
                <div className="space-y-4">
                    {MOCK_PRODUCTS.filter(p => p.stock < 20).slice(0, 3).map((item, i) => (
                        <div key={i} className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-rose-100 flex items-center justify-between group/item hover:shadow-xl transition-all">
                            <div className="min-w-0">
                                <p className="text-[11px] font-black text-rose-950 uppercase tracking-tighter truncate">{item.name}</p>
                                <p className="text-[9px] font-bold text-rose-500/60 uppercase tracking-widest mt-1">{item.stock} Units Node Left</p>
                            </div>
                            <button className="p-4 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all">
                                <Package size={18} />
                            </button>
                        </div>
                    ))}
                </div>
                <button className="mt-12 text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 text-center w-full hover:underline decoration-rose-500/20 underline-offset-8">Re-stock Archive</button>
            </div>
            
            <div className="bg-slate-900 p-12 rounded-[60px] flex items-center justify-between text-white group cursor-pointer hover:bg-rose-600 transition-all duration-700">
               <div className="flex items-center gap-6">
                  <Cpu size={24} className="text-rose-500 group-hover:text-white" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest">System Load</p>
                    <p className="text-[9px] font-mono text-white/30 group-hover:text-white/50">STABLE // 12.4% CPU</p>
                  </div>
               </div>
               {/* Fixed: Added missing ArrowUpRight import from lucide-react */}
               <ArrowUpRight size={20} className="opacity-30 group-hover:opacity-100" />
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
