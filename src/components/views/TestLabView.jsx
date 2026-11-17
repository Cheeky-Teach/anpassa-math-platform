// src/components/views/TestLabView.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
    Loader2, ChevronLeft, Beaker, Play, Check, 
    ChevronDown, Settings2, Zap, ArrowRight, 
    RefreshCcw, Eye, Clock, Lock, Send, ListChecks, 
    LayoutGrid, XCircle, LogOut, ChevronRight,
    CheckCircle2, Award, Info, HelpCircle, X, Bookmark
} from 'lucide-react';
import { decodeConfig, encodeConfig, BUNDLE_PRESETS } from '../../core/utils/labCodeUtils';
import { CATEGORIES, LEVEL_DESCRIPTIONS } from '../../constants/localization';
import { useMyCoach } from '../../hooks/useMyCoach';
import MyCoachModal from '../modals/MyCoachModal';
import { isLevelWordProblemReady } from '../../constants/skillBuckets.js';
import SaveToUnitModal from '../modals/SaveToUnitModal';
import { supabase } from '../../lib/supabaseClient';

import { CONTENT_MAP } from '../../constants/content_map.generated';

// --- SHARED UI COMPONENTS ---
import MathText from '../ui/MathText';
import VisualRenderer from '../visuals/VisualRenderer';
import { FractionInput, ExponentInput, ScientificInput } from '../ui/InputComponents';
import SmartMathInput from '../ui/SmartMathInput.jsx';
import TestLabTutorialModal from '../modals/TestLabTutorialModal.jsx';

import { syncProgress, syncBatchProgress } from '../../lib/progressSync';

import MathDisplay from '../shared/MathDisplay';

// CRITICAL: Import Universal Theme
import '../../styles/theme.css'; 

