
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Role, User, Product, Order, Customer, Coupon } from './types';
import { Lock, Mail, ShoppingBag, Loader2, AlertCircle, Fingerprint, ShieldCheck, UserCircle, Briefcase, Monitor } from 'lucide-react';
import { inventoryService } from './services/inventoryService';

// Code Splitting: Lazy Loading for non-critical views
const Layout = lazy(() => import('./components/Layout'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const Products = lazy(() => import('./components/Products'));
const Storefront = lazy(() => import('./components/Storefront'));
const Catalog = lazy(() => import('./components/Catalog'));
const Manifesto = lazy(() => import('./components/Manifesto'));
const Lab = lazy(() => import('./components/Lab'));
const Orders = lazy(() => import('./components/Orders'));
const Customers = lazy(() => import('./components/Customers'));
const Marketing = lazy(() => import('./components/Marketing'));
const Settings = lazy(() => import('./components/Settings'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#fdfcfb]">
    <Loader2 className="animate-spin text-rose-500" size={32} />
  </div>
);

const App: React.FC = () => {
  const [view, setView] = useState<'store' | 'admin'>('store');
  const [storeSubView, setStoreSubView] = useState<'home' | 'catalog' | 'manifesto' | 'lab'>('home');
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

  // Optimized Sync: Atomic and debounced
  const syncAllData = useCallback(async () => {
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
      console.error("Registry Sync Failure:", err);
    }
  }, []);

  // Sync only on critical transitions to avoid layout thrashing
  useEffect(() => {
    syncAllData();
  }, [view, syncAllData]);

  useEffect(() => {
    const session = localStorage.getItem('muse_admin_session');
    if (session) {
      try {
        const userData = JSON.parse(session);
        if (userData && userData.id && userData.role) {
          setCurrentUser(userData);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('muse_admin_session');
        }
      } catch (e) {
        localStorage.removeItem('muse_admin_session');
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError(null);
    
    // Simulate auth latency
    await new Promise(r => setTimeout(r, 800));

    let user: User | null = null;
    const normalizedEmail = loginEmail.toLowerCase().trim();
    
    if (normalizedEmail === 'admin@seoulmuse.com' && loginPassword === 'admin') {
      user = { id: 'usr-001', name: 'Alexander Pierce', email: 'admin@seoulmuse.com', role: Role.SUPER_ADMIN, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' };
    } else if (normalizedEmail === 'manager@seoulmuse.com' && loginPassword === 'manager') {
      user = { id: 'usr-002', name: 'Soyeon Kim', email: 'manager@seoulmuse.com', role: Role.MANAGER, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' };
    } else if (normalizedEmail === 'support@seoulmuse.com' && loginPassword === 'support') {
      user = { id: 'usr-003', name: 'David Chen', email: 'support@seoulmuse.com', role: Role.SUPPORT, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' };
    }

    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('muse_admin_session', JSON.stringify(user));
      setActivePath('/');
    } else {
      setAuthError('Identity validation failed.');
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
    <div className="fixed bottom-6 sm:bottom-12 left-1/2 -translate-x-1/2 z-[300] bg-[#0f172a] text-white p-2 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-1 sm:gap-2 border border-white/5 animate-in slide-in-from-bottom-10 duration-1000">
      <button 
        onClick={() => { setView('store'); }}
        className={`flex items-center gap-2 sm:gap-4 px-4 sm:px-8 py-3 sm:py-4 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] transition-all duration-500 ${view === 'store' ? 'bg-white text-black shadow-xl' : 'opacity-40 hover:opacity-100'}`}
      >
        <ShoppingBag size={14} className="sm:size-[16px]" /> <span className="hidden xs:inline">Muse Mode</span><span className="xs:hidden">Muse</span>
      </button>
      <button 
        onClick={() => { setView('admin'); }}
        className={`flex items-center gap-2 sm:gap-4 px-4 sm:px-8 py-3 sm:py-4 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] transition-all duration-500 ${view === 'admin' ? 'bg-rose-500 text-white shadow-xl' : 'opacity-40 hover:opacity-100'}`}
      >
        <Monitor size={14} className="sm:size-[16px]" /> <span className="hidden xs:inline">Atelier Admin</span><span className="xs:hidden">Atelier</span>
      </button>
    </div>
  );

  if (view === 'store') {
    return (
      <div className="animate-in fade-in duration-1000">
        <Suspense fallback={<LoadingFallback />}>
          {storeSubView === 'home' && (
            <Storefront 
              products={products} 
              setProducts={setProducts} 
              onNavigateToCatalog={() => setStoreSubView('catalog')} 
              onNavigateToManifesto={() => setStoreSubView('manifesto')}
              onNavigateToLab={() => setStoreSubView('lab')}
            />
          )}
          {storeSubView === 'catalog' && (
            <Catalog 
              products={products} 
              setProducts={setProducts} 
              onNavigateToHome={() => setStoreSubView('home')} 
              onNavigateToManifesto={() => setStoreSubView('manifesto')}
              onNavigateToLab={() => setStoreSubView('lab')}
            />
          )}
          {storeSubView === 'manifesto' && (
            <Manifesto 
              onNavigateToHome={() => setStoreSubView('home')} 
              onNavigateToCatalog={() => setStoreSubView('catalog')}
              onNavigateToLab={() => setStoreSubView('lab')}
            />
          )}
          {storeSubView === 'lab' && (
            <Lab 
              onNavigateToHome={() => setStoreSubView('home')} 
              onNavigateToCatalog={() => setStoreSubView('catalog')} 
              onNavigateToManifesto={() => setStoreSubView('manifesto')}
            />
          )}
        </Suspense>
        <ViewToggle />
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen bg-[#fdfcfb] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        <div className="w-full max-w-xl bg-white rounded-[40px] sm:rounded-[70px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] p-8 sm:p-20 border border-black/[0.02] relative z-10 animate-in zoom-in-95 duration-700">
          <div className="text-center mb-10 sm:mb-16">
             <div className="w-16 h-16 sm:w-24 sm:h-24 bg-[#0f172a] rounded-2xl sm:rounded-[36px] mx-auto mb-6 sm:mb-10 flex items-center justify-center text-white shadow-[0_30px_60px_-15px_rgba(15,23,42,0.4)] rotate-3">
               <Fingerprint size={32} sm:size={48} strokeWidth={1} />
             </div>
             <h2 className="serif text-4xl sm:text-6xl italic mb-4 leading-none text-[#0f172a]">Atelier Access</h2>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6 sm:space-y-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20 ml-4 sm:ml-6 italic">Identity Handle</label>
              <div className="relative">
                <Mail className="absolute left-6 sm:left-8 top-1/2 -translate-y-1/2 text-black/10" size={18} sm:size={20} />
                <input 
                  type="email" 
                  placeholder="ID@SEOULMUSE.COM" 
                  value={loginEmail} 
                  onChange={(e) => setLoginEmail(e.target.value)} 
                  className="w-full pl-16 sm:pl-20 pr-8 py-5 sm:py-7 bg-[#f8fafc] rounded-2xl sm:rounded-[36px] text-[10px] sm:text-[12px] font-bold uppercase tracking-widest outline-none transition-all focus:ring-4 focus:ring-rose-500/5 focus:bg-white" 
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20 ml-4 sm:ml-6 italic">Access Key</label>
              <div className="relative">
                <Lock className="absolute left-6 sm:left-8 top-1/2 -translate-y-1/2 text-black/10" size={18} sm:size={20} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={loginPassword} 
                  onChange={(e) => setLoginPassword(e.target.value)} 
                  className="w-full pl-16 sm:pl-20 pr-8 py-5 sm:py-7 bg-[#f8fafc] rounded-2xl sm:rounded-[36px] text-[10px] sm:text-[12px] font-bold tracking-[0.4em] outline-none transition-all focus:ring-4 focus:ring-rose-500/5 focus:bg-white" 
                  required 
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-[#0f172a] text-white font-black py-5 sm:py-8 rounded-2xl sm:rounded-[40px] hover:bg-rose-600 transition-all shadow-xl uppercase tracking-[0.5em] text-[10px] sm:text-[12px] flex items-center justify-center gap-4 active:scale-95">
              {isAuthenticating ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
              {isAuthenticating ? 'Validating...' : 'Authenticate Access'}
            </button>
          </form>

          {authError && (
            <div className="mt-6 p-4 bg-rose-50 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-xl text-center flex items-center justify-center gap-3">
              <AlertCircle size={14} /> {authError}
            </div>
          )}

          <div className="mt-12 sm:mt-20 pt-10 sm:pt-16 border-t border-black/[0.03]">
            <div className="grid grid-cols-3 gap-2 sm:gap-6">
                <button onClick={() => quickLogin(Role.SUPER_ADMIN)} className="group flex flex-col items-center gap-2 p-2 sm:p-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#0f172a] group-hover:text-white transition-all">
                        <ShieldCheck size={18} sm:size={24} strokeWidth={1.5} />
                    </div>
                    <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-slate-400">Super</span>
                </button>
                <button onClick={() => quickLogin(Role.MANAGER)} className="group flex flex-col items-center gap-2 p-2 sm:p-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-rose-500 group-hover:text-white transition-all">
                        <Briefcase size={18} sm:size={24} strokeWidth={1.5} />
                    </div>
                    <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-slate-400">Manager</span>
                </button>
                <button onClick={() => quickLogin(Role.SUPPORT)} className="group flex flex-col items-center gap-2 p-2 sm:p-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                        <UserCircle size={18} sm:size={24} strokeWidth={1.5} />
                    </div>
                    <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-slate-400">Support</span>
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
      <Suspense fallback={<LoadingFallback />}>
        <Layout 
          user={currentUser} 
          onLogout={() => { 
            setIsAuthenticated(false); 
            setCurrentUser(null);
            localStorage.removeItem('muse_admin_session'); 
            setView('store'); 
          }} 
          activePath={activePath} 
          onNavigate={setActivePath}
        >
          {activePath === '/' && <Dashboard />}
          {activePath === '/products' && <Products onUpdate={syncAllData} />}
          {activePath === '/orders' && <Orders orders={orders} onUpdateOrder={syncAllData} />}
          {activePath === '/customers' && <Customers customers={customers} />}
          {activePath === '/marketing' && <Marketing onUpdateCoupon={syncAllData} />}
          {activePath === '/settings' && <Settings />}
        </Layout>
      </Suspense>
      <ViewToggle />
    </div>
  );
};

export default App;
