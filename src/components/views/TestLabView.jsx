// src/components/views/TestLabView.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Loader2, ChevronLeft, Beaker, Play, Check,
    Settings2, Zap, RefreshCcw, Lock, ListChecks,
    LayoutGrid, XCircle, LogOut, ChevronRight,
    CheckCircle2, Award, HelpCircle, X, Bookmark,
    Search, Eye, Filter, Plus
} from 'lucide-react';
import { decodeConfig, encodeConfig, BUNDLE_PRESETS } from '../../core/utils/labCodeUtils';
import { CATEGORIES, LEVEL_DESCRIPTIONS } from '../../constants/localization';
import { SKILL_BUCKETS } from '../../constants/skillBuckets.js';
import { SKILL_GRAPH, CONCEPT_SEARCH_INDEX } from '../../constants/skillGraph';
import { useMyCoach } from '../../hooks/useMyCoach';
import MyCoachModal from '../modals/MyCoachModal';
import { isLevelWordProblemReady } from '../../constants/skillBuckets.js';
import SaveToUnitModal from '../modals/SaveToUnitModal';
import { supabase } from '../../lib/supabaseClient';

import { CONTENT_MAP } from '../../constants/content_map.generated';

// --- SHARED UI COMPONENTS ---
import QuestionPromptCard from '../shared/QuestionPromptCard';
import QuestionResponseBox from '../shared/QuestionResponseBox';
import SkillGraphExplorer from '../shared/SkillGraphExplorer';
import SpotlightTour from '../shared/SpotlightTour';
import MathDisplay from '../shared/MathDisplay';

import { syncProgress } from '../../lib/progressSync';

// CRITICAL: Import Universal Theme
import '../../styles/theme.css';

const LAB_TEXT = {
    sv: {
        title: "Test Lab", testCode: "Testkod", modeExam: "Provläge", modePractice: "Öva",
        startBtn: "Starta pass", selectedAreas: "valda", level: "Nivå", back: "Tillbaka",
        loading: "Laddar...", showAnswers: "Visa rätt svar", quit: "Avbryt passet",
        answerReceived: "Svar mottaget", nextQuestion: "Nästa uppgift", finish: "Avsluta & se resultat",
        summaryTitle: "Testrapport", recoveryTitle: "Rekommenderad träning", recoveryDesc: "Fokusera på dina svagaste områden.",
        copyLink: "Kopiera länk", linkCopied: "Kopierad!", toDashboard: "Lämna",
        backToLab: "Till Labbet", guideBtn: "Instruktioner",
        reviewBtn: "Granska svar", reviewTitle: "Granska genomförda uppgifter",
        reviewSubtitle: "Gå igenom dina svar och lösningar utan stress — slutresultatet visas när passet är klart."
    },
    en: {
        title: "Test Lab", testCode: "Test Code", modeExam: "Exam Mode", modePractice: "Practice Mode",
        startBtn: "Start Test", selectedAreas: "selected areas", level: "Level", back: "Back",
        loading: "Loading...", showAnswers: "Show answers", quit: "Quit Session",
        answerReceived: "Answer received", nextQuestion: "Next Question", finish: "Finish & See Results",
        summaryTitle: "Test Report", recoveryTitle: "Recommended Practice", recoveryDesc: "Focus on your weakest areas.",
        copyLink: "Copy Link", linkCopied: "Copied!", toDashboard: "Exit",
        backToLab: "Back to Lab", guideBtn: "Guide",
        reviewBtn: "Review Answers", reviewTitle: "Review Completed Questions",
        reviewSubtitle: "Inspect your answers and worked solutions at your own pace — final scores appear when finished."
    }
};

function getTopicDisplayName(topicId, lang = 'sv') {
    for (const cat of Object.values(CATEGORIES)) {
        const found = cat.topics.find(t => t.id === topicId);
        if (found) return found.label?.[lang] || found.label?.sv || topicId;
    }
    for (const cat of Object.values(SKILL_BUCKETS || {})) {
        if (cat?.topics?.[topicId]) {
            return cat.topics[topicId].name?.[lang] || cat.topics[topicId].name?.sv || topicId;
        }
    }
    return topicId;
}

