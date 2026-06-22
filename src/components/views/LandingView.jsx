import React, { useState, useEffect, useRef } from 'react';
import { 
    Zap, FileText, Grid3X3, Users, Globe, CheckCircle2,
    Sparkles, Layers, ShieldCheck, Target, GraduationCap, 
    Monitor, Signal, Check, XCircle, RefreshCcw, Calculator, Shuffle, Loader2
} from 'lucide-react';

import VisualRenderer from '../visuals/VisualRenderer';

// --- MATH RENDERING ENGINE ---
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
    return <div ref={containerRef} className={`math-content leading-relaxed text-inherit ${className}`} />;
};

export default function LandingView({ onTeacherLogin, onStudentJoin, lang: initialLang = 'sv' }) {
    const [lang, setLang] = useState(initialLang);
    const [liveCode, setLiveCode] = useState('');
    const [classCode, setClassCode] = useState('');

    // State for the interactive miniatures
    const [hookIndex, setHookIndex] = useState(0);
    const [isIntercepted, setIsIntercepted] = useState(false);

    // --- STATE FOR SECTIONS 3-6 ---
    const [gridVersion, setGridVersion] = useState(0);
    const [canvasTopic, setCanvasTopic] = useState('geom');
    const [isGenerating, setIsGenerating] = useState(false);
    const [testHash, setTestHash] = useState(null);
    
    const [ghostStudents, setGhostStudents] = useState([
        { id: 1, name: 'Anna K.', progress: 15, status: 'solving' },
        { id: 2, name: 'Leo M.', progress: 45, status: 'correct' },
        { id: 3, name: 'Sara J.', progress: 30, status: 'error' }
    ]);

    // Animate ghost students for Live View miniature
    useEffect(() => {
        const interval = setInterval(() => {
            setGhostStudents(prev => prev.map(s => {
                if (s.progress >= 100) return { ...s, progress: 100, status: 'done' };
                const jump = Math.floor(Math.random() * 15) + 5;
                const isError = Math.random() > 0.85;
                return {
                    ...s,
                    progress: Math.min(100, s.progress + jump),
                    status: isError ? 'error' : (s.progress + jump >= 100 ? 'done' : 'correct')
                };
            }));
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    const handleGenerateTest = () => {
        setIsGenerating(true);
        setTestHash(null);
        setTimeout(() => {
            setIsGenerating(false);
            setTestHash(`LAB-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(Math.random()*900)+100}`);
        }, 1200);
    };

    // Auto-cycle the "Infinite Math" hook every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setHookIndex(prev => (prev + 1) % 3);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const t = {
        sv: {
            hero_badge: "Matematik på dina villkor",
            hero_title: "Rätt stöd. Direkt.",
            hero_subtitle: "Anpassa är länken mellan genomgång och framgång. Välj din väg in i systemet nedan.",
            path_live_h: "Live-lektion",
            path_live_p: "Gå med i lärarens rum nu",
            path_practice_h: "Egen träning",
            path_practice_p: "Öva själv med en klasskod",
            btn_live: "Gå med",
            btn_practice: "Börja öva",
            btn_teacher: "Lärare & Föräldrar",
            
            // New Miniature Strings
            hook_title: "Oändligt med uppgifter.",
            hook_subtitle: "Noll förberedelse.",
            hook_desc: "Lämna statiska PDF:er bakom dig. Skapa nya uppgifter, tal, grafer och figurer i realtid. Varje elev får sin helt egen version av uppgiften.",
            interceptor_title: "Matte är inte bara siffror.",
            interceptor_subtitle: "Det är verkligheten.",
            interceptor_desc: "Vår \"Word Problem Interceptor\" förvandlar torra ekvationer till relaterbara textuppgifter med ett enda klick. Systemet anpassar automatiskt enheter, gränsvärden och facit till det valda scenariot.",
            btn_context: "Problemlösning",
            btn_reset: "Återställ",
            footer_motto: "Anpassa Math Platform — Designad för mastery.",
            studio_title: "Bygg lektioner på sekunder.",
            studio_subtitle: "Inte timmar.",
            studio_desc: "Question Studio låter dig bygga Do Now-grids och arbetsblad med ett klick. Behöver du en ny version? Klicka på blanda, så genereras helt nya uppgifter för hela klassen direkt.",
            btn_shuffle: "Blanda uppgifter",
            canvas_title: "Smartboardens",
            canvas_subtitle: "bästa vän.",
            canvas_desc: "Digital Canvas förvandlar din projektor till en interaktiv tavla. Hämta fram valfri uppgift, zooma in på figurer och stega igenom lösningar utan att vända ryggen till klassen.",
            live_title: "Fånga aha-ögonblicken",
            live_subtitle: "i realtid.",
            live_desc: "Teacher Live View ger dig fullständig överblick. Se precis när en elev fastnar, vilken uppgift som ställer till det, och vem som är redo för en utmaning – allt medan lektionen pågår.",
            testlab_title: "Differentierade prov.",
            testlab_subtitle: "Ett knapptryck bort.",
            testlab_desc: "Välj svårighetsgrad, klicka i ämnesområden och generera unika provkoder. Test Lab skapar individuella prov där man får olika uppgifter med nya siffror varje gång.",
            btn_generate: "Generera provkod",
        },
        en: {
            hero_badge: "Math on your terms",
            hero_title: "Right support. Instantly.",
            hero_subtitle: "Anpassa is the bridge between lecture and success. Choose your entry path below.",
            path_live_h: "Live Session",
            path_live_p: "Join your teacher's room",
            path_practice_h: "Self Practice",
            path_practice_p: "Log in with your class code",
            btn_live: "Join Room",
            btn_practice: "Start Practice",
            btn_teacher: "Teachers & Parents",

            hook_title: "Infinite questions.",
            hook_subtitle: "Zero prep time.",
            hook_desc: "Leave static PDFs behind. The system creates unique numbers, graphs, and figures in real-time. Every student gets their own version of the task.",
            interceptor_title: "Math isn't just numbers.",
            interceptor_subtitle: "It's the real world.",
            interceptor_desc: "Our \"Word Problem Interceptor\" transforms dry equations into relatable story tasks with a single click. The system automatically adapts units, thresholds, and answer keys to the chosen scenario.",
            btn_context: "Word Problem",
            btn_reset: "Reset",
            footer_motto: "Anpassa Math Platform — Built for mastery.",
            studio_title: "Build lessons in seconds.",
            studio_subtitle: "Not hours.",
            studio_desc: "Question Studio lets you build Do Now grids and worksheets with one click. Need a new version? Hit shuffle, and entirely new problems are generated for the whole class instantly.",
            btn_shuffle: "Shuffle Board",
            canvas_title: "Your Smartboard's",
            canvas_subtitle: "best friend.",
            canvas_desc: "Digital Canvas turns your projector into an interactive board. Summon any task, zoom in on geometric figures, and step through solutions without ever turning your back to the class.",
            live_title: "Catch the \"Aha!\" moments",
            live_subtitle: "in real-time.",
            live_desc: "Teacher Live View gives you complete oversight. See exactly when a student gets stuck, which specific task is causing trouble, and who is ready for a challenge.",
            testlab_title: "Differentiated tests.",
            testlab_subtitle: "One click away.",
            testlab_desc: "Select difficulty, pick subjects, and generate unique test codes. Test Lab creates individualized practice tests where no student gets the exact same practice test. Different questions and numbers every time.",
            btn_generate: "Generate Code",
        }
    }[lang];

    const INFINITE_EXAMPLES = [
        {
            id: 1,
            badge: lang === 'sv' ? "Geometri & Volym" : "Geometry & Volume",
            desc: lang === 'sv' ? "Beräkna cylinderns volym." : "Calculate the cylinder's volume.",
            latex: "V = \\pi \\cdot 4^2 \\cdot 10",
            comp: (
                <div className="transform scale-[0.6] sm:scale-75 origin-center w-full h-full flex justify-center items-center">
                    {/* 🟢 FIXED: Wrapped in geometry object */}
                    <VisualRenderer data={{ geometry: { type: "cylinder", labels: { r: "4", h: "10" } } }} />
                </div>
            )
        },
        {
            id: 2,
            badge: lang === 'sv' ? "Funktioner & Grafer" : "Functions & Graphs",
            desc: lang === 'sv' ? "Bestäm linjens ekvation." : "Determine the line's equation.",
            latex: "y = 2x - 1",
            comp: (
                <div className="transform scale-[0.65] sm:scale-90 origin-center w-full h-full flex justify-center items-center pointer-events-none">
                    {/* 🟢 FIXED: Wrapped in graph object */}
                    <VisualRenderer data={{ graph: { range: 5, gridStep: 1, labelStep: 1, lines: [{ slope: 2, intercept: -1, color: '#4f46e5' }] } }} />
                </div>
            )
        },
        {
            id: 3,
            badge: lang === 'sv' ? "Sannolikhet" : "Probability",
            desc: lang === 'sv' ? "Hur stor andel är blåa?" : "What fraction is blue?",
            latex: "P(\\text{Blå}) = \\frac{3}{8}",
            comp: (
                <div className="transform scale-75 origin-center w-full h-full flex justify-center items-center">
                    {/* 🟢 FIXED: Wrapped in marbles object */}
                    <VisualRenderer data={{ marbles: { items: { blue: 3, red: 5 } } }} />
                </div>
            )
        }
    ];

    // FIXED: Radically changing Data sets for the Do Now Grid to show true randomization
    const DO_NOW_SETS = [
        [
            { eq: `\\frac{3}{4} + \\frac{1}{2}`, icon: <Calculator size={20} className="text-slate-300"/> },
            { eq: `x^2 = 16`, icon: <CheckCircle2 size={20} className="text-emerald-300"/> },
            { eq: `V = \\pi \\cdot 2^2 \\cdot 10`, icon: <Layers size={20} className="text-amber-300"/> },
            { eq: `10^3 \\cdot 0,1`, icon: <Target size={20} className="text-pink-300"/> }
        ],
        [
            { eq: `\\frac{5}{8} - \\frac{1}{4}`, icon: <Calculator size={20} className="text-slate-300"/> },
            { eq: `2x + 4 = 20`, icon: <CheckCircle2 size={20} className="text-emerald-300"/> },
            { eq: `V = \\pi \\cdot 5^2 \\cdot 8`, icon: <Layers size={20} className="text-amber-300"/> },
            { eq: `\\frac{10^4}{100}`, icon: <Target size={20} className="text-pink-300"/> }
        ],
        [
            { eq: `\\frac{2}{3} \\cdot \\frac{3}{5}`, icon: <Calculator size={20} className="text-slate-300"/> },
            { eq: `\\sqrt{x} = 9`, icon: <CheckCircle2 size={20} className="text-emerald-300"/> },
            { eq: `A = \\frac{4 \\cdot 7}{2}`, icon: <Layers size={20} className="text-amber-300"/> },
            { eq: `10^{-2} \\cdot 1000`, icon: <Target size={20} className="text-pink-300"/> }
        ]
    ];
    const currentGrid = DO_NOW_SETS[gridVersion % DO_NOW_SETS.length];

    return (
        <div className="min-h-screen bg-[#f9fbf7] font-sans text-slate-800 selection:bg-emerald-100 overflow-x-hidden transition-colors duration-500">
            
            {/* =========================================================================
                TOP SECTION: NAVIGATION & LOGIN BOXES
                ========================================================================= */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-xl border-b border-emerald-100 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg"><Sparkles size={18} className="text-white" /></div>
                        <span className="text-xl font-black tracking-tighter italic text-emerald-800 uppercase">ANPASSA</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <button onClick={() => setLang(lang === 'sv' ? 'en' : 'sv')} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-2">
                            <Globe size={12} /> {lang === 'sv' ? 'English' : 'Svenska'}
                        </button>
                        <button onClick={onTeacherLogin} className="bg-emerald-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md">
                            {t.btn_teacher}
                        </button>
                    </div>
                </div>
            </nav>

            <header className="pt-40 pb-24 px-6 text-center max-w-6xl mx-auto relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest mb-8 border border-emerald-100">
                    <Zap size={14} className="fill-emerald-500" /> {t.hero_badge}
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-6 text-slate-900 italic uppercase">
                    {t.hero_title}
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-16 font-medium leading-relaxed">
                    {t.hero_subtitle}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* LIVE LESSON BOX */}
                    <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-emerald-100 flex flex-col items-center text-center group hover:border-emerald-500 transition-all">
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm"><Users size={28} /></div>
                        <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-800">{t.path_live_h}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 leading-relaxed">{t.path_live_p}</p>
                        <div className="w-full space-y-3">
                            <input type="text" maxLength={6} value={liveCode} onChange={(e) => setLiveCode(e.target.value.toUpperCase())} placeholder="ROOM-ID" className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center font-black text-2xl tracking-[0.3em] outline-none focus:border-emerald-500 focus:bg-white transition-all" />
                            <button onClick={() => onStudentJoin('live', liveCode)} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-500 shadow-lg active:scale-95 transition-all">{t.btn_live}</button>
                        </div>
                    </div>
                    {/* SELF PRACTICE BOX */}
                    <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-amber-100 flex flex-col items-center text-center group hover:border-amber-500 transition-all">
                        <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm"><GraduationCap size={28} /></div>
                        <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-800">{t.path_practice_h}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 leading-relaxed">{t.path_practice_p}</p>
                        <div className="w-full space-y-3">
                            <input type="text" maxLength={12} value={classCode} onChange={(e) => setClassCode(e.target.value.toUpperCase())} placeholder="CLASS-CODE" className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center font-black text-2xl tracking-[0.1em] outline-none focus:border-amber-500 focus:bg-white transition-all" />
                            <button onClick={() => onStudentJoin('practice', classCode)} className="w-full py-5 bg-amber-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-amber-600 shadow-lg active:scale-95 transition-all">{t.btn_practice}</button>
                        </div>
                    </div>
                </div>
            </header>

            {/* =========================================================================
                SECTION 1: THE INFINITE MATH HOOK (MINIATURE)
                ========================================================================= */}
            <section className="py-24 bg-white relative overflow-hidden border-t border-slate-100">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <h2 className="text-4xl md:text-5xl font-black uppercase italic text-slate-900 tracking-tighter">
                            {t.hook_title}<br/>
                            <span className="text-indigo-600">{t.hook_subtitle}</span>
                        </h2>
                        <p className="text-lg text-slate-500 font-medium leading-relaxed">
                            {t.hook_desc}
                        </p>
                    </div>

                    {/* The Slot Machine Display Container */}
                    <div className="bg-slate-50 rounded-[3rem] p-8 border-4 border-slate-100 shadow-2xl relative h-[380px] flex items-center justify-center overflow-hidden">
                        {INFINITE_EXAMPLES.map((ex, idx) => (
                            <div 
                                key={ex.id} 
                                className={`absolute inset-0 p-8 flex flex-col items-center justify-center transition-all duration-700 ease-in-out
                                    ${hookIndex === idx ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'}`}
                            >
                                <span className="px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-indigo-200 shadow-sm">
                                    {ex.badge}
                                </span>
                                
                                <div className="h-[140px] flex items-center justify-center mb-6 w-full">
                                    {ex.comp}
                                </div>
                                
                                <MathDisplay content={ex.desc} className="text-sm font-bold text-slate-700 mb-3 text-center" />
                                <MathDisplay content={`$$${ex.latex}$$`} className="text-2xl text-emerald-600 font-serif" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* =========================================================================
                SECTION 2: THE WORD PROBLEM INTERCEPTOR (MINIATURE)
                ========================================================================= */}
            <section className="py-24 bg-slate-900 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                    <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-emerald-500 blur-[120px] rounded-full"></div>
                </div>

                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                    
                    <div className="order-1 lg:order-2 space-y-6 text-white">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 border border-emerald-500/30">
                            <Sparkles size={14} className="fill-emerald-400" /> Problemlösning
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">
                            {t.interceptor_title}<br/>
                            <span className="text-emerald-400">{t.interceptor_subtitle}</span>
                        </h2>
                        <p className="text-lg text-slate-300 font-medium leading-relaxed">
                            {t.interceptor_desc}
                        </p>
                    </div>

                    <div className="order-2 lg:order-1 relative">
                        <div className={`bg-white rounded-[3rem] p-8 shadow-2xl transition-all duration-700 border-4 
                            ${isIntercepted ? 'border-emerald-500 shadow-emerald-900/40' : 'border-slate-200'}`}>
                            
                            <div className="h-[180px] flex items-center justify-center bg-slate-50 rounded-2xl mb-6 relative overflow-hidden border border-slate-100 shadow-inner">
                                {/* State A: Abstract Geometry */}
                                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 transform origin-center 
                                    ${isIntercepted ? 'opacity-0 scale-90 translate-x-8 pointer-events-none' : 'opacity-100 scale-[0.6] sm:scale-75 translate-x-0'}`}>
                                    <VisualRenderer data={{ geometry: { type: 'cylinder', labels: { r: '3', h: '12' } } }} />
                                </div>
                                
                                {/* State B: Intercepted Soda Can Context */}
                                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 transform origin-center
                                    ${isIntercepted ? 'opacity-100 scale-[0.6] sm:scale-75 translate-x-0' : 'opacity-0 scale-90 -translate-x-8 pointer-events-none'}`}>
                                    <VisualRenderer data={{ geometry: { type: 'cylinder', labels: { r: '3 cm', h: '12 cm' } } }} />
                                </div>
                            </div>

                            <div className="space-y-4 text-center">
                                <div className="min-h-[3rem] flex items-center justify-center px-4">
                                    <MathDisplay 
                                        content={isIntercepted 
                                            ? (lang === 'sv' ? "En läskburk har radien 3 cm och höjden 12 cm. Beräkna burkens volym." : "A soda can has a radius of 3 cm and a height of 12 cm. Calculate its volume.") 
                                            : (lang === 'sv' ? "Beräkna cylinderns volym." : "Calculate the volume of the cylinder.")} 
                                        className={`text-base font-bold transition-colors duration-500 ${isIntercepted ? 'text-emerald-900' : 'text-slate-800'}`} 
                                    />
                                </div>
                                <div className="h-10 flex items-center justify-center">
                                    <MathDisplay 
                                        content={isIntercepted 
                                            ? "$$V = 3{,}14 \\cdot 3^2 \\cdot 12 \\approx 339 \\text{ cm}^3$$" 
                                            : "$$V = \\pi \\cdot r^2 \\cdot h$$"} 
                                        className={`text-2xl font-serif transition-colors duration-500 ${isIntercepted ? 'text-emerald-600' : 'text-indigo-600'}`} 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* FIXED: Magic "Intercept" Button is now a flexible Pill to fit long text */}
                        <div className="absolute -right-4 -bottom-6 z-20">
                            <button 
                                onClick={() => setIsIntercepted(!isIntercepted)} 
                                className={`h-24 px-8 min-w-[7rem] rounded-[2rem] flex flex-col items-center justify-center font-black uppercase text-[10px] tracking-widest shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border-[6px] whitespace-nowrap
                                ${isIntercepted 
                                    ? 'bg-slate-900 text-white border-slate-800' 
                                    : 'bg-emerald-500 text-white border-white'}`}
                            >
                                {isIntercepted ? <RefreshCcw size={24} className="mb-2" /> : <Sparkles size={24} className="mb-2" />}
                                {isIntercepted ? t.btn_reset : t.btn_context}
                            </button>
                        </div>
                    </div>

                </div>
            </section>

            {/* =========================================================================
                SECTION 3: QUESTION STUDIO & DO NOW GRIDS
                ========================================================================= */}
            <section className="py-24 bg-[#f9fbf7] relative overflow-hidden border-t border-slate-100">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 border border-indigo-100">
                            <Grid3X3 size={14} /> Question Studio
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase italic text-slate-900 tracking-tighter">
                            {t.studio_title}<br/>
                            <span className="text-indigo-600">{t.studio_subtitle}</span>
                        </h2>
                        <p className="text-lg text-slate-500 font-medium leading-relaxed">
                            {t.studio_desc}
                        </p>
                    </div>

                    <div className="relative">
                        <div className="grid grid-cols-2 gap-4">
                            {currentGrid.map((card, i) => (
                                <div key={i} className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex flex-col items-center justify-center text-center aspect-square transition-all duration-300 hover:shadow-xl hover:border-indigo-100">
                                    <div className="w-full flex justify-end mb-2">{card.icon}</div>
                                    <MathDisplay content={`$$${card.eq}$$`} className="text-xl text-slate-700 font-serif" />
                                </div>
                            ))}
                        </div>
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                            <button 
                                onClick={() => setGridVersion(v => v + 1)}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-indigo-500 active:scale-95 transition-all whitespace-nowrap"
                            >
                                <Shuffle size={16} /> {t.btn_shuffle}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================================
                SECTION 4: DIGITAL CANVAS / PRESENTATION VIEW
                ========================================================================= */}
            <section className="py-24 bg-slate-900 relative overflow-hidden">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    
                    <div className="order-2 lg:order-1 bg-slate-950 rounded-[2rem] border-8 border-slate-800 shadow-2xl overflow-hidden aspect-video flex relative">
                        <div className="w-1/3 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-2">
                            <button onClick={() => setCanvasTopic('geom')} className={`text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${canvasTopic === 'geom' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>Volym (Cylinder)</button>
                            <button onClick={() => setCanvasTopic('stat')} className={`text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${canvasTopic === 'stat' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>Procent & Rutnät</button>
                        </div>
                        <div className="w-2/3 flex items-center justify-center p-8 relative overflow-hidden">
                            {/* FIXED: Added scaling wrapper to canvas visual */}
                            <div className={`transition-all duration-500 absolute w-full h-full flex flex-col items-center justify-center gap-4 ${canvasTopic === 'geom' ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}`}>
                                <div className="transform scale-[0.6] origin-center">
                                    <VisualRenderer data={{ geometry: { type: 'cylinder', labels: { r: '5', h: '20' } } }} />
                                </div>
                                <MathDisplay content="$$V = \pi \cdot r^2 \cdot h$$" className="text-white text-xl" />
                            </div>
                            <div className={`transition-all duration-500 absolute w-full h-full flex flex-col items-center justify-center gap-4 ${canvasTopic === 'stat' ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}`}>
                                <div className="transform scale-[0.7] origin-center">
                                    <VisualRenderer data={{ percentGrid: { colored: 45, total: 100 } }} />
                                </div>
                                <MathDisplay content="$$45\% = \frac{45}{100}$$" className="text-white text-xl" />
                            </div>
                        </div>
                    </div>

                    <div className="order-1 lg:order-2 space-y-6 text-white">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 border border-indigo-500/30">
                            <Monitor size={14} className="fill-indigo-400" /> Digital Canvas
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">
                            {t.canvas_title}<br/>
                            <span className="text-indigo-400">{t.canvas_subtitle}</span>
                        </h2>
                        <p className="text-lg text-slate-300 font-medium leading-relaxed">
                            {t.canvas_desc}
                        </p>
                    </div>

                </div>
            </section>

            {/* =========================================================================
                SECTION 5: TEACHER LIVE VIEW
                ========================================================================= */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 border border-amber-100">
                            <Signal size={14} className="fill-amber-500" /> Live Telemetry
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase italic text-slate-900 tracking-tighter">
                            {t.live_title}<br/>
                            <span className="text-amber-500">{t.live_subtitle}</span>
                        </h2>
                        <p className="text-lg text-slate-500 font-medium leading-relaxed">
                            {t.live_desc}
                        </p>
                    </div>

                    <div className="bg-slate-50 rounded-[3rem] p-8 border border-slate-100 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Klass 9B • Live</h3>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Aktiv Session
                            </div>
                        </div>
                        
                        {ghostStudents.map((student) => (
                            <div key={student.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 w-1/4">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-black text-slate-500">{student.name.charAt(0)}</div>
                                    <span className="font-bold text-sm text-slate-700">{student.name}</span>
                                </div>
                                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden relative">
                                    <div 
                                        className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out
                                            ${student.status === 'error' ? 'bg-red-500' : student.status === 'done' ? 'bg-emerald-500' : 'bg-amber-400'}`}
                                        style={{ width: `${student.progress}%` }}
                                    />
                                </div>
                                <div className="w-8 flex justify-end">
                                    {student.status === 'error' && <XCircle size={18} className="text-red-500" />}
                                    {student.status === 'done' && <CheckCircle2 size={18} className="text-emerald-500" />}
                                    {student.status === 'solving' && <Loader2 size={18} className="text-amber-400 animate-spin" />}
                                    {student.status === 'correct' && <Check size={18} className="text-emerald-500" />}
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </section>

            {/* =========================================================================
                SECTION 6: TEST LAB
                ========================================================================= */}
            <section className="py-24 bg-emerald-900 relative overflow-hidden text-white">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    
                    <div className="order-2 lg:order-1 bg-white rounded-[3rem] p-8 shadow-2xl border-4 border-emerald-500/20 text-slate-800">
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 block">1. Svårighetsgrad</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(lvl => (
                                        <div key={lvl} className={`flex-1 h-2 rounded-full ${lvl <= 3 ? 'bg-emerald-500' : 'bg-slate-100'}`}></div>
                                    ))}
                                </div>
                                <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
                                    <span>Grundläggande</span>
                                    <span className="text-emerald-600">Nivå 3</span>
                                    <span>Avancerad</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 block">2. Områden</label>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">Algebra</span>
                                    <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">Geometri</span>
                                    <span className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-lg text-xs font-bold">Procent</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <button 
                                    onClick={handleGenerateTest}
                                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />} 
                                    {isGenerating ? 'Genererar...' : t.btn_generate}
                                </button>
                            </div>

                            <div className={`transition-all duration-500 overflow-hidden ${testHash ? 'opacity-100 h-16 mt-4' : 'opacity-0 h-0 mt-0'}`}>
                                <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-between px-6 border-2 border-emerald-500 border-dashed">
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">KOD KLAR</span>
                                    <span className="font-black text-xl tracking-[0.2em] text-white">{testHash}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="order-1 lg:order-2 space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-800 text-emerald-300 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 border border-emerald-700">
                            <FileText size={14} className="fill-emerald-500" /> Test Lab
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">
                            {t.testlab_title}<br/>
                            <span className="text-emerald-400">{t.testlab_subtitle}</span>
                        </h2>
                        <p className="text-lg text-emerald-100/70 font-medium leading-relaxed">
                            {t.testlab_desc}
                        </p>
                    </div>

                </div>
            </section>

            {/* =========================================================================
                FOOTER
                ========================================================================= */}
            <footer className="bg-[#f9fbf7] pt-24 pb-12 flex flex-col items-center px-6 relative">
                <div className="max-w-4xl mx-auto flex flex-col items-center gap-10 relative z-10">
                    <div className="flex items-center gap-3 opacity-20">
                        <Sparkles size={24} className="text-emerald-600" />
                        <span className="font-black tracking-tighter italic uppercase text-xl text-slate-400">Anpassa</span>
                    </div>
                    <button onClick={onTeacherLogin} className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-emerald-700 transition-all shadow-xl">
                        {t.btn_teacher}
                    </button>
                    <p className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.4em]">{t.footer_motto}</p>
                </div>
                {/* YOUR ORIGINAL WAVE SVG */}
                <div className="absolute bottom-0 left-0 w-full leading-[0] pointer-events-none z-0">
                    <svg className="relative block w-full h-[300px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,2,1200,1.13V120H0Z" className="fill-emerald-50 opacity-50"></path>
                    </svg>
                </div>
            </footer>
        </div>
    );
}