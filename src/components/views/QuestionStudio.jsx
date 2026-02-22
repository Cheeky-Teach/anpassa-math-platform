import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronRight, ChevronLeft, Plus, Trash2, Layout, Send, Info, Layers, Search, Zap, 
  FileText, Grid3X3, RefreshCcw, Loader2, Maximize2, AlertTriangle, 
  Minus, Eye, Settings2, Printer, Square, Type, Shuffle, Save, Eraser, Clock,
  PanelLeftClose, PanelLeftOpen, X, Globe, Building2, Lock, Copy, Check, Filter,
  MoreVertical, AlignLeft, LayoutGrid, EyeOff, GripVertical, Brain, Calculator, Target, 
  Image as ImageIcon, FileText as TextIcon
} from 'lucide-react';
import { SKILL_BUCKETS } from '../../constants/skillBuckets.js';
import { GeometryVisual, GraphCanvas, VolumeVisualization } from '../visuals/GeometryComponents.jsx';
import { supabase } from '../../lib/supabaseClient'; 

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

const BackgroundWave = () => (
    <div className="fixed bottom-0 left-0 w-full leading-[0] pointer-events-none z-[-1] overflow-hidden opacity-40">
        <svg className="relative block w-full h-[300px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,2,1200,1.13V120H0Z" className="fill-emerald-100"></path>
        </svg>
    </div>
);

