
import React, { useState } from 'react';
import { 
  Shield, CreditCard, Bell, Globe, Mail, Code, 
  ArrowLeft, Key, UserCheck, Smartphone, 
  History, Eye, Trash2, ShieldAlert,
  Fingerprint, Lock, CheckCircle2, AlertTriangle
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
      <div className="space-y-12 animate-in fade-in slide-in-from-left-4 duration-700">
        <div className="flex items-center gap-8 border-b border-slate-100 pb-8">
          <button 
            onClick={() => setActiveSubSection(null)}
            className="p-4 hover:bg-slate-100 rounded-full transition-all group"
          >
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 block mb-2">Protocol Command</span>
            <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900">Identity & Security</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          {/* Main Controls */}
          <div className="xl:col-span-8 space-y-12">
            {/* RBAC Table */}
            <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black tracking-tight">Staff Registry</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Role-Based Access Management</p>
                </div>
                <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 transition-all">Enroll Admin</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Resident</th>
                      <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol Level</th>
                      <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Activity</th>
                      <th className="px-10 py-6 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {MOCK_ADMINS.map(admin => (
                      <tr key={admin.id} className="group hover:bg-slate-50/50 transition-all">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                              <Fingerprint size={20} />
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-900">{admin.name}</p>
                              <p className="text-[10px] text-slate-400">{admin.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <span className="px-4 py-1.5 rounded-full bg-rose-50 text-rose-600 text-[8px] font-black uppercase tracking-widest border border-rose-100">
                            {admin.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {admin.lastLogin}
                        </td>
                        <td className="px-10 py-6 text-right">
                          <button className="p-2 text-slate-200 hover:text-rose-500 transition-colors">
                            <ShieldAlert size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Registry Logs */}
            <div className="bg-[#0A0A0A] rounded-[40px] p-10 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-full bg-rose-600/5 blur-3xl" />
               <div className="relative z-10">
                  <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <History size={20} className="text-rose-500" />
                        <h3 className="text-xl font-black tracking-tight serif italic">Registry Trail</h3>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/30">Auto-Audited</span>
                  </div>
                  <div className="space-y-4">
                    {MOCK_LOGS.map(log => (
                      <div key={log.id} className="flex items-center justify-between p-5 bg-white/[0.03] border border-white/5 rounded-2xl group hover:bg-white/[0.07] transition-all">
                        <div className="flex items-center gap-6">
                           <div className={`w-2 h-2 rounded-full ${log.severity === 'high' ? 'bg-rose-500 animate-pulse' : log.severity === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                           <div>
                              <p className="text-[10px] font-black tracking-widest uppercase">{log.action}</p>
                              <p className="text-[9px] text-white/40 font-mono mt-1">SRC: {log.ip} // {log.user}</p>
                           </div>
                        </div>
                        <span className="text-[8px] font-mono text-white/20 uppercase">{log.timestamp}</span>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="xl:col-span-4 space-y-12">
            <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-10">
               <div>
                  <h3 className="text-xl font-black tracking-tight">Security Params</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Global Verification Rules</p>
               </div>

               <div className="space-y-8">
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                       <Smartphone size={20} className="text-slate-300 group-hover:text-rose-500 transition-colors" />
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">MFA Protocol</p>
                          <p className="text-[9px] text-slate-400 uppercase tracking-widest">Enforce 2FA for all admins</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => setMfaEnabled(!mfaEnabled)}
                      className={`w-12 h-6 rounded-full relative transition-all duration-500 ${mfaEnabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500 ${mfaEnabled ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                       <Key size={20} className="text-slate-300" />
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">JWT Session TTL</p>
                    </div>
                    <div className="flex items-center gap-4">
                       <input 
                         type="range" 
                         min="1" 
                         max="72" 
                         value={sessionTtl} 
                         onChange={(e) => setSessionTtl(parseInt(e.target.value))}
                         className="flex-1 accent-rose-500"
                       />
                       <span className="text-[10px] font-black font-mono bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{sessionTtl}h</span>
                    </div>
                  </div>
               </div>
            </div>

            <div className="bg-rose-50 p-10 rounded-[40px] border border-rose-100 flex flex-col gap-6">
                <div className="flex items-center gap-4 text-rose-600">
                    <ShieldAlert size={24} />
                    <h4 className="text-sm font-black uppercase tracking-widest">Panic Protocol</h4>
                </div>
                <p className="text-[11px] text-rose-950/60 serif italic leading-relaxed">
                  "Activating the panic protocol will immediately terminate all active administrative sessions and force identity re-validation for the entire staff registry."
                </p>
                <button className="w-full py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-rose-700 transition-all shadow-xl shadow-rose-200">
                  Execute Global Lockout
                </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="border-b border-slate-100 pb-8">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 block mb-4">Core Config</span>
        <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900">Platform Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map(section => (
            <div 
              key={section.id} 
              onClick={() => setActiveSubSection(section.id)}
              className="bg-white p-12 rounded-[50px] border border-slate-100 hover:bg-slate-50/50 transition-all cursor-pointer group"
            >
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
