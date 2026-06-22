import React, { useState, useEffect, useRef } from 'react';
import { 
    Loader2, ChevronLeft, Beaker, Play, Check, 
    ChevronDown, Settings2, Zap, ArrowRight, 
    RefreshCcw, Eye, Clock, Lock, Send, ListChecks, 
    LayoutGrid, XCircle, ChevronRight, LogOut,
    CheckCircle2, Award, Info, HelpCircle
} from 'lucide-react';
import { decodeConfig, encodeConfig, BUNDLE_PRESETS } from '../../core/utils/labCodeUtils';
// Added LEVEL_DESCRIPTIONS to imports
import { CATEGORIES, LEVEL_DESCRIPTIONS } from '../../constants/localization';

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
        startBtn: "Starta", selectedAreas: "valda", level: "Nivå", back: "Tillbaka",
        loading: "Laddar...", milestoneTitle: "Dags för en paus!", continueBtn: "Nästa Etapp",
        cooldown: "Vänta...", showAnswers: "Visa rätt svar", quit: "Avbryt Passet",
        answerReceived: "Svar mottaget", nextArr: "Fortsätt med pilen", finish: "Avsluta & Se Resultat",
        summaryTitle: "Testrapport", recoveryTitle: "Rekommenderad träning", recoveryDesc: "Fokusera på dina svagaste områden.",
        copyLink: "Kopiera länk", linkCopied: "Länk kopierad till urklipp!", toDashboard: "Lämna",
        backToLab: "Till Labbet",
        guideTitle: "Så fungerar Testlabbet (Custom övergripande mängdträningsuppgifter)",
        guidePreset: "Välj ett färdigt paket (t.ex. NP-GEO) för att automatiskt välja alla nivåer i den kategorin ELLER välj ämnen manuellt i listan nedan och klicka på nivå-bubblorna (1-9) för att anpassa svårighetsgraden. ",
        guideCustom: "Ange hur många frågor ska inkluderas. Om Antal Frågor står tom då skapas ett prov med 50 frågor med en rapport varje 15 frågor. Om man skriver in manuellt hur många frågor övningsprovet ska innehålla då kan man se en rapport halvvägs genom testet där man ser de sista frågorna som svarades, facit, och ett steg-för-steg lösning till alla frågor. En fullständig diagnosrapport visas upp när man är klar.",
        guideModes: "Övningsläge ger dig direkt feedback på varje svar. Provläge döljer alla resultat fram tills varje rapport.",
        guideReview: "KOPIERA LÄNKEN efter du har valt vilka område du vill lägga in i övningsprovet och dela med dina elever.",
        guideControls: "ELEVERNA KOMMER ÅT ÖVNINGSPROVET GENOM ATT KLICKA PÅ LÄNKEN DU DELADE OCH SEN BEHÖVER SKRIVA IN EN GILTIG KLASSKOD TILL 'EGEN ÖVNING' på startsidan. OBS: LÄNKARNA ÄR GILTIGA UNDER HELA BETA-TEST PERIODEN OCH KAN ÅTERANVÄNDAS. Det kan vara så i framtiden att appen uppdateras och nya länkar behöver skapas."
    },
    en: {
        title: "Test Lab", testCode: "Test Code", modeExam: "Exam Mode", modePractice: "Practice Mode",
        startBtn: "Start Test", selectedAreas: "selected areas", level: "Level", back: "Back",
        loading: "Loading...", milestoneTitle: "Time for a break!", continueBtn: "Next Stage",
        cooldown: "Wait...", showAnswers: "Show answers", quit: "Quit Session",
        answerReceived: "Answer received", nextArr: "Continue using arrows", finish: "Finish & See Results",
        summaryTitle: "Test Report", recoveryTitle: "Recommended Practice", recoveryDesc: "Focus on your weakest areas.",
        copyLink: "Copy Link", linkCopied: "Link copied to clipboard!", toDashboard: "Exit",
        backToLab: "Back to Lab",
        guideTitle: "How the Test Lab Works (Custom repetition practice tests spanning multiple topics)",
        guidePreset: "Select a preset (e.g., NP-GEO) to automatically enable all topics and levels in that category OR Toggle topics manually below and click level bubbles (N1-N9) to customize difficulty.",
        guideCustom: "Enter how many questions should be included. If it is blank, then it will be an infinite test with a report summary every 15 questions. If you manually enter a maximum number of questions, a short report will show to review your progress at the halfway point where you can see previous questions, answers, and step-by-step solutions. A full progress report is shown when finishing a practice test.",
        guideModes: "Practice Mode gives instant feedback. Exam Mode hides results until the very end. ",
        guideReview: "Copy and share the practice test when you have selected all of your topics.",
        guideControls: "WHEN STUDENTS CLICK THE LINK, THEY JUST NEED TO ENTER A VALID CLASS CODE ON THE START SITE and will be instantly launched into the practice test. THERE IS NO TIME LIMIT FOR HOW LONG LINKS ARE VALID, BUT MAY NOT WORK AFTER THIS BETA-TEST PERIOD BECAUSE OF APP UPDATES."
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
    const [activeCategory, setActiveCategory] = useState(null);
    const [revealMilestoneAnswers, setRevealMilestoneAnswers] = useState(false);
    const [visibleClues, setVisibleClues] = useState({});
    const [showGuide, setShowGuide] = useState(false);
    const [useWordProblems, setUseWordProblems] = useState(false);

    // --- HELPERS ---
    const getStyles = (category) => COLOR_VARIANTS[category.color || 'indigo'] || COLOR_VARIANTS.indigo;

    // 🟢 NEW: Mobile detection state
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            // Disable autofocus on screens smaller than 768px (iPads/Phones)
            setIsMobile(window.innerWidth < 768); 
        };
        checkMobile(); // Check on mount
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const copyTestLink = () => {
        // Append tracking flag to meta configuration state object bundle on the fly
        const updatedMeta = { ...meta, wordProblem: useWordProblems };
        const testCode = encodeConfig({ meta: updatedMeta, selection });
        const baseUrl = window.location.origin + "/lab";
        const fullUrl = `${baseUrl}?config=${testCode}`;
        navigator.clipboard.writeText(fullUrl);
        alert(t.linkCopied);
    };

    //  RESET AND PRESETS 
    const resetAllSelection = () => {
        setSelection({});
        setMeta(p => ({ 
            ...p, 
            isNationalTest: false, 
            bundleId: null,
            limit: 0, // Reset to infinity
            mode: 'practice' // Reset to practice mode
        }));
    };

    const applyPresetSelection = (bundleId) => {
        if (!bundleId) {
            resetAllSelection();
            return;
        }

        const preset = BUNDLE_PRESETS[bundleId];
        const newSelection = {};

        // Match catId (the object key) against the preset's category
        Object.entries(CATEGORIES).forEach(([catId, cat]) => {
            if (bundleId === 'NP-ALL' || catId === preset.category) {
                cat.topics.forEach(topic => {
                    const topicLevels = LEVEL_DESCRIPTIONS[topic.id] 
                        ? Object.keys(LEVEL_DESCRIPTIONS[topic.id]).map(Number) 
                        : [1];
                    newSelection[topic.id] = { enabled: true, levels: topicLevels };
                });
            }
        });

        setSelection(newSelection);
        setMeta(p => ({ ...p, isNationalTest: true, bundleId: bundleId }));
    };

    // Resets question array when going back to lab to change settings
    const startNewSession = () => {
        setResponses({});          // Clear previous answers
        setVisibleClues({});       // Reset clue visibility
        setCurrentIndex(0);        // Reset to first question
        setInputValue('');         // Clear typed input
        
        // 1. Force the layout into LOADING state first
        setInternalMode('LOADING'); 
        
        // 2. Wipe out the stale packet data
        setPacket([]);             
        
        // 3. Let the state clear settle, then boot into ACTIVE mode to trigger a fresh network fetch
        setTimeout(() => {
            setInternalMode('ACTIVE');
        }, 50);
    };

    // --- CORE LOGIC ---
    const fetchNextSprint = async () => {
        // Force number comparison for the limit
        if (Number(meta.limit) > 0 && packet.length >= Number(meta.limit)) return;
        
        setIsGenerating(true);
        try {
            const enabledTopics = Object.keys(selection).filter(id => selection[id].enabled);
            
            let batchSize = 15;
            if (Number(meta.limit) > 0) {
                batchSize = Math.min(15, Number(meta.limit) - packet.length);
            }
            
            if (batchSize <= 0) {
                setIsGenerating(false);
                return;
            }

            const requests = Array.from({ length: batchSize }).map(() => {
                const topicId = enabledTopics[Math.floor(Math.random() * enabledTopics.length)];
                const conf = selection[topicId];
                
                // FIX: Pick a random level from the TOGGLED array
                const possibleLevels = conf.levels && conf.levels.length > 0 ? conf.levels : [1];
                const randomLevel = possibleLevels[Math.floor(Math.random() * possibleLevels.length)];

                return { 
                    topic: topicId, 
                    level: randomLevel, 
                    lang,
                    wordProblem: useWordProblems // Pass the word problem flag for each question 
                };
            });

            const res = await fetch('/api/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requests })
            });
            const newQuestions = await res.json();
            setPacket(prev => [...prev, ...newQuestions]);
        } catch (err) { 
            console.error("Fetch Error:", err); 
        } finally { 
            setIsGenerating(false); 
        }
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
                    answer: String(val).trim(),
                    token: currentQ.resolvedData.token,
                    mode: meta.mode
                })
            });
            const result = await res.json();
            
            // 1. RECORD RESPONSE: UI instantly turns Green/Red here
            setResponses(prev => ({
                ...prev,
                [currentIndex]: { answer: val, isCorrect: result.correct, topic_id: currentQ.topic_id }
            }));

            // 2. DEFINE THE ADVANCE LOGIC
            const advance = () => {
                const nextIndex = currentIndex + 1;
                const limit = Number(meta.limit);

                // Finish check
                if (limit > 0 && nextIndex === limit) {
                    setInternalMode('SUMMARY');
                    return;
                }

                // Milestone check (Pause every 15 or at halfway)
                const halfwayPoint = limit > 0 ? Math.floor(limit / 2) : 15;
                const shouldPause = limit > 0 ? nextIndex === halfwayPoint : nextIndex % 15 === 0;

                if (shouldPause) {
                    setCooldown(2);
                    setShowMilestone(true);
                } else {
                    // Pre-fetch if near end
                    if (nextIndex === packet.length - 1 && (limit === 0 || packet.length < limit)) {
                        fetchNextSprint();
                    }
                    // CLEAR EVERYTHING and move forward
                    setCurrentIndex(nextIndex);
                    setInputValue(''); 
                }
            };

            // 3. EXECUTE ADVANCE
            if (meta.mode === 'exam') {
                advance(); // Instant in Exam mode
            } else {
                // Short delay in Practice mode to show the color feedback card
                setTimeout(advance, 1000); 
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
    
    const renderInput = () => {
        const item = packet[currentIndex];
        const rd = item?.resolvedData?.renderData;
        
        // 1. Handle Multiple Choice Options (Highest Priority)
        if (rd?.answerType === 'multiple_choice' || (rd?.options && Array.isArray(rd.options))) {
            return (
                <div className="grid grid-cols-1 gap-3 w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {(rd.options || []).map((opt, i) => (
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

        // 2. DETECT INPUT TYPE
        const type = rd?.answerType || rd?.inputType || item?.resolvedData?.inputType || 'text';
        
        // 3. RENDER SPECIALIZED COMPONENTS
        switch (type) { 
            case 'mixed_fraction': 
                return (
                    <div className="flex justify-center py-6 bg-slate-100 rounded-2xl shadow-inner w-full">
                        <div className="scale-110 transform origin-center">
                            <FractionInput value={inputValue} onChange={setInputValue} allowMixed={true} autoFocus={!isMobile} />
                        </div>
                    </div>
                );

            case 'fraction': 
                return (
                    <div className="flex justify-center py-6 bg-slate-100 rounded-2xl shadow-inner w-full">
                        <div className="scale-110 transform origin-center">
                            <FractionInput value={inputValue} onChange={setInputValue} allowMixed={false} autoFocus={!isMobile} />
                        </div>
                    </div>
                );
            
            case 'exponent': 
            case 'structured_power': 
                return (
                    <div className="flex justify-center py-6 bg-slate-100 rounded-2xl shadow-inner w-full">
                        <div className="scale-110 transform origin-center">
                            <ExponentInput value={inputValue} onChange={setInputValue} autoFocus={!isMobile} />
                        </div>
                    </div>
                );
            
            case 'scientific': 
            case 'structured_scientific': 
                return (
                    <div className="flex justify-center py-6 bg-slate-100 rounded-2xl shadow-inner w-full">
                        <div className="scale-110 transform origin-center">
                            <ScientificInput value={inputValue} onChange={setInputValue} autoFocus={!isMobile} />
                        </div>
                    </div>
                );

            default:
                return (
                    <input 
                        type="text" 
                        autoFocus={!isMobile} 
                        className="w-full bg-slate-100 border-none rounded-2xl px-6 py-4 text-center font-bold text-2xl outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all placeholder:text-slate-300 shadow-inner"
                        placeholder="..."
                        value={inputValue} 
                        maxLength={20}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLabSubmit()}
                    />
                );
        }
    };

    // --- EFFECTS ---
    useEffect(() => {
        if (configCode) {
            const decoded = decodeConfig(configCode);
            if (decoded) {
                let finalSelection = decoded.selection;

                // PRESET EXPANSION: If the code is a preset, we find all topics now
                if (decoded.meta.isNationalTest && decoded.meta.bundleId) {
                    const bundleId = decoded.meta.bundleId;
                    const preset = BUNDLE_PRESETS[bundleId];
                    const expandedSelection = {};

                    // Use catId (the key) to match the preset category
                    Object.entries(CATEGORIES).forEach(([catId, cat]) => {
                        if (bundleId === 'NP-ALL' || catId === preset.category) {
                            cat.topics.forEach(topic => {
                                const topicLevels = LEVEL_DESCRIPTIONS[topic.id] 
                                    ? Object.keys(LEVEL_DESCRIPTIONS[topic.id]).map(Number) 
                                    : [1];
                                expandedSelection[topic.id] = { enabled: true, levels: topicLevels };
                            });
                        }
                    });
                    finalSelection = expandedSelection;
                }

                setMeta(decoded.meta);
                setSelection(finalSelection); 

                // --- EXTRACT PARAMETER FROM LINK DECODE PASS FOR WORD PROBLEMS ---
                if (decoded.meta?.wordProblem !== undefined) {
                    setUseWordProblems(!!decoded.meta.wordProblem);
                }

                setInternalMode('ACTIVE'); 
            } else {
                setInternalMode('SETUP');
            }
        } else {
            setInternalMode('SETUP');
        }
    }, [configCode]);

    useEffect(() => {
        if (internalMode === 'ACTIVE' && packet.length === 0) {
            fetchNextSprint();
        }
    // FIX: Include useWordProblems inside the dependency list so changes trigger clean network queries
    }, [internalMode, packet.length, useWordProblems]);

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
                        {/* REPLACE the icon button with this textual button */}
                        <button 
                            onClick={onBack} 
                            className="px-4 py-2 text-[12px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-slate-100"
                        >
                            {t.toDashboard}
                        </button>
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

                {/* INSTRUCTIONAL GUIDE */}
                <div className="mb-6 bg-indigo-50/50 border border-indigo-400 rounded-[2rem] overflow-hidden transition-all">
                    <button 
                        onClick={() => setShowGuide(!showGuide)}
                        className="w-full px-8 py-4 flex items-center justify-between text-indigo-700 hover:bg-indigo-100/50 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <HelpCircle size={20} className="text-indigo-500" />
                            <span className="font-black uppercase text-[14px] tracking-widest">{t.guideTitle}</span>
                        </div>
                        <ChevronDown size={20} className={`transition-transform duration-300 ${showGuide ? 'rotate-180' : ''}`} />
                    </button>

                    {showGuide && (
                        <div className="px-8 pb-8 grid grid-cols-1 md:grid-cols-1 gap-6 animate-in slide-in-from-top-2">
                            {/* Guide Item: Presets */}
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm border border-indigo-100 text-indigo-600 font-black text-xs">1</div>
                                <p className="text-[14px] font-medium text-slate-800 leading-relaxed">{t.guidePreset}</p>
                            </div>
                            {/* Guide Item: Custom Selection */}
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm border border-indigo-100 text-indigo-600 font-black text-xs">2</div>
                                <p className="text-[14px] font-medium text-slate-800 leading-relaxed">{t.guideCustom}</p>
                            </div>
                            {/* Guide Item: Modes */}
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm border border-indigo-100 text-indigo-600 font-black text-xs">3</div>
                                <p className="text-[14px] font-medium text-slate-800 leading-relaxed">{t.guideModes}</p>
                            </div>
                            {/* Guide Item: Reviews */}
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm border border-indigo-100 text-indigo-600 font-black text-xs">4</div>
                                <p className="text-[14px] font-medium text-slate-800 leading-relaxed">{t.guideReview}</p>
                            </div>
                            {/* Guide Item: CONTROLS */}
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm border border-indigo-100 text-indigo-600 font-black text-xs">4</div>
                                <p className="text-[14px] font-medium text-slate-800 leading-relaxed">{t.guideControls}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* REFACTORED: HIGH-CONTRAST LIGHT ACTION CONTROL STRIP */}
                <div className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl p-3 flex flex-wrap lg:flex-row items-center justify-between gap-3 mb-6 shadow-sm select-none">
                    
                    {/* Left-Side: Distinct, Elevated Interactive Buttons */}
                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                        
                        {/* 1. Practice vs. Exam Mode Toggle Button */}
                        <button
                            type="button"
                            onClick={() => setMeta(p => ({ ...p, mode: p.mode === 'exam' ? 'practice' : 'exam' }))}
                            title={meta.mode === 'exam' ? (lang === 'sv' ? 'Dolda resultat' : 'Hidden results') : (lang === 'sv' ? 'Direkt feedback' : 'Instant feedback')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all active:scale-95 border-2 shadow-sm cursor-pointer ${
                                meta.mode === 'exam' 
                                    ? 'bg-rose-600 border-rose-600 text-white shadow-rose-600/20' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100/70 hover:border-slate-300'
                            }`}
                        >
                            {meta.mode === 'exam' ? <Lock size={15}/> : <Zap size={15}/>}
                            {meta.mode === 'exam' ? t.modeExam : t.modePractice}
                        </button>

                        {/* 2. Word Problem Toggle Button */}
                        <button
                            type="button"
                            onClick={() => setUseWordProblems(!useWordProblems)} // Keep it simple here!
                            title={useWordProblems ? (lang === 'sv' ? 'Läget är aktivt' : 'Mode is Active') : (lang === 'sv' ? 'Standard matte' : 'Standard math')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all active:scale-95 border-2 shadow-sm cursor-pointer ${
                                useWordProblems 
                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-rose-600/20' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100/70 hover:border-slate-300'
                            }`}
                        >
                            <HelpCircle size={15} fill={useWordProblems ? "rgba(255, 255, 255, 0.2)" : "none"}/>
                            {lang === 'sv' ? 'Problemlösning' : 'Word Problems'}
                        </button>

                        {/* 3. External Share Test Button */}
                        <button
                            type="button"
                            onClick={copyTestLink}
                            title={lang === 'sv' ? 'Dela testet externt' : 'Share test externally'}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider bg-white text-slate-600 border-2 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                            <LayoutGrid size={15}/>
                            {t.copyLink}
                        </button>
                        
                        {/* 4. Question Limit Numerical Field Item */}
                        <div 
                            title={lang === 'sv' ? 'Ange max antal frågor (Lämna tomt för oändligt)' : 'Enter max question count (Leave empty for infinite)'}
                            className="flex items-center gap-2 bg-white border-2 border-slate-200 rounded-xl px-3 py-1.5 h-[42px] shadow-sm"
                        >
                            <ListChecks size={20} className="text-amber-500 shrink-0"/>
                            <span className="text-s font-black uppercase tracking-wider text-slate-800 select-none">
                                {lang === 'sv' ? 'Frågor:' : 'Qty:'}
                            </span>
                            <input 
                                type="number" 
                                min="1" 
                                max="100" 
                                value={meta.limit || ''} 
                                placeholder="∞" 
                                onChange={(e) => setMeta(p => ({ ...p, limit: parseInt(e.target.value) || 0 }))}
                                className="w-10 bg-slate-200 rounded-lg text-slate-800 font-black text-l text-center py-0.5 focus:bg-amber-50 focus:text-amber-900 outline-none transition-colors border border-transparent focus:border-amber-200"
                            />
                        </div>
                    </div>

                    {/* Right-Side: Primary Launch Session Button Action */}
                    <div className="w-full lg:w-auto mt-1 lg:mt-0">
                        {/* 5. Start Session Button */}
                        <button 
                            type="button"
                            onClick={startNewSession} 
                            disabled={Object.keys(selection).filter(k => selection[k].enabled).length === 0} 
                            className="w-full lg:w-auto flex items-center justify-center gap-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-black uppercase text-sm tracking-widest shadow-md shadow-indigo-600/10 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
                        >
                            <div className="flex items-center gap-2">
                                <Play size={15} fill="currentColor"/>
                                <span>{t.startBtn}</span>
                            </div>
                            <span className="text-[11px] font-black tracking-normal bg-indigo-900/40 text-indigo-100 px-2.5 py-1 rounded-lg">
                                {Object.keys(selection).filter(k => selection[k].enabled).length} {lang === 'sv' ? 'valda' : 'selected'}
                            </span>
                        </button>
                    </div>
                    
                </div>

                {/* PRESETS & RESET ROW */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-white border-2 border-indigo-50 p-6 rounded-[2.5rem] shadow-sm">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                            <LayoutGrid size={22} />
                        </div>
                        <div className="flex-1 md:w-72">
                            <span className="block text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1 ml-1">
                                {lang === 'sv' ? "Snabbval (Preset)" : "Presets"}
                            </span>
                            <select 
                                value={meta.bundleId || ""}
                                onChange={(e) => applyPresetSelection(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 font-bold text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all cursor-pointer"
                            >
                                <option value="">{lang === 'sv' ? "-- Välj snabbval --" : "-- Choose a preset --- "}</option>
                                {Object.entries(BUNDLE_PRESETS).map(([id, data]) => (
                                    <option key={id} value={id}>{data.title} ({id})</option>
                                ))}
                            </select>
                        </div>

                        {/* --- NEW: WORD PROBLEM TOGGLE CONTROL SLIDER LINKED TO TESTPass --- */}
                        {/* Prominent Multi-State Toggle Button */}
                            

                    </div>

                    <button 
                        onClick={resetAllSelection}
                        className="w-full md:w-auto px-8 py-3 bg-white border-2 border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-600 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-3 shadow-sm active:scale-95"
                    >
                        <RefreshCcw size={16} />
                        {lang === 'sv' ? "Rensa allt" : "Reset all"}
                    </button>
                </div>


                {/* CATEGORY GRID (Now matching Dashboard's Topic Cards) */}
                <div className="grid grid-cols-1 gap-6">
                    {Object.entries(CATEGORIES).map(([catKey, category]) => {
                        const styles = getStyles(category);
                        const isExpanded = activeCategory === catKey;
                        const count = category.topics.filter(t => selection[t.id]?.enabled).length;

                        return (
                            <div key={catKey} className={`bg-white rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${isExpanded ? `shadow-2xl shadow-indigo-900/10 border-indigo-800` : 'border-slate-100 shadow-sm hover:border-indigo-800'}`}>
                                <button onClick={() => setActiveCategory(isExpanded ? null : catKey)} className={`w-full p-8 flex items-center justify-between text-left ${isExpanded ? 'bg-slate-50/50' : ''}`}>
                                    <div className="flex items-center gap-6">
                                        <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center ${styles.bgDark} text-white shadow-lg`}><Award size={28} /></div>
                                        <div><h3 className="text-xl font-bold text-slate-800 tracking-tight">{category.label[lang]}</h3><p className={`text-[12px] font-bold uppercase tracking-widest ${count > 0 ? styles.text : 'text-slate-400'}`}>{count > 0 ? `${count} ${t.selectedAreas}` : `${category.topics.length} delmoment`}</p></div>
                                    </div>
                                    <ChevronDown size={24} className={`text-slate-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>

                                {isExpanded && (
                                    <div className="p-8 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-300">
                                        {category.topics.map(topic => {
                                            const isEnabled = selection[topic.id]?.enabled;
                                            const topicLevels = LEVEL_DESCRIPTIONS[topic.id] ? Object.keys(LEVEL_DESCRIPTIONS[topic.id]).map(Number) : [1];
                                            const selectedLevels = selection[topic.id]?.levels || [];

                                            const toggleLevel = (lvl) => {
                                                setMeta(p => ({ ...p, isNationalTest: false, bundleId: null })); // NEW: Clear preset flag on manual change
                                                setSelection(p => {
                                                    const currentLevels = p[topic.id]?.levels || [];
                                                    const newLevels = currentLevels.includes(lvl)
                                                        ? currentLevels.filter(l => l !== lvl) // Remove if exists
                                                        : [...currentLevels, lvl].sort((a, b) => a - b); // Add and sort
                                                    
                                                    return {
                                                        ...p,
                                                        [topic.id]: { 
                                                            ...p[topic.id], 
                                                            levels: newLevels,
                                                            // Auto-enable topic if a level is picked, auto-disable if empty
                                                            enabled: newLevels.length > 0 
                                                        }
                                                    };
                                                });
                                            };

                                            return (
                                                <div key={topic.id} className={`p-6 rounded-[2.2rem] border transition-all flex flex-col ${isEnabled ? `border-indigo-500 shadow-xl bg-white` : 'border-slate-400 bg-slate-50/30 opacity-70'}`}>
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex-1 pr-4">
                                                            <h4 className="font-bold text-sm text-slate-800 leading-tight">{topic.label[lang]}</h4>
                                                            <p className="text-[10px] text-slate-400 font-medium mt-1">
                                                                {selectedLevels.length} {lang === 'sv' ? 'nivåer valda' : 'levels selected'}
                                                            </p>
                                                        </div>
                                                        {/* Master Toggle to select/deselect everything */}
                                                        <button 
                                                            onClick={() => {
                                                                setMeta(p => ({ ...p, isNationalTest: false, bundleId: null })); // NEW: Clear preset flag
                                                                setSelection(p => ({ 
                                                                    ...p, 
                                                                    [topic.id]: { 
                                                                        enabled: !isEnabled, 
                                                                        levels: !isEnabled ? topicLevels : [] 
                                                                    } 
                                                                }));
                                                            }}
                                                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${isEnabled ? styles.bgDark + ' text-white shadow-lg' : 'bg-white text-transparent border border-slate-600'}`}
                                                        >
                                                            <Check size={18} strokeWidth={4}/>
                                                        </button>
                                                    </div>

                                                    {/* LEVEL TOGGLE GRID */}
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {topicLevels.map(lvl => {
                                                            const isActive = selectedLevels.includes(lvl);
                                                            return (
                                                                <button
                                                                    key={lvl}
                                                                    onClick={() => toggleLevel(lvl)}
                                                                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all border-2 flex items-center justify-center
                                                                        ${isActive 
                                                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md scale-105' 
                                                                            : 'bg-white border-slate-400 text-slate-700 hover:border-indigo-400'
                                                                        }`}
                                                                >
                                                                    {lvl}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* DYNAMIC DESCRIPTION BOX */}
                                                    {selectedLevels.length > 0 && (
                                                        <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-in fade-in duration-300">
                                                            <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                                                                {selectedLevels.map(lvl => (
                                                                    <div key={lvl} className="flex gap-2 text-[9px] leading-tight items-start group">
                                                                        <span className="font-black text-indigo-500 min-w-[15px]">N{lvl}</span>
                                                                        <span className="text-slate-500 font-medium group-hover:text-slate-800 transition-colors">
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
            {!!responses[currentIndex] && <div className="flex items-center gap-2"><span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">{lang === 'sv' ? "Svar mottaget" : "Answer received"}</span><CheckCircle2 className="text-emerald-500" size={20} /></div>}
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