export default function TestLabView({
    configCode, profile, lang = 'sv', onBack,
    activeBucket = null, activeUnitStepId = null
}) {
    const t = LAB_TEXT[lang] || LAB_TEXT.sv;

    const [internalMode, setInternalMode] = useState('LOADING');
    const [selection, setSelection] = useState({});
    const [meta, setMeta] = useState({ mode: 'practice', limit: 20, globalMaxLevel: 9 });
    const [packet, setPacket] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [responses, setResponses] = useState({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [activeCategory, setActiveCategory] = useState('algebra');
    const [visibleClues, setVisibleClues] = useState({});
    const [showActiveSolution, setShowActiveSolution] = useState(false);
    const [showGuideModal, setShowGuideModal] = useState(false);
    const [useWordProblems, setUseWordProblems] = useState(false);
    const [allowCoach, setAllowCoach] = useState(false);

    // Default to 'matrix' (Alla områden) first, with 'explorer' (Sök & Utforska) alongside
    const [setupTab, setSetupTab] = useState('matrix');
    const [matrixSearchQuery, setMatrixSearchQuery] = useState('');
    const matrixSearchRef = useRef(null);

    const [focusedGraphTarget, setFocusedGraphTarget] = useState({
        topicId: 'equations',
        level: 1,
        isNewGoal: true
    });

    // Slide-over Level Inspector & Connected Skills Drawer
    const [inspectedLevel, setInspectedLevel] = useState(null); // { topicId, level, question, loading }

    // Inline feedback banners (replaces native alert())
    const [linkCopiedToast, setLinkCopiedToast] = useState(false);
    const [unitSavedToast, setUnitSavedToast] = useState(false);

    // On-demand Practice Review Drawer state
    const [showReviewDrawer, setShowReviewDrawer] = useState(false);
    const [reviewOnlyIncorrect, setReviewOnlyIncorrect] = useState(false);

    const q = packet[currentIndex];
    const coach = useMyCoach(q, lang);

    const [isMobile, setIsMobile] = useState(false);
    const isTeacherOrAdmin = profile?.role === 'teacher' || profile?.role === 'super_admin';

    // First-visit automatic Spotlight Tour trigger
    const tourStorageKey = `has_seen_testlab_tour_${profile?.role || 'student'}`;

    useEffect(() => {
        if (internalMode === 'SETUP' && !localStorage.getItem(tourStorageKey)) {
            const timer = setTimeout(() => setShowGuideModal(true), 350);
            return () => clearTimeout(timer);
        }
    }, [internalMode, tourStorageKey]);

    const handleCloseTour = () => {
        localStorage.setItem(tourStorageKey, 'true');
        setShowGuideModal(false);
    };

    const testLabTourSteps = useMemo(() => [
        {
            selector: '[data-tour="testlab-matrix"]',
            onEnter: () => setSetupTab('matrix'),
            title: {
                sv: '1. Välj områden & nivåer',
                en: '1. Pick Topics & Levels'
            },
            description: {
                sv: 'Bocka i exakt de nivåer (1–9) du vill träna på. Klicka på ögat bredvid en nivå för att se en exempeluppgift och kopplade förkunskaper.',
                en: 'Check off the exact levels (1–9) you want to include. Click the eye icon next to any level to preview a sample problem and connected skills.'
            }
        },
        {
            selector: '[data-tour="testlab-view-switcher"]',
            title: {
                sv: '2. Byt mellan lista & kunskapsträd',
                en: '2. Switch Between List & Skill Graph'
            },
            description: {
                sv: 'Använd "Sök & Utforska" för att söka på begrepp eller se hur olika matematikområden bygger vidare på varandra.',
                en: 'Use "Search & Explore" to search by concept or visualize how math topics build upon each other.'
            }
        },
        {
            selector: '[data-tour="testlab-presets"]',
            title: {
                sv: '3. Snabbval & valt innehåll',
                en: '3. Presets & Selected Content'
            },
            description: {
                sv: 'Här ser du alla nivåer du har lagt till — eller välj ett färdigt paket (t.ex. inför Nationella provet) med ett klick.',
                en: 'Review every level you have added here — or load a ready-made bundle in a single click.'
            }
        },
        {
            selector: '[data-tour="testlab-settings"]',
            title: {
                sv: '4. Välj Öva eller Provläge',
                en: '4. Choose Practice or Exam Mode'
            },
            description: {
                sv: 'I "Öva" får du direkt rättning, lösningar och kan granska dina misstag under passet. "Provläge" döljer facit tills allt är inlämnat.',
                en: 'In "Practice Mode" you get instant feedback, worked solutions, and error review. "Exam Mode" hides answers until submitted.'
            }
        },
        {
            selector: '[data-tour="testlab-actions"]',
            title: isTeacherOrAdmin
                ? { sv: '5. Starta, dela länk eller spara i modul', en: '5. Start, Share Link, or Save to Unit' }
                : { sv: '5. Starta ditt pass!', en: '5. Start Your Session!' },
            description: isTeacherOrAdmin
                ? {
                      sv: 'Klicka på "Starta pass" för att testa direkt, kopiera en direktlänk till eleverna eller lägg in provet som ett steg i en modul.',
                      en: 'Click "Start Test" to launch immediately, copy a shareable student link, or insert it directly into a custom unit.'
                  }
                : {
                      sv: 'När du har valt minst ett område klickar du på "Starta pass" för att börja träna!',
                      en: 'Once you have selected at least one topic, click "Start Test" to begin practicing!'
                  }
        }
    ], [isTeacherOrAdmin]);

    const hasWordProblemSupport = Object.entries(selection).some(([topicId, conf]) => {
        if (!conf?.enabled) return false;
        const levels = conf.levels && conf.levels.length > 0 ? conf.levels : [1];
        return levels.some(lvl => isLevelWordProblemReady(topicId, lvl));
    });

    // Derive Set<"topicId:level"> for SkillGraphExplorer sync
    const selectedNodeIds = useMemo(() => {
        const set = new Set();
        Object.entries(selection).forEach(([topicId, conf]) => {
            if (conf?.enabled && Array.isArray(conf.levels)) {
                conf.levels.forEach(lvl => set.add(`${topicId}:${lvl}`));
            }
        });
        return set;
    }, [selection]);

    useEffect(() => {
        if (internalMode !== 'SETUP') return;
        const onKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k' && setupTab === 'matrix') {
                e.preventDefault();
                matrixSearchRef.current?.focus();
            } else if (e.key === 'Escape' && inspectedLevel) {
                setInspectedLevel(null);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [internalMode, setupTab, inspectedLevel]);

    useEffect(() => {
        if (!hasWordProblemSupport && useWordProblems) {
            setUseWordProblems(false);
        }
    }, [hasWordProblemSupport, useWordProblems]);

    useEffect(() => {
        const checkMobile = () => { setIsMobile(window.innerWidth < 768); };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        setShowActiveSolution(false);
        if (coach.isOpen) {
            coach.closeCoach();
        }
    }, [currentIndex]);

    useEffect(() => {
        if (internalMode === 'SUMMARY' && activeBucket && activeBucket !== 'FREE_PLAY' && activeUnitStepId) {
            const studentId = profile?.id || 'guest_student';
            const bucketId = activeBucket.id || 'default_bucket';
            const storageKeyProgress = `progress_${studentId}_${bucketId}`;
            try {
                const raw = localStorage.getItem(storageKeyProgress);
                const current = raw ? JSON.parse(raw) : [];
                if (!current.includes(activeUnitStepId)) {
                    localStorage.setItem(storageKeyProgress, JSON.stringify([...current, activeUnitStepId]));
                }
            } catch (err) {
                console.error("Failed to sync test checkpoint progress:", err);
            }
        }
    }, [internalMode, activeBucket, activeUnitStepId, profile?.id]);

    const copyTestLink = () => {
        const updatedMeta = { ...meta, wordProblem: hasWordProblemSupport && useWordProblems, allowCoach: allowCoach };
        const testCode = encodeConfig({ meta: updatedMeta, selection });
        const baseUrl = window.location.origin + "/lab";
        const fullUrl = `${baseUrl}?config=${testCode}`;
        navigator.clipboard.writeText(fullUrl);
        setLinkCopiedToast(true);
        setTimeout(() => setLinkCopiedToast(false), 2400);
    };

    const resetAllSelection = () => {
        setSelection({});
        setMatrixSearchQuery('');
        setMeta(p => ({ ...p, isNationalTest: false, bundleId: null, limit: 20, mode: 'practice' }));
    };

    const applyPresetSelection = (bundleId) => {
        if (!bundleId) { resetAllSelection(); return; }
        const preset = BUNDLE_PRESETS[bundleId];
        const newSelection = {};
        Object.entries(CATEGORIES).forEach(([catId, cat]) => {
            if (bundleId === 'NP-ALL' || catId === preset.category) {
                cat.topics.forEach(topic => {
                    const topicLevels = LEVEL_DESCRIPTIONS[topic.id] ? Object.keys(LEVEL_DESCRIPTIONS[topic.id]).map(Number) : [1];
                    newSelection[topic.id] = { enabled: true, levels: topicLevels };
                });
            }
        });
        setSelection(newSelection);
        setMeta(p => ({ ...p, isNationalTest: true, bundleId: bundleId }));
    };

    const toggleTopicLevel = (topicId, lvl) => {
        const numLvl = Number(lvl);
        setMeta(p => ({ ...p, isNationalTest: false, bundleId: null }));
        setSelection(p => {
            const currentLevels = p[topicId]?.levels || [];
            const newLevels = currentLevels.includes(numLvl)
                ? currentLevels.filter(l => l !== numLvl)
                : [...currentLevels, numLvl].sort((a, b) => a - b);

            if (newLevels.length === 0) {
                const next = { ...p };
                delete next[topicId];
                return next;
            }

            return {
                ...p,
                [topicId]: {
                    ...p[topicId],
                    levels: newLevels,
                    enabled: true
                }
            };
        });
    };

    const removeTopicFromSelection = (topicId) => {
        setMeta(p => ({ ...p, isNationalTest: false, bundleId: null }));
        setSelection(p => {
            const next = { ...p };
            delete next[topicId];
            return next;
        });
    };

    // Open slide-over drawer to inspect live sample problem + connected prerequisites & next steps
    const openLevelInspector = async (e, topicId, lvl) => {
        if (e) e.stopPropagation();
        const numLvl = Number(lvl);
        const node = SKILL_GRAPH[`${topicId}:${numLvl}`];

        setInspectedLevel({
            topicId,
            level: numLvl,
            question: null,
            loading: true
        });

        try {
            const url = node?.sampleVariationKey
                ? `/api/question?topic=${encodeURIComponent(topicId)}&variation=${encodeURIComponent(node.sampleVariationKey)}&lang=${lang}&wordProblem=false`
                : `/api/question?topic=${encodeURIComponent(topicId)}&level=${numLvl}&lang=${lang}&wordProblem=false`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setInspectedLevel(prev =>
                    prev && prev.topicId === topicId && prev.level === numLvl
                        ? { ...prev, question: data, loading: false }
                        : prev
                );
            } else {
                setInspectedLevel(prev => (prev ? { ...prev, loading: false } : null));
            }
        } catch (err) {
            console.error('Failed to fetch inspector sample question:', err);
            setInspectedLevel(prev => (prev ? { ...prev, loading: false } : null));
        }
    };

    // Clean non-destructive search filter for Alla områden
    const filteredSearchTopics = useMemo(() => {
        const qStr = matrixSearchQuery.trim().toLowerCase();
        if (!qStr) return null;

        const results = [];
        const matchedLevelMap = new Map(); // topicId -> Set<number>

        CONCEPT_SEARCH_INDEX.forEach(entry => {
            if (entry.keywords.includes(qStr)) {
                if (!matchedLevelMap.has(entry.topicId)) {
                    matchedLevelMap.set(entry.topicId, new Set());
                }
                matchedLevelMap.get(entry.topicId).add(Number(entry.level));
            }
        });

        Object.entries(CATEGORIES).forEach(([catId, cat]) => {
            cat.topics.forEach(topic => {
                const labelText = `${topic.label?.sv || ''} ${topic.label?.en || ''}`.toLowerCase();
                const levelsObj = LEVEL_DESCRIPTIONS[topic.id] || {};
                const directTopicHit = labelText.includes(qStr);
                const levelHits = matchedLevelMap.get(topic.id) || new Set();

                Object.entries(levelsObj).forEach(([lvlStr, descObj]) => {
                    const descText = `${descObj?.sv || ''} ${descObj?.en || ''}`.toLowerCase();
                    if (descText.includes(qStr)) {
                        levelHits.add(Number(lvlStr));
                    }
                });

                if (directTopicHit || levelHits.size > 0) {
                    results.push({
                        categoryId: catId,
                        categoryLabel: cat.label?.[lang] || cat.label?.sv,
                        topic,
                        matchedLevels: levelHits
                    });
                }
            });
        });

        return results;
    }, [matrixSearchQuery, lang]);

    const [showSaveToUnitModal, setShowSaveToUnitModal] = useState(false);

    const handleSaveToUnit = async ({ unitId, partId, insertIndex, title }) => {
        const updatedMeta = { ...meta, wordProblem: hasWordProblemSupport && useWordProblems, allowCoach: allowCoach };
        const testCode = encodeConfig({ meta: updatedMeta, selection });

        const { data: bucket, error: fetchError } = await supabase
            .from('teacher_buckets')
            .select('payload')
            .eq('id', unitId)
            .single();

        if (fetchError) throw fetchError;

        const currentParts = bucket?.payload || [];
        const newStep = {
            id: `step_test_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            type: 'test',
            title: title || (lang === 'sv' ? "Delprov" : "Checkpoint Test"),
            configCode: testCode,
            questionCount: typeof meta.limit === 'number' ? meta.limit : 10,
            testMode: meta.mode || 'practice',
            selectedTopicCount: Object.keys(selection).filter(id => selection[id]?.enabled).length
        };

        const updatedParts = currentParts.map(part => {
            if (part.id !== partId) return part;
            const steps = [...(part.steps || [])];

            if (typeof insertIndex === 'number' && insertIndex >= 0 && insertIndex <= steps.length) {
                steps.splice(insertIndex, 0, newStep);
            } else {
                steps.push(newStep);
            }

            return {
                ...part,
                steps
            };
        });

        const { error: updateError } = await supabase
            .from('teacher_buckets')
            .update({ payload: updatedParts })
            .eq('id', unitId);

        if (updateError) throw updateError;

        setUnitSavedToast(true);
        setTimeout(() => setUnitSavedToast(false), 3000);
    };

    const startNewSession = () => {
        syncProgress('test_session_started', {
            app_mode: 'test_lab',
            test_mode: meta.mode,
            limit: meta.limit === 0 ? 'infinite' : meta.limit,
            use_word_problems: useWordProblems,
            allow_coach: allowCoach,
            selected_preset: meta.bundleId || 'custom',
            enabled_topic_count: Object.keys(selection).filter(id => selection[id]?.enabled).length
        });

        setResponses({});
        setVisibleClues({});
        setShowActiveSolution(false);
        setShowReviewDrawer(false);
        setInspectedLevel(null);
        setCurrentIndex(0);
        setInputValue('');
        setInternalMode('LOADING');
        setPacket([]);
        setTimeout(() => { setInternalMode('ACTIVE'); }, 50);
    };

    const handleQuit = () => {
        if (internalMode === 'ACTIVE' && packet.length > 0) {
            syncProgress('test_session_abandoned', {
                app_mode: 'test_lab',
                questions_answered: currentIndex,
                test_mode: meta.mode
            });
        }
        onBack();
    };

    const fetchNextSprint = async () => {
        if (Number(meta.limit) > 0 && packet.length >= Number(meta.limit)) return;
        setIsGenerating(true);
        try {
            const enabledTopics = Object.keys(selection).filter(id => selection[id]?.enabled);

            if (enabledTopics.length === 0) {
                setInternalMode('SETUP');
                setIsGenerating(false);
                return;
            }

            let batchSize = 15;
            if (Number(meta.limit) > 0) {
                batchSize = Math.min(15, Number(meta.limit) - packet.length);
            }
            if (batchSize <= 0) { setIsGenerating(false); return; }

            const requests = Array.from({ length: batchSize }).map(() => {
                const topicId = enabledTopics[Math.floor(Math.random() * enabledTopics.length)];
                const conf = selection[topicId];
                const possibleLevels = conf.levels && conf.levels.length > 0 ? conf.levels : [1];
                const randomLevel = possibleLevels[Math.floor(Math.random() * possibleLevels.length)];

                return { topic: topicId, level: randomLevel, lang, wordProblem: useWordProblems };
            });

            const res = await fetch('/api/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requests })
            });
            const newQuestions = await res.json();
            setPacket(prev => [...prev, ...newQuestions]);
        } catch (err) { console.error("Fetch Error:", err); }
        finally { setIsGenerating(false); }
    };

    const advanceToNextQuestion = () => {
        const nextIndex = currentIndex + 1;
        const limit = Number(meta.limit);

        if (limit > 0 && nextIndex >= limit) {
            const totalAnswered = Object.keys(responses).length;
            const finalCorrect = Object.values(responses).filter(r => r.isCorrect).length;
            syncProgress('test_session_completed', {
                app_mode: 'test_lab',
                total_questions: limit,
                final_accuracy: totalAnswered > 0 ? parseFloat((finalCorrect / limit).toFixed(2)) : 0,
                test_mode: meta.mode
            });
            setInternalMode('SUMMARY');
            return;
        }

        if (nextIndex >= packet.length - 2 && (limit === 0 || packet.length < limit)) {
            fetchNextSprint();
        }
        setCurrentIndex(nextIndex);
        setInputValue('');
    };

    const finishEarlyToSummary = () => {
        const totalAnswered = Object.keys(responses).length;
        const totalCorrect = Object.values(responses).filter(r => r.isCorrect).length;
        syncProgress('test_session_completed', {
            app_mode: 'test_lab',
            total_questions: totalAnswered,
            final_accuracy: totalAnswered > 0 ? parseFloat((totalCorrect / totalAnswered).toFixed(2)) : 0,
            test_mode: meta.mode,
            early_finish: true
        });
        setShowReviewDrawer(false);
        setInternalMode('SUMMARY');
    };

    const handleLabSubmit = async (manualValue = null) => {
        const val = manualValue || inputValue;
        const currentQ = packet[currentIndex];
        if (!currentQ || !val || responses[currentIndex]) return;

        try {
            const res = await fetch('/api/answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answer: String(val).trim(), token: currentQ.resolvedData.token, mode: meta.mode })
            });
            const result = await res.json();

            const resolvedTopicId = currentQ.topic_id || currentQ.topicId || currentQ.topic || 'unknown';

            syncProgress('test_question_answered', {
                app_mode: 'test_lab',
                topic: resolvedTopicId,
                level: currentQ.level || currentQ.resolvedData?.level || 1,
                answer_type: currentQ.answerType || currentQ.resolvedData?.renderData?.answerType || 'unknown',
                is_correct: result.correct,
                student_answer: String(val).substring(0, 100),
                test_mode: meta.mode
            });

            const nextResponses = {
                ...responses,
                [currentIndex]: {
                    answer: val,
                    isCorrect: result.correct,
                    topicId: resolvedTopicId,
                    topic_id: resolvedTopicId
                }
            };
            setResponses(nextResponses);

            if (meta.mode === 'exam') {
                const nextIndex = currentIndex + 1;
                const limit = Number(meta.limit);
                if (limit > 0 && nextIndex >= limit) {
                    const finalCorrect = Object.values(nextResponses).filter(r => r.isCorrect).length;
                    syncProgress('test_session_completed', {
                        app_mode: 'test_lab',
                        total_questions: limit,
                        final_accuracy: parseFloat((finalCorrect / limit).toFixed(2)),
                        test_mode: meta.mode
                    });
                    setInternalMode('SUMMARY');
                    return;
                }
                if (nextIndex >= packet.length - 2 && (limit === 0 || packet.length < limit)) {
                    fetchNextSprint();
                }
                setCurrentIndex(nextIndex);
                setInputValue('');
            }
        } catch (err) { console.error("Submission error:", err); }
    };

    const getDiagnosticStats = () => {
        const stats = { arithmetic: { correct: 0, total: 0 }, algebra: { correct: 0, total: 0 }, geometry: { correct: 0, total: 0 }, statistics: { correct: 0, total: 0 } };
        Object.values(responses).forEach(res => {
            const tId = res.topicId || res.topic_id;
            const category = Object.values(CATEGORIES).find(cat => cat.topics.some(t => t.id === tId));
            if (category) { stats[category.id].total++; if (res.isCorrect) stats[category.id].correct++; }
        });
        let weakest = null; let minScore = 101;
        Object.entries(stats).forEach(([id, data]) => { if (data.total > 0) { const score = (data.correct / data.total) * 100; if (score < minScore) { minScore = score; weakest = id; } } });
        return { stats, weakest };
    };

    useEffect(() => {
        if (configCode) {
            const decoded = decodeConfig(configCode);
            if (decoded) {
                let finalSelection = decoded.selection;
                if (decoded.meta.isNationalTest && decoded.meta.bundleId) {
                    const bundleId = decoded.meta.bundleId;
                    const preset = BUNDLE_PRESETS[bundleId];
                    const expandedSelection = {};
                    Object.entries(CATEGORIES).forEach(([catId, cat]) => {
                        if (bundleId === 'NP-ALL' || catId === preset.category) {
                            cat.topics.forEach(topic => {
                                const topicLevels = LEVEL_DESCRIPTIONS[topic.id] ? Object.keys(LEVEL_DESCRIPTIONS[topic.id]).map(Number) : [1];
                                expandedSelection[topic.id] = { enabled: true, levels: topicLevels };
                            });
                        }
                    });
                    finalSelection = expandedSelection;
                }
                setMeta(decoded.meta);
                setSelection(finalSelection);

                if (decoded.meta?.wordProblem !== undefined) setUseWordProblems(!!decoded.meta.wordProblem);
                if (decoded.meta?.allowCoach !== undefined) setAllowCoach(!!decoded.meta.allowCoach);

                setInternalMode('ACTIVE');
            } else { setInternalMode('SETUP'); }
        } else { setInternalMode('SETUP'); }
    }, [configCode]);

    useEffect(() => {
        if (internalMode === 'ACTIVE' && packet.length === 0) { fetchNextSprint(); }
    }, [internalMode, packet.length, useWordProblems]);

    if (internalMode === 'LOADING') {
        return (
            <div className="layout-wrapper flex items-center justify-center h-screen">
                <Loader2 className="animate-spin text-emerald-600 dark:text-emerald-400" size={44} />
            </div>
        );
    }

    // =========================================================
    // --- 1. SETUP UI (Alla områden First + Slide-Over Drawer) ---
    // =========================================================
    if (internalMode === 'SETUP') {
        const activeCategoryData = CATEGORIES[activeCategory];
        const enabledTopicEntries = Object.entries(selection).filter(([, conf]) => conf?.enabled && conf?.levels?.length > 0);
        const totalSelectedTopics = enabledTopicEntries.length;
        const totalSelectedNodes = enabledTopicEntries.reduce((acc, [, conf]) => acc + conf.levels.length, 0);

        // Clean, non-mutating 2-column topic card renderer
        const renderTopicCard = (topic, { categoryBadge = null, highlightedLevels = null } = {}) => {
            const isEnabled = selection[topic.id]?.enabled;
            const topicLevels = LEVEL_DESCRIPTIONS[topic.id]
                ? Object.keys(LEVEL_DESCRIPTIONS[topic.id]).map(Number).sort((a, b) => a - b)
                : [1];
            const selectedLevels = selection[topic.id]?.levels || [];

            const toggleEntireTopic = () => {
                setMeta(p => ({ ...p, isNationalTest: false, bundleId: null }));
                setSelection(p => {
                    if (isEnabled) {
                        const next = { ...p };
                        delete next[topic.id];
                        return next;
                    }
                    return {
                        ...p,
                        [topic.id]: {
                            enabled: true,
                            levels: topicLevels
                        }
                    };
                });
            };

            const mapCategory = CONTENT_MAP.find(c => c.topics.some(tp => tp.id === topic.id));
            const mapTopic = mapCategory?.topics.find(tp => tp.id === topic.id);

            return (
                <div key={topic.id} className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-main)] overflow-hidden flex flex-col h-full">
                    {/* Topic Header Row */}
                    <div className="bg-[var(--bg-card)] px-4 py-3 border-b border-[var(--border-main)] flex items-center justify-between gap-3 shrink-0">
                        <div className="min-w-0">
                            {categoryBadge && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                                    {categoryBadge}
                                </span>
                            )}
                            <h4 className="font-extrabold text-sm text-[var(--text-main)] truncate">
                                {topic.label[lang]}
                            </h4>
                        </div>
                        <button
                            type="button"
                            onClick={toggleEntireTopic}
                            className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer border shrink-0 ${
                                isEnabled
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'bg-[var(--bg-surface)] text-[var(--text-main)] border-[var(--border-main)] hover:border-emerald-600'
                            }`}
                        >
                            <Check size={12} strokeWidth={3} className={isEnabled ? "opacity-100" : "opacity-0"} />
                            <span>{lang === 'sv' ? 'Välj alla' : 'All'}</span>
                        </button>
                    </div>

                    {/* Level Rows Matrix */}
                    <div className="divide-y divide-[var(--border-main)] flex-1">
                        {topicLevels.map(lvl => {
                            const isLvlSelected = selectedLevels.includes(lvl);
                            const isSearchMatch = highlightedLevels?.has(lvl);
                            const isCurrentlyInspected = inspectedLevel?.topicId === topic.id && inspectedLevel?.level === lvl;
                            const desc = LEVEL_DESCRIPTIONS[topic.id]?.[lvl]?.[lang] || "";
                            const mapLevelData = mapTopic?.levels.find(l => l.lvl === lvl);
                            const mathExample = mapLevelData?.ex || "";

                            return (
                                <div
                                    key={lvl}
                                    onClick={() => toggleTopicLevel(topic.id, lvl)}
                                    className={`flex items-stretch transition-colors cursor-pointer select-none ${
                                        isLvlSelected
                                            ? 'bg-emerald-50/70 dark:bg-emerald-950/35'
                                            : isSearchMatch
                                                ? 'bg-sky-50/60 dark:bg-sky-950/25'
                                                : 'bg-[var(--bg-card)] hover:bg-[var(--bg-surface)]'
                                    }`}
                                >
                                    {/* Level Number Badge */}
                                    <div className={`w-10 shrink-0 flex items-center justify-center font-bold font-mono text-xs border-r border-[var(--border-main)] ${
                                        isLvlSelected
                                            ? 'bg-emerald-600 text-white'
                                            : isSearchMatch
                                                ? 'bg-sky-600 text-white'
                                                : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'
                                    }`}>
                                        {lvl}
                                    </div>

                                    {/* Bold, Prominent Level Description + Subordinate Math Example */}
                                    <div className="flex-1 px-3.5 py-3 border-r border-[var(--border-main)] flex flex-col justify-center gap-1 min-w-0">
                                        <span className="font-bold text-[13.5px] sm:text-sm text-[var(--text-main)] leading-snug">
                                            {desc}
                                        </span>
                                        {mathExample && (
                                            <div className="text-xs font-medium text-[var(--text-muted)] truncate">
                                                <MathDisplay
                                                    content={mathExample.includes('\\') || mathExample.includes('=') || mathExample.includes('$') ? (mathExample.includes('$') ? mathExample : `$$${mathExample}$$`) : mathExample}
                                                    className="inline-block"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Inspect & Connected Steps Drawer Trigger */}
                                    <button
                                        type="button"
                                        onClick={(e) => openLevelInspector(e, topic.id, lvl)}
                                        className={`w-9 shrink-0 flex items-center justify-center border-r border-[var(--border-main)] transition-colors cursor-pointer ${
                                            isCurrentlyInspected
                                                ? 'bg-sky-600 text-white'
                                                : 'text-[var(--text-muted)] hover:text-sky-700 dark:hover:text-sky-400 hover:bg-[var(--bg-surface)]'
                                        }`}
                                        title={lang === 'sv' ? 'Granska uppgift & kopplingar' : 'Inspect sample & connected steps'}
                                    >
                                        <Eye size={15} />
                                    </button>

                                    {/* Primary Selection Checkbox */}
                                    <div className="w-11 shrink-0 flex items-center justify-center">
                                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${
                                            isLvlSelected
                                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                                : 'border-[var(--border-strong)] bg-[var(--bg-card)]'
                                        }`}>
                                            {isLvlSelected && <Check size={12} strokeWidth={3} />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        };

        // Slide-over Drawer Node Resolution
        const inspectedNode = inspectedLevel
            ? SKILL_GRAPH[`${inspectedLevel.topicId}:${inspectedLevel.level}`]
            : null;
        const inspectedPrereqs = (inspectedNode?.prerequisites || [])
            .map(id => SKILL_GRAPH[id])
            .filter(Boolean);
        const inspectedUnlocks = (inspectedNode?.unlocks || [])
            .map(id => SKILL_GRAPH[id])
            .filter(Boolean);
        const isInspectedAdded = inspectedLevel
            ? (selection[inspectedLevel.topicId]?.levels || []).includes(inspectedLevel.level)
            : false;

        return (
            <div className="layout-wrapper font-sans relative z-10 animate-in fade-in pb-10">
                <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 pt-4">
                    <div className="lab-twocol">

                        {/* LEFT STICKY COMMAND RAIL (Unified Card, Crisp 1px Hairline Dividers) */}
                        <aside className="lab-sidebar">
                            <div className="card p-0 overflow-hidden border border-[var(--border-main)]">

                                {/* SECTION 1: HEADER, PRESETS & SELECTED MANIFEST */}
                                <div className="p-5 space-y-4">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shrink-0">
                                                <Beaker size={20} />
                                            </div>
                                            <div>
                                                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-[var(--text-main)] leading-none mb-1">
                                                    {t.title}
                                                </h1>
                                                <p className="text-xs font-medium text-[var(--text-muted)]">
                                                    {lang === 'sv' ? 'Bygg anpassat övningspass eller prov' : 'Build custom practice or exam'}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setShowGuideModal(true)}
                                            className="px-2.5 py-2 bg-[var(--bg-surface)] text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] rounded-xl transition-colors border border-[var(--border-main)] flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                                            title={t.guideBtn}
                                        >
                                            <HelpCircle size={15} className="text-emerald-600" />
                                            <span className="hidden xl:inline">{t.guideBtn}</span>
                                        </button>
                                    </div>

                                    <div data-tour="testlab-presets" className="space-y-3">
                                        {/* Preset Selector */}
                                        <div>
                                            <label className="block text-[11px] font-bold uppercase text-[var(--text-muted)] tracking-wider mb-1.5">
                                                {lang === 'sv' ? "Snabbval (Färdiga paket)" : "Presets"}
                                            </label>
                                            <select
                                                value={meta.bundleId || ""}
                                                onChange={(e) => applyPresetSelection(e.target.value)}
                                                className="w-full bg-[var(--bg-surface)] border border-[var(--border-main)] focus:border-emerald-600 rounded-xl px-3.5 py-2 text-xs font-semibold text-[var(--text-main)] outline-none transition-colors cursor-pointer"
                                            >
                                                <option value="">{lang === 'sv' ? "-- Välj färdigt paket --" : "-- Choose a preset --"}</option>
                                                {Object.entries(BUNDLE_PRESETS).map(([id, data]) => (
                                                    <option key={id} value={id}>{data.title} ({id})</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Live Selected Topics Manifest */}
                                        <div className="space-y-2 pt-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                                    {lang === 'sv' ? "Valt innehåll" : "Selected Content"}
                                                </span>
                                                <span className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400">
                                                    {totalSelectedTopics} {lang === 'sv' ? 'områden' : 'topics'} · {totalSelectedNodes} {lang === 'sv' ? 'nivåer' : 'levels'}
                                                </span>
                                            </div>

                                            {totalSelectedTopics === 0 ? (
                                                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-dashed border-[var(--border-strong)] text-xs text-[var(--text-muted)] text-center">
                                                    {lang === 'sv'
                                                        ? 'Inga områden valda ännu. Välj nivåer till höger.'
                                                        : 'No topics selected yet. Pick levels on the right.'}
                                                </div>
                                            ) : (
                                                <div className="max-h-36 overflow-y-auto custom-scrollbar flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)]">
                                                    {enabledTopicEntries.map(([topicId, conf]) => (
                                                        <span
                                                            key={topicId}
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-main)] text-xs font-semibold text-[var(--text-main)]"
                                                        >
                                                            <span className="truncate max-w-[140px]">
                                                                {getTopicDisplayName(topicId, lang)}
                                                            </span>
                                                            <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                                                                N{conf.levels.join(',')}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeTopicFromSelection(topicId)}
                                                                className="text-[var(--text-muted)] hover:text-rose-600 cursor-pointer ml-0.5"
                                                                title={lang === 'sv' ? 'Ta bort' : 'Remove'}
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 2: CONTROLS & BEHAVIOR */}
                                <div data-tour="testlab-settings" className="p-5 border-t border-[var(--border-main)] space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Settings2 size={14} className="text-[var(--text-muted)]" />
                                        <h2 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                            {lang === 'sv' ? "Inställningar" : "Settings"}
                                        </h2>
                                    </div>

                                    {/* Segmented Mode Selector: Öva (Cobalt) vs Provläge (Rose) */}
                                    <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)]">
                                        <button
                                            type="button"
                                            onClick={() => setMeta(p => ({ ...p, mode: 'practice' }))}
                                            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                                                meta.mode !== 'exam'
                                                    ? 'bg-sky-600 text-white'
                                                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                            }`}
                                        >
                                            <Zap size={14} />
                                            <span>{t.modePractice}</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setMeta(p => ({ ...p, mode: 'exam' }))}
                                            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                                                meta.mode === 'exam'
                                                    ? 'bg-rose-600 text-white'
                                                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                            }`}
                                        >
                                            <Lock size={14} />
                                            <span>{t.modeExam}</span>
                                        </button>
                                    </div>

                                    {meta.mode === 'exam' && (
                                        <p className="text-[11px] font-medium text-rose-700 dark:text-rose-300 px-1">
                                            {lang === 'sv'
                                                ? 'Provläge: Rätt svar och granskning döljs tills hela provet är inlämnat.'
                                                : 'Exam mode: Answers and review remain hidden until the entire test is submitted.'}
                                        </p>
                                    )}

                                    {/* Question Count Selector */}
                                    <div className="flex items-center justify-between bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl px-3.5 py-2">
                                        <div className="flex items-center gap-2 shrink-0">
                                            <ListChecks size={15} className="text-[var(--text-muted)]" />
                                            <span className="text-xs font-bold text-[var(--text-main)]">
                                                {lang === 'sv' ? 'Antal uppgifter' : 'Question count'}
                                            </span>
                                        </div>
                                        <select
                                            value={meta.limit}
                                            onChange={(e) => setMeta(p => ({ ...p, limit: Number(e.target.value) }))}
                                            className="bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-main)] font-mono font-bold text-xs rounded-lg px-2.5 py-1 outline-none focus:border-emerald-600 cursor-pointer"
                                        >
                                            <option value={5}>5 st</option>
                                            <option value={10}>10 st</option>
                                            <option value={15}>15 st</option>
                                            <option value={20}>20 st</option>
                                            <option value={30}>30 st</option>
                                            <option value={40}>40 st</option>
                                            <option value={50}>50 st</option>
                                            <option value={0}>∞ ({lang === 'sv' ? 'Obegränsat' : 'Infinite'})</option>
                                        </select>
                                    </div>

                                    {/* Word Problems Toggle */}
                                    <button
                                        type="button"
                                        disabled={!hasWordProblemSupport}
                                        onClick={() => setUseWordProblems(!useWordProblems)}
                                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors border ${
                                            !hasWordProblemSupport
                                                ? 'opacity-45 cursor-not-allowed bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                                                : useWordProblems
                                                    ? 'bg-[var(--bg-card)] border-sky-600 text-[var(--text-main)] cursor-pointer'
                                                    : 'bg-[var(--bg-surface)] border-[var(--border-main)] text-[var(--text-main)] hover:border-[var(--border-strong)] cursor-pointer'
                                        }`}
                                    >
                                        <span>{lang === 'sv' ? 'Textuppgifter (Problemlösning)' : 'Word Problems'}</span>
                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                                            useWordProblems && hasWordProblemSupport
                                                ? 'bg-sky-600 text-white'
                                                : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-main)]'
                                        }`}>
                                            {!hasWordProblemSupport
                                                ? (lang === 'sv' ? 'Ej tillgänglig' : 'N/A')
                                                : useWordProblems ? (lang === 'sv' ? 'Aktiv' : 'On') : (lang === 'sv' ? 'Av' : 'Off')}
                                        </span>
                                    </button>

                                    {/* Coach / Clues Toggle */}
                                    <button
                                        type="button"
                                        onClick={() => setAllowCoach(!allowCoach)}
                                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors border cursor-pointer ${
                                            allowCoach
                                                ? 'bg-[var(--bg-card)] border-amber-600 text-[var(--text-main)]'
                                                : 'bg-[var(--bg-surface)] border-[var(--border-main)] text-[var(--text-main)] hover:border-[var(--border-strong)]'
                                        }`}
                                    >
                                        <span>{lang === 'sv' ? 'Tillåt Coach / Ledtrådar' : 'Allow Coach / Clues'}</span>
                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                                            allowCoach
                                                ? 'bg-amber-600 text-white'
                                                : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-main)]'
                                        }`}>
                                            {allowCoach ? (lang === 'sv' ? 'Tillåten' : 'Allowed') : (lang === 'sv' ? 'Av' : 'Off')}
                                        </span>
                                    </button>
                                </div>

                                {/* SECTION 3: ACTIONS & DESTINATIONS */}
                                <div data-tour="testlab-actions" className="p-5 border-t border-[var(--border-main)] bg-[var(--bg-surface)]/50 space-y-2.5">
                                    <button
                                        type="button"
                                        onClick={startNewSession}
                                        disabled={totalSelectedTopics === 0}
                                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        <Play size={15} fill="currentColor" />
                                        <span>{t.startBtn}</span>
                                        {totalSelectedNodes > 0 && (
                                            <span className="text-[11px] font-mono font-bold bg-white/20 text-white px-2 py-0.5 rounded-md">
                                                {totalSelectedNodes}
                                            </span>
                                        )}
                                    </button>

                                    {isTeacherOrAdmin && (
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={copyTestLink}
                                                disabled={totalSelectedTopics === 0}
                                                className="py-2.5 px-2.5 rounded-xl text-xs font-bold bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-main)] hover:border-emerald-600 transition-colors cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5"
                                            >
                                                {linkCopiedToast ? <Check size={14} className="text-emerald-600" /> : <LayoutGrid size={14} />}
                                                <span>{linkCopiedToast ? t.linkCopied : t.copyLink}</span>
                                            </button>

                                            <button
                                                type="button"
                                                disabled={totalSelectedTopics === 0}
                                                onClick={() => setShowSaveToUnitModal(true)}
                                                className="py-2.5 px-2.5 rounded-xl text-xs font-bold bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-main)] hover:border-emerald-600 transition-colors cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5"
                                            >
                                                {unitSavedToast ? <Check size={14} className="text-emerald-600" /> : <Bookmark size={14} />}
                                                <span>{unitSavedToast ? (lang === 'sv' ? 'Sparad!' : 'Saved!') : (lang === 'sv' ? 'Spara i modul' : 'Save to Unit')}</span>
                                            </button>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-2 pt-1.5">
                                        <button
                                            type="button"
                                            onClick={resetAllSelection}
                                            className="py-2 px-3 rounded-xl text-xs font-bold bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-main)] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            <RefreshCcw size={13} />
                                            <span>{lang === 'sv' ? "Rensa val" : "Reset"}</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={onBack}
                                            className="py-2 px-3 rounded-xl text-xs font-bold bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-rose-600 border border-[var(--border-main)] hover:border-rose-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            <LogOut size={13} />
                                            <span>{t.toDashboard}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* RIGHT WORKSPACE: ALLA OMRÅDEN FIRST + SÖK & UTFORSKA */}
                        <main className="lab-main flex flex-col gap-4">

                            {/* Top Mode Switcher Bar */}
                            <div className="card p-3 sm:px-5 sm:py-3.5 border border-[var(--border-main)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-sm font-extrabold text-[var(--text-main)]">
                                        {setupTab === 'matrix'
                                            ? (lang === 'sv' ? 'Välj områden & nivåer i läroplanen' : 'Select topics & levels across the curriculum')
                                            : (lang === 'sv' ? 'Utforska kunskapsträdet & kopplingar' : 'Explore concept graph & progressions')}
                                    </h2>
                                    <p className="text-xs text-[var(--text-muted)]">
                                        {setupTab === 'matrix'
                                            ? (lang === 'sv'
                                                ? 'Klicka på nivåer (1–9) för att välja, eller klicka på ögat för exempeluppgift och kopplade steg.'
                                                : 'Click levels (1–9) to toggle, or click the eye icon to inspect sample problems and connected steps.')
                                            : (lang === 'sv'
                                                ? 'Se hur moment bygger på varandra och lägg till förkunskaper eller utmaningar.'
                                                : 'See how concepts connect and add prerequisites or challenge levels.')}
                                    </p>
                                </div>

                                <div
                                    data-tour="testlab-view-switcher"
                                    className="inline-flex p-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] shrink-0 self-start sm:self-auto"
                                >
                                    <button
                                        type="button"
                                        onClick={() => setSetupTab('matrix')}
                                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                            setupTab === 'matrix'
                                                ? 'bg-emerald-600 text-white'
                                                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                        }`}
                                    >
                                        <LayoutGrid size={13} />
                                        <span>{lang === 'sv' ? 'Alla områden' : 'All Topics'}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setSetupTab('explorer')}
                                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                            setupTab === 'explorer'
                                                ? 'bg-emerald-600 text-white'
                                                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                        }`}
                                    >
                                        <Search size={13} />
                                        <span>{lang === 'sv' ? 'Sök & Utforska' : 'Search & Explore'}</span>
                                    </button>
                                </div>
                            </div>

                            {setupTab === 'matrix' ? (
                                <>
                                    {/* Clean Filter Search + Category Tabs Row */}
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
                                        {/* Category Tabs */}
                                        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                                            {Object.entries(CATEGORIES).map(([catKey, category]) => {
                                                const isActive = !filteredSearchTopics && activeCategory === catKey;
                                                const count = category.topics.filter(tp => selection[tp.id]?.enabled).length;

                                                return (
                                                    <button
                                                        type="button"
                                                        key={catKey}
                                                        onClick={() => {
                                                            setMatrixSearchQuery('');
                                                            setActiveCategory(catKey);
                                                        }}
                                                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-colors border cursor-pointer ${
                                                            isActive
                                                                ? 'bg-emerald-600 text-white border-emerald-600'
                                                                : 'bg-[var(--bg-card)] border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                                        }`}
                                                    >
                                                        <Award size={14} />
                                                        <span>{category.label[lang]}</span>
                                                        {count > 0 && (
                                                            <span className={`px-1.5 py-0.2 rounded-md text-[11px] font-mono font-bold ${
                                                                isActive ? 'bg-white/20 text-white' : 'bg-[var(--bg-surface)] text-[var(--text-main)]'
                                                            }`}>
                                                                {count}
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Non-Destructive Filter Input */}
                                        <div className="relative w-full lg:w-72 shrink-0">
                                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                                            <input
                                                ref={matrixSearchRef}
                                                type="text"
                                                value={matrixSearchQuery}
                                                onChange={(e) => setMatrixSearchQuery(e.target.value)}
                                                placeholder={lang === 'sv' ? 'Filtrera ämne eller nivå...' : 'Filter topic or level...'}
                                                className="w-full pl-8 pr-8 py-2 bg-[var(--bg-card)] border border-[var(--border-main)] focus:border-emerald-600 rounded-xl text-xs font-semibold text-[var(--text-main)] outline-none transition-colors"
                                            />
                                            {matrixSearchQuery && (
                                                <button
                                                    type="button"
                                                    onClick={() => setMatrixSearchQuery('')}
                                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                                                >
                                                    <X size={13} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Active Category or Filtered Search Topic Grid */}
                                    <div
                                        data-tour="testlab-matrix"
                                        className="card p-5 sm:p-6 bg-[var(--bg-card)] border border-[var(--border-main)]"
                                    >
                                        {filteredSearchTopics ? (
                                            <>
                                                <div className="mb-5 flex items-center justify-between border-b border-[var(--border-main)] pb-3.5">
                                                    <div>
                                                        <h3 className="text-base font-extrabold text-[var(--text-main)]">
                                                            {lang === 'sv'
                                                                ? `Sökresultat för "${matrixSearchQuery.trim()}" (${filteredSearchTopics.length})`
                                                                : `Results for "${matrixSearchQuery.trim()}" (${filteredSearchTopics.length})`}
                                                        </h3>
                                                        <p className="text-xs font-medium text-[var(--text-muted)]">
                                                            {lang === 'sv'
                                                                ? 'Matchande nivåer är markerade i blått. Klicka på ögat för exempel och kopplingar.'
                                                                : 'Matching levels are highlighted. Click the eye icon to inspect samples and links.'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setMatrixSearchQuery('')}
                                                        className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs font-bold cursor-pointer"
                                                    >
                                                        {lang === 'sv' ? 'Rensa filter' : 'Clear filter'}
                                                    </button>
                                                </div>

                                                {filteredSearchTopics.length === 0 ? (
                                                    <div className="py-12 text-center text-xs font-semibold text-[var(--text-muted)]">
                                                        {lang === 'sv' ? 'Inga matchande moment hittades.' : 'No matching topics found.'}
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
                                                        {filteredSearchTopics.map(item =>
                                                            renderTopicCard(item.topic, {
                                                                categoryBadge: item.categoryLabel,
                                                                highlightedLevels: item.matchedLevels
                                                            })
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <div className="mb-5 flex items-center justify-between border-b border-[var(--border-main)] pb-3.5">
                                                    <div>
                                                        <h3 className="text-base sm:text-lg font-extrabold text-[var(--text-main)] tracking-tight leading-snug">
                                                            {activeCategoryData.label[lang]}
                                                        </h3>
                                                        <p className="text-xs font-medium text-[var(--text-muted)]">
                                                            {activeCategoryData.topics.length} {lang === 'sv' ? 'tillgängliga delmoment' : 'available topics'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
                                                    {activeCategoryData.topics.map(topic => renderTopicCard(topic))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="card p-4 sm:p-5 border border-[var(--border-main)]">
                                    <SkillGraphExplorer
                                        mode="teacher_picker"
                                        lang={lang}
                                        focusedTarget={focusedGraphTarget}
                                        onFocusChange={(target) => {
                                            if (target) setFocusedGraphTarget(target);
                                        }}
                                        onAddNode={(node) => {
                                            if (node?.topicId && node?.level) {
                                                toggleTopicLevel(node.topicId, node.level);
                                            }
                                        }}
                                        selectedNodeIds={selectedNodeIds}
                                        showCategoryBrowser={true}
                                        compactHorizontal={false}
                                    />
                                </div>
                            )}
                        </main>
                    </div>
                </div>

                {/* SLIDE-OVER LEVEL INSPECTOR & CONNECTED STEPS DRAWER */}
                {inspectedLevel && (
                    <div
                        className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-150 font-sans"
                        onClick={() => setInspectedLevel(null)}
                    >
                        <aside
                            className="w-full max-w-lg bg-[var(--bg-card)] border-l border-[var(--border-main)] h-full flex flex-col shadow-2xl text-[var(--text-main)]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Drawer Header */}
                            <div className="px-6 py-4 bg-[var(--bg-surface)] border-b border-[var(--border-main)] flex items-start justify-between gap-3 shrink-0">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono text-xs font-bold">
                                            {lang === 'sv' ? `Nivå ${inspectedLevel.level}` : `Level ${inspectedLevel.level}`}
                                        </span>
                                        <span className="text-xs font-extrabold text-[var(--text-muted)] uppercase tracking-wider truncate">
                                            {getTopicDisplayName(inspectedLevel.topicId, lang)}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-extrabold text-[var(--text-main)] leading-snug">
                                        {LEVEL_DESCRIPTIONS[inspectedLevel.topicId]?.[inspectedLevel.level]?.[lang] || ''}
                                    </h3>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setInspectedLevel(null)}
                                    className="p-2 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-main)] cursor-pointer shrink-0"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Drawer Scrollable Body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[var(--bg-canvas)]">
                                {/* 1. Live Sample Problem Card */}
                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                            {lang === 'sv' ? 'Exempeluppgift' : 'Sample Problem'}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={(e) => openLevelInspector(e, inspectedLevel.topicId, inspectedLevel.level)}
                                            className="px-2.5 py-1 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] border border-[var(--border-main)] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <RefreshCcw size={12} className={inspectedLevel.loading ? 'animate-spin' : ''} />
                                            <span>{lang === 'sv' ? 'Nytt exempel' : 'New Example'}</span>
                                        </button>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] min-h-[160px] flex items-center justify-center">
                                        {inspectedLevel.loading ? (
                                            <Loader2 className="animate-spin text-emerald-600" size={26} />
                                        ) : inspectedLevel.question ? (
                                            <div className="w-full">
                                                <QuestionPromptCard
                                                    question={inspectedLevel.question}
                                                    lang={lang}
                                                    layout="compact"
                                                    allowVisualReveal={false}
                                                />
                                            </div>
                                        ) : (
                                            <p className="text-xs text-[var(--text-muted)]">
                                                {lang === 'sv' ? 'Kunde inte ladda exempeluppgift.' : 'Could not load sample problem.'}
                                            </p>
                                        )}
                                    </div>

                                    {/* Primary Toggle Button for Inspected Level */}
                                    <button
                                        type="button"
                                        onClick={() => toggleTopicLevel(inspectedLevel.topicId, inspectedLevel.level)}
                                        className={`w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                                            isInspectedAdded
                                                ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                        }`}
                                    >
                                        {isInspectedAdded ? <Check size={15} strokeWidth={3} /> : <Plus size={15} strokeWidth={2.5} />}
                                        <span>
                                            {isInspectedAdded
                                                ? (lang === 'sv' ? `Tillagd i testet (Nivå ${inspectedLevel.level})` : `Added to Test (Level ${inspectedLevel.level})`)
                                                : (lang === 'sv' ? `Lägg till i testet (Nivå ${inspectedLevel.level})` : `Add to Test (Level ${inspectedLevel.level})`)}
                                        </span>
                                    </button>
                                </div>

                                {/* 2. Equal-Weight Upstream Prerequisites */}
                                {inspectedPrereqs.length > 0 && (
                                    <div className="space-y-2.5 pt-2 border-t border-[var(--border-main)]">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
                                            {lang === 'sv' ? 'Förkunskaper (Uppvärmning)' : 'Prerequisites (Warm-up)'}
                                        </span>

                                        <div className="space-y-2">
                                            {inspectedPrereqs.map(prereq => {
                                                const isAdded = (selection[prereq.topicId]?.levels || []).includes(Number(prereq.level));
                                                return (
                                                    <div
                                                        key={prereq.id}
                                                        className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] flex items-center justify-between gap-3"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={(e) => openLevelInspector(e, prereq.topicId, prereq.level)}
                                                            className="min-w-0 flex-1 text-left cursor-pointer group"
                                                        >
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="px-1.5 py-0.5 rounded bg-amber-600 text-white font-mono text-[10px] font-bold">
                                                                    N{prereq.level}
                                                                </span>
                                                                <span className="text-xs font-extrabold text-[var(--text-main)] group-hover:text-amber-700 truncate">
                                                                    {prereq.topicLabel?.[lang] || prereq.topicLabel?.sv}
                                                                </span>
                                                            </div>
                                                            <p className="text-[13px] font-bold text-[var(--text-main)] mt-1 leading-snug">
                                                                {prereq.levelDesc?.[lang] || prereq.levelDesc?.sv}
                                                            </p>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => toggleTopicLevel(prereq.topicId, prereq.level)}
                                                            className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors ${
                                                                isAdded
                                                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                                                    : 'bg-[var(--bg-surface)] hover:bg-amber-600 text-[var(--text-main)] hover:text-white border-[var(--border-strong)] hover:border-amber-600'
                                                            }`}
                                                        >
                                                            {isAdded ? <Check size={13} strokeWidth={3} /> : <Plus size={13} strokeWidth={2.5} />}
                                                            <span>{isAdded ? (lang === 'sv' ? 'Tillagd' : 'Added') : (lang === 'sv' ? 'Lägg till' : 'Add')}</span>
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* 3. Equal-Weight Downstream Next Steps */}
                                {inspectedUnlocks.length > 0 && (
                                    <div className="space-y-2.5 pt-2 border-t border-[var(--border-main)]">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300 block">
                                            {lang === 'sv' ? 'Nästa steg (Utmaning)' : 'Next Steps (Challenge)'}
                                        </span>

                                        <div className="space-y-2">
                                            {inspectedUnlocks.map(nextNode => {
                                                const isAdded = (selection[nextNode.topicId]?.levels || []).includes(Number(nextNode.level));
                                                return (
                                                    <div
                                                        key={nextNode.id}
                                                        className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] flex items-center justify-between gap-3"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={(e) => openLevelInspector(e, nextNode.topicId, nextNode.level)}
                                                            className="min-w-0 flex-1 text-left cursor-pointer group"
                                                        >
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="px-1.5 py-0.5 rounded bg-sky-600 text-white font-mono text-[10px] font-bold">
                                                                    N{nextNode.level}
                                                                </span>
                                                                <span className="text-xs font-extrabold text-[var(--text-main)] group-hover:text-sky-700 truncate">
                                                                    {nextNode.topicLabel?.[lang] || nextNode.topicLabel?.sv}
                                                                </span>
                                                            </div>
                                                            <p className="text-[13px] font-bold text-[var(--text-main)] mt-1 leading-snug">
                                                                {nextNode.levelDesc?.[lang] || nextNode.levelDesc?.sv}
                                                            </p>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => toggleTopicLevel(nextNode.topicId, nextNode.level)}
                                                            className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors ${
                                                                isAdded
                                                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                                                    : 'bg-[var(--bg-surface)] hover:bg-sky-600 text-[var(--text-main)] hover:text-white border-[var(--border-strong)] hover:border-sky-600'
                                                            }`}
                                                        >
                                                            {isAdded ? <Check size={13} strokeWidth={3} /> : <Plus size={13} strokeWidth={2.5} />}
                                                            <span>{isAdded ? (lang === 'sv' ? 'Tillagd' : 'Added') : (lang === 'sv' ? 'Lägg till' : 'Add')}</span>
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Drawer Footer */}
                            <div className="px-6 py-3.5 bg-[var(--bg-surface)] border-t border-[var(--border-main)] flex justify-end shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setInspectedLevel(null)}
                                    className="px-5 py-2 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-main)] text-xs font-bold cursor-pointer"
                                >
                                    {lang === 'sv' ? 'Klar' : 'Done'}
                                </button>
                            </div>
                        </aside>
                    </div>
                )}

                {/* INTERACTIVE SPOTLIGHT WALKTHROUGH TOUR */}
                <SpotlightTour
                    steps={testLabTourSteps}
                    isOpen={showGuideModal}
                    onClose={handleCloseTour}
                    lang={lang}
                />

                {isTeacherOrAdmin && (
                    <SaveToUnitModal
                        isOpen={showSaveToUnitModal}
                        onClose={() => setShowSaveToUnitModal(false)}
                        onConfirmSave={handleSaveToUnit}
                        testTitle={meta.bundleId ? BUNDLE_PRESETS[meta.bundleId]?.title : (lang === 'sv' ? "Delprov: Testlabb" : "Test Lab Checkpoint")}
                        teacherId={profile?.id}
                        lang={lang}
                    />
                )}
            </div>
        );
    }

    // =========================================================
    // --- 2. ACTIVE TEST UI (Clean Canvas + On-Demand Review) ---
    // =========================================================
    if (internalMode === 'ACTIVE') {
        if (packet.length === 0 || isGenerating) {
            return (
                <div className="layout-wrapper flex flex-col items-center justify-center h-screen gap-4">
                    <Loader2 className="animate-spin text-emerald-600 dark:text-emerald-400" size={44} />
                    <p className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider">
                        {lang === 'sv' ? "Hämtar uppgifter..." : "Fetching questions..."}
                    </p>
                </div>
            );
        }

        const currentQ = packet[currentIndex];
        if (!currentQ || !currentQ.resolvedData) {
            return (
                <div className="layout-wrapper flex items-center justify-center h-screen">
                    <p className="text-[var(--text-muted)] font-medium">Error loading question. Please go back and try again.</p>
                </div>
            );
        }

        const currentResponse = responses[currentIndex];
        const responseFeedback = currentResponse
            ? (meta.mode === 'exam' ? 'submitted' : (currentResponse.isCorrect ? 'correct' : 'incorrect'))
            : null;

        const isPracticeMode = meta.mode !== 'exam';
        const answeredEntries = Object.entries(responses)
            .map(([idx, res]) => ({ index: Number(idx), ...res }))
            .sort((a, b) => a.index - b.index);
        const incorrectCount = answeredEntries.filter(r => !r.isCorrect).length;
        const activeClues = currentQ.clues || currentQ.resolvedData?.clues || [];

        const toggleReviewClue = (idx) => {
            setVisibleClues(prev => ({ ...prev, [idx]: !prev[idx] }));
        };

        const filteredReviewItems = reviewOnlyIncorrect
            ? answeredEntries.filter(r => !r.isCorrect)
            : answeredEntries;

        return (
            <div className="layout-wrapper font-sans flex flex-col min-h-screen relative pb-10">
                {/* SLIM STICKY TOP BAR */}
                <header className="sticky top-0 z-30 w-full bg-[var(--bg-card)] border-b border-[var(--border-main)] px-4 py-3 transition-colors duration-150 no-print">
                    <div className="max-w-[1100px] mx-auto w-full flex items-center justify-between gap-3">

                        <div className="flex items-center gap-2">
                            {activeBucket && activeBucket !== 'FREE_PLAY' ? (
                                <button
                                    type="button"
                                    onClick={handleQuit}
                                    className="px-3.5 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-main)] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                                >
                                    <ChevronLeft size={15} />
                                    <span>{lang === 'sv' ? "Tillbaka till planeringen" : "Back to Roadmap"}</span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setInternalMode('SETUP')}
                                    className="px-3.5 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-main)] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Settings2 size={14} />
                                    <span>{t.backToLab}</span>
                                </button>
                            )}

                            <div className="hidden sm:flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setCurrentIndex(p => Math.max(0, p - 1))}
                                    disabled={currentIndex === 0}
                                    className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] disabled:opacity-25 flex items-center justify-center transition-colors cursor-pointer border border-[var(--border-main)]"
                                    title={lang === 'sv' ? "Föregående fråga" : "Previous question"}
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentIndex(p => Math.min(packet.length - 1, p + 1))}
                                    disabled={currentIndex === packet.length - 1}
                                    className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] disabled:opacity-25 flex items-center justify-center transition-colors cursor-pointer border border-[var(--border-main)]"
                                    title={lang === 'sv' ? "Nästa fråga" : "Next question"}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Center Progress Pill */}
                        <div className="flex items-center gap-2.5 bg-[var(--bg-surface)] px-3.5 py-1.5 rounded-xl border border-[var(--border-main)]">
                            <span className={`w-2 h-2 rounded-full ${isPracticeMode ? 'bg-sky-600' : 'bg-rose-600'}`} />
                            <span className="text-xs font-bold text-[var(--text-muted)] hidden sm:inline">
                                {isPracticeMode ? t.modePractice : t.modeExam}
                            </span>
                            <span className="font-mono font-bold text-xs text-[var(--text-main)]">
                                {currentIndex + 1} / {meta.limit || "∞"}
                            </span>
                        </div>

                        {/* Right Actions: On-Demand Practice Review Drawer + Finish/Quit */}
                        <div className="flex items-center gap-2">
                            {isPracticeMode && answeredEntries.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setReviewOnlyIncorrect(incorrectCount > 0);
                                        setShowReviewDrawer(true);
                                    }}
                                    className="px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-main)] text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                    <Eye size={14} className="text-sky-600" />
                                    <span>{t.reviewBtn}</span>
                                    {incorrectCount > 0 && (
                                        <span className="px-1.5 py-0.2 rounded-md bg-amber-600 text-white font-mono text-[11px] font-bold">
                                            {incorrectCount}
                                        </span>
                                    )}
                                </button>
                            )}

                            {answeredEntries.length > 0 && Number(meta.limit) === 0 && (
                                <button
                                    type="button"
                                    onClick={finishEarlyToSummary}
                                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                                >
                                    {t.finish}
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={handleQuit}
                                className="px-3 py-2 bg-[var(--bg-surface)] hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[var(--text-muted)] hover:text-rose-600 border border-[var(--border-main)] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                                title={t.quit}
                            >
                                <LogOut size={14} />
                                <span className="hidden sm:inline">{t.toDashboard}</span>
                            </button>
                        </div>
                    </div>

                    {/* Segmented Question Progress Track */}
                    {Number(meta.limit) > 0 && (
                        <div className="max-w-[1100px] mx-auto w-full mt-2.5 flex gap-1">
                            {Array.from({ length: Number(meta.limit) }).map((_, i) => {
                                const res = responses[i];
                                let barColor = 'bg-[var(--bg-surface)]';
                                if (i === currentIndex) barColor = isPracticeMode ? 'bg-sky-600' : 'bg-rose-600';
                                else if (res) {
                                    barColor = !isPracticeMode
                                        ? 'bg-[var(--border-strong)]'
                                        : res.isCorrect
                                            ? 'bg-emerald-500'
                                            : 'bg-amber-500';
                                }
                                return <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${barColor}`} />;
                            })}
                        </div>
                    )}
                </header>

                {coach.isOpen && (
                    <MyCoachModal
                        visible={coach.isOpen}
                        onClose={coach.closeCoach}
                        question={currentQ}
                        lang={lang}
                        {...coach.coachProps}
                    />
                )}

                {/* SINGLE CLEAN QUESTION STAGE ON --bg-canvas (Mirrors PracticeView) */}
                <main className="flex-1 max-w-[920px] mx-auto w-full px-4 sm:px-6 pt-6">
                    <div className="card p-6 sm:p-8 border border-[var(--border-main)] flex flex-col justify-between min-h-[420px] space-y-6">
                        {/* Sub-header */}
                        <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-3">
                            <span className="text-xs font-bold font-mono text-[var(--text-muted)] uppercase tracking-wider">
                                {lang === 'sv' ? "Uppgift" : "Question"} {currentIndex + 1}
                                {Number(meta.limit) > 0 ? ` / ${meta.limit}` : ''}
                            </span>

                            <div className="flex items-center gap-2.5">
                                {allowCoach && isPracticeMode && !currentResponse && (
                                    <button
                                        type="button"
                                        onClick={coach.openCoach}
                                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                        <HelpCircle size={14} />
                                        <span>{lang === 'sv' ? 'Hjälp / Exempel' : 'Help / Example'}</span>
                                    </button>
                                )}

                                {currentResponse && (
                                    <div className="flex items-center gap-1.5">
                                        {isPracticeMode ? (
                                            currentResponse.isCorrect ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                                    <CheckCircle2 size={16} />
                                                    {lang === 'sv' ? 'Rätt svar!' : 'Correct!'}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400">
                                                    <XCircle size={16} />
                                                    {lang === 'sv' ? 'Inte riktigt rätt' : 'Not quite right'}
                                                </span>
                                            )
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)]">
                                                <CheckCircle2 size={16} className="text-emerald-600" />
                                                {t.answerReceived}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Shared Question Prompt */}
                        <QuestionPromptCard
                            question={currentQ}
                            lang={lang}
                            isWordProblem={Boolean(useWordProblems || currentQ?.resolvedData?.renderData?.isWordProblemApplied)}
                            allowVisualReveal={false}
                        />

                        {/* Shared Response Box + Post-Answer Controls */}
                        <div className="w-full max-w-xl mx-auto space-y-4 pt-2">
                            <QuestionResponseBox
                                question={currentQ}
                                value={currentResponse ? currentResponse.answer : inputValue}
                                onChange={setInputValue}
                                onSubmit={(val) => handleLabSubmit(val)}
                                onAdvance={advanceToNextQuestion}
                                feedback={responseFeedback}
                                disabled={Boolean(currentResponse)}
                                isMobile={isMobile}
                                lang={lang}
                                submitOnChoice={true}
                                submitLabel={lang === 'sv' ? 'Svara' : 'Submit'}
                                submittedMessage={t.answerReceived}
                            />

                            {/* Explicit Next Action & Inline Solution Inspection in Practice Mode */}
                            {currentResponse && isPracticeMode && (
                                <div className="space-y-3 pt-1">
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                                        {!currentResponse.isCorrect && activeClues.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setShowActiveSolution(prev => !prev)}
                                                className="flex-1 py-3 px-4 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-amber-800 dark:text-amber-300 border border-[var(--border-main)] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                            >
                                                <Zap size={14} className="text-amber-600" />
                                                <span>
                                                    {showActiveSolution
                                                        ? (lang === 'sv' ? 'Dölj lösning' : 'Hide solution')
                                                        : (lang === 'sv' ? 'Se hur man löser den' : 'See how to solve it')}
                                                </span>
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={advanceToNextQuestion}
                                            className="flex-1 py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                                        >
                                            <span>
                                                {Number(meta.limit) > 0 && currentIndex + 1 >= Number(meta.limit)
                                                    ? t.finish
                                                    : t.nextQuestion}
                                            </span>
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>

                                    {showActiveSolution && activeClues.length > 0 && (
                                        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] space-y-2.5 animate-in fade-in duration-150">
                                            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-main)]">
                                                <span>{lang === 'sv' ? 'Steg-för-steg-lösning' : 'Step-by-step solution'}</span>
                                                <span className="font-mono text-emerald-700 dark:text-emerald-400">
                                                    {lang === 'sv' ? 'Rätt svar:' : 'Correct:'} {atob(currentQ.resolvedData.token)}
                                                </span>
                                            </div>
                                            <div className="space-y-2 pt-1 border-t border-[var(--border-main)]">
                                                {activeClues.map((step, sIdx) => {
                                                    const stepText = typeof step === 'object' && step !== null ? step[lang] || step.text || Object.values(step)[0] : step;
                                                    const stepLatex = typeof step === 'object' && step !== null ? step.latex || step.math : null;
                                                    return (
                                                        <div key={sIdx} className="flex gap-2.5 items-start text-xs">
                                                            <span className="font-bold font-mono text-[11px] text-amber-600 shrink-0">{sIdx + 1}.</span>
                                                            <div className="flex-1 space-y-1">
                                                                <div className="text-[var(--text-main)]"><MathDisplay content={stepText} /></div>
                                                                {stepLatex && (
                                                                    <div className="py-1 px-2.5 bg-[var(--bg-card)] rounded-lg border border-[var(--border-main)] inline-block">
                                                                        <MathDisplay content={`$$${stepLatex}$$`} className="scale-90 origin-left" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* ON-DEMAND PRACTICE REVIEW DRAWER (Error-Focused, No Live Scoreboard) */}
                {showReviewDrawer && isPracticeMode && (
                    <div className="fixed inset-0 z-[200] bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150 font-sans">
                        <div className="bg-[var(--bg-card)] border border-[var(--border-main)] w-full max-w-4xl max-h-[88vh] rounded-2xl shadow-xl overflow-hidden flex flex-col text-[var(--text-main)]">

                            {/* Drawer Header */}
                            <div className="bg-[var(--bg-surface)] border-b border-[var(--border-main)] px-6 py-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
                                <div>
                                    <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                                        {t.reviewTitle}
                                    </h2>
                                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                        {t.reviewSubtitle}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    {incorrectCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setReviewOnlyIncorrect(prev => !prev)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                                                reviewOnlyIncorrect
                                                    ? 'bg-amber-600 text-white border-amber-600'
                                                    : 'bg-[var(--bg-card)] text-[var(--text-main)] border-[var(--border-main)]'
                                            }`}
                                        >
                                            <Filter size={13} />
                                            <span>
                                                {reviewOnlyIncorrect
                                                    ? (lang === 'sv' ? `Endast felaktiga (${incorrectCount})` : `Mistakes only (${incorrectCount})`)
                                                    : (lang === 'sv' ? `Alla svar (${answeredEntries.length})` : `All answered (${answeredEntries.length})`)}
                                            </span>
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => setShowReviewDrawer(false)}
                                        className="p-2 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-main)] text-[var(--text-main)] cursor-pointer"
                                        title={lang === 'sv' ? 'Stäng' : 'Close'}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Completed Cards Grid (Powered by QuestionPromptCard) */}
                            <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-[var(--bg-canvas)] custom-scrollbar">
                                {filteredReviewItems.length === 0 ? (
                                    <div className="col-span-full py-12 text-center text-xs font-semibold text-[var(--text-muted)]">
                                        {lang === 'sv'
                                            ? 'Inga felaktiga svar att granska just nu — snyggt jobbat!'
                                            : 'No incorrect answers to review right now — great job!'}
                                    </div>
                                ) : (
                                    filteredReviewItems.map(item => {
                                        const qItem = packet[item.index];
                                        if (!qItem) return null;
                                        const clues = qItem.clues || qItem.resolvedData?.clues || [];

                                        return (
                                            <div
                                                key={item.index}
                                                className={`bg-[var(--bg-card)] p-4 rounded-xl border flex flex-col justify-between ${
                                                    item.isCorrect ? 'border-[var(--border-main)]' : 'border-rose-500/70'
                                                }`}
                                            >
                                                <div>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-[11px] font-bold uppercase text-[var(--text-muted)] tracking-wider font-mono">
                                                            {lang === 'sv' ? "Uppgift" : "Question"} {item.index + 1}
                                                        </span>
                                                        {item.isCorrect
                                                            ? <CheckCircle2 className="text-emerald-600" size={16} />
                                                            : <XCircle className="text-rose-600" size={16} />}
                                                    </div>

                                                    <QuestionPromptCard
                                                        question={qItem}
                                                        lang={lang}
                                                        layout="compact"
                                                        isWordProblem={Boolean(useWordProblems || qItem?.resolvedData?.renderData?.isWordProblemApplied)}
                                                        allowVisualReveal={false}
                                                    />
                                                </div>

                                                <div className="space-y-2 mt-3 pt-3 border-t border-[var(--border-main)]">
                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                        <div className={`p-2 rounded-lg border text-center ${
                                                            item.isCorrect
                                                                ? 'bg-[var(--bg-surface)] border-[var(--border-main)] text-[var(--text-main)]'
                                                                : 'bg-rose-50 dark:bg-rose-950/35 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                                                        }`}>
                                                            <span className="text-[10px] font-bold uppercase block opacity-75">
                                                                {lang === 'sv' ? "Ditt svar" : "Your answer"}
                                                            </span>
                                                            <span className="font-mono font-bold">{item.answer || '-'}</span>
                                                        </div>

                                                        <div className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] text-center text-[var(--text-main)]">
                                                            <span className="text-[10px] font-bold uppercase block text-[var(--text-muted)]">
                                                                {lang === 'sv' ? "Rätt svar" : "Correct"}
                                                            </span>
                                                            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                                                                {atob(qItem.resolvedData.token)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {clues.length > 0 && (
                                                        <div className="space-y-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleReviewClue(item.index)}
                                                                className={`w-full py-1.5 px-3 rounded-lg border text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
                                                                    visibleClues[item.index]
                                                                        ? 'bg-amber-600 text-white border-amber-600'
                                                                        : 'bg-[var(--bg-surface)] text-amber-800 dark:text-amber-300 border-[var(--border-main)] hover:border-amber-600'
                                                                }`}
                                                            >
                                                                <Zap size={13} />
                                                                <span>
                                                                    {visibleClues[item.index]
                                                                        ? (lang === 'sv' ? "Dölj lösning" : "Hide Solution")
                                                                        : (lang === 'sv' ? "Visa lösning" : "Show Solution")}
                                                                </span>
                                                            </button>

                                                            {visibleClues[item.index] && (
                                                                <div className="p-3 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-main)] space-y-2">
                                                                    {clues.map((step, sIdx) => {
                                                                        const stepText = typeof step === 'object' && step !== null ? step[lang] || step.text || Object.values(step)[0] : step;
                                                                        const stepLatex = typeof step === 'object' && step !== null ? step.latex || step.math : null;
                                                                        return (
                                                                            <div key={sIdx} className="flex gap-2 items-start text-xs">
                                                                                <span className="font-bold font-mono text-[11px] text-amber-600 shrink-0">{sIdx + 1}.</span>
                                                                                <div className="flex-1 space-y-1">
                                                                                    <div><MathDisplay content={stepText} /></div>
                                                                                    {stepLatex && (
                                                                                        <div className="py-1 px-2 bg-[var(--bg-card)] rounded border border-[var(--border-main)] inline-block">
                                                                                            <MathDisplay content={`$$${stepLatex}$$`} className="scale-85 origin-left" />
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Drawer Footer */}
                            <div className="px-6 py-3.5 bg-[var(--bg-surface)] border-t border-[var(--border-main)] flex justify-end shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setShowReviewDrawer(false)}
                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                >
                                    {lang === 'sv' ? 'Fortsätt öva' : 'Back to Practice'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // =========================================================
    // --- 3. SUMMARY UI (Top-Header Actions + Diagnostic Report) ---
    // =========================================================
    if (internalMode === 'SUMMARY') {
        const { stats } = getDiagnosticStats();
        const toggleSummaryClue = (idx) => { setVisibleClues(prev => ({ ...prev, [idx]: !prev[idx] })); };

        return (
            <div className="layout-wrapper p-4 sm:p-6 flex flex-col items-center py-6 animate-in fade-in font-sans">
                <div className="card w-full max-w-5xl overflow-hidden border border-[var(--border-main)] rounded-2xl p-0 bg-[var(--bg-card)] text-[var(--text-main)]">

                    {/* Header with Navigation Buttons at the Top */}
                    <div className="p-6 sm:p-7 bg-[var(--bg-surface)] border-b border-[var(--border-main)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                <Beaker size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-none mb-1">{t.summaryTitle}</h2>
                                <p className="text-xs font-semibold text-[var(--text-muted)]">
                                    {Object.keys(responses).length} / {packet.length} {lang === 'sv' ? 'genomförda uppgifter' : 'tasks completed'}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                            <button
                                type="button"
                                onClick={() => { setPacket([]); setResponses({}); setCurrentIndex(0); setInternalMode('SETUP'); }}
                                className="px-4 py-2.5 rounded-xl border border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-main)] text-xs font-bold hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                                <Settings2 size={14} />
                                <span>{t.backToLab}</span>
                            </button>

                            <button
                                type="button"
                                onClick={onBack}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                                <span>
                                    {activeBucket && activeBucket !== 'FREE_PLAY'
                                        ? (lang === 'sv' ? "Fortsätt i planeringen ➡" : "Continue Roadmap ➡")
                                        : t.toDashboard}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Diagnostic Category Breakdown */}
                    <div className="p-6 sm:p-7 grid grid-cols-1 md:grid-cols-2 gap-4 bg-[var(--bg-card)] border-b border-[var(--border-main)]">
                        {Object.entries(stats).map(([id, data]) => {
                            if (data.total === 0) return null;
                            const score = Math.round((data.correct / data.total) * 100);
                            const cat = CATEGORIES[id];
                            return (
                                <div key={id} className="p-4 rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--text-main)]">{cat.label[lang]}</h4>
                                        <span className="text-sm font-extrabold font-mono text-emerald-700 dark:text-emerald-400">
                                            {data.correct}/{data.total} ({score}%)
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-[var(--bg-card)] rounded-full overflow-hidden border border-[var(--border-main)]">
                                        <div className="h-full bg-emerald-600 transition-all duration-300" style={{ width: `${score}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Detailed Question Review Grid (Powered by QuestionPromptCard) */}
                    <div className="p-6 sm:p-7 bg-[var(--bg-canvas)] space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                            {lang === 'sv' ? "Detaljerad genomgång" : "Detailed Review"}
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {packet.map((qItem, idx) => {
                                const res = responses[idx];
                                if (!res) return null;

                                const clues = qItem.clues || qItem.resolvedData?.clues || [];

                                return (
                                    <div key={idx} className={`bg-[var(--bg-card)] p-4 rounded-xl border flex flex-col justify-between ${res.isCorrect ? 'border-[var(--border-main)]' : 'border-rose-500/70'}`}>
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[11px] font-bold uppercase text-[var(--text-muted)] tracking-wider font-mono">
                                                    {lang === 'sv' ? "Uppgift" : "Question"} {idx + 1}
                                                </span>
                                                {res.isCorrect ? <CheckCircle2 className="text-emerald-600" size={16} /> : <XCircle className="text-rose-600" size={16} />}
                                            </div>

                                            <QuestionPromptCard
                                                question={qItem}
                                                lang={lang}
                                                layout="compact"
                                                isWordProblem={Boolean(useWordProblems || qItem?.resolvedData?.renderData?.isWordProblemApplied)}
                                                allowVisualReveal={false}
                                            />
                                        </div>

                                        <div className="space-y-2 mt-3 pt-3 border-t border-[var(--border-main)]">
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className={`p-2 rounded-lg border text-center ${
                                                    res.isCorrect
                                                        ? 'bg-[var(--bg-surface)] border-[var(--border-main)] text-[var(--text-main)]'
                                                        : 'bg-rose-50 dark:bg-rose-950/35 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                                                }`}>
                                                    <span className="text-[10px] font-bold uppercase block opacity-75">
                                                        {lang === 'sv' ? "Ditt svar" : "Your answer"}
                                                    </span>
                                                    <span className="font-mono font-bold">{res.answer || '-'}</span>
                                                </div>

                                                <div className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] text-center text-[var(--text-main)]">
                                                    <span className="text-[10px] font-bold uppercase block text-[var(--text-muted)]">
                                                        {lang === 'sv' ? "Rätt svar" : "Correct"}
                                                    </span>
                                                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                                                        {atob(qItem.resolvedData.token)}
                                                    </span>
                                                </div>
                                            </div>

                                            {clues.length > 0 && (
                                                <div className="space-y-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleSummaryClue(idx)}
                                                        className={`w-full py-1.5 px-3 rounded-lg border text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
                                                            visibleClues[idx]
                                                                ? 'bg-amber-600 text-white border-amber-600'
                                                                : 'bg-[var(--bg-surface)] text-amber-800 dark:text-amber-300 border-[var(--border-main)] hover:border-amber-600'
                                                        }`}
                                                    >
                                                        <Zap size={13} />
                                                        <span>
                                                            {visibleClues[idx]
                                                                ? (lang === 'sv' ? "Dölj lösning" : "Hide Solution")
                                                                : (lang === 'sv' ? "Visa lösning" : "Show Solution")}
                                                        </span>
                                                    </button>
                                                    {visibleClues[idx] && (
                                                        <div className="p-3 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-main)] space-y-2">
                                                            {clues.map((step, sIdx) => {
                                                                const stepText = typeof step === 'object' && step !== null ? step[lang] || step.text || Object.values(step)[0] : step;
                                                                const stepLatex = typeof step === 'object' && step !== null ? step.latex || step.math : null;
                                                                return (
                                                                    <div key={sIdx} className="flex gap-2 items-start text-xs">
                                                                        <span className="font-bold font-mono text-[11px] text-amber-600 shrink-0">{sIdx + 1}.</span>
                                                                        <div className="flex-1 space-y-1">
                                                                            <div><MathDisplay content={stepText} /></div>
                                                                            {stepLatex && (
                                                                                <div className="py-1 px-2 bg-[var(--bg-card)] rounded border border-[var(--border-main)] inline-block">
                                                                                    <MathDisplay content={`$$${stepLatex}$$`} className="scale-85 origin-left" />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}