const LAB_TEXT = {
    sv: {
        title: "Test Lab", testCode: "Testkod", modeExam: "Provläge", modePractice: "Öva",
        startBtn: "Starta pass", selectedAreas: "valda", level: "Nivå", back: "Tillbaka",
        loading: "Laddar...", milestoneTitle: "Dags för en paus!", continueBtn: "Nästa Etapp",
        cooldown: "Vänta...", showAnswers: "Visa rätt svar", quit: "Avbryt Passet",
        answerReceived: "Svar mottaget", nextArr: "Fortsätt med pilen", finish: "Avsluta & Se Resultat",
        summaryTitle: "Testrapport", recoveryTitle: "Rekommenderad träning", recoveryDesc: "Fokusera på dina svagaste områden.",
        copyLink: "Kopiera länk", linkCopied: "Länk kopierad till urklipp!", toDashboard: "Lämna",
        backToLab: "Till Labbet", guideBtn: "Instruktioner",
        guideTitle: "Så fungerar Testlabbet",
        guidePreset: "Välj ett färdigt paket (t.ex. NP-GEO) för att automatiskt välja alla nivåer i den kategorin ELLER välj ämnen manuellt i listan till höger och klicka på nivå-bubblorna (1-9).",
        guideCustom: "Ange hur många frågor som ska inkluderas. Om fältet lämnas tomt skapas ett pass med 50 frågor med en rapport var 15:e fråga.",
        guideModes: "Övningsläge ger dig direkt feedback på varje svar. Provläge döljer alla resultat tills slutrapporten.",
        guideReview: "Kopiera länken efter att du valt vilka områden som ska ingå och dela med dina elever.",
        guideControls: "Eleverna når testet genom att klicka på länken och ange sin klasskod på startsidan."
    },
    en: {
        title: "Test Lab", testCode: "Test Code", modeExam: "Exam Mode", modePractice: "Practice Mode",
        startBtn: "Start Test", selectedAreas: "selected areas", level: "Level", back: "Back",
        loading: "Loading...", milestoneTitle: "Time for a break!", continueBtn: "Next Stage",
        cooldown: "Wait...", showAnswers: "Show answers", quit: "Quit Session",
        answerReceived: "Answer received", nextArr: "Continue using arrows", finish: "Finish & See Results",
        summaryTitle: "Test Report", recoveryTitle: "Recommended Practice", recoveryDesc: "Focus on your weakest areas.",
        copyLink: "Copy Link", linkCopied: "Link copied to clipboard!", toDashboard: "Exit",
        backToLab: "Back to Lab", guideBtn: "Guide",
        guideTitle: "How the Test Lab Works",
        guidePreset: "Select a preset (e.g., NP-GEO) to enable topics automatically OR toggle topics manually on the right and click level bubbles (1-9).",
        guideCustom: "Enter how many questions to include. Leave blank for an infinite test with milestone reports.",
        guideModes: "Practice Mode gives instant feedback. Exam Mode hides results until the final report.",
        guideReview: "Copy and share the practice test link when you have selected your topics.",
        guideControls: "Students access the test via the link and enter their class code on the start page."
    }
};

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
    const [showMilestone, setShowMilestone] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const [activeCategory, setActiveCategory] = useState('algebra'); 
    const [revealMilestoneAnswers, setRevealMilestoneAnswers] = useState(false);
    const [visibleClues, setVisibleClues] = useState({});
    const [showGuideModal, setShowGuideModal] = useState(false);
    const [useWordProblems, setUseWordProblems] = useState(false);
    const [allowCoach, setAllowCoach] = useState(false);
    const q = packet[currentIndex];
    const coach = useMyCoach(q, lang);

    const [isMobile, setIsMobile] = useState(false);
    const isTeacherOrAdmin = profile?.role === 'teacher' || profile?.role === 'super_admin';

    const hasWordProblemSupport = Object.entries(selection).some(([topicId, conf]) => {
        if (!conf?.enabled) return false;
        const levels = conf.levels && conf.levels.length > 0 ? conf.levels : [1];
        return levels.some(lvl => isLevelWordProblemReady(topicId, lvl));
    });

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
        alert(t.linkCopied);
    };

    const resetAllSelection = () => {
        setSelection({});
        setMeta(p => ({ ...p, isNationalTest: false, bundleId: null, limit: 0, mode: 'practice' }));
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

        alert(lang === 'sv' ? "Delprovet har sparats på den valda platsen!" : "Checkpoint saved at selected position!");
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
                alert(lang === 'sv' ? "Denna testlänk är föråldrad eller ogiltig. Vänligen skapa ett nytt test." : "This test link is outdated or invalid. Please create a new test.");
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

    const handleLabSubmit = async (manualValue = null) => {
        const val = manualValue || inputValue;
        const currentQ = packet[currentIndex];
        if (!currentQ || !val) return;

        try {
            const res = await fetch('/api/answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answer: String(val).trim(), token: currentQ.resolvedData.token, mode: meta.mode })
            });
            const result = await res.json();
            
            syncProgress('test_question_answered', {
                app_mode: 'test_lab',
                topic: currentQ.topicId || currentQ.topic || 'unknown',
                level: currentQ.level || currentQ.resolvedData?.level || 1,
                answer_type: currentQ.answerType || currentQ.resolvedData?.renderData?.answerType || 'unknown',
                is_correct: result.correct,
                student_answer: String(val).substring(0, 100),
                test_mode: meta.mode
            });

            setResponses(prev => ({
                ...prev,
                [currentIndex]: { answer: val, isCorrect: result.correct, topic_id: currentQ.topic_id || currentQ.topicId }
            }));

            const advance = () => {
                const nextIndex = currentIndex + 1;
                const limit = Number(meta.limit);

                if (limit > 0 && nextIndex >= limit) {
                    const finalCorrect = Object.values(responses).filter(r => r.isCorrect).length + (result.correct ? 1 : 0);
                    syncProgress('test_session_completed', {
                        app_mode: 'test_lab',
                        total_questions: limit,
                        final_accuracy: parseFloat((finalCorrect / limit).toFixed(2)),
                        test_mode: meta.mode
                    });
                    setInternalMode('SUMMARY');
                    return;
                }

                const halfwayPoint = limit > 0 ? Math.floor(limit / 2) : 15;
                const shouldPause = limit > 0 ? nextIndex === halfwayPoint : nextIndex % 15 === 0;

                if (shouldPause) {
                    setCooldown(2);
                    setShowMilestone(true);
                } else {
                    if (nextIndex === packet.length - 1 && (limit === 0 || packet.length < limit)) { 
                        fetchNextSprint(); 
                    }
                    setCurrentIndex(nextIndex);
                    setInputValue(''); 
                }
            };

            if (meta.mode === 'exam') { advance(); } 
            else { setTimeout(advance, 1000); }

        } catch (err) { console.error("Submission error:", err); }
    };

    const getDiagnosticStats = () => {
        const stats = { arithmetic: { correct: 0, total: 0 }, algebra: { correct: 0, total: 0 }, geometry: { correct: 0, total: 0 }, statistics: { correct: 0, total: 0 } };
        Object.values(responses).forEach(res => {
            const category = Object.values(CATEGORIES).find(cat => cat.topics.some(t => t.id === res.topicId));
            if (category) { stats[category.id].total++; if (res.isCorrect) stats[category.id].correct++; }
        });
        let weakest = null; let minScore = 101;
        Object.entries(stats).forEach(([id, data]) => { if (data.total > 0) { const score = (data.correct / data.total) * 100; if (score < minScore) { minScore = score; weakest = id; } } });
        return { stats, weakest };
    };

    const renderInput = () => {
        const item = packet[currentIndex];
        const rd = item?.resolvedData?.renderData;

        if (rd?.answerType === 'multiple_choice' || (rd?.options && Array.isArray(rd.options))) {
            return (
                <div className="grid grid-cols-1 gap-3 w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-2 duration-150">
                    {(rd.options || []).map((opt, i) => {
                        const choiceLabel = typeof opt === 'object' ? opt.label : opt;
                        const choiceValue = typeof opt === 'object' ? opt.value : opt;
                        return (
                            <button type="button" key={i} onClick={() => handleLabSubmit(choiceValue)} className="btn-3d w-full flex items-center gap-3 cursor-pointer">
                                <span className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shadow-2xs shrink-0 bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-main)] font-mono">
                                    {String.fromCharCode(65 + i)}
                                </span>
                                <MathDisplay content={String(choiceLabel)} />
                            </button>
                        );
                    })}
                </div>
            );
        }

        const type = rd?.answerType || rd?.inputType || item?.resolvedData?.inputType || 'text';

        return (
            <SmartMathInput 
                value={inputValue}
                onChange={setInputValue}
                onSubmit={() => handleLabSubmit()}
                inputType={type}
                isMobile={isMobile}
            />
        );
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

    useEffect(() => {
        let timer;
        if (showMilestone && cooldown > 0) { timer = setInterval(() => setCooldown(p => p - 1), 1000); }
        return () => clearInterval(timer);
    }, [showMilestone, cooldown]);

    if (internalMode === 'LOADING') return <div className="layout-wrapper flex items-center justify-center h-screen"><Loader2 className="animate-spin text-emerald-600 dark:text-emerald-400" size={48} /></div>;

    // =========================================================
    // --- 1. SETUP UI (Using .lab-twocol, .lab-sidebar, .lab-main) ---
    // =========================================================
    if (internalMode === 'SETUP') {
        const currentTestCode = encodeConfig({ meta: { ...meta, wordProblem: useWordProblems, allowCoach: allowCoach }, selection });
        const activeCategoryData = CATEGORIES[activeCategory];
        const themeColor = activeCategoryData?.color || 'indigo';
        const totalSelectedCount = Object.keys(selection).filter(k => selection[k].enabled).length;

        return (
            <div className={`theme-${themeColor} layout-wrapper font-sans relative z-10 animate-in fade-in`}>
                <div className="lab-twocol">
                    
                    {/* 🟢 LEFT SIDEBAR (360px Sticky Command Center) */}
                    <aside className="lab-sidebar space-y-4">
                        
                        {/* ZONE 1: FOUNDATION */}
                        <div className="card p-5 space-y-4 border border-[var(--border-main)]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 bg-emerald-600 dark:bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-2xs shrink-0">
                                        <Beaker size={22} />
                                    </div>
                                    <div>
                                        <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-[var(--text-main)] leading-none mb-1">{t.title}</h1>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                            {lang === 'sv' ? 'Konfigurera test' : 'Configure test'}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setShowGuideModal(true)}
                                    className="p-2 bg-[var(--bg-surface)] text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] rounded-xl transition-all border border-[var(--border-strong)] flex items-center gap-1 text-xs font-bold uppercase cursor-pointer shadow-2xs active:scale-98"
                                    title={t.guideBtn}
                                >
                                    <HelpCircle size={16} strokeWidth={2.5} />
                                </button>
                            </div>

                            {/* Preset Selector */}
                            <div>
                                <span className="block text-xs font-bold uppercase text-[var(--text-main)] tracking-wide mb-1.5">
                                    {lang === 'sv' ? "Snabbval (Preset)" : "Presets"}
                                </span>
                                <select 
                                    value={meta.bundleId || ""}
                                    onChange={(e) => applyPresetSelection(e.target.value)}
                                    className="w-full bg-[var(--bg-surface)] border border-[var(--border-strong)] focus:border-emerald-600 rounded-xl px-3.5 py-2 text-xs font-semibold text-[var(--text-main)] outline-none transition-all cursor-pointer shadow-inner"
                                >
                                    <option value="">{lang === 'sv' ? "-- Välj snabbval --" : "-- Choose a preset ---"}</option>
                                    {Object.entries(BUNDLE_PRESETS).map(([id, data]) => (
                                        <option key={id} value={id}>{data.title} ({id})</option>
                                    ))}
                                </select>
                            </div>

                            {/* High-Contrast Counter Badge */}
                            <div className="bg-[var(--bg-surface)] p-3 rounded-xl border border-[var(--border-main)] flex items-center justify-between shadow-2xs">
                                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                                    {lang === 'sv' ? "Valda områden" : "Selected topics"}
                                </span>
                                <span className="text-xs font-black font-mono text-white bg-emerald-600 px-2.5 py-0.5 rounded-lg shadow-2xs">
                                    {totalSelectedCount}
                                </span>
                            </div>
                        </div>

                        {/* ZONE 2: CONTROLS & BEHAVIOR */}
                        <div className="card p-5 space-y-3.5 border border-[var(--border-main)]">
                            <div className="flex items-center gap-2">
                                <Settings2 size={15} className="text-[var(--text-muted)]" />
                                <h2 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                    {lang === 'sv' ? "Inställningar" : "Settings"}
                                </h2>
                            </div>

                            {/* Mode Toggle */}
                            <button
                                type="button"
                                onClick={() => setMeta(p => ({ ...p, mode: p.mode === 'exam' ? 'practice' : 'exam' }))}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                                    meta.mode === 'exam' 
                                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-100 shadow-2xs' 
                                        : 'bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--text-main)] hover:border-emerald-500'
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    {meta.mode === 'exam' ? <Lock size={15} strokeWidth={2.5} /> : <Zap size={15} strokeWidth={2.5} />}
                                    <span>{meta.mode === 'exam' ? t.modeExam : t.modePractice}</span>
                                </div>
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-main)]">
                                    {meta.mode === 'exam' ? (lang === 'sv' ? 'Dolda svar' : 'Hidden') : (lang === 'sv' ? 'Direkt' : 'Instant')}
                                </span>
                            </button>

                            {/* Question Count Dropdown */}
                            <div className="flex items-center justify-between bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl px-3.5 py-2.5 shadow-2xs">
                                <div className="flex items-center gap-2 shrink-0">
                                    <ListChecks size={16} className="text-[var(--text-muted)]" strokeWidth={2.5} />
                                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                                        {lang === 'sv' ? 'Antal frågor:' : 'Length:'}
                                    </span>
                                </div>
                                <select
                                    value={meta.limit}
                                    onChange={(e) => setMeta(p => ({ ...p, limit: Number(e.target.value) }))}
                                    className="bg-[var(--bg-card)] border border-[var(--border-strong)] text-[var(--text-main)] font-semibold text-xs rounded-xl px-3 py-1 outline-none focus:border-emerald-600 cursor-pointer shadow-inner"
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

                            {/* Word Problems */}
                            <button
                                type="button"
                                disabled={!hasWordProblemSupport}
                                onClick={() => setUseWordProblems(!useWordProblems)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border shadow-2xs ${
                                    !hasWordProblemSupport
                                        ? 'opacity-40 cursor-not-allowed bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                                        : useWordProblems 
                                            ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 text-sky-900 dark:text-sky-100 cursor-pointer' 
                                            : 'bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--text-main)] hover:border-sky-400 cursor-pointer'
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <HelpCircle size={15} strokeWidth={2.5} />
                                    <span>{lang === 'sv' ? 'Problemlösning' : 'Word Problems'}</span>
                                </div>
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-main)]">
                                    {!hasWordProblemSupport 
                                        ? (lang === 'sv' ? 'Ej tillgänglig' : 'N/A') 
                                        : useWordProblems ? (lang === 'sv' ? 'Aktiv' : 'On') : (lang === 'sv' ? 'Av' : 'Off')}
                                </span>
                            </button>

                            {/* Coach / Clues Toggle */}
                            <button
                                type="button"
                                onClick={() => setAllowCoach(!allowCoach)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border shadow-2xs cursor-pointer ${
                                    allowCoach 
                                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-100' 
                                        : 'bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--text-main)] hover:border-amber-400'
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <Info size={15} strokeWidth={2.5} />
                                    <span>{lang === 'sv' ? 'Ledtrådar / Coach' : 'Clues / Coach'}</span>
                                </div>
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-main)]">
                                    {allowCoach ? (lang === 'sv' ? 'Tillåten' : 'Allowed') : (lang === 'sv' ? 'Avstängd' : 'Off')}
                                </span>
                            </button>
                        </div>

                        {/* ZONE 3: ACTIONS & DESTINATIONS */}
                        <div className="card p-5 space-y-3 border border-[var(--border-main)] shadow-xl">
                            <button 
                                type="button"
                                onClick={startNewSession} 
                                disabled={totalSelectedCount === 0} 
                                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <Play size={15} fill="currentColor"/>
                                <span>{t.startBtn}</span>
                                <span className="text-[10px] font-bold font-mono bg-white/20 text-white px-2 py-0.5 rounded-md">
                                    {totalSelectedCount}
                                </span>
                            </button>

                            {isTeacherOrAdmin && (
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        type="button" 
                                        onClick={copyTestLink} 
                                        disabled={totalSelectedCount === 0}
                                        className="py-2.5 px-2 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-strong)] hover:border-emerald-600 transition-all cursor-pointer shadow-2xs active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-1.5"
                                    >
                                        <LayoutGrid size={13} strokeWidth={2.5} /> 
                                        <span>{t.copyLink}</span>
                                    </button>

                                    <button 
                                        type="button"
                                        disabled={totalSelectedCount === 0}
                                        onClick={() => setShowSaveToUnitModal(true)}
                                        className="py-2.5 px-2 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-strong)] hover:border-emerald-600 transition-all cursor-pointer shadow-2xs active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-1.5"
                                    >
                                        <Bookmark size={13} strokeWidth={2.5} /> 
                                        <span>{lang === 'sv' ? "Spara i modul" : "Save to Unit"}</span>
                                    </button>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-main)]">
                                <button 
                                    type="button"
                                    onClick={resetAllSelection} 
                                    className="py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-main)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <RefreshCcw size={12} strokeWidth={2.5} /> 
                                    <span>{lang === 'sv' ? "Rensa" : "Reset"}</span>
                                </button>

                                <button 
                                    type="button"
                                    onClick={onBack} 
                                    className="py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-rose-600 border border-[var(--border-main)] hover:border-rose-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <LogOut size={12} strokeWidth={2.5} /> 
                                    <span>{t.toDashboard}</span>
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* 🟢 MAIN TOPIC SELECTION AREA ON THE RIGHT (.lab-main) */}
                    <main className="lab-main flex flex-col gap-5">
                        
                        {/* Horizontal Category Tabs */}
                        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                            {Object.entries(CATEGORIES).map(([catKey, category]) => {
                                const isActive = activeCategory === catKey;
                                const count = category.topics.filter(t => selection[t.id]?.enabled).length;
                                
                                return (
                                    <button 
                                        type="button"
                                        key={catKey}
                                        onClick={() => setActiveCategory(catKey)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold uppercase text-xs tracking-wider whitespace-nowrap transition-all border cursor-pointer ${
                                            isActive 
                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' 
                                                : 'bg-[var(--bg-card)] border-[var(--border-strong)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--border-main)]'
                                        }`}
                                    >
                                        <Award size={15} />
                                        <span>{category.label[lang]}</span>
                                        {count > 0 && (
                                            <span className="ml-1 px-1.5 py-0.2 bg-white/20 text-white rounded-md text-[10px] font-mono font-bold">
                                                {count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Active Category Overview Container */}
                        <div className="card p-5 sm:p-6 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-xl flex-1">
                            <div className="mb-5 flex items-center justify-between border-b border-[var(--border-main)] pb-3.5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-600 text-white shadow-2xs">
                                        <Award size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-base sm:text-lg font-extrabold text-[var(--text-main)] tracking-tight leading-snug">
                                            {activeCategoryData.label[lang]}
                                        </h3>
                                        <p className="text-xs font-semibold text-[var(--text-muted)]">
                                            {activeCategoryData.topics.length} {lang === 'sv' ? 'tillgängliga delmoment' : 'available topics'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* MULTI-COLUMN RESPONSIVE GRID */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
                                {activeCategoryData.topics.map(topic => {
                                    const isEnabled = selection[topic.id]?.enabled;
                                    const topicLevels = LEVEL_DESCRIPTIONS[topic.id] 
                                        ? Object.keys(LEVEL_DESCRIPTIONS[topic.id]).map(Number).sort((a, b) => a - b) 
                                        : [1];
                                    const selectedLevels = selection[topic.id]?.levels || [];

                                    const toggleLevel = (lvl) => {
                                        setMeta(p => ({ ...p, isNationalTest: false, bundleId: null }));
                                        setSelection(p => {
                                            const currentLevels = p[topic.id]?.levels || [];
                                            const newLevels = currentLevels.includes(lvl)
                                                ? currentLevels.filter(l => l !== lvl)
                                                : [...currentLevels, lvl].sort((a, b) => a - b);
                                        
                                            return {
                                                ...p,
                                                [topic.id]: { 
                                                    ...p[topic.id], 
                                                    levels: newLevels, 
                                                    enabled: newLevels.length > 0 
                                                }
                                            };
                                        });
                                    };

                                    const toggleEntireTopic = () => {
                                        setMeta(p => ({ ...p, isNationalTest: false, bundleId: null }));
                                        setSelection(p => ({ 
                                            ...p, 
                                            [topic.id]: { 
                                                enabled: !isEnabled, 
                                                levels: !isEnabled ? topicLevels : [] 
                                            } 
                                        }));
                                    };

                                    const mapCategory = CONTENT_MAP.find(c => c.topics.some(t => t.id === topic.id));
                                    const mapTopic = mapCategory?.topics.find(t => t.id === topic.id);

                                    return (
                                        <div key={topic.id} className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-main)] overflow-hidden shadow-2xs flex flex-col h-full">
                                            {/* Topic Header Row */}
                                            <div className="bg-[var(--bg-card)] px-4 py-3 border-b border-[var(--border-main)] flex items-center justify-between gap-3 shrink-0">
                                                <h4 className="font-bold text-xs sm:text-sm text-[var(--text-main)] truncate">
                                                    {topic.label[lang]}
                                                </h4>
                                                <button 
                                                    type="button"
                                                    onClick={toggleEntireTopic}
                                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border shrink-0 ${
                                                        isEnabled 
                                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' 
                                                            : 'bg-[var(--bg-card)] text-[var(--text-main)] border-[var(--border-strong)] hover:border-emerald-600'
                                                    }`}
                                                >
                                                    <Check size={13} strokeWidth={3} className={isEnabled ? "opacity-100" : "opacity-0"} />
                                                    <span>{lang === 'sv' ? 'Välj alla' : 'All'}</span>
                                                </button>
                                            </div>

                                            {/* Level Rows Matrix */}
                                            <div className="divide-y divide-[var(--border-main)] flex-1">
                                                {topicLevels.map(lvl => {
                                                    const isLvlSelected = selectedLevels.includes(lvl);
                                                    const desc = LEVEL_DESCRIPTIONS[topic.id]?.[lvl]?.[lang] || "";
                                                    const mapLevelData = mapTopic?.levels.find(l => l.lvl === lvl);
                                                    const mathExample = mapLevelData?.ex || "";

                                                    return (
                                                        <div
                                                            key={lvl}
                                                            onClick={() => toggleLevel(lvl)}
                                                            className={`flex items-stretch text-xs transition-colors cursor-pointer select-none ${
                                                                isLvlSelected ? 'bg-emerald-50/60 dark:bg-emerald-950/40 font-semibold' : 'bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] text-[var(--text-main)]'
                                                            }`}
                                                        >
                                                            {/* Level Number Badge */}
                                                            <div className={`w-10 shrink-0 flex items-center justify-center font-bold font-mono text-xs border-r border-[var(--border-main)] ${
                                                                isLvlSelected ? 'bg-emerald-600 text-white' : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'
                                                            }`}>
                                                                {lvl}
                                                            </div>

                                                            {/* Description & Formula Container */}
                                                            <div className="flex-1 p-3 border-r border-[var(--border-main)] flex flex-col justify-center gap-0.5 min-w-0">
                                                                <span className="font-semibold text-[var(--text-main)] text-xs leading-relaxed truncate">
                                                                    {desc}
                                                                </span>
                                                                {mathExample && (
                                                                    <div className="font-serif italic text-xs text-emerald-700 dark:text-emerald-400 truncate">
                                                                        <MathDisplay 
                                                                            content={mathExample.includes('\\') || mathExample.includes('=') || mathExample.includes('$') ? (mathExample.includes('$') ? mathExample : `$$${mathExample}$$`) : mathExample} 
                                                                            className="inline-block" 
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Checkbox Action Indicator */}
                                                            <div className="w-12 shrink-0 flex items-center justify-center border-l border-[var(--border-main)]">
                                                                <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                                                                    isLvlSelected 
                                                                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs' 
                                                                        : 'border-[var(--border-strong)] bg-[var(--bg-card)]'
                                                                }`}>
                                                                    {isLvlSelected && <Check size={13} strokeWidth={3} />}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </main>
                </div>

                {/* --- GUIDE MODAL OVERLAY --- */}
                <TestLabTutorialModal 
                    isOpen={showGuideModal}
                    onClose={() => setShowGuideModal(false)}
                    lang={lang}
                    userRole={profile?.role || 'teacher'}
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
    // --- 2. ACTIVE TEST UI ---
    // =========================================================
    if (internalMode === 'ACTIVE') {
        if (packet.length === 0 || isGenerating) {
            return (
                <div className="layout-wrapper flex flex-col items-center justify-center h-screen gap-4">
                    <Loader2 className="animate-spin text-emerald-600 dark:text-emerald-400" size={48} />
                    <p className="text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider">
                        {lang === 'sv' ? "Hämtar uppgifter..." : "Fetching questions..."}
                    </p>
                </div>
            );
        }
        
        const q = packet[currentIndex];
        if (!q || !q.resolvedData) {
            return (
                <div className="layout-wrapper flex items-center justify-center h-screen">
                    <p className="text-[var(--text-muted)] font-medium">Error loading question. Please go back and try again.</p>
                </div>
            );
        }
        
        return (
            <div className="layout-wrapper font-sans flex flex-col overflow-hidden relative">
                <header className="sticky top-0 z-30 w-full bg-[var(--bg-card)] border-b border-[var(--border-main)] px-4 py-3 shadow-2xs transition-colors duration-150 no-print">
                    <div className="max-w-[1400px] mx-auto w-full flex items-center justify-between gap-3">
                        
                        <div className="flex items-center gap-2">
                            {activeBucket && activeBucket !== 'FREE_PLAY' ? (
                                <button 
                                    type="button"
                                    onClick={handleQuit} 
                                    className="px-3.5 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-strong)] rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-2xs active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
                                >
                                    <ChevronLeft size={16} />
                                    <span>{lang === 'sv' ? "Tillbaka till planeringen" : "Back to Roadmap"}</span>
                                </button>
                            ) : (
                                <button 
                                    type="button"
                                    onClick={() => setInternalMode('SETUP')} 
                                    className="px-3.5 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-strong)] rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-2xs active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Settings2 size={15} />
                                    <span>{t.backToLab}</span>
                                </button>
                            )}

                            <button 
                                type="button"
                                onClick={() => setCurrentIndex(p => Math.max(0, p - 1))} 
                                disabled={currentIndex === 0}
                                className="w-9 h-9 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] disabled:opacity-20 flex items-center justify-center transition-all cursor-pointer border border-[var(--border-strong)]"
                                title={lang === 'sv' ? "Föregående fråga" : "Previous question"}
                            >
                                <ChevronLeft size={18} strokeWidth={2.5} />
                            </button>
                        </div> 

                        <div className="flex items-center gap-2 bg-[var(--bg-surface)] p-1 px-3 rounded-xl border border-[var(--border-main)] shadow-inner">
                            <Beaker size={14} className="text-amber-500 shrink-0" />
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hidden sm:inline">
                                {t.title}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--border-strong)] hidden sm:inline" />
                            <div className="bg-[var(--bg-card)] text-[var(--text-main)] px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono">
                                {currentIndex + 1} / {meta.limit || "∞"}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button 
                                type="button"
                                onClick={() => setCurrentIndex(p => Math.min(packet.length - 1, p + 1))} 
                                disabled={currentIndex === packet.length - 1}
                                className="w-9 h-9 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] disabled:opacity-20 flex items-center justify-center transition-all cursor-pointer border border-[var(--border-strong)]"
                                title={lang === 'sv' ? "Nästa fråga" : "Next question"}
                            >
                                <ChevronRight size={18} strokeWidth={2.5} />
                            </button>

                            <button 
                                type="button"
                                onClick={handleQuit} 
                                className="px-3.5 py-2 bg-[var(--bg-surface)] hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[var(--text-muted)] hover:text-rose-600 dark:hover:text-rose-400 border border-[var(--border-strong)] hover:border-rose-200 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-2xs active:scale-[0.98] flex items-center gap-1.5 cursor-pointer ml-1"
                                title={t.quit}
                            >
                                <LogOut size={14} />
                                <span>{t.toDashboard}</span>
                            </button>
                        </div>
                    </div>
                </header>

                {coach.isOpen && (
                    <MyCoachModal 
                        visible={coach.isOpen} onClose={coach.closeCoach} question={q} lang={lang} {...coach.coachProps} 
                    />
                )}

                <main className="flex-1 w-full max-w-none p-3 lg:p-6 overflow-hidden flex flex-col relative">
                    <div className="card p-0 flex-1 overflow-y-auto lg:overflow-hidden flex flex-col transition-all duration-150 w-full border border-[var(--border-strong)] rounded-2xl shadow-xl">
                    
                        {/* MOBILE PROGRESS BAR */}
                        <div className="sm:hidden h-1 bg-[var(--bg-surface)] flex shrink-0">
                            {packet.map((_, i) => (
                                <div key={i} className={`flex-1 ${i === currentIndex ? 'bg-emerald-600' : !!responses[i] ? 'bg-[var(--border-strong)]' : 'bg-transparent'}`} />
                            ))}
                        </div>

                        {/* QUESTION HEADER */}
                        <div className="px-6 py-3 border-b border-[var(--border-main)] flex items-center justify-between shrink-0 bg-[var(--bg-surface)]">
                            <span className="text-xs font-bold font-mono text-[var(--text-muted)] uppercase tracking-wider">{lang === 'sv' ? "Uppgift" : "Question"} {currentIndex + 1} / {packet.length}</span>
                            
                            <div className="flex items-center gap-3">
                                {allowCoach && !responses[currentIndex] && (
                                    <button type="button" onClick={coach.openCoach} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs cursor-pointer">
                                        <Info size={14} /> {lang === 'sv' ? 'Hjälp!' : 'Help!'}
                                    </button>
                                )}
                                {!!responses[currentIndex] && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">{t.answerReceived}</span>
                                        <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={18} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SPLIT RESPONSIVE GRID */}
                        <div className="lg:flex-1 grid grid-cols-1 lg:grid-cols-2 lg:divide-x divide-[var(--border-main)]">
                            
                            {/* TEXT & INPUT SECTION */}
                            <div className="flex flex-col order-1 lg:h-full lg:overflow-hidden border-b lg:border-b-0 border-[var(--border-main)]">
                                <div className="p-6 lg:p-10 flex-1 flex flex-col justify-center space-y-5 overflow-y-auto">
                                    <div className="text-base sm:text-lg lg:text-xl font-bold text-[var(--text-main)] leading-relaxed text-center lg:text-left max-w-4xl">
                                        <MathDisplay content={q?.resolvedData?.renderData?.description} />
                                    </div>
                                    {q?.resolvedData?.renderData?.latex && !q?.resolvedData?.renderData?.isWordProblemApplied && !q?.resolvedData?.renderData?.geometry && (
                                        <div className="mt-2 border-t border-[var(--border-main)] pt-4 animate-in fade-in duration-150 flex justify-center lg:justify-start w-full">
                                            <div className="whiteboard-protect px-5 py-3.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-2xs w-full max-w-full text-center lg:text-left overflow-x-auto no-scrollbar">
                                                <MathDisplay 
                                                    content={`$$${q.resolvedData.renderData.latex}$$`} 
                                                    className="text-xl sm:text-2xl font-serif leading-relaxed text-[var(--text-main)] inline-block max-w-full"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* FEEDBACK SECTION */}
                                <div className="p-6 lg:p-8 bg-[var(--bg-surface)] border-t border-[var(--border-main)] shrink-0">
                                    {!responses[currentIndex] ? (
                                        <div className="max-w-md mx-auto space-y-3.5">
                                            {renderInput()}
                                            {!(packet[currentIndex]?.resolvedData?.renderData?.options) && (
                                                <button type="button" onClick={() => handleLabSubmit()} disabled={!inputValue} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-2xs active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-2 cursor-pointer">
                                                    <Send size={16} /> {lang === 'sv' ? "Svara" : "Submit"}
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="max-w-md mx-auto animate-in zoom-in-95 duration-150">
                                            {meta.mode === 'practice' ? (
                                                <div className={`p-5 rounded-xl border flex flex-col items-center gap-3 shadow-2xs
                                                    ${responses[currentIndex].isCorrect ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-100' : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-100'}`}>
                                                    
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white
                                                        ${responses[currentIndex].isCorrect ? 'bg-emerald-600 animate-bounce' : 'bg-rose-600 animate-shake'}`}>
                                                        {responses[currentIndex].isCorrect ? <Check size={24} strokeWidth={3} /> : <XCircle size={24} strokeWidth={3} />}
                                                    </div>
                                                    
                                                    <div className="text-center">
                                                        <p className="text-base font-extrabold uppercase tracking-tight">
                                                            {responses[currentIndex].isCorrect ? (lang === 'sv' ? "Snyggt jobbat!" : "Great job!") : (lang === 'sv' ? "Inte riktigt rätt" : "Not quite right")}
                                                        </p>
                                                        <p className="text-xs font-semibold text-[var(--text-muted)] mt-0.5">
                                                            {t.nextArr}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="py-6 text-center bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] shadow-2xs">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <CheckCircle2 size={24} className="text-emerald-600 dark:text-emerald-400" />
                                                        <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] animate-pulse">
                                                            {t.answerReceived} — {t.nextArr}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* VISUAL SIDE */}
                            {q?.resolvedData?.renderData && (q.resolvedData.renderData.graph || q.resolvedData.renderData.geometry || q.resolvedData.renderData.pattern) ? (
                                <div className="p-6 lg:p-10 flex items-center justify-center whiteboard-protect order-2 min-h-[350px] lg:h-full border-t lg:border-t-0 border-[var(--border-main)] relative overflow-hidden bg-[var(--bg-card)]">
                                    <div className="absolute inset-0 flex items-center justify-center p-6">
                                        <div className="flex justify-center scale-90 origin-top mt-2">
                                            <VisualRenderer data={q?.resolvedData?.renderData || q?.renderData} isWordProblem={q?.selectedStoryIndex !== null && q?.selectedStoryIndex !== undefined} />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="hidden lg:block order-2 bg-[var(--bg-surface)]" />
                            )}
                        </div>

                        {/* MILESTONE REVIEW MODAL */}
                        {showMilestone && (
                            <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150 select-none font-sans">
                                <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 text-[var(--text-main)]">
                                    
                                    <div className="bg-[var(--bg-surface)] border-b border-[var(--border-main)] p-6 flex justify-between items-center shrink-0">
                                        <div>
                                            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight uppercase mb-0.5">
                                                {t.milestoneTitle}
                                            </h2>
                                            <p className="text-xs font-semibold text-[var(--text-muted)]">
                                                {lang === 'sv' ? 'Granska dina senaste svar innan du går vidare.' : 'Review your recent answers before continuing.'}
                                            </p>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                const totalAnswered = Object.keys(responses).length;
                                                const totalCorrect = Object.values(responses).filter(r => r.isCorrect).length;
                                                syncProgress('test_session_completed', {
                                                    app_mode: 'test_lab',
                                                    total_questions: totalAnswered,
                                                    final_accuracy: totalAnswered > 0 ? parseFloat((totalCorrect / totalAnswered).toFixed(2)) : 0,
                                                    test_mode: meta.mode,
                                                    early_finish: true
                                                });
                                                setInternalMode('SUMMARY');
                                            }} 
                                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs"
                                        >
                                            {t.finish}
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-[var(--bg-canvas)] custom-scrollbar">
                                        {Object.keys(responses).filter(idx => idx >= currentIndex - 14 && idx <= currentIndex).map(idx => {
                                            const qItem = packet[idx];
                                            const res = responses[idx];
                                            const rd = qItem?.resolvedData?.renderData;
                                            const hasVisual = rd?.graph || rd?.geometry || rd?.pattern;
                                            const clues = qItem?.clues || qItem?.resolvedData?.clues || [];

                                            return (
                                                <div key={idx} className={`bg-[var(--bg-card)] p-4 rounded-xl border flex flex-col justify-between transition-all ${res.isCorrect ? 'border-emerald-500 shadow-2xs' : 'border-rose-500 shadow-2xs'}`}>
                                                    <div>
                                                        <div className="flex justify-between items-center mb-2.5">
                                                            <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider font-mono">{lang === 'sv' ? "Uppgift" : "Question"} {parseInt(idx) + 1}</span>
                                                            {res.isCorrect ? <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={16} /> : <XCircle className="text-rose-600 dark:text-rose-400" size={16} />}
                                                        </div>

                                                        {hasVisual && (
                                                            <div className="w-full h-24 flex items-center justify-center whiteboard-protect rounded-xl mb-2.5 border border-[var(--border-main)] bg-[var(--bg-surface)] overflow-hidden">
                                                                <div className="flex justify-center scale-70 origin-center">
                                                                    <VisualRenderer data={q?.resolvedData?.renderData || q?.renderData} isWordProblem={q?.selectedStoryIndex !== null && q?.selectedStoryIndex !== undefined} />
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="space-y-1.5 text-[var(--text-main)] mb-3">
                                                            <div className="text-center font-bold text-xs leading-snug px-1">
                                                                <MathDisplay content={typeof rd?.description === 'object' ? rd.description[lang] : rd?.description} />
                                                            </div>
                                                            {rd?.latex && (
                                                                <div className="py-1.5 whiteboard-protect rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] text-center">
                                                                    <MathDisplay content={`$$${rd.latex}$$`} className="scale-85" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2 mt-auto pt-2 border-t border-[var(--border-main)]">
                                                        <div className={`p-2 rounded-xl text-center shadow-inner text-xs font-bold ${res.isCorrect ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'}`}>
                                                            <span className="text-[9px] font-bold uppercase block opacity-70 mb-0.5">{lang === 'sv' ? "Ditt Svar" : "Your Answer"}</span>
                                                            <span className="font-mono">{res.answer || '-'}</span>
                                                        </div>

                                                        {clues.length > 0 && (
                                                            <div className="space-y-1.5">
                                                                <button type="button" onClick={() => toggleSummaryClue(idx)} className={`w-full py-1.5 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${visibleClues[idx] ? 'bg-amber-600 text-white border-amber-600' : 'bg-[var(--bg-surface)] text-amber-700 dark:text-amber-400 border-[var(--border-strong)] hover:border-amber-500'}`}>
                                                                    <Zap size={13} className="inline mr-1" />
                                                                    {visibleClues[idx] ? (lang === 'sv' ? "Dölj lösning" : "Hide Solution") : (lang === 'sv' ? "Visa lösning" : "Show Solution")}
                                                                </button>
                                                                {visibleClues[idx] && (
                                                                    <div className="p-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-strong)] space-y-2 animate-in fade-in duration-150">
                                                                        {clues.map((step, sIdx) => {
                                                                            const stepText = typeof step === 'object' && step !== null ? step[lang] || step.text || Object.values(step)[0] : step;
                                                                            const stepLatex = typeof step === 'object' && step !== null ? step.latex || step.math : null;
                                                                            return (
                                                                                <div key={sIdx} className="flex gap-2 items-start text-xs">
                                                                                    <span className="font-bold font-mono text-[10px] text-amber-600 shrink-0">{sIdx + 1}.</span>
                                                                                    <div className="flex-1 space-y-0.5">
                                                                                        <div><MathDisplay content={stepText} /></div>
                                                                                        {stepLatex && <div className="py-1 px-2 bg-[var(--bg-card)] rounded border border-[var(--border-main)] inline-block"><MathDisplay content={`$$${stepLatex}$$`} className="scale-85 origin-left" /></div>}
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

                                    <div className="p-5 bg-[var(--bg-surface)] border-t border-[var(--border-main)] flex justify-center shrink-0">
                                        <button type="button" disabled={cooldown > 0} onClick={() => { setShowMilestone(false); setCurrentIndex(currentIndex + 1); setInputValue(''); setRevealMilestoneAnswers(false); }} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-2xs cursor-pointer disabled:opacity-40 flex items-center gap-2">
                                            <span>{cooldown > 0 ? `${t.cooldown} (${cooldown}s)` : t.continueBtn}</span> <ChevronRight size={16}/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        );
    }

    // =========================================================
    // --- 3. SUMMARY UI ---
    // =========================================================
    if (internalMode === 'SUMMARY') {
        const { stats } = getDiagnosticStats();
        const toggleSummaryClue = (idx) => { setVisibleClues(prev => ({ ...prev, [idx]: !prev[idx] })); };

        return (
            <div className="layout-wrapper p-4 sm:p-6 flex flex-col items-center py-6 animate-in fade-in font-sans">
                <div className="card w-full max-w-5xl overflow-hidden border border-[var(--border-strong)] rounded-2xl p-0 shadow-2xl bg-[var(--bg-card)] text-[var(--text-main)]">
                    
                    <div className="p-6 sm:p-7 bg-[var(--bg-surface)] border-b border-[var(--border-main)] flex justify-between items-center">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight uppercase mb-1">{t.summaryTitle}</h2>
                            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                {Object.keys(responses).length} / {packet.length} {lang === 'sv' ? 'genomförda uppgifter' : 'tasks completed'}
                            </p>
                        </div>
                        <Beaker size={32} className="text-emerald-600 dark:text-emerald-400 opacity-80" />
                    </div>

                    <div className="p-6 sm:p-7 bg-[var(--bg-canvas)] border-b border-[var(--border-main)] space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{lang === 'sv' ? "Detaljerad genomgång" : "Detailed Review"}</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {packet.map((qItem, idx) => {
                                const res = responses[idx];
                                if (!res) return null; 

                                const rd = qItem.resolvedData?.renderData;
                                const hasVisual = rd?.graph || rd?.geometry || rd?.pattern;
                                const clues = qItem.clues || qItem.resolvedData?.clues || [];

                                return (
                                    <div key={idx} className={`bg-[var(--bg-card)] p-4 rounded-xl border flex flex-col relative transition-all shadow-2xs ${res.isCorrect ? 'border-emerald-500' : 'border-rose-500'}`}>
                                        <div className="flex justify-between items-center mb-2.5">
                                            <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider font-mono">{lang === 'sv' ? "Uppgift" : "Question"} {idx + 1}</span>
                                            {res.isCorrect ? <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={16} /> : <XCircle className="text-rose-600 dark:text-rose-400" size={16} />}
                                        </div>

                                        {hasVisual && (
                                            <div className="w-full h-24 flex items-center justify-center whiteboard-protect rounded-xl mb-2.5 border border-[var(--border-main)] bg-[var(--bg-surface)] overflow-hidden">
                                                <div className="flex justify-center scale-70 origin-center">
                                                    <VisualRenderer data={q?.resolvedData?.renderData || q?.renderData} isWordProblem={q?.selectedStoryIndex !== null && q?.selectedStoryIndex !== undefined} />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex-1 space-y-1.5 mb-3">
                                            <div className="text-center font-bold text-xs leading-snug px-1 text-[var(--text-main)]">
                                                <MathDisplay content={rd?.description} />
                                            </div>
                                            {rd?.latex && (
                                                <div className="py-1.5 whiteboard-protect rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] text-center">
                                                    <MathDisplay content={`$$${rd.latex}$$`} className="scale-85" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2 mt-auto pt-2 border-t border-[var(--border-main)]">
                                            <div className={`p-2 rounded-xl text-center shadow-inner text-xs font-bold ${res.isCorrect ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'}`}>
                                                <span className="text-[9px] font-bold uppercase block opacity-70 mb-0.5">{lang === 'sv' ? "Rätt Svar" : "Correct Answer"}</span>
                                                <span className="font-mono">{atob(qItem.resolvedData.token)}</span>
                                            </div>

                                            {clues.length > 0 && (
                                                <div className="space-y-1.5">
                                                    <button type="button" onClick={() => toggleSummaryClue(idx)} className={`w-full py-1.5 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${visibleClues[idx] ? 'bg-amber-600 text-white border-amber-600' : 'bg-[var(--bg-surface)] text-amber-700 dark:text-amber-400 border-[var(--border-strong)] hover:border-amber-500'}`}>
                                                        <Zap size={13} className="inline mr-1" />
                                                        {visibleClues[idx] ? (lang === 'sv' ? "Dölj lösning" : "Hide Solution") : (lang === 'sv' ? "Visa lösning" : "Show Solution")}
                                                    </button>
                                                    {visibleClues[idx] && (
                                                        <div className="p-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-strong)] space-y-2 animate-in fade-in duration-150">
                                                            {clues.map((step, sIdx) => {
                                                                const stepText = typeof step === 'object' && step !== null ? step[lang] || step.text || Object.values(step)[0] : step;
                                                                const stepLatex = typeof step === 'object' && step !== null ? step.latex || step.math : null;
                                                                return (
                                                                    <div key={sIdx} className="flex gap-2 items-start text-xs">
                                                                        <span className="font-bold font-mono text-[10px] text-amber-600 shrink-0">{sIdx + 1}.</span>
                                                                        <div className="flex-1 space-y-0.5">
                                                                            <div><MathDisplay content={stepText} /></div>
                                                                            {stepLatex && <div className="py-1 px-2 bg-[var(--bg-card)] rounded border border-[var(--border-main)] inline-block"><MathDisplay content={`$$${stepLatex}$$`} className="scale-85 origin-left" /></div>}
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

                    {/* Stats overview */}
                    <div className="p-6 sm:p-7 grid grid-cols-1 md:grid-cols-2 gap-4 bg-[var(--bg-card)] border-b border-[var(--border-main)]">
                        {Object.entries(stats).map(([id, data]) => {
                            if (data.total === 0) return null;
                            const score = Math.round((data.correct / data.total) * 100); 
                            const cat = CATEGORIES[id];
                            return (
                                <div key={id} className="p-4 rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] flex flex-col gap-2 shadow-2xs">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--text-main)]">{cat.label[lang]}</h4>
                                        <span className="text-sm font-black font-mono text-emerald-700 dark:text-emerald-400">{score}%</span>
                                    </div>
                                    <div className="w-2 h-2 bg-[var(--bg-card)] rounded-full overflow-hidden border border-[var(--border-strong)]">
                                        <div className="h-full bg-emerald-600 transition-all duration-300" style={{ width: `${score}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Compact Footer Navigation */}
                    <div className="p-6 bg-[var(--bg-surface)] flex flex-col sm:flex-row justify-center gap-3 shrink-0">
                        <button type="button" onClick={() => { setPacket([]); setResponses({}); setCurrentIndex(0); setInternalMode('SETUP'); }} className="px-5 py-2.5 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-card)] text-[var(--text-main)] text-xs font-bold uppercase tracking-wider hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer shadow-2xs">
                            <Settings2 size={15} className="inline mr-1.5" /> {t.backToLab}
                        </button>
                        <button 
                            type="button"
                            onClick={onBack} 
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-2xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                        >
                            <span>
                                {activeBucket && activeBucket !== 'FREE_PLAY'
                                    ? (lang === 'sv' ? "Fortsätt i planeringen ➡" : "Continue Roadmap ➡")
                                    : t.toDashboard}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}