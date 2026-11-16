// src/components/live/teacher/components/CanvasSpotlightModal.jsx
import React from 'react';
import { X } from 'lucide-react';
import SlideRenderer from '../../../shared/SlideRenderer';
import InteractiveCanvas from '../../../whiteboard/InteractiveCanvas';

export default function CanvasSpotlightModal({
    spotlight,
    livePacket,
    activeSlide,
    globalZoom = 1.0,
    isAnonymous = true,
    onClose,
    lang = 'sv'
}) {
    if (!spotlight) return null;

    return (
        <div 
            onClick={onClose} 
            className="fixed inset-0 z-[300] bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150 select-none font-sans"
        >
            <div 
                onClick={(e) => e.stopPropagation()} 
                className="bg-[var(--bg-card)] text-[var(--text-main)] w-full max-w-5xl h-auto max-h-[90vh] rounded-2xl shadow-2xl border border-[var(--border-strong)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-[var(--border-main)] flex justify-between items-center bg-[var(--bg-surface)] shrink-0 shadow-2xs">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-extrabold tracking-tight text-[var(--text-main)] uppercase">
                            {isAnonymous ? (lang === 'sv' ? "Elevlösning" : "Student Solution") : spotlight.student_alias}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider ${
                            spotlight.is_correct 
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        }`}>
                            {spotlight.answer}
                        </span>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose} 
                        className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer border border-[var(--border-main)] shadow-2xs"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Canvas Spotlight Viewport */}
                <div className="p-6 flex-1 flex items-center justify-center bg-[var(--bg-canvas)] min-h-0">
                    <div className="w-full aspect-video max-h-[70vh] bg-[var(--bg-surface)] rounded-2xl shadow-inner border border-[var(--border-strong)] overflow-hidden relative flex">
                        <div className="absolute inset-0 pointer-events-none opacity-80">
                            <SlideRenderer
                                activeIds={activeSlide?.activeIds || []}
                                livePacket={livePacket}
                                lang={lang}
                                authorMode={false}
                                globalZoom={globalZoom}
                                sizeClasses={{ 
                                    desc: 'text-base', 
                                    latex: 'text-xl', 
                                    clue: 'text-sm', 
                                    headerText: 'text-lg', 
                                    visualClass: 'scale-100 max-h-[180px] mb-2' 
                                }}
                            />
                        </div>
                        <div className="absolute inset-0 pointer-events-none">
                            <InteractiveCanvas
                                elements={spotlight.canvas_state}
                                readOnly={true}
                                toolbarMode="none"
                                resolution={{ w: 1920, h: 1080 }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}