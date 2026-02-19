import React, { useState, useEffect, useRef } from 'react';
import { Send, CheckCircle2, ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

// --- VISUAL COMPONENT IMPORTS ---
import { GeometryVisual, GraphCanvas, VolumeVisualization } from '../visuals/GeometryComponents';
import { TransversalVisual, CompositeVisual } from '../visuals/ComplexGeometry';
import PatternVisual from '../visuals/PatternComponents';
import ProbabilityTree from '../visuals/ProbabilityTree';
import { ProbabilityMarbles, ProbabilitySpinner } from '../visuals/ProbabilityVisuals';
import { ScaleVisual, SimilarityCompare, CompareShapesArea } from '../visuals/ScaleVisuals';
import { FrequencyTable, PercentGrid } from '../visuals/StatisticsVisuals';
import AngleVisual from '../visuals/AngleComponents';

// --- MATH INPUT IMPORTS ---
// Matching the directory structure used in your current project
import { FractionInput, ExponentInput, ScientificInput } from '../ui/InputComponents';

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
                    throwOnError: false, trust: true
                });
            }
        };
        const timer = setTimeout(renderMath, 30);
        return () => clearTimeout(timer);
    }, [content]);
    return <div ref={containerRef} className={`math-content leading-relaxed whitespace-pre-wrap ${className}`} />;
};

