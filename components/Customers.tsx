import React from 'react';
// Added missing Users icon to the imports
import { User, Users, Mail, DollarSign, Activity } from 'lucide-react';
import { Customer } from '../types';

interface CustomersProps {
  customers: Customer[];
}

const Customers: React.FC<CustomersProps> = ({ customers }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end border-b border-slate-100 pb-8">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 block mb-4">Audience Intelligence</span>
          <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900">Active Muses</h1>
        </div>
        <div className="bg-white px-6 py-4 rounded-2xl border border-slate-100 flex items-center gap-4">
            {/* Using the Users icon to represent the customer base growth */}
            <Users size={18} className="text-rose-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Growth: +12% this month</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {customers.map(customer => (
            <div key={customer.id} className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group">
                <div className="flex items-start justify-between mb-8">
                    <div className="w-16 h-16 rounded-[24px] bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-rose-50 group-hover:text-rose-500 transition-colors">
                        <User size={32} />
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${customer.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {customer.status}
                    </span>
                </div>
                
                <h3 className="text-xl font-black tracking-tight mb-2">{customer.name}</h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-10">{customer.email}</p>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50/50 p-6 rounded-3xl">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">Total LTV</span>
                        <p className="text-lg font-black text-slate-900">${customer.totalSpent}</p>
                    </div>
                    <div className="bg-slate-50/50 p-6 rounded-3xl">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">Engagements</span>
                        <p className="text-lg font-black text-slate-900">{customer.totalOrders} Units</p>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Member since {customer.joinedDate}</span>
                    <button className="text-[9px] font-black uppercase tracking-widest text-rose-500 hover:underline">Full History</button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Customers;