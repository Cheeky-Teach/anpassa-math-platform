// src/components/views/UnitStudyGuidePrintView.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    Printer, ChevronLeft, GraduationCap, ArrowRight,
    BookOpen, Target, Beaker, CheckSquare, Sparkles, Layers, Loader2, Contrast
} from 'lucide-react';
import { CATEGORIES, LEVEL_DESCRIPTIONS } from '../../constants/localization';
import { CONTENT_MAP } from '../../constants/content_map.generated';
import { SKILL_GRAPH } from '../../constants/skillGraph';
import VisualRenderer from '../visuals/VisualRenderer';
import { supabase } from '../../lib/supabaseClient';
import '../../styles/theme.css';
import PreferencesToggle from '../ui/PreferencesToggle';

const VISUAL_TOPICS = new Set([
    'geometry',
    'pythagoras',
    'trig',
    'angles',
    'volume',
    'area_perimeter',
    'scale',
    'graphs',
    'functions',
    'statistics',
    'probability',
    'fraction_vis',
    'algebraic_geometry',
    'similar_triangles'
]);

// --- PROTECTED MATH RENDERER FOR PRINT & PREVIEW ---
const PrintMathDisplay = ({ content, className = "" }) => {
    const containerRef = useRef(null);
    useEffect(() => {
        if (!content || !containerRef.current) return;
        const formatted =
            content.includes('\\') || content.includes('=') || content.includes('$')
                ? (content.includes('$') ? content : `$${content}$`)
                : content;
        containerRef.current.innerText = formatted;
        if (window.renderMathInElement) {
            window.renderMathInElement(containerRef.current, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false },
                    { left: '\\(', right: '\\)', display: false },
                    { left: '\\[', right: '\\]', display: true }
                ],
                throwOnError: false,
                trust: true
            });
        }
    }, [content]);

    return (
        <span
            ref={containerRef}
            className={`math-content text-slate-900 [&_.katex]:!text-slate-900 [&_.katex-html]:!text-slate-900 ${className}`}
        />
    );
};

const getTopicInfo = (topicId, lang = 'sv') => {
    if (!topicId) return { topicName: '', categoryName: '', categoryId: '' };
    for (const catKey in CATEGORIES) {
        const cat = CATEGORIES[catKey];
        const found = cat?.topics?.find(t => t.id === topicId);
        if (found) {
            return {
                topicName: found.label?.[lang] || found.label?.sv || topicId,
                categoryName: cat.label?.[lang] || cat.label?.sv || catKey,
                categoryId: catKey
            };
        }
    }
    return { topicName: topicId.replace(/_/g, ' '), categoryName: '', categoryId: '' };
};

const getLevelMeta = (topicId, level, lang = 'sv') => {
    if (!topicId || level === undefined || level === null) {
        return { description: '', mathExample: '' };
    }
    const topicDesc = LEVEL_DESCRIPTIONS?.[topicId]?.[level];
    const description = typeof topicDesc === 'object'
        ? (topicDesc[lang] || topicDesc.sv || '')
        : (topicDesc || '');

    let mathExample = '';
    if (Array.isArray(CONTENT_MAP)) {
        for (const cat of CONTENT_MAP) {
            const foundTopic = cat.topics?.find(t => t.id === topicId);
            if (foundTopic) {
                const foundLevel = foundTopic.levels?.find(l => l.lvl === Number(level));
                if (foundLevel?.ex) {
                    mathExample = foundLevel.ex;
                    break;
                }
            }
        }
    }
    return { description, mathExample };
};

const hasVisualRenderableData = (rd) => Boolean(
    rd?.geometry ||
    rd?.graph ||
    rd?.pattern ||
    rd?.marbles ||
    rd?.spinner ||
    rd?.tree ||
    rd?.diagram ||
    rd?.visualType ||
    rd?.frequencyTable ||
    rd?.freqTable ||
    rd?.percentGrid ||
    rd?.scale ||
    rd?.similarity ||
    rd?.compareArea ||
    rd?.compareVolume
);

