import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronRight, Plus, Trash2, Layout, Send, Info, Layers, Search, Zap, FileText, Grid3X3, RefreshCcw, Bug, Loader2, Maximize2, CheckCircle2
} from 'lucide-react';
import { SKILL_BUCKETS } from '../../constants/skillBuckets.js';

// --- VISUAL COMPONENT IMPORTS ---
import { GraphCanvas } from '../visuals/GraphCanvas.jsx';
import { VolumeVisualization } from '../visuals/VolumeVisualization.jsx';
import { FrequencyTable, PercentGrid } from '../visuals/StatisticsVisuals.jsx';
import { ProbabilityMarbles, ProbabilitySpinner } from '../visuals/ProbabilityVisuals.jsx';
import ProbabilityTree from '../visuals/ProbabilityTree.jsx'; 
import { RenderShape } from '../visuals/GeometryShapes.jsx';
import { ScaleVisual, SimilarityCompare, CompareShapesArea } from '../visuals/ScaleVisuals.jsx';
import { TransversalVisual, CompositeVisual } from '../visuals/ComplexGeometry.jsx';
import PatternVisual from '../visuals/PatternComponents.jsx'; 
import AngleVisual from '../visuals/AngleComponents.jsx'; 

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

        if (content) loadKaTeX();
    }, [content]);

    return (
        <div ref={containerRef} className="math-content leading-relaxed whitespace-pre-wrap">
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
    if (typeof onDoNowGenerate !== 'function') {
        console.error("onDoNowGenerate prop is missing");
        return;
    }

    if (setupMode === 'donow') {
      const config = packet.map(p => {
          // Extract level if possible, else default to 1
          const levelMatch = p.variationKey.match(/\d+$/);
          return {
            topic: p.topicId,
            level: levelMatch ? parseInt(levelMatch[0]) : 1, 
            variation: p.variationKey
          };
      });
      // This triggers setView('donow_grid') in App.jsx
      onDoNowGenerate(config);
    }
  };

  /**
   * VISUAL RENDERER
   * Correctly maps to renderData.geometry and renderData.graph
   */
  const renderVisual = () => {
    if (!previewData?.renderData) return null;
    
    const visual = previewData.renderData.geometry || previewData.renderData.graph;
    if (!visual) return null;

    const type = visual.type || (previewData.renderData.graph ? 'graph' : null);
    const data = visual;
    
    const scaleWrapper = "scale-[0.8] origin-top my-1 transform-gpu";

    switch (type) {
      case 'graph': return <div className={scaleWrapper}><GraphCanvas data={data} /></div>;
      case 'volume': return <div className={scaleWrapper}><VolumeVisualization data={data} /></div>;
      case 'angle': return <div className={scaleWrapper}><AngleVisual data={data} /></div>;
      case 'pattern': return <div className="scale-75 origin-top my-1"><PatternVisual data={data} /></div>;
      case 'rectangle': case 'square': case 'parallelogram': 
      case 'triangle': case 'circle': case 'semicircle': case 'quarter_circle':
        return (
          <div className="flex justify-center w-full py-1">
            <svg width="200" height="150" viewBox="0 0 300 250" className="drop-shadow-sm overflow-visible">
              <RenderShape type={type} dims={data} labels={data.labels} scale={0.6} />
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
      
      {/* PANE 1: SIDEBAR (LIBRARY) - WIDER & LARGER TEXT */}
      <div className="w-100 bg-white border-r border-slate-200 flex flex-col shadow-sm shrink-0 font-medium">
        <div className="p-6 border-b border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-black uppercase tracking-widest text-xs text-slate-400 italic">Bibliotek</h2>
            <button onClick={() => setSetupMode(null)} className="text-xs font-black text-indigo-600 uppercase hover:underline">Byt läge</button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
            <input 
              type="text" placeholder="Sök område..." 
              className="w-full pl-11 pr-3 py-3 bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl text-base outline-none font-bold"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {Object.values(SKILL_BUCKETS).map(cat => {
            const catTopics = Object.entries(cat.topics).filter(([id]) => filteredTopics.some(ft => ft.id === id));
            if (catTopics.length === 0) return null;
            return (
              <div key={cat.id}>
                <h3 className="px-3 text-xs font-black text-slate-400 uppercase mb-3 italic tracking-wider">{cat.name}</h3>
                <div className="space-y-1.5">
                  {catTopics.map(([id, data]) => (
                    <button
                      key={id} onClick={() => setSelectedTopicId(id)}
                      className={`w-full text-left px-4 py-3 text-[16px] rounded-xl transition-all flex items-center justify-between group ${
                        selectedTopicId === id ? 'bg-indigo-600 text-white shadow-md font-bold' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{data.name}</span>
                      <ChevronRight size={18} className={selectedTopicId === id ? 'opacity-100' : 'opacity-20'} />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PANE 2: VARIATIONS - WIDER & LARGER TEXT */}
      <div className="w-[420px] bg-slate-50 border-r border-slate-200 flex flex-col overflow-hidden shrink-0">
        <div className="p-6 border-b border-slate-200 bg-white shrink-0">
            <h1 className="text-xl font-black text-slate-900 uppercase truncate italic tracking-tight">{currentTopic?.name}</h1>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Välj variationer</p>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5 shadow-inner custom-scrollbar">
            {currentTopic?.variations.map(v => (
                <div 
                    key={v.key} onClick={() => triggerPreview(v.key)}
                    className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer relative group ${
                        activePreviewKey === v.key ? 'border-indigo-500 bg-white shadow-xl ring-4 ring-indigo-50' : 'border-white bg-white hover:border-indigo-100 shadow-sm'
                    }`}
                >
                    <div className="flex justify-between items-start gap-6">
                        <div className="min-w-0">
                            <h4 className="font-black text-slate-800 text-[16px] uppercase leading-tight group-hover:text-indigo-600 transition-colors tracking-tight">{v.name}</h4>
                            <p className="text-[14px] text-slate-500 mt-2 leading-relaxed font-medium">{v.desc}</p>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); addToPacket(v); }}
                            className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all shadow-xl group-hover:scale-110 active:scale-90 shrink-0"
                        >
                            <Plus size={22} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* PANE 3: THE BOARD (ENLARGED PREVIEW) - THINNER/SCALED DOWN CONTENT */}
      <div className="flex-1 bg-slate-200 p-6 flex flex-col overflow-hidden relative">
        <div className="flex-1 bg-white rounded-[2.5rem] shadow-2xl border border-slate-300 overflow-hidden flex flex-col mx-auto w-full max-w-3xl">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isPreviewLoading ? 'bg-yellow-400 animate-spin' : 'bg-red-500 animate-pulse'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Tavlan</span>
                </div>
                {activePreviewKey && (
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
                        <Loader2 className="animate-spin text-indigo-600" size={32} />
                    </div>
                )}
                
                {!previewData ? (
                    <div className="text-slate-300 flex flex-col items-center gap-4 grayscale opacity-20">
                        <Maximize2 size={64} strokeWidth={0.5} />
                        <p className="text-sm font-black uppercase tracking-widest leading-relaxed">Välj variation för att förhandsgranska</p>
                    </div>
                ) : (
                    <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-500 py-2">
                        {/* Visuella element */}
                        <div className="w-full flex justify-center transform transition-transform">
                             {renderVisual()}
                        </div>

                        {/* Beskrivning med LaTeX-stöd */}
                        <div className="text-lg text-slate-800 font-bold tracking-tight px-6 leading-relaxed">
                            <MathDisplay content={previewData.renderData.description} />
                        </div>
                        
                        {/* LaTeX-block */}
                        {previewData.renderData.latex && (
                            <div className="text-2xl font-serif text-indigo-600 py-6 px-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 shadow-inner overflow-x-auto mx-4">
                                <MathDisplay content={`$$${previewData.renderData.latex}$$`} />
                            </div>
                        )}

                        {/* Alternativ för flervalsfrågor */}
                        {previewData.renderData.options && previewData.renderData.options.length > 0 && (
                            <div className="grid grid-cols-2 gap-3 px-6 mt-4">
                                {previewData.renderData.options.map((opt, idx) => (
                                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3 text-left">
                                        <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[11px] font-black text-slate-400 shrink-0 shadow-sm">
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <div className="text-xs font-semibold text-slate-700">
                                            <MathDisplay content={opt} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Ledtråd */}
                        <div className="pt-6 border-t border-slate-100 text-left px-6 mx-4">
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
      <div className="w-80 bg-white border-l border-slate-200 flex flex-col shadow-2xl relative z-10 shrink-0 font-medium">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-sm font-black shadow-lg">
              {packet.length}
            </div>
            <h2 className="text-xs font-black text-slate-600 uppercase tracking-widest tracking-tighter">Ditt Paket</h2>
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
                <h5 className="text-[13px] font-bold text-slate-800 leading-tight mb-3">{item.name}</h5>
                {setupMode === 'worksheet' && (
                    <div className="flex items-center justify-between bg-white rounded-xl p-2 border border-slate-100 shadow-sm">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter ml-1">Antal</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-slate-50 rounded-lg hover:bg-indigo-600 hover:text-white transition-all text-xs font-bold">-</button>
                            <span className="w-5 text-center font-bold text-slate-700 text-sm">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-slate-50 rounded-lg hover:bg-indigo-600 hover:text-white transition-all text-xs font-bold">+</button>
                        </div>
                    </div>
                )}
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