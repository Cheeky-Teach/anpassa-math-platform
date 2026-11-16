// src/components/live/teacher/components/ClassMatrixTable.jsx
import React from 'react';
import { UserX, MessageSquare, Maximize2 } from 'lucide-react';

export default function ClassMatrixTable({
    engine,
    session,
    activeIndices,
    onOpenZoom,
    onOpenSpotlight,
    onOpenFreeText,
    onKick,
    lang = 'sv',
}) {
    const {
        students,
        livePacket,
        responses,
        questionStats,
        isAnonymous,
        hideCorrectness,
        showActualAnswers,
        handleManualOverride
    } = engine;

    const isPresentationMode = session?.active_question_data?.mode === 'presentation';
    const activeSlideIndex = session?.current_slide_index || 0;

    // Helper to resolve the correct answer text for the header display
    const getFinalAnswer = (resolvedData) => {
        if (!resolvedData) return null;
        if (resolvedData.answer && resolvedData.answer !== "Se lösning") return resolvedData.answer;
        if (resolvedData.token) {
            try { return atob(resolvedData.token); } catch (e) { return null; }
        }
        if (resolvedData.clues && resolvedData.clues.length > 0) {
            const lastClue = resolvedData.clues[resolvedData.clues.length - 1];
            return lastClue.latex || lastClue.text;
        }
        return null;
    };

    // Exact status color mapper using clean semantic fills and shadows
    const getStatusColor = (isCorrect, answered, answerText, answerType) => {
        if (!answered) return 'bg-[var(--bg-surface-hover)] text-[var(--text-muted)] opacity-30 border border-[var(--border-main)]';
        if (answerType === 'free_text') return 'bg-sky-600 text-white font-bold';
        if (hideCorrectness) return 'bg-indigo-600 text-white font-bold';
        if (answerText === '[TIMEOUT]') return 'bg-slate-700 text-slate-100 font-bold';
        return isCorrect 
            ? 'bg-emerald-600 text-white font-bold' 
            : 'bg-rose-600 text-white font-bold';
    };

    return (
        <div className="w-full overflow-x-auto custom-scrollbar rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-card)] shadow-2xs">
            <table className="w-full text-left border-collapse table-fixed min-w-[700px]">
                <thead className="sticky top-0 z-10 shadow-2xs">
                    {/* Accuracy Percentage Bars */}
                    <tr className="bg-[var(--bg-surface)] border-b border-[var(--border-main)]">
                        <th className="p-3 w-48 bg-[var(--bg-surface)] border-r border-[var(--border-main)]">
                            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-mono">
                                {lang === 'sv' ? "Klassens resultat" : "Class results"}
                            </span>
                        </th>
                        <th className="p-3 w-20 border-r border-[var(--border-main)] bg-[var(--bg-surface)]"></th>
                        {activeIndices.map((qIdx) => {
                            const targetItem = livePacket[qIdx];
                            const isFreeText = targetItem?.answerType === 'free_text' || (!targetItem && isPresentationMode);
                            const stats = questionStats[qIdx] || { correctPct: 0, wrongPct: 0, remaining: 0 };
                            const qResponses = responses.filter(r => 
                                r.question_index === qIdx || 
                                (r.is_slide_submission && r.question_index === activeSlideIndex)
                            );

                            return (
                                <th key={`stat-${qIdx}`} className="p-2 border-r border-[var(--border-main)] align-bottom bg-[var(--bg-card)]">
                                    <div className="w-full h-10 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl overflow-hidden flex flex-col-reverse relative group cursor-help shadow-inner">
                                        {!isFreeText ? (
                                            <>
                                                <div style={{ height: `${stats.correctPct}%` }} className="bg-emerald-600 transition-all duration-300" />
                                                <div style={{ height: `${stats.wrongPct}%` }} className="bg-rose-600 transition-all duration-300" />
                                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-slate-900/90 flex items-center justify-center transition-opacity">
                                                    <span className="text-[10px] text-white font-mono font-bold tabular-nums">{Math.round(stats.correctPct)}%</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div 
                                                style={{ height: `${students.length > 0 ? Math.min(100, (qResponses.length / students.length) * 100) : 0}%` }} 
                                                className="bg-sky-600 transition-all duration-300 opacity-80" 
                                            />
                                        )}
                                    </div>
                                </th>
                            );
                        })}
                    </tr>

                    {/* Column Headers */}
                    <tr className="bg-[var(--bg-surface)] border-b border-[var(--border-main)] text-[var(--text-main)]">
                        <th className="p-3.5 w-48 text-[11px] font-extrabold uppercase tracking-tight border-r border-[var(--border-main)] text-[var(--text-main)]">
                            {lang === 'sv' ? "Elev" : "Student"}
                        </th>
                        <th className="p-3.5 w-20 text-[11px] font-extrabold uppercase tracking-tight text-center border-r border-[var(--border-main)] text-[var(--text-main)]">
                            {lang === 'sv' ? "Klar" : "Done"}
                        </th>
                        {activeIndices.map((qIdx) => {
                            const targetItem = livePacket[qIdx];
                            const isCanvasSlideOnly = !targetItem && isPresentationMode;
                            const correctAnswer = showActualAnswers ? getFinalAnswer(targetItem?.resolvedData) : null;

                            return (
                                <th key={`head-${qIdx}`} className="p-0 border-r border-[var(--border-main)] transition-colors hover:bg-[var(--bg-surface-hover)] group/col bg-[var(--bg-surface)]">
                                    <button 
                                        type="button"
                                        onClick={() => { if (targetItem) onOpenZoom(qIdx); }} 
                                        className={`w-full h-full py-2.5 px-1 flex flex-col items-center justify-center gap-1 cursor-pointer ${targetItem ? 'cursor-zoom-in' : 'cursor-default'}`}
                                    >
                                        <div className="flex items-center gap-1">
                                            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--text-main)] group-hover/col:text-emerald-700 dark:group-hover/col:text-emerald-400 transition-colors">
                                                {isCanvasSlideOnly ? `Slide ${activeSlideIndex + 1}` : `Q${qIdx + 1}`}
                                            </span>
                                            {targetItem && <Maximize2 size={11} className="text-emerald-600 opacity-0 group-hover/col:opacity-100 transition-opacity" />}
                                        </div>
                                        
                                        {/* Answer Key Badge inside header cell */}
                                        {correctAnswer && (
                                            <span className="text-[9px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800 truncate max-w-full shadow-2xs" title={`Rätt svar: ${correctAnswer}`}>
                                                {correctAnswer}
                                            </span>
                                        )}
                                    </button>
                                </th>
                            );
                        })}
                    </tr>
                </thead>

                {/* Student Rows */}
                <tbody className="divide-y divide-[var(--border-subtle)] bg-[var(--bg-card)]">
                    {students.map((student, sIdx) => {
                        const studentResps = responses.filter(r => r.student_alias === student);
                        const progress = Math.round((studentResps.length / Math.max(1, livePacket.length)) * 100);

                        return (
                            <tr key={student} className="hover:bg-[var(--bg-surface)] transition-colors group/row">
                                <td className="p-3 border-r border-[var(--border-subtle)] font-bold text-xs truncate flex items-center justify-between text-[var(--text-main)]">
                                    <span className="truncate pr-2">{isAnonymous ? `Elev ${sIdx + 1}` : student}</span>
                                    <button 
                                        type="button"
                                        onClick={() => onKick(student)} 
                                        className="opacity-0 group-hover/row:opacity-100 p-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all cursor-pointer shrink-0"
                                        title="Kick student"
                                    >
                                        <UserX size={14} />
                                    </button>
                                </td>

                                <td className="p-3 border-r border-[var(--border-subtle)] text-center font-mono">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${progress >= 100 ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-main)]'}`}>
                                        {Math.min(100, progress)}%
                                    </span>
                                </td>

                                {activeIndices.map((qIdx) => {
                                    const targetItem = livePacket[qIdx];
                                    const resp = responses.find(r => 
                                        r.student_alias === student && 
                                        (r.question_index === qIdx || (r.is_slide_submission && r.question_index === activeSlideIndex))
                                    );

                                    const isFreeText = targetItem?.answerType === 'free_text';
                                    const hasCanvasData = resp?.canvas_state && Array.isArray(resp.canvas_state) && resp.canvas_state.length > 0;
                                    const isSlideCanvasOnly = resp?.answer === '[CANVAS_SUBMISSION]' || resp?.is_slide_submission || hasCanvasData;

                                    return (
                                        <td 
                                            key={`cell-${sIdx}-${qIdx}`} 
                                            className="p-1.5 border-r border-[var(--border-subtle)]"
                                            onClick={() => {
                                                if (!resp) return;
                                                if (hasCanvasData) {
                                                    onOpenSpotlight(resp);
                                                } else if (isFreeText) {
                                                    onOpenFreeText(qIdx, student);
                                                } else {
                                                    handleManualOverride(resp.id, resp.is_correct);
                                                }
                                            }}
                                        >
                                            <div 
                                                title={resp ? (hasCanvasData ? "Klicka för att se tavla" : isFreeText ? "Klicka för att läsa svar" : `Svar: ${resp.answer}`) : 'Inget svar'}
                                                className={`w-full h-8 rounded-xl transition-all duration-150 flex items-center justify-center overflow-hidden cursor-pointer hover:scale-95 active:scale-90 shadow-2xs ${
                                                    getStatusColor(
                                                        resp?.is_correct, 
                                                        Boolean(resp), 
                                                        resp?.answer, 
                                                        isSlideCanvasOnly ? 'free_text' : (targetItem?.answerType || 'standard')
                                                    )
                                                }`}
                                            >
                                                {showActualAnswers && resp && (
                                                    <span className="text-[10px] font-mono font-bold text-white px-1 truncate flex items-center justify-center">
                                                        {isSlideCanvasOnly ? 'TAVLA' : isFreeText ? <MessageSquare size={12} /> : (resp.answer === '[TIMEOUT]' ? 'TID' : resp.answer)}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}