
import React, { useState, useEffect } from 'react';
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, Sparkles, Loader2, Globe, 
  Activity, Target, Layers, AlertTriangle, 
  ArrowRight, ShoppingBag, UserPlus, Package
} from 'lucide-react';
import { MOCK_STATS, MOCK_PRODUCTS } from '../constants';
import { getDashboardInsight } from '../geminiService';

const Dashboard: React.FC = () => {
  const [insight, setInsight] = useState<string>("");
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    const fetchAI = async () => {
      // Check if we already have insight to avoid flicker
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

  const recentActivities = [
    { type: 'order', label: 'New Acquisition', detail: 'ORD-9902 by Chloe B.', time: '2m ago', icon: ShoppingBag, color: 'text-rose-500' },
    { type: 'stock', label: 'Stock Depleted', detail: 'Moonlight Satin Slip (0 remaining)', time: '14m ago', icon: AlertTriangle, color: 'text-amber-500' },
    { type: 'customer', label: 'New Muse Resident', detail: 'Min-ji Kim joined registry', time: '1h ago', icon: UserPlus, color: 'text-indigo-500' },
    { type: 'product', label: 'Artifact Updated', detail: 'Seongsu Oversized Knit price adj.', time: '3h ago', icon: Package, color: 'text-emerald-500' },
  ];

  const lowStockItems = MOCK_PRODUCTS.filter(p => p.stock < 20);

  return (
    <div className="space-y-10 md:space-y-16 animate-in fade-in duration-1000">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 pb-10 md:pb-16">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-rose-600 block mb-4 md:mb-6">Market Command // Cheongdam</span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-[#0A0A0A] serif italic">Editorial <span className="not-italic font-black">Stats</span></h1>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 bg-white p-3 rounded-3xl md:rounded-[32px] border border-slate-100 shadow-sm w-full sm:w-auto">
            <div className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-emerald-50 rounded-2xl text-emerald-600 w-full sm:w-auto justify-center sm:justify-start">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Sync Active</span>
            </div>
            <button 
              onClick={() => { localStorage.removeItem('seoul_muse_ai_cache'); window.location.reload(); }}
              className="px-6 md:px-8 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-black/20 hover:text-black transition-colors w-full sm:w-auto"
            >
              Flush Analysis Cache
            </button>
        </div>
      </div>

      {/* Main Grid: Stats & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
        <div className="lg:col-span-8 space-y-8 md:space-y-10">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[
                { label: 'Revenue', val: `$${MOCK_STATS.totalRevenue.toLocaleString()}`, trend: '+12%', icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' },
                { label: 'Orders', val: MOCK_STATS.totalOrders, trend: '+5%', icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'Conv.', val: '3.4%', trend: '+0.2%', icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Fulfill', val: '98%', trend: 'Steady', icon: Layers, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((s, i) => (
                <div key={i} className="bg-white p-5 md:p-8 rounded-3xl md:rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-default">
                    <div className={`w-10 h-10 md:w-12 md:h-12 ${s.bg} ${s.color} rounded-xl md:rounded-[18px] flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform`}>
                        <s.icon size={18} md:size={20} strokeWidth={2} />
                    </div>
                    <div className="flex justify-between items-baseline mb-1">
                        <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-black/30">{s.label}</p>
                        <span className="text-[8px] font-black text-emerald-500">{s.trend}</span>
                    </div>
                    <h3 className="text-xl md:text-3xl font-black text-[#0A0A0A] tracking-tighter">{s.val}</h3>
                </div>
                ))}
            </div>

            {/* AI Intelligence Block */}
            <div className="relative rounded-3xl md:rounded-[60px] bg-[#0A0A0A] p-8 md:p-16 overflow-hidden group">
                <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-rose-600/10 to-transparent pointer-events-none transition-opacity group-hover:opacity-40" />
                <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-12 items-start">
                    <div className="shrink-0 mx-auto md:mx-0">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[30px] bg-rose-600 flex items-center justify-center text-white shadow-[0_20px_40px_-10px_rgba(225,29,72,0.4)] group-hover:rotate-12 transition-transform duration-700">
                            <Sparkles size={28} md:size={32} strokeWidth={1} />
                        </div>
                    </div>
                    <div className="flex-1 w-full text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-4 md:gap-6 mb-6">
                            <div className="hidden sm:block h-[1px] w-10 bg-rose-600" />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-rose-600">Gemini Strategic Protocol</span>
                        </div>
                        <div className="max-w-3xl">
                            {loadingInsight ? (
                                <div className="flex items-center justify-center md:justify-start gap-4 md:gap-6 text-white/30 italic text-lg md:text-xl font-light serif">
                                    <Loader2 size={18} md:size={20} className="animate-spin" />
                                    Synthesizing high-fashion market signals...
                                </div>
                            ) : (
                                <div className="text-white text-lg md:text-2xl font-light serif italic leading-relaxed tracking-tight whitespace-pre-line">
                                    {insight}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart Area */}
            <div className="bg-white p-6 md:p-12 rounded-3xl md:rounded-[60px] border border-slate-100 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 md:mb-12">
                    <h3 className="text-xl font-black tracking-tighter italic serif text-[#0A0A0A]">Revenue Architecture</h3>
                    <div className="flex gap-4">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-rose-600 bg-rose-50 px-4 py-2 rounded-full">Active Season</span>
                    </div>
                </div>
                <div className="h-60 md:h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={MOCK_STATS.revenueChart}>
                            <defs>
                                <linearGradient id="velocity" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month" hide />
                            <YAxis hide />
                            <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', fontSize: '10px', textTransform: 'uppercase' }} />
                            <Area type="monotone" dataKey="amount" stroke="#e11d48" strokeWidth={3} fill="url(#velocity)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Sidebar: Activities & Alerts */}
        <div className="lg:col-span-4 space-y-8 md:space-y-10">
            {/* Recent Activity */}
            <div className="bg-white p-8 md:p-10 rounded-3xl md:rounded-[50px] border border-slate-100 shadow-sm flex flex-col h-full">
                <div className="flex items-center justify-between mb-8 md:mb-10">
                    <h3 className="text-lg font-black tracking-tighter serif italic text-[#0A0A0A]">Activity Stream</h3>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/20">Real-time</span>
                </div>
                <div className="space-y-6 md:space-y-8 flex-1">
                    {recentActivities.map((act, i) => (
                        <div key={i} className="flex gap-4 md:gap-6 group">
                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center ${act.color} group-hover:bg-white group-hover:shadow-md transition-all shrink-0`}>
                                <act.icon size={14} md:size={16} strokeWidth={2.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline gap-2 mb-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0A0A0A] truncate">{act.label}</span>
                                    <span className="text-[8px] font-bold text-slate-300 shrink-0">{act.time}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium leading-tight truncate">{act.detail}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="w-full py-4 border border-slate-100 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] mt-8 md:mt-10 hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                    View Full Registry <ArrowRight size={12} />
                </button>
            </div>

            {/* Critical Inventory Alerts */}
            <div className="bg-rose-50/50 p-8 md:p-10 rounded-3xl md:rounded-[50px] border border-rose-100/50 flex flex-col">
                <div className="flex items-center gap-4 mb-6 md:mb-8">
                    <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center">
                        <AlertTriangle size={14} />
                    </div>
                    <h3 className="text-sm font-black tracking-widest uppercase text-rose-950">Fulfillment Alerts</h3>
                </div>
                <div className="space-y-3 md:space-y-4">
                    {lowStockItems.slice(0, 3).map((item, i) => (
                        <div key={i} className="bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl border border-rose-100 flex items-center justify-between">
                            <div className="min-w-0">
                                <p className="text-[10px] font-black text-rose-950 uppercase tracking-tight truncate">{item.name}</p>
                                <p className="text-[9px] font-bold text-rose-500/60 uppercase tracking-widest">{item.stock} Units Remaining</p>
                            </div>
                            <button className="p-2 md:p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shrink-0">
                                <Package size={14} />
                            </button>
                        </div>
                    ))}
                </div>
                <button className="mt-6 md:mt-8 text-[9px] font-black uppercase tracking-[0.3em] text-rose-500 text-center hover:underline">Manage All Inventory</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
