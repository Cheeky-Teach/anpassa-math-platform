import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronRight, ChevronLeft, Plus, Trash2, Layout, Send, Info, Layers, Search, Zap, 
  FileText, Grid3X3, RefreshCcw, Loader2, Maximize2, AlertTriangle, 
  Minus, Eye, Settings2, Printer, Square, Type, Shuffle, Save, Eraser, Clock,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { SKILL_BUCKETS } from '../../constants/skillBuckets.js';
import { GeometryVisual, GraphCanvas, VolumeVisualization } from '../visuals/GeometryComponents.jsx';
import { supabase } from '../../supabaseClient.js'; 

const MathDisplay = ({ content, className = "" }) => {
    const containerRef = useRef(null);
    useEffect(() => {
        if (!content || !containerRef.current) return;
        const renderMath = () => {
            containerRef.current.innerText = content;
            if (window.renderMathInElement) {
                window.renderMathInElement(containerRef.current, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false },
                        { left: '\\(', right: '\\)', display: false },
                        { left: '\\[', right: '\\]', display: true }
                    ],
                    throwOnError: false, trust: true
                });
            }
        };
        const timer = setTimeout(renderMath, 30);
        return () => clearTimeout(timer);
    }, [content]);
    return <div ref={containerRef} className={`math-content leading-relaxed whitespace-pre-wrap text-inherit ${className}`} />;
};

