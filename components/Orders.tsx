
import React, { useState, useEffect } from 'react';
import { 
  Search, Eye, CheckCircle, Truck, XCircle, 
  MoreVertical, CreditCard, Loader2, MapPin, 
  Package, Calendar, User, ArrowUpRight, 
  Sparkles, Trash2, Printer, ShieldAlert 
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
            <div className="relative bg-white w-full max-w-5xl rounded-[40px] shadow-3xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col md:flex-row">
                <div className="md:w-1/3 bg-slate-950 p-12 text-white flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-4 mb-10 opacity-40">
                            <ShieldAlert size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Registry Protocol</span>
                        </div>
                        <h2 className="serif text-5xl font-bold italic tracking-tighter mb-4">{selectedOrder.id}</h2>
                        <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(selectedOrder.status)}`}>
                            {selectedOrder.status}
                        </span>
                        
                        <div className="mt-16 space-y-10">
                            <div className="space-y-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/20 block">Client Identity</span>
                                <p className="text-xl font-bold tracking-tight">{selectedOrder.customerName}</p>
                                <p className="text-xs text-white/40">{selectedOrder.customerEmail}</p>
                            </div>
                            <div className="space-y-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/20 block">Shipping Terminal</span>
                                <p className="text-xs text-white/60 leading-relaxed italic serif">{selectedOrder.shippingAddress}</p>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => deleteOrder(selectedOrder.id)}
                        className="flex items-center gap-4 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                    >
                        <Trash2 size={16} /> Erase Registry Entry
                    </button>
                </div>

                <div className="flex-1 p-12 overflow-y-auto no-scrollbar max-h-[80vh]">
                    <div className="flex justify-between items-start mb-16">
                        <div className="space-y-2">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30">Acquisition Manifest</h3>
                            <p className="text-slate-400 text-[9px] font-bold tracking-widest uppercase">Verified on {new Date(selectedOrder.date).toLocaleDateString()}</p>
                        </div>
                        <button onClick={() => setSelectedOrder(null)} className="p-4 rounded-full border border-slate-50 hover:bg-slate-50 transition-all">
                            <XCircle size={24} strokeWidth={1} />
                        </button>
                    </div>

                    <div className="space-y-6 mb-16">
                        {selectedOrder.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-8 p-6 bg-slate-50 rounded-3xl group hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm">
                                    <Package size={24} strokeWidth={1.5} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-slate-900 truncate">{item.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Qty: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-slate-900 italic serif text-lg">${item.price.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-[#0A0A0A] p-10 rounded-[40px] text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-full bg-rose-600/10 blur-3xl pointer-events-none" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <Sparkles size={18} className="text-rose-500" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500">Neural Vibe Analysis</span>
                                </div>
                                <button 
                                    onClick={() => analyzeCustomer(selectedOrder)}
                                    disabled={isAnalyzing}
                                    className="px-6 py-2 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                                >
                                    {isAnalyzing ? <Loader2 className="animate-spin" size={12} /> : 'Sync Intelligence'}
                                </button>
                            </div>
                            <p className="text-white/60 text-base italic serif leading-relaxed min-h-[40px]">
                                {aiInsight || "Initiate aesthetic sync to analyze buyer profile..."}
                            </p>
                        </div>
                    </div>

                    <div className="mt-16 pt-12 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex gap-4">
                            <button 
                                onClick={() => updateStatus(selectedOrder.id, OrderStatus.SHIPPED)}
                                disabled={selectedOrder.status !== OrderStatus.PAID}
                                className="px-8 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 disabled:bg-slate-100 disabled:text-slate-300 transition-all"
                            >
                                Dispatch Entry
                            </button>
                            <button 
                                onClick={() => updateStatus(selectedOrder.id, OrderStatus.DELIVERED)}
                                disabled={selectedOrder.status !== OrderStatus.SHIPPED}
                                className="px-8 py-4 border border-black text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white disabled:opacity-20 transition-all"
                            >
                                Confirm Arrival
                            </button>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Value</p>
                            <p className="text-4xl font-black tracking-tighter text-rose-600 italic serif">${selectedOrder.total.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 pb-12">
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
                <tr key={order.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer" onClick={() => { setSelectedOrder(order); setAiInsight(null); }}>
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
