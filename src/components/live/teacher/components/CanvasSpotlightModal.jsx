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
            className="fixed inset-0 z-[500] bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-200"
        >
            <div 
                onClick={(e) => e.stopPropagation()} 
                className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-black uppercase text-slate-800 dark:text-white">
                            {isAnonymous ? (lang === 'sv' ? "Elevlösning" : "Student Solution") : spotlight.student_alias}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            spotlight.is_correct ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                            {spotlight.answer}
                        </span>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 flex-1 flex items-center justify-center bg-slate-100 dark:bg-slate-950/40 min-h-0">
                    <div className="w-full aspect-video max-h-[70vh] bg-[#f9fbf7] rounded-2xl shadow-lg border border-slate-300 dark:border-slate-700 overflow-hidden relative">
                        <div className="absolute inset-0 pointer-events-none">
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