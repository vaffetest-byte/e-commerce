
import React, { useState, useEffect } from 'react';
import { 
  Search, Eye, CheckCircle, Truck, XCircle, 
  MoreVertical, CreditCard, Loader2, MapPin, 
  Package, Calendar, User, ArrowUpRight, 
  Sparkles, Trash2, Printer, ShieldAlert,
  ChevronDown, Save, Download, RotateCcw
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { inventoryService } from '../services/inventoryService';
import { getSearchCuration } from '../geminiService';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'All'>('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [editingTracking, setEditingTracking] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    const data = await inventoryService.getOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PAID: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case OrderStatus.SHIPPED: return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case OrderStatus.DELIVERED: return 'bg-rose-50 text-rose-600 border-rose-100';
      case OrderStatus.CANCELLED: return 'bg-slate-100 text-slate-400 border-slate-200';
      case OrderStatus.RETURN_REQUESTED: return 'bg-amber-100 text-amber-600 border-amber-200';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    await inventoryService.updateOrderStatus(orderId, newStatus);
    if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
    fetchOrders();
  };

  const handleSaveTracking = async () => {
    if (!selectedOrder) return;
    await inventoryService.updateOrderTracking(selectedOrder.id, editingTracking);
    setSelectedOrder({ ...selectedOrder, trackingNumber: editingTracking });
    fetchOrders();
    alert("Registry Synchronized: Tracking Updated.");
  };

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

  const deleteOrder = async (id: string) => {
    if (window.confirm("Permanently wipe this registry entry?")) {
        await inventoryService.deleteOrder(id);
        setSelectedOrder(null);
        fetchOrders();
    }
  };

  const analyzeCustomer = async (order: Order) => {
    setIsAnalyzing(true);
    const itemsStr = order.items.map(i => i.name).join(', ');
    const insight = await getSearchCuration(`Analyze buyer of: ${itemsStr}. Provide aesthetic profile.`);
    setAiInsight(insight);
    setIsAnalyzing(false);
  };

  const filteredOrders = orders.filter(o => 
    (filter === 'All' || o.status === filter) &&
    (o.customerName.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search))
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-40">
      {/* Detail Modal Overlay */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 sm:p-12">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedOrder(null)} />
            <div className="relative bg-white w-full max-w-6xl rounded-[40px] shadow-3xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col md:flex-row">
                {/* Left Panel: Client Info & Status Controls */}
                <div className="md:w-1/3 bg-slate-950 p-12 text-white flex flex-col justify-between max-h-[90vh] overflow-y-auto no-scrollbar">
                    <div>
                        <div className="flex items-center gap-4 mb-10 opacity-40">
                            <ShieldAlert size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Registry Protocol</span>
                        </div>
                        <h2 className="serif text-5xl font-bold italic tracking-tighter mb-6">{selectedOrder.id}</h2>
                        
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/20 block">Matrix Status</span>
                                <div className="relative">
                                    <select 
                                      value={selectedOrder.status} 
                                      onChange={(e) => updateStatus(selectedOrder.id, e.target.value as OrderStatus)}
                                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer focus:bg-white/10"
                                    >
                                        {Object.values(OrderStatus).map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={14} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/20 block">Logistics Trace (Tracking)</span>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        defaultValue={selectedOrder.trackingNumber}
                                        onChange={(e) => setEditingTracking(e.target.value)}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-mono tracking-widest outline-none"
                                        placeholder="ENTER TRK_ID..."
                                    />
                                    <button onClick={handleSaveTracking} className="p-4 bg-white/10 hover:bg-rose-500 rounded-2xl transition-all">
                                        <Save size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-16 space-y-10">
                            <div className="space-y-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/20 block">Client Identity</span>
                                <p className="text-xl font-bold tracking-tight">{selectedOrder.customerName}</p>
                                <p className="text-xs text-white/40 font-mono">{selectedOrder.customerEmail}</p>
                            </div>
                            <div className="space-y-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/20 block">Terminal Node</span>
                                <p className="text-xs text-white/60 leading-relaxed italic serif">
                                    {typeof selectedOrder.shippingAddress === 'string' 
                                      ? selectedOrder.shippingAddress 
                                      : `${selectedOrder.shippingAddress.street}, ${selectedOrder.shippingAddress.city}, ${selectedOrder.shippingAddress.country}`}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-12 border-t border-white/5 space-y-4">
                        <button 
                            onClick={() => handleDownloadInvoice(selectedOrder)}
                            className="w-full flex items-center justify-center gap-4 py-5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            <Download size={16} /> Download Manifest
                        </button>
                        <button 
                            onClick={() => deleteOrder(selectedOrder.id)}
                            className="w-full flex items-center justify-center gap-4 py-5 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white rounded-2xl transition-all"
                        >
                            <Trash2 size={16} /> Purge Registry
                        </button>
                    </div>
                </div>

                {/* Right Panel: Manifest & Intelligence */}
                <div className="flex-1 p-12 overflow-y-auto no-scrollbar max-h-[90vh]">
                    <div className="flex justify-between items-start mb-16">
                        <div className="space-y-2">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30">Acquisition Manifest</h3>
                            <p className="text-slate-400 text-[9px] font-bold tracking-widest uppercase">Verified on {new Date(selectedOrder.date).toLocaleDateString()}</p>
                        </div>
                        <button onClick={() => setSelectedOrder(null)} className="p-4 rounded-full border border-slate-50 hover:bg-slate-50 transition-all">
                            <XCircle size={24} strokeWidth={1} />
                        </button>
                    </div>

                    <div className="space-y-4 mb-16">
                        {selectedOrder.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-8 p-8 bg-slate-50 rounded-[32px] group hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm">
                                    <Package size={24} strokeWidth={1.5} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">{item.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Ref_ID: {item.productId.slice(-6)} // Qty: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-slate-900 italic serif text-2xl">${item.price.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-[#0A0A0A] p-12 rounded-[50px] text-white relative overflow-hidden group mb-12">
                        <div className="absolute top-0 right-0 w-64 h-full bg-rose-600/10 blur-[100px] pointer-events-none" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-5">
                                    <Sparkles size={24} className="text-rose-500 animate-pulse" />
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500">Neural Resident Profile</span>
                                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">Aesthetic Sync Active</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => analyzeCustomer(selectedOrder)}
                                    disabled={isAnalyzing}
                                    className="px-8 py-3 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-3"
                                >
                                    {isAnalyzing ? <Loader2 className="animate-spin" size={12} /> : <RotateCcw size={12} />}
                                    Analyze Vibe
                                </button>
                            </div>
                            <div className="min-h-[100px] flex items-center">
                                <p className="text-white/70 text-xl italic serif leading-relaxed">
                                    {aiInsight || "Analyze artifacts to synthesize a Muse aesthetic profile..."}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-12 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-8">
                        <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                           <div>
                              <span className="text-[8px] font-black uppercase tracking-widest text-slate-300 block mb-1">Subtotal</span>
                              <p className="text-sm font-bold">${selectedOrder.subtotal.toFixed(2)}</p>
                           </div>
                           <div>
                              <span className="text-[8px] font-black uppercase tracking-widest text-slate-300 block mb-1">Logistics</span>
                              <p className="text-sm font-bold">${selectedOrder.shippingFee.toFixed(2)}</p>
                           </div>
                           <div>
                              <span className="text-[8px] font-black uppercase tracking-widest text-slate-300 block mb-1">Tax Matrix</span>
                              <p className="text-sm font-bold">${selectedOrder.tax.toFixed(2)}</p>
                           </div>
                           <div>
                              <span className="text-[8px] font-black uppercase tracking-widest text-rose-400 block mb-1">Reductions</span>
                              <p className="text-sm font-bold text-rose-500">-${(selectedOrder.discount || 0).toFixed(2)}</p>
                           </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 italic">Captured Registry Value</span>
                            <p className="text-7xl font-black tracking-tighter text-rose-600 italic serif">${selectedOrder.total.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 pb-12 px-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-rose-500 block mb-6 italic">Logistics Command // Seongsu</span>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-900 serif italic">Order <span className="not-italic font-black">Registry</span></h1>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group w-full sm:w-80">
                <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500" />
                <input 
                    type="text" 
                    placeholder="REGISTRY ID..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-16 pr-8 py-5 bg-white border border-slate-100 rounded-[30px] text-[10px] font-black uppercase tracking-widest outline-none shadow-sm focus:ring-4 focus:ring-rose-500/5"
                />
            </div>
        </div>
      </div>

      <div className="bg-white rounded-[60px] border border-slate-100 overflow-hidden shadow-2xl">
        <div className="flex gap-10 px-12 py-8 border-b border-slate-50 overflow-x-auto no-scrollbar">
            {['All', ...Object.values(OrderStatus)].map(s => (
                <button 
                    key={s}
                    onClick={() => setFilter(s as any)}
                    className={`text-[10px] font-black uppercase tracking-[0.4em] transition-all whitespace-nowrap pb-4 border-b-2 ${filter === s ? 'text-rose-500 border-rose-500' : 'text-slate-300 border-transparent hover:text-slate-900'}`}
                >
                    {s}
                </button>
            ))}
        </div>

        <div className="overflow-x-auto no-scrollbar">
          {loading ? (
            <div className="py-40 flex justify-center"><Loader2 className="animate-spin text-rose-500" size={32} /></div>
          ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-12 py-8 text-[9px] font-black uppercase tracking-[0.5em] text-slate-400">Registry Trace</th>
                <th className="px-12 py-8 text-[9px] font-black uppercase tracking-[0.5em] text-slate-400">Client Info</th>
                <th className="px-12 py-8 text-[9px] font-black uppercase tracking-[0.5em] text-slate-400 text-center">Volume</th>
                <th className="px-12 py-8 text-[9px] font-black uppercase tracking-[0.5em] text-slate-400">Status Matrix</th>
                <th className="px-12 py-8 text-[9px] font-black uppercase tracking-[0.5em] text-slate-400">Value</th>
                <th className="px-12 py-8 text-[9px] font-black uppercase tracking-[0.5em] text-slate-400 text-right">Terminal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.map(order => (
                <tr key={order.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer" onClick={() => { setSelectedOrder(order); setAiInsight(null); setEditingTracking(order.trackingNumber || ""); }}>
                  <td className="px-12 py-10">
                    <span className="text-[12px] font-black tracking-widest text-slate-900 block mb-1">{order.id}</span>
                    <div className="flex items-center gap-3 text-[9px] text-slate-300 font-bold uppercase tracking-widest">
                        <Calendar size={10} /> {new Date(order.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-12 py-10">
                    <p className="text-base font-black tracking-tighter text-slate-900">{order.customerName}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 opacity-60">
                        <User size={10} /> Registry Resident
                    </div>
                  </td>
                  <td className="px-12 py-10">
                    <div className="flex justify-center">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-200">
                            {order.items.length}
                        </div>
                    </div>
                  </td>
                  <td className="px-12 py-10">
                    <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)} shadow-sm`}>
                        {order.status}
                    </span>
                  </td>
                  <td className="px-12 py-10 font-black text-slate-900 italic serif text-2xl tracking-tighter">${order.total.toFixed(2)}</td>
                  <td className="px-12 py-10 text-right">
                    <button className="p-4 bg-white border border-slate-100 text-slate-200 group-hover:text-rose-500 group-hover:border-rose-100 rounded-2xl transition-all shadow-sm">
                        <ArrowUpRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                    <td colSpan={6} className="py-40 text-center italic serif text-3xl opacity-10">No logs detected.</td>
                </tr>
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
