import React, { useState, useEffect, useRef } from 'react';
// FIX: Lagt till .jsx filändelse och importerat alla nödvändiga komponenter från god-filen
import { GeometryVisual, GraphCanvas, VolumeVisualization } from '../visuals/GeometryComponents.jsx';
import { X, Maximize, Minimize, ZoomIn, ZoomOut, RefreshCw, Eye, EyeOff } from 'lucide-react';

/**
 * MATH DISPLAY COMPONENT
 * Renders LaTeX content using KaTeX if available.
 */
const MathDisplay = ({ content, className }) => {
    const containerRef = useRef(null);
    useEffect(() => {
        const doRender = () => {
            if (window.renderMathInElement && containerRef.current) {
                window.renderMathInElement(containerRef.current, {
                    delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }],
                    throwOnError: false
                });
            }
        };
        if (content) {
            if (window.renderMathInElement) doRender();
            else { 
                const i = setInterval(() => { 
                    if (window.renderMathInElement) { 
                        doRender(); 
                        clearInterval(i); 
                    } 
                }, 100); 
                return () => clearInterval(i); 
            }
        }
    }, [content]);
    return <div ref={containerRef} className={className}>{content}</div>;
};

// Tillgängliga textstorlekar för projektoroptimering
const TEXT_SIZES = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl'];

/**
 * DO NOW CARD COMPONENT
 * Individual task card with visual support and answer reveal.
 */
