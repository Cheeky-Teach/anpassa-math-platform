import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronRight, ChevronLeft, Plus, Trash2, Layout, Send, Info, Layers, Search, Zap, 
  FileText, Grid3X3, RefreshCcw, Loader2, Maximize2, AlertTriangle, 
  Minus, Eye, Settings2, Printer, Square, Type, Shuffle, Save, Eraser, Clock,
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, X, Globe, Building2, Lock, Copy, Check, Filter,
  MoreVertical, AlignLeft, LayoutGrid, EyeOff, GripVertical, Brain, Calculator, Target, 
  Image as ImageIcon, FileText as TextIcon, Monitor, ChevronDown
} from 'lucide-react';
import { SKILL_BUCKETS } from '../../constants/skillBuckets.js';
import VisualRenderer from '../visuals/VisualRenderer.jsx';
import { supabase } from '../../lib/supabaseClient'; 
import PresentationView from '../views/PresentationView.jsx';

//  CRITICAL: Imports Universal Theme and Preferences Toggle
import '../../styles/theme.css'; 
import PreferencesToggle from '../ui/PreferencesToggle';

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

const compileAnchoredStory = (item, lang = 'sv', includeLatex = false) => {
    const rd = item.resolvedData?.renderData || item.resolvedData;
    
    if (item.selectedStoryIndex === undefined || item.selectedStoryIndex === null || !rd?.availableStories) {
        const desc = rd?.description;
        const finalDesc = typeof desc === 'object' && desc !== null ? desc[lang] : desc;
        
        if (includeLatex && rd?.latex) {
            return finalDesc ? `${finalDesc} $${rd.latex}$` : `$${rd.latex}$`;
        }
        
        return finalDesc || item.name;
    }

    const storyPackage = rd.availableStories[item.selectedStoryIndex];
    if (!storyPackage) return rd?.description || item.name;
    
    let template = storyPackage[lang === 'en' ? 'en' : 'sv'];
    let params = rd.extractedParams;

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

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            const cleanValue = String(value).replace(/[()]/g, '');
            template = template.replace(new RegExp(`\\{${key}\\}`, 'g'), cleanValue);
        });
    }

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
      present: "Presentera",
      new_donow: "Nytt Do Now", new_worksheet: "Nytt Arbetsblad",
      new_board: "Ny Presentation", board_title: "Presentation", 
      trash: "Papperskorg", new_folder: "Ny Mapp", folder: "Mapp",
      filter_all: "Alla", create_folder_title: "Skapa ny mapp",
      folder_name_placeholder: "Mappnamn...", cancel: "Avbryt", create: "Skapa",
      move_file: "Flytta fil", root_dir: "Start (Hem)",
      trash_empty: "Papperskorgen är tom.", no_files: "Inga filer hittades här.",
      restore: "Återställ", hard_delete: "Radera permanent"
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
      present: "Present",
      new_donow: "New Do Now", new_worksheet: "New Worksheet",
      new_board: "New Board", board_title: "Board", 
      trash: "Trash", new_folder: "New Folder", folder: "Folder",
      filter_all: "All", create_folder_title: "Create new folder",
      folder_name_placeholder: "Folder name...", cancel: "Cancel", create: "Create",
      move_file: "Move file", root_dir: "Root directory",
      trash_empty: "Trash is empty.", no_files: "No files found here.",
      restore: "Restore", hard_delete: "Delete permanently"
    }
  }[lang];

  // --- STATE ---
  const [isPane1Collapsed, setIsPane1Collapsed] = useState(false); 
  const [isPane4Collapsed, setIsPane4Collapsed] = useState(false);
  const [setupMode, setSetupMode] = useState(studioMode); 
  const [activeSheetId, setActiveSheetId] = useState(null); 
  const [activeBoardSheet, setActiveBoardSheet] = useState(null);

  const [savedSheets, setSavedSheets] = useState([]);
  const [libraryTab, setLibraryTab] = useState('private'); 
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const [canvasMode, setCanvasMode] = useState('studio'); 
  const [globalLatexSize, setGlobalLatexSize] = useState('md');
  const [workspaceHeight, setWorkspaceHeight] = useState(3);
  const [workspaceStyle, setWorkspaceStyle] = useState('blank');
  const [layoutStyle, setLayoutStyle] = useState('open');
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

  // Live Session Pre-Flight States
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [liveSettings, setLiveSettings] = useState({ pacing: 'open', order: 'original', summary: true });
  const [enableScratchpad, setEnableScratchpad] = useState(true);

  const [folders, setFolders] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState([]);

  const toggleFolder = (folderId) => {
      setExpandedFolders(prev => prev.includes(folderId) ? prev.filter(id => id !== folderId) : [...prev, folderId]);
  };
  const [isTrashView, setIsTrashView] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showMoveModal, setShowMoveModal] = useState(null); 

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
  useEffect(() => { fetchLibrary(); }, [setupMode, libraryTab, isTrashView]);

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
                    <div key={i} className="flex items-center gap-2 text-[11px] bg-[var(--bg-surface)] border border-[var(--border-main)] p-2 rounded-[var(--radius-btn)]">
                        <span className="font-black text-[var(--primary-color)]">{labels[i]}</span>
                        <MathDisplay content={choiceLabel} />
                    </div>
                );
            })}
        </div>
    );
  };

  const getVariationCategory = (key) => {
    const k = key.toLowerCase();
    if (['graph', 'plot', 'geom', 'volume', 'shape', 'area', 'perimeter', 'angle', 'pattern', 'table', 'marbles', 'spinner', 'tree'].some(kw => k.includes(kw))) return 'visual';
    if (['calc', 'std', 'solve'].some(kw => k.includes(kw))) return 'calculate';
    if (['concept', 'theory', 'foundations', 'id', 'inverse'].some(kw => k.includes(kw))) return 'conceptual';
    if (['lie', 'spot', 'error', 'check'].some(kw => k.includes(kw))) return 'logic';
    return 'default';
  };

  //  FIXED: Converted internal map to use Native Universal Variables safely
  const getCategoryStyles = (type) => {
    const styles = {
        visual: { border: 'border-[var(--theme-indigo-border)]', bg: 'bg-[var(--theme-indigo-bg)]', text: 'text-[var(--theme-indigo-text)]', icon: <ImageIcon size={10} />, label: t.type_visual },
        calculate: { border: 'border-[var(--theme-emerald-border)]', bg: 'bg-[var(--theme-emerald-bg)]', text: 'text-[var(--theme-emerald-text)]', icon: <Calculator size={10} />, label: t.type_calc },
        conceptual: { border: 'border-[var(--theme-amber-border)]', bg: 'bg-[var(--theme-amber-bg)]', text: 'text-[var(--theme-amber-text)]', icon: <Brain size={10} />, label: t.type_concept },
        logic: { border: 'border-[var(--theme-rose-border)]', bg: 'bg-[var(--theme-rose-bg)]', text: 'text-[var(--theme-rose-text)]', icon: <Target size={10} />, label: t.type_logic },
        default: { border: 'border-[var(--border-strong)]', bg: 'bg-[var(--bg-surface)]', text: 'text-[var(--text-muted)]', icon: <TextIcon size={10} />, label: t.type_text }
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

  // --- DATABASE & API LOGIC ---
  const fetchLibrary = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    setIsLibraryLoading(true);
    try {
        if (libraryTab === 'private' && !isTrashView) {
            const { data: folderData, error: folderError } = await supabase.from('folders').select('*').eq('user_id', user.id).order('name');
            if (!folderError) setFolders(folderData || []);
        } else {
            setFolders([]);
        }

        let query = supabase.from('saved_sheets').select('*').order('updated_at', { ascending: false });
        
        if (libraryTab === 'private') {
            query = query.eq('user_id', user.id);
            if (isTrashView) query = query.not('deleted_at', 'is', null);
            else query = query.is('deleted_at', null);
        } else if (libraryTab === 'school') {
            query = query.eq('visibility', 'school').eq('school_name', profile?.school_name).is('deleted_at', null);
        } else {
            query = query.eq('visibility', 'public').is('deleted_at', null);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        setSavedSheets(data || []);
    } catch (err) { console.error(err); } finally { setIsLibraryLoading(false); }
  };

  const handleSave = async () => {
      if (!sheetTitle) { alert(t.title_placeholder); return; }
      try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const uniqueTopics = [...new Set(packet.map(q => q.topicId))];
          const uniqueLevels = [...new Set(packet.map(q => q.resolvedData?.level || 1))];
          
          const sheetData = { 
              user_id: user.id, title: sheetTitle, type: setupMode, folder_id: null, packet: packet, 
              config: { globalLatexSize, workspaceHeight, workspaceStyle, layoutStyle, lang, includeAnswerKey, answerKeyStyle }, 
              visibility: chosenVisibility, school_name: profile?.school_name || null, 
              auto_topics: uniqueTopics, auto_levels: uniqueLevels, updated_at: new Date().toISOString()
          };

          const { data, error } = activeSheetId 
              ? await supabase.from('saved_sheets').update(sheetData).eq('id', activeSheetId).select().single()
              : await supabase.from('saved_sheets').insert([sheetData]).select().single();

          if (error) throw error;
          setActiveSheetId(data.id); setIsSaved(true); alert(t.save_success); fetchLibrary(); 
      } catch (err) { alert("Fel vid sparande: " + err.message); }
  };

  const handleCreateFolder = async () => {
      if (!newFolderName.trim()) return;
      try {
          const { data: { user } } = await supabase.auth.getUser();
          const { error } = await supabase.from('folders').insert([{ user_id: user.id, name: newFolderName }]);
          if (error) throw error;
          setNewFolderName(''); setShowFolderModal(false); fetchLibrary();
      } catch (err) { alert("Kunde inte skapa mapp: " + err.message); }
  };

  const handleMoveSheet = async (sheetId, targetFolderId) => {
      try {
          const { error } = await supabase.from('saved_sheets').update({ folder_id: targetFolderId }).eq('id', sheetId);
          if (error) throw error;
          setShowMoveModal(null); fetchLibrary();
      } catch (err) { alert("Kunde inte flytta filen: " + err.message); }
  };

  const handleDeleteFolder = async (folderId) => {
      try {
          const { error } = await supabase.from('folders').delete().eq('id', folderId);
          if (error) alert(lang === 'sv' ? "Mappen måste vara tom innan den kan raderas." : "Folder must be empty before deleting.");
          else fetchLibrary();
      } catch (err) { console.error(err); }
  };

  const handleSoftDelete = async (e, id) => {
      e.stopPropagation();
      try { await supabase.from('saved_sheets').update({ deleted_at: new Date().toISOString() }).eq('id', id); fetchLibrary(); } catch (err) { console.error(err); }
  };

  const handleRestore = async (e, id) => {
      e.stopPropagation();
      try { await supabase.from('saved_sheets').update({ deleted_at: null }).eq('id', id); fetchLibrary(); } catch (err) { console.error(err); }
  };

  const handleHardDelete = async (e, id) => {
      e.stopPropagation(); 
      if (!window.confirm(t.delete_confirm)) return;
      try {
          const { error } = await supabase.from('saved_sheets').delete().eq('id', id);
          if (error) throw error;
          fetchLibrary();
      } catch (err) { alert("Kunde inte radera: " + err.message); }
  };

  const handleClone = async (sheetId) => {
    const { data: { user } } = await supabase.auth.getUser();
    try {
        const { error } = await supabase.rpc('clone_worksheet', { target_id: sheetId, new_user_id: user.id });
        if (error) throw error;
        alert(t.clone_success); setLibraryTab('private'); fetchLibrary();
    } catch (err) { alert("Kunde inte kopiera."); }
  };

  const loadBoard = (sheet) => {
      setActiveBoardSheet(sheet);
      setShowPresentation(true);
  };

  const loadSheet = (sheet) => {
      // Intercept Presentation Boards and route them safely to the standalone viewer!
      if (sheet.type === 'board') {
          loadBoard(sheet);
          return;
      }
      
      // 🟢 FIX: If we are loading a Worksheet/DoNow, explicitly clear any lingering Board state!
      setActiveBoardSheet(null); 

      setPacket(sheet.packet); setSheetTitle(sheet.title); setSetupMode(sheet.type); setActiveSheetId(sheet.id); 
      setChosenVisibility(sheet.visibility || 'private'); setIsSaved(true);
      if (sheet.config?.includeAnswerKey !== undefined) setIncludeAnswerKey(sheet.config.includeAnswerKey);
      if (sheet.config?.answerKeyStyle !== undefined) setAnswerKeyStyle(sheet.config.answerKeyStyle);
      if (sheet.config?.globalLatexSize !== undefined) setGlobalLatexSize(sheet.config.globalLatexSize);
      if (sheet.config?.layoutStyle !== undefined) setLayoutStyle(sheet.config.layoutStyle);
      if (sheet.config?.workspaceStyle !== undefined) setWorkspaceStyle(sheet.config.workspaceStyle);
      if (sheet.config?.workspaceHeight !== undefined) setWorkspaceHeight(sheet.config.workspaceHeight);
      else if (sheet.config?.showWorkArea !== undefined) setWorkspaceHeight(sheet.config.showWorkArea ? 3 : 0);
      else setWorkspaceHeight(0);
  };

  const handleLaunchGrid = () => { 
      if (!isSaved && !window.confirm(t.unsaved_warning)) return; 
      const gridPacket = packet.map(item => ({ ...item, _globalLatexSize: globalLatexSize }));
      onDoNowGenerate({ title: sheetTitle, globalLatexSize, includeAnswerKey, answerKeyStyle }, gridPacket); 
  };

  const handleLaunchPrint = () => { 
      if (!isSaved && !window.confirm(t.unsaved_warning)) return; 
      const printPacket = packet.map(item => ({
          ...item, _globalLatexSize: globalLatexSize, _workspaceHeight: workspaceHeight, _workspaceStyle: workspaceStyle, _layoutStyle: layoutStyle
      }));
      onWorksheetGenerate(printPacket, { title: sheetTitle, globalLatexSize, workspaceHeight, workspaceStyle, layoutStyle, includeAnswerKey, answerKeyStyle }); 
  };
  
  const handleLaunchLive = () => {
    if (!isSaved && !window.confirm(t.unsaved_warning)) return;
    setShowLiveModal(true);
  };

  const confirmLaunchLive = async () => {
    setShowLiveModal(false);
    const { data: { user } } = await supabase.auth.getUser();
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
        const { data, error } = await supabase.from('rooms').insert([{ 
            teacher_id: user.id, 
            class_code: code, 
            status: 'active', 
            title: sheetTitle || "Live Session", 
            active_worksheet_id: activeSheetId, 
            active_question_data: { packet: packet, mode: setupMode, settings: { ...liveSettings, scratchpad: enableScratchpad } }
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
            const res = await fetch(`/api/question?topic=${selectedTopicId}&variation=${variation.key}&lang=${lang}&wordProblem=${useWordProblems}`);
            const data = await res.json();
            const isFirstInBatch = i === 0;
            newItems.push({ 
                id: crypto.randomUUID(), topicId: selectedTopicId, variationKey: variation.key, name: variation.name[lang] || variation.name.sv, 
                columnSpan: useWordProblems ? 6 : (isFirstInBatch ? 6 : 2), resolvedData: data, instructionMode: useWordProblems ? 'inline' : (isFirstInBatch ? 'header' : 'hidden'),
                showLatex: !useWordProblems, showVisual: !useWordProblems, selectedStoryIndex: useWordProblems ? 0 : null
            });
        }
        if (setupMode === 'donow' && packet.length + newItems.length > 6) { alert("Do Now max 6."); return; }
        setPacket(prev => [...prev, ...newItems]); setPendingQuantity(1);
    } catch (err) { alert(err.message); } finally { setIsPreviewLoading(false); }
  };

  const batchShuffle = async (mode) => {
        if (packet.length === 0 || isRegeneratingAll) return;
        setIsRegeneratingAll(true);
        try {
            const updatedPacket = await Promise.all(packet.map(async (item) => {
                if (!item.topicId || !item.variationKey) return item;
                const isItemWP = item.selectedStoryIndex !== null && item.selectedStoryIndex !== undefined;
                if (mode === 'stories') {
                    const rd = item.resolvedData?.renderData;
                    if (!rd?.availableStories || rd.availableStories.length <= 1) return item;
                    const newIndex = Math.floor(Math.random() * rd.availableStories.length);
                    return { ...item, selectedStoryIndex: newIndex };
                }
                const res = await fetch(`/api/question?topic=${item.topicId}&variation=${item.variationKey}&lang=${lang}&wordProblem=${isItemWP}`);            
                const data = await res.json();
                let nextStoryIdx = null;
                if (isItemWP) {
                    if (mode === 'both' && data.renderData?.availableStories) {
                        nextStoryIdx = Math.floor(Math.random() * data.renderData.availableStories.length);
                    } else {
                        nextStoryIdx = item.selectedStoryIndex; 
                    }
                }
                return { ...item, id: mode === 'both' ? crypto.randomUUID() : item.id, selectedStoryIndex: nextStoryIdx, resolvedData: data };
            }));
            setPacket(updatedPacket); setIsSaved(false);
        } catch (err) { console.error(err); } finally { setIsRegeneratingAll(false); }
  };

  const updatePacketItem = (id, key, val) => { setPacket(packet.map(p => p.id === id ? { ...p, [key]: val } : p)); setIsSaved(false); };
  
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

  const getSheetIconStyle = (type, size = 12) => {
      if (type === 'board') return { theme: 'theme-amber', icon: <Monitor size={size} /> };
      if (type === 'donow') return { theme: 'theme-indigo', icon: <Grid3X3 size={size} /> };
      return { theme: 'theme-emerald', icon: <FileText size={size} /> };
  };

  // =========================================================================
  //  SETUP MODE (CLOUD DRIVE LAYOUT)
  // =========================================================================
  if (!setupMode) {
        return (
            <div className="flex flex-row h-full w-full overflow-hidden relative bg-[var(--bg-canvas)] text-[var(--text-main)]">
                
                {/* 1. LEFT SIDEBAR */}
                <div className="w-64 bg-[var(--bg-card)] border-r border-[var(--border-main)] flex flex-col shrink-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                    <div className="p-6 border-b border-[var(--border-main)]">
                        <h2 className="text-xl font-black text-emerald-600 tracking-tighter uppercase italic mb-6">
                            {t.studio}
                        </h2>
                        
                        {/* Create Buttons (Brand Protected) */}
                        <div className="flex flex-col gap-2">
                            <button 
                                onClick={() => { 
                                    setActiveBoardSheet(null); 
                                    setShowPresentation(true); 
                                }} 
                                className="w-full py-2.5 bg-amber-500 text-slate-900 rounded-[var(--radius-btn)] font-black text-xs uppercase tracking-widest hover:bg-amber-600 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Plus size={14} /> {t.new_board}
                            </button>
                            <button 
                                onClick={() => { setSetupMode('donow'); setPacket([]); setSheetTitle(""); setActiveSheetId(null); setChosenVisibility('private'); }} 
                                className="w-full py-2.5 bg-indigo-600 text-white rounded-[var(--radius-btn)] font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Plus size={14} /> {t.new_donow}
                            </button>
                            <button 
                                onClick={() => { setSetupMode('worksheet'); setPacket([]); setSheetTitle(""); setActiveSheetId(null); setChosenVisibility('private'); }} 
                                className="w-full py-2.5 bg-emerald-600 text-white rounded-[var(--radius-btn)] font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Plus size={14} /> {t.new_worksheet}
                            </button>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-1">
                        <p className="px-3 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 mt-2">{t.library_title}</p>
                        
                        <button 
                            onClick={() => { setLibraryTab('private'); setIsTrashView(false); }} 
                            className={`w-full text-left px-3 py-2 rounded-[var(--radius-btn)] text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${libraryTab === 'private' && !isTrashView ? 'bg-[var(--theme-indigo-bg)] text-[var(--theme-indigo-text)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'}`}
                        >
                            <FileText size={16} /> {t.tab_mine}
                        </button>
                        <button 
                            onClick={() => { setLibraryTab('school'); setIsTrashView(false); }} 
                            className={`w-full text-left px-3 py-2 rounded-[var(--radius-btn)] text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${libraryTab === 'school' && !isTrashView ? 'bg-[var(--theme-emerald-bg)] text-[var(--theme-emerald-text)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'}`}
                        >
                            <Building2 size={16} /> {t.tab_school}
                        </button>
                        <button 
                            onClick={() => { setLibraryTab('public'); setIsTrashView(false); }} 
                            className={`w-full text-left px-3 py-2 rounded-[var(--radius-btn)] text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${libraryTab === 'public' && !isTrashView ? 'bg-[var(--theme-blue-bg)] text-[var(--theme-blue-text)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'}`}
                        >
                            <Globe size={16} /> {t.tab_global}
                        </button>

                        <div className="my-4 h-px bg-[var(--border-main)] mx-3"></div>
                        
                        <button 
                            onClick={() => { setLibraryTab('private'); setIsTrashView(true); }} 
                            className={`w-full text-left px-3 py-2 rounded-[var(--radius-btn)] text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${isTrashView ? 'bg-[var(--theme-rose-bg)] text-[var(--theme-rose-text)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'}`}
                        >
                            <Trash2 size={16} /> {t.trash}
                        </button>
                    </div>
                </div>

                {/* 2. MAIN CONTENT AREA (FILE EXPLORER) */}
                <div className="flex-1 flex flex-col relative z-10 min-w-0 bg-[var(--bg-canvas)]">
                    <div className="px-8 pt-8 pb-4 flex justify-between items-end">
                        <div className="flex items-center gap-2 text-xl font-black tracking-tight text-[var(--text-main)]">
                            {isTrashView ? <span>{t.trash}</span> : <span>{libraryTab === 'private' ? t.tab_mine : libraryTab === 'school' ? t.tab_school : t.tab_global}</span>}
                        </div>

                        <div className="flex items-center gap-3">
                            {/*  DROP-IN UNIVERSAL TOGGLE */}
                            <PreferencesToggle />
                            
                            {libraryTab === 'private' && !isTrashView && (
                                <button 
                                    onClick={() => setShowFolderModal(true)}
                                    className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-main)] rounded-[var(--radius-btn)] text-[11px] font-black uppercase tracking-widest hover:border-[var(--brand-solid)] hover:text-[var(--brand-text)] shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                                >
                                    <Plus size={14} /> {t.new_folder}
                                </button>
                            )}
                            <button onClick={onClose} className="px-4 py-2 bg-[var(--theme-rose-bg)] text-[var(--theme-rose-text)] border border-[var(--theme-rose-border)] hover:bg-rose-500 hover:text-white rounded-[var(--radius-btn)] shadow-sm transition-all flex items-center gap-1.5 font-black text-[11px] uppercase tracking-widest cursor-pointer">
                                <X size={14}/> {t.btn_close}
                            </button>
                        </div>
                    </div>

                    {/* Filters Toolbar */}
                    <div className="px-8 py-3 bg-[var(--bg-surface)]/50 border-y border-[var(--border-main)] flex flex-col lg:flex-row justify-between items-center gap-3">
                        <div className="flex items-center gap-2 w-full lg:w-auto">
                            <div className="flex gap-1 p-0.5 bg-[var(--bg-surface-hover)] rounded-lg border border-[var(--border-main)] shadow-inner overflow-x-auto">
                                <button onClick={() => setFilterDocType('all')} className={`px-3 py-1 rounded-md text-[11px] font-black uppercase transition-all shrink-0 cursor-pointer ${filterDocType === 'all' ? 'bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>
                                    {t.filter_all}
                                </button>
                                <button onClick={() => setFilterDocType('board')} className={`px-3 py-1 rounded-md text-[11px] font-black uppercase transition-all shrink-0 flex items-center gap-1 cursor-pointer ${filterDocType === 'board' ? 'bg-[var(--theme-amber-bg)] text-[var(--theme-amber-text)] shadow-sm border border-[var(--theme-amber-border)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>
                                    <Monitor size={12} /> {t.board_title}
                                </button>
                                <button onClick={() => setFilterDocType('worksheet')} className={`px-3 py-1 rounded-md text-[11px] font-black uppercase transition-all shrink-0 flex items-center gap-1 cursor-pointer ${filterDocType === 'worksheet' ? 'bg-[var(--theme-emerald-bg)] text-[var(--theme-emerald-text)] shadow-sm border border-[var(--theme-emerald-border)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>
                                    <FileText size={10} /> {t.worksheet_title}
                                </button>
                                <button onClick={() => setFilterDocType('donow')} className={`px-3 py-1 rounded-md text-[11px] font-black uppercase transition-all shrink-0 flex items-center gap-1 cursor-pointer ${filterDocType === 'donow' ? 'bg-[var(--theme-indigo-bg)] text-[var(--theme-indigo-text)] shadow-sm border border-[var(--theme-indigo-border)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>
                                    <Grid3X3 size={12} /> {t.donow_title}
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex gap-2 items-center w-full lg:w-auto">
                            <div className="relative w-full sm:w-64 group">
                                <Search className="absolute left-2.5 top-2 text-[var(--text-muted)] group-focus-within:text-[var(--primary-color)] transition-colors" size={13} />
                                <input type="text" placeholder={t.search_placeholder} className="w-full pl-8 pr-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-main)] focus:border-[var(--primary-color)] rounded-[var(--radius-btn)] text-sm outline-none transition-all shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                            <div className="relative w-full sm:w-auto bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[var(--radius-btn)] px-2.5 py-1.5 shadow-sm focus-within:border-[var(--primary-color)] transition-all flex items-center gap-1">
                                <Filter size={12} className="text-[var(--text-muted)]" />
                                <select value={filterTopic} onChange={(e) => setFilterTopic(e.target.value)} className="text-[10px] font-black uppercase bg-transparent border-none rounded-md outline-none cursor-pointer pr-4 text-[var(--text-main)]">
                                    <option value="all">{lang === 'sv' ? "Alla Områden" : "All Topics"}</option>
                                    {availableTopics.map(tId => <option key={tId} value={tId}>{getTopicLabel(tId).toUpperCase()}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* File Explorer Table */}
                    <div className="flex-1 overflow-auto custom-scrollbar px-8 py-4">
                        {isLibraryLoading ? (
                            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[var(--primary-color)]" size={32} /></div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[var(--border-main)] text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                                        <th className="pb-3 w-10 text-center"></th>
                                        <th className="pb-3 w-2/5">{t.name_label.replace(':', '')}</th>
                                        <th className="pb-3 w-1/4">{lang === 'sv' ? 'Innehåll' : 'Content'}</th>
                                        <th className="pb-3 text-center w-24">{t.date_label.replace(':', '')}</th>
                                        <th className="pb-3 text-right w-48 pr-4">{lang === 'sv' ? 'Åtgärder' : 'Actions'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-subtle)]">
                                    {/* 1. RENDER FOLDERS */}
                                    {libraryTab === 'private' && !isTrashView && folders.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).map(folder => {
                                        const isExpanded = expandedFolders.includes(folder.id);
                                        const folderFiles = filteredLibrary.filter(sheet => sheet.folder_id === folder.id);

                                        return (
                                            <React.Fragment key={folder.id}>
                                                <tr onClick={() => toggleFolder(folder.id)} className="hover:bg-[var(--bg-surface)] transition-colors group cursor-pointer bg-[var(--bg-canvas)]">
                                                    <td className="py-3 text-center">
                                                        <div className="w-8 h-8 rounded-lg bg-[var(--theme-indigo-bg)] flex items-center justify-center mx-auto text-[var(--theme-indigo-text)] group-hover:bg-[var(--theme-indigo-border)] transition-colors border border-[var(--theme-indigo-border)]">
                                                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 font-black text-[var(--text-main)] text-sm max-w-0">
                                                        <div className="flex items-center gap-2 truncate" title={folder.name}>
                                                            <Layers size={14} className="text-[var(--theme-indigo-text)] shrink-0" /> 
                                                            <span className="truncate">{folder.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{t.folder} ({folderFiles.length})</td>
                                                    <td className="py-3 text-center text-[var(--text-muted)] text-xs">{new Date(folder.created_at).toLocaleDateString()}</td>
                                                    <td className="py-3 text-right pr-4">
                                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }} className="p-2 text-[var(--text-muted)] hover:text-[var(--theme-rose-text)] hover:bg-[var(--theme-rose-bg)] rounded-lg transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-[var(--theme-rose-border)]"><Trash2 size={16}/></button>
                                                    </td>
                                                </tr>

                                                {/* Expanded Files inside this Folder */}
                                                {isExpanded && folderFiles.map(sheet => {
                                                    const style = getSheetIconStyle(sheet.type);
                                                    return (
                                                    <tr key={sheet.id} className="hover:bg-[var(--bg-surface)] transition-colors group bg-[var(--bg-card)]">
                                                        <td className="py-3 text-center relative">
                                                            <div className="w-px h-full bg-[var(--border-strong)] ml-6 absolute -mt-3"></div>
                                                            <div className="w-4 h-px bg-[var(--border-strong)] ml-6 relative z-10 top-1/2"></div>
                                                        </td>
                                                        <td className="py-3 font-bold text-[var(--text-main)] text-sm pl-4 max-w-0">
                                                            <div className="flex items-center gap-2" title={sheet.title}>
                                                                <div className={style.theme}>
                                                                    <div className="w-6 h-6 rounded-[var(--radius-btn)] border flex items-center justify-center shrink-0 bg-[var(--brand-bg)] text-[var(--brand-solid)] border-[var(--brand-border)]">
                                                                        {style.icon}
                                                                    </div>
                                                                </div>
                                                                <span className="truncate">{sheet.title}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3">
                                                            <div className="flex flex-wrap gap-1">
                                                                {sheet.auto_topics?.slice(0, 2).map(tag => (
                                                                    <span key={tag} className="text-[9px] font-black uppercase tracking-widest bg-[var(--bg-surface)] border border-[var(--border-main)] text-[var(--text-muted)] px-2 py-0.5 rounded-[var(--radius-btn)]">{tag}</span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 text-center text-[var(--text-muted)] text-xs">{new Date(sheet.updated_at).toLocaleDateString()}</td>
                                                        <td className="py-3 text-right pr-4">
                                                            <div className="flex justify-end gap-1 items-center opacity-40 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => setPeekSheet(sheet)} title={t.peek_title} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--primary-color)] rounded-[var(--radius-btn)] hover:bg-[var(--bg-surface)]"><Maximize2 size={14}/></button>
                                                                
                                                                {/*   Dynamically applies the color of the document type and gives it the solid hover effect */}
                                                                <button 
                                                                    onClick={() => loadSheet(sheet)} 
                                                                    className={`${style.theme} bg-[var(--brand-bg)] text-[var(--brand-solid)] border border-[var(--brand-border)] hover:bg-[var(--brand-solid)] hover:text-white px-3 py-1 text-[10px] ml-2 rounded-[var(--radius-btn)] transition-all font-black uppercase tracking-widest shadow-sm`}
                                                                >
                                                                    {t.load_btn}
                                                                </button>
                                                                <button onClick={() => setShowMoveModal(sheet)} title={t.move_file} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--primary-color)] rounded-[var(--radius-btn)] hover:bg-[var(--bg-surface)] ml-1"><PanelLeftClose size={14}/></button>
                                                                <button onClick={(e) => handleSoftDelete(e, sheet.id)} title={t.trash} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--theme-rose-text)] hover:bg-[var(--theme-rose-bg)] rounded-[var(--radius-btn)] ml-1"><Trash2 size={14}/></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )})}
                                            </React.Fragment>
                                        );
                                    })}

                                    {/* 2. RENDER ROOT FILES */}
                                    {filteredLibrary.filter(sheet => isTrashView || libraryTab !== 'private' || sheet.folder_id === null).map(sheet => {
                                        const style = getSheetIconStyle(sheet.type, 16);
                                        return (
                                        <tr key={sheet.id} className="hover:bg-[var(--bg-surface)] transition-colors group">
                                            <td className="py-3 text-center">
                                                <div className={style.theme}>
                                                    <div className="w-8 h-8 rounded-[var(--radius-btn)] border border-[var(--brand-border)] flex items-center justify-center mx-auto bg-[var(--brand-bg)] text-[var(--brand-solid)]">
                                                        {style.icon}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 font-bold text-[var(--text-main)] text-sm max-w-0">
                                                <div className="truncate" title={sheet.title}>{sheet.title}</div>
                                            </td>
                                            <td className="py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {sheet.auto_topics?.slice(0, 2).map(tag => (
                                                        <span key={tag} className="text-[9px] font-black uppercase tracking-widest bg-[var(--bg-surface)] border border-[var(--border-main)] text-[var(--text-muted)] px-2 py-0.5 rounded-[var(--radius-btn)]">{tag}</span>
                                                    ))}
                                                    {sheet.auto_topics?.length > 2 && <span className="text-[9px] font-black text-[var(--text-muted)]">+{sheet.auto_topics.length - 2}</span>}
                                                </div>
                                            </td>
                                            <td className="py-3 text-center text-[var(--text-muted)] text-xs">{new Date(sheet.updated_at).toLocaleDateString()}</td>
                                            <td className="py-3 text-right pr-4">
                                                <div className="flex justify-end gap-1 items-center opacity-40 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => setPeekSheet(sheet)} title={t.peek_title} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--primary-color)] rounded-[var(--radius-btn)] hover:bg-[var(--bg-surface)]"><Maximize2 size={14}/></button>
                                                    
                                                    {isTrashView ? (
                                                        <>
                                                            <button onClick={(e) => handleRestore(e, sheet.id)} className="theme-emerald bg-[var(--brand-bg)] text-[var(--brand-solid)] border border-[var(--brand-border)] hover:bg-[var(--brand-solid)] hover:text-white px-3 py-1 text-[10px] ml-2 rounded-[var(--radius-btn)] transition-all font-black uppercase tracking-widest shadow-sm">{t.restore}</button>
                                                            <button onClick={(e) => handleHardDelete(e, sheet.id)} className="theme-rose bg-[var(--brand-bg)] text-[var(--brand-solid)] border border-[var(--brand-border)] hover:bg-[var(--brand-solid)] hover:text-white px-3 py-1 text-[10px] ml-1 rounded-[var(--radius-btn)] transition-all font-black uppercase tracking-widest shadow-sm">{t.hard_delete}</button>
                                                        </>
                                                    ) : libraryTab === 'private' ? (
                                                        <>
                                                            <button 
                                                                    onClick={() => loadSheet(sheet)} 
                                                                    className={`${style.theme} bg-[var(--brand-bg)] text-[var(--brand-solid)] border border-[var(--brand-border)] hover:bg-[var(--brand-solid)] hover:text-white px-3 py-1 text-[10px] ml-2 rounded-[var(--radius-btn)] transition-all font-black uppercase tracking-widest shadow-sm`}
                                                                >
                                                                    {t.load_btn}
                                                                </button>
                                                            <button onClick={() => setShowMoveModal(sheet)} title={t.move_file} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--primary-color)] rounded-[var(--radius-btn)] hover:bg-[var(--bg-surface)] ml-1"><PanelLeftClose size={14}/></button>
                                                            <button onClick={(e) => handleSoftDelete(e, sheet.id)} title={t.trash} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--theme-rose-text)] hover:bg-[var(--theme-rose-bg)] rounded-[var(--radius-btn)] ml-1"><Trash2 size={14}/></button>
                                                        </>
                                                    ) : (
                                                        <button onClick={() => { handleClone(sheet.id); setPeekSheet(null); }} className="btn-brand bg-[var(--theme-indigo-bg)] text-[var(--theme-indigo-text)] border border-[var(--theme-indigo-border)] py-1.5 text-[10px] ml-2 gap-1"><Copy size={10}/> {t.clone_btn}</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )})}
                                    
                                    {filteredLibrary.length === 0 && folders.length === 0 && !isLibraryLoading && (
                                        <tr><td colSpan={5} className="text-center py-12 text-[var(--text-muted)] text-sm font-medium italic">{isTrashView ? t.trash_empty : t.no_files}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* MODALS */}
                {showFolderModal && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                        <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[var(--radius-card)] shadow-2xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
                            <h3 className="text-lg font-black text-[var(--text-main)] mb-4">{t.create_folder_title}</h3>
                            <input 
                                autoFocus
                                type="text" 
                                value={newFolderName} 
                                onChange={(e) => setNewFolderName(e.target.value)} 
                                placeholder={t.folder_name_placeholder}
                                className="w-full px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-main)] text-[var(--text-main)] rounded-[var(--radius-btn)] focus:border-[var(--primary-color)] outline-none mb-6 font-bold"
                            />
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setShowFolderModal(false)} className="px-4 py-2 text-[var(--text-muted)] font-bold hover:bg-[var(--bg-surface)] rounded-lg transition-colors">{t.cancel}</button>
                                <button onClick={handleCreateFolder} disabled={!newFolderName.trim()} className="btn-brand">{t.create}</button>
                            </div>
                        </div>
                    </div>
                )}

                {showMoveModal && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                        {/*   Expanded to max-w-lg and bumped padding to p-8 */}
                        <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[var(--radius-card)] shadow-2xl p-8 w-full max-w-lg animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-[var(--text-main)]">{t.move_file}</h3>
                                <button onClick={() => setShowMoveModal(null)} className="p-2 text-[var(--text-muted)] hover:text-[var(--theme-rose-text)] hover:bg-[var(--theme-rose-bg)] rounded-lg transition-all"><X size={20}/></button>
                            </div>
                            <p className="text-base font-bold text-[var(--text-muted)] mb-4 truncate">"{showMoveModal.title}"</p>
                            
                            {/*   Expanded height to 50% of the viewport (max-h-[50vh]) */}
                            <div className="space-y-2 max-h-[50vh] overflow-y-auto custom-scrollbar mb-2 border border-[var(--border-main)] rounded-[var(--radius-card)] p-3 bg-[var(--bg-surface)]">
                                <button 
                                    onClick={() => handleMoveSheet(showMoveModal.id, null)}
                                    className="w-full text-left px-4 py-3 rounded-[var(--radius-btn)] text-sm font-bold transition-all flex items-center gap-3 bg-[var(--bg-card)] border border-transparent hover:border-[var(--border-strong)] text-[var(--text-main)] shadow-sm"
                                >
                                    <Globe size={18} className="text-[var(--text-muted)]" /> {t.root_dir}
                                </button>
                                {folders.map(folder => (
                                    <button 
                                        key={folder.id}
                                        onClick={() => handleMoveSheet(showMoveModal.id, folder.id)}
                                        className="w-full text-left px-4 py-3 rounded-[var(--radius-btn)] text-sm font-bold transition-all flex items-center gap-3 bg-[var(--bg-card)] border border-transparent hover:border-[var(--border-strong)] text-[var(--text-main)] shadow-sm"
                                    >
                                        <Layers size={18} className="text-[var(--primary-color)]" /> {folder.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {peekSheet && (
                    <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/40 backdrop-blur-xs">
                        <div className="w-full max-w-lg bg-[var(--bg-canvas)] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-[var(--border-main)]">
                            <div className="p-6 border-b border-[var(--border-main)] flex justify-between items-center bg-[var(--bg-card)]">
                                <div>
                                    <h3 className="text-lg font-black uppercase italic tracking-tighter leading-none text-[var(--text-main)]">{peekSheet.title}</h3>
                                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase mt-1 tracking-widest">
                                        {(peekSheet.type === 'board' ? peekSheet.packet?.livePacket?.length : peekSheet.packet?.length) || 0} Uppgifter
                                    </p>
                                </div>
                                <button onClick={() => setPeekSheet(null)} className="btn-ghost p-1.5"><X size={20}/></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                {(peekSheet.type === 'board' ? (peekSheet.packet?.livePacket || []) : peekSheet.packet).map((q, i) => (
                                    <div key={i} className="card p-6 border-b border-[var(--border-main)] pb-6 last:border-0 whiteboard-protect">
                                        <div className="flex justify-center mb-3 scale-75 origin-top">
                                            <VisualRenderer data={q.resolvedData?.renderData} isWordProblem={q.selectedStoryIndex !== null && q.selectedStoryIndex !== undefined} />
                                        </div>
                                        <div className="text-xs font-bold text-slate-700 leading-relaxed"><MathDisplay content={q.resolvedData?.renderData?.description} /></div>
                                        {q.resolvedData?.renderData?.latex && <div className="mt-3 p-3 bg-slate-50 rounded-xl text-center font-serif text-sm border border-slate-200"><MathDisplay content={`$$${q.resolvedData.renderData.latex}$$`} /></div>}
                                        {renderOptions(q.resolvedData?.renderData?.options)}
                                    </div>
                                ))}
                            </div>
                            
                            {/*   FIXED: Removed the accidental duplicate wrapper div here! */}
                            <div className="p-6 border-t border-[var(--border-main)] bg-[var(--bg-card)] flex gap-3">
                                {isTrashView ? (
                                    <>
                                        <button onClick={(e) => { handleRestore(e, peekSheet.id); setPeekSheet(null); }} className="theme-emerald flex-1 bg-[var(--brand-bg)] text-[var(--brand-solid)] border border-[var(--brand-border)] hover:bg-[var(--brand-solid)] hover:text-white py-3 rounded-[var(--radius-btn)] font-black uppercase tracking-widest transition-all shadow-sm">{t.restore}</button>
                                        <button onClick={(e) => { handleHardDelete(e, peekSheet.id); setPeekSheet(null); }} className="theme-rose flex-1 bg-[var(--brand-bg)] text-[var(--brand-solid)] border border-[var(--brand-border)] hover:bg-[var(--brand-solid)] hover:text-white py-3 rounded-[var(--radius-btn)] font-black uppercase tracking-widest transition-all shadow-sm">{t.hard_delete}</button>
                                    </>
                                ) : libraryTab === 'private' ? (
                                    <>
                                        {peekSheet.type === 'board' ? (
                                            <button onClick={() => { loadBoard(peekSheet); setPeekSheet(null); }} className="btn-brand flex-1 bg-[var(--theme-amber-bg)] text-[var(--theme-amber-text)] border border-[var(--theme-amber-border)]">
                                                {lang === 'sv' ? "Öppna Presentation" : "Open Board"}
                                            </button>
                                        ) : (
                                            <>
                                                <button onClick={() => { loadSheet(peekSheet); setPeekSheet(null); }} className="btn-brand flex-1 bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-main)] hover:bg-[var(--brand-bg)] hover:text-[var(--brand-text)] hover:border-[var(--brand-border)]">
                                                    {lang === 'sv' ? "Redigera" : "Edit"}
                                                </button>
                                                <button onClick={() => { loadSheet(peekSheet); setPeekSheet(null); setShowPresentation(true); }} className="btn-brand flex-1 bg-[var(--theme-amber-bg)] text-[var(--theme-amber-text)] border border-[var(--theme-amber-border)] flex items-center justify-center gap-2">
                                                    <Monitor size={16} /> {t.present}
                                                </button>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <button onClick={() => { handleClone(peekSheet.id); setPeekSheet(null); }} className="btn-brand w-full bg-[var(--theme-indigo-bg)] text-[var(--theme-indigo-text)] border border-[var(--theme-indigo-border)] flex items-center justify-center gap-2"><Copy size={16}/> {t.clone_btn}</button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* load presentations */}
                {showPresentation && (
                    <PresentationView 
                        packet={activeBoardSheet ? (activeBoardSheet.packet?.livePacket || activeBoardSheet.packet) : []} 
                        initialSlides={activeBoardSheet?.packet?.slides}
                        boardId={activeBoardSheet?.id}
                        sheetTitle={activeBoardSheet?.title || ""} 
                        lang={lang} 
                        onClose={() => { 
                            setShowPresentation(false);
                            fetchLibrary(); 
                        }} 
                    />
                )}

            </div>
        );
    }

  // =========================================================================
  //   ACTIVE EDITOR (STUDIO MODE)
  // =========================================================================
  return (
    <div className="layout-wrapper flex flex-col h-full font-sans overflow-hidden relative">
        {/*   Reduced padding from py-2 to py-1 */}
        <header className={`relative flex items-center justify-between px-6 py-1 border-b shadow-md z-50 transition-colors duration-500 ${setupMode === 'donow' ? 'bg-indigo-950 border-indigo-900' : 'bg-emerald-900 border-emerald-800'}`}>
            <div className="flex items-center gap-3 flex-1 max-w-[40%]">
                <button 
                    onClick={() => { if(!isSaved && !window.confirm(t.unsaved_warning)) return; setSetupMode(null); }} 
                    className="flex items-center gap-1 text-[11px] font-black uppercase text-white/80 hover:text-white transition-colors"
                >
                    <ChevronLeft size={13}/> {t.change_mode}
                </button>
                
                <div className={`h-4 w-px mx-0.5 ${setupMode === 'donow' ? 'bg-indigo-800' : 'bg-emerald-800'}`}></div>
                
                <div className="relative group flex-1 max-w-xs">
                    <input 
                        type="text" 
                        className="w-full bg-white/10 px-3 py-1.5 rounded-[var(--radius-btn)] text-xs font-black tracking-tight outline-none focus:bg-white/20 transition-all border border-transparent focus:border-white/30 text-white placeholder-white/40" 
                        placeholder={t.title_placeholder} 
                        value={sheetTitle} 
                        onChange={(e) => { setSheetTitle(e.target.value); setIsSaved(false); }} 
                    />
                </div>

                <div className="flex items-center gap-0.5 bg-white/10 p-1 rounded-[var(--radius-btn)] border border-white/5 shadow-inner">
                    <button onClick={() => setChosenVisibility('private')} className={`p-1 rounded-[var(--radius-btn)] transition-all ${chosenVisibility === 'private' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/50 hover:text-white'}`}><Lock size={10}/></button>
                    <button onClick={() => setChosenVisibility('school')} className={`p-1 rounded-[var(--radius-btn)] transition-all ${chosenVisibility === 'school' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/50 hover:text-white'}`}><Building2 size={10}/></button>
                </div>

                <button 
                    onClick={handleSave} 
                    disabled={packet.length === 0} 
                    className="px-3 py-1.5 bg-white border border-white/20 rounded-[var(--radius-btn)] text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-slate-100 text-slate-900 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                    <Save size={13}/> {t.save_btn}
                </button>
            </div>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
                <span className="text-white font-black uppercase text-xl tracking-wider opacity-90">
                    {setupMode === 'donow' ? t.donow_title : setupMode === 'worksheet' ? t.worksheet_title : null}
                </span>
            </div>

            <div className="flex items-center gap-2 pl-4 max-w-[45%] justify-end">
                
                {/*   UNIVERSAL TOGGLE */}
                <PreferencesToggle />

                <button 
                    onClick={handleLaunchLive} 
                    disabled={packet.length === 0} 
                    className="px-4 py-1.5 bg-rose-500 text-white rounded-[var(--radius-btn)] text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-rose-400 transition-all disabled:opacity-30 cursor-pointer shadow-sm"
                >
                    <Send size={13}/> {t.live_btn}
                </button>

                <button 
                    onClick={() => setShowPresentation(true)} 
                    disabled={packet.length === 0} 
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-[var(--radius-btn)] text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-30 shadow-md cursor-pointer"
                >
                    <Monitor size={13}/> {t.present}
                </button>

                <div className={`h-4 w-px mx-0.5 ${setupMode === 'donow' ? 'bg-indigo-800' : 'bg-emerald-800'}`}></div>

                {setupMode === 'donow' ? (
                    <button 
                        onClick={handleLaunchGrid} 
                        disabled={packet.length === 0} 
                        className="px-4 py-1.5 bg-indigo-500 text-white hover:bg-indigo-400 rounded-[var(--radius-btn)] text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-30 shadow-md cursor-pointer"
                    >
                        <Grid3X3 size={13}/> {t.create_donow}
                    </button>
                ) : (
                    <button 
                        onClick={handleLaunchPrint} 
                        disabled={packet.length === 0} 
                        className="px-4 py-1.5 bg-emerald-500 text-white hover:bg-emerald-400 rounded-[var(--radius-btn)] text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-30 shadow-md cursor-pointer"
                    >
                        <Printer size={13}/> {t.publish}
                    </button>
                )}

                <button 
                    onClick={onClose} 
                    className="p-1 text-white/60 hover:bg-rose-500 hover:text-white rounded-[var(--radius-btn)] transition-all cursor-pointer ml-1"
                >
                    <X size={16}/>
                </button>
            </div>
        </header>

      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* PANE 1: Topics */}
        <div className={`bg-[var(--bg-card)] border-r border-[var(--border-main)] flex flex-col shrink-0 transition-all duration-300 ${isPane1Collapsed ? 'w-16' : 'w-72'}`}>
          <div className={`p-4 border-b border-[var(--border-main)] flex items-center ${isPane1Collapsed ? 'justify-center' : 'justify-end'}`}>
              <button onClick={() => setIsPane1Collapsed(!isPane1Collapsed)} className="btn-ghost p-1">
                  {isPane1Collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
              </button>
          </div>
          <div className={`flex-1 overflow-y-auto custom-scrollbar transition-opacity duration-200 ${isPane1Collapsed ? 'opacity-0 invisible' : 'opacity-100 p-4 space-y-3'}`}>
            {!isPane1Collapsed && (
                <>
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-2.5 text-[var(--text-muted)]" size={16} />
                        <input type="text" placeholder={t.search_placeholder} className="w-full pl-10 pr-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-main)] text-[var(--text-main)] rounded-[var(--radius-btn)] text-sm font-bold outline-none focus:border-[var(--brand-solid)]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    {Object.values(SKILL_BUCKETS).map(cat => (
                        <div key={cat.id}>
                            <h3 className="text-[12px] font-black uppercase tracking-widest text-[var(--brand-solid)] mb-3 ml-2">{cat.name[lang]}</h3>
                            <div className="space-y-1">
                                {Object.entries(cat.topics).map(([id, data]) => (
                                    <button key={id} onClick={() => setSelectedTopicId(id)} className={`w-full text-left px-3 py-1.5 text-sm rounded-[var(--radius-btn)] transition-all ${selectedTopicId === id ? 'bg-indigo-600 text-white font-bold shadow-md' : 'text-[var(--text-main)] hover:bg-[var(--bg-surface)]'}`}>
                                        {data.name[lang]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </>
            )}
          </div>
        </div>

        {/* PANE 2: Variations */}
        <div className="w-[300px] bg-[var(--bg-surface)]/80 backdrop-blur-sm border-r border-[var(--border-main)] flex flex-col shrink-0">
        <div className="p-3 border-b border-[var(--border-main)] bg-[var(--bg-card)] shrink-0 shadow-sm space-y-2">
            <h1 className="text-sm font-black text-[var(--text-main)] uppercase italic truncate leading-none">{currentTopic?.name[lang]}</h1>
            
            <div className="flex items-center justify-between bg-[var(--bg-surface)] p-1 rounded-[var(--radius-btn)] border border-[var(--border-strong)] shadow-inner">
                <span className="text-[11px] font-black uppercase text-[var(--text-main)] ml-1.5 tracking-tight">{t.hide_extra}</span>
                <button 
                    onClick={() => setHideExtra(!hideExtra)} 
                    className={`w-8 h-4 rounded-full transition-all relative p-0.5 ${hideExtra ? 'bg-[var(--brand-solid)]' : 'bg-[var(--border-strong)]'}`}
                >
                    <div className={`w-3 h-3 bg-white rounded-full transition-all shadow-sm ${hideExtra ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
            </div>

            <div className="flex items-center justify-between bg-[var(--bg-surface)] p-1 rounded-[var(--radius-btn)] border border-[var(--border-strong)] shadow-inner">
                <span className="text-[11px] font-black uppercase text-[var(--text-main)] ml-1.5 tracking-tight">
                    {lang === 'sv' ? 'Problemlösning' : 'Word Problems'}
                </span>
                <button 
                    onClick={() => setUseWordProblems(!useWordProblems)} 
                    className={`w-8 h-4 rounded-full transition-all relative p-0.5 ${useWordProblems ? 'bg-[var(--theme-emerald-solid)]' : 'bg-[var(--border-strong)]'}`}
                >
                    <div className={`w-3 h-3 bg-white rounded-full transition-all shadow-sm ${useWordProblems ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
            {Object.entries(
                visibleVariations.reduce((acc, v) => {
                    const lvl = v.level || 1; 
                    if (!acc[lvl]) acc[lvl] = [];
                    acc[lvl].push(v);
                    return acc;
                }, {})
            ).sort(([lvlA], [lvlB]) => Number(lvlA) - Number(lvlB)).map(([lvl, variations]) => (
                <div key={lvl} className="space-y-2">
                    <div className="sticky top-0 bg-[var(--bg-surface)]/95 backdrop-blur-sm pt-4 pb-2 flex items-center z-10">
                        <span className="text-[14px] font-black uppercase tracking-widest text-[var(--brand-solid)]">
                            {lang === 'sv' ? `Nivå ${lvl}` : `Level ${lvl}`}
                        </span>
                        <div className="flex-1 h-[2px] bg-[var(--border-strong)] ml-3 rounded-full"></div>
                    </div>

                    {variations.map(v => {
                        const cat = getVariationCategory(v.key);
                        const styles = getCategoryStyles(cat);
                        const isPreviewed = activePreviewKey === v.key;
                        
                        return (
                            <div 
                                key={v.key} 
                                onClick={() => triggerPreview(v.key)} 
                                className={`group p-3 rounded-[var(--radius-card)] border transition-all bg-[var(--bg-card)] relative overflow-hidden
                                    ${isPreviewed ? 'border-[var(--brand-solid)] shadow-md ring-2 ring-[var(--brand-solid)]/10' : 'border-[var(--border-main)] shadow-sm hover:border-[var(--brand-solid)] cursor-pointer'}
                                `}
                            >
                                <div className={`absolute top-0 left-0 bottom-0 w-1 ${styles.bg}`} />
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-black text-[11px] uppercase tracking-tight text-[var(--text-main)] leading-tight pr-2">{v.name[lang]}</h4>
                                    <div className={`shrink-0 px-1.5 py-0.5 rounded border ${styles.border} ${styles.bg} ${styles.text} text-[7px] font-black uppercase flex items-center gap-0.5`}>
                                        {styles.icon} {styles.label}
                                    </div>
                                </div>
                                
                                <p className="text-[9px] font-medium text-[var(--text-muted)] line-clamp-1 mb-2 italic leading-tight">{v.desc[lang]}</p>
                                
                                <div className="flex items-center gap-1.5">
                                    <div className="flex items-center bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-[var(--radius-btn)] p-0.5">
                                        <button onClick={(e) => { e.stopPropagation(); setPendingQuantity(Math.max(1, pendingQuantity - 1)); }} className="w-5 h-5 flex items-center justify-center hover:bg-[var(--bg-card)] rounded transition-all text-[var(--text-muted)] hover:text-[var(--primary-color)]"><Minus size={10}/></button>
                                        <span className="w-5 text-center text-[11px] font-black text-[var(--text-main)]">{pendingQuantity}</span>
                                        <button onClick={(e) => { e.stopPropagation(); setPendingQuantity(pendingQuantity + 1); }} className="w-5 h-5 flex items-center justify-center hover:bg-[var(--bg-card)] rounded transition-all text-[var(--text-muted)] hover:text-[var(--primary-color)]"><Plus size={10}/></button>
                                    </div>
                                    <button 
                                        disabled={isPreviewLoading} 
                                        onClick={(e) => { e.stopPropagation(); addToPacket(v, pendingQuantity); }} 
                                        className={`flex-1 py-1.5 text-white rounded-[var(--radius-btn)] text-[9px] font-black uppercase transition-all shadow-sm active:scale-95 disabled:opacity-50 ${setupMode === 'donow' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
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
        <div className="flex-1 flex flex-col overflow-hidden relative bg-[var(--bg-canvas)]">
          
          <div className="bg-[var(--bg-card)] border-b border-[var(--border-main)] px-6 py-2 flex flex-wrap items-center justify-between shadow-sm shrink-0 z-50 min-h-[64px]">
              <div className="flex items-center gap-4">
                  <div className="bg-[var(--bg-surface)] p-1 rounded-[var(--radius-btn)] border border-[var(--border-main)] flex gap-1">
                      <button onClick={() => setCanvasMode('studio')} className={`px-5 py-1.5 rounded-[var(--radius-btn)] text-[10px] font-black uppercase flex items-center gap-2 transition-all ${canvasMode === 'studio' ? 'bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}><Zap size={14}/> Studio</button>
                      {setupMode && <button onClick={() => setCanvasMode('layout')} className={`px-5 py-1.5 rounded-[var(--radius-btn)] text-[10px] font-black uppercase flex items-center gap-2 transition-all ${canvasMode === 'layout' ? 'bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}><LayoutGrid size={14}/> {setupMode === 'donow' ? 'Grid' : 'Layout'}</button>}
                  </div>
              </div>

              {canvasMode === 'layout' && (
                  <div className="flex items-center gap-5 justify-end flex-1 pl-6">
                      
                      <div className="flex flex-col gap-1 items-center relative group">
                          <button 
                              disabled={isRegeneratingAll || packet.length === 0}
                              onClick={() => setIsGlobalShuffleOpen(!isGlobalShuffleOpen)} 
                              className="flex items-center gap-2 px-4 py-1.5 rounded-[var(--radius-btn)] border border-[var(--border-strong)] bg-[var(--bg-card)] text-[var(--text-main)] transition-all text-[10px] font-black uppercase shadow-sm hover:border-[var(--brand-solid)] disabled:opacity-50 active:scale-95"
                          >
                              {isRegeneratingAll ? <Loader2 size={14} className="animate-spin text-[var(--brand-solid)]" /> : <Shuffle size={14} className="text-[var(--brand-solid)]" />} 
                              {t.regenerate_all}
                          </button>
                          <span className="text-[8px] font-black uppercase text-[var(--text-muted)] tracking-widest">Innehåll</span>

                          {isGlobalShuffleOpen && (
                              <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[var(--radius-card)] shadow-2xl p-2 w-56 z-[60] flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-200">
                                  <button onClick={async () => { setIsGlobalShuffleOpen(false); await batchShuffle('numbers'); }} className="w-full text-left px-4 py-2.5 hover:bg-[var(--bg-surface)] rounded-[var(--radius-btn)] transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[var(--text-main)] hover:text-[var(--brand-text)]">
                                      <Calculator size={14} /> {lang === 'sv' ? "Bara Siffror/Värden" : "Numbers Only"}
                                  </button>
                                  <button onClick={async () => { setIsGlobalShuffleOpen(false); await batchShuffle('stories'); }} className="w-full text-left px-4 py-2.5 hover:bg-[var(--bg-surface)] rounded-[var(--radius-btn)] transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[var(--text-main)] hover:text-[var(--theme-amber-text)]">
                                      <Type size={14} /> {lang === 'sv' ? "Bara Textberättelser" : "Word Problems Only"}
                                  </button>
                                  <div className="h-px bg-[var(--border-main)] my-1 mx-2" />
                                  <button onClick={async () => { setIsGlobalShuffleOpen(false); await batchShuffle('both'); }} className="w-full text-left px-4 py-2.5 hover:bg-[var(--bg-surface)] rounded-[var(--radius-btn)] transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[var(--theme-rose-text)]">
                                      <RefreshCcw size={14} /> {lang === 'sv' ? "Slumpa Allt (Båda)" : "Reshuffle Both"}
                                  </button>
                              </div>
                          )}
                      </div>

                      <div className="w-px h-8 bg-[var(--border-main)]"></div>

                      {setupMode === 'worksheet' && (
                          <>
                              <div className="flex flex-col gap-1 items-center">
                                  <div className="flex items-center bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-[var(--radius-btn)] p-0.5 shadow-sm">
                                      {['sm', 'md', 'lg', 'xl'].map((size) => (
                                          <button 
                                              key={size}
                                              onClick={() => { setGlobalLatexSize(size); setIsSaved(false); }} 
                                              className={`px-3 py-1 rounded-[var(--radius-btn)] font-serif font-black transition-all ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : size === 'lg' ? 'text-base' : 'text-lg'} ${globalLatexSize === size ? 'bg-[var(--bg-card)] text-[var(--brand-solid)] shadow-sm border border-[var(--border-main)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                                              title={`Textstorlek: ${size}`}
                                          >
                                              A
                                          </button>
                                      ))}
                                  </div>
                                  <span className="text-[8px] font-black uppercase text-[var(--text-muted)] tracking-widest">Textstorlek</span>
                              </div>

                              <div className="w-px h-8 bg-[var(--border-main)]"></div>

                              <div className="flex flex-col gap-1 items-center">
                                  <div className="flex items-center bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-[var(--radius-btn)] p-0.5 shadow-sm gap-1">
                                      <div className="flex items-center bg-[var(--bg-card)] rounded-[var(--radius-btn)] border border-[var(--border-main)] shadow-sm">
                                          <button onClick={() => { setWorkspaceHeight(Math.max(0, workspaceHeight - 1)); setIsSaved(false); }} className="px-2 py-1 text-[var(--text-muted)] hover:text-[var(--brand-solid)]"><Minus size={12} /></button>
                                          <span className="text-[10px] font-black uppercase text-[var(--text-main)] w-4 text-center">{workspaceHeight}</span>
                                          <button onClick={() => { setWorkspaceHeight(Math.min(15, workspaceHeight + 1)); setIsSaved(false); }} className="px-2 py-1 text-[var(--text-muted)] hover:text-[var(--brand-solid)]"><Plus size={12} /></button>
                                      </div>
                                      <div className="w-px h-4 bg-[var(--border-main)] mx-0.5"></div>
                                      <button onClick={() => { setWorkspaceStyle('blank'); setIsSaved(false); }} className={`p-1 rounded-[var(--radius-btn)] transition-all ${workspaceStyle === 'blank' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm border border-[var(--border-main)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)]'}`} title="Tom yta">
                                          <Square size={14} />
                                      </button>
                                      <button onClick={() => { setWorkspaceStyle('grid'); setIsSaved(false); }} className={`p-1 rounded-[var(--radius-btn)] transition-all ${workspaceStyle === 'grid' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm border border-[var(--border-main)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)]'}`} title="Rutnät (8mm)">
                                          <Grid3X3 size={14} />
                                      </button>
                                  </div>
                                  <span className="text-[8px] font-black uppercase text-[var(--text-muted)] tracking-widest">Arbetsyta</span>
                              </div>

                              <div className="w-px h-8 bg-[var(--border-main)]"></div>

                              <div className="flex flex-col gap-1 items-center">
                                  <div className="flex items-center bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-[var(--radius-btn)] p-0.5 shadow-sm">
                                      <button onClick={() => { setLayoutStyle('open'); setIsSaved(false); }} className={`px-2 py-1 rounded-[var(--radius-btn)] text-[9px] font-black uppercase tracking-wider transition-all ${layoutStyle === 'open' ? 'bg-[var(--bg-card)] text-[var(--brand-solid)] shadow-sm border border-[var(--border-main)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)]'}`}>
                                          Öppen
                                      </button>
                                      <button onClick={() => { setLayoutStyle('framed'); setIsSaved(false); }} className={`px-2 py-1 rounded-[var(--radius-btn)] text-[9px] font-black uppercase tracking-wider transition-all ${layoutStyle === 'framed' ? 'bg-[var(--bg-card)] text-[var(--brand-solid)] shadow-sm border border-[var(--border-main)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface-hover)]'}`}>
                                          Inramad
                                      </button>
                                  </div>
                                  <span className="text-[8px] font-black uppercase text-[var(--text-muted)] tracking-widest">Design</span>
                              </div>
                          </>
                      )}
                  </div>
              )}
          </div>

          <div className="flex-1 flex flex-col overflow-hidden relative">
            {canvasMode === 'studio' ? (
              <div className="flex-1 bg-[var(--bg-card)] rounded-[3rem] shadow-2xl border border-[var(--border-main)] overflow-hidden flex flex-col mx-auto w-full max-w-2xl animate-in zoom-in-95 duration-300 m-4">
                  <div className="px-8 py-5 bg-[var(--text-main)] text-[var(--bg-canvas)] flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">
                    {t.board_label}</span>{activePreviewKey && <button onClick={() => triggerPreview(activePreviewKey)} className="text-[10px] bg-[var(--bg-canvas)]/10 hover:bg-[var(--bg-canvas)]/20 px-4 py-1.5 rounded-full font-black uppercase flex items-center gap-2 transition-all">
                        <RefreshCcw size={12}/> {t.new_example}</button>}
                        </div>
                  <div className="p-12 flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center">
                    {isPreviewLoading ? <div className="h-full flex items-center justify-center">
                        <Loader2 className="animate-spin text-[var(--brand-solid)]" size={48} />
                        </div> : !previewData ? <div className="h-full flex items-center justify-center text-[var(--border-strong)] uppercase font-black tracking-widest italic">
                            {t.select_hint}
                            </div> : <div className="w-full space-y-12 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="w-full flex justify-center drop-shadow-md">
                                    <VisualRenderer 
                                        data={previewData?.renderData} 
                                        isWordProblem={useWordProblems} 
                                    />
                                </div>
                                    <div className="text-2xl text-[var(--text-main)] font-bold text-center px-10 leading-relaxed">
                                        <MathDisplay content={previewData.renderData.description} />
                                        </div>{previewData.renderData.latex && <div className="text-4xl text-[var(--brand-solid)] bg-[var(--brand-bg)] p-10 rounded-[2.5rem] border-2 border-[var(--brand-border)] shadow-inner text-center font-serif">
                                        <MathDisplay content={`$$${previewData.renderData.latex}$$`} />
                                        </div>}{renderOptions(previewData.renderData?.options)}
                                    </div>}
                </div>
              </div>
          ) : (
              <div className="flex-1 overflow-auto custom-scrollbar pb-24 flex justify-center items-start bg-[var(--bg-canvas)] p-4 rounded-[3rem]">
                  <div 
                    className={`shadow-2xl flex flex-col animate-in slide-in-from-bottom-6 origin-top ${
                        setupMode === 'donow' 
                        ? 'w-full max-w-5xl bg-slate-900 rounded-[2.5rem] p-8' 
                        : 'whiteboard-protect w-[210mm] min-h-[297mm] p-[15mm]'
                    }`}
                    style={setupMode === 'worksheet' ? { transform: 'scale(0.85)', transformOrigin: 'top center' } : {}}
                  >
                      {setupMode === 'worksheet' ? (
                          <header className="border-b-2 border-slate-900 pb-2 mb-4 flex items-end justify-between">
                              <h1 className="text-lg font-black uppercase tracking-tighter w-1/3 truncate italic leading-none text-slate-900">{sheetTitle || "Matematik"}</h1>
                              <div className="flex gap-6 w-2/3 justify-end text-[10px] font-black uppercase tracking-widest text-slate-900">
                                  <div className="border-b-2 border-slate-200 pb-1 flex gap-2 flex-1 max-w-[200px]"><span>{t.name_label}</span><div className="flex-1" /></div>
                                  <div className="border-b-2 border-slate-200 pb-1 flex gap-2 w-[120px]"><span>{t.date_label}</span><div className="flex-1" /></div>
                              </div>
                          </header>
                      ) : (
                          <header className="border-b-2 border-slate-700 pb-4 mb-6 flex items-center justify-between">
                              <h1 className="text-xl font-black uppercase tracking-tighter text-white italic leading-none">{sheetTitle || t.donow_title}</h1>
                          </header>
                      )}

                      {/*  WHITEBOARD PROTECTED CONTENT CARDS */}
                      <div className="grid grid-cols-6 gap-x-8 gap-y-6 items-start content-start">
                          {packet.map((item, idx) => {
                                const displayStory = item.showText !== false;
                                const displayLatex = item.showLatex !== false;
                                const displayVisual = item.showVisual !== false;

                                const isHeaderMode = displayStory && (item.instructionMode === 'header' || !item.instructionMode);
                                const isInlineMode = displayStory && item.instructionMode === 'inline';
                                
                                const effectiveLatexSize = item.localLatexSize || globalLatexSize;
                                const latexSizeClass = { sm: 'text-base', md: 'text-lg', lg: 'text-xl', xl: 'text-2xl' }[effectiveLatexSize] || 'text-lg';
                                const effectiveWorkArea = item.localWorkspaceHeight !== undefined ? item.localWorkspaceHeight : workspaceHeight;
                                const effectiveWorkspaceStyle = item.localWorkspaceStyle !== undefined ? item.localWorkspaceStyle : workspaceStyle;

                                return (
                                    <React.Fragment key={item.id}>
                                        {isHeaderMode && (
                                            <div className={`col-span-6 border-l-4 pl-4 py-2 rounded-r-xl ${setupMode === 'donow' ? 'bg-slate-800 border-indigo-500 mb-2 mt-4' : 'bg-slate-50 border-slate-900 mb-2 mt-4'}`}>
                                                <div className={`text-sm font-semibold leading-relaxed ${setupMode === 'donow' ? 'text-white' : 'text-slate-800'}`}>
                                                    <MathDisplay content={compileAnchoredStory(item, lang)} />
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/*  ADDED .whiteboard-protect DIRECTLY TO THE DO NOW CARDS TOO! */}
                                        <div 
                                            draggable 
                                            onDragStart={(e) => handleDragStartUnified(e, idx)} 
                                            onDragOver={(e) => handleDragOverUnified(e, idx)} 
                                            onDragEnd={handleDragEndUnified} 
                                            className={`whiteboard-protect relative group transition-all flex flex-col h-full cursor-move ${getColSpanClass(item.columnSpan)} ${
                                                setupMode === 'donow' 
                                                    ? 'p-6 shadow-xl border-2 border-transparent hover:border-indigo-400 rounded-2xl' 
                                                    : (layoutStyle === 'framed' 
                                                        ? 'p-5 border-2 border-slate-200 rounded-2xl shadow-sm hover:border-indigo-400' 
                                                        : 'p-3 border-2 border-transparent hover:border-slate-200 hover:shadow-sm rounded-2xl')
                                            } ${draggedIdx === idx ? 'opacity-20 border-indigo-500 bg-indigo-50 scale-95' : ''}`}
                                        >
                                            <div className="absolute top-2 left-2 text-slate-300 opacity-0 group-hover:opacity-100 z-10"><GripVertical size={14} /></div>
                                            
                                            <div className="absolute -top-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 z-30 transition-all gap-1.5">
                                                <div className="bg-white shadow-2xl rounded-full p-1 flex gap-1 border border-slate-200 items-center">
                                                    
                                                    {setupMode === 'worksheet' && (
                                                        <>
                                                            <div className="flex items-center bg-slate-100 rounded-full px-1">
                                                                <button onClick={(e) => { e.stopPropagation(); updatePacketItem(item.id, 'localWorkspaceHeight', Math.max(0, effectiveWorkArea - 1)); }} className="p-1 hover:text-indigo-600"><Minus size={10}/></button>
                                                                <span className="text-[9px] font-black w-3 text-center text-slate-600">{effectiveWorkArea}</span>
                                                                <button onClick={(e) => { e.stopPropagation(); updatePacketItem(item.id, 'localWorkspaceHeight', Math.min(15, effectiveWorkArea + 1)); }} className="p-1 hover:text-indigo-600"><Plus size={10}/></button>
                                                            </div>
                                                            
                                                            <button onClick={(e) => { e.stopPropagation(); updatePacketItem(item.id, 'localWorkspaceStyle', effectiveWorkspaceStyle === 'grid' ? 'blank' : 'grid'); }} className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-1.5 rounded-full transition-colors" title="Växla rutnät/tom yta">
                                                                {effectiveWorkspaceStyle === 'grid' ? <Grid3X3 size={10} /> : <Square size={10} />}
                                                            </button>

                                                            <button onClick={(e) => { e.stopPropagation(); const sizes = ['sm', 'md', 'lg', 'xl']; updatePacketItem(item.id, 'localLatexSize', sizes[(sizes.indexOf(effectiveLatexSize) + 1) % 4]); }} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-serif font-black px-2 py-1 rounded-full italic transition-colors">A</button>
                                                        </>
                                                    )}

                                                    <button onClick={(e) => { e.stopPropagation(); updatePacketItem(item.id, 'columnSpan', item.columnSpan === 2 ? 3 : item.columnSpan === 3 ? 6 : 2); }} className="bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-full italic">W</button>
                                                    <button onClick={(e) => { e.stopPropagation(); const modes = ['header', 'inline', 'hidden']; updatePacketItem(item.id, 'instructionMode', modes[(modes.indexOf(item.instructionMode || 'header') + 1) % 3]); }} className={`p-1.5 rounded-full transition-all ${item.instructionMode === 'inline' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'}`}><AlignLeft size={12} /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); setPacket(packet.filter(p => p.id !== item.id)); }} className="bg-rose-500 text-white p-1.5 rounded-full hover:bg-rose-600"><Trash2 size={12} /></button>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className="shrink-0 w-7 h-7 rounded-full border-2 border-slate-900 flex items-center justify-center text-slate-900 font-black text-xs mt-1">
                                                    {idx + 1}
                                                </div>
                                                
                                                <div className="flex-1 min-w-0 flex flex-col h-full">
                                                    {isInlineMode && (
                                                        <div className="text-sm font-semibold text-slate-800 mb-3 leading-relaxed border-b border-slate-100 pb-2">
                                                            <MathDisplay content={compileAnchoredStory(item, lang)} />
                                                        </div>
                                                    )}
                                                    
                                                    {displayLatex && item.resolvedData?.renderData.latex && (
                                                        <div className={`py-3 text-center font-serif text-slate-900 ${latexSizeClass}`}>
                                                            <MathDisplay content={`$$${item.resolvedData.renderData.latex}$$`} />
                                                        </div>
                                                    )}
                                                    
                                                    {renderOptions(item.resolvedData?.renderData?.options, true)}
                                                    
                                                    {displayVisual && (
                                                        <div className="flex justify-center scale-90 origin-top mt-2">
                                                            <VisualRenderer data={item.resolvedData?.renderData} isWordProblem={item.selectedStoryIndex !== null && item.selectedStoryIndex !== undefined} />
                                                        </div>
                                                    )}

                                                    <div className="mt-auto pt-2">
                                                        {setupMode === 'worksheet' && effectiveWorkArea > 0 && (
                                                            <div 
                                                                className={`w-full mt-2 overflow-hidden ${effectiveWorkspaceStyle === 'grid' ? 'border border-slate-200 rounded-lg' : ''}`}
                                                                style={{ 
                                                                    height: `${effectiveWorkArea * 30}px`,
                                                                    ...(effectiveWorkspaceStyle === 'grid' ? {
                                                                        backgroundImage: 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)',
                                                                        backgroundSize: '30px 30px'
                                                                    } : { backgroundColor: 'transparent' })
                                                                }} 
                                                            />
                                                        )}
                                                    </div>

                                                    <div className="opacity-0 group-hover:opacity-100 transition-all flex flex-col gap-2 pt-3 mt-3 z-40 relative">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    try {
                                                                        const isItemWP = item.selectedStoryIndex !== null && item.selectedStoryIndex !== undefined;
                                                                        const res = await fetch(`/api/question?topic=${item.topicId}&variation=${item.variationKey}&lang=${lang}&wordProblem=${isItemWP}`);
                                                                        const data = await res.json();
                                                                        setPacket(packet.map(p => p.id === item.id ? { ...p, resolvedData: data, selectedStoryIndex: p.selectedStoryIndex !== undefined && p.selectedStoryIndex !== null ? p.selectedStoryIndex : null } : p));
                                                                        setIsSaved(false);
                                                                    } catch (err) { console.error("Number shuffle failed:", err); }
                                                                }}
                                                                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 hover:border-indigo-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer"
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
                                                                        if (newIndex === currentStoryIdx) newIndex = (newIndex + 1) % totalStories;
                                                                        updatePacketItem(item.id, 'selectedStoryIndex', newIndex);
                                                                    }}
                                                                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-amber-600 hover:bg-amber-50/50 hover:border-amber-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer"
                                                                >
                                                                    <Shuffle size={12} /> {lang === 'sv' ? "Slumpa Text" : "Shuffle Story"}
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={(e) => { e.stopPropagation(); updatePacketItem(item.id, 'showText', !displayStory); }} className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all cursor-pointer ${displayStory ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100/70' : 'bg-slate-50 border-slate-100 text-slate-400 line-through'}`}>
                                                                <Type size={12} /> Text
                                                            </button>

                                                            {item.resolvedData?.renderData.latex && (
                                                                <button onClick={(e) => { e.stopPropagation(); updatePacketItem(item.id, 'showLatex', !displayLatex); }} className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all cursor-pointer ${displayLatex ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100/70' : 'bg-slate-50 border-slate-100 text-slate-400 line-through'}`}>
                                                                    <Calculator size={12} /> LaTeX
                                                                </button>
                                                            )}

                                                            {(item.resolvedData?.renderData.geometry || item.resolvedData?.renderData.graph || item.resolvedData?.renderData.pattern) && (
                                                                <button onClick={(e) => { e.stopPropagation(); updatePacketItem(item.id, 'showVisual', !displayVisual); }} className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all cursor-pointer ${displayVisual ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100/70' : 'bg-slate-50 border-slate-100 text-slate-400 line-through'}`}>
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
        </div>

        {/* PANE 4: Selected Questions */}
        <div className={`bg-[var(--bg-card)]/90 backdrop-blur-sm border-l border-[var(--border-main)] flex flex-col shadow-2xl shrink-0 transition-all duration-300 ${isPane4Collapsed ? 'w-16' : 'w-72'}`}>
          <div className={`p-4 border-b border-[var(--border-main)] flex items-center ${isPane4Collapsed ? 'justify-center' : 'justify-between'} bg-[var(--bg-surface)]/80`}>
              {!isPane4Collapsed && (
                <div className="flex items-center gap-2">
                    <Layers size={14} className="text-[var(--text-muted)]" />
                    <h2 className="text-[12px] font-black uppercase tracking-widest text-[var(--text-main)]">{t.selected_questions}</h2>
                    <div className="bg-[var(--text-main)] text-[var(--bg-canvas)] px-2 py-0.5 rounded-lg text-[9px] font-black">{packet.length}</div>
                </div>
              )}
              <button onClick={() => setIsPane4Collapsed(!isPane4Collapsed)} className="btn-ghost p-1">
                {isPane4Collapsed ? <PanelRightOpen size={20} /> : <PanelRightClose size={20} />}
              </button>
          </div>

          {!isPane4Collapsed && (
            <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
                <div className="p-3 border-b border-[var(--border-main)] flex justify-end">
                    <button onClick={() => { if(window.confirm(t.clear_all + "?")) setPacket([]); }} className="text-[var(--text-main)] hover:text-[var(--theme-rose-text)] transition-colors flex items-center gap-1 text-[14px] font-black uppercase tracking-widest"><Eraser size={14}/> {t.clear_all}</button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-[var(--bg-canvas)]/50">
                    {packet.map((item, idx) => (
                        <div 
                        key={item.id}
                        draggable 
                        onDragStart={(e) => handleDragStartUnified(e, idx)}
                        onDragOver={(e) => handleDragOverUnified(e, idx)}
                        onDragEnd={handleDragEndUnified}
                        className={`p-3 border rounded-[var(--radius-card)] flex justify-between items-center group shadow-sm transition-all select-none
                            ${draggedItemIndex === idx 
                                ? 'opacity-30 bg-[var(--theme-indigo-bg)] border-[var(--brand-solid)] border-dashed scale-[0.98]' 
                                : 'bg-[var(--bg-card)] border-[var(--border-main)] hover:shadow-md hover:border-[var(--brand-solid)] cursor-grab active:cursor-grabbing'
                            }`}
                    >
                        <div className="flex items-start gap-2 min-w-0 flex-1 w-full">
                            <GripVertical size={12} className="text-[var(--text-muted)] shrink-0 group-hover:text-[var(--primary-color)] transition-colors mt-1" />
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[14px] font-black text-[var(--text-main)]">#{idx + 1}</span>
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.instructionMode === 'header' ? 'bg-indigo-500' : item.instructionMode === 'inline' ? 'bg-amber-500' : 'bg-[var(--border-strong)]'}`} />
                                    <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest truncate">
                                        {item.name}
                                    </span>
                                </div>
                                
                                <div className="text-[11px] font-bold text-[var(--text-muted)] leading-tight pr-2">
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
                                className="p-1 text-[var(--text-muted)] hover:text-[var(--theme-rose-text)] transition-colors rounded-lg"
                                title={t.delete_task}
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {setupMode === 'worksheet' && (
                    <div className="p-4 border-t border-[var(--border-main)] bg-[var(--bg-card)] space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[12px] font-black uppercase text-[var(--text-main)] tracking-widest">
                                {t.answer_key_toggle}
                                </span>
                                <button onClick={() => setIncludeAnswerKey(!includeAnswerKey)} className={`w-10 h-5 rounded-full transition-all relative p-1 ${includeAnswerKey ? 'bg-[var(--brand-solid)]' : 'bg-[var(--border-strong)]'}`}>
                                    <div className={`w-3 h-3 bg-white rounded-full transition-all shadow-sm ${includeAnswerKey ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                        </div>
                        {includeAnswerKey && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 space-y-2">
                                <label className="text-[12px] font-black uppercase text-[var(--text-main)] block">{t.answer_style_label}
                                    </label>
                                    <div className="grid grid-cols-2 gap-1 p-1 bg-[var(--bg-surface)] rounded-[var(--radius-btn)] border border-[var(--border-main)]">
                                        <button onClick={() => setAnswerKeyStyle('compact')} className={`py-1 rounded-[var(--radius-btn)] text-[12px] font-black uppercase transition-all ${answerKeyStyle === 'compact' ? 'bg-[var(--bg-card)] text-[var(--brand-solid)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>
                                            Kompakt
                                            </button>
                                            <button onClick={() => setAnswerKeyStyle('detailed')} className={`py-1 rounded-[var(--radius-btn)] text-[12px] font-black uppercase transition-all ${answerKeyStyle === 'detailed' ? 'bg-[var(--bg-card)] text-[var(--brand-solid)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>Steg</button></div></div>)}
                    </div>
                )}
                
            </div>
          )}
        </div>
      </div>
      
      {/*   MODALS GO HERE AT THE VERY ROOT TO OVERLAY EVERYTHING */}
      {showLiveModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
              <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[var(--radius-card)] shadow-2xl p-8 w-full max-w-md animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-6">
                      <div>
                          <h3 className="text-xl font-black text-[var(--text-main)] uppercase italic tracking-tight leading-none">{lang === 'sv' ? "Live-Inställningar" : "Live Settings"}</h3>
                          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">{packet.length} {lang === 'sv' ? "Uppgifter" : "Questions"}</p>
                      </div>
                      <button onClick={() => setShowLiveModal(false)} className="btn-ghost"><X size={20}/></button>
                  </div>

                  <div className="space-y-6">
                      {/* PACING CONTROLS */}
                      <div>
                          <label className="text-[11px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-3 block">{lang === 'sv' ? "Tempo & Navigering" : "Pacing & Navigation"}</label>
                          <div className="flex flex-col gap-2">
                              <button 
                                  onClick={() => setLiveSettings({ ...liveSettings, pacing: 'open' })}
                                  className={`theme-blue p-3 rounded-[var(--radius-btn)] border-2 text-left transition-all ${liveSettings.pacing === 'open' ? 'border-[var(--brand-solid)] bg-[var(--brand-solid)] shadow-md' : 'border-[var(--border-main)] bg-[var(--bg-surface)] hover:border-[var(--brand-border)]'}`}
                              >
                                  <div className={`font-black text-sm uppercase tracking-tight ${liveSettings.pacing === 'open' ? 'text-white' : 'text-[var(--text-main)]'}`}>{lang === 'sv' ? "Öppet (Egen takt)" : "Open (Free Pacing)"}</div>
                                  <div className={`text-[10px] font-bold leading-tight mt-0.5 ${liveSettings.pacing === 'open' ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>{lang === 'sv' ? "Elever kan bläddra fritt fram och tillbaka." : "Students navigate freely back and forth."}</div>
                              </button>
                              <button 
                                  onClick={() => setLiveSettings({ ...liveSettings, pacing: 'progressive' })}
                                  className={`theme-amber p-3 rounded-[var(--radius-btn)] border-2 text-left transition-all ${liveSettings.pacing === 'progressive' ? 'border-[var(--brand-solid)] bg-[var(--brand-solid)] shadow-md' : 'border-[var(--border-main)] bg-[var(--bg-surface)] hover:border-[var(--brand-border)]'}`}
                              >
                                  <div className={`font-black text-sm uppercase tracking-tight ${liveSettings.pacing === 'progressive' ? 'text-white' : 'text-[var(--text-main)]'}`}>{lang === 'sv' ? "Låst (En i taget)" : "Progressive Lock"}</div>
                                  <div className={`text-[10px] font-bold leading-tight mt-0.5 ${liveSettings.pacing === 'progressive' ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>{lang === 'sv' ? "Elever måste svara för att komma vidare. Kan ej gå tillbaka." : "Students must answer to advance. No going back."}</div>
                              </button>
                              <button 
                                  onClick={() => setLiveSettings({ ...liveSettings, pacing: 'teacher', order: 'original' })}
                                  className={`theme-purple p-3 rounded-[var(--radius-btn)] border-2 text-left transition-all ${liveSettings.pacing === 'teacher' ? 'border-[var(--brand-solid)] bg-[var(--brand-solid)] shadow-md' : 'border-[var(--border-main)] bg-[var(--bg-surface)] hover:border-[var(--brand-border)]'}`}
                              >
                                  <div className={`font-black text-sm uppercase tracking-tight ${liveSettings.pacing === 'teacher' ? 'text-white' : 'text-[var(--text-main)]'}`}>{lang === 'sv' ? "Lärarstyrd" : "Teacher-Led"}</div>
                                  <div className={`text-[10px] font-bold leading-tight mt-0.5 ${liveSettings.pacing === 'teacher' ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>{lang === 'sv' ? "Du byter uppgift för hela klassen samtidigt." : "You control the active question for the whole class."}</div>
                              </button>
                          </div>
                      </div>

                      {/* ANTI-CHEAT (ORDER) */}
                      <div>
                          <label className="text-[11px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-3 block">{lang === 'sv' ? "Uppgiftsordning" : "Question Order"}</label>
                          <div className="flex bg-[var(--bg-surface)] p-1 rounded-[var(--radius-btn)] shadow-inner border border-[var(--border-main)]">
                              <button 
                                  onClick={() => setLiveSettings({ ...liveSettings, order: 'original' })}
                                  className={`flex-1 py-2 rounded-[var(--radius-btn)] text-[10px] font-black uppercase tracking-wider transition-all ${liveSettings.order === 'original' ? 'bg-[var(--bg-card)] text-[var(--brand-solid)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                              >
                                  {lang === 'sv' ? "Standard" : "Standard"}
                              </button>
                              <button 
                                  disabled={liveSettings.pacing === 'teacher'}
                                  onClick={() => setLiveSettings({ ...liveSettings, order: 'randomized' })}
                                  className={`flex-1 py-2 rounded-[var(--radius-btn)] text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-30 ${liveSettings.order === 'randomized' ? 'bg-[var(--bg-card)] text-[var(--brand-solid)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                              >
                                  {lang === 'sv' ? "Slumpad" : "Randomized"}
                              </button>
                          </div>
                          
                          {/*   NEW: Explanatory notes for the order modes */}
                          <div className="mt-2.5 px-3 border-l-2 border-[var(--border-strong)]">
                              <p className="text-[9.5px] font-bold text-[var(--text-muted)] leading-relaxed">
                                  {liveSettings.order === 'original' 
                                      ? (lang === 'sv' ? "Standard: Alla börjar på uppgift 1 och gör dem i angiven ordning." : "Standard: Everyone starts on question 1 and works in the given order.")
                                      : (lang === 'sv' ? "Slumpad: Alla gör samma uppgifter men i helt slumpmässig ordning för att förhindra tjuvtittande från nyfikna grannar." : "Randomized: Everyone does the same questions but in completely random order to prevent screen peeking from nosy neighbors.")}
                              </p>
                          </div>

                          {liveSettings.pacing === 'teacher' && <p className="text-[9px] font-bold text-[var(--theme-amber-text)] mt-3 text-center">{lang === 'sv' ? "Slumpad ordning är inaktiverad i lärarstyrt läge." : "Randomization is disabled during Teacher-Led pacing."}</p>}
                      </div>

                      {/* SUMMARY VIEW TOGGLE */}
                      <div className={`theme-emerald flex items-center justify-between p-4 border rounded-[var(--radius-btn)] transition-colors duration-300 ${liveSettings.summary ? 'bg-[var(--brand-bg)] border-[var(--brand-border)]' : 'bg-[var(--bg-surface)] border-[var(--border-main)]'}`}>
                          <div>
                              <div className={`text-[11px] font-black uppercase tracking-widest transition-colors ${liveSettings.summary ? 'text-[var(--brand-solid)]' : 'text-[var(--text-main)]'}`}>{lang === 'sv' ? "Visa Resultatsöversikt" : "Show Final Summary"}</div>
                              <div className={`text-[9px] font-bold transition-colors ${liveSettings.summary ? 'text-[var(--brand-text)]' : 'text-[var(--text-muted)]'}`}>{lang === 'sv' ? "Elever ser sina egna svar efteråt." : "Students review their answers at the end."}</div>
                          </div>
                          <button 
                              onClick={() => setLiveSettings({ ...liveSettings, summary: !liveSettings.summary })} 
                              className={`w-10 h-6 rounded-full transition-colors duration-300 relative p-1 shrink-0 shadow-inner ${liveSettings.summary ? 'bg-[var(--brand-solid)]' : 'bg-slate-800'}`}
                          >
                              <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${liveSettings.summary ? 'translate-x-4' : 'translate-x-0'}`} />
                          </button>
                      </div>

                      {/* SCRATCHPAD TOGGLE */}
                      <div className={`theme-emerald flex items-center justify-between p-4 border rounded-[var(--radius-btn)] transition-colors duration-300 ${enableScratchpad ? 'bg-[var(--brand-bg)] border-[var(--brand-border)]' : 'bg-[var(--bg-surface)] border-[var(--border-main)]'}`}>
                          <div>
                              <div className={`text-[11px] font-black uppercase tracking-widest transition-colors ${enableScratchpad ? 'text-[var(--brand-solid)]' : 'text-[var(--text-main)]'}`}>{lang === 'sv' ? "Aktivera Kladdpapper" : "Enable Scratchpad"}</div>
                              <div className={`text-[9px] font-bold transition-colors ${enableScratchpad ? 'text-[var(--brand-text)]' : 'text-[var(--text-muted)]'}`}>{lang === 'sv' ? "Elever kan visa uträkningar steg-för-steg." : "Students can show work step-by-step."}</div>
                          </div>
                          <button 
                              onClick={() => setEnableScratchpad(!enableScratchpad)} 
                              className={`w-10 h-6 rounded-full transition-colors duration-300 relative p-1 shrink-0 shadow-inner ${enableScratchpad ? 'bg-[var(--brand-solid)]' : 'bg-slate-800'}`}
                          >
                              <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${enableScratchpad ? 'translate-x-4' : 'translate-x-0'}`} />
                          </button>
                      </div>
                  </div>

                  <button onClick={confirmLaunchLive} className="theme-emerald btn-brand bg-[var(--brand-solid)] text-white w-full mt-6 py-4 rounded-[var(--radius-btn)] shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2">
                      <Send size={18} /> {lang === 'sv' ? "Starta Session" : "Start Session"}
                  </button>
              </div>
          </div>
      )}

      {/* 🟢 LAUNCHES STANDALONE PRESENTATION BUILDER/VIEWER */}
      {showPresentation && (
          <PresentationView 
              packet={activeBoardSheet ? (activeBoardSheet.packet?.livePacket || activeBoardSheet.packet) : packet} 
              initialSlides={activeBoardSheet?.packet?.slides}
              boardId={activeBoardSheet?.id || (setupMode === 'board' ? activeSheetId : null)}
              sheetTitle={activeBoardSheet?.title || sheetTitle} 
              lang={lang} 
              onClose={() => { 
                  setShowPresentation(false);
                  setActiveBoardSheet(null); // 🟢 FIX: Wipes the board from memory so it doesn't ghost your next worksheet!
                  fetchLibrary(); 
              }} 
          />
      )}
    </div>
  );
}