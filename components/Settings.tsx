
import React, { useState } from 'react';
import { 
  Shield, CreditCard, Bell, Globe, Mail, Code, 
  ArrowLeft, ArrowRight, Key, UserCheck, Smartphone, 
  History, Eye, Trash2, ShieldAlert,
  Fingerprint, Lock, CheckCircle2, AlertTriangle,
  Server, Cpu, Database, Activity
} from 'lucide-react';
import { Role, User, SecurityLog } from '../types';

const MOCK_ADMINS: User[] = [
  { id: 'usr-001', name: 'Alexander Pierce', email: 'admin@seoulmuse.com', role: Role.SUPER_ADMIN, lastLogin: '2m ago' },
  { id: 'usr-002', name: 'Soyeon Kim', email: 'manager@seoulmuse.com', role: Role.MANAGER, lastLogin: '1h ago' },
  { id: 'usr-003', name: 'David Chen', email: 'support@seoulmuse.com', role: Role.SUPPORT, lastLogin: '6h ago' },
];

const MOCK_LOGS: SecurityLog[] = [
  { id: 'log-1', action: 'Auth: Success', user: 'Alexander P.', ip: '124.50.2.19', timestamp: '2023-11-06 14:20', severity: 'low' },
  { id: 'log-2', action: 'Registry: Product Delete', user: 'Soyeon K.', ip: '192.168.1.4', timestamp: '2023-11-06 12:45', severity: 'medium' },
  { id: 'log-3', action: 'System: Config Rollback', user: 'Alexander P.', ip: '124.50.2.19', timestamp: '2023-11-06 09:10', severity: 'high' },
  { id: 'log-4', action: 'Auth: Failed Attempt', user: 'Unknown', ip: '45.12.33.2', timestamp: '2023-11-06 04:00', severity: 'high' },
];

