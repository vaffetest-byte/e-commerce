
import React, { useState, useEffect } from 'react';
import { X, Zap, Cpu, Box, Sparkles, Loader2, RefreshCw, Layers, Terminal, ArrowRight, Dna } from 'lucide-react';
import { runLabExperiment } from '../geminiService';

interface LabProps {
  onNavigateToHome: () => void;
  onNavigateToCatalog: () => void;
  onNavigateToManifesto: () => void;
}

interface ExperimentLog {
  id: string;
  type: string;
  prompt: string;
  result: string;
  timestamp: string;
}

const Lab: React.FC<LabProps> = ({ onNavigateToHome, onNavigateToCatalog, onNavigateToManifesto }) => {
  const [labPrompt, setLabPrompt] = useState<string>("");
  const [labResult, setLabResult] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeExperiment, setActiveExperiment] = useState<'fabric' | 'form' | 'color'>('form');
  const [logs, setLogs] = useState<ExperimentLog[]>([]);

  useEffect(() => {
    const savedLogs = localStorage.getItem('seoul_muse_lab_logs');
    if (savedLogs) setLogs(JSON.parse(savedLogs));
  }, []);

  const runExperiment = async () => {
    if (!labPrompt) return;
    setIsGenerating(true);
    try {
      const result = await runLabExperiment(labPrompt, activeExperiment);
      setLabResult(result);

      const newLog: ExperimentLog = {
        id: `LAB-${Date.now().toString().slice(-6)}`,
        type: activeExperiment,
        prompt: labPrompt,
        result: result,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      
      const updatedLogs = [newLog, ...logs].slice(0, 8);
      setLogs(updatedLogs);
      localStorage.setItem('seoul_muse_lab_logs', JSON.stringify(updatedLogs));
    } catch (e) {
      setLabResult("SYNTHESIS_FAILURE: Neural Link Dropped.");
    } finally {
      setIsGenerating(false);
    }
  };

  const experimentConfigs = {
    fabric: { title: "Materia", icon: Box, desc: "Synthetic biolace." },
    form: { title: "Geometry", icon: Layers, desc: "Structural stress." },
    color: { title: "Chromatic", icon: Zap, desc: "Light-reactive." }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-60 font-mono relative">
      <div className="scan-line opacity-20" />
      
      {/* Cinematic Navigation */}
      <nav className="fixed top-0 w-full z-[1000] h-28 flex items-center px-8 md:px-24 justify-between bg-black/40 backdrop-blur-3xl border-b border-white/[0.05]">
        <div className="flex items-center gap-20">
          <button className="flex flex-col text-left group" onClick={onNavigateToHome}>
            <span className="serif text-3xl md:text-5xl font-bold tracking-tighter leading-none group-hover:text-rose-500 transition-colors">Seoul Muse</span>
            <div className="flex items-center gap-4 mt-2">
               <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.8em] text-rose-600">Synthesis Terminal</span>
               <div className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-ping" />
            </div>
          </button>
        </div>
        <button onClick={onNavigateToHome} className="w-16 h-16 flex items-center justify-center bg-white/5 border border-white/10 rounded-full hover:bg-rose-600 transition-all group">
          <X size={24} strokeWidth={1} className="group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </nav>

      {/* Main Terminal View */}
      <section className="pt-48 px-6 md:px-24 max-w-[1700px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left Control Column */}
        <div className="lg:col-span-3 space-y-16">
          <div className="space-y-8">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-rose-500 flex items-center gap-4">
              <div className="h-[1px] w-8 bg-rose-500/30" /> Control Matrix
            </span>
            <div className="grid grid-cols-1 gap-4">
              {(Object.keys(experimentConfigs) as Array<keyof typeof experimentConfigs>).map(key => (
                <button 
                  key={key}
                  onClick={() => setActiveExperiment(key)}
                  className={`p-8 rounded-[40px] border text-left transition-all duration-700 group relative overflow-hidden ${activeExperiment === key ? 'bg-white text-black border-white shadow-[0_0_50px_rgba(255,255,255,0.1)]' : 'bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/[0.04]'}`}
                >
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <h4 className="text-[11px] font-black uppercase tracking-[0.3em] mb-2">{experimentConfigs[key].title}</h4>
                      <p className="text-[9px] font-light opacity-50 uppercase tracking-widest">{experimentConfigs[key].desc}</p>
                    </div>
                    <experimentConfigs[key].icon size={20} className={activeExperiment === key ? 'text-rose-500' : 'text-white/20'} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[60px] space-y-10 shadow-inner">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 flex items-center gap-4">
               <Terminal size={14} /> Audit History
            </span>
            <div className="space-y-6">
              {logs.length > 0 ? logs.map(log => (
                <button key={log.id} onClick={() => setLabResult(log.result)} className="w-full text-left group flex items-start gap-5">
                   <div className="w-1.5 h-1.5 rounded-full bg-white/10 mt-1.5 group-hover:bg-rose-500 group-hover:animate-pulse transition-all" />
                   <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-[8px] font-black uppercase text-white/40 group-hover:text-rose-500 transition-colors">{log.type}</span>
                        <span className="text-[7px] font-mono text-white/10">{log.timestamp}</span>
                      </div>
                      <p className="text-[10px] text-white/20 group-hover:text-white/60 truncate uppercase font-light tracking-widest">{log.prompt}</p>
                   </div>
                </button>
              )) : (
                <p className="text-[9px] text-white/5 text-center italic py-10 uppercase tracking-[0.4em]">No archives found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Center Synthesis UI */}
        <div className="lg:col-span-6 space-y-16">
          <div className="bg-white/[0.03] border border-white/10 rounded-[80px] p-12 md:p-24 shadow-3xl space-y-16 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[40%] h-full bg-rose-600/[0.04] blur-[150px] pointer-events-none" />
            
            <div className="flex justify-between items-start">
               <div className="space-y-4">
                 <h2 className="serif text-5xl md:text-9xl italic font-light tracking-tighter text-white">Synthesize <br/><span className="not-italic font-bold text-rose-600">Identity.</span></h2>
                 <p className="text-[9px] font-black uppercase tracking-[0.8em] text-white/20">Aura-Logic Sync Active</p>
               </div>
               <div className="p-6 rounded-full bg-white/5 border border-white/10 animate-float">
                  <Dna size={32} className="text-rose-500" strokeWidth={1} />
               </div>
            </div>

            <div className="space-y-8">
               <div className="flex items-center gap-6">
                 <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/30 italic">Input Concept</span>
                 <div className="h-[1px] flex-1 bg-white/5" />
               </div>
               <textarea 
                 value={labPrompt}
                 onChange={(e) => setLabPrompt(e.target.value)}
                 placeholder="DESCRIBE THE AESTHETIC FREQUENCY..."
                 className="w-full bg-black/40 border border-white/5 p-12 rounded-[50px] text-2xl md:text-4xl font-black uppercase tracking-widest min-h-[220px] md:min-h-[300px] outline-none text-white placeholder:text-white/5 focus:border-rose-500/50 transition-all focus:bg-white/[0.02]"
               />
            </div>

            <button 
              onClick={runExperiment}
              disabled={isGenerating || !labPrompt}
              className="w-full py-10 md:py-14 rounded-full bg-white text-black text-[12px] font-black uppercase tracking-[0.8em] hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-10 shadow-[0_40px_100px_rgba(255,255,255,0.05)] disabled:opacity-20 group"
            >
              {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} className="group-hover:scale-125 transition-transform" />}
              Commence Synthesis
            </button>
          </div>

          {labResult && (
            <div className="animate-in slide-in-from-bottom-20 duration-1000">
               <div className="p-12 md:p-24 bg-rose-600 text-white rounded-[80px] shadow-3xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-[50%] h-full bg-black/20 blur-[100px] pointer-events-none" />
                  <span className="text-[11px] font-black uppercase tracking-[0.6em] text-white/40 block mb-12">Registry Output // HASH_V2</span>
                  <p className="text-2xl md:text-5xl font-bold leading-[1.25] italic serif opacity-95 tracking-tight">
                    "{labResult}"
                  </p>
                  <div className="mt-16 flex items-center gap-10">
                     <button className="px-10 py-5 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all">Download Dossier</button>
                     <button onClick={() => setLabResult("")} className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">Wipe Terminal</button>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Right Sidebar Telemetry */}
        <div className="lg:col-span-3 space-y-16 hidden lg:block">
          <div className="bg-white/[0.02] border border-white/5 p-12 rounded-[60px] space-y-16 relative group">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-500/5 rounded-full blur-[60px] group-hover:bg-rose-500/10 transition-all duration-1000" />
             <div className="text-center space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20 block mb-8">Performance</span>
                <div className="text-7xl font-black tracking-tighter text-white">99<span className="text-rose-500">.</span>4<span className="text-[20px] ml-2 opacity-20">%</span></div>
                <span className="text-[9px] font-black uppercase text-emerald-500 tracking-[0.4em] bg-emerald-500/10 px-6 py-2 rounded-full">Neural Sync: Optimal</span>
             </div>
             
             <div className="space-y-10 pt-10 border-t border-white/5">
                <div className="space-y-4">
                   <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/20">
                      <span>Neural Entropy</span>
                      <span>1.2%</span>
                   </div>
                   <div className="h-[2px] w-full bg-white/5 overflow-hidden">
                      <div className="h-full w-1/4 bg-rose-500 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
                   </div>
                </div>
                <div className="space-y-4">
                   <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/20">
                      <span>Market Alignment</span>
                      <span>98.9%</span>
                   </div>
                   <div className="h-[2px] w-full bg-white/5 overflow-hidden">
                      <div className="h-full w-[98%] bg-rose-500 transition-all duration-1000" />
                   </div>
                </div>
             </div>
          </div>
          
          <div className="p-10 border border-white/5 rounded-[50px] flex flex-col items-center gap-10 opacity-30 hover:opacity-100 transition-opacity">
              <span className="text-[8px] font-black uppercase tracking-[0.8em]">Laboratory Nodes</span>
              <div className="grid grid-cols-4 gap-4">
                 {[1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} className={`w-3 h-3 rounded-full ${i < 6 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-white/5'}`} />
                 ))}
              </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Lab;
