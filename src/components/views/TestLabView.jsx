import React, { useState, useEffect, useRef } from 'react';
import { 
    Loader2, ChevronLeft, Beaker, Play, Check, 
    ChevronDown, Settings2, Zap, ArrowRight, 
    RefreshCcw, Eye, Clock, Lock, Send, ListChecks, 
    LayoutGrid, XCircle, ChevronRight, LogOut,
    CheckCircle2, Award, Info, HelpCircle, X
} from 'lucide-react';
import { decodeConfig, encodeConfig, BUNDLE_PRESETS } from '../../core/utils/labCodeUtils';
import { CATEGORIES, LEVEL_DESCRIPTIONS } from '../../constants/localization';
import { useMyCoach } from '../../hooks/useMyCoach';
import MyCoachModal from '../modals/MyCoachModal';

// --- SHARED UI COMPONENTS ---
import MathText from '../ui/MathText';
import VisualRenderer from '../visuals/VisualRenderer';
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
        title: "Test Lab", testCode: "Testkod", modeExam: "Provläge", modePractice: "Öva",
        startBtn: "Starta pass", selectedAreas: "valda", level: "Nivå", back: "Tillbaka",
        loading: "Laddar...", milestoneTitle: "Dags för en paus!", continueBtn: "Nästa Etapp",
        cooldown: "Vänta...", showAnswers: "Visa rätt svar", quit: "Avbryt Passet",
        answerReceived: "Svar mottaget", nextArr: "Fortsätt med pilen", finish: "Avsluta & Se Resultat",
        summaryTitle: "Testrapport", recoveryTitle: "Rekommenderad träning", recoveryDesc: "Fokusera på dina svagaste områden.",
        copyLink: "Kopiera länk", linkCopied: "Länk kopierad till urklipp!", toDashboard: "Lämna",
        backToLab: "Till Labbet", guideBtn: "Instruktioner",
        guideTitle: "Så fungerar Testlabbet",
        guidePreset: "Välj ett färdigt paket (t.ex. NP-GEO) för att automatiskt välja alla nivåer i den kategorin ELLER välj ämnen manuellt i listan till höger och klicka på nivå-bubblorna (1-9).",
        guideCustom: "Ange hur många frågor som ska inkluderas. Om fältet lämnas tomt skapas ett pass med 50 frågor med en rapport var 15:e fråga.",
        guideModes: "Övningsläge ger dig direkt feedback på varje svar. Provläge döljer alla resultat tills slutrapporten.",
        guideReview: "Kopiera länken efter att du valt vilka områden som ska ingå och dela med dina elever.",
        guideControls: "Eleverna når testet genom att klicka på länken och ange sin klasskod på startsidan."
    },
    en: {
        title: "Test Lab", testCode: "Test Code", modeExam: "Exam Mode", modePractice: "Practice Mode",
        startBtn: "Start Test", selectedAreas: "selected areas", level: "Level", back: "Back",
        loading: "Loading...", milestoneTitle: "Time for a break!", continueBtn: "Next Stage",
        cooldown: "Wait...", showAnswers: "Show answers", quit: "Quit Session",
        answerReceived: "Answer received", nextArr: "Continue using arrows", finish: "Finish & See Results",
        summaryTitle: "Test Report", recoveryTitle: "Recommended Practice", recoveryDesc: "Focus on your weakest areas.",
        copyLink: "Copy Link", linkCopied: "Link copied to clipboard!", toDashboard: "Exit",
        backToLab: "Back to Lab", guideBtn: "Guide",
        guideTitle: "How the Test Lab Works",
        guidePreset: "Select a preset (e.g., NP-GEO) to enable topics automatically OR toggle topics manually on the right and click level bubbles (1-9).",
        guideCustom: "Enter how many questions to include. Leave blank for an infinite test with milestone reports.",
        guideModes: "Practice Mode gives instant feedback. Exam Mode hides results until the final report.",
        guideReview: "Copy and share the practice test link when you have selected your topics.",
        guideControls: "Students access the test via the link and enter their class code on the start page."
    }
};

