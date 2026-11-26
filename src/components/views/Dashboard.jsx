import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  ChevronDown, ChevronUp, ChevronRight, Zap, Play, Clock, Book, Info,
  Award, BarChart3, PenTool, Calendar, Sparkles, Users, Settings,
  History, Target, LayoutGrid, RotateCcw, FileSpreadsheet,
  PlayCircle, Grid3X3, Beaker, Newspaper, X,
  Layers, PieChart, HelpCircle, Check, Compass, BookOpen,
  Calculator, Variable, Shapes
} from 'lucide-react';

import { CATEGORIES, LEVEL_DESCRIPTIONS } from '@/constants/localization';
import { APP_UPDATES } from '@/constants/updates';
import TeacherHubManager from './TeacherHubManager';
import { CONTENT_MAP } from '../../constants/content_map.generated';
import MathDisplay from '../shared/MathDisplay';
import VisualRenderer from '../visuals/VisualRenderer';
import SpotlightTour from '../shared/SpotlightTour';
import CapacityModal from '../modals/CapacityModal';
import InstructionSlideModal from '../modals/InstructionSlideModal';
import ConceptMapDashboard from './ConceptMapDashboard';
import SheetLibraryModal from '../modals/SheetLibraryModal';
import ActivityHubModal from '../activities/modals/ActivityHubModal';
import { getActivityDefinition } from '../activities/registry/activityRegistry';
import UnitStudyGuideBanner from '../shared/UnitStudyGuideBanner';
import StudentGateway from './StudentGateway';
import {
    getTopicDisplayName as getTopicName,
    getPartDisplayTitle,
    normalizePartsPayload,
    checkIsStepCompleted,
    getUnitProgressStorageKey,
    readCompletedStepIds,
    persistStepComplete,
    getNextUnitStep
} from '../../core/utils/unitProgressUtils';

const DOMAIN_VISUALS = {
    arithmetic: {
        Icon: Calculator,
        accent: '#2d8f00',
        softBg: 'rgba(45, 143, 0, 0.12)',
        borderTint: 'rgba(45, 143, 0, 0.35)',
        tabActiveSplit: 'linear-gradient(135deg, rgba(45, 143, 0, 0.20) 0%, rgba(45, 143, 0, 0.20) 52%, var(--bg-card) 52%, var(--bg-card) 100%)',
        tabInactiveBg: 'var(--bg-card)'
    },
    algebra: {
        Icon: Variable,
        accent: '#0075a2',
        softBg: 'rgba(0, 117, 162, 0.12)',
        borderTint: 'rgba(0, 117, 162, 0.35)',
        tabActiveSplit: 'linear-gradient(135deg, rgba(0, 117, 162, 0.20) 0%, rgba(0, 117, 162, 0.20) 52%, var(--bg-card) 52%, var(--bg-card) 100%)',
        tabInactiveBg: 'var(--bg-card)'
    },
    geometry: {
        Icon: Shapes,
        accent: '#c28500',
        softBg: 'rgba(217, 155, 0, 0.16)',
        borderTint: 'rgba(217, 155, 0, 0.40)',
        tabActiveSplit: 'linear-gradient(135deg, #f8fbdb 0%, #f8fbdb 52%, var(--bg-card) 52%, var(--bg-card) 100%)',
        tabInactiveBg: 'var(--bg-card)'
    },
    statistics: {
        Icon: BarChart3,
        accent: '#cd5334',
        softBg: 'rgba(205, 83, 52, 0.12)',
        borderTint: 'rgba(205, 83, 52, 0.35)',
        tabActiveSplit: 'linear-gradient(135deg, rgba(205, 83, 52, 0.20) 0%, rgba(205, 83, 52, 0.20) 52%, var(--bg-card) 52%, var(--bg-card) 100%)',
        tabInactiveBg: 'var(--bg-card)'
    }
};

const getLevelMetadata = (topicId, level, lang = 'sv') => {
    if (!topicId || level === undefined || level === null) {
        return { description: "", mathExample: "", isSentence: false };
    }
    const descriptionsObj = typeof LEVEL_DESCRIPTIONS !== 'undefined' ? LEVEL_DESCRIPTIONS : {};
    const topicDesc = descriptionsObj[topicId]?.[level];
    const description = typeof topicDesc === 'object'
        ? (topicDesc[lang] || topicDesc.sv || "")
        : (topicDesc || "");

    let mathExample = "";
    if (typeof CONTENT_MAP !== 'undefined' && Array.isArray(CONTENT_MAP)) {
        for (const cat of CONTENT_MAP) {
            const foundTopic = cat.topics?.find(t => t.id === topicId);
            if (foundTopic) {
                const foundLevel = foundTopic.levels?.find(l => l.lvl === level);
                const firstVar = foundLevel?.variations?.[0];
                const rawEx = foundLevel?.ex
                    || (typeof firstVar?.desc === 'object' ? (firstVar.desc[lang] || firstVar.desc.sv) : firstVar?.ex)
                    || "";

                if (rawEx) {
                    const str = String(rawEx).trim();
                    const looksLikePureMath = !str.includes('$') && /^[0-9xya-zA-Z+\-*/=()^\\{}\[\].,\s<>%°]+$/.test(str) && str.split(' ').length <= 4;
                    mathExample = looksLikePureMath ? `$${str}$` : str;
                }
                break;
            }
        }
    }

    const plainLength = mathExample.replace(/\$/g, '').length;
    const isSentence = plainLength > 26 || mathExample.replace(/\$[^$]*\$/g, '').trim().split(/\s+/).length > 3;

    return { description, mathExample, isSentence };
};

