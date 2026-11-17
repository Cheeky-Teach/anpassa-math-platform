// src/components/live/StudentLiveContainer.jsx
import React from 'react';
import { useStudentSessionState } from './core/useStudentSessionState';
import StudentPresentationView from './views/StudentPresentationView';
import StudentWorksheetView from './views/StudentWorksheetView';
import StudentActivityView from './views/StudentActivityView';
import StudentSummaryGrid from './components/StudentSummaryGrid';

export default function StudentLiveContainer({ session, packet, lang = 'sv', studentAlias, onBack }) {
    const studentEngine = useStudentSessionState({ session, packet, studentAlias, lang, onBack });
    const mode = session?.active_question_data?.mode || 'worksheet';

    if (studentEngine.showFinalReview) {
        return <StudentSummaryGrid engine={studentEngine} lang={lang} onBack={onBack} />;
    }

    if (
        mode === 'activity_category_clash' ||
        mode === 'activity_four_corners' ||
        mode === 'activity_you_vs_class' ||
        mode.startsWith('activity_')
    ) {
        return (
            <StudentActivityView
                engine={studentEngine}
                session={session}
                studentAlias={studentAlias}
                lang={lang}
                onBack={onBack}
            />
        );
    }

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