// src/components/views/QuestionSummoner.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
    Search, X, Loader2, RefreshCcw, Type, Calculator, Zap, Plus, BookOpen, 
    Brain, Target, Image as ImageIcon, FileText as TextIcon 
} from 'lucide-react';
import { SKILL_BUCKETS, isTopicWordProblemReady } from '../../constants/skillBuckets.js';
import VisualRenderer from '../visuals/VisualRenderer';

// Lightweight Math Renderer for the Preview
const MathDisplay = ({ content, className = "" }) => {
    const containerRef = useRef(null);
    useEffect(() => {
        if (!content || !containerRef.current) return;
        const renderMath = () => {
            if (!containerRef.current) return;
            containerRef.current.innerText = content;
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
        };
        const timer = setTimeout(renderMath, 30);
        return () => clearTimeout(timer);
    }, [content]);
    return <div ref={containerRef} className={`math-content leading-relaxed whitespace-pre-wrap text-inherit ${className}`} />;
};

export default function QuestionSummoner({ 
    lang = 'sv', 
    targetMode = 'presentation', // 'presentation' | 'activity_four_corners' | 'activity'
    onClose, 
    onSummon 
}) {
    const t = {
        sv: {
            title: "Hämta Uppgifter",
            search_placeholder: "Sök område...",
            select_type: "Välj Typ",
            word_problems: "Problemlösning",
            no_wp_for_topic: "Inga textuppgifter finns för detta område",
            variation: "Variation",
            level: "Nivå",
            shuffle_numbers: "Slumpa Siffror",
            canvas: "Vanlig Tavla",
            instruction: "Genomgång",
            add_to_round: "Lägg till i omgången",
            in_queue: "I kön",
            type_visual: "Bild",
            type_calc: "Räkna",
            type_concept: "Begrepp",
            type_logic: "Felsök",
            type_text: "Text"
        },
        en: {
            title: "Summon Questions",
            search_placeholder: "Search topics...",
            select_type: "Select Type",
            word_problems: "Word Problems",
            no_wp_for_topic: "No word problems available for this topic",
            variation: "Variation",
            level: "Level",
            shuffle_numbers: "Shuffle Numbers",
            canvas: "Canvas",
            instruction: "Instruction",
            add_to_round: "Add to Round",
            in_queue: "In Queue",
            type_visual: "Image",
            type_calc: "Calculate",
            type_concept: "Concept",
            type_logic: "Logic",
            type_text: "Text"
        }
    }[lang] || {};

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTopicId, setSelectedTopicId] = useState('basic_arithmetic');
    const [selectedVariation, setSelectedVariation] = useState(null);
    
    const [previewData, setPreviewData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isWordProblem, setIsWordProblem] = useState(false);
    
    // Queue state to hold multiple questions
    const [queue, setQueue] = useState([]);

    const topicSupportsWordProblems = isTopicWordProblemReady(selectedTopicId);

    useEffect(() => {
        if (!topicSupportsWordProblems && isWordProblem) {
            setIsWordProblem(false);
        }
    }, [selectedTopicId, topicSupportsWordProblems, isWordProblem]);

    const allTopics = useMemo(() => {
        return Object.values(SKILL_BUCKETS).flatMap(cat => 
            Object.entries(cat.topics).map(([id, data]) => ({ 
                id, 
                categoryId: cat.id,
                categoryName: cat.name[lang] || cat.name.sv, 
                ...data 
            }))
        );
    }, [lang]);

    const currentTopic = allTopics.find(t => t.id === selectedTopicId) || allTopics[0];

    const getVariationCategory = (key) => {
        const k = key.toLowerCase();
        if (['graph', 'plot', 'geom', 'volume', 'shape', 'area', 'perimeter', 'angle', 'pattern', 'table', 'marbles', 'spinner', 'tree'].some(kw => k.includes(kw))) return 'visual';
        if (['calc', 'std', 'solve'].some(kw => k.includes(kw))) return 'calculate';
        if (['concept', 'theory', 'foundations', 'id', 'inverse'].some(kw => k.includes(kw))) return 'conceptual';
        if (['lie', 'spot', 'error', 'check'].some(kw => k.includes(kw))) return 'logic';
        return 'default';
    };

    const getCategoryStyles = (type) => {
        const styles = {
            visual: { border: 'border-sky-200 dark:border-sky-800', bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300', icon: <ImageIcon size={10} />, label: t.type_visual },
            calculate: { border: 'border-emerald-200 dark:border-emerald-800', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', icon: <Calculator size={10} />, label: t.type_calc },
            conceptual: { border: 'border-amber-200 dark:border-amber-800', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-800 dark:text-amber-300', icon: <Brain size={10} />, label: t.type_concept },
            logic: { border: 'border-rose-200 dark:border-rose-800', bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', icon: <Target size={10} />, label: t.type_logic },
            default: { border: 'border-[var(--border-main)]', bg: 'bg-[var(--bg-surface)]', text: 'text-[var(--text-muted)]', icon: <TextIcon size={10} />, label: t.type_text }
        };
        return styles[type] || styles.default;
    };

    const visibleVariations = useMemo(() => {
        if (!currentTopic?.variations) return [];
        return currentTopic.variations.filter(v => {
            if (isWordProblem) {
                return Boolean(v.tags?.includes('word_problem_ready'));
            }
            return true;
        });
    }, [currentTopic, isWordProblem]);

    const groupedVariations = useMemo(() => {
        const groups = {};
        visibleVariations.forEach(v => {
            const lvl = v.level || 1;
            if (!groups[lvl]) groups[lvl] = [];
            groups[lvl].push(v);
        });
        return Object.entries(groups).sort(([lvlA], [lvlB]) => Number(lvlA) - Number(lvlB));
    }, [visibleVariations]);

    useEffect(() => {
        const isStillValid = visibleVariations.some(v => v.key === selectedVariation?.key);
        if (!isStillValid) {
            setSelectedVariation(visibleVariations[0] || null);
        }
    }, [selectedTopicId, isWordProblem, visibleVariations]);

    useEffect(() => {
        if (!selectedTopicId || !selectedVariation) return;
        fetchPreview();
    }, [selectedVariation?.key, isWordProblem]);

    const fetchPreview = async () => {
        if (!selectedVariation) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/question?topic=${selectedTopicId}&variation=${selectedVariation.key}&lang=${lang}&wordProblem=${isWordProblem}`);
            const data = await res.json();
            setPreviewData(data);
        } catch (err) {
            console.error("Preview fetch failed", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToQueue = (layoutTarget = 'canvas') => {
        if (!previewData || !selectedVariation) return;
        
        const qId = crypto.randomUUID();
        const newItem = {
            id: qId,
            topicId: selectedTopicId,
            variationKey: selectedVariation.key,
            name: selectedVariation.name[lang] || selectedVariation.name.sv,
            columnSpan: 6,
            wordProblem: isWordProblem,
            resolvedData: {
                ...previewData,
                renderData: {
                    ...previewData.renderData,
                    isWordProblemApplied: isWordProblem
                }
            },
            instructionMode: isWordProblem ? 'inline' : 'header',
            showLatex: !isWordProblem,
            showVisual: true,
            showText: true,
            selectedStoryIndex: isWordProblem ? 0 : null,
            targetLayout: layoutTarget
        };
        
        setQueue(prev => [...prev, newItem]);
        fetchPreview();
    };

    const removeFromQueue = (id) => {
        setQueue(prev => prev.filter(q => q.id !== id));
    };

    const handleFinalSummon = () => {
        if (queue.length === 0) return;
        onSummon(queue);
    };

    const getFinalButtonLabel = () => {
        if (targetMode === 'activity_four_corners') {
            return lang === 'sv' 
                ? `Lägg till ${queue.length} st frågor till 4 Hörn` 
                : `Add ${queue.length} questions to 4 Corners`;
        }
        if (targetMode.startsWith('activity')) {
            return lang === 'sv' 
                ? `Lägg till ${queue.length} st frågor till aktiviteten` 
                : `Add ${queue.length} questions to activity`;
        }
        return lang === 'sv' 
            ? `Skapa ${queue.length} st slides` 
            : `Create ${queue.length} slides`;
    };

    return (
        <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150 select-none font-sans">
            <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-2xl w-full max-w-6xl h-[88vh] flex flex-col overflow-hidden text-[var(--text-main)] animate-in zoom-in-95 duration-150">
                
                {/* Header */}
                <header className="px-6 py-4 bg-[var(--bg-surface)] border-b border-[var(--border-main)] flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
                            <Zap size={18} />
                        </div>
                        <h2 className="text-base font-extrabold uppercase tracking-tight text-[var(--text-main)]">
                            {t.title}
                        </h2>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose} 
                        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] rounded-xl transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </header>

                <div className="flex flex-1 min-h-0 bg-[var(--bg-canvas)]">
                    
                    {/* COL 1: Grouped Categories & Topics */}
                    <div className="w-1/3 bg-[var(--bg-surface)] border-r border-[var(--border-main)] flex flex-col shrink-0 min-h-0">
                        <div className="p-3.5 border-b border-[var(--border-main)] bg-[var(--bg-card)]">
                            <div className="relative">
                                <Search className="absolute left-3.5 top-2.5 text-[var(--text-muted)]" size={15} />
                                <input 
                                    type="text" 
                                    placeholder={t.search_placeholder} 
                                    className="w-full pl-9 pr-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-main)] text-[var(--text-main)] rounded-xl text-xs font-semibold outline-none focus:border-emerald-600 transition-colors shadow-inner" 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3.5 space-y-4 custom-scrollbar">
                            {Object.values(SKILL_BUCKETS).map(cat => {
                                const matchingTopics = Object.entries(cat.topics).filter(([id, data]) => {
                                    if (!searchTerm.trim()) return true;
                                    const term = searchTerm.toLowerCase();
                                    const topicName = (data.name[lang] || data.name.sv || '').toLowerCase();
                                    const catName = (cat.name[lang] || cat.name.sv || '').toLowerCase();
                                    return topicName.includes(term) || catName.includes(term);
                                });

                                if (matchingTopics.length === 0) return null;

                                return (
                                    <div key={cat.id} className="space-y-1">
                                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 px-2.5 py-1">
                                            {cat.name[lang] || cat.name.sv}
                                        </h3>
                                        <div className="space-y-0.5">
                                            {matchingTopics.map(([id, data]) => {
                                                const isSelected = selectedTopicId === id;
                                                return (
                                                    <button 
                                                        type="button"
                                                        key={id} 
                                                        onClick={() => setSelectedTopicId(id)} 
                                                        className={`w-full text-left px-3 py-2 text-xs rounded-xl transition-colors cursor-pointer font-semibold ${
                                                            isSelected 
                                                                ? 'bg-emerald-600 text-white font-bold shadow-2xs' 
                                                                : 'text-[var(--text-main)] hover:bg-[var(--bg-card)]'
                                                        }`}
                                                    >
                                                        {data.name[lang] || data.name.sv}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* COL 2: Variations Sorted by Level with WP Toggle */}
                    <div className="w-1/3 bg-[var(--bg-card)] border-r border-[var(--border-main)] flex flex-col shrink-0 min-h-0">
                        {/* Pane 2 Subheader with WP Toggle */}
                        <div className="p-3.5 border-b border-[var(--border-main)] bg-[var(--bg-surface)] shrink-0 space-y-2.5">
                            <h3 className="text-xs font-extrabold uppercase text-[var(--text-main)] italic truncate">
                                {currentTopic?.name[lang] || currentTopic?.name.sv}
                            </h3>

                            {/* Word Problem Filter Toggle */}
                            <div className={`flex items-center justify-between bg-[var(--bg-card)] p-2 rounded-xl border transition-opacity ${
                                topicSupportsWordProblems 
                                    ? 'border-[var(--border-main)]' 
                                    : 'border-[var(--border-subtle)] opacity-40'
                            }`}>
                                <span className="text-[10px] font-bold uppercase text-[var(--text-main)] ml-1 tracking-tight">
                                    {t.word_problems}
                                </span>
                                <button 
                                    type="button"
                                    disabled={!topicSupportsWordProblems}
                                    onClick={() => setIsWordProblem(!isWordProblem)} 
                                    className={`w-8 h-4 rounded-full transition-all relative p-0.5 ${
                                        !topicSupportsWordProblems 
                                            ? 'cursor-not-allowed bg-[var(--border-strong)]' 
                                            : isWordProblem 
                                                ? 'cursor-pointer bg-emerald-600' 
                                                : 'cursor-pointer bg-[var(--border-strong)]'
                                    }`}
                                    title={!topicSupportsWordProblems ? t.no_wp_for_topic : ""}
                                >
                                    <div className={`w-3 h-3 bg-white rounded-full transition-all shadow-2xs ${
                                        isWordProblem ? 'translate-x-4' : 'translate-x-0'
                                    }`} />
                                </button>
                            </div>
                        </div>

                        {/* Grouped Level List */}
                        <div className="flex-1 overflow-y-auto p-3.5 space-y-4 custom-scrollbar min-h-0 bg-[var(--bg-canvas)]">
                            {groupedVariations.length === 0 ? (
                                <div className="text-center py-8 text-xs font-bold text-[var(--text-muted)] italic">
                                    {t.no_wp_for_topic}
                                </div>
                            ) : (
                                groupedVariations.map(([lvl, variations]) => (
                                    <div key={lvl} className="space-y-2">
                                        <div className="sticky top-0 bg-[var(--bg-canvas)]/95 backdrop-blur-xs py-1 flex items-center z-10 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-mono">
                                            <span>{t.level} {lvl}</span>
                                            <div className="flex-1 h-px bg-[var(--border-main)] ml-2 rounded-full" />
                                        </div>

                                        <div className="space-y-2">
                                            {variations.map(v => {
                                                const isSelected = selectedVariation?.key === v.key;
                                                const cat = getVariationCategory(v.key);
                                                const styles = getCategoryStyles(cat);

                                                return (
                                                    <div 
                                                        key={v.key} 
                                                        onClick={() => setSelectedVariation(v)}
                                                        className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                                                            isSelected 
                                                                ? 'bg-[var(--bg-card)] border-emerald-600 shadow-2xs ring-1 ring-emerald-600' 
                                                                : 'bg-[var(--bg-card)] border-[var(--border-main)] hover:border-[var(--border-strong)] shadow-2xs'
                                                        }`}
                                                    >
                                                        <div className={`absolute top-0 left-0 bottom-0 w-1 ${styles.bg}`} />
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className="font-bold text-xs uppercase tracking-tight text-[var(--text-main)] leading-tight pr-2">
                                                                {v.name[lang] || v.name.sv}
                                                            </h4>
                                                            <span className={`shrink-0 px-1.5 py-0.5 rounded border ${styles.border} ${styles.bg} ${styles.text} text-[8px] font-bold uppercase flex items-center gap-0.5 font-mono`}>
                                                                {styles.icon} {styles.label}
                                                            </span>
                                                        </div>
                                                        
                                                        {v.desc && (
                                                            <p className="text-[11px] font-medium text-[var(--text-muted)] line-clamp-1 italic leading-tight">
                                                                {v.desc[lang] || v.desc.sv}
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* COL 3: Preview & Actions */}
                    <div className="flex-1 min-w-[33%] flex flex-col bg-[var(--bg-card)] relative overflow-hidden min-h-0">
                        <div className="flex-1 overflow-y-auto p-5 flex flex-col items-stretch justify-center custom-scrollbar">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-full">
                                    <Loader2 className="animate-spin text-emerald-600" size={36} />
                                </div>
                            ) : previewData ? (
                                <div 
                                    className="whiteboard-protect w-full flex flex-col items-center bg-[var(--bg-card)] rounded-xl p-5 border border-[var(--border-main)] shadow-2xs animate-in zoom-in-95 duration-150"
                                    style={{ colorScheme: 'light', color: 'var(--text-main)' }}
                                >
                                    <div className="empty:hidden flex justify-center scale-95 origin-top mt-1 w-full">
                                        <VisualRenderer 
                                            data={previewData?.renderData} 
                                            isWordProblem={isWordProblem} 
                                        />
                                    </div>
                                    
                                    {previewData.renderData.description && (
                                        <div className="text-xs sm:text-sm text-[var(--text-main)] font-bold text-center px-4 leading-relaxed my-2">
                                            <MathDisplay content={previewData.renderData.description} />
                                        </div>
                                    )}

                                    {/* LaTeX Math Box */}
                                    {previewData.renderData.latex && !isWordProblem && (
                                        <div className="text-2xl text-[var(--text-main)] bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-main)] shadow-inner text-center font-serif my-2 w-full max-w-md overflow-x-auto">
                                            <MathDisplay content={`$$${previewData.renderData.latex}$$`} />
                                        </div>
                                    )}

                                    {/* Multiple Choice Preview */}
                                    {previewData.renderData.options && previewData.renderData.options.length > 0 && (
                                        <div className="mt-2 grid grid-cols-2 gap-2 w-full max-w-md px-1 shrink-0">
                                            {previewData.renderData.options.map((opt, oIdx) => {
                                                const choiceLabel = typeof opt === 'object' ? (opt.label || opt.text || '') : opt;
                                                return (
                                                    <div key={oIdx} className="flex items-center justify-center gap-2 p-2 rounded-xl border border-[var(--border-main)] bg-[var(--bg-surface)] text-xs">
                                                        <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                                                            {['A','B','C','D','E','F'][oIdx]}
                                                        </span>
                                                        <MathDisplay content={String(choiceLabel)} className="font-semibold text-[var(--text-main)]" />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>

                        {/* Active Queue Panel */}
                        {queue.length > 0 && (
                            <div className="max-h-36 bg-[var(--bg-surface)] border-t border-[var(--border-main)] p-3 overflow-y-auto custom-scrollbar flex flex-col gap-1.5 shrink-0">
                                <div className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider px-1">
                                    {t.in_queue} ({queue.length})
                                </div>
                                {queue.map((q, i) => (
                                    <div key={q.id} className="flex items-center justify-between bg-[var(--bg-card)] border border-[var(--border-main)] px-3 py-1.5 rounded-xl shadow-2xs">
                                        <div className="flex items-center gap-2.5 overflow-hidden">
                                            <span className="w-5 h-5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg flex items-center justify-center text-[10px] font-bold font-mono shrink-0 border border-emerald-200 dark:border-emerald-800">
                                                {i + 1}
                                            </span>
                                            <span className="text-xs font-semibold text-[var(--text-main)] truncate">
                                                {q.name}
                                            </span>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => removeFromQueue(q.id)} 
                                            className="p-1 text-[var(--text-muted)] hover:text-rose-600 rounded-lg cursor-pointer"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Control Panel Footer */}
                        <div className="p-4 border-t border-[var(--border-main)] bg-[var(--bg-surface)] space-y-2 shrink-0">
                            <button 
                                type="button"
                                onClick={fetchPreview}
                                className="w-full py-2 bg-[var(--bg-card)] border border-[var(--border-strong)] text-[var(--text-main)] hover:border-emerald-600 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                            >
                                <RefreshCcw size={13} /> {t.shuffle_numbers}
                            </button>
                            
                            {/* Adaptive Queue Buttons */}
                            {targetMode === 'presentation' ? (
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        type="button"
                                        onClick={() => handleAddToQueue('canvas')}
                                        disabled={isLoading || !previewData}
                                        className="py-2 bg-[var(--bg-card)] text-[var(--text-main)] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all border border-[var(--border-strong)] hover:border-emerald-600 cursor-pointer disabled:opacity-50 shadow-2xs"
                                    >
                                        <Plus size={14} /> {t.canvas}
                                    </button>

                                    <button 
                                        type="button"
                                        onClick={() => handleAddToQueue('instruction_template')}
                                        disabled={isLoading || !previewData}
                                        className="py-2 bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-strong)] hover:border-emerald-600 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
                                    >
                                        <BookOpen size={14} /> {t.instruction}
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    type="button"
                                    onClick={() => handleAddToQueue('activity')}
                                    disabled={isLoading || !previewData}
                                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                                >
                                    <Plus size={14} /> {t.add_to_round}
                                </button>
                            )}

                            {/* Final Submission Button */}
                            <button 
                                type="button"
                                onClick={handleFinalSummon} 
                                disabled={queue.length === 0}
                                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                            >
                                <Zap size={14} /> {getFinalButtonLabel()}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}