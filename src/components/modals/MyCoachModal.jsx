import React, { useEffect, useRef } from 'react';
import { X, Play, Pause, ChevronLeft, ChevronRight, CheckCircle2, Circle } from 'lucide-react';

// 🟢 NEW: GEOMETRY, FRACTION AND PLOT CANVAS ENGINE IMPORTS
import { GeometryVisual, GraphCanvas, VolumeVisualization } from '../visuals/GeometryComponents';
import PatternVisual from '../visuals/PatternComponents';
import { ProbabilityMarbles, ProbabilitySpinner } from '../visuals/ProbabilityVisuals';
import ProbabilityTree from '../visuals/ProbabilityTree';
import { ScaleVisual, SimilarityCompare, CompareShapesArea } from '../visuals/ScaleVisuals';
import { FrequencyTable, PercentGrid } from '../visuals/StatisticsVisuals';
import AngleVisual from '../visuals/AngleComponents';

// Math Renderer Component
const CoachMathDisplay = ({ content, className = "" }) => {
    const containerRef = useRef(null);
    useEffect(() => {
        if (!content || !containerRef.current) return;
        containerRef.current.innerText = content;
        if (window.renderMathInElement) {
            window.renderMathInElement(containerRef.current, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false }
                ],
                throwOnError: false,
                trust: true
            });
        }
    }, [content]);
    return <div ref={containerRef} className={`math-content select-text ${className}`} />;
};

// 🟢 NEW: CORE GRAPHICAL VISUAL SWITCHBOARD ROUTER
const renderCoachVisual = (rd) => {
    if (!rd) return null;
    if (rd.graph) return <GraphCanvas data={rd.graph} />;
    if (rd.pattern || rd.geometry?.subtype === 'matchsticks' || rd.geometry?.subtype === 'sequence') {
        return <PatternVisual data={rd.pattern || rd.geometry} />;
    }
    if (rd.marbles || rd.geometry?.type === 'marbles' || rd.geometry?.items) {
        return <ProbabilityMarbles data={rd.marbles || rd.geometry} />;
    }
    if (rd.spinner || rd.geometry?.type === 'spinner') {
        return <ProbabilitySpinner data={rd.spinner || rd.geometry} />;
    }
    if (rd.freqTable || rd.geometry?.type === 'frequency_table' || rd.geometry?.headers) {
        return <FrequencyTable data={rd.freqTable || rd.geometry} />;
    }
    if (rd.percentGrid || rd.geometry?.type === 'percent_grid') {
        return <PercentGrid data={rd.percentGrid || rd.geometry} />;
    }
    if (rd.geometry && ['cylinder', 'cuboid', 'sphere', 'cone', 'pyramid', 'triangular_prism', 'silo', 'ice_cream'].includes(rd.geometry.type)) {
        return (
            <div style={{ width: '160px', height: '140px', display: 'flex', justifyContent: 'center' }}>
                <VolumeVisualization data={rd.geometry} />
            </div>
        );
    }
    if (rd.geometry?.type === 'angle') return <AngleVisual data={rd.geometry} />;
    if (rd.scale || rd.geometry?.type === 'scale') return <ScaleVisual data={rd.scale || rd.geometry} />;
    if (rd.similarity || rd.geometry?.type === 'similarity') return <SimilarityCompare data={rd.similarity || rd.geometry} />;
    if (rd.compareArea || rd.geometry?.type === 'compare_area') return <CompareShapesArea data={rd.compareArea || rd.geometry} />;
    if (rd.tree || rd.geometry?.type === 'pathway') return <ProbabilityTree data={rd.tree || rd.geometry} />;
    if (rd.geometry) return <GeometryVisual data={rd.geometry} width={160} height={140} />;
    return null;
};

