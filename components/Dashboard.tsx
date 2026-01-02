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
import { TrendingUp, Sparkles, Loader2, Globe, Activity, Target, Layers } from 'lucide-react';
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
        setInsight(String(text));
      } catch (e) {
        setInsight("Analyzing the current market velocity in Cheongdam-dong...");
      } finally {
        setLoadingInsight(false);
      }
    };
    fetchAI();
  }, []);

  return (
    <div className="space-y-16 animate-in fade-in duration-1000">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b editorial-border pb-16">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-rose-600 block mb-6">Market Command // Cheongdam</span>
          <h1 className="text-6xl font-black tracking-tighter text-[#0A0A0A]">Editorial Stats</h1>
        </div>
        <div className="flex items-center gap-6 bg-white p-3 rounded-[32px] border editorial-border shadow-sm">
            <div className="flex items-center gap-3 px-6 py-3 bg-emerald-50 rounded-2xl text-emerald-600">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Sync Active</span>
            </div>
            <button className="px-8 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-black/20 hover:text-black transition-colors">Refresh Logic</button>
        </div>
      </div>

      {/* High-Contrast KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Revenue', val: '$52,140', icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Visits', val: '1,284', icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Velocity', val: '3.4%', icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Units', val: '98%', icon: Layers, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-10 rounded-[50px] border editorial-border shadow-sm hover:shadow-2xl transition-all group">
            <div className={`w-14 h-14 ${s.bg} ${s.color} rounded-[24px] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                <s.icon size={24} strokeWidth={1.5} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 mb-2">{s.label}</p>
            <h3 className="text-4xl font-black text-[#0A0A0A] tracking-tighter">{s.val}</h3>
          </div>
        ))}
      </div>

      {/* Designer AI Intelligence Block */}
      <div className="relative rounded-[80px] bg-[#0A0A0A] p-20 overflow-hidden group">
          <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-rose-600/10 to-transparent pointer-events-none transition-opacity group-hover:opacity-40" />
          <div className="relative z-10 flex flex-col md:flex-row gap-20 items-start">
              <div className="shrink-0">
                  <div className="w-28 h-28 rounded-[40px] bg-rose-600 flex items-center justify-center text-white shadow-[0_30px_60px_-12px_rgba(225,29,72,0.4)] group-hover:rotate-12 transition-transform duration-700">
                      <Sparkles size={44} strokeWidth={1} />
                  </div>
              </div>
              <div className="flex-1">
                  <div className="flex items-center gap-6 mb-10">
                      <div className="h-[1px] w-12 bg-rose-600" />
                      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-rose-600">Gemini Trend Protocol</span>
                  </div>
                  <div className="max-w-3xl">
                      {loadingInsight ? (
                          <div className="flex items-center gap-6 text-white/30 italic text-xl font-light serif">
                              <Loader2 size={24} className="animate-spin" />
                              Synchronizing architectural trends from Seoul...
                          </div>
                      ) : (
                          <div className="text-white text-2xl md:text-3xl font-light serif italic leading-relaxed tracking-tight whitespace-pre-line">
                              {insight}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      </div>

      {/* Data Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 bg-white p-14 rounded-[80px] border editorial-border shadow-sm">
              <div className="flex items-center justify-between mb-16">
                  <h3 className="text-2xl font-black tracking-tighter italic serif">Revenue Architecture</h3>
                  <div className="flex gap-6">
                      <button className="text-[9px] font-black uppercase tracking-[0.3em] text-rose-600 border-b border-rose-600 pb-1">Period: Seasonal</button>
                      <button className="text-[9px] font-black uppercase tracking-[0.3em] text-black/20">Archive</button>
                  </div>
              </div>
              <div className="h-96 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_STATS.revenueChart}>
                        <defs>
                        <linearGradient id="velocity" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#e11d48" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                        </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" hide />
                        <YAxis hide />
                        <Tooltip contentStyle={{ borderRadius: '32px', border: 'none', boxShadow: '0 40px 80px rgba(0,0,0,0.1)', fontFamily: 'serif' }} />
                        <Area type="monotone" dataKey="amount" stroke="#e11d48" strokeWidth={3} fill="url(#velocity)" animationDuration={2000} />
                    </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>
          <div className="bg-white p-14 rounded-[80px] border editorial-border shadow-sm flex flex-col">
              <h3 className="text-2xl font-black tracking-tighter mb-12 serif italic text-rose-600">Global Signal</h3>
              <div className="space-y-10 flex-1">
                  {[
                      { city: 'Seoul', score: 98, trend: '+4.2%' },
                      { city: 'Tokyo', score: 84, trend: '+12.5%' },
                      { city: 'Paris', score: 72, trend: '-2.1%' },
                      { city: 'London', score: 65, trend: '+18.0%' },
                  ].map((city, idx) => (
                      <div key={idx} className="flex items-center justify-between group cursor-default">
                          <div className="flex items-center gap-5">
                              <Globe size={18} strokeWidth={1} className="text-black/10 group-hover:text-rose-600 transition-colors" />
                              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-black/40 group-hover:text-black transition-colors">{city.city}</span>
                          </div>
                          <div className="flex items-center gap-6">
                              <span className="text-sm font-bold tracking-tighter text-[#0A0A0A]">{city.score}%</span>
                              <span className={`text-[10px] font-black ${city.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-600'}`}>
                                  {city.trend}
                              </span>
                          </div>
                      </div>
                  ))}
              </div>
              <button className="w-full py-6 bg-[#0A0A0A] text-white rounded-[32px] text-[10px] font-black uppercase tracking-[0.4em] mt-16 hover:bg-rose-600 transition-all shadow-xl active:scale-95">
                  Expansion Directive
              </button>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;