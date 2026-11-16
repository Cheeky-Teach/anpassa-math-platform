// src/components/live/teacher/views/DoNowGrid.jsx
import React, { useState, useEffect, useRef } from 'react';
import VisualRenderer from '../visuals/VisualRenderer';
import { syncProgress, syncBatchProgress } from '../../lib/progressSync';
import { 
    X, Maximize, Minimize, ZoomIn, ZoomOut, RefreshCw, 
    Eye, EyeOff, Loader2, Play, Pause, RotateCcw, ChevronUp, ChevronDown,
    Shuffle, Calculator, Type as TextIcon, RefreshCcw
} from 'lucide-react';
import PreferencesToggle from '../ui/PreferencesToggle';


const MathDisplay = ({ content, className = "" }) => {
    const containerRef = useRef(null);
    useEffect(() => {
        if (!content || !containerRef.current) return;
        const renderMath = () => {
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
    return <div ref={containerRef} className={`math-container ${className}`} />;
};

// Resolves and compiles contextual placeholders dynamically
const compileAnchoredStory = (item, lang = 'sv') => {
    const rd = item?.resolvedData?.renderData;
    if (item?.selectedStoryIndex === undefined || item?.selectedStoryIndex === null || !rd?.availableStories) {
        return rd?.description || item?.name || "";
    }
    const storyPackage = rd.availableStories[item.selectedStoryIndex];
    if (!storyPackage) return rd?.description || item?.name || "";

    let template = storyPackage[lang === 'en' ? 'en' : 'sv'];
    let params = rd.extractedParams;

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            template = template.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value).replace(/[()]/g, ''));
        });
    }

    // Append instructional suffixes safely matching WordProblemInterceptor parameters
    if (item.variationKey === 'apply_factor_inc' || item.variationKey === 'apply_factor_dec') {
        template += lang === 'en' ? " Calculate the new value." : " Beräkna det nya värdet.";
    } else if (item.variationKey === 'find_original_inc' || item.variationKey === 'find_original_dec') {
        template += lang === 'en' ? " Calculate the original value." : " Beräkna det ursprungliga värdet.";
    } else if (item.variationKey === 'sequential_factors') {
        template += lang === 'en' ? " Calculate the total combined change factor." : " Beräkna den totala förändringsfaktorn.";
    } else if (item.topicId === 'equations' || item.topicId === 'equations_word') {
        template += lang === 'en' ? " Calculate the value of x." : " Beräkna värdet på x.";
    }
    return template;
};


const TEXT_SIZES = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl'];

