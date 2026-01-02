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
import { TrendingUp, Package, Sparkles, Loader2, Globe, Activity, Target } from 'lucide-react';
import { MOCK_STATS } from '../constants';
import { getDashboardInsight } from '../geminiService';

const Dashboard: React.FC = () => {
  const [insight, setInsight] = useState<string>("");
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    const fetchAI = async () => {
      setLoadingInsight(true);
      try {
        const text = await getDashboardInsight(MOCK_STATS);
        // Robust safety check to prevent Error #31
        if (text && typeof text === 'object') {
          setInsight(JSON.stringify(text));
        } else {
          setInsight(String(text || "Optimizing market strategy based on current demand..."));
        }
      } catch (e) {
        setInsight("Unable to fetch neural insights at this time.");
      } finally {
        setLoadingInsight(false);
      }
    };
    fetchAI();
  }, []);

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200 pb-12">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 block mb-4">Command Center // Live</span>
          <h1 className="text-5xl font-extrabold tracking-tighter text-slate-900">Neural Analytics</h1>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl text-emerald-600">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Systems Active</span>
            </div>
            <button className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Refresh Stream</button>
        </div>
      </div>

      {/* Grid: Stats & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {[
          { label: 'Gross Sales', val: '$52,140', icon: TrendingUp, color: 'text-rose-500', bg: 'bg-rose-50' },
          { label: 'Active Sessions', val: '1,284', icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-50' },
          { label: 'Conversion Rate', val: '3.4%', icon: Target, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Fulfillment', val: '98%', icon: Package, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
            <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mb-6`}>
                <s.icon size={20} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{s.label}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{s.val}</h3>
          </div>
        ))}
      </div>

      {/* AI Intelligence Block */}
      <div className="relative rounded-[60px] bg-slate-900 p-16 overflow-hidden group">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-rose-500/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row gap-16 items-start">
              <div className="shrink-0">
                  <div className="w-24 h-24 rounded-[30px] bg-rose-500 flex items-center justify-center text-white shadow-2xl shadow-rose-500/20 group-hover:rotate-12 transition-transform duration-500">
                      <Sparkles size={40} />
                  </div>
              </div>
              <div className="flex-1">
                  <div className="flex items-center gap-4 mb-8">
                      <div className="h-px w-8 bg-rose-500" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500">Gemini Trend Oracle</span>
                  </div>
                  <div className="prose prose-invert max-w-none">
                      {loadingInsight ? (
                          <div className="flex items-center gap-4 text-white/40 italic font-medium">
                              <Loader2 size={20} className="animate-spin" />
                              Synchronizing with Seoul fashion feeds...
                          </div>
                      ) : (
                          <div className="text-white text-xl md:text-2xl font-bold leading-relaxed tracking-tight whitespace-pre-line">
                              {insight}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      </div>

      {/* Main Analytics Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-12 rounded-[60px] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-12">
                  <h3 className="text-xl font-black tracking-tighter">Market Velocity</h3>
                  <div className="flex gap-4">
                      <button className="text-[9px] font-black uppercase tracking-widest text-rose-500 underline">24 Hours</button>
                      <button className="text-[9px] font-black uppercase tracking-widest text-slate-300">7 Days</button>
                  </div>
              </div>
              <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_STATS.revenueChart}>
                        <defs>
                        <linearGradient id="velocity" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" hide />
                        <YAxis hide />
                        <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
                        <Area type="monotone" dataKey="amount" stroke="#f43f5e" strokeWidth={4} fill="url(#velocity)" />
                    </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>
          <div className="bg-white p-12 rounded-[60px] border border-slate-100 shadow-sm flex flex-col">
              <h3 className="text-xl font-black tracking-tighter mb-10">Global Heat</h3>
              <div className="space-y-8 flex-1">
                  {[
                      { city: 'Seoul', score: 98, trend: '+4%' },
                      { city: 'Tokyo', score: 84, trend: '+12%' },
                      { city: 'Paris', score: 72, trend: '-2%' },
                      { city: 'LA', score: 65, trend: '+22%' },
                  ].map((city, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                              <Globe size={16} className="text-slate-200" />
                              <span className="text-xs font-black uppercase tracking-widest text-slate-600">{city.city}</span>
                          </div>
                          <div className="flex items-center gap-4">
                              <span className="text-xs font-bold text-slate-900">{city.score}%</span>
                              <span className={`text-[10px] font-black ${city.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                                  {city.trend}
                              </span>
                          </div>
                      </div>
                  ))}
              </div>
              <button className="w-full py-5 bg-slate-900 text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] mt-12 hover:bg-rose-500 transition-all">
                  Expansion Strategy
              </button>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;