import React from 'react';
import { Menu, X, ArrowDown, Sparkles } from 'lucide-react';

interface ManifestoProps {
  onNavigateToHome: () => void;
  onNavigateToCatalog: () => void;
  onNavigateToLab: () => void;
}

const Manifesto: React.FC<ManifestoProps> = ({ onNavigateToHome, onNavigateToCatalog, onNavigateToLab }) => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-[#fdfcfb] selection:bg-rose-600 selection:text-white pb-60 overflow-x-hidden">
      {/* Editorial Navigation */}
      <nav className="fixed top-0 w-full z-[100] h-32 flex items-center px-8 md:px-20 justify-between bg-[#0f172a]/80 backdrop-blur-2xl border-b border-white/[0.05]">
        <div className="flex items-center gap-24">
            <div className="flex flex-col group cursor-pointer" onClick={onNavigateToHome}>
                <span className="serif text-5xl font-bold tracking-tighter leading-none text-rose-500">Seoul Muse</span>
                <span className="text-[8px] font-black uppercase tracking-[0.8em] text-white/20 mt-1">Archive No. 2026</span>
            </div>
            <div className="hidden lg:flex items-center gap-16 uppercase text-[9px] font-black tracking-[0.5em] text-white/30">
                <button onClick={onNavigateToCatalog} className="hover:text-rose-500 transition-colors uppercase">The Archives</button>
                <button className="text-white uppercase">Manifesto</button>
                <button onClick={onNavigateToLab} className="hover:text-rose-500 transition-colors uppercase">Lab</button>
            </div>
        </div>
        <div className="flex items-center gap-12">
            <button className="p-2" onClick={onNavigateToHome}>
                <X size={32} strokeWidth={1} />
            </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative h-screen flex flex-col items-center justify-center px-8 md:px-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent pointer-events-none" />
        <div className="max-w-5xl text-center stagger-in">
          <span className="text-[11px] font-black uppercase tracking-[1em] text-rose-500 block mb-16 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-forwards">Mission Protocol</span>
          <h1 className="serif text-[6rem] md:text-[14rem] leading-[0.85] font-light italic tracking-tighter mb-20 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            Form is <br/> 
            <span className="font-bold not-italic text-rose-600 tracking-tight">Temporary.</span><br/>
            Spirit is <br/>
            <span className="font-bold not-italic tracking-tight">Eternal.</span>
          </h1>
          <div className="flex flex-col items-center gap-10">
            <div className="w-[1px] h-32 bg-white/10 animate-pulse" />
            <ArrowDown size={24} className="text-rose-500 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Philosophical Sections */}
      <section className="px-8 md:px-20 py-60 max-w-7xl mx-auto space-y-80">
        
        {/* Section 01 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-16">
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-black text-rose-500">01</span>
              <div className="h-[1px] w-20 bg-white/10" />
            </div>
            <h2 className="serif text-8xl md:text-[10rem] font-bold italic tracking-tighter leading-none">The Seoul <br/> Spirit</h2>
            <p className="text-2xl md:text-3xl leading-relaxed text-white/40 serif font-light">
              Seoul is not just a city; it is a pulse. A collision of high-tech speed and ancient silence. 
              Seoul Muse translates this duality into garments that respond to the city's unique vibration.
            </p>
          </div>
          <div className="relative aspect-square rounded-full overflow-hidden border border-white/5 p-4 group">
            <div className="absolute inset-0 bg-rose-500/10 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <img 
              src="https://images.unsplash.com/photo-1542361345-89e58247f2d5?q=80&w=1200&auto=format&fit=crop" 
              className="w-full h-full object-cover rounded-full grayscale hover:grayscale-0 transition-all duration-1000"
            />
          </div>
        </div>

        {/* Section 02 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="lg:order-2 space-y-16 text-right">
            <div className="flex items-center justify-end gap-6">
              <div className="h-[1px] w-20 bg-white/10" />
              <span className="text-[10px] font-black text-rose-500">02</span>
            </div>
            <h2 className="serif text-8xl md:text-[10rem] font-bold italic tracking-tighter leading-none">Architectural <br/> Form</h2>
            <p className="text-2xl md:text-3xl leading-relaxed text-white/40 serif font-light">
              We do not follow trends. We build silhouettes. Every ribbon, every drape, every stitch is an architectural decision. 
              Made in Seongsu-dong, our atelier is a laboratory of structural emotion.
            </p>
          </div>
          <div className="lg:order-1 relative aspect-[3/4] rounded-sm overflow-hidden border border-white/5">
            <img 
              src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop" 
              className="w-full h-full object-cover grayscale opacity-60"
            />
          </div>
        </div>

        {/* Section 03 */}
        <div className="text-center space-y-24">
            <h2 className="serif text-[10rem] md:text-[20rem] font-bold italic tracking-tighter leading-none opacity-5 select-none pointer-events-none absolute left-1/2 -translate-x-1/2">
              ETHOS
            </h2>
            <div className="max-w-4xl mx-auto space-y-20 relative z-10 pt-20">
               <Sparkles size={40} className="text-rose-500 mx-auto" />
               <p className="serif text-4xl md:text-6xl leading-[1.2] tracking-tight text-white/90">
                We believe in garments that empower the wearer to become their own Muse. 
                A collaboration between human intent and architectural grace.
               </p>
               <div className="pt-20">
                  <button 
                    onClick={onNavigateToCatalog}
                    className="px-20 py-10 rounded-full border border-white/10 text-[11px] font-black uppercase tracking-[0.6em] hover:bg-white hover:text-[#0f172a] transition-all duration-500"
                  >
                    View The Archive
                  </button>
               </div>
            </div>
        </div>
      </section>

      {/* Bottom Visual */}
      <section className="h-screen relative flex items-center justify-center overflow-hidden">
         <img 
           src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=2000&auto=format&fit=crop" 
           className="absolute inset-0 w-full h-full object-cover grayscale opacity-20"
         />
         <div className="absolute inset-0 bg-[#0f172a]/80" />
         <div className="relative text-center space-y-10 px-8">
            <span className="serif text-6xl italic text-rose-500">Seoul Muse</span>
            <p className="text-[10px] font-black uppercase tracking-[1em] text-white/20">EST. 2024 • SEONGSU DIST.</p>
         </div>
      </section>
    </div>
  );
};

export default Manifesto;