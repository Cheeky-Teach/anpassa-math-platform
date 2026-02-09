import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronRight, Plus, Trash2, Layout, Send, Info, Layers, Search, Zap, FileText, Grid3X3, RefreshCcw, Bug, Loader2, Maximize2, CheckCircle2
} from 'lucide-react';
import { SKILL_BUCKETS } from '../../constants/skillBuckets';

// --- VISUAL COMPONENT IMPORTS ---
import { GraphCanvas } from '../visuals/GraphCanvas';
import { VolumeVisualization } from '../visuals/VolumeVisualization';
import { FrequencyTable, PercentGrid } from '../visuals/StatisticsVisuals';
import { ProbabilityMarbles, ProbabilitySpinner } from '../visuals/ProbabilityVisuals';
import ProbabilityTree from '../visuals/ProbabilityTree'; 
import { RenderShape } from '../visuals/GeometryShapes';
import { ScaleVisual, SimilarityCompare, CompareShapesArea } from '../visuals/ScaleVisuals';
import { TransversalVisual, CompositeVisual } from '../visuals/ComplexGeometry';
import PatternVisual from '../visuals/PatternComponents'; 
import AngleVisual from '../visuals/AngleComponents'; 

/**
 * REFINED MATH RENDERER
 * Handles mixed text and LaTeX (e.g., "Calculate $2x=10$") using KaTeX auto-render.
 */
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

        loadKaTeX();
    }, [content]);

    return (
        <div ref={containerRef} className="math-content leading-relaxed">
            {content}
        </div>
    );
};

