// LandingView.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
    Zap, FileText, Grid3X3, Users, Globe, CheckCircle2,
    Sparkles, Layers, ShieldCheck, Target, GraduationCap, 
    Monitor, Signal, Check, XCircle, RefreshCcw, Calculator, Shuffle, Loader2,
    ArrowRight, BookOpen, Clock, BarChart, PenTool, Printer
} from 'lucide-react';

import VisualRenderer from '../visuals/VisualRenderer';
import InstructionSlideModal from '../modals/InstructionSlideModal';
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

// --- HARDCODED DEMO PACKET FOR LIVE INTERACTIVE PREVIEW ---
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

export default function LandingView({ onTeacherLogin, onStudentJoin, lang: initialLang = 'sv' }) {
    const [lang, setLang] = useState(initialLang);
    const [liveCode, setLiveCode] = useState('');
    const [classCode, setClassCode] = useState('');

    const [roadmapStep, setRoadmapStep] = useState(0);
    const [testLabToggle, setTestLabToggle] = useState(false);
    const [gridVersion, setGridVersion] = useState(0);

    const [demoQuestion, setDemoQuestion] = useState(INITIAL_DEMO_QUESTION);
    const [demoElements, setDemoElements] = useState([]);
    const [demoActiveDrawer, setDemoActiveDrawer] = useState(null);

    const [ghostStudents, setGhostStudents] = useState([
        { id: 1, name: 'Anna K.', progress: 15, status: 'solving' },
        { id: 2, name: 'Leo M.', progress: 45, status: 'correct' },
        { id: 3, name: 'Sara J.', progress: 30, status: 'error' }
    ]);

    const liveInputRef = useRef(null);

    // 🟢 GUARANTEE VIEWPORT IS AT TOP ON MOUNT
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        // Overwrite any lower component focus after initial paint
        const timer = setTimeout(() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            if (liveInputRef.current) {
                liveInputRef.current.focus({ preventScroll: true });
            }
        }, 50);
        return () => clearTimeout(timer);
    }, []);

    // Animations
    useEffect(() => {
        const interval = setInterval(() => setRoadmapStep(prev => (prev + 1) % 4), 2000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => setTestLabToggle(prev => !prev), 3000);
        return () => clearInterval(interval);
    }, []);

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

    // 🟢 Fixed math calculation syntax:
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
            newEl = { id, type: 'calculator', x: 100, y: 50, width: 280, height: 480, expression: "", result: "", ans: "", calcMode: "LTR", stroke: '#06b6d4', rotation: 0, opacity: 1 };
        } else if (type === 'algebra_tile') {
            const { kind, sign } = payload;
            newEl = AlgebraTileTool.create(200, 150, kind, sign);
        } else if (['frac_rect', 'frac_circle', 'spinner'].includes(type)) {
            newEl = FractionShapesTool.createDefault(id, '#6366f1', type);
            if (newEl) { newEl.x = 200; newEl.y = 150; }
        } else if (type === 'coord') {
            newEl = CoordinatePlaneTool.createDefault(id, '#6366f1');
        } else if (['rect', 'circle', 'triangle'].includes(type)) {
            newEl = { id, type, x: 200, y: 150, width: 200, height: 200, stroke: '#6366f1', strokeWidth: 3, fill: 'rgba(99, 102, 241, 0.1)', rotation: 0, opacity: 1, ...(type === 'triangle' ? { triangleType: 'right' } : {}) };
        }

        if (newEl) setDemoElements(prev => [...prev, newEl]);
    };

    const t = {
        sv: {
            hero_badge: "Noll förberedelse. Maximal effekt.",
            hero_title: "Rätt stöd. Direkt.",
            hero_subtitle: "Skräddarsy lektioner, generera oändliga uppgifter och följ elevernas utveckling i realtid. Byggt av lärare, för lärare.",
            path_live_h: "Live-lektion",
            path_live_p: "Anslut till rum",
            path_practice_h: "Egen träning",
            path_practice_p: "Öva med kod",
            btn_live: "Gå med",
            btn_practice: "Börja öva",
            btn_teacher: "Lärare & Skolor",
            
            curriculum_title: "Din pedagogik. Obegränsat material.",
            curriculum_subtitle: "Vår motor.",
            curriculum_desc: "Bygg egna moduler, prov och arbetsblad. Välj område, svårighetsgrad och låt systemet generera unika uppgifter. Du får aldrig slut på material.",
            roadmap_step_1: "Genomgång: Ekvationer",
            roadmap_step_2: "Övning: Nivå 1-3",
            roadmap_step_3: "Delprov: Självrättande",

            studio_title: "Digitalt eller papper.",
            studio_subtitle: "På dina villkor.",
            studio_desc: "Skapa arbetsblad och Do Now-grids på sekunder. Dela digitalt med dina elever eller skriv ut på papper. Behöver du en ny version? Klicka på blanda för att generera helt nya uppgifter.",
            btn_shuffle: "Blanda Uppgifter",
            
            presentation_title: "Presentationer som anpassas.",
            presentation_subtitle: "I realtid.",
            presentation_desc: "Ett exempel på tavlan som inte klickade? Klicka dig igenom lösningen steg-för-steg och klicka på slumpa för att få en ny variant med nya siffror, utan att vända ryggen till klassen. Prova själv här intill!",
            
            whiteboard_title: "Interaktiv tavla.",
            whiteboard_subtitle: "Byggd för matte.",
            whiteboard_desc: "Släpp externa ritprogram. Vår inbyggda digitala tavla låter dig rita, dra in bråkcirklar, algebrabrickor och grafer direkt över presentationen. Prova att öppna verktygslådan!",
            btn_tools: "Öppna Verktygslådan",

            live_title: "Fånga aha-ögonblicken",
            live_subtitle: "i realtid.",
            live_desc: "Teacher Live View ger dig fullständig överblick. Se exakt när en elev fastnar, vilken uppgift som ställer till det, och vem som är redo för en utmaning – allt medan lektionen pågår.",

            testlab_title: "Oändligt med övningsprov.",
            testlab_subtitle: "Noll letande.",
            testlab_desc: "Sluta leta efter instuderingsuppgifter inför provveckan. Välj svårighetsgrad och område, så genererar systemet unika övningsprov till varje elev så att de kan mängdträna helt på egen hand.",
            
            footer_title: "Skapa din första anpassade planering på under 3 minuter.",
            feature_1: "Drag-and-drop planeringsverktyg",
            feature_2: "1000+ dynamiska uppgiftstyper",
            feature_3: "Live-telemetri i klassrummet",
            feature_4: "Designat för LGR22",
            footer_motto: "Anpassa Math Platform — Designad för mastery."
        },
        en: {
            hero_badge: "Zero Prep. Maximum Impact.",
            hero_title: "Right support. Instantly.",
            hero_subtitle: "Tailor lessons, generate infinite tasks, and track student progress in real-time. Built by teachers, for teachers.",
            path_live_h: "Live Session",
            path_live_p: "Join active room",
            path_practice_h: "Self Practice",
            path_practice_p: "Practice with code",
            btn_live: "Join",
            btn_practice: "Start",
            btn_teacher: "Teachers & Schools",
            
            curriculum_title: "Your pedagogy. Unlimited material.",
            curriculum_subtitle: "Our engine.",
            curriculum_desc: "Build your own modules, tests, and worksheets. Select the topic, set the difficulty, and let the system generate unique tasks. You will never run out of material.",
            roadmap_step_1: "Instruction: Equations",
            roadmap_step_2: "Practice: Levels 1-3",
            roadmap_step_3: "Checkpoint: Auto-graded",

            studio_title: "Digital or paper.",
            studio_subtitle: "On your terms.",
            studio_desc: "Create worksheets and Do Now grids in seconds. Share digitally with your students or print them out. Need a new version? Hit shuffle to generate entirely new tasks instantly.",
            btn_shuffle: "Shuffle Board",

            presentation_title: "Presentations that adapt.",
            presentation_subtitle: "In real-time.",
            presentation_desc: "Example on the board didn't click? Step through the solution dynamically, and hit regenerate to instantly get a brand new variation without turning your back to the class. Try it yourself!",
            
            whiteboard_title: "Interactive whiteboard.",
            whiteboard_subtitle: "Built for math.",
            whiteboard_desc: "Ditch external drawing tools. Our built-in digital canvas lets you draw, drop fraction circles, algebra tiles, and graphs directly onto your presentation. Try opening the toolbox!",
            btn_tools: "Open Toolbox",

            live_title: "Catch the Aha! moments",
            live_subtitle: "in real-time.",
            live_desc: "Teacher Live View gives you complete oversight. See exactly when a student gets stuck, which task is causing trouble, and who is ready for a challenge — while the lesson is happening.",

            testlab_title: "Endless practice tests.",
            testlab_subtitle: "Zero searching.",
            testlab_desc: "Stop hunting for study material before test week. Choose difficulty and topic, and the system generates unique practice tests for every student so they can drill on their own.",
            
            footer_title: "Create your first custom unit in under 3 minutes.",
            feature_1: "Drag-and-drop Curriculum Builder",
            feature_2: "1000+ Dynamic Question Types",
            feature_3: "Live Classroom Telemetry",
            feature_4: "Curriculum Aligned",
            footer_motto: "Anpassa Math Platform — Built for mastery."
        }
    }[lang];

    const currentGrid = DO_NOW_SETS[gridVersion % DO_NOW_SETS.length];

    return (
        <div className="min-h-screen bg-[#f9fbf7] font-sans text-slate-800 selection:bg-emerald-100 overflow-x-hidden transition-colors duration-500 flex flex-col">
            
            {/* =========================================================================
                NAVBAR
                ========================================================================= */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-emerald-100 px-4 sm:px-6 py-3">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-md"><Sparkles size={16} className="text-white" /></div>
                        <span className="text-lg sm:text-xl font-black tracking-tighter italic text-emerald-800 uppercase">ANPASSA</span>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-6">
                        <button onClick={() => setLang(lang === 'sv' ? 'en' : 'sv')} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                            <Globe size={14} /> <span className="hidden sm:inline">{lang === 'sv' ? 'English' : 'Svenska'}</span>
                        </button>
                        <button onClick={onTeacherLogin} className="bg-emerald-900 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md active:scale-95 whitespace-nowrap">
                            {t.btn_teacher}
                        </button>
                    </div>
                </div>
            </nav>

            {/* =========================================================================
                HERO SECTION
                ========================================================================= */}
            <header className="pt-28 pb-16 px-4 sm:px-6 text-center w-full max-w-6xl mx-auto relative z-10 min-h-[85dvh] flex flex-col justify-center items-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border border-emerald-100">
                    <Zap size={14} className="fill-emerald-500" /> {t.hero_badge}
                </div>
                
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-none mb-6 text-slate-900 italic uppercase">
                    {t.hero_title}
                </h1>
                
                <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
                    {t.hero_subtitle}
                </p>
                
                <div className="flex flex-col lg:flex-row w-full max-w-6xl gap-6 mx-auto">
                    
                    {/* LIVE LESSON */}
                    <div className="bg-white p-5 sm:p-6 rounded-[2rem] shadow-xl border border-emerald-100 flex flex-col xl:flex-row items-center justify-between gap-6 group hover:border-emerald-500 transition-all flex-1 w-full">
                        <div className="flex items-center gap-4 w-full xl:w-auto flex-1 min-w-0">
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                                <Users size={28} />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-800 truncate">{t.path_live_h}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{t.path_live_p}</p>
                            </div>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); onStudentJoin('live', liveCode); }} className="flex w-full sm:w-auto gap-2 shrink-0">
                            <input 
                                ref={liveInputRef}
                                type="text" 
                                maxLength={6} 
                                value={liveCode} 
                                onChange={(e) => setLiveCode(e.target.value.toUpperCase())} 
                                placeholder="KOD" 
                                className="w-full sm:w-32 px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-center font-black text-lg tracking-[0.2em] outline-none focus:border-emerald-500 focus:bg-white transition-all" 
                            />
                            <button type="submit" className="px-6 py-4 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 shadow-md active:scale-95 transition-all whitespace-nowrap shrink-0">
                                {t.btn_live}
                            </button>
                        </form>
                    </div>

                    {/* SELF PRACTICE */}
                    <div className="bg-white p-5 sm:p-6 rounded-[2rem] shadow-xl border border-amber-100 flex flex-col xl:flex-row items-center justify-between gap-6 group hover:border-amber-500 transition-all flex-1 w-full">
                        <div className="flex items-center gap-4 w-full xl:w-auto flex-1 min-w-0">
                            <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                                <GraduationCap size={28} />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-800 truncate">{t.path_practice_h}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{t.path_practice_p}</p>
                            </div>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); onStudentJoin('practice', classCode); }} className="flex w-full sm:w-auto gap-2 shrink-0">
                            <input type="text" maxLength={12} value={classCode} onChange={(e) => setClassCode(e.target.value.toUpperCase())} placeholder="KOD" className="w-full sm:w-40 px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-center font-black text-lg tracking-[0.1em] outline-none focus:border-amber-500 focus:bg-white transition-all" />
                            <button type="submit" className="px-6 py-4 bg-amber-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 shadow-md active:scale-95 transition-all whitespace-nowrap shrink-0">
                                {t.btn_practice}
                            </button>
                        </form>
                    </div>
                    
                </div>
            </header>

            {/* =========================================================================
                SECTION 1: CUSTOM CURRICULUM ENGINE
                ========================================================================= */}
            <section className="py-20 sm:py-28 bg-white relative overflow-hidden border-t border-slate-100">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-indigo-100">
                            <Layers size={14} /> Curriculum Builder
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase italic text-slate-900 tracking-tighter leading-none">
                            {t.curriculum_title}<br/>
                            <span className="text-indigo-600">{t.curriculum_subtitle}</span>
                        </h2>
                        <p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed">
                            {t.curriculum_desc}
                        </p>
                    </div>

                    <div className="bg-slate-50 rounded-[3rem] p-6 sm:p-8 border-4 border-slate-100 shadow-2xl relative min-h-[350px] flex flex-col justify-center">
                        <div className="space-y-4 relative">
                            <div className="absolute left-6 top-6 bottom-6 w-1 bg-slate-200 rounded-full" />
                            
                            <div className={`relative flex items-center gap-4 transition-all duration-500 ${roadmapStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 z-10 shadow-md">
                                    <BookOpen size={20} />
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 block mb-1">Del 1</span>
                                    <h4 className="font-bold text-sm text-slate-800">{t.roadmap_step_1}</h4>
                                </div>
                            </div>

                            <div className={`relative flex items-center gap-4 transition-all duration-500 ${roadmapStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 z-10 shadow-md">
                                    <Target size={20} />
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 block mb-1">Del 2</span>
                                    <h4 className="font-bold text-sm text-slate-800">{t.roadmap_step_2}</h4>
                                </div>
                            </div>

                            <div className={`relative flex items-center gap-4 transition-all duration-500 ${roadmapStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 z-10 shadow-md">
                                    <CheckCircle2 size={20} />
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 block mb-1">Del 3</span>
                                    <h4 className="font-bold text-sm text-slate-800">{t.roadmap_step_3}</h4>
                                </div>
                            </div>

                            <div className={`relative flex items-center gap-4 transition-all duration-500 ${roadmapStep === 0 ? 'opacity-100' : 'opacity-40'}`}>
                                <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-400 flex items-center justify-center shrink-0 z-10 border-2 border-dashed border-slate-300">
                                    <RefreshCcw size={20} className={roadmapStep === 0 ? "animate-spin-slow" : ""} />
                                </div>
                                <div className="h-14 border-2 border-dashed border-slate-200 rounded-2xl flex-1 bg-slate-50/50" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================================
                SECTION 2: QUESTION STUDIO (WORKSHEETS & DO NOWS)
                ========================================================================= */}
            <section className="py-20 sm:py-28 bg-[#f9fbf7] relative overflow-hidden border-t border-slate-100">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    
                    <div className="order-2 lg:order-1 relative">
                        <div className="grid grid-cols-2 gap-4">
                            {currentGrid.map((card, i) => (
                                <div key={i} className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200/60 flex flex-col items-center justify-center text-center aspect-square transition-all duration-300">
                                    <div className="w-full flex justify-end mb-2">{card.icon}</div>
                                    <MathDisplay content={`$$${card.eq}$$`} className="text-xl text-slate-700 font-serif" />
                                </div>
                            ))}
                        </div>
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 z-20">
                            <button 
                                onClick={() => setGridVersion(v => v + 1)}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-indigo-500 active:scale-95 transition-all whitespace-nowrap border-4 border-[#f9fbf7]"
                            >
                                <Shuffle size={16} /> {t.btn_shuffle}
                            </button>
                        </div>
                    </div>

                    <div className="order-1 lg:order-2 space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-fuchsia-100 text-fuchsia-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-fuchsia-200">
                            <Printer size={14} /> Question Studio
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase italic text-slate-900 tracking-tighter leading-none">
                            {t.studio_title}<br/>
                            <span className="text-fuchsia-600">{t.studio_subtitle}</span>
                        </h2>
                        <p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed">
                            {t.studio_desc}
                        </p>
                    </div>

                </div>
            </section>

            {/* =========================================================================
                SECTION 3: PRESENTATION BUILDER & LIVE DEMO
                ========================================================================= */}
            <section className="py-20 sm:py-28 bg-slate-900 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                    <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-emerald-500 blur-[120px] rounded-full"></div>
                </div>

                <div className="max-w-[1500px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
                    
                    <div className="order-2 lg:order-1 relative lg:col-span-7 xl:col-span-8">
                        <div className="h-[500px] sm:h-[600px] w-full bg-white rounded-[2rem] shadow-2xl border-4 border-slate-800 overflow-hidden flex relative pointer-events-auto">
                            <InstructionSlideCard 
                                question={demoQuestion} 
                                lang={lang} 
                                onRegenerate={handleDemoRegenerate}
                            />
                        </div>
                    </div>

                    <div className="order-1 lg:order-2 space-y-6 text-white lg:col-span-5 xl:col-span-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 border border-emerald-500/30">
                            <Monitor size={14} className="fill-emerald-400" /> Walkthrough Builder
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
                            {t.presentation_title}<br/>
                            <span className="text-emerald-400">{t.presentation_subtitle}</span>
                        </h2>
                        <p className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed">
                            {t.presentation_desc}
                        </p>
                    </div>

                </div>
            </section>

            {/* =========================================================================
                SECTION 4: INTERACTIVE WHITEBOARD
                ========================================================================= */}
            <section className="py-20 sm:py-28 bg-indigo-950 relative overflow-hidden text-white border-t-8 border-indigo-900">
                <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-800 text-indigo-300 rounded-full text-[10px] font-bold uppercase tracking-widest border border-indigo-700 shadow-inner">
                            <PenTool size={14} className="text-indigo-400" /> Whiteboard
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
                            {t.whiteboard_title}<br/>
                            <span className="text-indigo-400">{t.whiteboard_subtitle}</span>
                        </h2>
                        <p className="text-base sm:text-lg text-indigo-200 font-medium leading-relaxed">
                            {t.whiteboard_desc}
                        </p>
                        <button 
                            onClick={() => setDemoActiveDrawer(prev => prev ? null : 'fractions')}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-md active:scale-95"
                        >
                            {t.btn_tools}
                        </button>
                    </div>

                    <div className="relative">
                        <div className="bg-white rounded-[2rem] overflow-hidden shadow-2xl border-4 border-indigo-500/30 aspect-video relative pointer-events-auto flex">
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

                </div>
            </section>

            {/* =========================================================================
                SECTION 5: LIVE TELEMETRY
                ========================================================================= */}
            <section className="py-20 sm:py-28 bg-white relative overflow-hidden border-t border-slate-100">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    
                    <div className="order-2 lg:order-1 relative">
                        <div className="bg-slate-50 rounded-[3rem] p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-4">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Klass 9B • Live</h3>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-rose-600 uppercase tracking-widest bg-rose-100 px-3 py-1 rounded-full animate-pulse border border-rose-200">
                                    <div className="w-2 h-2 rounded-full bg-rose-500"></div> Aktiv Session
                                </div>
                            </div>
                            
                            {ghostStudents.map((student) => (
                                <div key={student.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 w-1/4 min-w-[80px]">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 shrink-0">{student.name.charAt(0)}</div>
                                        <span className="font-bold text-sm text-slate-700 truncate">{student.name}</span>
                                    </div>
                                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden relative">
                                        <div 
                                            className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out
                                                ${student.status === 'error' ? 'bg-rose-500' : student.status === 'done' ? 'bg-emerald-500' : 'bg-amber-400'}`}
                                            style={{ width: `${student.progress}%` }}
                                        />
                                    </div>
                                    <div className="w-8 flex justify-end shrink-0">
                                        {student.status === 'error' && <XCircle size={18} className="text-rose-500" />}
                                        {student.status === 'done' && <CheckCircle2 size={18} className="text-emerald-500" />}
                                        {student.status === 'solving' && <Loader2 size={18} className="text-amber-400 animate-spin" />}
                                        {student.status === 'correct' && <Check size={18} className="text-emerald-500" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="order-1 lg:order-2 space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-50 text-rose-600 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 border border-rose-100">
                            <Signal size={14} className="fill-rose-500" /> Live Telemetry
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase italic text-slate-900 tracking-tighter leading-none">
                            {t.live_title}<br/>
                            <span className="text-rose-500">{t.live_subtitle}</span>
                        </h2>
                        <p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed">
                            {t.live_desc}
                        </p>
                    </div>

                </div>
            </section>

            {/* =========================================================================
                SECTION 6: TEST LAB
                ========================================================================= */}
            <section className="py-20 sm:py-28 bg-[#f9fbf7] relative overflow-hidden border-t border-slate-200">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-100">
                            <ShieldCheck size={14} /> Test Lab
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase italic text-slate-900 tracking-tighter leading-none">
                            {t.testlab_title}<br/>
                            <span className="text-amber-500">{t.testlab_subtitle}</span>
                        </h2>
                        <p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed">
                            {t.testlab_desc}
                        </p>
                    </div>

                    <div className="relative">
                        <div className="flex gap-4 h-[280px]">
                            {/* Student A */}
                            <div className="flex-1 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
                                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">
                                    Elev A
                                </div>
                                <div className="flex-1 flex flex-col items-center justify-center p-4">
                                    <div className="transform scale-[0.5] sm:scale-[0.6] origin-center">
                                        <VisualRenderer data={{ geometry: { type: 'cylinder', labels: { r: '4', h: '10' } } }} />
                                    </div>
                                    <div className="w-full h-8 border-2 border-dashed border-slate-200 rounded-lg mt-4" />
                                </div>
                            </div>
                            
                            {/* Student B */}
                            <div className="flex-1 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
                                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">
                                    Elev B
                                </div>
                                <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
                                    <div className={`absolute inset-0 flex flex-col items-center justify-center p-4 transition-all duration-700 ${testLabToggle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                        <div className="transform scale-[0.5] sm:scale-[0.6] origin-center">
                                            <VisualRenderer data={{ geometry: { type: 'cylinder', labels: { r: '7', h: '3' } } }} />
                                        </div>
                                        <div className="w-full h-8 border-2 border-dashed border-slate-200 rounded-lg mt-4" />
                                    </div>
                                    <div className={`absolute inset-0 flex flex-col items-center justify-center p-4 transition-all duration-700 ${!testLabToggle ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                                        <div className="transform scale-[0.5] sm:scale-[0.6] origin-center">
                                            <VisualRenderer data={{ geometry: { type: 'cylinder', labels: { r: '4', h: '10' } } }} />
                                        </div>
                                        <div className="w-full h-8 border-2 border-dashed border-slate-200 rounded-lg mt-4" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 z-20">
                            <div className="bg-amber-500 text-white px-6 py-4 rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl flex items-center gap-2 border-4 border-[#f9fbf7]">
                                <RefreshCcw size={16} className={testLabToggle ? "animate-spin" : ""} /> {lang === 'sv' ? "Generera Unika Prov" : "Generate Unique Tests"}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================================================================
                FOOTER & CTA
                ========================================================================= */}
            <footer className="bg-slate-900 pt-24 pb-12 flex flex-col items-center px-6 relative text-white">
                <div className="max-w-4xl mx-auto flex flex-col items-center gap-10 relative z-10 w-full">
                    
                    <div className="text-center space-y-6 mb-4">
                        <h2 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tighter leading-tight max-w-2xl mx-auto">
                            {t.footer_title}
                        </h2>
                        
                        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-bold text-emerald-300">
                            <span className="flex items-center justify-center gap-2"><CheckCircle2 size={16}/> {t.feature_1}</span>
                            <span className="flex items-center justify-center gap-2"><CheckCircle2 size={16}/> {t.feature_2}</span>
                            <span className="flex items-center justify-center gap-2"><CheckCircle2 size={16}/> {t.feature_3}</span>
                            <span className="flex items-center justify-center gap-2"><CheckCircle2 size={16}/> {t.feature_4}</span>
                        </div>
                    </div>

                    <button 
                        onClick={onTeacherLogin} 
                        className="px-8 sm:px-12 py-4 sm:py-5 bg-emerald-500 text-white rounded-2xl sm:rounded-[2rem] font-black uppercase tracking-[0.1em] text-xs sm:text-sm hover:bg-emerald-400 transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-3"
                    >
                        {t.btn_teacher} <ArrowRight size={18} />
                    </button>
                    
                    <div className="w-full h-px bg-slate-800 mt-8" />
                    
                    <div className="flex items-center gap-3 opacity-40">
                        <Sparkles size={20} className="text-emerald-500" />
                        <span className="font-black tracking-tighter italic uppercase text-lg text-slate-300">Anpassa</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] sm:tracking-[0.4em] text-center">{t.footer_motto}</p>
                </div>
            </footer>
        </div>
    );
}