export default function UnitStudyGuidePrintView({
    bucket,
    classCode = '',
    lang = 'sv',
    onBack
}) {
    const [includeBackPage, setIncludeBackPage] = useState(true);
    const [showExamples, setShowExamples] = useState(true);
    const [isBlackAndWhite, setIsBlackAndWhite] = useState(false);
    const [resolvedCode, setResolvedCode] = useState(classCode || '');

    // Cache of live sample renderData per "topicId:level" for visual thumbnails
    const [sampleRenderMap, setSampleRenderMap] = useState({});
    const [isLoadingVisuals, setIsLoadingVisuals] = useState(false);

    // Self-fetch teacher's class_code from Supabase profiles if prop wasn't populated yet
    useEffect(() => {
        if (classCode && classCode.trim()) {
            setResolvedCode(classCode.trim());
            return;
        }
        if (!bucket?.teacher_id) return;

        let isMounted = true;
        supabase
            .from('profiles')
            .select('class_code')
            .eq('id', bucket.teacher_id)
            .single()
            .then(({ data }) => {
                if (isMounted && data?.class_code) {
                    setResolvedCode(data.class_code);
                }
            })
            .catch(() => {});

        return () => { isMounted = false; };
    }, [classCode, bucket?.teacher_id]);

    const parts = Array.isArray(bucket?.payload) ? bucket.payload : [];

    // Fetch live sample renderData for visual practice steps in this unit
    useEffect(() => {
        if (!showExamples) return;

        const visualKeysToFetch = new Map();
        parts.forEach(part => {
            (part.steps || []).forEach(step => {
                if (step.type === 'instruction' || step.sheetId || step.type === 'test') return;
                const topicId = step.topic || step.topicId;
                const level = Number(step.level || 1);
                if (!topicId) return;

                const { categoryId } = getTopicInfo(topicId, lang);
                const isVisualCandidate =
                    VISUAL_TOPICS.has(topicId) ||
                    categoryId === 'geometry' ||
                    categoryId === 'statistics';

                const key = `${topicId}:${level}`;
                if (isVisualCandidate && !sampleRenderMap[key] && !visualKeysToFetch.has(key)) {
                    const graphNode = SKILL_GRAPH[key];
                    visualKeysToFetch.set(key, {
                        topicId,
                        level,
                        variationKey: graphNode?.sampleVariationKey || null
                    });
                }
            });
        });

        if (visualKeysToFetch.size === 0) return;

        let isCancelled = false;
        setIsLoadingVisuals(true);

        Promise.all(
            Array.from(visualKeysToFetch.entries()).map(async ([key, info]) => {
                try {
                    const url = info.variationKey
                        ? `/api/question?topic=${encodeURIComponent(info.topicId)}&variation=${encodeURIComponent(info.variationKey)}&lang=${lang}&wordProblem=false`
                        : `/api/question?topic=${encodeURIComponent(info.topicId)}&level=${info.level}&lang=${lang}&wordProblem=false`;
                    const res = await fetch(url);
                    if (!res.ok) return [key, null];
                    const data = await res.json();
                    const rd = data?.resolvedData?.renderData || data?.renderData || null;
                    return [key, rd];
                } catch {
                    return [key, null];
                }
            })
        ).then(entries => {
            if (isCancelled) return;
            setSampleRenderMap(prev => {
                const next = { ...prev };
                entries.forEach(([k, rd]) => {
                    if (rd) next[k] = rd;
                });
                return next;
            });
            setIsLoadingVisuals(false);
        });

        return () => { isCancelled = true; };
    }, [parts, lang, showExamples]);

    const unitSummary = useMemo(() => {
        const catSet = new Set();
        const topicSet = new Set();
        let walkthroughCount = 0;
        let practiceCount = 0;
        let checkpointCount = 0;

        parts.forEach(part => {
            (part.steps || []).forEach(step => {
                if (step.type === 'instruction' || step.sheetId) {
                    walkthroughCount++;
                } else if (step.type === 'test') {
                    checkpointCount++;
                } else {
                    practiceCount++;
                    const tId = step.topic || step.topicId;
                    const { topicName, categoryName } = getTopicInfo(tId, lang);
                    if (categoryName) catSet.add(categoryName);
                    if (topicName) topicSet.add(topicName);
                }
            });
        });

        return {
            categories: Array.from(catSet),
            topics: Array.from(topicSet),
            walkthroughCount,
            practiceCount,
            checkpointCount
        };
    }, [parts, lang]);

    const t = {
        sv: {
            back: "Tillbaka",
            backPageToggle: "Baksida: Test Lab-guide",
            examplesToggle: "Visa figurer & exempel",
            bwToggle: "Svartvitt",
            printBtn: "Skriv ut / Spara PDF",
            brandSub: "Anpassa Math Platform • Studieplan & Checklista",
            name: "Namn:",
            classLabel: "Klass:",
            practiceBoxTitle: "Anpassa Träning",
            practiceBoxSub: "Öva med elevkod eller provlänk",
            practiceBtn: "Starta",
            loginHint: "1. Gå till anpassa.app   2. Skriv koden i rutan ovan   3. Välj område",
            overviewTitle: "Innehåll",
            orderNote: "Arbeta igenom listan uppifrån och ned i ordning. Bocka av varje steg när du känner dig säker.",
            badgeWalkthrough: "Genomgång",
            badgeCheckpoint: "Delprov",
            badgeExam: "Prov",
            level: "Nivå",
            questions: "frågor",
            footerLeft: "Behöver du hjälp? Klicka på Hjälp / Exempel inne i uppgiften för steg-för-steg-stöd.",
            footerRight: "Ringa in de steg du tycker är svårast och träna extra på dem i Test Lab.",
            p2Title: "Så tränar du självständigt i Test Lab",
            p2Subtitle: "Använd din checklista för att bygga egna övningspass inför prov eller delprov.",
            p2Step1Title: "1. Välj de områden & nivåer du vill träna på",
            p2Step1Desc: "Öppna Test Lab i menyn. Leta upp de områden och nivåer från checklistan där du vill bli säkrare, eller sök direkt efter ett begrepp i sökrutan.",
            p2Step2Title: "2. Välj rätt träningsläge",
            p2Step2OptA: "Öva (Rekommenderas)",
            p2Step2OptADesc: "Ger direkt rättning efter varje uppgift. Du kan öppna steg-för-steg-lösningen direkt om du kör fast och granska dina misstag under passet.",
            p2Step2OptB: "Provläge",
            p2Step2OptBDesc: "Döljer rätt svar och ledtrådar tills du lämnat in hela passet — perfekt som genrepetion inför ett riktigt prov.",
            p2Step3Title: "3. Följ upp dina resultat",
            p2Step3Desc: "När passet är klart får du en översikt per matematikområde så att du ser exakt vilka nivåer du behärskar och vad du bör repetera en gång till.",
            p2ReflectionTitle: "Mina fokusområden inför provet",
            p2ReflectionPrompt: "Skriv ner 2–3 nivåer från checklistan som du vill träna extra på i Test Lab:"
        },
        en: {
            back: "Back",
            backPageToggle: "Back Side: Test Lab Guide",
            examplesToggle: "Show visuals & examples",
            bwToggle: "Black & White",
            printBtn: "Print / Save PDF",
            brandSub: "Anpassa Math Platform • Unit Study Guide",
            name: "Name:",
            classLabel: "Class:",
            practiceBoxTitle: "Self Practice",
            practiceBoxSub: "Practice using a student or test code",
            practiceBtn: "Start",
            loginHint: "1. Go to anpassa.app   2. Enter the code above   3. Open this unit",
            overviewTitle: "Overview",
            orderNote: "Work through the checklist from top to bottom in order. Check off each step once you feel confident.",
            badgeWalkthrough: "Walkthrough",
            badgeCheckpoint: "Checkpoint",
            badgeExam: "Exam",
            level: "Level",
            questions: "questions",
            footerLeft: "Need help? Click Help / Example inside any question for step-by-step support.",
            footerRight: "Circle any tricky steps and build a targeted practice session in Test Lab.",
            p2Title: "How to Build Your Own Practice Test in Test Lab",
            p2Subtitle: "Use your checklist to create custom practice sessions before a test.",
            p2Step1Title: "1. Pick the topics & levels you need",
            p2Step1Desc: "Open Test Lab from the menu. Check off the topics and levels from your checklist that you want to strengthen, or search by concept.",
            p2Step2Title: "2. Choose your session mode",
            p2Step2OptA: "Practice Mode (Recommended)",
            p2Step2OptADesc: "Gives instant feedback after every question, step-by-step solutions when stuck, and an error-review drawer at any time.",
            p2Step2OptB: "Exam Mode",
            p2Step2OptBDesc: "Hides answers and hints until the entire session is finished — ideal for simulating a real test.",
            p2Step3Title: "3. Review your diagnostic report",
            p2Step3Desc: "When finished, inspect your breakdown by category to see which levels are solid and what to review once more.",
            p2ReflectionTitle: "My Focus Targets Before the Test",
            p2ReflectionPrompt: "Write down 2–3 levels from your checklist to practice in Test Lab:"
        }
    }[lang] || {};

    const getPartTitle = (part, pIdx) => {
        if (part.customTitle && part.customTitle.trim()) return part.customTitle.trim();
        const prefix = lang === 'sv' ? 'Del' : 'Part';
        const { topicName } = getTopicInfo(part.topicId, lang);
        return topicName ? `${prefix} ${pIdx + 1}: ${topicName}` : `${prefix} ${pIdx + 1}`;
    };

    const displayCode = (resolvedCode || '').trim().toUpperCase() || 'KOD';

    const content = (
        <div
            id="unit-study-guide-print-root"
            className={`print-view-root fixed inset-0 z-[9999] overflow-y-auto bg-slate-100 pb-16 print:static print:inset-auto print:overflow-visible print:bg-white print:pb-0 font-sans text-slate-900 ${
                isBlackAndWhite ? 'is-bw' : ''
            }`}
            style={{
                colorScheme: 'light',
                '--text-main': '#0f172a',
                '--text-muted': '#475569',
                '--bg-card': '#ffffff',
                '--bg-surface': '#f8fafc',
                '--border-main': '#e2e8f0',
                '--border-strong': '#cbd5e1'
            }}
        >
            {/* NON-PRINTING STUDIO TOOLBAR */}
            <div className="bg-stone-900 text-white px-4 sm:px-6 py-3 flex flex-wrap justify-between items-center gap-3 sticky top-0 z-50 border-b border-stone-800 print:hidden">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-300 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                    <ChevronLeft size={16} />
                    <span>{t.back}</span>
                </button>

                <div className="flex flex-wrap items-center gap-2.5">
                    {isLoadingVisuals && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-stone-300 px-2.5 py-1 bg-white/5 rounded-lg">
                            <Loader2 size={13} className="animate-spin text-emerald-400" />
                            <span>{lang === 'sv' ? 'Laddar figurer...' : 'Loading visuals...'}</span>
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={() => setIsBlackAndWhite(prev => !prev)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                            isBlackAndWhite
                                ? 'bg-white text-slate-900 border-white shadow-2xs'
                                : 'bg-stone-800/60 text-stone-300 border-stone-700 hover:text-white'
                        }`}
                    >
                        <Contrast size={13} />
                        <span>{t.bwToggle}: {isBlackAndWhite ? (lang === 'sv' ? 'På' : 'On') : (lang === 'sv' ? 'Av' : 'Off')}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowExamples(prev => !prev)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                            showExamples
                                ? 'bg-stone-800 text-emerald-400 border-emerald-500/40'
                                : 'bg-stone-800/60 text-stone-400 border-stone-700'
                        }`}
                    >
                        {t.examplesToggle}: {showExamples ? (lang === 'sv' ? 'På' : 'On') : (lang === 'sv' ? 'Av' : 'Off')}
                    </button>

                    <button
                        type="button"
                        onClick={() => setIncludeBackPage(prev => !prev)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                            includeBackPage
                                ? 'bg-stone-800 text-amber-300 border-amber-500/40'
                                : 'bg-stone-800/60 text-stone-400 border-stone-700'
                        }`}
                    >
                        {t.backPageToggle}: {includeBackPage ? (lang === 'sv' ? 'Ja (2 sidor)' : 'Yes (2 pages)') : (lang === 'sv' ? 'Nej (1 sida)' : 'No (1 page)')}
                    </button>

                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="bg-emerald-600 hover:bg-emerald-500 px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                    >
                        <Printer size={16} />
                        <span>{t.printBtn}</span>
                    </button>
                    <PreferencesToggle/>
                </div>
            </div>

            {/* =====================================================================
                CHECKLIST PAGES (1-COLUMN SEQUENTIAL TRACK WITH INLINE VISUALS)
                ===================================================================== */}
            <div className={`a4-sheet w-[210mm] max-w-full mx-auto !bg-white !text-slate-900 shadow-2xl my-6 p-[9mm] flex flex-col justify-between print:shadow-none print:my-0 print:p-0 box-border ${includeBackPage ? 'break-after-page' : ''}`}>

                <div>
                    {/* TOP MASTHEAD + 1:1 LANDING PAGE LOGIN CARD */}
                    <header className="border-b-2 border-stone-900 pb-2.5 mb-2.5 grid grid-cols-12 gap-3 items-stretch">
                        <div className="col-span-7 flex flex-col justify-between pr-1">
                            <div>
                                <div className="flex items-center gap-1.5 text-[8.5px] font-bold uppercase tracking-widest text-stone-500 mb-0.5">
                                    <span>{t.brandSub}</span>
                                    {bucket?.folder && (
                                        <>
                                            <span>•</span>
                                            <span className="text-stone-800">{bucket.folder}</span>
                                        </>
                                    )}
                                </div>
                                <h1 className="text-lg font-extrabold tracking-tight text-stone-900 leading-tight">
                                    {bucket?.name || (lang === 'sv' ? 'Studieplan' : 'Study Guide')}
                                </h1>
                            </div>

                            {/* Student Name & Class Write-in Lines */}
                            <div className="grid grid-cols-12 gap-3 pt-2 text-[9px] font-bold uppercase tracking-wider text-stone-700">
                                <div className="col-span-8 flex items-baseline gap-1.5 border-b border-stone-400 pb-0.5">
                                    <span>{t.name}</span>
                                    <div className="flex-1" />
                                </div>
                                <div className="col-span-4 flex items-baseline gap-1.5 border-b border-stone-400 pb-0.5">
                                    <span>{t.classLabel}</span>
                                    <div className="flex-1" />
                                </div>
                            </div>
                        </div>

                        {/* Right 5 Cols: 1:1 Replica of LandingView's "Anpassa Träning" Card */}
                        <div className="col-span-5 bg-[#f9fbf7] border-2 border-dashed border-amber-400 rounded-xl p-2 flex flex-col justify-between">
                            <div className="flex items-center justify-between gap-1.5 mb-1">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <div className="w-6 h-6 bg-amber-50 text-amber-700 border border-amber-200 rounded-md flex items-center justify-center shrink-0">
                                        <GraduationCap size={13} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-[11px] font-extrabold text-slate-900 leading-none truncate">
                                            {t.practiceBoxTitle}
                                        </div>
                                        <div className="text-[8.5px] text-slate-500 truncate mt-0.5">
                                            {t.practiceBoxSub}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 shrink-0">
                                    anpassa.app
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5 my-0.5">
                                <div className="flex-1 px-2 py-0.5 bg-white border border-amber-400 rounded-md text-center font-mono font-extrabold text-xs tracking-[0.16em] text-slate-900">
                                    {displayCode}
                                </div>
                                <div className="px-2.5 py-0.5 bg-amber-100 text-amber-950 border border-amber-300 rounded-md font-bold text-[9.5px] inline-flex items-center gap-1 shrink-0">
                                    <span>{t.practiceBtn}</span>
                                    <ArrowRight size={10} />
                                </div>
                            </div>

                            <div className="text-[8.5px] font-semibold text-slate-600 text-center">
                                {t.loginHint}
                            </div>
                        </div>
                    </header>

                    {/* UNIT OVERVIEW & CATEGORY PILLS */}
                    <section className="mb-2.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                                <Layers size={11} className="text-emerald-700" />
                                {t.overviewTitle}:
                            </span>
                            {unitSummary.categories.map(cat => (
                                <span
                                    key={cat}
                                    className="px-1.5 py-0.2 rounded bg-white border border-slate-300 text-[9px] font-bold text-slate-800"
                                >
                                    {cat}
                                </span>
                            ))}
                            {unitSummary.topics.map(tp => (
                                <span
                                    key={tp}
                                    className="px-1.5 py-0.2 rounded bg-emerald-50 border border-emerald-200 text-[9px] font-semibold text-emerald-900"
                                >
                                    {tp}
                                </span>
                            ))}
                        </div>

                        <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-slate-600 shrink-0">
                            {unitSummary.walkthroughCount > 0 && (
                                <span>{unitSummary.walkthroughCount} {t.badgeWalkthrough.toLowerCase()}</span>
                            )}
                            {unitSummary.practiceCount > 0 && (
                                <span>• {unitSummary.practiceCount} {lang === 'sv' ? 'nivåer' : 'levels'}</span>
                            )}
                            {unitSummary.checkpointCount > 0 && (
                                <span>• {unitSummary.checkpointCount} {t.badgeCheckpoint.toLowerCase()}</span>
                            )}
                        </div>
                    </section>

                    {/* SEQUENCED 1-COLUMN CHECKLIST */}
                    <div className="space-y-3">
                        <p className="text-[9.5px] font-semibold text-slate-600">
                            {t.orderNote}
                        </p>

                        {parts.map((part, pIdx) => {
                            const stepCount = (part.steps || []).length;
                            const keepWholePartTogether = stepCount > 0 && stepCount <= 10;

                            return (
                                <section
                                    key={part.id || pIdx}
                                    className={`border border-slate-300 rounded-xl overflow-hidden print:overflow-visible ${
                                        keepWholePartTogether ? 'break-inside-avoid' : ''
                                    }`}
                                >
                                    {/* Part Header */}
                                    <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-300 flex items-center justify-between break-inside-avoid break-after-avoid">
                                        <div className="flex items-center gap-2">
                                            <span className="w-4 h-4 rounded bg-slate-900 text-white font-mono text-[9px] font-bold flex items-center justify-center">
                                                {pIdx + 1}
                                            </span>
                                            <h2 className="text-xs font-extrabold text-slate-900">
                                                {getPartTitle(part, pIdx)}
                                            </h2>
                                        </div>
                                        <span className="text-[9px] font-mono font-bold text-slate-500">
                                            {stepCount} {lang === 'sv' ? 'steg' : 'steps'}
                                        </span>
                                    </div>

                                    {/* 3-Zone Sequential Rows */}
                                    <div className="divide-y divide-slate-200 bg-white">
                                        {(part.steps || []).map((step, sIdx) => {
                                            const isInstruction = step.type === 'instruction' || Boolean(step.sheetId);
                                            const isTest = step.type === 'test';
                                            const topicId = step.topic || step.topicId;
                                            const levelNum = Number(step.level || 1);

                                            const { topicName } = !isInstruction && !isTest
                                                ? getTopicInfo(topicId, lang)
                                                : { topicName: '' };
                                            const { description, mathExample } = !isInstruction && !isTest
                                                ? getLevelMeta(topicId, levelNum, lang)
                                                : { description: '', mathExample: '' };

                                            const sampleRd = !isInstruction && !isTest
                                                ? sampleRenderMap[`${topicId}:${levelNum}`]
                                                : null;
                                            const showVisualThumb = Boolean(showExamples && sampleRd && hasVisualRenderableData(sampleRd));
                                            const showFormulaSlot = Boolean(showExamples && !showVisualThumb && mathExample);

                                            return (
                                                <div
                                                    key={step.id || sIdx}
                                                    className="break-inside-avoid px-3 py-2 flex items-center justify-between gap-3 bg-white"
                                                >
                                                    {/* ZONE A: Left Pencil Checkbox Spine */}
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <div className="w-4 h-4 rounded-[3.5px] border-[1.75px] border-slate-800 bg-white" />
                                                        <span className="font-mono text-[9px] font-bold text-slate-400 w-3.5 text-right">
                                                            {sIdx + 1}.
                                                        </span>
                                                    </div>

                                                    {/* ZONE B: Center Step Description */}
                                                    <div className="flex-1 min-w-0">
                                                        {isInstruction ? (
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="px-1.5 py-0.2 rounded bg-sky-50 border border-sky-300 text-sky-900 text-[8.5px] font-extrabold uppercase shrink-0 inline-flex items-center gap-1">
                                                                    <BookOpen size={9} />
                                                                    {t.badgeWalkthrough}
                                                                </span>
                                                                <span className="text-xs font-extrabold text-slate-900">
                                                                    {step.sheetTitle}
                                                                </span>
                                                            </div>
                                                        ) : isTest ? (
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="px-1.5 py-0.2 rounded bg-amber-50 border border-amber-300 text-amber-950 text-[8.5px] font-extrabold uppercase shrink-0 inline-flex items-center gap-1">
                                                                    <Beaker size={9} />
                                                                    {step.testMode === 'exam' ? t.badgeExam : t.badgeCheckpoint}
                                                                </span>
                                                                <span className="text-xs font-extrabold text-slate-900">
                                                                    {step.title}
                                                                </span>
                                                                {step.questionCount && (
                                                                    <span className="text-[9.5px] font-mono text-slate-500">
                                                                        ({step.questionCount} {t.questions})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-baseline gap-1.5 flex-wrap leading-snug">
                                                                <span className="px-1.5 py-0.2 rounded bg-emerald-50 border border-emerald-300 text-emerald-950 font-mono text-[8.5px] font-extrabold shrink-0">
                                                                    {t.level} {levelNum}
                                                                </span>
                                                                <span className="text-[11px] font-extrabold text-slate-900">
                                                                    {topicName}
                                                                </span>
                                                                {description && (
                                                                    <span className="text-[10.5px] font-semibold text-slate-700">
                                                                        — {description}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* ZONE C: Frameless Inline Visual Diagram OR KaTeX Formula */}
                                                    {showVisualThumb && (
                                                        <div className="w-[156px] h-[74px] shrink-0 flex items-center justify-center overflow-visible">
                                                            <div className="transform scale-[0.58] origin-center pointer-events-none">
                                                                <VisualRenderer data={sampleRd} isWordProblem={false} />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {showFormulaSlot && (
                                                        <div className="w-[156px] shrink-0 flex items-center justify-end text-right text-[10.5px] font-semibold text-slate-900">
                                                            <PrintMathDisplay content={mathExample} />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                </div>

                {/* BOTTOM SUPPORT FOOTER */}
                <footer className="mt-3 pt-2 border-t border-slate-300 grid grid-cols-2 gap-3 text-[8.5px] text-slate-700 break-inside-avoid">
                    <div className="bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                        <strong className="text-slate-900 block">
                            {lang === 'sv' ? 'Stöd under träningen' : 'Built-in Support'}
                        </strong>
                        <span>{t.footerLeft}</span>
                    </div>
                    <div className="bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                        <strong className="text-slate-900 block">
                            {lang === 'sv' ? 'Repetera inför prov' : 'Test Preparation'}
                        </strong>
                        <span>{t.footerRight}</span>
                    </div>
                </footer>
            </div>

            {/* =====================================================================
                BACK PAGE (OPTIONAL): STUDENT SELF-STUDY GUIDE FOR TEST LAB
                ===================================================================== */}
            {includeBackPage && (
                <div className="a4-sheet w-[210mm] max-w-full mx-auto !bg-white !text-slate-900 shadow-2xl my-6 p-[10mm] flex flex-col justify-between print:shadow-none print:my-0 print:p-0 box-border">
                    <div>
                        <header className="border-b-2 border-stone-900 pb-2.5 mb-5 flex items-end justify-between">
                            <div>
                                <div className="text-[9px] font-bold uppercase tracking-widest text-stone-500 mb-0.5">
                                    {t.brandSub}
                                </div>
                                <h2 className="text-xl font-extrabold tracking-tight text-stone-900">
                                    {t.p2Title}
                                </h2>
                                <p className="text-xs font-medium text-slate-600 mt-0.5">
                                    {t.p2Subtitle}
                                </p>
                            </div>
                            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-300 text-slate-800">
                                Test Lab
                            </span>
                        </header>

                        <div className="space-y-4">
                            <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-50/70 space-y-1">
                                <div className="flex items-center gap-2">
                                    <Target size={15} className="text-emerald-700" />
                                    <h3 className="text-sm font-extrabold text-slate-900">{t.p2Step1Title}</h3>
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed pl-6">
                                    {t.p2Step1Desc}
                                </p>
                            </div>

                            <div className="p-3.5 rounded-xl border border-slate-300 bg-white space-y-2.5">
                                <div className="flex items-center gap-2">
                                    <Sparkles size={15} className="text-sky-700" />
                                    <h3 className="text-sm font-extrabold text-slate-900">{t.p2Step2Title}</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pl-6">
                                    <div className="p-3 rounded-xl border border-sky-300 bg-sky-50/50 space-y-1">
                                        <div className="text-xs font-extrabold text-sky-950">{t.p2Step2OptA}</div>
                                        <p className="text-[11px] text-slate-700 leading-relaxed">{t.p2Step2OptADesc}</p>
                                    </div>
                                    <div className="p-3 rounded-xl border border-rose-300 bg-rose-50/40 space-y-1">
                                        <div className="text-xs font-extrabold text-rose-950">{t.p2Step2OptB}</div>
                                        <p className="text-[11px] text-slate-700 leading-relaxed">{t.p2Step2OptBDesc}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-50/70 space-y-1">
                                <div className="flex items-center gap-2">
                                    <CheckSquare size={15} className="text-amber-700" />
                                    <h3 className="text-sm font-extrabold text-slate-900">{t.p2Step3Title}</h3>
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed pl-6">
                                    {t.p2Step3Desc}
                                </p>
                            </div>

                            <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 bg-white space-y-3 mt-3">
                                <div>
                                    <h3 className="text-sm font-extrabold text-slate-900">{t.p2ReflectionTitle}</h3>
                                    <p className="text-xs text-slate-600 mt-0.5">{t.p2ReflectionPrompt}</p>
                                </div>

                                <div className="space-y-3.5 pt-1">
                                    {[1, 2, 3].map(num => (
                                        <div key={num} className="flex items-center gap-3">
                                            <div className="w-4 h-4 rounded-[4px] border-2 border-slate-700 shrink-0" />
                                            <span className="font-mono text-xs font-bold text-slate-500">{num}.</span>
                                            <div className="flex-1 border-b border-slate-300 h-5" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <footer className="mt-4 pt-2.5 border-t border-slate-200 flex justify-between items-center text-[10px] font-mono text-slate-500">
                        <span>{bucket?.name || ''}</span>
                        <span>anpassa.app</span>
                    </footer>
                </div>
            )}

            {/* PORTAL-LEVEL A4 PRINT ISOLATION & HIGH-CONTRAST MONOCHROME MODE */}
            <style dangerouslySetInnerHTML={{ __html: `
                .print-view-root,
                .print-view-root *:not(.print\\:hidden) {
                    color-scheme: light !important;
                }

                .print-view-root svg text {
                    fill: #0f172a !important;
                }

                /* High-Contrast Monochrome Mode (Screen Preview + Print) */
                .print-view-root.is-bw .a4-sheet {
                    filter: grayscale(100%) contrast(115%);
                }

                .print-view-root.is-bw .a4-sheet [class*="bg-emerald-"],
                .print-view-root.is-bw .a4-sheet [class*="bg-amber-"],
                .print-view-root.is-bw .a4-sheet [class*="bg-sky-"],
                .print-view-root.is-bw .a4-sheet [class*="bg-rose-"],
                .print-view-root.is-bw .a4-sheet [class*="bg-[#f9fbf7]"] {
                    background-color: #ffffff !important;
                    border-color: #0f172a !important;
                    color: #0f172a !important;
                }

                .print-view-root.is-bw .a4-sheet [class*="text-emerald-"],
                .print-view-root.is-bw .a4-sheet [class*="text-amber-"],
                .print-view-root.is-bw .a4-sheet [class*="text-sky-"],
                .print-view-root.is-bw .a4-sheet [class*="text-rose-"] {
                    color: #0f172a !important;
                }

                .print-view-root.is-bw .a4-sheet svg * {
                    stroke: #0f172a !important;
                }

                @media print {
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-scheme: light !important;
                    }

                    @page {
                        size: A4 portrait;
                        margin: 11mm 10mm;
                    }

                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        min-height: 0 !important;
                        overflow: visible !important;
                        background: #ffffff !important;
                    }

                    body > *:not(#unit-study-guide-print-root) {
                        display: none !important;
                    }

                    #unit-study-guide-print-root {
                        display: block !important;
                        position: static !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: visible !important;
                        background: #ffffff !important;
                        color: #0f172a !important;
                    }

                    #unit-study-guide-print-root .print\\:hidden {
                        display: none !important;
                    }

                    #unit-study-guide-print-root .a4-sheet {
                        width: 100% !important;
                        max-width: 100% !important;
                        min-height: 0 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                    }

                    .break-inside-avoid {
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                    }

                    .break-after-avoid {
                        break-after: avoid !important;
                        page-break-after: avoid !important;
                    }

                    .break-after-page {
                        break-after: page !important;
                        page-break-after: always !important;
                    }
                }
            `}} />
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
}