import React, { useState } from 'react';
import MathText from '../ui/MathText';
import { GraphCanvas, VolumeVisualization, GeometryVisual } from '../visuals/GeometryComponents';

const WorksheetView = ({ questions, ui, onBack, lang }) => {
    const [showAnswers, setShowAnswers] = useState(false);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 p-0 sm:p-8 print:p-0 font-serif">
            {/* Header - Hidden on Print */}
            <div className="flex justify-between items-center mb-8 print:hidden px-4">
                <button 
                    onClick={onBack}
                    className="text-slate-500 hover:text-slate-800 font-bold flex items-center gap-2"
                >
                    <span>←</span> {ui.backBtn || "Tillbaka"}
                </button>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowAnswers(!showAnswers)}
                        className={`px-4 py-2 rounded-lg font-bold text-sm border transition-all ${
                            showAnswers ? 'bg-orange-100 border-orange-200 text-orange-700' : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}
                    >
                        {showAnswers ? "Dölj Svar" : "Visa Svar"}
                    </button>
                    <button 
                        onClick={handlePrint}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all flex items-center gap-2"
                    >
                        <span>🖨️</span> Skriv ut / PDF
                    </button>
                </div>
            </div>

            {/* Worksheet Content */}
            <div className="max-w-4xl mx-auto border-gray-200 sm:border print:border-0 p-8 sm:rounded-2xl bg-white shadow-sm print:shadow-none">
                {/* School Header Section */}
                <div className="border-b-2 border-slate-900 pb-4 mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight font-sans">Matematik - Arbetsblad</h1>
                        <p className="text-slate-500 font-medium mt-2">Namn: ____________________________________</p>
                    </div>
                    <div className="text-right text-xs font-mono text-slate-400">
                        ANPASSA ENGINE v1.0
                    </div>
                </div>

                {/* Questions Grid */}
                <div className="grid grid-cols-1 gap-12">
                    {questions.map((q, i) => {
                        const desc = typeof q.renderData.description === 'object' ? q.renderData.description[lang] : q.renderData.description;
                        return (
                            <div key={i} className="relative break-inside-avoid border-b border-slate-100 pb-10 last:border-0">
                                <div className="flex items-start gap-4">
                                    <span className="bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 font-sans">
                                        {i + 1}
                                    </span>
                                    <div className="flex-1 space-y-6">
                                        <div className="text-xl font-medium leading-relaxed">
                                            <MathText text={desc} />
                                        </div>

                                        {q.renderData.latex && (
                                            <div className="py-2 text-2xl flex justify-center">
                                                <MathText text={`$${q.renderData.latex}$`} large={true} />
                                            </div>
                                        )}

                                        {/* Visualization Support - Shared Logic */}
                                        {q.renderData.graph && (
                                            <div className="flex justify-center border-2 border-slate-100 rounded-xl p-4 bg-slate-50/20">
                                                <GraphCanvas data={q.renderData.graph} size={350} />
                                            </div>
                                        )}
                                        {q.renderData.geometry && (
                                            <div className="flex justify-center my-4">
                                                {q.renderData.geometry.type === 'cuboid' ? (
                                                    <VolumeVisualization data={q.renderData.geometry} />
                                                ) : (
                                                    <GeometryVisual data={q.renderData.geometry} />
                                                )}
                                            </div>
                                        )}

                                        {/* Work Area Box */}
                                        <div className="h-40 border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center text-slate-200 text-xs uppercase font-bold tracking-widest font-sans">
                                            Redovisning / Uträkning
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Overlay answers for on-screen review */}
                                {showAnswers && (
                                    <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 rounded-lg text-sm font-bold border border-emerald-100 print:hidden font-sans">
                                        Svar: <MathText text={q.serverData?.answer || "Se facit"} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Separate Answer Key for Print */}
                <div className="hidden print:block mt-20" style={{ pageBreakBefore: 'always' }}>
                    <div className="border-t-4 border-slate-900 pt-8">
                        <h2 className="text-2xl font-black mb-8 font-sans uppercase">Facit - Arbetsblad</h2>
                        <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                            {questions.map((q, i) => (
                                <div key={i} className="flex gap-4 border-b border-slate-100 pb-3 items-center">
                                    <span className="font-black text-slate-400 font-sans">{i + 1}.</span>
                                    <div className="font-medium text-lg">
                                        <MathText text={q.serverData?.answer || "N/A"} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorksheetView;