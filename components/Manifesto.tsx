
import React, { useEffect, useState, useRef } from 'react';
import { X, ArrowUpRight, Cpu, ArrowRight, Crosshair, Terminal, MousePointer2 } from 'lucide-react';

interface ManifestoProps {
  onNavigateToHome: () => void;
  onNavigateToCatalog: () => void;
  onNavigateToLab: () => void;
}

const Manifesto: React.FC<ManifestoProps> = ({ onNavigateToHome, onNavigateToCatalog, onNavigateToLab }) => {
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: (e.clientX / window.innerWidth) - 0.5, y: (e.clientY / window.innerHeight) - 0.5 });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const progress = Math.min(scrollY / (document.documentElement.scrollHeight - window.innerHeight), 1);

  const coreAxioms = [
    { 
      id: "PROT.01",
      title: "Intention", 
      label: "Decision Support",
      desc: "Every product, feature, and interaction is designed with intention — to reduce friction and support better decisions.", 
      image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop",
      coords: "37.5443° N / DECISION_CORE"
    },
    { 
      id: "PROT.02",
      title: "Simplicity", 
      label: "Complexity Reduction",
      desc: "No distractions. No unnecessary complexity. We prioritize a direct and clear path for every visitor, ensuring the focus remains on discovery.", 
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
      coords: "VECTOR_FIELD // MIN_SPEC"
    },
    { 
      id: "PROT.03",
      title: "Reliability", 
      label: "Operational Trust",
      desc: "Just shopping that works the way it should. A commitment to a smooth and transparent experience from browsing to checkout.", 
      image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop",
      coords: "TRUST_SYNC // HASH.09"
    }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] text-[#fdfcfb] selection:bg-rose-600 selection:text-white pb-0 overflow-x-hidden font-sans scroll-smooth">
      
      {/* Scroll Progress Indicator */}
      <div className="fixed left-0 top-0 w-1 h-full z-[150] bg-white/5">
        <div 
          className="w-full bg-rose-500 transition-all duration-100 ease-out origin-top"
          style={{ height: `${progress * 100}%` }}
        />
      </div>

      {/* Editorial Navigation */}
      <nav className="fixed top-0 w-full z-[100] h-20 md:h-28 flex items-center px-8 md:px-20 justify-between bg-black/20 backdrop-blur-xl border-b border-white/[0.03]">
        <div className="flex items-center gap-10">
          <button onClick={onNavigateToHome} className="flex flex-col group text-left">
            <span className="serif text-2xl md:text-3xl font-bold tracking-tighter leading-none text-rose-500 group-hover:text-white transition-colors">Seoul Muse</span>
            <span className="text-[7px] font-black uppercase tracking-[0.8em] text-white/20 mt-1">MANIFESTO // ATELIER_V4</span>
          </button>
        </div>
        <div className="hidden lg:flex items-center gap-12 uppercase text-[9px] font-black tracking-[0.5em] text-white/40">
          <button onClick={onNavigateToCatalog} className="hover:text-rose-500 transition-colors">Archive</button>
          <button onClick={onNavigateToLab} className="hover:text-rose-500 transition-colors">Lab</button>
          <button onClick={onNavigateToHome} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full hover:bg-rose-600 transition-all">
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      </nav>

      {/* Cinematic Hero */}
      <section className="relative h-[115vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <div 
          className="absolute inset-0 z-0 transition-transform duration-1000 ease-out"
          style={{ 
            transform: `scale(${1.15 + scrollY * 0.0001}) translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`,
            filter: `blur(${Math.min(scrollY * 0.015, 12)}px) brightness(0.4)`
          }}
        >
          <img 
            src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=2400&auto=format&fit=crop" 
            className="w-full h-full object-cover"
            alt="Atelier Core"
          />
        </div>

        <div className="relative z-10 space-y-10 md:space-y-16 max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-6 text-[8px] font-black tracking-[1.2em] text-rose-500 uppercase">
             <div className="h-[1px] w-12 bg-rose-500/30" />
             Core Mission Registry
             <div className="h-[1px] w-12 bg-rose-500/30" />
          </div>
          <h1 className="serif text-6xl sm:text-8xl md:text-[18rem] leading-[0.8] font-bold tracking-tighter text-white mix-blend-difference">
            Simple. <br/>
            <span className="font-light italic text-rose-500 drop-shadow-[0_0_30px_rgba(244,63,94,0.2)]">Reliable.</span>
          </h1>
          <p className="max-w-xl mx-auto text-white/50 text-lg md:text-2xl serif italic leading-relaxed pt-6">
            "We believe shopping should be simple, clear, and reliable."
          </p>
        </div>

        {/* Decorative Corner Metadata */}
        <div className="absolute bottom-16 left-16 hidden lg:block text-[8px] font-mono text-white/10 tracking-[0.5em] uppercase leading-loose">
            Ref_ID: MUSE_004 <br/>
            Loc: Seoul / Seongsu <br/>
            Status: Operational
        </div>
        <div className="absolute bottom-16 right-16 hidden lg:block text-[8px] font-mono text-white/10 tracking-[0.5em] uppercase text-right">
            00 / 04_CORE_V <br/>
            LAT_ENT: SYNCED <br/>
            [ SCROLL TO EXPLORE ]
        </div>
      </section>

      {/* The Doctrine: Typography focused Statement */}
      <section className="relative px-6 md:px-20 py-60 bg-white text-black overflow-hidden">
         <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row gap-24 items-start">
                <div className="lg:w-1/3 sticky top-40">
                    <span className="text-[10px] font-black uppercase tracking-[0.8em] text-rose-500 block mb-10">The Doctrine</span>
                    <h2 className="serif text-6xl md:text-9xl italic font-light leading-[0.9]">
                      The <br/><span className="font-bold not-italic">Confidence</span> <br/>Protocol.
                    </h2>
                </div>
                <div className="lg:w-2/3 space-y-24">
                    <p className="text-3xl md:text-6xl serif italic leading-[1.15] text-black/90">
                       Our platform is built to help you discover and choose products with confidence, offering a smooth and transparent experience from browsing to checkout.
                    </p>
                    <div className="h-[1px] w-full bg-black/10" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <div className="space-y-8 group">
                            <div className="flex items-center gap-4">
                              <Crosshair size={14} className="text-rose-500" />
                              <h4 className="text-[10px] font-black uppercase tracking-[0.5em]">Clarity</h4>
                            </div>
                            <p className="text-base text-black/50 leading-relaxed font-medium">We emphasize a seamless experience without marketing exaggeration. Information is presented with technical precision to aid rapid scanning.</p>
                        </div>
                        <div className="space-y-8 group">
                            <div className="flex items-center gap-4">
                              <MousePointer2 size={14} className="text-rose-500" />
                              <h4 className="text-[10px] font-black uppercase tracking-[0.5em]">Interaction</h4>
                            </div>
                            <p className="text-base text-black/50 leading-relaxed font-medium">Every digital surface and touchpoint is designed to reduce friction, allowing for high-velocity navigation through the registry.</p>
                        </div>
                    </div>
                </div>
            </div>
         </div>
         {/* Subtle background text */}
         <div className="absolute top-1/2 left-0 -translate-y-1/2 opacity-[0.02] text-[40vw] font-bold serif pointer-events-none select-none">
            MUSE
         </div>
      </section>

      {/* Sticky Axioms: High Contrast Visuals */}
      <section className="relative bg-[#050505]">
         {coreAxioms.map((axiom, i) => (
           <div key={axiom.id} className="relative h-[150vh] px-6 md:px-20 border-t border-white/[0.03]">
              <div className="sticky top-0 h-screen flex flex-col lg:flex-row items-center gap-12 lg:gap-32 overflow-hidden">
                 {/* Visual Stage */}
                 <div className="w-full lg:w-1/2 h-[45vh] lg:h-[75vh] relative overflow-hidden rounded-[40px] lg:rounded-[100px] group">
                    <img 
                      src={axiom.image} 
                      className="w-full h-full object-cover grayscale brightness-50 group-hover:brightness-90 transition-all duration-[2s] scale-110 group-hover:scale-100" 
                      alt={axiom.title}
                    />
                    <div className="absolute bottom-12 left-12 flex items-center gap-4 px-6 py-3 bg-black/80 backdrop-blur-xl rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                        <Terminal size={12} className="text-rose-500" />
                        <span className="text-[9px] font-mono tracking-widest text-white/70 uppercase">{axiom.coords}</span>
                    </div>
                 </div>
                 
                 {/* Narrative Stage */}
                 <div className="w-full lg:w-1/2 space-y-10 lg:space-y-14 text-left">
                    <div className="flex items-center gap-6">
                        <span className="text-[11px] font-black uppercase tracking-[0.6em] text-rose-500">{axiom.id}</span>
                        <div className="h-[1px] flex-1 bg-white/5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 block mb-4 italic">{axiom.label}</span>
                      <h3 className="serif text-5xl md:text-9xl italic font-bold tracking-tighter leading-[0.85]">{axiom.title}</h3>
                    </div>
                    <p className="text-xl md:text-4xl text-white/40 serif italic leading-[1.3] max-w-xl">
                       {axiom.desc}
                    </p>
                    <button 
                      onClick={onNavigateToCatalog} 
                      className="group inline-flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.5em] text-rose-500 hover:text-white transition-all py-4 pr-10 border-b border-transparent hover:border-rose-500"
                    >
                       Examine Archive <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                 </div>
              </div>
           </div>
         ))}
      </section>

      {/* Synthesis Call: Immersive Terminal */}
      <section className="px-6 md:px-20 py-80 bg-gradient-to-b from-[#050505] to-[#0a0a0a] relative overflow-hidden">
         <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex flex-col xl:flex-row items-center gap-24 xl:gap-40">
                <div className="flex-1 space-y-14 text-left">
                    <div className="inline-flex items-center gap-5 px-8 py-4 rounded-full border border-rose-500/10 bg-rose-500/5">
                        <Cpu size={18} className="text-rose-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500">Registry.Efficient_V4</span>
                    </div>
                    <h2 className="serif text-6xl md:text-[11rem] italic leading-[0.85] font-light">
                      Frictionless <br/><span className="not-italic font-bold text-rose-600">Choices.</span>
                    </h2>
                    <p className="text-2xl md:text-3xl text-white/30 serif italic leading-relaxed max-w-2xl">
                        Every product, feature, and interaction is designed with intention — to reduce friction and support better decisions.
                    </p>
                </div>
                <div className="flex-1 w-full max-w-xl aspect-square bg-white/[0.01] border border-white/5 rounded-[80px] p-16 flex flex-col justify-center relative group hover:border-rose-500/20 transition-all duration-700">
                    <div className="absolute inset-0 bg-rose-500/5 blur-[150px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="space-y-10 relative z-10">
                        <div className="flex items-center gap-5 text-rose-500">
                            <Terminal size={32} strokeWidth={1} />
                            <span className="text-[11px] font-black uppercase tracking-[0.5em]">Synthesis Lab</span>
                        </div>
                        <p className="text-white/50 serif text-2xl italic leading-relaxed italic">"No distractions. No unnecessary complexity. Just shopping that works the way it should."</p>
                        <button 
                            onClick={onNavigateToLab}
                            className="w-full bg-white text-black py-8 rounded-full font-black uppercase tracking-[0.5em] text-[11px] hover:bg-rose-600 hover:text-white transition-all shadow-3xl flex items-center justify-center gap-6 group"
                        >
                            Enter Lab <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
         </div>
      </section>

      {/* Kinetic Footer Marquee */}
      <div className="bg-rose-600 py-12 md:py-20 overflow-hidden border-y border-white/10">
         <div className="flex gap-20 animate-marquee whitespace-nowrap">
            {[1,2,3,4,5].map(i => (
              <span key={i} className="serif text-5xl md:text-8xl italic font-bold text-white uppercase tracking-tighter">
                 Simple // Clear // Reliable // Seamless Experience // Intentional Design // Seoul Muse //
              </span>
            ))}
         </div>
      </div>

      {/* Final Call */}
      <section className="px-6 md:px-20 py-80 text-center relative bg-black">
         <div className="max-w-5xl mx-auto space-y-24">
            <h3 className="serif text-5xl md:text-[10rem] italic text-white leading-tight font-light tracking-tighter">
               Shopping as it <br/><span className="font-bold not-italic text-rose-600">should</span> be.
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                <button 
                    onClick={onNavigateToCatalog}
                    className="w-full sm:w-auto px-20 py-10 rounded-full border border-white/10 hover:border-rose-500 text-[12px] font-black uppercase tracking-[0.6em] transition-all group bg-white/5"
                >
                    Observe Collection <ArrowUpRight size={20} className="inline ml-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
                <button 
                    onClick={onNavigateToHome}
                    className="w-full sm:w-auto px-20 py-10 rounded-full bg-white text-black text-[12px] font-black uppercase tracking-[0.6em] hover:bg-rose-600 hover:text-white transition-all shadow-2xl"
                >
                    Return Home
                </button>
            </div>
         </div>
         
         <div className="mt-80 pt-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-12">
            <span className="text-[9px] font-mono tracking-[0.6em] text-white/10 uppercase">Registry_Auth: MUSE_SESSION_v4 // ©2026</span>
            <div className="flex items-center gap-12">
               <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-[9px] font-mono tracking-[0.6em] text-rose-500 hover:text-white transition-colors uppercase">Top_Level</button>
               <button onClick={onNavigateToCatalog} className="text-[9px] font-mono tracking-[0.6em] text-white/20 hover:text-white transition-colors uppercase">Registry</button>
               <button onClick={onNavigateToHome} className="text-[9px] font-mono tracking-[0.6em] text-white/20 hover:text-white transition-colors uppercase">Base</button>
            </div>
         </div>
      </section>
    </div>
  );
};

export default Manifesto;