export default function QuestionStudio({ 
    onDoNowGenerate, 
    onWorksheetGenerate, 
    ui, 
    lang = 'sv', 
    initialPacket, 
    setInitialPacket, 
    sheetTitle, 
    setSheetTitle, 
    studioMode, 
    setStudioMode,
    includeAnswerKey,
    setIncludeAnswerKey,
    answerKeyStyle,
    setAnswerKeyStyle
}) {
  // --- TRANSLATIONS ---
  const t = {
    sv: {
      studio: "Studio", library_title: "Mina sparade blad", donow_title: "Do Now Grid", worksheet_title: "Arbetsblad",
      change_mode: "Byt läge", search_placeholder: "Sök område...", board_label: "Tavlan", new_example: "Nytt exempel",
      select_hint: "Välj en variant för att förhandsgranska", selected_questions: "Frågor", clear_all: "Rensa allt",
      create_donow: "Starta Live Grid", publish: "Skriv ut / Presentera", title_label: "Namnge din session/blad",
      save_success: "Sparad i biblioteket!", unsaved_warning: "Du har inte sparat än. Fortsätt ändå?",
      width_label: "Bredd", work_area_toggle: "Arbetsyta", section_label: "Instruktion:",
      regenerate: "Slumpa ny", load_btn: "Öppna", delete_confirm: "Radera detta blad permanent?",
      compact: "Kompakt", spacious: "Gott om plats",
      answer_key_toggle: "Inkludera facit", answer_style_label: "Facit-stil",
      style_compact: "Endast svar", style_detailed: "Steg-för-steg",
      delete_task: "Radera uppgift", name_label: "Namn:", date_label: "Datum:",
      save_btn: "Spara", live_btn: "Digital Live"
    },
    en: {
      studio: "Studio", library_title: "My Saved Sheets", donow_title: "Do Now Grid", worksheet_title: "Worksheet",
      change_mode: "Change mode", search_placeholder: "Search topics...", board_label: "The Board", new_example: "New Example",
      select_hint: "Select a variation to preview", selected_questions: "Questions", clear_all: "Clear Cart",
      create_donow: "Start Live Grid", publish: "Print / Present", title_label: "Name your session/sheet",
      save_success: "Saved to library!", unsaved_warning: "Unsaved work! Proceed anyway?",
      width_label: "Width", work_area_toggle: "Work Area", section_label: "Instruction:",
      regenerate: "Randomize new", load_btn: "Open", delete_confirm: "Delete this sheet permanently?",
      compact: "Compact", spacious: "Spacious",
      answer_key_toggle: "Include answer key", answer_style_label: "Key Style",
      style_compact: "Answers only", style_detailed: "Step-by-step",
      delete_task: "Delete task", name_label: "Name:", date_label: "Date:",
      save_btn: "Save", live_btn: "Digital Live"
    }
  }[lang];

  // --- STATE ---
  const [isPane1Collapsed, setIsPane1Collapsed] = useState(false); 
  const [setupMode, setSetupMode] = useState(studioMode); 
  const [activeSheetId, setActiveSheetId] = useState(null); 
  const [savedSheets, setSavedSheets] = useState([]);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const [canvasMode, setCanvasMode] = useState('studio'); 
  const [showWorkArea, setShowWorkArea] = useState(true);
  const [selectedTopicId, setSelectedTopicId] = useState('basic_arithmetic');
  const [packet, setPacket] = useState(initialPacket || []);
  const [isSaved, setIsSaved] = useState(true);
  const [previewData, setPreviewData] = useState(null);
  const [activePreviewKey, setActivePreviewKey] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [pendingQuantity, setPendingQuantity] = useState(1);

  // --- HELPERS ---
  const getAuthToken = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session ? session.access_token : 'dev-mock-token';
  };

  useEffect(() => { if (!setupMode) fetchLibrary(); setIsSaved(true); }, [setupMode]);
  useEffect(() => { if (currentTopic?.variations?.[0]) triggerPreview(currentTopic.variations[0].key); }, [selectedTopicId]);
  useEffect(() => { setInitialPacket(packet); }, [packet]);
  useEffect(() => { setStudioMode(setupMode); }, [setupMode]);

  const fetchLibrary = async () => {
    setIsLibraryLoading(true);
    try {
        const token = await getAuthToken();
        const res = await fetch('/api/sheets', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (Array.isArray(data)) setSavedSheets(data);
    } catch (err) { console.error("Library load error:", err); }
    finally { setIsLibraryLoading(false); }
  };

  const handleSave = async () => {
      if (!sheetTitle) { alert(t.title_label); return; }
      try {
          const token = await getAuthToken();
          const res = await fetch('/api/sheets', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ id: activeSheetId, title: sheetTitle, type: setupMode, packet, config: { showWorkArea, lang } })
          });
          const savedData = await res.json();
          setActiveSheetId(savedData.id);
          setIsSaved(true);
          alert(t.save_success);
          fetchLibrary(); 
      } catch (err) { alert("Systemfel vid sparning."); }
  };

  const deleteSheet = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm(t.delete_confirm)) return;
    try {
        const token = await getAuthToken();
        await fetch(`/api/sheets?id=${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        setSavedSheets(savedSheets.filter(s => s.id !== id));
    } catch (err) { alert("Kunde inte radera."); }
  };

  const loadSheet = (sheet) => {
      setPacket(sheet.packet);
      setSheetTitle(sheet.title);
      setSetupMode(sheet.type);
      setActiveSheetId(sheet.id);
      setIsSaved(true);
      if (sheet.config?.showWorkArea !== undefined) setShowWorkArea(sheet.config.showWorkArea);
  };

  const triggerPreview = async (variationKey) => {
    setIsPreviewLoading(true);
    setActivePreviewKey(variationKey);
    try {
        const res = await fetch(`/api/question?topic=${selectedTopicId}&variation=${variationKey}&lang=${lang}`);
        const data = await res.json();
        setPreviewData(data);
    } catch (err) { console.error(err); } finally { setIsPreviewLoading(false); }
  };

  const addToPacket = async (variation, qty) => {
    setIsPreviewLoading(true);
    setIsSaved(false);
    try {
        const newItems = [];
        for (let i = 0; i < qty; i++) {
            const res = await fetch(`/api/question?topic=${selectedTopicId}&variation=${variation.key}&lang=${lang}`);
            const data = await res.json();
            newItems.push({ id: crypto.randomUUID(), topicId: selectedTopicId, variationKey: variation.key, name: variation.name[lang] || variation.name.sv, columnSpan: 2, resolvedData: data, hideInstruction: i > 0 });
        }
        if (setupMode === 'donow' && packet.length + newItems.length > 6) { alert("Do Now max 6."); return; }
        setPacket(prev => [...prev, ...newItems]);
        setPendingQuantity(1);
    } catch (err) { alert(err.message); } finally { setIsPreviewLoading(false); }
  };

  const regenerateItem = async (id, topicId, variationKey) => {
    try {
        const res = await fetch(`/api/question?topic=${topicId}&variation=${variationKey}&lang=${lang}`);
        const data = await res.json();
        setPacket(prev => prev.map(item => item.id === id ? { ...item, resolvedData: data } : item));
        setIsSaved(false);
    } catch (err) { alert(err.message); }
  };

  const updatePacketItem = (id, key, val) => {
    setPacket(packet.map(p => p.id === id ? { ...p, [key]: val } : p));
    setIsSaved(false);
  };

  const handleLaunchLive = () => {
    if (!isSaved && !window.confirm(t.unsaved_warning)) return;
    const config = packet.map(p => ({ 
        topic: p.topicId, 
        level: parseInt(p.variationKey.match(/\d+/)?.[0] || '1'), 
        variation: p.variationKey 
    }));
    onDoNowGenerate(config, packet);
  };

  const handleLaunchPrint = () => {
    if (!isSaved && !window.confirm(t.unsaved_warning)) return;
    onWorksheetGenerate(packet);
  };

  const renderVisual = (data) => {
    if (!data?.renderData) return null;
    if (data.renderData.graph) return <GraphCanvas data={data.renderData.graph} />;
    if (data.renderData.geometry) return <GeometryVisual data={data.renderData.geometry} />;
    return null;
  };

  const allTopics = Object.values(SKILL_BUCKETS).flatMap(cat => Object.entries(cat.topics).map(([id, data]) => ({ id, categoryName: cat.name[lang], categoryId: cat.id, ...data })));
  const currentTopic = allTopics.find(tp => tp.id === selectedTopicId) || allTopics[0];
  const getColSpanClass = (span) => ({ 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4', 6: 'col-span-6' }[span] || 'col-span-6');

  if (!setupMode) {
    return (
      <div className="flex-1 bg-slate-50 flex flex-col items-center p-12 overflow-y-auto custom-scrollbar">
        <div className="max-w-5xl w-full space-y-16">
            <div className="text-center">
                <h2 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic mb-8">{t.studio}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <button onClick={() => { setSetupMode('donow'); setPacket([]); setSheetTitle(""); setActiveSheetId(null); }} className="group p-10 bg-white border-2 border-slate-100 rounded-[3rem] hover:border-indigo-600 transition-all text-left shadow-sm">
                        <Grid3X3 size={40} className="text-indigo-600 mb-6" />
                        <h3 className="text-3xl font-black text-slate-800 uppercase">{t.donow_title}</h3>
                    </button>
                    <button onClick={() => { setSetupMode('worksheet'); setPacket([]); setSheetTitle(""); setActiveSheetId(null); }} className="group p-10 bg-white border-2 border-slate-100 rounded-[3rem] hover:border-emerald-600 transition-all text-left shadow-sm">
                        <FileText size={40} className="text-emerald-600 mb-6" />
                        <h3 className="text-3xl font-black text-slate-800 uppercase">{t.worksheet_title}</h3>
                    </button>
                </div>
            </div>
            <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3"><Clock size={16}/> {t.library_title}</h3>
                {isLibraryLoading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-300" size={32}/></div> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {savedSheets.map(sheet => (
                            <div key={sheet.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group relative">
                                <button onClick={(e) => deleteSheet(e, sheet.id)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-4 ${sheet.type === 'donow' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>{sheet.type === 'donow' ? <Grid3X3 size={16}/> : <FileText size={16}/>}</div>
                                <h4 className="font-bold text-slate-800 truncate mb-1 pr-8">{sheet.title}</h4>
                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-6">{sheet.packet?.length || 0} Uppgifter • {new Date(sheet.updated_at).toLocaleDateString()}</p>
                                <button onClick={() => loadSheet(sheet)} className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase hover:bg-indigo-600 transition-colors">{t.load_btn}</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-100 overflow-hidden font-sans">
      
      {/* PANE 1: TOPICS */}
      <div className={`bg-white border-r border-slate-200 flex flex-col shrink-0 transition-all duration-300 ${isPane1Collapsed ? 'w-16' : 'w-72'}`}>
        <div className={`p-6 border-b flex items-center ${isPane1Collapsed ? 'justify-center' : 'justify-between'}`}>
          {!isPane1Collapsed && (
            <button onClick={() => { if(!isSaved && !window.confirm(t.unsaved_warning)) return; setSetupMode(null); }} className="text-[14px] font-black text-indigo-600 uppercase hover:underline">← {t.change_mode}</button>
          )}
          <button onClick={() => setIsPane1Collapsed(!isPane1Collapsed)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
            {isPane1Collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>
        <div className={`flex-1 overflow-y-auto custom-scrollbar transition-opacity duration-200 ${isPane1Collapsed ? 'opacity-0 invisible' : 'opacity-100 p-4 space-y-6'}`}>
          {!isPane1Collapsed && (
            <>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 text-slate-400" size={16} />
                <input type="text" placeholder={t.search_placeholder} className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              {Object.values(SKILL_BUCKETS).map(cat => (
                <div key={cat.id}>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-2">{cat.name[lang]}</h3>
                  <div className="space-y-1">
                    {Object.entries(cat.topics).map(([id, data]) => (
                      <button key={id} onClick={() => setSelectedTopicId(id)} className={`w-full text-left px-4 py-2.5 text-sm rounded-xl transition-all ${selectedTopicId === id ? 'bg-slate-900 text-white font-bold shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}>{data.name[lang]}</button>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* PANE 2: VARIATIONS */}
      <div className="w-[340px] bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 border-b bg-white shrink-0"><h1 className="text-lg font-black text-slate-900 uppercase italic truncate">{currentTopic?.name[lang]}</h1></div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {currentTopic?.variations.map(v => (
                <div key={v.key} onClick={() => triggerPreview(v.key)} className={`p-5 rounded-3xl border-2 transition-all bg-white ${activePreviewKey === v.key ? 'border-indigo-500 shadow-xl' : 'border-transparent shadow-sm hover:border-slate-200 cursor-pointer'}`}>
                    <h4 className="font-bold text-sm mb-1">{v.name[lang]}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mb-4">{v.desc[lang]}</p>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-slate-100 rounded-lg p-1">
                            <button onClick={(e) => { e.stopPropagation(); setPendingQuantity(Math.max(1, pendingQuantity - 1)); }} className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-colors"><Minus size={12}/></button>
                            <span className="w-8 text-center text-xs font-bold">{pendingQuantity}</span>
                            <button onClick={(e) => { e.stopPropagation(); setPendingQuantity(pendingQuantity + 1); }} className="w-6 h-6 flex items-center justify-center hover:bg-white rounded transition-colors"><Plus size={12}/></button>
                        </div>
                        <button disabled={isPreviewLoading} onClick={(e) => { e.stopPropagation(); addToPacket(v, pendingQuantity); }} className={`flex-1 py-2 text-white rounded-lg text-[10px] font-black uppercase transition-all disabled:opacity-50 ${setupMode === 'donow' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                            {isPreviewLoading ? '...' : `Lägg till ${pendingQuantity} st`}
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* PANE 3: CANVAS */}
      <div className="flex-1 bg-slate-200 p-6 flex flex-col overflow-hidden relative">
        <div className="flex flex-col items-center mb-6 gap-2">
            <div className="flex items-center gap-4">
                <div className="bg-white p-1 rounded-2xl shadow-xl flex gap-1 border border-slate-300">
                    <button onClick={() => setCanvasMode('studio')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all ${canvasMode === 'studio' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><Zap size={14}/> Studio</button>
                    {setupMode === 'worksheet' && <button onClick={() => setCanvasMode('layout')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all ${canvasMode === 'layout' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}><Eye size={14}/> Layout</button>}
                </div>
                {canvasMode === 'layout' && <button onClick={() => setShowWorkArea(!showWorkArea)} className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all text-[10px] font-black uppercase shadow-lg ${showWorkArea ? 'bg-white border-indigo-600 text-indigo-600' : 'bg-slate-800 border-slate-800 text-white'}`}><Square size={14} fill={showWorkArea ? "currentColor" : "none"} /> {showWorkArea ? t.spacious : t.compact}</button>}
            </div>
        </div>

        {canvasMode === 'studio' ? (
            <div className="flex-1 bg-white rounded-[2.5rem] shadow-2xl border border-slate-300 overflow-hidden flex flex-col mx-auto w-full max-w-2xl">
                <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{t.board_label}</span>
                    {activePreviewKey && <button onClick={() => triggerPreview(activePreviewKey)} className="text-[10px] bg-white/10 px-3 py-1 rounded-full font-bold flex items-center gap-2"><RefreshCcw size={12}/> {t.new_example}</button>}
                </div>
                <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
                    {isPreviewLoading ? <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div> 
                    : !previewData ? <div className="h-full flex items-center justify-center text-slate-200 uppercase font-black tracking-widest">{t.select_hint}</div>
                    : <div className="w-full space-y-8 py-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="w-full flex justify-center">{renderVisual(previewData)}</div>
                        <div className="text-xl text-slate-800 font-bold text-center px-6 leading-relaxed"><MathDisplay content={previewData.renderData.description} /></div>
                        {previewData.renderData.latex && <div className="text-2xl text-indigo-600 bg-indigo-50 p-6 rounded-3xl border border-indigo-100 shadow-inner text-center"><MathDisplay content={`$$${previewData.renderData.latex}$$`} /></div>}
                      </div>}
                </div>
            </div>
        ) : (
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-20">
                <div className="bg-white shadow-2xl w-[210mm] min-h-[297mm] mx-auto p-[15mm] flex flex-col animate-in slide-in-from-bottom-4">
                    <header className="border-b-2 border-black pb-1 mb-3 flex items-end justify-between">
                        <h1 className="text-[14px] font-bold uppercase tracking-tight w-1/3 truncate">{sheetTitle || "Matematik"}</h1>
                        <div className="flex gap-4 w-2/3 justify-end text-[12px] font-medium">
                            <div className="border-b border-black pb-0 flex gap-2 flex-1 max-w-[180px]"><span>{t.name_label}</span><div className="flex-1" /></div>
                            <div className="border-b border-black pb-0 flex gap-2 w-[100px]"><span>{t.date_label}</span><div className="flex-1" /></div>
                        </div>
                    </header>
                    <div className={`grid grid-cols-6 gap-x-8 ${showWorkArea ? 'gap-y-4' : 'gap-y-1'} items-start content-start`}>
                        {packet.map((item, idx) => (
                            <React.Fragment key={item.id}>
                                {!item.hideInstruction && (
                                    <div className={`col-span-6 border-l-4 border-indigo-500 pl-3 bg-slate-50/50 rounded-r-lg ${showWorkArea ? 'py-1 mt-4 mb-1' : 'py-0.5 mt-1 mb-0'}`}>
                                        <div className="text-[11px] font-bold text-slate-800 italic"><MathDisplay content={item.resolvedData?.renderData.description || item.name} /></div>
                                    </div>
                                )}
                                <div className={`relative group border border-transparent hover:border-dashed hover:border-indigo-300 transition-all flex flex-col h-full ${getColSpanClass(item.columnSpan)} ${showWorkArea ? 'p-4' : 'px-4 py-0.5'}`}>
                                    <div className="absolute -top-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 z-10 transition-opacity gap-2">
                                        <button onClick={() => updatePacketItem(item.id, 'columnSpan', 2)} className="bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg italic">1/3</button>
                                        <button onClick={() => regenerateItem(item.id, item.topicId, item.variationKey)} className="bg-amber-500 text-white px-3 py-1 rounded-full text-[9px] font-black shadow-lg"><Shuffle size={10} /></button>
                                        <button onClick={() => updatePacketItem(item.id, 'hideInstruction', !item.hideInstruction)} className={`px-3 py-1 rounded-full text-[9px] font-black shadow-lg ${item.hideInstruction ? 'bg-slate-800 text-white' : 'bg-emerald-50 text-white'}`}><Type size={10} /></button>
                                        <button onClick={() => setPacket(packet.filter(p => p.id !== item.id))} className="bg-rose-500 text-white px-3 py-1 rounded-full text-[9px] font-black shadow-lg hover:bg-rose-600 hover:scale-110"><Trash2 size={10} /></button>
                                    </div>
                                    <div className="text-sm flex flex-col h-full">
                                        <div className="font-bold mb-0.5 text-slate-300 text-[10px]">{idx + 1}.</div>
                                        {item.resolvedData?.renderData.latex && (<div className={`${showWorkArea ? 'py-2' : 'py-0.5'} text-center`}><MathDisplay content={`$$${item.resolvedData.renderData.latex}$$`} /></div>)}
                                        <div className="flex justify-center scale-90 origin-top">{renderVisual(item.resolvedData)}</div>
                                        <div className="mt-auto">{showWorkArea ? <div className="min-h-[80px] border-b border-dashed border-slate-200" /> : <div className="h-0 border-b border-transparent" />}</div>
                                    </div>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* PANE 4: CART & SETTINGS */}
      <div className="w-72 bg-white border-l border-slate-200 flex flex-col shadow-2xl shrink-0">
        <div className="p-6 border-b flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2"><h2 className="text-xs font-black uppercase italic text-slate-400">{t.selected_questions}</h2><div className="bg-slate-900 text-white px-2 py-0.5 rounded-full text-[10px] font-black">{packet.length}</div></div>
            <button onClick={() => { if(window.confirm(t.clear_all + "?")) setPacket([]); }} className="text-slate-300 hover:text-rose-500 transition-colors flex items-center gap-1 text-[10px] font-black uppercase"><Eraser size={14}/> {t.clear_all}</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {packet.map((item, idx) => (
                <div key={item.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center group animate-in slide-in-from-right-2">
                    <div className="min-w-0"><div className="text-[10px] font-bold text-slate-400 mb-1">{idx + 1}. {item.topicId}</div><div className="text-xs font-bold truncate pr-2">{item.name}</div></div>
                    <button onClick={() => setPacket(packet.filter(p => p.id !== item.id))} className="text-slate-300 hover:text-red-500"><Trash2 size={14}/></button>
                </div>
            ))}
        </div>

        {/* FACIT SETTINGS */}
        {setupMode === 'worksheet' && (
            <div className="p-6 border-t bg-white space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{t.answer_key_toggle}</label>
                    <button onClick={() => setIncludeAnswerKey(!includeAnswerKey)} className={`w-10 h-5 rounded-full transition-all relative ${includeAnswerKey ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${includeAnswerKey ? 'left-6' : 'left-1'}`} />
                    </button>
                </div>
                {includeAnswerKey && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <label className="text-[9px] font-black uppercase text-slate-300 mb-2 block">{t.answer_style_label}</label>
                        <select value={answerKeyStyle} onChange={(e) => setAnswerKeyStyle(e.target.value)} className="w-full bg-slate-100 border-none rounded-xl text-[10px] font-black uppercase px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="compact">{t.style_compact}</option>
                            <option value="detailed">{t.style_detailed}</option>
                        </select>
                    </div>
                )}
            </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="p-6 border-t bg-slate-50 space-y-4">
            <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">{t.title_label}</label>
                <input type="text" className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" value={sheetTitle} onChange={(e) => { setSheetTitle(e.target.value); setIsSaved(false); }} />
            </div>
            
            {/* SAVING ROW */}
            <button onClick={handleSave} disabled={packet.length === 0} className="w-full py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-slate-50 disabled:opacity-50"><Save size={16}/> {t.save_btn}</button>
            
            {/* LAUNCH ROW: Dynamically split based on mode */}
            <div className="grid grid-cols-2 gap-2">
                <button onClick={handleLaunchLive} disabled={packet.length === 0} className="py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 shadow-lg hover:bg-indigo-600 transition-all disabled:opacity-50">
                    <Send size={16}/> {t.live_btn}
                </button>
                
                {setupMode === 'worksheet' ? (
                    <button onClick={handleLaunchPrint} disabled={packet.length === 0} className="py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 shadow-lg hover:bg-emerald-500 transition-all disabled:opacity-50">
                        <Printer size={16}/> {t.publish}
                    </button>
                ) : (
                    <button onClick={handleLaunchLive} disabled={packet.length === 0} className="py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 shadow-lg hover:bg-indigo-500 transition-all disabled:opacity-50">
                        <Grid3X3 size={16}/> {t.create_donow}
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}