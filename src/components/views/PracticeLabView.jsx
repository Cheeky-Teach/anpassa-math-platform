import React, { useState, useEffect, useRef } from 'react';
import { 
    Loader2, ChevronLeft, Beaker, Play, Check, 
    ChevronDown, Settings2, Zap, ArrowRight, 
    RefreshCcw, Eye, Clock, Lock, Send, ListChecks, LayoutGrid, XCircle, ChevronRight, LogOut, CheckCircle2
} from 'lucide-react';
import { decodeConfig, encodeConfig } from '../../core/utils/labCodeUtils';
import { CATEGORIES } from '../../constants/localization';

// --- SHARED UI COMPONENTS ---
import MathText from '../ui/MathText';
import { GeometryVisual, GraphCanvas, VolumeVisualization } from '../visuals/GeometryComponents';
import { TransversalVisual, CompositeVisual } from '../visuals/ComplexGeometry';
import PatternVisual from '../visuals/PatternComponents';
import ProbabilityTree from '../visuals/ProbabilityTree';
import { ProbabilityMarbles, ProbabilitySpinner } from '../visuals/ProbabilityVisuals';
import { ScaleVisual, SimilarityCompare, CompareShapesArea } from '../visuals/ScaleVisuals';
import { FrequencyTable, PercentGrid } from '../visuals/StatisticsVisuals';
import AngleVisual from '../visuals/AngleComponents';
import { FractionInput, ExponentInput, ScientificInput } from '../ui/InputComponents';

// --- MATH RENDERING HELPER ---
const MathDisplay = ({ content, className = "" }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!content || !containerRef.current) return;
        
        const renderMath = () => {
            if (containerRef.current) {
                // Set the text first
                containerRef.current.innerText = content;
                // Trigger KaTeX if available on the window
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
            }
        };

        // Short timeout ensures the DOM has painted before KaTeX scans it
        const timer = setTimeout(renderMath, 50);
        return () => clearTimeout(timer);
    }, [content]);

    return (
        <div 
            ref={containerRef} 
            className={`math-content leading-relaxed whitespace-pre-wrap min-h-[1.5em] ${className}`} 
        />
    );
};

const LAB_TEXT = {
    sv: {
        title: "Practice Lab", 
        testCode: "Testkod", 
        modeExam: "Provläge", 
        modePractice: "Övningsläge",
        startBtn: "Starta Test", 
        selectedAreas: "valda områden", 
        level: "Nivå", 
        back: "Tillbaka",
        loading: "Laddar...", 
        milestoneTitle: "Dags för en paus!", 
        continueBtn: "Nästa Etapp",
        cooldown: "Vänta...", 
        showAnswers: "Visa rätt svar", 
        quit: "Avbryt Passet",
        answerReceived: "Svar mottaget", 
        nextArr: "Fortsätt med pilen", 
        finish: "Avsluta & Se Resultat",
        summaryTitle: "Testrapport", 
        recoveryTitle: "Rekommenderad träning", 
        recoveryDesc: "Fokusera på dina svagaste områden."
    },
    en: {
        title: "Practice Lab", 
        testCode: "Test Code", 
        modeExam: "Exam Mode", 
        modePractice: "Practice Mode",
        startBtn: "Start Test", 
        selectedAreas: "selected areas", 
        level: "Level", 
        back: "Back",
        loading: "Loading...", 
        milestoneTitle: "Time for a break!", 
        continueBtn: "Next Stage",
        cooldown: "Wait...", 
        showAnswers: "Show answers", 
        quit: "Quit Session",
        answerReceived: "Answer received", 
        nextArr: "Continue using arrows", 
        finish: "Finish & See Results",
        summaryTitle: "Test Report", 
        recoveryTitle: "Recommended Practice", 
        recoveryDesc: "Focus on your weakest areas."
    }
};

