// src/components/activities/registry/activityRegistry.js
import CategoryClashSetupModal from '../wizards/CategoryClashSetupModal';
import CategoryClashEngine from '../engines/CategoryClashEngine';
import FourCornersSetupModal from '../wizards/FourCornersSetupModal';
import FourCornersEngine from '../engines/FourCornersEngine';
import StudentActivityView from '../../live/student/views/StudentActivityView';
import { Grid, Trophy, Swords, SplitSquareVertical, Compass } from 'lucide-react';

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

        SetupModal: CategoryClashSetupModal,
        TeacherEngine: CategoryClashEngine,
        StudentView: StudentActivityView,

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

    four_corners: {
        id: 'four_corners',
        key: 'four_corners',
        modePrefix: 'activity_four_corners',
        title: { sv: "4 Hörn", en: "Four Corners" },
        desc: {
            sv: "Interaktiv argumentation och ställningstagande i rummets fyra hörn.",
            en: "Interactive stance-taking and debate across four corners of the room."
        },
        icon: SplitSquareVertical,
        color: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-500',
        available: true,

        // 🟢 Components mapped directly
        SetupModal: FourCornersSetupModal,
        TeacherEngine: FourCornersEngine,
        StudentView: StudentActivityView,

        createInitialSettings: (config) => ({
            gameKey: 'four_corners',
            deliveryMode: config.settings?.deliveryMode || 'physical',
            timerSeconds: config.settings?.timerSeconds || 0,
            scoringMode: config.settings?.scoringMode || 'formative',
            initialQuestions: config.initialQuestions || []
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