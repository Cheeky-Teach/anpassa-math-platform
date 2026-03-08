import React, { useState, useEffect, useRef } from 'react';
import { 
    Loader2, ChevronLeft, Beaker, Play, Check, 
    ChevronDown, Settings2, Zap, ArrowRight, 
    RefreshCcw, Eye, Clock, Lock 
} from 'lucide-react';
import { decodeConfig, encodeConfig } from '../../core/utils/labCodeUtils';
import { CATEGORIES } from '../../constants/localization';

// Visual & Input Component Imports
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
        loading: "Laddar konfiguration...",
        milestoneTitle: "Dags för en paus!",
        milestoneDesc: "Här är en sammanfattning av dina senaste 15 uppgifter.",
        continueBtn: "Nästa Etapp",
        cooldown: "Vänta...",
        showAnswers: "Visa rätt svar"
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
        loading: "Loading configuration...",
        milestoneTitle: "Time for a break!",
        milestoneDesc: "Here is a summary of your last 15 tasks.",
        continueBtn: "Next Stage",
        cooldown: "Wait...",
        showAnswers: "Show answers"
    }
};

export default function PracticeLabView({ configCode, profile, lang = 'sv', onBack }) {
    const t = LAB_TEXT[lang] || LAB_TEXT.sv;

    // --- SETUP STATE ---
    const [selection, setSelection] = useState({});
    const [meta, setMeta] = useState({
        mode: 'practice', 
        limit: 0,        
        globalMaxLevel: 9,
        isNationalTest: false,
        bundleId: null
    });
    const [activeCategory, setActiveCategory] = useState(null);

    // --- ORCHESTRATION STATE ---
    const [internalMode, setInternalMode] = useState('LOADING'); 

    // --- ACTIVE MODE STATE ---
    const [packet, setPacket] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [responses, setResponses] = useState({}); 
    const [isGenerating, setIsGenerating] = useState(false);
    const [showMilestone, setShowMilestone] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [revealMilestoneAnswers, setRevealMilestoneAnswers] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    // --- 1. MIXER LOGIC ---
    const generateMixerRequests = (count) => {
        const enabledTopics = Object.keys(selection).filter(id => selection[id].enabled);
        const requests = [];
        for (let i = 0; i < count; i++) {
            const randomTopicId = enabledTopics[Math.floor(Math.random() * enabledTopics.length)];
            const topicConf = selection[randomTopicId];
            const randomLevel = Math.floor(Math.random() * (topicConf.max - topicConf.min + 1)) + topicConf.min;
            requests.push({ topic: randomTopicId, level: randomLevel, lang });
        }
        return requests;
    };

    // --- 2. BATCH FETCHING (SPRINTS) ---
    const fetchNextSprint = async () => {
        setIsGenerating(true);
        try {
            const nextCount = meta.limit > 0 ? Math.min(15, meta.limit - packet.length) : 15;
            if (nextCount <= 0) return;

            const requests = generateMixerRequests(nextCount);
            const res = await fetch('/api/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requests })
            });
            const newQuestions = await res.json();
            setPacket(prev => [...prev, ...newQuestions]);
        } catch (err) {
            console.error("Lab Generation Error:", err);
        } finally {
            setIsGenerating(false);
        }
    };

    // --- 3. MILESTONE TIMER ---
    useEffect(() => {
        let timer;
        if (showMilestone && cooldown > 0) {
            timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [showMilestone, cooldown]);

    // Initialize Active Mode
    useEffect(() => {
        if (internalMode === 'ACTIVE' && packet.length === 0) {
            fetchNextSprint();
        }
    }, [internalMode]);

    // --- 4. ANSWER SUBMISSION ---
    const handleLabSubmit = async (val) => {
        const currentQ = packet[currentIndex];
        if (!currentQ || !val) return;

        try {
            const res = await fetch('/api/answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    answer: val,
                    token: currentQ.resolvedData.token,
                    topic: currentQ.topic_id,
                    level: currentQ.resolvedData.level,
                    mode: meta.mode
                })
            });
            const result = await res.json();
            
            setResponses(prev => ({
                ...prev,
                [currentIndex]: { answer: val, isCorrect: result.correct, topicId: currentQ.topic_id }
            }));

            const nextIndex = currentIndex + 1;
            // Trigger milestone every 15 questions
            if (nextIndex > 0 && nextIndex % 15 === 0) {
                setCooldown(10); // Mandatory 10s habit-building break
                setShowMilestone(true);
            } else {
                setCurrentIndex(nextIndex);
                setInputValue('');
                if (nextIndex === packet.length - 1 && (meta.limit === 0 || packet.length < (meta.limit || 50))) {
                    fetchNextSprint();
                }
            }
        } catch (err) {
            console.error("Submission error:", err);
        }
    };

    // --- 5. INITIALIZATION & DEEP LINKS ---
    useEffect(() => {
        if (configCode) {
            const decoded = decodeConfig(configCode);
            if (decoded) {
                setMeta(decoded.meta);
                setSelection(decoded.selection);
                setInternalMode('ACTIVE'); 
            } else {
                setInternalMode('SETUP');
            }
        } else {
            setInternalMode('SETUP');
        }
    }, [configCode]);

    if (internalMode === 'LOADING') {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest">{t.loading}</p>
            </div>
        );
    }

    // --- SETUP RENDER ---
    if (internalMode === 'SETUP') {
        const currentTestCode = encodeConfig({ meta, selection });
        return (
            <div className="max-w-5xl mx-auto w-full p-4 pb-20 animate-in fade-in duration-500">
                <header className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <ChevronLeft size={20} />
                            </button>
                            <h1 className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase">{t.title}</h1>
                        </div>
                        <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-2xl border-2 border-indigo-100">
                            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">{t.testCode}:</span>
                            <code className="text-indigo-600 font-black tracking-widest text-lg">{currentTestCode}</code>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setMeta(prev => ({ ...prev, mode: prev.mode === 'exam' ? 'practice' : 'exam' }))}
                            className={`px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all border-b-4 ${meta.mode === 'exam' ? 'bg-rose-500 border-rose-700 text-white' : 'bg-white border-slate-200 text-slate-400'}`}
                        >
                            {meta.mode === 'exam' ? t.modeExam : t.modePractice}
                        </button>
                        <button 
                            onClick={() => setInternalMode('ACTIVE')}
                            disabled={Object.keys(selection).length === 0}
                            className="bg-indigo-600 border-indigo-800 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] border-b-4 hover:scale-105 active:translate-y-1 transition-all flex items-center gap-2 disabled:opacity-30 disabled:pointer-events-none"
                        >
                            <Play size={14} /> {t.startBtn}
                        </button>
                    </div>
                </header>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.values(CATEGORIES).map(cat => {
                        const isActive = activeCategory === cat.id;
                        return (
                            <div key={cat.id} className="flex flex-col gap-2">
                                <button onClick={() => setActiveCategory(isActive ? null : cat.id)} className={`p-6 rounded-[2.5rem] border-4 transition-all text-left relative overflow-hidden ${isActive ? `bg-white border-${cat.color}-500 shadow-xl` : `bg-white border-slate-100 hover:border-slate-200 shadow-md`}`}>
                                    <div className="flex justify-between items-center relative z-10">
                                        <h3 className="font-black uppercase italic tracking-tighter text-2xl text-slate-900">{cat.label[lang]}</h3>
                                        <ChevronDown size={20} className={isActive ? 'rotate-180' : ''} />
                                    </div>
                                </button>
                                {isActive && (
                                    <div className="p-4 bg-white/50 rounded-[2rem] border-2 border-dashed border-slate-200 space-y-3">
                                        {cat.topics.map(topic => (
                                            <div key={topic.id} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                                                <button onClick={() => setSelection(prev => prev[topic.id]?.enabled ? { ...prev, [topic.id]: { ...prev[topic.id], enabled: false } } : { ...prev, [topic.id]: { enabled: true, min: 1, max: cat.levels } })} className={`w-6 h-6 rounded-lg flex items-center justify-center ${selection[topic.id]?.enabled ? `bg-${cat.color}-500 text-white` : 'bg-slate-100 text-transparent'}`}><Check size={14}/></button>
                                                <span className="flex-1 text-xs font-bold text-slate-700">{topic.label[lang]}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // --- ACTIVE & MILESTONE RENDER ---
    if (internalMode === 'ACTIVE') {
        if (showMilestone) {
            const currentSprintStart = Math.max(0, currentIndex - 14);
            const currentSprintEnd = currentIndex;
            const sprintQuestions = Object.keys(responses)
                .filter(idx => idx >= currentSprintStart && idx <= currentSprintEnd)
                .map(idx => ({ ...packet[idx], ...responses[idx] }));

            return (
                <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                            <div>
                                <h2 className="text-4xl font-black text-slate-900 italic tracking-tight uppercase mb-2">{t.milestoneTitle}</h2>
                                <p className="text-slate-500 font-medium">{t.milestoneDesc}</p>
                            </div>
                            <button onClick={() => setRevealMilestoneAnswers(!revealMilestoneAnswers)} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                <Eye size={14} /> {t.showAnswers}
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {sprintQuestions.map((q, i) => (
                                <div key={i} className={`p-6 rounded-[2rem] border-2 transition-all ${q.isCorrect ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{q.topicId}</span>
                                        {q.isCorrect ? <Check className="text-emerald-500" /> : <RefreshCcw className="text-rose-500" />}
                                    </div>
                                    <div className="text-sm font-bold text-slate-700 mb-2 truncate">{q.resolvedData.renderData.description}</div>
                                    {revealMilestoneAnswers && (
                                        <div className="text-xs font-black text-indigo-600 bg-white/50 p-3 rounded-xl border border-indigo-50">
                                            Svar: {atob(q.resolvedData.token)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-center">
                            <button 
                                disabled={cooldown > 0}
                                onClick={() => {
                                    setCurrentIndex(currentIndex + 1);
                                    setShowMilestone(false);
                                    setRevealMilestoneAnswers(false);
                                    setInputValue('');
                                }}
                                className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] flex items-center gap-3 disabled:opacity-50 transition-all hover:bg-indigo-600"
                            >
                                {cooldown > 0 ? `${t.cooldown} (${cooldown}s)` : t.continueBtn} <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        // Standard Question View
        const q = packet[currentIndex];
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <div className="w-full h-3 bg-slate-200"><div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${((currentIndex + 1) / (meta.limit || 50)) * 100}%` }} /></div>
                <main className="flex-1 max-w-4xl mx-auto w-full p-6 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white rounded-[3.5rem] shadow-2xl border-b-[12px] border-slate-200/50 overflow-hidden">
                        <div className="p-12 md:p-16">
                            <div className="flex justify-between mb-10"><span className="bg-indigo-50 text-indigo-600 px-5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest">{q?.topic_id} • Nivå {q?.resolvedData?.level}</span><span className="text-slate-300 font-black text-xs">{currentIndex + 1} / {meta.limit || "∞"}</span></div>
                            <div className="text-3xl md:text-4xl font-bold text-slate-800 mb-12 leading-tight"><MathText content={q?.resolvedData?.renderData?.description} /></div>
                            <div className="space-y-6">
                                <input autoFocus type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLabSubmit(inputValue)} className="w-full p-8 bg-slate-100 rounded-[2.5rem] text-3xl font-bold focus:ring-8 focus:ring-indigo-500/10 outline-none transition-all border-2 border-transparent focus:border-indigo-100" placeholder="..." />
                                <button onClick={() => handleLabSubmit(inputValue)} className="w-full py-8 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-4 text-xl">Svara <ArrowRight size={24} /></button>
                            </div>
                        </div>
                    </div>
                    <button onClick={onBack} className="mt-12 text-slate-400 font-black uppercase text-xs tracking-[0.3em] hover:text-slate-900 flex items-center gap-2 self-center transition-colors"><Lock size={14} /> Avbryt Passet</button>
                </main>
            </div>
        );
    }

    return null;
}