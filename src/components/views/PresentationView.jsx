import React, { useState, useRef, useEffect } from 'react';
import { 
    X, ChevronLeft, ChevronRight, Monitor, PanelLeftClose, 
    PanelLeftOpen, ZoomIn, ZoomOut, Layers, FileText, List 
} from 'lucide-react';

// Import your visual components exactly as you do in QuestionStudio
import { GeometryVisual, GraphCanvas, VolumeVisualization } from '../visuals/GeometryComponents';
import PatternVisual from '../visuals/PatternComponents';
import { ProbabilityMarbles, ProbabilitySpinner } from '../visuals/ProbabilityVisuals';
import ProbabilityTree from '../visuals/ProbabilityTree';
import { ScaleVisual, SimilarityCompare, CompareShapesArea } from '../visuals/ScaleVisuals';
import { FrequencyTable, PercentGrid } from '../visuals/StatisticsVisuals';
import AngleVisual from '../visuals/AngleComponents';

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
    const [textSize, setTextSize] = useState('base'); 
    const [viewMode, setViewMode] = useState('sheet'); 
    const [clueViewMode, setClueViewMode] = useState('steps'); // 'steps' (revealer array slider) or 'answers' (kompakt full list facit)

    // --- REUSED VISUAL RENDERER ---
    const renderVisual = (rd) => {
        if (!rd) return null;
        if (rd.graph) return <GraphCanvas data={rd.graph} />;
        if (rd.pattern || rd.geometry?.subtype === 'sequence') return <PatternVisual data={rd.pattern || rd.geometry} />;
        if (rd.marbles) return <ProbabilityMarbles data={rd.marbles} />;
        if (rd.spinner) return <ProbabilitySpinner data={rd.spinner} />;
        if (rd.freqTable) return <FrequencyTable data={rd.freqTable} />;
        if (rd.geometry?.type === 'angle') return <AngleVisual data={rd.geometry} />;
        if (rd.geometry) return <GeometryVisual data={rd.geometry} width={220} height={180} />;
        return null;
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
                const newIdx = packet.findIndex(p => p.id === id);
                if (newIdx !== -1) setPresentationIndex(newIdx);
            }
        }
    };

    const focusSingleQuestionOnWorksheet = (id) => {
        setActiveIds([id]);
        if (clueProgress[id] === undefined) {
            setClueProgress({ ...clueProgress, [id]: 0 });
        }
        const masterIdx = packet.findIndex(p => p.id === id);
        if (masterIdx !== -1) setPresentationIndex(masterIdx);
    };

    // --- NAVIGATION CONTROLS ---
    const handleCanvasPrev = () => {
        let targetIdx = presentationIndex;
        if (activeIds.length > 0) targetIdx -= 1; 
        if (targetIdx < 0) return;

        setPresentationIndex(targetIdx);
        setActiveIds([packet[targetIdx].id]); 
        if (clueProgress[packet[targetIdx].id] === undefined) {
            setClueProgress(prev => ({ ...prev, [packet[targetIdx].id]: 0 }));
        }
    };

    const handleCanvasNext = () => {
        let targetIdx = presentationIndex;
        if (activeIds.length > 0) targetIdx += 1;
        if (targetIdx >= packet.length) return;
        
        setPresentationIndex(targetIdx);
        setActiveIds([packet[targetIdx].id]); 
        if (clueProgress[packet[targetIdx].id] === undefined) {
            setClueProgress(prev => ({ ...prev, [packet[targetIdx].id]: 0 }));
        }
    };

    // --- TEXT SIZE CLASS MAPPER ---
    const getTextSizeClass = (type) => {
        const textMap = {
            'base': { desc: 'text-xl', latex: 'text-xl', clue: 'text-xl', headerText: 'text-m' },
            'lg': { desc: 'text-2xl', latex: 'text-2xl', clue: 'text-2xl', headerText: 'text-l' },
            'xl': { desc: 'text-3xl', latex: 'text-3xl', clue: 'text-3xl', headerText: 'text-xl' },
            '2xl': { desc: 'text-4xl', latex: 'text-4xl', clue: 'text-4xl', headerText: 'text-base' }
        };
        return textMap[textSize] || textMap['base'];
    };

    const sizeClasses = getTextSizeClass();
    const getColSpanClass = (span) => ({ 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4', 6: 'col-span-6' }[span] || 'col-span-6');

    return (
        <div className="fixed inset-0 z-[100] bg-slate-100 flex flex-col font-sans overflow-hidden animate-in fade-in">
            {/* Header Navbar Layer */}
            <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md z-50 select-none">
                <div className="flex items-center gap-2">
                    <Monitor size={20} className="text-amber-400" />
                    <h1 className="text-lg font-black uppercase tracking-widest italic">{sheetTitle || 'Presentationsläge'}</h1>
                </div>
                
                {/* RIGHT-ALIGNED CONTROLS STRIP */}
                <div className="flex items-center gap-4">
                    {/* VIEW MODE TOGGLE BUTTONS */}
                    <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700/60 gap-1 shadow-inner">
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                        >
                            <List size={14} /> <span className="text-[9px]">List</span>
                        </button>
                        <button 
                            onClick={() => setViewMode('sheet')}
                            className={`p-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === 'sheet' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                        >
                            <FileText size={14} /> <span className="text-[9px]">Blad</span>
                        </button>
                    </div>

                    <div className="w-px h-6 bg-slate-700/60" />

                    {/* Classroom Text Size Scaler */}
                    <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700/60 gap-1 shadow-inner">
                        <button 
                            disabled={textSize === 'base'}
                            onClick={() => setTextSize(prev => prev === '2xl' ? 'xl' : prev === 'xl' ? 'lg' : 'base')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-20 cursor-pointer transition-colors"
                        >
                            <ZoomOut size={14} />
                        </button>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 px-2 min-w-[70px] text-center">
                            {lang === 'sv' ? `TEXT: ${textSize.toUpperCase()}` : `SIZE: ${textSize.toUpperCase()}`}
                        </span>
                        <button 
                            disabled={textSize === '2xl'}
                            onClick={() => setTextSize(prev => prev === 'base' ? 'lg' : prev === 'lg' ? 'xl' : '2xl')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-20 cursor-pointer transition-colors"
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
                        className="px-4 py-2 bg-slate-800 hover:bg-rose-600 border border-slate-700/60 text-slate-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-20 disabled:hover:bg-slate-800 disabled:hover:text-slate-300 cursor-pointer"
                    >
                        {lang === 'sv' ? "Nollställ" : "Reset Canvas"}
                    </button>

                    <div className="w-px h-6 bg-slate-700/60 hidden sm:block" />

                    <button onClick={onClose} className="bg-white/10 hover:bg-rose-500 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer">Stäng</button>
                </div>
            </header>

            {/* STABILIZED MASTER STRUCTURAL MATRIX */}
            <div 
                className="flex-1 grid overflow-hidden relative transition-all duration-300"
                style={{ 
                    gridTemplateColumns: `${isLeftCollapsed ? '64px' : '288px'} 1fr 320px` 
                }}
            >
                {/* COLUMN 1: COLLAPSIBLE WORKSPACE SELECTION PICKER */}
                <div className={`bg-white border-r border-slate-200 overflow-y-auto custom-scrollbar flex flex-col transition-all duration-300 select-none shrink-0 z-10 min-w-0 ${isLeftCollapsed ? 'p-2 items-center' : 'p-6'}`}>
                    <div className={`flex items-center mb-4 w-full ${isLeftCollapsed ? 'justify-center' : 'justify-between'}`}>
                        {!isLeftCollapsed && <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Uppgifter ({packet.length})</h2>}
                        <button 
                            onClick={() => { setIsLeftCollapsed(!isLeftCollapsed); }}
                            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                        >
                            {isLeftCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col gap-3 w-full min-w-0">
                        {packet.map((q, idx) => {
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
                                        <span className="text-[9px] font-black text-slate-400">#UPPGIFT {idx + 1}</span>
                                        {isActive && <span className="w-2 h-2 rounded-full bg-amber-500 shadow-sm" />}
                                    </div>
                                    <div className="text-xs font-bold line-clamp-2 text-slate-600 truncate">
                                        <MathDisplay content={q.resolvedData?.renderData?.description || q.name} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* COLUMN 2: WORKSPACE CANVAS INTERACTION SHELF */}
                    <div className="relative bg-[#f9fbf7] overflow-auto h-full w-full custom-scrollbar pt-16 pb-[70px] px-8 flex flex-col justify-start items-center">
                        
                        {/* 🟢 FIXED: RESPONSIVE CORNER-ANCHORED PRESENTATION CONTROLS */}
                        {/* Pinned strictly inside the bounds of the active middle pane canvas track */}
                        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-40 pointer-events-none select-none">
                            <button 
                                onClick={handleCanvasPrev}
                                disabled={activeIds.length > 0 && presentationIndex === 0}
                                className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-indigo-600 transition-all disabled:opacity-0 disabled:pointer-events-none cursor-pointer border-2 border-white/20 hover:border-white pointer-events-auto animate-in fade-in"
                                title={lang === 'sv' ? "Föregående uppgift" : "Previous Question"}
                            >
                                <ChevronLeft size={28} />
                            </button>

                            {/* Small center label to track progress on screen for the teacher */}
                            {activeIds.length > 0 && (
                                <div className="bg-slate-900/90 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest backdrop-blur-sm shadow border border-white/10">
                                    {lang === 'sv' ? `Uppgift ${presentationIndex + 1} av ${packet.length}` : `Question ${presentationIndex + 1} of ${packet.length}`}
                                </div>
                            )}

                            <button 
                                onClick={handleCanvasNext}
                                disabled={activeIds.length > 0 && presentationIndex >= packet.length - 1}
                                className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-indigo-600 transition-all disabled:opacity-0 disabled:pointer-events-none cursor-pointer border-2 border-white/20 hover:border-white pointer-events-auto animate-in fade-in"
                                title={lang === 'sv' ? "Nästa uppgift" : "Next Question"}
                            >
                                <ChevronRight size={28} />
                            </button>
                        </div>

                        {/* DYNAMIC PRESENTATION ENGINE SWITCHBOARD LAYER */}
                        {viewMode === 'sheet' ? (
                        /* 📄 OPTION A: 1:1 REPLICATED BORDERLESS PAPER WORKSHEET VIEWER */
                        <div 
                            className="bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[15mm] flex flex-col rounded-sm border border-slate-300 animate-in fade-in zoom-in-95 duration-300 select-none mb-8 mt-2"
                        >
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
                                {packet.map((item, idx) => {
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
                                                            <div className="flex justify-center scale-75 origin-top mt-2 max-h-[120px]">
                                                                {renderVisual(rd)}
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
                        /* 🗂️ OPTION B: PERFECTLY BALANCED BORDERLESS CLASSROOM REVIEW LANES */
                        <div className="w-full h-full min-h-screen relative flex items-start select-none pt-6 pb-[70px]">
                            {activeIds.length === 0 && (
                                <div className="text-slate-300 font-black uppercase text-center mt-32 tracking-widest text-sm w-full">Välj uppgifter till vänster för att presentera</div>
                            )}
                            
                            {activeIds.map((id, index) => {
                                const q = packet.find(p => p.id === id);
                                if (!q) return null;
                                const rd = q.resolvedData?.renderData;
                                const masterIndex = packet.findIndex(p => p.id === id) + 1;

                                return (
                                    <div 
                                        key={id} 
                                        className="flex flex-col flex-1 px-8 relative h-full items-center justify-start animate-in zoom-in-95 duration-200"
                                    >
                                        {/* DYNAMIC FULL-HEIGHT PROJECTION DIVIDER LINES */}
                                        {index > 0 && (
                                            <div className="absolute top-0 bottom-0 left-0 border-l-4 border-dashed border-slate-400/80 -translate-x-1/2 pointer-events-none" />
                                        )}

                                        <div className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md px-2.5 py-1 inline-block mb-6 uppercase tracking-wider shadow-sm shrink-0">
                                            {lang === 'sv' ? `Uppgift ${masterIndex}` : `Question ${masterIndex}`}
                                        </div>
                                        
                                        {q.showVisual !== false && rd && (
                                            <div className="flex justify-center mb-6 scale-90 origin-top max-h-[160px] overflow-hidden shrink-0">
                                                {renderVisual(rd)}
                                            </div>
                                        )}
                                        {q.showText !== false && (
                                            <div className={`font-bold text-slate-800 text-center leading-relaxed max-w-prose w-full break-words px-4 ${sizeClasses.desc}`}>
                                                <MathDisplay content={rd?.description} />
                                            </div>
                                        )}
                                        {q.showLatex !== false && rd?.latex && (
                                            <div className={`mt-6 py-4 bg-indigo-50/40 rounded-2xl text-center font-serif text-indigo-950 border border-indigo-100/60 shadow-inner w-full max-w-xs shrink-0 ${sizeClasses.latex}`}>
                                                <MathDisplay content={`$$${rd.latex}$$`} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* COLUMN 3: SOLUTIONS & COMPACT ANSWER KEY DRAWER PANEL */}
                <div className="w-80 bg-white border-l border-slate-200 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6 shrink-0 select-none h-full">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                            <Layers size={14} className="text-slate-400" />
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {clueViewMode === 'steps' ? (lang === 'sv' ? "Lösningssteg" : "Solution Steps") : (lang === 'sv' ? "Facit" : "Answer Key")}
                            </h2>
                        </div>
                        
                        {/* STATE SWITCHER CONTROLS */}
                        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 shadow-inner">
                            <button
                                onClick={() => setClueViewMode('steps')}
                                className={`px-2 py-1 text-[8px] font-black uppercase rounded-md transition-all cursor-pointer ${clueViewMode === 'steps' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {lang === 'sv' ? "Steg" : "Steps"}
                            </button>
                            <button
                                onClick={() => setClueViewMode('answers')}
                                className={`px-2 py-1 text-[8px] font-black uppercase rounded-md transition-all cursor-pointer ${clueViewMode === 'answers' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {lang === 'sv' ? "Svar" : "Answers"}
                            </button>
                        </div>
                    </div>
                    
                    {/* 🟢 CONDITIONAL LOGIC SPLIT: FULL ASSIGNED ANSWER SHEET VS INDIVIDUAL ACTIVE PROBLEM STEPS */}
{clueViewMode === 'answers' ? (
    /* 🚀 NEW ENGINE: KOMPAKT MULTI-COLUMN FULL WORKSHEET KEY GRID */
    <div className="flex-1 flex flex-col min-h-0 animate-in fade-in duration-200">
        {packet.length === 0 ? (
            <div className="text-center text-slate-300 italic text-xs mt-12">Tomt arbetsblad</div>
        ) : (
                                /* 🟢 FIX A: Added a custom utility class 'katex-size-bridge' so we can force deep children to listen to our sizing state wrapper */
                                <div className={`columns-2 gap-x-4 gap-y-2 font-bold leading-normal break-inside-avoid text-slate-700 ${sizeClasses.latex}`}>
                                    
                                    {packet.map((q, idx) => {
                                        const rd = q.resolvedData?.renderData;
                                        const clues = q?.clues || q?.resolvedData?.clues || [];

                                        // 🟢 FIXED: Target the true final answer instead of the question root latex field
                                        // 1. Look for explicit final answer strings first (e.g., rd.answer or q.answer)
                                        let finalPayload = rd?.answer || q.answer;

                                        // 2. Fallback: If no explicit answer field exists, extract the math data from the very last clue step
                                        if (!finalPayload && clues.length > 0) {
                                            const lastClue = clues[clues.length - 1];
                                            // If the clue is a localized object structure, pull its math latex or text field safely
                                            finalPayload = typeof lastClue === 'object' 
                                                ? (lastClue.latex || lastClue[lang] || lastClue.text) 
                                                : lastClue;
                                        }

                                        // Fallback default if absolutely nothing is found
                                        if (!finalPayload) finalPayload = "-";

                                        // Standardize wrapping inside inline math blocks cleanly
                                        const inlineMathAnswer = `$${String(finalPayload).replace(/\$/g, '')}$`;

                                        return (
                                            <div 
                                                key={`key-ans-${q.id}`} 
                                                className="inline-block w-full py-2 px-3 mb-2 bg-slate-50 border border-slate-200/60 rounded-xl overflow-hidden text-ellipsis transition-all duration-200"
                                            >
                                                <span className="font-black text-indigo-600 mr-2 text-[20px] select-none inline-block align-middle">
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
                        /* 🛠️ LEGACY STEP-BY-STEP SOLUTION CAROUSEL RENDERER */
                        <>
                            {activeIds.length === 0 && (
                                <div className="text-center text-slate-300 italic text-xs mt-12 px-4">
                                    {lang === 'sv' ? "Klicka på en uppgift i arbetsbladet för att visa tillhörande lösningssteg." : "Click any question inside the worksheet page to load its clues."}
                                </div>
                            )}

                            {activeIds.map(id => {
                                const q = packet.find(p => p.id === id);
                                const clues = q?.clues || q?.resolvedData?.clues || [];
                                const progress = clueProgress[id] || 0;
                                const masterIndex = packet.findIndex(p => p.id === id) + 1;

                                if (!q || clues.length === 0) return null;

                                return (
                                    <div key={`clues-${id}`} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 animate-in slide-in-from-right-4 duration-300 mb-2">
                                        <div className="flex items-center justify-between mb-4 bg-white p-2 rounded-xl border border-slate-200/60 shadow-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                                                    {lang === 'sv' ? `Uppgift ${masterIndex}` : `Question ${masterIndex}`}
                                                </div>
                                                {progress > 0 && (
                                                    <button
                                                        onClick={() => setClueProgress({ ...clueProgress, [id]: 0 })}
                                                        className="p-1 text-slate-400 hover:text-rose-500 rounded bg-slate-50 border border-slate-100 hover:border-rose-100 transition-colors cursor-pointer text-[8px] font-black uppercase tracking-tight"
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
                                                <div className="min-w-8 text-center text-[10px] font-black text-slate-500">{progress}/{clues.length}</div>
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
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}