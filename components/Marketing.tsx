
import React from 'react';
import { Ticket, Plus, Tag, Calendar, BarChart3, Trash2 } from 'lucide-react';
import { Coupon } from '../types';

interface MarketingProps {
  coupons: Coupon[];
  onUpdateCoupon: (coupon: Coupon) => void;
}

const Marketing: React.FC<MarketingProps> = ({ coupons, onUpdateCoupon }) => {
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex justify-between items-end border-b border-slate-100 pb-8">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 block mb-4">Growth Hack / Promos</span>
          <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900">Campaign Manager</h1>
        </div>
        <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-[10px] hover:bg-rose-500 transition-all shadow-xl shadow-slate-100">
            <Plus size={16} />
            Generate New Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {coupons.map(coupon => (
            <div key={coupon.id} className="relative bg-white rounded-[50px] border border-slate-100 overflow-hidden group hover:shadow-2xl transition-all">
                {/* Left Cutout Decor */}
                <div className="absolute top-1/2 -left-4 w-8 h-8 bg-slate-50 border-r border-slate-100 rounded-full -translate-y-1/2" />
                {/* Right Cutout Decor */}
                <div className="absolute top-1/2 -right-4 w-8 h-8 bg-slate-50 border-l border-slate-100 rounded-full -translate-y-1/2" />
                
                <div className="flex">
                    <div className="w-1/3 bg-slate-900 p-10 flex flex-col items-center justify-center text-center gap-4 relative">
                        <Tag size={24} className="text-rose-500" />
                        <h4 className="text-3xl font-black text-white tracking-tighter">{coupon.value}{coupon.discountType === 'Percentage' ? '%' : '$'}</h4>
                        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40">OFF TOTAL</p>
                    </div>
                    <div className="flex-1 p-10 flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-black tracking-tight mb-1">{coupon.code}</h3>
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-widest">Active</span>
                            </div>
                            <button className="p-3 text-slate-200 hover:text-rose-500 transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                            <div className="flex items-center gap-3 text-slate-400">
                                <Calendar size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{coupon.expiryDate}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400">
                                <BarChart3 size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{coupon.usageCount} Redeemed</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Marketing;
