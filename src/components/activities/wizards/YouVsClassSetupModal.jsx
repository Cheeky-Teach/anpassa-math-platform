// src/components/activities/wizards/YouVsClassSetupModal.jsx
import React, { useState, useMemo, useEffect } from 'react';
import {
    X, Play, Trash2, Layers, Calculator, LayoutGrid, Loader2, Minus, Plus,
    HelpCircle
} from 'lucide-react';
import SkillGraphExplorer from '../../shared/SkillGraphExplorer';
import { SKILL_GRAPH, getPrerequisiteChain } from '../../../constants/skillGraph';
import { generateDistractors, normalizeQuestionOptions } from '../../../lib/distractorGenerator';
import { extractDecodedAnswer } from '../../live/core/liveAnswerUtils';
import SpotlightTour from '../../shared/SpotlightTour';

export default function YouVsClassSetupModal({
    isOpen,
    onClose,
    onLaunch,
    lang = 'sv'
}) {
    const t = {
        sv: {
            title: "Konfigurera Du mot Klassen",
            step1: "1. Utforska nivåer, exempel & förkunskaper",
            step2: "2. Valda målområden & stegprogression",
            selected_list: "Målområden",
            ladder_mode_label: "Progression",
            mode_prereq_current: "Förkunskaper + Mål",
            mode_current_only: "Endast Målnivå",
            mode_current_next: "Mål + Nästa steg",
            mode_full: "Hela kedjan",
            step3: "3. Spelregler & Antal rundor",
            input_mode: "Svarsformat",
            mode_mc: "4 Alternativ (A–D)",
            mode_keypad: "Knappsats (Exakt)",
            total_rounds: "Antal rundor",
            baseline_pts: "Startpoäng",
            cancel: "Avbryt",
            start: "Starta Aktivitet",
            building: "Bygger frågestege..."
        },
        en: {
            title: "Configure You vs. Class",
            step1: "1. Explore Levels, Examples & Prerequisites",
            step2: "2. Selected Targets & Progression",
            selected_list: "Targets",
            ladder_mode_label: "Progression",
            mode_prereq_current: "Prereqs + Target",
            mode_current_only: "Target Only",
            mode_current_next: "Target + Next",
            mode_full: "Full Climb",
            step3: "3. Game Rules & Round Count",
            input_mode: "Answer Format",
            mode_mc: "4 Options (A–D)",
            mode_keypad: "Keypad (Exact)",
            total_rounds: "Rounds",
            baseline_pts: "Baseline",
            cancel: "Cancel",
            start: "Launch Activity",
            building: "Building ladder..."
        }
    }[lang] || {};

    const [focusedTarget, setFocusedTarget] = useState(null);

    // Interactive Spotlight Tour State
    const storageKey = 'has_seen_you_vs_class_setup_guide';
    const [showHelpModal, setShowHelpModal] = useState(false);

    useEffect(() => {
        if (isOpen && !localStorage.getItem(storageKey)) {
            const timer = setTimeout(() => setShowHelpModal(true), 350);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleCloseTour = () => {
        localStorage.setItem(storageKey, 'true');
        setShowHelpModal(false);
    };

    const [selectedTargets, setSelectedTargets] = useState([]);

    const [ladderMode, setLadderMode] = useState('prereq_current');
    const [totalRounds, setTotalRounds] = useState(6);
    const [inputMode, setInputMode] = useState('multiple_choice');
    const [baselinePoints, setBaselinePoints] = useState(500);
    const [isBuilding, setIsBuilding] = useState(false);

    const youVsClassTourSteps = useMemo(() => [
        {
            selector: '[data-tour="yvc-explorer"]',
            title: {
                sv: '1. Välj målområde & nivå i kunskapskartan',
                en: '1. Pick Target Topic & Level in Concept Map'
            },
            description: {
                sv: 'Sök eller bläddra fram ett matematikområde till vänster, se exempeluppgifter och förkunskaper i mitten, och klicka för att lägga till som målområde.',
                en: 'Search or browse a math topic on the left, inspect sample problems and prerequisites in the center, and add it as a target.'
            }
        },
        {
            selector: '[data-tour="yvc-ladder"]',
            title: {
                sv: '2. Ställ in stegprogression',
                en: '2. Configure Ladder Progression'
            },
            description: {
                sv: 'Välj hur frågestegen ska byggas — t.ex. "Förkunskaper + Mål" för en stegvis klättring upp till målnivån, eller "Hela kedjan" från grund till fördjupning.',
                en: 'Choose how the question ladder builds — e.g. "Prereqs + Target" for a scaffolded climb up to your goal, or "Full Climb" from basics to challenge.'
            }
        },
        {
            selector: '[data-tour="yvc-rules"]',
            title: {
                sv: '3. Välj svarsformat, rundor & startpoäng',
                en: '3. Set Answer Format, Rounds & Baseline Points'
            },
            description: {
                sv: 'Välj mellan 4 svarsalternativ (A–D) eller exakt knappsats, antal rundor (4–12) samt startpoäng för utmanaren och klassen (mobben).',
                en: 'Pick between 4 multiple-choice options (A–D) or exact keypad input, round count (4–12), and starting baseline points for the challenger and mob.'
            }
        },
        {
            selector: '[data-tour="yvc-launch"]',
            title: {
                sv: '4. Starta duellen (1 vs 100)',
                en: '4. Launch the Duel (1 vs 100)'
            },
            description: {
                sv: 'När du har valt minst ett målområde klickar du på "Starta Aktivitet". Eleverna ansluter med rumskoden och du slumpar fram en utmanare till Heta Stolen!',
                en: 'Once you have picked at least one target, click "Launch Activity". Students join via room PIN and you spin to pick a challenger for the Hot Seat!'
            }
        }
    ], []);

    const selectedNodeIds = useMemo(() => {
        return new Set(selectedTargets.map(item => `${item.topicId}:${item.level}`));
    }, [selectedTargets]);

    if (!isOpen) return null;

    const handleAddNodeFromExplorer = (node) => {
        if (!node) return;
        const lvl = Number(node.level);
        const exists = selectedTargets.some(
            item => item.topicId === node.topicId && Number(item.level) === lvl
        );
        if (exists) return;

        setSelectedTargets(prev => [
            ...prev,
            {
                topicId: node.topicId,
                level: lvl,
                label: node.topicLabel?.[lang] || node.topicLabel?.sv || node.topicId,
                levelDesc: node.levelDesc?.[lang] || node.levelDesc?.sv || ''
            }
        ]);
    };

    const handleRemoveTarget = (idx) => {
        setSelectedTargets(prev => prev.filter((_, i) => i !== idx));
    };

    const buildCustomLadderSteps = () => {
        if (selectedTargets.length === 0) return [];

        const chains = selectedTargets.map(target => {
            const nodeKey = `${target.topicId}:${target.level}`;
            const graphNode = SKILL_GRAPH[nodeKey];
            const targetNode = {
                topicId: target.topicId,
                level: Number(target.level),
                topicLabel: graphNode?.topicLabel || { sv: target.label, en: target.label },
                levelDesc: graphNode?.levelDesc || { sv: target.levelDesc, en: target.levelDesc },
                sampleVariationKey: graphNode?.sampleVariationKey || null
            };

            const sameTopicUnlocks = (graphNode?.unlocks || [])
                .map(id => SKILL_GRAPH[id])
                .filter(n => n && n.topicId === target.topicId)
                .sort((a, b) => Number(a.level) - Number(b.level));
            const nextLevelNode = sameTopicUnlocks[0] || null;

            let nodes = [];

            if (ladderMode === 'current_only') {
                nodes = [targetNode];
            } else if (ladderMode === 'prereq_current') {
                const chain = getPrerequisiteChain(target.topicId, target.level, 2);
                nodes = chain.length > 0 ? chain.slice(-3) : [targetNode];
            } else if (ladderMode === 'current_next') {
                nodes = [targetNode];
                if (nextLevelNode) nodes.push(nextLevelNode);
            } else {
                const chain = getPrerequisiteChain(target.topicId, target.level, 2);
                nodes = chain.length > 0 ? chain.slice(-3) : [targetNode];
                if (nextLevelNode) nodes.push(nextLevelNode);
            }

            return nodes;
        });

        const baseSequence = [];
        const maxLen = Math.max(...chains.map(c => c.length));
        for (let stepIdx = 0; stepIdx < maxLen; stepIdx++) {
            for (let cIdx = 0; cIdx < chains.length; cIdx++) {
                if (chains[cIdx][stepIdx]) {
                    baseSequence.push(chains[cIdx][stepIdx]);
                }
            }
        }

        const count = Math.max(1, Math.min(20, Number(totalRounds) || 6));
        const finalSteps = [];
        for (let i = 0; i < count; i++) {
            const mappedIdx = Math.floor((i * baseSequence.length) / count);
            finalSteps.push(baseSequence[mappedIdx]);
        }

        return finalSteps;
    };

    const handleLaunch = async () => {
        if (selectedTargets.length === 0) return;
        setIsBuilding(true);

        try {
            const steps = buildCustomLadderSteps();
            const fetchedRounds = await Promise.all(
                steps.map(async (step, idx) => {
                    const url = `/api/question?topic=${step.topicId}&level=${step.level}&lang=${lang}&wordProblem=false`;
                    try {
                        const res = await fetch(url);
                        if (!res.ok) return null;
                        const data = await res.json();
                        const rd = data.renderData || {};
                        const rawAnswer = extractDecodedAnswer(data) || extractDecodedAnswer(rd) || data.answer || rd.answer || '';

                        let options = [];
                        let expectedAnswer = rawAnswer;

                        if (inputMode === 'multiple_choice') {
                            const rawExisting = data.options || rd.options;
                            if (Array.isArray(rawExisting) && rawExisting.length === 4) {
                                options = normalizeQuestionOptions(rawExisting, rawAnswer);
                            } else {
                                options = generateDistractors({
                                    correctAnswer: rawAnswer,
                                    topicId: step.topicId,
                                    renderData: { ...rd, options: null },
                                    raw: data
                                });
                            }
                            const correctOpt = options.find(o => o.isCorrect || String(o.label) === String(rawAnswer));
                            expectedAnswer = correctOpt ? correctOpt.id : 'A';
                        }

                        const topicTitle = step.topicLabel?.[lang] || step.topicLabel?.sv || step.topicId;

                        return {
                            id: crypto.randomUUID(),
                            roundIndex: idx,
                            topicId: step.topicId,
                            level: step.level,
                            variationKey: data.variationKey || step.sampleVariationKey || null,
                            name: `${topicTitle} (${lang === 'sv' ? 'Nivå' : 'Lvl'} ${step.level})`,
                            inputMode,
                            showText: true,
                            showLatex: true,
                            showVisual: true,
                            renderData: {
                                ...rd,
                                options: inputMode === 'multiple_choice' ? options : null,
                                answer: expectedAnswer,
                                rawAnswerValue: rawAnswer
                            },
                            responseSpec: {
                                type: inputMode === 'multiple_choice' ? 'single_choice' : 'standard',
                                answer: expectedAnswer,
                                options: inputMode === 'multiple_choice' ? options : null
                            }
                        };
                    } catch (err) {
                        console.warn("[YouVsClassSetupModal] Skipping failed step:", step, err);
                        return null;
                    }
                })
            );

            const validRounds = fetchedRounds.filter(Boolean).map((r, i) => ({ ...r, roundIndex: i }));
            if (validRounds.length === 0) {
                alert(lang === 'sv' ? "Kunde inte hämta frågor för valt område." : "Could not generate questions for selected topic.");
                return;
            }

            onLaunch({
                initialQuestions: validRounds,
                settings: {
                    inputMode,
                    baselinePoints,
                    totalRounds: validRounds.length,
                    ladderMode,
                    timerSeconds: 0,
                    targets: selectedTargets
                }
            });
            onClose();
        } finally {
            setIsBuilding(false);
        }
    };

    const ZPD_MODES = [
        { id: 'prereq_current', label: t.mode_prereq_current },
        { id: 'current_only', label: t.mode_current_only },
        { id: 'current_next', label: t.mode_current_next },
        { id: 'full', label: t.mode_full }
    ];

    return (
        <div className="fixed inset-0 z-[550] bg-black/75 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 animate-in fade-in duration-150 select-none font-sans">
            <div className="bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-strong)] rounded-2xl shadow-2xl w-full max-w-[1440px] h-[92vh] lg:h-[86vh] flex flex-col overflow-hidden">
                
                {/* Compact Header */}
                <header className="px-5 py-3 border-b border-[var(--border-main)] bg-[var(--bg-surface)] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-300 font-mono font-extrabold text-xs">
                            You vs. Class
                        </span>
                        <h2 className="text-sm sm:text-base font-extrabold tracking-tight">{t.title}</h2>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => setShowHelpModal(true)}
                            className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
                            title={lang === 'sv' ? "Hjälp & Spelregler" : "Help & Rules"}
                        >
                            <HelpCircle size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </header>

                {/* 3-PANE HORIZONTAL COCKPIT (ZERO VERTICAL PAGE SCROLL) */}
                <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto lg:overflow-hidden bg-[var(--bg-canvas)]">
                    
                    {/* LEFT & CENTER PANES (8 Cols): Step 1 — Explorer Stage + Prereqs/Next Steps */}
                    <div
                        data-tour="yvc-explorer"
                        className="lg:col-span-8 p-4 flex flex-col min-h-0 border-b lg:border-b-0 lg:border-r border-[var(--border-main)]"
                    >
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2 shrink-0 block">
                            {t.step1}
                        </span>

                        <div className="flex-1 min-h-0">
                            <SkillGraphExplorer
                                mode="teacher_picker"
                                lang={lang}
                                focusedTarget={focusedTarget}
                                onFocusChange={setFocusedTarget}
                                onAddNode={handleAddNodeFromExplorer}
                                selectedNodeIds={selectedNodeIds}
                                showCategoryBrowser={true}
                                compactHorizontal={true}
                            />
                        </div>
                    </div>

                    {/* RIGHT PANE (4 Cols): Step 2 (Targets & Ladder) + Step 3 (Rules) + Launch */}
                    <div className="lg:col-span-4 p-4 flex flex-col justify-between min-h-0 bg-[var(--bg-surface)]/40 gap-3">
                        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-4 pr-0.5">
                            
                            {/* STEP 2: SELECTED TARGETS & ZPD LADDER */}
                            <div data-tour="yvc-ladder" className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                        {t.step2}
                                    </span>
                                    <span className="text-[11px] font-mono font-bold text-[var(--text-muted)]">
                                        {selectedTargets.length} {t.selected_list.toLowerCase()}
                                    </span>
                                </div>

                                <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl p-3 space-y-2.5">
                                    {selectedTargets.length === 0 ? (
                                        <p className="text-xs text-[var(--text-muted)] text-center py-2">
                                            {lang === 'sv' ? 'Välj minst ett målområde till vänster.' : 'Select at least one target on the left.'}
                                        </p>
                                    ) : (
                                        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto custom-scrollbar">
                                            {selectedTargets.map((item, idx) => (
                                                <div
                                                    key={`${item.topicId}-${item.level}`}
                                                    className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-1.5"
                                                >
                                                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-emerald-600 text-white shrink-0">
                                                        N{item.level}
                                                    </span>
                                                    <span className="truncate max-w-[165px]">{item.label}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTarget(idx)}
                                                        className="text-emerald-700 dark:text-emerald-300 hover:text-rose-600 cursor-pointer shrink-0"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="pt-2 border-t border-[var(--border-main)] space-y-1.5">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
                                            <Layers size={11} className="text-emerald-600" />
                                            <span>{t.ladder_mode_label}</span>
                                        </span>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {ZPD_MODES.map(mode => (
                                                <button
                                                    key={mode.id}
                                                    type="button"
                                                    onClick={() => setLadderMode(mode.id)}
                                                    className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border text-center transition-all cursor-pointer ${
                                                        ladderMode === mode.id
                                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                                            : 'bg-[var(--bg-surface)] border-[var(--border-main)] text-[var(--text-main)] hover:border-emerald-500'
                                                    }`}
                                                >
                                                    {mode.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* STEP 3: GAME RULES & ROUND COUNT */}
                            <div data-tour="yvc-rules" className="space-y-2.5">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                                    {t.step3}
                                </span>

                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setInputMode('multiple_choice')}
                                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                                            inputMode === 'multiple_choice'
                                                ? 'bg-[var(--bg-card)] border-emerald-600 ring-2 ring-emerald-500/20'
                                                : 'bg-[var(--bg-card)] border-[var(--border-main)] opacity-75 hover:opacity-100'
                                        }`}
                                    >
                                        <LayoutGrid size={15} className="text-emerald-600 shrink-0" />
                                        <span className="text-xs font-extrabold leading-tight">{t.mode_mc}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setInputMode('keypad')}
                                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                                            inputMode === 'keypad'
                                                ? 'bg-[var(--bg-card)] border-emerald-600 ring-2 ring-emerald-500/20'
                                                : 'bg-[var(--bg-card)] border-[var(--border-main)] opacity-75 hover:opacity-100'
                                        }`}
                                    >
                                        <Calculator size={15} className="text-sky-600 shrink-0" />
                                        <span className="text-xs font-extrabold leading-tight">{t.mode_keypad}</span>
                                    </button>
                                </div>

                                {/* Round Count + Baseline Points */}
                                <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl p-3 space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                            {t.total_rounds}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => setTotalRounds(prev => Math.max(2, prev - 1))}
                                                className="w-6 h-6 rounded-md bg-[var(--bg-surface)] border border-[var(--border-main)] flex items-center justify-center cursor-pointer hover:border-emerald-600"
                                            >
                                                <Minus size={12} />
                                            </button>
                                            <span className="font-mono text-xs font-extrabold w-6 text-center">{totalRounds}</span>
                                            <button
                                                type="button"
                                                onClick={() => setTotalRounds(prev => Math.min(20, prev + 1))}
                                                className="w-6 h-6 rounded-md bg-[var(--bg-surface)] border border-[var(--border-main)] flex items-center justify-center cursor-pointer hover:border-emerald-600"
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-1.5">
                                        {[4, 6, 8, 10, 12].map(n => (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => setTotalRounds(n)}
                                                className={`flex-1 py-1 rounded-lg text-xs font-mono font-bold border cursor-pointer ${
                                                    totalRounds === n
                                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                                        : 'bg-[var(--bg-surface)] border-[var(--border-main)]'
                                                }`}
                                            >
                                                {n}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="pt-2 border-t border-[var(--border-main)] flex items-center justify-between gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                            {t.baseline_pts}
                                        </span>
                                        <div className="flex gap-1">
                                            {[300, 500, 1000].map(pts => (
                                                <button
                                                    key={pts}
                                                    type="button"
                                                    onClick={() => setBaselinePoints(pts)}
                                                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border cursor-pointer ${
                                                        baselinePoints === pts
                                                            ? 'bg-amber-500 text-white border-amber-500'
                                                            : 'bg-[var(--bg-surface)] border-[var(--border-main)]'
                                                    }`}
                                                >
                                                    {pts}p
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pinned Launch Footer inside Right Pane */}
                        <div className="pt-3 border-t border-[var(--border-main)] flex items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-3.5 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                            >
                                {t.cancel}
                            </button>

                            <button
                                data-tour="yvc-launch"
                                type="button"
                                disabled={isBuilding || selectedTargets.length === 0}
                                onClick={handleLaunch}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                            >
                                {isBuilding ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
                                <span>{isBuilding ? t.building : `${t.start} (${totalRounds})`}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* INTERACTIVE SPOTLIGHT WALKTHROUGH TOUR */}
                <SpotlightTour
                    steps={youVsClassTourSteps}
                    isOpen={showHelpModal}
                    onClose={handleCloseTour}
                    lang={lang}
                />
            </div>
        </div>
    );
}