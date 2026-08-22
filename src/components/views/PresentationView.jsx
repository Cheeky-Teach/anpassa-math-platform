import React, { useState, useRef, useEffect } from 'react';
import { 
    X, ChevronLeft, ChevronRight, Monitor, PanelLeftClose, 
    PanelLeftOpen, ZoomIn, ZoomOut, Layers, FileText, List, Plus,
    RefreshCw
} from 'lucide-react';

// Import your visual components exactly as you do in QuestionStudio
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

// Word Problem Story Compiler matching QuestionStudio functionality
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

export default function PresentationView({ packet, sheetTitle, lang = 'sv', onClose }) {
    const [activeIds, setActiveIds] = useState([]);
    const [clueProgress, setClueProgress] = useState({});
    const [presentationIndex, setPresentationIndex] = useState(0);

    // --- QUALITY OF LIFE STATES ---
    const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
    const [isRightCollapsed, setIsRightCollapsed] = useState(false);
    const [textSize, setTextSize] = useState('base'); 
    const [viewMode, setViewMode] = useState('list'); 
    const [clueViewMode, setClueViewMode] = useState('steps'); // 'steps' (revealer array slider) or 'answers' (kompakt full list facit)

    // CREATE A LIVE PACKET FOR THE SESSION
    const [livePacket, setLivePacket] = useState(packet || []);

    // BACKGROUND TOGGLE STATE
    const [bgType, setBgType] = useState('blank');
    
    // SUMMONER STATE
    const [isSummonerOpen, setIsSummonerOpen] = useState(false);

    // 🟢 NEW: IDENTIFY THE ACTIVE FOCUSED QUESTION & INITIALIZE COACH
    const currentFocusedQuestion = livePacket.find(p => activeIds.includes(p.id)) || livePacket[presentationIndex] || null;
    const { coachProps } = useMyCoach(currentFocusedQuestion, lang);

    // 🟢 NEW: SCROLL LOCK FOR THE MIDDLE Whiteboard CHALKBOARD
    const presentationBoardEndRef = useRef(null);

    useEffect(() => {
        if (clueViewMode === 'coach' && presentationBoardEndRef.current) {
            presentationBoardEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [coachProps.currentStep, clueViewMode]);

    // Tracks which diagram is currently blown up full screen
    const [spotlightVisual, setSpotlightVisual] = useState(null);

    // --- 🟢 NEW: LIVE QUESTION REGENERATOR ENGINE ---
    const handleRegenerateQuestion = async (targetId) => {
        const targetItem = livePacket.find(q => q.id === targetId);
        if (!targetItem) return;

        try {
            // Read metadata parameters from the active question item instance
            // 🟢 FIXED: Expanded the check to look for camelCase 'topicId' and 'topic' first
            const topic = targetItem.topicId || targetItem.topic || targetItem.topic_id || targetItem.metadata?.topic || 'algebraic_geometry';
            const level = targetItem.level || targetItem.metadata?.level || 1;
            const variation = targetItem.variationKey || targetItem.variation_key || targetItem.metadata?.variation_key;

            // Fetch a fresh set of text/numbers from the serverless backend pipeline
            let url = `/api/question?topic=${topic}&level=${level}&lang=${lang}`;
            if (variation && variation !== 'generic') {
                url += `&variation=${variation}`;
            }

            const res = await fetch(url);
            const freshData = await res.json();

            if (freshData.error || !freshData.renderData) {
                console.error("Failed to regenerate question:", freshData.error);
                return;
            }

            // Update the state array in-place, preserving the established element reference ID
            setLivePacket(prev => prev.map(q => {
                if (q.id === targetId) {
                    return {
                        ...q,
                        // Update with fresh random text, visual metadata configurations, and tokens
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

            // Reset clue progression for this specific question since it's a completely new task
            setClueProgress(prev => ({ ...prev, [targetId]: 0 }));

        } catch (err) {
            console.error("Critical error while cycling question parameters:", err);
        }
    };
    
    // --- SELECTION UTILITIES ---
    const toggleQuestion = (id) => {
        if (activeIds.includes(id)) {
            setActiveIds(activeIds.filter(qId => qId !== id));
        } else if (activeIds.length < 3) {
            setActiveIds([...activeIds, id]);
            if (clueProgress[id] === undefined) {
                setClueProgress({ ...clueProgress, [id]: 0 });
            }
            if (activeIds.length === 0) {
                const newIdx = livePacket.findIndex(p => p.id === id);
                if (newIdx !== -1) setPresentationIndex(newIdx);
            }
        }
    };


    const focusSingleQuestionOnWorksheet = (id) => {
        setActiveIds([id]);
        if (clueProgress[id] === undefined) {
            setClueProgress({ ...clueProgress, [id]: 0 });
        }
        const masterIdx = livePacket.findIndex(p => p.id === id);
        if (masterIdx !== -1) setPresentationIndex(masterIdx);
    };

    // --- NAVIGATION CONTROLS ---
    const handleCanvasPrev = () => {
        if (livePacket.length === 0) return; // Safety check
        
        let targetIdx = presentationIndex;
        if (activeIds.length > 0) targetIdx -= 1; 
        if (targetIdx < 0) return;

        setPresentationIndex(targetIdx);
        // 🟢 FIXED: Reference livePacket instead of static packet
        setActiveIds([livePacket[targetIdx].id]); 
        if (clueProgress[livePacket[targetIdx].id] === undefined) {
            setClueProgress(prev => ({ ...prev, [livePacket[targetIdx].id]: 0 }));
        }
    };

    const handleCanvasNext = () => {
        if (livePacket.length === 0) return; // Safety check
        
        let targetIdx = presentationIndex;
        if (activeIds.length > 0) targetIdx += 1;
        if (targetIdx >= livePacket.length) return;
        
        setPresentationIndex(targetIdx);
        setActiveIds([livePacket[targetIdx].id]); 
        if (clueProgress[livePacket[targetIdx].id] === undefined) {
            setClueProgress(prev => ({ ...prev, [livePacket[targetIdx].id]: 0 }));
        }
    };

    // --- TEXT SIZE CLASS MAPPER ---
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
                <div className="flex items-center gap-2">
                    <Monitor size={16} className="text-amber-400" />
                    <h1 className="text-m font-black uppercase tracking-widest italic">{sheetTitle || 'Presentationsläge'}</h1>
                </div>
                
                {/* RIGHT-ALIGNED CONTROLS STRIP */}
                <div className="flex items-center gap-4">
                    {/* VIEW MODE TOGGLE BUTTONS */}
                    <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700/60 gap-1 shadow-inner">
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                        >
                            <List size={14} /> <span className="text-[12px]">{lang === 'sv' ? "List" : "List"}</span>
                        </button>
                        <button 
                            onClick={() => setViewMode('sheet')}
                            className={`p-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === 'sheet' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-100 hover:text-white'}`}
                        >
                            <FileText size={14} /> <span className="text-[12px]">{lang === 'sv' ? "Blad" : "Sheet"}</span>
                        </button>
                    </div>

                    <div className="w-px h-6 bg-slate-700/60" />

                    {/* Classroom Text Size Scaler */}
                    <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700/60 gap-1 shadow-inner">
                        <button 
                            disabled={textSize === 'base'}
                            onClick={() => setTextSize(prev => prev === '2xl' ? 'xl' : prev === 'xl' ? 'lg' : 'base')}
                            className="p-1.5 rounded-lg text-slate-100 hover:text-white hover:bg-slate-500 disabled:opacity-20 cursor-pointer transition-colors"
                        >
                            <ZoomOut size={14} />
                        </button>
                        <span className="text-[12px] font-black uppercase tracking-widest text-slate-100 px-2 min-w-[70px] text-center">
                            {lang === 'sv' ? `TEXT: ${textSize.toUpperCase()}` : `SIZE: ${textSize.toUpperCase()}`}
                        </span>
                        <button 
                            disabled={textSize === '2xl'}
                            onClick={() => setTextSize(prev => prev === 'base' ? 'lg' : prev === 'lg' ? 'xl' : '2xl')}
                            className="p-1.5 rounded-lg text-slate-100 hover:text-white hover:bg-slate-700 disabled:opacity-20 cursor-pointer transition-colors"
                        >
                            <ZoomIn size={14} />
                        </button>
                    </div>

                    {/* Global Reset Canvas button */}
                    <button
                        disabled={activeIds.length === 0}
                        onClick={() => {
                            if (window.confirm(lang === 'sv' ? "Rensa alla valda uppgifter?" : "Clear all selected questions?")) {
                                setActiveIds([]);
                            }
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-rose-600 border border-slate-700/60 text-slate-300 hover:text-white rounded-xl text-[12px] font-black uppercase tracking-widest transition-all disabled:opacity-20 disabled:hover:bg-slate-800 disabled:hover:text-slate-300 cursor-pointer"
                    >
                        {lang === 'sv' ? "Nollställ" : "Reset Canvas"}
                    </button>

                    <div className="w-px h-6 bg-slate-700/60 hidden sm:block" />

                    <button onClick={onClose} className="bg-white/10 hover:bg-rose-500 px-6 py-2 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all cursor-pointer">{lang === 'sv' ? "Stäng" : "Close"}</button>
                </div>
            </header>

            {/* STABILIZED MASTER STRUCTURAL MATRIX */}
            <div 
                className="flex-1 grid overflow-hidden relative transition-all duration-300"
                style={{ 
                    /* Right column track collapses seamlessly, automatically shifting the center workspace */
                    gridTemplateColumns: `${isLeftCollapsed ? '64px' : '288px'} 1fr ${isRightCollapsed ? '64px' : '320px'}` 
                }}
            >
                {/* COLUMN 1: COLLAPSIBLE WORKSPACE SELECTION PICKER */}
                <div className={`bg-white border-r border-slate-200 overflow-y-auto custom-scrollbar flex flex-col transition-all duration-300 select-none shrink-0 z-10 min-w-0 ${isLeftCollapsed ? 'p-2 items-center' : 'p-6'}`}>
                    {/* Header Row */}
                    {/* PROMINENT ACTION BUTTON STRIP */}
                    <div className="w-full mb-4 shrink-0">
                        {isLeftCollapsed ? (
                            <button 
                                onClick={() => setIsSummonerOpen(true)}
                                className="w-10 h-10 bg-blue-500 text-white hover:bg-purple-700 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer font-black mx-auto"
                                title={lang === 'sv' ? "Hämta ny uppgift" : "Summon new question"}
                            >
                                <Plus size={20} strokeWidth={3} />
                            </button>
                        ) : (
                            <button 
                                onClick={() => setIsSummonerOpen(true)}
                                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] cursor-pointer"
                            >
                                <Plus size={14} strokeWidth={3} />
                                {lang === 'sv' ? "Hämta Ny Uppgift" : "Summon Question"}
                            </button>
                        )}
                    </div>
                    
                    <div className={`flex items-center mb-4 w-full ${isLeftCollapsed ? 'justify-center' : 'justify-between'}`}>
                        {!isLeftCollapsed && (
                            <h2 className="text-[14px] font-black text-slate-400 uppercase tracking-widest truncate">
                                {lang === 'sv' ? "Uppgifter" : "Questions"} ({livePacket.length})
                            </h2>
                        )}
                        <button 
                            onClick={() => { setIsLeftCollapsed(!isLeftCollapsed); }}
                            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                        >
                            {isLeftCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                        </button>
                    </div>

                    {/* Question Items Playlist */}
                    <div className="flex-1 flex flex-col gap-3 w-full min-w-0">
                        {livePacket.map((q, idx) => {
                            const isActive = activeIds.includes(q.id);
                            
                            if (isLeftCollapsed) {
                                return (
                                    <button 
                                        key={q.id}
                                        onClick={() => toggleQuestion(q.id)}
                                        className={`w-10 h-10 rounded-full font-black text-xs uppercase border-2 flex items-center justify-center transition-all cursor-pointer shadow-sm shrink-0
                                            ${isActive ? 'bg-amber-500 border-amber-600 text-white font-black scale-105 ring-4 ring-amber-500/10' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'}`}
                                    >
                                        #{idx + 1}
                                    </button>
                                );
                            }

                            return (
                                <div 
                                    key={q.id} 
                                    onClick={() => toggleQuestion(q.id)}
                                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all shrink-0 min-w-0 ${isActive ? 'border-amber-500 bg-amber-50 shadow-md scale-[1.01]' : 'border-slate-100 hover:border-slate-300 bg-white'}`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[16px] font-black text-blue-900"># {idx + 1}</span>
                                        {isActive && <span className="w-2 h-2 rounded-full bg-amber-500 shadow-sm" />}
                                    </div>
                                    <div className="text-xs font-bold line-clamp-2 text-slate-600 truncate">
                                        <MathDisplay content={compileAnchoredStory(q, lang)} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* COLUMN 2: WORKSPACE CANVAS INTERACTION SHELF */}
                {/* Apply dynamic grid background */}
                <main 
                    className={`relative overflow-hidden h-full w-full flex flex-col transition-colors duration-300 ${bgType === 'grid' ? 'bg-white' : 'bg-[#f9fbf7]'}`}
                    style={bgType === 'grid' ? {
                        backgroundImage: 'linear-gradient(#e2e8f0 2px, transparent 2px), linear-gradient(90deg, #e2e8f0 2px, transparent 2px)',
                        backgroundSize: '40px 40px',
                        backgroundPosition: '-1px -1px'
                    } : {}}
                >
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar pt-16 pb-[480px] px-8 flex flex-col justify-start items-center relative z-10">
                        
                        {/* RESPONSIVE CORNER-ANCHORED PRESENTATION CONTROLS */}
                        <div className="absolute top-2 left-4 right-4 flex justify-between items-center z-40 pointer-events-none select-none">
                            <button 
                                onClick={handleCanvasPrev}
                                disabled={livePacket.length === 0 || (activeIds.length > 0 && presentationIndex === 0)}
                                className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-indigo-600 transition-all disabled:opacity-0 disabled:pointer-events-none cursor-pointer border-2 border-white/20 hover:border-white pointer-events-auto animate-in fade-in"
                                title={lang === 'sv' ? "Föregående uppgift" : "Previous Question"}
                            >
                                <ChevronLeft size={28} />
                            </button>

                            {/* Small center label to track progress on screen for the teacher */}
                            {activeIds.length > 0 && (
                                <div className="bg-slate-900/90 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest backdrop-blur-sm shadow border border-white/10 pointer-events-auto">
                                    {lang === 'sv' ? `Uppgift ${presentationIndex + 1} av ${livePacket.length}` : `Question ${presentationIndex + 1} of ${livePacket.length}`}
                                </div>
                            )}

                            <button 
                                onClick={handleCanvasNext}
                                disabled={livePacket.length === 0 || (activeIds.length > 0 && presentationIndex >= livePacket.length - 1)}
                                className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-indigo-600 transition-all disabled:opacity-0 disabled:pointer-events-none cursor-pointer border-2 border-white/20 hover:border-white pointer-events-auto animate-in fade-in"
                                title={lang === 'sv' ? "Nästa uppgift" : "Next Question"}
                            >
                                <ChevronRight size={28} />
                            </button>
                        </div>

                        {/* DYNAMIC PRESENTATION ENGINE SWITCHBOARD LAYER */}
                        {viewMode === 'sheet' ? (
                            <div className="bg-white shadow-2xl w-[210mm] h-auto min-h-[297mm] p-[15mm] pb-[40mm] flex flex-col rounded-sm border border-slate-300 animate-in fade-in zoom-in-95 duration-300 select-none mb-8 mt-2 relative z-20">
                                {/* Replicated Worksheet Title Header Row Strip */}
                                <header className="border-b-2 border-black pb-2 mb-6 flex items-end justify-between">
                                    <h1 className="text-md font-black uppercase tracking-tighter w-1/3 truncate italic leading-none">{sheetTitle || "Matematik"}</h1>
                                    <div className="flex gap-6 w-2/3 justify-end text-[9px] font-black uppercase tracking-widest text-slate-400">
                                        <div className="border-b border-slate-200 pb-0.5 flex gap-2 flex-1 max-w-[160px]"><span>{lang === 'sv' ? "Namn:" : "Name:"}</span></div>
                                        <div className="border-b border-slate-200 pb-0.5 flex gap-2 w-[100px]"><span>{lang === 'sv' ? "Datum:" : "Date:"}</span></div>
                                    </div>
                                </header>

                                {/* 1:1 Replicated Grid Matrix matching QuestionStudio layout architecture */}
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
                                                {/* Header Placement Story Directive banner */}
                                                {displayStory && (item.instructionMode === 'header' || !item.instructionMode) && (
                                                    <div className={`col-span-6 border-l-4 border-indigo-500 pl-4 bg-slate-50/40 rounded-r-xl py-2.5 transition-all duration-300
                                                        ${hasAnyFocus && !isFocused ? 'opacity-25' : 'opacity-100'}`}>
                                                        <div className={`font-black text-slate-800 italic uppercase tracking-tight ${sizeClasses.headerText}`}>
                                                            <MathDisplay content={compileAnchoredStory(item, lang)} />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Dynamic Borderless Question Layout block wrapper */}
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
                                                            
                                                            {/* Render options if multiple choice options populate data fields */}
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
                                
                                {/* 🟢 FIXED: Mount the full standalone Modal directly into the center container frame */}
                                {clueViewMode === 'coach' ? (
                                    <MyCoachModal
                                        lang={lang}
                                        inlineMode={true} // 🚀 Tells the modal to blend in natively
                                        question={currentFocusedQuestion} // 🚀 Passes active visual descriptors
                                        {...coachProps} // 🚀 Forwards all playback control parameters seamlessly
                                    />
                                ) : activeIds.length === 0 ? (
                                    <div className="absolute top-5 left-5 flex items-center gap-2 text-slate-400/50 bg-white/50 px-3 py-1.5 rounded-lg border border-slate-200/50 pointer-events-none select-none z-0">
                                        <ChevronLeft size={14} className="animate-pulse" />
                                        <span className="font-black uppercase tracking-widest text-[9px]">
                                            {lang === 'sv' ? "Välj uppgift för att presentera" : "Select question to present"}
                                        </span>
                                    </div>
                                ) : (
                                    /* 🟢 RENDER STANDARD LANE PROJECTIONS WHEN NOT IN COACH MODE */
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
                                                {/* DYNAMIC FULL-HEIGHT PROJECTION DIVIDER LINES */}
                                                {index > 0 && (
                                                    <div className="absolute top-0 bottom-0 left-0 border-l-4 border-dashed border-slate-400/80 -translate-x-1/2 pointer-events-none" />
                                                )}

                                                {/* FLEX CONTAINER FOR HEADER & REGENERATE BUTTON */}
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

                                                {/* Standard Question Text Mode */}
                                                {q.showText !== false && (
                                                    <div className={`font-bold text-slate-800 text-center leading-relaxed max-w-prose w-full break-words px-4 mb-1 ${sizeClasses.desc}`}>
                                                        <MathDisplay content={compileAnchoredStory(q, lang)} />
                                                    </div>
                                                )}
                                                
                                                {/* Visual Renderer */}
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

                                                {/* Restored Multiple Choice Option Grid */}
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

                                                {/* Latex MathBox */}
                                                {q.showLatex !== false && rd?.latex && (
                                                    <div className={`mt-6 py-4 bg-indigo-50/40 rounded-2xl text-center font-serif text-indigo-950 border border-indigo-100/60 shadow-inner w-full max-w-xs shrink-0 ${sizeClasses.latex}`}>
                                                        <MathDisplay content={`$$${rd.latex}$$`} />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }) // 🟢 FIXED: This bracket closes the activeIds.map block securely!
                                )}
                            </div>
                        )}
                    </div>
                    {/* THE ISOLATED DRAWING ENGINE INJECTED HERE */}
                    <InteractiveCanvas 
                        lang={lang} 
                        bgType={bgType} 
                        onToggleBg={() => setBgType(prev => prev === 'blank' ? 'grid' : 'blank')} 
                    />
                </main>

                {/* COLUMN 3: SOLUTIONS & COMPACT ANSWER KEY DRAWER PANEL */}
                <div 
                    className={`bg-white border-l border-slate-200 flex flex-col shrink-0 select-none h-full transition-all duration-300 relative min-h-0 overflow-hidden
                        ${isRightCollapsed ? 'w-16 p-2 items-center justify-start pt-4' : 'w-80 p-6 gap-6'}`}
                >
                    {isRightCollapsed ? (
                        /* VERTICAL TEXT STRIP BUTTON (When panel is collapsed) */
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
                        /* 🛠️ TRADITIONAL FULLY EXPANDED SIDEBAR DRAWER INTERFACE */
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
                                    
                                    {/* 🟢 NEW: THREE-WAY CONTROL TOWER "COACH" SELECTOR */}
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
                            {/* 🟢 FIXED: Simplified placeholder dashboard container since controls live inside the chalkboard pane */}
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
                                /* KOMPAKT MULTI-COLUMN FULL WORKSHEET KEY GRID */
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
                                /* LEGACY STEP-BY-STEP SOLUTION CAROUSEL RENDERER */
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
                    {/* Floating Escape Label */}
                    <div className="absolute top-6 text-white/40 text-[11px] font-black uppercase tracking-widest bg-white/5 border border-white/10 px-4 py-1.5 rounded-full shadow">
                        {lang === 'sv' ? "Klicka var som helst för att gå tillbaka" : "Click anywhere to close spotlight"}
                    </div>

                    {/* Magnification Vault */}
                    <div 
                        onClick={(e) => e.stopPropagation()} 
                        className="bg-white p-12 rounded-[2.5rem] shadow-2xl flex items-center justify-center border border-slate-100 max-w-4xl max-h-[75vh] min-w-[450px] min-h-[350px] transform scale-[1.65] origin-center shadow-emerald-950/20"
                    >
                        <VisualRenderer 
                            data={spotlightVisual} 
                            isWordProblem={false} // Defaulting to false as presentations usually show the math
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
                        // Append the new question, auto-select it, and close the modal
                        const updatedPacket = [...livePacket, newItem];
                        setLivePacket(updatedPacket);
                        
                        // Focus the newly summoned item immediately
                        setActiveIds([newItem.id]);
                        setClueProgress({ ...clueProgress, [newItem.id]: 0 });
                        setPresentationIndex(updatedPacket.length - 1);
                        
                        setIsSummonerOpen(false);
                    }} 
                />
            )}
        </div>
    );
}