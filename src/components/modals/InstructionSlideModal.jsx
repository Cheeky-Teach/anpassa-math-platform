import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, BookOpen, Check, RefreshCw } from 'lucide-react';
import SlideViewerCore from '../shared/SlideViewerCore';

export default function InstructionSlideModal({
    isOpen,
    onClose,
    onCompleteAndAdvance,
    sheetTitle,
    slides = [],
    livePacket = [],
    initialSlideIndex = 0,
    lang = 'sv'
}) {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(initialSlideIndex);
    
    const [localSlides, setLocalSlides] = useState([]);
    const [localPacket, setLocalPacket] = useState([]);
    const [isRegenerating, setIsRegenerating] = useState(false);

    useEffect(() => {
        if (slides.length > 0) setLocalSlides(slides);
        if (livePacket.length > 0) setLocalPacket(livePacket);
    }, [slides, livePacket]);

    if (!isOpen || localSlides.length === 0) return null;

    const currentSlide = localSlides[currentSlideIndex] || localSlides[0];
    const isLastSlide = currentSlideIndex >= localSlides.length - 1;

    const handlePrev = () => {
        if (currentSlideIndex > 0) setCurrentSlideIndex(prev => prev - 1);
    };

    const handleNext = () => {
        if (currentSlideIndex < localSlides.length - 1) setCurrentSlideIndex(prev => prev + 1);
    };

    const handleRegenerate = async (passedId, passedTopic, passedVariation) => {
        if (isRegenerating) return;
        setIsRegenerating(true);
        
        try {
            let itemsToUpdate = [];

            if (passedId && passedTopic && passedVariation) {
                const idx = localPacket.findIndex(p => p.id === passedId);
                if (idx !== -1) {
                    itemsToUpdate.push({ item: localPacket[idx], index: idx, topicId: passedTopic, variationKey: passedVariation });
                }
            } else {
                const activeIds = currentSlide?.activeIds || [];
                itemsToUpdate = activeIds.map(id => {
                    const idx = localPacket.findIndex(p => p.id === id);
                    return { item: localPacket[idx], index: idx, topicId: localPacket[idx]?.topicId, variationKey: localPacket[idx]?.variationKey };
                }).filter(obj => obj.item && obj.topicId && obj.variationKey);
            }

            if (itemsToUpdate.length === 0) return;

            const updatedItems = await Promise.all(itemsToUpdate.map(async ({ item, topicId, variationKey }) => {
                const isWordProblem = item.selectedStoryIndex !== null && item.selectedStoryIndex !== undefined;
                const res = await fetch(`/api/question?topic=${topicId}&variation=${variationKey}&lang=${lang}&wordProblem=${isWordProblem}`);
                
                if (!res.ok) throw new Error("API request failed");
                const data = await res.json();
                
                return {
                    ...item,
                    resolvedData: data,
                    regenVersion: Date.now()
                };
            }));

            setLocalPacket(prev => {
                const next = [...prev];
                itemsToUpdate.forEach((obj, i) => {
                    next[obj.index] = updatedItems[i];
                });
                return next;
            });

        } catch (error) {
            console.error("Error regenerating example:", error);
        } finally {
            setIsRegenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150 select-none font-sans">
            <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden relative text-[var(--text-main)]">
                
                {/* 1. Header Bar */}
                <div className="px-6 py-3.5 bg-[var(--bg-surface)] border-b border-[var(--border-main)] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 shadow-2xs">
                            <BookOpen size={17} />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 block leading-tight">
                                {lang === 'sv' ? "Instruktionsgenomgång" : "Instruction Walkthrough"}
                            </span>
                            <h3 className="text-sm font-extrabold text-[var(--text-main)] truncate leading-tight mt-0.5">
                                {sheetTitle || (lang === 'sv' ? "Genomgång" : "Presentation")}
                            </h3>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {localSlides.length > 1 && (
                            <div className="text-xs font-bold font-mono text-[var(--text-muted)] bg-[var(--bg-card)] px-3 py-1 rounded-xl border border-[var(--border-main)]">
                                {currentSlideIndex + 1} / {localSlides.length}
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] rounded-xl transition-colors cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* 2. Main 16:9 Presentation Viewport */}
                <div className="flex-1 bg-[var(--bg-canvas)] p-4 sm:p-6 flex items-center justify-center relative overflow-hidden min-h-0">                    
                    {/* Navigation Arrows */}
                    {localSlides.length > 1 && (
                        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-30">
                            <button
                                type="button"
                                onClick={handlePrev}
                                disabled={currentSlideIndex === 0}
                                className="w-10 h-10 rounded-xl bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-strong)] hover:bg-emerald-600 hover:text-white disabled:opacity-0 disabled:pointer-events-none pointer-events-auto flex items-center justify-center transition-all shadow-md cursor-pointer"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={isLastSlide}
                                className="w-10 h-10 rounded-xl bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-strong)] hover:bg-emerald-600 hover:text-white disabled:opacity-0 disabled:pointer-events-none pointer-events-auto flex items-center justify-center transition-all shadow-md cursor-pointer"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}

                    {/* Exact 16:9 Presentation Viewer Core */}
                    <div className="w-full h-full max-w-[1400px] max-h-[787px] flex items-center justify-center">
                        <SlideViewerCore
                            slide={currentSlide}
                            livePacket={localPacket}
                            lang={lang}
                            bgType="blank"
                            globalZoom={1.2}
                            authorMode={false}
                            theme={currentSlide?.theme || 'clean'}
                            slideRendererProps={{
                                clueViewMode: 'steps',
                                currentFocusedQuestion: null,
                                coachProps: {},
                                onSpotlight: () => {},
                                onRegenerate: handleRegenerate,
                                setIsSaving: () => {}
                            }}
                            interactiveCanvasProps={{
                                setElements: () => {},
                                onToggleBg: () => {},
                                clueProgress: {},
                                activeDrawer: null,
                                onToggleDrawer: () => {},
                                renderDrawer: false
                            }}
                        />
                    </div>
                </div>

                {/* Loading indicator overlay during regen */}
                {isRegenerating && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs z-[350] flex flex-col items-center justify-center pointer-events-none">
                        <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] text-[var(--text-main)] px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
                            <RefreshCw size={15} className="animate-spin text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs font-bold uppercase tracking-wider">{lang === 'sv' ? "Hämtar..." : "Loading..."}</span>
                        </div>
                    </div>
                )}

                {/* 3. Bottom Action Bar */}
                <div className="px-6 py-3.5 bg-[var(--bg-surface)] border-t border-[var(--border-main)] flex items-center justify-between shrink-0">
                    <div>
                        {localSlides.length > 1 && !isLastSlide && (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="px-4 py-2 bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-strong)] text-[var(--text-main)] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                            >
                                {lang === 'sv' ? "Nästa slide →" : "Next Slide →"}
                            </button>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onCompleteAndAdvance}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
                    >
                        <Check size={15} strokeWidth={3} />
                        <span>{lang === 'sv' ? "Klar! Gå till övning →" : "Done! Go to practice →"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}