
import React from 'react';
import { Shield, CreditCard, Bell, Globe, Mail, Code } from 'lucide-react';

const Settings: React.FC = () => {
  const sections = [
    { title: 'Identity & Security', desc: 'RBAC controls, JWT lifetimes, and IP restrictions', icon: Shield },
    { title: 'Payment Gateways', desc: 'Stripe, PayPal, and KakaoPay API keys', icon: CreditCard },
    { title: 'Global Logic', desc: 'Base currency (USD/KRW), Tax tiers, and Localization', icon: Globe },
    { title: 'Webhooks', desc: 'Configure external fulfillment notifications', icon: Code },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="border-b border-slate-100 pb-8">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 block mb-4">Core Config</span>
        <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900">Platform Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map(section => (
            <div key={section.title} className="bg-white p-12 rounded-[50px] border border-slate-100 hover:bg-slate-50/50 transition-all cursor-pointer group">
                <div className="w-16 h-16 rounded-[24px] bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-white group-hover:shadow-xl group-hover:text-rose-500 transition-all mb-8">
                    <section.icon size={28} />
                </div>
                <h3 className="text-xl font-black tracking-tight mb-2">{section.title}</h3>
                <p className="text-sm font-medium text-slate-400 leading-relaxed mb-8">{section.desc}</p>
                <button className="text-[10px] font-black uppercase tracking-widest text-slate-900 group-hover:text-rose-500 transition-colors">Configure System →</button>
            </div>
        ))}
      </div>

      <div className="bg-slate-900 p-12 rounded-[50px] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-[80px]" />
          <div>
              <h4 className="text-xl font-black tracking-tight mb-2">Platform Manifest</h4>
              <p className="text-white/40 text-sm font-medium">Running version 4.2.0-STABLE | Last audit 2h ago</p>
          </div>
          <button className="px-10 py-5 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">
              Download Full Logs
          </button>
      </div>
    </div>
  );
};

export default Settings;
