import React, { useState, useRef, useEffect } from 'react';
import { 
    X, ChevronLeft, ChevronRight, Monitor, PanelLeftClose, 
    PanelLeftOpen, ZoomIn, ZoomOut, Layers 
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
    return <div ref={containerRef} className={`math-content leading-relaxed whitespace-pre-wrap ${className}`} />;
};

export default function PresentationView({ packet, sheetTitle, lang = 'sv', onClose }) {
    const [activeIds, setActiveIds] = useState([]);
    const [clueProgress, setClueProgress] = useState({});

    // 🟢 NEW: The Anchor System State
    const [presentationIndex, setPresentationIndex] = useState(0);

    // --- QUALITY OF LIFE STATES ---
    const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
    const [textSize, setTextSize] = useState('base'); 

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

    // --- SMART SIDEBAR SELECTION HANDLER ---
    const toggleQuestion = (id) => {
        if (activeIds.includes(id)) {
            setActiveIds(activeIds.filter(qId => qId !== id));
        } else if (activeIds.length < 3) {
            setActiveIds([...activeIds, id]);
            if (clueProgress[id] === undefined) {
                setClueProgress({ ...clueProgress, [id]: 0 });
            }
            
            // 🟢 ANCHOR LOGIC: If picking a question on a blank board, move the Anchor here.
            // If picking a question while others are open, it's a comparison—do NOT move the Anchor.
            if (activeIds.length === 0) {
                const newIdx = packet.findIndex(p => p.id === id);
                if (newIdx !== -1) setPresentationIndex(newIdx);
            }
        }
    };

    // --- CANVAS ARROW NAVIGATION LOGIC ---
    const handleCanvasPrev = () => {
        let targetIdx = presentationIndex;
        // If the board is open, step back. If it's blank, just re-open the Anchor.
        if (activeIds.length > 0) targetIdx -= 1; 
        if (targetIdx < 0) return;

        setPresentationIndex(targetIdx);
        setActiveIds([packet[targetIdx].id]); // Wipes comparisons, loads single target
        if (clueProgress[packet[targetIdx].id] === undefined) {
            setClueProgress(prev => ({ ...prev, [packet[targetIdx].id]: 0 }));
        }
    };

    const handleCanvasNext = () => {
        let targetIdx = presentationIndex;
        // If the board is open, step forward. If it's blank, just re-open the Anchor.
        if (activeIds.length > 0) targetIdx += 1;
        if (targetIdx >= packet.length) return;
        
        setPresentationIndex(targetIdx);
        setActiveIds([packet[targetIdx].id]); // Wipes comparisons, loads single target
        if (clueProgress[packet[targetIdx].id] === undefined) {
            setClueProgress(prev => ({ ...prev, [packet[targetIdx].id]: 0 }));
        }
    };

    // --- TEXT SIZE CLASS MAPPER ---
    const getTextSizeClass = (type) => {
        const textMap = {
            'base': { desc: 'text-sm', latex: 'text-2xl', clue: 'text-[11px]' },
            'lg': { desc: 'text-base', latex: 'text-3xl', clue: 'text-xs' },
            'xl': { desc: 'text-lg', latex: 'text-4xl', clue: 'text-sm' },
            '2xl': { desc: 'text-xl', latex: 'text-5xl', clue: 'text-base' }
        };
        return textMap[textSize] || textMap['base'];
    };

    const sizeClasses = getTextSizeClass();

    return (
        <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col font-sans overflow-hidden animate-in fade-in">
            {/* Header Navbar Layer */}
            <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md z-50 select-none">
                <div className="flex items-center gap-2">
                    <Monitor size={20} className="text-amber-400" />
                    <h1 className="text-lg font-black uppercase tracking-widest italic">{sheetTitle || 'Presentationsläge'}</h1>
                </div>
                
                <div className="flex items-center gap-4">
                    
                    {/* Reset Canvas Button */}
                    <button
                        disabled={activeIds.length === 0}
                        onClick={() => {
                            if (window.confirm(lang === 'sv' ? "Ta bort valda uppgifter?" : "Clear all selected questions?")) {
                                setActiveIds([]);
                            }
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-rose-600 border border-slate-700/60 text-slate-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-20 disabled:hover:bg-slate-800 disabled:hover:text-slate-300 cursor-pointer"
                    >
                        {lang === 'sv' ? "Nollställ" : "Reset Canvas"}
                    </button>

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

                    

                    <div className="w-px h-6 bg-slate-700/60 hidden sm:block" />

                    <button onClick={onClose} className="bg-white/10 hover:bg-rose-500 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer">Stäng</button>
                </div>
            </header>

            {/* 3-COLUMN LAYOUT MATRIX */}
            <div 
                className="flex-1 grid overflow-hidden relative transition-all duration-300"
                style={{ 
                    gridTemplateColumns: `${isLeftCollapsed ? '64px' : '288px'} 1fr 320px` 
                }}
            >
                {/* COLUMN 1: COLLAPSIBLE SMART QUESTION PICKER */}
                <div className={`bg-white border-r border-slate-200 overflow-y-auto custom-scrollbar flex flex-col transition-all duration-300 select-none shrink-0 z-10 min-w-0 ${isLeftCollapsed ? 'p-2 items-center' : 'p-6'}`}>
                    <div className={`flex items-center mb-4 w-full ${isLeftCollapsed ? 'justify-center' : 'justify-between'}`}>
                        {!isLeftCollapsed && <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Uppgifter ({packet.length})</h2>}
                        <button 
                            onClick={() => { setIsLeftCollapsed(!isLeftCollapsed); }}
                            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                            title={isLeftCollapsed ? "Expandera panel" : "Minimera panel"}
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
                                        className={`w-10 h-10 rounded-full font-black text-m uppercase border-2 flex items-center justify-center transition-all cursor-pointer shadow-sm shrink-0
                                            ${isActive 
                                                ? 'bg-amber-500 border-amber-600 text-white font-black scale-105 ring-4 ring-amber-500/10' 
                                                : 'bg-white border-slate-200 text-slate-800 hover:border-slate-400'}`}
                                    >
                                        {idx + 1}
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
                                        <span className="text-[16px] font-black text-slate-900"># {idx + 1}</span>
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

                {/* COLUMN 2: FULL-SIZE COMPACT WORKSPACE PRESENTATION PANELS */}
                <div className="relative bg-[#f9fbf7] overflow-hidden h-full w-full group">
                    
                    {/* 🟢 HIGH CONTRAST CANVAS NAVIGATION ARROWS */}
                    <button 
                        onClick={handleCanvasPrev}
                        disabled={activeIds.length > 0 && presentationIndex === 0}
                        className="absolute left-6 top-10 -translate-y-1/2 w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center z-40 shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:bg-indigo-600 transition-all disabled:opacity-0 disabled:pointer-events-none cursor-pointer border-4 border-white/20 hover:border-white"
                    >
                        <ChevronLeft size={32} />
                    </button>

                    <button 
                        onClick={handleCanvasNext}
                        disabled={activeIds.length > 0 && presentationIndex >= packet.length - 1}
                        className="absolute right-6 top-10 -translate-y-1/2 w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center z-40 shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:bg-indigo-600 transition-all disabled:opacity-0 disabled:pointer-events-none cursor-pointer border-4 border-white/20 hover:border-white"
                    >
                        <ChevronRight size={32} />
                    </button>

                    <div className="absolute top-8 left-16 right-16 z-20 flex justify-center gap-6 items-start flex-wrap lg:flex-nowrap">
                        {activeIds.map(id => {
                            const q = packet.find(p => p.id === id);
                            if (!q) return null;
                            const rd = q.resolvedData?.renderData;
                            const masterIndex = packet.findIndex(p => p.id === id) + 1;

                            return (
                                <div key={id} className="bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-slate-200/80 flex-1 min-w-[240px] max-w-sm animate-in zoom-in-95 duration-200">
                                    <div className="text-[9px] font-black text-indigo-500 bg-indigo-50 border border-indigo-100 rounded-md px-2 py-0.5 inline-block mb-3 uppercase tracking-wider">
                                        {lang === 'sv' ? `Uppgift ${masterIndex}` : `Question ${masterIndex}`}
                                    </div>
                                    
                                    {q.showVisual !== false && rd && (
                                        <div className="flex justify-center mb-4 scale-75 origin-top max-h-[140px]">
                                            {renderVisual(rd)}
                                        </div>
                                    )}
                                    {q.showText !== false && (
                                        <div className={`font-bold text-slate-800 text-center leading-relaxed ${sizeClasses.desc}`}>
                                            <MathDisplay content={rd?.description} />
                                        </div>
                                    )}
                                    {q.showLatex !== false && rd?.latex && (
                                        <div className={`mt-4 py-3 bg-indigo-50/50 rounded-xl text-center font-serif text-indigo-900 border border-indigo-100 shadow-inner ${sizeClasses.latex}`}>
                                            <MathDisplay content={`$$${rd.latex}$$`} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* COLUMN 3: STEP-BY-STEP SOLUTION CLUE PANEL */}
                <div className="w-120 bg-white border-l border-slate-800 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6 shrink-0 select-none h-full">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Layers size={14} className="text-slate-400" />
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lösningssteg</h2>
                    </div>
                    
                    {activeIds.length === 0 && (
                        <div className="text-center text-slate-300 italic text-xs mt-12 px-4">
                            {lang === 'sv' ? "Välj uppgifter till vänster för att börja gå igenom steg." : "Select questions on the left to review their steps."}
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
                                        <div className="text-[16px] font-black uppercase text-indigo-600 tracking-wider">
                                            {lang === 'sv' ? `Uppgift ${masterIndex}` : `Question ${masterIndex}`}
                                        </div>
                                        
                                        {/* Reset Clues Button */}
                                        {progress > 0 && (
                                            <button
                                                onClick={() => setClueProgress({ ...clueProgress, [id]: 0 })}
                                                className="p-1 text-slate-800 hover:text-rose-500 rounded bg-slate-200 border border-slate-100 hover:border-rose-100 transition-colors cursor-pointer text-[8px] font-black uppercase tracking-tight"
                                                title={lang === 'sv' ? "Dölj alla steg igen" : "Hide all steps"}
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
                                        <div className="min-w-8 text-center text-[14px] font-black text-slate-500">{progress}/{clues.length}</div>
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

            </div>
        </div>
    );
}