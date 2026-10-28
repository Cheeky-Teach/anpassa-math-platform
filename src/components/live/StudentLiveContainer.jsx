// src/components/live/StudentLiveContainer.jsx
import React from 'react';
import { useStudentSessionState } from './core/useStudentSessionState';
import StudentPresentationView from './views/StudentPresentationView';
import StudentWorksheetView from './views/StudentWorksheetView';
import StudentActivityView from './views/StudentActivityView';
import StudentSummaryGrid from './components/StudentSummaryGrid';

export default function StudentLiveContainer({ session, packet, lang = 'sv', studentAlias, onBack }) {
    // 🟢 Fix 1: Pass lang down to state hook
    const studentEngine = useStudentSessionState({ session, packet, studentAlias, lang, onBack });
    const mode = session?.active_question_data?.mode || 'worksheet';

    if (studentEngine.showFinalReview) {
        return <StudentSummaryGrid engine={studentEngine} lang={lang} onBack={onBack} />;
    }

    if (mode === 'activity_category_clash') {
        return <StudentActivityView engine={studentEngine} session={session} studentAlias={studentAlias} lang={lang} />;
    }

    if (mode === 'presentation') {
        // 🟢 Fix 2: Forward studentAlias
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

    // 🟢 Fix 3: Forward studentAlias
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