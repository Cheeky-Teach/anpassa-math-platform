// src/components/live/teacher/views/TeacherPresentationView.jsx
import React, { useState } from 'react';
import { 
    ChevronLeft, ChevronRight, Monitor, RefreshCw, PanelRightOpen, 
    PanelRightClose, Star, Users 
} from 'lucide-react';
import SlideViewerCore from '../../../shared/SlideViewerCore';
import ClassMatrixTable from '../components/ClassMatrixTable';
import StudentWorkCardGrid from '../components/StudentWorkCardGrid';
import { supabase } from '../../../../lib/supabaseClient';
import { syncProgress, syncBatchProgress } from '../../../../lib/progressSync';

export default function TeacherPresentationView({
    engine,
    session,
    lang = 'sv',
    onOpenZoom,
    onOpenSpotlight,
    onOpenFreeText
}) {
    const {
        livePacket, setLivePacket,
        responses, setResponses,
        students,
        starredStudents, setStarredStudents,
        toggleStar,
        setIsComparing,
        isAnonymous,
        handleKickStudent
    } = engine;

    const slides = session?.active_question_data?.slides || [];
    const globalZoom = session?.active_question_data?.settings?.globalZoom || 1.0;
    const [activeSlideIndex, setActiveSlideIndex] = useState(session?.current_slide_index || 0);
    const [isMatrixCollapsed, setIsMatrixCollapsed] = useState(true);
    const [drawerTab, setDrawerTab] = useState('work'); // 'work' | 'matrix'
    const [isRegenerating, setIsRegenerating] = useState(false);

    const [liveSlides, setLiveSlides] = useState(
        slides.length > 0 ? slides : [{ id: `slide_${Date.now()}`, elements: [], title: 'Slide 1', activeIds: [] }]
    );
    const [bgType, setBgType] = useState(session?.active_question_data?.settings?.bgType || 'blank');

    const handleSlideChange = async (newIdx) => {
        setActiveSlideIndex(newIdx);
        syncProgress('live_slide_changed', { app_mode: 'teacher_live', target_slide_index: newIdx });
        try {
            await supabase.from('rooms').update({ current_slide_index: newIdx }).eq('id', session.id);
        } catch (err) {
            console.error("Slide change error:", err);
        }
    };

    // 🟢 Telemetry: New Slide Round (clears manipulative boards)
    const handleNewSlideRound = async () => {
        if (!window.confirm(lang === 'sv' ? "Detta startar en ny runda och rensar alla elevers inskickade tavlor för denna slide. Fortsätt?" : "Reset student boards for this slide?")) return;
        setIsRegenerating(true);
        try {
            syncProgress('live_new_slide_round', { app_mode: 'teacher_live', slide_index: activeSlideIndex });
            const nextTimestamp = Date.now();
            const updatedSlides = liveSlides.map((s, idx) => idx === activeSlideIndex ? { ...s, promptVersion: nextTimestamp } : s);

            await supabase.from('rooms').update({ active_question_data: { ...session.active_question_data, slides: updatedSlides } }).eq('id', session.id);
            await supabase.from('responses').delete().eq('room_id', session.id).eq('question_index', activeSlideIndex);

            setLiveSlides(updatedSlides);
            setResponses(prev => prev.filter(r => r.question_index !== activeSlideIndex));
            setStarredStudents([]);
        } finally {
            setIsRegenerating(false);
        }
    };

    // 🟢 Telemetry: Regenerate Slide Questions
    const handleRegenerateSlide = async () => {
        const activeIds = liveSlides[activeSlideIndex]?.activeIds || [];
        if (activeIds.length === 0) return;

        const activeItems = activeIds.map(id => {
            const index = livePacket.findIndex(p => p.id === id);
            return { item: livePacket[index], index };
        }).filter(obj => obj.item);

        const activeIndices = activeItems.map(obj => obj.index);
        const hasExisting = responses.some(r => activeIndices.includes(r.question_index));

        if (hasExisting && !window.confirm(lang === 'sv' ? "Det finns redan svar inskickade. Nya tal raderar tidigare svar. Fortsätt?" : "Existing responses will be deleted. Continue?")) return;

        setIsRegenerating(true);
        try {
            syncBatchProgress('live_question_regenerated', activeItems.map(obj => obj.item), { app_mode: 'teacher_live' });

            const updatedItems = await Promise.all(activeItems.map(async ({ item }) => {
                if (item.answerType === 'free_text' || (!item.topicId && !item.variationKey)) {
                    return { ...item, regenVersion: Date.now() };
                }
                const isItemWP = item.selectedStoryIndex !== null && item.selectedStoryIndex !== undefined;
                const res = await fetch(`/api/question?topic=${item.topicId}&variation=${item.variationKey}&lang=${lang}&wordProblem=${isItemWP}`);
                const data = await res.json();
                return { ...item, resolvedData: data, regenVersion: Date.now() };
            }));

            const newPacket = [...livePacket];
            activeItems.forEach((obj, i) => { newPacket[obj.index] = updatedItems[i]; });

            await supabase.from('rooms').update({ active_question_data: { ...session.active_question_data, packet: newPacket } }).eq('id', session.id);
            if (hasExisting) {
                await supabase.from('responses').delete().eq('room_id', session.id).in('question_index', activeIndices);
            }

            setLivePacket(newPacket);
            setResponses(prev => prev.filter(r => !activeIndices.includes(r.question_index)));
        } finally {
            setIsRegenerating(false);
        }
    };

    const activePacketIndices = React.useMemo(() => {
        const pinnedIds = slides[activeSlideIndex]?.activeIds || [];
        const matched = livePacket.reduce((acc, q, idx) => {
            if (pinnedIds.includes(q.id)) acc.push(idx);
            return acc;
        }, []);
        return matched.length === 0 ? [activeSlideIndex] : matched;
    }, [slides, activeSlideIndex, livePacket]);

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full max-w-[2000px] w-full mx-auto">
            {/* Left Teleprompter Viewport */}
            <div className={`flex flex-col gap-4 transition-all duration-500 ease-in-out ${isMatrixCollapsed ? 'w-full lg:w-[calc(100%-80px)]' : 'w-full lg:w-5/12 xl:w-1/2'}`}>
                <div className="flex justify-between items-center bg-[var(--bg-card)] px-3 py-2 rounded-xl shadow-xs border border-[var(--border-main)] shrink-0">
                    <button 
                        onClick={() => handleSlideChange(activeSlideIndex - 1)} 
                        disabled={activeSlideIndex === 0} 
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <div className="flex items-center gap-3">
                        <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-main)] flex items-center gap-1.5">
                            <Monitor size={14} className="text-indigo-500" />
                            {liveSlides[activeSlideIndex]?.title || `Slide ${activeSlideIndex + 1}`} ({activeSlideIndex + 1} / {liveSlides.length})
                        </span>

                        {(liveSlides[activeSlideIndex]?.activeIds || []).length > 0 ? (
                            <button
                                onClick={handleRegenerateSlide}
                                disabled={isRegenerating}
                                className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md text-[9px] font-black uppercase flex items-center gap-1 cursor-pointer"
                            >
                                <RefreshCw size={11} className={isRegenerating ? "animate-spin" : ""} />
                                <span>Slumpa Ny</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleNewSlideRound}
                                disabled={isRegenerating}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-[9px] font-black uppercase flex items-center gap-1 cursor-pointer"
                            >
                                <RefreshCw size={11} className={isRegenerating ? "animate-spin" : ""} />
                                <span>Ny Omgång</span>
                            </button>
                        )}
                    </div>

                    <button 
                        onClick={() => handleSlideChange(activeSlideIndex + 1)} 
                        disabled={activeSlideIndex === liveSlides.length - 1} 
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>

                <div className="relative w-full aspect-video flex-1 min-h-0">
                    <SlideViewerCore
                        slide={liveSlides[activeSlideIndex]}
                        livePacket={livePacket}
                        lang={lang}
                        bgType={bgType}
                        globalZoom={globalZoom}
                        authorMode={false}
                        interactiveCanvasProps={{
                            key: liveSlides[activeSlideIndex]?.id || activeSlideIndex,
                            setElements: (action) => {
                                setLiveSlides(prev => {
                                    const next = [...prev];
                                    const curr = next[activeSlideIndex]?.elements || [];
                                    next[activeSlideIndex] = { ...next[activeSlideIndex], elements: typeof action === 'function' ? action(curr) : action };
                                    return next;
                                });
                            },
                            onToggleBg: () => setBgType(prev => prev === 'blank' ? 'grid' : 'blank')
                        }}
                    />
                </div>
            </div>

            {/* Right Drawer (Work or Matrix) */}
            <div className={`bg-[var(--bg-card)] rounded-3xl shadow-xl border border-[var(--border-main)] overflow-hidden flex flex-col h-full transition-all duration-500 shrink-0 ${
                isMatrixCollapsed ? 'w-full lg:w-[64px]' : 'w-full lg:w-7/12 xl:w-1/2'
            }`}>
                {isMatrixCollapsed ? (
                    <div 
                        onClick={() => setIsMatrixCollapsed(false)} 
                        className="w-full h-full flex flex-col items-center justify-start py-6 cursor-pointer text-slate-400 hover:text-white"
                    >
                        <PanelRightOpen size={20} className="mb-8" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                            Elevsvar ({students.length})
                        </span>
                    </div>
                ) : (
                    <>
                        <div className="p-3 border-b border-[var(--border-main)] flex justify-between items-center bg-[var(--bg-surface)] shrink-0">
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsMatrixCollapsed(true)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                                    <PanelRightClose size={16} />
                                </button>
                                <div className="flex bg-[var(--bg-card)] p-0.5 rounded-lg border border-[var(--border-main)]">
                                    <button 
                                        onClick={() => setDrawerTab('work')} 
                                        className={`px-3 py-1 rounded-md text-[10px] font-black uppercase cursor-pointer ${drawerTab === 'work' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                                    >
                                        Elevlösningar
                                    </button>
                                    <button 
                                        onClick={() => setDrawerTab('matrix')} 
                                        className={`px-3 py-1 rounded-md text-[10px] font-black uppercase cursor-pointer ${drawerTab === 'matrix' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                                    >
                                        Klassmatris
                                    </button>
                                </div>
                            </div>

                            {starredStudents.length > 0 && (
                                <button 
                                    onClick={() => {
                                        syncProgress('live_comparison_opened', { app_mode: 'teacher_live', compared_count: starredStudents.length });
                                        setIsComparing(true);
                                        const targetQId = liveSlides[activeSlideIndex]?.activeIds?.[0];
                                        const pIdx = livePacket.findIndex(p => p.id === targetQId);
                                        if (pIdx !== -1) onOpenZoom(pIdx);
                                    }}
                                    className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer"
                                >
                                    <Star size={12} className="fill-slate-950" />
                                    Jämför ({starredStudents.length})
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                            {drawerTab === 'matrix' ? (
                                <ClassMatrixTable
                                    engine={engine}
                                    activeIndices={activePacketIndices}
                                    onOpenZoom={onOpenZoom}
                                    onOpenSpotlight={onOpenSpotlight}
                                    onOpenFreeText={onOpenFreeText}
                                    onKick={handleKickStudent}
                                    activeSlideIndex={activeSlideIndex}
                                    lang={lang}
                                />
                            ) : (
                                <StudentWorkCardGrid
                                    responses={responses.filter(r => activePacketIndices.includes(r.question_index) || (r.is_slide_submission && r.question_index === activeSlideIndex))}
                                    livePacket={livePacket}
                                    activeSlide={liveSlides[activeSlideIndex]}
                                    globalZoom={globalZoom}
                                    isAnonymous={isAnonymous}
                                    starredStudents={starredStudents}
                                    onToggleStar={toggleStar}
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