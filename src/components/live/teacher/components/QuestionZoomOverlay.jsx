// src/components/live/teacher/components/QuestionZoomOverlay.jsx
import React, { useState } from 'react';
import { 
    X, ChevronLeft, ChevronRight, Users, Star, 
    Loader2, Sparkles, CheckCircle2, XCircle, Eye, EyeOff, LayoutPanelLeft
} from 'lucide-react';
import VisualRenderer from '../../../visuals/VisualRenderer';
import MathDisplay from '../../../shared/MathDisplay';
import { extractDecodedAnswer } from '../../core/liveAnswerUtils';
import { supabase } from '../../../../lib/supabaseClient';
import { syncProgress } from '../../../../lib/progressSync';

export default function QuestionZoomOverlay({
    engine,
    zoomIndex,
    session,
    lang = 'sv',
    onClose,
    onNavigateZoom
}) {
    const {
        livePacket,
        responses,
        students,
        starredStudents,
        toggleStar,
        isComparing,
        setIsComparing,
        isAnonymous,
        showActualAnswers,
        setShowActualAnswers,
        handleRegenerateQuestion
    } = engine;

    const [isPushing, setIsPushing] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [hideResponses, setHideResponses] = useState(false); // 🟢 Toggle to collapse responses & maximize question view

    const question = livePacket[zoomIndex];
    if (!question) return null;

    const questionResponses = responses.filter(r => r.question_index === zoomIndex);
    const isPresentationMode = session?.active_question_data?.mode === 'presentation';
    const pacingMode = session?.active_question_data?.settings?.pacing || session?.settings?.pacing || 'open';
    const isTeacherLed = pacingMode === 'teacher';

    const handlePushToClass = async () => {
        if (!session?.id || isPushing) return;
        setIsPushing(true);
        try {
            syncProgress('live_teacher_pushed_question', { app_mode: 'teacher_live', target_question_index: zoomIndex });
            const payload = { current_question_index: zoomIndex };
            if (isPresentationMode || session?.current_slide_index !== undefined) payload.current_slide_index = zoomIndex;
            const { error } = await supabase.from('rooms').update(payload).eq('id', session.id);
            if (error) throw error;
        } catch (err) {
            console.error(err);
        } finally {
            setIsPushing(false);
        }
    };

    const hasDiagram = question.resolvedData?.renderData && (question.resolvedData.renderData.graph || question.resolvedData.renderData.geometry || question.resolvedData.renderData.pattern);

    return (
        <div className="fixed inset-0 z-[300] bg-black/75 backdrop-blur-md flex items-center justify-center no-print animate-in fade-in duration-150 select-none font-sans text-[var(--text-main)]">
            <div className="bg-[var(--bg-canvas)] w-full h-full flex flex-col overflow-hidden shadow-2xl">
                
                {/* Top Header Bar */}
                <div className="px-6 py-3 border-b border-[var(--border-main)] flex justify-between items-center bg-[var(--bg-card)] shrink-0 shadow-2xs">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3.5 py-1.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider">
                            {lang === 'sv' ? "Uppgift" : "Question"} {zoomIndex + 1}
                        </div>
                        <div className="text-xs font-mono font-bold text-[var(--text-muted)] uppercase tracking-wider ml-1">
                            {questionResponses.length}/{students.length} {lang === 'sv' ? "Svar" : "Answers"}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Collapse Responses Toggle */}
                        <button
                            type="button"
                            onClick={() => setHideResponses(!hideResponses)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer border ${
                                hideResponses 
                                    ? 'bg-emerald-600 text-white border-emerald-600' 
                                    : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-strong)] hover:text-[var(--text-main)]'
                            }`}
                            title={lang === 'sv' ? "Visa endast fråga" : "Focus question view"}
                        >
                            <LayoutPanelLeft size={14} />
                            <span className="hidden sm:inline">{hideResponses ? (lang === 'sv' ? "Visa svar" : "Show Answers") : (lang === 'sv' ? "Fokusera fråga" : "Focus Question")}</span>
                        </button>

                        {starredStudents.length > 0 && !hideResponses && (
                            <button
                                type="button"
                                onClick={() => setIsComparing(!isComparing)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer border ${
                                    isComparing ? 'bg-amber-500 text-white border-amber-500' : 'bg-[var(--bg-surface)] text-amber-600 dark:text-amber-400 border-[var(--border-strong)] hover:bg-[var(--bg-surface-hover)]'
                                }`}
                            >
                                <Star size={14} className={isComparing ? 'fill-white' : 'fill-amber-500'} />
                                <span>{lang === 'sv' ? `Jämför (${starredStudents.length})` : `Compare (${starredStudents.length})`}</span>
                            </button>
                        )}

                        {/* Regenerate Button */}
                        <button
                            type="button"
                            disabled={isRegenerating}
                            onClick={async () => {
                                if (window.confirm(lang === 'sv' ? "Generera ny variant och nollställ elevsvar?" : "Regenerate and clear answers?")) {
                                    setIsRegenerating(true);
                                    await handleRegenerateQuestion(zoomIndex);
                                    setIsRegenerating(false);
                                }
                            }}
                            className="bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-emerald-700 dark:text-emerald-300 border border-[var(--border-strong)] px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                        >
                            {isRegenerating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                            <span className="hidden sm:inline">{lang === 'sv' ? "Generera om" : "Regenerate"}</span>
                        </button>

                        {isTeacherLed && !isComparing && !hideResponses && (
                            <button
                                type="button"
                                onClick={handlePushToClass}
                                disabled={isPushing}
                                className="bg-amber-500 hover:bg-amber-600 text-white border border-amber-500 px-3.5 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-2xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                            >
                                {isPushing ? <Loader2 size={13} className="animate-spin" /> : <Users size={13} />}
                                <span className="hidden sm:inline">{lang === 'sv' ? "Tvinga hit klassen" : "Push to Class"}</span>
                            </button>
                        )}

                        {/* Facit / Key Button */}
                        <button
                            type="button"
                            onClick={() => setShowActualAnswers(!showActualAnswers)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all shadow-2xs cursor-pointer ${
                                showActualAnswers 
                                    ? 'bg-amber-500 text-white border-amber-500' 
                                    : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-strong)] hover:text-[var(--text-main)]'
                            }`}
                        >
                            <span>{lang === 'sv' ? "Facit" : "Key"}</span>
                        </button>

                        {/* Navigation Stepper */}
                        <div className="flex items-center gap-1 bg-[var(--bg-surface)] p-0.5 rounded-xl border border-[var(--border-strong)] mx-1 shadow-2xs">
                            <button
                                type="button"
                                onClick={() => onNavigateZoom(Math.max(0, zoomIndex - 1))}
                                disabled={zoomIndex === 0}
                                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] disabled:opacity-20 cursor-pointer"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                type="button"
                                onClick={() => onNavigateZoom(Math.min(livePacket.length - 1, zoomIndex + 1))}
                                disabled={zoomIndex === livePacket.length - 1}
                                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] disabled:opacity-20 cursor-pointer"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        {/* Close Button */}
                        <button 
                            type="button"
                            onClick={onClose} 
                            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-rose-600 hover:bg-[var(--bg-surface)] transition-all cursor-pointer border border-[var(--border-strong)] shadow-2xs"
                        >
                            <X size={16}/>
                        </button>
                    </div>
                </div>

                {/* Main Question Display Area */}
                <div className={`px-8 py-6 bg-[var(--bg-card)] border-b border-[var(--border-main)] shrink-0 relative transition-all duration-300 ${
                    hideResponses ? 'flex-1 flex flex-col justify-center items-center py-12' : ''
                }`}>
                    {showActualAnswers && (
                        <div className="absolute top-6 right-8 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 px-4 py-2 rounded-xl text-base font-mono font-bold shadow-2xs flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">{lang === 'sv' ? "Facit" : "Key"}:</span>
                            <span>{extractDecodedAnswer(question.resolvedData) || '-'}</span>
                        </div>
                    )}
                    
                    <div className={`max-w-4xl mx-auto text-center ${hideResponses ? 'space-y-6' : 'space-y-3'}`}>
                        <div className={`font-extrabold text-[var(--text-main)] leading-relaxed ${hideResponses ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'}`}>
                            <MathDisplay content={question.resolvedData?.renderData?.description || question.text} />
                        </div>

                        {question.resolvedData?.renderData?.latex && (
                            <div className={`text-emerald-700 dark:text-emerald-400 font-serif ${hideResponses ? 'text-4xl sm:text-5xl pt-4' : 'text-2xl pt-2'}`}>
                                <MathDisplay content={`$$${question.resolvedData.renderData.latex}$$`} />
                            </div>
                        )}

                        {hasDiagram && hideResponses && (
                            <div className="flex justify-center pt-4">
                                <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-strong)] shadow-inner">
                                    <VisualRenderer 
                                        data={question.resolvedData.renderData} 
                                        width={450}
                                        height={260}
                                        isWordProblem={!!question.selectedStoryIndex} 
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Dual-Pane Layout or Collapsed Full View */}
                {!hideResponses && (
                    <div className="flex-1 flex overflow-hidden w-full">
                        
                        {/* Left Pane: Diagram & Stats */}
                        {!isComparing && (
                            <div className="w-64 sm:w-80 p-6 flex flex-col border-r border-[var(--border-main)] overflow-y-auto shrink-0 bg-[var(--bg-card)] shadow-2xs z-10 space-y-4">
                                
                                {hasDiagram && (
                                    <div className="flex justify-center bg-[var(--bg-surface)] p-3 rounded-xl border border-[var(--border-strong)] shadow-inner">
                                        <VisualRenderer 
                                            data={question.resolvedData.renderData} 
                                            isWordProblem={!!question.selectedStoryIndex} 
                                        />
                                    </div>
                                )}

                                {/* Correct Students Box */}
                                <div className="bg-emerald-600 rounded-2xl p-4 text-white shadow-2xs flex flex-col max-h-[38%]">
                                    <div className="flex items-center gap-2 mb-2 opacity-90 shrink-0">
                                        <CheckCircle2 size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">{lang === 'sv' ? "Antal Rätt" : "Correct"} ({questionResponses.filter(r => r.is_correct).length})</span>
                                    </div>
                                    <div className="overflow-y-auto pr-1 custom-scrollbar text-xs space-y-1">
                                        {questionResponses.filter(r => r.is_correct).map((r, idx) => (
                                            <div key={idx} className="py-1 px-2.5 bg-black/10 rounded-lg truncate font-bold">
                                                {isAnonymous ? `Elev ${idx + 1}` : r.student_alias}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Wrong Answers Frequency Box */}
                                <div className="bg-rose-600 rounded-2xl p-4 text-white shadow-2xs flex flex-col min-h-0 flex-1">
                                    <div className="flex items-center gap-2 mb-2 opacity-90 shrink-0">
                                        <XCircle size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">{lang === 'sv' ? "Fel Svar" : "Errors"}</span>
                                    </div>
                                    <div className="space-y-1.5 overflow-y-auto pr-1 custom-scrollbar">
                                        {(() => {
                                            const wrongAnswers = questionResponses.filter(r => !r.is_correct).map(r => r.answer);
                                            const freq = wrongAnswers.reduce((acc, curr) => { acc[curr] = (acc[curr] || 0) + 1; return acc; }, {});
                                            const sorted = Object.entries(freq).sort((a,b) => b[1] - a[1]);
                                            return sorted.length > 0 ? sorted.map(([ans, count]) => (
                                                <div key={ans} className="flex justify-between items-center bg-black/15 p-2 rounded-xl text-xs">
                                                    <span className="font-bold italic truncate mr-2">"{ans}"</span>
                                                    <span className="font-mono font-bold opacity-90 shrink-0">{count} st</span>
                                                </div>
                                            )) : <span className="text-xs opacity-70 italic">{lang === 'sv' ? "Inga fel än" : "No errors"}</span>;
                                        })()}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Right Pane: Student Work Grid */}
                        <div className="flex-1 p-6 bg-[var(--bg-canvas)] overflow-y-auto custom-scrollbar">
                            <div className={`grid gap-4 items-start content-start h-full ${
                                isComparing 
                                    ? (starredStudents.length <= 2 ? 'grid-cols-2' : 'grid-cols-3') 
                                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                            }`}>
                                {questionResponses
                                    .filter(r => !isComparing || starredStudents.includes(r.student_alias))
                                    .map((r, i) => (
                                        <div key={i} className={`bg-[var(--bg-card)] p-4 rounded-2xl border shadow-2xs flex flex-col relative group/card transition-all ${
                                            starredStudents.includes(r.student_alias) ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-[var(--border-strong)]'
                                        }`}>
                                            <button 
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); toggleStar(r.student_alias); }}
                                                className={`absolute -top-2.5 -right-2.5 p-2 bg-[var(--bg-card)] rounded-xl border shadow-2xs hover:scale-105 transition-all cursor-pointer ${
                                                    starredStudents.includes(r.student_alias) ? 'border-amber-500 opacity-100' : 'border-[var(--border-strong)] opacity-0 group-hover/card:opacity-100'
                                                }`}
                                            >
                                                <Star size={14} className={starredStudents.includes(r.student_alias) ? 'fill-amber-500 text-amber-500' : 'text-[var(--text-muted)]'} />
                                            </button>

                                            <div className="flex justify-between items-center mb-3 border-b border-[var(--border-main)] pb-2.5">
                                                <span className="font-extrabold text-xs text-[var(--text-main)]">{isAnonymous ? `Elev ${i + 1}` : r.student_alias}</span>
                                                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider ${
                                                    r.answerType === 'free_text' ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800' : r.is_correct ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                                }`}>
                                                    {r.answerType === 'free_text' ? 'Text' : r.answer}
                                                </span>
                                            </div>
                                            
                                            <div className={`flex-1 space-y-2 text-[var(--text-main)] ${isComparing ? 'text-lg leading-relaxed' : 'text-sm'}`}>
                                                {r.work_steps && r.work_steps.map((line, lineIdx) => (
                                                    <div key={lineIdx} className="overflow-x-auto custom-scrollbar pb-1 bg-[var(--bg-surface)] px-2.5 py-1.5 rounded-xl border border-[var(--border-main)]">
                                                        <MathDisplay content={`$\\displaystyle ${line}$`} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                            
                                {questionResponses.length === 0 && (
                                    <div className="col-span-full py-16 text-center text-[var(--text-muted)] font-bold uppercase tracking-wider text-xs">
                                        {lang === 'sv' ? "Inga lösningar inskickade än." : "No answers submitted yet."}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}