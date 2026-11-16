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

    // Telemetry: New Slide Round (clears manipulative boards)
    const handleNewSlideRound = async () => {
        const confirmMsg = lang === 'sv' ? "Detta startar en ny runda och rensar alla elevers inskickade tavlor för denna slide. Fortsätt?" : "Reset student boards for this slide?";
        if (!window.confirm(confirmMsg)) return;
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

    // Telemetry: Regenerate Slide Questions
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
        <div className="flex flex-col lg:flex-row gap-5 h-full max-w-[2000px] w-full mx-auto font-sans text-[var(--text-main)]">
            {/* Left Teleprompter Viewport */}
            <div className={`flex flex-col gap-3 transition-all duration-300 ease-in-out ${isMatrixCollapsed ? 'w-full lg:w-[calc(100%-60px)]' : 'w-full lg:w-5/12 xl:w-1/2'}`}>
                <div className="flex justify-between items-center bg-[var(--bg-card)] px-4 py-2.5 rounded-xl shadow-2xs border border-[var(--border-strong)] shrink-0">
                    <button 
                        type="button" 
                        onClick={() => handleSlideChange(activeSlideIndex - 1)} 
                        disabled={activeSlideIndex === 0} 
                        className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-lg disabled:opacity-30 transition-colors cursor-pointer border border-[var(--border-main)]"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <div className="flex items-center gap-3">
                        <span className="text-xs font-extrabold uppercase tracking-tight text-[var(--text-main)] flex items-center gap-2">
                            <Monitor size={15} className="text-emerald-600 dark:text-emerald-400" />
                            <span>{liveSlides[activeSlideIndex]?.title || `Slide ${activeSlideIndex + 1}`}</span>
                            <span className="text-[var(--text-muted)] font-mono">({activeSlideIndex + 1} / {liveSlides.length})</span>
                        </span>

                        {(liveSlides[activeSlideIndex]?.activeIds || []).length > 0 ? (
                            <button
                                type="button"
                                onClick={handleRegenerateSlide}
                                disabled={isRegenerating}
                                className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-2xs disabled:opacity-50 active:scale-[0.98] cursor-pointer"
                            >
                                <RefreshCw size={13} className={isRegenerating ? "animate-spin" : ""} />
                                <span className="hidden sm:inline">{lang === 'sv' ? "Slumpa Ny" : "Regen"}</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleNewSlideRound}
                                disabled={isRegenerating}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-2xs disabled:opacity-50 active:scale-[0.98] cursor-pointer"
                            >
                                <RefreshCw size={13} className={isRegenerating ? "animate-spin" : ""} />
                                <span className="hidden sm:inline">{lang === 'sv' ? "Ny Omgång" : "New Round"}</span>
                            </button>
                        )}
                    </div>

                    <button 
                        type="button"
                        onClick={() => handleSlideChange(activeSlideIndex + 1)} 
                        disabled={activeSlideIndex === liveSlides.length - 1} 
                        className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-lg disabled:opacity-30 transition-colors cursor-pointer border border-[var(--border-main)]"
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
            <div className={`bg-[var(--bg-card)] rounded-2xl shadow-xl border border-[var(--border-strong)] overflow-hidden flex flex-col h-full transition-all duration-300 ease-in-out shrink-0 ${
                isMatrixCollapsed ? 'w-full lg:w-[60px] bg-[var(--bg-surface)]' : 'w-full lg:w-7/12 xl:w-1/2'
            }`}>
                {isMatrixCollapsed ? (
                    <div 
                        role="button"
                        tabIndex={0}
                        className="w-full h-full flex flex-col items-center justify-start py-6 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                        onClick={() => setIsMatrixCollapsed(false)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsMatrixCollapsed(false); }}
                        title={lang === 'sv' ? "Visa Elevsvar" : "Show Student Work"}
                    >
                        <PanelRightOpen size={18} className="shrink-0 mb-8" />
                        <div className="flex items-center gap-3 opacity-70 font-sans" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                            <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                                {lang === 'sv' ? "Elevsvar" : "Student Work"} ({students.length})
                            </span>
                            <Users size={14} className="rotate-90" />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="p-3 border-b border-[var(--border-main)] flex justify-between items-center bg-[var(--bg-surface)] shrink-0 gap-2">
                            <div className="flex items-center gap-2">
                                <button 
                                    type="button"
                                    onClick={() => setIsMatrixCollapsed(true)}
                                    className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-xl hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
                                >
                                    <PanelRightClose size={16} />
                                </button>
                                
                                <div className="flex bg-[var(--bg-card)] p-0.5 rounded-xl border border-[var(--border-main)] shadow-2xs">
                                    <button
                                        type="button"
                                        onClick={() => setDrawerTab('work')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                            drawerTab === 'work' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                        }`}
                                    >
                                        {lang === 'sv' ? "Elevlösningar" : "Student Work"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDrawerTab('matrix')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                            drawerTab === 'matrix' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                        }`}
                                    >
                                        {lang === 'sv' ? "Klassmatris" : "Matrix"}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5">
                                {starredStudents.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            syncProgress('live_comparison_opened', { app_mode: 'teacher_live', compared_count: starredStudents.length });
                                            setIsComparing(true);
                                            const targetQId = liveSlides[activeSlideIndex]?.activeIds?.[0];
                                            const pIdx = livePacket.findIndex(p => p.id === targetQId);
                                            if (pIdx !== -1) onOpenZoom(pIdx);
                                        }}
                                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-[0.98]"
                                    >
                                        <Star size={13} className="fill-white" />
                                        <span>{lang === 'sv' ? `Jämför (${starredStudents.length})` : `Compare (${starredStudents.length})`}</span>
                                    </button>
                                )}

                                <div className="text-[10px] font-bold font-mono text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-card)] px-3 py-1.5 rounded-xl border border-[var(--border-main)] shadow-2xs">
                                    {students.length} {lang === 'sv' ? "Elever" : "Students"}
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1 p-4 bg-[var(--bg-card)]">
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