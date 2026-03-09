import React, { useState, useEffect, useRef } from 'react';
import { 
    Loader2, ChevronLeft, Beaker, Play, Check, 
    ChevronDown, Settings2, Zap, ArrowRight, 
    RefreshCcw, Eye, Clock, Lock, Send, ListChecks, LayoutGrid, XCircle, ChevronRight, LogOut, CheckCircle2, Award
} from 'lucide-react';
import { decodeConfig, encodeConfig } from '../../core/utils/labCodeUtils';
// Added LEVEL_DESCRIPTIONS to imports
import { CATEGORIES, LEVEL_DESCRIPTIONS } from '../../constants/localization';

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

// --- STYLING CONSTANTS (Matched with Dashboard.jsx) ---
const COLOR_VARIANTS = {
    pink: { bgLight: 'bg-pink-50', bgDark: 'bg-pink-500', border: 'border-pink-100', text: 'text-pink-700', ring: 'ring-pink-500', borderSolid: 'border-pink-500', icon: 'text-pink-500' },
    indigo: { bgLight: 'bg-indigo-50', bgDark: 'bg-indigo-500', border: 'border-indigo-100', text: 'text-indigo-700', ring: 'ring-indigo-500', borderSolid: 'border-indigo-500', icon: 'text-indigo-500' },
    emerald: { bgLight: 'bg-emerald-50', bgDark: 'bg-emerald-600', border: 'border-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-500', borderSolid: 'border-emerald-600', icon: 'text-emerald-600' },
    purple: { bgLight: 'bg-purple-50', bgDark: 'bg-purple-500', border: 'border-purple-100', text: 'text-purple-700', ring: 'ring-purple-500', borderSolid: 'border-purple-500', icon: 'text-purple-500' },
    yellow: { bgLight: 'bg-amber-50', bgDark: 'bg-amber-500', border: 'border-amber-100', text: 'text-amber-700', ring: 'ring-amber-500', borderSolid: 'border-amber-500', icon: 'text-amber-500' }
};

// --- MATH RENDERING HELPER ---
const MathDisplay = ({ content, className = "" }) => {
    const containerRef = useRef(null);
    useEffect(() => {
        if (!content || !containerRef.current) return;
        const renderMath = () => {
            if (containerRef.current) {
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
            }
        };
        const timer = setTimeout(renderMath, 50);
        return () => clearTimeout(timer);
    }, [content]);
    return <div ref={containerRef} className={`math-content leading-relaxed whitespace-pre-wrap min-h-[1.5em] ${className}`} />;
};

