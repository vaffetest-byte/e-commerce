
import React, { useState, useEffect } from 'react';
import { Menu, X, Zap, Cpu, Box, Sparkles, Loader2, RefreshCw, Layers } from 'lucide-react';
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
        id: `MUSE-LAB-${Date.now()}`,
        type: activeExperiment,
        prompt: labPrompt,
        result: result,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      const updatedLogs = [newLog, ...logs].slice(0, 5);
      setLogs(updatedLogs);
      localStorage.setItem('seoul_muse_lab_logs', JSON.stringify(updatedLogs));
    } catch (e) {
      setLabResult("FAILURE: Neural core unresponsive.");
    } finally {
      setIsGenerating(false);
    }
  };

  const experimentConfigs = {
    fabric: { title: "Fabric Materia", icon: Box, desc: "Synthetic polymers & biolace." },
    form: { title: "Geometric Form", icon: Layers, desc: "Architectural stress mapping." },
    color: { title: "Chromatic Pulse", icon: Zap, desc: "Light-reactive dyes." }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#0f172a] pb-60 font-mono">
      {/* Lab Nav Responsive */}
      <nav className="fixed top-0 w-full z-[100] h-20 md:h-32 flex items-center px-6 md:px-20 justify-between bg-white/80 backdrop-blur-2xl border-b border-black/[0.05]">
        <div className="flex items-center gap-12 md:gap-24">
          <div className="flex flex-col cursor-pointer" onClick={onNavigateToHome}>
            <span className="serif text-2xl md:text-5xl font-bold tracking-tighter leading-none text-black">Seoul Muse</span>
            <span className="hidden sm:block text-[8px] md:text-[10px] font-black uppercase tracking-[0.6em] text-rose-600">AESTHETIC LAB // ALPHA</span>
          </div>
        </div>
        <button onClick={onNavigateToHome} className="p-3 md:p-4 hover:bg-black/5 rounded-full">
          <X size={24} className="md:w-8 md:h-8" strokeWidth={1} />
        </button>
      </nav>

      {/* Lab Grid Stacking */}
      <section className="pt-24 md:pt-48 px-6 md:px-20 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
        
        {/* Left Sidebar Stacks on Mobile */}
        <div className="lg:col-span-3 order-2 lg:order-1 space-y-8 md:space-y-12">
          <div className="space-y-6">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500">Control Matrix</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
              {(Object.keys(experimentConfigs) as Array<keyof typeof experimentConfigs>).map(key => (
                <button 
                  key={key}
                  onClick={() => setActiveExperiment(key)}
                  className={`p-6 rounded-3xl border text-left transition-all ${activeExperiment === key ? 'bg-black text-white border-black shadow-xl' : 'bg-white border-black/[0.05] text-black/40'}`}
                >
                  <h4 className="text-[10px] font-black uppercase tracking-widest mb-1">{experimentConfigs[key].title}</h4>
                  <p className="text-[8px] opacity-60 truncate">{experimentConfigs[key].desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:block bg-white border border-black/[0.03] p-8 rounded-3xl shadow-sm space-y-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-black/20">Registry Logs</span>
            <div className="space-y-4">
              {logs.map(log => (
                <button key={log.id} onClick={() => setLabResult(log.result)} className="w-full text-left p-3 rounded-xl hover:bg-slate-50">
                   <div className="flex justify-between items-center mb-1">
                      <span className="text-[8px] font-black uppercase text-rose-500">{log.type}</span>
                   </div>
                   <p className="text-[9px] font-bold text-black/40 truncate uppercase">{log.prompt}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Main Synthesis UI */}
        <div className="lg:col-span-6 order-1 lg:order-2 space-y-12">
          <div className="bg-white border border-black/[0.05] rounded-[40px] md:rounded-[60px] p-8 md:p-16 shadow-sm space-y-10 relative overflow-hidden">
            <div className="flex justify-between items-center">
               <h2 className="serif text-4xl md:text-8xl italic font-light tracking-tighter">Design <span className="not-italic font-black">Synthesis</span></h2>
               <Cpu size={20} className="md:w-6 md:h-6 text-slate-200" />
            </div>

            <div className="space-y-6">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20 italic">Conceptual Nucleus</span>
               <textarea 
                 value={labPrompt}
                 onChange={(e) => setLabPrompt(e.target.value)}
                 placeholder="DESCRIBE THE VIBE..."
                 className="w-full bg-[#f8f9fa] border-none p-8 md:p-12 rounded-[30px] md:rounded-[40px] text-lg md:text-2xl font-black uppercase tracking-widest min-h-[160px] md:min-h-[220px] outline-none"
               />
            </div>

            <button 
              onClick={runExperiment}
              disabled={isGenerating || !labPrompt}
              className="w-full py-6 md:py-8 rounded-full bg-[#0f172a] text-white text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] hover:bg-rose-600 transition-all flex items-center justify-center gap-4 disabled:opacity-20"
            >
              {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
              Initialize Synthesis
            </button>
          </div>

          {labResult && (
            <div className="animate-in slide-in-from-bottom-8 duration-700">
               <div className="p-8 md:p-16 bg-black text-white rounded-[40px] md:rounded-[60px] shadow-3xl">
                  <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/40 block mb-8">Synthesis Output</span>
                  <p className="text-lg md:text-2xl font-bold leading-relaxed italic serif opacity-95">
                    {labResult}
                  </p>
               </div>
            </div>
          )}
        </div>

        {/* Right Sidebar Telemetry */}
        <div className="lg:col-span-3 order-3 hidden lg:block space-y-12">
          <div className="bg-white border border-black/[0.03] p-10 rounded-[50px] space-y-12">
             <div className="text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-black/20 block mb-6">Performance</span>
                <div className="text-3xl font-black tracking-tighter">99.4%</div>
                <span className="text-[8px] font-black uppercase text-emerald-500">Optimal Sync</span>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Lab;
