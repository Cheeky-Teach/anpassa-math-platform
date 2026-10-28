// src/components/activities/registry/activityRegistry.js
import CategoryClashSetupModal from '../wizards/CategoryClashSetupModal';
import CategoryClashEngine from '../engines/CategoryClashEngine';
import StudentActivityView from '../../live/student/views/StudentActivityView';
import { Grid, Trophy, Swords, SplitSquareVertical } from 'lucide-react';

export const ACTIVITY_REGISTRY = {
    category_clash: {
        id: 'category_clash',
        key: 'category_clash',
        modePrefix: 'activity_category_clash',
        title: { sv: "Poängjakten", en: "Category Clash" },
        desc: {
            sv: "Klassiskt rutnät där lag väljer kategori och nivå för att samla poäng.",
            en: "Grid matrix where teams pick topic and tier to rack up points."
        },
        icon: Grid,
        color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-500',
        available: true,

        // 🟢 Components mapped directly
        SetupModal: CategoryClashSetupModal,
        TeacherEngine: CategoryClashEngine,
        StudentView: StudentActivityView, // 👈 Uses the verified student view component

        // Default room payload factory
        createInitialSettings: (config) => ({
            gameKey: 'category_clash',
            dimensions: config.dimensions,
            pointScale: config.pointScale,
            categories: config.categories,
            teams: config.teams,
            wordProblems: config.wordProblems,
            sourceMode: config.sourceMode,
            allowScratchpad: true,
            allowCanvas: true
        })
    },

    millionaire: {
        id: 'millionaire',
        key: 'millionaire',
        modePrefix: 'activity_millionaire',
        title: { sv: "Kvitt eller Dubbelt", en: "Math Ladder" },
        icon: Trophy,
        available: false,
    }
};

export const getActivityDefinition = (keyOrMode) => {
    if (!keyOrMode) return null;
    return Object.values(ACTIVITY_REGISTRY).find(
        act => act.id === keyOrMode || keyOrMode.startsWith(act.modePrefix)
    ) || null;
};