const Dashboard = ({
    profile, lang = 'sv', selectedTopic, selectedLevel, onSelect, onStart,
    timerSettings, toggleTimer, resetTimer, ui, onLgrOpen, onContentOpen, onStartCheckpoint,
    onAboutOpen, onStatsOpen, onStudioOpen, onProfileOpen, onLabOpen, onFractionLabOpen,
    onTimesTableOpen, onRelaunch, onViewReport, onEdit, activeBucket, onBackToGateway,
    onStartUnitStep, onOpenPosterNotes, onOpenLibrarySheet,
    studentBuckets = [], loadingBuckets = false, folderOrder = [],
    onSelectBucket, onResumeUnitStep,
    userRole = 'teacher'
}) => {
    const [expandedCategory, setExpandedCategory] = useState('arithmetic');
    const [activeTab, setActiveTab] = useState('curriculum');
    const [archivedSessions, setArchivedSessions] = useState([]);
    const [isLoadingArchive, setIsLoadingArchive] = useState(false);
    const [activeSessions, setActiveSessions] = useState([]);
    const [showUpdateLog, setShowUpdateLog] = useState(false);
    const [showCapacityModal, setShowCapacityModal] = useState(false);
    const [activeInstructionModal, setActiveInstructionModal] = useState(null);
    const [collapsedPartSections, setCollapsedPartSections] = useState({});
    const [openDropdownTopicId, setOpenDropdownTopicId] = useState(null);
    const [inspectedStepByPart, setInspectedStepByPart] = useState({});
    const [partPreviewQuestion, setPartPreviewQuestion] = useState(null);
    const [isFetchingPartPreview, setIsFetchingPartPreview] = useState(false);
    const [diagnosticTarget, setDiagnosticTarget] = useState(null);
    const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
    const [showActivityHub, setShowActivityHub] = useState(false);
    const [activeSetupModal, setActiveSetupModal] = useState(null);

    const fetchPartStepSample = async (topicId, level, variationKey = null) => {
        if (!topicId) {
            setPartPreviewQuestion(null);
            return;
        }
        setIsFetchingPartPreview(true);
        try {
            const url = variationKey
                ? `/api/question?topic=${topicId}&variation=${variationKey}&lang=${lang}&wordProblem=false`
                : `/api/question?topic=${topicId}&level=${level || 1}&lang=${lang}&wordProblem=false`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setPartPreviewQuestion(data);
            } else {
                setPartPreviewQuestion(null);
            }
        } catch (err) {
            console.warn('Could not fetch part preview question:', err);
            setPartPreviewQuestion(null);
        } finally {
            setIsFetchingPartPreview(false);
        }
    };

    const TEXT = {
        sv: {
            tools_section: "Verktyg", class_code_label: "Klasskod", connected_code_label: "Ansluten till kod",
            timer_title: "Timer", timer_off: "Timer av", timer_reset: "Nollställ",
            studio_title: "Question Studio", studio_desc: "Skapa material & tavla",
            stats_title: "Statistik", stats_desc: "Dina framsteg",
            curriculum_title: "Kursmaterial", archive_title: "Lektionsarkiv",
            topics_count: (count) => `${count} delmoment`, select_level: "Välj nivå",
            start_btn: "Börja öva", resources: "Resurser", content_map: "Innehåll",
            lgr_link: "LGR 22", about_link: "Om skaparen",
            profile_btn: "Inställningar", archive_empty: "Inga avslutade lektioner de senaste 7 dagarna.",
            relaunch_btn: "Kör igen", view_report: "Visa rapport", resume_h: "Lektion pågår",
            resume_btn: "Återuppta", accuracy_label: "Träffsäkerhet", edit_btn: "Öppna i Studio",
            times_table_title: "Tabeller", news_title: "Nyheter", view_all: "Visa logg",
            active_sessions_count: (count) => `${count} pågående lektioner`,
            click_to_resume: "Klicka för att återuppta",
            untitled_session: "Namnlös lektion",
            pin_label: "PIN"
        },
        en: {
            tools_section: "Tools", class_code_label: "Class Code", connected_code_label: "Connected to code",
            timer_title: "Timer", timer_off: "Timer Off", timer_reset: "Reset",
            studio_title: "Question Studio", studio_desc: "Create material & slides",
            stats_title: "Statistics", stats_desc: "Your progress",
            curriculum_title: "Course Material", archive_title: "Session Archive",
            topics_count: (count) => `${count} topics`, select_level: "Select level",
            start_btn: "Start practicing", resources: "Resources", content_map: "Content Map",
            lgr_link: "Curriculum", about_link: "About",
            profile_btn: "Settings", archive_empty: "No finished sessions in the last 7 days.",
            relaunch_btn: "Relaunch", view_report: "View Report", resume_h: "Session in Progress",
            resume_btn: "Resume", accuracy_label: "Accuracy", edit_btn: "Open in Studio",
            times_table_title: "Tables", news_title: "Updates", view_all: "View log",
            active_sessions_count: (count) => `${count} active sessions`,
            click_to_resume: "Click to resume",
            untitled_session: "Untitled session",
            pin_label: "PIN"
        }
    };

    const t = TEXT[lang] || TEXT.sv;
    const latestUpdate = APP_UPDATES[0];

    const isEducator = ['teacher', 'super_admin'].includes(userRole);
    const hasStudentUnits = !isEducator && (loadingBuckets || (studentBuckets && studentBuckets.length > 0));
    const isCuratedUnit = !isEducator && Boolean(activeBucket && activeBucket !== 'FREE_PLAY');
    const [studentTab, setStudentTab] = useState('units');

    const isShowingStudentGateway = hasStudentUnits && studentTab === 'units' && !isCuratedUnit;
    const isShowingCuratedRoadmap = hasStudentUnits && studentTab === 'units' && isCuratedUnit;

    const storageKey = `has_seen_dashboard_guide_${userRole}${isShowingCuratedRoadmap ? '_unit' : ''}`;
    const [showDashboardTutorial, setShowDashboardTutorial] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem(storageKey)) {
            const timer = setTimeout(() => setShowDashboardTutorial(true), 400);
            return () => clearTimeout(timer);
        }
    }, [storageKey]);

    const handleCloseDashboardTutorial = () => {
        localStorage.setItem(storageKey, 'true');
        setShowDashboardTutorial(false);
    };

    const dashboardTourSteps = useMemo(() => {
        if (isEducator) {
            return [
                {
                    selector: '[data-tour="dash-educator-profile"]',
                    title: { sv: '1. Din klasskod & elevplatser', en: '1. Your Class Code & Student Slots' },
                    description: {
                        sv: 'Dela din klasskod med eleverna så att de får tillgång till dina planerade moduler. Under "Hantera platser" ser och administrerar du dina anslutna elever.',
                        en: 'Share your class code with students so they can access your assigned units. Use "Manage slots" to view and manage connected students.'
                    }
                },
                {
                    selector: '[data-tour="dash-educator-tools"]',
                    title: { sv: '2. Lärarverktyg & lektionsbyggare', en: '2. Teaching Tools & Lesson Builders' },
                    description: {
                        sv: 'Öppna Question Studio för att skapa arbetsblad, Do Now-grids och live-lektioner, eller använd Digitala laborationer, Test Lab och klassrumstimer.',
                        en: 'Open Question Studio to create worksheets, Do Now grids, and live lessons, or launch Digital Manipulatives, Test Lab, and the classroom timer.'
                    }
                },
                {
                    selector: '[data-tour="dash-educator-tabs"]',
                    onEnter: () => setActiveTab('curriculum'),
                    title: { sv: '3. Kursmaterial, Grupper & Lektionsarkiv', en: '3. Course Material, Custom Units & Archive' },
                    description: {
                        sv: 'Växla mellan hela kursplanen, "Grupper" (där du bygger moduler och studieplaner åt dina klasser) och "Lektionsarkiv" (7 dagars resultat & rapporter).',
                        en: 'Switch between the full curriculum, "Custom Units" (build scaffolded modules for your classes), and "Session Archive" (7-day reports & results).'
                    }
                },
                {
                    selector: '[data-tour="dash-concept-search"]',
                    onEnter: () => {
                        setActiveTab('curriculum');
                        setDiagnosticTarget(null);
                    },
                    title: { sv: '4. Sök begrepp & testa uppgifter', en: '4. Search Concepts & Preview Tasks' },
                    description: {
                        sv: 'Sök efter valfritt matematiskt begrepp eller välj ett område nedan för att förhandsgranska uppgifter och nivåbeskrivningar.',
                        en: 'Search for any math concept or pick a topic below to preview sample problems and level descriptions.'
                    }
                }
            ];
        }

        if (isShowingCuratedRoadmap) {
            return [
                {
                    selector: '[data-tour="dash-unit-banner"]',
                    onEnter: () => setDiagnosticTarget(null),
                    title: { sv: '1. Din studieplan & framsteg', en: '1. Your Study Plan & Progress' },
                    description: {
                        sv: 'Här ser du hur många steg du har klarat i området. Du kan också byta område, öppna instruktionerna eller träna extra i Test Lab.',
                        en: 'Track how many steps you have completed in this unit. You can also switch units, view instructions, or do extra practice in Test Lab.'
                    }
                },
                {
                    selector: '[data-tour="dash-unit-parts"]',
                    onEnter: () => setDiagnosticTarget(null),
                    title: { sv: '2. Arbeta igenom delarna i ordning', en: '2. Work Through Parts in Sequence' },
                    description: {
                        sv: 'Klicka på en del för att öppna den. Börja med eventuella genomgångar, öva sedan nivå för nivå och avsluta med delprovet!',
                        en: 'Click a part to expand it. Start with any walkthroughs, practice level by level, and finish with the checkpoint quiz!'
                    }
                },
                {
                    selector: '[data-tour="dash-concept-search"]',
                    onEnter: () => setDiagnosticTarget(null),
                    title: { sv: '3. Sök begrepp & använd hjälpmedel', en: '3. Search Concepts & Use Tools' },
                    description: {
                        sv: 'Kör du fast eller vill repetera något? Sök direkt här uppe eller öppna Digitala laborationer, Multiplikationstabeller och Timer.',
                        en: 'Need a refresher? Search any concept right here or open Digital Manipulatives, Times Tables, and the Timer.'
                    }
                }
            ];
        }

        return [
            {
                selector: '[data-tour="dash-concept-search"]',
                onEnter: () => setDiagnosticTarget(null),
                title: { sv: '1. Sök efter valfritt matteområde', en: '1. Search Any Math Concept' },
                description: {
                    sv: 'Skriv ett begrepp i sökrutan (t.ex. ekvationer, bråk eller procent) eller använd snabbverktygen för laborationer, tabeller och timer.',
                    en: 'Type any concept in the search bar (e.g. equations, fractions, or percent) or use the quick tools for manipulatives, tables, and timer.'
                }
            },
            {
                selector: '[data-tour="dash-category-strip"]',
                onEnter: () => setDiagnosticTarget(null),
                title: { sv: '2. Välj huvudområde', en: '2. Pick a Math Domain' },
                description: {
                    sv: 'Bläddra mellan Aritmetik, Algebra, Geometri och Statistik & Sannolikhet.',
                    en: 'Browse across Arithmetic, Algebra, Geometry, and Statistics & Probability.'
                }
            },
            {
                selector: '[data-tour="dash-topic-grid"]',
                onEnter: () => setDiagnosticTarget(null),
                title: { sv: '3. Välj nivå & börja öva', en: '3. Choose a Level & Start Practicing' },
                description: {
                    sv: 'Klicka på "Välj nivå" på ett kort för att se exempel på uppgifter, använd "Hitta rätt nivå..." om du är osäker, och klicka sedan på "Börja öva"!',
                    en: 'Click "Select level" on any card to see sample tasks, use "Find the right level..." if unsure, and hit "Start practicing"!'
                }
            }
        ];
    }, [isEducator, isShowingCuratedRoadmap]);

    const storageKeyProgress = useMemo(
        () => getUnitProgressStorageKey(profile, activeBucket),
        [profile, activeBucket]
    );

    const [completedStepIds, setCompletedStepIds] = useState(() =>
        readCompletedStepIds(storageKeyProgress)
    );

    useEffect(() => {
        setCompletedStepIds(readCompletedStepIds(storageKeyProgress));
    }, [storageKeyProgress]);

    const markStepComplete = (stepId) => {
        setCompletedStepIds(prev => persistStepComplete(storageKeyProgress, stepId, prev));
    };

    const curatedParts = useMemo(() => {
        if (!activeBucket || activeBucket === 'FREE_PLAY') return [];
        return normalizePartsPayload(activeBucket.payload);
    }, [activeBucket, lang]);

    const allUnitSteps = useMemo(() => curatedParts.flatMap(part => part.steps || []), [curatedParts]);
    const completedCount = useMemo(() => allUnitSteps.filter(s => completedStepIds.includes(s.id)).length, [allUnitSteps, completedStepIds]);
    const progressPercentage = allUnitSteps.length > 0 ? Math.round((completedCount / allUnitSteps.length) * 100) : 0;

    const nextUnfinishedStep = useMemo(() => {
        return allUnitSteps.find(step => !checkIsStepCompleted(step, completedStepIds)) || null;
    }, [allUnitSteps, completedStepIds]);

    useEffect(() => {
        fetchActiveSession();
        if (activeTab === 'archive' && ['teacher', 'super_admin'].includes(userRole)) {
            fetchArchive();
        }
    }, [activeTab]);

    const [lastAutoAlignedStepId, setLastAutoAlignedStepId] = useState(null);
    const [hasUserManuallySelected, setHasUserManuallySelected] = useState(false);

    useEffect(() => {
        setHasUserManuallySelected(false);
        setLastAutoAlignedStepId(null);
    }, [activeBucket?.id]);

    useEffect(() => {
        if (userRole !== 'student' || !activeBucket || activeBucket === 'FREE_PLAY') return;
        if (!nextUnfinishedStep || hasUserManuallySelected) return;

        if (lastAutoAlignedStepId !== nextUnfinishedStep.id) {
            if (nextUnfinishedStep.type === 'practice') {
                const safeTopic = nextUnfinishedStep.topic || nextUnfinishedStep.topicId;
                onSelect(safeTopic, nextUnfinishedStep.level);
            }
            setLastAutoAlignedStepId(nextUnfinishedStep.id);
        }
    }, [activeBucket, userRole, nextUnfinishedStep, lastAutoAlignedStepId, onSelect, hasUserManuallySelected]);

    const handleOpenInstruction = async (step) => {
        if (step.sheetId) {
            try {
                const teacherCode = profile?.connected_code || profile?.class_code || activeBucket?.class_code || activeBucket?.teacher_code || null;
                const { data: sheetPacket, error } = await supabase.rpc('get_student_presentation', {
                    p_sheet_id: step.sheetId,
                    p_teacher_code: teacherCode
                });
                if (error) throw error;
                if (sheetPacket) {
                    const slides = sheetPacket.slides || (step.slideData ? [step.slideData] : []);
                    const livePacket = sheetPacket.livePacket || sheetPacket.items || [];
                    setActiveInstructionModal({ ...step, slides, livePacket, slideIndex: step.slideIndex || 0 });
                    return;
                }
            } catch (err) {
                console.error("Failed to load presentation via RPC:", err.message);
            }
        }
        setActiveInstructionModal(step);
    };

    const fetchActiveSession = async () => {
        if (!['teacher', 'super_admin'].includes(userRole) || !profile?.id) return;
        try {
            const { data } = await supabase
                .from('rooms')
                .select('*')
                .eq('teacher_id', profile.id)
                .eq('status', 'active')
                .order('created_at', { ascending: false });
            setActiveSessions(data || []);
        } catch (err) { console.error("Session Check Failed:", err); }
    };

    const formatSubscriptionDate = (dateString, lang = 'sv') => {
        if (!dateString) return null;
        const endDate = new Date(dateString);
        const isExpired = endDate < new Date();
        const formattedDate = endDate.toLocaleDateString(lang === 'sv' ? 'sv-SE' : 'en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
        return {
            text: isExpired
                ? (lang === 'sv' ? `Inaktiv den ${formattedDate}` : `Expired on ${formattedDate}`)
                : (lang === 'sv' ? `Aktiv till ${formattedDate}` : `Active until ${formattedDate}`),
            isExpired
        };
    };

    const fetchArchive = async () => {
        setIsLoadingArchive(true);
        try {
            const cutoff = new Date(Date.now() - 192 * 60 * 60 * 1000).toISOString();
            const { data, error } = await supabase
                .from('rooms')
                .select('*, responses(is_correct, student_alias)')
                .eq('teacher_id', profile.id)
                .eq('status', 'closed')
                .gt('created_at', cutoff)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const processed = (data || []).map(room => {
                const total = room.responses?.length || 0;
                const correct = room.responses?.filter(r => r.is_correct).length || 0;
                const uniqueStudents = new Set(room.responses?.map(r => r.student_alias)).size;
                const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

                const expirationDate = room.expires_at ? new Date(room.expires_at) : null;
                const isExpired = expirationDate ? expirationDate < new Date() : false;
                const formattedExpires = expirationDate ? expirationDate.toLocaleDateString(lang === 'sv' ? 'sv-SE' : 'en-US', {
                    month: 'short', day: 'numeric'
                }) : '';

                return {
                    ...room,
                    accuracy,
                    studentCount: uniqueStudents,
                    expirationText: isExpired
                        ? (lang === 'sv' ? "Utgick" : "Expired")
                        : (lang === 'sv' ? `Raderas ${formattedExpires}` : `Expires ${formattedExpires}`)
                };
            });

            setArchivedSessions(processed);
        } catch (err) { console.error("Archive Fetch Error:", err); }
        finally { setIsLoadingArchive(false); }
    };

    const activeCategoryData = CATEGORIES[expandedCategory];
    const activeDomainVisual = DOMAIN_VISUALS[expandedCategory] || DOMAIN_VISUALS.arithmetic;

    return (
        <div className="layout-wrapper relative z-10 animate-in fade-in pb-12">
            <div className={`pt-3 w-full max-w-[1400px] mx-auto px-4 sm:px-6 ${
                isEducator
                    ? 'grid grid-cols-1 lg:grid-cols-[268px_1fr] xl:grid-cols-[284px_1fr] gap-6'
                    : 'flex flex-col gap-4'
            }`}>
                {/* LEFT COLUMN: TEACHER COMMAND CENTER */}
                {isEducator && (
                    <aside className="w-full flex flex-col gap-3.5">
                        <div data-tour="dash-educator-profile" className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-4 flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-[var(--role-primary)] rounded-lg flex items-center justify-center text-white shrink-0">
                                    <Users size={18} />
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-sm font-bold text-[var(--text-main)] leading-tight truncate">
                                        {profile?.full_name || "Lärare"}
                                    </h1>
                                    <p className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-1 truncate mt-0.5">
                                        <Target size={11} className="shrink-0" /> {profile?.school_name || "Anpassa"}
                                    </p>
                                </div>
                            </div>

                            {(() => {
                                const sub = formatSubscriptionDate(profile?.subscription_end_date || profile?.subscription_ends_at, lang);
                                if (!sub) return null;
                                return (
                                    <div className="flex items-center gap-2 text-xs font-semibold bg-[var(--bg-surface)] px-2.5 py-1.5 rounded-lg border border-[var(--border-main)]">
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${sub.isExpired ? 'bg-[var(--role-attention)]' : 'bg-[var(--role-primary)]'}`} />
                                        <span className={sub.isExpired ? 'text-[var(--role-attention-text)] font-bold' : 'text-[var(--text-muted)]'}>
                                            {sub.text}
                                        </span>
                                    </div>
                                );
                            })()}

                            <div className="flex flex-col items-center px-3 py-2.5 rounded-lg bg-[var(--bg-surface)] border-l-4 border-l-[var(--role-primary)] border border-[var(--border-main)]">
                                <span className="text-xs font-semibold text-[var(--text-muted)] mb-0.5">
                                    {t.class_code_label}
                                </span>
                                <span className="text-lg font-extrabold font-mono tracking-[0.18em] text-[var(--text-main)] uppercase">
                                    {profile?.class_code || "---"}
                                </span>

                                {profile?.class_code && (
                                    <button
                                        type="button"
                                        onClick={() => setShowCapacityModal(true)}
                                        className="mt-2 flex items-center gap-1.5 px-2.5 py-1 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-lg text-xs font-semibold text-[var(--text-main)] hover:border-[var(--role-primary)] hover:text-[var(--role-primary-text)] transition-colors cursor-pointer"
                                    >
                                        <Users size={11} className="text-[var(--role-primary-text)]" />
                                        <span>{lang === 'sv' ? "Hantera platser" : "Manage slots"}</span>
                                    </button>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={onProfileOpen}
                                className="w-full flex items-center justify-center gap-2 py-2 bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-main)] rounded-lg text-xs font-semibold hover:border-[var(--role-primary)] hover:text-[var(--role-primary-text)] transition-colors cursor-pointer"
                            >
                                <Settings size={13} /> {t.profile_btn}
                            </button>
                        </div>

                        <div data-tour="dash-educator-tools" className="flex flex-col gap-2">
                            <span className="text-xs font-semibold text-[var(--text-muted)] px-1">
                                {t.tools_section}
                            </span>

                            <button
                                type="button"
                                onClick={() => setIsLibraryModalOpen(true)}
                                className="group flex items-center gap-3 p-3.5 bg-[var(--role-primary)] hover:bg-[var(--role-primary-hover)] text-white rounded-xl transition-colors active:scale-[0.98] text-left w-full cursor-pointer"
                            >
                                <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center shrink-0">
                                    <Zap size={17} fill="currentColor" />
                                </div>
                                <div className="min-w-0">
                                    <span className="block font-bold text-sm leading-tight">{t.studio_title}</span>
                                    <span className="text-xs font-medium text-white/85 block truncate mt-0.5">{t.studio_desc}</span>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={onFractionLabOpen}
                                className="card-tactile border-l-4 border-l-[var(--role-guide)] group flex items-center gap-3 p-3 text-left w-full cursor-pointer"
                            >
                                <div className="w-8 h-8 bg-[var(--role-guide-soft)] border border-[var(--role-guide)]/30 rounded-lg flex items-center justify-center text-[var(--role-guide-text)] shrink-0">
                                    <PieChart size={16} />
                                </div>
                                <div className="min-w-0">
                                    <span className="block font-bold text-xs text-[var(--text-main)] group-hover:text-[var(--role-guide-text)] leading-tight truncate">
                                        {lang === 'sv' ? "Digitala laborationer" : "Digital Manipulatives"}
                                    </span>
                                    <span className="text-xs font-medium text-[var(--text-muted)] block truncate mt-0.5">
                                        {lang === 'sv' ? "Bråk, Algebra, Geometri" : "Fraction, Algebra, Geometry"}
                                    </span>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={onLabOpen}
                                className="card-tactile border-l-4 border-l-[var(--role-attention)] group flex items-center gap-3 p-3 text-left w-full cursor-pointer"
                            >
                                <div className="w-8 h-8 bg-[var(--role-attention-soft)] border border-[var(--role-attention)]/30 rounded-lg flex items-center justify-center text-[var(--role-attention-text)] shrink-0">
                                    <Beaker size={16} />
                                </div>
                                <div className="min-w-0">
                                    <span className="block font-bold text-xs text-[var(--text-main)] group-hover:text-[var(--role-attention-text)] leading-tight">
                                        Test Lab
                                    </span>
                                    <span className="text-xs font-medium text-[var(--text-muted)] block truncate mt-0.5">
                                        {lang === 'sv' ? 'Övningsprov & diagnoser' : 'Practice tests'}
                                    </span>
                                </div>
                            </button>

                            <div className="flex items-center gap-2.5 p-2.5 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl w-full">
                                <div className="w-8 h-8 bg-[var(--role-primary-soft)] border border-[var(--brand-border)] rounded-lg flex items-center justify-center text-[var(--role-primary-text)] shrink-0">
                                    <Clock size={15} />
                                </div>
                                <div className="flex-1 flex items-center gap-1.5">
                                    <select
                                        value={timerSettings.duration / 60}
                                        onChange={(e) => toggleTimer(Number(e.target.value))}
                                        className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-main)] text-[var(--text-main)] py-1.5 px-2.5 rounded-lg text-xs font-bold font-mono outline-none cursor-pointer focus:border-[var(--role-primary)]"
                                    >
                                        <option value="0">{t.timer_off}</option>
                                        {[5, 10, 15, 30, 45, 60].map(m => <option key={m} value={m}>{m} min</option>)}
                                    </select>
                                    {timerSettings.duration > 0 && (
                                        <button
                                            type="button"
                                            onClick={resetTimer}
                                            className="p-1.5 text-[var(--role-attention-text)] bg-[var(--role-attention-soft)] rounded-lg border border-[var(--role-attention)]/30 hover:opacity-85 transition-opacity cursor-pointer"
                                        >
                                            <RotateCcw size={13} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={onTimesTableOpen}
                                    className="card-tactile w-full flex flex-col items-center justify-center gap-1.5 p-3 text-center cursor-pointer"
                                >
                                    <Grid3X3 size={16} className="text-[var(--role-primary-text)]" />
                                    <span className="font-bold text-xs text-[var(--text-main)]">{t.times_table_title}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={onStatsOpen}
                                    className="card-tactile w-full flex flex-col items-center justify-center gap-1.5 p-3 text-center cursor-pointer"
                                >
                                    <BarChart3 size={16} className="text-[var(--role-guide-text)]" />
                                    <span className="font-bold text-xs text-[var(--text-main)]">{t.stats_title}</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-2 grid grid-cols-2 gap-1.5">
                            <button
                                type="button"
                                onClick={onContentOpen}
                                className="px-2.5 py-2 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-xs font-semibold text-[var(--text-main)] flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <span className="truncate">{t.content_map}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowDashboardTutorial(true)}
                                className="px-2.5 py-2 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-xs font-semibold text-[var(--text-main)] flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <HelpCircle size={12} className="text-[var(--role-guide-text)] shrink-0" />
                                <span className="truncate">{lang === 'sv' ? "Snabbguide" : "Quick Guide"}</span>
                            </button>
                            <button
                                type="button"
                                onClick={onLgrOpen}
                                className="px-2.5 py-2 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-xs font-semibold text-[var(--text-main)] flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <Book size={12} className="text-[var(--role-primary-text)] shrink-0" />
                                <span className="truncate">{t.lgr_link}</span>
                            </button>
                            <button
                                type="button"
                                onClick={onAboutOpen}
                                className="px-2.5 py-2 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-xs font-semibold text-[var(--text-main)] flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <Info size={12} className="text-[var(--text-muted)] shrink-0" />
                                <span className="truncate">{t.about_link}</span>
                            </button>
                            
                        </div>
                    </aside>
                )}

                {/* MAIN CONTENT COLUMN */}
                <main className="w-full min-w-0 flex flex-col">
                    {activeSessions.length > 0 && isEducator && (
                        <div className="mb-4 p-4 bg-[var(--role-attention)] rounded-xl flex flex-col gap-2.5 animate-in slide-in-from-top-2 duration-140 text-white">
                            <div className="flex items-center justify-between border-b border-white/15 pb-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                    <h3 className="text-xs font-bold tracking-wide text-white">
                                        {activeSessions.length === 1
                                            ? t.resume_h
                                            : t.active_sessions_count(activeSessions.length)}
                                    </h3>
                                </div>
                                <span className="text-xs font-medium text-white/85">
                                    {t.click_to_resume}
                                </span>
                            </div>

                            <div className={`grid gap-2 ${activeSessions.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                                {activeSessions.map((sessionItem) => {
                                    const modeLabel = sessionItem.active_question_data?.mode
                                        ? String(sessionItem.active_question_data.mode).replace(/^activity_/, '').replace(/_/g, ' ')
                                        : null;

                                    return (
                                        <div
                                            key={sessionItem.id}
                                            className="bg-black/15 hover:bg-black/25 border border-white/15 rounded-lg p-2.5 flex items-center justify-between gap-3 transition-colors"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                <div className="w-8 h-8 rounded-lg bg-white text-[var(--role-attention)] flex items-center justify-center shrink-0">
                                                    <PlayCircle size={17} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 truncate">
                                                        <span className="font-bold text-xs text-white truncate">
                                                            {sessionItem.title || t.untitled_session}
                                                        </span>
                                                        {modeLabel && (
                                                            <span className="text-xs font-semibold bg-white/20 text-white px-1.5 py-0.5 rounded shrink-0">
                                                                {modeLabel}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs font-medium text-white/85 font-mono">
                                                        {t.pin_label}: <span className="text-white font-bold tracking-widest">{sessionItem.class_code}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => onRelaunch(sessionItem)}
                                                className="shrink-0 px-3.5 py-1.5 bg-white text-[var(--role-attention-text)] hover:bg-white/90 rounded-lg font-bold text-xs transition-colors cursor-pointer"
                                            >
                                                {t.resume_btn}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {isEducator && (
                        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                            <div
                                data-tour="dash-educator-tabs"
                                className="inline-flex bg-[var(--bg-surface)] p-1 rounded-xl border border-[var(--border-main)] gap-1"
                            >
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('curriculum')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                                        activeTab === 'curriculum'
                                            ? 'bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-main)]'
                                            : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                    }`}
                                >
                                    <Book size={13} className={activeTab === 'curriculum' ? 'text-[var(--role-primary-text)]' : ''} />
                                    {t.curriculum_title}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab('hub')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                                        activeTab === 'hub'
                                            ? 'bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-main)]'
                                            : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                    }`}
                                >
                                    <Layers size={13} className={activeTab === 'hub' ? 'text-[var(--role-guide-text)]' : ''} />
                                    {lang === 'sv' ? "Grupper" : "Custom Units"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab('archive')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                                        activeTab === 'archive'
                                            ? 'bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-main)]'
                                            : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                    }`}
                                >
                                    <History size={13} className={activeTab === 'archive' ? 'text-[var(--role-attention-text)]' : ''} />
                                    {t.archive_title}
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowUpdateLog(true)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] hover:border-[var(--role-primary)] text-xs transition-colors group cursor-pointer"
                                title={t.view_all}
                            >
                                <Sparkles size={13} className="text-[var(--role-primary)] shrink-0" />
                                <span className="truncate max-w-[160px] lg:max-w-[220px] text-[var(--text-main)] font-bold">
                                    {latestUpdate.title[lang]}
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs font-bold font-mono text-[var(--text-muted)]">
                                    v{latestUpdate.version}
                                </span>
                            </button>
                        </div>
                    )}

                    {activeTab === 'hub' ? (
                        <div className="animate-in fade-in duration-140 pb-20">
                            <TeacherHubManager lang={lang} teacherId={profile?.id} />
                        </div>
                    ) : activeTab === 'curriculum' ? (
                        <div className="flex flex-col space-y-4 animate-in fade-in duration-140">
                            <div data-tour="dash-concept-search" className="relative">
                                <ConceptMapDashboard
                                    lang={lang}
                                    diagnosticTarget={diagnosticTarget}
                                    onSetDiagnosticTarget={setDiagnosticTarget}
                                    onSelect={onSelect}
                                    onStart={onStart}
                                    studentTools={!isEducator ? {
                                        onFractionLabOpen,
                                        onTimesTableOpen,
                                        timerSettings,
                                        toggleTimer,
                                        resetTimer
                                    } : null}
                                />

                                {!isEducator && !diagnosticTarget && (
                                    <div className="mt-2 sm:mt-0 sm:absolute sm:top-3 sm:right-3 z-20 flex justify-end pointer-events-none">
                                        <button
                                            type="button"
                                            onClick={() => setShowDashboardTutorial(true)}
                                            className="pointer-events-auto px-3 py-1.5 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] border border-[var(--border-main)] hover:border-[var(--role-guide)] text-xs font-semibold text-[var(--text-main)] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                                        >
                                            <HelpCircle size={13} className="text-[var(--role-guide-text)] shrink-0" />
                                            <span>{lang === 'sv' ? 'Guide' : 'Guide'}</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {!diagnosticTarget && hasStudentUnits && (
                                <div className="inline-flex self-start bg-[var(--bg-surface)] p-1 rounded-xl border border-[var(--border-main)] gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setStudentTab('units')}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                                            studentTab === 'units'
                                                ? 'bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-main)]'
                                                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                        }`}
                                    >
                                        <Layers size={13} className={studentTab === 'units' ? 'text-[var(--role-primary-text)]' : ''} />
                                        <span>{lang === 'sv' ? 'Mina områden' : 'My Units'}</span>
                                        {studentBuckets.length > 0 && (
                                            <span className="px-1.5 py-0.5 rounded bg-[var(--role-primary-soft)] text-[var(--role-primary-text)] font-mono text-xs">
                                                {studentBuckets.length}
                                            </span>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setStudentTab('library')}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                                            studentTab === 'library'
                                                ? 'bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-main)]'
                                                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                        }`}
                                    >
                                        <Compass size={13} className={studentTab === 'library' ? 'text-[var(--role-guide-text)]' : ''} />
                                        <span>{lang === 'sv' ? 'Hela biblioteket' : 'Full Library'}</span>
                                    </button>
                                </div>
                            )}

                            {!diagnosticTarget && (
                                isShowingStudentGateway ? (
                                    loadingBuckets ? (
                                        <div className="py-16 flex items-center justify-center">
                                            <div className="animate-spin h-8 w-8 border-4 border-[var(--role-primary)] border-t-transparent rounded-full" />
                                        </div>
                                    ) : (
                                        <StudentGateway
                                            embedded={true}
                                            buckets={studentBuckets}
                                            folderOrder={folderOrder}
                                            profile={profile}
                                            onSelectBucket={onSelectBucket}
                                            onResumeUnitStep={onResumeUnitStep}
                                            lang={lang}
                                        />
                                    )
                                ) : isShowingCuratedRoadmap ? (
                                    <div className="space-y-4">
                                        {progressPercentage === 100 && (
                                            <div className="w-full bg-[var(--role-primary)] rounded-xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
                                                        <Award size={26} className="text-[#f8fbdb]" />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-semibold text-white/85 block">
                                                            {lang === 'sv' ? "Område slutförd" : "Unit Complete"}
                                                        </span>
                                                        <h3 className="text-lg font-extrabold leading-tight">
                                                            {lang === 'sv' ? "Alla moment är avklarade!" : "All parts completed!"}
                                                        </h3>
                                                        <p className="text-xs font-medium text-white/90 mt-0.5">
                                                            {lang === 'sv'
                                                                ? `Du har gått igenom alla ${allUnitSteps.length} moment i ${activeBucket.name}.`
                                                                : `You have mastered all ${allUnitSteps.length} steps in ${activeBucket.name}.`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={onBackToGateway}
                                                    className="w-full sm:w-auto px-5 py-2.5 bg-white text-[var(--role-primary-text)] hover:bg-white/90 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                                                >
                                                    {lang === 'sv' ? "Välj ny område →" : "Choose New Unit →"}
                                                </button>
                                            </div>
                                        )}

                                        <div data-tour="dash-unit-banner">
                                            <UnitStudyGuideBanner
                                                bucket={activeBucket}
                                                completedStepIds={completedStepIds}
                                                lang={lang}
                                                onChangeUnit={onBackToGateway}
                                                onOpenTestLab={onLabOpen}
                                            />
                                        </div>

                                        <div data-tour="dash-unit-parts" className="space-y-3">
                                            {curatedParts.map((part, pIdx) => {
                                                const partSteps = part.steps || [];
                                                const partCompletedCount = partSteps.filter(s => checkIsStepCompleted(s, completedStepIds)).length;
                                                const isPartFullyCompleted = partSteps.length > 0 && partCompletedCount === partSteps.length;
                                                const isPartCollapsed = collapsedPartSections[part.id] !== undefined
                                                    ? Boolean(collapsedPartSections[part.id])
                                                    : true;

                                                const defaultStep = partSteps.find(s => !checkIsStepCompleted(s, completedStepIds)) || partSteps[0] || null;
                                                const inspectedStep = partSteps.find(s => s.id === inspectedStepByPart[part.id]) || defaultStep;

                                                const handleExpandOrTogglePart = () => {
                                                    const willOpen = isPartCollapsed;
                                                    setCollapsedPartSections(prev => ({ ...prev, [part.id]: !willOpen }));
                                                    if (willOpen && defaultStep) {
                                                        setInspectedStepByPart(prev => ({ ...prev, [part.id]: defaultStep.id }));
                                                        if (defaultStep.type !== 'instruction' && !defaultStep.sheetId && defaultStep.type !== 'test') {
                                                            const tId = defaultStep.topic || defaultStep.topicId || part.topicId;
                                                            setHasUserManuallySelected(true);
                                                            onSelect(tId, defaultStep.level);
                                                            fetchPartStepSample(tId, defaultStep.level, defaultStep.variationKey);
                                                        } else {
                                                            setPartPreviewQuestion(null);
                                                        }
                                                    }
                                                };

                                                const handleSelectStepForPreview = (step) => {
                                                    setInspectedStepByPart(prev => ({ ...prev, [part.id]: step.id }));
                                                    const isStepInst = step.type === 'instruction' || !!step.sheetId;
                                                    const isStepTest = step.type === 'test';
                                                    if (!isStepInst && !isStepTest) {
                                                        const tId = step.topic || step.topicId || part.topicId;
                                                        setHasUserManuallySelected(true);
                                                        onSelect(tId, step.level);
                                                        fetchPartStepSample(tId, step.level, step.variationKey);
                                                    } else {
                                                        setPartPreviewQuestion(null);
                                                    }
                                                };

                                                const inspIsInstruction = inspectedStep && (inspectedStep.type === 'instruction' || !!inspectedStep.sheetId);
                                                const inspIsTest = inspectedStep && inspectedStep.type === 'test';
                                                const inspIsCompleted = inspectedStep ? checkIsStepCompleted(inspectedStep, completedStepIds) : false;
                                                const inspTopicId = inspectedStep ? (inspectedStep.topic || inspectedStep.topicId || part.topicId) : null;
                                                const inspMeta = (!inspIsInstruction && !inspIsTest && inspectedStep)
                                                    ? getLevelMetadata(inspTopicId, inspectedStep.level, lang)
                                                    : null;
                                                const inspLiveDesc = typeof partPreviewQuestion?.renderData?.description === 'object'
                                                    ? (partPreviewQuestion.renderData.description[lang] || partPreviewQuestion.renderData.description.sv || '')
                                                    : (partPreviewQuestion?.renderData?.description || '');

                                                return (
                                                    <div
                                                        key={part.id || pIdx}
                                                        className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] overflow-hidden transition-colors"
                                                    >
                                                        <div
                                                            onClick={handleExpandOrTogglePart}
                                                            className="bg-[var(--bg-surface)]/70 hover:bg-[var(--bg-surface)] px-4 py-3 border-b border-[var(--border-main)] flex items-center justify-between cursor-pointer select-none group transition-colors"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className={`w-7 h-7 rounded-lg text-white text-xs font-extrabold font-mono flex items-center justify-center shrink-0 ${
                                                                    isPartFullyCompleted ? 'bg-[var(--role-primary)]' : 'bg-[#0c120c] dark:bg-[var(--bg-card)] border border-[var(--border-strong)]'
                                                                }`}>
                                                                    {isPartFullyCompleted ? <Check size={14} strokeWidth={3} /> : pIdx + 1}
                                                                </span>
                                                                <div className="flex items-center gap-2">
                                                                    <h3 className="font-bold text-sm text-[var(--text-main)] group-hover:text-[var(--role-primary-text)] transition-colors">
                                                                        {getPartDisplayTitle(part, pIdx, lang)}
                                                                    </h3>
                                                                    {isPartFullyCompleted && (
                                                                        <span className="bg-[var(--role-primary-soft)] text-[var(--role-primary-text)] border border-[var(--brand-border)] text-xs font-bold px-2 py-0.5 rounded-md">
                                                                            {lang === 'sv' ? "Klar ✓" : "Done ✓"}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xs font-semibold font-mono text-[var(--text-muted)]">
                                                                    {partCompletedCount}/{partSteps.length} {lang === 'sv' ? "klara" : "done"}
                                                                </span>
                                                                <div className="text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors p-1">
                                                                    {isPartCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {!isPartCollapsed && (
                                                            <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                                                                <div className="lg:col-span-6 space-y-1">
                                                                    {partSteps.map((step, sIdx) => {
                                                                        const isCompleted = checkIsStepCompleted(step, completedStepIds);
                                                                        const isInstruction = step.type === 'instruction' || !!step.sheetId;
                                                                        const isTest = step.type === 'test';
                                                                        const isNextActive = nextUnfinishedStep?.id === step.id;
                                                                        const isInspected = inspectedStep?.id === step.id;

                                                                        const safeTopic = step.topic || step.topicId || part.topicId;
                                                                        const { description } = getLevelMetadata(safeTopic, step.level, lang);

                                                                        return (
                                                                            <div key={step.id || sIdx} className="relative flex items-stretch gap-3">
                                                                                <div className="flex flex-col items-center shrink-0 w-7 select-none">
                                                                                    <div className={`w-[2px] flex-1 ${
                                                                                        sIdx === 0 ? 'bg-transparent' : isCompleted ? 'bg-[var(--role-primary)]' : 'bg-[var(--border-strong)]'
                                                                                    }`} />

                                                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold font-mono text-xs shrink-0 z-10 transition-colors my-1 ${
                                                                                        isInstruction
                                                                                            ? 'bg-[var(--role-guide)] text-white'
                                                                                            : isTest
                                                                                                ? isCompleted ? 'bg-[var(--role-primary)] text-white' : 'bg-[var(--role-attention)] text-white'
                                                                                                : isCompleted
                                                                                                    ? 'bg-[var(--role-primary)] text-white'
                                                                                                    : isInspected
                                                                                                        ? 'bg-[var(--role-primary)] text-white ring-2 ring-[var(--role-primary)]/30'
                                                                                                        : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-strong)]'
                                                                                    }`}>
                                                                                        {isInstruction ? (
                                                                                            <BookOpen size={13} />
                                                                                        ) : isTest ? (
                                                                                            <Beaker size={13} />
                                                                                        ) : isCompleted ? (
                                                                                            <Check size={13} strokeWidth={3} />
                                                                                        ) : (
                                                                                            sIdx + 1
                                                                                        )}
                                                                                    </div>

                                                                                    <div className={`w-[2px] flex-1 ${
                                                                                        sIdx === partSteps.length - 1 ? 'bg-transparent' : isCompleted && completedStepIds.includes(partSteps[sIdx + 1]?.id) ? 'bg-[var(--role-primary)]' : 'bg-[var(--border-strong)]'
                                                                                    }`} />
                                                                                </div>

                                                                                <div className="flex-1 min-w-0 py-1">
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => handleSelectStepForPreview(step)}
                                                                                        className={`w-full text-left p-3 rounded-xl border transition-colors flex items-center justify-between gap-2.5 cursor-pointer ${
                                                                                            isInspected
                                                                                                ? isInstruction
                                                                                                    ? 'bg-[var(--role-guide-soft)] border-[var(--role-guide)]'
                                                                                                    : isTest
                                                                                                        ? 'bg-[var(--role-attention-soft)] border-[var(--role-attention)]'
                                                                                                        : 'bg-[var(--role-primary-soft)] border-[var(--role-primary)]'
                                                                                                : 'bg-[var(--bg-surface)]/50 hover:bg-[var(--bg-surface)] border-[var(--border-main)] hover:border-[var(--border-strong)]'
                                                                                        }`}
                                                                                    >
                                                                                        <div className="min-w-0 flex-1">
                                                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                                                <span className="font-bold text-xs sm:text-sm text-[var(--text-main)] truncate">
                                                                                                    {isInstruction
                                                                                                        ? step.sheetTitle
                                                                                                        : isTest
                                                                                                            ? (step.title || (lang === 'sv' ? "Delprov" : "Checkpoint"))
                                                                                                            : getTopicName(safeTopic, lang)}
                                                                                                </span>

                                                                                                {isInstruction ? (
                                                                                                    <span className="bg-[var(--role-guide-soft)] text-[var(--role-guide-text)] text-xs font-bold px-2 py-0.5 rounded shrink-0">
                                                                                                        {lang === 'sv' ? "Genomgång" : "Walkthrough"}
                                                                                                    </span>
                                                                                                ) : isTest ? (
                                                                                                    <span className="bg-[var(--role-attention-soft)] text-[var(--role-attention-text)] text-xs font-bold px-2 py-0.5 rounded shrink-0">
                                                                                                        {step.testMode === 'exam' ? (lang === 'sv' ? "Prov" : "Exam") : (lang === 'sv' ? "Delprov" : "Checkpoint")}
                                                                                                    </span>
                                                                                                ) : (
                                                                                                    <span className="bg-[var(--role-primary-soft)] text-[var(--role-primary-text)] text-xs font-bold font-mono px-2 py-0.5 rounded shrink-0">
                                                                                                        {lang === 'sv' ? `Nivå ${step.level}` : `Level ${step.level}`}
                                                                                                    </span>
                                                                                                )}

                                                                                                {isNextActive && !isCompleted && (
                                                                                                    <span className="w-2 h-2 rounded-full bg-[var(--role-primary)] animate-pulse shrink-0" />
                                                                                                )}
                                                                                            </div>

                                                                                            {!isInstruction && (
                                                                                                <p className="text-xs font-medium text-[var(--text-muted)] truncate mt-0.5">
                                                                                                    {isTest
                                                                                                        ? `${step.questionCount || 10} ${lang === 'sv' ? "blandade frågor" : "mixed questions"}`
                                                                                                        : description}
                                                                                                </p>
                                                                                            )}
                                                                                        </div>

                                                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                                                            {isCompleted && (
                                                                                                <span className="w-5 h-5 rounded-full bg-[var(--role-primary)] text-white flex items-center justify-center">
                                                                                                    <Check size={11} strokeWidth={3} />
                                                                                                </span>
                                                                                            )}
                                                                                            <ChevronRight size={15} className={`transition-transform duration-140 ${isInspected ? 'text-[var(--text-main)] translate-x-0.5' : 'text-[var(--text-muted)]'}`} />
                                                                                        </div>
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>

                                                                {inspectedStep && (
                                                                    <div className="lg:col-span-6 lg:sticky lg:top-6 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl p-5 space-y-4">
                                                                        {inspIsInstruction ? (
                                                                            <>
                                                                                <div className="flex items-start justify-between gap-3">
                                                                                    <div>
                                                                                        <span className="text-xs font-semibold text-[var(--role-guide-text)]">
                                                                                            {lang === 'sv' ? "Interaktiv genomgång" : "Interactive Walkthrough"}
                                                                                        </span>
                                                                                        <h4 className="text-base font-extrabold text-[var(--text-main)] mt-0.5">
                                                                                            {inspectedStep.sheetTitle}
                                                                                        </h4>
                                                                                    </div>
                                                                                    {inspIsCompleted && (
                                                                                        <span className="px-2.5 py-1 rounded-lg bg-[var(--role-primary-soft)] text-[var(--role-primary-text)] text-xs font-bold shrink-0">
                                                                                            {lang === 'sv' ? "Sedd ✓" : "Viewed ✓"}
                                                                                        </span>
                                                                                    )}
                                                                                </div>

                                                                                <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] text-xs font-medium text-[var(--text-muted)] leading-relaxed flex items-start gap-3">
                                                                                    <div className="w-9 h-9 rounded-lg bg-[var(--role-guide-soft)] text-[var(--role-guide-text)] flex items-center justify-center shrink-0">
                                                                                        <BookOpen size={18} />
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="text-[var(--text-main)] font-bold mb-0.5">
                                                                                            {lang === 'sv' ? "Steg-för-steg förklaring" : "Step-by-step explanation"}
                                                                                        </p>
                                                                                        <p>
                                                                                            {lang === 'sv'
                                                                                                ? "Gå igenom metod och exempel i lugn och ro innan du börjar öva på egen hand."
                                                                                                : "Review the method and worked examples at your own pace before practicing."}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>

                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => onStartUnitStep ? onStartUnitStep(inspectedStep, part) : handleOpenInstruction(inspectedStep)}
                                                                                    className="w-full py-3 px-4 rounded-lg bg-[var(--role-guide)] hover:opacity-95 text-white font-bold text-xs transition-opacity active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                                                                                >
                                                                                    <Play size={14} fill="currentColor" />
                                                                                    <span>
                                                                                        {inspIsCompleted
                                                                                            ? (lang === 'sv' ? "Repetera genomgång →" : "Review Walkthrough →")
                                                                                            : (lang === 'sv' ? "Öppna genomgång →" : "Open Walkthrough →")}
                                                                                    </span>
                                                                                </button>
                                                                            </>
                                                                        ) : inspIsTest ? (
                                                                            <>
                                                                                <div className="flex items-start justify-between gap-3">
                                                                                    <div>
                                                                                        <span className="text-xs font-semibold text-[var(--role-attention-text)]">
                                                                                            {inspectedStep.testMode === 'exam'
                                                                                                ? (lang === 'sv' ? "Slutprov" : "Unit Exam")
                                                                                                : (lang === 'sv' ? "Kunskapskontroll" : "Checkpoint Quiz")}
                                                                                        </span>
                                                                                        <h4 className="text-base font-extrabold text-[var(--text-main)] mt-0.5">
                                                                                            {inspectedStep.title || (lang === 'sv' ? "Delprov" : "Checkpoint")}
                                                                                        </h4>
                                                                                    </div>
                                                                                    <span className="px-2.5 py-1 rounded-lg bg-[var(--role-attention)] text-white text-xs font-bold font-mono shrink-0">
                                                                                        {inspectedStep.questionCount || 10} {lang === 'sv' ? "frågor" : "questions"}
                                                                                    </span>
                                                                                </div>

                                                                                <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] text-xs font-medium text-[var(--text-muted)] leading-relaxed flex items-start gap-3">
                                                                                    <div className="w-9 h-9 rounded-lg bg-[var(--role-attention-soft)] text-[var(--role-attention-text)] flex items-center justify-center shrink-0">
                                                                                        <Beaker size={18} />
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="text-[var(--text-main)] font-bold mb-0.5">
                                                                                            {lang === 'sv' ? "Blandade uppgifter från delmomentet" : "Mixed problems from this section"}
                                                                                        </p>
                                                                                        <p>
                                                                                            {lang === 'sv'
                                                                                                ? "Testa dina kunskaper utan ledtrådar för att checka av att allt sitter."
                                                                                                : "Test your understanding without hints to verify mastery."}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>

                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => onStartUnitStep ? onStartUnitStep(inspectedStep, part) : onStartCheckpoint?.(inspectedStep.configCode, inspectedStep.id)}
                                                                                    className="w-full py-3 px-4 rounded-lg bg-[var(--role-attention)] hover:opacity-95 text-white font-bold text-xs transition-opacity active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                                                                                >
                                                                                    <Play size={14} fill="currentColor" />
                                                                                    <span>
                                                                                        {inspIsCompleted
                                                                                            ? (lang === 'sv' ? "Gör om delprov →" : "Retake Checkpoint →")
                                                                                            : (lang === 'sv' ? "Starta delprov →" : "Start Checkpoint →")}
                                                                                    </span>
                                                                                </button>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <div className="flex items-start justify-between gap-3">
                                                                                    <div>
                                                                                        <span className="text-xs font-semibold text-[var(--role-primary-text)]">
                                                                                            {lang === 'sv' ? "Övningsmoment" : "Practice Skill"}
                                                                                        </span>
                                                                                        <h4 className="text-base font-extrabold text-[var(--text-main)] tracking-tight mt-0.5">
                                                                                            {getTopicName(inspTopicId, lang)}
                                                                                        </h4>
                                                                                        {inspMeta?.description && (
                                                                                            <p className="text-xs font-medium text-[var(--text-muted)] mt-0.5">
                                                                                                {inspMeta.description}
                                                                                            </p>
                                                                                        )}
                                                                                    </div>
                                                                                    <span className="px-2.5 py-1 rounded-lg bg-[var(--role-primary)] text-white text-xs font-bold font-mono shrink-0">
                                                                                        {lang === 'sv' ? `Nivå ${inspectedStep.level}` : `Level ${inspectedStep.level}`}
                                                                                    </span>
                                                                                </div>

                                                                                <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] space-y-2.5">
                                                                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                                                                        <span className="text-xs font-semibold text-[var(--text-muted)]">
                                                                                            {lang === 'sv' ? "Så här ser en uppgift ut:" : "Sample problem:"}
                                                                                        </span>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => fetchPartStepSample(inspTopicId, inspectedStep.level, inspectedStep.variationKey)}
                                                                                            disabled={isFetchingPartPreview}
                                                                                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-main)] hover:border-[var(--role-primary)] transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                                                                        >
                                                                                            <RotateCcw size={11} className={isFetchingPartPreview ? "animate-spin" : ""} />
                                                                                            <span>{lang === 'sv' ? "Nytt exempel" : "New example"}</span>
                                                                                        </button>
                                                                                    </div>

                                                                                    <div className="min-h-[100px] p-4 rounded-lg bg-[var(--bg-surface)]/50 border border-[var(--border-main)] flex flex-col justify-center items-center text-center overflow-visible">
                                                                                        {isFetchingPartPreview ? (
                                                                                            <span className="text-xs font-semibold text-[var(--text-muted)] animate-pulse">
                                                                                                {lang === 'sv' ? "Hämtar exempel..." : "Loading example..."}
                                                                                            </span>
                                                                                        ) : partPreviewQuestion?.renderData ? (
                                                                                            <div className="space-y-3 w-full flex flex-col items-center">
                                                                                                <div className="w-full max-w-[320px] flex justify-center items-center mx-auto overflow-visible empty:hidden whiteboard-protect rounded-lg">
                                                                                                    <VisualRenderer
                                                                                                        data={partPreviewQuestion.renderData}
                                                                                                        isWordProblem={false}
                                                                                                    />
                                                                                                </div>

                                                                                                {partPreviewQuestion.renderData.latex && (
                                                                                                    <div className="text-lg sm:text-xl font-bold text-[var(--text-main)]">
                                                                                                        <MathDisplay content={`$$${partPreviewQuestion.renderData.latex}$$`} />
                                                                                                    </div>
                                                                                                )}

                                                                                                {inspLiveDesc && (
                                                                                                    <div className="text-xs font-medium text-[var(--text-main)] leading-relaxed max-w-md text-center">
                                                                                                        <MathDisplay content={inspLiveDesc} />
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                        ) : inspMeta?.mathExample ? (
                                                                                            <div className="text-base sm:text-lg font-bold text-[var(--text-main)] w-full">
                                                                                                <MathDisplay content={inspMeta.mathExample} />
                                                                                            </div>
                                                                                        ) : (
                                                                                            <span className="text-xs font-medium text-[var(--text-muted)]">
                                                                                                {inspMeta?.description}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>

                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        if (onStartUnitStep) {
                                                                                            onStartUnitStep(inspectedStep, part);
                                                                                        } else {
                                                                                            onSelect(inspTopicId, inspectedStep.level);
                                                                                            if (onStart) onStart();
                                                                                        }
                                                                                    }}
                                                                                    className="w-full py-3 px-4 rounded-lg bg-[var(--role-primary)] hover:bg-[var(--role-primary-hover)] text-white font-bold text-xs transition-colors active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                                                                                >
                                                                                    <Play size={14} fill="currentColor" />
                                                                                    <span>
                                                                                        {inspIsCompleted
                                                                                            ? (lang === 'sv' ? `Öva igen på Nivå ${inspectedStep.level} →` : `Practice Level ${inspectedStep.level} Again →`)
                                                                                            : (lang === 'sv' ? `Börja öva Nivå ${inspectedStep.level} →` : `Start Practicing Level ${inspectedStep.level} →`)}
                                                                                    </span>
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    /* HARD DIAGONAL SPLIT TABS + LEFT-STRIPE TOPIC WORKSPACE */
                                    <div className="flex flex-col">
                                        {openDropdownTopicId && (
                                            <div
                                                className="fixed inset-0 z-20"
                                                onClick={() => setOpenDropdownTopicId(null)}
                                            />
                                        )}

                                        <div
                                            data-tour="dash-category-strip"
                                            className="grid grid-cols-2 lg:grid-cols-4 border-t border-x border-[var(--border-main)] rounded-t-xl overflow-hidden bg-[var(--bg-card)]"
                                        >
                                            {Object.entries(CATEGORIES).map(([catKey, category], idx) => {
                                                const isActive = expandedCategory === catKey;
                                                const vis = DOMAIN_VISUALS[catKey] || DOMAIN_VISUALS.arithmetic;
                                                const DomainIcon = vis.Icon;

                                                return (
                                                    <button
                                                        key={catKey}
                                                        type="button"
                                                        onClick={() => setExpandedCategory(catKey)}
                                                        style={{
                                                            background: isActive ? vis.tabActiveSplit : vis.tabInactiveBg,
                                                            borderBottom: isActive
                                                                ? '1px solid transparent'
                                                                : '1px solid var(--border-main)'
                                                        }}
                                                        className={`group relative overflow-hidden text-left px-4 py-3.5 transition-[background,color,border-color] duration-140 ease-[cubic-bezier(0.2,0,0,1)] cursor-pointer flex items-center justify-between gap-2.5 min-h-[54px] ${
                                                            idx > 0 ? 'border-l border-[var(--border-main)]' : ''
                                                        }`}
                                                    >
                                                        <DomainIcon
                                                            size={58}
                                                            strokeWidth={1.6}
                                                            style={{ color: vis.accent }}
                                                            aria-hidden="true"
                                                            className={`pointer-events-none select-none absolute -right-2 -bottom-2 -rotate-12 transition-transform duration-140 ease-[cubic-bezier(0.2,0,0,1)] ${
                                                                isActive
                                                                    ? 'opacity-[0.18] scale-105'
                                                                    : 'opacity-[0.07] group-hover:opacity-[0.12]'
                                                            }`}
                                                        />

                                                        <span
                                                            className={`relative z-10 text-sm tracking-tight truncate ${
                                                                isActive
                                                                    ? 'font-extrabold text-[var(--text-main)]'
                                                                    : 'font-semibold text-[var(--text-muted)] group-hover:text-[var(--text-main)]'
                                                            }`}
                                                        >
                                                            {category.label[lang]}
                                                        </span>

                                                        <span
                                                            style={
                                                                isActive
                                                                    ? { backgroundColor: vis.accent, color: '#ffffff' }
                                                                    : { backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' }
                                                            }
                                                            className="relative z-10 px-2 py-0.5 rounded-full text-xs font-mono font-bold shrink-0"
                                                        >
                                                            {category.topics.length}
                                                        </span>

                                                        {isActive && (
                                                            <span
                                                                style={{ backgroundColor: vis.accent }}
                                                                className="absolute bottom-0 left-0 right-0 h-[3px]"
                                                            />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <div
                                            data-tour="dash-topic-grid"
                                            className="bg-[var(--bg-card)] border-x border-b border-[var(--border-main)] rounded-b-xl p-4 sm:p-5 space-y-4 -mt-px"
                                        >

                                            {/* Flush Topic Workspace Container (No Redundant Subheader) */}
                                            <div
                                                key={expandedCategory}
                                                data-tour="dash-topic-grid"
                                                className="bg-[var(--bg-card)] border-x border-b border-[var(--border-main)] rounded-b-xl p-3.5 sm:p-4 -mt-px animate-in fade-in duration-140"
                                            >
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {activeCategoryData.topics.map(topic => {
                                                        const isThisTopicSelected = selectedTopic === topic.id && selectedLevel > 0;
                                                        const isDropdownOpen = openDropdownTopicId === topic.id;
                                                        const availableLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter(
                                                            lvl => LEVEL_DESCRIPTIONS[topic.id]?.[lvl]
                                                        );

                                                        const diagnosticStartLvl = availableLevels.length > 0
                                                            ? availableLevels[Math.min(Math.floor((availableLevels.length - 1) / 2), 2)]
                                                            : 1;

                                                        const selectedMeta = isThisTopicSelected
                                                            ? getLevelMetadata(topic.id, selectedLevel, lang)
                                                            : null;

                                                        return (
                                                            <div
                                                                key={topic.id}
                                                                style={
                                                                    isThisTopicSelected
                                                                        ? {
                                                                            backgroundColor: 'var(--bg-card)',
                                                                            borderColor: activeDomainVisual.accent,
                                                                            borderLeftWidth: '4px',
                                                                            borderLeftColor: activeDomainVisual.accent
                                                                        }
                                                                        : {
                                                                            backgroundColor: 'var(--bg-surface)',
                                                                            borderLeftWidth: '4px',
                                                                            borderLeftColor: activeDomainVisual.borderTint
                                                                        }
                                                                }
                                                                className={`relative p-3.5 rounded-lg border border-[var(--border-main)] transition-colors duration-140 ${
                                                                    isDropdownOpen ? 'z-30' : 'z-10'
                                                                }`}
                                                            >
                                                                <div className="font-bold text-[var(--text-main)] mb-2.5 flex items-center justify-between gap-2 text-sm leading-snug">
                                                                    <span className="truncate">{topic.label[lang]}</span>
                                                                    <span
                                                                        style={{
                                                                            backgroundColor: activeDomainVisual.softBg,
                                                                            color: 'var(--text-main)',
                                                                            borderColor: activeDomainVisual.borderTint
                                                                        }}
                                                                        className="text-xs font-bold font-mono px-2 py-0.5 rounded border shrink-0"
                                                                    >
                                                                        {availableLevels.length} {lang === 'sv' ? 'nivåer' : 'levels'}
                                                                    </span>
                                                                </div>

                                                                <div className="relative">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setOpenDropdownTopicId(isDropdownOpen ? null : topic.id)}
                                                                        style={
                                                                            isDropdownOpen || isThisTopicSelected
                                                                                ? { borderColor: activeDomainVisual.accent }
                                                                                : undefined
                                                                        }
                                                                        className="w-full py-2 pl-3 pr-2.5 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-lg text-xs font-semibold text-[var(--text-main)] flex items-center justify-between gap-2 transition-colors cursor-pointer text-left"
                                                                    >
                                                                        <span className="truncate">
                                                                            {isThisTopicSelected ? (
                                                                                <>
                                                                                    <span
                                                                                        style={{ color: activeDomainVisual.accent }}
                                                                                        className="font-bold font-mono"
                                                                                    >
                                                                                        {lang === 'sv' ? `Nivå ${selectedLevel}` : `Level ${selectedLevel}`}
                                                                                    </span>
                                                                                    {selectedMeta?.description && (
                                                                                        <span className="text-[var(--text-muted)] font-medium">
                                                                                            {' '}— {selectedMeta.description}
                                                                                        </span>
                                                                                    )}
                                                                                </>
                                                                            ) : (
                                                                                <span className="text-[var(--text-muted)]">{t.select_level}</span>
                                                                            )}
                                                                        </span>
                                                                        <ChevronDown
                                                                            size={15}
                                                                            style={isDropdownOpen ? { color: activeDomainVisual.accent } : undefined}
                                                                            className={`shrink-0 text-[var(--text-muted)] transition-transform duration-140 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                                                        />
                                                                    </button>

                                                                    {isDropdownOpen && (
                                                                        <div
                                                                            style={{ borderColor: activeDomainVisual.accent }}
                                                                            className="absolute left-0 right-0 top-full mt-1 bg-[var(--bg-card)] border rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar divide-y divide-[var(--border-main)] animate-in fade-in duration-120"
                                                                        >
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const targetLvl = isThisTopicSelected ? selectedLevel : diagnosticStartLvl;
                                                                                    setOpenDropdownTopicId(null);
                                                                                    setDiagnosticTarget({
                                                                                        topicId: topic.id,
                                                                                        level: targetLvl,
                                                                                        isNewGoal: true
                                                                                    });
                                                                                    onSelect(topic.id, targetLvl);
                                                                                }}
                                                                                style={{ backgroundColor: activeDomainVisual.softBg }}
                                                                                className="w-full text-left p-3 hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-between gap-2"
                                                                            >
                                                                                <div className="flex items-center gap-2 min-w-0">
                                                                                    <Compass size={14} style={{ color: activeDomainVisual.accent }} className="shrink-0" />
                                                                                    <span className="text-xs font-bold text-[var(--text-main)] truncate">
                                                                                        {lang === 'sv' ? 'Hitta rätt nivå...' : 'Find the right level...'}
                                                                                    </span>
                                                                                </div>
                                                                                <span style={{ color: activeDomainVisual.accent }} className="text-xs font-bold shrink-0">
                                                                                    {lang === 'sv' ? 'Testa →' : 'Try →'}
                                                                                </span>
                                                                            </button>

                                                                            {availableLevels.map(lvl => {
                                                                                const { description, mathExample } = getLevelMetadata(topic.id, lvl, lang);
                                                                                const isRowSelected = isThisTopicSelected && selectedLevel === lvl;

                                                                                return (
                                                                                    <button
                                                                                        key={lvl}
                                                                                        type="button"
                                                                                        onClick={() => {
                                                                                            onSelect(topic.id, lvl);
                                                                                            setOpenDropdownTopicId(null);
                                                                                        }}
                                                                                        style={isRowSelected ? { backgroundColor: activeDomainVisual.softBg } : undefined}
                                                                                        className={`w-full text-left p-3 transition-colors cursor-pointer flex flex-col gap-1 ${
                                                                                            isRowSelected ? '' : 'hover:bg-[var(--bg-surface)]'
                                                                                        }`}
                                                                                    >
                                                                                        <div className="flex items-center gap-2 w-full">
                                                                                            <span
                                                                                                style={
                                                                                                    isRowSelected
                                                                                                        ? { backgroundColor: activeDomainVisual.accent, color: '#ffffff' }
                                                                                                        : undefined
                                                                                                }
                                                                                                className={`px-2 py-0.5 rounded text-xs font-bold font-mono shrink-0 ${
                                                                                                    isRowSelected
                                                                                                        ? ''
                                                                                                        : 'bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-strong)]'
                                                                                                }`}
                                                                                            >
                                                                                                {lang === 'sv' ? `Nivå ${lvl}` : `Lvl ${lvl}`}
                                                                                            </span>
                                                                                            <span className="text-xs font-bold text-[var(--text-main)] truncate">
                                                                                                {description}
                                                                                            </span>
                                                                                        </div>

                                                                                        {mathExample && (
                                                                                            <div className="text-xs font-medium text-[var(--text-muted)] line-clamp-1 pl-1 flex items-center gap-1">
                                                                                                <span className="opacity-60">Ex:</span>
                                                                                                <MathDisplay content={mathExample} />
                                                                                            </div>
                                                                                        )}
                                                                                    </button>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {isThisTopicSelected && selectedMeta?.mathExample && (
                                                                    <div className="mt-2.5 p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] flex items-start gap-2 animate-in fade-in duration-120">
                                                                        <span
                                                                            style={{
                                                                                backgroundColor: activeDomainVisual.softBg,
                                                                                color: 'var(--text-main)',
                                                                                borderColor: activeDomainVisual.borderTint
                                                                            }}
                                                                            className="text-xs font-bold font-mono border px-1.5 py-0.5 rounded shrink-0 mt-0.5"
                                                                        >
                                                                            Ex
                                                                        </span>
                                                                        <div className="text-xs font-semibold text-[var(--text-main)] leading-snug break-words min-w-0 flex-1">
                                                                            <MathDisplay content={selectedMeta.mathExample} />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    ) : (
                        <div className="animate-in fade-in duration-140 space-y-3 pb-20">
                            {isLoadingArchive ? (
                                <div className="flex items-center justify-center p-16">
                                    <div className="animate-spin h-8 w-8 border-4 border-[var(--role-primary)] border-t-transparent rounded-full" />
                                </div>
                            ) : archivedSessions.length === 0 ? (
                                <div className="bg-[var(--bg-card)] rounded-xl p-16 text-center border border-dashed border-[var(--border-strong)]">
                                    <History size={40} className="mx-auto text-[var(--text-muted)] mb-3 opacity-50" />
                                    <p className="font-bold text-xs text-[var(--text-muted)]">{t.archive_empty}</p>
                                </div>
                            ) : (
                                archivedSessions.map(session => {
                                    const isDoNow = session.active_question_data?.mode === 'donow';

                                    return (
                                        <div key={session.id} className="card-tactile border-l-4 border-l-[var(--role-primary)] p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
                                            <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                                                    isDoNow
                                                        ? 'bg-[var(--role-guide-soft)] text-[var(--role-guide-text)] border-[var(--role-guide)]/30'
                                                        : 'bg-[var(--role-primary-soft)] text-[var(--role-primary-text)] border-[var(--brand-border)]'
                                                }`}>
                                                    {isDoNow ? <LayoutGrid size={20} /> : <FileSpreadsheet size={20} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-bold text-[var(--text-main)] text-sm truncate mb-1.5">
                                                        {session.title || (isDoNow ? "Do Now Grid" : "Live Lektion")}
                                                    </h4>
                                                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
                                                        <span className="flex items-center gap-1 bg-[var(--bg-surface)] border border-[var(--border-main)] px-2 py-0.5 rounded-md font-mono">
                                                            <Calendar size={11}/> {new Date(session.created_at).toLocaleDateString()}
                                                        </span>
                                                        <span className="flex items-center gap-1 bg-[var(--bg-surface)] border border-[var(--border-main)] px-2 py-0.5 rounded-md text-[var(--role-attention-text)]">
                                                            <Clock size={11}/> {session.expirationText}
                                                        </span>
                                                        <span className="flex items-center gap-1 bg-[var(--bg-surface)] border border-[var(--border-main)] px-2 py-0.5 rounded-md">
                                                            <Users size={11}/> {session.studentCount} {lang === 'sv' ? "Elever" : "Students"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 px-4 lg:border-l border-[var(--border-main)] w-full lg:w-auto">
                                                <div>
                                                    <span className="block text-xs font-semibold text-[var(--text-muted)]">{t.accuracy_label}</span>
                                                    <div className={`text-lg font-extrabold font-mono ${
                                                        session.accuracy > 70
                                                            ? 'text-[var(--role-primary-text)]'
                                                            : session.accuracy > 40
                                                                ? 'text-[var(--role-guide-text)]'
                                                                : 'text-[var(--role-attention-text)]'
                                                    }`}>
                                                        {session.accuracy}%
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                                                <button
                                                    type="button"
                                                    onClick={() => onViewReport(session)}
                                                    className="flex-1 lg:flex-none px-3.5 py-2 bg-[var(--bg-surface)] text-[var(--text-main)] rounded-lg text-xs font-bold hover:border-[var(--role-primary)] transition-colors border border-[var(--border-strong)] cursor-pointer"
                                                >
                                                    {t.view_report}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onEdit(session)}
                                                    className="p-2 bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-strong)] rounded-lg transition-colors hover:border-[var(--role-guide)] hover:text-[var(--role-guide-text)] cursor-pointer"
                                                    title={t.edit_btn}
                                                >
                                                    <PenTool size={15} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onRelaunch(session)}
                                                    className="flex-1 lg:flex-none px-4 py-2 bg-[var(--role-primary)] hover:bg-[var(--role-primary-hover)] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-colors cursor-pointer"
                                                >
                                                    <RotateCcw size={13}/> {t.relaunch_btn}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </main>

                {/* ARCHITECTURAL FLOATING ACTION BAR */}
                {activeTab === 'curriculum' && !isShowingStudentGateway && (
                    <div className={`fixed bottom-6 right-6 flex justify-end pointer-events-none z-30 transition-all duration-140 ${
                        (!diagnosticTarget && (selectedTopic || (isShowingCuratedRoadmap && nextUnfinishedStep)))
                            ? 'translate-y-0 opacity-100'
                            : 'translate-y-16 opacity-0'
                    }`}>
                        {isShowingCuratedRoadmap && nextUnfinishedStep && !hasUserManuallySelected ? (
                            <button
                                type="button"
                                onClick={() => {
                                    if (onStartUnitStep) {
                                        onStartUnitStep(nextUnfinishedStep);
                                    } else if (nextUnfinishedStep.type === 'test' && onStartCheckpoint) {
                                        onStartCheckpoint(nextUnfinishedStep.configCode, nextUnfinishedStep.id);
                                    } else if (nextUnfinishedStep.type === 'instruction') {
                                        handleOpenInstruction(nextUnfinishedStep);
                                    } else if (onStart) {
                                        onStart();
                                    }
                                }}
                                className={`px-6 py-3.5 rounded-xl font-bold text-sm pointer-events-auto flex items-center gap-2.5 active:scale-[0.98] transition-colors text-white shadow-lg cursor-pointer ${
                                    nextUnfinishedStep.type === 'test'
                                        ? 'bg-[var(--role-attention)] hover:opacity-95'
                                        : nextUnfinishedStep.type === 'instruction'
                                            ? 'bg-[var(--role-guide)] hover:opacity-95'
                                            : 'bg-[var(--role-primary)] hover:bg-[var(--role-primary-hover)]'
                                }`}
                            >
                                <span>
                                    {nextUnfinishedStep.type === 'test'
                                        ? (lang === 'sv' ? "Starta nästa delprov" : "Start next test")
                                        : nextUnfinishedStep.type === 'instruction'
                                            ? (lang === 'sv' ? "Titta på genomgång" : "Watch walkthrough")
                                            : t.start_btn}
                                </span>
                                {nextUnfinishedStep.type === 'test' ? (
                                    <Beaker size={18} />
                                ) : nextUnfinishedStep.type === 'instruction' ? (
                                    <BookOpen size={18} />
                                ) : (
                                    <Play fill="currentColor" size={16} />
                                )}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={onStart}
                                className="px-7 py-3.5 rounded-xl font-bold text-base pointer-events-auto flex items-center gap-3 bg-[var(--role-primary)] hover:bg-[var(--role-primary-hover)] active:scale-[0.98] transition-colors text-white shadow-lg cursor-pointer"
                            >
                                <span>{t.start_btn}</span>
                                <Play fill="currentColor" size={18} />
                            </button>
                        )}
                    </div>
                )}

                {showUpdateLog && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6">
                        <div className="bg-[var(--bg-card)] w-full max-w-2xl max-h-[80vh] rounded-xl border border-[var(--border-strong)] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-140">
                            <div className="bg-[var(--bg-surface)] px-6 py-5 border-b border-[var(--border-main)] shrink-0 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-[var(--role-primary-soft)] text-[var(--role-primary-text)] border border-[var(--brand-border)] rounded-lg">
                                        <Newspaper size={20}/>
                                    </div>
                                    <h2 className="text-lg font-extrabold text-[var(--text-main)]">Ändringslogg</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowUpdateLog(false)}
                                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar bg-[var(--bg-card)]">
                                {APP_UPDATES.map((update) => (
                                    <div key={update.id} className="relative pl-6 border-l-2 border-[var(--border-strong)] pb-2">
                                        <div className="absolute -left-[7px] top-1 w-3 h-3 bg-[var(--bg-card)] border-2 border-[var(--role-primary)] rounded-full" />
                                        <div className="flex items-center gap-2.5 mb-1.5">
                                            <span className="text-xs font-bold font-mono text-[var(--role-primary-text)] bg-[var(--role-primary-soft)] border border-[var(--brand-border)] px-2 py-0.5 rounded">
                                                {update.date}
                                            </span>
                                            <span className="text-xs font-bold font-mono text-[var(--text-muted)]">
                                                v{update.version}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-bold text-[var(--text-main)] mb-3">{update.title[lang]}</h3>
                                        <ul className="space-y-2">
                                            {update.changes[lang].map((change, i) => (
                                                <li key={i} className="flex gap-2.5 text-sm text-[var(--text-main)] opacity-90 leading-relaxed">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--role-primary)] mt-2 shrink-0" />
                                                    <span>{change}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <SpotlightTour
                steps={dashboardTourSteps}
                isOpen={showDashboardTutorial}
                onClose={handleCloseDashboardTutorial}
                lang={lang}
            />

            <CapacityModal
                visible={showCapacityModal}
                onClose={() => setShowCapacityModal(false)}
                classCode={profile?.class_code}
                lang={lang}
            />
            <InstructionSlideModal
                isOpen={!!activeInstructionModal}
                onClose={() => setActiveInstructionModal(null)}
                sheetTitle={activeInstructionModal?.sheetTitle}
                slides={activeInstructionModal?.slides || (activeInstructionModal?.slideData ? [activeInstructionModal.slideData] : [])}
                livePacket={activeInstructionModal?.livePacket || []}
                initialSlideIndex={activeInstructionModal?.slideIndex || 0}
                lang={lang}
                onCompleteAndAdvance={() => {
                    const currentStepId = activeInstructionModal.id;
                    markStepComplete(currentStepId);

                    const nextStep = getNextUnitStep(allUnitSteps, currentStepId);
                    setActiveInstructionModal(null);

                    if (nextStep) {
                        if (onStartUnitStep) {
                            onStartUnitStep(nextStep);
                        } else if (nextStep.type === 'practice') {
                            onSelect(nextStep.topic, nextStep.level);
                        } else if (nextStep.type === 'instruction') {
                            handleOpenInstruction(nextStep);
                        }
                    }
                }}
            />

            <SheetLibraryModal
                isOpen={isLibraryModalOpen && !activeSetupModal}
                profile={profile}
                lang={lang}
                onClose={() => setIsLibraryModalOpen(false)}
                showCreationActions={true}
                onCreateActivity={() => {
                    setIsLibraryModalOpen(false);
                    setShowActivityHub(true);
                }}
                onCreateNew={(type) => {
                    setIsLibraryModalOpen(false);
                    if (type === 'poster_notes') {
                        onOpenPosterNotes?.(null);
                    } else {
                        onStudioOpen?.(type);
                    }
                }}
                onSelectSheet={(sheet) => {
                    setIsLibraryModalOpen(false);
                    if (typeof onOpenLibrarySheet === 'function') {
                        onOpenLibrarySheet(sheet);
                        return;
                    }
                    if (sheet.type === 'poster_notes') {
                        onOpenPosterNotes?.(sheet);
                    } else if (sheet.type?.startsWith('activity')) {
                        const actDef = getActivityDefinition(sheet.type);
                        if (actDef) {
                            const questions = Array.isArray(sheet.packet)
                                ? sheet.packet
                                : (sheet.packet?.tiles || sheet.packet?.livePacket || []);
                            setActiveSetupModal({
                                key: actDef.key,
                                savedBoard: sheet,
                                sourcePacket: questions
                            });
                        }
                    } else {
                        onEdit?.(sheet);
                    }
                }}
            />

            <ActivityHubModal
                isOpen={showActivityHub}
                onClose={() => setShowActivityHub(false)}
                sourcePacket={[]}
                profile={profile}
                lang={lang}
                onLaunchActivity={(gameKey, config) => {
                    setShowActivityHub(false);
                    onRelaunch?.({
                        title: config?.title,
                        mode: `activity_${gameKey}`,
                        initialConfig: config,
                        active_question_data: {
                            mode: `activity_${gameKey}`,
                            packet: config?.initialQuestions || config?.tiles || [],
                            teams: config?.teams || [],
                            settings: {
                                ...(config?.settings || {}),
                                ...(config?.dimensions ? { dimensions: config.dimensions } : {}),
                                ...(config?.pointScale ? { pointScale: config.pointScale } : {}),
                                ...(config?.categories ? { categories: config.categories } : {}),
                                ...(config?.teams ? { teams: config.teams } : {})
                            }
                        }
                    });
                }}
            />

            {activeSetupModal && (() => {
                const def = getActivityDefinition(activeSetupModal.key);
                if (!def?.SetupModal) return null;
                const WizardModal = def.SetupModal;
                return (
                    <WizardModal
                        isOpen={true}
                        onClose={() => setActiveSetupModal(null)}
                        sourcePacket={activeSetupModal.sourcePacket || []}
                        savedBoard={activeSetupModal.savedBoard || null}
                        profile={profile}
                        lang={lang}
                        onLaunch={(config) => {
                            setActiveSetupModal(null);
                            onRelaunch?.({
                                title: activeSetupModal.savedBoard?.title || config?.title,
                                mode: `activity_${activeSetupModal.key}`,
                                active_worksheet_id: activeSetupModal.savedBoard?.id,
                                initialConfig: config,
                                savedBoard: activeSetupModal.savedBoard || null,
                                active_question_data: {
                                    mode: `activity_${activeSetupModal.key}`,
                                    packet: config?.initialQuestions || config?.tiles || activeSetupModal.sourcePacket || [],
                                    teams: config?.teams || activeSetupModal.savedBoard?.config?.teams || [],
                                    settings: {
                                        ...(config?.settings || {}),
                                        ...(config?.dimensions ? { dimensions: config.dimensions } : {}),
                                        ...(config?.pointScale ? { pointScale: config.pointScale } : {}),
                                        ...(config?.categories ? { categories: config.categories } : {}),
                                        ...(config?.teams ? { teams: config.teams } : {})
                                    }
                                }
                            });
                        }}
                    />
                );
            })()}
        </div>
    );
};

export default Dashboard;