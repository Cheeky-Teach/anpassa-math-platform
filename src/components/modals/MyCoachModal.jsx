// src/components/modals/MyCoachModal.jsx
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, ChevronLeft, ChevronRight, CheckCircle2, Circle } from 'lucide-react';

// GEOMETRY, FRACTION AND PLOT CANVAS ENGINE IMPORTS
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

// FIXED SWITCHBOARD ROUTER
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
            <div style={{ width: '220px', height: '180px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <VolumeVisualization data={rd.geometry} />
            </div>
        );
    }
    if (rd.geometry?.type === 'angle') return <AngleVisual data={rd.geometry} />;
    if (rd.scale || rd.geometry?.type === 'scale') return <ScaleVisual data={rd.scale || rd.geometry} />;
    if (rd.similarity || rd.geometry?.type === 'similarity') return <SimilarityCompare data={rd.similarity || rd.geometry} />;
    if (rd.compareArea || rd.geometry?.type === 'compare_area') return <CompareShapesArea data={rd.compareArea || rd.geometry} />;
    if (rd.tree || rd.geometry?.type === 'pathway') return <ProbabilityTree data={rd.tree || rd.geometry} />;
    
    return <GeometryVisual data={rd.geometry} width={240} height={200} />;
};

export default function MyCoachModal({
    lang = 'sv',
    onClose,
    inlineMode = false, 
    question = null,    
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

    useEffect(() => {
        if (boardEndRef.current) {
            boardEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [historyStack.length, activeLine]);

    useEffect(() => {
        if (textEndRef.current) {
            textEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [currentStep]);

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

    const content = (
        <div className={`bg-[var(--bg-card)] w-full border border-[var(--border-strong)] flex flex-col overflow-hidden text-[var(--text-main)] ${
            inlineMode ? 'h-full rounded-2xl shadow-inner' : 'w-[98vw] max-w-none h-[92vh] rounded-2xl shadow-2xl'
        }`}>
            
            {/* Upper Status Navbar Strip */}
            <header className="bg-[var(--bg-surface)] px-6 py-3 flex justify-between items-center border-b border-[var(--border-main)] shrink-0">
                <div className="flex items-center gap-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 leading-none">{ui.title}</h2>
                    <span className="hidden sm:inline-block text-[var(--text-muted)] font-bold">•</span>
                    <p className="hidden sm:block text-xs font-semibold text-[var(--text-muted)] tracking-wide leading-none">{ui.subtitle}</p>
                </div>
                
                {/* Progress Checklist Dot Nodes */}
                <div className="hidden md:flex items-center gap-2 max-w-md overflow-x-auto px-4">
                    {steps.map((_, idx) => (
                        <React.Fragment key={`dot-${idx}`}>
                            {idx > 0 && <div className={`w-6 h-0.5 shrink-0 transition-colors duration-200 ${idx <= currentStep ? 'bg-emerald-600' : 'bg-[var(--border-strong)]'}`} />}
                            {idx < currentStep ? (
                                <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                            ) : idx === currentStep ? (
                                <motion.div 
                                    layoutId="activeStepDot"
                                    className="w-3.5 h-3.5 rounded-full bg-amber-500 border-4 border-amber-500/30 scale-110 shrink-0" 
                                />
                            ) : (
                                <Circle size={13} className="text-[var(--text-muted)] shrink-0" />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {!inlineMode && (
                    <button 
                        type="button"
                        onClick={onClose}
                        className="p-1.5 hover:bg-[var(--bg-card)] rounded-xl transition-colors cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-main)] ui-ignore border border-transparent hover:border-[var(--border-main)]"
                    >
                        <X size={18} />
                    </button>
                )}
            </header>

            {/* Main Split Interface Area */}
            <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
                
                {/* LEFT PANEL: Traditional Whiteboard styled like square-grid graph paper */}
                <div className="flex-1 bg-[var(--bg-canvas)] relative overflow-y-auto custom-scrollbar p-6 flex flex-col justify-start border-b md:border-b-0 md:border-r border-[var(--border-main)]">
                    {/* Blueprint Math Graph Paper Effect Layer */}
                    <div 
                        className="absolute inset-0 opacity-[0.035] pointer-events-none z-0 dark:opacity-[0.08]" 
                        style={{ 
                            backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
                            backgroundSize: '24px 24px'
                        }} 
                    />
                    
                    {/* Dynamic Whiteboard Column Stack */}
                    <div className="relative z-10 w-full max-w-2xl mx-auto space-y-5 flex flex-col py-2">
                        
                        {/* Stacking Historical Equations */}
                        <AnimatePresence>
                            {historyStack.map((line, idx) => (
                                <motion.div 
                                    key={`hist-${idx}`}
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 0.4, y: 0, scale: 0.95 }}
                                    transition={{ duration: 0.25 }}
                                    className="blur-[0.3px] origin-center text-[var(--text-main)] text-xl border-b border-[var(--border-main)] pb-2"
                                >
                                    <CoachMathDisplay content={`$$${line.latex}$$`} />
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Active, High-Contrast Equation Row */}
                        <AnimatePresence mode="wait">
                            {activeLine && (
                                <motion.div 
                                    key={activeLine}
                                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.96 }}
                                    transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                                    className="bg-[var(--bg-card)] border-2 border-[var(--border-strong)] p-4 rounded-2xl text-center font-serif text-[var(--text-main)] shadow-md text-2xl font-bold"
                                >
                                    <CoachMathDisplay content={`$$${activeLine}$$`} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* STICKY GEOMETRIC DIAGRAM AT THE BASE HEAD OF THE WHITEBOARD CHALKBOARD */}
                        {rd && (rd.graph || rd.geometry || rd.volume || rd.pattern || rd.probabilityTree || rd.probabilityMarbles || rd.probabilitySpinner || rd.scale || rd.similarity || rd.compareShapesArea || rd.frequencyTable || rd.percentGrid || rd.angles) && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.94 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                                className="bg-[var(--bg-card)] border border-[var(--border-main)] shadow-2xs p-4 pt-6 rounded-2xl flex justify-center items-center max-w-sm mx-auto shrink-0 mb-2 relative overflow-visible"
                            >
                                <div className="w-full flex items-center justify-center overflow-visible">
                                    {renderCoachVisual(rd)}
                                </div>
                                <div className="absolute top-2 left-3 text-[9px] font-bold font-mono uppercase tracking-wider text-[var(--text-muted)]">
                                    {lang === 'sv' ? "Figur" : "Diagram"}
                                </div>
                            </motion.div>
                        )}

                        <div ref={boardEndRef} />
                    </div>
                </div>

                {/* RIGHT PANEL: Instructor Voice / Guidance Center */}
                <div className="w-full md:w-[420px] bg-[var(--bg-surface)] flex flex-col min-h-0 overflow-hidden shrink-0">
                    
                    {/* Explanation Box Log Container */}
                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col justify-start items-center space-y-4 min-h-0 py-6">
                        
                        <AnimatePresence mode="popLayout">
                            {steps.slice(0, currentStep + 1).map((step, idx) => {
                                const isActive = idx === currentStep;
                                
                                if (!isActive) {
                                    return (
                                        <motion.div 
                                            key={`text-hist-${idx}`}
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 0.4, y: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="bg-[var(--bg-card)] p-3.5 rounded-xl border border-[var(--border-main)] shadow-2xs w-full max-w-sm blur-[0.2px] scale-95 origin-center shrink-0"
                                        >
                                            <CoachMathDisplay 
                                                content={step.text} 
                                                className="text-[var(--text-muted)] font-semibold text-xs text-center leading-relaxed" 
                                            />
                                        </motion.div>
                                    );
                                }
                                
                                return (
                                    <motion.div 
                                        key={`text-active-${idx}`}
                                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 450, damping: 26 }}
                                        className="bg-[var(--bg-card)] p-5 rounded-2xl border-2 border-emerald-600 dark:border-emerald-500 border-l-6 shadow-md w-full max-w-sm min-h-[90px] flex flex-col justify-center shrink-0"
                                    >
                                        <CoachMathDisplay 
                                            content={step.text} 
                                            className="text-[var(--text-main)] font-bold text-sm text-center leading-relaxed" 
                                        />
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        <div ref={textEndRef} />

                        {/* Note-Taking Pacing Indicator Box */}
                        <AnimatePresence>
                            {isCooldownActive && activeLine && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 animate-pulse bg-emerald-50 dark:bg-emerald-950/50 px-4 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 shrink-0"
                                >
                                    <span className="inline-block animate-bounce font-serif font-normal text-base">✏️</span>
                                    <span>{ui.copyCue}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Success Celebration Alert Callout */}
                        {currentStep === totalSteps - 1 && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 shrink-0"
                            >
                                {ui.done}
                            </motion.div>
                        )}
                    </div>

                    {/* Player Controls Footbar */}
                    <footer className="p-4 bg-[var(--bg-card)] border-t border-[var(--border-main)] flex items-center justify-between gap-4 shrink-0">
                        {/* Autoplay Sequencer Loop Toggle */}
                        <button
                            type="button"
                            onClick={toggleAutoplay}
                            className={`px-3 py-2.5 rounded-xl border transition-all active:scale-[0.98] cursor-pointer ui-ignore flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider min-w-[100px] ${
                                isAutoplayActive 
                                    ? 'bg-amber-600 border-amber-700 text-white shadow-2xs' 
                                    : 'bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--text-main)] hover:border-emerald-600'
                            }`}
                        >
                            {isAutoplayActive ? (
                                <><Pause size={13} fill="currentColor" /> <span>{ui.pause}</span></>
                            ) : (
                                <><Play size={13} fill="currentColor" /> <span>{ui.autoplay}</span></>
                            )}
                        </button>

                        {/* Manual Progression Tracking Buttons */}
                        <div className="flex items-center bg-[var(--bg-surface)] p-1 rounded-xl border border-[var(--border-main)] gap-1 shadow-inner">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={currentStep === 0}
                                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] disabled:opacity-20 cursor-pointer transition-colors disabled:hover:bg-transparent"
                            >
                                <ChevronLeft size={16} strokeWidth={2.5} />
                            </button>
                            
                            <span className="text-xs font-bold font-mono tracking-wider text-[var(--text-muted)] px-3 min-w-[45px] text-center">
                                {currentStep + 1} / {totalSteps}
                            </span>

                            <button
                                type="button"
                                onClick={nextStep}
                                disabled={currentStep === totalSteps - 1 || isCooldownActive}
                                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] disabled:opacity-20 cursor-pointer transition-colors disabled:hover:bg-transparent"
                            >
                                <ChevronRight size={16} strokeWidth={2.5} />
                            </button>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );

    if (inlineMode) {
        return <div className="w-full h-full p-0 select-none font-sans">{content}</div>;
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[400] flex items-center justify-center p-2 sm:p-4 select-none font-sans">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-xs"
                />

                {/* Animated Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.94, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 8 }}
                    transition={{ type: 'spring', stiffness: 480, damping: 32 }}
                    className="w-[98vw] max-w-none h-[92vh] z-10"
                >
                    {content}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}