import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, Truck, XCircle, MoreVertical, CreditCard, Loader2 } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { inventoryService } from '../services/inventoryService';

interface OrdersProps {
  orders: Order[];
  onUpdateOrder: (order: Order) => void;
}

const Orders: React.FC<OrdersProps> = ({ orders: initialOrders, onUpdateOrder }) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filter, setFilter] = useState<OrderStatus | 'All'>('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const data = await inventoryService.getOrders();
      setOrders(data);
      setLoading(false);
    };
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

  const updateStatus = async (order: Order, newStatus: OrderStatus) => {
    await inventoryService.updateOrderStatus(order.id, newStatus);
    const updated = await inventoryService.getOrders();
    setOrders(updated);
  };

  const filteredOrders = orders.filter(o => 
    (filter === 'All' || o.status === filter) &&
    (o.customerName.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end border-b border-slate-100 pb-8">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 block mb-4">Fulfillment Engine</span>
          <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900">Order Logs</h1>
        </div>
        <div className="flex gap-4">
            <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input 
                    type="text" 
                    placeholder="FIND BY ID OR NAME" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all"
                />
            </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
        <div className="flex gap-8 px-12 py-6 border-b border-slate-50 overflow-x-auto no-scrollbar">
            {['All', ...Object.values(OrderStatus)].map(s => (
                <button 
                    key={s}
                    onClick={() => setFilter(s as any)}
                    className={`text-[9px] font-black uppercase tracking-[0.3em] transition-all whitespace-nowrap ${filter === s ? 'text-rose-500 border-b-2 border-rose-500 pb-2' : 'text-slate-300 hover:text-slate-900'}`}
                >
                    {s}
                </button>
            ))}
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-rose-500" /></div>
          ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-12 py-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Order Ref</th>
                <th className="px-12 py-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                <th className="px-12 py-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Items</th>
                <th className="px-12 py-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Total</th>
                <th className="px-12 py-6 text-[9px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-12 py-6 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-12 py-8">
                    <span className="text-[11px] font-black tracking-widest text-slate-900">{order.id}</span>
                    <p className="text-[9px] text-slate-300 font-bold mt-1">{order.date}</p>
                  </td>
                  <td className="px-12 py-8">
                    <p className="text-sm font-black tracking-tighter">{order.customerName}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{order.customerEmail}</p>
                  </td>
                  <td className="px-12 py-8">
                    <div className="flex -space-x-2">
                        {order.items.map((item, i) => (
                            <div key={i} title={item.name} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-black">
                                {item.quantity}
                            </div>
                        ))}
                    </div>
                  </td>
                  <td className="px-12 py-8 font-black text-slate-900">${order.total.toFixed(2)}</td>
                  <td className="px-12 py-8">
                    <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                        {order.status}
                    </span>
                  </td>
                  <td className="px-12 py-8 text-right">
                    <div className="flex justify-end gap-2">
                        {order.status === OrderStatus.PAID && (
                            <button onClick={() => updateStatus(order, OrderStatus.SHIPPED)} className="p-3 bg-indigo-50 text-indigo-500 rounded-xl hover:bg-indigo-500 hover:text-white transition-all">
                                <Truck size={16} />
                            </button>
                        )}
                        {order.status === OrderStatus.SHIPPED && (
                            <button onClick={() => updateStatus(order, OrderStatus.DELIVERED)} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all">
                                <CheckCircle size={16} />
                            </button>
                        )}
                        <button className="p-3 text-slate-300 hover:bg-slate-50 hover:text-slate-900 rounded-xl">
                            <Eye size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;