export default function QuestionStudio({ 
    profile,
    onDoNowGenerate, 
    onWorksheetGenerate, 
    onClose, 
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
  const t = {
    sv: {
      studio: "Studio", library_title: "Bibliotek", donow_title: "Do Now Grid", worksheet_title: "Arbetsblad",
      change_mode: "Byt läge", search_placeholder: "Sök område...", board_label: "Tavlan", new_example: "Nytt exempel",
      select_hint: "Välj en variant för att förhandsgranska", selected_questions: "Valda frågor", clear_all: "Rensa",
      create_donow: "Grid", publish: "Skriv ut", title_placeholder: "Namnge ditt arbete...",
      save_success: "Sparad!", unsaved_warning: "Du har osparade ändringar. Fortsätt ändå?",
      width_label: "Bredd", work_area_toggle: "Arbetsyta", section_label: "Instruktion:",
      regenerate: "Slumpa ny", load_btn: "Öppna", delete_confirm: "Radera permanent?",
      compact: "Kompakt", spacious: "Gott om plats",
      answer_key_toggle: "Inkludera facit", answer_style_label: "Facit stil",
      style_compact: "Bara svar", style_detailed: "Steg",
      delete_task: "Radera", name_label: "Namn:", date_label: "Datum:",
      save_btn: "Spara", live_btn: "Live", btn_close: "Stäng",
      visibility_label: "Delning", vis_private: "Privat", vis_school: "Skola", vis_public: "Global",
      tab_mine: "Mina sparade", tab_school: "Min Skola", tab_global: "Globalt",
      clone_btn: "Kopiera", clone_success: "Kopierad!", peek_title: "Snabbkoll",
      mode_header: "Som rubrik", mode_inline: "Inuti kortet", mode_hidden: "Dölj text",
      hide_extra: "Dölj Begrepp & Flerval", type_calc: "Räkna", type_concept: "Begrepp", type_logic: "Felsök", type_visual: "Bild", type_text: "Räkna"
    },
    en: {
      studio: "Studio", library_title: "Library", donow_title: "Do Now Grid", worksheet_title: "Worksheet",
      change_mode: "Change mode", search_placeholder: "Search topics...", board_label: "The Board", new_example: "New Example",
      select_hint: "Select a variation to preview", selected_questions: "Questions", clear_all: "Clear",
      create_donow: "Grid", publish: "Print", title_placeholder: "Enter title...",
      save_success: "Saved!", unsaved_warning: "Unsaved work! Proceed anyway?",
      width_label: "Width", work_area_toggle: "Work Area", section_label: "Instruction:",
      regenerate: "Randomize new", load_btn: "Open", delete_confirm: "Delete permanently?",
      compact: "Compact", spacious: "Spacious",
      answer_key_toggle: "Include answer key", answer_style_label: "Style",
      style_compact: "Answers", style_detailed: "Steps",
      delete_task: "Delete task", name_label: "Name:", date_label: "Date:",
      save_btn: "Save", live_btn: "Live", btn_close: "Close",
      visibility_label: "Sharing", vis_private: "Private", vis_school: "School", vis_public: "Global",
      tab_mine: "My Saved", tab_school: "School", tab_global: "Global",
      clone_btn: "Clone", clone_success: "Cloned!", peek_title: "Quick Peek",
      mode_header: "As Header", mode_inline: "Inside Card", mode_hidden: "Hide Text",
      hide_extra: "Hide Concepts & MCQ", type_calc: "Calculate", type_concept: "Concept", type_logic: "Logic", type_visual: "Image", type_text: "Text"
    }
  }[lang];

  // --- STATE ---
  const [isPane1Collapsed, setIsPane1Collapsed] = useState(false); 
  const [setupMode, setSetupMode] = useState(studioMode); 
  const [activeSheetId, setActiveSheetId] = useState(null); 
  const [savedSheets, setSavedSheets] = useState([]);
  const [libraryTab, setLibraryTab] = useState('private'); 
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
  const [chosenVisibility, setChosenVisibility] = useState('private');
  const [peekSheet, setPeekSheet] = useState(null);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [filterTopic, setFilterTopic] = useState('all');

  // --- NEW: FILTER STATE ---
  const [hideExtra, setHideExtra] = useState(false);

  // --- EFFECTS ---
  useEffect(() => { 
    if (!setupMode) fetchLibrary(); 
    setIsSaved(true); 
  }, [setupMode, libraryTab]);

  useEffect(() => { if (currentTopic?.variations?.[0]) triggerPreview(currentTopic.variations[0].key); }, [selectedTopicId]);
  useEffect(() => { setInitialPacket(packet); }, [packet]);
  useEffect(() => { setStudioMode(setupMode); }, [setupMode]);

  // --- DRAG AND DROP ---
  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    const newPacket = [...packet];
    const draggedItem = newPacket[draggedIdx];
    newPacket.splice(draggedIdx, 1);
    newPacket.splice(index, 0, draggedItem);
    setDraggedIdx(index);
    setPacket(newPacket);
    setIsSaved(false);
  };

  const handleDragEnd = () => setDraggedIdx(null);

  // --- RENDERING HELPERS ---
  const renderOptions = (options, inline = false) => {
    if (!options || options.length === 0) return null;
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
    return (
        <div className={`mt-4 grid grid-cols-2 gap-2 w-full max-w-md mx-auto ${inline ? 'px-4' : ''}`}>
            {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] bg-slate-50 border border-slate-100 p-2 rounded-lg">
                    <span className="font-black text-indigo-600">{labels[i]}</span>
                    <MathDisplay content={opt} />
                </div>
            ))}
        </div>
    );
  };

  const renderVisual = (data) => {
    if (!data?.renderData) return null;
    const rd = data.renderData;
    if (rd.graph) return <GraphCanvas data={rd.graph} />;
    if (rd.geometry) {
        if (['cylinder', 'cuboid', 'sphere', 'cone', 'pyramid'].includes(rd.geometry.type)) {
            return <VolumeVisualization data={rd.geometry} width={250} height={200} />;
        }
        return <GeometryVisual data={rd.geometry} />;
    }
    return null;
  };

  // --- NEW: CATEGORIZATION & SORTING HELPERS ---
  const getVariationCategory = (key) => {
    const k = key.toLowerCase();
    // Prioritize Visual check for "Bild" badge
    const isVisual = ['graph', 'plot', 'geom', 'volume', 'shape', 'area', 'perimeter', 'angle', 'pattern', 'table', 'marbles', 'spinner', 'tree'].some(kw => k.includes(kw));
    if (isVisual) return 'visual';
    if (['calc', 'std', 'solve'].some(kw => k.includes(kw))) return 'calculate';
    if (['concept', 'theory', 'foundations', 'id', 'inverse'].some(kw => k.includes(kw))) return 'conceptual';
    if (['lie', 'spot', 'error', 'check'].some(kw => k.includes(kw))) return 'logic';
    return 'default'; // results in "Text" badge
  };

  const getCategoryStyles = (type) => {
    const styles = {
        visual: { border: 'border-indigo-200', bg: 'bg-indigo-50/20', text: 'text-indigo-700', icon: <ImageIcon size={10} />, label: t.type_visual },
        calculate: { border: 'border-emerald-200', bg: 'bg-emerald-50/20', text: 'text-emerald-700', icon: <Calculator size={10} />, label: t.type_calc },
        conceptual: { border: 'border-amber-200', bg: 'bg-amber-50/20', text: 'text-amber-700', icon: <Brain size={10} />, label: t.type_concept },
        logic: { border: 'border-rose-200', bg: 'bg-rose-50/20', text: 'text-rose-700', icon: <Target size={10} />, label: t.type_logic },
        default: { border: 'border-slate-200', bg: 'bg-slate-50/20', text: 'text-slate-500', icon: <TextIcon size={10} />, label: t.type_text }
    };
    return styles[type] || styles.default;
  };

  const getDifficultyScore = (key) => {
    const k = key.toLowerCase();
    if (k.includes('basic') || k.includes('foundations') || k.includes('onestep') || k.includes('intro')) return 1;
    if (k.includes('complex') || k.includes('twostep') || k.includes('twoterm')) return 3;
    if (k.includes('powers') || k.includes('chain') || k.includes('advanced')) return 4;
    return 2; 
  };

  // --- LIBRARY & STORAGE ---
  const fetchLibrary = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setIsLibraryLoading(true);
    try {
        let query = supabase.from('saved_sheets').select('*').order('updated_at', { ascending: false });
        if (libraryTab === 'private') query = query.eq('user_id', user.id);
        else if (libraryTab === 'school') query = query.eq('visibility', 'school').eq('school_name', profile?.school_name);
        else query = query.eq('visibility', 'public');
        const { data, error } = await query;
        if (error) throw error;
        setSavedSheets(data || []);
    } catch (err) { console.error(err); }
    finally { setIsLibraryLoading(false); }
  };

  const handleSave = async () => {
      if (!sheetTitle) { alert(t.title_placeholder); return; }
      try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          const uniqueTopics = [...new Set(packet.map(q => q.topicId))];
          const uniqueLevels = [...new Set(packet.map(q => q.resolvedData?.level || 1))];
          const sheetData = { 
              user_id: user.id, title: sheetTitle, type: setupMode, packet: packet, 
              config: { showWorkArea, lang, includeAnswerKey, answerKeyStyle }, 
              updated_at: new Date().toISOString(), visibility: chosenVisibility,
              school_name: profile?.school_name || null, auto_topics: uniqueTopics, auto_levels: uniqueLevels
          };
          const { data, error } = activeSheetId 
              ? await supabase.from('saved_sheets').update(sheetData).eq('id', activeSheetId).select().single()
              : await supabase.from('saved_sheets').insert([sheetData]).select().single();
          if (error) throw error;
          setActiveSheetId(data.id); setIsSaved(true); alert(t.save_success); fetchLibrary(); 
      } catch (err) { alert("Fel vid sparande."); }
  };

  const handleClone = async (sheetId) => {
    const { data: { user } } = await supabase.auth.getUser();
    try {
        const { error } = await supabase.rpc('clone_worksheet', { target_id: sheetId, new_user_id: user.id });
        if (error) throw error;
        alert(t.clone_success);
        setLibraryTab('private');
        fetchLibrary();
    } catch (err) { alert("Kunde inte kopiera."); }
  };

  const loadSheet = (sheet) => {
      setPacket(sheet.packet); setSheetTitle(sheet.title); setSetupMode(sheet.type); setActiveSheetId(sheet.id); 
      setChosenVisibility(sheet.visibility || 'private'); setIsSaved(true);
      if (sheet.config?.includeAnswerKey !== undefined) setIncludeAnswerKey(sheet.config.includeAnswerKey);
      if (sheet.config?.answerKeyStyle !== undefined) setAnswerKeyStyle(sheet.config.answerKeyStyle);
      if (sheet.config?.showWorkArea !== undefined) setShowWorkArea(sheet.config.showWorkArea);
  };

  const handleLaunchGrid = () => { if (!isSaved && !window.confirm(t.unsaved_warning)) return; onDoNowGenerate({ title: sheetTitle }, packet); };
  const handleLaunchPrint = () => { if (!isSaved && !window.confirm(t.unsaved_warning)) return; onWorksheetGenerate(packet); };
  
  const handleLaunchLive = async () => {
    if (!isSaved && !window.confirm(t.unsaved_warning)) return;
    const { data: { user } } = await supabase.auth.getUser();
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
        const { data, error } = await supabase.from('rooms').insert([{ 
            teacher_id: user.id, 
            class_code: code, 
            status: 'active', 
            title: sheetTitle || "Live Session", 
            active_worksheet_id: activeSheetId, 
            active_question_data: { packet: packet, mode: setupMode } 
        }]).select().single();
        
        if (error) throw error;
        onDoNowGenerate(null, null, { room: data, packet: packet }); 
    } catch (err) { alert("Systemfel: " + err.message); }
  };

  const triggerPreview = async (variationKey) => {
    setIsPreviewLoading(true); setActivePreviewKey(variationKey);
    try {
        const res = await fetch(`/api/question?topic=${selectedTopicId}&variation=${variationKey}&lang=${lang}`);
        const data = await res.json(); setPreviewData(data);
    } catch (err) { console.error(err); } finally { setIsPreviewLoading(false); }
  };

  const addToPacket = async (variation, qty) => {
    setIsPreviewLoading(true); setIsSaved(false);
    try {
        const newItems = [];
        for (let i = 0; i < qty; i++) {
            const res = await fetch(`/api/question?topic=${selectedTopicId}&variation=${variation.key}&lang=${lang}`);
            const data = await res.json();
            const isFirstInBatch = i === 0;
            
            newItems.push({ 
                id: crypto.randomUUID(), 
                topicId: selectedTopicId, 
                variationKey: variation.key, 
                name: variation.name[lang] || variation.name.sv, 
                columnSpan: isFirstInBatch ? 6 : 2, 
                resolvedData: data, 
                instructionMode: isFirstInBatch ? 'header' : 'hidden' 
            });
        }
        if (setupMode === 'donow' && packet.length + newItems.length > 6) { alert("Do Now max 6."); return; }
        setPacket(prev => [...prev, ...newItems]); setPendingQuantity(1);
    } catch (err) { alert(err.message); } finally { setIsPreviewLoading(false); }
  };

  const regenerateItem = async (id, topicId, variationKey) => {
    try {
        const res = await fetch(`/api/question?topic=${topicId}&variation=${variationKey}&lang=${lang}`);
        const data = await res.json();
        setPacket(prev => prev.map(item => item.id === id ? { ...item, resolvedData: data } : item)); setIsSaved(false);
    } catch (err) { console.error(err); }
  };

  const updatePacketItem = (id, key, val) => { setPacket(packet.map(p => p.id === id ? { ...p, [key]: val } : p)); setIsSaved(false); };
  const deleteSheet = async (e, id) => {
    e.stopPropagation(); if (!window.confirm(t.delete_confirm)) return;
    try {
        const { error } = await supabase.from('saved_sheets').delete().eq('id', id);
        if (error) throw error;
        setSavedSheets(savedSheets.filter(s => s.id !== id));
    } catch (err) { alert("Kunde inte radera."); }
  };

  const allTopics = Object.values(SKILL_BUCKETS).flatMap(cat => Object.entries(cat.topics).map(([id, data]) => ({ id, categoryName: cat.name[lang], categoryId: cat.id, ...data })));
  const currentTopic = allTopics.find(tp => tp.id === selectedTopicId) || allTopics[0];
  const getColSpanClass = (span) => ({ 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4', 6: 'col-span-6' }[span] || 'col-span-6');
  const filteredLibrary = savedSheets.filter(sheet => sheet.title.toLowerCase().includes(searchTerm.toLowerCase()) && (filterTopic === 'all' || sheet.auto_topics?.includes(filterTopic)));
  const availableTopics = [...new Set(savedSheets.flatMap(s => s.auto_topics || []))];

  // AGGRESSIVE FILTERING & SORTING
  const visibleVariations = (currentTopic?.variations || [])
    .filter(v => {
      if (!hideExtra) return true;
      const k = v.key.toLowerCase();
      // Aggressive check for MCQ or Conceptual items
      const isMCQ = ['lie', 'spot', 'choice', 'mcq', 'check', 'select', 'which', 'error', 'inverse', 'begrepp'].some(kw => k.includes(kw));
      const isConcept = ['concept', 'theory', 'foundations', 'id'].some(kw => k.includes(kw));
      return !isMCQ && !isConcept;
    })
    .sort((a, b) => getDifficultyScore(a.key) - getDifficultyScore(b.key));

  if (!setupMode) {
    return (
      <div className="flex-1 bg-slate-50 flex flex-col p-12 overflow-y-auto relative custom-scrollbar">
        <button onClick={onClose} className="absolute top-8 right-8 p-3 bg-slate-900 text-white hover:bg-rose-600 rounded-2xl shadow-xl transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest z-50"><X size={18}/> {t.btn_close}</button>
        <div className="max-w-6xl w-full mx-auto space-y-12 relative z-10">
            <div className="text-center">
                <h2 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic mb-8">{t.studio}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <button onClick={() => { setSetupMode('donow'); setPacket([]); setSheetTitle(""); setActiveSheetId(null); }} className="group p-10 bg-white border-2 border-slate-100 rounded-[3rem] hover:border-indigo-600 transition-all text-left shadow-sm hover:shadow-xl active:scale-[0.98]"><Grid3X3 size={40} className="text-indigo-600 mb-6" /><h3 className="text-3xl font-black text-slate-800 uppercase leading-none mb-2">{t.donow_title}</h3><p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Digital Grid för tavlan</p></button>
                    <button onClick={() => { setSetupMode('worksheet'); setPacket([]); setSheetTitle(""); setActiveSheetId(null); }} className="group p-10 bg-white border-2 border-slate-100 rounded-[3rem] hover:border-emerald-600 transition-all text-left shadow-sm hover:shadow-xl active:scale-[0.98]"><FileText size={40} className="text-emerald-600 mb-6" /><h3 className="text-3xl font-black text-slate-800 uppercase leading-none mb-2">{t.worksheet_title}</h3><p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Klassiska pappersblad</p></button>
                </div>
            </div>
            <div className="bg-white rounded-[3rem] shadow-xl border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
                <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/50">
                    <div className="flex gap-2 p-1 bg-slate-200/50 rounded-2xl">
                        <button onClick={() => setLibraryTab('private')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all ${libraryTab === 'private' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>{t.tab_mine}</button>
                        <button onClick={() => setLibraryTab('school')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all ${libraryTab === 'school' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>{t.tab_school}</button>
                        <button onClick={() => setLibraryTab('public')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all ${libraryTab === 'public' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>{t.tab_global}</button>
                    </div>
                    <div className="flex gap-3 items-center">
                        <div className="relative"><Search className="absolute left-3 top-2.5 text-slate-400" size={14} /><input type="text" placeholder="Sök..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none w-40" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                        <select value={filterTopic} onChange={(e) => setFilterTopic(e.target.value)} className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase outline-none"><option value="all">Alla Områden</option>{availableTopics.map(topic => <option key={topic} value={topic}>{topic}</option>)}</select>
                    </div>
                </div>
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead><tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest"><th className="p-6">Titel</th><th className="p-6">Innehåll</th><th className="p-6 text-center">Uppgifter</th><th className="p-6 text-center">Senast ändrad</th><th className="p-6 text-right">Åtgärder</th></tr></thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredLibrary.map(sheet => (
                                <tr key={sheet.id} className="hover:bg-indigo-50/30 transition-colors group">
                                    <td className="p-6 font-bold text-slate-700">{sheet.title}</td>
                                    <td className="p-6"><div className="flex flex-wrap gap-1">{sheet.auto_topics?.slice(0, 2).map(tag => (<span key={tag} className="text-[8px] font-black uppercase tracking-widest bg-slate-100 text-slate-400 px-2 py-0.5 rounded-md">{tag}</span>))}{sheet.auto_topics?.length > 2 && <span className="text-[8px] font-black text-slate-300">+{sheet.auto_topics.length - 2}</span>}</div></td>
                                    <td className="p-6 text-center font-bold text-slate-400 text-sm">{sheet.packet?.length || 0}</td>
                                    <td className="p-6 text-center font-medium text-slate-400 text-xs">{new Date(sheet.updated_at).toLocaleDateString()}</td>
                                    <td className="p-6 text-right">
                                        <div className="flex justify-end gap-2 items-center">
                                            <button onClick={() => setPeekSheet(sheet)} title={t.peek_title} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><Maximize2 size={18}/></button>
                                            {libraryTab === 'private' ? (<><button onClick={() => loadSheet(sheet)} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors">{t.load_btn}</button><button onClick={(e) => deleteSheet(e, sheet.id)} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18}/></button></>) : (<button onClick={() => handleClone(sheet.id)} className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2"><Copy size={14}/> {t.clone_btn}</button>)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <BackgroundWave /> 
        {peekSheet && (
            <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/40 backdrop-blur-sm">
                <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                    <div className="p-8 border-b flex justify-between items-center bg-slate-900 text-white"><div><h3 className="text-xl font-black uppercase italic tracking-tighter leading-none">{peekSheet.title}</h3><p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">{peekSheet.packet?.length || 0} Uppgifter</p></div><button onClick={() => setPeekSheet(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button></div>
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                        {peekSheet.packet.map((q, i) => (
                            <div key={i} className="border-b border-slate-100 pb-8 last:border-0"><div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Uppgift {i+1}</div><div className="flex justify-center mb-4 scale-75 origin-top">{renderVisual(q.resolvedData)}</div><div className="text-sm font-bold text-slate-700 leading-relaxed"><MathDisplay content={q.resolvedData?.renderData?.description} /></div>{q.resolvedData?.renderData?.latex && <div className="mt-4 p-4 bg-slate-50 rounded-2xl text-center font-serif"><MathDisplay content={`$$${q.resolvedData.renderData.latex}$$`} /></div>}{renderOptions(q.resolvedData?.renderData?.options)}</div>
                        ))}
                    </div>
                    <div className="p-8 border-t bg-slate-50">{libraryTab === 'private' ? (<button onClick={() => { loadSheet(peekSheet); setPeekSheet(null); }} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all">Redigera detta blad</button>) : (<button onClick={() => { handleClone(peekSheet.id); setPeekSheet(null); }} className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"><Copy size={20}/> Kopiera till mitt arkiv</button>)}</div>
                </div>
            </div>
        )}
      </div>
    );
  }

  // --- MAIN STUDIO RENDER ---
  return (
    <div className="flex flex-col h-screen bg-slate-200 font-sans overflow-hidden relative">
      <header className="bg-white border-b border-slate-300 px-6 py-3 flex items-center justify-between shadow-md z-50">
        <div className="flex items-center gap-4 flex-1">
          <button onClick={() => { if(!isSaved && !window.confirm(t.unsaved_warning)) return; setSetupMode(null); }} className="text-[11px] font-black text-indigo-600 uppercase hover:underline flex items-center gap-1 shrink-0"><ChevronLeft size={16}/> {t.change_mode}</button>
          <div className="h-6 w-px bg-slate-200 mx-2"></div>
          <div className="relative group flex-1 max-w-md"><input type="text" className="w-full bg-slate-50 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-tight outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all border border-transparent group-hover:border-slate-200" placeholder={t.title_placeholder} value={sheetTitle} onChange={(e) => { setSheetTitle(e.target.value); setIsSaved(false); }} /></div>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button onClick={() => setChosenVisibility('private')} className={`p-2 rounded-lg transition-all ${chosenVisibility === 'private' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:bg-white'}`}><Lock size={14}/></button>
            <button onClick={() => setChosenVisibility('school')} className={`p-2 rounded-lg transition-all ${chosenVisibility === 'school' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:bg-white'}`}><Building2 size={14}/></button>
            <button onClick={() => setChosenVisibility('public')} className={`p-2 rounded-lg transition-all ${chosenVisibility === 'public' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:bg-white'}`}><Globe size={14}/></button>
          </div>
        </div>
        <div className="flex items-center gap-3 pl-6">
          <button onClick={handleSave} disabled={packet.length === 0} className="px-6 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-indigo-50 transition-all disabled:opacity-30"><Save size={16}/> {t.save_btn}</button>
          <div className="h-6 w-px bg-slate-200 mx-1"></div>
          <button onClick={handleLaunchLive} disabled={packet.length === 0} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-indigo-600 transition-all disabled:opacity-30"><Send size={16}/> {t.live_btn}</button>
          {setupMode === 'worksheet' ? (<button onClick={handleLaunchPrint} disabled={packet.length === 0} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-emerald-500 shadow-lg transition-all disabled:opacity-30"><Printer size={16}/> {t.publish}</button>) : (<button onClick={handleLaunchGrid} disabled={packet.length === 0} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-indigo-500 shadow-lg transition-all disabled:opacity-30"><Grid3X3 size={16}/> {t.create_donow}</button>)}
          <div className="h-6 w-px bg-slate-200 mx-1"></div>
          <button onClick={onClose} className="p-2.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all"><X size={20}/></button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-10">
        <div className={`bg-white border-r border-slate-300 flex flex-col shrink-0 transition-all duration-300 ${isPane1Collapsed ? 'w-16' : 'w-72'}`}>
          <div className={`p-4 border-b flex items-center ${isPane1Collapsed ? 'justify-center' : 'justify-end'}`}><button onClick={() => setIsPane1Collapsed(!isPane1Collapsed)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">{isPane1Collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}</button></div>
          <div className={`flex-1 overflow-y-auto custom-scrollbar transition-opacity duration-200 ${isPane1Collapsed ? 'opacity-0 invisible' : 'opacity-100 p-4 space-y-6'}`}>
            {!isPane1Collapsed && (<><div className="relative mb-4"><Search className="absolute left-3 top-3 text-slate-400" size={16} /><input type="text" placeholder={t.search_placeholder} className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>{Object.values(SKILL_BUCKETS).map(cat => (<div key={cat.id}><h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-2">{cat.name[lang]}</h3><div className="space-y-1">{Object.entries(cat.topics).map(([id, data]) => (<button key={id} onClick={() => setSelectedTopicId(id)} className={`w-full text-left px-4 py-2.5 text-sm rounded-xl transition-all ${selectedTopicId === id ? 'bg-slate-900 text-white font-bold shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}>{data.name[lang]}</button>))}</div></div>))}</>)}
          </div>
        </div>

        {/* PANE 2: REFACTORED VARIATIONS LIST */}
        <div className="w-[340px] bg-slate-50/80 backdrop-blur-sm border-r border-slate-300 flex flex-col shrink-0">
          <div className="p-6 border-b bg-white shrink-0 shadow-sm space-y-4">
              <h1 className="text-lg font-black text-slate-900 uppercase italic truncate leading-none">{currentTopic?.name[lang]}</h1>
              {/* Aggressive Conceptual/MCQ Filter Toggle */}
              <div className="flex items-center justify-between bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-inner">
                  <span className="text-[9px] font-black uppercase text-slate-500 ml-2 tracking-tighter">{t.hide_extra}</span>
                  <button 
                      onClick={() => setHideExtra(!hideExtra)} 
                      className={`w-10 h-5 rounded-full transition-all relative p-1 ${hideExtra ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                      <div className={`w-3 h-3 bg-white rounded-full transition-all shadow-sm ${hideExtra ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
              </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {visibleVariations.map(v => {
                  const cat = getVariationCategory(v.key);
                  const styles = getCategoryStyles(cat);
                  const isPreviewed = activePreviewKey === v.key;

                  return (
                    <div 
                        key={v.key} 
                        onClick={() => triggerPreview(v.key)} 
                        className={`group p-5 rounded-[2rem] border-2 transition-all bg-white relative overflow-hidden
                            ${isPreviewed ? 'border-indigo-500 shadow-xl ring-4 ring-indigo-500/5' : 'border-transparent shadow-sm hover:border-slate-200 cursor-pointer'}
                        `}
                    >
                        <div className={`absolute top-0 left-0 bottom-0 w-1 ${styles.bg.replace('/20', '')}`} />

                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-black text-xs uppercase tracking-tight text-slate-800 leading-tight pr-4">{v.name[lang]}</h4>
                            {/* Color Coded Descriptive Badges */}
                            <div className={`shrink-0 px-2 py-0.5 rounded-md border ${styles.border} ${styles.bg} ${styles.text} text-[8px] font-black uppercase flex items-center gap-1`}>
                                {styles.icon} {styles.label}
                            </div>
                        </div>
                        
                        <p className="text-[10px] font-medium text-slate-400 line-clamp-2 mb-4 italic leading-relaxed">{v.desc[lang]}</p>
                        
                        <div className="flex items-center gap-2">
                            <div className="flex items-center bg-slate-100 rounded-xl p-1">
                                <button onClick={(e) => { e.stopPropagation(); setPendingQuantity(Math.max(1, pendingQuantity - 1)); }} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all text-slate-400 hover:text-indigo-600"><Minus size={12}/></button>
                                <span className="w-8 text-center text-xs font-black text-slate-700">{pendingQuantity}</span>
                                <button onClick={(e) => { e.stopPropagation(); setPendingQuantity(pendingQuantity + 1); }} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all text-slate-400 hover:text-indigo-600"><Plus size={12}/></button>
                            </div>
                            <button 
                                disabled={isPreviewLoading} 
                                onClick={(e) => { e.stopPropagation(); addToPacket(v, pendingQuantity); }} 
                                className={`flex-1 py-3 text-white rounded-xl text-[10px] font-black uppercase transition-all shadow-md active:scale-95 disabled:opacity-50 ${setupMode === 'donow' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                            >
                                {isPreviewLoading && isPreviewed ? '...' : `Lägg till ${pendingQuantity}`}
                            </button>
                        </div>
                    </div>
                  );
              })}
          </div>
        </div>

        <div className="flex-1 p-8 flex flex-col overflow-hidden relative">
          <div className="flex justify-center mb-6 gap-4">
              <div className="bg-white/80 backdrop-blur-md p-1 rounded-2xl shadow-xl flex gap-1 border border-white">
                  <button onClick={() => setCanvasMode('studio')} className={`px-8 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all ${canvasMode === 'studio' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><Zap size={14}/> Studio</button>
                  {setupMode === 'worksheet' && <button onClick={() => setCanvasMode('layout')} className={`px-8 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all ${canvasMode === 'layout' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}><LayoutGrid size={14}/> Layout</button>}
              </div>
              {canvasMode === 'layout' && (<button onClick={() => setShowWorkArea(!showWorkArea)} className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all text-[10px] font-black uppercase shadow-lg ${showWorkArea ? 'bg-white border-indigo-600 text-indigo-600' : 'bg-slate-800 border-slate-800 text-white'}`}><Square size={14} fill={showWorkArea ? "currentColor" : "none"} /> {showWorkArea ? t.spacious : t.compact}</button>)}
          </div>

          {canvasMode === 'studio' ? (
              <div className="flex-1 bg-white rounded-[3rem] shadow-2xl border border-slate-300 overflow-hidden flex flex-col mx-auto w-full max-w-2xl animate-in zoom-in-95 duration-300">
                  <div className="px-8 py-5 bg-slate-900 text-white flex justify-between items-center"><span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{t.board_label}</span>{activePreviewKey && <button onClick={() => triggerPreview(activePreviewKey)} className="text-[10px] bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full font-black uppercase flex items-center gap-2 transition-all"><RefreshCcw size={12}/> {t.new_example}</button>}</div>
                  <div className="p-12 flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center">{isPreviewLoading ? <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={48} /></div> : !previewData ? <div className="h-full flex items-center justify-center text-slate-200 uppercase font-black tracking-widest italic">{t.select_hint}</div> : <div className="w-full space-y-12 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500"><div className="w-full flex justify-center drop-shadow-md">{renderVisual(previewData)}</div><div className="text-2xl text-slate-800 font-bold text-center px-10 leading-relaxed"><MathDisplay content={previewData.renderData.description} /></div>{previewData.renderData.latex && <div className="text-4xl text-indigo-600 bg-indigo-50/50 p-10 rounded-[2.5rem] border-2 border-indigo-100 shadow-inner text-center font-serif"><MathDisplay content={`$$${previewData.renderData.latex}$$`} /></div>}{renderOptions(previewData.renderData?.options)}</div>}</div>
              </div>
          ) : (
              <div className="flex-1 overflow-y-auto custom-scrollbar pb-24">
                  <div className="bg-white shadow-2xl w-[210mm] min-h-[297mm] mx-auto p-[15mm] flex flex-col animate-in slide-in-from-bottom-6">
                      <header className="border-b-2 border-black pb-2 mb-4 flex items-end justify-between"><h1 className="text-lg font-black uppercase tracking-tighter w-1/3 truncate italic leading-none">{sheetTitle || "Matematik"}</h1><div className="flex gap-6 w-2/3 justify-end text-[10px] font-black uppercase tracking-widest"><div className="border-b-2 border-slate-100 pb-1 flex gap-2 flex-1 max-w-[200px]"><span>{t.name_label}</span><div className="flex-1" /></div><div className="border-b-2 border-slate-100 pb-1 flex gap-2 w-[120px]"><span>{t.date_label}</span><div className="flex-1" /></div></div></header>
                      <div className={`grid grid-cols-6 gap-x-8 ${showWorkArea ? 'gap-y-6' : 'gap-y-1'} items-start content-start`}>
                          {packet.map((item, idx) => (
                              <React.Fragment key={item.id}>
                                  {(item.instructionMode === 'header' || !item.instructionMode) && (
                                      <div className={`col-span-6 border-l-4 border-indigo-500 pl-4 bg-slate-50/50 rounded-r-2xl shadow-sm ${showWorkArea ? 'py-3 mt-6 mb-2' : 'py-1 mt-2 mb-0'}`}><div className="text-[11px] font-black text-slate-800 italic uppercase tracking-tight"><MathDisplay content={item.resolvedData?.renderData.description || item.name} /></div></div>
                                  )}
                                  <div draggable onDragStart={(e) => handleDragStart(e, idx)} onDragOver={(e) => handleDragOver(e, idx)} onDragEnd={handleDragEnd} className={`relative group border-2 rounded-2xl transition-all flex flex-col h-full cursor-move ${getColSpanClass(item.columnSpan)} ${showWorkArea ? 'p-4' : 'px-4 py-1'} ${draggedIdx === idx ? 'opacity-20 border-indigo-500 bg-indigo-50 scale-95' : 'border-transparent hover:border-dashed hover:border-indigo-300'}`}>
                                      <div className="absolute top-2 left-2 text-slate-200 opacity-0 group-hover:opacity-100"><GripVertical size={14} /></div>
                                      <div className="absolute -top-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 z-30 transition-all gap-1.5">
                                          <div className="bg-white shadow-2xl rounded-full p-1 flex gap-1 border border-slate-200">
                                            <button onClick={(e) => { e.stopPropagation(); updatePacketItem(item.id, 'columnSpan', item.columnSpan === 2 ? 3 : item.columnSpan === 3 ? 6 : 2); }} className="bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-full italic">W</button>
                                            <button onClick={(e) => { e.stopPropagation(); const modes = ['header', 'inline', 'hidden']; const next = modes[(modes.indexOf(item.instructionMode || 'header') + 1) % 3]; updatePacketItem(item.id, 'instructionMode', next); }} className={`p-1.5 rounded-full transition-all ${item.instructionMode === 'inline' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'}`}><AlignLeft size={12} /></button>
                                            <button onClick={(e) => { e.stopPropagation(); regenerateItem(item.id, item.topicId, item.variationKey); }} className="bg-slate-900 text-white p-1.5 rounded-full hover:bg-indigo-600"><Shuffle size={12} /></button>
                                            <button onClick={(e) => { e.stopPropagation(); setPacket(packet.filter(p => p.id !== item.id)); }} className="bg-rose-500 text-white p-1.5 rounded-full hover:bg-rose-600"><Trash2 size={12} /></button>
                                          </div>
                                      </div>
                                      <div className="text-sm flex flex-col h-full">
                                          <div className="font-black mb-1 text-slate-300 text-[10px] tracking-widest">{idx + 1}.</div>
                                          {item.instructionMode === 'inline' && (<div className="text-[11px] font-bold text-slate-800 mb-2 leading-tight border-b border-slate-100 pb-2"><MathDisplay content={item.resolvedData?.renderData.description || item.name} /></div>)}
                                          {item.resolvedData?.renderData.latex && (<div className={`${showWorkArea ? 'py-4' : 'py-1'} text-center font-serif text-lg`}><MathDisplay content={`$$${item.resolvedData.renderData.latex}$$`} /></div>)}
                                          {renderOptions(item.resolvedData?.renderData?.options, true)}
                                          <div className="flex justify-center scale-90 origin-top mt-2">{renderVisual(item.resolvedData)}</div>
                                          <div className="mt-auto pt-4">{showWorkArea ? <div className="min-h-[100px] border-b-2 border-dotted border-slate-100" /> : <div className="h-0" />}</div>
                                      </div>
                                  </div>
                              </React.Fragment>
                          ))}
                      </div>
                  </div>
              </div>
          )}
        </div>

        <div className={`bg-white/90 backdrop-blur-sm border-l border-slate-300 flex flex-col shadow-2xl shrink-0 w-80 transition-all`}>
          <div className="p-6 border-b flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2"><Layers size={16} className="text-slate-400" /><h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">{t.selected_questions}</h2><div className="bg-slate-900 text-white px-2 py-0.5 rounded-lg text-[10px] font-black">{packet.length}</div></div>
              <button onClick={() => { if(window.confirm(t.clear_all + "?")) setPacket([]); }} className="text-slate-300 hover:text-rose-500 transition-colors flex items-center gap-1 text-[9px] font-black uppercase tracking-widest"><Eraser size={14}/> {t.clear_all}</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/30">
              {packet.map((item, idx) => (
                  <div key={item.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex justify-between items-center group shadow-sm hover:shadow-md transition-all">
                      <div className="min-w-0"><div className="flex items-center gap-2 mb-1"><span className="text-[9px] font-black text-slate-300">#{idx + 1}</span><span className={`w-2 h-2 rounded-full ${item.instructionMode === 'header' ? 'bg-indigo-500' : item.instructionMode === 'inline' ? 'bg-amber-500' : 'bg-slate-200'}`} /></div><div className="text-[11px] font-black text-slate-800 truncate pr-4">{item.name}</div></div>
                      <button onClick={() => setPacket(packet.filter(p => p.id !== item.id))} className="p-1.5 text-slate-200 hover:text-rose-500 rounded-lg transition-all"><Trash2 size={16}/></button>
                  </div>
              ))}
          </div>
          {setupMode === 'worksheet' && (
              <div className="p-6 border-t bg-white space-y-6">
                  <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.answer_key_toggle}</span><button onClick={() => setIncludeAnswerKey(!includeAnswerKey)} className={`w-12 h-6 rounded-full transition-all relative p-1 ${includeAnswerKey ? 'bg-emerald-500' : 'bg-slate-200'}`}><div className={`w-4 h-4 bg-white rounded-full transition-all shadow-sm ${includeAnswerKey ? 'translate-x-6' : 'translate-x-0'}`} /></button></div>
                  {includeAnswerKey && (<div className="animate-in fade-in slide-in-from-bottom-2 space-y-2"><label className="text-[9px] font-black uppercase text-slate-400 block">{t.answer_style_label}</label><div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200"><button onClick={() => setAnswerKeyStyle('compact')} className={`py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${answerKeyStyle === 'compact' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Kompakt</button><button onClick={() => setAnswerKeyStyle('detailed')} className={`py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${answerKeyStyle === 'detailed' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Steg</button></div></div>)}
              </div>
          )}
        </div>
      </div>
      <BackgroundWave /> 
    </div>
  );
}