import React, { useState, useEffect, useRef } from 'react';
import { GraphCanvas, VolumeVisualization, GeometryVisual } from '../visuals/GeometryComponents';

/**
 * REFINED MATH RENDERER
 * Shared logic with QuestionStudio to handle mixed text/latex strings
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
            // KaTeX is assumed to be loaded by QuestionStudio or index.html
            if (window.renderMathInElement) doRender();
            else {
                const timer = setInterval(() => {
                    if (window.renderMathInElement) {
                        doRender();
                        clearInterval(timer);
                    }
                }, 100);
                return () => clearInterval(timer);
            }
        }
    }, [content]);

    return <div ref={containerRef} className={className}>{content}</div>;
};

const DoNowCard = ({ q, index, showAnswer, onToggle, lang, onRefresh }) => {
    const desc = typeof q.renderData.description === 'object' ? q.renderData.description[lang] : q.renderData.description;
    const latex = q.renderData.latex;

    // --- Adaptive Layout Logic ---
    const isTextOnly = 
        (q.topic === 'equation' && (q.level === 5 || q.level === 6)) ||
        (q.topic === 'simplify' && q.level === 5) ||
        (q.topic === 'equations_word');

    // --- REFINED VISUAL DETECTION ---
    const visualData = q.renderData.geometry || q.renderData.graph;
    const hasVisualData = visualData && !isTextOnly;

    const renderVisual = () => {
        if (!hasVisualData) return null;

        if (q.renderData.graph) {
            return <GraphCanvas data={q.renderData.graph} />;
        }

        const geom = q.renderData.geometry;
        const volumeTypes = ['cuboid', 'cylinder', 'cone', 'sphere', 'hemisphere', 'pyramid', 'triangular_prism', 'silo', 'ice_cream'];
        
        if (volumeTypes.includes(geom.type)) {
            return <VolumeVisualization data={geom} />;
        }

        return <GeometryVisual data={geom} />;
    };

    // --- Dynamic Text Scaling ---
    const getDescSize = (text) => {
        if (!text) return 'text-xl';
        const len = text.length;
        if (isTextOnly) {
            if (len > 200) return 'text-base leading-relaxed';
            return 'text-lg leading-relaxed';
        }
        if (len > 80) return 'text-sm';
        return 'text-base font-medium';
    };

    return (
        <div 
            onClick={onToggle}
            className={`
                relative flex flex-col justify-between 
                bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 cursor-pointer overflow-hidden group
                ${showAnswer ? 'border-indigo-500 ring-4 ring-indigo-500/20 scale-[1.01]' : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'}
            `}
        >
            <div className="p-5 flex flex-col flex-1 h-full min-h-[300px]">
                {/* Number Badge */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-4 transition-colors ${showAnswer ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {index + 1}
                </div>

                {/* Visual Container */}
                {hasVisualData && (
                    <div className="mb-4 bg-slate-50 rounded-xl overflow-hidden flex justify-center items-center py-4 transform scale-90 origin-top">
                        {renderVisual()}
                    </div>
                )}

                {/* Text Content */}
                <div className="flex-1 flex flex-col justify-center items-center text-center">
                    <MathDisplay 
                        content={desc} 
                        className={`text-slate-700 mb-3 ${getDescSize(desc)}`} 
                    />
                    
                    {latex && (
                        <div className="mt-2 text-xl md:text-2xl font-black text-slate-800 tracking-wide">
                            <MathDisplay content={`$$${latex}$$`} />
                        </div>
                    )}

                    {/* Options for Multiple Choice */}
                    {q.renderData.options && (
                         <div className="grid grid-cols-2 gap-2 mt-4 w-full">
                            {q.renderData.options.map((opt, i) => (
                                <div key={i} className="text-[10px] bg-slate-50 border border-slate-100 rounded p-1 text-slate-500">
                                    <MathDisplay content={opt} />
                                </div>
                            ))}
                         </div>
                    )}
                </div>
            </div>

            {/* Answer Overlay */}
            {showAnswer && (
                <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">
                        {lang === 'sv' ? 'FACIT' : 'ANSWER'}
                    </div>
                    <div className="text-3xl font-black text-indigo-900 text-center break-words w-full">
                        {tryDecode(q.token)} <span className="text-sm text-slate-400 font-medium ml-1">{q.renderData.suffix}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

const tryDecode = (str) => {
    try { return atob(str); } catch (e) { return "Error"; }
};

const DoNowGrid = ({ questions, ui, lang, onBack, onRefreshAll, onRefreshOne }) => {
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
        <div className="h-screen flex flex-col bg-slate-100">
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm z-20 sticky top-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors">
                        <span className="text-xl">←</span> 
                        <span>{ui.backBtn || "Tillbaka"}</span>
                    </button>
                    <h2 className="text-lg font-black text-slate-800 hidden md:block tracking-tight border-l border-slate-200 pl-4 ml-2 uppercase italic">
                        {ui.donow_title}
                    </h2>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={onRefreshAll}
                        className="px-4 py-2 rounded-full font-bold text-sm bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center gap-2"
                    >
                        <span>🔄</span> {lang === 'sv' ? 'Nytt set' : 'New Set'}
                    </button>

                    <button 
                        onClick={toggleAll} 
                        className={`px-5 py-2 rounded-full font-black text-sm transition-all shadow-sm flex items-center gap-2 ${showAll ? 'bg-slate-800 text-white' : 'bg-indigo-600 text-white'}`}
                    >
                        <span>{showAll ? '🙈' : '👁️'}</span>
                        {showAll ? (ui.donow_hide_all || "Dölj svar") : (ui.donow_show_all || "Visa svar")}
                    </button>
                </div>
            </header>

            <div className="flex-1 p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
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