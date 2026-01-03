
import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, Users, Mail, DollarSign, Activity, 
  Search, ShieldAlert, History, Plus, X,
  ChevronRight, ArrowLeft, Package, Calendar,
  ShieldCheck, Ban, CheckCircle2, ShoppingBag,
  Loader2, Filter, Trash2, Send
} from 'lucide-react';
import { Customer, Order, OrderStatus, Product } from '../types';
import { inventoryService } from '../services/inventoryService';

interface CustomersProps {
  customers: Customer[];
}

const Customers: React.FC<CustomersProps> = ({ customers: initialCustomers }) => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);
  
  // Manual Order Form State
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProdId, setSelectedProdId] = useState("");
  const [creatingOrder, setCreatingOrder] = useState(false);

  useEffect(() => {
    const fetchProds = async () => {
      const data = await inventoryService.getProducts();
      setAllProducts(data);
    };
    fetchProds();
  }, []);

  const handleSelectCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setLoadingOrders(true);
    const orders = await inventoryService.getOrders();
    setCustomerOrders(orders.filter(o => o.customerEmail === customer.email));
    setLoadingOrders(false);
  };

  const handleToggleBlock = async (customer: Customer) => {
    const newStatus = customer.status === 'Active' ? 'Blocked' : 'Active';
    if (window.confirm(`Initialize ${newStatus} protocol for this resident?`)) {
      await inventoryService.updateCustomerStatus(customer.id, newStatus);
      const updated = customers.map(c => c.id === customer.id ? { ...c, status: newStatus } : c);
      setCustomers(updated);
      if (selectedCustomer?.id === customer.id) {
        setSelectedCustomer({ ...selectedCustomer, status: newStatus });
      }
    }
  };

  const handleCreateManualOrder = async () => {
    if (!selectedCustomer || !selectedProdId) return;
    const prod = allProducts.find(p => p.id === selectedProdId);
    if (!prod) return;

    setCreatingOrder(true);
    try {
      const subtotal = prod.price;
      const tax = subtotal * 0.1;
      const shipping = 10;
      const total = subtotal + tax + shipping;

      const order = await inventoryService.placeOrder({
        customerName: selectedCustomer.name,
        customerEmail: selectedCustomer.email,
        items: [{ productId: prod.id, name: prod.name, quantity: 1, price: prod.price }],
        subtotal,
        tax,
        shippingFee: shipping,
        total,
        paymentMethod: 'MANUAL_ADMIN',
        status: OrderStatus.PAID,
        shippingAddress: selectedCustomer.addresses?.[0] || 'Manual Terminal Override'
      });

      setCustomerOrders([order, ...customerOrders]);
      setIsManualOrderOpen(false);
      setSelectedProdId("");
      alert("Manual Acquisition Synchronized.");
    } finally {
      setCreatingOrder(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-40">
      {/* Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 sm:p-12">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedCustomer(null)} />
            <div className="relative bg-white w-full max-w-7xl h-[90vh] rounded-[40px] md:rounded-[60px] shadow-3xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col md:flex-row">
                
                {/* Sidebar: Profile Details */}
                <div className="md:w-1/4 bg-slate-950 p-12 text-white flex flex-col justify-between overflow-y-auto no-scrollbar">
                    <div>
                        <button onClick={() => setSelectedCustomer(null)} className="flex items-center gap-4 text-white/30 hover:text-rose-500 transition-colors mb-16 text-[10px] font-black uppercase tracking-widest">
                            <ArrowLeft size={16} /> Exit Dossier
                        </button>
                        
                        <div className="text-center mb-12">
                            <div className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center text-rose-500 mx-auto mb-8 shadow-2xl border border-white/5">
                                <User size={48} strokeWidth={1} />
                            </div>
                            <h2 className="serif text-3xl font-bold italic tracking-tighter mb-2">@{selectedCustomer.name.toLowerCase()}</h2>
                            <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${selectedCustomer.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                {selectedCustomer.status}
                            </span>
                        </div>

                        <div className="space-y-10">
                            <div className="space-y-3">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/20 block">Resident Handle</span>
                                <p className="text-xs font-mono text-white/60 truncate">{selectedCustomer.email}</p>
                            </div>
                            <div className="space-y-3">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/20 block">Registry Metrics</span>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Spent</p>
                                        <p className="text-lg font-black">${selectedCustomer.totalSpent.toFixed(0)}</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Orders</p>
                                        <p className="text-lg font-black">{selectedCustomer.totalOrders}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-12 border-t border-white/5 space-y-4">
                        <button 
                            onClick={() => handleToggleBlock(selectedCustomer)}
                            className={`w-full flex items-center justify-center gap-4 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCustomer.status === 'Active' ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                        >
                            {selectedCustomer.status === 'Active' ? <Ban size={16} /> : <CheckCircle2 size={16} />}
                            {selectedCustomer.status === 'Active' ? 'Block Access' : 'Restore Link'}
                        </button>
                    </div>
                </div>

                {/* Main Content: Order History Registry */}
                <div className="flex-1 bg-white p-12 md:p-20 overflow-y-auto no-scrollbar flex flex-col">
                    <div className="flex justify-between items-end mb-16">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-rose-500 block mb-4 italic">Registry Timeline</span>
                            <h3 className="serif text-5xl font-light italic tracking-tighter">Acquisition <span className="not-italic font-black">History.</span></h3>
                        </div>
                        <button 
                            onClick={() => setIsManualOrderOpen(true)}
                            className="bg-black text-white px-8 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-widest flex items-center gap-4 hover:bg-rose-600 transition-all shadow-xl shadow-slate-100"
                        >
                            <Plus size={18} /> Create Manual Order
                        </button>
                    </div>

                    {loadingOrders ? (
                        <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-rose-500" /></div>
                    ) : customerOrders.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-center">
                            <p className="serif text-4xl italic text-black/10">No records found in current registry cycle.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {customerOrders.map(order => (
                                <div key={order.id} className="p-8 bg-slate-50 border border-black/[0.03] rounded-[40px] flex items-center justify-between group hover:bg-white hover:shadow-2xl transition-all">
                                    <div className="flex items-center gap-10">
                                        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-rose-500 shadow-inner">
                                            <Package size={24} strokeWidth={1} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-4 mb-2">
                                                <span className="font-black text-xs font-mono">{order.id}</span>
                                                <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-rose-100 bg-rose-50 text-rose-600`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-black/30 font-bold uppercase tracking-widest flex items-center gap-3">
                                                <Calendar size={12} /> {new Date(order.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="serif text-4xl italic font-bold text-black mb-1">${order.total.toFixed(2)}</p>
                                        <p className="text-[9px] font-black text-black/20 uppercase tracking-widest">{order.items.length} Artifacts</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Manual Order Drawer Overlay */}
            {isManualOrderOpen && (
                <div className="fixed inset-0 z-[700] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setIsManualOrderOpen(false)} />
                    <div className="relative bg-white w-full max-w-xl rounded-[60px] p-12 md:p-16 shadow-3xl animate-in zoom-in-95">
                        <h4 className="serif text-4xl italic font-bold tracking-tighter mb-12">Manual <span className="not-italic font-black">Entry.</span></h4>
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Select Artifact</label>
                                <select 
                                  value={selectedProdId} 
                                  onChange={(e) => setSelectedProdId(e.target.value)}
                                  className="w-full px-8 py-5 bg-slate-50 rounded-3xl text-[11px] font-black uppercase outline-none border border-transparent focus:border-rose-500"
                                >
                                    <option value="">CHOOSE FROM ARCHIVE...</option>
                                    {allProducts.map(p => <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>)}
                                </select>
                            </div>
                            
                            <div className="p-8 bg-slate-50 rounded-[40px] border border-black/5 space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-30">
                                    <span>Matrix Subtotal</span>
                                    <span>${selectedProdId ? allProducts.find(p => p.id === selectedProdId)?.price : "0.00"}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-30">
                                    <span>Logistics Fee</span>
                                    <span>$10.00</span>
                                </div>
                                <div className="pt-4 border-t border-black/5 flex justify-between items-baseline">
                                    <span className="text-[12px] font-black uppercase tracking-widest">Final Value</span>
                                    <span className="serif text-4xl italic font-bold text-rose-600">
                                        ${selectedProdId ? ((allProducts.find(p => p.id === selectedProdId)?.price || 0) * 1.1 + 10).toFixed(2) : "0.00"}
                                    </span>
                                </div>
                            </div>

                            <button 
                                onClick={handleCreateManualOrder}
                                disabled={!selectedProdId || creatingOrder}
                                className="w-full bg-black text-white py-8 rounded-full font-black uppercase tracking-[0.5em] text-[11px] hover:bg-rose-600 transition-all flex items-center justify-center gap-4 disabled:bg-slate-100"
                            >
                                {creatingOrder ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                                Execute Manual Protocol
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 pb-12 px-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-rose-500 block mb-6 italic">Audience Intelligence // Muses</span>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-900 serif italic">Resident <span className="not-italic font-black text-rose-600">Directory</span></h1>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group w-full sm:w-80">
                <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500" />
                <input 
                    type="text" 
                    placeholder="SEARCH MUSE..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-16 pr-8 py-5 bg-white border border-slate-100 rounded-[30px] text-[10px] font-black uppercase tracking-widest outline-none shadow-sm focus:ring-4 focus:ring-rose-500/5"
                />
            </div>
        </div>
      </div>

      {/* Quick Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-4">
          {[
              { label: 'Total Muses', val: customers.length, icon: Users, color: 'text-indigo-500' },
              { label: 'Active Sessions', val: customers.filter(c => c.status === 'Active').length, icon: Activity, color: 'text-emerald-500' },
              { label: 'Elite Residents', val: customers.filter(c => c.totalSpent > 1000).length, icon: ShieldCheck, color: 'text-rose-500' },
              { label: 'Avg LTV', val: `$${(customers.reduce((s, c) => s + c.totalSpent, 0) / customers.length).toFixed(0)}`, icon: DollarSign, color: 'text-amber-500' }
          ].map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col gap-4 group hover:shadow-xl transition-all">
                  <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                      <stat.icon size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 block">{stat.label}</span>
                    <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.val}</p>
                  </div>
              </div>
          ))}
      </div>

      <div className="bg-white rounded-[60px] border border-slate-100 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50">
                <th className="px-12 py-8 text-[9px] font-black uppercase tracking-[0.5em] text-slate-400">Resident Identity</th>
                <th className="px-12 py-8 text-[9px] font-black uppercase tracking-[0.5em] text-slate-400">Total Value (LTV)</th>
                <th className="px-12 py-8 text-[9px] font-black uppercase tracking-[0.5em] text-slate-400 text-center">Acquisitions</th>
                <th className="px-12 py-8 text-[9px] font-black uppercase tracking-[0.5em] text-slate-400">Status Protocol</th>
                <th className="px-12 py-8 text-[9px] font-black uppercase tracking-[0.5em] text-slate-400 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCustomers.map(customer => (
                <tr key={customer.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer" onClick={() => handleSelectCustomer(customer)}>
                  <td className="px-12 py-10">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-slate-100 rounded-[20px] flex items-center justify-center text-slate-300 group-hover:bg-rose-50 group-hover:text-rose-500 transition-all">
                            <User size={24} />
                        </div>
                        <div>
                            <p className="text-base font-black text-slate-900 tracking-tight">{customer.name}</p>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{customer.email}</p>
                        </div>
                    </div>
                  </td>
                  <td className="px-12 py-10">
                    <p className="serif text-3xl italic font-bold text-slate-900">${customer.totalSpent.toFixed(2)}</p>
                  </td>
                  <td className="px-12 py-10">
                    <div className="flex justify-center">
                        <div className="px-6 py-2 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400 group-hover:bg-white group-hover:text-rose-500 transition-all">
                            {customer.totalOrders} Units
                        </div>
                    </div>
                  </td>
                  <td className="px-12 py-10">
                    <span className={`px-5 py-2 rounded-full text-[8px] font-black uppercase tracking-widest border ${customer.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'} shadow-sm`}>
                        {customer.status}
                    </span>
                  </td>
                  <td className="px-12 py-10 text-right">
                    <button className="p-4 bg-white border border-slate-100 text-slate-200 group-hover:text-rose-500 group-hover:border-rose-100 rounded-2xl transition-all shadow-sm">
                        <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                    <td colSpan={5} className="py-40 text-center italic serif text-4xl opacity-10">No Residents Found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Customers;
