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
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center select-none">
                <div className="max-w-md bg-white rounded-[3rem] p-10 shadow-2xl border-4 border-rose-500 animate-in fade-in duration-300">
                    <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600">
                        <LogOut size={32} />
                    </div>
                    <h2 className="text-2xl font-black uppercase text-slate-900 mb-2 tracking-tighter">
                        {lang === 'sv' ? "Session avslutad." : "Session ended."}
                    </h2>
                    <p className="text-slate-500 font-medium leading-relaxed">
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
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center select-none">
                <div className="max-w-md w-full bg-white rounded-[3.5rem] p-12 shadow-2xl animate-in zoom-in duration-500 border-b-8 border-indigo-100">
                    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner text-indigo-600">
                        <ListChecks size={40} />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-2 italic">
                        {lang === 'sv' ? "Aktivitet klar" : "Activity done"}
                    </h2>
                    <p className="text-slate-500 font-medium leading-relaxed mb-10">
                        {lang === 'sv' ? "Alla svar skickades in." : "All answers have been submitted."}
                    </p>
                    <button 
                        type="button"
                        onClick={() => {
                            syncProgress('student_reviewed_results', { app_mode: 'student_live' });
                            setShowFinalReview(true);
                        }} 
                        className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-[0.15em] hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl cursor-pointer active:scale-95"
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