export default function StudentLiveView({ session, packet, lang = 'sv', studentAlias, onBack }) {
    const [answers, setAnswers] = useState({});
    const [completed, setCompleted] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- RENDER VISUAL HELPER ---
    const renderVisual = (item) => {
        const data = item.resolvedData?.renderData;
        if (!data) return null;

        if (data.graph) return <GraphCanvas data={data.graph} />;
        if (data.geometry && ['cylinder', 'cuboid', 'sphere', 'cone', 'pyramid', 'triangular_prism'].includes(data.geometry.type)) {
            return <VolumeVisualization data={data.geometry} width={240} height={200} />;
        }
        if (data.geometry?.type === 'transversal') return <TransversalVisual data={data.geometry} />;
        if (data.geometry?.type === 'composite') return <CompositeVisual data={data.geometry} />;
        if (data.geometry?.type === 'angle') return <AngleVisual data={data.geometry} />;
        if (data.pattern) return <PatternVisual data={data.pattern} />;
        if (data.probTree) return <ProbabilityTree data={data.probTree} />;
        if (data.marbles) return <ProbabilityMarbles data={data.marbles} />;
        if (data.spinner) return <ProbabilitySpinner data={data.spinner} />;
        if (data.freqTable) return <FrequencyTable data={data.freqTable} />;
        if (data.percentGrid) return <PercentGrid data={data.percentGrid} />;
        if (data.scale) return <ScaleVisual data={data.scale} />;
        if (data.similarity) return <SimilarityCompare data={data.similarity} />;
        if (data.compareArea) return <CompareShapesArea data={data.compareArea} />;

        return null;
    };

    // --- RENDER INPUT HELPER (FIXED: Properly extracting inputType) ---
    const renderInput = (item, idx) => {
        // FIXED: Now checks renderData.answerType and renderData.inputType to match backend generators
        const rd = item.resolvedData?.renderData;
        const inputType = rd?.answerType || rd?.inputType || item.resolvedData?.inputType || 'text';
        
        const value = answers[idx] || '';
        const onChange = (val) => setAnswers({ ...answers, [idx]: val });

        switch (inputType) {
            case 'fraction':
                return <FractionInput value={value} onChange={onChange} allowMixed={true} autoFocus={true} />;
            case 'exponent':
                return <ExponentInput value={value} onChange={onChange} autoFocus={true} />;
            case 'structured_scientific':
            case 'scientific':
                return <ScientificInput value={value} onChange={onChange} autoFocus={true} />;
            default:
                return (
                    <input 
                        type="text" 
                        className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-center font-bold text-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-300 w-full"
                        placeholder="Ditt svar..."
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSolve(idx, value)}
                    />
                );
        }
    };

    const handleSolve = async (idx, val) => {
        if (!val || isSubmitting) return;
        
        // Normalizing values for comparison (removes spaces, converts to lowercase, handles base64 tokens)
        const normalize = (str) => String(str).toLowerCase().replace(/\s+/g, '').replace(',', '.');
        
        // Correct answer check: handles both direct comparisons and base64 encoded tokens from the API
        let correctAnswer = packet[idx].resolvedData?.answer;
        if (!correctAnswer && packet[idx].resolvedData?.token) {
            try {
                correctAnswer = atob(packet[idx].resolvedData.token);
            } catch (e) {
                console.error("Token decode error", e);
            }
        }
        
        const isCorrect = normalize(val) === normalize(correctAnswer);
        
        setIsSubmitting(true);
        try {
            const { error } = await supabase.from('responses').insert([{
                room_id: session.id,
                student_alias: studentAlias || "Anonym",
                question_index: idx,
                answer: String(val),
                is_correct: isCorrect
            }]);

            if (error) throw error;
            setCompleted(prev => ({ ...prev, [idx]: isCorrect ? 'correct' : 'wrong' }));
        } catch (err) {
            console.error("Submission error:", err);
            alert("Kunde inte skicka svar.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100">
            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-sm">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-sm font-black uppercase italic text-slate-900 tracking-tighter leading-none">
                                {session.title || "Live Session"}
                            </h1>
                            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">
                                {studentAlias}
                            </p>
                        </div>
                    </div>
                    <div className="bg-slate-900 px-3 py-1 rounded-lg text-[10px] font-black text-white tracking-widest uppercase">
                        {session.class_code}
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-4 md:p-8 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {packet.map((item, idx) => {
                        const status = completed[idx];
                        return (
                            <div 
                                key={item.id} 
                                className={`group bg-white rounded-[2.5rem] shadow-sm border-2 transition-all duration-300 flex flex-col overflow-hidden
                                    ${status === 'correct' ? 'border-emerald-500 shadow-emerald-100' : 
                                      status === 'wrong' ? 'border-rose-400 shadow-rose-100' : 
                                      'border-slate-100 hover:border-indigo-200 hover:shadow-xl'}`}
                            >
                                <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Uppgift {idx + 1}</span>
                                    {status === 'correct' && <CheckCircle2 className="text-emerald-500" size={18} />}
                                    {status === 'wrong' && <AlertCircle className="text-rose-500" size={18} />}
                                </div>

                                <div className="p-6 flex-1 flex flex-col items-center justify-center space-y-6">
                                    <div className="w-full flex justify-center scale-95 origin-center">
                                        {renderVisual(item)}
                                    </div>
                                    
                                    <div className="text-lg font-bold text-slate-800 text-center leading-relaxed w-full">
                                        <MathDisplay content={item.resolvedData?.renderData?.description} />
                                        {item.resolvedData?.renderData?.latex && (
                                            <div className="mt-4 text-2xl text-indigo-600 font-serif">
                                                <MathDisplay content={`$$${item.resolvedData.renderData.latex}$$`} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={`p-6 border-t transition-colors ${status ? 'bg-slate-50' : 'bg-white'}`}>
                                    {status ? (
                                        <div className="py-2 text-center">
                                            <span className={`text-xs font-black uppercase tracking-widest ${status === 'correct' ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                {status === 'correct' ? 'Korrekt Svar!' : 'Svar Skickat'}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-full flex justify-center min-h-[60px]">
                                                {renderInput(item, idx)}
                                            </div>
                                            <button 
                                                onClick={() => handleSolve(idx, answers[idx])}
                                                disabled={isSubmitting || !answers[idx]}
                                                className="w-full bg-slate-900 text-white py-4 rounded-2xl hover:bg-indigo-600 transition-all font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><Send size={18} /> Skicka Svar</>}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}