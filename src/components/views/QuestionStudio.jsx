import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronRight, Plus, Trash2, Layout, Send, Info, Layers, Search, Zap, FileText, Grid3X3, RefreshCcw, Bug, Loader2, Maximize2, CheckCircle2, AlertTriangle, Filter
} from 'lucide-react';
import { SKILL_BUCKETS } from '../../constants/skillBuckets.js';

// --- VISUAL COMPONENT IMPORTS ---
// FIX: Importerar den centrala dispatchern GeometryVisual för att hantera alla geometrityper korrekt
import { GeometryVisual, GraphCanvas, VolumeVisualization } from '../visuals/GeometryComponents.jsx';

// --- THEME CONFIGURATION ---
const CATEGORY_THEMES = {
  algebra: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', icon: 'bg-indigo-500' },
  arithmetic: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'bg-emerald-500' },
  geometry_cat: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', icon: 'bg-amber-500' },
  data: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200', icon: 'bg-rose-500' }
};

const MathDisplay = ({ content }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const loadKaTeX = () => {
            if (!document.getElementById('katex-css')) {
                const link = document.createElement('link');
                link.id = 'katex-css';
                link.rel = 'stylesheet';
                link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
                document.head.appendChild(link);
            }

            if (!window.renderMathInElement) {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
                script.onload = () => {
                    const autoRender = document.createElement('script');
                    autoRender.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js';
                    autoRender.onload = doRender;
                    document.head.appendChild(autoRender);
                };
                document.head.appendChild(script);
            } else {
                doRender();
            }
        };

        const doRender = () => {
            if (window.renderMathInElement && containerRef.current) {
                window.renderMathInElement(containerRef.current, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false },
                    ],
                    throwOnError: false
                });
            }
        };

        if (content) loadKaTeX();
    }, [content]);

    return (
        <div ref={containerRef} className="math-content leading-relaxed whitespace-pre-wrap text-inherit">
            {content}
        </div>
    );
};

