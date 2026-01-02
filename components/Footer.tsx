
import React from 'react';
import { ArrowUpRight, Instagram, Mail, MapPin, Sparkles, Globe, Cpu } from 'lucide-react';

interface FooterProps {
  onNavigateToCatalog: () => void;
  onNavigateToManifesto: () => void;
  onNavigateToLab: () => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigateToCatalog, onNavigateToManifesto, onNavigateToLab }) => {
  return (
    <footer className="bg-[#0f172a] text-white pt-32 pb-12 px-6 md:px-20 overflow-hidden relative">
      {/* Decorative Background Text */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 opacity-[0.03] text-[15vw] serif font-bold tracking-tighter whitespace-nowrap pointer-events-none select-none">
        Seoul Muse
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-32">
          
          {/* Brand Vision */}
          <div className="space-y-10">
            <div className="flex flex-col">
              <span className="serif text-4xl font-bold tracking-tighter text-rose-500">Seoul Muse</span>
              <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/30 mt-2">Atelier & Registry</span>
            </div>
            <p className="text-white/40 serif italic text-lg leading-relaxed max-w-[280px]">
              "We define the space around the body, merging Seongsu industrial grit with the grace of the Muse."
            </p>
            <div className="flex gap-6">
              <button className="p-3 bg-white/5 rounded-full hover:bg-rose-500 transition-all group">
                <Instagram size={18} className="text-white/40 group-hover:text-white" />
              </button>
              <button className="p-3 bg-white/5 rounded-full hover:bg-rose-500 transition-all group">
                <Globe size={18} className="text-white/40 group-hover:text-white" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-8">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">The Archives</span>
            <ul className="space-y-5">
              {['All Collections', 'Tops & Knits', 'Dresses', 'Experimental Form'].map((item) => (
                <li key={item}>
                  <button 
                    onClick={onNavigateToCatalog}
                    className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-rose-500 hover:tracking-[0.5em] transition-all duration-500 block"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Philosophy & Lab */}
          <div className="space-y-8">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">The Protocol</span>
            <ul className="space-y-5">
              <li>
                <button onClick={onNavigateToManifesto} className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-all flex items-center gap-3">
                  Manifesto <ArrowUpRight size={12} />
                </button>
              </li>
              <li>
                <button onClick={onNavigateToLab} className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-all flex items-center gap-3">
                  Design Lab <ArrowUpRight size={12} />
                </button>
              </li>
              <li>
                <div className="pt-6 mt-6 border-t border-white/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-rose-500">Neural Sync: Optimal</span>
                  </div>
                  <p className="text-[9px] text-white/20 leading-relaxed uppercase tracking-widest">Gemini core integrated // v.4.2</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Interaction */}
          <div className="space-y-10">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Newsletter</span>
            <div className="space-y-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Subscribe to the Muse</p>
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder="EMAIL@ADDRESS.COM" 
                  className="w-full bg-transparent border-b border-white/10 py-4 outline-none text-[11px] font-black tracking-widest focus:border-rose-500 transition-all placeholder:text-white/5"
                />
                <button className="absolute right-0 top-1/2 -translate-y-1/2 text-rose-500 hover:translate-x-2 transition-transform">
                  <ArrowUpRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">© 2026 Seoul Muse Atelier. All Rights Reserved.</p>
          <div className="flex gap-12 text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
            <button className="hover:text-white transition-colors">Privacy</button>
            <button className="hover:text-white transition-colors">Terms</button>
            <button className="hover:text-white transition-colors">Cookies</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