const DoNowCard = ({ index, q, showAnswer, onToggleAnswer, onFocus, lang, textSizeClass, isFocused = false }) => {
    const decode = (str) => { try { return atob(str); } catch { return str; } };

    const renderVisualContent = () => {
        if (!q.renderData) return null;
        if (q.renderData.graph) return <GraphCanvas data={q.renderData.graph} />;
        if (q.renderData.geometry) {
            const geom = q.renderData.geometry;
            const volumeTypes = ['cuboid', 'cylinder', 'cone', 'sphere', 'hemisphere', 'pyramid', 'triangular_prism', 'silo', 'ice_cream', 'volume'];
            if (volumeTypes.includes(geom.type)) {
                return <VolumeVisualization data={geom} width={isFocused ? 400 : 280} height={isFocused ? 250 : 180} />;
            }
            return <GeometryVisual data={geom} />;
        }
        return null;
    };

    const hasVisual = q.renderData?.graph || q.renderData?.geometry;

    return (
        <div 
            onClick={onFocus}
            className={`relative rounded-[1.5rem] border-2 transition-all flex flex-col overflow-hidden h-full select-none shadow-sm group
            ${isFocused ? 'bg-white border-indigo-500 shadow-2xl' : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-zoom-in'}
            ${showAnswer && !isFocused ? 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-500/10' : ''}`}
        >
            {/* Header */}
            <div className={`px-4 py-2 flex justify-between items-center border-b transition-colors ${showAnswer && !isFocused ? 'bg-emerald-100/50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}>
                <span className={`text-[10px] font-black uppercase tracking-widest ${showAnswer && !isFocused ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {lang === 'sv' ? 'Uppgift' : 'Task'} {index + 1}
                </span>
                {q.topic && (
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter bg-white px-2 py-0.5 rounded-full border border-slate-200">
                        {q.topic.split('_')[0]}
                    </span>
                )}
            </div>

            {/* Content Area - Added significantly higher padding when in focus mode */}
            <div className={`flex-1 flex flex-col justify-center items-center text-center relative overflow-hidden transition-all duration-300 
                ${isFocused ? 'p-12 md:p-16 lg:p-24' : 'p-4'}`}>
                
                {hasVisual && (
                    <div className={`w-full flex justify-center items-center ${isFocused ? 'mb-12' : 'mb-6'}`}>
                        <div className="transform scale-110 lg:scale-125 origin-center">
                            {renderVisualContent()}
                        </div>
                    </div>
                )}
                
                {/* Question Text - Increased horizontal padding when focused to prevent border collision */}
                <div className={`font-bold text-slate-800 leading-tight ${textSizeClass} transition-all my-auto ${isFocused ? 'px-12 md:px-20' : 'px-2'}`}>
                    <MathDisplay content={q.renderData?.description} />
                    {q.renderData?.latex && (
                        <div className={`text-indigo-600 font-serif ${isFocused ? 'mt-6' : 'mt-3'}`}>
                            <MathDisplay content={`$$${q.renderData.latex}$$`} />
                        </div>
                    )}
                </div>
                
                {/* Options - Spaced out more when focused */}
                {q.renderData?.options && q.renderData.options.length > 0 && (
                    <div className={`grid grid-cols-2 gap-4 w-full ${isFocused ? 'mt-12 px-12 pb-12' : 'mt-6 px-2 pb-2'}`}>
                        {q.renderData.options.map((opt, idx) => (
                            <div key={idx} className={`bg-white border-2 border-slate-100 rounded-xl flex items-center gap-3 shadow-sm
                                ${isFocused ? 'p-6 text-xl' : 'p-3 text-base font-bold text-left text-slate-700'}`}>
                                <span className="w-8 h-8 shrink-0 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center text-xs font-black">
                                    {String.fromCharCode(65 + idx)}
                                </span>
                                <MathDisplay className="truncate" content={opt} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Answer Toggle Button (Discrete in corner) */}
            {!isFocused && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggleAnswer(); }}
                    className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md active:scale-90
                    ${showAnswer ? 'bg-emerald-600 text-white' : 'bg-white text-slate-400 border border-slate-200 hover:text-indigo-600 hover:border-indigo-200'}`}
                    title={lang === 'sv' ? "Visa/Dölj svar" : "Show/Hide answer"}
                >
                    {showAnswer ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            )}

            {/* Answer Footer (Shown when active) */}
            {showAnswer && (
                <div className={`bg-emerald-600 text-white py-4 text-center shrink-0 animate-in slide-in-from-bottom duration-300 ${isFocused ? 'mt-auto' : ''}`}>
                    <div className="text-xs font-black uppercase tracking-[0.2em] mb-1 opacity-80">FACIT</div>
                    <div className={`${isFocused ? 'text-5xl' : 'text-3xl'} font-black tracking-tighter leading-none`}>
                        <MathDisplay content={decode(q.token)} />
                        {q.renderData?.suffix && <span className={`${isFocused ? 'text-2xl' : 'text-lg'} ml-2 opacity-90 uppercase`}>{q.renderData.suffix}</span>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function DoNowGrid({ questions, ui, onBack, onClose, lang, onRefreshAll }) {
    const [revealed, setRevealed] = useState({});
    const [focusedIndex, setFocusedIndex] = useState(null);
    const [showAll, setShowAll] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [textSizeIndex, setTextSizeIndex] = useState(3); // Default: text-xl

    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') setFocusedIndex(null); };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
            if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        };
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

    const adjustText = (delta) => {
        setTextSizeIndex(prev => Math.max(0, Math.min(prev + delta, TEXT_SIZES.length - 1)));
    };

    const handleRefresh = () => {
        setRevealed({}); 
        setShowAll(false); 
        setFocusedIndex(null);
        onRefreshAll();
    };

    return (
        <div className="h-screen w-screen bg-slate-200 flex flex-col overflow-hidden font-sans relative">
            
            {/* Whiteboard Focus Overlay */}
            {focusedIndex !== null && (
                <div 
                    className="fixed inset-0 z-[60] bg-white/95 backdrop-blur-sm flex items-start justify-center pt-16 px-12 pb-12 animate-in fade-in duration-300 cursor-zoom-out"
                    onClick={() => setFocusedIndex(null)}
                >
                    <div 
                        className="w-full max-w-5xl h-auto transform lg:scale-105 shadow-2xl rounded-[3rem] cursor-default bg-white border border-slate-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <DoNowCard 
                            index={focusedIndex} 
                            q={questions[focusedIndex]} 
                            showAnswer={!!revealed[focusedIndex]} 
                            onToggleAnswer={() => toggleOne(focusedIndex)}
                            onFocus={() => {}}
                            lang={lang} 
                            textSizeClass="text-4xl"
                            isFocused={true}
                        />
                    </div>
                    {/* Floating Close Hint */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-2 bg-slate-900/10 text-slate-400 rounded-full font-black text-xs uppercase tracking-widest pointer-events-none">
                        {lang === 'sv' ? 'Klicka utanför för att återgå' : 'Click outside to return'}
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="bg-slate-900 text-white px-6 py-3 shrink-0 flex justify-between items-center shadow-2xl z-20">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => handleSafeExit(onBack)} 
                        className="group flex items-center gap-2 text-slate-400 hover:text-white font-black text-xs uppercase tracking-widest transition-all"
                    >
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">←</div>
                        STUDIO
                    </button>
                    <div className="h-6 w-px bg-slate-700"></div>
                    <div className="flex flex-col">
                        <h1 className="text-base font-black tracking-tighter italic text-indigo-400 leading-none">DO NOW GRID</h1>
                        <span className="text-[9px] font-bold text-slate-500 tracking-widest uppercase">Classroom Session</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/10 mr-4">
                        <button onClick={() => adjustText(-1)} className="p-2 hover:bg-white/10 rounded-lg text-slate-300 transition-colors"><ZoomOut size={18} /></button>
                        <div className="w-px h-4 bg-white/10 mx-1"></div>
                        <button onClick={() => adjustText(1)} className="p-2 hover:bg-white/10 rounded-lg text-slate-300 transition-colors"><ZoomIn size={18} /></button>
                    </div>

                    <button 
                        onClick={handleRefresh} 
                        className="px-5 py-2.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-xl text-xs font-black transition-all uppercase tracking-wider border border-indigo-500/30 flex items-center gap-2"
                    >
                        <RefreshCw size={14} /> {lang === 'sv' ? 'NYTT SET' : 'NEW SET'}
                    </button>

                    <button 
                        onClick={toggleAll} 
                        className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all shadow-lg flex items-center gap-2 uppercase tracking-widest ${showAll ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                    >
                        <span>{showAll ? '🙈' : '👁️'}</span>
                        {showAll ? (lang === 'sv' ? "DÖLJ FACIT" : "HIDE ANSWERS") : (lang === 'sv' ? "VISA FACIT" : "SHOW ANSWERS")}
                    </button>
                    
                    <div className="h-6 w-px bg-slate-700 mx-2"></div>

                    <button onClick={toggleFullscreen} className="text-slate-400 hover:text-white transition-colors p-2 bg-white/5 rounded-xl">
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>

                    <button onClick={() => handleSafeExit(onClose)} className="text-slate-400 hover:text-rose-500 transition-colors p-2 bg-white/5 rounded-xl"><X size={20} /></button>
                </div>
            </header>

            {/* Grid Container */}
            <main className="flex-1 p-6 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-rows-2 gap-6 h-full w-full max-w-[1800px] mx-auto">
                    {questions.slice(0, 6).map((q, i) => (
                        <div key={i} className="min-h-0 min-w-0">
                            <DoNowCard 
                                index={i} 
                                q={q} 
                                showAnswer={!!revealed[i]} 
                                onToggleAnswer={() => toggleOne(i)} 
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
}