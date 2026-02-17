import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronRight, Plus, Trash2, Layout, Send, Info, Layers, Search, Zap, 
  FileText, Grid3X3, RefreshCcw, Loader2, Maximize2, AlertTriangle, 
  Minus, Eye, Settings2, Printer, Square
} from 'lucide-react';
import { SKILL_BUCKETS } from '../../constants/skillBuckets.js';
import { GeometryVisual, GraphCanvas, VolumeVisualization } from '../visuals/GeometryComponents.jsx';

// --- THEME CONFIGURATION ---
const CATEGORY_THEMES = {
  algebra: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', icon: 'bg-indigo-500' },
  arithmetic: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'bg-emerald-500' },
  geometry_cat: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', icon: 'bg-amber-500' },
  data: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200', icon: 'bg-rose-500' }
};

/**
 * FINAL REFACTORED MATH DISPLAY
 * Uses innerText injection and a small timeout to ensure KaTeX renders 
 * correctly regardless of React's render cycle.
 */
const MathDisplay = ({ content, className = "" }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!content || !containerRef.current) return;

        const renderMath = () => {
            // Set text manually to bypass Virtual DOM interference
            containerRef.current.innerText = content;

            if (window.renderMathInElement) {
                window.renderMathInElement(containerRef.current, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false },
                        { left: '\\(', right: '\\)', display: false },
                        { left: '\\[', right: '\\]', display: true }
                    ],
                    throwOnError: false,
                    trust: true
                });
            }
        };

        const timer = setTimeout(renderMath, 30);
        return () => clearTimeout(timer);
    }, [content]);

    return <div ref={containerRef} className={`math-content leading-relaxed whitespace-pre-wrap text-inherit ${className}`} />;
};

