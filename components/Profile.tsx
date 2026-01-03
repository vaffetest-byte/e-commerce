
import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, History, Heart, MapPin, LogOut, 
  ArrowRight, ShieldCheck, Camera, Edit2, 
  Package, Calendar, CheckCircle2, ChevronRight,
  ArrowLeft, ShoppingBag, Trash2, Loader2, Download,
  XCircle, RotateCcw, Truck, FileText, Fingerprint,
  LifeBuoy, Send
} from 'lucide-react';
import { Customer, Order, Product, OrderStatus } from '../types';
import { inventoryService } from '../services/inventoryService';

interface ProfileProps {
  customer: Customer;
  onLogout: () => void;
  onClose: () => void;
  onNavigateToCatalog: () => void;
}

const Profile: React.FC<ProfileProps> = ({ customer, onLogout, onClose, onNavigateToCatalog }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'wishlist' | 'addresses' | 'support'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Support State
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submittingTicket, setSubmittingTicket] = useState(false);

  const fetchRegistryData = async () => {
    setLoading(true);
    const [allOrders, allProducts] = await Promise.all([
      inventoryService.getOrders(),
      inventoryService.getProducts()
    ]);
    setOrders(allOrders.filter(o => o.customerEmail === customer.email));
    setWishlistProducts(allProducts.filter(p => customer.wishlist?.includes(p.id)));
    setLoading(false);
  };

  useEffect(() => {
    fetchRegistryData();
  }, [customer]);

  const stats = useMemo(() => ({
    totalSpent: orders.reduce((sum, o) => sum + o.total, 0),
    orderCount: orders.length,
    wishlistCount: wishlistProducts.length
  }), [orders, wishlistProducts]);

  const handleDownloadInvoice = async (order: Order) => {
    const invoice = await inventoryService.generateInvoice(order);
    const blob = new Blob([invoice], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${order.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCancelOrder = async (id: string) => {
    if (window.confirm("Abort acquisition protocol? This action is irreversible.")) {
      await inventoryService.updateOrderStatus(id, OrderStatus.CANCELLED);
      await fetchRegistryData();
      setSelectedOrder(null);
    }
  };

  const handleRequestReturn = async (id: string) => {
    if (window.confirm("Initialize return protocol? Our couriers will be dispatched to your terminal.")) {
      await inventoryService.updateOrderStatus(id, OrderStatus.RETURN_REQUESTED);
      await fetchRegistryData();
      setSelectedOrder(null);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTicket(true);
    await inventoryService.createTicket({
      customerId: customer.id,
      customerName: customer.name,
      subject,
      message
    });
    setSubmittingTicket(false);
    setSubject("");
    setMessage("");
    alert("Inquiry successfully logged in support registry.");
  };

  return (
    <div className="fixed inset-0 z-[3500] flex items-center justify-center p-4 sm:p-10">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-3xl" onClick={onClose} />
      <div className="relative bg-white w-full max-w-6xl h-full md:h-[85vh] rounded-[40px] md:rounded-[80px] overflow-hidden shadow-3xl flex flex-col md:flex-row animate-in zoom-in-95 duration-700">
        
        {/* Navigation Sidebar */}
        <div className="md:w-1/4 bg-slate-50 p-10 md:p-16 flex flex-col justify-between border-r border-black/[0.03]">
          <div className="space-y-16">
            <div className="text-center">
              <div className="relative inline-block group mb-8">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-[40px] flex items-center justify-center text-slate-200 border border-black/5 shadow-inner overflow-hidden">
                  <User size={48} strokeWidth={1} />
                </div>
                <button className="absolute bottom-0 right-0 p-3 bg-rose-500 text-white rounded-2xl shadow-xl scale-0 group-hover:scale-100 transition-transform">
                  <Camera size={14} />
                </button>
              </div>
              <h2 className="serif text-3xl italic font-bold tracking-tight mb-2">@{customer.name.toLowerCase()}</h2>
              <span className="text-[9px] font-black uppercase tracking-widest text-black/20 italic">Registry Resident since {customer.joinedDate}</span>
            </div>

            <div className="space-y-4">
              {[
                { id: 'overview', label: 'Identity Stats', icon: ShieldCheck },
                { id: 'orders', label: 'Acquisition Log', icon: History },
                { id: 'wishlist', label: 'Saved Artifacts', icon: Heart },
                { id: 'addresses', label: 'Terminal Nodes', icon: MapPin },
                { id: 'support', label: 'Support Inquiry', icon: LifeBuoy }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); setSelectedOrder(null); }}
                  className={`w-full flex items-center gap-6 p-6 rounded-3xl transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-xl' : 'text-black/30 hover:text-black/60'}`}
                >
                  <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2 : 1.5} className={activeTab === tab.id ? 'text-rose-500' : ''} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button onClick={onLogout} className="w-full flex items-center justify-center gap-4 py-6 rounded-[30px] border border-black/5 text-[10px] font-black uppercase tracking-widest text-black/30 hover:text-rose-600 hover:border-rose-100 transition-all">
            <LogOut size={16} /> Terminate Session
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-10 md:p-24 overflow-y-auto no-scrollbar relative bg-white">
          <button onClick={selectedOrder ? () => setSelectedOrder(null) : onClose} className="absolute top-12 right-12 p-4 hover:bg-slate-50 rounded-full transition-all z-10">
            <ArrowLeft size={24} strokeWidth={1} />
          </button>

          {activeTab === 'overview' && !selectedOrder && (
            <div className="space-y-16 animate-in fade-in slide-in-from-right-10 duration-700">
               <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-rose-500 block mb-6 italic">Account Dossier</span>
                  <h2 className="serif text-6xl md:text-8xl italic font-light tracking-tighter">Your <span className="not-italic font-black">Identity.</span></h2>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-[#0A0A0A] p-10 rounded-[50px] text-white">
                     <span className="text-[9px] font-black uppercase tracking-widest text-white/20 block mb-6">LTV Value</span>
                     <p className="serif text-5xl italic font-bold text-rose-500">${stats.totalSpent.toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-50 p-10 rounded-[50px]">
                     <span className="text-[9px] font-black uppercase tracking-widest text-black/20 block mb-6">Registry Entries</span>
                     <p className="serif text-5xl italic font-bold">{stats.orderCount}</p>
                  </div>
                  <div className="bg-slate-50 p-10 rounded-[50px]">
                     <span className="text-[9px] font-black uppercase tracking-widest text-black/20 block mb-6">Saved Artifacts</span>
                     <p className="serif text-5xl italic font-bold">{stats.wishlistCount}</p>
                  </div>
               </div>

               <div className="p-12 border border-black/5 rounded-[60px] space-y-12">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] italic">Profile Parameters</h3>
                    <button className="p-3 hover:bg-slate-50 rounded-full transition-all"><Edit2 size={16} /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                     <div className="space-y-2">
                        <span className="text-[8px] font-black text-black/20 uppercase tracking-widest">Legal Designation</span>
                        <p className="font-bold text-lg">{customer.name}</p>
                     </div>
                     <div className="space-y-2">
                        <span className="text-[8px] font-black text-black/20 uppercase tracking-widest">Registry ID</span>
                        <p className="font-bold text-lg text-rose-500 font-mono">#{customer.id.toUpperCase()}</p>
                     </div>
                     <div className="space-y-2">
                        <span className="text-[8px] font-black text-black/20 uppercase tracking-widest">Communication Channel</span>
                        <p className="font-bold text-lg">{customer.email}</p>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'orders' && !selectedOrder && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-10 duration-700">
              <h2 className="serif text-5xl italic font-light tracking-tighter">Acquisition <span className="not-italic font-black">History.</span></h2>
              {loading ? <Loader2 className="animate-spin" /> : orders.length === 0 ? (
                <div className="py-20 text-center opacity-20 italic serif text-3xl">No records found.</div>
              ) : (
                <div className="space-y-6">
                  {orders.map(order => (
                    <div 
                      key={order.id} 
                      onClick={() => setSelectedOrder(order)}
                      className="p-8 md:p-12 bg-slate-50 rounded-[40px] border border-black/[0.03] flex items-center justify-between group hover:bg-white hover:shadow-2xl transition-all cursor-pointer"
                    >
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
                             <p className="text-[10px] text-black/30 font-bold uppercase tracking-widest">{new Date(order.date).toLocaleDateString()}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="serif text-3xl italic font-bold text-black mb-2">${order.total.toFixed(2)}</p>
                          <div className="flex items-center justify-end gap-3 text-[10px] font-black uppercase tracking-widest text-black/20 group-hover:text-rose-50 transition-colors">
                            Track <ChevronRight size={14} className="group-hover:translate-x-2 transition-all" />
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedOrder && activeTab === 'orders' && (
            <div className="space-y-16 animate-in fade-in slide-in-from-right-10 duration-700">
               <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-rose-500 block mb-6 italic">Tracking Protocol</span>
                    <h2 className="serif text-6xl md:text-8xl italic font-light tracking-tighter">{selectedOrder.id}</h2>
                    <p className="text-[11px] font-black uppercase tracking-widest text-black/30 mt-4">Carrier: Seoul Muse Logistics // Ref: {selectedOrder.trackingNumber}</p>
                  </div>
                  <div className="flex gap-4">
                     <button 
                       onClick={() => handleDownloadInvoice(selectedOrder)}
                       className="p-6 bg-slate-50 hover:bg-black hover:text-white rounded-[30px] border border-black/5 transition-all group"
                       title="Download Invoice"
                     >
                        <Download size={20} className="group-hover:scale-110 transition-transform" />
                     </button>
                     {selectedOrder.status === OrderStatus.PENDING && (
                        <button 
                          onClick={() => handleCancelOrder(selectedOrder.id)}
                          className="px-10 py-6 bg-rose-50 text-rose-600 rounded-[30px] font-black uppercase tracking-widest text-[10px] flex items-center gap-4 hover:bg-rose-600 hover:text-white transition-all shadow-xl shadow-rose-100"
                        >
                           <XCircle size={18} /> Abort Acquisition
                        </button>
                     )}
                     {selectedOrder.status === OrderStatus.DELIVERED && (
                        <button 
                          onClick={() => handleRequestReturn(selectedOrder.id)}
                          className="px-10 py-6 border border-black rounded-[30px] font-black uppercase tracking-widest text-[10px] flex items-center gap-4 hover:bg-black hover:text-white transition-all"
                        >
                           <RotateCcw size={18} /> Request Return
                        </button>
                     )}
                  </div>
               </div>

               {/* Tracking Timeline */}
               <div className="p-12 bg-slate-50 rounded-[60px] space-y-12">
                  <div className="flex justify-between items-center px-4">
                     {[
                       { label: 'Registry', icon: Fingerprint, active: true },
                       { label: 'Packaging', icon: Package, active: [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(selectedOrder.status) },
                       { label: 'Logistics', icon: Truck, active: [OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(selectedOrder.status) },
                       { label: 'Terminal', icon: CheckCircle2, active: selectedOrder.status === OrderStatus.DELIVERED }
                     ].map((step, idx, arr) => (
                       <React.Fragment key={idx}>
                          <div className={`flex flex-col items-center gap-4 ${step.active ? 'text-rose-500' : 'text-black/10'}`}>
                             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all ${step.active ? 'bg-rose-500 text-white border-rose-500 shadow-xl shadow-rose-100' : 'border-black/5 bg-white'}`}>
                                <step.icon size={24} strokeWidth={step.active ? 2.5 : 1.5} />
                             </div>
                             <span className="text-[9px] font-black uppercase tracking-widest">{step.label}</span>
                          </div>
                          {idx < arr.length - 1 && (
                            <div className={`flex-1 h-[2px] mt-7 mx-4 rounded-full transition-all ${step.active && arr[idx+1].active ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'bg-black/5'}`} />
                          )}
                       </React.Fragment>
                     ))}
                  </div>
               </div>

               {/* Order Items Summary */}
               <div className="space-y-8">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] italic ml-6 text-black/30">Registry Manifest</h3>
                  <div className="space-y-4">
                     {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-8 bg-white border border-black/5 rounded-[40px] group hover:bg-slate-50 transition-all">
                           <div className="flex items-center gap-8">
                              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-black/20">
                                 <FileText size={20} />
                              </div>
                              <div>
                                 <p className="text-sm font-black uppercase tracking-tight">{item.name}</p>
                                 <p className="text-[9px] font-bold text-black/30 uppercase tracking-widest">Qty: {item.quantity}</p>
                              </div>
                           </div>
                           <p className="serif text-3xl italic font-bold">${item.price.toFixed(2)}</p>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="pt-12 border-t border-black/5 flex justify-between items-baseline">
                  <span className="text-[12px] font-black uppercase tracking-[0.5em] text-black/20">Total Value Captured</span>
                  <span className="serif text-7xl italic font-bold text-rose-600">${selectedOrder.total.toFixed(2)}</span>
               </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-10 duration-700">
               <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-rose-500 block mb-6 italic">Support Protocol</span>
                  <h2 className="serif text-6xl md:text-8xl italic font-light tracking-tighter">Submit <span className="not-italic font-black">Inquiry.</span></h2>
               </div>

               <form onSubmit={handleSubmitTicket} className="space-y-8 max-w-2xl">
                  <div className="space-y-4">
                     <label className="text-[9px] font-black uppercase tracking-widest text-black/20 ml-6">Subject Designation</label>
                     <input 
                       type="text" 
                       value={subject}
                       onChange={(e) => setSubject(e.target.value)}
                       placeholder="ORDER DELAY / SIZING QUERY..."
                       className="w-full px-8 py-5 bg-slate-50 rounded-full text-xs font-black outline-none border border-transparent focus:border-rose-500"
                       required
                     />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[9px] font-black uppercase tracking-widest text-black/20 ml-6">Narrative Details</label>
                     <textarea 
                       value={message}
                       onChange={(e) => setMessage(e.target.value)}
                       placeholder="PROVIDE OPERATIONAL CONTEXT..."
                       className="w-full px-8 py-6 bg-slate-50 rounded-[40px] text-xs font-bold outline-none border border-transparent focus:border-rose-500 min-h-[200px]"
                       required
                     />
                  </div>
                  <button 
                    type="submit" 
                    disabled={submittingTicket}
                    className="w-full bg-black text-white py-8 rounded-full font-black uppercase tracking-[0.6em] text-[11px] hover:bg-rose-600 transition-all shadow-3xl flex items-center justify-center gap-4"
                  >
                     {submittingTicket ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                     Execute Inquiry Protocol
                  </button>
               </form>

               <div className="p-12 bg-slate-50 rounded-[60px] border border-black/5">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-black/20 mb-6 italic">Communication Latency</h4>
                  <p className="text-sm serif italic leading-relaxed text-black/40">
                    "Our support staff monitors the registry cycles 24/7. Response latency is typically under 12 registry hours. Your inquiry has been prioritized based on your Muse resident tier."
                  </p>
               </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-10 duration-700">
               <h2 className="serif text-5xl italic font-light tracking-tighter">Saved <span className="not-italic font-black">Artifacts.</span></h2>
               {wishlistProducts.length === 0 ? (
                 <div className="py-20 text-center space-y-8">
                    <p className="opacity-20 italic serif text-3xl">Registry empty.</p>
                    <button onClick={onNavigateToCatalog} className="px-12 py-6 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-widest">Examine Collection</button>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                    {wishlistProducts.map(p => (
                      <div key={p.id} className="group cursor-pointer">
                        <div className="aspect-[4/5] bg-slate-50 rounded-[40px] overflow-hidden mb-6 relative">
                           <img src={p.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={p.name} />
                           <button className="absolute top-6 right-6 p-4 bg-white/80 backdrop-blur-xl rounded-full text-rose-600 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                              <ShoppingBag size={18} />
                           </button>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-rose-500 mb-2 block">{p.category}</span>
                        <h4 className="serif text-3xl italic font-bold">{p.name}</h4>
                      </div>
                    ))}
                 </div>
               )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-10 duration-700">
               <div className="flex justify-between items-center">
                  <h2 className="serif text-5xl italic font-light tracking-tighter">Terminal <span className="not-italic font-black">Nodes.</span></h2>
                  <button className="px-10 py-4 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-widest">Add Node</button>
               </div>
               
               {customer.addresses?.length === 0 ? (
                 <div className="py-20 text-center opacity-20 italic serif text-3xl">No nodes configured.</div>
               ) : (
                 <div className="space-y-6">
                    {customer.addresses?.map((addr, i) => (
                       <div key={i} className="p-12 bg-slate-50 rounded-[50px] border border-black/[0.03] flex items-center justify-between group">
                          <div className="flex items-center gap-10">
                             <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-black/10">
                                <MapPin size={24} />
                             </div>
                             <div>
                                <p className="text-lg font-bold mb-1">{addr.fullName}</p>
                                <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest">
                                   {addr.street}, {addr.city} {addr.postalCode}
                                </p>
                             </div>
                          </div>
                          <div className="flex gap-4">
                             <button className="p-4 rounded-full hover:bg-white transition-all text-black/20 hover:text-rose-500"><Edit2 size={16}/></button>
                             <button className="p-4 rounded-full hover:bg-white transition-all text-black/20 hover:text-rose-600"><Trash2 size={16}/></button>
                          </div>
                       </div>
                    ))}
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
