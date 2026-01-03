
import React, { useState } from 'react';
import { X, Mail, User, ShieldCheck, Loader2, Fingerprint, ArrowRight, Lock } from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import { Customer } from '../types';

interface CustomerAuthProps {
  onSuccess: (customer: Customer) => void;
  onClose: () => void;
}

const CustomerAuth: React.FC<CustomerAuthProps> = ({ onSuccess, onClose }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const customer = await inventoryService.authenticateCustomer(email, password);
        if (customer) {
          onSuccess(customer);
        } else {
          setError("Identity verification failed. Invalid handle or passphrase.");
        }
      } else {
        if (password.length < 4) {
          setError("Passphrase must be at least 4 characters.");
          setLoading(false);
          return;
        }
        const newCustomer = await inventoryService.registerCustomer({ name, email, password });
        onSuccess(newCustomer);
      }
    } catch (err) {
      setError("Registry sync failure. Neural link unstable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl animate-in fade-in duration-700" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xl rounded-[60px] p-10 md:p-20 shadow-3xl overflow-hidden animate-in zoom-in-95 duration-500">
        <button onClick={onClose} className="absolute top-8 right-8 p-3 hover:bg-slate-50 rounded-full transition-all">
          <X size={24} strokeWidth={1} />
        </button>

        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-black rounded-[30px] flex items-center justify-center text-white mx-auto mb-8 shadow-2xl rotate-3 transition-transform hover:rotate-0 duration-500">
            <Fingerprint size={32} strokeWidth={1} />
          </div>
          <h2 className="serif text-4xl md:text-5xl italic font-light tracking-tighter mb-4">
            {mode === 'login' ? 'Identify Resident' : 'Enroll Identity'}
          </h2>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-black/20 italic">Muse Registry Protocol // Secure Link</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'signup' && (
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-black/30 ml-6">Designation (Username)</label>
              <div className="relative group">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-black/10 group-focus-within:text-rose-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Designation..."
                  className="w-full pl-16 pr-8 py-5 bg-slate-50 rounded-[30px] text-[11px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-rose-500/5 transition-all"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-black/30 ml-6">Registry Handle (Email)</label>
            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-black/10 group-focus-within:text-rose-500 transition-colors" size={18} />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="ID@ARCHIVE.COM"
                className="w-full pl-16 pr-8 py-5 bg-slate-50 rounded-[30px] text-[11px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-rose-500/5 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-black/30 ml-6">Passphrase</label>
            <div className="relative group">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-black/10 group-focus-within:text-rose-500 transition-colors" size={18} />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
                className="w-full pl-16 pr-8 py-5 bg-slate-50 rounded-[30px] text-[11px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-rose-500/5 transition-all"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center justify-center gap-3">
                <ShieldCheck size={14} className="text-rose-500" />
                <p className="text-rose-600 text-[9px] font-black uppercase tracking-widest">{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white py-6 rounded-full font-black text-[11px] uppercase tracking-[0.5em] hover:bg-rose-600 transition-all shadow-xl flex items-center justify-center gap-4 group"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} className="group-hover:scale-125 transition-transform" />}
            {mode === 'login' ? 'Validate Identity' : 'Authorize Enrollment'}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-slate-50 text-center">
          <button 
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-[10px] font-black uppercase tracking-widest text-black/30 hover:text-rose-500 transition-colors flex items-center justify-center gap-3 mx-auto"
          >
            {mode === 'login' ? 'New resident? Enroll now' : 'Already registered? Identify'} <ArrowRight size={12} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerAuth;
