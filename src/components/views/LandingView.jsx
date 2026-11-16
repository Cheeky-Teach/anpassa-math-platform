// src/components/views/LandingView.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
    Users, Globe, CheckCircle2,
    Layers, ShieldCheck, Target, GraduationCap, 
    Monitor, Signal, Check, XCircle, Calculator, Shuffle, Loader2,
    ArrowRight, BookOpen, PenTool, Printer
} from 'lucide-react';

import VisualRenderer from '../visuals/VisualRenderer';
import InstructionSlideCard from '../shared/InstructionSlideCard';

// Interactive Whiteboard Imports
import InteractiveCanvas from '../whiteboard/InteractiveCanvas';
import WhiteboardDrawer from '../whiteboard/WhiteboardDrawer';
import AlgebraTileTool from '../whiteboard/tools/manipulatives/AlgebraTileTool';
import FractionShapesTool from '../whiteboard/tools/geometry/FractionShapesTool';
import CoordinatePlaneTool from '../whiteboard/tools/analysis/CoordinatePlaneTool';

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

// --- LIVE INTERACTIVE DEMO PACKET ---
const INITIAL_DEMO_QUESTION = {
    id: 'demo_geom_1',
    topicId: 'volume',
    variationKey: 'vol_cyl_std',
    answerType: 'standard',
    instructionMode: 'inline',
    text: "Cylinderns Volym",
    showText: true,
    showVisual: true,
    showLatex: false,
    regenVersion: Date.now(),
    resolvedData: {
        renderData: {
            description: "Beräkna cylinderns volym. Svara i hela kubikcentimeter ($cm^3$).",
            geometry: { type: 'cylinder', labels: { r: '4 cm', h: '10 cm' } },
            answer: "503"
        },
        clues: [
            { text: "Börja med formeln för en cylinders volym:", latex: "V = \\pi \\cdot r^2 \\cdot h" },
            { text: "Sätt in radien ($r = 4$) och höjden ($h = 10$):", latex: "V = \\pi \\cdot 4^2 \\cdot 10" },
            { text: "Beräkna resultatet:", latex: "V \\approx 502{,}65" },
            { text: "Avrunda till närmaste heltal.", latex: "V \\approx 503" }
        ]
    }
};

const DO_NOW_SETS = [
    [
        { eq: `\\frac{3}{4} + \\frac{1}{2}`, label: "Bråk" },
        { eq: `x^2 = 16`, label: "Algebra" },
        { eq: `V = \\pi \\cdot 2^2 \\cdot 10`, label: "Geometri" },
        { eq: `10^3 \\cdot 0,1`, label: "Potenser" }
    ],
    [
        { eq: `\\frac{5}{8} - \\frac{1}{4}`, label: "Bråk" },
        { eq: `2x + 4 = 20`, label: "Algebra" },
        { eq: `V = \\pi \\cdot 5^2 \\cdot 8`, label: "Geometri" },
        { eq: `\\frac{10^4}{100}`, label: "Potenser" }
    ],
    [
        { eq: `\\frac{2}{3} \\cdot \\frac{3}{5}`, label: "Bråk" },
        { eq: `\\sqrt{x} = 9`, label: "Algebra" },
        { eq: `A = \\frac{4 \\cdot 7}{2}`, label: "Geometri" },
        { eq: `10^{-2} \\cdot 1000`, label: "Potenser" }
    ]
];

