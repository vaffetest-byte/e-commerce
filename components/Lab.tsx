import React, { useState, useEffect } from 'react';
import { Menu, X, Zap, Cpu, Box, Sparkles, Loader2, ArrowRight, RefreshCw, Layers } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface LabProps {
  onNavigateToHome: () => void;
  onNavigateToCatalog: () => void;
  onNavigateToManifesto: () => void;
}

const Lab: React.FC<LabProps> = ({ onNavigateToHome, onNavigateToCatalog, onNavigateToManifesto }) => {
  const [labPrompt, setLabPrompt] = useState<string>("");
  const [labResult, setLabResult] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeExperiment, setActiveExperiment] = useState<'fabric' | 'form' | 'color'>('form');

  const runExperiment = async () => {
    if (!labPrompt) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const promptText = `Act as an experimental K-fashion AI designer in Seoul. 
      Input concept: "${labPrompt}"
      Experiment Type: "${activeExperiment}"
      Provide a highly technical, futuristic design insight for a new luxury garment. 
      Format:
      [EXPERIMENTAL ID]: SM-LAB-XXXX
      [SYNTHETIC COMPONENT]: ...
      [FORM FACTOR]: ...
      [BEHAVIOR]: ...
      Keep it brief, tech-heavy, and sophisticated. Under 60 words.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: promptText,
      });
      setLabResult(String(response.text || "Experiment timed out. Rebooting neural core."));
    } catch (e) {
      setLabResult("Critical failure in AI neural core. Access denied.");
    } finally {
      setIsGenerating(false);
    }
  };

  const experimentConfigs = {
    fabric: { title: "Synthetic Texture Lab", icon: Box, desc: "Manipulating molecular draping and reactive fibers." },
    form: { title: "Geometric Form Lab", icon: Layers, desc: "Architectural silhouettes via algorithmic stress-mapping." },
    color: { title: "Chromatic Pulse Lab", icon: Zap, desc: "Dynamic light-reactive dyes and digital gradients." }
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] text-[#0f172a] selection:bg-rose-600 selection:text-white pb-60 overflow-x-hidden font-mono">
      {/* Lab Navigation */}
      <nav className="fixed top-0 w-full z-[100] h-32 flex items-center px-8 md:px-20 justify-between bg-white/70 backdrop-blur-2xl border-b border-black/[0.05]">
        <div className="flex items-center gap-24">
            <div className="flex flex-col group cursor-pointer" onClick={onNavigateToHome}>
                <span className="serif text-5xl font-bold tracking-tighter leading-none text-black">Seoul Muse</span>
                <span className="text-[10px] font-black uppercase tracking-[0.8em] text-rose-600 mt-1">LABORATORY / ALPHA</span>
            </div>
            <div className="hidden lg:flex items-center gap-16 uppercase text-[9px] font-black tracking-[0.5em] text-black/30">
                <button onClick={onNavigateToCatalog} className="hover:text-rose-500 transition-colors uppercase">The Archives</button>
                <button onClick={onNavigateToManifesto} className="hover:text-rose-500 transition-colors uppercase">Manifesto</button>
                <button className="text-black uppercase underline decoration-rose-500 underline-offset-8">Lab</button>
            </div>
        </div>
        <div className="flex items-center gap-12">
            <button className="p-2" onClick={onNavigateToHome}>
                <X size={32} strokeWidth={1} />
            </button>
        </div>
      </nav>

      {/* Lab Interface */}
      <section className="pt-64 px-8 md:px-20 max-w-7xl mx-auto space-y-32">
        <header className="stagger-in">
          <h1 className="text-8xl md:text-[10rem] font-black tracking-tighter leading-[0.8] mb-12 uppercase italic">
            Design <br/> <span className="text-rose-600">Sync</span>
          </h1>
          <p className="max-w-2xl text-black/40 text-lg md:text-xl font-medium tracking-tight">
            The Lab is our experimental core. Here, human intuition meets algorithmic intent to prototype the silhouttes of 2026.
          </p>
        </header>

        {/* Neural Controller */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-4 space-y-12">
             <div className="space-y-6">
               <span className="text-[10px] font-black uppercase tracking-[0.6em] text-rose-600">Selection Matrix</span>
               <div className="flex flex-col gap-4">
                  {(Object.keys(experimentConfigs) as Array<keyof typeof experimentConfigs>).map(key => (
                    <button 
                      key={key}
                      onClick={() => setActiveExperiment(key)}
                      className={`p-8 rounded-2xl border flex items-center gap-8 text-left transition-all ${activeExperiment === key ? 'bg-black text-white border-black shadow-2xl' : 'bg-white border-black/5 hover:border-rose-500 text-black/40'}`}
                    >
                      {React.createElement(experimentConfigs[key].icon, { size: 24, strokeWidth: activeExperiment === key ? 2 : 1 })}
                      <div>
                        <h4 className="text-[11px] font-black uppercase tracking-widest">{experimentConfigs[key].title}</h4>
                      </div>
                    </button>
                  ))}
               </div>
             </div>
             
             <div className="p-10 bg-slate-50 rounded-[40px] space-y-6">
                <Cpu size={24} className="text-rose-500" />
                <p className="text-[10px] text-black/40 leading-relaxed font-bold uppercase tracking-widest">
                   {experimentConfigs[activeExperiment].desc}
                </p>
             </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white border border-black/[0.05] rounded-[60px] p-12 md:p-20 shadow-sm space-y-16 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[100px] pointer-events-none" />
                
                <div className="space-y-10">
                  <label className="text-[11px] font-black uppercase tracking-[0.6em] text-black/20 block">Conceptual Input</label>
                  <textarea 
                    value={labPrompt}
                    onChange={(e) => setLabPrompt(e.target.value)}
                    placeholder="E.G. LIQUID SILK IN AN INDUSTRIAL SEOUL RAINSTORM..."
                    className="w-full bg-slate-50/50 border border-black/5 p-12 rounded-3xl text-xl font-black uppercase tracking-widest min-h-[160px] focus:ring-4 focus:ring-rose-500/5 transition-all outline-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-10">
                  <button 
                    onClick={runExperiment}
                    disabled={isGenerating || !labPrompt}
                    className="w-full sm:w-auto px-16 py-10 rounded-full bg-black text-white text-[11px] font-black uppercase tracking-[0.5em] hover:bg-rose-600 transition-all flex items-center justify-center gap-6 disabled:opacity-20 shadow-xl active:scale-95"
                  >
                    {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                    Initialize Experiment
                  </button>
                  <p className="text-[9px] font-black text-black/20 uppercase tracking-widest">Powered by Gemini Strategic Protocol</p>
                </div>

                {labResult && (
                  <div className="mt-20 pt-20 border-t border-black/5 animate-in slide-in-from-bottom-8 duration-700">
                    <div className="flex items-center gap-4 mb-10">
                      <Sparkles size={18} className="text-rose-500" />
                      <span className="text-[10px] font-black uppercase tracking-[0.6em] text-black/20">Lab Insights</span>
                    </div>
                    <div className="p-12 bg-[#0f172a] text-white rounded-[40px] shadow-inner">
                       <p className="text-lg md:text-xl font-bold leading-relaxed whitespace-pre-line tracking-tight italic opacity-90">
                          {labResult}
                       </p>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Visual Lab Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { label: "Neural Iterations", val: "482,901", trend: "+12%" },
             { label: "Synthetic Models", val: "142 Active", trend: "Stable" },
             { label: "Design Sync Rate", val: "99.4%", trend: "Optimal" }
           ].map((stat, i) => (
             <div key={i} className="bg-white p-12 rounded-[50px] border border-black/5 group hover:border-rose-500 transition-colors">
                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-black/20 block mb-6">{stat.label}</span>
                <div className="flex items-baseline justify-between">
                   <h3 className="text-4xl font-black tracking-tighter">{stat.val}</h3>
                   <span className="text-[10px] font-black text-rose-500">{stat.trend}</span>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* Decorative Lab Elements */}
      <div className="fixed bottom-0 right-0 p-20 opacity-5 pointer-events-none select-none overflow-hidden">
        <Layers size={800} strokeWidth={0.5} />
      </div>
    </div>
  );
};

export default Lab;