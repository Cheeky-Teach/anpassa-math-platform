import React, { useState, useMemo, useEffect } from 'react';
import { 
    X, Check, Beaker, Layers, ChevronDown, ChevronUp, 
    HelpCircle, Search
} from 'lucide-react';
import { encodeConfig } from '../../core/utils/labCodeUtils';
import { CATEGORIES, LEVEL_DESCRIPTIONS } from '../../constants/localization';
import { CONTENT_MAP } from '../../constants/content_map.generated';
import { isLevelWordProblemReady } from '../../constants/skillBuckets.js';
import MathDisplay from '../shared/MathDisplay';

// Helper to look up topic label
const getTopicLabel = (topicId, lang = 'sv') => {
    for (const catKey in CATEGORIES) {
        const found = CATEGORIES[catKey]?.topics?.find(t => t.id === topicId);
        if (found) return found.label[lang] || found.label.sv || topicId;
    }
    return topicId ? topicId.replace(/_/g, ' ') : '';
};

// Helper to look up level description & rendered math example
const getLevelMetadata = (topicId, level, lang = 'sv') => {
    if (!topicId || level === undefined || level === null) {
        return { description: '', mathExample: '' };
    }
    const descriptionsObj = typeof LEVEL_DESCRIPTIONS !== 'undefined' ? LEVEL_DESCRIPTIONS : {};
    const topicDesc = descriptionsObj[topicId]?.[level];
    const description = typeof topicDesc === 'object' 
        ? (topicDesc[lang] || topicDesc.sv || '') 
        : (topicDesc || '');

    let mathExample = '';
    if (typeof CONTENT_MAP !== 'undefined' && Array.isArray(CONTENT_MAP)) {
        for (const cat of CONTENT_MAP) {
            const foundTopic = cat.topics?.find(t => t.id === topicId);
            if (foundTopic) {
                const foundLevel = foundTopic.levels?.find(l => l.lvl === level);
                if (foundLevel?.ex) {
                    mathExample = foundLevel.ex;
                    break;
                }
            }
        }
    }
    return { description, mathExample };
};