const Settings: React.FC = () => {
  const [activeSubSection, setActiveSubSection] = useState<string | null>(null);
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [sessionTtl, setSessionTtl] = useState(24);

  const sections = [
    { id: 'identity', title: 'Identity & Security', desc: 'RBAC controls, JWT lifetimes, and IP restrictions', icon: Shield },
    { id: 'payment', title: 'Payment Gateways', desc: 'Stripe, PayPal, and KakaoPay API keys', icon: CreditCard },
    { id: 'global', title: 'Global Logic', desc: 'Base currency (USD/KRW), Tax tiers, and Localization', icon: Globe },
    { id: 'webhooks', title: 'Webhooks', desc: 'Configure external fulfillment notifications', icon: Code },
  ];

  if (activeSubSection === 'identity') {
    return (
      <div className="space-y-12 animate-in fade-in slide-in-from-left-4 duration-1000">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-100 pb-12">
          <div className="flex items-center gap-10">
            <button 
                onClick={() => setActiveSubSection(null)}
                className="w-16 h-16 bg-white border border-slate-100 rounded-[24px] flex items-center justify-center hover:bg-slate-50 transition-all group shadow-sm"
            >
                <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-rose-500 block mb-3 italic">Security Protocol</span>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 serif italic">Identity & <span className="not-italic font-black">Control</span></h1>
            </div>
          </div>
          
          <div className="flex gap-4 items-center bg-white p-2 rounded-3xl border border-slate-100">
             <div className="flex items-center gap-3 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Activity size={14} className="animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest">Shield Active</span>
             </div>
             <div className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-300">Auth Node: KR-SEO-01</div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          {/* Main Controls */}
          <div className="xl:col-span-8 space-y-12">
            {/* RBAC Table */}
            <div className="bg-white rounded-[60px] border border-slate-100 overflow-hidden shadow-sm">
              <div className="p-12 border-b border-slate-50 flex justify-between items-end">
                <div>
                  <h3 className="text-2xl font-black tracking-tight italic serif">Resident Registry</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-3 italic">Administrative Authority Matrix</p>
                </div>
                <button className="px-10 py-5 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 transition-all shadow-xl shadow-slate-100 flex items-center gap-3">
                    <UserCheck size={16} /> Enroll Identity
                </button>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-12 py-8 text-[9px] font-black text-slate-400 uppercase tracking-widest">Resident Entity</th>
                      <th className="px-12 py-8 text-[9px] font-black text-slate-400 uppercase tracking-widest">Security Level</th>
                      <th className="px-12 py-8 text-[9px] font-black text-slate-400 uppercase tracking-widest">Activity Trace</th>
                      <th className="px-12 py-8 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {MOCK_ADMINS.map(admin => (
                      <tr key={admin.id} className="group hover:bg-slate-50/50 transition-all">
                        <td className="px-12 py-8">
                          <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-300 shadow-inner group-hover:bg-white transition-colors">
                              <Fingerprint size={24} strokeWidth={1.5} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 tracking-tight">{admin.name}</p>
                              <p className="text-[10px] text-slate-400 font-medium lowercase tracking-tight opacity-60">{admin.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-12 py-8">
                          <span className="px-5 py-2 rounded-full bg-rose-50 text-rose-600 text-[8px] font-black uppercase tracking-widest border border-rose-100 shadow-sm">
                            {admin.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          {admin.lastLogin}
                        </td>
                        <td className="px-12 py-8 text-right">
                          <button className="p-4 text-slate-200 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all">
                            <ShieldAlert size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Registry Logs */}
            <div className="bg-[#0A0A0A] rounded-[60px] p-12 text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-[50%] h-full bg-rose-600/5 blur-[120px] pointer-events-none group-hover:opacity-100 transition-opacity" />
               <div className="relative z-10">
                  <div className="flex justify-between items-center mb-16">
                    <div className="flex items-center gap-6">
                        <History size={24} className="text-rose-500" />
                        <div>
                            <h3 className="text-2xl font-black tracking-tight serif italic">Audit Trace Log</h3>
                            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 mt-1 italic">Real-time Session Monitoring</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/40">
                        <Database size={14} /> Synced
                    </div>
                  </div>
                  <div className="space-y-4">
                    {MOCK_LOGS.map(log => (
                      <div key={log.id} className="flex items-center justify-between p-6 bg-white/[0.03] border border-white/5 rounded-3xl group hover:bg-white/[0.07] transition-all cursor-default">
                        <div className="flex items-center gap-8">
                           <div className={`w-2.5 h-2.5 rounded-full ${log.severity === 'high' ? 'bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]' : log.severity === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                           <div>
                              <p className="text-[11px] font-black tracking-[0.2em] uppercase text-white/90">{log.action}</p>
                              <p className="text-[9px] text-white/30 font-mono mt-1 tracking-tight">SRC_IP: {log.ip} // RESIDENT: {log.user.toUpperCase()}</p>
                           </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className="text-[9px] font-mono text-white/20 uppercase">{log.timestamp}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-white/10 px-3 py-1 bg-white/[0.02] rounded-full border border-white/5">H-HASH-{log.id.toUpperCase()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="xl:col-span-4 space-y-12">
            <div className="bg-white p-12 rounded-[60px] border border-slate-100 shadow-sm space-y-12">
               <div>
                  <h3 className="text-2xl font-black tracking-tight serif italic">Global Params</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 italic">Infrastructure Verification</p>
               </div>

               <div className="space-y-10">
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-5">
                       <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-rose-50 group-hover:text-rose-50 transition-all">
                            <Smartphone size={24} className="text-slate-300 group-hover:text-rose-500" />
                       </div>
                       <div>
                          <p className="text-[11px] font-black uppercase tracking-widest text-slate-900">MFA Protocol</p>
                          <p className="text-[9px] text-slate-400 font-medium uppercase tracking-tight mt-1">Multi-Factor Enforcement</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => setMfaEnabled(!mfaEnabled)}
                      className={`w-14 h-7 rounded-full relative transition-all duration-700 ${mfaEnabled ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-700 shadow-sm ${mfaEnabled ? 'left-8' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-5">
                       <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                            <Key size={24} className="text-slate-300" />
                       </div>
                       <p className="text-[11px] font-black uppercase tracking-widest text-slate-900">JWT Session TTL</p>
                    </div>
                    <div className="space-y-4 px-2">
                       <input 
                         type="range" 
                         min="1" 
                         max="72" 
                         value={sessionTtl} 
                         onChange={(e) => setSessionTtl(parseInt(e.target.value))}
                         className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
                       />
                       <div className="flex justify-between items-center">
                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Transient</span>
                            <span className="text-[12px] font-black font-mono bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-rose-600 shadow-sm">{sessionTtl} Hours</span>
                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Persistent</span>
                       </div>
                    </div>
                  </div>
               </div>
            </div>

            <div className="bg-rose-50 p-12 rounded-[60px] border border-rose-100 flex flex-col gap-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 blur-3xl pointer-events-none" />
                <div className="flex items-center gap-6 text-rose-600 relative z-10">
                    <ShieldAlert size={32} strokeWidth={1.5} className="animate-pulse" />
                    <div>
                        <h4 className="text-base font-black uppercase tracking-widest">Panic Protocol</h4>
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Emergency Global Lockout</p>
                    </div>
                </div>
                <p className="text-sm text-rose-950/70 serif italic leading-relaxed relative z-10">
                  "Executing the panic protocol immediately terminates all active administrative sessions and forces multi-factor re-validation across the entire staff registry. Use only in event of critical breach."
                </p>
                <button className="w-full py-6 bg-rose-600 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.4em] hover:bg-rose-700 transition-all shadow-[0_25px_60px_-15px_rgba(225,29,72,0.4)] relative z-10">
                  Initialize Global Lockdown
                </button>
            </div>

            <div className="bg-slate-900 p-12 rounded-[60px] flex items-center justify-between text-white/30 hover:text-white/50 transition-colors group cursor-help">
                <div className="flex items-center gap-6">
                    <Server size={20} />
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest">System Health</p>
                        <p className="text-[9px] font-mono mt-1">LATENCY: 12ms // STABLE</p>
                    </div>
                </div>
                <Cpu size={20} className="group-hover:rotate-45 transition-transform duration-1000" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="border-b border-slate-100 pb-12">
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-rose-500 block mb-4 italic">Core Matrix</span>
        <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-900 serif italic">Platform <span className="not-italic font-black">Settings</span></h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {sections.map(section => (
            <div 
              key={section.id} 
              onClick={() => setActiveSubSection(section.id)}
              className="bg-white p-14 rounded-[70px] border border-slate-100 hover:bg-slate-50/50 transition-all cursor-pointer group shadow-sm hover:shadow-2xl relative overflow-hidden"
            >
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-20 h-20 rounded-[32px] bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-white group-hover:shadow-2xl group-hover:text-rose-500 transition-all mb-12 relative z-10">
                    <section.icon size={32} strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-black tracking-tight mb-3 italic serif relative z-10">{section.title}</h3>
                <p className="text-base font-medium text-slate-400 leading-relaxed mb-10 opacity-70 relative z-10">{section.desc}</p>
                {/* Fixed: Added missing ArrowRight import from lucide-react */}
                <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.3em] text-slate-900 group-hover:text-rose-500 transition-colors relative z-10">
                    Configure Registry <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                </div>
            </div>
        ))}
      </div>

      <div className="bg-[#0A0A0A] p-16 rounded-[70px] text-white flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group shadow-3xl">
          <div className="absolute inset-0 bg-rose-600/5 blur-[120px] rounded-full pointer-events-none group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
              <h4 className="text-3xl font-black tracking-tighter italic serif mb-3">Platform Manifest</h4>
              <p className="text-white/30 text-base font-medium serif italic uppercase tracking-widest">Atelier Engine 4.2.0-STABLE // Secure Kernel // Last Audit: 2h ago</p>
          </div>
          <button className="px-12 py-6 bg-white text-black rounded-full font-black text-[11px] uppercase tracking-[0.5em] hover:bg-rose-600 hover:text-white transition-all shadow-2xl relative z-10 group-hover:scale-105">
              Export Audit Registry
          </button>
      </div>
    </div>
  );
};

export default Settings;
