import React, { useState, useEffect } from 'react';
import { Role, User, Product, Order, Customer, Coupon } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Storefront from './components/Storefront';
import Orders from './components/Orders';
import Customers from './components/Customers';
import Marketing from './components/Marketing';
import Settings from './components/Settings';
import { Lock, Mail, ShoppingBag, Loader2, AlertCircle, Fingerprint, ShieldCheck, UserCircle, Briefcase, Monitor } from 'lucide-react';
import { inventoryService } from './services/inventoryService';

const App: React.FC = () => {
  const [view, setView] = useState<'store' | 'admin'>('store');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activePath, setActivePath] = useState<string>('/');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  const syncAllData = async () => {
    try {
      const [prodData, orderData, custData, coupData] = await Promise.all([
        inventoryService.getProducts(),
        inventoryService.getOrders(),
        inventoryService.getCustomers(),
        inventoryService.getCoupons()
      ]);
      setProducts(prodData);
      setOrders(orderData);
      setCustomers(custData);
      setCoupons(coupData);
    } catch (err) {
      console.error("Critical Sync Error:", err);
    }
  };

  useEffect(() => {
    syncAllData();
  }, [view, activePath]);

  useEffect(() => {
    const session = localStorage.getItem('muse_admin_session');
    if (session) {
      setCurrentUser(JSON.parse(session));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError(null);
    
    await new Promise(r => setTimeout(r, 1200));

    let user: User | null = null;
    if (loginEmail.toLowerCase() === 'admin@seoulmuse.com' && loginPassword === 'admin') {
      user = { id: 'usr-001', name: 'Alexander Pierce', email: 'admin@seoulmuse.com', role: Role.SUPER_ADMIN, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' };
    } else if (loginEmail.toLowerCase() === 'manager@seoulmuse.com' && loginPassword === 'manager') {
      user = { id: 'usr-002', name: 'Soyeon Kim', email: 'manager@seoulmuse.com', role: Role.MANAGER, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' };
    } else if (loginEmail.toLowerCase() === 'support@seoulmuse.com' && loginPassword === 'support') {
      user = { id: 'usr-003', name: 'David Chen', email: 'support@seoulmuse.com', role: Role.SUPPORT, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' };
    }

    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('muse_admin_session', JSON.stringify(user));
      setActivePath('/');
    } else {
      setAuthError('Identity validation failed. Access denied.');
    }
    setIsAuthenticating(false);
  };

  const quickLogin = (role: Role) => {
    const email = role.toLowerCase().replace('_', '') + '@seoulmuse.com';
    const password = role.toLowerCase().replace('_', '');
    setLoginEmail(email);
    setLoginPassword(password);
  };

  const ViewToggle = () => (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[300] bg-[#0f172a] text-white p-2 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-2 border border-white/5 animate-in slide-in-from-bottom-10 duration-1000">
      <button 
        onClick={() => setView('store')}
        className={`flex items-center gap-4 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 ${view === 'store' ? 'bg-white text-black shadow-xl' : 'opacity-40 hover:opacity-100'}`}
      >
        <ShoppingBag size={16} /> <span>Muse Mode</span>
      </button>
      <button 
        onClick={() => setView('admin')}
        className={`flex items-center gap-4 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 ${view === 'admin' ? 'bg-rose-500 text-white shadow-xl' : 'opacity-40 hover:opacity-100'}`}
      >
        <Monitor size={16} /> <span>Atelier Admin</span>
      </button>
    </div>
  );

  if (view === 'store') {
    return (
      <div className="animate-in fade-in duration-1000">
        <Storefront products={products} setProducts={setProducts} />
        <ViewToggle />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fdfcfb] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-rose-500/5 blur-[150px] -translate-y-1/2 translate-x-1/2 rounded-full" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] translate-y-1/2 -translate-x-1/2 rounded-full" />

        <div className="w-full max-w-xl bg-white rounded-[70px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] p-20 border border-black/[0.02] relative z-10 animate-in zoom-in-95 duration-700">
          <div className="text-center mb-16">
             <div className="w-24 h-24 bg-[#0f172a] rounded-[36px] mx-auto mb-10 flex items-center justify-center text-white shadow-[0_30px_60px_-15px_rgba(15,23,42,0.4)] rotate-3">
               <Fingerprint size={48} strokeWidth={1} />
             </div>
             <h2 className="serif text-6xl italic mb-4 leading-none">Atelier Access</h2>
             <p className="text-[11px] font-black uppercase tracking-[0.6em] text-black/20 italic">Encrypted Registry Protocol</p>
          </div>
          
          {authError && (
            <div className="mb-10 p-6 bg-rose-50 border border-rose-100 rounded-3xl flex items-center gap-4 animate-in slide-in-from-top-4">
              <AlertCircle size={20} className="text-rose-500 shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-600">{authError}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20 ml-6 italic leading-none">Identity Handle</label>
              <div className="relative">
                <Mail className="absolute left-8 top-1/2 -translate-y-1/2 text-black/10" size={20} />
                <input 
                  type="email" 
                  placeholder="ID@SEOULMUSE.COM" 
                  value={loginEmail} 
                  onChange={(e) => setLoginEmail(e.target.value)} 
                  className="w-full pl-20 pr-10 py-7 bg-[#f8fafc] rounded-[36px] text-[12px] font-bold uppercase tracking-widest focus:ring-4 focus:ring-rose-500/5 outline-none transition-all placeholder:text-black/10" 
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20 ml-6 italic leading-none">Access Key</label>
              <div className="relative">
                <Lock className="absolute left-8 top-1/2 -translate-y-1/2 text-black/10" size={20} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={loginPassword} 
                  onChange={(e) => setLoginPassword(e.target.value)} 
                  className="w-full pl-20 pr-10 py-7 bg-[#f8fafc] rounded-[36px] text-[12px] font-bold tracking-[0.4em] focus:ring-4 focus:ring-rose-500/5 outline-none transition-all placeholder:text-black/10" 
                  required 
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-[#0f172a] text-white font-black py-8 rounded-[40px] shadow-[0_30px_60px_-15px_rgba(15,23,42,0.3)] hover:bg-rose-600 transition-all uppercase tracking-[0.5em] text-[12px] mt-4 flex items-center justify-center gap-4 active:scale-95">
              {isAuthenticating ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
              {isAuthenticating ? 'Authenticating...' : 'Validate & Authorize'}
            </button>
          </form>

          <div className="mt-20 pt-16 border-t border-black/[0.03]">
            <p className="text-center text-[9px] font-black uppercase tracking-[0.5em] text-black/20 mb-10">Simulation Protocol: Select Role</p>
            <div className="grid grid-cols-3 gap-6">
                <button onClick={() => quickLogin(Role.SUPER_ADMIN)} className="group flex flex-col items-center gap-3 p-4 rounded-3xl hover:bg-slate-50 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#0f172a] group-hover:text-white transition-all shadow-sm">
                        <ShieldCheck size={24} strokeWidth={1.5} />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-[#0f172a]">Super</span>
                </button>
                <button onClick={() => quickLogin(Role.MANAGER)} className="group flex flex-col items-center gap-3 p-4 rounded-3xl hover:bg-slate-50 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-sm">
                        <Briefcase size={24} strokeWidth={1.5} />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-rose-500">Manager</span>
                </button>
                <button onClick={() => quickLogin(Role.SUPPORT)} className="group flex flex-col items-center gap-3 p-4 rounded-3xl hover:bg-slate-50 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-sm">
                        <UserCircle size={24} strokeWidth={1.5} />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-500">Support</span>
                </button>
            </div>
          </div>
        </div>
        <ViewToggle />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-1000">
      <Layout 
        user={currentUser!} 
        onLogout={() => { setIsAuthenticated(false); localStorage.removeItem('muse_admin_session'); setView('store'); }} 
        activePath={activePath} 
        onNavigate={setActivePath}
      >
        {activePath === '/' && <Dashboard />}
        {activePath === '/products' && <Products />}
        {activePath === '/orders' && <Orders orders={orders} onUpdateOrder={syncAllData} />}
        {activePath === '/customers' && <Customers customers={customers} />}
        {activePath === '/marketing' && <Marketing onUpdateCoupon={syncAllData} />}
        {activePath === '/settings' && <Settings />}
      </Layout>
      <ViewToggle />
    </div>
  );
};

export default App;