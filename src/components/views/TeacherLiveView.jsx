// src/components/views/TeacherLiveView.jsx
import React, { useState } from 'react';
import { useTeacherSessionState } from '../live/core/useTeacherSessionState';
import ClassMatrixTable from '../live/teacher/components/ClassMatrixTable';
import QuestionZoomOverlay from '../live/teacher/components/QuestionZoomOverlay';
import EndSessionModal from '../live/teacher/components/EndSessionModal';
import PreferencesToggle from '../ui/PreferencesToggle';
import CapacityModal from '../modals/CapacityModal';
import CanvasSpotlightModal from '../live/teacher/components/CanvasSpotlightModal';
import TeacherPresentationStage from '../live/teacher/views/TeacherPresentationStage';
import FreeTextReviewModal from '../live/teacher/components/FreeTextReviewModal';
import LandscapeReport from '../reports/LandscapeReport';
import { 
    RefreshCw, Users, Shield, Eye, EyeOff,
    ArrowDownAZ, ListOrdered, Shuffle, ChevronDown
} from 'lucide-react';
import { syncProgress } from '../../lib/progressSync';

// Activities
import CategoryClashEngine from '../activities/engines/CategoryClashEngine';

export default function TeacherLiveView({ 
    session, 
    packet, 
    lang = 'sv', 
    onEnd, 
    onKick, 
    teacherClassCode 
}) {
    const engine = useTeacherSessionState({ session, packet, lang, onKick, onEnd });
    
    const [zoomIndex, setZoomIndex] = useState(null);
    const [showCapacityModal, setShowCapacityModal] = useState(false);
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
    const [showEndModal, setShowEndModal] = useState(false);
    const [canvasSpotlight, setCanvasSpotlight] = useState(null);
    const [freeTextResponse, setFreeTextResponse] = useState(null);
    const [showPrintReport, setShowPrintReport] = useState(false);

    //detect mode
    const currentMode = session?.active_question_data?.mode || 'worksheet';
    const isActivityMode = currentMode.startsWith('activity_');
    const isPresentationMode = session?.active_question_data?.mode === 'presentation';

    if (isActivityMode) {
        return (
            <CategoryClashEngine
                session={session}
                isLiveHost={true}
                initialConfig={session?.active_question_data?.settings}
                onClose={onEndSession}
                lang={lang}
            />
        );
    }

    const handleOpenZoom = (qIdx) => {
        const target = engine.livePacket[qIdx];
        syncProgress('live_question_zoomed', {
            app_mode: 'teacher_live',
            question_index: qIdx,
            topic: target?.topicId || 'unknown',
            level: target?.resolvedData?.level || target?.metadata?.difficulty || 1,
            answer_type: target?.answerType || 'unknown'
        });
        setZoomIndex(qIdx);
    };

    const applySort = (mode) => {
        if (mode === 'random') {
            const uniqueStudents = [...new Set(engine.responses.map(r => r.student_alias))];
            engine.setRandomizedStudents(uniqueStudents.sort(() => Math.random() - 0.5));
        }
        engine.setSortMode(mode);
        setIsSortMenuOpen(false);
    };

    

    return (
        <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-main)] flex flex-col font-sans select-none transition-colors duration-200">
            {/* Header Bar */}
            <header className="bg-[var(--bg-card)] border-b border-[var(--border-main)] px-4 py-2 sticky top-0 z-40 flex items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-[var(--bg-surface)] border border-[var(--border-main)] px-2.5 py-1 rounded-lg text-center shadow-xs">
                        <span className="text-[7px] font-black uppercase text-[var(--text-muted)] block leading-none">
                            {lang === 'sv' ? "KOD" : "CODE"}
                        </span>
                        <span className="text-sm font-black italic text-[var(--text-main)]">{session.class_code}</span>
                    </div>
                    <div>
                        <h1 className="text-xs font-black uppercase tracking-tight text-[var(--text-main)]">{session.title}</h1>
                        <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase">
                            {lang === 'sv' ? "Live Lektion" : "Live Lesson"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <PreferencesToggle />
                    
                    {/* Refresh Sync */}
                    <button 
                        type="button"
                        onClick={engine.syncData} 
                        disabled={engine.isSyncing} 
                        className="p-1.5 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-md text-[var(--text-muted)] hover:text-indigo-500 hover:bg-[var(--bg-surface-hover)] transition-all shadow-xs cursor-pointer"
                        title={lang === 'sv' ? "Uppdatera" : "Sync"}
                    >
                        <RefreshCw size={13} className={engine.isSyncing ? 'animate-spin' : ''} />
                    </button>

                    {/* Capacity Button */}
                    <button 
                        type="button"
                        onClick={() => setShowCapacityModal(true)} 
                        className="p-1.5 px-2.5 rounded-lg border border-[var(--border-main)] bg-[var(--bg-surface)] text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        title={lang === 'sv' ? "Platser" : "Capacity"}
                    >
                        <Users size={13} className="text-indigo-500" /> 
                        <span>{engine.students.length}</span>
                    </button>

                    {/* Sort Menu */}
                    <div className="relative">
                        <button 
                            type="button"
                            onClick={() => setIsSortMenuOpen(!isSortMenuOpen)} 
                            title={lang === 'sv' ? "Sortera elever" : "Sort students"} 
                            className="p-1.5 px-2 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-md text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                            {engine.sortMode === 'az' ? <ArrowDownAZ size={13} /> : engine.sortMode === 'progress' ? <ListOrdered size={13} /> : <Shuffle size={13} />}
                            <ChevronDown size={11} className="opacity-60" />
                        </button>

                        {isSortMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsSortMenuOpen(false)}></div>
                                <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl shadow-xl z-50 overflow-hidden py-1">
                                    <button 
                                        type="button"
                                        onClick={() => applySort('az')} 
                                        className={`w-full text-left px-4 py-2 hover:bg-[var(--bg-surface)] transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-wider cursor-pointer ${
                                            engine.sortMode === 'az' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10' : 'text-[var(--text-main)]'
                                        }`}
                                    >
                                        <ArrowDownAZ size={12} /> {lang === 'sv' ? "Namn (A-Ö)" : "Name (A-Z)"}
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => applySort('progress')} 
                                        className={`w-full text-left px-4 py-2 hover:bg-[var(--bg-surface)] transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-wider cursor-pointer ${
                                            engine.sortMode === 'progress' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10' : 'text-[var(--text-main)]'
                                        }`}
                                    >
                                        <ListOrdered size={12} /> {lang === 'sv' ? "Mest aktiva" : "Most Active"}
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => applySort('random')} 
                                        className={`w-full text-left px-4 py-2 hover:bg-[var(--bg-surface)] transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-wider cursor-pointer ${
                                            engine.sortMode === 'random' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10' : 'text-[var(--text-main)]'
                                        }`}
                                    >
                                        <Shuffle size={12} /> {lang === 'sv' ? "Slumpa" : "Shuffle"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Facit / Key */}
                    <button 
                        type="button"
                        onClick={() => engine.setShowActualAnswers(!engine.showActualAnswers)} 
                        className={`p-1.5 px-2.5 rounded-lg border font-bold text-xs transition-all cursor-pointer shadow-xs ${
                            engine.showActualAnswers 
                                ? 'bg-amber-500 text-amber-950 border-amber-600 shadow-amber-500/20' 
                                : 'bg-[var(--bg-surface)] text-[var(--text-main)] border-[var(--border-main)] hover:bg-[var(--bg-surface-hover)]'
                        }`}
                    >
                        <span className="text-[10px] font-black uppercase tracking-wider">{lang === 'sv' ? "Facit" : "Key"}</span>
                    </button>

                    {/* Anonymous Shield */}
                    <button 
                        type="button"
                        onClick={() => engine.setIsAnonymous(!engine.isAnonymous)} 
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer shadow-xs ${
                            engine.isAnonymous 
                                ? 'bg-indigo-600 text-white border-indigo-600' 
                                : 'bg-[var(--bg-surface)] text-[var(--text-main)] border-[var(--border-main)] hover:bg-[var(--bg-surface-hover)]'
                        }`}
                        title={lang === 'sv' ? "Anonymisera elever" : "Anonymize students"}
                    >
                        <Shield size={14} />
                    </button>

                    {/* Correctness Toggle */}
                    <button 
                        type="button"
                        onClick={() => engine.setHideCorrectness(!engine.hideCorrectness)} 
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer shadow-xs ${
                            engine.hideCorrectness 
                                ? 'bg-indigo-600 text-white border-indigo-600' 
                                : 'bg-[var(--bg-surface)] text-[var(--text-main)] border-[var(--border-main)] hover:bg-[var(--bg-surface-hover)]'
                        }`}
                        title={lang === 'sv' ? "Dölj rätt/fel färger" : "Hide correctness"}
                    >
                        {engine.hideCorrectness ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>

                    {/* End Session Button */}
                    <button 
                        type="button"
                        onClick={() => setShowEndModal(true)} 
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer transition-colors shadow-sm active:scale-95"
                    >
                        {lang === 'sv' ? "Avsluta" : "End"}
                    </button>
                </div>
            </header>

            {/* Stage Routing */}
            <main className="flex-1 overflow-auto p-4 sm:p-6 flex flex-col">
                {isPresentationMode ? (
                    <TeacherPresentationStage
                        engine={engine}
                        session={session}
                        lang={lang}
                        onOpenZoom={handleOpenZoom}
                        onOpenSpotlight={(resp) => setCanvasSpotlight(resp)}
                    />
                ) : (
                    <div className="w-full max-w-[1600px] mx-auto bg-[var(--bg-card)] rounded-3xl border border-[var(--border-main)] shadow-xl overflow-hidden flex flex-col">
                        <div className="overflow-x-auto custom-scrollbar">
                            <ClassMatrixTable
                                engine={engine}
                                session={session}
                                activeIndices={engine.livePacket.map((_, idx) => idx)}
                                onOpenZoom={handleOpenZoom}
                                onOpenSpotlight={(resp) => setCanvasSpotlight(resp)}
                                onOpenFreeText={(qIdx, student) => {
                                    const resp = engine.responses.find(r => r.student_alias === student && r.question_index === qIdx);
                                    if (resp) setFreeTextResponse(resp);
                                }}
                                onKick={engine.handleKickStudent}
                                lang={lang}
                            />
                        </div>
                    </div>
                )}
            </main>

            {/* Zoom Dialogue */}
            {zoomIndex !== null && (
                <QuestionZoomOverlay
                    engine={engine}
                    zoomIndex={zoomIndex}
                    session={session}
                    lang={lang}
                    onClose={() => setZoomIndex(null)}
                    onNavigateZoom={(idx) => handleOpenZoom(idx)}
                />
            )}

            {/* Free Text Modal */}
            <FreeTextReviewModal
                response={freeTextResponse}
                isAnonymous={engine.isAnonymous}
                onClose={() => setFreeTextResponse(null)}
                lang={lang}
            />

            {/* Landscape Print Report Modal */}
            {showPrintReport && (
                <LandscapeReport
                    session={session}
                    packet={engine.livePacket}
                    responses={engine.responses}
                    lang={lang}
                    onClose={() => setShowPrintReport(false)}
                />
            )}

            {/* End Session Modal */}
            <EndSessionModal 
                engine={engine} 
                isOpen={showEndModal} 
                onClose={() => setShowEndModal(false)} 
                onOpenPrintReport={() => setShowPrintReport(true)} 
                lang={lang} 
            />

            {/* Capacity Modal */}
            <CapacityModal 
                visible={showCapacityModal} 
                onClose={() => setShowCapacityModal(false)} 
                classCode={teacherClassCode || session?.class_code} 
                lang={lang} 
            />

            {/* Fullscreen Canvas Spotlight */}
            <CanvasSpotlightModal 
                spotlight={canvasSpotlight} 
                livePacket={engine.livePacket} 
                activeSlide={session?.active_question_data?.slides?.[session?.current_slide_index || 0]} 
                isAnonymous={engine.isAnonymous} 
                onClose={() => setCanvasSpotlight(null)} 
                lang={lang} 
            />
        </div>
    );
}