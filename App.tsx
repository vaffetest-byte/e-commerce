import React, { useState, useEffect } from 'react';
import { Role, User, Product, Order, Customer, Coupon, OrderStatus } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Storefront from './components/Storefront';
import Orders from './components/Orders';
import Customers from './components/Customers';
import Marketing from './components/Marketing';
import Settings from './components/Settings';
import { MOCK_PRODUCTS, MOCK_ORDERS, MOCK_CUSTOMERS, MOCK_COUPONS } from './constants';
import { Lock, Mail, ChevronRight, Monitor, ShoppingBag, Loader2, AlertCircle, Fingerprint } from 'lucide-react';
import { inventoryService } from './services/inventoryService';

const App: React.FC = () => {
  const [view, setView] = useState<'store' | 'admin'>('store');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activePath, setActivePath] = useState<string>('/');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Auth state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Synchronized Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS);

  // Initial Sync and view transitions
  useEffect(() => {
    const sync = async () => {
      try {
        const data = await inventoryService.getProducts({ 
          search: '', category: 'All', status: 'All', stockLevel: 'All', 
          sortBy: 'name', sortOrder: 'asc' 
        });
        setProducts(data || []);
      } catch (err) {
        setProducts(MOCK_PRODUCTS);
      }
    };
    sync();
  }, [view, activePath]);

  // Load session from local storage
  useEffect(() => {
    try {
      const session = localStorage.getItem('muse_admin_session');
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed && parsed.email) {
          setCurrentUser(parsed);
          setIsAuthenticated(true);
        }
      }
    } catch (e) {
      localStorage.removeItem('muse_admin_session');
    }
  }, []);

  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  const handleUpdateCoupon = (updatedCoupon: Coupon) => {
    setCoupons(prev => prev.map(c => c.id === updatedCoupon.id ? updatedCoupon : c));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError(null);

    // Simulate network delay for realistic admin console feel
    await new Promise(r => setTimeout(r, 800));

    const normalizedEmail = loginEmail.toLowerCase().trim();
    const normalizedPassword = loginPassword.trim();

    // Production-ready mock authentication logic
    if (normalizedEmail === 'admin@seoulmuse.com' && normalizedPassword === 'admin') {
      const user: User = {
        id: 'usr-001',
        name: 'Alexander Pierce',
        email: 'admin@seoulmuse.com',
        role: Role.SUPER_ADMIN,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      };
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('muse_admin_session', JSON.stringify(user));
    } else {
      setAuthError('Identity not recognized. Authorization failed.');
    }
    setIsAuthenticating(false);
  };

  const fillDemoCredentials = () => {
    setLoginEmail('admin@seoulmuse.com');
    setLoginPassword('admin');
    setAuthError(null);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('muse_admin_session');
    setView('store');
    setActivePath('/');
  };

  const ViewToggle = () => (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] bg-black/90 backdrop-blur-2xl text-white px-8 py-4 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-6 border border-white/10">
      <button 
        onClick={() => setView('store')}
        className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${view === 'store' ? 'text-rose-500' : 'opacity-40 hover:opacity-100'}`}
      >
        <ShoppingBag size={16} />
        Live Store
      </button>
      <div className="w-px h-4 bg-white/20" />
      <button 
        onClick={() => setView('admin')}
        className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${view === 'admin' ? 'text-rose-500' : 'opacity-40 hover:opacity-100'}`}
      >
        <Monitor size={16} />
        Admin Panel
      </button>
    </div>
  );

  // RENDER STOREFRONT VIEW
  if (view === 'store') {
    return (
      <div className="animate-in fade-in duration-500">
        <Storefront products={products} setProducts={setProducts} />
        <ViewToggle />
      </div>
    );
  }

  // RENDER ADMIN LOGIN VIEW
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-600/5 rounded-full blur-[120px] -mr-48 -mt-48 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] -ml-48 -mb-48"></div>
        
        <div className="w-full max-w-md bg-white rounded-[48px] shadow-2xl overflow-hidden relative z-10 p-12 animate-in zoom-in-95 duration-500">
          <div className="text-center mb-10">
             <div className="w-16 h-16 bg-slate-900 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white shadow-xl">
               <Fingerprint size={32} strokeWidth={1.5} />
             </div>
             <span className="serif text-4xl italic block mb-2">Seoul Muse</span>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Identity Authorization Required</p>
          </div>
          
          {authError && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-500 animate-in slide-in-from-top-2">
              <AlertCircle size={18} />
              <p className="text-[11px] font-bold uppercase tracking-widest">{authError}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  placeholder="IDENTITY@MUSE.COM" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[24px] focus:outline-none focus:ring-4 focus:ring-rose-500/5 focus:bg-white focus:border-rose-200 transition-all text-[11px] font-bold tracking-widest uppercase"
                  required
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  placeholder="CRYPTOGRAPHIC_KEY" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[24px] focus:outline-none focus:ring-4 focus:ring-rose-500/5 focus:bg-white focus:border-rose-200 transition-all text-[11px] font-bold tracking-widest uppercase"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isAuthenticating}
              className="w-full bg-slate-900 text-white font-black py-6 px-6 rounded-[24px] shadow-2xl hover:bg-rose-500 transition-all flex items-center justify-center gap-3 group uppercase tracking-[0.2em] text-[11px] active:scale-[0.98]"
            >
              {isAuthenticating ? <Loader2 size={18} className="animate-spin" /> : 'Authorize Session'}
              {!isAuthenticating && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-slate-50 text-center">
            <button 
              onClick={fillDemoCredentials}
              className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-rose-500 transition-colors py-2 px-4 rounded-full hover:bg-rose-50"
            >
              Master Access Protocol (Demo Fill)
            </button>
          </div>
        </div>
        <ViewToggle />
      </div>
    );
  }

  // RENDER AUTHENTICATED ADMIN CONSOLE
  return (
    <div className="animate-in fade-in duration-500">
      <Layout 
        user={currentUser!} 
        onLogout={handleLogout} 
        activePath={activePath} 
        onNavigate={setActivePath}
      >
        {activePath === '/' && <Dashboard />}
        {activePath === '/products' && <Products />}
        {activePath === '/orders' && <Orders orders={orders} onUpdateOrder={handleUpdateOrder} />}
        {activePath === '/customers' && <Customers customers={customers} />}
        {activePath === '/marketing' && <Marketing coupons={coupons} onUpdateCoupon={handleUpdateCoupon} />}
        {activePath === '/settings' && <Settings />}
      </Layout>
      <ViewToggle />
    </div>
  );
};

export default App;