export default function MyCoachModal({
    lang = 'sv',
    onClose,
    inlineMode = false, // 🟢 NEW: Adapts layouts for center container presentation takeovers
    question = null,    // 🟢 NEW: Receives question data containing geometry render tracks
    steps,
    currentStep,
    totalSteps,
    historyStack,
    activeLine,
    activeExplanation,
    isAutoplayActive,
    isCooldownActive,
    nextStep,
    prevStep,
    toggleAutoplay
}) {
    const boardEndRef = useRef(null);
    const textEndRef = useRef(null);

    // Auto-scroll the traditional whiteboard so new lines are kept inside the view fold
    useEffect(() => {
        if (boardEndRef.current) {
            boardEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [historyStack.length, activeLine]);

    // Auto-scroll the text column log when transitions to a new frame occur
    useEffect(() => {
        if (textEndRef.current) {
            textEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [currentStep]);

    // Local Translations Matrix
    const textDict = {
        sv: {
            title: "Min Personliga Coach",
            subtitle: "Steg-för-steg genomgång",
            close: "Stäng",
            autoplay: "Spela upp",
            pause: "Pausa",
            next: "Nästa steg",
            prev: "Föregående",
            copyCue: "Skriv ner detta i ditt räkneblock...",
            done: "Klart! Du är redo att lösa uppgiften."
        },
        en: {
            title: "My Personal Coach",
            subtitle: "Step-by-step walkthrough",
            close: "Close",
            autoplay: "Auto Play",
            pause: "Pause",
            next: "Next Step",
            prev: "Previous",
            copyCue: "Copy this down into your notebook...",
            done: "Finished! You are ready to solve the problem."
        }
    };

    const ui = textDict[lang === 'en' ? 'en' : 'sv'];
    const rd = question?.resolvedData?.renderData || question?.renderData || null;

    return (
        <div className={inlineMode ? "w-full h-full p-1 select-none" : "fixed inset-0 z-[400] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8 select-none animate-in fade-in duration-200"}>
            {/* Main Shell Panel Container */}
            <div className={`bg-white w-full border border-slate-200/60 flex flex-col overflow-hidden duration-300 ${
                inlineMode ? 'h-[80vh] rounded-[2rem] shadow-inner' : 'max-w-6xl h-[85vh] rounded-[2.5rem] shadow-2xl animate-in zoom-in-95'
            }`}>
                
                {/* Upper Status Navbar Strip */}
                <header className="bg-slate-900 px-8 py-4 flex justify-between items-center text-white border-b border-slate-800 shrink-0">
                    <div>
                        <h2 className="text-[18px] font-black uppercase tracking-wider text-amber-400">{ui.title}</h2>
                        <p className="text-xs font-medium text-slate-400 tracking-wide">{ui.subtitle}</p>
                    </div>
                    
                    {/* Progress Checklist Dot Nodes */}
                    <div className="hidden md:flex items-center gap-2 max-w-md overflow-x-auto px-4">
                        {steps.map((_, idx) => (
                            <React.Fragment key={`dot-${idx}`}>
                                {idx > 0 && <div className={`w-6 h-0.5 shrink-0 ${idx <= currentStep ? 'bg-emerald-500' : 'bg-slate-700'}`} />}
                                {idx < currentStep ? (
                                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 animate-in fade-in duration-300" />
                                ) : idx === currentStep ? (
                                    <div className="w-4 h-4 rounded-full bg-amber-400 border-4 border-amber-500/30 scale-110 shrink-0 transition-transform duration-300" />
                                ) : (
                                    <Circle size={14} className="text-slate-600 shrink-0" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {!inlineMode && (
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-slate-400 hover:text-white ui-ignore"
                        >
                            <X size={20} />
                        </button>
                    )}
                </header>

                {/* Main Split Interface Area */}
                <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
                    
                    {/* LEFT PANEL: Traditional Whiteboard styled like square-grid graph paper */}
                    <div className="flex-1 bg-[#fcfdfa] relative overflow-y-auto custom-scrollbar p-8 flex flex-col justify-start border-b md:border-b-0 md:border-r border-slate-200">
                        {/* Blueprint Math Graph Paper Effect Layer */}
                        <div 
                            className="absolute inset-0 opacity-[0.035] pointer-events-none z-0" 
                            style={{ 
                                backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                                backgroundSize: '24px 24px'
                            }} 
                        />
                        
                        {/* Dynamic Whiteboard Column Stack */}
                        <div className="relative z-10 w-full max-w-xl mx-auto space-y-6 flex flex-col py-4">
                            
                            {/* Stacking Historical Equations */}
                            {historyStack.map((line, idx) => (
                                <div 
                                    key={`hist-${idx}`} 
                                    className="opacity-40 blur-[0.4px] transition-all duration-500 scale-95 origin-center text-slate-800 text-xl border-b border-slate-100 pb-2"
                                >
                                    <CoachMathDisplay content={`$$${line.latex}$$`} />
                                </div>
                            ))}

                            {/* Active, High-Contrast Equation Row */}
                            {activeLine && (
                                <div className="bg-amber-50/50 border-2 border-amber-200/40 p-4 rounded-2xl text-center font-serif text-indigo-950 shadow-md animate-in slide-in-from-top-4 fade-in duration-300 text-2xl font-black">
                                    <CoachMathDisplay content={`$$${activeLine}$$`} />
                                </div>
                            )}

                            {/* 🟢 NEW: STICKY GEOMETRIC DIAGRAM AT THE BASE HEAD OF THE WHITEBOARD CHALKBOARD */}
                            {rd && (rd.graph || rd.geometry || rd.volume || rd.pattern || rd.probabilityTree || rd.probabilityMarbles || rd.probabilitySpinner || rd.scale || rd.similarity || rd.compareShapesArea || rd.frequencyTable || rd.percentGrid || rd.angles) && (
                                <div className="bg-white border border-slate-200/60 shadow-sm p-10 rounded-2xl flex justify-center items-center max-w-xs mx-auto shrink-0 mb-2 relative overflow-hidden animate-in zoom-in-95 duration-200">
                                    <div className="scale-90 origin-center max-h-[140px] flex items-center justify-center">
                                        {renderCoachVisual(rd)}
                                    </div>
                                    <div className="absolute top-1 left-3 text-[8px] font-black text-slate-300 uppercase tracking-widest">
                                        {lang === 'sv' ? "Figur" : "Diagram"}
                                    </div>
                                </div>
                            )}

                            {/* Anchor div used to force sticky viewport scrolls */}
                            <div ref={boardEndRef} />
                        </div>
                    </div>

                    {/* RIGHT PANEL: Instructor Voice / Guidance Center */}
                    <div className="w-full md:w-[400px] bg-slate-50 flex flex-col min-h-0 overflow-hidden shrink-0">
                        
                        {/* Explanation Box Log Container */}
                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col justify-start items-center space-y-4 min-h-0 py-8">
                            
                            {steps.slice(0, currentStep + 1).map((step, idx) => {
                                const isActive = idx === currentStep;
                                
                                if (!isActive) {
                                    return (
                                        <div 
                                            key={`text-hist-${idx}`}
                                            className="bg-white/70 p-4 rounded-2xl border border-slate-200/40 shadow-sm w-full max-w-sm opacity-35 blur-[0.2px] scale-95 origin-center transition-all duration-500 shrink-0"
                                        >
                                            <CoachMathDisplay 
                                                content={step.text} 
                                                className="text-slate-600 font-bold text-xs text-center leading-relaxed" 
                                            />
                                        </div>
                                    );
                                }
                                
                                return (
                                    <div 
                                        key={`text-active-${idx}`}
                                        className="bg-white p-6 rounded-3xl border-2 border-purple-500/80 border-l-8 shadow-xl w-full max-w-sm animate-in zoom-in-95 duration-200 min-h-[120px] flex flex-col justify-center shrink-0"
                                    >
                                        <CoachMathDisplay 
                                            content={step.text} 
                                            className="text-slate-800 font-black text-sm text-center leading-relaxed" 
                                        />
                                    </div>
                                );
                            })}

                            {/* Anchor element used to anchor automated scroll focuses */}
                            <div ref={textEndRef} />

                            {/* Note-Taking Pacing Indicator Box */}
                            {isCooldownActive && activeLine && (
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-purple-600 animate-pulse bg-purple-50 px-4 py-1.5 rounded-full border border-purple-100 shrink-0">
                                    <span className="inline-block animate-bounce font-serif font-normal text-base">✏️</span>
                                    {ui.copyCue}
                                </div>
                            )}

                            {/* Success Celebration Alert Callout */}
                            {currentStep === totalSteps - 1 && (
                                <div className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 animate-in fade-in duration-500 shrink-0">
                                    {ui.done}
                                </div>
                            )}
                        </div>

                        {/* Player Controls Footbar */}
                        <footer className="p-6 bg-white border-t border-slate-200 flex items-center justify-between gap-4 shrink-0">
                            {/* Autoplay Sequencer Loop Toggle */}
                            <button
                                onClick={toggleAutoplay}
                                className={`p-3 rounded-xl border transition-all active:scale-95 cursor-pointer ui-ignore flex items-center justify-center gap-2 text-[12px] font-black uppercase tracking-widest min-w-[120px]
                                    ${isAutoplayActive 
                                        ? 'bg-amber-500 border-amber-600 text-white' 
                                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200/80'}`}
                            >
                                {isAutoplayActive ? (
                                    <><Pause size={14} fill="currentColor" /> {ui.pause}</>
                                ) : (
                                    <><Play size={14} fill="currentColor" /> {ui.autoplay}</>
                                )}
                            </button>

                            {/* Manual Progression Tracking Buttons */}
                            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 shadow-inner">
                                <button
                                    onClick={prevStep}
                                    disabled={currentStep === 0}
                                    className="p-2.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white disabled:opacity-20 cursor-pointer transition-all disabled:hover:bg-transparent"
                                >
                                    <ChevronLeft size={18} strokeWidth={2.5} />
                                </button>
                                
                                <span className="text-[12px] font-black tracking-widest text-slate-500 px-3 min-w-[50px] text-center">
                                    {currentStep + 1} / {totalSteps}
                                </span>

                                <button
                                    onClick={nextStep}
                                    disabled={currentStep === totalSteps - 1 || isCooldownActive}
                                    className="p-2.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white disabled:opacity-20 cursor-pointer transition-all disabled:hover:bg-transparent"
                                >
                                    <ChevronRight size={18} strokeWidth={2.5} />
                                </button>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
}