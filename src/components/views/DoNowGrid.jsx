import React, { useState, useEffect, useRef } from 'react';
import { GeometryVisual, GraphCanvas, VolumeVisualization } from '../visuals/GeometryComponents.jsx';
import { 
    X, Maximize, Minimize, ZoomIn, ZoomOut, RefreshCw, 
    Eye, EyeOff, Loader2, Play, Pause, RotateCcw, ChevronUp, ChevronDown 
} from 'lucide-react';

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

const TEXT_SIZES = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl'];

const DoNowCard = ({ index, q, showAnswer, onToggleAnswer, onRefresh, onFocus, lang, textSizeClass, isFocused = false }) => {
    
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
    
    const data = q?.resolvedData?.renderData;

    // Loading State for individual cards (Prevents blanking during single refresh)
    if (!data) {
        return (
            <div className="h-full w-full rounded-[1.5rem] border-2 border-slate-100 bg-white flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-indigo-300" size={32} />
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Laddar...</span>
            </div>
        );
    }

    const renderVisualContent = () => {
        const vW = isFocused ? 600 : 300;
        const vH = isFocused ? 420 : 220;

        if (data.graph) return <GraphCanvas data={data.graph} width={vW} height={vH} />;
        if (data.geometry) {
            const geom = data.geometry;
            const volumeTypes = ['cuboid', 'cylinder', 'cone', 'sphere', 'hemisphere', 'pyramid', 'triangular_prism', 'silo', 'ice_cream', 'volume'];
            if (volumeTypes.includes(geom.type)) {
                return <VolumeVisualization data={geom} width={vW} height={vH} />;
            }
            return <GeometryVisual data={geom} />;
        }
        return null;
    };

    const hasVisual = data?.graph || data?.geometry;

    return (
        <div 
            onClick={onFocus}
            className={`relative rounded-[1.5rem] border-2 transition-all flex flex-col overflow-hidden h-full select-none shadow-sm group
            ${isFocused ? 'bg-white border-indigo-500 shadow-2xl' : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-zoom-in'}
            ${showAnswer && !isFocused ? 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-500/10' : ''}`}
        >
            <div className={`px-4 py-1.5 flex justify-between items-center border-b transition-colors ${showAnswer && !isFocused ? 'bg-emerald-100/50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}>
                <span className={`text-[10px] font-black uppercase tracking-widest ${showAnswer && !isFocused ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {lang === 'sv' ? 'Uppgift' : 'Task'} {index + 1}
                </span>
                {q.topicId && (
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter bg-white px-2 py-0.5 rounded-full border border-slate-200">
                        {q.topicId.split('_')[0]}
                    </span>
                )}
            </div>

            <div className={`flex-1 flex flex-col items-center text-center relative overflow-hidden transition-all duration-300 
                ${isFocused ? 'p-10' : 'p-3'}`}>
                
                {hasVisual && (
                    <div className={`w-full flex justify-center items-center shrink-0 overflow-hidden
                        ${isFocused ? 'h-[440px] mb-6' : 'h-[220px] mb-2'}`}>
                        {renderVisualContent()}
                    </div>
                )}

                <div className={`font-bold text-slate-800 leading-tight ${textSizeClass} flex-1 flex flex-col justify-center items-center transition-all w-full
                    ${isFocused ? 'px-8 pb-4' : 'px-1'}`}>
                    <MathDisplay content={data?.description} />
                    {data?.latex && (
                        <div className={`text-indigo-600 font-serif ${isFocused ? 'mt-4 text-5xl' : 'mt-1'}`}>
                            <MathDisplay content={`$$${data.latex}$$`} />
                        </div>
                    )}
                </div>

                {data?.options && data.options.length > 0 && (
                    <div className={`grid grid-cols-2 gap-3 w-full shrink-0 ${isFocused ? 'mt-6 max-w-4xl pb-4' : 'mt-2'}`}>
                        {data.options.map((opt, idx) => (
                            <div key={idx} className={`bg-white border-2 border-slate-100 rounded-xl flex items-center gap-3 shadow-sm
                                ${isFocused ? 'p-6 text-2xl' : 'p-2 text-sm font-bold text-left text-slate-700'}`}>
                                <span className="w-6 h-6 shrink-0 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center text-[10px] font-black">
                                    {String.fromCharCode(65 + idx)}
                                </span>
                                <MathDisplay className="truncate" content={opt} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {!isFocused && (
                <div className="absolute top-10 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onRefresh(); }}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-white/90 text-slate-400 border border-slate-200 hover:text-indigo-600 shadow-sm"
                    >
                        <RefreshCw size={14} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onToggleAnswer(); }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm
                        ${showAnswer ? 'bg-emerald-600 text-white' : 'bg-white/90 text-slate-400 border border-slate-200'}`}
                    >
                        {showAnswer ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                </div>
            )}

            {showAnswer && (
                <div className={`bg-emerald-500 text-white py-3 text-center shrink-0 animate-in slide-in-from-bottom duration-300`}>
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-80">FACIT</div>
                    <div className={`${isFocused ? 'text-6xl' : 'text-3xl'} font-black tracking-tighter`}>
                        <MathDisplay content={getFinalAnswer()} />
                        {data?.suffix && <span className="ml-1 text-sm opacity-90">{data.suffix}</span>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function DoNowGrid({ questions, ui, onBack, onClose, lang, onRefreshAll, onRefreshOne }) {
    const [revealed, setRevealed] = useState({});
    const [focusedIndex, setFocusedIndex] = useState(null);
    const [showAll, setShowAll] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [textSizeIndex, setTextSizeIndex] = useState(2);
    const [isGlobalRefreshing, setIsGlobalRefreshing] = useState(false);

    // --- TIMER STATE ---
    const [timerSeconds, setTimerSeconds] = useState(300); // Set by teacher (default 5m)
    const [timeLeft, setTimeLeft] = useState(300);
    const [isTimerActive, setIsTimerActive] = useState(false);

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

    const handleGlobalRefresh = async () => {
        if (isGlobalRefreshing) return;
        setIsGlobalRefreshing(true);
        // Clear local UI states before fetching
        setRevealed({});
        setShowAll(false);
        try {
            await onRefreshAll();
        } catch (e) {
            console.error("Global Refresh Error", e);
        } finally {
            setIsGlobalRefreshing(false);
        }
    };

    const adjustText = (delta) => {
        setTextSizeIndex(prev => Math.max(0, Math.min(prev + delta, TEXT_SIZES.length - 1)));
    };

    return (
        <div className="h-screen w-screen bg-slate-200 flex flex-col overflow-hidden font-sans relative">
            {focusedIndex !== null && (
                <div 
                    className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6 md:p-12 animate-in fade-in zoom-in duration-300 cursor-zoom-out"
                    onClick={() => setFocusedIndex(null)}
                >
                    <div className="w-full max-w-6xl h-full max-h-[95vh] shadow-2xl rounded-[3rem] cursor-default bg-white overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <DoNowCard index={focusedIndex} q={questions[focusedIndex]} showAnswer={!!revealed[focusedIndex]} onToggleAnswer={() => toggleOne(focusedIndex)} onRefresh={() => onRefreshOne(focusedIndex)} onFocus={() => {}} lang={lang} textSizeClass="text-5xl" isFocused={true} />
                    </div>
                </div>
            )}
            
            <header className="bg-slate-900 text-white px-6 py-3 shrink-0 flex justify-between items-center shadow-2xl z-20">
                <div className="flex items-center gap-6">
                    <button onClick={() => handleSafeExit(onBack)} className="group flex items-center gap-2 text-slate-400 hover:text-white font-black text-xs uppercase tracking-widest transition-all">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">←</div> STUDIO
                    </button>
                    <div className="h-6 w-px bg-slate-700"></div>
                    <div className="flex flex-col">
                        <h1 className="text-base font-black tracking-tighter italic text-indigo-400 leading-none">DO NOW GRID</h1>
                        <span className="text-[9px] font-bold text-slate-500 tracking-widest uppercase">Classroom Session</span>
                    </div>
                </div>

                {/* --- HEADER TIMER CONTROLS --- */}
                <div className={`flex items-center gap-3 px-4 py-1.5 rounded-2xl border transition-all duration-500
                    ${timeLeft === 0 ? 'bg-rose-600 border-white ring-4 ring-rose-500/20' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex flex-col items-center mr-1">
                        <button onClick={() => adjustTimer(60)} className="hover:text-indigo-400 transition-colors">
                            <ChevronUp size={14}/>
                        </button>
                        <span className={`text-xs font-black tabular-nums tracking-widest ${timeLeft === 0 ? 'text-white animate-pulse' : 'text-indigo-400'}`}>
                            {formatTime(timeLeft)}
                        </span>
                        <button onClick={() => adjustTimer(-60)} className="hover:text-indigo-400 transition-colors">
                            <ChevronDown size={14}/>
                        </button>
                    </div>
                    <div className="flex gap-1.5">
                        <button 
                            onClick={() => setIsTimerActive(!isTimerActive)}
                            className={`p-2 rounded-xl transition-all shadow-lg ${isTimerActive ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
                        >
                            {isTimerActive ? <Pause size={18} /> : <Play size={18} />}
                        </button>
                        <button 
                            onClick={() => { setIsTimerActive(false); setTimeLeft(timerSeconds); }}
                            className="p-2 hover:bg-white/10 rounded-xl text-slate-400 transition-colors"
                        >
                            <RotateCcw size={18} />
                        </button>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/10 mr-4">
                        <button onClick={() => adjustText(-1)} className="p-2 hover:bg-white/10 rounded-lg text-slate-300 transition-colors">
                            <ZoomOut size={18} />
                        </button>
                        <div className="w-px h-4 bg-white/10 mx-1"></div>
                        <button onClick={() => adjustText(1)} className="p-2 hover:bg-white/10 rounded-lg text-slate-300 transition-colors">
                            <ZoomIn size={18} />
                        </button>
                    </div>

                    <button 
                        onClick={handleGlobalRefresh} 
                        disabled={isGlobalRefreshing} 
                        className="px-5 py-2.5 bg-indigo-400/20 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-xl text-xs font-black transition-all uppercase tracking-wider border border-indigo-500/30 flex items-center gap-2 disabled:opacity-70"
                    >
                        {isGlobalRefreshing ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                <span>SLUMPAR...</span>
                            </>
                        ) : (
                            <>
                                <RefreshCw size={14} />
                                <span>NYTT SET</span>
                            </>
                        )}
                    </button>
                    <button onClick={toggleAll} className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all shadow-lg flex items-center gap-2 uppercase tracking-widest ${showAll ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
                        <span>{showAll ? '🙈' : '👁️'}</span> FACIT
                    </button>
                    <button onClick={toggleFullscreen} className="text-slate-400 hover:text-white transition-colors p-2 bg-white/5 rounded-xl">
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                    <button onClick={() => handleSafeExit(onClose)} className="text-slate-400 hover:text-rose-500 transition-colors p-2 bg-white/5 rounded-xl"><X size={20} /></button>
                </div>
            </header>

            <main className="flex-1 p-6 overflow-hidden relative">
                {/* Global Refresh Overlay */}
                {isGlobalRefreshing && (
                    <div className="absolute inset-0 z-50 bg-slate-200/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
                        <div className="bg-white p-8 rounded-[3rem] shadow-2xl flex flex-col items-center gap-4">
                            <Loader2 size={40} className="animate-spin text-indigo-600" />
                            <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Uppdaterar Grid...</span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-rows-2 gap-6 h-full w-full max-w-[1800px] mx-auto">
                    {questions.slice(0, 6).map((q, i) => (
                        <div key={q.id || `q-${i}`} className="min-h-0 min-w-0">
                            <DoNowCard 
                                index={i} 
                                q={q} 
                                showAnswer={!!revealed[i]} 
                                onToggleAnswer={() => toggleOne(i)} 
                                onRefresh={() => onRefreshOne(i)} 
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