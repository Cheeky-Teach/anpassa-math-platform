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
    
    // 🟢 1. Local state for BOTH slides and the packet (the true source of math data)
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

    // 🟢 2. The exact same regeneration logic used in TeacherLiveView (but local only)
    const handleRegenerate = async (passedId, passedTopic, passedVariation) => {
        if (isRegenerating) return;
        setIsRegenerating(true);
        
        try {
            // Determine which items to update. 
            // If the button passed specific info, use it. Otherwise, find all active items on the slide.
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

            // Fetch new data concurrently just like TeacherLiveView
            const updatedItems = await Promise.all(itemsToUpdate.map(async ({ item, topicId, variationKey }) => {
                const isWordProblem = item.selectedStoryIndex !== null && item.selectedStoryIndex !== undefined;
                const res = await fetch(`/api/question?topic=${topicId}&variation=${variationKey}&lang=${lang}&wordProblem=${isWordProblem}`);
                
                if (!res.ok) throw new Error("API request failed");
                const data = await res.json();
                
                return {
                    ...item,
                    resolvedData: data,
                    regenVersion: Date.now() // Force re-render
                };
            }));

            // 🟢 Update the local packet (SlideViewerCore will instantly react to this)
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
        <div className="fixed inset-0 z-[300] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 select-none">
            <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden relative">
                
                {/* 1. Header Bar */}
                <div className="px-6 py-3.5 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                            <BookOpen size={16} />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 block leading-tight">
                                {lang === 'sv' ? "Instruktionsgenomgång" : "Instruction Walkthrough"}
                            </span>
                            <h3 className="text-sm font-black text-white truncate leading-tight">
                                {sheetTitle || (lang === 'sv' ? "Genomgång" : "Presentation")}
                            </h3>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Slide Counter Indicator */}
                        {localSlides.length > 1 && (
                            <div className="text-[11px] font-black text-slate-400 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                                {currentSlideIndex + 1} / {localSlides.length}
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* 2. Main 16:9 Presentation Viewport */}
                <div className="flex-1 bg-slate-950 p-4 sm:p-6 flex items-center justify-center relative overflow-hidden min-h-0">
                    
                    {/* Navigation Arrows */}
                    {localSlides.length > 1 && (
                        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-30">
                            <button
                                type="button"
                                onClick={handlePrev}
                                disabled={currentSlideIndex === 0}
                                className="w-11 h-11 rounded-xl bg-slate-900/90 text-white border border-slate-700 hover:bg-indigo-600 disabled:opacity-0 disabled:pointer-events-none pointer-events-auto flex items-center justify-center transition-all shadow-lg cursor-pointer"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={isLastSlide}
                                className="w-11 h-11 rounded-xl bg-slate-900/90 text-white border border-slate-700 hover:bg-indigo-600 disabled:opacity-0 disabled:pointer-events-none pointer-events-auto flex items-center justify-center transition-all shadow-lg cursor-pointer"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    )}

                    {/* Exact 16:9 Presentation Viewer Core */}
                    <div className="w-full h-full max-w-[1400px] max-h-[787px] flex items-center justify-center">
                        <SlideViewerCore
                            slide={currentSlide}
                            livePacket={localPacket} // 🟢 Pass local packet here!
                            lang={lang}
                            bgType="blank"
                            globalZoom={1.2}
                            authorMode={false}
                            slideRendererProps={{
                                clueViewMode: 'steps',
                                currentFocusedQuestion: null,
                                coachProps: {},
                                onSpotlight: () => {},
                                onRegenerate: handleRegenerate, // 🟢 Inject real function
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
                    <div className="absolute inset-0 bg-slate-950/20 z-[350] flex flex-col items-center justify-center pointer-events-none">
                        <div className="bg-slate-900 text-white px-4 py-2 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2">
                            <RefreshCw size={16} className="animate-spin text-indigo-400" />
                            <span className="text-xs font-black tracking-widest uppercase">{lang === 'sv' ? "Hämtar..." : "Loading..."}</span>
                        </div>
                    </div>
                )}

                {/* 3. Bottom Action Bar */}
                <div className="px-6 py-3.5 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between shrink-0">
                    <div>
                        {localSlides.length > 1 && !isLastSlide && (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                            >
                                {lang === 'sv' ? "Nästa slide ➡" : "Next Slide ➡"}
                            </button>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onCompleteAndAdvance}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-900/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                        <Check size={16} strokeWidth={3} />
                        <span>{lang === 'sv' ? "Klar! Gå till övning ➡" : "Done! Go to practice ➡"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}