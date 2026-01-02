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
import { MOCK_PRODUCTS, MOCK_ORDERS, MOCK_CUSTOMERS, MOCK_COUPONS } from './constants';
import { Lock, Mail, ChevronRight, Monitor, ShoppingBag, Loader2, AlertCircle, Fingerprint, Wand2 } from 'lucide-react';
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
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS);

  const syncData = async () => {
    try {
      const data = await inventoryService.getProducts({
        search: '', category: 'All', status: 'All' as any, stockLevel: 'All',
        sortBy: 'name', sortOrder: 'asc'
      });
      setProducts(data || []);
    } catch (err) {
      setProducts(MOCK_PRODUCTS);
    }
  };

  useEffect(() => {
    syncData();
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
    await new Promise(r => setTimeout(r, 800));

    try {
      const response = await fetch('http://localhost:3001/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const { token, user } = await response.json();

      // Combine token into user object or separate storage. App expects session obj.
      const sessionUser = { ...user, token };

      setCurrentUser(sessionUser);
      setIsAuthenticated(true);
      localStorage.setItem('muse_admin_session', JSON.stringify(sessionUser));
    } catch (err) {
      setAuthError('Identity validation failed.');
    }
    setIsAuthenticating(false);
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
      <div className="min-h-screen bg-[#fdfcfb] flex flex-col items-center justify-center p-6 relative">
        <div className="w-full max-w-md bg-white rounded-[60px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] p-16 border border-black/[0.03]">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-[#0f172a] rounded-3xl mx-auto mb-8 flex items-center justify-center text-white shadow-2xl rotate-3">
              <Fingerprint size={40} strokeWidth={1} />
            </div>
            <h2 className="serif text-5xl italic mb-3">Atelier Access</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-black/30">Personnel Validation Required</p>
          </div>
          {authError && <p className="mb-6 text-rose-500 text-[10px] font-black uppercase text-center animate-pulse">{authError}</p>}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-black/20 ml-4">Identity Identifier</label>
              <input type="email" placeholder="IDENTITY@MUSE.COM" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full px-8 py-5 bg-[#f8fafc] rounded-3xl text-[11px] font-bold uppercase tracking-widest focus:ring-4 focus:ring-rose-500/5 outline-none transition-all" required />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-black/20 ml-4">Cryptographic Key</label>
              <input type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full px-8 py-5 bg-[#f8fafc] rounded-3xl text-[11px] font-bold tracking-widest focus:ring-4 focus:ring-rose-500/5 outline-none transition-all" required />
            </div>
            <button type="submit" className="w-full bg-[#0f172a] text-white font-black py-6 rounded-3xl shadow-2xl hover:bg-rose-600 transition-all uppercase tracking-[0.4em] text-[11px] mt-4">
              {isAuthenticating ? <Loader2 className="animate-spin mx-auto" /> : 'Validate & Authorize'}
            </button>
          </form>
          <div className="mt-10 text-center">
            <button onClick={() => { setLoginEmail('admin@seoulmuse.com'); setLoginPassword('admin'); }} className="text-[9px] font-black text-rose-500/40 uppercase tracking-[0.5em] hover:text-rose-500 transition-colors">Master Key Emulation</button>
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
        {activePath === '/orders' && <Orders orders={orders} onUpdateOrder={() => { }} />}
        {activePath === '/customers' && <Customers customers={customers} />}
        {activePath === '/marketing' && <Marketing coupons={coupons} onUpdateCoupon={() => { }} />}
        {activePath === '/settings' && <Settings />}
      </Layout>
      <ViewToggle />
    </div>
  );
};

export default App;