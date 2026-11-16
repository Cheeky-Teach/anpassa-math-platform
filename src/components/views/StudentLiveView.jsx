// src/components/views/StudentLiveView.jsx
import React from 'react';
import { useStudentSessionState } from '../live/core/useStudentSessionState';
import StudentSummaryGrid from '../live/student/components/StudentSummaryGrid';
import StudentPresentationView from '../live/student/views/StudentPresentationView';
import StudentWorksheetView from '../live/teacher/views/StudentWorksheetView';
import { LogOut, ListChecks } from 'lucide-react';
import { syncProgress } from '../../lib/progressSync';
import { getActivityDefinition } from '../activities/registry/activityRegistry';

export default function StudentLiveView({ session, packet, lang = 'sv', studentAlias, onBack }) {
    // 1. Resolve Mode & Engine once at the top
    const mode = session?.active_question_data?.mode || 'worksheet';
    const studentEngine = useStudentSessionState({ session, packet, studentAlias, lang, onBack });
    const { roomActive, showFinalReview, setShowFinalReview, completed, localPacket } = studentEngine;

    // 2. Terminated Screen (Applies to all modes: worksheets, presentations, activities)
    if (!roomActive) {
        return (
            <div className="min-h-screen bg-[var(--bg-canvas)] flex items-center justify-center p-6 text-center select-none font-sans">
                <div className="max-w-md bg-[var(--bg-card)] rounded-2xl p-8 shadow-2xl border border-[var(--border-strong)] animate-in fade-in duration-150">
                    <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center justify-center mx-auto mb-4 text-rose-600 dark:text-rose-400">
                        <LogOut size={24} />
                    </div>
                    <h2 className="text-base font-extrabold uppercase text-[var(--text-main)] mb-1 tracking-tight">
                        {lang === 'sv' ? "Session avslutad." : "Session ended."}
                    </h2>
                    <p className="text-xs font-medium text-[var(--text-muted)] leading-relaxed">
                        {lang === 'sv' ? "Läraren har stängt rummet. Du skickas strax vidare." : "The teacher has closed the room. You will be redirected shortly."}
                    </p>
                </div>
            </div>
        );
    }

    // 🟢 3. Activity Mode Router (Dynamic via Registry)
    const activityDef = getActivityDefinition(mode);
    if (activityDef?.StudentView) {
        const StudentActivityComponent = activityDef.StudentView;
        return (
            <StudentActivityComponent
                engine={studentEngine}
                session={session}
                packet={packet}
                studentAlias={studentAlias}
                lang={lang}
                onBack={onBack}
            />
        );
    }

    // 4. Final Review Grid (Worksheet only)
    if (showFinalReview) {
        return <StudentSummaryGrid engine={studentEngine} lang={lang} onBack={onBack} />;
    }

    // 5. Completed Screen (Worksheet only)
    const allDone = localPacket.length > 0 && Object.keys(completed).length === localPacket.length;
    if (allDone && mode === 'worksheet') {
        return (
            <div className="min-h-screen bg-[var(--bg-canvas)] flex items-center justify-center p-6 text-center select-none font-sans">
                <div className="max-w-md w-full bg-[var(--bg-card)] rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-150 border border-[var(--border-strong)]">
                    <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-center mx-auto mb-5 text-emerald-600 dark:text-emerald-400">
                        <ListChecks size={28} />
                    </div>
                    <h2 className="text-lg font-extrabold uppercase tracking-tight text-[var(--text-main)] mb-1">
                        {lang === 'sv' ? "Aktivitet klar" : "Activity done"}
                    </h2>
                    <p className="text-xs font-medium text-[var(--text-muted)] leading-relaxed mb-6">
                        {lang === 'sv' ? "Alla svar skickades in." : "All answers have been submitted."}
                    </p>
                    <button 
                        type="button"
                        onClick={() => {
                            syncProgress('student_reviewed_results', { app_mode: 'student_live' });
                            setShowFinalReview(true);
                        }} 
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer active:scale-[0.98]"
                    >
                        {lang === 'sv' ? "Granska resultat" : "Preview results"}
                    </button>
                </div>
            </div>
        );
    }

    // 6. Presentation Mode Router
    if (mode === 'presentation') {
        return (
            <StudentPresentationView 
                engine={studentEngine} 
                session={session} 
                studentAlias={studentAlias}
                lang={lang} 
                onBack={onBack} 
            />
        );
    }

    // 7. Default: Standard Worksheet View
    return (
        <StudentWorksheetView 
            engine={studentEngine} 
            session={session} 
            studentAlias={studentAlias} 
            lang={lang} 
            onBack={onBack} 
        />
    );
}