import React, { useState, useEffect, useRef } from 'react';
import { Send, CheckCircle2, ChevronLeft, ChevronRight, Loader2, LogOut, ListChecks, LayoutGrid, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

// --- VISUAL & INPUT IMPORTS ---
import { GeometryVisual, GraphCanvas, VolumeVisualization } from '../visuals/GeometryComponents';
import { TransversalVisual, CompositeVisual } from '../visuals/ComplexGeometry';
import PatternVisual from '../visuals/PatternComponents';
import ProbabilityTree from '../visuals/ProbabilityTree';
import { ProbabilityMarbles, ProbabilitySpinner } from '../visuals/ProbabilityVisuals';
import { ScaleVisual, SimilarityCompare, CompareShapesArea } from '../visuals/ScaleVisuals';
import { FrequencyTable, PercentGrid } from '../visuals/StatisticsVisuals';
import AngleVisual from '../visuals/AngleComponents';
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
    // Logic & Navigation State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [completed, setCompleted] = useState({}); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roomActive, setRoomActive] = useState(true);
    const [showFinalReview, setShowFinalReview] = useState(false);

    // --- 1. THE KILL SWITCH ---
    useEffect(() => {
        if (!session?.id) return;
        const roomChannel = supabase.channel(`room_status_${session.id}`)
            .on('postgres_changes', { 
                event: 'UPDATE', 
                schema: 'public', 
                table: 'rooms', 
                filter: `id=eq.${session.id}` 
            }, (payload) => {
                if (payload.new.status === 'closed') {
                    setRoomActive(false);
                    setTimeout(onBack, 4000);
                }
            })
            .subscribe();
        return () => { supabase.removeChannel(roomChannel); };
    }, [session?.id, onBack]);

    // --- 2. RELAXED INPUT SHIELDING ---
    const sanitizeInput = (val, type) => {
        let str = String(val).replace(/<[^>]*>?/gm, ''); // Protect against scripts
        if (type === 'fraction') return str.replace(/[^0-9\s/]/g, '');
        if (type === 'scientific' || type === 'exponent') return str.replace(/[^0-9.,\-*^x]/g, '');
        
        // UPDATED: Now allows / for k-values and : for ratios
        return str.replace(/[^0-9.,\-xy=/: ]/gi, '');
    };

    // SECURITY: Refactored to handle scrubbed payloads
    const handleSolve = async () => {
        const val = answers[currentIndex];
        if (!val || isSubmitting || !roomActive) return;
        
        const normalize = (str) => String(str).toLowerCase().replace(/\s+/g, '').replace(',', '.');
        
        // 1. Attempt to get the answer from the scrubbed payload pattern
        let correctAnswer = packet[currentIndex].resolvedData?.answer;
        
        // 2. Decode the Base64 token if the raw answer is missing
        if (!correctAnswer && packet[currentIndex].resolvedData?.token) {
            try { 
                correctAnswer = atob(packet[currentIndex].resolvedData.token); 
            } catch (e) {
                console.warn("StudentLiveView: Could not decode solution token.");
            }
        }
        
        const isCorrect = normalize(val) === normalize(correctAnswer);
        setIsSubmitting(true);

        try {
            const { error } = await supabase.from('responses').insert([{
                room_id: session.id,
                student_alias: (studentAlias || "Anonym").replace(/<[^>]*>?/gm, '').substring(0, 25), // Sanitize Alias
                question_index: currentIndex,
                answer: String(val).substring(0, 20), // Enforce 20-char limit
                is_correct: isCorrect
            }]);
            if (error) throw error;
            
            setCompleted(prev => ({ ...prev, [currentIndex]: isCorrect ? 'correct' : 'wrong' }));
            
            // Advance automatically after a short delay
            if (currentIndex < packet.length - 1) {
                setTimeout(() => setCurrentIndex(prev => prev + 1), 600);
            }
        } catch (err) {
            console.error("Submission error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- 3. HARDENED VISUAL RENDERING ---
    const renderVisual = (item) => {
        const data = item.resolvedData?.renderData;
        if (!data) return null;

        // Visual mapping: Expanded to handle nested geometry data
        if (data.graph) return <GraphCanvas data={data.graph} />;
        
        // Patterns (Matchsticks and Sequences)
        if (data.pattern || data.geometry?.subtype === 'matchsticks' || data.geometry?.subtype === 'sequence') {
            return <PatternVisual data={data.pattern || data.geometry} />;
        }
        
        // Probability (Marbles and Spinners)
        if (data.marbles || data.geometry?.type === 'marbles' || data.geometry?.items) {
            return <ProbabilityMarbles data={data.marbles || data.geometry} />;
        }
        if (data.spinner || data.geometry?.type === 'spinner') {
            return <ProbabilitySpinner data={data.spinner || data.geometry} />;
        }
        
        // Statistics (Tables and Grids)
        if (data.freqTable || data.geometry?.type === 'frequency_table' || data.geometry?.headers) {
            return <FrequencyTable data={data.freqTable || data.geometry} />;
        }
        if (data.percentGrid || data.geometry?.type === 'percent_grid') {
            return <PercentGrid data={data.percentGrid || data.geometry} />;
        }

        // Geometry & Volume
        if (data.geometry && ['cylinder', 'cuboid', 'sphere', 'cone', 'pyramid', 'triangular_prism'].includes(data.geometry.type)) {
            return <VolumeVisualization data={data.geometry} width={280} height={220} />;
        }
        if (data.geometry?.type === 'transversal') return <TransversalVisual data={data.geometry} />;
        if (data.geometry?.type === 'composite') return <CompositeVisual data={data.geometry} />;
        if (data.geometry?.type === 'angle') return <AngleVisual data={data.geometry} />;
        if (data.scale || data.geometry?.type === 'scale') return <ScaleVisual data={data.scale || data.geometry} />;
        if (data.similarity || data.geometry?.type === 'similarity') return <SimilarityCompare data={data.similarity || data.geometry} />;
        if (data.compareArea || data.geometry?.type === 'compare_area') return <CompareShapesArea data={data.compareArea || data.geometry} />;
        
        return null;
    };

    const renderInput = (idx = currentIndex) => {
        const item = packet[idx];
        const rd = item.resolvedData?.renderData;
        const inputType = rd?.answerType || rd?.inputType || item.resolvedData?.inputType || 'text';
        const value = answers[idx] || '';

        const handleWrappedChange = (val) => {
            const clean = sanitizeInput(val, inputType);
            setAnswers({ ...answers, [idx]: clean });
        };

        switch (inputType) {
            case 'fraction': return <FractionInput value={value} onChange={handleWrappedChange} allowMixed={true} autoFocus={true} />;
            case 'exponent': return <ExponentInput value={value} onChange={handleWrappedChange} autoFocus={true} />;
            case 'scientific': return <ScientificInput value={value} onChange={handleWrappedChange} autoFocus={true} />;
            default:
                return (
                    <input 
                        type="text" 
                        className="w-full bg-slate-100 border-none rounded-2xl px-6 py-4 text-center font-bold text-2xl outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all placeholder:text-slate-300 shadow-inner"
                        placeholder="Ditt svar..."
                        value={value}
                        maxLength={20}
                        onChange={(e) => handleWrappedChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSolve()}
                    />
                );
        }
    };

    // --- 4. RENDER: FINAL REVIEW GRID ---
    if (showFinalReview) {
        return (
            <div className="min-h-screen bg-slate-50 font-sans p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header className="max-w-6xl mx-auto flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white"><LayoutGrid size={20} /></div>
                        <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-900">Resultatöversikt</h2>
                    </div>
                    <button onClick={onBack} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-indigo-600 transition-all">Stäng</button>
                </header>
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {packet.map((item, idx) => (
                        <div key={item.id} className={`bg-white p-6 rounded-[2.5rem] border-4 shadow-xl flex flex-col ${completed[idx] === 'correct' ? 'border-emerald-500 shadow-emerald-50/50' : 'border-rose-400 shadow-rose-50/50'}`}>
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Uppgift {idx + 1}</span>
                                {completed[idx] === 'correct' ? <CheckCircle2 className="text-emerald-500" size={24} /> : <XCircle className="text-rose-400" size={24} />}
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                                <div className="scale-75 origin-center">{renderVisual(item)}</div>
                                <div className="text-center font-bold text-slate-700 text-sm px-4">
                                    <MathDisplay content={item.resolvedData?.renderData?.description} />
                                </div>
                                <div className={`w-full py-3 rounded-2xl text-center font-black text-sm uppercase tracking-widest ${completed[idx] === 'correct' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                                    Svar: {answers[idx] || '-'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // --- 5. RENDER: SESSION COMPLETE SPLASH ---
    const allDone = Object.keys(completed).length === packet.length;
    if (allDone) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
                <div className="max-w-md w-full bg-white rounded-[3.5rem] p-12 shadow-2xl animate-in zoom-in duration-500 border-b-8 border-indigo-100">
                    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <ListChecks size={40} className="text-indigo-600" />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-2 italic">Aktivitet klar</h2>
                    <p className="text-slate-500 font-medium leading-relaxed mb-10">Alla svar har skickats till din lärare. Bra jobbat med dina insatser!</p>
                    
                    <button onClick={() => setShowFinalReview(true)} className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-[0.15em] hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl">
                        <LayoutGrid size={20} /> Granska resultat
                    </button>
                </div>
            </div>
        );
    }

    // --- 6. RENDER: KILL SWITCH ---
    if (!roomActive) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center animate-in fade-in duration-500">
                <div className="max-w-md bg-white rounded-[3rem] p-10 shadow-2xl border-4 border-rose-500">
                    <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6"><LogOut size={40} className="text-rose-600 ml-1" /></div>
                    <h2 className="text-2xl font-black uppercase text-slate-900 mb-2 tracking-tighter">Sessionen avslutad</h2>
                    <p className="text-slate-500 font-medium leading-relaxed">Läraren har stängt rummet. Du skickas strax vidare.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20 shadow-sm">
                <div className="max-w-3xl mx-auto flex justify-between items-center mb-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"><ChevronLeft size={24} /></button>
                    <div className="text-center">
                        <h1 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-1 leading-none">{session.title}</h1>
                        <div className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[10px] font-black tracking-widest inline-block uppercase italic">KOD: {session.class_code}</div>
                    </div>
                    <div className="w-10" />
                </div>
                {/* Visual Progress Bar */}
                <div className="max-w-3xl mx-auto h-2 bg-slate-100 rounded-full flex gap-1.5 p-0.5">
                    {packet.map((_, i) => (
                        <div key={i} className={`flex-1 rounded-full transition-all duration-700 ${i === currentIndex ? 'bg-indigo-500 ring-4 ring-indigo-50' : !!completed[i] ? 'bg-indigo-200' : 'bg-transparent'}`} />
                    ))}
                </div>
            </header>

            <main className="flex-1 max-w-3xl w-full mx-auto p-4 flex flex-col justify-center pb-32">
                <div className={`bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden transition-all duration-300 ${!!completed[currentIndex] ? 'opacity-40 scale-[0.98] pointer-events-none' : ''}`}>
                    <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.25em]">Uppgift {currentIndex + 1} / {packet.length}</span>
                        {!!completed[currentIndex] && <CheckCircle2 className="text-emerald-500" size={24} />}
                    </div>

                    <div className="p-8 space-y-8 flex flex-col items-center min-h-[420px] justify-center">
                        <div className="w-full flex justify-center py-4 drop-shadow-sm">{renderVisual(packet[currentIndex])}</div>
                        <div className="text-2xl font-bold text-slate-800 text-center leading-relaxed max-w-lg">
                            <MathDisplay content={packet[currentIndex].resolvedData?.renderData?.description} />
                            {packet[currentIndex].resolvedData?.renderData?.latex && (
                                <div className="mt-8 text-4xl text-indigo-600 font-serif">
                                    <MathDisplay content={`$$${packet[currentIndex].resolvedData.renderData.latex}$$`} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-10 bg-slate-50/50 border-t border-slate-100">
                        {!!completed[currentIndex] ? (
                            <div className="py-6 text-center flex flex-col items-center gap-2">
                                <span className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600 italic">Svar mottaget</span>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Fortsätt med nästa pil</p>
                            </div>
                        ) : (
                            <div className="max-w-md mx-auto space-y-6">
                                {renderInput()}
                                <button 
                                    onClick={handleSolve} 
                                    disabled={isSubmitting || !answers[currentIndex]} 
                                    className="w-full bg-slate-900 text-white py-5 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.25em] shadow-[0_15px_30px_rgba(15,23,42,0.15)] active:scale-95 disabled:opacity-20 flex items-center justify-center gap-3 transition-all"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Send size={20} /> Skicka Svar</>}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Navigation Controls */}
                <div className="mt-12 flex justify-between items-center px-6">
                    <button 
                        onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentIndex === 0}
                        className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 disabled:opacity-0 transition-all"
                    >
                        <ChevronLeft size={24} /> Föregående
                    </button>
                    
                    <div className="flex gap-2.5">
                        {packet.map((_, i) => (
                            <button 
                                key={i} 
                                onClick={() => setCurrentIndex(i)} 
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-slate-900 w-8 shadow-md shadow-slate-200' : 'bg-slate-200'}`} 
                            />
                        ))}
                    </div>

                    <button 
                        onClick={() => setCurrentIndex(prev => Math.min(packet.length - 1, prev + 1))}
                        disabled={currentIndex === packet.length - 1}
                        className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 disabled:opacity-0 transition-all"
                    >
                        Nästa <ChevronRight size={24} />
                    </button>
                </div>
            </main>
        </div>
    );
}