export default function QuestionStudio({ onDoNowGenerate, ui, lang }) {
  const [setupMode, setSetupMode] = useState(null); 
  const [selectedTopicId, setSelectedTopicId] = useState('basic_arithmetic');
  const [packet, setPacket] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [activePreviewKey, setActivePreviewKey] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    setPreviewData(null);
    setActivePreviewKey(null);
  }, [selectedTopicId]);

  const allTopics = Object.values(SKILL_BUCKETS).flatMap(cat => 
    Object.entries(cat.topics).map(([id, data]) => ({ id, categoryName: cat.name, ...data }))
  );

  const currentTopic = allTopics.find(t => t.id === selectedTopicId) || allTopics[0];

  const triggerPreview = async (variationKey) => {
    setIsPreviewLoading(true);
    setActivePreviewKey(variationKey);
    try {
        const currentLang = lang || 'sv';
        const res = await fetch(`/api/question?topic=${selectedTopicId}&variation=${variationKey}&lang=${currentLang}`);
        const data = await res.json();
        setPreviewData(data);
    } catch (err) {
        console.error("Preview failed:", err);
        setPreviewData(null);
    } finally {
        setIsPreviewLoading(false);
    }
  };

  const addToPacket = (variation) => {
    if (setupMode === 'donow' && packet.length >= 3) return; 
    setPacket([...packet, {
      id: crypto.randomUUID(),
      topicId: selectedTopicId,
      variationKey: variation.key,
      name: variation.name,
      quantity: setupMode === 'donow' ? 2 : 5, 
    }]);
  };

  const removeFromPacket = (id) => setPacket(packet.filter(p => p.id !== id));
  const updateQuantity = (id, delta) => {
    setPacket(packet.map(p => p.id === id ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p));
  };

  const handleFinalAction = () => {
    if (typeof onDoNowGenerate !== 'function') return;
    if (setupMode === 'donow') {
      const config = packet.map(p => ({
        topic: p.topicId,
        level: 1, 
        variation: p.variationKey
      }));
      onDoNowGenerate(config);
    }
  };

  const renderVisual = () => {
    if (!previewData?.visualData) return null;
    const { type, data } = previewData.visualData;
    const scaleClass = "scale-75 origin-center my-2";

    switch (type) {
      case 'graph': return <div className={scaleClass}><GraphCanvas data={data} /></div>;
      case 'volume': return <div className={scaleClass}><VolumeVisualization data={data} /></div>;
      case 'angle': return <div className={scaleClass}><AngleVisual data={data} /></div>;
      case 'pattern': return <div className="scale-75 my-2"><PatternVisual data={data} /></div>;
      case 'rectangle': case 'square': case 'parallelogram': 
      case 'triangle': case 'circle': case 'semicircle': case 'quarter_circle':
        return (
          <div className="flex justify-center w-full py-2">
            <svg width="240" height="180" viewBox="0 0 300 250" className="drop-shadow-sm overflow-visible">
              <RenderShape type={type} dims={data} labels={data.labels} scale={0.7} />
            </svg>
          </div>
        );
      default: return null;
    }
  };

  const filteredTopics = allTopics.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!setupMode) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="max-w-4xl w-full text-center space-y-12 animate-in fade-in zoom-in-95 duration-500">
            <h2 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic">Studio</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <button onClick={() => setSetupMode('donow')} className="group p-10 bg-white border-2 border-slate-100 rounded-[3rem] hover:border-indigo-600 hover:shadow-2xl transition-all text-left">
                    <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform"><Grid3X3 size={32} /></div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase">Do Now Grid</h3>
                    <p className="text-slate-500 leading-relaxed font-medium">Rutnät för tavlan.</p>
                </button>
                <button onClick={() => setSetupMode('worksheet')} className="group p-10 bg-white border-2 border-slate-100 rounded-[3rem] hover:border-emerald-600 hover:shadow-2xl transition-all text-left">
                    <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform"><FileText size={32} /></div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase">Arbetsblad</h3>
                    <p className="text-slate-500 leading-relaxed font-medium">Övningspaket för elever.</p>
                </button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-100 overflow-hidden font-sans text-slate-900">
      
      {/* PANE 1: SIDEBAR (LIBRARY) - NARROW */}
      <div className="w-56 bg-white border-r border-slate-200 flex flex-col shadow-sm shrink-0">
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-black uppercase tracking-widest text-[9px] text-slate-400 italic">Library</h2>
            <button onClick={() => setSetupMode(null)} className="text-[9px] font-black text-indigo-600 uppercase">Ändra</button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input 
              type="text" placeholder="Sök..." 
              className="w-full pl-9 pr-3 py-2 bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-lg text-xs outline-none"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {Object.values(SKILL_BUCKETS).map(cat => {
            const catTopics = Object.entries(cat.topics).filter(([id]) => filteredTopics.some(ft => ft.id === id));
            if (catTopics.length === 0) return null;
            return (
              <div key={cat.id}>
                <h3 className="px-3 text-[9px] font-black text-slate-400 uppercase mb-1 italic">{cat.name}</h3>
                <div className="space-y-0.5">
                  {catTopics.map(([id, data]) => (
                    <button
                      key={id} onClick={() => setSelectedTopicId(id)}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-all flex items-center justify-between group ${
                        selectedTopicId === id ? 'bg-indigo-600 text-white shadow-md font-bold' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{data.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PANE 2: WORKSPACE (VARIATIONS) - NARROW */}
      <div className="w-56 bg-slate-50 border-r border-slate-200 flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b border-slate-200 bg-white shrink-0">
            <h1 className="text-xs font-black text-slate-900 uppercase truncate italic">{currentTopic?.name}</h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Välj variation</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3 shadow-inner">
            {currentTopic?.variations.map(v => (
                <div 
                    key={v.key} onClick={() => triggerPreview(v.key)}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer relative group ${
                        activePreviewKey === v.key ? 'border-indigo-500 bg-white shadow-lg' : 'border-white bg-white hover:border-indigo-100 shadow-sm'
                    }`}
                >
                    <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                            <h4 className="font-bold text-slate-800 text-[10px] uppercase leading-tight line-clamp-2">{v.name}</h4>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); addToPacket(v); }}
                            className="p-1 bg-slate-900 text-white rounded-lg hover:bg-indigo-600 transition-all shadow-md shrink-0"
                        >
                            <Plus size={12} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* PANE 3: THE BOARD (ENLARGED PREVIEW) */}
      <div className="flex-1 bg-slate-200 p-6 flex flex-col overflow-hidden relative">
        <div className="flex-1 bg-white rounded-[2.5rem] shadow-2xl border border-slate-300 overflow-hidden flex flex-col">
            <div className="bg-slate-900 px-6 py-3 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isPreviewLoading ? 'bg-yellow-400 animate-spin' : 'bg-red-500 animate-pulse'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Board Display</span>
                </div>
                {activePreviewKey && (
                    <button 
                        onClick={() => triggerPreview(activePreviewKey)} disabled={isPreviewLoading}
                        className="text-[9px] bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full font-black uppercase transition-all flex items-center gap-2"
                    >
                        <RefreshCcw size={10} className={isPreviewLoading ? 'animate-spin' : ''} /> Ny variant
                    </button>
                )}
            </div>
            
            <div className="p-8 flex-1 flex flex-col items-center justify-center text-center relative overflow-y-auto custom-scrollbar">
                {isPreviewLoading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="animate-spin text-indigo-600" size={32} />
                    </div>
                )}
                
                {!previewData ? (
                    <div className="text-slate-300 flex flex-col items-center gap-4 grayscale opacity-20">
                        <Maximize2 size={64} strokeWidth={0.5} />
                        <p className="text-xs font-black uppercase tracking-widest leading-relaxed">Välj variation för förhandsgranskning</p>
                    </div>
                ) : (
                    <div className="w-full max-w-xl space-y-6 animate-in fade-in zoom-in-95 duration-500 py-4">
                        <div className="w-full flex justify-center">
                             {renderVisual()}
                        </div>

                        <div className="text-lg text-slate-800 font-bold tracking-tight px-4 leading-relaxed">
                            <MathDisplay content={previewData.renderData.description} />
                        </div>
                        
                        {previewData.renderData.latex && (
                            <div className="text-2xl font-serif text-indigo-600 py-6 px-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 shadow-inner overflow-x-auto">
                                <MathDisplay content={`$$${previewData.renderData.latex}$$`} />
                            </div>
                        )}

                        {/* --- MULTIPLE CHOICE ALTERNATIVES --- */}
                        {previewData.renderData.options && previewData.renderData.options.length > 0 && (
                            <div className="grid grid-cols-2 gap-3 px-4 mt-6">
                                {previewData.renderData.options.map((opt, idx) => (
                                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3 text-left">
                                        <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 shrink-0">
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <div className="text-sm font-semibold text-slate-700">
                                            <MathDisplay content={opt} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="pt-6 border-t border-slate-200 text-left px-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Info size={14} className="text-indigo-500" />
                                <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Ledtråd</h5>
                            </div>
                            <p className="text-sm text-slate-500 italic leading-relaxed font-medium">
                                <MathDisplay content={previewData.clues?.[0]?.text || "Ingen ledtråd tillgänglig."} />
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* PANE 4: THE CART */}
      <div className="w-64 bg-white border-l border-slate-200 flex flex-col shadow-2xl relative z-10 shrink-0">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-[10px] font-black shadow-md">
              {packet.length}
            </div>
            <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Ditt Paket</h2>
          </div>
          {packet.length > 0 && (
            <button onClick={() => setPacket([])} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
              <Trash2 size={16} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-white shadow-inner">
          {packet.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-200 grayscale opacity-50">
              <Layers size={40} strokeWidth={1} className="mb-2" />
              <p className="text-[8px] font-black uppercase tracking-widest">Empty</p>
            </div>
          ) : (
            packet.map((item) => (
              <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl relative group transition-all">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[7px] font-black text-indigo-500 uppercase tracking-tighter bg-indigo-50 px-1 py-0.5 rounded truncate max-w-[80px]">
                    {allTopics.find(t => t.id === item.topicId)?.name}
                  </span>
                  <button onClick={() => removeFromPacket(item.id)} className="p-0.5 text-red-400 hover:bg-red-50 rounded transition-all"><Trash2 size={12} /></button>
                </div>
                <h5 className="text-[10px] font-bold text-slate-800 leading-tight mb-2 line-clamp-1">{item.name}</h5>
                {setupMode === 'worksheet' && (
                    <div className="flex items-center justify-between bg-white rounded-lg p-1 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-1.5 ml-1">
                            <button onClick={() => updateQuantity(item.id, -1)} className="w-5 h-5 flex items-center justify-center bg-slate-50 rounded-md text-[10px] font-bold">-</button>
                            <span className="w-4 text-center font-bold text-slate-700 text-[10px]">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="w-5 h-5 flex items-center justify-center bg-slate-50 rounded-md text-[10px] font-bold">+</button>
                        </div>
                    </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-white shrink-0">
          <button 
            onClick={handleFinalAction} disabled={packet.length === 0}
            className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-xl tracking-tighter uppercase italic text-xs ${
                setupMode === 'donow' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            } disabled:opacity-30 active:scale-95`}
          >
            <Send size={16} /> {setupMode === 'donow' ? 'Skapa Do Now' : 'Publicera'}
          </button>
        </div>
      </div>
    </div>
  );
}