export default function QuestionStudio({ onDoNowGenerate, ui, lang, initialPacket }) {
  // If we have an initial packet, default to 'donow' mode so the user sees their cart
  const [setupMode, setSetupMode] = useState(initialPacket && initialPacket.length > 0 ? 'donow' : null); 
  const [selectedTopicId, setSelectedTopicId] = useState('basic_arithmetic');
  
  // Initialize packet with the saved state if available
  const [packet, setPacket] = useState(initialPacket || []);
  
  const [previewData, setPreviewData] = useState(null);
  const [activePreviewKey, setActivePreviewKey] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);

  useEffect(() => {
    setPreviewData(null);
    setActivePreviewKey(null);
    setPreviewError(null);
  }, [selectedTopicId]);

  const allTopics = Object.values(SKILL_BUCKETS).flatMap(cat => 
    Object.entries(cat.topics).map(([id, data]) => ({ id, categoryName: cat.name, categoryId: cat.id, ...data }))
  );

  const currentTopic = allTopics.find(t => t.id === selectedTopicId) || allTopics[0];

  // --- SMART GROUPING ---
  const groupedVariations = React.useMemo(() => {
    if (!currentTopic?.variations) return {};
    const groups = {};
    
    currentTopic.variations.forEach(v => {
        const parts = v.name.split(':');
        const groupName = parts.length > 1 ? parts[0].trim() : 'Grundläggande';
        const displayName = parts.length > 1 ? parts.slice(1).join(':').trim() : v.name;
        
        if (!groups[groupName]) groups[groupName] = [];
        groups[groupName].push({ ...v, displayName });
    });
    
    return groups;
  }, [currentTopic]);

  const triggerPreview = async (variationKey) => {
    setIsPreviewLoading(true);
    setActivePreviewKey(variationKey);
    setPreviewError(null);
    setPreviewData(null); 

    try {
        const currentLang = lang || 'sv';
        const res = await fetch(`/api/question?topic=${selectedTopicId}&variation=${variationKey}&lang=${currentLang}`);
        
        if (!res.ok) {
            throw new Error(`Server returned ${res.status}`);
        }

        const data = await res.json();
        
        if (!data || !data.renderData) {
            throw new Error("Invalid data format from generator");
        }

        setPreviewData(data);
    } catch (err) {
        setPreviewError(err.message || "Kunde inte ladda förhandsgranskning");
    } finally {
        setIsPreviewLoading(false);
    }
  };

  const addToPacket = (variation) => {
    if (setupMode === 'donow' && packet.length >= 6) return; 
    setPacket([...packet, {
      id: crypto.randomUUID(),
      topicId: selectedTopicId,
      variationKey: variation.key,
      name: variation.name,
      quantity: setupMode === 'donow' ? 1 : 5, 
    }]);
  };

  const removeFromPacket = (id) => setPacket(packet.filter(p => p.id !== id));

  const handleFinalAction = () => {
    if (typeof onDoNowGenerate !== 'function') return;

    if (setupMode === 'donow') {
      const config = packet.map(p => {
          const levelMatch = p.variationKey.match(/\d+/);
          const extractedLevel = levelMatch ? parseInt(levelMatch[0]) : 1;

          return {
            topic: p.topicId,
            level: extractedLevel, 
            variation: p.variationKey 
          };
      });
      onDoNowGenerate(config, packet);
    }
  };

  /**
   * REFINED VISUAL RENDERER
   * Uses the central GeometryVisual dispatcher to handle all complex shapes
   * (House, Portal, L-shape) as well as Graphs and Volume.
   */
  const renderVisual = () => {
    if (!previewData?.renderData) return null;
    
    // 1. Check for functional graphs
    if (previewData.renderData.graph) {
        return (
            <div className="scale-90 origin-top transform-gpu">
                <GraphCanvas data={previewData.renderData.graph} />
            </div>
        );
    }

    // 2. Use GeometryVisual dispatcher for EVERYTHING else
    // This handles: basic shapes, composite (house/portal/L), angles, patterns, stats, probability
    if (previewData.renderData.geometry) {
        const data = previewData.renderData.geometry;
        
        return (
            <div className="scale-90 lg:scale-100 origin-top transform-gpu flex justify-center w-full">
                <GeometryVisual data={data} />
            </div>
        );
    }

    return null;
  };

  const filteredTopics = allTopics.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!setupMode) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="max-w-4xl w-full text-center space-y-12 animate-in fade-in zoom-in-95 duration-500">
            <h2 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic tracking-widest">Studio</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <button onClick={() => setSetupMode('donow')} className="group p-12 bg-white border-2 border-slate-100 rounded-[3rem] hover:border-indigo-600 hover:shadow-2xl transition-all text-left">
                    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform"><Grid3X3 size={40} /></div>
                    <h3 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tighter">Do Now Grid</h3>
                    <p className="text-lg text-slate-500 leading-relaxed font-medium">Rutnät för gemensam uppstart på tavlan.</p>
                </button>
                <button onClick={() => setSetupMode('worksheet')} className="group p-12 bg-white border-2 border-slate-100 rounded-[3rem] hover:border-emerald-600 hover:shadow-2xl transition-all text-left">
                    <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform"><FileText size={40} /></div>
                    <h3 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tighter">Arbetsblad</h3>
                    <p className="text-lg text-slate-500 leading-relaxed font-medium">Anpassade övningspaket för eleverna.</p>
                </button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-100 overflow-hidden font-sans text-slate-900">
      
      {/* PANE 1: SIDEBAR */}
      <div className="w-70 bg-white border-r border-slate-200 flex flex-col shadow-sm shrink-0 font-medium">
        <div className="p-6 border-b border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-black uppercase tracking-widest text-xs text-slate-400 italic">Bibliotek</h2>
            <button onClick={() => setSetupMode(null)} className="text-xs font-black text-indigo-600 uppercase hover:underline">Byt läge</button>
          </div>
          <div className="relative">
            <Search className="absolute left-3.5 top-4 text-slate-400" size={18} />
            <input 
              type="text" placeholder="Sök område..." 
              className="w-full pl-12 pr-4 py-3.5 bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-2xl text-base outline-none font-bold"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {Object.values(SKILL_BUCKETS).map(cat => {
            const catTopics = Object.entries(cat.topics).filter(([id]) => filteredTopics.some(ft => ft.id === id));
            if (catTopics.length === 0) return null;
            
            const theme = CATEGORY_THEMES[cat.id] || CATEGORY_THEMES['algebra'];
            
            return (
              <div key={cat.id}>
                <div className={`inline-block px-3 py-1 rounded-lg mb-3 ${theme.bg} ${theme.text} border ${theme.border}`}>
                    <h3 className="text-[10px] font-black uppercase tracking-widest">{cat.name}</h3>
                </div>
                
                <div className="space-y-1.5 pl-1">
                  {catTopics.map(([id, data]) => (
                    <button
                      key={id} onClick={() => setSelectedTopicId(id)}
                      className={`w-full text-left px-4 py-3 text-[15px] rounded-2xl transition-all flex items-center justify-between group ${
                        selectedTopicId === id ? 'bg-slate-900 text-white shadow-xl font-bold' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{data.name}</span>
                      <ChevronRight size={16} className={selectedTopicId === id ? 'opacity-100' : 'opacity-20'} />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PANE 2: VARIATIONS */}
      <div className="w-[320px] bg-slate-50 border-r border-slate-200 flex flex-col overflow-hidden shrink-0">
        <div className="p-6 border-b border-slate-200 bg-white shrink-0 shadow-sm z-10">
            <h1 className="text-lg font-black text-slate-900 uppercase truncate italic tracking-tight">{currentTopic?.name}</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                {Object.keys(groupedVariations).length} Sektioner • {currentTopic?.variations.length} Varianter
            </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8 shadow-inner custom-scrollbar relative">
            {Object.entries(groupedVariations).map(([groupName, variations]) => (
                <div key={groupName} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3 mb-4 sticky top-0 bg-slate-50/95 backdrop-blur-sm py-2 z-10">
                        <div className="h-px flex-1 bg-slate-300"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-200/50 px-2 py-1 rounded">{groupName}</span>
                        <div className="h-px flex-1 bg-slate-300"></div>
                    </div>

                    <div className="space-y-3">
                        {variations.map(v => (
                            <div 
                                key={v.key} onClick={() => triggerPreview(v.key)}
                                className={`p-5 rounded-[2rem] border-2 transition-all cursor-pointer relative group ${
                                    activePreviewKey === v.key ? 'border-indigo-500 bg-white shadow-xl ring-2 ring-indigo-100' : 'border-white bg-white hover:border-indigo-200 shadow-sm'
                                }`}
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="min-w-0">
                                        <h4 className={`font-bold text-[15px] leading-tight transition-colors ${activePreviewKey === v.key ? 'text-indigo-700' : 'text-slate-700'}`}>
                                            {v.displayName}
                                        </h4>
                                        <p className="text-[13px] text-slate-400 mt-1.5 leading-relaxed font-medium line-clamp-2">{v.desc}</p>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); addToPacket(v); }}
                                        className="p-2.5 bg-slate-100 text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm group-hover:scale-105 active:scale-90 shrink-0"
                                    >
                                        <Plus size={20} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* PANE 3: THE BOARD */}
      <div className="flex-1 bg-slate-200 p-6 flex flex-col overflow-hidden relative">
        <div className="flex-1 bg-white rounded-[2.5rem] shadow-2xl border border-slate-300 overflow-hidden flex flex-col mx-auto w-full max-w-2xl">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${isPreviewLoading ? 'bg-yellow-400 animate-spin' : 'bg-red-500 animate-pulse'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Tavlan</span>
                </div>
                {activePreviewKey && !previewError && (
                    <button 
                        onClick={() => triggerPreview(activePreviewKey)} disabled={isPreviewLoading}
                        className="text-[10px] bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full font-black uppercase transition-all flex items-center gap-2"
                    >
                        <RefreshCcw size={12} className={isPreviewLoading ? 'animate-spin' : ''} /> Nytt exempel
                    </button>
                )}
            </div>
            
            <div className="p-10 flex-1 flex flex-col items-center justify-center text-center relative overflow-y-auto custom-scrollbar">
                {isPreviewLoading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="animate-spin text-indigo-600" size={40} />
                    </div>
                )}
                
                {previewError ? (
                    <div className="text-red-400 flex flex-col items-center gap-4">
                        <AlertTriangle size={60} />
                        <p className="font-bold">{previewError}</p>
                        <p className="text-sm opacity-75">Kontrollera att backend-generatorn är korrekt kopplad.</p>
                    </div>
                ) : !previewData ? (
                    <div className="text-slate-300 flex flex-col items-center gap-4 grayscale opacity-20">
                        <Maximize2 size={80} strokeWidth={0.5} />
                        <p className="text-sm font-black uppercase tracking-widest leading-relaxed">Välj variation för att förhandsgranska</p>
                    </div>
                ) : (
                    <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-500 py-2">
                        <div className="w-full flex justify-center">
                             {renderVisual()}
                        </div>

                        {previewData.renderData && (
                            <>
                                <div className="text-xl text-slate-800 font-bold tracking-tight px-6 leading-relaxed">
                                    <MathDisplay content={previewData.renderData.description} />
                                </div>
                                
                                {previewData.renderData.latex && (
                                    <div className="text-2xl font-serif text-indigo-600 py-6 px-4 bg-indigo-50/50 rounded-3xl border border-indigo-100 shadow-inner overflow-x-auto mx-6">
                                        <MathDisplay content={`$$${previewData.renderData.latex}$$`} />
                                    </div>
                                )}

                                {previewData.renderData.options && previewData.renderData.options.length > 0 && (
                                    <div className="grid grid-cols-2 gap-3 px-6 mt-6">
                                        {previewData.renderData.options.map((opt, idx) => (
                                            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-4 text-left shadow-sm">
                                                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[12px] font-black text-slate-400 shrink-0">
                                                    {String.fromCharCode(65 + idx)}
                                                </div>
                                                <div className="text-sm font-semibold text-slate-700">
                                                    <MathDisplay content={opt} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <div className="pt-8 border-t border-slate-100 text-left px-8 mx-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Info size={16} className="text-indigo-500" />
                                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Ledtråd</h5>
                                    </div>
                                    <p className="text-base text-slate-500 italic leading-relaxed font-medium">
                                        <MathDisplay content={previewData.clues?.[0]?.text || "Ingen ledtråd tillgänglig."} />
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* PANE 4: THE CART */}
      <div className="w-60 bg-white border-l border-slate-200 flex flex-col shadow-2xl relative z-10 shrink-0 font-medium">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-sm font-black shadow-lg">
              {packet.length}
            </div>
            <h2 className="text-xs font-black text-slate-600 uppercase tracking-widest tracking-tighter italic">Utvalda frågor</h2>
          </div>
          {packet.length > 0 && (
            <button onClick={() => setPacket([])} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
              <Trash2 size={20} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white shadow-inner">
          {packet.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-200 grayscale opacity-50">
              <Layers size={48} strokeWidth={1} className="mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest">Tomt paket</p>
            </div>
          ) : (
            packet.map((item) => (
              <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl relative group transition-all hover:bg-white hover:shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[8px] font-black text-indigo-500 uppercase tracking-tighter bg-indigo-50 px-2 py-0.5 rounded truncate max-w-[120px]">
                    {allTopics.find(t => t.id === item.topicId)?.name}
                  </span>
                  <button onClick={() => removeFromPacket(item.id)} className="p-1 text-red-400 hover:bg-red-50 rounded transition-all"><Trash2 size={14} /></button>
                </div>
                <h5 className="text-[14px] font-bold text-slate-800 leading-tight mb-3">{item.name}</h5>
              </div>
            ))
          )}
        </div>

        <div className="p-8 border-t border-slate-100 bg-white shrink-0">
          <button 
            onClick={handleFinalAction} disabled={packet.length === 0}
            className={`w-full py-5 rounded-[2rem] font-black flex items-center justify-center gap-3 transition-all shadow-2xl tracking-tighter uppercase italic text-lg ${
                setupMode === 'donow' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'
            } disabled:opacity-30 active:scale-95`}
          >
            <Send size={24} /> {setupMode === 'donow' ? 'Skapa Do Now' : 'Publicera'}
          </button>
        </div>
      </div>
    </div>
  );
}