// Reusable Topic Inspector with expandable math previews & level checks
function TopicLevelInspector({
    topicId,
    lang,
    selectedLevels = [],
    isExpanded,
    onToggleExpand,
    onToggleLevel,
    onToggleAllLevels
}) {
    const allLevels = LEVEL_DESCRIPTIONS[topicId] 
        ? Object.keys(LEVEL_DESCRIPTIONS[topicId]).map(Number).sort((a,b) => a-b) 
        : [1];

    const isAllSelected = allLevels.length > 0 && selectedLevels.length === allLevels.length;

    return (
        <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-main)] overflow-hidden shadow-2xs transition-colors h-fit">
            {/* Topic Inspector Header */}
            <div className="px-3.5 py-2.5 bg-[var(--bg-card)] border-b border-[var(--border-subtle)] flex items-center justify-between gap-2">
                <div 
                    className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                    onClick={onToggleExpand}
                >
                    <button type="button" className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer">
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                    <h4 className="font-bold text-xs uppercase tracking-wide text-[var(--text-main)] truncate">
                        {getTopicLabel(topicId, lang)}
                    </h4>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold font-mono text-[var(--text-muted)]">
                        {selectedLevels.length}/{allLevels.length}
                    </span>
                    <button
                        type="button"
                        onClick={() => onToggleAllLevels(topicId, allLevels)}
                        className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                            isAllSelected
                                ? 'bg-amber-600 text-white border-transparent'
                                : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-strong)] hover:text-[var(--text-main)]'
                        }`}
                    >
                        {isAllSelected 
                            ? (lang === 'sv' ? "Alla" : "All") 
                            : (lang === 'sv' ? "Välj alla" : "All")}
                    </button>
                </div>
            </div>

            {/* Detailed Level Rows with Math Previews */}
            {isExpanded && (
                <div className="divide-y divide-[var(--border-subtle)] bg-[var(--bg-card)]">
                    {allLevels.map(lvl => {
                        const isSelected = selectedLevels.includes(lvl);
                        const { description, mathExample } = getLevelMetadata(topicId, lvl, lang);

                        return (
                            <div 
                                key={lvl}
                                onClick={() => onToggleLevel(topicId, lvl)}
                                className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                                    isSelected 
                                        ? 'bg-amber-50/70 dark:bg-amber-950/30' 
                                        : 'hover:bg-[var(--bg-surface)]'
                                }`}
                            >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold font-mono text-xs shrink-0 transition-all ${
                                        isSelected 
                                            ? 'bg-amber-600 text-white shadow-2xs' 
                                            : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-strong)]'
                                    }`}>
                                        {lvl}
                                    </div>

                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span className="font-bold text-xs text-[var(--text-main)] leading-snug truncate">
                                            {description || `${lang === 'sv' ? 'Nivå' : 'Level'} ${lvl}`}
                                        </span>

                                        {mathExample && (
                                            <div className="mt-0.5 text-xs text-amber-700 dark:text-amber-300 font-serif italic truncate flex items-center gap-1.5 opacity-90">
                                                <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-[var(--text-muted)] not-italic">
                                                    Ex:
                                                </span>
                                                <MathDisplay content={mathExample} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="shrink-0">
                                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                                        isSelected 
                                            ? 'bg-amber-600 border-amber-600 text-white shadow-2xs' 
                                            : 'border-[var(--border-strong)] bg-[var(--bg-card)]'
                                    }`}>
                                        {isSelected && <Check size={12} strokeWidth={3} />}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function CheckpointModal({
    isOpen,
    onClose,
    onSaveCheckpoint,
    targetPart,
    bucket,
    lang = 'sv'
}) {
    if (!isOpen) return null;

    const defaultSelection = useMemo(() => {
        const initial = {};
        if (targetPart && Array.isArray(targetPart.steps)) {
            targetPart.steps.forEach(step => {
                if (step.type === 'practice' && (step.topic || step.topicId)) {
                    const topicId = step.topic || step.topicId;
                    const level = Number(step.level);
                    if (!initial[topicId]) {
                        initial[topicId] = { enabled: true, levels: [] };
                    }
                    if (!initial[topicId].levels.includes(level)) {
                        initial[topicId].levels.push(level);
                    }
                }
            });
        }
        return initial;
    }, [targetPart]);

    const [testTitle, setTestTitle] = useState(() => {
        const prefix = lang === 'sv' ? 'Delprov' : 'Checkpoint';
        const partLabel = targetPart?.customTitle || (targetPart?.topicId ? getTopicLabel(targetPart.topicId, lang) : '');
        return partLabel ? `${prefix}: ${partLabel}` : `${prefix}`;
    });

    const [selection, setSelection] = useState(defaultSelection);
    const [testMode, setTestMode] = useState('practice');
    const [questionCount, setQuestionCount] = useState(10);
    const [useWordProblems, setUseWordProblems] = useState(false);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [curriculumSearch, setCurriculumSearch] = useState('');

    const [expandedTopicDetails, setExpandedTopicDetails] = useState(() => {
        const initialExpanded = {};
        Object.keys(defaultSelection).forEach(tId => { initialExpanded[tId] = true; });
        return initialExpanded;
    });

    const hasWordProblemSupport = useMemo(() => {
        return Object.entries(selection).some(([topicId, conf]) => {
            if (!conf?.enabled || !conf?.levels) return false;
            return conf.levels.some(lvl => isLevelWordProblemReady(topicId, lvl));
        });
    }, [selection]);

    useEffect(() => {
        if (!hasWordProblemSupport && useWordProblems) {
            setUseWordProblems(false);
        }
    }, [hasWordProblemSupport, useWordProblems]);

    const toggleTopicDetails = (topicId) => {
        setExpandedTopicDetails(prev => ({ ...prev, [topicId]: !prev[topicId] }));
    };

    const toggleLevel = (topicId, lvl) => {
        setSelection(prev => {
            const current = prev[topicId] || { enabled: false, levels: [] };
            const exists = current.levels.includes(lvl);
            const newLevels = exists 
                ? current.levels.filter(l => l !== lvl)
                : [...current.levels, lvl].sort((a, b) => a - b);

            return {
                ...prev,
                [topicId]: {
                    enabled: newLevels.length > 0,
                    levels: newLevels
                }
            };
        });
    };

    const toggleAllTopicLevels = (topicId, allLevels) => {
        setSelection(prev => {
            const current = prev[topicId] || { enabled: false, levels: [] };
            const allSelected = current.levels.length === allLevels.length;
            return {
                ...prev,
                [topicId]: {
                    enabled: !allSelected,
                    levels: !allSelected ? allLevels : []
                }
            };
        });
    };

    const totalSelectedLevels = useMemo(() => {
        return Object.values(selection).reduce((acc, curr) => acc + (curr.enabled ? curr.levels.length : 0), 0);
    }, [selection]);

    const handleSave = () => {
        if (totalSelectedLevels === 0) {
            alert(lang === 'sv' ? "Välj minst en nivå för provet." : "Select at least one level for the test.");
            return;
        }

        const cleanSelection = {};
        Object.entries(selection).forEach(([tId, conf]) => {
            if (conf.enabled && conf.levels.length > 0) {
                cleanSelection[tId] = { enabled: true, levels: conf.levels };
            }
        });

        const meta = {
            mode: testMode,
            limit: Number(questionCount),
            wordProblem: hasWordProblemSupport && useWordProblems,
            allowCoach: testMode === 'practice'
        };

        const configCode = encodeConfig({ meta, selection: cleanSelection });

        onSaveCheckpoint({
            id: `step_test_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            type: 'test',
            title: testTitle.trim() || (lang === 'sv' ? "Delprov" : "Checkpoint Test"),
            configCode,
            questionCount: Number(questionCount),
            testMode,
            selectedTopicCount: Object.keys(cleanSelection).length
        });

        onClose();
    };

    const filteredCategories = useMemo(() => {
        if (!curriculumSearch.trim()) return Object.entries(CATEGORIES);
        const query = curriculumSearch.toLowerCase();

        return Object.entries(CATEGORIES).map(([catKey, category]) => {
            const matchingTopics = category.topics.filter(t => 
                (t.label[lang] || t.label.sv || t.id).toLowerCase().includes(query)
            );
            return [catKey, { ...category, topics: matchingTopics }];
        }).filter(([_, category]) => category.topics.length > 0);
    }, [curriculumSearch, lang]);

    return (
        <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150 select-none font-sans">
            <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden text-[var(--text-main)]">
                
                {/* 1. Modal Header */}
                <div className="px-6 py-4 border-b border-[var(--border-main)] flex justify-between items-center bg-[var(--bg-surface)] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                            <Beaker size={20} />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block leading-tight">
                                {lang === 'sv' ? "Checkpunkt / Delprov" : "Checkpoint Test"}
                            </span>
                            <h3 className="text-base font-extrabold text-[var(--text-main)] truncate mt-0.5">
                                {targetPart?.customTitle || getTopicLabel(targetPart?.topicId, lang) || (lang === 'sv' ? "Skapa Delprov" : "Create Checkpoint")}
                            </h3>
                        </div>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose} 
                        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] rounded-xl transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* 2. Modal Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6 bg-[var(--bg-card)]">
                    
                    {/* Primary Config Stack */}
                    <div className="bg-[var(--bg-surface)] border border-[var(--border-main)] p-5 rounded-2xl space-y-4">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1.5">
                                {lang === 'sv' ? "Provtitel" : "Checkpoint Title"}
                            </label>
                            <input 
                                type="text"
                                value={testTitle}
                                onChange={(e) => setTestTitle(e.target.value)}
                                className="w-full bg-[var(--bg-card)] border border-[var(--border-strong)] focus:border-amber-600 rounded-xl px-4 py-2.5 text-sm font-bold text-[var(--text-main)] outline-none transition-colors"
                                placeholder={lang === 'sv' ? "T.ex. Delprov: Ekvationer & Bråk" : "E.g. Checkpoint: Equations"}
                            />
                        </div>

                        {/* Controls Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                            {/* Mode Toggle */}
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                                    {lang === 'sv' ? "Läge" : "Mode"}
                                </label>
                                <div className="grid grid-cols-2 gap-1 bg-[var(--bg-card)] p-1 rounded-xl border border-[var(--border-strong)]">
                                    <button
                                        type="button"
                                        onClick={() => setTestMode('practice')}
                                        className={`py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                            testMode === 'practice' 
                                                ? 'bg-amber-600 text-white shadow-2xs' 
                                                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                        }`}
                                    >
                                        {lang === 'sv' ? "Öva" : "Practice"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTestMode('exam')}
                                        className={`py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                            testMode === 'exam' 
                                                ? 'bg-rose-600 text-white shadow-2xs' 
                                                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                        }`}
                                    >
                                        {lang === 'sv' ? "Prov" : "Exam"}
                                    </button>
                                </div>
                            </div>

                            {/* Length */}
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                                    {lang === 'sv' ? "Omfattning" : "Length"}
                                </label>
                                <select
                                    value={questionCount}
                                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                                    className="w-full bg-[var(--bg-card)] border border-[var(--border-strong)] focus:border-amber-600 rounded-xl px-3 py-2 text-xs font-bold text-[var(--text-main)] outline-none cursor-pointer h-[38px]"
                                >
                                    <option value={5}>5 {lang === 'sv' ? "frågor" : "questions"}</option>
                                    <option value={10}>10 {lang === 'sv' ? "frågor" : "questions"}</option>
                                    <option value={15}>15 {lang === 'sv' ? "frågor" : "questions"}</option>
                                    <option value={20}>20 {lang === 'sv' ? "frågor" : "questions"}</option>
                                    <option value={30}>30 {lang === 'sv' ? "frågor" : "questions"}</option>
                                </select>
                            </div>

                            {/* Guarded Word Problems */}
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                                    {lang === 'sv' ? "Textuppgifter" : "Word Problems"}
                                </label>
                                <button
                                    type="button"
                                    disabled={!hasWordProblemSupport}
                                    onClick={() => setUseWordProblems(!useWordProblems)}
                                    title={!hasWordProblemSupport ? (lang === 'sv' ? "Inga valda områden har textuppgifter" : "No selected topics support word problems") : ""}
                                    className={`w-full h-[38px] px-3 rounded-xl border transition-all flex items-center justify-between text-xs font-bold ${
                                        !hasWordProblemSupport 
                                            ? 'opacity-40 cursor-not-allowed bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                                            : useWordProblems 
                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs cursor-pointer' 
                                                : 'bg-[var(--bg-card)] border-[var(--border-strong)] text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer'
                                    }`}
                                >
                                    <span>
                                        {!hasWordProblemSupport 
                                            ? (lang === 'sv' ? "Ej tillgänglig" : "N/A")
                                            : useWordProblems ? (lang === 'sv' ? "Aktiv" : "On") : (lang === 'sv' ? "Av" : "Off")}
                                    </span>
                                    <HelpCircle size={15} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 3. Priority Pre-Selected Levels (In This Part) */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-2">
                            <div className="flex items-center gap-2">
                                <Layers size={15} className="text-amber-600 dark:text-amber-400" />
                                <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-main)]">
                                    {lang === 'sv' ? "Förvalda områden i denna del" : "Topics in this part"}
                                </span>
                            </div>
                            <span className="text-[11px] font-bold font-mono text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                                {totalSelectedLevels} {lang === 'sv' ? "nivåer valda" : "levels selected"}
                            </span>
                        </div>

                        {Object.keys(defaultSelection).length === 0 ? (
                            <div className="p-6 rounded-xl border border-dashed border-[var(--border-strong)] text-center text-xs text-[var(--text-muted)] font-medium">
                                {lang === 'sv' ? "Inga övningsnivåer fanns i denna del ännu. Välj från listan nedan." : "No practice levels in this part yet. Expand the topics below."}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Object.keys(defaultSelection).map(tId => (
                                    <TopicLevelInspector
                                        key={tId}
                                        topicId={tId}
                                        lang={lang}
                                        selectedLevels={selection[tId]?.levels || []}
                                        isExpanded={!!expandedTopicDetails[tId]}
                                        onToggleExpand={() => toggleTopicDetails(tId)}
                                        onToggleLevel={toggleLevel}
                                        onToggleAllLevels={toggleAllTopicLevels}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 4. Curriculum Broad Expansion Drawer */}
                    <div className="pt-2 border-t border-[var(--border-main)]">
                        <button
                            type="button"
                            onClick={() => setShowAllCategories(!showAllCategories)}
                            className="flex items-center justify-between w-full p-3 rounded-xl bg-[var(--bg-surface)] text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer border border-[var(--border-main)]"
                        >
                            <span>{lang === 'sv' ? "+ Välj ytterligare ämnen från hela läroplanen" : "+ Add other topics from entire curriculum"}</span>
                            {showAllCategories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {showAllCategories && (
                            <div className="mt-3 space-y-4 max-h-80 overflow-y-auto custom-scrollbar p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-main)] animate-in fade-in duration-150">
                                <div className="relative">
                                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                    <input 
                                        type="text"
                                        value={curriculumSearch}
                                        onChange={(e) => setCurriculumSearch(e.target.value)}
                                        placeholder={lang === 'sv' ? "Sök bland alla moment..." : "Search all topics..."}
                                        className="w-full pl-9 pr-3 py-2 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-xl text-xs font-semibold text-[var(--text-main)] outline-none focus:border-amber-600"
                                    />
                                </div>

                                {filteredCategories.map(([catKey, category]) => (
                                    <div key={catKey} className="space-y-2.5">
                                        <h5 className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 border-b border-[var(--border-subtle)] pb-1">
                                            {category.label[lang] || catKey}
                                        </h5>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                            {category.topics
                                                .filter(tObj => !defaultSelection[tObj.id])
                                                .map(tObj => (
                                                    <TopicLevelInspector
                                                        key={tObj.id}
                                                        topicId={tObj.id}
                                                        lang={lang}
                                                        selectedLevels={selection[tObj.id]?.levels || []}
                                                        isExpanded={!!expandedTopicDetails[tObj.id]}
                                                        onToggleExpand={() => toggleTopicDetails(tObj.id)}
                                                        onToggleLevel={toggleLevel}
                                                        onToggleAllLevels={toggleAllTopicLevels}
                                                    />
                                                ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {/* 3. Modal Footer */}
                <div className="px-6 py-3.5 border-t border-[var(--border-main)] flex justify-end gap-2.5 bg-[var(--bg-surface)] shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl border border-[var(--border-strong)] text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
                    >
                        {lang === 'sv' ? "Avbryt" : "Cancel"}
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                        <Check size={15} strokeWidth={3} />
                        <span>{lang === 'sv' ? "Infoga Delprov" : "Insert Checkpoint"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}