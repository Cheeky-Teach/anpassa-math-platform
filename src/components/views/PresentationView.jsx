import React, { useState, useRef, useEffect } from 'react';
import { 
    X, ChevronLeft, ChevronRight, Monitor, PanelLeftClose, 
    PanelLeftOpen, ZoomIn, ZoomOut, Layers, FileText, List, Plus,
    RefreshCw, Presentation, Sparkles, Save, Download, Trash2
} from 'lucide-react';

import VisualRenderer from '../visuals/VisualRenderer';
import InteractiveCanvas from '../whiteboard/InteractiveCanvas';
import QuestionSummoner from './QuestionSummoner';
import { supabase } from '../../lib/supabaseClient'; 
import { useMyCoach } from '../../hooks/useMyCoach';
import MyCoachModal from '../modals/MyCoachModal';

// Standard Math Renderer
const MathDisplay = ({ content, className = "" }) => {
    const containerRef = useRef(null);
    useEffect(() => {
        if (!content || !containerRef.current) return;
        containerRef.current.innerText = content;
        if (window.renderMathInElement) {
            window.renderMathInElement(containerRef.current, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false }
                ], throwOnError: false, trust: true
            });
        }
    }, [content]);
    return <div ref={containerRef} className={`math-content leading-relaxed whitespace-pre-wrap text-inherit ${className}`} />;
};

