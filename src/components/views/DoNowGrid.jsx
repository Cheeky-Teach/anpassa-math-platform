import React, { useState } from 'react';
import MathText from '../ui/MathText';
import { GraphCanvas, VolumeVisualization, GeometryVisual, StaticGeometryVisual } from '../visuals/GeometryComponents';

const DoNowCard = ({ q, index, showAnswer, onToggle, lang }) => {
    const desc = typeof q.renderData.description === 'object' ? q.renderData.description[lang] : q.renderData.description;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden print-break-inside-avoid relative">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex justify-between items-center shrink-0">
                <span className="text-xs font-bold text-slate-400 uppercase">Q{index + 1} • {q.topic} L{q.level}</span>
            </div>

            <div className="p-4 flex-1 flex flex-col gap-4 relative">
                <div className="flex-1 bg-slate-50/50 rounded-lg border border-slate-100 flex items-center justify-center min-h-[150px] p-2 relative overflow-hidden">
                    <div className="scale-90 origin-center w-full flex justify-center">
                        {q.renderData.graph ? (
                            <GraphCanvas data={q.renderData.graph} />
                        ) : q.renderData.geometry ? (
                            ['cuboid', 'triangular_prism', 'pyramid', 'sphere', 'hemisphere', 'ice_cream', 'cone', 'cylinder', 'silo'].includes(q.renderData.geometry.type)
                                ? <VolumeVisualization data={q.renderData.geometry} />
                                : <GeometryVisual data={q.renderData.geometry} />
                        ) : (
                            q.topic === 'geometry' ? <StaticGeometryVisual description={desc} /> :
                                <div className="text-4xl text-slate-200 font-bold select-none opacity-20">#</div>
                        )}
                    </div>
                </div>

                <div className="shrink-0 text-center space-y-3 min-h-[6rem] flex flex-col justify-center py-2">
                    {q.renderData.latex && (
                        <div className="text-3xl md:text-5xl font-mono text-slate-900 font-bold tracking-wider">
                            <MathText text={`$${q.renderData.latex}$`} large={false} />
                        </div>
                    )}
                    {desc && (
                        <div className="text-lg md:text-2xl font-medium text-slate-700 leading-snug max-w-prose mx-auto">
                            <MathText text={desc} />
                        </div>
                    )}
                </div>

                <div className={`absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex items-center justify-center transition-opacity duration-300 ${showAnswer ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className="text-center transform scale-110">
                        <div className="text-sm text-slate-400 uppercase font-bold mb-2">Facit</div>
                        <div className="text-4xl font-bold text-emerald-600 font-mono px-4">{q.displayAnswer}</div>
                    </div>
                </div>
            </div>

            <button
                onClick={onToggle}
                className="w-full py-4 bg-slate-50 hover:bg-slate-100 border-t border-slate-100 text-sm font-bold text-slate-500 transition-colors shrink-0 z-20"
            >
                {showAnswer ? (lang === 'sv' ? "Dölj" : "Hide") : (lang === 'sv' ? "Visa svar" : "Show Answer")}
            </button>
        </div>
    );
};

const DoNowGrid = ({ questions, ui, onBack, lang }) => {
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
            <header className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm z-20">
                <button onClick={onBack} className="flex items-center gap-2 text-slate-600 font-bold hover:text-slate-900">
                    <span>←</span> {ui.donow_title}
                </button>
                <div className="flex gap-4">
                    <button onClick={toggleAll} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-sm transition-colors">
                        {showAll ? ui.donow_hide_all : ui.donow_show_all}
                    </button>
                </div>
            </header>
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full auto-rows-fr">
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