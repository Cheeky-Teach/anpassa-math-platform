import React, { useState, useRef, useEffect } from 'react';
import { 
    X, ChevronLeft, ChevronRight, ChevronDown, Monitor, PanelLeftClose, 
    PanelLeftOpen, ZoomIn, ZoomOut, Layers, FileText, List, Plus,
    RefreshCw, Presentation, FileQuestion, Save, Download, Trash2,
} from 'lucide-react';

import VisualRenderer from '../visuals/VisualRenderer';
import InteractiveCanvas from '../whiteboard/InteractiveCanvas';
import QuestionSummoner from './QuestionSummoner';
import { supabase } from '../../lib/supabaseClient'; 
import { useMyCoach } from '../../hooks/useMyCoach';
import MyCoachModal from '../modals/MyCoachModal';

// 🟢 NEW: Imported extracted modular functions
import MathDisplay from '../shared/MathDisplay';
import { compileAnchoredStory } from '../../core/utils/storyCompiler';

export default function PresentationView({ packet, sheetTitle, lang = 'sv', onClose, initialSlides, boardId: initialBoardId }) {
    // --- MASTER SLIDE & TAB STATE ---
    const [sidebarTab, setSidebarTab] = useState('questions'); 
    
    const [slides, setSlides] = useState(initialSlides || [{ id: `slide_${Date.now()}`, elements: [], scrollX: 0, scrollY: 0, title: 'Slide 1', activeIds: [] }]);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [editingSlideIndex, setEditingSlideIndex] = useState(null);

    // --- SAVE & EXPORT STATES ---
    const [boardId, setBoardId] = useState(initialBoardId || null); 
    const [isSaving, setIsSaving] = useState(false);
    const [localTitle, setLocalTitle] = useState(sheetTitle || (lang === 'sv' ? "Min Presentation" : "My Presentation"));

    const [activeIds, setActiveIds] = useState([]);
    const [clueProgress, setClueProgress] = useState({});
    const [presentationIndex, setPresentationIndex] = useState(0);

    const [isLeftCollapsed, setIsLeftCollapsed] = useState(false); 
    const [isRightCollapsed, setIsRightCollapsed] = useState(true);
    const [textSize, setTextSize] = useState('base'); 
    const [viewMode, setViewMode] = useState('list'); 
    const [clueViewMode, setClueViewMode] = useState('steps'); 

    const [livePacket, setLivePacket] = useState(packet || []);
    const [bgType, setBgType] = useState('blank');
    const [isSummonerOpen, setIsSummonerOpen] = useState(false);

    // Tracks which question's alignment dropdown is currently open
    const [openAlignMenuId, setOpenAlignMenuId] = useState(null);

    const currentFocusedQuestion = livePacket.find(p => activeIds.includes(p.id)) || livePacket[presentationIndex] || null;
    const { coachProps } = useMyCoach(currentFocusedQuestion, lang);
    const presentationBoardEndRef = useRef(null);
    const [spotlightVisual, setSpotlightVisual] = useState(null);

    const currentPinnedIds = JSON.stringify(slides[activeSlideIndex]?.activeIds || []);
    useEffect(() => {
        if (sidebarTab === 'slides') {
            setActiveIds(JSON.parse(currentPinnedIds));
        }
    }, [activeSlideIndex, sidebarTab, currentPinnedIds]);

    useEffect(() => {
        if (clueViewMode === 'coach' && presentationBoardEndRef.current) {
            presentationBoardEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [coachProps.currentStep, clueViewMode]);

    const handleRegenerateQuestion = async (targetId) => {
        const targetItem = livePacket.find(q => q.id === targetId);
        if (!targetItem) return;
        try {
            const topic = targetItem.topicId || targetItem.topic || targetItem.topic_id || targetItem.metadata?.topic || 'algebraic_geometry';
            const level = targetItem.level || targetItem.metadata?.level || 1;
            const variation = targetItem.variationKey || targetItem.variation_key || targetItem.metadata?.variation_key;

            let url = `/api/question?topic=${topic}&level=${level}&lang=${lang}`;
            if (variation && variation !== 'generic') url += `&variation=${variation}`;

            const res = await fetch(url);
            const freshData = await res.json();

            if (freshData.error || !freshData.renderData) return;

            setLivePacket(prev => prev.map(q => {
                if (q.id === targetId) {
                    return {
                        ...q,
                        resolvedData: {
                            renderData: freshData.renderData,
                            token: freshData.token,
                            clues: freshData.clues,
                            level: freshData.level || level
                        }
                    };
                }
                return q;
            }));
            setClueProgress(prev => ({ ...prev, [targetId]: 0 }));
        } catch (err) {
            console.error("Error cycling question parameters:", err);
        }
    };
    
    // --- SLIDE MANAGEMENT ---
    const handleAddSlide = () => {
        const newSlide = { id: `slide_${Date.now()}`, elements: [], scrollX: 0, scrollY: 0, title: `Slide ${slides.length + 1}`, activeIds: [] };
        setSlides([...slides, newSlide]);
        setActiveSlideIndex(slides.length); 
        setSidebarTab('slides'); 
    };

    const handleRenameSlide = (index, newName) => {
        setSlides(prev => prev.map((s, i) => i === index ? { ...s, title: newName.trim() || `Slide ${i + 1}` } : s));
    };

    const handleDeleteSlide = (e, index) => {
        e.stopPropagation();
        if (slides.length <= 1) {
            alert(lang === 'sv' ? "Kan inte ta bort den sista sliden." : "Cannot delete the last slide.");
            return;
        }
        if (window.confirm(lang === 'sv' ? "Är du säker på att du vill ta bort denna slide?" : "Are you sure you want to delete this slide?")) {
            const newSlides = slides.filter((_, i) => i !== index);
            setSlides(newSlides);
            if (activeSlideIndex >= index && activeSlideIndex > 0) {
                setActiveSlideIndex(activeSlideIndex - 1);
            }
        }
    };

    const togglePinToSpecificSlide = (e, qId, slideIdx) => {
        e.stopPropagation();
        setSlides(prev => prev.map((s, idx) => {
            if (idx === slideIdx) {
                const pinned = s.activeIds || [];
                return { ...s, activeIds: pinned.includes(qId) ? pinned.filter(id => id !== qId) : [...pinned, qId] };
            }
            return s;
        }));
    };

    const createSlideWithQuestion = (e, qId) => {
        e.stopPropagation();
        const newSlide = { id: `slide_${Date.now()}`, elements: [], scrollX: 0, scrollY: 0, title: `Slide ${slides.length + 1}`, activeIds: [qId] };
        setSlides(prev => [...prev, newSlide]);
    };

    const handleDeleteQuestion = (e, targetId) => {
        e.stopPropagation();
        if (!window.confirm(lang === 'sv' ? "Är du säker på att du vill ta bort denna uppgift?" : "Are you sure you want to delete this question?")) return;

        setLivePacket(prev => prev.filter(q => q.id !== targetId));
        setActiveIds(prev => prev.filter(id => id !== targetId));
        setSlides(prev => prev.map(s => ({
            ...s,
            activeIds: (s.activeIds || []).filter(id => id !== targetId)
        })));

        setPresentationIndex(prev => {
            if (prev >= livePacket.length - 1) return Math.max(0, livePacket.length - 2);
            return prev;
        });
        
        setIsSaving(false);
    };

    const handleAutoDistribute = () => {
        if (!window.confirm(lang === 'sv' ? "Detta raderar dina nuvarande slides och skapar 1 ny slide per uppgift. Fortsätt?" : "This will replace current slides and create 1 slide per question. Continue?")) return;
        
        const newSlides = livePacket.map((q, idx) => ({
            id: `slide_${Date.now()}_${idx}`,
            elements: [], scrollX: 0, scrollY: 0,
            title: `Slide ${idx + 1}`,
            activeIds: [q.id]
        }));
        
        setSlides(newSlides);
        setActiveSlideIndex(0);
        setSidebarTab('slides');
    };

    const pushClueToCanvas = (clue, mode = 'both') => {
        const text = typeof clue === 'object' ? clue[lang] || clue.text : clue;
        const latex = typeof clue === 'object' ? clue.latex : null;
        
        let newElements = [];
        if ((mode === 'both' || mode === 'text') && text && text.trim() !== '') {
            newElements.push({
                id: Date.now().toString(), type: 'richText', x: 50, y: 150, width: 400, height: 100,
                content: `<p style="font-size:32px; font-weight:bold; font-family: sans-serif; line-height: normal;">${text}</p>`, stroke: '#1e293b', rotation: 0, opacity: 1
            });
        }
        if ((mode === 'both' || mode === 'math') && latex) {
            newElements.push({
                id: (Date.now() + 1).toString(), type: 'math', x: 50, y: (mode === 'both' && text) ? 280 : 150, width: 400, height: 80,
                label: latex, fontSize: 48, stroke: '#1e293b', rotation: 0, opacity: 1
            });
        }
        updateCurrentSlideElements(prev => [...prev, ...newElements]);
    };

    const pushDynamicCluesToCanvas = (qId) => {
        updateCurrentSlideElements(prev => [...prev, {
            id: Date.now().toString(), type: 'dynamicClues', x: 50, y: 150, width: 450, height: 400,
            questionId: qId, stroke: '#1e293b', rotation: 0, opacity: 1
        }]);
    };

    // --- SUPABASE SAVE PIPELINE ---
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const payload = {
                title: localTitle,
                type: 'board', 
                user_id: user.id,
                packet: { slides, livePacket, settings: { bgType, viewMode, textSize } }
            };

            let res;
            if (boardId) {
                res = await supabase.from('saved_sheets').update(payload).eq('id', boardId).select().single();
            } else {
                res = await supabase.from('saved_sheets').insert(payload).select().single();
            }

            if (res.error) throw res.error;
            setBoardId(res.data.id); 
            alert(lang === 'sv' ? "Presentationen har sparats i molnet!" : "Presentation saved to cloud!");
        } catch (err) {
            console.error("Save Error:", err);
            alert(lang === 'sv' ? "Kunde inte spara presentationen." : "Failed to save presentation.");
        } finally {
            setIsSaving(false);
        }
    };

    // --- CSV / EXCEL RAW TEXT EXPORTER ---
    const exportToCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
        csvContent += (lang === 'sv' ? "Slide,Titel,Textinnehåll\n" : "Slide,Title,Text Content\n");

        slides.forEach((slide, idx) => {
            const textElements = slide.elements.filter(el => el.type === 'richText');
            textElements.forEach(el => {
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = el.content || "";
                let rawText = tempDiv.textContent || tempDiv.innerText || "";
                rawText = rawText.replace(/"/g, '""');
                csvContent += `${idx + 1},"${slide.title}","${rawText}"\n`;
            });
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${sheetTitle || 'presentation'}_export.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const updateCurrentSlideElements = (action) => {
        setSlides(prevSlides => {
            const newSlides = [...prevSlides];
            const currentElements = newSlides[activeSlideIndex].elements;
            const nextElements = typeof action === 'function' ? action(currentElements) : action;
            newSlides[activeSlideIndex] = { ...newSlides[activeSlideIndex], elements: nextElements };
            return newSlides;
        });
    };

    const toggleQuestion = (id) => {
        if (activeIds.includes(id)) {
            setActiveIds(activeIds.filter(qId => qId !== id));
        } else if (activeIds.length < 3) {
            setActiveIds([...activeIds, id]);
            if (clueProgress[id] === undefined) setClueProgress({ ...clueProgress, [id]: 0 });
            if (activeIds.length === 0) {
                const newIdx = livePacket.findIndex(p => p.id === id);
                if (newIdx !== -1) setPresentationIndex(newIdx);
            }
        }
    };

    const focusSingleQuestionOnWorksheet = (id) => {
        setActiveIds([id]);
        if (clueProgress[id] === undefined) setClueProgress({ ...clueProgress, [id]: 0 });
        const masterIdx = livePacket.findIndex(p => p.id === id);
        if (masterIdx !== -1) setPresentationIndex(masterIdx);
    };

    const handleCanvasPrev = () => {
        if (sidebarTab === 'slides') {
            if (activeSlideIndex > 0) setActiveSlideIndex(activeSlideIndex - 1);
        } else {
            if (livePacket.length === 0) return; 
            let targetIdx = presentationIndex;
            if (activeIds.length > 0) targetIdx -= 1; 
            if (targetIdx < 0) return;
            setPresentationIndex(targetIdx);
            setActiveIds([livePacket[targetIdx].id]); 
            if (clueProgress[livePacket[targetIdx].id] === undefined) {
                setClueProgress(prev => ({ ...prev, [livePacket[targetIdx].id]: 0 }));
            }
        }
    };

    const handleCanvasNext = () => {
        if (sidebarTab === 'slides') {
            if (activeSlideIndex < slides.length - 1) setActiveSlideIndex(activeSlideIndex + 1);
        } else {
            if (livePacket.length === 0) return; 
            let targetIdx = presentationIndex;
            if (activeIds.length > 0) targetIdx += 1;
            if (targetIdx >= livePacket.length) return;
            setPresentationIndex(targetIdx);
            setActiveIds([livePacket[targetIdx].id]); 
            if (clueProgress[livePacket[targetIdx].id] === undefined) {
                setClueProgress(prev => ({ ...prev, [livePacket[targetIdx].id]: 0 }));
            }
        }
    };

    const getTextSizeClass = (type) => {
        const textMap = {
            'base': { desc: 'text-m', latex: 'text-xl', clue: 'text-m', headerText: 'text-l', visualClass: 'scale-100 max-h-[180px] mb-2' },
            'lg': { desc: 'text-xl', latex: 'text-2xl', clue: 'text-xl', headerText: 'text-xl', visualClass: 'scale-125 max-h-[240px] mb-6' },
            'xl': { desc: 'text-2xl', latex: 'text-3xl', clue: 'text-2xl', headerText: 'text-2xl', visualClass: 'scale-150 max-h-[320px] mb-12' },
            '2xl': { desc: 'text-3xl', latex: 'text-4xl', clue: 'text-3xl', headerText: 'text-3xl', visualClass: 'scale-[1.85] max-h-[420px] mb-20' }
        };
        return textMap[textSize] || textMap['base'];
    };

    const sizeClasses = getTextSizeClass();
    const getColSpanClass = (span) => ({ 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4', 6: 'col-span-6' }[span] || 'col-span-6');

    return (
        <div className="fixed inset-0 z-[100] bg-slate-100 flex flex-col font-sans overflow-hidden animate-in fade-in">
            {/* Header Navbar Layer */}
            <header className="bg-slate-900 text-white px-6 py-2 flex justify-between items-center shadow-md z-50 select-none">
                <div className="flex items-center gap-2 group">
                    <Monitor size={16} className="text-amber-400 shrink-0" />
                    <input 
                        type="text"
                        value={localTitle}
                        onChange={(e) => setLocalTitle(e.target.value)}
                        placeholder={lang === 'sv' ? "Namnge presentationen..." : "Name presentation..."}
                        className="bg-white text-slate-900 px-4 py-1.5 rounded-xl text-base font-bold outline-none border-2 border-transparent focus:border-indigo-400 transition-all w-80 sm:w-96 shadow-sm placeholder-slate-400"
                    />
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700/60 gap-1 shadow-inner">
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
                            <List size={14} /> <span className="text-[12px]">{lang === 'sv' ? "List" : "List"}</span>
                        </button>
                        <button onClick={() => setViewMode('sheet')} className={`p-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === 'sheet' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-100 hover:text-white'}`}>
                            <FileText size={14} /> <span className="text-[12px]">{lang === 'sv' ? "Blad" : "Sheet"}</span>
                        </button>
                    </div>

                    <div className="w-px h-6 bg-slate-700/60" />

                    <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700/60 gap-1 shadow-inner">
                        <button disabled={textSize === 'base'} onClick={() => setTextSize(prev => prev === '2xl' ? 'xl' : prev === 'xl' ? 'lg' : 'base')} className="p-1.5 rounded-lg text-slate-100 hover:text-white hover:bg-slate-500 disabled:opacity-20 cursor-pointer transition-colors">
                            <ZoomOut size={14} />
                        </button>
                        <span className="text-[12px] font-black uppercase tracking-widest text-slate-100 px-2 min-w-[70px] text-center">
                            {lang === 'sv' ? `TEXT: ${textSize.toUpperCase()}` : `SIZE: ${textSize.toUpperCase()}`}
                        </span>
                        <button disabled={textSize === '2xl'} onClick={() => setTextSize(prev => prev === 'base' ? 'lg' : prev === 'lg' ? 'xl' : '2xl')} className="p-1.5 rounded-lg text-slate-100 hover:text-white hover:bg-slate-700 disabled:opacity-20 cursor-pointer transition-colors">
                            <ZoomIn size={14} />
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            if (window.confirm(lang === 'sv' ? "Rensa alla valda uppgifter?" : "Clear all selected questions?")) {
                                setActiveIds([]);
                            }
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-rose-600 border border-slate-700/60 text-slate-300 hover:text-white rounded-xl text-[12px] font-black uppercase tracking-widest transition-all cursor-pointer"
                    >
                        {lang === 'sv' ? "Nollställ" : "Reset Canvas"}
                    </button>
                    
                    <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700/60 gap-1 shadow-inner">
                        <button 
                            onClick={exportToCSV}
                            className="p-1.5 rounded-lg text-slate-100 hover:text-white hover:bg-emerald-600 transition-all cursor-pointer flex items-center gap-1.5"
                            title={lang === 'sv' ? "Exportera Wordpad text till Excel (CSV)" : "Export Wordpad text to Excel (CSV)"}
                        >
                            <Download size={14} />
                            <span className="text-[12px] font-black uppercase tracking-wider hidden md:inline">{lang === 'sv' ? "Export" : "Export"}</span>
                        </button>
                        
                        <div className="w-px h-4 bg-slate-600 mx-1" />
                        
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="p-1.5 rounded-lg text-slate-100 hover:text-white hover:bg-blue-600 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                        >
                            <Save size={14} />
                            <span className="text-[12px] font-black uppercase tracking-wider hidden md:inline">
                                {isSaving ? (lang === 'sv' ? "Sparar..." : "Saving...") : (lang === 'sv' ? "Spara" : "Save")}
                            </span>
                        </button>
                    </div>

                    <div className="w-px h-6 bg-slate-700/60 hidden sm:block" />
                    <button onClick={onClose} className="bg-white/10 hover:bg-rose-500 px-6 py-2 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all cursor-pointer">{lang === 'sv' ? "Stäng" : "Close"}</button>
                </div>
            </header>

            <div 
                className="flex-1 grid overflow-hidden relative transition-all duration-300"
                style={{ gridTemplateColumns: `${isLeftCollapsed ? '72px' : '288px'} 1fr ${isRightCollapsed ? '64px' : '320px'}` }}
            >
                {/* COLUMN 1: COLLAPSIBLE WORKSPACE SELECTION PICKER */}
                <div className={`whiteboard-protect bg-white border-r border-slate-200 overflow-y-auto custom-scrollbar flex flex-col transition-all duration-300 select-none shrink-0 z-10 min-w-0 ${isLeftCollapsed ? 'w-[72px] items-center' : 'w-[288px]'}`}>
                    
                    <div className={`flex items-center justify-between p-3 border-b border-slate-100 w-full mb-3 ${isLeftCollapsed ? 'flex-col gap-2' : ''}`}>
                        {!isLeftCollapsed && <span className="font-black text-xs text-slate-400 uppercase tracking-widest pl-2">Verktyg</span>}
                        <button 
                            onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
                            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                        >
                            {isLeftCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                        </button>
                    </div>

                    <div className="w-full px-4 mb-4 shrink-0 flex flex-col gap-2">
                        {isLeftCollapsed ? (
                            <>
                                <button onClick={handleAddSlide} className="w-12 h-12 bg-emerald-500 text-white hover:bg-emerald-600 rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer mx-auto" title={lang === 'sv' ? "Lägg till Slide" : "Add Slide"}>
                                    <Presentation size={20} strokeWidth={2.5} />
                                </button>
                                <button onClick={() => setIsSummonerOpen(true)} className="w-12 h-12 bg-purple-600 text-white hover:bg-purple-700 rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer mx-auto" title={lang === 'sv' ? "Välj ny uppgift" : "Select Question"}>
                                    <FileQuestion size={20} strokeWidth={2.5} />
                                </button>
                            </>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={handleAddSlide} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex flex-col items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.98] cursor-pointer">
                                    <Presentation size={18} strokeWidth={2.5} />
                                    {lang === 'sv' ? "Ny Slide" : "New Slide"}
                                </button>
                                <button onClick={() => setIsSummonerOpen(true)} className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex flex-col items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.98] cursor-pointer">
                                    < FileQuestion size={18} strokeWidth={2.5} />
                                    {lang === 'sv' ? "Ny Uppgift" : "Add Math"}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={`flex bg-slate-100 p-1 rounded-xl mb-3 shadow-inner border border-slate-200/60 ${isLeftCollapsed ? 'flex-col gap-1 mx-2' : 'flex-row gap-1 mx-4'}`}>
                        <button 
                            onClick={() => setSidebarTab('slides')} 
                            className={`flex-1 py-2 flex items-center justify-center rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${sidebarTab === 'slides' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            title={lang === 'sv' ? "Slides" : "Slides"}
                        >
                            {isLeftCollapsed ? <Presentation size={16} /> : "Slides"}
                        </button>
                        <button 
                            onClick={() => setSidebarTab('questions')} 
                            className={`flex-1 py-2 flex items-center justify-center rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${sidebarTab === 'questions' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            title={lang === 'sv' ? "Uppgifter" : "Questions"}
                        >
                            {isLeftCollapsed ? < FileQuestion size={16} /> : (lang === 'sv' ? 'Uppgifter' : 'Questions')}
                        </button>
                    </div>

                    {!isLeftCollapsed && sidebarTab === 'questions' && livePacket.length > 0 && (
                        <div className="px-4 mb-3">
                            <button 
                                onClick={handleAutoDistribute} 
                                className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                            >
                                < FileQuestion size={14}/> {lang === 'sv' ? "Fördela 1 uppgift per slide" : "1 question per slide"}
                            </button>
                        </div>
                    )}
                    
                    {!isLeftCollapsed && (
                        <div className="px-5 mb-2">
                            <h2 className="text-[12px] font-black text-slate-400 uppercase tracking-widest truncate">
                                {sidebarTab === 'slides' 
                                    ? `${lang === 'sv' ? 'Slides' : 'Slides'} (${slides.length})` 
                                    : `${lang === 'sv' ? 'Uppgifter' : 'Questions'} (${livePacket.length})`
                                }
                            </h2>
                        </div>
                    )}

                    <div className="flex-1 flex flex-col gap-3 w-full min-w-0 pb-12 px-4">
                        {sidebarTab === 'slides' ? (
                            slides.map((slide, idx) => {
                                const isActive = activeSlideIndex === idx;
                                
                                if (isLeftCollapsed) {
                                    return (
                                        <button 
                                            key={slide.id} onClick={() => setActiveSlideIndex(idx)}
                                            className={`w-12 h-10 rounded-xl font-black text-[10px] uppercase border-2 flex items-center justify-center transition-all cursor-pointer shadow-sm shrink-0
                                                ${isActive ? 'bg-emerald-500 border-emerald-600 text-white font-black scale-105' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-400'}`}
                                        >
                                            S {idx + 1}
                                        </button>
                                    );
                                }
                                
                                return (
                                    <div 
                                        key={slide.id} onClick={() => setActiveSlideIndex(idx)}
                                        className={`group p-3 rounded-2xl border-2 cursor-pointer transition-all shrink-0 min-w-0 flex items-center justify-between ${isActive ? 'border-emerald-500 bg-emerald-50 shadow-md scale-[1.02]' : 'border-slate-100 hover:border-slate-300 bg-white'}`}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden w-full">
                                            <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-black text-[11px] ${isActive ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                {idx + 1}
                                            </div>
                                            
                                            {editingSlideIndex === idx ? (
                                                <input 
                                                    autoFocus
                                                    className="w-full text-[12px] font-black uppercase tracking-wider bg-transparent outline-none border-b-2 border-emerald-400 text-emerald-800"
                                                    defaultValue={slide.title}
                                                    onBlur={(e) => {
                                                        handleRenameSlide(idx, e.target.value);
                                                        setEditingSlideIndex(null);
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleRenameSlide(idx, e.target.value);
                                                            setEditingSlideIndex(null);
                                                        }
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            ) : (
                                                <span 
                                                    onDoubleClick={(e) => { e.stopPropagation(); setEditingSlideIndex(idx); }}
                                                    className={`text-[12px] font-black uppercase tracking-wider truncate flex-1 ${isActive ? 'text-emerald-700' : 'text-slate-500'}`}
                                                    title={lang === 'sv' ? "Dubbelklicka för att byta namn" : "Double-click to rename"}
                                                >
                                                    {slide.title}
                                                </span>
                                            )}
                                        </div>

                                        {slides.length > 1 && (
                                            <button
                                                onClick={(e) => handleDeleteSlide(e, idx)}
                                                className={`p-1.5 ml-2 rounded-lg transition-all text-slate-300 hover:text-rose-500 hover:bg-rose-100 shrink-0 opacity-0 group-hover:opacity-100 ${isActive ? 'opacity-100' : ''}`}
                                                title={lang === 'sv' ? "Ta bort slide" : "Delete slide"}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <>
                                {livePacket.map((q, idx) => {
                                    const isActive = activeIds.includes(q.id);
                                    if (isLeftCollapsed) {
                                        return (
                                            <button 
                                                key={q.id} onClick={() => toggleQuestion(q.id)}
                                                className={`w-12 h-10 rounded-xl font-black text-[10px] uppercase border-2 flex items-center justify-center transition-all cursor-pointer shadow-sm shrink-0
                                                    ${isActive ? 'bg-purple-500 border-purple-600 text-white font-black scale-105' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-400'}`}
                                            >
                                                Q {idx + 1}
                                            </button>
                                        );
                                    }
                                    return (
                                        <div 
                                            key={q.id} onClick={() => toggleQuestion(q.id)}
                                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all shrink-0 min-w-0 ${isActive ? 'border-purple-500 bg-purple-50 shadow-md scale-[1.01]' : 'border-slate-100 hover:border-slate-300 bg-white'}`}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[14px] font-black text-purple-900 uppercase tracking-wider">
                                                    {lang === 'sv' ? 'Uppgift' : 'Question'} {idx + 1}
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    <button 
                                                        onClick={(e) => togglePinToSpecificSlide(e, q.id, activeSlideIndex)}
                                                        className={`p-1.5 rounded-lg border transition-all ${
                                                            (slides[activeSlideIndex]?.activeIds || []).includes(q.id) 
                                                                ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm scale-110' 
                                                                : 'bg-white text-slate-300 hover:text-emerald-500 border-slate-200 hover:bg-emerald-50'
                                                        }`}
                                                        title={lang === 'sv' ? "Fäst på aktuell slide" : "Pin to active slide"}
                                                    >
                                                        <Monitor size={14}/>
                                                    </button>
                                                    {/* Delete Button */}
                                                    <button
                                                        onClick={(e) => handleDeleteQuestion(e, q.id)}
                                                        className="p-1.5 rounded-lg border bg-white text-slate-300 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-200 border-slate-200 transition-all"
                                                        title={lang === 'sv' ? "Ta bort uppgift" : "Delete question"}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                    {isActive && <span className="w-2 h-2 rounded-full bg-purple-500 shadow-sm ml-0.5" />}
                                                </div>
                                            </div>
                                            
                                            <div className="text-xs font-bold line-clamp-2 text-slate-600 truncate mb-3">
                                                <MathDisplay content={compileAnchoredStory(q, lang)} />
                                            </div>

                                            <div className="flex flex-col gap-1.5 mt-auto pt-2 border-t border-slate-100" onPointerDown={e => e.stopPropagation()}>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                    {lang === 'sv' ? "Fäst på Slide:" : "Pin to Slide:"}
                                                </span>
                                                <div className="flex flex-wrap gap-1">
                                                    {slides.map((s, sIdx) => {
                                                        const isPinned = (s.activeIds || []).includes(q.id);
                                                        return (
                                                            <button
                                                                key={s.id}
                                                                onClick={(e) => togglePinToSpecificSlide(e, q.id, sIdx)}
                                                                className={`w-6 h-6 rounded-md border text-[9px] font-black transition-all ${
                                                                    isPinned 
                                                                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm scale-110' 
                                                                        : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'
                                                                }`}
                                                                title={s.title}
                                                            >
                                                                {sIdx + 1}
                                                            </button>
                                                        )
                                                    })}
                                                    <button
                                                        onClick={(e) => createSlideWithQuestion(e, q.id)}
                                                        className="w-6 h-6 rounded-md border border-dashed border-slate-300 text-slate-400 hover:text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50 flex items-center justify-center transition-all"
                                                        title={lang === 'sv' ? "Skapa ny slide med denna uppgift" : "Create new slide with this question"}
                                                    >
                                                        <Plus size={10} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>
                </div>

                {/* COLUMN 2: WORKSPACE CANVAS INTERACTION SHELF */}
                <main className="relative overflow-hidden h-full w-full flex flex-col bg-slate-900/5 transition-colors duration-300">
                    
                    {/* Floating Navigation Header (Overlays the Canvas Layer) */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-40 pointer-events-none select-none">
                        <button 
                            onClick={handleCanvasPrev}
                            disabled={sidebarTab === 'slides' ? activeSlideIndex === 0 : (livePacket.length === 0 || (activeIds.length > 0 && presentationIndex === 0))}
                            className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-indigo-600 transition-all disabled:opacity-0 disabled:pointer-events-none cursor-pointer border-2 border-white/20 hover:border-white pointer-events-auto animate-in fade-in"
                        >
                            <ChevronLeft size={28} />
                        </button>

                        <div className="bg-slate-900/90 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest backdrop-blur-sm shadow border border-white/10 pointer-events-auto flex items-center gap-2 transition-all">
                            {sidebarTab === 'slides' ? (
                                <>
                                    <Presentation size={14} className="text-emerald-400"/>
                                    <span className="truncate max-w-[150px]">{slides[activeSlideIndex]?.title}</span>
                                    <span className="text-white/50 px-1 border-l border-white/20">{activeSlideIndex + 1} / {slides.length}</span>
                                </>
                            ) : (
                                <>
                                    <FileQuestion size={14} className="text-purple-400"/>
                                    {activeIds.length > 0 ? (lang === 'sv' ? `Uppgift ${presentationIndex + 1} av ${livePacket.length}` : `Question ${presentationIndex + 1} of ${livePacket.length}`) : (lang === 'sv' ? 'Ingen uppgift vald' : 'No Question Selected')}
                                </>
                            )}
                        </div>

                        <button 
                            onClick={handleCanvasNext}
                            disabled={sidebarTab === 'slides' ? activeSlideIndex >= slides.length - 1 : (livePacket.length === 0 || (activeIds.length > 0 && presentationIndex >= livePacket.length - 1))}
                            className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-indigo-600 transition-all disabled:opacity-0 disabled:pointer-events-none cursor-pointer border-2 border-white/20 hover:border-white pointer-events-auto animate-in fade-in"
                        >
                            <ChevronRight size={28} />
                        </button>
                    </div>

                    {/* 🟢 NEW: The Responsive 16:9 Presentation Boundary Wrapper */}
                    <div className="flex-1 w-full h-full flex items-center justify-center p-4 sm:p-12 overflow-hidden">
                        
                        <div 
                            className={`relative w-full h-full flex flex-col items-center shadow-2xl rounded-xl border border-slate-300 transition-colors duration-300 overflow-hidden ${bgType === 'grid' ? 'bg-white' : 'bg-[#f9fbf7]'}`}
                            style={{
                                aspectRatio: '16/9',
                                maxHeight: '100%',
                                maxWidth: '100%',
                                ...(bgType === 'grid' ? {
                                    backgroundImage: 'linear-gradient(#e2e8f0 2px, transparent 2px), linear-gradient(90deg, #e2e8f0 2px, transparent 2px)',
                                    backgroundSize: '40px 40px',
                                    backgroundPosition: '-1px -1px'
                                } : {})
                            }}
                        >
                            
                            {/* Slide Content Layers */}
                            {viewMode === 'sheet' ? (
                                <div className="absolute inset-0 overflow-y-auto custom-scrollbar pt-16 pb-32 flex flex-col justify-start items-center z-10 pointer-events-auto">
                                    <div className="bg-white shadow-2xl w-[210mm] h-auto min-h-[297mm] p-[15mm] pb-[40mm] flex flex-col rounded-sm border border-slate-300 animate-in fade-in zoom-in-95 duration-300 select-none mb-8 mt-2 relative z-20">
                                        <header className="border-b-2 border-black pb-2 mb-6 flex items-end justify-between">
                                            <h1 className="text-md font-black uppercase tracking-tighter w-1/3 truncate italic leading-none">{sheetTitle || "Matematik"}</h1>
                                            <div className="flex gap-6 w-2/3 justify-end text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                <div className="border-b border-slate-200 pb-0.5 flex gap-2 flex-1 max-w-[160px]"><span>{lang === 'sv' ? "Namn:" : "Name:"}</span></div>
                                                <div className="border-b border-slate-200 pb-0.5 flex gap-2 w-[100px]"><span>{lang === 'sv' ? "Datum:" : "Date:"}</span></div>
                                            </div>
                                        </header>

                                        <div className="grid grid-cols-6 gap-x-8 gap-y-6 items-start content-start relative">
                                            {livePacket.map((item, idx) => {
                                                const isFocused = activeIds.includes(item.id);
                                                const hasAnyFocus = activeIds.length > 0;
                                                
                                                const displayStory = item.showText !== false;
                                                const rd = item.resolvedData?.renderData;
                                                const displayLatex = item.showLatex !== false && !rd?.geometry;
                                                const displayVisual = item.showVisual !== false;

                                                return (
                                                    <React.Fragment key={item.id}>
                                                        {displayStory && (item.instructionMode === 'header' || !item.instructionMode) && (
                                                            <div className={`col-span-6 border-l-4 border-indigo-500 pl-4 bg-slate-50/40 rounded-r-xl py-2.5 transition-all duration-300
                                                                ${hasAnyFocus && !isFocused ? 'opacity-25' : 'opacity-100'}`}>
                                                                <div className={`font-black text-slate-800 italic uppercase tracking-tight ${sizeClasses.headerText}`}>
                                                                    <MathDisplay content={compileAnchoredStory(item, lang)} />
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div 
                                                            onClick={() => focusSingleQuestionOnWorksheet(item.id)}
                                                            className={`relative transition-all duration-300 rounded-2xl flex flex-col p-3 cursor-pointer group
                                                                ${getColSpanClass(item.columnSpan || 6)}
                                                                ${isFocused ? 'bg-indigo-50/50 ring-2 ring-indigo-500/30 opacity-100 scale-[1.01]' : hasAnyFocus ? 'opacity-25' : 'hover:bg-slate-50'}`}
                                                        >
                                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-50 flex gap-1 bg-white p-1 rounded-full shadow-lg border border-slate-200" onPointerDown={(e) => e.stopPropagation()}>
                                                                <div className="flex bg-slate-100 rounded-full p-0.5">
                                                                    {['start', 'center', 'end'].map(align => (
                                                                        <button key={align} onClick={() => {
                                                                            setLivePacket(prev => prev.map(p => p.id === item.id ? { ...p, align } : p));
                                                                            setIsSaving(false);
                                                                        }} className={`px-2 py-1 rounded-full text-[9px] font-black uppercase transition-all ${item.align === align ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-indigo-600'}`}>
                                                                            {align}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                                <div className="flex bg-slate-100 rounded-full p-0.5">
                                                                    {[2, 3, 4, 6].map(span => (
                                                                        <button key={span} onClick={() => {
                                                                            setLivePacket(prev => prev.map(p => p.id === item.id ? { ...p, columnSpan: span } : p));
                                                                            setIsSaving(false);
                                                                        }} className={`px-2 py-1 rounded-full text-[9px] font-black uppercase transition-all ${item.columnSpan === span ? 'bg-amber-500 text-white' : 'text-slate-500 hover:text-amber-600'}`}>
                                                                            W{span}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className={`text-xs flex flex-col h-full justify-between items-${item.align || 'center'} text-${item.align === 'start' ? 'left' : item.align === 'end' ? 'right' : 'center'}`}>
                                                                <div>
                                                                    <div className="font-black mb-1 text-slate-400 text-[10px] tracking-widest">
                                                                        {idx + 1}.
                                                                    </div>
                                                                    
                                                                    {displayStory && item.instructionMode === 'inline' && (
                                                                        <div className={`font-bold text-slate-800 mb-2 leading-tight border-b border-slate-100 pb-2 ${sizeClasses.desc}`}>
                                                                            <MathDisplay content={compileAnchoredStory(item, lang)} />
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {displayLatex && rd?.latex && (
                                                                        <div className={`py-3 text-center font-serif text-slate-900 ${sizeClasses.latex}`}>
                                                                            <MathDisplay content={`$$${rd.latex}$$`} />
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {rd?.options && rd.options.length > 0 && (
                                                                        <div className="mt-2 grid grid-cols-2 gap-1.5 w-full">
                                                                            {rd.options.map((opt, oIdx) => (
                                                                                <div key={oIdx} className="flex items-center gap-1.5 text-[10px] bg-slate-50/60 p-1.5 rounded-lg border border-slate-100">
                                                                                    <span className="font-black text-indigo-500">{['A','B','C','D','E','F'][oIdx]}</span>
                                                                                    <MathDisplay content={opt} />
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {displayVisual && rd && (
                                                                        <div 
                                                                            onClick={(e) => { e.stopPropagation(); setSpotlightVisual(rd); }}
                                                                            className={`flex justify-center origin-top transition-all duration-300 cursor-zoom-in hover:opacity-80 relative z-30 ${sizeClasses.visualClass}`}
                                                                        >
                                                                            <VisualRenderer 
                                                                                data={rd} 
                                                                                isWordProblem={item.selectedStoryIndex !== null && item.selectedStoryIndex !== undefined} 
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </React.Fragment>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                                    {/* 🟢 FIX: Moved the comment INSIDE the div so it doesn't break the ternary operator! */}
                                    <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full pointer-events-none">
                                        <foreignObject x="0" y="0" width="1920" height="1080" className="pointer-events-none">
                                            <div className="w-full h-full relative flex items-start select-none pt-[80px] pb-[80px] pointer-events-auto">
                                                
                                                {clueViewMode === 'coach' ? (
                                                    <MyCoachModal
                                                        lang={lang}
                                                        inlineMode={true} 
                                                        question={currentFocusedQuestion} 
                                                        {...coachProps} 
                                                    />
                                                ) : activeIds.length === 0 ? (
                                                    <div className="absolute top-5 left-5 flex items-center gap-2 text-slate-400/50 bg-white/50 px-3 py-1.5 rounded-lg border border-slate-200/50 pointer-events-none select-none z-0">
                                                        <ChevronLeft size={14} className="animate-pulse" />
                                                        <span className="font-black uppercase tracking-widest text-[9px]">
                                                            {lang === 'sv' ? "Välj uppgift för att presentera" : "Select question to present"}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    activeIds.map((id, index) => {
                                                        const q = livePacket.find(p => p.id === id);
                                                        if (!q) return null;
                                                        const rd = q.resolvedData?.renderData;
                                                        const masterIndex = livePacket.findIndex(p => p.id === id) + 1;

                                                        const alignClass = q.align === 'start' ? 'items-start' : q.align === 'end' ? 'items-end' : 'items-center';
                                                        const textAlignClass = q.align === 'start' ? 'text-left' : q.align === 'end' ? 'text-right' : 'text-center';

                                                        return (
                                                            <div 
                                                                key={id} 
                                                                className={`group flex flex-col flex-1 px-8 relative h-full ${alignClass} justify-start animate-in zoom-in-95 duration-200`}
                                                            >
                                                                {index > 0 && (
                                                                    <div className="absolute top-0 bottom-0 left-0 border-l-4 border-dashed border-slate-400/80 -translate-x-1/2 pointer-events-none" />
                                                                )}

                                                                <div className={`flex flex-col mb-3 shrink-0 relative z-40 mt-4 items-${q.align === 'start' ? 'start' : q.align === 'end' ? 'end' : 'center'}`}>
                                                                    <div className="flex items-center gap-3">
                                                                        
                                                                        <button 
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setOpenAlignMenuId(prev => prev === q.id ? null : q.id);
                                                                            }}
                                                                            className="flex items-center gap-1.5 text-[14px] font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 hover:border-indigo-200 rounded-md px-2.5 py-1 uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer pointer-events-auto"
                                                                            title={lang === 'sv' ? "Ändra justering" : "Change alignment"}
                                                                        >
                                                                            {lang === 'sv' ? `Uppgift ${masterIndex}` : `Question ${masterIndex}`}
                                                                            <ChevronDown size={16} className={`transition-transform duration-200 ${openAlignMenuId === q.id ? 'rotate-180' : ''}`} />
                                                                        </button>
                                                                        
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleRegenerateQuestion(q.id); }}
                                                                            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all active:scale-90 cursor-pointer pointer-events-auto ui-ignore"
                                                                            title={lang === 'sv' ? "Slå om tal / slumpa nya värden" : "Roll fresh question numbers"}
                                                                        >
                                                                            <RefreshCw size={18} className="transition-transform duration-300 hover:rotate-180" />
                                                                        </button>
                                                                    </div>

                                                                    {openAlignMenuId === q.id && (
                                                                        <div className="absolute top-full mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200 flex bg-white/95 backdrop-blur-sm p-1 rounded-xl shadow-md border border-slate-200 pointer-events-auto z-50" onPointerDown={(e) => e.stopPropagation()}>
                                                                            <div className="flex bg-slate-100 rounded-lg p-0.5">
                                                                                {['start', 'center', 'end'].map(align => (
                                                                                    <button key={align} onClick={() => {
                                                                                        setLivePacket(prev => prev.map(p => p.id === q.id ? { ...p, align } : p));
                                                                                        setIsSaving(false);
                                                                                        setOpenAlignMenuId(null); 
                                                                                    }} className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${q.align === align ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-200'}`}>
                                                                                        {align === 'start' ? (lang === 'sv' ? 'Vänster' : 'Left') : align === 'end' ? (lang === 'sv' ? 'Höger' : 'Right') : (lang === 'sv' ? 'Mitten' : 'Center')}
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {q.showText !== false && (
                                                                    <div className={`font-bold text-slate-800 ${textAlignClass} leading-relaxed max-w-md w-full shrink-0 break-words px-4 mb-2 ${sizeClasses.desc}`}>
                                                                        <MathDisplay content={compileAnchoredStory(q, lang)} />
                                                                    </div>
                                                                )}
                                                                
                                                                {q.showVisual !== false && rd && (
                                                                    <div 
                                                                        onClick={(e) => { e.stopPropagation(); setSpotlightVisual(rd); }}
                                                                        className={`flex justify-center origin-top transition-all duration-300 cursor-zoom-in hover:opacity-80 overflow-visible shrink-0 relative z-30 w-full max-w-md px-4 pointer-events-auto ${sizeClasses.visualClass}`}
                                                                    >
                                                                        <VisualRenderer 
                                                                            data={rd} 
                                                                            isWordProblem={q.selectedStoryIndex !== null && q.selectedStoryIndex !== undefined} 
                                                                        />
                                                                    </div>
                                                                )}

                                                                {rd?.options && rd.options.length > 0 && (
                                                                    <div className="mt-6 grid grid-cols-2 gap-4 w-full max-w-md px-4 shrink-0 relative z-30 pointer-events-auto">
                                                                        {rd.options.map((opt, oIdx) => (
                                                                            <div key={oIdx} className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-slate-200 bg-white shadow-sm ${sizeClasses.desc}`}>
                                                                                <span className="font-black text-indigo-500">{['A','B','C','D','E','F'][oIdx]}</span>
                                                                                <MathDisplay content={opt} className="font-bold text-slate-700" />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                {q.showLatex !== false && rd?.latex && !rd?.geometry && (
                                                                    <div className={`mt-6 py-4 bg-indigo-50/40 rounded-2xl text-center font-serif text-indigo-950 border border-indigo-100/60 shadow-inner w-full max-w-xs shrink-0 pointer-events-auto ${sizeClasses.latex}`}>
                                                                        <MathDisplay content={`$$${rd.latex}$$`} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    }) 
                                                )}
                                            </div>
                                        </foreignObject>
                                    </svg>
                                </div>
                            )}

                            {/* Whiteboard Layer */}
                            <InteractiveCanvas 
                                key={slides[activeSlideIndex]?.id} 
                                elements={slides[activeSlideIndex]?.elements || []}
                                setElements={updateCurrentSlideElements}
                                lang={lang} 
                                bgType={bgType} 
                                onToggleBg={() => setBgType(prev => prev === 'blank' ? 'grid' : 'blank')} 
                                livePacket={livePacket}
                                clueProgress={clueProgress}
                                resolution={{ w: 1920, h: 1080 }}
                            />
                        </div>
                    </div>
                </main>

                {/* COLUMN 3: SOLUTIONS & COMPACT ANSWER KEY DRAWER PANEL */}
                <div 
                    className={`whiteboard-protect bg-white border-l border-slate-200 flex flex-col shrink-0 select-none h-full transition-all duration-300 relative min-h-0 overflow-hidden
                        ${isRightCollapsed ? 'w-16 p-2 items-center justify-start pt-4' : 'w-80 p-6 gap-6'}`}
                >
                    {isRightCollapsed ? (
                        <button
                            onClick={() => setIsRightCollapsed(false)}
                            className="w-12 flex-1 flex flex-col items-center justify-start py-6 bg-slate-50 hover:bg-indigo-50 border border-slate-200/60 rounded-2xl cursor-pointer group transition-all text-slate-400 hover:text-indigo-600 gap-4"
                            title={lang === 'sv' ? "Expandera panel" : "Expand Panel"}
                        >
                            <Layers size={16} className="shrink-0 transition-transform group-hover:scale-110" />
                            
                            <span 
                                className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap mt-4 select-none"
                                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                            >
                                {clueViewMode === 'steps' 
                                    ? (lang === 'sv' ? "Ledtråd" : "Clues") 
                                    : (lang === 'sv' ? "Facit" : "Answer Key")}
                            </span>
                        </button>
                    ) : (
                        <>
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setIsRightCollapsed(true)}
                                        className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer mr-0.5"
                                        title={lang === 'sv' ? "Minimera panel" : "Minimize Panel"}
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                    <Layers size={14} className="text-slate-400" />
                                    <h2 className="text-[12px] font-black text-slate-400 uppercase tracking-widest">
                                        {clueViewMode === 'steps' ? (lang === 'sv' ? "Steg-för-steg" : "Solution Steps") : (lang === 'sv' ? "Facit" : "Answer Key")}
                                    </h2>
                                </div>
                                
                                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 shadow-inner gap-0.5">
                                    <button
                                        onClick={() => setClueViewMode('steps')}
                                        className={`px-2 py-1 text-[10px] font-black uppercase rounded-md transition-all cursor-pointer ${clueViewMode === 'steps' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        {lang === 'sv' ? "Steg" : "Steps"}
                                    </button>
                                    
                                    <button
                                        onClick={() => setClueViewMode('coach')}
                                        className={`px-2 py-1 text-[10px] font-black uppercase rounded-md transition-all cursor-pointer ${clueViewMode === 'coach' ? 'bg-purple-600 text-white shadow-sm' : 'text-purple-500 hover:text-purple-700'}`}
                                    >
                                        Coach
                                    </button>

                                    <button
                                        onClick={() => setClueViewMode('answers')}
                                        className={`px-2 py-1 text-[10px] font-black uppercase rounded-md transition-all cursor-pointer ${clueViewMode === 'answers' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        {lang === 'sv' ? "Svar" : "Answers"}
                                    </button>
                                </div>
                            </div>
                            {clueViewMode === 'coach' ? (
                                <div className="flex-1 flex flex-col min-h-0 justify-center items-center bg-slate-50/60 p-6 rounded-2xl border border-dashed border-slate-200 text-center animate-in fade-in duration-200">
                                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-3 animate-pulse shadow-sm">
                                        <Layers size={20} />
                                    </div>
                                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                                        {lang === 'sv' ? "Coach Aktiv i Mitten" : "Coach View Active"}
                                    </h4>
                                    <p className="text-[11px] font-bold text-slate-400 max-w-[200px] leading-relaxed">
                                        {lang === 'sv' 
                                            ? "Hela genomgången med tavelkontroller och förklaringar visas nu på stora skärmen." 
                                            : "The complete walkthrough dashboard is now displayed on the main center board."}
                                    </p>
                                </div>
                            ) : clueViewMode === 'answers' ? (
                                <div className="flex-1 flex flex-col min-h-0 animate-in fade-in duration-200 overflow-y-auto custom-scrollbar">
                                    {livePacket.length === 0 ? (
                                        <div className="text-center text-slate-300 italic text-m mt-12">Tomt arbetsblad</div>
                                    ) : (
                                        <div className={`columns-2 gap-x-4 gap-y-2 font-bold leading-normal break-inside-avoid text-slate-700 ${sizeClasses.latex}`}>
                                            {livePacket.map((q, idx) => {
                                                const rd = q.resolvedData?.renderData;
                                                const clues = q?.clues || q?.resolvedData?.clues || [];

                                                let finalPayload = rd?.answer || q.answer;

                                                if (!finalPayload && clues.length > 0) {
                                                    const lastClue = clues[clues.length - 1];
                                                    finalPayload = typeof lastClue === 'object' 
                                                        ? (lastClue.latex || lastClue[lang] || lastClue.text) 
                                                        : lastClue;
                                                }

                                                if (!finalPayload) finalPayload = "-";
                                                const inlineMathAnswer = `$${String(finalPayload).replace(/\$/g, '')}$`;

                                                return (
                                                    <div 
                                                        key={`key-ans-${q.id}`} 
                                                        className="inline-block w-full py-2 px-3 mb-2 bg-slate-50 border border-slate-200/60 rounded-xl overflow-hidden text-ellipsis transition-all duration-200"
                                                    >
                                                        <span className="font-black text-indigo-600 mr-2 text-[14px] select-none inline-block align-middle">
                                                            {idx + 1}:
                                                        </span>
                                                        <div className="inline-block align-middle max-w-[80%] overflow-hidden text-ellipsis">
                                                            <MathDisplay content={inlineMathAnswer} className="font-bold text-slate-800" />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col min-h-0 gap-4 overflow-y-auto custom-scrollbar pr-1">
                                    {activeIds.length === 0 && (
                                        <div className="text-center text-slate-300 italic text-xs mt-12 px-4">
                                            {lang === 'sv' ? "Klicka på en uppgift i arbetsbladet för att visa tillhörande lösningssteg." : "Click any question inside the worksheet page to load its clues."}
                                        </div>
                                    )}

                                    {activeIds.map(id => {
                                        const q = livePacket.find(p => p.id === id);
                                        const clues = q?.clues || q?.resolvedData?.clues || [];
                                        const progress = clueProgress[id] || 0;
                                        const masterIndex = livePacket.findIndex(p => p.id === id) + 1;

                                        if (!q || clues.length === 0) return null;

                                        return (
                                            <div key={`clues-${id}`} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 animate-in slide-in-from-right-4 duration-300 mb-2 shrink-0">
                                                <div className="flex items-center justify-between mb-4 bg-white p-2 rounded-xl border border-slate-200/60 shadow-sm gap-2 overflow-hidden">
                                                    <div className="text-[11px] font-black uppercase text-indigo-600 tracking-wider whitespace-nowrap">
                                                        Q{masterIndex}
                                                    </div>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <button
                                                            onClick={() => pushDynamicCluesToCanvas(id)}
                                                            className="px-1.5 py-1 text-amber-600 hover:text-white rounded bg-amber-50 hover:bg-amber-500 border border-amber-200 transition-colors cursor-pointer text-[9px] font-black uppercase tracking-tight flex items-center gap-1 shadow-sm"
                                                            title={lang === 'sv' ? "Lägg till dynamisk lösningsbox" : "Add dynamic solution box"}
                                                        >
                                                            <Plus size={10}/> Box
                                                        </button>
                                                        {progress > 0 && (
                                                            <button
                                                                onClick={() => setClueProgress({ ...clueProgress, [id]: 0 })}
                                                                className="p-1 text-slate-400 hover:text-rose-500 rounded bg-slate-50 border border-slate-100 hover:border-rose-100 transition-colors cursor-pointer"
                                                                title={lang === 'sv' ? "Dölj" : "Reset"}
                                                            >
                                                                <RefreshCw size={12}/>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-2.5">
                                                    {clues.slice(0, progress).map((clue, idx) => {
                                                        const text = typeof clue === 'object' ? clue[lang] || clue.text : clue;
                                                        const latex = typeof clue === 'object' ? clue.latex : null;
                                                        return (
                                                            <div key={idx} className="group relative bg-white p-3 rounded-xl shadow-sm border-l-4 border-amber-400 animate-in slide-in-from-top-2 duration-200">
                                                                
                                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-1 bg-white/90 backdrop-blur-sm p-1 rounded-lg shadow-sm border border-amber-100">
                                                                    {text && (
                                                                        <button onClick={() => pushClueToCanvas(clue, 'text')} className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white rounded text-[9px] font-black uppercase transition-all" title="Lägg till som Text">
                                                                            T
                                                                        </button>
                                                                    )}
                                                                    {latex && (
                                                                        <button onClick={() => pushClueToCanvas(clue, 'math')} className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white rounded text-[9px] font-black uppercase transition-all" title="Lägg till som Math/LaTeX">
                                                                            ∑
                                                                        </button>
                                                                    )}
                                                                    {text && latex && (
                                                                        <button onClick={() => pushClueToCanvas(clue, 'both')} className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white rounded text-[9px] font-black uppercase transition-all" title="Lägg till båda">
                                                                            +
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                <div className={`font-bold text-slate-700 leading-snug pr-12 ${sizeClasses.clue}`}>
                                                                    <MathDisplay content={text}/>
                                                                </div>
                                                                {latex && (
                                                                    <div className="mt-2 text-center text-indigo-600 font-serif bg-indigo-50/20 py-1.5 rounded border border-indigo-50/50 scale-95 origin-center">
                                                                        <MathDisplay content={`$$${latex}$$`}/>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* CLASSROOM SPOTLIGHT VISUAL LIGHTBOX MODAL */}
            {spotlightVisual && (
                <div 
                    onClick={() => setSpotlightVisual(null)} 
                    className="fixed inset-0 z-[300] bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-12 cursor-zoom-out animate-in fade-in duration-200 select-none"
                >
                    <div className="absolute top-6 text-white/40 text-[11px] font-black uppercase tracking-widest bg-white/5 border border-white/10 px-4 py-1.5 rounded-full shadow">
                        {lang === 'sv' ? "Klicka var som helst för att gå tillbaka" : "Click anywhere to close spotlight"}
                    </div>
                    <div 
                        onClick={(e) => e.stopPropagation()} 
                        className="bg-white p-12 rounded-[2.5rem] shadow-2xl flex items-center justify-center border border-slate-100 max-w-4xl max-h-[75vh] min-w-[450px] min-h-[350px] transform scale-[1.65] origin-center shadow-emerald-950/20"
                    >
                        <VisualRenderer 
                            data={spotlightVisual} 
                            isWordProblem={false}
                        />
                    </div>
                </div>
            )}

            {/* THE SUMMONER MODAL */}
            {isSummonerOpen && (
                <QuestionSummoner 
                    lang={lang} 
                    onClose={() => setIsSummonerOpen(false)} 
                    onSummon={(newItems) => {
                        // Safety check: ensure array isn't empty
                        if (!newItems || newItems.length === 0) return;

                        //  1. Spread the entire array of queued items into the live packet
                        const updatedPacket = [...livePacket, ...newItems];
                        setLivePacket(updatedPacket);
                        
                        //  2. Auto-focus the FIRST question from the newly queued batch
                        setActiveIds([newItems[0].id]);
                        
                        //  3. Initialize the clue progress at 0 for EVERY new item
                        const updatedProgress = { ...clueProgress };
                        newItems.forEach(item => {
                            updatedProgress[item.id] = 0;
                        });
                        setClueProgress(updatedProgress);
                        
                        //  4. Move the presentation view to the start of the new batch
                        setPresentationIndex(livePacket.length);
                        
                        setSidebarTab('questions');
                        setIsSummonerOpen(false);
                    }} 
                />
            )}
        </div>
    );
}