export default function LandingView({ onTeacherLogin, onStudentJoin, lang: initialLang = 'sv' }) {
    const [lang, setLang] = useState(initialLang);
    const [liveCode, setLiveCode] = useState('');
    const [classCode, setClassCode] = useState('');

    const [gridVersion, setGridVersion] = useState(0);
    const [activeStageTab, setActiveStageTab] = useState('walkthrough');
    const [testLabToggle, setTestLabToggle] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => setTestLabToggle(prev => !prev), 3200);
        return () => clearInterval(interval);
    }, []);

    const [demoQuestion, setDemoQuestion] = useState(INITIAL_DEMO_QUESTION);
    const [demoElements, setDemoElements] = useState([]);
    const [demoActiveDrawer, setDemoActiveDrawer] = useState(null);

    const [ghostStudents, setGhostStudents] = useState([
        { id: 1, name: 'Anna K.', progress: 35, status: 'solving' },
        { id: 2, name: 'Leo M.', progress: 75, status: 'correct' },
        { id: 3, name: 'Sara J.', progress: 50, status: 'error' }
    ]);

    const liveInputRef = useRef(null);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        const timer = setTimeout(() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            if (liveInputRef.current) {
                liveInputRef.current.focus({ preventScroll: true });
            }
        }, 50);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setGhostStudents(prev => prev.map(s => {
                if (s.progress >= 100) return { ...s, progress: 20, status: 'solving' };
                const jump = Math.floor(Math.random() * 14) + 6;
                const isError = Math.random() > 0.85;
                return {
                    ...s,
                    progress: Math.min(100, s.progress + jump),
                    status: isError ? 'error' : (s.progress + jump >= 100 ? 'done' : 'correct')
                };
            }));
        }, 2800);
        return () => clearInterval(interval);
    }, []);

    const handleDemoRegenerate = async () => {
        const r = Math.floor(Math.random() * 6) + 3;
        const h = Math.floor(Math.random() * 10) + 5;
        const v = Math.round(Math.PI * Math.pow(r, 2) * h);
        
        setDemoQuestion(prev => ({
            ...prev,
            regenVersion: Date.now(),
            resolvedData: {
                ...prev.resolvedData,
                renderData: {
                    ...prev.resolvedData.renderData,
                    geometry: { type: 'cylinder', labels: { r: `${r} cm`, h: `${h} cm` } },
                    answer: v.toString()
                },
                clues: [
                    { text: "Börja med formeln för en cylinders volym:", latex: "V = \\pi \\cdot r^2 \\cdot h" },
                    { text: `Sätt in radien ($r = ${r}$) och höjden ($h = ${h}$):`, latex: `V = \\pi \\cdot ${r}^2 \\cdot ${h}` },
                    { text: "Avrunda till närmaste heltal.", latex: `V \\approx ${v}` }
                ]
            }
        }));
    };

    const handleDemoSpawn = (type, payload = {}) => {
        const id = Date.now().toString();
        let newEl = null;

        if (type === 'calculator') {
            newEl = { id, type: 'calculator', x: 100, y: 50, width: 280, height: 480, expression: "", result: "", ans: "", calcMode: "LTR", stroke: '#059669', rotation: 0, opacity: 1 };
        } else if (type === 'algebra_tile') {
            const { kind, sign } = payload;
            newEl = AlgebraTileTool.create(200, 150, kind, sign);
        } else if (['frac_rect', 'frac_circle', 'spinner'].includes(type)) {
            newEl = FractionShapesTool.createDefault(id, '#059669', type);
            if (newEl) { newEl.x = 200; newEl.y = 150; }
        } else if (type === 'coord') {
            newEl = CoordinatePlaneTool.createDefault(id, '#0284c7');
        } else if (['rect', 'circle', 'triangle'].includes(type)) {
            newEl = { id, type, x: 200, y: 150, width: 200, height: 200, stroke: '#0284c7', strokeWidth: 3, fill: 'rgba(2, 132, 199, 0.08)', rotation: 0, opacity: 1, ...(type === 'triangle' ? { triangleType: 'right' } : {}) };
        }

        if (newEl) setDemoElements(prev => [...prev, newEl]);
    };

    const t = {
        sv: {
            nav_meta: "Matematikstudio",
            hero_title: "Rätt stöd i klassrummet.",
            hero_title_accent: "Direkt.",
            hero_subtitle: "Generera unika uppgifter, håll interaktiva genomgångar på tavlan och följ elevernas lösningar i realtid. Utvecklat för svensk matematikundervisning.",
            path_live_h: "Live-lektion",
            path_live_p: "Ange klasskod från lärarens skärm",
            path_practice_h: "Egen träning",
            path_practice_p: "Öva med elevkod eller provlänk",
            btn_live: "Anslut",
            btn_practice: "Starta",
            btn_teacher: "Lärarinloggning",

            pillars_heading: "Tre arbetsytor i ett verktyg",
            p1_title: "Modulbaserad planering",
            p1_desc: "Bygg egna arbetsområden som kombinerar genomgångar, adaptiv mängdträning och självrättande delprov i en tydlig elevvy.",
            p1_step_1: "1. Genomgång: Ekvationer",
            p1_step_2: "2. Övning: Nivå 1–3",
            p1_step_3: "3. Delprov: Auto-rättning",

            p2_title: "Arbetsblad & Do Now-grids",
            p2_desc: "Skapa lektionsstarter och utskriftsklara A4-blad på sekunder. Blanda fram nya talvärden med ett klick när klassen behöver mer träning.",
            btn_shuffle: "Slumpa nya tal",

            p3_title: "Unika prov i Test Lab",
            p3_desc: "Välj centralt innehåll och svårighetsnivåer. Varje elev får en egen uppsättning uppgifter med omedelbar återkoppling eller provläge.",

            stage_eyebrow: "Prova direkt i webbläsaren",
            stage_title: "Tavlan som räknar med dig",
            stage_desc: "Växla mellan steg-för-steg-genomgångar med slumpade talvärden och en digital mattetavla med bråkcirklar, algebrabrickor och koordinatsystem.",
            tab_walkthrough: "Steg-för-steg-genomgång",
            tab_whiteboard: "Interaktiv mattetavla",
            btn_tools: "Öppna bråkverktyg",

            live_title: "Fånga missuppfattningar medan lektionen pågår",
            live_desc: "I Live-vyn ser du varje elevs uträkningar och framsteg i realtid. Lyft anonyma elevlösningar till storskärmen och jämför lösningsmetoder.",
            live_status: "Aktiv lektion • Klass 9B",

            footer_title: "Redo att använda Anpassa i ditt klassrum?",
            footer_sub: "Logga in som lärare för att skapa planeringar, arbetsblad och live-rum.",
            footer_motto: "Anpassa Math Platform — LGR22 • Digitalt & Utskrift"
        },
        en: {
            nav_meta: "Classroom Mathematics Studio",
            hero_title: "Right classroom support.",
            hero_title_accent: "Instantly.",
            hero_subtitle: "Generate unique math tasks, lead interactive board walkthroughs, and follow student work in real time. Built for teachers.",
            path_live_h: "Live Session",
            path_live_p: "Enter the room code shown on the board",
            path_practice_h: "Self Practice",
            path_practice_p: "Practice using a student or test code",
            btn_live: "Join",
            btn_practice: "Start",
            btn_teacher: "Teacher Login",

            pillars_heading: "Three workspaces in one studio",
            p1_title: "Modular Curriculum Builder",
            p1_desc: "Sequence direct instruction, adaptive practice sets, and auto-graded checkpoints into a single structured student roadmap.",
            p1_step_1: "1. Instruction: Equations",
            p1_step_2: "2. Practice: Levels 1–3",
            p1_step_3: "3. Checkpoint: Auto-graded",

            p2_title: "Worksheets & Do Now Grids",
            p2_desc: "Build lesson starters and clean print-ready A4 sheets in seconds. Shuffle fresh numbers with a single click whenever you need a new version.",
            btn_shuffle: "Shuffle numbers",

            p3_title: "Unique Exams in Test Lab",
            p3_desc: "Pick topics and difficulty tiers. Every student receives a distinct set of problems in either instant-feedback or exam mode.",

            stage_eyebrow: "Try it right here",
            stage_title: "A board built for mathematics",
            stage_desc: "Switch between step-by-step worked derivations with live number regeneration and a math canvas stocked with fraction shapes, algebra tiles, and coordinate planes.",
            tab_walkthrough: "Step-by-Step Walkthrough",
            tab_whiteboard: "Interactive Math Canvas",
            btn_tools: "Toggle Fraction Tools",

            live_title: "Catch misconceptions while the lesson happens",
            live_desc: "Live View shows every student's steps and progress in real time. Spotlight anonymous student work onto the main screen to compare strategies.",
            live_status: "Active Session • Class 9B",

            footer_title: "Ready to bring Anpassa to your classroom?",
            footer_sub: "Sign in as a teacher to build units, print worksheets, and launch live sessions.",
            footer_motto: "Anpassa Math Platform — Digital & Print Studio"
        }
    }[lang];

    const currentGrid = DO_NOW_SETS[gridVersion % DO_NOW_SETS.length];

    return (
        <div className="min-h-screen bg-[#f9fbf7] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-950 overflow-x-clip flex flex-col">
            
            {/* =========================================================================
                UTILITY BAR (Clean, uncrowded top bar without redundant corner logo)
                ========================================================================= */}
            <nav className="sticky top-0 left-0 right-0 z-50 bg-[#f9fbf7]/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3">
                <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
                    <span className="text-xs font-mono font-bold text-slate-500 truncate">
                        {t.nav_meta}
                    </span>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <button 
                            type="button"
                            onClick={() => setLang(lang === 'sv' ? 'en' : 'sv')} 
                            className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                            <Globe size={14} /> 
                            <span>{lang === 'sv' ? 'English' : 'Svenska'}</span>
                        </button>
                        <button 
                            type="button"
                            onClick={onTeacherLogin} 
                            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-[0.98] whitespace-nowrap cursor-pointer"
                        >
                            {t.btn_teacher}
                        </button>
                    </div>
                </div>
            </nav>

            {/* =========================================================================
                HERO SECTION: Prominent Brand Masthead + Immediate Student Entry Dock
                ========================================================================= */}
            <header className="pt-8 pb-14 sm:pt-12 sm:pb-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    
                    {/* Left 7 Cols: Prominent Editorial Masthead + Proposition */}
                    <div className="lg:col-span-7 space-y-5">
                        <div className="pb-4 border-b border-slate-200 flex items-baseline justify-between gap-4">
                            <span className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black tracking-tight leading-none text-emerald-800">
                                Anpassa
                            </span>
                        </div>
                        
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-[1.15] text-slate-900 pt-1">
                            {t.hero_title}{' '}
                            <span className="text-emerald-700">{t.hero_title_accent}</span>
                        </h1>
                        
                        <p className="text-base sm:text-lg text-slate-600 max-w-xl font-normal leading-relaxed">
                            {t.hero_subtitle}
                        </p>
                    </div>

                    {/* Right 5 Cols: Student Login Dock (Always immediately visible above the fold) */}
                    <div className="lg:col-span-5 space-y-3.5 w-full">
                        
                        {/* 1. LIVE LESSON (Primary Filled CTA) */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 focus-within:border-emerald-600 transition-colors">
                            <div className="flex items-center gap-3 mb-3.5">
                                <div className="w-10 h-10 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl flex items-center justify-center shrink-0">
                                    <Users size={20} />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-base font-bold text-slate-900 leading-tight">{t.path_live_h}</h2>
                                    <p className="text-xs text-slate-500 truncate">{t.path_live_p}</p>
                                </div>
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); onStudentJoin('live', liveCode); }} className="flex gap-2">
                                <input 
                                    ref={liveInputRef}
                                    type="text" 
                                    maxLength={6} 
                                    value={liveCode} 
                                    onChange={(e) => setLiveCode(e.target.value.toUpperCase())} 
                                    placeholder="KOD" 
                                    aria-label={t.path_live_h}
                                    className="flex-1 min-w-0 px-3.5 py-2.5 bg-[#f9fbf7] border border-slate-300 rounded-xl text-center font-mono font-bold text-base tracking-[0.2em] text-slate-900 outline-none focus:border-emerald-600 focus:bg-white transition-all uppercase placeholder:text-slate-400" 
                                />
                                <button 
                                    type="submit" 
                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-2xs active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5"
                                >
                                    <span>{t.btn_live}</span>
                                    <ArrowRight size={14} />
                                </button>
                            </form>
                        </div>

                        {/* 2. SELF PRACTICE (Secondary Outlined CTA) */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 focus-within:border-amber-500 transition-colors">
                            <div className="flex items-center gap-3 mb-3.5">
                                <div className="w-10 h-10 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl flex items-center justify-center shrink-0">
                                    <GraduationCap size={20} />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-base font-bold text-slate-900 leading-tight">{t.path_practice_h}</h2>
                                    <p className="text-xs text-slate-500 truncate">{t.path_practice_p}</p>
                                </div>
                            </div>
                            <form onSubmit={(e) => { e.preventDefault(); onStudentJoin('practice', classCode); }} className="flex gap-2">
                                <input 
                                    type="text" 
                                    maxLength={12} 
                                    value={classCode} 
                                    onChange={(e) => setClassCode(e.target.value.toUpperCase())} 
                                    placeholder="KOD" 
                                    aria-label={t.path_practice_h}
                                    className="flex-1 min-w-0 px-3.5 py-2.5 bg-[#f9fbf7] border border-slate-300 rounded-xl text-center font-mono font-bold text-base tracking-[0.12em] text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition-all uppercase placeholder:text-slate-400" 
                                />
                                <button 
                                    type="submit" 
                                    className="px-5 py-2.5 bg-amber-50 hover:bg-amber-500 text-amber-900 hover:text-white border border-amber-300 hover:border-amber-500 rounded-xl font-bold text-xs active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5"
                                >
                                    <span>{t.btn_practice}</span>
                                    <ArrowRight size={14} />
                                </button>
                            </form>
                        </div>

                    </div>
                </div>
            </header>

            {/* =========================================================================
                BAND 1: THREE WORKSPACES (Asymmetric 3-Column Bento Grid)
                ========================================================================= */}
            <section className="py-16 sm:py-20 bg-white border-t border-slate-200 px-4 sm:px-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                            {t.pillars_heading}
                        </h2>
                        <span className="text-xs font-mono font-bold text-slate-500">
                            LGR22 • Åk 7–9 & Gy
                        </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* COLUMN 1: Curriculum Roadmap */}
                        <div className="bg-[#f9fbf7] rounded-2xl p-6 border border-slate-200 flex flex-col justify-between gap-6">
                            <div className="space-y-2.5">
                                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center">
                                    <Layers size={18} />
                                </div>
                                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{t.p1_title}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">{t.p1_desc}</p>
                            </div>

                            <div className="space-y-2 pt-2">
                                <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
                                    <span className="flex items-center gap-2"><BookOpen size={14} className="text-sky-600"/> {t.p1_step_1}</span>
                                    <span className="font-mono text-[11px] text-slate-400">Slide</span>
                                </div>
                                <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
                                    <span className="flex items-center gap-2"><Target size={14} className="text-emerald-600"/> {t.p1_step_2}</span>
                                    <span className="font-mono text-[11px] text-emerald-700">Nivå 1–3</span>
                                </div>
                                <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
                                    <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-amber-600"/> {t.p1_step_3}</span>
                                    <span className="font-mono text-[11px] text-amber-700">Prov</span>
                                </div>
                            </div>
                        </div>

                        {/* COLUMN 2: Interactive Do Now Grid */}
                        <div className="bg-[#f9fbf7] rounded-2xl p-6 border border-slate-200 flex flex-col justify-between gap-6">
                            <div className="space-y-2.5">
                                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                                    <Printer size={18} />
                                </div>
                                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{t.p2_title}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">{t.p2_desc}</p>
                            </div>

                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    {currentGrid.map((card, i) => (
                                        <div key={i} className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col justify-between min-h-[84px]">
                                            <span className="text-[10px] font-mono font-bold text-slate-400">{card.label}</span>
                                            <div className="text-center font-serif text-sm text-slate-900">
                                                <MathDisplay content={`$$${card.eq}$$`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setGridVersion(v => v + 1)}
                                    className="w-full py-2 px-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
                                >
                                    <Shuffle size={13} className="text-emerald-600" />
                                    <span>{t.btn_shuffle}</span>
                                </button>
                            </div>
                        </div>

                        {/* COLUMN 3: Test Lab Variants */}
                        <div className="bg-[#f9fbf7] rounded-2xl p-6 border border-slate-200 flex flex-col justify-between gap-6">
                            <div className="space-y-2.5">
                                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                                    <ShieldCheck size={18} />
                                </div>
                                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{t.p3_title}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">{t.p3_desc}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5 pt-2">
                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
                                    <div className="bg-slate-50 px-2.5 py-1.5 border-b border-slate-200 text-[10px] font-mono font-bold text-slate-600 text-center">
                                        Elev A
                                    </div>
                                    <div className="p-2 flex items-center justify-center h-[126px]">
                                        <div className="transform scale-[0.45] origin-center">
                                            <VisualRenderer data={{ geometry: { type: 'cylinder', labels: { r: '4', h: '10' } } }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
                                    <div className="bg-slate-50 px-2.5 py-1.5 border-b border-slate-200 text-[10px] font-mono font-bold text-slate-600 text-center">
                                        Elev B
                                    </div>
                                    <div className="p-2 flex items-center justify-center h-[126px] relative">
                                        <div className={`transition-opacity duration-500 ${testLabToggle ? 'opacity-100' : 'opacity-0 absolute'}`}>
                                            <div className="transform scale-[0.45] origin-center">
                                                <VisualRenderer data={{ geometry: { type: 'cylinder', labels: { r: '7', h: '3' } } }} />
                                            </div>
                                        </div>
                                        <div className={`transition-opacity duration-500 ${!testLabToggle ? 'opacity-100' : 'opacity-0 absolute'}`}>
                                            <div className="transform scale-[0.45] origin-center">
                                                <VisualRenderer data={{ geometry: { type: 'cylinder', labels: { r: '5', h: '8' } } }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* =========================================================================
                BAND 2: INTERACTIVE STUDIO STAGE (Full-Width Workbench)
                ========================================================================= */}
            <section className="py-20 sm:py-24 bg-[#0f172a] text-white border-t border-slate-800 px-4 sm:px-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        <div className="space-y-2 max-w-2xl">
                            <p className="text-xs font-bold text-emerald-400">{t.stage_eyebrow}</p>
                            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                                {t.stage_title}
                            </h2>
                            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                                {t.stage_desc}
                            </p>
                        </div>

                        {/* Interactive Mode Switcher */}
                        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700 shrink-0 self-start lg:self-end">
                            <button
                                type="button"
                                onClick={() => setActiveStageTab('walkthrough')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                                    activeStageTab === 'walkthrough'
                                        ? 'bg-emerald-600 text-white shadow-2xs'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <Monitor size={14} />
                                <span>{t.tab_walkthrough}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveStageTab('whiteboard')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                                    activeStageTab === 'whiteboard'
                                        ? 'bg-sky-600 text-white shadow-2xs'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <PenTool size={14} />
                                <span>{t.tab_whiteboard}</span>
                            </button>
                        </div>
                    </div>

                    {/* Full-Width Interactive Product Viewport */}
                    {activeStageTab === 'walkthrough' ? (
                        <div className="h-[520px] sm:h-[580px] w-full bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden flex relative">
                            <InstructionSlideCard 
                                question={demoQuestion} 
                                lang={lang} 
                                onRegenerate={handleDemoRegenerate}
                            />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex justify-end">
                                <button 
                                    type="button"
                                    onClick={() => setDemoActiveDrawer(prev => prev ? null : 'fractions')}
                                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xs transition-all cursor-pointer inline-flex items-center gap-2 whitespace-nowrap"
                                >
                                    <PenTool size={14} />
                                    <span>{t.btn_tools}</span>
                                </button>
                            </div>
                            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-700 h-[480px] sm:h-[540px] relative flex">
                                <InteractiveCanvas 
                                    elements={demoElements} 
                                    setElements={setDemoElements}
                                    resolution={{ w: 1920, h: 1080 }}
                                    lang={lang}
                                    bgType="grid"
                                />
                                
                                <WhiteboardDrawer
                                    activeDrawer={demoActiveDrawer}
                                    onClose={() => setDemoActiveDrawer(null)}
                                    onSpawn={handleDemoSpawn}
                                    lang={lang}
                                    showDividingLine={false}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* =========================================================================
                BAND 3: LIVE TELEMETRY (Reversed Split: Copy Left, Feed Right)
                ========================================================================= */}
            <section className="py-16 sm:py-24 bg-white border-t border-slate-200 px-4 sm:px-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
                    
                    <div className="lg:col-span-5 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold border border-rose-200">
                            <Signal size={14} className="text-rose-600" /> 
                            <span>Live Telemetry</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                            {t.live_title}
                        </h2>
                        <p className="text-base text-slate-600 leading-relaxed">
                            {t.live_desc}
                        </p>
                    </div>

                    <div className="lg:col-span-7">
                        <div className="bg-[#f9fbf7] rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-3">
                            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                                <span className="font-bold text-slate-900 text-xs font-mono">{t.live_status}</span>
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600" /> Live
                                </span>
                            </div>
                            
                            {ghostStudents.map((student) => (
                                <div key={student.id} className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 w-1/3 min-w-[100px]">
                                        <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-mono font-bold text-slate-700 shrink-0">
                                            {student.name.charAt(0)}
                                        </div>
                                        <span className="font-bold text-sm text-slate-800 truncate">{student.name}</span>
                                    </div>
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200">
                                        <div 
                                            className={`absolute top-0 left-0 h-full transition-all duration-700 ease-out
                                                ${student.status === 'error' ? 'bg-rose-500' : student.status === 'done' ? 'bg-emerald-600' : 'bg-amber-500'}`}
                                            style={{ width: `${student.progress}%` }}
                                        />
                                    </div>
                                    <div className="w-16 flex items-center justify-end gap-2 shrink-0">
                                        <span className="text-xs font-mono font-bold text-slate-600 tabular-nums">{student.progress}%</span>
                                        {student.status === 'error' && <XCircle size={16} className="text-rose-600 shrink-0" />}
                                        {student.status === 'done' && <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />}
                                        {student.status === 'solving' && <Loader2 size={16} className="text-amber-500 animate-spin shrink-0" />}
                                        {student.status === 'correct' && <Check size={16} className="text-emerald-600 shrink-0" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </section>

            {/* =========================================================================
                FOOTER & TEACHER CTA
                ========================================================================= */}
            <footer className="bg-[#f9fbf7] border-t border-slate-200 py-14 px-4 sm:px-8 text-slate-900">
                <div className="max-w-7xl mx-auto flex flex-col gap-10">
                    <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="space-y-1.5 max-w-xl">
                            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                                {t.footer_title}
                            </h2>
                            <p className="text-sm text-slate-600">
                                {t.footer_sub}
                            </p>
                        </div>
                        <button 
                            type="button"
                            onClick={onTeacherLogin} 
                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-2xs active:scale-[0.98] inline-flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                        >
                            <span>{t.btn_teacher}</span>
                            <ArrowRight size={15} />
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
                        <span className="text-sm font-extrabold tracking-tight text-emerald-800">
                            Anpassa
                        </span>
                        <p>{t.footer_motto}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}