// Word Problem Story Compiler
const compileAnchoredStory = (item, lang = 'sv') => {
    const rd = item.resolvedData?.renderData;
    if (item.selectedStoryIndex === undefined || item.selectedStoryIndex === null || !rd?.availableStories) {
        return rd?.description || item.name;
    }
    const storyPackage = rd.availableStories[item.selectedStoryIndex];
    if (!storyPackage) return rd?.description || item.name;
    
    let template = storyPackage[lang === 'en' ? 'en' : 'sv'];
    let params = rd.extractedParams;

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

export default function PresentationView({ packet, sheetTitle, lang = 'sv', onClose, initialSlides, boardId: initialBoardId }) {
    // ---   NEW: MASTER SLIDE & TAB STATE ---
    const [sidebarTab, setSidebarTab] = useState('questions'); 
    //   UPDATED: Added title to initial state
    const [slides, setSlides] = useState(initialSlides || [{ id: `slide_${Date.now()}`, elements: [], scrollX: 0, scrollY: 0, title: 'Slide 1' }]);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [editingSlideIndex, setEditingSlideIndex] = useState(null);

    // ---  NEW: SAVE & EXPORT STATES ---
    const [boardId, setBoardId] = useState(initialBoardId || null); 
    const [isSaving, setIsSaving] = useState(false);
    const [localTitle, setLocalTitle] = useState(sheetTitle || (lang === 'sv' ? "Min Presentation" : "My Presentation"));

    const [activeIds, setActiveIds] = useState([]);
    const [clueProgress, setClueProgress] = useState({});
    const [presentationIndex, setPresentationIndex] = useState(0);

    const [isLeftCollapsed, setIsLeftCollapsed] = useState(false); // Default open to see new features
    const [isRightCollapsed, setIsRightCollapsed] = useState(true);
    const [textSize, setTextSize] = useState('base'); 
    const [viewMode, setViewMode] = useState('list'); 
    const [clueViewMode, setClueViewMode] = useState('steps'); 

    const [livePacket, setLivePacket] = useState(packet || []);
    const [bgType, setBgType] = useState('blank');
    const [isSummonerOpen, setIsSummonerOpen] = useState(false);

    const currentFocusedQuestion = livePacket.find(p => activeIds.includes(p.id)) || livePacket[presentationIndex] || null;
    const { coachProps } = useMyCoach(currentFocusedQuestion, lang);
    const presentationBoardEndRef = useRef(null);
    const [spotlightVisual, setSpotlightVisual] = useState(null);

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
    
    // ---   NEW: SLIDE MANAGEMENT ---
    const handleAddSlide = () => {
        //   UPDATED: Auto-generates a sequential title for new slides
        const newSlide = { id: `slide_${Date.now()}`, elements: [], scrollX: 0, scrollY: 0, title: `Slide ${slides.length + 1}` };
        setSlides([...slides, newSlide]);
        setActiveSlideIndex(slides.length); 
        setSidebarTab('slides'); 
    };

    //   NEW: Handler to save the custom slide name
    const handleRenameSlide = (index, newName) => {
        setSlides(prev => prev.map((s, i) => i === index ? { ...s, title: newName.trim() || `Slide ${i + 1}` } : s));
    };

    // --- 🟢 NEW: DELETE SLIDE ---
    const handleDeleteSlide = (e, index) => {
        e.stopPropagation();
        if (slides.length <= 1) {
            alert(lang === 'sv' ? "Kan inte ta bort den sista sliden." : "Cannot delete the last slide.");
            return;
        }
        if (window.confirm(lang === 'sv' ? "Är du säker på att du vill ta bort denna slide?" : "Are you sure you want to delete this slide?")) {
            const newSlides = slides.filter((_, i) => i !== index);
            setSlides(newSlides);
            // Seamlessly shift the active slide index to prevent crashing if the active slide was deleted
            if (activeSlideIndex >= index && activeSlideIndex > 0) {
                setActiveSlideIndex(activeSlideIndex - 1);
            }
        }
    };

    // --- 🟢 NEW: SUPABASE SAVE PIPELINE ---
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const payload = {
                title: localTitle,
                type: 'board', // 🟢 Crucial: Flags this specifically as a Presentation Board in the DB
                user_id: user.id,
                packet: { slides, livePacket, settings: { bgType, viewMode, textSize } }
            };

            let res;
            if (boardId) {
                // Overwrite existing board
                res = await supabase.from('saved_sheets').update(payload).eq('id', boardId).select().single();
            } else {
                // Create brand new board
                res = await supabase.from('saved_sheets').insert(payload).select().single();
            }

            if (res.error) throw res.error;
            setBoardId(res.data.id); // Save the ID so the next click updates it
            alert(lang === 'sv' ? "Presentationen har sparats i molnet!" : "Presentation saved to cloud!");
        } catch (err) {
            console.error("Save Error:", err);
            alert(lang === 'sv' ? "Kunde inte spara presentationen." : "Failed to save presentation.");
        } finally {
            setIsSaving(false);
        }
    };

    // --- 🟢 NEW: CSV / EXCEL RAW TEXT EXPORTER ---
    const exportToCSV = () => {
        // \uFEFF is the Byte Order Mark (BOM) - This FORCES Excel to read the file correctly with Swedish ÅÄÖ!
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
        csvContent += (lang === 'sv' ? "Slide,Titel,Textinnehåll\n" : "Slide,Title,Text Content\n");

        slides.forEach((slide, idx) => {
            // Find all wordpad text boxes on this specific slide
            const textElements = slide.elements.filter(el => el.type === 'richText');
            
            textElements.forEach(el => {
                // Safely strip HTML tags using a temporary DOM node
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = el.content || "";
                let rawText = tempDiv.textContent || tempDiv.innerText || "";
                
                // Escape quotes for CSV compliance
                rawText = rawText.replace(/"/g, '""');
                
                // Append row
                csvContent += `${idx + 1},"${slide.title}","${rawText}"\n`;
            });
        });

        // Trigger the automatic browser download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${sheetTitle || 'presentation'}_export.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // This intercepts InteractiveCanvas's state updates and saves them to the active slide
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

    // ---   UPDATED: CONTEXT-AWARE NAVIGATION CONTROLS ---
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
                    {/* 🟢 NEW: Editable Title Input */}
                    <input 
                        type="text"
                        value={localTitle}
                        onChange={(e) => setLocalTitle(e.target.value)}
                        placeholder={lang === 'sv' ? "Namnge presentationen..." : "Name presentation..."}
                        className="bg-white text-m font-black uppercase tracking-widest italic text-black outline-none border-b border-transparent focus:border-white/40 hover:border-white/20 transition-colors w-64 placeholder-white/30"
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
                    
                    {/* 🟢 NEW: SAVE AND EXPORT CONTROL BLOCK */}
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
                {/* 🟢 ADDED: whiteboard-protect wrapper. */}
                <div className={`whiteboard-protect bg-white border-r border-slate-200 overflow-y-auto custom-scrollbar flex flex-col transition-all duration-300 select-none shrink-0 z-10 min-w-0 ${isLeftCollapsed ? 'p-2 items-center' : 'p-5'}`}>
                    
                    {/*   NEW: DUAL ACTION BUTTON STRIP */}
                    <div className="w-full mb-4 shrink-0 flex flex-col gap-2">
                        {isLeftCollapsed ? (
                            <>
                                <button onClick={handleAddSlide} className="w-12 h-12 bg-emerald-500 text-white hover:bg-emerald-600 rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer mx-auto" title={lang === 'sv' ? "Lägg till Slide" : "Add Slide"}>
                                    <Presentation size={20} strokeWidth={2.5} />
                                </button>
                                <button onClick={() => setIsSummonerOpen(true)} className="w-12 h-12 bg-purple-600 text-white hover:bg-purple-700 rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer mx-auto" title={lang === 'sv' ? "Hämta ny uppgift" : "Summon Question"}>
                                    <Sparkles size={20} strokeWidth={2.5} />
                                </button>
                            </>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={handleAddSlide} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex flex-col items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.98] cursor-pointer">
                                    <Presentation size={18} strokeWidth={2.5} />
                                    {lang === 'sv' ? "Ny Slide" : "New Slide"}
                                </button>
                                <button onClick={() => setIsSummonerOpen(true)} className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex flex-col items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.98] cursor-pointer">
                                    <Sparkles size={18} strokeWidth={2.5} />
                                    {lang === 'sv' ? "Ny Uppgift" : "Add Math"}
                                </button>
                            </div>
                        )}
                    </div>

                    {/*   NEW: CONTEXT-AWARE TABS */}
                    <div className={`flex bg-slate-100 p-1 rounded-xl mb-4 w-full shadow-inner border border-slate-200/60 ${isLeftCollapsed ? 'flex-col gap-1' : 'flex-row gap-1'}`}>
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
                            {isLeftCollapsed ? <Sparkles size={16} /> : (lang === 'sv' ? 'Uppgifter' : 'Questions')}
                        </button>
                    </div>
                    
                    <div className={`flex items-center mb-4 w-full ${isLeftCollapsed ? 'justify-center' : 'justify-between'}`}>
                        {!isLeftCollapsed && (
                            <h2 className="text-[12px] font-black text-slate-400 uppercase tracking-widest truncate">
                                {sidebarTab === 'slides' 
                                    ? `${lang === 'sv' ? 'Slides' : 'Slides'} (${slides.length})` 
                                    : `${lang === 'sv' ? 'Uppgifter' : 'Questions'} (${livePacket.length})`
                                }
                            </h2>
                        )}
                        <button 
                            onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
                            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                        >
                            {isLeftCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                        </button>
                    </div>

                    {/* DYNAMIC PLAYLIST RENDERING */}
                    <div className="flex-1 flex flex-col gap-3 w-full min-w-0 pb-12">
                        {sidebarTab === 'slides' ? (
                            // Render Slide Thumbnails
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
                                        className={`p-3 rounded-2xl border-2 cursor-pointer transition-all shrink-0 min-w-0 flex items-center justify-between ${isActive ? 'border-emerald-500 bg-emerald-50 shadow-md scale-[1.02]' : 'border-slate-100 hover:border-slate-300 bg-white'}`}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden w-full">
                                            <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-black text-[11px] ${isActive ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                {idx + 1}
                                            </div>
                                            
                                            {/* Double-click to rename logic */}
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

                                        {/* 🟢 NEW: Delete Slide Button */}
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
                            // Render Questions List
                            livePacket.map((q, idx) => {
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
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[14px] font-black text-purple-900 uppercase tracking-wider">
                                                {lang === 'sv' ? 'Uppgift' : 'Question'} {idx + 1}
                                            </span>
                                            {isActive && <span className="w-2 h-2 rounded-full bg-purple-500 shadow-sm" />}
                                        </div>
                                        <div className="text-xs font-bold line-clamp-2 text-slate-600 truncate">
                                            <MathDisplay content={compileAnchoredStory(q, lang)} />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* COLUMN 2: WORKSPACE CANVAS INTERACTION SHELF */}
                {/* 🟢 ADDED: whiteboard-protect wrapper. 
                    This locks the entire presentation and canvas to Light Mode, guaranteeing that 
                    SVGs, UI components, MathLive keyboards, and custom tool menus NEVER vanish or invert. */}
                <main 
                    className={`whiteboard-protect relative overflow-hidden h-full w-full flex flex-col transition-colors duration-300 ${bgType === 'grid' ? 'bg-white' : 'bg-[#f9fbf7]'}`}
                    style={bgType === 'grid' ? {
                        backgroundImage: 'linear-gradient(#e2e8f0 2px, transparent 2px), linear-gradient(90deg, #e2e8f0 2px, transparent 2px)',
                        backgroundSize: '40px 40px',
                        backgroundPosition: '-1px -1px'
                    } : {}}
                >
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar pt-16 pb-[480px] px-8 flex flex-col justify-start items-center relative z-10">
                        
                        {/*   UPDATED: DYNAMIC PRESENTATION NAVIGATION ARROWS */}
                        <div className="absolute top-2 left-4 right-4 flex justify-between items-center z-40 pointer-events-none select-none">
                            <button 
                                onClick={handleCanvasPrev}
                                disabled={sidebarTab === 'slides' ? activeSlideIndex === 0 : (livePacket.length === 0 || (activeIds.length > 0 && presentationIndex === 0))}
                                className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-indigo-600 transition-all disabled:opacity-0 disabled:pointer-events-none cursor-pointer border-2 border-white/20 hover:border-white pointer-events-auto animate-in fade-in"
                            >
                                <ChevronLeft size={28} />
                            </button>

                            {/* Center Progress Label adapts based on active Tab */}
                            <div className="bg-slate-900/90 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest backdrop-blur-sm shadow border border-white/10 pointer-events-auto flex items-center gap-2 transition-all">
                                {sidebarTab === 'slides' ? (
                                    <>
                                        <Presentation size={14} className="text-emerald-400"/>
                                        {/* 🟢 UPDATED: Shows custom slide name alongside the position count */}
                                        <span className="truncate max-w-[150px]">{slides[activeSlideIndex]?.title}</span>
                                        <span className="text-white/50 px-1 border-l border-white/20">{activeSlideIndex + 1} / {slides.length}</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={14} className="text-purple-400"/>
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

                        {/* DYNAMIC PRESENTATION ENGINE SWITCHBOARD LAYER */}
                        {viewMode === 'sheet' ? (
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
                                        const displayLatex = item.showLatex !== false;
                                        const displayVisual = item.showVisual !== false;
                                        const rd = item.resolvedData?.renderData;

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
                                                        ${getColSpanClass(item.columnSpan)}
                                                        ${isFocused ? 'bg-indigo-50/50 ring-2 ring-indigo-500/30 opacity-100 scale-[1.01]' : hasAnyFocus ? 'opacity-25' : 'hover:bg-slate-50'}`}
                                                >
                                                    <div className="text-xs flex flex-col h-full justify-between">
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
                        ) : (
                            <div className="w-full h-full min-h-screen relative flex items-start select-none pt-6 pb-[70px] z-20">
                                
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

                                        return (
                                            <div 
                                                key={id} 
                                                className="flex flex-col flex-1 px-8 relative h-full items-center justify-start animate-in zoom-in-95 duration-200"
                                            >
                                                {index > 0 && (
                                                    <div className="absolute top-0 bottom-0 left-0 border-l-4 border-dashed border-slate-400/80 -translate-x-1/2 pointer-events-none" />
                                                )}

                                                <div className="flex items-center gap-3 mb-6 shrink-0 relative z-40">
                                                    <div className="text-[14px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md px-2.5 py-1 inline-block uppercase tracking-wider shadow-sm">
                                                        {lang === 'sv' ? `Uppgift ${masterIndex}` : `Question ${masterIndex}`}
                                                    </div>
                                                    
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleRegenerateQuestion(q.id); }}
                                                        className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all active:scale-90 cursor-pointer ui-ignore"
                                                        title={lang === 'sv' ? "Slå om tal / slumpa nya värden" : "Roll fresh question numbers"}
                                                    >
                                                        <RefreshCw size={18} className="transition-transform duration-300 hover:rotate-180" />
                                                    </button>
                                                </div>

                                                {q.showText !== false && (
                                                    <div className={`font-bold text-slate-800 text-center leading-relaxed max-w-prose w-full break-words px-4 mb-1 ${sizeClasses.desc}`}>
                                                        <MathDisplay content={compileAnchoredStory(q, lang)} />
                                                    </div>
                                                )}
                                                
                                                {q.showVisual !== false && rd && (
                                                    <div 
                                                        onClick={(e) => { e.stopPropagation(); setSpotlightVisual(rd); }}
                                                        className={`flex justify-center origin-top transition-all duration-300 cursor-zoom-in hover:opacity-80 overflow-visible shrink-0 relative z-30 ${sizeClasses.visualClass}`}
                                                    >
                                                        <VisualRenderer 
                                                            data={rd} 
                                                            isWordProblem={q.selectedStoryIndex !== null && q.selectedStoryIndex !== undefined} 
                                                        />
                                                    </div>
                                                )}

                                                {rd?.options && rd.options.length > 0 && (
                                                    <div className="mt-6 grid grid-cols-2 gap-4 w-full max-w-md shrink-0 relative z-30">
                                                        {rd.options.map((opt, oIdx) => (
                                                            <div key={oIdx} className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-slate-200 bg-white shadow-sm ${sizeClasses.desc}`}>
                                                                <span className="font-black text-indigo-500">{['A','B','C','D','E','F'][oIdx]}</span>
                                                                <MathDisplay content={opt} className="font-bold text-slate-700" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {q.showLatex !== false && rd?.latex && (
                                                    <div className={`mt-6 py-4 bg-indigo-50/40 rounded-2xl text-center font-serif text-indigo-950 border border-indigo-100/60 shadow-inner w-full max-w-xs shrink-0 ${sizeClasses.latex}`}>
                                                        <MathDisplay content={`$$${rd.latex}$$`} />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }) 
                                )}
                            </div>
                        )}
                    </div>
                    {/*   UPDATED: The canvas now reads and writes directly to the active slide's memory! */}
                    <InteractiveCanvas 
                        key={slides[activeSlideIndex]?.id} 
                        elements={slides[activeSlideIndex]?.elements || []}
                        setElements={updateCurrentSlideElements}
                        lang={lang} 
                        bgType={bgType} 
                        onToggleBg={() => setBgType(prev => prev === 'blank' ? 'grid' : 'blank')} 
                    />
                </main>

                {/* COLUMN 3: SOLUTIONS & COMPACT ANSWER KEY DRAWER PANEL */}
                {/* whiteboard-protect wrapper. */}
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
                                                <div className="flex items-center justify-between mb-4 bg-white p-2 rounded-xl border border-slate-200/60 shadow-sm">
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-[12px] font-black uppercase text-indigo-600 tracking-wider">
                                                            {lang === 'sv' ? `Uppgift ${masterIndex}` : `Question ${masterIndex}`}
                                                        </div>
                                                        {progress > 0 && (
                                                            <button
                                                                onClick={() => setClueProgress({ ...clueProgress, [id]: 0 })}
                                                                className="p-1 text-slate-400 hover:text-rose-500 rounded bg-slate-50 border border-slate-100 hover:border-rose-100 transition-colors cursor-pointer text-[12px] font-black uppercase tracking-tight"
                                                            >
                                                                {lang === 'sv' ? "Dölj" : "Reset"}
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-0.5 items-center">
                                                        <button 
                                                            onClick={() => setClueProgress({...clueProgress, [id]: Math.max(0, progress - 1)})}
                                                            disabled={progress === 0}
                                                            className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer transition-colors"
                                                        ><ChevronLeft size={16}/></button>
                                                        <div className="min-w-8 text-center text-[12px] font-black text-slate-500">{progress}/{clues.length}</div>
                                                        <button 
                                                            onClick={() => setClueProgress({...clueProgress, [id]: Math.min(clues.length, progress + 1)})}
                                                            disabled={progress === clues.length}
                                                            className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer transition-colors"
                                                        ><ChevronRight size={16}/></button>
                                                    </div>
                                                </div>

                                                <div className="space-y-2.5">
                                                    {clues.slice(0, progress).map((clue, idx) => {
                                                        const text = typeof clue === 'object' ? clue[lang] || clue.text : clue;
                                                        const latex = clue.latex;
                                                        return (
                                                            <div key={idx} className="bg-white p-3 rounded-xl shadow-sm border-l-4 border-amber-400 animate-in slide-in-from-top-2 duration-200">
                                                                <div className={`font-bold text-slate-700 leading-snug ${sizeClasses.clue}`}>
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
                    onSummon={(newItem) => {
                        const updatedPacket = [...livePacket, newItem];
                        setLivePacket(updatedPacket);
                        
                        setActiveIds([newItem.id]);
                        setClueProgress({ ...clueProgress, [newItem.id]: 0 });
                        setPresentationIndex(updatedPacket.length - 1);
                        
                        //   AUTO-SWITCH TO QUESTIONS TAB SO THE USER SEES WHAT THEY SUMMONED
                        setSidebarTab('questions');
                        
                        setIsSummonerOpen(false);
                    }} 
                />
            )}
        </div>
    );
}