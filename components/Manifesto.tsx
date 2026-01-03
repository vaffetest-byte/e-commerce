
import React, { useEffect, useState } from 'react';
import { Menu, X, ArrowDown, Sparkles, Fingerprint, ShieldCheck, Globe, Zap } from 'lucide-react';

interface ManifestoProps {
  onNavigateToHome: () => void;
  onNavigateToCatalog: () => void;
  onNavigateToLab: () => void;
}

const Manifesto: React.FC<ManifestoProps> = ({ onNavigateToHome, onNavigateToCatalog, onNavigateToLab }) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const coreValues = [
    { title: "Industrial Grace", desc: "The cold precision of Seongsu's concrete met with the warmth of hand-dyed silk.", icon: Fingerprint },
    { title: "Temporal Shift", desc: "Garments that exist outside the trend cycle, designed for longevity.", icon: ShieldCheck },
    { title: "Neural Craft", desc: "Where traditional tailoring meets generative potential.", icon: Zap },
    { title: "Seoul Pulse", desc: "Capturing the high-velocity heartbeat of the district.", icon: Globe }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#fdfcfb] selection:bg-rose-600 selection:text-white pb-60 overflow-x-hidden">
      {/* Editorial Navigation Responsive */}
      <nav className="fixed top-0 w-full z-[100] h-20 md:h-32 flex items-center px-6 md:px-20 justify-between bg-[#0f172a]/90 backdrop-blur-2xl border-b border-white/[0.05]">
        <div className="flex items-center gap-12 md:gap-24">
          <div className="flex flex-col group cursor-pointer" onClick={onNavigateToHome}>
            <span className="serif text-3xl md:text-5xl font-bold tracking-tighter leading-none text-rose-500">Seoul Muse</span>
            <span className="hidden sm:block text-[8px] font-black uppercase tracking-[0.8em] text-white/20 mt-1 uppercase">Manifesto Registry</span>
          </div>
          <div className="hidden lg:flex items-center gap-16 uppercase text-[9px] font-black tracking-[0.5em] text-white/30">
            <button onClick={onNavigateToCatalog} className="hover:text-rose-500 transition-colors">Archives</button>
            <button className="text-white relative">Manifesto <span className="absolute -bottom-4 left-0 w-full h-[1px] bg-rose-500" /></button>
            <button onClick={onNavigateToLab} className="hover:text-rose-500 transition-colors">Lab</button>
          </div>
        </div>
        <button onClick={onNavigateToHome} className="p-3 md:p-4 hover:bg-white/5 rounded-full transition-all group">
          <X className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1} />
        </button>
      </nav>

      {/* Hero Section Responsive */}
      <section className="relative h-screen flex flex-col items-center justify-center px-6 md:px-20 text-center">
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        >
          <div className="absolute top-1/4 left-1/4 w-[250px] sm:w-[300px] md:w-[600px] h-[250px] sm:h-[300px] md:h-[600px] bg-rose-600/20 rounded-full blur-[80px] md:blur-[160px]" />
        </div>

        <div className="max-w-7xl relative z-10">
          <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.6em] sm:tracking-[0.8em] md:tracking-[1.2em] text-rose-500 block mb-8 md:mb-12 uppercase">Design Doctrine // v.04</span>
          <h1 className="serif text-5xl sm:text-7xl md:text-[14rem] leading-[0.95] sm:leading-[0.9] md:leading-[0.8] font-light italic tracking-tighter mb-10 sm:mb-12 md:mb-16">
            Structural <br/>
            <span className="font-bold not-italic text-white">Sentiment.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-white/40 text-lg sm:text-xl md:text-2xl serif italic leading-relaxed mb-10 sm:mb-12 md:mb-20">
            "We do not decorate the body; we define the space around it."
          </p>
          <div className="flex flex-col items-center gap-6 sm:gap-8">
            <div className="w-[1px] h-12 sm:h-16 md:h-24 bg-gradient-to-b from-rose-500 to-transparent" />
            <ArrowDown className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-rose-500 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Editorial Grid Stacking */}
      <section className="px-6 md:px-20 py-16 sm:py-24 md:py-60 max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 md:gap-20 items-center">
          <div className="lg:col-span-5 space-y-8 sm:space-y-10 md:space-y-16">
            <div className="space-y-4 md:space-y-6">
              <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest uppercase">Protocol 01</span>
              <h2 className="serif text-4xl sm:text-6xl md:text-[10rem] italic leading-tight sm:leading-[0.9] font-light">The Seongsu <br/><span className="font-bold not-italic">Atelier</span></h2>
            </div>
            <p className="text-lg sm:text-xl md:text-3xl leading-relaxed text-white/50 serif font-light italic">
              Our studio resides in the industrial heart of Seoul. Surrounded by leather artisans and steel fabricators, we absorb the raw honesty of manufacturing.
            </p>
            <div className="pt-4 sm:pt-6">
              <button onClick={onNavigateToCatalog} className="group flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.4em] text-rose-500 hover:text-white transition-all uppercase">
                Observe Archives <ArrowDown className="-rotate-[135deg] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={14} />
              </button>
            </div>
          </div>
          <div className="lg:col-span-7 mt-8 lg:mt-0">
            <div className="relative aspect-[16/10] overflow-hidden rounded-lg shadow-2xl border border-white/5">
              <img 
                src="https://images.unsplash.com/photo-1542361345-89e58247f2d5?q=80&w=2000&auto=format&fit=crop" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-[2s]"
                alt="Seongsu District"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pillard Grid Mobile optimization */}
      <section className="px-6 md:px-20 py-16 sm:py-20 md:py-40">
        <div className="max-w-7xl mx-auto border-t border-white/10 pt-16 sm:pt-20 md:pt-40">
          <div className="mb-12 sm:mb-16 md:mb-32">
            <span className="text-[9px] font-black uppercase tracking-[0.6em] sm:tracking-[0.8em] md:tracking-[1em] text-rose-500 block mb-6 md:mb-8 uppercase">Aesthetic Directives</span>
            <h3 className="serif text-4xl sm:text-5xl md:text-[9.9rem] italic font-light">The Four <span className="not-italic font-bold text-white">Pillars</span></h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5">
            {coreValues.map((val, i) => (
              <div key={i} className="bg-[#0f172a] p-8 sm:p-10 md:p-24 space-y-6 md:space-y-10 group hover:bg-rose-600/5 transition-all duration-700">
                <span className="text-[9px] font-black text-rose-500 block mb-4 sm:mb-6 md:mb-12">0{i+1}</span>
                <h4 className="serif text-2xl sm:text-3xl md:text-5xl italic font-light group-hover:text-rose-400 transition-colors">{val.title}</h4>
                <p className="text-base sm:text-lg text-white/30 serif italic group-hover:text-white/60 transition-colors max-w-md leading-relaxed">
                  {val.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Manifesto;