const DoNowCard = ({ index, q, showAnswer, onToggleAnswer, onRefreshNumbers, onRefreshStory, onFocus, lang, textSizeClass, isFocused = false }) => {
    // SECURITY: Updated answer retrieval to handle scrubbed payloads
    const getFinalAnswer = () => {
        const rd = q?.resolvedData;
        if (!rd) return "---";

        if (rd.answer && rd.answer !== "Se lösning") return rd.answer;
        
        if (rd.token) {
            try {
                return atob(rd.token);
            } catch (e) {
                return "---";
            }
        }
        
        return "---";
    };
    
    const [visualScale, setVisualScale] = useState(1);

    const adjustZoom = (e, delta) => {
        e.stopPropagation();
        setVisualScale(prev => Math.max(0.5, Math.min(prev + delta, 4.0)));
    };

    const data = q?.resolvedData?.renderData;

    const isWordProblemApplied = 
        (q?.selectedStoryIndex !== null && q?.selectedStoryIndex !== undefined) || 
        !!q?.resolvedData?.metadata?.isWordProblemApplied || 
        !!q?.resolvedData?.renderData?.isWordProblemApplied;    
        
    if (!data) {
        return (
            <div className="whiteboard-protect h-full w-full rounded-2xl border border-slate-200 bg-white text-slate-900 flex flex-col items-center justify-center gap-3 shadow-2xs">
                <Loader2 className="animate-spin text-emerald-600" size={32} />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Laddar...</span>
            </div>
        );
    }

    const hasVisual = data && (
        data.graph || data.geometry || data.pattern || data.tree || 
        data.marbles || data.spinner || data.freqTable || data.percentGrid || 
        data.scale || data.similarity || data.compareArea || data.volume || data.angles
    );

    return (
        <div 
            onClick={onFocus}
            className={`whiteboard-protect relative rounded-2xl border transition-all flex flex-col overflow-hidden h-full select-none shadow-2xs group bg-white text-slate-900
            ${isFocused ? 'border-emerald-600 shadow-2xl' : 'border-slate-200 hover:border-emerald-600 cursor-zoom-in'}
            ${showAnswer && !isFocused ? 'border-emerald-500 ring-2 ring-emerald-500/20' : ''}`}
        >
            {/* Card Header */}
            <div className={`px-4 py-2 flex justify-between items-center border-b transition-colors ${showAnswer && !isFocused ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-xs font-bold uppercase tracking-wider font-mono ${showAnswer && !isFocused ? 'text-emerald-900' : 'text-slate-900'}`}>
                    {lang === 'sv' ? 'Uppgift' : 'Task'} {index + 1}
                </span>
                {visualScale !== 1 && (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                        {Math.round(visualScale * 100)}%
                    </span>
                )}
                {q.topicId && (
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 font-mono">
                        {q.topicId.split('_')[0]}
                    </span>
                )}
            </div>

            {/* Protected White Question Body */}
            <div className={`flex-1 flex flex-col items-center text-center relative overflow-hidden transition-all duration-300 bg-white text-slate-900
                ${isFocused ? 'p-10' : 'p-4'}`}>
                
                {hasVisual && !isWordProblemApplied && (
                    <div 
                        className="w-full flex justify-center items-center shrink-0 overflow-hidden mb-2 border border-slate-200 rounded-xl bg-white shadow-inner"
                        style={{ height: isFocused ? '440px' : '220px' }}
                    >
                        <div style={{ 
                            width: isFocused ? '600px' : '300px',
                            height: isFocused ? '420px' : '220px',
                            transform: `scale(${visualScale}) translate(${-15 * (visualScale - 1)}%, ${-2 * (visualScale - 1)}%)`, 
                            transition: 'transform 0.3s cubic-bezier(0.2, 0, 0.2, 1)', 
                            transformOrigin: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <VisualRenderer 
                                data={data} 
                                width={isFocused ? 600 : 300} 
                                height={isFocused ? 320 : 150} 
                                isWordProblem={isWordProblemApplied}
                            />
                        </div>
                    </div>
                )}
                
                <div className={`font-bold text-black [&_.katex]:text-black leading-relaxed ${textSizeClass} flex-1 flex flex-col justify-center items-center transition-all w-full
                    ${isFocused ? 'px-8 pb-4' : 'px-1'}`}>
                    <MathDisplay content={compileAnchoredStory(q, lang)} className="text-black [&_.katex]:text-black" />

                    {data?.latex && !isWordProblemApplied && (
                        <div className={`text-black [&_.katex]:text-black font-serif ${isFocused ? 'mt-4 text-5xl' : 'mt-2 text-2xl sm:text-3xl'}`}>
                            <MathDisplay content={`$$${data.latex}$$`} className="text-black [&_.katex]:text-black" />
                        </div>
                    )}
                </div>

                {data?.options && data.options.length > 0 && (
                    <div className={`grid grid-cols-2 gap-2.5 w-full shrink-0 ${isFocused ? 'mt-6 max-w-4xl pb-4' : 'mt-2'}`}>
                        {data.options.map((opt, idx) => {
                            const choiceLabel = typeof opt === 'object' ? opt.label : opt;
                            return (
                                <div key={idx} className={`bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5 shadow-2xs text-black [&_.katex]:text-black
                                    ${isFocused ? 'p-6 text-4xl' : `p-2.5 ${textSizeClass} font-bold text-left`}`}>
                                    <span className="w-6 h-6 shrink-0 bg-white text-slate-600 border border-slate-200 rounded-lg flex items-center justify-center text-[10px] font-bold font-mono">
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                    <MathDisplay className="truncate text-black [&_.katex]:text-black" content={choiceLabel} />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ACTION OVERLAY */}
            <div className={`absolute top-12 right-3 flex flex-col gap-2 transition-opacity duration-150 
                ${isFocused ? 'opacity-100 z-50' : 'opacity-0 group-hover:opacity-100'}`}>
                
                {!isFocused && (
                    <div className="flex flex-col gap-1.5 animate-in fade-in duration-150">
                        <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onRefreshNumbers(); }}
                            className="w-8 h-8 rounded-xl flex flex-col items-center justify-center bg-white text-slate-600 border border-slate-200 hover:text-emerald-600 hover:bg-slate-50 shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
                            title={lang === 'sv' ? "Slumpa tal (Behåll text)" : "Shuffle numbers"}
                        >
                            <Calculator size={13} />
                        </button>

                        {q.selectedStoryIndex !== null && q.selectedStoryIndex !== undefined && data?.availableStories && data.availableStories.length > 1 && (
                            <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onRefreshStory(); }}
                                className="w-8 h-8 rounded-xl flex flex-col items-center justify-center bg-white text-slate-600 border border-slate-200 hover:text-amber-600 hover:bg-slate-50 shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
                                title={lang === 'sv' ? "Slumpa textberättelse" : "Shuffle story text"}
                            >
                                <Shuffle size={13} />
                            </button>
                        )}
                    </div>
                )}
                
                <button 
                    type="button"
                    onClick={(e) => adjustZoom(e, 0.2)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center bg-white text-emerald-600 border border-slate-200 hover:bg-slate-50 shadow-2xs cursor-pointer"
                    title="Zoom In"
                >
                    <ZoomIn size={14} />
                </button>
                <button 
                    type="button"
                    onClick={(e) => adjustZoom(e, -0.2)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center bg-white text-emerald-600 border border-slate-200 hover:bg-slate-50 shadow-2xs cursor-pointer"
                    title="Zoom Out"
                >
                    <ZoomOut size={14} />
                </button>

                {visualScale !== 1 && (
                    <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setVisualScale(1); }}
                        className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-600 text-white shadow-2xs active:scale-[0.98] cursor-pointer"
                        title="Reset Zoom"
                    >
                        <RotateCcw size={12} />
                    </button>
                )}

                <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onToggleAnswer(); }}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-2xs transition-all cursor-pointer border ${
                        showAnswer ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:text-emerald-600'
                    }`}
                    title={showAnswer ? "Hide Answer" : "Show Answer"}
                >
                    {showAnswer ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
            </div>

            {showAnswer && (
                <div className="bg-emerald-600 text-white py-3 text-center shrink-0 animate-in slide-in-from-bottom duration-150 shadow-2xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-85 font-mono">FACIT</div>
                    <div className={`${isFocused ? 'text-6xl' : 'text-3xl'} font-extrabold tracking-tight font-serif text-white [&_.katex]:text-white`}>
                        <MathDisplay content={getFinalAnswer()} className="text-white [&_.katex]:text-white" />
                        {data?.suffix && <span className="ml-1 text-sm opacity-95">{data.suffix}</span>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function DoNowGrid({ questions, ui, onBack, onClose, lang }) {
    const [gridQuestions, setGridQuestions] = useState(questions || []);
    const [revealed, setRevealed] = useState({});
    const [focusedIndex, setFocusedIndex] = useState(null);
    const [showAll, setShowAll] = useState(false);
    const [isShuffleDropdownOpen, setIsShuffleDropdownOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [textSizeIndex, setTextSizeIndex] = useState(3);
    const [isGlobalRefreshing, setIsGlobalRefreshing] = useState(false);

    // --- TIMER STATE ---
    const [timerSeconds, setTimerSeconds] = useState(300);
    const [timeLeft, setTimeLeft] = useState(300);
    const [isTimerActive, setIsTimerActive] = useState(false);

    useEffect(() => {
        setGridQuestions(questions);
        
        if (questions && questions.length > 0) {
            syncBatchProgress('donow_session_started', questions, {
                app_mode: 'teacher_live',
                initial_timer_seconds: timerSeconds
            });
        }
    }, [questions]);

    useEffect(() => {
        let interval = null;
        if (isTimerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsTimerActive(false);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isTimerActive, timeLeft]);

    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') setFocusedIndex(null); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(e => console.error(e));
        } else {
            if (document.exitFullscreen) document.exitFullscreen().then(() => setIsFullscreen(false));
        }
    };

    const handleSafeExit = (callback) => {
        if (document.fullscreenElement) document.exitFullscreen().finally(() => callback());
        else callback();
    };

    const toggleOne = (i) => setRevealed(prev => ({ ...prev, [i]: !prev[i] }));
    const toggleAll = () => {
        if (showAll) setRevealed({});
        else {
            const all = {};
            questions.forEach((_, i) => all[i] = true);
            setRevealed(all);
        }
        setShowAll(!showAll);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const adjustTimer = (amount) => {
        const newTime = Math.max(0, timerSeconds + amount);
        setTimerSeconds(newTime);
        setTimeLeft(newTime);
    };

    const handleRefreshNumbers = async (i) => {
        const item = gridQuestions[i];
        if (!item) return;
        
        syncProgress('donow_question_regenerated', {
            app_mode: 'teacher_live',
            topic: item.topicId || 'unknown',
            level: item.resolvedData?.level || 1,
            shuffle_type: 'numbers'
        });
        
        try {
            const isItemWordProblem = item.selectedStoryIndex !== null && item.selectedStoryIndex !== undefined;
            const res = await fetch(`/api/question?topic=${item.topicId}&variation=${item.variationKey}&lang=${lang}&wordProblem=${isItemWordProblem}`);
            const data = await res.json();

            setGridQuestions(prev => prev.map((q, idx) => idx === i ? {
                ...q,
                resolvedData: data,
                selectedStoryIndex: isItemWordProblem ? q.selectedStoryIndex : null
            } : q));
            setRevealed(prev => ({ ...prev, [i]: false }));
        } catch (err) { console.error("Individual number refresh failed:", err); }
    };

    const handleRefreshStory = (i) => {
        const item = gridQuestions[i];
        const rd = item?.resolvedData?.renderData;
        if (!rd?.availableStories || rd.availableStories.length <= 1) return;

        syncProgress('donow_question_regenerated', {
            app_mode: 'teacher_live',
            topic: item.topicId || 'unknown',
            level: item.resolvedData?.level || 1,
            shuffle_type: 'stories'
        });

        const totalStories = rd.availableStories.length;
        const currentStoryIdx = item.selectedStoryIndex !== undefined && item.selectedStoryIndex !== null ? item.selectedStoryIndex : 0;

        let newIndex = Math.floor(Math.random() * totalStories);
        if (newIndex === currentStoryIdx && totalStories > 1) {
            newIndex = (newIndex + 1) % totalStories;
        }

        setGridQuestions(prev => prev.map((q, idx) => idx === i ? {
            ...q,
            selectedStoryIndex: newIndex
        } : q));
    };

    const handleGridShuffle = async (mode) => {
        if (gridQuestions.length === 0 || isGlobalRefreshing) return;
        setIsGlobalRefreshing(true);

        syncBatchProgress('donow_grid_shuffled', gridQuestions, {
            app_mode: 'teacher_live',
            shuffle_mode: mode
        });

        if (mode === 'both' || mode === 'numbers') {
            setRevealed({});
            setShowAll(false);
        }

        try {
            const updatedQuestions = await Promise.all(gridQuestions.map(async (item) => {
                if (!item.topicId || !item.variationKey) return item;

                const isItemWordProblem = item.selectedStoryIndex !== null && item.selectedStoryIndex !== undefined;

                if (mode === 'stories') {
                    if (!isItemWordProblem) return item;
                    const rd = item.resolvedData?.renderData;
                    if (!rd?.availableStories || rd.availableStories.length <= 1) return item;

                    let newIndex = Math.floor(Math.random() * rd.availableStories.length);
                    if (newIndex === item.selectedStoryIndex && rd.availableStories.length > 1) {
                        newIndex = (newIndex + 1) % rd.availableStories.length;
                    }
                    return { ...item, selectedStoryIndex: newIndex };
                }

                const res = await fetch(`/api/question?topic=${item.topicId}&variation=${item.variationKey}&lang=${lang}&wordProblem=${isItemWordProblem}`);
                const data = await res.json();

                let nextStoryIndex = null;
                if (isItemWordProblem) {
                    if (mode === 'numbers') {
                        nextStoryIndex = item.selectedStoryIndex;
                    } else if (mode === 'both') {
                        const totalStories = data.renderData?.availableStories?.length || 1;
                        nextStoryIndex = Math.floor(Math.random() * totalStories);
                    }
                }

                return {
                    ...item,
                    selectedStoryIndex: nextStoryIndex,
                    resolvedData: data
                };
            }));

            setGridQuestions(updatedQuestions);
        } catch (err) { console.error("Grid batch shuffle failed:", err); }
        finally { setIsGlobalRefreshing(false); }
    };

    const adjustText = (delta) => {
        setTextSizeIndex(prev => Math.max(0, Math.min(prev + delta, TEXT_SIZES.length - 1)));
    };

    return (
        <div className="h-screen w-screen bg-[var(--bg-canvas)] text-[var(--text-main)] flex flex-col overflow-hidden font-sans relative select-none">
            {focusedIndex !== null && (
                <div 
                    role="presentation"
                    className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-xs flex items-center justify-center p-6 md:p-12 animate-in fade-in duration-150 cursor-zoom-out"
                    onClick={() => setFocusedIndex(null)}
                >
                    <div className="w-full max-w-6xl h-full max-h-[95vh] shadow-2xl rounded-2xl cursor-default bg-white border border-slate-200 overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <DoNowCard index={focusedIndex} q={gridQuestions[focusedIndex]} showAnswer={!!revealed[focusedIndex]} onToggleAnswer={() => toggleOne(focusedIndex)} onRefreshNumbers={() => handleRefreshNumbers(focusedIndex)} onRefreshStory={() => handleRefreshStory(focusedIndex)} onFocus={() => {}} lang={lang} textSizeClass="text-4xl" isFocused={true} />
                    </div>
                </div>
            )}
            
            {/* STREAMLINED SOLID COLOR HEADER */}
            <header className="bg-[var(--bg-card)] border-b border-[var(--border-strong)] text-[var(--text-main)] px-4 py-2 shrink-0 flex justify-between items-center shadow-2xs z-20">
                <div className="flex items-center gap-3">
                    <button type="button" onClick={() => handleSafeExit(onBack)} className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-muted)] hover:text-[var(--text-main)] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs">
                        <span>←</span> Studio
                    </button>
                    <div className="h-4 w-px bg-[var(--border-main)]" />
                    <div>
                        <h1 className="text-xs font-extrabold uppercase tracking-tight text-emerald-700 dark:text-emerald-400 leading-tight">Do Now Grid</h1>
                    </div>
                </div>

                {/* TIMER CONTROLS */}
                <div className={`flex items-center gap-2 px-3 py-1 rounded-xl border transition-all duration-300 shadow-2xs ${
                    timeLeft === 0 ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-100 animate-pulse' : 'bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--text-main)]'
                }`}>
                    <div className="flex items-center gap-1">
                        <button type="button" onClick={() => adjustTimer(60)} className="text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer">
                            <ChevronUp size={12}/>
                        </button>
                        <span className="text-xs font-bold font-mono tracking-wider tabular-nums">
                            {formatTime(timeLeft)}
                        </span>
                        <button type="button" onClick={() => adjustTimer(-60)} className="text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer">
                            <ChevronDown size={12}/>
                        </button>
                    </div>
                    <div className="flex gap-1 border-l border-[var(--border-main)] pl-2">
                        <button 
                            type="button"
                            onClick={() => setIsTimerActive(!isTimerActive)}
                            className={`p-1.5 rounded-lg transition-all shadow-2xs cursor-pointer ${isTimerActive ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                        >
                            {isTimerActive ? <Pause size={13} /> : <Play size={13} />}
                        </button>
                        <button 
                            type="button"
                            onClick={() => { setIsTimerActive(false); setTimeLeft(timerSeconds); }}
                            className="p-1.5 hover:bg-[var(--bg-card)] rounded-lg text-[var(--text-muted)] transition-colors cursor-pointer border border-[var(--border-main)]"
                        >
                            <RotateCcw size={13} />
                        </button>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-2">
                    <PreferencesToggle />
                    <div className="flex items-center bg-[var(--bg-surface)] rounded-xl p-0.5 border border-[var(--border-strong)] shadow-2xs">
                        <button type="button" onClick={() => adjustText(-1)} className="p-1.5 hover:bg-[var(--bg-card)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer">
                            <ZoomOut size={14} />
                        </button>
                        <div className="w-px h-3.5 bg-[var(--border-main)] mx-0.5"></div>
                        <button type="button" onClick={() => adjustText(1)} className="p-1.5 hover:bg-[var(--bg-card)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer">
                            <ZoomIn size={14} />
                        </button>
                    </div>

                    {/* Shuffle Dropdown */}
                    <div className="relative">
                        <button 
                            type="button"
                            onClick={() => setIsShuffleDropdownOpen(!isShuffleDropdownOpen)} 
                            disabled={isGlobalRefreshing || gridQuestions.length === 0} 
                            className="px-3.5 py-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] rounded-xl text-xs font-bold transition-all uppercase tracking-wider border border-[var(--border-strong)] flex items-center gap-1.5 disabled:opacity-40 cursor-pointer shadow-2xs"
                        >
                            {isGlobalRefreshing ? <Loader2 size={13} className="animate-spin" /> : <Shuffle size={13} />}
                            <span>{lang === 'sv' ? "Nytt set" : "Shuffle"}</span>
                        </button>

                        {isShuffleDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-xl shadow-xl p-1.5 w-48 z-[70] flex flex-col gap-1 text-[var(--text-main)] animate-in fade-in slide-in-from-top-2 duration-150">
                                <button 
                                    type="button"
                                    onClick={async () => { setIsShuffleDropdownOpen(false); await handleGridShuffle('numbers'); }}
                                    className="w-full text-left px-3 py-2 hover:bg-[var(--bg-surface)] rounded-lg transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-main)] cursor-pointer"
                                >
                                    <Calculator size={13} className="text-emerald-600 dark:text-emerald-400" /> {lang === 'sv' ? "Bara Siffror" : "Numbers"}
                                </button>
                                <button 
                                    type="button"
                                    onClick={async () => { setIsShuffleDropdownOpen(false); await handleGridShuffle('stories'); }}
                                    className="w-full text-left px-3 py-2 hover:bg-[var(--bg-surface)] rounded-lg transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-main)] cursor-pointer"
                                >
                                    <TextIcon size={13} className="text-amber-500" /> {lang === 'sv' ? "Bara Text" : "Stories"}
                                </button>
                                <div className="h-px bg-[var(--border-main)] my-1" />
                                <button 
                                    type="button"
                                    onClick={async () => { setIsShuffleDropdownOpen(false); await handleGridShuffle('both'); }}
                                    className="w-full text-left px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 cursor-pointer"
                                >
                                    <RefreshCcw size={13} /> {lang === 'sv' ? "Slumpa Allt" : "Reshuffle Both"}
                                </button>
                            </div>
                        )}
                    </div>

                    <button type="button" onClick={toggleAll} className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all shadow-2xs flex items-center gap-1.5 uppercase tracking-wider cursor-pointer ${showAll ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                        <span>{showAll ? '🙈' : '👁️'}</span> Facit
                    </button>
                    <button type="button" onClick={toggleFullscreen} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors p-2 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-strong)] cursor-pointer shadow-2xs" title="Fullscreen">
                        {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
                    </button>
                    <button type="button" onClick={() => handleSafeExit(onClose)} className="text-[var(--text-muted)] hover:text-rose-600 transition-colors p-2 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-strong)] cursor-pointer shadow-2xs" title="Close">
                        <X size={14} />
                    </button>
                </div>
            </header>

            <main className="flex-1 p-6 overflow-hidden relative bg-[var(--bg-canvas)]">
                {/* Global Refresh Overlay */}
                {isGlobalRefreshing && (
                    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center animate-in fade-in duration-150">
                        <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-3 text-[var(--text-main)]">
                            <Loader2 size={36} className="animate-spin text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Uppdaterar Grid...</span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-rows-2 gap-5 h-full w-full max-w-[1800px] mx-auto">
                    {gridQuestions.slice(0, 6).map((q, i) => (
                        <div key={q.id || `q-${i}`} className="min-h-0 min-w-0">
                            <DoNowCard 
                                index={i} 
                                q={q} 
                                showAnswer={!!revealed[i]} 
                                onToggleAnswer={() => toggleOne(i)} 
                                onRefreshNumbers={() => handleRefreshNumbers(i)}
                                onRefreshStory={() => handleRefreshStory(i)}
                                onFocus={() => setFocusedIndex(i)} 
                                lang={lang} 
                                textSizeClass={TEXT_SIZES[textSizeIndex]} 
                            />
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};