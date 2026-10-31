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

    // 🟢 1. Check if current topic supports word problems
    const topicSupportsWordProblems = isTopicWordProblemReady(selectedTopicId);

    // Auto-disable word problem toggle if topic doesn't support them
    useEffect(() => {
        if (!topicSupportsWordProblems && isWordProblem) {
            setIsWordProblem(false);
        }
    }, [selectedTopicId, topicSupportsWordProblems, isWordProblem]);

    // Flatten all topics for searching & matching
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

    // Helper functions for categorization styling matching QuestionStudio
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
            visual: { border: 'border-indigo-200 dark:border-indigo-800', bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-600 dark:text-indigo-400', icon: <ImageIcon size={10} />, label: t.type_visual },
            calculate: { border: 'border-emerald-200 dark:border-emerald-800', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400', icon: <Calculator size={10} />, label: t.type_calc },
            conceptual: { border: 'border-amber-200 dark:border-amber-800', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400', icon: <Brain size={10} />, label: t.type_concept },
            logic: { border: 'border-rose-200 dark:border-rose-800', bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-600 dark:text-rose-400', icon: <Target size={10} />, label: t.type_logic },
            default: { border: 'border-slate-200 dark:border-slate-800', bg: 'bg-slate-50 dark:bg-slate-900', text: 'text-slate-500', icon: <TextIcon size={10} />, label: t.type_text }
        };
        return styles[type] || styles.default;
    };

    // 🟢 2. Filter variations by word-problem compatibility
    const visibleVariations = useMemo(() => {
        if (!currentTopic?.variations) return [];
        return currentTopic.variations.filter(v => {
            if (isWordProblem) {
                return Boolean(v.tags?.includes('word_problem_ready'));
            }
            return true;
        });
    }, [currentTopic, isWordProblem]);

    // 🟢 3. Group variations by Level
    const groupedVariations = useMemo(() => {
        const groups = {};
        visibleVariations.forEach(v => {
            const lvl = v.level || 1;
            if (!groups[lvl]) groups[lvl] = [];
            groups[lvl].push(v);
        });
        return Object.entries(groups).sort(([lvlA], [lvlB]) => Number(lvlA) - Number(lvlB));
    }, [visibleVariations]);

    // Auto-select first visible variation when topic or filter changes
    useEffect(() => {
        const isStillValid = visibleVariations.some(v => v.key === selectedVariation?.key);
        if (!isStillValid) {
            setSelectedVariation(visibleVariations[0] || null);
        }
    }, [selectedTopicId, isWordProblem, visibleVariations]);

    // Fetch Preview when variation changes
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
        <div className="fixed inset-0 z-[600] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200 select-none">
            <div className="bg-[#f9fbf7] dark:bg-slate-950 w-full max-w-6xl h-[88vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                
                {/* Header */}
                <header className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-xl">
                            <Zap size={20} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h2 className="text-base font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
                            {t.title}
                        </h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 text-slate-400 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/50 rounded-full transition-colors cursor-pointer"
                    >
                        <X size={22} />
                    </button>
                </header>

                <div className="flex flex-1 min-h-0">
                    
                    {/* 🟢 COL 1: Grouped Categories & Topics */}
                    <div className="w-1/3 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 min-h-0">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                <input 
                                    type="text" 
                                    placeholder={t.search_placeholder} 
                                    className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
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
                                    <div key={cat.id} className="space-y-1.5">
                                        <h3 className="text-[11px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400 px-2 py-0.5">
                                            {cat.name[lang] || cat.name.sv}
                                        </h3>
                                        <div className="space-y-1">
                                            {matchingTopics.map(([id, data]) => {
                                                const isSelected = selectedTopicId === id;
                                                return (
                                                    <button 
                                                        key={id} 
                                                        onClick={() => setSelectedTopicId(id)} 
                                                        className={`w-full text-left px-3 py-2 text-xs rounded-xl transition-all cursor-pointer ${
                                                            isSelected 
                                                                ? 'bg-indigo-600 text-white font-black shadow-sm' 
                                                                : 'text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800'
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

                    {/* 🟢 COL 2: Variations Sorted by Level with WP Toggle */}
                    <div className="w-1/3 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 min-h-0">
                        {/* Pane 2 Subheader with WP Toggle */}
                        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 space-y-2">
                            <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 italic truncate">
                                {currentTopic?.name[lang] || currentTopic?.name.sv}
                            </h3>

                            {/* Word Problem Filter Toggle matching QuestionStudio */}
                            <div className={`flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-xl border transition-opacity ${
                                topicSupportsWordProblems 
                                    ? 'border-slate-200 dark:border-slate-700' 
                                    : 'border-slate-200 dark:border-slate-800 opacity-40'
                            }`}>
                                <span className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-300 ml-1.5 tracking-tight">
                                    {t.word_problems}
                                </span>
                                <button 
                                    disabled={!topicSupportsWordProblems}
                                    onClick={() => setIsWordProblem(!isWordProblem)} 
                                    className={`w-8 h-4 rounded-full transition-all relative p-0.5 ${
                                        !topicSupportsWordProblems 
                                            ? 'cursor-not-allowed bg-slate-200 dark:bg-slate-700' 
                                            : isWordProblem 
                                                ? 'cursor-pointer bg-emerald-600' 
                                                : 'cursor-pointer bg-slate-300 dark:bg-slate-600'
                                    }`}
                                    title={!topicSupportsWordProblems ? t.no_wp_for_topic : ""}
                                >
                                    <div className={`w-3 h-3 bg-white rounded-full transition-all shadow-sm ${
                                        isWordProblem ? 'translate-x-4' : 'translate-x-0'
                                    }`} />
                                </button>
                            </div>
                        </div>

                        {/* Grouped Level List */}
                        <div className="flex-1 overflow-y-auto p-3.5 space-y-4 custom-scrollbar min-h-0">
                            {groupedVariations.length === 0 ? (
                                <div className="text-center py-8 text-xs font-bold text-slate-400 italic">
                                    {t.no_wp_for_topic}
                                </div>
                            ) : (
                                groupedVariations.map(([lvl, variations]) => (
                                    <div key={lvl} className="space-y-2">
                                        <div className="sticky top-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-xs pt-1 pb-1 flex items-center z-10">
                                            <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                                {t.level} {lvl}
                                            </span>
                                            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700 ml-2 rounded-full" />
                                        </div>

                                        {variations.map(v => {
                                            const isSelected = selectedVariation?.key === v.key;
                                            const cat = getVariationCategory(v.key);
                                            const styles = getCategoryStyles(cat);

                                            return (
                                                <div 
                                                    key={v.key} 
                                                    onClick={() => setSelectedVariation(v)}
                                                    className={`p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                                                        isSelected 
                                                            ? 'bg-white dark:bg-slate-800 border-indigo-500 shadow-md ring-2 ring-indigo-500/10' 
                                                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 shadow-xs'
                                                    }`}
                                                >
                                                    <div className={`absolute top-0 left-0 bottom-0 w-1 ${styles.bg}`} />
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="font-black text-[11px] uppercase tracking-tight text-slate-800 dark:text-slate-100 leading-tight pr-2">
                                                            {v.name[lang] || v.name.sv}
                                                        </h4>
                                                        <div className={`shrink-0 px-1.5 py-0.5 rounded border ${styles.border} ${styles.bg} ${styles.text} text-[8px] font-black uppercase flex items-center gap-0.5`}>
                                                            {styles.icon} {styles.label}
                                                        </div>
                                                    </div>
                                                    
                                                    {v.desc && (
                                                        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 line-clamp-1 italic leading-tight">
                                                            {v.desc[lang] || v.desc.sv}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* COL 3: Preview & Actions */}
                    <div className="flex-1 min-w-[33%] flex flex-col bg-white dark:bg-slate-900 relative overflow-hidden min-h-0">
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-stretch justify-center custom-scrollbar">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-full">
                                    <Loader2 className="animate-spin text-indigo-600" size={40} />
                                </div>
                            ) : previewData ? (
                                <div className="w-full flex flex-col items-center animate-in zoom-in-95 duration-200">
                                    <div className="flex justify-center scale-95 origin-top mt-1 w-full">
                                        <VisualRenderer 
                                            data={previewData?.renderData} 
                                            isWordProblem={isWordProblem} 
                                        />
                                    </div>
                                    
                                    {previewData.renderData.description && (
                                        <div className="text-base text-slate-800 dark:text-slate-100 font-bold text-center px-4 leading-relaxed my-2">
                                            <MathDisplay content={previewData.renderData.description} />
                                        </div>
                                    )}

                                    {/* LaTeX Math Box */}
                                    {previewData.renderData.latex && !isWordProblem && (
                                        <div className="text-3xl text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 p-6 rounded-3xl border-2 border-indigo-100 dark:border-indigo-900 shadow-inner text-center font-serif my-3 w-full max-w-md overflow-x-auto">
                                            <MathDisplay content={`$$${previewData.renderData.latex}$$`} />
                                        </div>
                                    )}

                                    {/* Multiple Choice Preview */}
                                    {previewData.renderData.options && previewData.renderData.options.length > 0 && (
                                        <div className="mt-2 grid grid-cols-2 gap-2.5 w-full max-w-md px-2 shrink-0">
                                            {previewData.renderData.options.map((opt, oIdx) => {
                                                const choiceLabel = typeof opt === 'object' ? (opt.label || opt.text || '') : opt;
                                                return (
                                                    <div key={oIdx} className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs">
                                                        <span className="font-black text-indigo-500">
                                                            {['A','B','C','D','E','F'][oIdx]}
                                                        </span>
                                                        <MathDisplay content={String(choiceLabel)} className="font-bold text-slate-700 dark:text-slate-200" />
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
                            <div className="max-h-40 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 p-3 overflow-y-auto custom-scrollbar flex flex-col gap-1.5 shrink-0">
                                <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-1">
                                    {t.in_queue} ({queue.length})
                                </div>
                                {queue.map((q, i) => (
                                    <div key={q.id} className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl shadow-2xs">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <span className="w-5 h-5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-md flex items-center justify-center text-[10px] font-black shrink-0">
                                                {i + 1}
                                            </span>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                                                {q.name}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => removeFromQueue(q.id)} 
                                            className="p-1 text-slate-400 hover:text-rose-500 rounded-md cursor-pointer"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Control Panel Footer */}
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 shrink-0">
                            <button 
                                onClick={fetchPreview}
                                className="w-full py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-300 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                            >
                                <RefreshCcw size={13} /> {t.shuffle_numbers}
                            </button>
                            
                            {/* Adaptive Queue Buttons */}
                            {targetMode === 'presentation' ? (
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => handleAddToQueue('canvas')}
                                        disabled={isLoading || !previewData}
                                        className="py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer disabled:opacity-50"
                                    >
                                        <Plus size={14} /> {t.canvas}
                                    </button>

                                    <button 
                                        onClick={() => handleAddToQueue('instruction_template')}
                                        disabled={isLoading || !previewData}
                                        className="py-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                                    >
                                        <BookOpen size={14} /> {t.instruction}
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => handleAddToQueue('activity')}
                                    disabled={isLoading || !previewData}
                                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                                >
                                    <Plus size={15} /> {t.add_to_round}
                                </button>
                            )}

                            {/* Final Submission Button */}
                            <button 
                                onClick={handleFinalSummon} 
                                disabled={queue.length === 0}
                                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                            >
                                <Zap size={15} /> {getFinalButtonLabel()}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}