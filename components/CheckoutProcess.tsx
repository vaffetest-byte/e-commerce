
import React, { useState, useMemo } from 'react';
import { 
  X, MapPin, Truck, CreditCard, ShieldCheck, 
  ChevronRight, ArrowLeft, Loader2, CheckCircle2,
  Lock, Globe, Smartphone, Landmark
} from 'lucide-react';
import { Customer, ShippingAddress, OrderItem } from '../types';
import { SHIPPING_METHODS, TAX_RATE } from '../constants';
import { inventoryService } from '../services/inventoryService';

interface CheckoutProps {
  cart: any[];
  customer: Customer | null;
  onSuccess: (orderId: string) => void;
  onClose: () => void;
}

const CheckoutProcess: React.FC<CheckoutProps> = ({ cart, customer, onSuccess, onClose }) => {
  const [step, setStep] = useState<'address' | 'shipping' | 'payment' | 'review'>('address');
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [address, setAddress] = useState<ShippingAddress>(customer?.addresses?.[0] || {
    fullName: customer?.name || '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'South Korea'
  });
  const [shippingMethod, setShippingMethod] = useState(SHIPPING_METHODS[0]);
  const [paymentType, setPaymentType] = useState<'card' | 'upi' | 'wallet' | 'bnpl'>('card');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const subtotal = useMemo(() => cart.reduce((sum, i) => sum + i.price, 0), [cart]);
  const tax = useMemo(() => (subtotal - discount) * TAX_RATE, [subtotal, discount]);
  const total = useMemo(() => subtotal - discount + tax + shippingMethod.price, [subtotal, discount, tax, shippingMethod]);

  const handleApplyCoupon = async () => {
    const coupons = await inventoryService.getCoupons();
    const c = coupons.find(x => x.code === couponCode.toUpperCase() && x.status === 'Active');
    if (c) {
      if (c.discountType === 'Percentage') setDiscount(subtotal * (c.value / 100));
      else setDiscount(c.value);
    } else {
      alert("Invalid Registry Key (Coupon)");
    }
  };

  const finalizeOrder = async () => {
    setLoading(true);
    try {
      const order = await inventoryService.placeOrder({
        customerName: customer?.name || address.fullName,
        customerEmail: customer?.email || 'guest@archive.com',
        items: cart.map(i => ({ productId: i.id, name: i.name, quantity: 1, price: i.price })),
        subtotal,
        tax,
        discount,
        shippingFee: shippingMethod.price,
        total,
        paymentMethod: paymentType.toUpperCase(),
        shippingAddress: address
      });
      onSuccess(order.id);
    } catch (e) {
      alert("Acquisition protocol failure. Link lost.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 sm:p-10">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-3xl" onClick={onClose} />
      <div className="relative bg-white w-full max-w-5xl h-full md:h-auto md:max-h-[90vh] rounded-[40px] md:rounded-[60px] overflow-hidden shadow-3xl flex flex-col md:flex-row animate-in zoom-in-95 duration-700">
        
        {/* Progress Sidebar */}
        <div className="md:w-1/3 bg-[#0A0A0A] p-10 md:p-16 text-white flex flex-col justify-between">
          <div className="space-y-12">
            <div className="flex items-center gap-4 opacity-30">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Registry Acquisition</span>
            </div>
            
            <div className="space-y-10">
              {[
                { id: 'address', label: 'Terminal Address', icon: MapPin },
                { id: 'shipping', label: 'Logistics Matrix', icon: Truck },
                { id: 'payment', label: 'Payment Protocol', icon: CreditCard },
                { id: 'review', label: 'Final Verification', icon: CheckCircle2 }
              ].map((s, idx) => (
                <div key={s.id} className={`flex items-center gap-6 transition-all ${step === s.id ? 'opacity-100 scale-105' : 'opacity-20'}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${step === s.id ? 'border-rose-500 bg-rose-500 text-white' : 'border-white/20'}`}>
                    <s.icon size={18} />
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/30 block mb-1">Step 0{idx+1}</span>
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em]">{s.label}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-12 border-t border-white/5">
             <div className="flex justify-between items-baseline mb-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Estimated Value</span>
                <span className="serif text-4xl italic font-bold text-rose-500">${total.toFixed(2)}</span>
             </div>
             <p className="text-[8px] text-white/10 uppercase tracking-[0.3em] font-mono italic">SYNCED WITH TERMINAL 4 SEOUL</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-10 md:p-20 overflow-y-auto no-scrollbar bg-white">
          <div className="flex justify-between items-center mb-16">
             <button onClick={onClose} className="p-4 hover:bg-slate-50 rounded-full transition-all group">
                <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
             </button>
             <span className="text-[10px] font-black uppercase tracking-[0.5em] text-black/10">Metamorphosis // Checkout</span>
          </div>

          {step === 'address' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-10">
              <h2 className="serif text-5xl italic font-light tracking-tighter">Terminal <span className="not-italic font-black">Address.</span></h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-black/20 ml-4">Full Designation</label>
                  <input type="text" value={address.fullName} onChange={(e) => setAddress({...address, fullName: e.target.value})} className="w-full px-8 py-5 bg-slate-50 rounded-3xl text-xs font-bold outline-none border border-transparent focus:border-rose-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-black/20 ml-4">Registry District (Postal)</label>
                  <input type="text" value={address.postalCode} onChange={(e) => setAddress({...address, postalCode: e.target.value})} className="w-full px-8 py-5 bg-slate-50 rounded-3xl text-xs font-bold outline-none border border-transparent focus:border-rose-500" />
                </div>
                <div className="col-span-full space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-black/20 ml-4">Street Narrative</label>
                  <input type="text" value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})} className="w-full px-8 py-5 bg-slate-50 rounded-3xl text-xs font-bold outline-none border border-transparent focus:border-rose-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-black/20 ml-4">City / Node</label>
                  <input type="text" value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} className="w-full px-8 py-5 bg-slate-50 rounded-3xl text-xs font-bold outline-none border border-transparent focus:border-rose-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-black/20 ml-4">Province</label>
                  <input type="text" value={address.state} onChange={(e) => setAddress({...address, state: e.target.value})} className="w-full px-8 py-5 bg-slate-50 rounded-3xl text-xs font-bold outline-none border border-transparent focus:border-rose-500" />
                </div>
              </div>
              <button onClick={() => setStep('shipping')} className="w-full bg-black text-white py-8 rounded-full font-black uppercase tracking-[0.5em] text-[11px] hover:bg-rose-600 transition-all flex items-center justify-center gap-4">
                Verify Address & Proceed <ChevronRight size={18} />
              </button>
            </div>
          )}

          {step === 'shipping' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-10">
              <h2 className="serif text-5xl italic font-light tracking-tighter">Logistics <span className="not-italic font-black">Matrix.</span></h2>
              <div className="space-y-6">
                {SHIPPING_METHODS.map(method => (
                  <button 
                    key={method.id} 
                    onClick={() => setShippingMethod(method)}
                    className={`w-full p-8 rounded-[40px] border flex items-center justify-between group transition-all ${shippingMethod.id === method.id ? 'bg-black border-black text-white shadow-2xl' : 'bg-white border-black/5 text-black hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-8">
                       <Truck size={24} className={shippingMethod.id === method.id ? 'text-rose-500' : 'text-slate-200'} />
                       <div className="text-left">
                          <p className="text-[10px] font-black uppercase tracking-widest mb-1">{method.name}</p>
                          <p className="text-[9px] opacity-40 uppercase tracking-widest">{method.est}</p>
                       </div>
                    </div>
                    <span className="serif text-2xl italic font-bold">${method.price}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-6">
                <button onClick={() => setStep('address')} className="flex-1 py-8 rounded-full border border-black/10 font-black uppercase tracking-[0.4em] text-[10px] hover:bg-slate-50 transition-all">Back</button>
                <button onClick={() => setStep('payment')} className="flex-[2] bg-black text-white py-8 rounded-full font-black uppercase tracking-[0.4em] text-[10px] hover:bg-rose-600 transition-all">Select Payment Protocol</button>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-10">
              <h2 className="serif text-5xl italic font-light tracking-tighter">Payment <span className="not-italic font-black">Protocol.</span></h2>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { id: 'card', label: 'Universal Card', icon: CreditCard },
                  { id: 'upi', label: 'Matrix UPI', icon: Globe },
                  { id: 'wallet', label: 'Neural Wallet', icon: Smartphone },
                  { id: 'bnpl', label: 'Registry Later', icon: Landmark }
                ].map(p => (
                  <button 
                    key={p.id} 
                    onClick={() => setPaymentType(p.id as any)}
                    className={`p-10 rounded-[40px] border flex flex-col items-center gap-6 group transition-all ${paymentType === p.id ? 'bg-black border-black text-white shadow-2xl' : 'bg-white border-black/5 text-black hover:bg-slate-50'}`}
                  >
                    <p.icon size={32} strokeWidth={1} className={paymentType === p.id ? 'text-rose-500' : 'text-slate-200'} />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]">{p.label}</span>
                  </button>
                ))}
              </div>
              
              <div className="p-10 bg-slate-50 rounded-[40px] space-y-6">
                  <p className="text-[9px] font-black uppercase tracking-widest text-black/20 italic">Registry Key (Coupon)</p>
                  <div className="flex gap-4">
                    <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="ENTER KEY..." className="flex-1 px-8 py-4 bg-white rounded-full text-[10px] font-black uppercase tracking-widest outline-none border border-transparent focus:border-rose-500" />
                    <button onClick={handleApplyCoupon} className="px-10 py-4 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-rose-600">Apply</button>
                  </div>
              </div>

              <div className="flex gap-6">
                <button onClick={() => setStep('shipping')} className="flex-1 py-8 rounded-full border border-black/10 font-black uppercase tracking-[0.4em] text-[10px] hover:bg-slate-50 transition-all">Back</button>
                <button onClick={() => setStep('review')} className="flex-[2] bg-black text-white py-8 rounded-full font-black uppercase tracking-[0.4em] text-[10px] hover:bg-rose-600 transition-all flex items-center justify-center gap-4">
                   Verify Purchase <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-10">
              <h2 className="serif text-5xl italic font-light tracking-tighter">Final <span className="not-italic font-black">Verification.</span></h2>
              <div className="space-y-8">
                 <div className="flex justify-between items-baseline border-b border-black/5 pb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-black/30">Artifacts Count</span>
                    <span className="text-xl font-bold">{cart.length}</span>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                       <span className="text-black/30">Base Value</span>
                       <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-emerald-500">
                        <span>Registry Discount</span>
                        <span>-${discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                       <span className="text-black/30">Registry Tax (10%)</span>
                       <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                       <span className="text-black/30">Logistics Fee</span>
                       <span>${shippingMethod.price.toFixed(2)}</span>
                    </div>
                    <div className="pt-6 border-t border-black/10 flex justify-between items-baseline">
                       <span className="text-[12px] font-black uppercase tracking-[0.5em] text-rose-500 italic">Total Acquisition Value</span>
                       <span className="serif text-6xl italic font-bold">${total.toFixed(2)}</span>
                    </div>
                 </div>
              </div>

              <div className="bg-emerald-50/50 p-8 rounded-[40px] border border-emerald-100 flex items-center gap-6">
                 <Lock size={24} className="text-emerald-500" />
                 <p className="text-[9px] font-black uppercase tracking-widest text-emerald-800/60 leading-relaxed">
                    Transaction secured by Neural Cryptography. End-to-end registry encryption active.
                 </p>
              </div>

              <div className="flex gap-6">
                <button onClick={() => setStep('payment')} className="flex-1 py-8 rounded-full border border-black/10 font-black uppercase tracking-[0.4em] text-[10px] hover:bg-slate-50 transition-all">Modify</button>
                <button 
                  onClick={finalizeOrder} 
                  disabled={loading}
                  className="flex-[2] bg-rose-600 text-white py-8 rounded-full font-black uppercase tracking-[0.5em] text-[11px] hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-4"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={18} />}
                  Execute Acquisition Protocol
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutProcess;
