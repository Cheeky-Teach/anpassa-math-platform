import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronRight, ChevronLeft, Plus, Trash2, Layout, Send, Info, Layers, Search, Zap, 
  FileText, Grid3X3, RefreshCcw, Loader2, Maximize2, AlertTriangle, 
  Minus, Eye, Settings2, Printer, Square, Type, Shuffle, Save, Eraser, Clock,
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, X, Globe, Building2, Lock, Copy, Check, Filter,
  MoreVertical, AlignLeft, LayoutGrid, EyeOff, GripVertical, Brain, Calculator, Target, 
  Image as ImageIcon, FileText as TextIcon, Monitor
} from 'lucide-react';
import { SKILL_BUCKETS } from '../../constants/skillBuckets.js';
import VisualRenderer from '../visuals/VisualRenderer.jsx';
import { supabase } from '../../lib/supabaseClient'; 
import PresentationView from '../views/PresentationView.jsx';

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

// Word problem / Story saver
const compileAnchoredStory = (item, lang = 'sv', includeLatex = false) => {
    // Safely look inside renderData, or fallback to the root object
    const rd = item.resolvedData?.renderData || item.resolvedData;
    
    // Fallback: If no story index is selected, or if it isn't an intercepted problem, use server description
    if (item.selectedStoryIndex === undefined || item.selectedStoryIndex === null || !rd?.availableStories) {
        const desc = rd?.description;
        const finalDesc = typeof desc === 'object' && desc !== null ? desc[lang] : desc;
        
        // 🟢 FIXED: Only append the LaTeX math if includeLatex is explicitly true!
        if (includeLatex && rd?.latex) {
            return finalDesc ? `${finalDesc} $${rd.latex}$` : `$${rd.latex}$`;
        }
        
        return finalDesc || item.name;
    }

    // 1. Safe boundary lookup for the locked template
    const storyPackage = rd.availableStories[item.selectedStoryIndex];
    if (!storyPackage) return rd?.description || item.name;
    
    let template = storyPackage[lang === 'en' ? 'en' : 'sv'];

    // 2. Prioritize pre-extracted parameters passed down from the interceptor data payload
    let params = rd.extractedParams;

    // 3. Backward compatibility fallback: run regex if extractedParams is missing from history streams
    if (!params) {
        const category = Object.values(SKILL_BUCKETS).find(cat => cat.topics[item.topicId]);
        const variation = category?.topics[item.topicId]?.variations?.find(v => v.key === item.variationKey);
        
        const sourceToken = rd.latex || rd.interceptorToken;
        if (variation?.extractorPattern && sourceToken) {
            const match = sourceToken.match(variation.extractorPattern);
            if (match && match.groups) {
                params = match.groups;
            }
        }
    }

    // 4. Perform placeholder variable substitution
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            const cleanValue = String(value).replace(/[()]/g, '');
            template = template.replace(new RegExp(`\\{${key}\\}`, 'g'), cleanValue);
        });
    }

    // 5. Append the exact uniform instructional directive suffix corresponding to the current variation key context
    if (item.variationKey === 'apply_factor_inc' || item.variationKey === 'apply_factor_dec') {
        template += lang === 'en' ? " Calculate the new value." : " Beräkna det nya värdet.";
    } else if (item.variationKey === 'find_original_inc' || item.variationKey === 'find_original_dec') {
        template += lang === 'en' ? " Calculate the original value." : " Beräkna det ursprungliga värdet.";
    } else if (item.variationKey === 'sequential_factors') {
        template += lang === 'en' ? " Calculate the total combined change factor." : " Beräkna den totala förändringsfaktorn.";
    } else if (item.topicId === 'equations' || item.topicId === 'equations_word') {
        if (item.resolvedData?.metadata?.difficulty === 5) {
            template += lang === 'en' ? " Write the equation that describes this situation." : " Teckna ekvationen som beskriver situationen.";
        } else {
            template += lang === 'en' ? " Calculate the value of x." : " Beräkna värdet på x.";
        }
    } else if (item.topicId === 'expressions') {
        template += lang === 'en' ? " Write and simplify the algebraic expression." : " Skriv och förenkla uttrycket.";
    }

    return template;
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
      studio: "Question Studio", library_title: "Bibliotek", donow_title: "Do Now Grid", worksheet_title: "Arbetsblad",
      change_mode: "Byt läge", search_placeholder: "Sök område...", board_label: "Tavlan", new_example: "Nytt exempel",
      select_hint: "Välj en variant för att förhandsgranska", selected_questions: "Valda frågor", clear_all: "Rensa",
      create_donow: "Grid", publish: "Skriv ut", title_placeholder: "Namnge ditt arbete...",
      save_success: "Sparad!", unsaved_warning: "Du har osparade ändringar. Fortsätt ändå?",
      width_label: "Bredd", work_area_toggle: "Arbetsyta", section_label: "Instruktion:",
      regenerate: "Slumpa ny", regenerate_all: "Slumpa alla", load_btn: "Öppna", delete_confirm: "Radera permanent?",
      compact: "Kompakt", spacious: "Gott om plats",
      answer_key_toggle: "Inkludera facit", answer_style_label: "Facit stil",
      style_compact: "Bara svar", style_detailed: "Steg",
      delete_task: "Radera", name_label: "Namn:", date_label: "Datum:",
      save_btn: "Spara", live_btn: "Live", btn_close: "Stäng",
      visibility_label: "Delning", vis_private: "Privat", vis_school: "Skola", vis_public: "Global",
      tab_mine: "Mina sparade", tab_school: "Min Skola", tab_global: "Globalt",
      clone_btn: "Kopiera", clone_success: "Kopierad!", peek_title: "Snabbkoll",
      mode_header: "Som rubrik", mode_inline: "Inuti kortet", mode_hidden: "Dölj text",
      hide_extra: "Dölj Begrepp & Flerval", type_calc: "Räkna", type_concept: "Begrepp", type_logic: "Felsök", type_visual: "Bild", type_text: "Text",
      present: "Presentera"
    },
    en: {
      studio: "Question Studio", library_title: "Library", donow_title: "Do Now Grid", worksheet_title: "Worksheet",
      change_mode: "Change mode", search_placeholder: "Search topics...", board_label: "The Board", new_example: "New Example",
      select_hint: "Select a variation to preview", selected_questions: "Questions", clear_all: "Clear",
      create_donow: "Grid", publish: "Print", title_placeholder: "Enter title...",
      save_success: "Saved!", unsaved_warning: "Unsaved work! Proceed anyway?",
      width_label: "Width", work_area_toggle: "Work Area", section_label: "Instruction:",
      regenerate: "Randomize new", regenerate_all: "Randomize all", load_btn: "Open", delete_confirm: "Delete permanently?",
      compact: "Compact", spacious: "Spacious",
      answer_key_toggle: "Include answer key", answer_style_label: "Style",
      style_compact: "Answers", style_detailed: "Steps",
      delete_task: "Delete task", name_label: "Name:", date_label: "Date:",
      save_btn: "Save", live_btn: "Live", btn_close: "Close",
      visibility_label: "Sharing", vis_private: "Private", vis_school: "School", vis_public: "Global",
      tab_mine: "My Saved", tab_school: "School", tab_global: "Global",
      clone_btn: "Clone", clone_success: "Cloned!", peek_title: "Quick Peek",
      mode_header: "As Header", mode_inline: "Inside Card", mode_hidden: "Hide Text",
      hide_extra: "Hide Concepts & MCQ", type_calc: "Calculate", type_concept: "Concept", type_logic: "Logic", type_visual: "Image", type_text: "Text",
      present: "Present"
    }
  }[lang];

  // --- STATE ---
  const [isPane1Collapsed, setIsPane1Collapsed] = useState(false); 
  const [isPane4Collapsed, setIsPane4Collapsed] = useState(false);
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

  const [isRegeneratingAll, setIsRegeneratingAll] = useState(false);
  const [hideExtra, setHideExtra] = useState(false);
  const [useWordProblems, setUseWordProblems] = useState(false);
  
  const [isGlobalShuffleOpen, setIsGlobalShuffleOpen] = useState(false);
  const [filterDocType, setFilterDocType] = useState('all');
  const [showPresentation, setShowPresentation] = useState(false); 

  // --- UNIFIED BI-DIRECTIONAL DRAG AND DROP ---
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  const handleDragStartUnified = (e, index) => {
    setDraggedIdx(index);
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragOverUnified = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = draggedIdx !== null ? draggedIdx : draggedItemIndex;
    if (sourceIndex === null || sourceIndex === targetIndex) return;

    const updatedPacket = [...packet];
    const [movedItem] = updatedPacket.splice(sourceIndex, 1);
    updatedPacket.splice(targetIndex, 0, movedItem);

    if (draggedIdx !== null) setDraggedIdx(targetIndex);
    if (draggedItemIndex !== null) setDraggedItemIndex(targetIndex);
    
    setPacket(updatedPacket);
    setIsSaved(false);
  };

  const handleDragEndUnified = () => {
    setDraggedIdx(null);
    setDraggedItemIndex(null);
  };

  // --- EFFECTS ---
  useEffect(() => {
    const stillVisible = visibleVariations.some(v => v.key === activePreviewKey);
    if (!stillVisible && visibleVariations.length > 0) {
        triggerPreview(visibleVariations[0].key);
    } else if (activePreviewKey) {
        triggerPreview(activePreviewKey);
    }
  }, [useWordProblems]);

  useEffect(() => { if (currentTopic?.variations?.[0]) triggerPreview(currentTopic.variations[0].key); }, [selectedTopicId]);
  useEffect(() => { setInitialPacket(packet); }, [packet]);
  useEffect(() => { setStudioMode(setupMode); }, [setupMode]);
  useEffect(() => { fetchLibrary(); }, [setupMode, libraryTab]);

  // Helper to find the translated name for a topic ID
  const getTopicLabel = (topicId) => {
      if (!topicId || topicId === 'all') return lang === 'sv' ? "Alla ämnen" : "All topics";
      for (const catKey in SKILL_BUCKETS) {
          const category = SKILL_BUCKETS[catKey];
          if (category.topics && category.topics[topicId]) {
              return category.topics[topicId].name[lang] || topicId;
          }
      }
      return topicId.charAt(0).toUpperCase() + topicId.slice(1).replace('_', ' ');
  };

  const renderOptions = (options, inline = false) => {
    if (!options || options.length === 0) return null;
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
    return (
        <div className={`mt-4 grid grid-cols-2 gap-2 w-full max-w-md mx-auto ${inline ? 'px-4' : ''}`}>
            {options.map((opt, i) => {
                const choiceLabel = typeof opt === 'object' ? opt.label : opt;
                return (
                    <div key={i} className="flex items-center gap-2 text-[11px] bg-slate-50 border border-slate-100 p-2 rounded-lg">
                        <span className="font-black text-indigo-600">{labels[i]}</span>
                        <MathDisplay content={choiceLabel} />
                    </div>
                );
            })}
        </div>
    );
  };

  const getVariationCategory = (key) => {
    const k = key.toLowerCase();
    const isVisual = ['graph', 'plot', 'geom', 'volume', 'shape', 'area', 'perimeter', 'angle', 'pattern', 'table', 'marbles', 'spinner', 'tree'].some(kw => k.includes(kw));
    if (isVisual) return 'visual';
    if (['calc', 'std', 'solve'].some(kw => k.includes(kw))) return 'calculate';
    if (['concept', 'theory', 'foundations', 'id', 'inverse'].some(kw => k.includes(kw))) return 'conceptual';
    if (['lie', 'spot', 'error', 'check'].some(kw => k.includes(kw))) return 'logic';
    return 'default';
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

  const fetchLibrary = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.warn("No active user found in Supabase context.");
        return;
    }
    
    setIsLibraryLoading(true);
    try {
        let query = supabase.from('saved_sheets').select('*').order('updated_at', { ascending: false });
        
        if (libraryTab === 'private') {
            query = query.eq('user_id', user.id);
        } else if (libraryTab === 'school') {
            query = query.eq('visibility', 'school').eq('school_name', profile?.school_name);
        } else {
            query = query.eq('visibility', 'public');
        }
        
        const { data, error } = await query;
        if (error) throw error;
        setSavedSheets(data || []);
    } catch (err) { 
        console.error("Error loading library assets directly from Supabase:", err); 
    } finally { 
        setIsLibraryLoading(false); 
    }
  };

  const handleSave = async () => {
      if (!sheetTitle) { alert(t.title_placeholder); return; }
      try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const uniqueTopics = [...new Set(packet.map(q => q.topicId))];
          const uniqueLevels = [...new Set(packet.map(q => q.resolvedData?.level || 1))];
          
          const sheetData = { 
              user_id: user.id,
              title: sheetTitle, 
              type: setupMode, 
              packet: packet, 
              config: { showWorkArea, lang, includeAnswerKey, answerKeyStyle }, 
              visibility: chosenVisibility,
              school_name: profile?.school_name || null, 
              auto_topics: uniqueTopics, 
              auto_levels: uniqueLevels,
              updated_at: new Date().toISOString()
          };

          const { data, error } = activeSheetId 
              ? await supabase.from('saved_sheets').update(sheetData).eq('id', activeSheetId).select().single()
              : await supabase.from('saved_sheets').insert([sheetData]).select().single();

          if (error) throw error;

          setActiveSheetId(data.id); 
          setIsSaved(true); 
          alert(t.save_success); 
          fetchLibrary(); 
      } catch (err) { 
          alert("Fel vid sparande: " + err.message); 
      }
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


  const handleLaunchGrid = () => { if (!isSaved && !window.confirm(t.unsaved_warning)) return; onDoNowGenerate({ title: sheetTitle, showWorkArea, includeAnswerKey, answerKeyStyle }, packet); };
  const handleLaunchPrint = () => { if (!isSaved && !window.confirm(t.unsaved_warning)) return; onWorksheetGenerate(packet, { title: sheetTitle, showWorkArea, includeAnswerKey, answerKeyStyle }); };
  
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
        const res = await fetch(`/api/question?topic=${selectedTopicId}&variation=${variationKey}&lang=${lang}&wordProblem=${useWordProblems}`);
        const data = await res.json(); setPreviewData(data);
    } catch (err) { console.error(err); } finally { setIsPreviewLoading(false); }
  };

  const addToPacket = async (variation, qty) => {
    setIsPreviewLoading(true); setIsSaved(false);
    try {
        const newItems = [];
        for (let i = 0; i < qty; i++) {
            const res = await fetch(`/api/question?topic=${selectedTopicId}&variation=${variation.key}&lang=${lang}&wordProblem=${useWordProblems}`);            const data = await res.json();
            const isFirstInBatch = i === 0;
            
            newItems.push({ 
                id: crypto.randomUUID(), 
                topicId: selectedTopicId, 
                variationKey: variation.key, 
                name: variation.name[lang] || variation.name.sv, 
                columnSpan: useWordProblems ? 6 : (isFirstInBatch ? 6 : 2), 
                resolvedData: data, 
                instructionMode: useWordProblems ? 'inline' : (isFirstInBatch ? 'header' : 'hidden'),
                showLatex: !useWordProblems,
                showVisual: !useWordProblems,
                selectedStoryIndex: useWordProblems ? 0 : null,
                showWorkArea: showWorkArea 
            });
        }
        if (setupMode === 'donow' && packet.length + newItems.length > 6) { alert("Do Now max 6."); return; }
        setPacket(prev => [...prev, ...newItems]); setPendingQuantity(1);
    } catch (err) { alert(err.message); } finally { setIsPreviewLoading(false); }
  };

  const regenerateItem = async (id, topicId, variationKey) => {
    try {
        const item = packet.find(p => p.id === id);
        // Look at the item's history to see if it should fetch a word problem
        const isItemWP = item?.selectedStoryIndex !== null && item?.selectedStoryIndex !== undefined;

        const res = await fetch(`/api/question?topic=${topicId}&variation=${variationKey}&lang=${lang}&wordProblem=${isItemWP}`);
        const data = await res.json();
        setPacket(prev => prev.map(p => p.id === id ? { ...p, resolvedData: data } : p)); setIsSaved(false);
    } catch (err) { console.error(err); }
  };

  const batchShuffle = async (mode) => {
        if (packet.length === 0 || isRegeneratingAll) return;
        setIsRegeneratingAll(true);
        try {
            const updatedPacket = await Promise.all(packet.map(async (item) => {
                if (!item.topicId || !item.variationKey) return item;

                // IDENTIFY ITEM STATE: Determine if THIS specific item was created as a word problem
                const isItemWP = item.selectedStoryIndex !== null && item.selectedStoryIndex !== undefined;

                if (mode === 'stories') {
                    const rd = item.resolvedData?.renderData;
                    if (!rd?.availableStories || rd.availableStories.length <= 1) return item;
                    const newIndex = Math.floor(Math.random() * rd.availableStories.length);
                    return { ...item, selectedStoryIndex: newIndex };
                }

                // PASS ITEM STATE: Use the item's own word problem state, NOT the global toggle
                const res = await fetch(`/api/question?topic=${item.topicId}&variation=${item.variationKey}&lang=${lang}&wordProblem=${isItemWP}`);            
                const data = await res.json();
                
                // SHUFFLE BOTH LOGIC: If 'both' is selected and it is a word problem, randomize the text index!
                let nextStoryIdx = null;
                if (isItemWP) {
                    if (mode === 'both' && data.renderData?.availableStories) {
                        nextStoryIdx = Math.floor(Math.random() * data.renderData.availableStories.length);
                    } else {
                        nextStoryIdx = item.selectedStoryIndex; // Keep same story, just update numbers
                    }
                }

                return { 
                    ...item,
                    id: mode === 'both' ? crypto.randomUUID() : item.id, 
                    selectedStoryIndex: nextStoryIdx,
                    resolvedData: data 
                };
            }));
            setPacket(updatedPacket);
            setIsSaved(false);
        } catch (err) {
            console.error("Batch shuffle failed:", err);
        } finally {
            setIsRegeneratingAll(false);
        }
  };

  const updatePacketItem = (id, key, val) => { setPacket(packet.map(p => p.id === id ? { ...p, [key]: val } : p)); setIsSaved(false); };
  const deleteSheet = async (e, id) => {
    e.stopPropagation(); 
    if (!window.confirm(t.delete_confirm)) return;
    try {
        const { error } = await supabase.from('saved_sheets').delete().eq('id', id);
        if (error) throw error;
        setSavedSheets(savedSheets.filter(s => s.id !== id));
    } catch (err) { 
        alert("Kunde inte radera: " + err.message); 
    }
  };

  const allTopics = Object.values(SKILL_BUCKETS).flatMap(cat => Object.entries(cat.topics).map(([id, data]) => ({ id, categoryName: cat.name[lang], categoryId: cat.id, ...data })));
  const currentTopic = allTopics.find(tp => tp.id === selectedTopicId) || allTopics[0];
  const getColSpanClass = (span) => ({ 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4', 6: 'col-span-6' }[span] || 'col-span-6');
  
  const filteredLibrary = savedSheets.filter(sheet => {
      const matchesSearch = sheet.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTopic = filterTopic === 'all' || sheet.auto_topics?.includes(filterTopic);
      const activeSheetType = (sheet.type || '').replace('_', '').toLowerCase();
      const matchesType = setupMode
        ? activeSheetType === setupMode.replace('_', '').toLowerCase()
        : filterDocType === 'all' || activeSheetType === filterDocType;
        
      return matchesSearch && matchesTopic && matchesType;
  });
  const availableTopics = [...new Set(savedSheets.flatMap(s => s.auto_topics || []))];

  const visibleVariations = (currentTopic?.variations || [])
  .filter(v => {
    if (useWordProblems) {
      const hasTag = v.tags?.includes('word_problem_ready');
      if (!hasTag) return false; 
    }
    if (!hideExtra) return true;
    const k = v.key.toLowerCase();
    const isMCQ = ['lie', 'spot', 'choice', 'mcq', 'check', 'select', 'which', 'error', 'inverse'].some(kw => k.includes(kw));
    const isConcept = ['concept', 'theory', 'foundations', 'id', 'begrepp'].some(kw => k.includes(kw));
    return !isMCQ && !isConcept;
  })
  .sort((a, b) => getDifficultyScore(a.key) - getDifficultyScore(b.key));


    // 🟢 FULL-WIDTH STARTUP SCREEN WITH EXPANDED TITLE COLUMN
    if (!setupMode) {
        return (
            <div className="flex-1 bg-[#f9fbf7] flex flex-col p-6 overflow-y-auto relative custom-scrollbar">
            <button 
                onClick={onClose} 
                className="absolute top-4 right-6 p-2 bg-slate-900 text-white hover:bg-rose-600 rounded-xl shadow-lg transition-all flex items-center gap-1.5 font-black text-[9px] uppercase tracking-widest z-50 cursor-pointer"
            >
                <X size={16}/> {t.btn_close}
            </button>
            
            {/* 🟢 CHANGED: Replaced max-w-5xl with w-full px-4 sm:px-8 to fill browser width */}
            <div className="w-full px-4 sm:px-8 mx-auto space-y-6 relative z-10">
                {/* Upper Mode Pickers */}
                <div className="text-center">
                    <h2 className="text-3xl font-black text-emerald-900 tracking-tighter uppercase italic mb-4">{t.studio}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 max-w-5xl mx-auto">
                        <button 
                            onClick={() => { setSetupMode('donow'); setPacket([]); setSheetTitle(""); setActiveSheetId(null); }} 
                            className="group p-5 bg-white border-2 border-slate-100 rounded-[2rem] hover:border-indigo-600 transition-all text-left shadow-xs hover:shadow-md active:scale-[0.98] cursor-pointer flex items-center gap-5"
                        >
                            <Grid3X3 size={28} className="text-indigo-600 shrink-0" />
                            <div>
                            <h3 className="text-2xl font-black text-slate-800 uppercase leading-none mb-1">{t.donow_title}</h3>
                            <p className="text-slate-400 font-bold uppercase text-[12px] tracking-widest">För tavlan</p>
                            </div>
                        </button>

                        <button 
                            onClick={() => { setSetupMode('worksheet'); setPacket([]); setSheetTitle(""); setActiveSheetId(null); }} 
                            className="group p-5 bg-white border-2 border-slate-100 rounded-[2rem] hover:border-emerald-600 transition-all text-left shadow-xs hover:shadow-md active:scale-[0.98] cursor-pointer flex items-center gap-5"
                        >
                            <FileText size={28} className="text-emerald-600 shrink-0" />
                            <div>
                            <h3 className="text-2xl font-black text-slate-800 uppercase leading-none mb-1">{t.worksheet_title}</h3>
                            <p className="text-slate-400 font-bold uppercase text-[12px] tracking-widest">Klassiska pappersblad</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Streamlined Archive Library Card Container */}
                <div className="bg-white rounded-[2rem] shadow-lg border border-emerald-100 overflow-hidden flex flex-col min-h-[450px] w-full">
                    {/* Tier 1: Primary Scope Tabs */}
                    <div className="bg-slate-900 px-6 pt-2 flex justify-between items-center">
                        <div className="flex gap-1">
                            <button 
                                onClick={() => setLibraryTab('private')} 
                                className={`px-5 py-2 rounded-t-lg text-[12px] font-black uppercase tracking-wider transition-all cursor-pointer ${libraryTab === 'private' ? 'bg-[#f9fbf7] text-indigo-600 shadow-xs' : 'text-slate-400 hover:text-white'}`}
                            >
                                {t.tab_mine}
                            </button>
                            <button 
                                onClick={() => setLibraryTab('school')} 
                                className={`px-5 py-2 rounded-t-lg text-[12px] font-black uppercase tracking-wider transition-all cursor-pointer ${libraryTab === 'school' ? 'bg-[#f9fbf7] text-indigo-600 shadow-xs' : 'text-slate-400 hover:text-white'}`}
                            >
                                {t.tab_school}
                            </button>
                            <button 
                                onClick={() => setLibraryTab('public')} 
                                className={`px-5 py-2 rounded-t-lg text-[12px] font-black uppercase tracking-wider transition-all cursor-pointer ${libraryTab === 'public' ? 'bg-[#f9fbf7] text-indigo-600 shadow-xs' : 'text-slate-400 hover:text-white'}`}
                            >
                                {t.tab_global}
                            </button>
                        </div>
                        <span className="text-[12px] font-black tracking-widest uppercase text-slate-500 italic mr-2">
                            {t.library_title}
                        </span>
                    </div>

                    {/* Tier 2: Action Sub-Toolbar Utility Strip */}
                    <div className="px-5 py-3 border-b border-emerald-100 flex flex-col lg:flex-row justify-between items-center gap-3 bg-slate-50/70">
                        {/* Left Side: Type Sub-Filters */}
                        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto py-0.5">
                            <span className="text-[12px] font-black uppercase tracking-wider text-slate-400 mr-1 select-none">
                                {lang === 'sv' ? "Typ:" : "Type:"}
                            </span>
                            <div className="flex gap-1 p-0.5 bg-slate-200/60 rounded-lg border border-slate-300/40 shadow-inner">
                                <button 
                                    onClick={() => setFilterDocType('all')}
                                    className={`px-3 py-1 rounded-md text-[12px] font-black uppercase transition-all cursor-pointer ${filterDocType === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    {lang === 'sv' ? "Visa Alla" : "Show Both"}
                                </button>
                                <button 
                                    onClick={() => setFilterDocType('worksheet')}
                                    className={`px-3 py-1 rounded-md text-[12px] font-black uppercase transition-all flex items-center gap-1 cursor-pointer ${filterDocType === 'worksheet' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    <FileText size={10} />
                                    {lang === 'sv' ? "Arbetsblad" : "Worksheets"}
                                </button>
                                <button 
                                    onClick={() => setFilterDocType('donow')}
                                    className={`px-3 py-1 rounded-md text-[12px] font-black uppercase transition-all flex items-center gap-1 cursor-pointer ${filterDocType === 'donow' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    <Grid3X3 size={12} />
                                    {lang === 'sv' ? "Do Now Grids" : "Grids"}
                                </button>
                            </div>
                        </div>
                        
                        {/* Right Side: Title Search & Topic Filters */}
                        <div className="flex flex-col sm:flex-row gap-2 items-center w-full lg:w-auto justify-end">
                            <div className="relative w-full sm:w-64 group">
                                <Search className="absolute left-2.5 top-2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={13} />
                                <input 
                                    type="text" 
                                    placeholder={lang === 'sv' ? "Sök titel..." : "Search title..."} 
                                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-emerald-100 focus:border-indigo-500 rounded-lg text-s font-bold outline-none transition-all shadow-s" 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                />
                            </div>
                            
                            <div className="relative w-full sm:w-auto bg-white border border-emerald-100 rounded-lg px-2.5 py-1 shadow-xs focus-within:border-indigo-500 transition-all flex items-center gap-1">
                                <Filter size={11} className="text-slate-400" />
                                <select 
                                    value={filterTopic} 
                                    onChange={(e) => setFilterTopic(e.target.value)}
                                    className="text-[10px] font-black uppercase bg-transparent border-none rounded-md focus:ring-0 outline-none cursor-pointer pr-4 text-slate-600 hover:text-slate-900"
                                >
                                    <option value="all">{lang === 'sv' ? "Alla Områden" : "All Topics"}</option>
                                    {availableTopics.map(tId => (
                                        <option key={tId} value={tId}>
                                            {getTopicLabel(tId).toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Content Table Layout Area */}
                    <div className="flex-1 overflow-x-auto w-full">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-emerald-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    {/* 🟢 CHANGED: Allocated w-2/5 to Title and w-1/4 to Content */}
                                    <th className="px-6 py-3 w-2/5">Titel</th>
                                    <th className="px-6 py-3 w-1/4">Innehåll</th>
                                    <th className="px-6 py-3 text-center w-24">Uppgifter</th>
                                    <th className="px-6 py-3 text-center w-36">Senast ändrad</th>
                                    <th className="px-6 py-3 text-center w-48">Åtgärder</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-50/50">
                                {filteredLibrary.map(sheet => (
                                    <tr key={sheet.id} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-6 py-3 font-bold text-slate-700 text-m truncate max-w-0" title={sheet.title}>
                                            {sheet.title}
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {sheet.auto_topics?.slice(0, 3).map(tag => (
                                                    <span key={tag} className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{tag}</span>
                                                ))}
                                                {sheet.auto_topics?.length > 3 && (
                                                    <span className="text-[10px] font-black text-slate-300">+{sheet.auto_topics.length - 3}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-center font-bold text-slate-400 text-xs">{sheet.packet?.length || 0}</td>
                                        <td className="px-6 py-3 text-center font-medium text-slate-400 text-[11px]">{new Date(sheet.updated_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex justify-end gap-1.5 items-center">
                                                <button onClick={() => setPeekSheet(sheet)} title={t.peek_title} className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"><Maximize2 size={15}/></button>
                                                {libraryTab === 'private' ? (
                                                    <>
                                                        <button onClick={() => loadSheet(sheet)} className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors cursor-pointer">{t.load_btn}</button>
                                                        
                                                        <button 
                                                            onClick={() => { loadSheet(sheet); setShowPresentation(true); }} 
                                                            className="bg-amber-500 text-white px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest hover:bg-amber-600 shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <Monitor size={12} /> {t.present}
                                                        </button>

                                                        <button onClick={(e) => deleteSheet(e, sheet.id)} className="p-1.5 text-slate-800 hover:text-rose-500 opacity-40 group-hover:opacity-100 transition-all cursor-pointer"><Trash2 size={15}/></button>
                                                    </>
                                                ) : (
                                                    <button onClick={() => handleClone(sheet.id)} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-1 cursor-pointer"><Copy size={12}/> {t.clone_btn}</button>
                                                )}
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
                <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/40 backdrop-blur-xs">
                    <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="p-6 border-b flex justify-between items-center bg-slate-900 text-white"><div><h3 className="text-lg font-black uppercase italic tracking-tighter leading-none">{peekSheet.title}</h3><p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{peekSheet.packet?.length || 0} Uppgifter</p></div><button onClick={() => setPeekSheet(null)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer"><X size={20}/></button></div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {peekSheet.packet.map((q, i) => (
                                <div key={i} className="border-b border-slate-100 pb-6 last:border-0">
                                    <div className="flex justify-center mb-3 scale-75 origin-top">
                                        <VisualRenderer 
                                            data={q.resolvedData?.renderData} 
                                            isWordProblem={q.selectedStoryIndex !== null && q.selectedStoryIndex !== undefined} 
                                        />
                                    </div>
                                    <div className="text-xs font-bold text-slate-700 leading-relaxed"><MathDisplay content={q.resolvedData?.renderData?.description} /></div>{q.resolvedData?.renderData?.latex && <div className="mt-3 p-3 bg-slate-50 rounded-xl text-center font-serif text-sm"><MathDisplay content={`$$${q.resolvedData.renderData.latex}$$`} /></div>}{renderOptions(q.resolvedData?.renderData?.options)}</div>
                            ))}
                        </div>
                            <div className="p-6 border-t bg-slate-50">
                            {libraryTab === 'private' ? (
                                <div className="flex gap-3">
                                    <button onClick={() => { loadSheet(peekSheet); setPeekSheet(null); }} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md hover:bg-indigo-600 transition-all cursor-pointer">
                                        {lang === 'sv' ? "Redigera" : "Edit"}
                                    </button>
                                    <button onClick={() => { loadSheet(peekSheet); setPeekSheet(null); setShowPresentation(true); }} className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md hover:bg-amber-600 transition-all flex items-center justify-center gap-2 cursor-pointer">
                                        <Monitor size={16} /> {t.present}
                                    </button>
                                </div>
                            ) : (
                                <button onClick={() => { handleClone(peekSheet.id); setPeekSheet(null); }} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 cursor-pointer"><Copy size={16}/> {lang === 'sv' ? "Kopiera till mitt arkiv" : "Clone to my library"}</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
            </div>
        );
    }

  return (
    <div className="flex flex-col h-full bg-slate-200 font-sans overflow-hidden relative">
        <header className={`relative border-b px-6 py-1 flex items-center justify-between shadow-md z-50 transition-colors duration-500 ${setupMode === 'donow' ? 'bg-indigo-950 border-indigo-900' : 'bg-emerald-900 border-emerald-800'}`}>
            {/* Left Side: Navigation Inputs */}
            <div className="flex items-center gap-3 flex-1 max-w-[40%]">
                <div className="flex items-center gap-1.5 shrink-0">
                    <button 
                        onClick={() => { if(!isSaved && !window.confirm(t.unsaved_warning)) return; setSetupMode(null); }} 
                        className="text-[11px] font-black text-white/80 uppercase hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                    >
                        <ChevronLeft size={13}/> {t.change_mode}
                    </button>
                </div>
                
                <div className={`h-4 w-px mx-0.5 transition-colors ${setupMode === 'donow' ? 'bg-indigo-800' : 'bg-emerald-800'}`}></div>
                
                <div className="relative group flex-1 max-w-xs">
                    <input 
                        type="text" 
                        className="w-full bg-white/10 px-3 py-1 rounded-lg text-xs font-black tracking-tight outline-none focus:bg-white/20 transition-all border border-transparent hover:border-white/20 text-white placeholder-white/40" 
                        placeholder={t.title_placeholder} 
                        value={sheetTitle} 
                        onChange={(e) => { setSheetTitle(e.target.value); setIsSaved(false); }} 
                    />
                </div>

                <div className="flex items-center gap-0.5 bg-white/10 p-0.5 rounded-lg border border-white/10">
                    <button onClick={() => setChosenVisibility('private')} className={`p-1 rounded transition-all ${chosenVisibility === 'private' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/50 hover:text-white hover:bg-white/20'}`}><Lock size={10}/></button>
                    <button onClick={() => setChosenVisibility('school')} className={`p-1 rounded transition-all ${chosenVisibility === 'school' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/50 hover:text-white hover:bg-white/20'}`}><Building2 size={10}/></button>
                    <button onClick={() => setChosenVisibility('public')} className={`p-1 rounded transition-all ${chosenVisibility === 'public' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/50 hover:text-white hover:bg-white/20'}`}><Globe size={10}/></button>
                </div>

                <button 
                    onClick={handleSave} 
                    disabled={packet.length === 0} 
                    className="px-3 py-1 bg-blue-500 border border-white/20 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-blue-600 text-white transition-all disabled:opacity-50 cursor-pointer"
                >
                    <Save size={13}/> {t.save_btn}
                </button>
            </div>

            {/* Center Title Label */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
                <span className="text-white font-black uppercase text-xs tracking-wider opacity-90">
                    {setupMode === 'donow' ? t.donow_title : setupMode === 'worksheet' ? t.worksheet_title : null}
                </span>
            </div>

            {/* Right Side Buttons */}
            <div className="flex items-center gap-2 pl-4 max-w-[45%] justify-end">
                <button 
                    onClick={handleLaunchLive} 
                    disabled={packet.length === 0} 
                    className="px-3 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-rose-500 transition-all disabled:opacity-30 cursor-pointer"
                >
                    <Send size={13}/> {t.live_btn}
                </button>

                <button 
                    onClick={() => setShowPresentation(true)} 
                    disabled={packet.length === 0} 
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-30 shadow-md cursor-pointer"
                >
                    <Monitor size={13}/> {t.present}
                </button>

                <div className={`h-4 w-px mx-0.5 transition-colors ${setupMode === 'donow' ? 'bg-indigo-800' : 'bg-emerald-800'}`}></div>

                {setupMode === 'donow' ? (
                    <button 
                        onClick={handleLaunchGrid} 
                        disabled={packet.length === 0} 
                        className="px-3 py-1 bg-white text-indigo-950 hover:bg-indigo-50 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-30 shadow-md cursor-pointer"
                    >
                        <Grid3X3 size={13}/> {t.create_donow}
                    </button>
                ) : (
                    <button 
                        onClick={handleLaunchPrint} 
                        disabled={packet.length === 0} 
                        className="px-3 py-1 bg-white text-emerald-950 hover:bg-emerald-50 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-30 shadow-md cursor-pointer"
                    >
                        <Printer size={13}/> {t.publish}
                    </button>
                )}

                <button 
                    onClick={onClose} 
                    className="p-1 text-white/60 hover:bg-rose-500 hover:text-white rounded-lg transition-all cursor-pointer"
                >
                    <X size={16}/>
                </button>
            </div>
        </header>

      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* PANE 1: Topics */}
        <div className={`bg-white border-r border-slate-300 flex flex-col shrink-0 transition-all duration-300 ${isPane1Collapsed ? 'w-16' : 'w-72'}`}>
          <div className={`p-4 border-b flex items-center ${isPane1Collapsed ? 'justify-center' : 'justify-end'}`}><button onClick={() => setIsPane1Collapsed(!isPane1Collapsed)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">{isPane1Collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}</button></div>
          <div className={`flex-1 overflow-y-auto custom-scrollbar transition-opacity duration-200 ${isPane1Collapsed ? 'opacity-0 invisible' : 'opacity-100 p-4 space-y-3'}`}>
            {!isPane1Collapsed && (<><div className="relative mb-4"><Search className="absolute left-3 top-3 text-slate-400" size={16} /><input type="text" placeholder={t.search_placeholder} className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>{Object.values(SKILL_BUCKETS).map(cat => (<div key={cat.id}><h3 className="text-[12px] font-black uppercase tracking-widest text-blue-700 mb-3 ml-2">{cat.name[lang]}</h3><div className="space-y-1">{Object.entries(cat.topics).map(([id, data]) => (<button key={id} onClick={() => setSelectedTopicId(id)} className={`w-full text-left px-3 py-1.5 text-sm rounded-xl transition-all ${selectedTopicId === id ? 'bg-slate-900 text-white font-bold shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}>{data.name[lang]}</button>))}</div></div>))}</>)}
          </div>
        </div>

        {/* PANE 2: Variations */}

        <div className="w-[300px] bg-slate-50/80 backdrop-blur-sm border-r border-slate-300 flex flex-col shrink-0">
        {/* Header Section */}
        <div className="p-3 border-b bg-white shrink-0 shadow-sm space-y-2">
            <h1 className="text-sm font-black text-slate-900 uppercase italic truncate leading-none">{currentTopic?.name[lang]}</h1>
            
            <div className="flex items-center justify-between bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-inner">
                <span className="text-[11px] font-black uppercase text-slate-700 ml-1.5 tracking-tight">{t.hide_extra}</span>
                <button 
                    onClick={() => setHideExtra(!hideExtra)} 
                    className={`w-8 h-4 rounded-full transition-all relative p-0.5 ${hideExtra ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                    <div className={`w-3 h-3 bg-white rounded-full transition-all shadow-sm ${hideExtra ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
            </div>

            <div className="flex items-center justify-between bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-inner">
                <span className="text-[11px] font-black uppercase text-slate-700 ml-1.5 tracking-tight">
                    {lang === 'sv' ? 'Problemlösning' : 'Word Problems'}
                </span>
                <button 
                    onClick={() => setUseWordProblems(!useWordProblems)} 
                    className={`w-8 h-4 rounded-full transition-all relative p-0.5 ${useWordProblems ? 'bg-emerald-600' : 'bg-slate-300'}`}
                >
                    <div className={`w-3 h-3 bg-white rounded-full transition-all shadow-sm ${useWordProblems ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
            </div>
        </div>

        {/* Variation Cards List organized by Level Dividers */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
            {Object.entries(
                visibleVariations.reduce((acc, v) => {
                    const lvl = v.level || 1; // Fallback to 1 if not explicitly defined in skillBuckets
                    if (!acc[lvl]) acc[lvl] = [];
                    acc[lvl].push(v);
                    return acc;
                }, {})
            ).sort(([lvlA], [lvlB]) => Number(lvlA) - Number(lvlB)).map(([lvl, variations]) => (
                <div key={lvl} className="space-y-2">
                    {/* Level Divider Header */}
                    <div className="sticky top-0 bg-slate-50/95 backdrop-blur-sm pt-4 pb-2 flex items-center z-10">
                        <span className="text-[14px] font-black uppercase tracking-widest text-indigo-700">
                            {lang === 'sv' ? `Nivå ${lvl}` : `Level ${lvl}`}
                        </span>
                        <div className="flex-1 h-[2px] bg-indigo-100/70 ml-3 rounded-full"></div>
                    </div>

                    {/* Variations under this level */}
                    {variations.map(v => {
                        const cat = getVariationCategory(v.key);
                        const styles = getCategoryStyles(cat);
                        const isPreviewed = activePreviewKey === v.key;
                        const hasWordProblem = v.tags?.includes('word_problem_ready');
                        
                        return (
                            <div 
                                key={v.key} 
                                onClick={() => triggerPreview(v.key)} 
                                className={`group p-3 rounded-2xl border transition-all bg-white relative overflow-hidden
                                    ${isPreviewed ? 'border-indigo-500 shadow-md ring-2 ring-indigo-500/10' : 'border-slate-200 shadow-xs hover:border-indigo-300 cursor-pointer'}
                                `}
                            >
                                <div className={`absolute top-0 left-0 bottom-0 w-1 ${styles.bg.replace('/20', '')}`} />
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-black text-[11px] uppercase tracking-tight text-slate-800 leading-tight pr-2">{v.name[lang]}</h4>
                                    <div className={`shrink-0 px-1.5 py-0.5 rounded border ${styles.border} ${styles.bg} ${styles.text} text-[7px] font-black uppercase flex items-center gap-0.5`}>
                                        {styles.icon} {styles.label}
                                    </div>
                                </div>
                                
                                <p className="text-[9px] font-medium text-slate-400 line-clamp-1 mb-2 italic leading-tight">{v.desc[lang]}</p>
                                
                                <div className="flex items-center gap-1.5">
                                    <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                                        <button onClick={(e) => { e.stopPropagation(); setPendingQuantity(Math.max(1, pendingQuantity - 1)); }} className="w-5 h-5 flex items-center justify-center hover:bg-white rounded transition-all text-slate-500 hover:text-indigo-600"><Minus size={10}/></button>
                                        <span className="w-5 text-center text-[11px] font-black text-slate-700">{pendingQuantity}</span>
                                        <button onClick={(e) => { e.stopPropagation(); setPendingQuantity(pendingQuantity + 1); }} className="w-5 h-5 flex items-center justify-center hover:bg-white rounded transition-all text-slate-500 hover:text-indigo-600"><Plus size={10}/></button>
                                    </div>
                                    <button 
                                        disabled={isPreviewLoading} 
                                        onClick={(e) => { e.stopPropagation(); addToPacket(v, pendingQuantity); }} 
                                        className={`flex-1 py-1.5 text-white rounded-lg text-[9px] font-black uppercase transition-all shadow-xs active:scale-95 disabled:opacity-50 ${setupMode === 'donow' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                                    >
                                        {isPreviewLoading && isPreviewed ? '...' : `Lägg till ${pendingQuantity}`}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
        </div>

        {/* PANE 3: Workspace */}
        <div className="flex-1 p-8 flex flex-col overflow-hidden relative">
          <div className="flex justify-center mb-6 gap-4">
              <div className="bg-white/80 backdrop-blur-md p-1 rounded-2xl shadow-xl flex gap-1 border border-white">
                  <button onClick={() => setCanvasMode('studio')} className={`px-8 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all ${canvasMode === 'studio' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><Zap size={14}/> Studio</button>
                  {setupMode === 'worksheet' && <button onClick={() => setCanvasMode('layout')} className={`px-8 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all ${canvasMode === 'layout' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}><LayoutGrid size={14}/> Layout</button>}
              </div>
              
              {canvasMode === 'layout' && (
                <div className="flex gap-2">
                    <div className="relative">
                        <button 
                            disabled={isRegeneratingAll || packet.length === 0}
                            onClick={() => setIsGlobalShuffleOpen(!isGlobalShuffleOpen)} 
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-slate-800 bg-slate-800 text-white transition-all text-[10px] font-black uppercase shadow-lg hover:bg-slate-700 disabled:opacity-50 active:scale-95"
                        >
                            {isRegeneratingAll ? <Loader2 size={14} className="animate-spin" /> : <Shuffle size={14} />} 
                            {t.regenerate_all}
                        </button>

                        {isGlobalShuffleOpen && (
                            <div className="absolute top-12 right-0 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 w-56 z-[60] flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-200">
                                <button 
                                    onClick={async () => { setIsGlobalShuffleOpen(false); await batchShuffle('numbers'); }}
                                    className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-700 hover:text-indigo-600"
                                >
                                    <Calculator size={14} /> {lang === 'sv' ? "Bara Siffror/Värden" : "Numbers Only"}
                                </button>
                                <button 
                                    onClick={async () => { setIsGlobalShuffleOpen(false); await batchShuffle('stories'); }}
                                    className="w-full text-left px-4 py-2.5 hover:bg-amber-50 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-700 hover:text-amber-600"
                                >
                                    <Type size={14} /> {lang === 'sv' ? "Bara Textberättelser" : "Word Problems Only"}
                                </button>
                                <div className="h-px bg-slate-100 my-1 mx-2" />
                                <button 
                                    onClick={async () => { setIsGlobalShuffleOpen(false); await batchShuffle('both'); }}
                                    className="w-full text-left px-4 py-2.5 hover:bg-rose-50 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-rose-600"
                                >
                                    <RefreshCcw size={14} /> {lang === 'sv' ? "Slumpa Allt (Båda)" : "Reshuffle Both"}
                                </button>
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={() => {
                            const nextSpacingState = !showWorkArea;
                            setShowWorkArea(nextSpacingState);
                            setIsSaved(false);
                            setPacket(packet.map(item => ({
                                ...item,
                                showWorkArea: nextSpacingState 
                            })));
                        }} 
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all text-[10px] font-black uppercase shadow-lg select-none cursor-pointer ${
                            showWorkArea 
                                ? 'bg-white border-indigo-600 text-indigo-600 hover:bg-indigo-50/50' 
                                : 'bg-slate-800 border-slate-800 text-white hover:bg-slate-700'
                        }`}
                        title={showWorkArea ? "Ändra till kompakt layout" : "Ändra till rymlig layout"}
                    >
                        <Square size={14} fill={showWorkArea ? "currentColor" : "none"} /> 
                        {showWorkArea ? t.spacious : t.compact}
                    </button>
                </div>
              )}
          </div>

          {canvasMode === 'studio' ? (
              <div className="flex-1 bg-white rounded-[3rem] shadow-2xl border border-slate-300 overflow-hidden flex flex-col mx-auto w-full max-w-2xl animate-in zoom-in-95 duration-300">
                  <div className="px-8 py-5 bg-slate-900 text-white flex justify-between items-center"><span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                    {t.board_label}</span>{activePreviewKey && <button onClick={() => triggerPreview(activePreviewKey)} className="text-[10px] bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full font-black uppercase flex items-center gap-2 transition-all">
                        <RefreshCcw size={12}/> {t.new_example}</button>}
                        </div>
                  <div className="p-12 flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center">
                    {isPreviewLoading ? <div className="h-full flex items-center justify-center">
                        <Loader2 className="animate-spin text-indigo-600" size={48} />
                        </div> : !previewData ? <div className="h-full flex items-center justify-center text-slate-200 uppercase font-black tracking-widest italic">
                            {t.select_hint}
                            </div> : <div className="w-full space-y-12 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="w-full flex justify-center drop-shadow-md">
                                    <VisualRenderer 
                                        data={previewData?.renderData} 
                                        isWordProblem={useWordProblems} 
                                    />
                                </div>
                                    <div className="text-2xl text-slate-800 font-bold text-center px-10 leading-relaxed">
                                        <MathDisplay content={previewData.renderData.description} />
                                        </div>{previewData.renderData.latex && <div className="text-4xl text-indigo-600 bg-indigo-50/50 p-10 rounded-[2.5rem] border-2 border-indigo-100 shadow-inner text-center font-serif">
                                        <MathDisplay content={`$$${previewData.renderData.latex}$$`} />
                                        </div>}{renderOptions(previewData.renderData?.options)}
                                    </div>}
                </div>
              </div>
          ) : (
              /* WORKSHEET ZOOMED OUT VIEW */
              <div className="flex-1 overflow-auto custom-scrollbar pb-24 flex justify-center items-start bg-slate-200/50 p-4 rounded-[3rem]">
                  <div 
                    className="bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[15mm] flex flex-col animate-in slide-in-from-bottom-6 origin-top"
                    style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}
                  >
                      <header className="border-b-2 border-black pb-2 mb-4 flex items-end justify-between"><h1 className="text-lg font-black uppercase tracking-tighter w-1/3 truncate italic leading-none">{sheetTitle || "Matematik"}</h1><div className="flex gap-6 w-2/3 justify-end text-[10px] font-black uppercase tracking-widest"><div className="border-b-2 border-slate-100 pb-1 flex gap-2 flex-1 max-w-[200px]"><span>{t.name_label}</span><div className="flex-1" /></div><div className="border-b-2 border-slate-100 pb-1 flex gap-2 w-[120px]"><span>{t.date_label}</span><div className="flex-1" /></div></div></header>
                      <div className={`grid grid-cols-6 gap-x-8 ${showWorkArea ? 'gap-y-6' : 'gap-y-1'} items-start content-start`}>
                          {packet.map((item, idx) => {
                                const displayStory = item.showText !== false;
                                const displayLatex = item.showLatex !== false;
                                const displayVisual = item.showVisual !== false;

                                return (
                                    <React.Fragment key={item.id}>
                                        {displayStory && (item.instructionMode === 'header' || !item.instructionMode) && (
                                            <div className={`col-span-6 border-l-4 border-indigo-500 pl-4 bg-slate-50/50 rounded-r-2xl shadow-sm ${showWorkArea ? 'py-3 mt-6 mb-2' : 'py-1 mt-2 mb-0'}`}>
                                                <div className="text-[11px] font-black text-slate-800 italic uppercase tracking-tight">
                                                    <MathDisplay content={compileAnchoredStory(item, lang)} />
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div 
                                            draggable 
                                            onDragStart={(e) => handleDragStartUnified(e, idx)} 
                                            onDragOver={(e) => handleDragOverUnified(e, idx)} 
                                            onDragEnd={handleDragEndUnified} 
                                            className={`relative group border-2 rounded-2xl transition-all flex flex-col h-full cursor-move ${getColSpanClass(item.columnSpan)} ${showWorkArea ? 'p-4' : 'px-4 py-1'} ${draggedIdx === idx ? 'opacity-20 border-indigo-500 bg-indigo-50 scale-95' : 'border-transparent hover:border-dashed hover:border-indigo-300'}`}
                                        >
                                            <div className="absolute top-2 left-2 text-slate-200 opacity-0 group-hover:opacity-100"><GripVertical size={14} /></div>
                                            
                                            <div className="absolute -top-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 z-30 transition-all gap-1.5">
                                                <div className="bg-white shadow-2xl rounded-full p-1 flex gap-1 border border-slate-200">
                                                    <button onClick={(e) => { e.stopPropagation(); updatePacketItem(item.id, 'columnSpan', item.columnSpan === 2 ? 3 : item.columnSpan === 3 ? 6 : 2); }} className="bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-full italic">W</button>
                                                    <button onClick={(e) => { e.stopPropagation(); const modes = ['header', 'inline', 'hidden']; const next = modes[(modes.indexOf(item.instructionMode || 'header') + 1) % 3]; updatePacketItem(item.id, 'instructionMode', next); }} className={`p-1.5 rounded-full transition-all ${item.instructionMode === 'inline' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'}`}><AlignLeft size={12} /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); setPacket(packet.filter(p => p.id !== item.id)); }} className="bg-rose-500 text-white p-1.5 rounded-full hover:bg-rose-600"><Trash2 size={12} /></button>
                                                </div>
                                            </div>
                                            
                                            <div className="text-sm flex flex-col h-full justify-between">
                                                <div>
                                                    <div className="font-black mb-1 text-slate-300 text-[10px] tracking-widest">{idx + 1}.</div>
                                                    
                                                    {displayStory && item.instructionMode === 'inline' && (
                                                        <div className="text-[11px] font-bold text-slate-800 mb-2 leading-tight border-b border-slate-100 pb-2">
                                                            <MathDisplay content={compileAnchoredStory(item, lang)} />
                                                        </div>
                                                    )}
                                                    
                                                    {displayLatex && item.resolvedData?.renderData.latex && (
                                                        <div className={`${showWorkArea ? 'py-4' : 'py-1'} text-center font-serif text-lg`}>
                                                            <MathDisplay content={`$$${item.resolvedData.renderData.latex}$$`} />
                                                        </div>
                                                    )}
                                                    
                                                    {renderOptions(item.resolvedData?.renderData?.options, true)}
                                                    
                                                    {displayVisual && (
                                                        <div className="flex justify-center scale-90 origin-top mt-2">
                                                            <VisualRenderer 
                                                                data={item.resolvedData?.renderData} 
                                                                isWordProblem={item.selectedStoryIndex !== null && item.selectedStoryIndex !== undefined} 
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div>
                                                    <div className="mt-auto pt-4">
                                                        {showWorkArea ? <div className="min-h-[100px] border-b-2 border-dotted border-slate-100" /> : <div className="h-0" />}
                                                    </div>

                                                    <div className="opacity-0 group-hover:opacity-100 transition-all flex flex-col gap-2 pt-3 border-t border-slate-100 mt-3 z-40 relative">
                                                        
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    try {
                                                                        // Check the item's historical state
                                                                        const isItemWP = item.selectedStoryIndex !== null && item.selectedStoryIndex !== undefined;
                                                                        
                                                                        const res = await fetch(`/api/question?topic=${item.topicId}&variation=${item.variationKey}&lang=${lang}&wordProblem=${isItemWP}`);
                                                                        const data = await res.json();
                                                                        setPacket(packet.map(p => p.id === item.id ? { 
                                                                            ...p, 
                                                                            resolvedData: data,
                                                                            selectedStoryIndex: p.selectedStoryIndex !== undefined && p.selectedStoryIndex !== null ? p.selectedStoryIndex : 0 
                                                                        } : p));
                                                                        setIsSaved(false);
                                                                    } catch (err) { console.error("Number shuffle failed:", err); }
                                                                }}
                                                                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 hover:border-indigo-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer"
                                                                title="Slumpa siffror (Behåll nuvarande texttema)"
                                                            >
                                                                <Calculator size={12} /> {lang === 'sv' ? "Slumpa Tal" : "Shuffle Numbers"}
                                                            </button>

                                                            {item.resolvedData?.renderData?.availableStories && item.resolvedData.renderData.availableStories.length > 1 && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const totalStories = item.resolvedData.renderData.availableStories.length;
                                                                        const currentStoryIdx = item.selectedStoryIndex !== undefined && item.selectedStoryIndex !== null ? item.selectedStoryIndex : 0;
                                                                        let newIndex = Math.floor(Math.random() * totalStories);
                                                                        if (newIndex === currentStoryIdx) {
                                                                            newIndex = (newIndex + 1) % totalStories;
                                                                        }
                                                                        updatePacketItem(item.id, 'selectedStoryIndex', newIndex);
                                                                    }}
                                                                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-amber-600 hover:bg-amber-50/50 hover:border-amber-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer"
                                                                    title="Slumpa fram en helt ny textkontext för denna fråga"
                                                                >
                                                                    <Shuffle size={12} /> {lang === 'sv' ? "Slumpa Text" : "Shuffle Story"}
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div className="flex justify-end gap-2">
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); updatePacketItem(item.id, 'showText', !displayStory); }}
                                                                className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all cursor-pointer ${displayStory ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100/70' : 'bg-slate-50 border-slate-100 text-slate-400 line-through'}`}
                                                            >
                                                                <Type size={12} /> Text
                                                            </button>

                                                            {item.resolvedData?.renderData.latex && (
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); updatePacketItem(item.id, 'showLatex', !displayLatex); }}
                                                                    className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all cursor-pointer ${displayLatex ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100/70' : 'bg-slate-50 border-slate-100 text-slate-400 line-through'}`}
                                                                >
                                                                    <Calculator size={12} /> LaTeX
                                                                </button>
                                                            )}

                                                            {(item.resolvedData?.renderData.geometry || item.resolvedData?.renderData.graph || item.resolvedData?.renderData.pattern) && (
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); updatePacketItem(item.id, 'showVisual', !displayVisual); }}
                                                                    className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all cursor-pointer ${displayVisual ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100/70' : 'bg-slate-50 border-slate-100 text-slate-400 line-through'}`}
                                                                >
                                                                    <ImageIcon size={12} /> {lang === 'sv' ? "Figur" : "Visual"}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                      </div>
                  </div>
              </div>
          )}
        </div>

        {/* PANE 4: Selected Questions */}
        <div className={`bg-white/90 backdrop-blur-sm border-l border-slate-300 flex flex-col shadow-2xl shrink-0 transition-all duration-300 ${isPane4Collapsed ? 'w-16' : 'w-72'}`}>
          <div className={`p-4 border-b flex items-center ${isPane4Collapsed ? 'justify-center' : 'justify-between'} bg-slate-50/80`}>
              {!isPane4Collapsed && (
                <div className="flex items-center gap-2">
                    <Layers size={14} className="text-slate-400" />
                    <h2 className="text-[12px] font-black uppercase tracking-widest text-slate-800">{t.selected_questions}</h2>
                    <div className="bg-slate-900 text-white px-2 py-0.5 rounded-lg text-[9px] font-black">{packet.length}</div>
                </div>
              )}
              <button onClick={() => setIsPane4Collapsed(!isPane4Collapsed)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-800 hover:text-indigo-600 transition-colors">
                {isPane4Collapsed ? <PanelRightOpen size={20} /> : <PanelRightClose size={20} />}
              </button>
          </div>

          {!isPane4Collapsed && (
            <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
                <div className="p-3 border-b flex justify-end">
                    <button onClick={() => { if(window.confirm(t.clear_all + "?")) setPacket([]); }} className="text-slate-800 hover:text-rose-500 transition-colors flex items-center gap-1 text-[14px] font-black uppercase tracking-widest"><Eraser size={14}/> {t.clear_all}</button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-slate-50/30">
                    {packet.map((item, idx) => (
                        <div 
                        key={item.id}
                        draggable 
                        onDragStart={(e) => handleDragStartUnified(e, idx)}
                        onDragOver={(e) => handleDragOverUnified(e, idx)}
                        onDragEnd={handleDragEndUnified}
                        className={`p-3 border rounded-xl flex justify-between items-center group shadow-sm transition-all select-none
                            ${draggedItemIndex === idx 
                                ? 'opacity-30 bg-indigo-50 border-indigo-400 border-dashed scale-[0.98]' 
                                : 'bg-white border-slate-200 hover:shadow-md hover:border-slate-300 cursor-grab active:cursor-grabbing'
                            }`}
                    >
                        {/* 🟢 FIXED: Changed to items-start and added flex-1 w-full so the text wraps and clamps properly */}
                        <div className="flex items-start gap-2 min-w-0 flex-1 w-full">
                            <GripVertical size={12} className="text-slate-800 shrink-0 group-hover:text-slate-400 transition-colors mt-1" />
                            <div className="min-w-0 flex-1">
                                {/* 1. Header Row: Number, Mode Indicator, and Topic Title */}
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[14px] font-black text-slate-900">#{idx + 1}</span>
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.instructionMode === 'header' ? 'bg-indigo-500' : item.instructionMode === 'inline' ? 'bg-amber-500' : 'bg-slate-200'}`} />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">
                                        {item.name}
                                    </span>
                                </div>
                                
                                {/* 2. Content Row: The actual question text, clamped to 2 lines */}
                                <div className="text-[11px] font-bold text-slate-700 leading-tight pr-2">
                                    <MathDisplay 
                                        content={compileAnchoredStory(item, lang, true)} 
                                        className="!whitespace-normal line-clamp-2" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setPacket(packet.filter(p => p.id !== item.id)); }}
                                className="p-1 text-slate-900 hover:text-rose-500 transition-colors rounded-lg"
                                title={t.delete_task}
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {setupMode === 'worksheet' && (
                    <div className="p-4 border-t bg-white space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-black uppercase text-slate-800 tracking-widest">
                                {t.answer_key_toggle}
                                </span>
                                <button onClick={() => setIncludeAnswerKey(!includeAnswerKey)} className={`w-10 h-5 rounded-full transition-all relative p-1 ${includeAnswerKey ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                    <div className={`w-3 h-3 bg-white rounded-full transition-all shadow-sm ${includeAnswerKey ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                        </div>
                        {includeAnswerKey && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 space-y-2">
                                <label className="text-[12px] font-black uppercase text-slate-800 block">{t.answer_style_label}
                                    </label>
                                    <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
                                        <button onClick={() => setAnswerKeyStyle('compact')} className={`py-1 rounded-md text-[12px] font-black uppercase transition-all ${answerKeyStyle === 'compact' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>
                                            Kompakt
                                            </button>
                                            <button onClick={() => setAnswerKeyStyle('detailed')} className={`py-1 rounded-md text-[12px] font-black uppercase transition-all ${answerKeyStyle === 'detailed' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Steg</button></div></div>)}
                    </div>
                )}
                
            </div>
          )}
        </div>
      </div>
      {showPresentation && (
                    <PresentationView 
                        packet={packet} 
                        sheetTitle={sheetTitle} 
                        lang={lang} 
                        onClose={() => setShowPresentation(false)} 
                    />
                )}
      <BackgroundWave /> 
    </div>
  );
}