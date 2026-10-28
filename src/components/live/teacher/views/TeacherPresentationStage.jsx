// src/components/live/teacher/views/TeacherPresentationStage.jsx
import React, { useState } from 'react';
import { 
    ChevronLeft, ChevronRight, Monitor, RefreshCw, 
    PanelRightClose, PanelRightOpen, Star, Users 
} from 'lucide-react';
import SlideViewerCore from '../../../shared/SlideViewerCore';
import StudentWorkCardGrid from '../components/StudentWorkCardGrid';
import ClassMatrixTable from '../components/ClassMatrixTable';
import { supabase } from '../../../../lib/supabaseClient';
import { syncProgress } from '../../../../lib/progressSync';

export default function TeacherPresentationStage({
    engine,
    session,
    lang = 'sv',
    onOpenZoom,
    onOpenSpotlight
}) {
    const slides = session?.active_question_data?.slides || [];
    const globalZoom = session?.active_question_data?.settings?.globalZoom || 1.0;

    const [activeSlideIndex, setActiveSlideIndex] = useState(session?.current_slide_index || 0);
    const [isMatrixCollapsed, setIsMatrixCollapsed] = useState(false);
    const [drawerTab, setDrawerTab] = useState('work');
    const [bgType, setBgType] = useState(session?.active_question_data?.settings?.bgType || 'blank');
    const [liveSlides, setLiveSlides] = useState(
        slides.length > 0
            ? slides
            : [{ id: `slide_${Date.now()}`, elements: [], scrollX: 0, scrollY: 0, title: 'Slide 1', activeIds: [] }]
    );

    const handleSlideChange = async (newIdx) => {
        if (newIdx < 0 || newIdx >= liveSlides.length) return;
        setActiveSlideIndex(newIdx);
        syncProgress('live_slide_changed', { app_mode: 'teacher_live', target_slide_index: newIdx });
        try {
            await supabase.from('rooms').update({ current_slide_index: newIdx }).eq('id', session.id);
        } catch (err) {
            console.error("Failed to sync slide index:", err);
        }
    };

    const updateCurrentSlideElements = (action) => {
        setLiveSlides(prev => {
            const next = [...prev];
            const current = next[activeSlideIndex]?.elements || [];
            next[activeSlideIndex] = {
                ...next[activeSlideIndex],
                elements: typeof action === 'function' ? action(current) : action
            };
            return next;
        });
    };

    const handleNewSlideRound = async () => {
        const confirmMsg = lang === 'sv'
            ? "Detta startar en ny runda och rensar alla elevers inskickade tavlor för denna slide. Fortsätt?"
            : "This starts a new round and resets all student canvas submissions for this slide. Continue?";
        if (!window.confirm(confirmMsg)) return;

        engine.setIsRegenerating(true);
        try {
            const nextTimestamp = Date.now();
            const updated = liveSlides.map((s, idx) => idx === activeSlideIndex ? { ...s, promptVersion: nextTimestamp } : s);

            await supabase.from('rooms').update({
                active_question_data: { ...session.active_question_data, slides: updated }
            }).eq('id', session.id);

            await supabase.from('responses').delete()
                .eq('room_id', session.id)
                .eq('question_index', activeSlideIndex);

            setLiveSlides(updated);
            engine.setResponses(prev => prev.filter(r => r.question_index !== activeSlideIndex));
            engine.setStarredStudents([]);
        } catch (err) {
            console.error(err);
        } finally {
            engine.setIsRegenerating(false);
        }
    };

    // 🟢 Restored slide-scoping calculation from original monolith (lines 323-340)
    const activePacketIndices = React.useMemo(() => {
        const currentSlideObj = liveSlides[activeSlideIndex];
        if (!currentSlideObj) return engine.livePacket.map((_, idx) => idx);

        const pinnedIds = currentSlideObj.activeIds || [];
        const matched = engine.livePacket.reduce((acc, q, idx) => {
            if (pinnedIds.includes(q.id)) acc.push(idx);
            return acc;
        }, []);

        // If slide has no question cards, treat active slide itself as single column index
        if (matched.length === 0) {
            return [activeSlideIndex];
        }

        return matched;
    }, [liveSlides, activeSlideIndex, engine.livePacket]);

    const activeIds = liveSlides[activeSlideIndex]?.activeIds || [];

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full max-w-[2000px] w-full mx-auto">
            {/* LEFT: Slide Viewer / Teleprompter */}
            <div className={`flex flex-col gap-4 transition-all duration-500 ease-in-out ${isMatrixCollapsed ? 'w-full lg:w-[calc(100%-80px)]' : 'w-full lg:w-5/12 xl:w-1/2'}`}>
                <div className="flex justify-between items-center bg-[var(--bg-card,#0f172a)] px-3 py-2 rounded-xl shadow-xs border border-[var(--border-main,#1e293b)] shrink-0">
                    <button 
                        type="button" 
                        onClick={() => handleSlideChange(activeSlideIndex - 1)} 
                        disabled={activeSlideIndex === 0} 
                        className="p-1.5 bg-[var(--bg-surface,#1e293b)] hover:bg-indigo-600/20 text-slate-400 hover:text-indigo-300 rounded-lg disabled:opacity-30 transition-all cursor-pointer"
                    >
                        <ChevronLeft size={16}/>
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="text-[11px] font-black uppercase tracking-widest text-[var(--text-main,#f8fafc)] flex items-center gap-1.5">
                            <Monitor size={14} className="text-indigo-400" />
                            {liveSlides[activeSlideIndex]?.title || `Slide ${activeSlideIndex + 1}`}
                            <span className="opacity-50">({activeSlideIndex + 1} / {liveSlides.length})</span>
                        </div>

                        {activeIds.length > 0 ? (
                            <button
                                type="button"
                                onClick={() => engine.handleRegenerateQuestion(activeSlideIndex)}
                                disabled={engine.isRegenerating}
                                className="px-2.5 py-1 bg-indigo-950/40 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-900/50 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 active:scale-95 cursor-pointer"
                            >
                                <RefreshCw size={12} className={engine.isRegenerating ? "animate-spin" : ""} />
                                <span className="hidden sm:inline">{lang === 'sv' ? "Slumpa Ny" : "Regen"}</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleNewSlideRound}
                                disabled={engine.isRegenerating}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 active:scale-95 cursor-pointer"
                            >
                                <RefreshCw size={12} className={engine.isRegenerating ? "animate-spin" : ""} />
                                <span className="hidden sm:inline">{lang === 'sv' ? "Ny Omgång" : "New Round"}</span>
                            </button>
                        )}
                    </div>
                    
                    <button 
                        type="button"
                        onClick={() => handleSlideChange(activeSlideIndex + 1)} 
                        disabled={activeSlideIndex === liveSlides.length - 1} 
                        className="p-1.5 bg-[var(--bg-surface,#1e293b)] hover:bg-indigo-600/20 text-slate-400 hover:text-indigo-300 rounded-lg disabled:opacity-30 transition-all cursor-pointer"
                    >
                        <ChevronRight size={16}/>
                    </button>
                </div>

                <div className="relative w-full aspect-video flex-1 min-h-0">
                    <SlideViewerCore
                        slide={liveSlides[activeSlideIndex]}
                        livePacket={engine.livePacket}
                        lang={lang}
                        bgType={bgType}
                        globalZoom={globalZoom}
                        authorMode={false}
                        interactiveCanvasProps={{
                            key: liveSlides[activeSlideIndex]?.id || activeSlideIndex,
                            setElements: updateCurrentSlideElements,
                            onToggleBg: () => setBgType(prev => prev === 'blank' ? 'grid' : 'blank')
                        }}
                    />
                </div>
            </div>

            {/* RIGHT: Dual Drawer (Student Work vs Matrix) */}
            <div className={`bg-[var(--bg-card,#0f172a)] rounded-3xl shadow-xl border border-[var(--border-main,#1e293b)] overflow-hidden flex flex-col h-full transition-all duration-500 ease-in-out shrink-0 ${
                isMatrixCollapsed ? 'w-full lg:w-[64px] bg-[var(--bg-surface,#1e293b)]' : 'w-full lg:w-7/12 xl:w-1/2'
            }`}>
                {isMatrixCollapsed ? (
                    <div 
                        className="w-full h-full flex flex-col items-center justify-start py-6 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                        onClick={() => setIsMatrixCollapsed(false)}
                        title={lang === 'sv' ? "Visa Elevsvar" : "Show Student Work"}
                    >
                        <PanelRightOpen size={20} className="shrink-0 mb-8" />
                        <div className="flex items-center gap-3 opacity-60" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                                {lang === 'sv' ? "Elevsvar" : "Student Work"} ({engine.students.length})
                            </span>
                            <Users size={14} className="rotate-90" />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="p-3 border-b border-[var(--border-main,#1e293b)] flex justify-between items-center bg-[var(--bg-surface,#1e293b)] shrink-0 gap-2">
                            <div className="flex items-center gap-1.5">
                                <button 
                                    type="button"
                                    onClick={() => setIsMatrixCollapsed(true)}
                                    className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-md transition-colors cursor-pointer"
                                >
                                    <PanelRightClose size={16} />
                                </button>
                                
                                <div className="flex bg-[var(--bg-card,#0f172a)] p-0.5 rounded-lg border border-[var(--border-main,#1e293b)]">
                                    <button
                                        type="button"
                                        onClick={() => setDrawerTab('work')}
                                        className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                            drawerTab === 'work' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                    >
                                        {lang === 'sv' ? "Elevlösningar" : "Student Work"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDrawerTab('matrix')}
                                        className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                            drawerTab === 'matrix' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                    >
                                        {lang === 'sv' ? "Klassmatris" : "Matrix"}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {engine.starredStudents.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const targetQId = activeIds[0];
                                            const packetIdx = engine.livePacket.findIndex(p => p.id === targetQId);
                                            if (packetIdx !== -1) onOpenZoom(packetIdx);
                                            engine.setIsComparing(true);
                                        }}
                                        className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-amber-950 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                                    >
                                        <Star size={12} className="fill-amber-950" />
                                        <span>{lang === 'sv' ? `Jämför (${engine.starredStudents.length})` : `Compare (${engine.starredStudents.length})`}</span>
                                    </button>
                                )}

                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-[var(--bg-card,#0f172a)] px-2.5 py-1 rounded-md border border-[var(--border-main,#1e293b)]">
                                    {engine.students.length} {lang === 'sv' ? "Elever" : "Students"}
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1 p-3">
                            {drawerTab === 'matrix' ? (
                                <ClassMatrixTable
                                    engine={engine}
                                    session={session}
                                    activeIndices={activePacketIndices}
                                    onOpenZoom={onOpenZoom}
                                    onOpenSpotlight={onOpenSpotlight}
                                    onOpenFreeText={onOpenZoom}
                                    onKick={engine.handleKickStudent}
                                    lang={lang}
                                />
                            ) : (
                                <StudentWorkCardGrid
                                    engine={engine}
                                    session={session}
                                    targetIndex={activeSlideIndex}
                                    isSlideMode={true}
                                    onOpenSpotlight={onOpenSpotlight}
                                    lang={lang}
                                />
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}