const LAB_TEXT = {
    sv: {
        title: "Practice Lab", testCode: "Testkod", modeExam: "Provläge", modePractice: "Övningsläge",
        startBtn: "Starta Test", selectedAreas: "valda områden", level: "Nivå", back: "Tillbaka",
        loading: "Laddar...", milestoneTitle: "Dags för en paus!", continueBtn: "Nästa Etapp",
        cooldown: "Vänta...", showAnswers: "Visa rätt svar", quit: "Avbryt Passet",
        answerReceived: "Svar mottaget", nextArr: "Fortsätt med pilen", finish: "Avsluta & Se Resultat",
        summaryTitle: "Testrapport", recoveryTitle: "Rekommenderad träning", recoveryDesc: "Fokusera på dina svagaste områden.",
        copyLink: "Kopiera länk", linkCopied: "Länk kopierad till urklipp!"
    },
    en: {
        title: "Practice Lab", testCode: "Test Code", modeExam: "Exam Mode", modePractice: "Practice Mode",
        startBtn: "Start Test", selectedAreas: "selected areas", level: "Level", back: "Back",
        loading: "Loading...", milestoneTitle: "Time for a break!", continueBtn: "Next Stage",
        cooldown: "Wait...", showAnswers: "Show answers", quit: "Quit Session",
        answerReceived: "Answer received", nextArr: "Continue using arrows", finish: "Finish & See Results",
        summaryTitle: "Test Report", recoveryTitle: "Recommended Practice", recoveryDesc: "Focus on your weakest areas.",
        copyLink: "Copy Link", linkCopied: "Link copied to clipboard!"
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

    // --- HELPERS ---
    const getStyles = (category) => COLOR_VARIANTS[category.color || 'indigo'] || COLOR_VARIANTS.indigo;

    const copyTestLink = () => {
        const testCode = encodeConfig({ meta, selection });
        const baseUrl = window.location.origin + "/lab";
        const fullUrl = `${baseUrl}?config=${testCode}`;
        navigator.clipboard.writeText(fullUrl);
        alert(t.linkCopied);
    };

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

    const handleLabSubmit = async (manualValue = null) => {
        const val = manualValue || inputValue;
        const currentQ = packet[currentIndex];
        if (!currentQ || !val) return;

        try {
            const res = await fetch('/api/answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    answer: String(val),
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
                setInputValue('');
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
        if (data.graph) return <GraphCanvas data={data.graph} />;
        if (data.pattern || data.geometry?.subtype === 'matchsticks') return <PatternVisual data={data.pattern || data.geometry} />;
        if (data.tree) return <ProbabilityTree data={data.tree} />;
        if (data.marbles || data.geometry?.type === 'marbles') return <ProbabilityMarbles data={data.marbles || data.geometry} />;
        if (data.spinner || data.geometry?.type === 'spinner') return <ProbabilitySpinner data={data.spinner || data.geometry} />;
        if (data.freqTable || data.geometry?.headers) return <FrequencyTable data={data.freqTable || data.geometry} />;
        if (data.percentGrid || data.geometry?.type === 'percent_grid') return <PercentGrid data={data.percentGrid || data.geometry} />;
        if (data.geometry?.type === 'transversal') return <TransversalVisual data={data.geometry} />;
        if (data.geometry?.type === 'angle') return <AngleVisual data={data.geometry} />;
        if (data.geometry && ['cylinder', 'cuboid', 'sphere', 'cone', 'pyramid'].includes(data.geometry.type)) {
            return <VolumeVisualization data={data.geometry} width={240} height={200} />;
        }
        if (data.geometry) return <GeometryVisual data={data.geometry} />;
        return null;
    };

    const renderInput = () => {
        const rd = packet[currentIndex]?.resolvedData?.renderData;
        if (rd?.options && Array.isArray(rd.options)) {
            return (
                <div className="grid grid-cols-1 gap-3 w-full max-w-md mx-auto">
                    {rd.options.map((opt, i) => (
                        <button key={i} onClick={() => handleLabSubmit(opt)} className="w-full p-5 bg-white border-2 border-slate-100 rounded-2xl text-lg font-bold text-slate-700 hover:border-indigo-600 hover:bg-indigo-50 transition-all shadow-sm text-center active:scale-95"><MathDisplay content={String(opt)} /></button>
                    ))}
                </div>
            );
        }
        const type = rd?.answerType || 'text';
        if (type === 'fraction') return <FractionInput value={inputValue} onChange={setInputValue} autoFocus />;
        if (type === 'exponent') return <ExponentInput value={inputValue} onChange={setInputValue} autoFocus />;
        return <input type="text" autoFocus value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLabSubmit()} className="w-full bg-slate-100 rounded-2xl px-6 py-4 text-center font-bold text-2xl outline-none focus:ring-4 focus:ring-indigo-500/20 shadow-inner" placeholder="..." />;
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

    // --- 1. SETUP UI (Harmonized with Dashboard.jsx) ---
    if (internalMode === 'SETUP') {
        const currentTestCode = encodeConfig({ meta, selection });
        return (
            <div className="max-w-5xl mx-auto w-full p-6 pb-20 animate-in fade-in duration-500 font-sans">
                {/* STICKY HEADER (Continuity with App.jsx) */}
                <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-xl border-b border-emerald-100 px-4 py-3 flex justify-between items-center shadow-sm -mx-6 -mt-6 mb-10">
                    <h1 className="text-xl font-black text-emerald-800 tracking-tighter cursor-pointer uppercase italic" onClick={onBack}>ANPASSA</h1>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.title}</span>
                        <button onClick={onBack} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><LogOut size={20}/></button>
                    </div>
                </header>

                {/* STATUS CARD (Mirroring Dashboard Header) */}
                <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white border border-emerald-100 p-8 rounded-[2.5rem] shadow-xl shadow-emerald-900/5">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-indigo-600 rounded-[1.8rem] flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            <Beaker size={30} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 leading-none mb-1">{t.title}</h1>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{lang === 'sv' ? 'Konfigurera testpass' : 'Configure test session'}</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end bg-indigo-50 px-8 py-5 rounded-[2rem] border border-indigo-100 min-w-[240px]">
                        <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-indigo-800/40 mb-1">{t.testCode}</span>
                        <span className="text-3xl font-black tracking-[0.2em] text-indigo-700 uppercase">{currentTestCode}</span>
                    </div>
                </div>

                {/* GLOBAL CONTROLS (Share & Start) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    {/* Mode Toggle Button */}  
                    <button onClick={() => setMeta(p => ({ ...p, mode: p.mode === 'exam' ? 'practice' : 'exam' }))} className={`p-6 rounded-[2.5rem] border-2 transition-all text-left flex items-center gap-5 ${meta.mode === 'exam' ? 'bg-rose-50 border-rose-200 shadow-lg' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${meta.mode === 'exam' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{meta.mode === 'exam' ? <Lock size={20}/> : <Zap size={20}/>}</div>
                        <div><span className="block font-black text-sm uppercase text-slate-700">{meta.mode === 'exam' ? t.modeExam : t.modePractice}</span><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{meta.mode === 'exam' ? (lang === 'sv' ? 'Dolda resultat' : 'Hidden resultat') : (lang === 'sv' ? 'Direkt feedback' : 'Instant feedback')}</span></div>
                    </button>

                    {/* Share Button */}
                    <button onClick={copyTestLink} className="p-6 bg-white border border-slate-100 rounded-[2.5rem] flex items-center gap-5 shadow-sm hover:border-indigo-600 transition-all text-left">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600"><LayoutGrid size={20}/></div>
                        <div><span className="block font-black text-sm uppercase text-slate-700">{t.copyLink}</span><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'sv' ? 'Dela testet externt' : 'Share test externally'}</span></div>
                    </button>

                    {/* Question Limit Input - Integrated into the grid */}
                    <div className="p-6 bg-white border border-slate-100 rounded-[2.5rem] flex items-center gap-5 shadow-sm">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600"><ListChecks size={20}/></div>
                        <div className="flex-1">
                            <span className="block font-black text-sm uppercase text-slate-700">{lang === 'sv' ? 'Antal frågor' : 'Questions'}</span>
                            <input 
                                type="number" min="1" max="100" value={meta.limit || ''} placeholder="∞" 
                                onChange={(e) => setMeta(p => ({ ...p, limit: parseInt(e.target.value) || 0 }))}
                                className="w-full mt-1 bg-slate-50 border-none rounded-xl px-3 py-1 text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none"
                            />
                        </div>
                    </div>

                    {/* Start Button */}
                    <button onClick={() => setInternalMode('ACTIVE')} disabled={Object.keys(selection).filter(k => selection[k].enabled).length === 0} className="p-4 bg-indigo-600 text-white rounded-[2.5rem] flex items-center justify-between px-6 shadow-xl shadow-indigo-900/10 active:scale-95 disabled:opacity-30 transition-all">
                        <div className="flex items-center gap-3"><Play size={20} fill="currentColor"/><p className="font-black uppercase text-[10px] tracking-widest">{Object.keys(selection).filter(k => selection[k].enabled).length} {t.selectedAreas}</p></div>
                        <span className="font-black uppercase text-[10px] tracking-widest bg-white text-indigo-900 px-4 py-2 rounded-2xl">{t.startBtn}</span>
                    </button>
                </div>

                {/* CATEGORY GRID (Matched with Dashboard Expansion) */}
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    {Object.entries(CATEGORIES).map(([catKey, category]) => {
                        const styles = getStyles(category);
                        const isExpanded = activeCategory === catKey;
                        const count = category.topics.filter(t => selection[t.id]?.enabled).length;

                        return (
                            <div key={catKey} className={`bg-white rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${isExpanded ? `shadow-2xl shadow-emerald-900/10 border-indigo-200` : 'border-slate-100 shadow-sm hover:border-indigo-200'}`}>
                                <button onClick={() => setActiveCategory(isExpanded ? null : catKey)} className={`w-full p-8 flex items-center justify-between text-left ${isExpanded ? 'bg-slate-50/50' : ''}`}>
                                    <div className="flex items-center gap-6">
                                        <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center ${styles.bgDark} text-white shadow-lg`}><Award size={28} /></div>
                                        <div><h3 className="text-xl font-bold text-slate-800 tracking-tight">{category.label[lang]}</h3><p className={`text-[10px] font-bold uppercase tracking-widest ${count > 0 ? styles.text : 'text-slate-400'}`}>{count > 0 ? `${count} ${t.selectedAreas}` : `${category.topics.length} delmoment`}</p></div>
                                    </div>
                                    <ChevronDown size={24} className={`text-slate-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>
                                {isExpanded && (
                                    <div className="p-8 pt-0 grid grid-cols-1 gap-4 animate-in slide-in-from-top-2 duration-300">
                                        {category.topics.map(topic => {
                                            const isEnabled = selection[topic.id]?.enabled;
                                            const currentLvl = selection[topic.id]?.max || 1;
                                            const levelInfo = LEVEL_DESCRIPTIONS[topic.id]?.[currentLvl]?.[lang] || "...";

                                            return (
                                                <div key={topic.id} className={`p-6 rounded-[2rem] border transition-all ${isEnabled ? `border-indigo-200 bg-indigo-50/30` : 'border-slate-50 bg-white opacity-60'}`}>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <button onClick={() => setSelection(p => ({ ...p, [topic.id]: { ...p[topic.id], enabled: !isEnabled, min: 1, max: p[topic.id]?.max || category.levels } }))} className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${isEnabled ? styles.bgDark + ' text-white' : 'bg-slate-200 text-transparent'}`}><Check size={14} strokeWidth={4}/></button>
                                                            <span className="font-bold text-sm text-slate-700">{topic.label[lang]}</span>
                                                        </div>
                                                    </div>
                                                    {isEnabled && (
                                                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm animate-in fade-in duration-300">
                                                            <div className="flex justify-between items-center mb-2"><span className="text-[10px] font-black uppercase text-indigo-600 tracking-tighter">Nivå {currentLvl}</span><span className="text-[10px] font-bold text-slate-400 italic text-right max-w-[180px] leading-tight">{levelInfo}</span></div>
                                                            <input type="range" min="1" max={category.levels} step="1" value={currentLvl} onChange={(e) => setSelection(p => ({ ...p, [topic.id]: { ...p[topic.id], max: parseInt(e.target.value) } }))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // --- 2. ACTIVE TEST UI ---
    if (internalMode === 'ACTIVE') {
        // Show a loader if the packet hasn't arrived yet or is generating
        if (packet.length === 0 || isGenerating) {
            return (
                <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
                    <Loader2 className="animate-spin text-indigo-600" size={48} />
                    <p className="text-xs font-black uppercase text-slate-400 tracking-widest">
                        {lang === 'sv' ? "Hämtar uppgifter..." : "Fetching questions..."}
                    </p>
                </div>
            );
        }
        
        const q = packet[currentIndex];

        // Safety check if q is missing due to an API error
        if (!q || !q.resolvedData) {
            return (
                <div className="h-screen flex items-center justify-center">
                    <p className="text-slate-400">Error loading question. Please go back and try again.</p>
                </div>
            );
        }
        return (
            <div className="min-h-screen bg-slate-50 font-sans flex flex-col overflow-hidden">
                <header className="bg-white border-b border-slate-200 px-4 py-2 sticky top-0 z-20 shadow-sm">
                    <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
                        <button onClick={() => setCurrentIndex(p => Math.max(0, p - 1))} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"><ChevronLeft size={28} /></button>
                        <div className="flex flex-col items-center"><h1 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{t.title}</h1><div className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase italic tracking-widest">{currentIndex + 1} / {meta.limit || "∞"}</div></div>
                        <div className="flex items-center gap-1"><button onClick={() => setCurrentIndex(p => Math.min(packet.length - 1, p + 1))} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"><ChevronRight size={28} /></button><button onClick={onBack} className="p-2 text-slate-300 hover:text-rose-500 rounded-xl border border-slate-100 transition-all"><LogOut size={18} /></button></div>
                    </div>
                </header>

                <main className="flex-1 max-w-6xl w-full mx-auto p-3 lg:p-6 overflow-hidden flex flex-col relative">
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 lg:divide-x divide-slate-50 min-h-0">
                        
                        {/* 1. Text & Input Section - ALWAYS ON LEFT (order-1) */}
                        <div className="flex flex-col order-1 h-full overflow-hidden">
                            <div className="p-6 lg:p-12 flex-1 flex flex-col justify-center space-y-6 overflow-y-auto">
                                <div className="text-xl lg:text-3xl font-bold text-slate-800 leading-relaxed text-center lg:text-left">
                                    <MathDisplay content={q?.resolvedData?.renderData?.description} />
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
                                        {renderInput()}
                                        {!(packet[currentIndex]?.resolvedData?.renderData?.options) && (
                                            <button onClick={() => handleLabSubmit()} disabled={!inputValue} className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 disabled:opacity-20 flex items-center justify-center gap-3 transition-all">
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

                        {/* 2. Visual Side - ALWAYS ON RIGHT (order-2) */}
                        {q?.resolvedData?.renderData && (q.resolvedData.renderData.graph || q.resolvedData.renderData.geometry || q.resolvedData.renderData.pattern) ? (
                            <div className="p-6 lg:p-12 flex items-center justify-center bg-white order-2 h-full border-t lg:border-t-0 border-slate-50">
                                <div className="w-full h-full flex items-center justify-center transform scale-90 lg:scale-125">
                                    {renderVisual(q)}
                                </div>
                            </div>
                        ) : (
                            /* Empty placeholder to maintain grid consistency if you want the text centered when no visual is present */
                            <div className="hidden lg:block order-2 bg-slate-50/10" />
                        )}
                    </div>

                    {/* GRID-BASED MILESTONE REVIEW (Harmonized with StudentLiveView) --- */}
                    {showMilestone && (
                        <div className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 rounded-[2rem] lg:rounded-[3.5rem]">
                            <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[3.5rem] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
                                <div className="p-10 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                                    <div><h2 className="text-4xl font-black text-slate-900 italic tracking-tight uppercase mb-2">{t.milestoneTitle}</h2><p className="text-slate-500 font-medium">{lang === 'sv' ? 'Granska dina senaste 15 svar innan du går vidare.' : 'Review your last 15 answers before continuing.'}</p></div>
                                    <div className="flex items-center gap-4"><button onClick={() => setInternalMode('SUMMARY')} className="px-6 py-3 bg-rose-100 text-rose-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-600 hover:text-white transition-all">{t.finish}</button><button onClick={() => setRevealMilestoneAnswers(!revealMilestoneAnswers)} className="flex items-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100"><Eye size={14} /> {t.showAnswers}</button></div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50/30">
                                    {Object.keys(responses).filter(idx => idx >= currentIndex - 14 && idx <= currentIndex).map(idx => {
                                        const qItem = packet[idx]; const res = responses[idx];
                                        return (
                                            <div key={idx} className={`bg-white p-6 rounded-[2.5rem] border-4 shadow-sm flex flex-col ${res.isCorrect ? 'border-emerald-500 shadow-emerald-50/50' : 'border-rose-400 shadow-rose-50/50'}`}>
                                                <div className="flex justify-between items-center mb-4"><span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">{lang === 'sv' ? "Uppgift" : "Question"} {parseInt(idx) + 1}</span>{res.isCorrect ? <CheckCircle2 className="text-emerald-500" size={20} /> : <XCircle className="text-rose-400" size={20} />}</div>
                                                <div className="flex-1 flex flex-col items-center justify-center space-y-4 mb-4"><div className="scale-75 origin-center">{renderVisual(qItem)}</div><div className="text-center font-bold text-slate-700 text-[11px] px-2 leading-snug truncate w-full">{qItem.resolvedData.renderData.description}</div></div>
                                                {revealMilestoneAnswers && <div className="p-3 bg-indigo-50 rounded-xl text-center"><span className="text-[9px] font-black text-indigo-400 uppercase block mb-1">Rätt Svar</span><span className="font-bold text-indigo-700">{atob(qItem.resolvedData.token)}</span></div>}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="p-8 bg-white border-t border-slate-100 flex justify-center"><button disabled={cooldown > 0} onClick={() => { setShowMilestone(false); setCurrentIndex(currentIndex + 1); setInputValue(''); setRevealMilestoneAnswers(false); }} className="px-16 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 disabled:opacity-50 transition-all flex items-center gap-4">{cooldown > 0 ? `${t.cooldown} (${cooldown}s)` : t.continueBtn} <ChevronRight size={20}/></button></div>
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