export default function PracticeLabView({ configCode, profile, lang = 'sv', onBack }) {
    const t = LAB_TEXT[lang] || LAB_TEXT.sv;

    // --- STATE ---
    const [internalMode, setInternalMode] = useState('LOADING'); 
    const [selection, setSelection] = useState({});
    const [meta, setMeta] = useState({ mode: 'practice', limit: 0, globalMaxLevel: 9 });
    const [packet, setPacket] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [responses, setResponses] = useState({}); 
    const [isGenerating, setIsGenerating] = useState(false);
    const [showMilestone, setShowMilestone] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const [activeCategory, setActiveCategory] = useState(null);
    const [revealMilestoneAnswers, setRevealMilestoneAnswers] = useState(false);

    // --- CORE LOGIC ---
    const fetchNextSprint = async () => {
        setIsGenerating(true);
        try {
            const enabledTopics = Object.keys(selection).filter(id => selection[id].enabled);
            const requests = Array.from({ length: 15 }).map(() => {
                const topicId = enabledTopics[Math.floor(Math.random() * enabledTopics.length)];
                const conf = selection[topicId];
                return { topic: topicId, level: Math.floor(Math.random() * (conf.max - conf.min + 1)) + conf.min, lang };
            });

            const res = await fetch('/api/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requests })
            });
            const newQuestions = await res.json();
            setPacket(prev => [...prev, ...newQuestions]);
        } catch (err) { console.error(err); } finally { setIsGenerating(false); }
    };

    // Input helper for multiple choice
    const renderInput = () => {
        const rd = packet[currentIndex]?.resolvedData?.renderData;
        
        // A. Check for Multiple Choice Options
        if (rd?.options && Array.isArray(rd.options)) {
            return (
                <div className="grid grid-cols-1 gap-3 w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {rd.options.map((opt, i) => (
                        <button
                            key={i}
                            onClick={() => handleLabSubmit(opt)}
                            className="w-full p-5 bg-white border-2 border-slate-100 rounded-2xl text-lg font-bold text-slate-700 hover:border-indigo-600 hover:bg-indigo-50 transition-all shadow-sm text-center active:scale-95"
                        >
                            <MathDisplay content={String(opt)} />
                        </button>
                    ))}
                </div>
            );
        }

        // B. Fallback to specialized Math Inputs
        const type = rd?.answerType || 'text';
        if (type === 'fraction') return <FractionInput value={inputValue} onChange={setInputValue} autoFocus />;
        if (type === 'exponent') return <ExponentInput value={inputValue} onChange={setInputValue} autoFocus />;

        // C. Default Text Input
        return (
            <input 
                type="text" 
                autoFocus 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLabSubmit()}
                className="w-full bg-slate-100 rounded-2xl px-6 py-4 text-center font-bold text-2xl outline-none focus:ring-4 focus:ring-indigo-500/20 shadow-inner"
                placeholder="..."
            />
        );
    };

    // Answer submit
    const handleLabSubmit = async (manualValue = null) => {
        // Use the manualValue (from buttons) or the state value (from text input)
        const val = manualValue || inputValue;
        const currentQ = packet[currentIndex];
        
        if (!currentQ || !val) return;

        try {
            const res = await fetch('/api/answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    answer: String(val), // Ensure it is a string
                    token: currentQ.resolvedData.token,
                    mode: meta.mode
                })
            });
            const result = await res.json();
            
            setResponses(prev => ({
                ...prev,
                [currentIndex]: { answer: val, isCorrect: result.correct, topicId: currentQ.topic_id }
            }));

            const nextIndex = currentIndex + 1;
            if (nextIndex > 0 && nextIndex % 15 === 0) {
                setCooldown(10);
                setShowMilestone(true);
            } else {
                if (nextIndex === packet.length - 1) fetchNextSprint();
                setCurrentIndex(nextIndex);
                setInputValue(''); // Reset input for the next question
            }
        } catch (err) { console.error("Submission error:", err); }
    };

    const getDiagnosticStats = () => {
        const stats = { arithmetic: { correct: 0, total: 0 }, algebra: { correct: 0, total: 0 }, geometry: { correct: 0, total: 0 }, statistics: { correct: 0, total: 0 } };
        Object.values(responses).forEach(res => {
            const category = Object.values(CATEGORIES).find(cat => cat.topics.some(t => t.id === res.topicId));
            if (category) { stats[category.id].total++; if (res.isCorrect) stats[category.id].correct++; }
        });
        let weakest = null; let minScore = 101;
        Object.entries(stats).forEach(([id, data]) => { if (data.total > 0) { const score = (data.correct / data.total) * 100; if (score < minScore) { minScore = score; weakest = id; } } });
        return { stats, weakest };
    };

    // --- RENDERERS ---
    const renderVisual = (item) => {
        const data = item.resolvedData?.renderData;
        if (!data) return null;

        // 1. Graphs
        if (data.graph) return <GraphCanvas data={data.graph} />;
        
        // 2. Patterns & Sequences
        if (data.pattern || data.geometry?.subtype === 'matchsticks') {
            return <PatternVisual data={data.pattern || data.geometry} />;
        }
        
        // 3. Probability (Marbles/Spinners/Trees)
        if (data.tree) return <ProbabilityTree data={data.tree} />;
        if (data.marbles || data.geometry?.type === 'marbles') {
            return <ProbabilityMarbles data={data.marbles || data.geometry} />;
        }
        if (data.spinner || data.geometry?.type === 'spinner') {
            return <ProbabilitySpinner data={data.spinner || data.geometry} />;
        }
        
        // 4. Statistics
        if (data.freqTable || data.geometry?.headers) return <FrequencyTable data={data.freqTable || data.geometry} />;
        if (data.percentGrid || data.geometry?.type === 'percent_grid') return <PercentGrid data={data.percentGrid || data.geometry} />;

        // 5. Geometry & Volume
        if (data.geometry?.type === 'transversal') return <TransversalVisual data={data.geometry} />;
        if (data.geometry?.type === 'angle') return <AngleVisual data={data.geometry} />;
        if (data.geometry && ['cylinder', 'cuboid', 'sphere', 'cone', 'pyramid'].includes(data.geometry.type)) {
            return <VolumeVisualization data={data.geometry} width={240} height={200} />;
        }
        
        // Default Geometry
        if (data.geometry) return <GeometryVisual data={data.geometry} />;
        
        return null;
    };

    // --- EFFECTS ---
    useEffect(() => {
        if (configCode) {
            const decoded = decodeConfig(configCode);
            if (decoded) { setMeta(decoded.meta); setSelection(decoded.selection); setInternalMode('ACTIVE'); }
            else setInternalMode('SETUP');
        } else setInternalMode('SETUP');
    }, [configCode]);

    useEffect(() => {
        if (internalMode === 'ACTIVE' && packet.length === 0) fetchNextSprint();
    }, [internalMode]);

    useEffect(() => {
        let timer;
        if (showMilestone && cooldown > 0) { timer = setInterval(() => setCooldown(p => p - 1), 1000); }
        return () => clearInterval(timer);
    }, [showMilestone, cooldown]);

    if (internalMode === 'LOADING') return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={48} /></div>;

    // --- 1. SETUP UI ---
    if (internalMode === 'SETUP') {
        const currentTestCode = encodeConfig({ meta, selection });
        return (
            <div className="max-w-5xl mx-auto w-full p-4 pb-20 animate-in fade-in duration-500">
                <header className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><ChevronLeft size={20} /></button>
                            <h1 className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase">{t.title}</h1>
                        </div>
                        <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-2xl border-2 border-indigo-100">
                            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">{t.testCode}:</span>
                            <code className="text-indigo-600 font-black tracking-widest text-lg">{currentTestCode}</code>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setMeta(p => ({ ...p, mode: p.mode === 'exam' ? 'practice' : 'exam' }))} className={`px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all border-b-4 ${meta.mode === 'exam' ? 'bg-rose-500 border-rose-700 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>{meta.mode === 'exam' ? t.modeExam : t.modePractice}</button>
                        <button onClick={() => setInternalMode('ACTIVE')} disabled={Object.keys(selection).length === 0} className="bg-indigo-600 border-indigo-800 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest border-b-4 hover:scale-105 active:translate-y-1 transition-all flex items-center gap-2 disabled:opacity-30"><Play size={14} /> {t.startBtn}</button>
                    </div>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.values(CATEGORIES).map(cat => (
                        <div key={cat.id} className="flex flex-col gap-2">
                            <button onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)} className={`p-6 rounded-[2.5rem] border-4 transition-all text-left ${activeCategory === cat.id ? `bg-white border-${cat.color}-500 shadow-xl` : `bg-white border-slate-100 shadow-md`}`}>
                                <div className="flex justify-between items-center"><h3 className="font-black uppercase italic tracking-tighter text-2xl text-slate-900">{cat.label[lang]}</h3><ChevronDown size={20} className={activeCategory === cat.id ? 'rotate-180' : ''} /></div>
                            </button>
                            {activeCategory === cat.id && (
                                <div className="p-4 bg-white/50 rounded-[2rem] border-2 border-dashed border-slate-200 space-y-3">
                                    {cat.topics.map(topic => (
                                        <div key={topic.id} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                                            <button onClick={() => setSelection(p => p[topic.id]?.enabled ? { ...p, [topic.id]: { ...p[topic.id], enabled: false } } : { ...p, [topic.id]: { enabled: true, min: 1, max: cat.levels } })} className={`w-6 h-6 rounded-lg flex items-center justify-center ${selection[topic.id]?.enabled ? `bg-${cat.color}-500 text-white` : 'bg-slate-100 text-transparent'}`}><Check size={14}/></button>
                                            <span className="flex-1 text-xs font-bold text-slate-700">{topic.label[lang]}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // --- 2. ACTIVE TEST UI ---
    if (internalMode === 'ACTIVE') {
        const q = packet[currentIndex];
        
        return (
            <div className="min-h-screen bg-slate-50 font-sans flex flex-col overflow-hidden">
                <header className="bg-white border-b border-slate-200 px-4 py-2 sticky top-0 z-20 shadow-sm">
                    <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
                        <button onClick={() => setCurrentIndex(p => Math.max(0, p - 1))} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"><ChevronLeft size={28} /></button>
                        <div className="flex flex-col items-center">
                            <h1 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{t.title}</h1>
                            <div className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase italic tracking-widest">{currentIndex + 1} / {meta.limit || "∞"}</div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setCurrentIndex(p => Math.min(packet.length - 1, p + 1))} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"><ChevronRight size={28} /></button>
                            <button onClick={onBack} className="p-2 text-slate-300 hover:text-rose-500 rounded-xl border border-slate-100 transition-all"><LogOut size={18} /></button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 max-w-6xl w-full mx-auto p-3 lg:p-6 overflow-hidden flex flex-col relative">
                    <div className={`flex-1 bg-white rounded-[2rem] lg:rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col ${responses[currentIndex] ? 'opacity-40 scale-[0.98] pointer-events-none' : ''}`}>
                        <div className="px-8 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{q?.topic_id} • {t.level} {q?.resolvedData?.level}</span>
                            {responses[currentIndex] && <div className="flex items-center gap-2"><span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">{t.answerReceived}</span><CheckCircle2 size={20} className="text-emerald-500" /></div>}
                        </div>

                        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 lg:divide-x divide-slate-50 min-h-0">
                            <div className="flex flex-col order-1 lg:order-2 h-full overflow-hidden">
                                <div className="p-6 lg:p-12 flex-1 flex flex-col justify-center space-y-6 overflow-y-auto">
                                    <div className="text-xl lg:text-3xl font-bold text-slate-800 leading-relaxed text-center lg:text-left">
                                        {/* Always render the description text */}
                                        <MathDisplay content={q?.resolvedData?.renderData?.description} />
                                        
                                        {/* Explicitly render the LaTeX block if it exists (the "Math Box") */}
                                        {q?.resolvedData?.renderData?.latex && (
                                            <div className="mt-6 text-3xl lg:text-5xl text-indigo-600 font-serif border-t border-slate-100 pt-6">
                                                <MathDisplay content={`$$${q.resolvedData.renderData.latex}$$`} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="p-6 lg:p-10 bg-slate-50/30 border-t border-slate-100">
                                    {!responses[currentIndex] ? (
                                        <div className="max-w-md mx-auto space-y-4">
                                            {/* 1. This now handles both Multiple Choice and Text/Math inputs */}
                                            {renderInput()}
                                            
                                            {/* 2. Only show the Submit button if it is NOT a multiple choice question */}
                                            {!(packet[currentIndex]?.resolvedData?.renderData?.options) && (
                                                <button 
                                                    onClick={() => handleLabSubmit()} 
                                                    disabled={!inputValue} 
                                                    className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 disabled:opacity-20 flex items-center justify-center gap-3 transition-all"
                                                >
                                                    <Send size={20} /> {lang === 'sv' ? "Svara" : "Submit"}
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="py-4 text-center">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-pulse italic">
                                                {t.nextArr}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {q?.resolvedData?.renderData && (q.resolvedData.renderData.graph || q.resolvedData.renderData.geometry) ? (
                                <div className="p-6 lg:p-12 flex items-center justify-center bg-white order-2 lg:order-1 h-full border-t lg:border-t-0 border-slate-50"><div className="w-full h-full flex items-center justify-center transform scale-90 lg:scale-125">{renderVisual(q)}</div></div>
                            ) : null}
                        </div>
                    </div>

                    {showMilestone && (
                        <div className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 rounded-[2rem] lg:rounded-[3.5rem]">
                            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-10 text-center animate-in zoom-in-95">
                                <Beaker size={64} className="text-indigo-600 mx-auto mb-6" /><h2 className="text-3xl font-black uppercase italic mb-6">{t.milestoneTitle}</h2>
                                <div className="flex justify-center gap-4 mb-10"><button onClick={() => setInternalMode('SUMMARY')} className="px-6 py-4 bg-rose-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-rose-600">{t.finish}</button><button disabled={cooldown > 0} onClick={() => { setShowMilestone(false); setCurrentIndex(currentIndex + 1); setInputValue(''); }} className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest disabled:opacity-50">{cooldown > 0 ? `${t.cooldown} (${cooldown}s)` : t.continueBtn}</button></div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        );
    }

    // --- 3. SUMMARY UI ---
    if (internalMode === 'SUMMARY') {
        const { stats, weakest } = getDiagnosticStats();
        return (
            <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center py-12 animate-in fade-in">
                <div className="w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border-b-[12px] border-slate-200">
                    <div className="p-10 bg-slate-900 text-white flex justify-between items-center"><div><h2 className="text-3xl font-black italic tracking-tighter uppercase mb-1">{t.summaryTitle}</h2><p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{Object.keys(responses).length} {lang === 'sv' ? 'uppgifter' : 'tasks'}</p></div><Beaker size={48} className="text-indigo-400 opacity-20" /></div>
                    <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(stats).map(([id, data]) => {
                            if (data.total === 0) return null;
                            const score = Math.round((data.correct / data.total) * 100); const cat = CATEGORIES[id];
                            return (
                                <div key={id} className={`p-8 rounded-[2.5rem] border-4 border-${cat.color}-100 bg-${cat.color}-50/30 flex flex-col gap-4`}>
                                    <div className="flex justify-between items-center"><h4 className="font-black uppercase italic text-sm text-slate-800">{cat.label[lang]}</h4><span className={`text-xl font-black text-${cat.color}-600`}>{score}%</span></div>
                                    <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-slate-100"><div className={`h-full bg-${cat.color}-500 transition-all duration-1000`} style={{ width: `${score}%` }} /></div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-center"><button onClick={onBack} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest">{t.back}</button></div>
                </div>
            </div>
        );
    }
}