
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Role, User, Product, Order, Customer, Coupon } from './types';
import { ShoppingBag, Loader2, Fingerprint, Monitor, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { inventoryService } from './services/inventoryService';

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
const Orchestrator = lazy(() => import('./components/Orchestrator'));

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
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

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

  useEffect(() => {
    syncAllData();
  }, [view, syncAllData]);

  useEffect(() => {
    const adminSession = localStorage.getItem('muse_admin_session');
    if (adminSession) {
      try {
        const userData = JSON.parse(adminSession);
        if (userData && userData.id && userData.role) {
          setCurrentUser(userData);
          setIsAuthenticated(true);
        }
      } catch (e) {
        localStorage.removeItem('muse_admin_session');
      }
    }

    const customerSession = localStorage.getItem('muse_customer_session');
    if (customerSession) {
      try {
        setCurrentCustomer(JSON.parse(customerSession));
      } catch (e) {
        localStorage.removeItem('muse_customer_session');
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError(null);
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
      setAuthError('Identity validation failed. Access denied.');
    }
    setIsAuthenticating(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('muse_admin_session');
  };

  const handleCustomerLogin = (customer: Customer) => {
    setCurrentCustomer(customer);
    localStorage.setItem('muse_customer_session', JSON.stringify(customer));
  };

  const handleCustomerLogout = () => {
    setCurrentCustomer(null);
    localStorage.removeItem('muse_customer_session');
  };

  const ViewToggle = () => (
    <div className="fixed bottom-6 sm:bottom-12 left-1/2 -translate-x-1/2 z-[300] bg-[#0f172a] text-white p-2 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-1 sm:gap-2 border border-white/5 animate-in slide-in-from-bottom-10 duration-1000">
      <button 
        onClick={() => { setView('store'); }}
        className={`flex items-center gap-2 sm:gap-4 px-4 sm:px-8 py-3 sm:py-4 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] transition-all duration-500 ${view === 'store' ? 'bg-white text-black shadow-xl' : 'opacity-40 hover:opacity-100'}`}
      >
        <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Muse Mode</span><span className="xs:hidden">Muse</span>
      </button>
      <button 
        onClick={() => { setView('admin'); }}
        className={`flex items-center gap-2 sm:gap-4 px-4 sm:px-8 py-3 sm:py-4 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] transition-all duration-500 ${view === 'admin' ? 'bg-rose-500 text-white shadow-xl' : 'opacity-40 hover:opacity-100'}`}
      >
        <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Atelier Admin</span><span className="xs:hidden">Atelier</span>
      </button>
    </div>
  );

  const renderAdminContent = () => {
    switch (activePath) {
      case '/': return <Dashboard />;
      case '/products': return <Products onUpdate={syncAllData} />;
      case '/orders': return <Orders />;
      case '/customers': return <Customers customers={customers} />;
      case '/marketing': return <Marketing onUpdateCoupon={syncAllData} />;
      case '/orchestrator': return <Orchestrator />;
      case '/settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  if (view === 'store') {
    return (
      <div className="animate-in fade-in duration-1000">
        <Suspense fallback={<LoadingFallback />}>
          {storeSubView === 'home' && (
            <Storefront 
              products={products} 
              setProducts={setProducts} 
              currentCustomer={currentCustomer}
              onCustomerLogin={handleCustomerLogin}
              onCustomerLogout={handleCustomerLogout}
              onNavigateToCatalog={() => setStoreSubView('catalog')} 
              onNavigateToManifesto={() => setStoreSubView('manifesto')}
              onNavigateToLab={() => setStoreSubView('lab')}
            />
          )}
          {storeSubView === 'catalog' && (
            <Catalog 
              products={products} 
              setProducts={setProducts} 
              currentCustomer={currentCustomer}
              onCustomerLogin={handleCustomerLogin}
              onCustomerLogout={handleCustomerLogout}
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

  return (
    <div className="animate-in fade-in duration-1000 min-h-screen bg-slate-50">
      {!isAuthenticated ? (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl z-0" />
          <div className="relative z-10 w-full max-w-xl bg-white p-12 sm:p-20 rounded-[60px] shadow-3xl border border-slate-100 animate-in zoom-in-95 duration-700">
            <div className="text-center mb-16">
              <div className="w-20 h-20 bg-black rounded-[30px] flex items-center justify-center text-white mx-auto mb-10 shadow-2xl rotate-3">
                <Fingerprint size={32} strokeWidth={1} />
              </div>
              <h1 className="serif text-5xl italic font-light tracking-tighter mb-4">Atelier <span className="not-italic font-bold">Admin</span></h1>
              <p className="text-[9px] font-black uppercase tracking-[0.5em] text-black/20 italic">Encrypted Registry Access</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-6">Registry Handle</label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-black/10 group-focus-within:text-rose-500 transition-colors" size={18} />
                  <input 
                    type="email" 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ADMIN@SEOULMUSE.COM"
                    className="w-full pl-16 pr-8 py-6 bg-slate-50 rounded-[30px] text-[11px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-rose-500/5 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-black/30 ml-6">Access Protocol</label>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-black/10 group-focus-within:text-rose-500 transition-colors" size={18} />
                  <input 
                    type="password" 
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-16 pr-8 py-6 bg-slate-50 rounded-[30px] text-[11px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-rose-500/5 transition-all"
                    required
                  />
                </div>
              </div>

              {authError && (
                <div className="p-5 bg-rose-50 border border-rose-100 rounded-3xl flex items-center gap-4 text-rose-600">
                  <ShieldCheck size={16} />
                  <p className="text-[10px] font-black uppercase tracking-widest">{authError}</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isAuthenticating}
                className="w-full bg-black text-white py-8 rounded-full font-black text-[11px] uppercase tracking-[0.6em] hover:bg-rose-600 transition-all shadow-2xl flex items-center justify-center gap-6 group"
              >
                {isAuthenticating ? <Loader2 className="animate-spin" /> : <ShieldCheck size={18} className="group-hover:scale-125 transition-transform" />}
                Authorize Registry
              </button>
            </form>
          </div>
        </div>
      ) : (
        <Suspense fallback={<LoadingFallback />}>
          <Layout 
            user={currentUser!} 
            onLogout={handleLogout} 
            activePath={activePath} 
            onNavigate={(path) => setActivePath(path)}
          >
            <div className="animate-in fade-in duration-1000">
              {renderAdminContent()}
            </div>
          </Layout>
        </Suspense>
      )}
      <ViewToggle />
    </div>
  );
};

export default App;
