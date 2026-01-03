
import React, { useState, useEffect } from 'react';
import { 
  Monitor, Layout, Type, Image as ImageIcon, 
  Save, RotateCcw, Sparkles, Loader2, ArrowRight,
  Eye, CheckCircle2, ChevronDown, Layers
} from 'lucide-react';
import { HomeConfig } from '../types';
import { inventoryService } from '../services/inventoryService';
import { DEFAULT_HOME_CONFIG } from '../constants';

const Orchestrator: React.FC = () => {
  const [config, setConfig] = useState<HomeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'hero' | 'lookbook' | 'aura' | 'lab'>('hero');
  const [previewActive, setPreviewActive] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      const data = await inventoryService.getHomeConfig();
      setConfig(data);
      setLoading(false);
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    await inventoryService.saveHomeConfig(config);
    setSaving(false);
    alert("Storefront Orchestration Applied.");
  };

  const resetToDefault = () => {
    if (window.confirm("Rollback to factory defaults?")) {
      setConfig(DEFAULT_HOME_CONFIG);
    }
  };

  const updateHero = (field: keyof HomeConfig['hero'], value: string) => {
    if (!config) return;
    setConfig({ ...config, hero: { ...config.hero, [field]: value } });
  };

  if (loading || !config) return <div className="py-40 flex justify-center"><Loader2 className="animate-spin text-rose-500" /></div>;

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 pb-12">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-rose-500 block mb-6 italic">Visual Intelligence // CMD</span>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-900 serif italic">Storefront <span className="not-italic font-black text-rose-600">Orchestrator</span></h1>
        </div>
        <div className="flex gap-4">
          <button onClick={resetToDefault} className="px-8 py-5 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-rose-500 transition-all">
            <RotateCcw size={16} className="inline mr-2" /> Rollback
          </button>
          <button onClick={handleSave} className="bg-black text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-rose-500 transition-all flex items-center gap-3">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
            Apply Registry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          {[
            { id: 'hero', label: 'Hero Dynamics', icon: Layout },
            { id: 'lookbook', label: 'Lookbook Archive', icon: ImageIcon },
            { id: 'aura', label: 'Aura Selection', icon: Sparkles },
            { id: 'lab', label: 'Synthesis Lab', icon: Layers }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-6 p-6 rounded-3xl transition-all border ${activeTab === tab.id ? 'bg-white border-rose-500 shadow-xl' : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-50'}`}
            >
              <tab.icon size={20} className={activeTab === tab.id ? 'text-rose-500' : ''} />
              <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Configuration Editor */}
        <div className="lg:col-span-9 bg-white p-8 md:p-16 rounded-[60px] border border-slate-100 shadow-sm space-y-16">
          
          {activeTab === 'hero' && (
            <div className="space-y-12 animate-in slide-in-from-right-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Registry Label</label>
                  <input 
                    type="text" 
                    value={config.hero.registryLabel}
                    onChange={(e) => updateHero('registryLabel', e.target.value)}
                    className="w-full px-8 py-5 bg-slate-50 rounded-2xl text-xs font-bold tracking-widest outline-none border border-transparent focus:border-rose-500"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Primary Image Asset</label>
                  <input 
                    type="text" 
                    value={config.hero.image}
                    onChange={(e) => updateHero('image', e.target.value)}
                    className="w-full px-8 py-5 bg-slate-50 rounded-2xl text-xs font-bold tracking-widest outline-none border border-transparent focus:border-rose-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Headline Part 1 (Italic)</label>
                  <input 
                    type="text" 
                    value={config.hero.headingPart1}
                    onChange={(e) => updateHero('headingPart1', e.target.value)}
                    className="w-full px-8 py-5 bg-slate-50 rounded-2xl text-xs font-bold tracking-widest outline-none border border-transparent focus:border-rose-500"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Headline Part 2 (Bold)</label>
                  <input 
                    type="text" 
                    value={config.hero.headingPart2}
                    onChange={(e) => updateHero('headingPart2', e.target.value)}
                    className="w-full px-8 py-5 bg-slate-50 rounded-2xl text-xs font-bold tracking-widest outline-none border border-transparent focus:border-rose-500"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Narrative Description</label>
                <textarea 
                  value={config.hero.subheading}
                  onChange={(e) => updateHero('subheading', e.target.value)}
                  className="w-full px-8 py-6 bg-slate-50 rounded-[30px] text-xs font-bold tracking-widest outline-none border border-transparent focus:border-rose-500 min-h-[120px]"
                />
              </div>
              
              <div className="pt-8">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-8">Asset Visualization</span>
                <div className="aspect-video w-full rounded-[40px] overflow-hidden border border-slate-100 bg-slate-50">
                   <img src={config.hero.image} className="w-full h-full object-cover" alt="Hero Preview" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lookbook' && (
            <div className="space-y-12 animate-in slide-in-from-right-10">
               <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Main Title</label>
                  <input 
                    type="text" 
                    value={config.lookbook.title}
                    onChange={(e) => setConfig({...config, lookbook: {...config.lookbook, title: e.target.value}})}
                    className="w-full px-8 py-5 bg-slate-50 rounded-2xl text-xs font-bold tracking-widest outline-none border border-transparent focus:border-rose-500"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Subtitle Tag</label>
                  <input 
                    type="text" 
                    value={config.lookbook.subtitle}
                    onChange={(e) => setConfig({...config, lookbook: {...config.lookbook, subtitle: e.target.value}})}
                    className="w-full px-8 py-5 bg-slate-50 rounded-2xl text-xs font-bold tracking-widest outline-none border border-transparent focus:border-rose-500"
                  />
                </div>
               </div>
               
               <div className="space-y-8">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-4">Collection Slots</span>
                  {config.lookbook.items.map((item, idx) => (
                    <div key={idx} className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                       <div className="md:col-span-3 aspect-square rounded-3xl overflow-hidden border border-white">
                          <img src={item.image} className="w-full h-full object-cover" />
                       </div>
                       <div className="md:col-span-9 space-y-6">
                          <div className="grid grid-cols-2 gap-6">
                            <input 
                              type="text" 
                              value={item.title}
                              onChange={(e) => {
                                const newItems = [...config.lookbook.items];
                                newItems[idx].title = e.target.value;
                                setConfig({...config, lookbook: {...config.lookbook, items: newItems}});
                              }}
                              className="px-6 py-4 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                            />
                            <input 
                              type="text" 
                              value={item.image}
                              onChange={(e) => {
                                const newItems = [...config.lookbook.items];
                                newItems[idx].image = e.target.value;
                                setConfig({...config, lookbook: {...config.lookbook, items: newItems}});
                              }}
                              className="px-6 py-4 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                            />
                          </div>
                          <textarea 
                            value={item.desc}
                            onChange={(e) => {
                              const newItems = [...config.lookbook.items];
                              newItems[idx].desc = e.target.value;
                              setConfig({...config, lookbook: {...config.lookbook, items: newItems}});
                            }}
                            className="w-full px-6 py-4 bg-white rounded-xl text-[10px] font-bold tracking-widest min-h-[80px] outline-none"
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'aura' && (
            <div className="space-y-12 animate-in slide-in-from-right-10">
               <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Section Heading</label>
                  <input 
                    type="text" 
                    value={config.aura.heading}
                    onChange={(e) => setConfig({...config, aura: {...config.aura, heading: e.target.value}})}
                    className="w-full px-8 py-5 bg-slate-50 rounded-2xl text-xs font-bold tracking-widest outline-none border border-transparent focus:border-rose-500"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Context Label</label>
                  <input 
                    type="text" 
                    value={config.aura.subheading}
                    onChange={(e) => setConfig({...config, aura: {...config.aura, subheading: e.target.value}})}
                    className="w-full px-8 py-5 bg-slate-50 rounded-2xl text-xs font-bold tracking-widest outline-none border border-transparent focus:border-rose-500"
                  />
                </div>
               </div>
               <div className="bg-rose-50 p-12 rounded-[40px] border border-rose-100">
                  <p className="text-[11px] font-medium text-rose-950/60 serif italic leading-relaxed">
                    "The Aura selection dynamically pulls the top 4 artifacts from your inventory based on their Social Heat metrics. Ensure artifacts have heat ratings above 90 for optimal display."
                  </p>
               </div>
            </div>
          )}

          {activeTab === 'lab' && (
            <div className="space-y-12 animate-in slide-in-from-right-10">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Terminal Title</label>
                  <input 
                    type="text" 
                    value={config.lab.heading}
                    onChange={(e) => setConfig({...config, lab: {...config.lab, heading: e.target.value}})}
                    className="w-full px-8 py-5 bg-slate-50 rounded-2xl text-xs font-bold tracking-widest outline-none border border-transparent focus:border-rose-500"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Synthesis Prompt</label>
                  <input 
                    type="text" 
                    value={config.lab.subheading}
                    onChange={(e) => setConfig({...config, lab: {...config.lab, subheading: e.target.value}})}
                    className="w-full px-8 py-5 bg-slate-50 rounded-2xl text-xs font-bold tracking-widest outline-none border border-transparent focus:border-rose-500"
                  />
                </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Registry Versioning Tag</label>
                  <input 
                    type="text" 
                    value={config.lab.trackLabel}
                    onChange={(e) => setConfig({...config, lab: {...config.lab, trackLabel: e.target.value}})}
                    className="w-full px-8 py-5 bg-slate-50 rounded-2xl text-xs font-bold tracking-widest outline-none border border-transparent focus:border-rose-500"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Lab Asset URL</label>
                  <input 
                    type="text" 
                    value={config.lab.image}
                    onChange={(e) => setConfig({...config, lab: {...config.lab, image: e.target.value}})}
                    className="w-full px-8 py-5 bg-slate-50 rounded-2xl text-xs font-bold tracking-widest outline-none border border-transparent focus:border-rose-500"
                  />
                </div>
               </div>

               <div className="pt-8">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-8">Asset Visualization</span>
                <div className="aspect-square w-full max-w-[400px] rounded-[40px] overflow-hidden border border-slate-100 bg-slate-50 mx-auto">
                   <img src={config.lab.image} className="w-full h-full object-cover" alt="Lab Preview" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orchestrator;
