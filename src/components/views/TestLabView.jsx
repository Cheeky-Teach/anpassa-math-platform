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

// 🟢 CRITICAL: Import Universal Theme
import '../../styles/theme.css'; 

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
    const [activeCategory, setActiveCategory] = useState('algebra'); 
    const [revealMilestoneAnswers, setRevealMilestoneAnswers] = useState(false);
    const [visibleClues, setVisibleClues] = useState({});
    const [showGuideModal, setShowGuideModal] = useState(false);
    const [useWordProblems, setUseWordProblems] = useState(false);
    const [allowCoach, setAllowCoach] = useState(false);
    const q = packet[currentIndex];
    const coach = useMyCoach(q, lang);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => { setIsMobile(window.innerWidth < 768); };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const copyTestLink = () => {
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
                        const choiceLabel = typeof opt === 'object' ? opt.label : opt;
                        const choiceValue = typeof opt === 'object' ? opt.value : opt;
                        return (
                            // 🟢 Swapped to the Universal .btn-3d format
                            <button key={i} onClick={() => handleLabSubmit(choiceValue)} className="btn-3d w-full flex items-center gap-3">
                                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shadow-inner shrink-0 bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-main)]">
                                    {String.fromCharCode(65 + i)}
                                </span>
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
                return <div className="flex justify-center py-4 bg-[var(--bg-surface)] rounded-[var(--radius-btn)] border-2 border-dashed border-[var(--border-main)] shadow-inner w-full"><div className="transform origin-center"><FractionInput value={inputValue} onChange={setInputValue} allowMixed={true} autoFocus={!isMobile} /></div></div>;
            case 'fraction': 
                return <div className="flex justify-center py-4 bg-[var(--bg-surface)] rounded-[var(--radius-btn)] border-2 border-dashed border-[var(--border-main)] shadow-inner w-full"><div className="transform origin-center"><FractionInput value={inputValue} onChange={setInputValue} allowMixed={false} autoFocus={!isMobile} /></div></div>;
            case 'exponent': 
            case 'structured_power': 
                return <div className="flex justify-center py-4 bg-[var(--bg-surface)] rounded-[var(--radius-btn)] border-2 border-dashed border-[var(--border-main)] shadow-inner w-full"><div className="transform origin-center"><ExponentInput value={inputValue} onChange={setInputValue} autoFocus={!isMobile} /></div></div>;
            case 'scientific': 
            case 'structured_scientific': 
                return <div className="flex justify-center py-4 bg-[var(--bg-surface)] rounded-[var(--radius-btn)] border-2 border-dashed border-[var(--border-main)] shadow-inner w-full"><div className="transform origin-center"><ScientificInput value={inputValue} onChange={setInputValue} autoFocus={!isMobile} /></div></div>;
            default:
                return <input type="text" autoFocus={!isMobile} className="w-full bg-[var(--bg-surface)] border-[3px] border-[var(--border-main)] rounded-[var(--radius-btn)] px-6 py-4 text-center font-bold text-2xl outline-none focus:border-[var(--brand-text)] focus:bg-[var(--bg-card)] text-[var(--text-main)] shadow-inner transition-all" placeholder="..." value={inputValue} maxLength={20} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLabSubmit()} />;
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
                
                if (decoded.meta?.wordProblem !== undefined) setUseWordProblems(!!decoded.meta.wordProblem); 
                if (decoded.meta?.allowCoach !== undefined) setAllowCoach(!!decoded.meta.allowCoach); 
                
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

    if (internalMode === 'LOADING') return <div className="layout-wrapper flex items-center justify-center h-screen"><Loader2 className="animate-spin text-[var(--primary-color)]" size={48} /></div>;

    // =========================================================
    // --- 1. SETUP UI (Harmonized Layout via theme.css) ---
    // =========================================================
    if (internalMode === 'SETUP') {
        const currentTestCode = encodeConfig({ meta: { ...meta, wordProblem: useWordProblems, allowCoach: allowCoach }, selection });
        const activeCategoryData = CATEGORIES[activeCategory];
        const themeColor = activeCategoryData?.color || 'indigo'; // Identifies the css variable string
        const totalSelectedCount = Object.keys(selection).filter(k => selection[k].enabled).length;

        return (
            // 🟢 WRAPPED IN THE DYNAMIC THEME CLASS
            <div className={`theme-${themeColor} layout-wrapper font-sans relative z-10 animate-in fade-in`}>
                <div className="layout-twocol">
                    
                    {/* LEFT COLUMN: COMMAND CENTER (CONFIG SIDEBAR) */}
                    <aside className="layout-sidebar">
                        
                        {/* Status Card & Test Code */}
                        <div className="card flex flex-col gap-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-[var(--brand-solid)] rounded-2xl flex items-center justify-center text-white shadow-md shrink-0">
                                        <Beaker size={24} />
                                    </div>
                                    <div>
                                        <h1 className="text-lg font-bold text-[var(--text-main)] leading-none mb-1">{t.title}</h1>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                                            {lang === 'sv' ? 'Konfigurera pass' : 'Configure session'}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowGuideModal(true)}
                                    className="p-2 text-[var(--brand-text)] hover:bg-[var(--brand-bg)] rounded-[var(--radius-btn)] transition-all border border-[var(--border-main)] flex items-center gap-1 text-[10px] font-black uppercase"
                                    title={t.guideBtn}
                                >
                                    <HelpCircle size={16} />
                                </button>
                            </div>

                            <div className="flex flex-col items-center bg-[var(--brand-bg)] px-4 py-3 rounded-[var(--radius-btn)] border border-[var(--brand-border)]">
                                <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--brand-text)] opacity-60 mb-0.5">{t.testCode}</span>
                                <span className="text-xl font-black tracking-[0.2em] text-[var(--brand-text)] uppercase">{currentTestCode}</span>
                            </div>

                            <button onClick={onBack} className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--theme-rose-bg)] text-[var(--theme-rose-text)] border border-[var(--theme-rose-border)] rounded-[var(--radius-btn)] text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer">
                                <LogOut size={14} /> {t.toDashboard}
                            </button>
                        </div>

                        {/* Configuration Controls Stack */}
                        <div className="card flex flex-col gap-4">
                            <div className="flex items-center gap-2 ml-1">
                                <Settings2 size={14} className="text-[var(--text-muted)]" />
                                <h2 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                                    {lang === 'sv' ? "Inställningar" : "Settings"}
                                </h2>
                            </div>

                            {/* Preset Selector */}
                            <div>
                                <span className="block text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-1 ml-1">
                                    {lang === 'sv' ? "Snabbval (Preset)" : "Presets"}
                                </span>
                                <select 
                                    value={meta.bundleId || ""}
                                    onChange={(e) => applyPresetSelection(e.target.value)}
                                    className="w-full bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-[var(--radius-btn)] px-3 py-2 font-bold text-xs text-[var(--text-main)] focus:border-[var(--brand-solid)] focus:bg-[var(--bg-card)] outline-none transition-all cursor-pointer"
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
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-[var(--radius-btn)] text-xs font-black uppercase tracking-wider transition-all border-2 cursor-pointer shadow-sm ${
                                    meta.mode === 'exam' 
                                        ? 'bg-[var(--theme-rose-bg)] border-[var(--theme-rose-border)] text-[var(--theme-rose-text)]' 
                                        : 'bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--text-main)] hover:border-[var(--theme-rose-border)] hover:text-[var(--theme-rose-text)]'
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
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-[var(--radius-btn)] text-xs font-black uppercase tracking-wider transition-all border-2 cursor-pointer shadow-sm ${
                                    useWordProblems 
                                        ? 'bg-[var(--theme-emerald-bg)] border-[var(--theme-emerald-border)] text-[var(--theme-emerald-text)]' 
                                        : 'bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--text-main)] hover:border-[var(--theme-emerald-border)] hover:text-[var(--theme-emerald-text)]'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <HelpCircle size={14} fill={useWordProblems ? "currentColor" : "none"} className={useWordProblems ? "text-[var(--theme-emerald-bg)]" : ""}/>
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
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-[var(--radius-btn)] text-xs font-black uppercase tracking-wider transition-all border-2 cursor-pointer shadow-sm ${
                                    allowCoach 
                                        ? 'bg-[var(--theme-indigo-bg)] border-[var(--theme-indigo-border)] text-[var(--theme-indigo-text)]' 
                                        : 'bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--text-main)] hover:border-[var(--theme-indigo-border)] hover:text-[var(--theme-indigo-text)]'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Info size={14} fill={allowCoach ? "currentColor" : "none"} className={allowCoach ? "text-[var(--theme-indigo-bg)]" : ""}/>
                                    <span>{lang === 'sv' ? 'Ledtrådar / Coach' : 'Clues / Coach'}</span>
                                </div>
                                <span className="text-[9px] opacity-80 uppercase">
                                    {allowCoach ? (lang === 'sv' ? 'Tillåten' : 'Allowed') : (lang === 'sv' ? 'Avstängd' : 'Disabled')}
                                </span>
                            </button>

                            {/* Question Limit Input */}
                            <div className="flex items-center justify-between bg-[var(--bg-surface)] border-2 border-[var(--border-strong)] rounded-[var(--radius-btn)] px-3 py-2 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <ListChecks size={16} className="text-[var(--text-muted)]"/>
                                    <span className="text-xs font-black uppercase tracking-wider text-[var(--text-main)]">
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
                                    className="w-12 bg-[var(--bg-card)] rounded-[var(--radius-btn)] text-[var(--text-main)] font-black text-xs text-center py-1 outline-none border border-[var(--border-main)] focus:border-[var(--brand-solid)]"
                                />
                            </div>

                            {/* Action Buttons: Copy Link & Reset */}
                            <div className="grid grid-cols-2 gap-2 pt-2">
                                <button type="button" onClick={copyTestLink} className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-[var(--radius-btn)] text-[10px] font-black uppercase tracking-wider bg-[var(--theme-indigo-bg)] text-[var(--theme-indigo-text)] border border-[var(--theme-indigo-border)] hover:bg-indigo-500 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95">
                                    <LayoutGrid size={13}/> {t.copyLink}
                                </button>
                                <button onClick={resetAllSelection} className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-[var(--radius-btn)] text-[10px] font-black uppercase tracking-wider bg-[var(--theme-rose-bg)] text-[var(--theme-rose-text)] border border-[var(--theme-rose-border)] hover:bg-rose-500 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95">
                                    <RefreshCcw size={13} /> {lang === 'sv' ? "Rensa" : "Reset"}
                                </button>
                            </div>
                        </div>

                        {/* Prominent Start Button (Now natively maps to Category Theme) */}
                        <button 
                            type="button"
                            onClick={startNewSession} 
                            disabled={totalSelectedCount === 0} 
                            className="btn-brand py-4 shadow-xl active:scale-95 disabled:opacity-40"
                        >
                            <Play size={16} fill="currentColor"/>
                            <span>{t.startBtn}</span>
                            <span className="text-[10px] font-black bg-[var(--bg-card)] text-[var(--brand-text)] px-2 py-0.5 rounded-lg border border-[var(--brand-border)]">
                                {totalSelectedCount}
                            </span>
                        </button>
                    </aside>


                    {/* ➡️ RIGHT COLUMN: MAIN TOPIC SELECTION AREA */}
                    <main className="layout-main">
                        
                        {/* Horizontal Category Tabs */}
                        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 mb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                            {Object.entries(CATEGORIES).map(([catKey, category]) => {
                                const isActive = activeCategory === catKey;
                                const count = category.topics.filter(t => selection[t.id]?.enabled).length;
                                
                                return (
                                    <button 
                                        key={catKey}
                                        onClick={() => setActiveCategory(catKey)}
                                        className={`flex items-center gap-2 px-5 py-3 rounded-[var(--radius-btn)] font-bold uppercase text-[11px] tracking-widest whitespace-nowrap transition-all shadow-sm border cursor-pointer ${
                                            isActive 
                                                ? 'bg-[var(--brand-solid)] text-white border-transparent shadow-md' 
                                                : 'bg-[var(--bg-card)] border-[var(--border-main)] text-[var(--text-muted)] hover:border-[var(--brand-solid)] hover:text-[var(--brand-text)]'
                                        }`}
                                    >
                                        <Award size={14} />
                                        {category.label[lang]}
                                        {count > 0 && (
                                            <span className="ml-1 px-1.5 py-0.5 bg-[var(--bg-card)] text-[var(--brand-text)] rounded-full text-[9px]">
                                                {count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Active Category Topics Grid */}
                        <div className="card flex-1">
                            <div className="mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-[var(--radius-btn)] flex items-center justify-center bg-[var(--brand-solid)] text-white shadow-md">
                                        <Award size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-[var(--text-main)] tracking-tight leading-none mb-1">
                                            {activeCategoryData.label[lang]}
                                        </h3>
                                        <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest leading-none">
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
                                                [topic.id]: { ...p[topic.id], levels: newLevels, enabled: newLevels.length > 0 }
                                            };
                                        });
                                    };

                                    return (
                                        <div key={topic.id} className={`card-interactive flex flex-col justify-between ${isEnabled ? 'border-[var(--brand-solid)] shadow-md bg-[var(--bg-card)]' : 'border-[var(--border-main)] bg-[var(--bg-surface)] opacity-75 hover:opacity-100'}`}>
                                            <div>
                                                <div className="flex items-start justify-between mb-3">
                                                    <h4 className="font-bold text-xs text-[var(--text-main)] leading-tight pr-2">{topic.label[lang]}</h4>
                                                    <button 
                                                        onClick={() => {
                                                            setMeta(p => ({ ...p, isNationalTest: false, bundleId: null }));
                                                            setSelection(p => ({ 
                                                                ...p, [topic.id]: { enabled: !isEnabled, levels: !isEnabled ? topicLevels : [] } 
                                                            }));
                                                        }}
                                                        className={`w-7 h-7 rounded-[var(--radius-btn)] flex items-center justify-center shrink-0 transition-all cursor-pointer ${isEnabled ? 'bg-[var(--brand-solid)] text-white shadow-sm border border-transparent' : 'bg-[var(--bg-card)] text-transparent border border-[var(--border-strong)]'}`}
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
                                                                className={`w-8 h-8 rounded-[var(--radius-btn)] text-[10px] font-black transition-all border flex items-center justify-center cursor-pointer
                                                                    ${isActive 
                                                                        ? 'bg-[var(--brand-solid)] border-[var(--brand-solid)] text-white shadow-xs' 
                                                                        : 'bg-[var(--bg-card)] border-[var(--border-main)] text-[var(--text-muted)] hover:border-[var(--brand-text)] hover:text-[var(--brand-text)]'
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
                                                <div className="mt-3 p-2.5 bg-[var(--bg-surface)] rounded-[var(--radius-btn)] border border-[var(--border-main)] max-h-24 overflow-y-auto custom-scrollbar">
                                                    <div className="space-y-1">
                                                        {selectedLevels.map(lvl => (
                                                            <div key={lvl} className="flex gap-1.5 text-[8px] leading-tight items-start">
                                                                <span className="font-black text-[var(--brand-text)]">N{lvl}</span>
                                                                <span className="text-[var(--text-muted)] font-medium truncate">
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
                    <div className="modal-overlay">
                        <div className="card-flat w-full max-w-xl max-h-[85vh] animate-in zoom-in-95">
                            <div className="card-header-flat">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-[var(--brand-bg)] text-[var(--brand-text)] rounded-[var(--radius-btn)] border border-[var(--brand-border)]"><HelpCircle size={20}/></div>
                                    <h2 className="text-lg font-black uppercase tracking-tight italic text-[var(--text-main)]">{t.guideTitle}</h2>
                                </div>
                                <button onClick={() => setShowGuideModal(false)} className="btn-ghost"><X size={18} /></button>
                            </div>
                            
                            <div className="card-body-flat overflow-y-auto space-y-4 custom-scrollbar text-xs font-medium text-[var(--text-main)] leading-relaxed">
                                <p>1. {lang === 'sv' ? "Snabbval" : "Presets"}: {t.guidePreset}</p>
                                <p>2. {lang === 'sv' ? "Frågeantal" : "Quantity"}: {t.guideCustom}</p>
                                <p>3. {lang === 'sv' ? "Lägen" : "Modes"}: {t.guideModes}</p>
                                <p>4. {lang === 'sv' ? "Dela" : "Sharing"}: {t.guideReview}</p>
                                <p>5. {lang === 'sv' ? "Elever" : "Students"}: {t.guideControls}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // =========================================================
    // --- 2. ACTIVE TEST UI (Harmonized Layout via theme.css) ---
    // =========================================================
    if (internalMode === 'ACTIVE') {
        if (packet.length === 0 || isGenerating) {
            return (
                <div className="layout-wrapper flex flex-col items-center justify-center h-screen gap-4">
                    <Loader2 className="animate-spin text-[var(--primary-color)]" size={48} />
                    <p className="text-xs font-black uppercase text-[var(--text-muted)] tracking-widest">
                        {lang === 'sv' ? "Hämtar uppgifter..." : "Fetching questions..."}
                    </p>
                </div>
            );
        }
        
        const q = packet[currentIndex];
        if (!q || !q.resolvedData) {
            return (
                <div className="layout-wrapper flex items-center justify-center h-screen">
                    <p className="text-[var(--text-muted)]">Error loading question. Please go back and try again.</p>
                </div>
            );
        }
        
        return (
            <div className="layout-wrapper font-sans flex flex-col overflow-hidden">
                {/* 🟢 Swapped from header-compact to a relative block so it stacks perfectly under App.jsx */}
                <header className="relative z-30 w-full bg-[var(--bg-surface)] border-b border-[var(--border-main)] px-4 py-2 transition-colors duration-500 no-print">
                    <div className="max-w-6xl w-full mx-auto flex items-center justify-between gap-2">
                        
                        <div className="flex items-center gap-1">
                            <button onClick={() => setInternalMode('SETUP')} className="btn-ghost mr-2 text-[9px] font-black uppercase tracking-tight py-2 border border-[var(--border-subtle)]">
                                <Settings2 size={12} /> {t.backToLab}
                            </button>
                            <button onClick={() => setCurrentIndex(p => Math.max(0, p - 1))} className="btn-ghost">
                                <ChevronLeft size={28} />
                            </button>
                        </div>

                        <div className="flex flex-col items-center">
                            <h1 className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">{t.title}</h1>
                            <div className="bg-[var(--text-main)] text-[var(--bg-canvas)] px-3 py-1 rounded-[var(--radius-btn)] text-[10px] font-black uppercase italic tracking-widest">
                                {currentIndex + 1} / {meta.limit || "∞"}
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <button onClick={() => setCurrentIndex(p => Math.min(packet.length - 1, p + 1))} className="btn-ghost">
                                <ChevronRight size={28} />
                            </button>
                            <button onClick={onBack} className="btn-ghost ml-2 px-3 py-2 text-[9px] font-black uppercase tracking-tight hover:!text-[var(--theme-rose-text)] hover:!bg-[var(--theme-rose-bg)] border border-[var(--border-subtle)]">
                                {t.toDashboard}
                            </button>
                        </div>
                    </div>
                </header>

                {coach.isOpen && (
                    <MyCoachModal 
                        visible={coach.isOpen} onClose={coach.closeCoach} question={q} lang={lang} {...coach.coachProps} 
                    />
                )}

                <main className="flex-1 max-w-6xl w-full mx-auto p-3 lg:p-6 overflow-hidden flex flex-col relative">
                    
                    {/* Flush Card Container */}
                    <div className="card p-0 flex-1 overflow-y-auto lg:overflow-hidden flex flex-col transition-all duration-300">
                        
                        {/* MOBILE PROGRESS BAR */}
                        <div className="sm:hidden h-1 bg-[var(--bg-surface)] flex shrink-0">
                            {packet.map((_, i) => (
                                <div key={i} className={`flex-1 ${i === currentIndex ? 'bg-[var(--primary-color)]' : !!responses[i] ? 'bg-[var(--border-strong)]' : 'bg-transparent'}`} />
                            ))}
                        </div>

                        {/* QUESTION HEADER */}
                        <div className="card-header-flat shrink-0">
                            <span className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-[0.25em]">{lang === 'sv' ? "Uppgift" : "Question"} {currentIndex + 1} / {packet.length}</span>
                            
                            <div className="flex items-center gap-3">
                                {allowCoach && !responses[currentIndex] && (
                                    <button onClick={coach.openCoach} className="btn-brand bg-[var(--theme-indigo-bg)] text-[var(--theme-indigo-text)] py-1.5 px-3 text-[9px]">
                                        <Info size={14} /> {lang === 'sv' ? 'Hjälp!' : 'Help!'}
                                    </button>
                                )}
                                {!!responses[currentIndex] && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black uppercase text-[var(--theme-emerald-text)] tracking-widest">{t.answerReceived}</span>
                                        <CheckCircle2 className="text-[var(--theme-emerald-text)]" size={20} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SPLIT RESPONSIVE GRID */}
                        <div className="lg:flex-1 grid grid-cols-1 lg:grid-cols-2 lg:divide-x divide-[var(--border-subtle)]">
                            
                            {/* TEXT & INPUT SECTION */}
                            <div className="flex flex-col order-1 lg:h-full lg:overflow-hidden border-b lg:border-b-0 border-[var(--border-subtle)]">
                                <div className="p-6 lg:p-12 flex-1 flex flex-col justify-center space-y-6 overflow-y-auto">
                                    <div className="text-xl lg:text-3xl font-bold text-[var(--text-main)] leading-relaxed text-center lg:text-left">
                                        <MathDisplay content={q?.resolvedData?.renderData?.description} />
                                    </div>
                                    {q?.resolvedData?.renderData?.latex && !q?.resolvedData?.renderData?.isWordProblemApplied && !q?.resolvedData?.renderData?.geometry && (
                                        <div className="mt-6 text-3xl lg:text-5xl font-serif border-t border-[var(--border-subtle)] pt-6 animate-in fade-in duration-300 flex justify-center lg:justify-start">
                                            <div className="whiteboard-protect px-8 py-6 rounded-[var(--radius-btn)] border border-slate-200 shadow-sm inline-block">
                                                <MathDisplay content={`$$${q.resolvedData.renderData.latex}$$`} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* FEEDBACK SECTION */}
                                <div className="p-6 lg:p-10 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] shrink-0">
                                    {!responses[currentIndex] ? (
                                        <div className="max-w-md mx-auto space-y-4">
                                            {renderInput()}
                                            {!(packet[currentIndex]?.resolvedData?.renderData?.options) && (
                                                <button onClick={() => handleLabSubmit()} disabled={!inputValue} className="btn-brand w-full py-4 text-xs shadow-xl active:scale-95 disabled:opacity-20 flex items-center justify-center gap-3">
                                                    <Send size={20} /> {lang === 'sv' ? "Svara" : "Submit"}
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="max-w-md mx-auto animate-in zoom-in-95 duration-300">
                                            {meta.mode === 'practice' ? (
                                                <div className={`p-6 rounded-[var(--radius-card)] border-4 flex flex-col items-center gap-4 shadow-lg
                                                    ${responses[currentIndex].isCorrect ? 'bg-[var(--theme-emerald-bg)] border-[var(--theme-emerald-border)]' : 'bg-[var(--theme-rose-bg)] border-[var(--theme-rose-border)]'}`}>
                                                    
                                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white
                                                        ${responses[currentIndex].isCorrect ? 'bg-emerald-500 animate-bounce' : 'bg-rose-500 animate-shake'}`}>
                                                        {responses[currentIndex].isCorrect ? <Check size={32} strokeWidth={4} /> : <XCircle size={32} strokeWidth={4} />}
                                                    </div>
                                                    
                                                    <div className="text-center">
                                                        <p className={`text-xl font-black uppercase italic tracking-tight
                                                            ${responses[currentIndex].isCorrect ? 'text-[var(--theme-emerald-text)]' : 'text-[var(--theme-rose-text)]'}`}>
                                                            {responses[currentIndex].isCorrect ? (lang === 'sv' ? "Snyggt jobbat!" : "Great job!") : (lang === 'sv' ? "Inte riktigt rätt" : "Not quite right")}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">
                                                            {t.nextArr}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="py-8 text-center bg-[var(--bg-card)] rounded-[var(--radius-card)] border-2 border-dashed border-[var(--border-main)]">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <CheckCircle2 size={32} className="text-[var(--text-muted)]" />
                                                        <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest animate-pulse italic">
                                                            {t.answerReceived} — {t.nextArr}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* VISUAL SIDE (Whiteboard Protected) */}
                            {q?.resolvedData?.renderData && (q.resolvedData.renderData.graph || q.resolvedData.renderData.geometry || q.resolvedData.renderData.pattern) ? (
                                <div className="p-6 lg:p-12 flex items-center justify-center whiteboard-protect order-2 min-h-[400px] lg:h-full border-t lg:border-t-0 border-[var(--border-subtle)] relative overflow-hidden pb-12 lg:pb-12 shadow-inner">
                                    <div className="absolute inset-0 flex items-center justify-center p-8 lg:p-16">
                                        <div className="flex justify-center scale-90 origin-top mt-2">
                                            <VisualRenderer data={q?.resolvedData?.renderData || q?.renderData} isWordProblem={q?.selectedStoryIndex !== null && q?.selectedStoryIndex !== undefined} />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="hidden lg:block order-2 bg-[var(--bg-surface)] opacity-30" />
                            )}
                        </div>

                        {/* MILESTONE REVIEW MODAL */}
                        {showMilestone && (
                            <div className="modal-overlay rounded-[var(--radius-card)] lg:rounded-[3.5rem]">
                                <div className="card-flat w-full max-w-5xl max-h-[90vh] rounded-[var(--radius-card)] lg:rounded-[3.5rem]">
                                    
                                    <div className="card-header-flat bg-[var(--bg-surface)] border-b border-[var(--border-main)] p-8 lg:p-10">
                                        <div>
                                            <h2 className="text-3xl lg:text-4xl font-black text-[var(--text-main)] italic tracking-tight uppercase mb-2">
                                                {t.milestoneTitle}
                                            </h2>
                                            <p className="text-[var(--text-muted)] font-medium text-xs lg:text-sm">
                                                {lang === 'sv' ? 'Granska dina senaste svar innan du går vidare.' : 'Review your recent answers before continuing.'}
                                            </p>
                                        </div>
                                        <button onClick={() => setInternalMode('SUMMARY')} className="btn-brand bg-[var(--theme-rose-bg)] text-[var(--theme-rose-text)] hover:!bg-rose-500 hover:!text-white border border-[var(--theme-rose-border)] px-6 py-3 text-[10px]">
                                            {t.finish}
                                        </button>
                                    </div>

                                    <div className="card-body-flat overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-[var(--bg-canvas)] custom-scrollbar">
                                        {Object.keys(responses).filter(idx => idx >= currentIndex - 14 && idx <= currentIndex).map(idx => {
                                            const qItem = packet[idx];
                                            const res = responses[idx];
                                            const rd = qItem?.resolvedData?.renderData;
                                            const hasVisual = rd?.graph || rd?.geometry || rd?.pattern;
                                            const clues = qItem?.clues || qItem?.resolvedData?.clues || [];

                                            return (
                                                <div key={idx} className={`card p-6 border-4 flex flex-col justify-between transition-all ${res.isCorrect ? 'border-emerald-500 shadow-lg' : 'border-rose-400 shadow-md'}`}>
                                                    <div>
                                                        <div className="flex justify-between items-center mb-4">
                                                            <span className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">{lang === 'sv' ? "Uppgift" : "Question"} {parseInt(idx) + 1}</span>
                                                            {res.isCorrect ? <CheckCircle2 className="text-emerald-500" size={20} /> : <XCircle className="text-rose-400" size={20} />}
                                                        </div>

                                                        {hasVisual && (
                                                            <div className="w-full flex justify-center whiteboard-protect p-4 rounded-[var(--radius-btn)] mb-4 border border-slate-200 shadow-sm overflow-hidden">
                                                                <div className="flex justify-center scale-90 origin-top mt-2">
                                                                    <VisualRenderer data={q?.resolvedData?.renderData || q?.renderData} isWordProblem={q?.selectedStoryIndex !== null && q?.selectedStoryIndex !== undefined} />
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="space-y-3 text-[var(--text-main)] mb-6">
                                                            <div className="text-center font-bold text-[12px] leading-snug px-2">
                                                                <MathDisplay content={typeof rd?.description === 'object' ? rd.description[lang] : rd?.description} />
                                                            </div>
                                                            {rd?.latex && (
                                                                <div className="py-2 whiteboard-protect rounded-[var(--radius-btn)] border border-slate-200 shadow-sm text-center">
                                                                    <MathDisplay content={`$$${rd.latex}$$`} className="scale-90" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2 mt-auto">
                                                        <div className={`p-3 rounded-[var(--radius-btn)] text-center shadow-inner ${res.isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                                            <span className="text-[8px] font-black uppercase block mb-0.5 opacity-70">{lang === 'sv' ? "Ditt Svar" : "Your Answer"}</span>
                                                            <span className="font-black text-xs">{res.answer || '-'}</span>
                                                        </div>

                                                        {clues.length > 0 && (
                                                            <div className="space-y-2">
                                                                <button onClick={() => setVisibleClues(prev => ({ ...prev, [idx]: !prev[idx] }))} className={`btn-brand w-full py-2.5 text-[9px] bg-[var(--theme-amber-bg)] text-[var(--theme-amber-text)] border border-[var(--theme-amber-border)] ${visibleClues[idx] ? '!bg-amber-500 !text-white' : ''}`}>
                                                                    <Zap size={12} fill={visibleClues[idx] ? "currentColor" : "none"} />
                                                                    {visibleClues[idx] ? (lang === 'sv' ? "Dölj lösning" : "Hide Solution") : (lang === 'sv' ? "Visa lösning" : "Show Solution")}
                                                                </button>
                                                                {visibleClues[idx] && (
                                                                    <div className="p-4 bg-[var(--theme-amber-bg)] rounded-[var(--radius-btn)] border border-[var(--theme-amber-border)] animate-in slide-in-from-top-2 duration-200">
                                                                        <div className="space-y-4">
                                                                            {clues.map((step, sIdx) => {
                                                                                const stepText = typeof step === 'object' && step !== null ? step[lang] || step.text || Object.values(step)[0] : step;
                                                                                const stepLatex = typeof step === 'object' && step !== null ? step.latex || step.math : null;
                                                                                return (
                                                                                    <div key={sIdx} className="flex gap-2 items-start border-l-2 border-amber-300 pl-2">
                                                                                        <div className="flex-1 space-y-1">
                                                                                            <div className="text-[10px] font-bold text-amber-900 leading-tight"><MathDisplay content={stepText} /></div>
                                                                                            {stepLatex && <div className="py-1 px-2 bg-white/60 rounded border border-amber-200/50 inline-block"><MathDisplay content={`$$${stepLatex}$$`} className="text-[var(--text-main)] scale-[0.8] origin-left" /></div>}
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

                                    <div className="p-8 bg-[var(--bg-card)] border-t border-[var(--border-main)] flex justify-center">
                                        <button disabled={cooldown > 0} onClick={() => { setShowMilestone(false); setCurrentIndex(currentIndex + 1); setInputValue(''); setRevealMilestoneAnswers(false); }} className="btn-brand px-16 py-5 rounded-[2rem] tracking-[0.2em] shadow-xl text-[14px]">
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
        const toggleSummaryClue = (idx) => { setVisibleClues(prev => ({ ...prev, [idx]: !prev[idx] })); };

        return (
            <div className="layout-wrapper p-4 sm:p-6 flex flex-col items-center py-6 animate-in fade-in">
                {/* 🟢 Expanded max-w to 1400px to utilize widescreen resolution */}
                <div className="card w-full max-w-[1400px] overflow-hidden border-b-[8px] p-0 border-[var(--border-main)] shadow-xl">
                    
                    <div className="p-6 sm:p-8 bg-[var(--text-main)] text-[var(--bg-canvas)] flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-1">{t.summaryTitle}</h2>
                            <p className="opacity-70 font-bold uppercase text-[10px] tracking-widest">
                                {Object.keys(responses).length} / {packet.length} {lang === 'sv' ? 'genomförda uppgifter' : 'tasks completed'}
                            </p>
                        </div>
                        <Beaker size={40} className="opacity-20 hidden sm:block" />
                    </div>

                    {/* Compact Footer Navigation */}
                    <div className="p-6 sm:p-8 bg-[var(--bg-surface)] border-t border-[var(--border-main)] flex flex-col sm:flex-row justify-center gap-4">
                        <button onClick={() => { setPacket([]); setResponses({}); setCurrentIndex(0); setInternalMode('SETUP'); }} className="btn-brand bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-main)] px-8 py-4 rounded-[var(--radius-card)]">
                            <Settings2 size={16} /> {t.backToLab}
                        </button>
                        <button onClick={onBack} className="btn-brand px-8 py-4 rounded-[var(--radius-card)]">
                            {t.toDashboard} <LogOut size={16} />
                        </button>
                    </div>

                    <div className="p-4 sm:p-6 bg-[var(--bg-canvas)] border-b border-[var(--border-main)]">
                        <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-4 px-2 text-center sm:text-left">{lang === 'sv' ? "Detaljerad genomgång" : "Detailed Review"}</h3>
                        
                        {/* 🟢 Upgraded to a 4-column layout for widescreen monitors */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {packet.map((qItem, idx) => {
                                const res = responses[idx];
                                if (!res) return null; 

                                const rd = qItem.resolvedData?.renderData;
                                const hasVisual = rd?.graph || rd?.geometry || rd?.pattern;
                                const clues = qItem.clues || qItem.resolvedData?.clues || [];

                                return (
                                    <div key={idx} className={`card p-4 sm:p-5 border-4 flex flex-col relative transition-all hover:shadow-md ${res.isCorrect ? 'border-emerald-500 shadow-sm' : 'border-rose-400 shadow-sm'}`}>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">{lang === 'sv' ? "Uppgift" : "Question"} {idx + 1}</span>
                                            {res.isCorrect ? <CheckCircle2 className="text-emerald-500" size={18} /> : <XCircle className="text-rose-400" size={18} />}
                                        </div>

                                        {hasVisual && (
                                            <div className="w-full h-28 flex items-center justify-center whiteboard-protect rounded-[var(--radius-btn)] mb-3 border border-slate-200 shadow-sm overflow-hidden">
                                                <div className="flex justify-center scale-75 origin-center">
                                                    <VisualRenderer data={q?.resolvedData?.renderData || q?.renderData} isWordProblem={q?.selectedStoryIndex !== null && q?.selectedStoryIndex !== undefined} />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex-1 space-y-2 mb-4">
                                            <div className="text-center font-bold text-[var(--text-main)] text-[12px] leading-snug px-1">
                                                <MathDisplay content={rd?.description} />
                                            </div>
                                            {rd?.latex && (
                                                <div className="py-2 whiteboard-protect rounded-[var(--radius-btn)] border border-slate-200 shadow-sm text-center">
                                                    <MathDisplay content={`$$${rd.latex}$$`} className="scale-90" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2 mt-auto">
                                            <div className={`p-2.5 rounded-[var(--radius-btn)] text-center shadow-inner transition-colors duration-500 ${res.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                                <span className="text-[8px] font-black text-white/50 uppercase block mb-0.5">{lang === 'sv' ? "Rätt Svar" : "Correct Answer"}</span>
                                                <span className="font-black text-white text-xs">{atob(qItem.resolvedData.token)}</span>
                                            </div>

                                            {clues.length > 0 && (
                                                <div className="space-y-2">
                                                    <button onClick={() => toggleSummaryClue(idx)} className={`btn-brand w-full py-2 text-[9px] bg-[var(--theme-amber-bg)] text-[var(--theme-amber-text)] border border-[var(--theme-amber-border)] ${visibleClues[idx] ? '!bg-amber-500 !text-white' : ''}`}>
                                                        <Zap size={12} fill={visibleClues[idx] ? "currentColor" : "none"} />
                                                        {visibleClues[idx] ? (lang === 'sv' ? "Dölj lösning" : "Hide Solution") : (lang === 'sv' ? "Visa lösning" : "Show Solution")}
                                                    </button>
                                                    {visibleClues[idx] && (
                                                        <div className="p-3 bg-[var(--theme-amber-bg)] rounded-[var(--radius-btn)] border border-[var(--theme-amber-border)] animate-in slide-in-from-top-2 duration-200">
                                                            <div className="flex items-center gap-2 mb-2 opacity-50">
                                                                <Info size={10} />
                                                                <span className="uppercase tracking-tighter text-[8px] font-black text-[var(--theme-amber-text)]">{lang === 'sv' ? "Steg-för-steg lösning" : "Step-by-step solution"}</span>
                                                            </div>
                                                            <div className="space-y-3">
                                                                {clues.map((step, sIdx) => {
                                                                    const stepText = typeof step === 'object' && step !== null ? step[lang] || step.text || Object.values(step)[0] : step;
                                                                    const stepLatex = typeof step === 'object' && step !== null ? step.latex || step.math : null;
                                                                    return (
                                                                        <div key={sIdx} className="flex gap-2 items-start border-l-2 border-amber-300 pl-2">
                                                                            <span className="text-[8px] font-black text-amber-500 bg-[var(--bg-card)] w-4 h-4 rounded-full flex items-center justify-center border border-amber-200 shrink-0 mt-0.5">{sIdx + 1}</span>
                                                                            <div className="flex-1 space-y-1">
                                                                                <div className="text-[9px] font-bold text-amber-900 leading-relaxed"><MathDisplay content={stepText} /></div>
                                                                                {stepLatex && <div className="py-1.5 px-2 bg-[var(--bg-card)]/60 rounded border border-amber-200/50 inline-block min-w-[60%]"><MathDisplay content={`$$${stepLatex}$$`} className="text-[var(--text-main)] scale-90 origin-left" /></div>}
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

                    <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-4 bg-[var(--bg-card)]">
                        {Object.entries(stats).map(([id, data]) => {
                            if (data.total === 0) return null;
                            const score = Math.round((data.correct / data.total) * 100); 
                            const cat = CATEGORIES[id];
                            return (
                                <div key={id} className={`theme-${cat.color} p-6 rounded-[var(--radius-card)] border-2 border-[var(--brand-border)] bg-[var(--brand-bg)] flex flex-col gap-3`}>
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-black uppercase italic text-sm text-[var(--brand-text)]">{cat.label[lang]}</h4>
                                        <span className={`text-xl font-black text-[var(--brand-solid)]`}>{score}%</span>
                                    </div>
                                    <div className="w-full h-3 bg-[var(--bg-card)] rounded-full overflow-hidden border border-[var(--brand-border)]">
                                        <div className={`h-full bg-[var(--brand-solid)] transition-all duration-1000`} style={{ width: `${score}%` }} />
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