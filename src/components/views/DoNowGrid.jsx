import React, { useState, useEffect, useRef } from 'react';
import { GraphCanvas, VolumeVisualization, GeometryVisual } from '../visuals/GeometryComponents';

/**
 * PROJECTOR-OPTIMIZED MATH RENDERER
 * Handles mixed text and LaTeX strings using KaTeX auto-render.
 */
const MathDisplay = ({ content, className }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const doRender = () => {
            if (window.renderMathInElement && containerRef.current) {
                window.renderMathInElement(containerRef.current, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false },
                    ],
                    throwOnError: false
                });
            }
        };

        if (content) {
            // Wait for KaTeX to be available in global scope (loaded in index.html)
            if (window.renderMathInElement) {
                doRender();
            } else {
                const interval = setInterval(() => {
                    if (window.renderMathInElement) {
                        doRender();
                        clearInterval(interval);
                    }
                }, 100);
                return () => clearInterval(interval);
            }
        }
    }, [content]);

    return <div ref={containerRef} className={className}>{content}</div>;
};

const DoNowCard = ({ q, index, showAnswer, onToggle, lang }) => {
    const desc = typeof q.renderData.description === 'object' ? q.renderData.description[lang] : q.renderData.description;
    const latex = q.renderData.latex;

    // --- Adaptive Layout Logic ---
    const isTextOnly = 
        (q.topic === 'equation' && (q.level === 5 || q.level === 6)) ||
        (q.topic === 'simplify' && q.level === 5) ||
        (q.topic === 'equations_word');

    // --- REFINED VISUAL DETECTION (Phase 2 Compatible) ---
    const visualData = q.renderData.geometry || q.renderData.graph;
    const hasVisualData = visualData && !isTextOnly;

    const renderVisual = () => {
        if (!hasVisualData) return null;

        // Scale up visuals for better projector visibility
        const scaleStyle = { transform: 'scale(1.2)', transformOrigin: 'center' };

        if (q.renderData.graph) {
            return <div style={scaleStyle}><GraphCanvas data={q.renderData.graph} width={350} height={250} /></div>;
        }

        const geom = q.renderData.geometry;
        const volumeTypes = ['cuboid', 'cylinder', 'cone', 'sphere', 'hemisphere', 'pyramid', 'triangular_prism', 'silo', 'ice_cream'];
        
        if (volumeTypes.includes(geom.type)) {
            return <div style={scaleStyle}><VolumeVisualization data={geom} width={350} height={250} /></div>;
        }

        // Standard 2D shapes and Composites (Huset/Portalen)
        return <div style={scaleStyle}><GeometryVisual data={geom} /></div>;
    };

    // --- PROJECTOR FONT SCALING ---
    const getDescSize = (text) => {
        if (!text) return 'text-4xl';
        const len = text.length;
        if (len > 120) return 'text-2xl md:text-3xl leading-relaxed';
        if (len > 60) return 'text-3xl md:text-4xl leading-tight';
        return 'text-4xl md:text-5xl font-black tracking-tight';
    };

    return (
        <div 
            onClick={onToggle}
            className={`
                relative flex flex-col justify-between 
                bg-white rounded-[2.5rem] shadow-xl border-4 transition-all duration-500 cursor-pointer overflow-hidden group
                ${showAnswer ? 'border-indigo-600 ring-8 ring-indigo-500/10 scale-[1.02]' : 'border-slate-100 hover:border-indigo-200 hover:shadow-2xl'}
            `}
        >
            <div className="p-10 flex flex-col flex-1 h-full min-h-[500px]">
                {/* Large Number Badge */}
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-2xl font-black mb-8 transition-all ${showAnswer ? 'bg-indigo-600 text-white rotate-12' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                    {index + 1}
                </div>

                {/* Visual Container */}
                {hasVisualData && (
                    <div className="mb-10 bg-slate-50/50 rounded-3xl border-2 border-slate-100 overflow-hidden flex justify-center items-center py-10 min-h-[250px]">
                        {renderVisual()}
                    </div>
                )}

                {/* Text Content - Enlarged for Projectors */}
                <div className="flex-1 flex flex-col justify-center items-center text-center px-4">
                    <MathDisplay 
                        content={desc} 
                        className={`text-slate-800 mb-6 font-bold ${getDescSize(desc)}`} 
                    />
                    
                    {latex && (
                        <div className="mt-4 text-5xl md:text-6xl font-black text-indigo-600 tracking-wider py-4 px-6 bg-indigo-50/30 rounded-3xl border border-indigo-100/50 shadow-inner">
                            <MathDisplay content={`$$${latex}$$`} />
                        </div>
                    )}

                    {/* Multiple Choice Options (Projector Optimized) */}
                    {q.renderData.options && q.renderData.options.length > 0 && (
                         <div className="grid grid-cols-2 gap-4 mt-8 w-full">
                            {q.renderData.options.map((opt, i) => (
                                <div key={i} className="text-xl md:text-2xl font-bold bg-white border-2 border-slate-100 rounded-2xl p-4 text-slate-600 shadow-sm flex items-center gap-4">
                                    <span className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-sm font-black text-slate-400">{String.fromCharCode(65+i)}</span>
                                    <MathDisplay content={opt} />
                                </div>
                            ))}
                         </div>
                    )}
                </div>
            </div>

            {/* High-Visibility Answer Overlay */}
            {showAnswer && (
                <div className="absolute inset-0 z-10 bg-white/98 backdrop-blur-md flex flex-col items-center justify-center p-12 animate-in zoom-in-95 duration-300">
                    <div className="text-xl font-black text-indigo-500 uppercase tracking-[0.3em] mb-6">
                        {lang === 'sv' ? 'FACIT' : 'ANSWER'}
                    </div>
                    <div className="text-6xl md:text-8xl font-black text-indigo-950 text-center break-words w-full leading-none tracking-tighter">
                        <span className="drop-shadow-sm">{tryDecode(q.token)}</span>
                        {q.renderData.suffix && (
                            <span className="text-4xl text-slate-400 font-medium ml-4 tracking-normal uppercase">{q.renderData.suffix}</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const tryDecode = (str) => {
    try { return atob(str); } catch (e) { return "Error"; }
};

const DoNowGrid = ({ questions, ui, lang, onBack, onRefreshAll }) => {
    const [revealed, setRevealed] = useState({});
    const [showAll, setShowAll] = useState(false);

    const toggleOne = (idx) => {
        setRevealed(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const toggleAll = () => {
        if (showAll) {
            setRevealed({});
            setShowAll(false);
        } else {
            const all = {};
            questions.forEach((_, i) => all[i] = true);
            setRevealed(all);
            setShowAll(true);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-slate-200 p-4 md:p-8">
            <header className="bg-slate-900 rounded-[2rem] px-10 py-6 flex justify-between items-center shadow-2xl z-20 mb-8 border border-white/10">
                <div className="flex items-center gap-8">
                    <button onClick={onBack} className="group flex items-center gap-3 text-slate-400 font-black hover:text-white transition-all uppercase tracking-widest text-sm">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">←</div>
                        <span>{ui.backBtn || "TILLBAKA"}</span>
                    </button>
                    <h2 className="text-2xl font-black text-white hidden lg:block tracking-tighter uppercase italic">
                        {ui.donow_title || "CLASSROOM BOARD"}
                    </h2>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={onRefreshAll}
                        className="px-8 py-4 rounded-2xl font-black text-sm bg-white/5 text-white hover:bg-indigo-600 transition-all flex items-center gap-3 shadow-lg uppercase tracking-widest border border-white/10"
                    >
                        <span>🔄</span> {lang === 'sv' ? 'NYTT SET' : 'NEW SET'}
                    </button>

                    <button 
                        onClick={toggleAll} 
                        className={`px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl flex items-center gap-3 uppercase tracking-widest ${showAll ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                    >
                        <span>{showAll ? '🙈' : '👁️'}</span>
                        {showAll ? (ui.donow_hide_all || "DÖLJ SVAR") : (ui.donow_show_all || "VISA FACIT")}
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-screen-2xl mx-auto pb-20">
                    {questions.map((q, i) => (
                        <DoNowCard
                            key={i}
                            index={i}
                            q={q}
                            showAnswer={!!revealed[i]}
                            onToggle={() => toggleOne(i)}
                            lang={lang}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DoNowGrid;