export default function QuestionStudio({ onDoNowGenerate, ui, lang = 'sv', initialPacket }) {
  // --- TRANSLATIONS ---
  const t = {
    sv: {
      studio: "Studio",
      donow_title: "Do Now Grid",
      worksheet_title: "Arbetsblad",
      library: "Bibliotek",
      change_mode: "Byt läge",
      search_placeholder: "Sök område...",
      sections_label: "Avsnitt",
      variants_label: "Varianter",
      board_label: "Tavlan",
      new_example: "Nytt exempel",
      preview_error: "Kunde inte ladda förhandsgranskning",
      select_hint: "Välj en variant för att förhandsgranska",
      hint_label: "Lösningsförslag & Ledtrådar",
      selected_questions: "Utvalda frågor",
      empty_packet: "Inga frågor",
      create_donow: "Skapa Grid",
      publish: "Publicera Blad",
      quantity: "Antal",
      layout_mode: "Visa Layout",
      studio_mode: "Visa Studio",
      width_label: "Bredd",
      mode_indicator: "Du skapar nu:",
      work_area_toggle: "Arbetsyta",
      compact: "Kompakt",
      spacious: "Gott om plats"
    },
    en: {
      studio: "Studio",
      donow_title: "Do Now Grid",
      worksheet_title: "Worksheet",
      library: "Library",
      change_mode: "Change mode",
      search_placeholder: "Search topics...",
      sections_label: "Sections",
      variants_label: "Variants",
      basic_group: "Basics",
      board_label: "The Board",
      new_example: "New Example",
      preview_error: "Could not load preview",
      select_hint: "Select a variation to preview",
      hint_label: "Solution & Hints",
      selected_questions: "Selected Questions",
      empty_packet: "Empty packet",
      create_donow: "Create Grid",
      publish: "Publish Sheet",
      quantity: "Quantity",
      layout_mode: "View Layout",
      studio_mode: "View Studio",
      width_label: "Width",
      mode_indicator: "Currently Building:",
      work_area_toggle: "Work Area",
      compact: "Compact",
      spacious: "Spacious"
    }
  }[lang];

  // --- STATE ---
  const [setupMode, setSetupMode] = useState(initialPacket?.length > 0 ? 'donow' : null); 
  const [canvasMode, setCanvasMode] = useState('studio'); 
  const [showWorkArea, setShowWorkArea] = useState(true); // Toggle for student work space
  const [selectedTopicId, setSelectedTopicId] = useState('basic_arithmetic');
  const [packet, setPacket] = useState(initialPacket || []);
  const [previewData, setPreviewData] = useState(null);
  const [activePreviewKey, setActivePreviewKey] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [pendingQuantity, setPendingQuantity] = useState(1);

  // --- EFFECTS ---
  // Force Studio mode and clear layout if switching to Do Now
  useEffect(() => {
    if (setupMode === 'donow') setCanvasMode('studio');
  }, [setupMode]);

  // --- HELPERS ---
  const allTopics = Object.values(SKILL_BUCKETS).flatMap(cat => 
    Object.entries(cat.topics).map(([id, data]) => ({ id, categoryName: cat.name[lang], categoryId: cat.id, ...data }))
  );
  const currentTopic = allTopics.find(tp => tp.id === selectedTopicId) || allTopics[0];

  const triggerPreview = async (variationKey) => {
    setIsPreviewLoading(true);
    setActivePreviewKey(variationKey);
    setPreviewError(null);
    try {
        const res = await fetch(`/api/question?topic=${selectedTopicId}&variation=${variationKey}&lang=${lang}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setPreviewData(data);
    } catch (err) { setPreviewError(err.message); } 
    finally { setIsPreviewLoading(false); }
  };

  const addToPacket = (variation, qty) => {
    if (!previewData) return;
    const newItems = Array.from({ length: qty }).map(() => ({
      id: crypto.randomUUID(),
      topicId: selectedTopicId,
      variationKey: variation.key,
      name: variation.name[lang] || variation.name.sv,
      columnSpan: 3, 
      resolvedData: JSON.parse(JSON.stringify(previewData)) 
    }));
    
    if (setupMode === 'donow' && packet.length + newItems.length > 6) {
        alert("Do Now supports max 6 questions.");
        return;
    }
    setPacket([...packet, ...newItems]);
    setPendingQuantity(1);
  };

  const updatePacketItem = (id, key, val) => {
    setPacket(packet.map(p => p.id === id ? { ...p, [key]: val } : p));
  };

  const handleFinalAction = () => {
    if (setupMode === 'donow') {
      const config = packet.map(p => ({
          topic: p.topicId,
          level: parseInt(p.variationKey.match(/\d+/)?.[0] || '1'), 
          variation: p.variationKey 
      }));
      onDoNowGenerate(config, packet);
    }
  };

  const renderVisual = (data) => {
    if (!data?.renderData) return null;
    if (data.renderData.graph) return <GraphCanvas data={data.renderData.graph} />;
    if (data.renderData.geometry) return <GeometryVisual data={data.renderData.geometry} />;
    return null;
  };

  // --- SCREEN 1: MODE SELECTION ---
  if (!setupMode) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="max-w-4xl w-full text-center space-y-12 animate-in fade-in zoom-in-95">
            <h2 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic">{t.studio}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <button onClick={() => setSetupMode('donow')} className="group p-12 bg-white border-2 border-slate-100 rounded-[3rem] hover:border-indigo-600 transition-all text-left">
                    <Grid3X3 size={40} className="text-indigo-600 mb-6" />
                    <h3 className="text-3xl font-black text-slate-800 mb-2 uppercase">{t.donow_title}</h3>
                </button>
                <button onClick={() => setSetupMode('worksheet')} className="group p-12 bg-white border-2 border-slate-100 rounded-[3rem] hover:border-emerald-600 transition-all text-left">
                    <FileText size={40} className="text-emerald-600 mb-6" />
                    <h3 className="text-3xl font-black text-slate-800 mb-2 uppercase">{t.worksheet_title}</h3>
                </button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-100 overflow-hidden font-sans">
      
      {/* PANE 1: TOPIC LIST */}
      <div className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100">
          <button onClick={() => { setSetupMode(null); setPacket([]); }} className="text-[10px] font-black text-indigo-600 uppercase mb-4 block hover:underline">← {t.change_mode}</button>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={16} />
            <input 
              type="text" placeholder={t.search_placeholder} 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {Object.values(SKILL_BUCKETS).map(cat => (
            <div key={cat.id}>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-2">{cat.name[lang]}</h3>
              <div className="space-y-1">
                {Object.entries(cat.topics).map(([id, data]) => (
                  <button key={id} onClick={() => setSelectedTopicId(id)} className={`w-full text-left px-4 py-2.5 text-sm rounded-xl transition-all ${selectedTopicId === id ? 'bg-slate-900 text-white font-bold shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}>
                    {data.name[lang]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PANE 2: VARIATIONS & QUANTITY */}
      <div className="w-[340px] bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 border-b bg-white shrink-0">
            <h1 className="text-lg font-black text-slate-900 uppercase italic truncate">{currentTopic?.name[lang]}</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {currentTopic?.variations.map(v => (
                <div key={v.key} onClick={() => triggerPreview(v.key)} className={`p-5 rounded-3xl border-2 transition-all cursor-pointer bg-white ${activePreviewKey === v.key ? 'border-indigo-500 shadow-xl' : 'border-transparent shadow-sm'}`}>
                    <h4 className="font-bold text-sm mb-1">{v.name[lang]}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mb-4">{v.desc[lang]}</p>
                    
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-slate-100 rounded-lg p-1">
                            <button onClick={(e) => { e.stopPropagation(); setPendingQuantity(Math.max(1, pendingQuantity - 1)); }} className="w-6 h-6 flex items-center justify-center hover:bg-white rounded"><Minus size={12}/></button>
                            <span className="w-8 text-center text-xs font-bold">{pendingQuantity}</span>
                            <button onClick={(e) => { e.stopPropagation(); setPendingQuantity(pendingQuantity + 1); }} className="w-6 h-6 flex items-center justify-center hover:bg-white rounded"><Plus size={12}/></button>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); addToPacket(v, pendingQuantity); }}
                          className={`flex-1 py-2 text-white rounded-lg text-[10px] font-black uppercase transition-all ${setupMode === 'donow' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                        >
                            Lägg till {pendingQuantity} st
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* PANE 3: THE DYNAMIC CANVAS */}
      <div className="flex-1 bg-slate-200 p-6 flex flex-col overflow-hidden relative">
        
        {/* WORKSPACE HEADER */}
        <div className="flex flex-col items-center mb-6 gap-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{t.mode_indicator}</span>
            <div className="flex items-center gap-4">
                <div className="bg-white p-1 rounded-2xl shadow-xl flex gap-1 border border-slate-300">
                    <button 
                      onClick={() => setCanvasMode('studio')} 
                      className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all 
                      ${canvasMode === 'studio' ? (setupMode === 'donow' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white') : 'text-slate-400'}`}
                    >
                        <Zap size={14}/> {setupMode === 'donow' ? t.donow_title : t.studio_mode}
                    </button>

                    {setupMode === 'worksheet' && (
                      <button 
                        onClick={() => setCanvasMode('layout')} 
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all 
                        ${canvasMode === 'layout' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                      >
                          <Eye size={14}/> {t.layout_mode} ({packet.length})
                      </button>
                    )}
                </div>

                {/* COMPACT/SPACIOUS TOGGLE */}
                {canvasMode === 'layout' && (
                    <button 
                        onClick={() => setShowWorkArea(!showWorkArea)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all text-[10px] font-black uppercase shadow-lg
                        ${showWorkArea ? 'bg-white border-indigo-600 text-indigo-600' : 'bg-slate-800 border-slate-800 text-white'}`}
                    >
                        <Square size={14} fill={showWorkArea ? "currentColor" : "none"} />
                        {t.work_area_toggle}: {showWorkArea ? t.spacious : t.compact}
                    </button>
                )}
            </div>
        </div>

        {canvasMode === 'studio' ? (
            <div className="flex-1 bg-white rounded-[2.5rem] shadow-2xl border border-slate-300 overflow-hidden flex flex-col mx-auto w-full max-w-2xl">
                <div className={`px-6 py-4 text-white flex justify-between items-center ${setupMode === 'donow' ? 'bg-slate-900' : 'bg-slate-800'}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{t.board_label}</span>
                    {activePreviewKey && <button onClick={() => triggerPreview(activePreviewKey)} className="text-[10px] bg-white/10 px-3 py-1 rounded-full font-bold flex items-center gap-2"><RefreshCcw size={12}/> {t.new_example}</button>}
                </div>
                
                <div className="p-10 flex-1 flex flex-col items-center text-center overflow-y-auto custom-scrollbar">
                    {isPreviewLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center">
                             <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Genererar...</p>
                        </div>
                    ) : !previewData ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-200 uppercase font-black tracking-widest">
                            {t.select_hint}
                        </div>
                    ) : (
                        <div className="w-full space-y-8 py-4 animate-in fade-in slide-in-from-bottom-2">
                            <div className="w-full flex justify-center">{renderVisual(previewData)}</div>
                            <div className="text-xl text-slate-800 font-bold tracking-tight px-6 leading-relaxed">
                                <MathDisplay content={previewData.renderData.description} />
                            </div>
                            {previewData.renderData.latex && (
                                <div className="text-2xl text-indigo-600 bg-indigo-50 p-6 rounded-3xl border border-indigo-100 shadow-inner">
                                    <MathDisplay content={`$$${previewData.renderData.latex}$$`} />
                                </div>
                            )}

                            {/* Options Preview */}
                            {previewData.renderData.options && previewData.renderData.options.length > 0 && (
                                <div className="grid grid-cols-2 gap-3 w-full px-6 mt-6">
                                    {previewData.renderData.options.map((opt, idx) => (
                                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-4 text-left shadow-sm">
                                            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[12px] font-black text-slate-400 shrink-0">{String.fromCharCode(65 + idx)}</div>
                                            <div className="text-sm font-semibold text-slate-700"><MathDisplay content={opt} /></div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Solution Clues */}
                            {previewData.clues && previewData.clues.length > 0 && (
                                <div className="pt-8 border-t border-slate-100 text-left px-4 w-full">
                                    <div className="flex items-center gap-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <Info size={16} className="text-indigo-500" />
                                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{t.hint_label}</h5>
                                    </div>
                                    <div className="space-y-4">
                                        {previewData.clues.map((clue, idx) => (
                                            <div key={idx} className="bg-amber-50/50 border border-amber-100 p-5 rounded-2xl relative overflow-hidden">
                                                <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-200" />
                                                <div className="text-sm text-slate-700 font-bold mb-2 flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-amber-600 uppercase italic">Steg {idx + 1}:</span>
                                                </div>
                                                <div className="text-sm text-slate-600 leading-relaxed"><MathDisplay content={clue.text} /></div>
                                                {clue.latex && (
                                                    <div className="mt-3 text-indigo-600 font-serif bg-white/60 p-3 rounded-lg border border-amber-100 inline-block">
                                                        <MathDisplay content={`$${clue.latex}$`} />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        ) : (
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-20">
                <div className="bg-white shadow-2xl w-[210mm] min-h-[297mm] mx-auto p-[20mm] grid grid-cols-3 gap-x-12 gap-y-16 animate-in slide-in-from-bottom-4">
                    {packet.map((item, idx) => (
                        <div key={item.id} className={`relative group border border-transparent hover:border-dashed hover:border-indigo-300 p-4 transition-all ${item.columnSpan === 1 ? 'col-span-1' : item.columnSpan === 2 ? 'col-span-2' : 'col-span-3'}`}>
                            <div className="absolute -top-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 z-10 transition-opacity">
                                <div className="bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-full flex gap-3 shadow-lg italic">
                                    <span>{t.width_label}:</span>
                                    {[1,2,3].map(n => <button key={n} onClick={() => updatePacketItem(item.id, 'columnSpan', n)} className={item.columnSpan === n ? 'text-yellow-300' : ''}>{n}/3</button>)}
                                </div>
                            </div>
                            <div className="text-sm">
                                <div className="font-bold mb-2 text-slate-300 text-[10px]">{idx + 1}.</div>
                                <MathDisplay content={item.resolvedData?.renderData.description || item.name} />
                                {item.resolvedData?.renderData.latex && <div className="py-4 text-center"><MathDisplay content={`$$${item.resolvedData.renderData.latex}$$`} /></div>}
                                
                                {/* DYNAMIC WORK AREA */}
                                {showWorkArea ? (
                                    <div className="min-h-[100px] border-b border-dashed border-slate-200 mt-4" />
                                ) : (
                                    <div className="mt-4 border-b border-slate-50" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* PANE 4: THE CART */}
      <div className="w-64 bg-white border-l border-slate-200 flex flex-col shadow-2xl shrink-0">
        <div className="p-6 border-b flex items-center justify-between bg-slate-50/50">
            <h2 className="text-xs font-black uppercase italic text-slate-400">{t.selected_questions}</h2>
            <div className={`${setupMode === 'donow' ? 'bg-indigo-600' : 'bg-emerald-600'} text-white px-3 py-1 rounded-full text-xs font-black`}>{packet.length}</div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {packet.map((item, idx) => (
                <div key={item.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center group">
                    <div className="min-w-0">
                        <div className="text-[10px] font-bold text-slate-400 mb-1">{idx + 1}. {item.topicId}</div>
                        <div className="text-xs font-bold truncate pr-2">{item.name}</div>
                    </div>
                    <button onClick={() => setPacket(packet.filter(p => p.id !== item.id))} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                </div>
            ))}
        </div>
        <div className="p-6 border-t">
            <button 
              onClick={handleFinalAction} 
              disabled={packet.length === 0} 
              className={`w-full py-4 text-white rounded-2xl font-black uppercase text-sm shadow-xl transition-all flex items-center justify-center gap-3 
              ${setupMode === 'donow' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'} 
              active:scale-95 disabled:opacity-30 disabled:grayscale`}
            >
                <Send size={18}/> {setupMode === 'donow' ? t.create_donow : t.publish}
            </button>
        </div>
      </div>
    </div>
  );
}