export default function TestLabView({ configCode, profile, lang = 'sv', onBack }) {
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
    const [activeCategory, setActiveCategory] = useState('algebra'); // Default first tab
    const [revealMilestoneAnswers, setRevealMilestoneAnswers] = useState(false);
    const [visibleClues, setVisibleClues] = useState({});
    const [showGuideModal, setShowGuideModal] = useState(false);
    const [useWordProblems, setUseWordProblems] = useState(false);
    const [allowCoach, setAllowCoach] = useState(false);
    const q = packet[currentIndex];
    const coach = useMyCoach(q, lang);

    // --- HELPERS ---
    const getStyles = (category) => COLOR_VARIANTS[category.color || 'indigo'] || COLOR_VARIANTS.indigo;

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => { setIsMobile(window.innerWidth < 768); };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const copyTestLink = () => {
        // Include allowCoach in the copied link
        const updatedMeta = { ...meta, wordProblem: useWordProblems, allowCoach: allowCoach };
        const testCode = encodeConfig({ meta: updatedMeta, selection });
        const baseUrl = window.location.origin + "/lab";
        const fullUrl = `${baseUrl}?config=${testCode}`;
        navigator.clipboard.writeText(fullUrl);
        alert(t.linkCopied);
    };

    const resetAllSelection = () => {
        setSelection({});
        setMeta(p => ({ ...p, isNationalTest: false, bundleId: null, limit: 0, mode: 'practice' }));
    };

    const applyPresetSelection = (bundleId) => {
        if (!bundleId) { resetAllSelection(); return; }
        const preset = BUNDLE_PRESETS[bundleId];
        const newSelection = {};
        Object.entries(CATEGORIES).forEach(([catId, cat]) => {
            if (bundleId === 'NP-ALL' || catId === preset.category) {
                cat.topics.forEach(topic => {
                    const topicLevels = LEVEL_DESCRIPTIONS[topic.id] ? Object.keys(LEVEL_DESCRIPTIONS[topic.id]).map(Number) : [1];
                    newSelection[topic.id] = { enabled: true, levels: topicLevels };
                });
            }
        });
        setSelection(newSelection);
        setMeta(p => ({ ...p, isNationalTest: true, bundleId: bundleId }));
    };

    const startNewSession = () => {
        setResponses({});
        setVisibleClues({});
        setCurrentIndex(0);
        setInputValue('');
        setInternalMode('LOADING');
        setPacket([]);
        setTimeout(() => { setInternalMode('ACTIVE'); }, 50);
    };

    const fetchNextSprint = async () => {
        if (Number(meta.limit) > 0 && packet.length >= Number(meta.limit)) return;
        setIsGenerating(true);
        try {
            const enabledTopics = Object.keys(selection).filter(id => selection[id].enabled);
            let batchSize = 15;
            if (Number(meta.limit) > 0) {
                batchSize = Math.min(15, Number(meta.limit) - packet.length);
            }
            if (batchSize <= 0) { setIsGenerating(false); return; }

            const requests = Array.from({ length: batchSize }).map(() => {
                const topicId = enabledTopics[Math.floor(Math.random() * enabledTopics.length)];
                const conf = selection[topicId];
                const possibleLevels = conf.levels && conf.levels.length > 0 ? conf.levels : [1];
                const randomLevel = possibleLevels[Math.floor(Math.random() * possibleLevels.length)];

                return { topic: topicId, level: randomLevel, lang, wordProblem: useWordProblems };
            });

            const res = await fetch('/api/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requests })
            });
            const newQuestions = await res.json();
            setPacket(prev => [...prev, ...newQuestions]);
        } catch (err) { console.error("Fetch Error:", err); } 
        finally { setIsGenerating(false); }
    };

    const handleLabSubmit = async (manualValue = null) => {
        const val = manualValue || inputValue;
        const currentQ = packet[currentIndex];
        if (!currentQ || !val) return;

        try {
            const res = await fetch('/api/answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answer: String(val).trim(), token: currentQ.resolvedData.token, mode: meta.mode })
            });
            const result = await res.json();
            
            setResponses(prev => ({
                ...prev,
                [currentIndex]: { answer: val, isCorrect: result.correct, topic_id: currentQ.topic_id }
            }));

            const advance = () => {
                const nextIndex = currentIndex + 1;
                const limit = Number(meta.limit);

                if (limit > 0 && nextIndex === limit) { setInternalMode('SUMMARY'); return; }
                const halfwayPoint = limit > 0 ? Math.floor(limit / 2) : 15;
                const shouldPause = limit > 0 ? nextIndex === halfwayPoint : nextIndex % 15 === 0;

                if (shouldPause) {
                    setCooldown(2);
                    setShowMilestone(true);
                } else {
                    if (nextIndex === packet.length - 1 && (limit === 0 || packet.length < limit)) { fetchNextSprint(); }
                    setCurrentIndex(nextIndex);
                    setInputValue(''); 
                }
            };

            if (meta.mode === 'exam') { advance(); } 
            else { setTimeout(advance, 1000); }

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

    const renderInput = () => {
        const item = packet[currentIndex];
        const rd = item?.resolvedData?.renderData;
        
        if (rd?.answerType === 'multiple_choice' || (rd?.options && Array.isArray(rd.options))) {
            return (
                <div className="grid grid-cols-1 gap-3 w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {(rd.options || []).map((opt, i) => {
                        // Extract label for visual display and value for backend submission
                        const choiceLabel = typeof opt === 'object' ? opt.label : opt;
                        const choiceValue = typeof opt === 'object' ? opt.value : opt;
                        return (
                            <button key={i} onClick={() => handleLabSubmit(choiceValue)} className="w-full p-5 bg-white border-2 border-slate-100 rounded-2xl text-lg font-bold text-slate-700 hover:border-indigo-600 hover:bg-indigo-50 transition-all shadow-sm text-center active:scale-95">
                                <MathDisplay content={String(choiceLabel)} />
                            </button>
                        );
                    })}
                </div>
            );
        }

        const type = rd?.answerType || rd?.inputType || item?.resolvedData?.inputType || 'text';
        switch (type) { 
            case 'mixed_fraction': 
                return <div className="flex justify-center py-6 bg-slate-100 rounded-2xl shadow-inner w-full"><div className="scale-110 transform origin-center"><FractionInput value={inputValue} onChange={setInputValue} allowMixed={true} autoFocus={!isMobile} /></div></div>;
            case 'fraction': 
                return <div className="flex justify-center py-6 bg-slate-100 rounded-2xl shadow-inner w-full"><div className="scale-110 transform origin-center"><FractionInput value={inputValue} onChange={setInputValue} allowMixed={false} autoFocus={!isMobile} /></div></div>;
            case 'exponent': 
            case 'structured_power': 
                return <div className="flex justify-center py-6 bg-slate-100 rounded-2xl shadow-inner w-full"><div className="scale-110 transform origin-center"><ExponentInput value={inputValue} onChange={setInputValue} autoFocus={!isMobile} /></div></div>;
            case 'scientific': 
            case 'structured_scientific': 
                return <div className="flex justify-center py-6 bg-slate-100 rounded-2xl shadow-inner w-full"><div className="scale-110 transform origin-center"><ScientificInput value={inputValue} onChange={setInputValue} autoFocus={!isMobile} /></div></div>;
            default:
                return <input type="text" autoFocus={!isMobile} className="w-full bg-slate-100 border-none rounded-2xl px-6 py-4 text-center font-bold text-2xl outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all placeholder:text-slate-300 shadow-inner" placeholder="..." value={inputValue} maxLength={20} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLabSubmit()} />;
        }
    };

    useEffect(() => {
        if (configCode) {
            const decoded = decodeConfig(configCode);
            if (decoded) {
                let finalSelection = decoded.selection;
                if (decoded.meta.isNationalTest && decoded.meta.bundleId) {
                    const bundleId = decoded.meta.bundleId;
                    const preset = BUNDLE_PRESETS[bundleId];
                    const expandedSelection = {};
                    Object.entries(CATEGORIES).forEach(([catId, cat]) => {
                        if (bundleId === 'NP-ALL' || catId === preset.category) {
                            cat.topics.forEach(topic => {
                                const topicLevels = LEVEL_DESCRIPTIONS[topic.id] ? Object.keys(LEVEL_DESCRIPTIONS[topic.id]).map(Number) : [1];
                                expandedSelection[topic.id] = { enabled: true, levels: topicLevels };
                            });
                        }
                    });
                    finalSelection = expandedSelection;
                }
                setMeta(decoded.meta);
                setSelection(finalSelection); 
                
                // Add this line to read the word problem flag from the decoded link
                if (decoded.meta?.wordProblem !== undefined) { 
                    setUseWordProblems(!!decoded.meta.wordProblem); 
                }

                if (decoded.meta?.allowCoach !== undefined) { 
                    setAllowCoach(!!decoded.meta.allowCoach); 
                }
                
                setInternalMode('ACTIVE'); 
            } else { setInternalMode('SETUP'); }
        } else { setInternalMode('SETUP'); }
    }, [configCode]);

    useEffect(() => {
        if (internalMode === 'ACTIVE' && packet.length === 0) { fetchNextSprint(); }
    }, [internalMode, packet.length, useWordProblems]);

    useEffect(() => {
        let timer;
        if (showMilestone && cooldown > 0) { timer = setInterval(() => setCooldown(p => p - 1), 1000); }
        return () => clearInterval(timer);
    }, [showMilestone, cooldown]);

    if (internalMode === 'LOADING') return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={48} /></div>;

    // =========================================================
    // --- 1. SETUP UI (Harmonized with Dashboard Two-Column Layout) ---
    // =========================================================
    if (internalMode === 'SETUP') {
        // Inject wordProblem into the meta object so the code updates instantly
        const currentTestCode = encodeConfig({ 
            meta: { ...meta, wordProblem: useWordProblems, allowCoach: allowCoach }, 
            selection 
        });
        const activeCategoryData = CATEGORIES[activeCategory];
        const categoryStyles = COLOR_VARIANTS[activeCategoryData?.color || 'indigo'] || COLOR_VARIANTS.indigo;
        const totalSelectedCount = Object.keys(selection).filter(k => selection[k].enabled).length;

        return (
            <div className="relative w-full overflow-hidden bg-[#f9fbf7] min-h-screen">
                
                {/* Widescreen Two-Column Container (Fixed for laptop protection) */}
                <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-8 py-8 animate-in fade-in duration-700 flex flex-col xl:flex-row gap-8 relative z-10 font-sans">
                    
                    {/* LEFT COLUMN: COMMAND CENTER (CONFIG SIDEBAR) */}
                    <aside className="w-full xl:w-[360px] flex-shrink-0 flex flex-col gap-6">
                        
                        {/* Status Card & Test Code */}
                        <div className="bg-white border border-indigo-100 p-6 rounded-[2rem] shadow-xl shadow-indigo-900/5 flex flex-col gap-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0">
                                        <Beaker size={24} />
                                    </div>
                                    <div>
                                        <h1 className="text-lg font-bold text-slate-800 leading-none mb-1">{t.title}</h1>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                            {lang === 'sv' ? 'Konfigurera pass' : 'Configure session'}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowGuideModal(true)}
                                    className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all border border-indigo-100 flex items-center gap-1 text-[10px] font-black uppercase"
                                    title={t.guideBtn}
                                >
                                    <HelpCircle size={16} />
                                </button>
                            </div>

                            <div className="flex flex-col items-center bg-indigo-50 px-4 py-3 rounded-2xl border border-indigo-100">
                                <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-indigo-800/40 mb-0.5">{t.testCode}</span>
                                <span className="text-xl font-black tracking-[0.2em] text-indigo-700 uppercase">{currentTestCode}</span>
                            </div>

                            <button 
                                onClick={onBack} 
                                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-sm active:scale-95 cursor-pointer"
                            >
                                <LogOut size={14} /> {t.toDashboard}
                            </button>
                        </div>

                        {/* Configuration Controls Stack */}
                        <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm flex flex-col gap-4">
                            <div className="flex items-center gap-2 ml-1">
                                <Settings2 size={14} className="text-indigo-500" />
                                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {lang === 'sv' ? "Inställningar" : "Settings"}
                                </h2>
                            </div>

                            {/* Preset Selector */}
                            <div>
                                <span className="block text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1 ml-1">
                                    {lang === 'sv' ? "Snabbval (Preset)" : "Presets"}
                                </span>
                                <select 
                                    value={meta.bundleId || ""}
                                    onChange={(e) => applyPresetSelection(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 font-bold text-xs focus:border-indigo-500 focus:bg-white outline-none transition-all cursor-pointer"
                                >
                                    <option value="">{lang === 'sv' ? "-- Välj snabbval --" : "-- Choose a preset ---"}</option>
                                    {Object.entries(BUNDLE_PRESETS).map(([id, data]) => (
                                        <option key={id} value={id}>{data.title} ({id})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Mode Toggle Button */}
                            <button
                                type="button"
                                onClick={() => setMeta(p => ({ ...p, mode: p.mode === 'exam' ? 'practice' : 'exam' }))}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 cursor-pointer ${
                                    meta.mode === 'exam' 
                                        ? 'bg-rose-600 border-rose-600 text-white' 
                                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    {meta.mode === 'exam' ? <Lock size={14}/> : <Zap size={14}/>}
                                    <span>{meta.mode === 'exam' ? t.modeExam : t.modePractice}</span>
                                </div>
                                <span className="text-[9px] opacity-80 uppercase">
                                    {meta.mode === 'exam' ? (lang === 'sv' ? 'Dolda svar' : 'Hidden') : (lang === 'sv' ? 'Direkt' : 'Instant')}
                                </span>
                            </button>

                            {/* Word Problem Toggle Button */}
                            <button
                                type="button"
                                onClick={() => setUseWordProblems(!useWordProblems)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 cursor-pointer ${
                                    useWordProblems 
                                        ? 'bg-emerald-600 border-emerald-600 text-white' 
                                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <HelpCircle size={14} fill={useWordProblems ? "rgba(255,255,255,0.2)" : "none"}/>
                                    <span>{lang === 'sv' ? 'Problemlösning' : 'Word Problems'}</span>
                                </div>
                                <span className="text-[9px] opacity-80 uppercase">
                                    {useWordProblems ? (lang === 'sv' ? 'Aktiv' : 'On') : (lang === 'sv' ? 'Av' : 'Off')}
                                </span>
                            </button>

                            {/* AI Coach Toggle Button */}
                            <button
                                type="button"
                                onClick={() => setAllowCoach(!allowCoach)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border-2 cursor-pointer ${
                                    allowCoach 
                                        ? 'bg-blue-600 border-blue-600 text-white' 
                                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Info size={14} fill={allowCoach ? "rgba(255,255,255,0.2)" : "none"}/>
                                    <span>{lang === 'sv' ? 'Ledtrådar / Coach' : 'Clues / Coach'}</span>
                                </div>
                                <span className="text-[9px] opacity-80 uppercase">
                                    {allowCoach ? (lang === 'sv' ? 'Tillåten' : 'Allowed') : (lang === 'sv' ? 'Avstängd' : 'Disabled')}
                                </span>
                            </button>

                            {/* Question Limit Input */}
                            <div className="flex items-center justify-between bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2">
                                <div className="flex items-center gap-2">
                                    <ListChecks size={16} className="text-amber-500"/>
                                    <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                                        {lang === 'sv' ? 'Antal frågor:' : 'Quantity:'}
                                    </span>
                                </div>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="100" 
                                    value={meta.limit || ''} 
                                    placeholder="∞" 
                                    onChange={(e) => setMeta(p => ({ ...p, limit: parseInt(e.target.value) || 0 }))}
                                    className="w-12 bg-white rounded-lg text-slate-800 font-black text-xs text-center py-1 outline-none border border-slate-200 focus:border-amber-400"
                                />
                            </div>

                            {/* Action Buttons: Copy Link & Reset */}
                            <div className="grid grid-cols-2 gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={copyTestLink}
                                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer"
                                >
                                    <LayoutGrid size={13}/>
                                    {t.copyLink}
                                </button>
                                <button 
                                    onClick={resetAllSelection}
                                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl font-black uppercase text-[10px] tracking-wider transition-all cursor-pointer"
                                >
                                    <RefreshCcw size={13} />
                                    {lang === 'sv' ? "Rensa" : "Reset"}
                                </button>
                            </div>
                        </div>

                        {/* Prominent Start Button Sidebar Anchor */}
                        <button 
                            type="button"
                            onClick={startNewSession} 
                            disabled={totalSelectedCount === 0} 
                            className="w-full flex items-center justify-center gap-3 py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
                        >
                            <Play size={16} fill="currentColor"/>
                            <span>{t.startBtn}</span>
                            <span className="text-[10px] font-black bg-orange-700/50 text-orange-100 px-2 py-0.5 rounded-lg">
                                {totalSelectedCount}
                            </span>
                        </button>
                    </aside>


                    {/* ➡️ RIGHT COLUMN: MAIN TOPIC SELECTION AREA */}
                    <main className="flex-1 flex flex-col min-w-0">
                        
                        {/* Horizontal Category Tabs */}
                        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
                            {Object.entries(CATEGORIES).map(([catKey, category]) => {
                                const isActive = activeCategory === catKey;
                                const styles = COLOR_VARIANTS[category.color || 'indigo'] || COLOR_VARIANTS.indigo;
                                const count = category.topics.filter(t => selection[t.id]?.enabled).length;
                                
                                return (
                                    <button 
                                        key={catKey}
                                        onClick={() => setActiveCategory(catKey)}
                                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold uppercase text-[11px] tracking-widest whitespace-nowrap transition-all shadow-sm border cursor-pointer ${
                                            isActive 
                                                ? `${styles.bgDark} text-white border-transparent shadow-md` 
                                                : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
                                        }`}
                                    >
                                        <Award size={14} />
                                        {category.label[lang]}
                                        {count > 0 && (
                                            <span className="ml-1 px-1.5 py-0.2 bg-white/20 rounded-full text-[9px]">
                                                {count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Active Category Topics Grid */}
                        <div className={`bg-white rounded-[2.5rem] border ${categoryStyles.border} p-6 sm:p-8 shadow-xl shadow-indigo-900/5 flex-1`}>
                            <div className="mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${categoryStyles.bgDark} text-white shadow-md`}>
                                        <Award size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 tracking-tight leading-none mb-1">
                                            {activeCategoryData.label[lang]}
                                        </h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                                            {activeCategoryData.topics.length} {lang === 'sv' ? 'tillgängliga delmoment' : 'available topics'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {activeCategoryData.topics.map(topic => {
                                    const isEnabled = selection[topic.id]?.enabled;
                                    const topicLevels = LEVEL_DESCRIPTIONS[topic.id] ? Object.keys(LEVEL_DESCRIPTIONS[topic.id]).map(Number) : [1];
                                    const selectedLevels = selection[topic.id]?.levels || [];

                                    const toggleLevel = (lvl) => {
                                        setMeta(p => ({ ...p, isNationalTest: false, bundleId: null }));
                                        setSelection(p => {
                                            const currentLevels = p[topic.id]?.levels || [];
                                            const newLevels = currentLevels.includes(lvl)
                                                ? currentLevels.filter(l => l !== lvl)
                                                : [...currentLevels, lvl].sort((a, b) => a - b);
                                            
                                            return {
                                                ...p,
                                                [topic.id]: { 
                                                    ...p[topic.id], 
                                                    levels: newLevels,
                                                    enabled: newLevels.length > 0 
                                                }
                                            };
                                        });
                                    };

                                    return (
                                        <div key={topic.id} className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${isEnabled ? 'border-indigo-500 shadow-md bg-white' : 'border-slate-200 bg-slate-50/50 opacity-75'}`}>
                                            <div>
                                                <div className="flex items-start justify-between mb-3">
                                                    <h4 className="font-bold text-xs text-slate-800 leading-tight pr-2">{topic.label[lang]}</h4>
                                                    <button 
                                                        onClick={() => {
                                                            setMeta(p => ({ ...p, isNationalTest: false, bundleId: null }));
                                                            setSelection(p => ({ 
                                                                ...p, 
                                                                [topic.id]: { 
                                                                    enabled: !isEnabled, 
                                                                    levels: !isEnabled ? topicLevels : [] 
                                                                } 
                                                            }));
                                                        }}
                                                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all cursor-pointer ${isEnabled ? categoryStyles.bgDark + ' text-white shadow-sm' : 'bg-white text-transparent border border-slate-300'}`}
                                                    >
                                                        <Check size={14} strokeWidth={3}/>
                                                    </button>
                                                </div>

                                                {/* LEVEL TOGGLE GRID */}
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {topicLevels.map(lvl => {
                                                        const isActive = selectedLevels.includes(lvl);
                                                        return (
                                                            <button
                                                                key={lvl}
                                                                onClick={() => toggleLevel(lvl)}
                                                                className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all border flex items-center justify-center cursor-pointer
                                                                    ${isActive 
                                                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs' 
                                                                        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400'
                                                                    }`}
                                                            >
                                                                {lvl}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* DYNAMIC DESCRIPTION BOX */}
                                            {selectedLevels.length > 0 && (
                                                <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 max-h-24 overflow-y-auto custom-scrollbar">
                                                    <div className="space-y-1">
                                                        {selectedLevels.map(lvl => (
                                                            <div key={lvl} className="flex gap-1.5 text-[8px] leading-tight items-start">
                                                                <span className="font-black text-indigo-500">N{lvl}</span>
                                                                <span className="text-slate-500 font-medium truncate">
                                                                    {LEVEL_DESCRIPTIONS[topic.id][lvl][lang]}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </main>
                </div>

                {/* --- GUIDE MODAL OVERLAY --- */}
                {showGuideModal && (
                    <div className="fixed inset-0 z-[200] bg-indigo-950/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md"><HelpCircle size={20}/></div>
                                    <h2 className="text-lg font-black uppercase tracking-tight italic">{t.guideTitle}</h2>
                                </div>
                                <button onClick={() => setShowGuideModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors cursor-pointer"><X size={18} /></button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar text-xs font-medium text-slate-700 leading-relaxed">
                                <p>1. {lang === 'sv' ? "Snabbval" : "Presets"}: {t.guidePreset}</p>
                                <p>2. {lang === 'sv' ? "Frågeantal" : "Quantity"}: {t.guideCustom}</p>
                                <p>3. {lang === 'sv' ? "Lägen" : "Modes"}: {t.guideModes}</p>
                                <p>4. {lang === 'sv' ? "Dela" : "Sharing"}: {t.guideReview}</p>
                                <p>5. {lang === 'sv' ? "Elever" : "Students"}: {t.guideControls}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* BACKGROUND DECORATION */}
                <div className="absolute bottom-0 left-0 w-full leading-[0] pointer-events-none z-0 overflow-hidden">
                    <svg className="relative block w-full h-[250px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,2,1200,1.13V120H0Z" className="fill-indigo-100/40"></path>
                    </svg>
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
                        
                        {/* NEW CONTAINER FOR BACK BUTTON + CHEVRON */}
                        <div className="flex items-center gap-1">
                            {/* 1. THE NEW "BACK TO LAB" BUTTON */}
                            <button 
                                onClick={() => setInternalMode('SETUP')}
                                className="mr-2 px-3 py-2 text-[9px] font-black uppercase tracking-tight text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all border border-slate-50 flex items-center gap-1"
                            >
                                <Settings2 size={12} /> {t.backToLab}
                            </button>

                            {/* 2. THE EXISTING LEFT CHEVRON */}
                            <button 
                                onClick={() => setCurrentIndex(p => Math.max(0, p - 1))} 
                                className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"
                            >
                                <ChevronLeft size={28} />
                            </button>
                        </div>

                        {/* ... Central Title/Progress (Keep as is) ... */}
                        <div className="flex flex-col items-center">
                            <h1 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{t.title}</h1>
                            <div className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase italic tracking-widest">
                                {currentIndex + 1} / {meta.limit || "∞"}
                            </div>
                        </div>

                        {/* ... Right Side (LogOut / Dashboard button) ... */}
                        <div className="flex items-center gap-1">
                            <button onClick={() => setCurrentIndex(p => Math.min(packet.length - 1, p + 1))} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all">
                                <ChevronRight size={28} />
                            </button>
                            <button 
                                onClick={onBack} 
                                className="ml-2 px-3 py-2 text-[9px] font-black uppercase tracking-tight text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all border border-slate-50"
                            >
                                {t.toDashboard}
                            </button>
                        </div>
                    </div>
                </header>

                {/* COACH MODAL */}
                {coach.isOpen && (
                    <MyCoachModal 
                        visible={coach.isOpen}
                        onClose={coach.closeCoach}
                        question={q}
                        lang={lang}
                        {...coach.coachProps} 
                    />
                )}

                <main className="flex-1 max-w-6xl w-full mx-auto p-3 lg:p-6 overflow-hidden flex flex-col relative">
                {/* 1. MAIN CARD WRAPPER: Allows scrolling on mobile, stays fixed on desktop */}
                <div className={`flex-1 bg-white rounded-[2rem] lg:rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-y-auto lg:overflow-hidden transition-all duration-300 flex flex-col ${!!responses[currentIndex] && meta.mode === 'practice' ? '' : ''}`}>
                    
                    {/* MOBILE PROGRESS BAR */}
                    <div className="sm:hidden h-1 bg-slate-100 flex shrink-0">
                        {packet.map((_, i) => (
                            <div key={i} className={`flex-1 ${i === currentIndex ? 'bg-indigo-500' : !!responses[i] ? 'bg-indigo-200' : 'bg-transparent'}`} />
                        ))}
                    </div>

                    {/* QUESTION HEADER */}
                    <div className="px-8 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 shrink-0">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.25em]">{lang === 'sv' ? "Uppgift" : "Question"} {currentIndex + 1} / {packet.length}</span>
                        
                        <div className="flex items-center gap-3">
                            {/* Coach Button - Only shows if allowed and question is not yet answered */}
                            {allowCoach && !responses[currentIndex] && (
                                <button 
                                    onClick={coach.openCoach} 
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
                                >
                                    <Info size={14} />
                                    {lang === 'sv' ? 'Hjälp!' : 'Help!'}
                                </button>
                            )}
                            
                            {!!responses[currentIndex] && (
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">
                                        {lang === 'sv' ? "Svar mottaget" : "Answer received"}
                                    </span>
                                    <CheckCircle2 className="text-emerald-500" size={20} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. RESPONSIVE GRID: Removes 'flex-1' on mobile to allow natural vertical expansion */}
                    <div className="lg:flex-1 grid grid-cols-1 lg:grid-cols-2 lg:divide-x divide-slate-50">
                        
                        {/* 3. TEXT & INPUT SECTION: Restricted height only on desktop */}
                        <div className="flex flex-col order-1 lg:h-full lg:overflow-hidden border-b lg:border-b-0 border-slate-50">
                            <div className="p-6 lg:p-12 flex-1 flex flex-col justify-center space-y-6 overflow-y-auto">
                                <div className="text-xl lg:text-3xl font-bold text-slate-800 leading-relaxed text-center lg:text-left">
                                    <MathDisplay content={q?.resolvedData?.renderData?.description} />
                                </div>
                                        {/* HIDES THE LATEX MATH FOR WORD PROBLEMS AND GEOMETRY VISUALS */}
                                        {q?.resolvedData?.renderData?.latex && 
                                        !q?.resolvedData?.renderData?.isWordProblemApplied && 
                                        !q?.resolvedData?.renderData?.geometry && (
                                            <div className="mt-6 text-3xl lg:text-5xl text-indigo-600 font-serif border-t border-slate-100 pt-6 animate-in fade-in duration-300">
                                                <MathDisplay content={`$$${q.resolvedData.renderData.latex}$$`} />
                                            </div>
                                        )}
                            </div>

                            {/* FEEDBACK SECTION */}
                            <div className="p-6 lg:p-10 bg-slate-50/30 border-t border-slate-100 shrink-0">
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
                                    <div className="max-w-md mx-auto animate-in zoom-in-95 duration-300">
                                        {meta.mode === 'practice' ? (
                                            <div className={`p-6 rounded-[2rem] border-4 flex flex-col items-center gap-4 shadow-lg
                                                ${responses[currentIndex].isCorrect ? 'bg-emerald-50 border-emerald-500' : 'bg-rose-50 border-rose-500'}`}>
                                                
                                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white
                                                    ${responses[currentIndex].isCorrect ? 'bg-emerald-500 animate-bounce' : 'bg-rose-500 animate-shake'}`}>
                                                    {responses[currentIndex].isCorrect ? <Check size={32} strokeWidth={4} /> : <XCircle size={32} strokeWidth={4} />}
                                                </div>
                                                
                                                <div className="text-center">
                                                    <p className={`text-xl font-black uppercase italic tracking-tight
                                                        ${responses[currentIndex].isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                        {responses[currentIndex].isCorrect 
                                                            ? (lang === 'sv' ? "Snyggt jobbat!" : "Great job!") 
                                                            : (lang === 'sv' ? "Inte riktigt rätt" : "Not quite right")}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                        {t.nextArr}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="py-8 text-center bg-slate-100 rounded-[2rem] border-2 border-dashed border-slate-200">
                                                <div className="flex flex-col items-center gap-3">
                                                    <CheckCircle2 size={32} className="text-slate-400" />
                                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest animate-pulse italic">
                                                        {t.answerReceived} — {t.nextArr}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 4. VISUAL SIDE: Set a minimum height for mobile and added padding to prevent clipping */}
                        {q?.resolvedData?.renderData && (q.resolvedData.renderData.graph || q.resolvedData.renderData.geometry || q.resolvedData.renderData.pattern) ? (
                            <div className="p-6 lg:p-12 flex items-center justify-center bg-white order-2 min-h-[400px] lg:h-full border-t lg:border-t-0 border-slate-50 relative overflow-hidden pb-12 lg:pb-12">
                                <div className="absolute inset-0 flex items-center justify-center p-8 lg:p-16">
                                    <div className="flex justify-center scale-90 origin-top mt-2">
                                        <VisualRenderer 
                                            data={q?.resolvedData?.renderData || q?.renderData} 
                                            isWordProblem={q?.selectedStoryIndex !== null && q?.selectedStoryIndex !== undefined} 
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="hidden lg:block order-2 bg-slate-50/10" />
                        )}
                    </div>

                    {/* MILESTONE REVIEW MODAL */}
                    {showMilestone && (
                        <div className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 rounded-[2rem] lg:rounded-[3.5rem]">
                            <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[3.5rem] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
                                
                                <div className="p-8 lg:p-10 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                                    <div>
                                        <h2 className="text-3xl lg:text-4xl font-black text-slate-900 italic tracking-tight uppercase mb-2">
                                            {t.milestoneTitle}
                                        </h2>
                                        <p className="text-slate-500 font-medium text-xs lg:text-sm">
                                            {lang === 'sv' ? 'Granska dina senaste svar innan du går vidare.' : 'Review your recent answers before continuing.'}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => setInternalMode('SUMMARY')} 
                                        className="px-6 py-3 bg-rose-100 text-rose-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                    >
                                        {t.finish}
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 lg:p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50/30 custom-scrollbar">
                                    {Object.keys(responses)
                                        .filter(idx => idx >= currentIndex - 14 && idx <= currentIndex)
                                        .map(idx => {
                                            const qItem = packet[idx];
                                            const res = responses[idx];
                                            const rd = qItem?.resolvedData?.renderData;
                                            const hasVisual = rd?.graph || rd?.geometry || rd?.pattern;
                                            const clues = qItem?.clues || qItem?.resolvedData?.clues || [];

                                            return (
                                                <div key={idx} className={`bg-white p-6 rounded-[2.5rem] border-4 shadow-sm flex flex-col justify-between relative transition-all ${res.isCorrect ? 'border-emerald-500 shadow-emerald-50/30' : 'border-rose-400 shadow-rose-50/30'}`}>
                                                    
                                                    <div>
                                                        <div className="flex justify-between items-center mb-4">
                                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                                                {lang === 'sv' ? "Uppgift" : "Question"} {parseInt(idx) + 1}
                                                            </span>
                                                            {res.isCorrect ? <CheckCircle2 className="text-emerald-500" size={20} /> : <XCircle className="text-rose-400" size={20} />}
                                                        </div>

                                                        {/* 🎨 REFACTORED: Renders the diagram container beautifully */}
                                                        {hasVisual && (
                                                            <div className="w-full flex justify-center bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100 overflow-hidden">
                                                                <div className="flex justify-center scale-90 origin-top mt-2">
                                                                    <VisualRenderer 
                                                                        data={q?.resolvedData?.renderData || q?.renderData} 
                                                                        isWordProblem={q?.selectedStoryIndex !== null && q?.selectedStoryIndex !== undefined} 
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="space-y-3 text-slate-700 mb-6">
                                                            <div className="text-center font-bold text-[12px] leading-snug px-2">
                                                                <MathDisplay content={typeof rd?.description === 'object' ? rd.description[lang] : rd?.description} />
                                                            </div>
                                                            
                                                            {/* 🔢 REFACTORED: Formal LaTeX Formula equation slot */}
                                                            {rd?.latex && (
                                                                <div className="py-2 bg-indigo-50/30 rounded-xl border border-indigo-100/50 text-center">
                                                                    <MathDisplay content={`$$${rd.latex}$$`} className="text-indigo-600 scale-90" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2 mt-auto">
                                                        <div className={`p-3 rounded-2xl text-center shadow-inner ${res.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                                            <span className="text-[8px] font-black text-white/60 uppercase block mb-0.5">
                                                                {lang === 'sv' ? "Ditt Svar" : "Your Answer"}
                                                            </span>
                                                            <span className="font-black text-white text-xs">
                                                                {res.answer || '-'}
                                                            </span>
                                                        </div>

                                                        {clues.length > 0 && (
                                                            <div className="space-y-2">
                                                                <button 
                                                                    onClick={() => setVisibleClues(prev => ({ ...prev, [idx]: !prev[idx] }))}
                                                                    className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-2 cursor-pointer
                                                                        ${visibleClues[idx] 
                                                                            ? 'bg-amber-500 border-amber-600 text-white shadow-md' 
                                                                            : 'bg-white border-amber-100 text-amber-500 hover:bg-amber-50'}`}
                                                                >
                                                                    <Zap size={12} fill={visibleClues[idx] ? "currentColor" : "none"} />
                                                                    {visibleClues[idx] ? (lang === 'sv' ? "Dölj lösning" : "Hide Solution") : (lang === 'sv' ? "Visa lösning" : "Show Solution")}
                                                                </button>

                                                                {visibleClues[idx] && (
                                                                    <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-100 animate-in slide-in-from-top-2 duration-200">
                                                                        <div className="space-y-4">
                                                                            {clues.map((step, sIdx) => {
                                                                                const stepText = typeof step === 'object' && step !== null ? step[lang] || step.text || Object.values(step)[0] : step;
                                                                                const stepLatex = typeof step === 'object' && step !== null ? step.latex || step.math : null;
                                                                                return (
                                                                                    <div key={sIdx} className="flex gap-2 items-start border-l-2 border-amber-200 pl-2">
                                                                                        <div className="flex-1 space-y-1">
                                                                                            <div className="text-[10px] font-bold text-amber-900 leading-tight">
                                                                                                <MathDisplay content={stepText} />
                                                                                            </div>
                                                                                            {stepLatex && (
                                                                                                <div className="py-1 px-2 bg-white/60 rounded border border-amber-200/50 inline-block">
                                                                                                    <MathDisplay content={`$$${stepLatex}$$`} className="text-indigo-600 scale-[0.8] origin-left" />
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>

                                <div className="p-8 bg-white border-t border-slate-100 flex justify-center">
                                    <button 
                                        disabled={cooldown > 0} 
                                        onClick={() => { 
                                            setShowMilestone(false); 
                                            setCurrentIndex(currentIndex + 1); 
                                            setInputValue(''); 
                                            setRevealMilestoneAnswers(false); 
                                        }} 
                                        className="px-16 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 disabled:opacity-50 transition-all flex items-center gap-4 active:scale-95"
                                    >
                                        {cooldown > 0 ? `${t.cooldown} (${cooldown}s)` : t.continueBtn} <ChevronRight size={20}/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                            </main>
                        </div>
                    );
                }

    // --- 3. SUMMARY UI (With Full Review & Clue Toggles) ---
    if (internalMode === 'SUMMARY') {
        const { stats } = getDiagnosticStats();

        const toggleSummaryClue = (idx) => {
            setVisibleClues(prev => ({ ...prev, [idx]: !prev[idx] }));
        };

        return (
            <div className="min-h-screen bg-slate-50 p-4 sm:p-6 flex flex-col items-center py-12 animate-in fade-in">
                <div className="w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border-b-[12px] border-slate-200">
                    
                    {/* 1. Header Section */}
                    <div className="p-10 bg-slate-900 text-white flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-1">{t.summaryTitle}</h2>
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                {Object.keys(responses).length} / {packet.length} {lang === 'sv' ? 'genomförda uppgifter' : 'tasks completed'}
                            </p>
                        </div>
                        <Beaker size={48} className="text-indigo-400 opacity-20" />
                    </div>
                    {/* 4. Dual Navigation Footer */}
                    <div className="p-12 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-center gap-4">
                        <button 
                            onClick={() => {
                                setPacket([]);
                                setResponses({});
                                setCurrentIndex(0);
                                setInternalMode('SETUP');
                            }} 
                            className="px-10 py-5 bg-white border-2 border-slate-200 text-slate-600 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                        >
                            <Settings2 size={18} /> {t.backToLab}
                        </button>

                        <button 
                            onClick={onBack} 
                            className="px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-rose-600 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                        >
                            {t.toDashboard} <LogOut size={18} />
                        </button>
                    </div>

                    {/* 2. Full Question Review Grid */}
                    <div className="p-6 sm:p-10 bg-slate-50/50 border-b border-slate-100">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 px-2 text-center sm:text-left">
                            {lang === 'sv' ? "Detaljerad genomgång" : "Detailed Review"}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {packet.map((qItem, idx) => {
                                const res = responses[idx];
                                // Safety check: Don't render cards for questions the user didn't reach
                                if (!res) return null; 

                                const rd = qItem.resolvedData?.renderData;
                                const hasVisual = rd?.graph || rd?.geometry || rd?.pattern;
                                // Check both potential locations for clues
                                const clues = qItem.clues || qItem.resolvedData?.clues || [];

                                return (
                                    <div key={idx} className={`bg-white p-6 rounded-[2.5rem] border-4 shadow-sm flex flex-col relative transition-all hover:shadow-md ${res.isCorrect ? 'border-emerald-500 shadow-emerald-50/50' : 'border-rose-400 shadow-rose-50/50'}`}>
                                        {/* 1. HEADER: Status and Question Number */}
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">
                                                {lang === 'sv' ? "Uppgift" : "Question"} {idx + 1}
                                            </span>
                                            {res.isCorrect ? <CheckCircle2 className="text-emerald-500" size={20} /> : <XCircle className="text-rose-400" size={20} />}
                                        </div>

                                        {/* 2. MINI VISUAL RENDER */}
                                        {hasVisual && (
                                            <div className="w-full h-32 flex items-center justify-center bg-slate-50/50 rounded-2xl mb-4 border border-slate-100 overflow-hidden">
                                                <div className="flex justify-center scale-90 origin-top mt-2">
                                                    <VisualRenderer 
                                                        data={q?.resolvedData?.renderData || q?.renderData} 
                                                        isWordProblem={q?.selectedStoryIndex !== null && q?.selectedStoryIndex !== undefined} 
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* 3. QUESTION CONTEXT: Description + MathBox (LaTeX) */}
                                        <div className="flex-1 space-y-3 mb-6">
                                            <div className="text-center font-bold text-slate-700 text-[14px] leading-snug px-2">
                                                <MathDisplay content={rd?.description} />
                                            </div>
                                            
                                            {/* MathBox / LaTeX Slot */}
                                            {rd?.latex && (
                                                <div className="py-2 bg-indigo-50/30 rounded-xl border border-indigo-100/50 text-center">
                                                    <MathDisplay content={`$$${rd.latex}$$`} className="text-indigo-600 scale-90" />
                                                </div>
                                            )}
                                        </div>

                                        {/* 4. DYNAMIC ANSWER BOX: Color changes based on correctness */}
                                        <div className="space-y-2 mt-auto">
                                            <div className={`p-3 rounded-2xl text-center shadow-inner transition-colors duration-500 ${res.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                                <span className="text-[8px] font-black text-white/50 uppercase block mb-0.5">
                                                    {lang === 'sv' ? "Rätt Svar" : "Correct Answer"}
                                                </span>
                                                <span className="font-black text-white text-sm">
                                                    {atob(qItem.resolvedData.token)}
                                                </span>
                                            </div>

                                            {/* 5. THE SOLUTION TOGGLE BUTTON */}
                                            {clues.length > 0 && (
                                                <div className="space-y-2">
                                                    <button 
                                                        onClick={() => toggleSummaryClue(idx)}
                                                        className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-2
                                                            ${visibleClues[idx] 
                                                                ? 'bg-amber-500 border-amber-600 text-white shadow-lg' 
                                                                : 'bg-white border-amber-100 text-amber-500 hover:bg-amber-50 hover:border-amber-200'}`}
                                                    >
                                                        <Zap size={14} fill={visibleClues[idx] ? "currentColor" : "none"} />
                                                        {visibleClues[idx] ? (lang === 'sv' ? "Dölj lösning" : "Hide Solution") : (lang === 'sv' ? "Visa lösning" : "Show Solution")}
                                                    </button>

                                                    {/* FULL SOLUTION STEPS */}
                                                    {visibleClues[idx] && (
                                                        <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-100 animate-in slide-in-from-top-2 duration-200">
                                                            <div className="flex items-center gap-2 mb-3 opacity-50">
                                                                <Info size={10} />
                                                                <span className="uppercase tracking-tighter text-[8px] font-black">
                                                                    {lang === 'sv' ? "Steg-för-steg lösning" : "Step-by-step solution"}
                                                                </span>
                                                            </div>
                                                            
                                                            <div className="space-y-4">
                                                                {clues.map((step, sIdx) => {
                                                                    // Determine the text content for the step
                                                                    const stepText = typeof step === 'object' && step !== null
                                                                        ? step[lang] || step.text || Object.values(step)[0]
                                                                        : step;

                                                                    // Look for LaTeX calculations attached specifically to this step
                                                                    const stepLatex = typeof step === 'object' && step !== null 
                                                                        ? step.latex || step.math 
                                                                        : null;

                                                                    return (
                                                                        <div key={sIdx} className="flex gap-3 items-start border-l-2 border-amber-200 pl-3">
                                                                            {/* Step Indicator */}
                                                                            <span className="text-[8px] font-black text-amber-500 bg-white w-4 h-4 rounded-full flex items-center justify-center border border-amber-100 shrink-0 mt-0.5">
                                                                                {sIdx + 1}
                                                                            </span>
                                                                            
                                                                            <div className="flex-1 space-y-2">
                                                                                {/* 1. Step Text Description */}
                                                                                <div className="text-[10px] font-bold text-amber-900 leading-relaxed">
                                                                                    <MathDisplay content={stepText} />
                                                                                </div>

                                                                                {/* 2. Step Calculation (MathBox) */}
                                                                                {stepLatex && (
                                                                                    <div className="py-2 px-3 bg-white/60 rounded-lg border border-amber-200/50 inline-block min-w-[60%]">
                                                                                        <MathDisplay 
                                                                                            content={`$$${stepLatex}$$`} 
                                                                                            className="text-indigo-600 scale-90 origin-left" 
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 3. Category Progress Summary */}
                    <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
                        {Object.entries(stats).map(([id, data]) => {
                            if (data.total === 0) return null;
                            const score = Math.round((data.correct / data.total) * 100); 
                            const cat = CATEGORIES[id];
                            return (
                                <div key={id} className={`p-8 rounded-[2.5rem] border-4 border-${cat.color}-100 bg-${cat.color}-50/30 flex flex-col gap-4`}>
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-black uppercase italic text-sm text-slate-800">{cat.label[lang]}</h4>
                                        <span className={`text-xl font-black text-${cat.color}-600`}>{score}%</span>
                                    </div>
                                    <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-slate-100">
                                        <div className={`h-full bg-${cat.color}-500 transition-all duration-1000`} style={{ width: `${score}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    
                </div>
            </div>
        );
    }
}