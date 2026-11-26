import React, { useState, useEffect, useRef } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import {
    Users, Globe, CheckCircle2,
    Layers, ShieldCheck, GraduationCap,
    Monitor, Signal, Shuffle,
    ArrowRight, PenTool, Printer, FileText, Eye,
    Infinity as InfinityIcon, Sparkles, HelpCircle, XCircle, RotateCcw
} from 'lucide-react';

import VisualRenderer from '../visuals/VisualRenderer';
import InstructionSlideCard from '../shared/InstructionSlideCard';

// Interactive Whiteboard Imports
import InteractiveCanvas from '../whiteboard/InteractiveCanvas';
import WhiteboardDrawer from '../whiteboard/WhiteboardDrawer';
import AlgebraTileTool from '../whiteboard/tools/manipulatives/AlgebraTileTool';
import FractionShapesTool from '../whiteboard/tools/geometry/FractionShapesTool';
import CoordinatePlaneTool from '../whiteboard/tools/analysis/CoordinatePlaneTool';

// --- MOTION PRESETS ---
const VIEWPORT_CONFIG = { once: false, amount: 0.16 };
const FLY_EASE = [0.22, 1, 0.36, 1];

// --- MATH RENDERING ENGINE (Protected Light-Mode Contrast) ---
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
                    throwOnError: false, trust: false
                });
            }
        };
        const timer = setTimeout(renderMath, 30);
        return () => clearTimeout(timer);
    }, [content]);
    return (
        <div
            ref={containerRef}
            className={`math-content leading-relaxed text-slate-900 [&_.katex]:!text-current [&_.katex-html]:!text-current ${className}`}
        />
    );
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

// --- GUIDED NOTES DEMO PACKETS (STUDENT BLANKS VS TEACHER KEY) ---
const GUIDED_NOTES_EXAMPLES = [
    {
        id: 'gn_eq',
        badgeSv: 'Exempel',
        badgeEn: 'Example',
        titleSv: 'Tvåstegsekvationer',
        titleEn: 'Two-Step Equations',
        promptSv: 'Lös ekvationen steg för steg och visa dina uträkningar.',
        promptEn: 'Solve the equation step by step and show your work.',
        latex: '4x - 7 = 13',
        geometry: null,
        steps: [
            {
                textSv: 'Ta bort konstanten $-7$ genom att addera $7$ på båda sidor.',
                textEn: 'Eliminate $-7$ by adding $7$ to both sides.',
                latex: '4x - 7 + 7 = 13 + 7',
                blankText: false,
                blankLatex: true
            },
            {
                textSv: 'Förenkla båda leden så att variabeltermen står ensam.',
                textEn: 'Simplify both sides to isolate the variable term.',
                latex: '4x = 20',
                blankText: true,
                blankLatex: false
            },
            {
                textSv: 'Dividera båda sidor med $4$ för att lösa ut $x$.',
                textEn: 'Divide both sides by $4$ to solve for $x$.',
                latex: '\\frac{4x}{4} = \\frac{20}{4}',
                blankText: false,
                blankLatex: true
            },
            {
                textSv: 'Svar:',
                textEn: 'Answer:',
                latex: 'x = 5',
                blankText: false,
                blankLatex: true
            }
        ]
    },
    {
        id: 'gn_cyl',
        badgeSv: 'Exempel',
        badgeEn: 'Example',
        titleSv: 'Cylinderns Volym',
        titleEn: 'Volume of a Cylinder',
        promptSv: 'Beräkna cylinderns volym. Avrunda till hela $cm^3$.',
        promptEn: 'Calculate the volume of the cylinder. Round to whole $cm^3$.',
        latex: null,
        geometry: { type: 'cylinder', labels: { r: '3 cm', h: '8 cm' } },
        steps: [
            {
                textSv: 'Skriv formeln för en cylinders volym ($B \\cdot h$).',
                textEn: 'Write the formula for the volume of a cylinder ($B \\cdot h$).',
                latex: 'V = \\pi \\cdot r^2 \\cdot h',
                blankText: false,
                blankLatex: true
            },
            {
                textSv: 'Sätt in radien $r = 3$ och höjden $h = 8$.',
                textEn: 'Substitute radius $r = 3$ and height $h = 8$.',
                latex: 'V = \\pi \\cdot 3^2 \\cdot 8',
                blankText: true,
                blankLatex: true
            },
            {
                textSv: 'Beräkna produkten och avrunda till heltal.',
                textEn: 'Compute the product and round to the nearest integer.',
                latex: 'V \\approx 226\\text{ cm}^3',
                blankText: false,
                blankLatex: true
            }
        ]
    }
];

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

// --- REALISTIC LIVE LESSON MATRIX DATA (MIRRORS TEACHER LIVE VIEW) ---
const LIVE_COLUMNS = [
    { id: 'Q1', answer: '100', greenPct: 88, redPct: 12 },
    { id: 'Q2', answer: '1000000', greenPct: 94, redPct: 0 },
    { id: 'Q3', answer: '0,0001', greenPct: 68, redPct: 26 },
    { id: 'Q4', answer: '2,2*10^4', greenPct: 52, redPct: 48 },
    { id: 'Q5', answer: '7,6*10^7', greenPct: 64, redPct: 30 },
    { id: 'Q6', answer: 'x^5', greenPct: 92, redPct: 0 },
    { id: 'Q7', answer: 'x^13', greenPct: 45, redPct: 45 },
    { id: 'Q8', answer: '3n+4', greenPct: 56, redPct: 38 }
];

const INITIAL_LIVE_MATRIX = [
    {
        id: 's1',
        name: 'Elev 01',
        klar: 100,
        cells: [
            { val: '100', status: 'correct' },
            { val: '1000000', status: 'correct' },
            { val: '0,0001', status: 'correct' },
            { val: '2,2*10^4', status: 'correct' },
            { val: '7,6*10^7', status: 'correct' },
            { val: 'x^5', status: 'correct' },
            { val: 'x^13', status: 'correct' },
            { val: '3n+4', status: 'correct' }
        ]
    },
    {
        id: 's2',
        name: 'Elev 02',
        klar: 100,
        cells: [
            { val: '100', status: 'correct' },
            { val: '1000000', status: 'correct' },
            { val: '0,0001', status: 'correct' },
            { val: '2,2*10^4', status: 'correct' },
            { val: '7,6*10^7', status: 'correct' },
            { val: 'x^5', status: 'correct' },
            { val: 'x^42', status: 'wrong' },
            { val: '3n+4', status: 'correct' }
        ]
    },
    {
        id: 's3',
        name: 'Elev 03',
        klar: 88,
        cells: [
            { val: '100', status: 'correct' },
            { val: '1000000', status: 'correct' },
            { val: '0,0004', status: 'wrong' },
            { val: '22*10^4', status: 'wrong' },
            { val: '76*10^7', status: 'wrong' },
            { val: 'x^5', status: 'correct' },
            { val: 'x^42', status: 'wrong' },
            { val: '3', status: 'wrong' }
        ]
    },
    {
        id: 's4',
        name: 'Elev 04',
        klar: 63,
        cells: [
            { val: '', status: 'empty' },
            { val: '1000000', status: 'correct' },
            { val: '0,0001', status: 'correct' },
            { val: '2*10^4', status: 'wrong' },
            { val: '', status: 'empty' },
            { val: 'x^5', status: 'correct' },
            { val: 'x^42', status: 'wrong' },
            { val: 'fattar ej', status: 'wrong' }
        ]
    },
    {
        id: 's5',
        name: 'Elev 05',
        klar: 100,
        cells: [
            { val: '11', status: 'wrong' },
            { val: '1 000 000', status: 'correct' },
            { val: '0,0001', status: 'correct' },
            { val: '2,2*10^4', status: 'correct' },
            { val: '7,6*10^7', status: 'correct' },
            { val: 'x^5', status: 'correct' },
            { val: 'x^13', status: 'correct' },
            { val: '3n+4', status: 'correct' }
        ]
    },
    {
        id: 's6',
        name: 'Elev 06',
        klar: 38,
        cells: [
            { val: '', status: 'empty' },
            { val: '', status: 'empty' },
            { val: '', status: 'empty' },
            { val: '22*10^3', status: 'wrong' },
            { val: '76*10^6', status: 'wrong' },
            { val: 'x^5', status: 'correct' },
            { val: '', status: 'empty' },
            { val: '', status: 'empty' }
        ]
    }
];

function createEndlessPracticeTask() {
    const a = Math.floor(Math.random() * 6) + 2;
    const x = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 12) + 3;
    const isPlus = Math.random() > 0.4;
    const rhs = isPlus ? a * x + b : a * x - b;

    const distractors = new Set([x]);
    while (distractors.size < 4) {
        const candidate = Math.max(1, x + (Math.floor(Math.random() * 7) - 3));
        distractors.add(candidate);
    }
    const choices = Array.from(distractors).sort(() => Math.random() - 0.5);

    return {
        a,
        b,
        isPlus,
        rhs,
        answer: x,
        choices,
        equationLatex: `${a}x ${isPlus ? '+' : '-'} ${b} = ${rhs}`,
        step1Latex: `${a}x = ${rhs} ${isPlus ? '-' : '+'} ${b} = ${a * x}`,
        step2Latex: `x = \\frac{${a * x}}{${a}} = ${x}`
    };
}

export default function LandingView({ onTeacherLogin, onStudentJoin, lang: initialLang = 'sv' }) {
    const [lang, setLang] = useState(initialLang);
    const [liveCode, setLiveCode] = useState('');
    const [classCode, setClassCode] = useState('');

    const [gridVersion, setGridVersion] = useState(0);
    const [activeStageTab, setActiveStageTab] = useState('walkthrough');
    const [testLabToggle, setTestLabToggle] = useState(false);

    const [guidedNotesKeyMode, setGuidedNotesKeyMode] = useState(false);
    const [guidedNotesIdx, setGuidedNotesIdx] = useState(0);

    const [practiceTask, setPracticeTask] = useState(() => createEndlessPracticeTask());
    const [studentInput, setStudentInput] = useState('');
    const [practiceFeedback, setPracticeFeedback] = useState(null);
    const [revealedHints, setRevealedHints] = useState(0);
    const [streakCount, setStreakCount] = useState(3);

    const [showFacit, setShowFacit] = useState(false);
    const [liveMatrix, setLiveMatrix] = useState(INITIAL_LIVE_MATRIX);

    useEffect(() => {
        const interval = setInterval(() => setTestLabToggle(prev => !prev), 3200);
        return () => clearInterval(interval);
    }, []);

    const [demoQuestion, setDemoQuestion] = useState(INITIAL_DEMO_QUESTION);
    const [demoElements, setDemoElements] = useState([]);
    const [demoActiveDrawer, setDemoActiveDrawer] = useState(null);

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
            setLiveMatrix(prev => prev.map((row, rIdx) => {
                if (rIdx !== 5) return row;
                const isSolved = row.cells[2].status === 'correct';
                const nextCells = [...row.cells];
                nextCells[2] = isSolved
                    ? { val: '', status: 'empty' }
                    : { val: '0,0001', status: 'correct' };
                return {
                    ...row,
                    klar: isSolved ? 38 : 50,
                    cells: nextCells
                };
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleNextPracticeProblem = () => {
        setPracticeTask(createEndlessPracticeTask());
        setStudentInput('');
        setPracticeFeedback(null);
        setRevealedHints(0);
    };

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
            nav_meta: "Matematikstudio • Lärare & Elev",
            hero_title: "Rätt stöd i klassrummet.",
            hero_title_accent: "Direkt.",
            hero_subtitle: "Oändlig mängdträning med steg-för-steg-stöd för elever — och interaktiva genomgångar, Guided Notes och realtidsöverblick för lärare.",
            path_live_h: "Live-lektion",
            path_live_p: "Ange klasskod från lärarens skärm",
            path_practice_h: "Anpassa Träning",
            path_practice_p: "Öva obegränsat med elevkod eller provlänk",
            btn_live: "Anslut",
            btn_practice: "Starta",
            btn_teacher: "Lärarinloggning",

            gn_eyebrow: "Nytt • Guided Notes & Klassrumsaffischer",
            gn_title: "Fyll-i-anteckningar som följer din genomgång",
            gn_desc: "Skapa utskriftsklara A4-blad och klassrumsaffischer på sekunder. Klicka på valfri ruta för att dölja text eller formel i elevversionen — och växla med ett klick till lärarfacit vid genomgång.",
            gn_mode_student: "Elevversion (Skrivluckor)",
            gn_mode_teacher: "Lärarfacit (Ifylld)",
            gn_ex_1: "Exempel 1: Algebra",
            gn_ex_2: "Exempel 2: Geometri",
            gn_step_header: "Lösning steg-för-steg",
            gn_student_hint: "Fyll i här",
            gn_teacher_note: "Strecket visar vad som är dolt på elevens papper",
            gn_feature_1: "1-klicks elevluckor på text eller uträkning",
            gn_feature_2: "A4/A3 affischer, 2-up, 4-up & A5-häften",
            gn_feature_3: "Slumpa nya talvärden för parallella versioner",

            sp_eyebrow: "För elever • Oändlig träning på egen nivå",
            sp_title: "Träna tills det sitter — med nya tal varje gång",
            sp_desc: "Inga statiska PDF-facit eller slut på uppgifter. Varje gång eleven ber om en ny uppgift genereras nya talvärden, egna steg-för-steg-ledtrådar och möjlighet att bygga egna träningspass inför prov.",
            sp_try_label: "Testa som elev direkt:",
            sp_prompt: "Lös ekvationen:",
            sp_placeholder: "x = ?",
            sp_check_btn: "Rätta",
            sp_next_btn: "Ny uppgift (nya tal)",
            sp_hint_btn: "Visa ledtråd",
            sp_correct_msg: "Rätt! Starkt jobbat — testa en ny variant direkt.",
            sp_wrong_msg: "Inte riktigt än. Kika på ledtråden nedan och försök igen!",
            sp_streak: "I rad",
            sp_card_1_t: "Obegränsade uppgifter",
            sp_card_1_d: "Nya talvärden och slumpade texter varje gång så att du tränar på metoden, inte memorerar svar.",
            sp_card_2_t: "Steg-för-steg-stöd i uppgiften",
            sp_card_2_d: "Fastnar du? Öppna en ledtråd i taget eller se ett liknande löst exempel utan att lämna uppgiften.",
            sp_card_3_t: "Bygg egna prov i Test Lab",
            sp_card_3_d: "Välj precis de områden och nivåer (1–3) du behöver repetera inför prov och få direkt diagnos.",

            pillars_heading: "Fler verktyg i samma studio",
            p1_title: "Modulbaserade studieplaner",
            p1_desc: "Kombinera genomgångar, adaptiva övningsnivåer och självrättande delprov i en utskriftsklar elevchecklista.",
            p2_title: "Arbetsblad & Do Now-grids",
            p2_desc: "Skapa lektionsstarter och utskriftsklara A4-blad på sekunder. Blanda fram nya talvärden med ett klick.",
            btn_shuffle: "Slumpa nya tal",
            p3_title: "Unika prov i Test Lab",
            p3_desc: "Varje elev får en egen uppsättning uppgifter med omedelbar återkoppling eller provläge.",

            stage_eyebrow: "Prova lärarverktygen i webbläsaren",
            stage_title: "Tavlan som räknar med dig",
            stage_desc: "Växla mellan steg-för-steg-genomgångar med slumpade talvärden och en digital mattetavla med bråkcirklar, algebrabrickor och koordinatsystem.",
            tab_walkthrough: "Steg-för-steg-genomgång",
            tab_whiteboard: "Interaktiv matematisk tavla",
            btn_tools: "Öppna bråkverktyg",

            live_badge: "Live-lektion • Lärarvy",
            live_title: "Se hela klassens uträkningar ruta för ruta",
            live_desc: "Varje elevs svar visas i realtid i klassmatrisen. En uppgift. Analog eller digital.",
            live_session_title: "AVSTÄMNING – POTENSER, MÖNSTER, UTTRYCK",
            live_results_label: "KLASSENS RESULTAT",
            live_student_col: "ELEV",
            live_done_col: "KLAR",

            footer_title: "Redo att använda Anpassa i ditt klassrum?",
            footer_sub: "Logga in som lärare för att skapa Guided Notes, planeringar, arbetsblad och live-rum — eller ange din elevkod högst upp.",
            footer_motto: "Anpassa Math Platform • Digitalt & Analogt"
        },
        en: {
            nav_meta: "Mathematics Studio • Teachers & Students",
            hero_title: "Right classroom support.",
            hero_title_accent: "Instantly.",
            hero_subtitle: "Endless adaptive practice with step-by-step hints for students — plus live board walkthroughs, Guided Notes, and real-time class telemetry for teachers.",
            path_live_h: "Live Session",
            path_live_p: "Enter the room code shown on the board",
            path_practice_h: "Self Practice",
            path_practice_p: "Unlimited practice with a student or test code",
            btn_live: "Join",
            btn_practice: "Start",
            btn_teacher: "Teacher Login",

            gn_eyebrow: "New • Guided Notes & Classroom Posters",
            gn_title: "Fill-in guided notes matched to your board lesson",
            gn_desc: "Create print-ready A4 handouts and classroom reference posters in seconds. Click any step or equation to turn it into a student blank — and toggle the teacher key with one click.",
            gn_mode_student: "Student Sheet (Blanks)",
            gn_mode_teacher: "Teacher Key (Filled)",
            gn_ex_1: "Example 1: Algebra",
            gn_ex_2: "Example 2: Geometry",
            gn_step_header: "Step-by-Step Solution",
            gn_student_hint: "Write here",
            gn_teacher_note: "Dashed boxes show what is blank on the student copy",
            gn_feature_1: "One-click student blanks on steps or equations",
            gn_feature_2: "A4/A3 posters, 2-up, 4-up & A5 booklets",
            gn_feature_3: "Regenerate fresh numbers for parallel versions",

            sp_eyebrow: "For Students • Endless Practice at Your Own Pace",
            sp_title: "Practice until it clicks — with fresh numbers every time",
            sp_desc: "Never run out of problems or memorize static answer keys. Every click generates fresh numbers, step-by-step hints on demand, and custom self-tests in Test Lab.",
            sp_try_label: "Try it as a student right now:",
            sp_prompt: "Solve the equation:",
            sp_placeholder: "x = ?",
            sp_check_btn: "Check",
            sp_next_btn: "New problem (fresh numbers)",
            sp_hint_btn: "Show hint",
            sp_correct_msg: "Correct! Great work — try a fresh variation right away.",
            sp_wrong_msg: "Not quite yet. Check the hint below and try again!",
            sp_streak: "Streak",
            sp_card_1_t: "Unlimited Fresh Problems",
            sp_card_1_d: "New numbers and anchored word problems every time so you master the method instead of memorizing answers.",
            sp_card_2_t: "Built-In Step-by-Step Hints",
            sp_card_2_d: "Stuck on a step? Reveal one clue at a time or open a worked example without leaving the problem.",
            sp_card_3_t: "Custom Self-Tests in Test Lab",
            sp_card_3_d: "Pick the exact topics and levels (1–3) you want to review before an exam and get an instant breakdown.",

            pillars_heading: "More workspaces in the same studio",
            p1_title: "Modular Study Guides",
            p1_desc: "Sequence walkthroughs, adaptive practice levels, and auto-graded checkpoints into a printable student checklist.",
            p2_title: "Worksheets & Do Now Grids",
            p2_desc: "Build lesson starters and clean print-ready A4 sheets in seconds. Shuffle fresh numbers with a single click.",
            btn_shuffle: "Shuffle numbers",
            p3_title: "Unique Exams in Test Lab",
            p3_desc: "Every student receives a distinct set of problems in either instant-feedback or exam mode.",

            stage_eyebrow: "Try the teacher board in your browser",
            stage_title: "A board built for mathematics",
            stage_desc: "Switch between step-by-step worked derivations with live number regeneration and a math canvas stocked with fraction shapes, algebra tiles, and coordinate planes.",
            tab_walkthrough: "Step-by-Step Walkthrough",
            tab_whiteboard: "Interactive Math Canvas",
            btn_tools: "Toggle Fraction Tools",

            live_badge: "Live Session • Teacher Matrix",
            live_title: "Spot class-wide misconceptions cell by cell",
            live_desc: "Every student's answer streams into the live class grid in real time. One assignment. Paper or digital.",
            live_session_title: "CHECKPOINT – POWERS, PATTERNS, EXPRESSIONS",
            live_results_label: "CLASS RESULTS",
            live_student_col: "STUDENT",
            live_done_col: "DONE",

            footer_title: "Ready to bring Anpassa to your classroom?",
            footer_sub: "Sign in as a teacher to build Guided Notes, units, print worksheets, and launch live sessions — or enter your student code above.",
            footer_motto: "Anpassa Math Platform — Digital & Print Studio"
        }
    }[lang];

    const currentGrid = DO_NOW_SETS[gridVersion % DO_NOW_SETS.length];
    const activeGn = GUIDED_NOTES_EXAMPLES[guidedNotesIdx];

    return (
        <MotionConfig reducedMotion="user">
            <div
                className="min-h-screen bg-[#f9fbf7] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-950 overflow-x-clip flex flex-col"
                style={{
                    colorScheme: 'light',
                    '--text-main': '#0f172a',
                    '--text-muted': '#475569',
                    '--bg-card': '#ffffff',
                    '--bg-surface': '#f8fafc',
                    '--border-main': '#e2e8f0',
                    '--border-strong': '#cbd5e1'
                }}
            >
                {/* =========================================================================
                    UTILITY BAR
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
                    HERO SECTION: Snappy Split Entrance
                    ========================================================================= */}
                <header className="pt-8 pb-14 sm:pt-12 sm:pb-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                        <motion.div
                            initial={{ opacity: 0, x: -32 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.42, ease: FLY_EASE }}
                            className="lg:col-span-7 space-y-5"
                        >
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
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 36, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.46, delay: 0.08, ease: FLY_EASE }}
                            className="lg:col-span-5 space-y-3.5 w-full"
                        >
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
                        </motion.div>
                    </div>
                </header>

                {/* =========================================================================
                    BAND 1: DEDICATED GUIDED NOTES SHOWCASE (Directional Fly-In)
                    ========================================================================= */}
                <section id="guided-notes" className="py-16 sm:py-24 bg-white border-t border-slate-200 px-4 sm:px-8">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
                        <motion.div
                            initial={{ opacity: 0, x: -38 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={VIEWPORT_CONFIG}
                            transition={{ duration: 0.44, ease: FLY_EASE }}
                            className="lg:col-span-5 space-y-5"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-900 rounded-lg text-xs font-bold border border-amber-300">
                                <FileText size={14} className="text-amber-700" />
                                <span>{t.gn_eyebrow}</span>
                            </div>

                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                                {t.gn_title}
                            </h2>

                            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                                {t.gn_desc}
                            </p>

                            <div className="p-3.5 rounded-2xl bg-[#f9fbf7] border border-slate-200 space-y-3">
                                <div className="flex bg-white p-1 rounded-xl border border-slate-300 shadow-2xs">
                                    <button
                                        type="button"
                                        onClick={() => setGuidedNotesKeyMode(false)}
                                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                            !guidedNotesKeyMode
                                                ? 'bg-amber-500 text-white shadow-2xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        <PenTool size={13} />
                                        <span>{t.gn_mode_student}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setGuidedNotesKeyMode(true)}
                                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                            guidedNotesKeyMode
                                                ? 'bg-emerald-600 text-white shadow-2xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        <Eye size={13} />
                                        <span>{t.gn_mode_teacher}</span>
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    {GUIDED_NOTES_EXAMPLES.map((ex, idx) => (
                                        <button
                                            key={ex.id}
                                            type="button"
                                            onClick={() => setGuidedNotesIdx(idx)}
                                            className={`flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                                                guidedNotesIdx === idx
                                                    ? 'bg-slate-900 text-white border-slate-900'
                                                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            {idx === 0 ? t.gn_ex_1 : t.gn_ex_2}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <ul className="space-y-2 text-xs sm:text-sm font-semibold text-slate-700 pt-1">
                                <li className="flex items-center gap-2.5">
                                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                    <span>{t.gn_feature_1}</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                    <span>{t.gn_feature_2}</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                    <span>{t.gn_feature_3}</span>
                                </li>
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 46, scale: 0.95 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={VIEWPORT_CONFIG}
                            transition={{ duration: 0.48, delay: 0.1, ease: FLY_EASE }}
                            className="lg:col-span-7"
                        >
                            <div className="rounded-2xl border-2 border-amber-300 bg-[#fffdf7] p-4 sm:p-6 shadow-xl text-slate-900 space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-amber-200 pb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-white font-black text-[10px] uppercase tracking-wider">
                                            {lang === 'sv' ? activeGn.badgeSv : activeGn.badgeEn}
                                        </span>
                                        <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-950">
                                            {lang === 'sv' ? activeGn.titleSv : activeGn.titleEn}
                                        </span>
                                    </div>

                                    <span
                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold border ${
                                            guidedNotesKeyMode
                                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                                : 'bg-amber-100 text-amber-900 border-amber-300'
                                        }`}
                                    >
                                        {guidedNotesKeyMode ? t.gn_mode_teacher : t.gn_mode_student}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                                    <div className="md:col-span-5 md:pr-4 md:border-r border-amber-200 flex flex-col justify-between gap-3">
                                        <div className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                                            <MathDisplay content={lang === 'sv' ? activeGn.promptSv : activeGn.promptEn} />
                                        </div>

                                        {activeGn.latex && (
                                            <div className="bg-white px-3 py-3 rounded-xl border border-slate-200 shadow-2xs text-center font-serif text-lg sm:text-xl font-bold text-slate-950">
                                                <MathDisplay content={`$$${activeGn.latex}$$`} />
                                            </div>
                                        )}

                                        {activeGn.geometry && (
                                            <div className="bg-white/90 rounded-xl border border-amber-200 p-2 flex items-center justify-center min-h-[140px]">
                                                <div className="transform scale-[0.72] origin-center">
                                                    <VisualRenderer data={{ geometry: activeGn.geometry }} isWordProblem={false} />
                                                </div>
                                            </div>
                                        )}

                                        <div className="text-[10px] font-mono text-slate-500 pt-1">
                                            {guidedNotesKeyMode
                                                ? `* ${t.gn_teacher_note}`
                                                : 'A4 • Utskriftsklar elevkopia'}
                                        </div>
                                    </div>

                                    <div className="md:col-span-7 flex flex-col justify-between gap-2.5">
                                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900/80">
                                            {t.gn_step_header}
                                        </div>

                                        <div className="space-y-2">
                                            {activeGn.steps.map((step, sIdx) => {
                                                const showTextBlank = !guidedNotesKeyMode && step.blankText;
                                                const showLatexBlank = !guidedNotesKeyMode && step.blankLatex;

                                                return (
                                                    <div
                                                        key={sIdx}
                                                        className="flex items-stretch gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs"
                                                    >
                                                        <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-950 border border-amber-300 font-mono font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                                                            {sIdx + 1}
                                                        </div>

                                                        <div className="flex-1 min-w-0 flex items-center">
                                                            {showTextBlank ? (
                                                                <div className="w-full py-1 space-y-2">
                                                                    <div className="border-b-2 border-slate-400/80 w-full h-3" />
                                                                    <div className="border-b-2 border-slate-400/80 w-4/5 h-3" />
                                                                </div>
                                                            ) : (
                                                                <div
                                                                    className={`text-xs leading-snug w-full ${
                                                                        guidedNotesKeyMode && step.blankText
                                                                            ? 'font-extrabold text-slate-950 px-2 py-1 rounded-md border-2 border-dashed border-emerald-600/80 bg-emerald-50/40'
                                                                            : 'font-semibold text-slate-800'
                                                                    }`}
                                                                >
                                                                    {guidedNotesKeyMode && step.blankText && (
                                                                        <span className="inline-block mr-1 text-emerald-700 font-mono font-black">*</span>
                                                                    )}
                                                                    <MathDisplay content={lang === 'sv' ? step.textSv : step.textEn} />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div
                                                            className={`w-36 sm:w-44 shrink-0 rounded-lg px-2.5 py-2 flex items-center justify-center ${
                                                                showLatexBlank
                                                                    ? 'border-2 border-dashed border-amber-500/80 bg-white min-h-[42px]'
                                                                    : guidedNotesKeyMode && step.blankLatex
                                                                        ? 'bg-emerald-50/40 border-2 border-dashed border-emerald-600/80'
                                                                        : 'bg-slate-50 border border-slate-200'
                                                            }`}
                                                        >
                                                            {showLatexBlank ? (
                                                                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-800/60 select-none">
                                                                    {t.gn_student_hint}
                                                                </span>
                                                            ) : (
                                                                <div className="font-serif text-xs sm:text-sm font-bold text-slate-950 text-center">
                                                                    {guidedNotesKeyMode && step.blankLatex && (
                                                                        <span className="mr-1 text-emerald-700 font-mono font-black text-[10px] align-top">*</span>
                                                                    )}
                                                                    <MathDisplay content={`$$${step.latex}$$`} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* =========================================================================
                    BAND 2: ENDLESS STUDENT PRACTICE (Fly-In + Staggered Pillars)
                    ========================================================================= */}
                <section id="endless-practice" className="py-16 sm:py-24 bg-[#f9fbf7] border-t border-slate-200 px-4 sm:px-8">
                    <div className="max-w-7xl mx-auto space-y-10">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -38 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={VIEWPORT_CONFIG}
                                transition={{ duration: 0.44, ease: FLY_EASE }}
                                className="lg:col-span-5 space-y-4"
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-200">
                                    <InfinityIcon size={15} className="text-emerald-600" />
                                    <span>{t.sp_eyebrow}</span>
                                </div>

                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                                    {t.sp_title}
                                </h2>

                                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                                    {t.sp_desc}
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 46, scale: 0.95 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={VIEWPORT_CONFIG}
                                transition={{ duration: 0.48, delay: 0.1, ease: FLY_EASE }}
                                className="lg:col-span-7"
                            >
                                <div className="bg-white rounded-2xl border border-slate-300 shadow-lg overflow-hidden">
                                    <div className="bg-slate-50 px-4 sm:px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                                            <GraduationCap size={15} className="text-emerald-600" />
                                            <span>{t.sp_try_label}</span>
                                        </span>

                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono font-extrabold">
                                                {t.sp_streak}: {streakCount}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={handleNextPracticeProblem}
                                                className="px-3 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-800 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                                            >
                                                <Shuffle size={12} className="text-emerald-600" />
                                                <span>{t.sp_next_btn}</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-5 sm:p-7 space-y-5">
                                        <div className="text-center space-y-2">
                                            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                {t.sp_prompt}
                                            </div>
                                            <div className="py-4 px-6 bg-[#f9fbf7] rounded-xl border border-slate-200 font-serif text-2xl sm:text-3xl font-bold text-slate-950 inline-block min-w-[240px]">
                                                <MathDisplay content={`$$${practiceTask.equationLatex}$$`} />
                                            </div>
                                        </div>

                                        <div className="space-y-3 max-w-md mx-auto">
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                {practiceTask.choices.map((choice) => {
                                                    const isSelected = Number(studentInput) === choice && practiceFeedback !== null;
                                                    const isCorrectChoice = choice === practiceTask.answer;
                                                    let btnStyle = 'bg-white hover:bg-emerald-50 border-slate-300 hover:border-emerald-500 text-slate-900';
                                                    if (isSelected && isCorrectChoice) {
                                                        btnStyle = 'bg-emerald-600 border-emerald-700 text-white';
                                                    } else if (isSelected && !isCorrectChoice) {
                                                        btnStyle = 'bg-rose-600 border-rose-700 text-white';
                                                    }

                                                    return (
                                                        <button
                                                            key={choice}
                                                            type="button"
                                                            onClick={() => {
                                                                setStudentInput(String(choice));
                                                                if (choice === practiceTask.answer) {
                                                                    setPracticeFeedback('correct');
                                                                    setStreakCount(s => s + 1);
                                                                } else {
                                                                    setPracticeFeedback('wrong');
                                                                    if (revealedHints === 0) setRevealedHints(1);
                                                                }
                                                            }}
                                                            className={`py-2.5 px-3 rounded-xl border-2 font-mono font-extrabold text-sm transition-all cursor-pointer ${btnStyle}`}
                                                        >
                                                            x = {choice}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <div className="flex justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setRevealedHints(h => Math.min(2, h + 1))}
                                                    disabled={revealedHints >= 2}
                                                    className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs cursor-pointer inline-flex items-center justify-center gap-1.5 disabled:opacity-40"
                                                >
                                                    <HelpCircle size={14} />
                                                    <span>{t.sp_hint_btn} ({revealedHints}/2)</span>
                                                </button>
                                            </div>
                                        </div>

                                        {practiceFeedback === 'correct' && (
                                            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex flex-wrap items-center justify-between gap-2">
                                                <span className="flex items-center gap-2">
                                                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                                    <span>{t.sp_correct_msg}</span>
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={handleNextPracticeProblem}
                                                    className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-extrabold cursor-pointer inline-flex items-center gap-1"
                                                >
                                                    <span>{t.sp_next_btn}</span>
                                                    <ArrowRight size={12} />
                                                </button>
                                            </div>
                                        )}

                                        {practiceFeedback === 'wrong' && (
                                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold flex items-center gap-2">
                                                <XCircle size={16} className="text-rose-600 shrink-0" />
                                                <span>{t.sp_wrong_msg}</span>
                                            </div>
                                        )}

                                        {revealedHints > 0 && (
                                            <div className="space-y-2 pt-2 border-t border-slate-200">
                                                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between gap-3 text-xs">
                                                    <span className="font-bold text-amber-950">
                                                        {lang === 'sv' ? 'Ledtråd 1: Samla x-termen' : 'Hint 1: Isolate the x-term'}
                                                    </span>
                                                    <span className="font-serif font-bold text-slate-900">
                                                        <MathDisplay content={`$${practiceTask.step1Latex}$`} />
                                                    </span>
                                                </div>
                                                {revealedHints >= 2 && (
                                                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between gap-3 text-xs">
                                                        <span className="font-bold text-amber-950">
                                                            {lang === 'sv' ? `Ledtråd 2: Dividera med ${practiceTask.a}` : `Hint 2: Divide by ${practiceTask.a}`}
                                                        </span>
                                                        <span className="font-serif font-bold text-slate-900">
                                                            <MathDisplay content={`$${practiceTask.step2Latex}$`} />
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                            <motion.div
                                initial={{ opacity: 0, y: 36, scale: 0.96 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={VIEWPORT_CONFIG}
                                transition={{ duration: 0.42, delay: 0, ease: FLY_EASE }}
                                className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2"
                            >
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                                    <RotateCcw size={16} />
                                </div>
                                <h3 className="text-base font-extrabold text-slate-900">{t.sp_card_1_t}</h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{t.sp_card_1_d}</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 36, scale: 0.96 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={VIEWPORT_CONFIG}
                                transition={{ duration: 0.42, delay: 0.1, ease: FLY_EASE }}
                                className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2"
                            >
                                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                                    <Sparkles size={16} />
                                </div>
                                <h3 className="text-base font-extrabold text-slate-900">{t.sp_card_2_t}</h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{t.sp_card_2_d}</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 36, scale: 0.96 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={VIEWPORT_CONFIG}
                                transition={{ duration: 0.42, delay: 0.2, ease: FLY_EASE }}
                                className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2"
                            >
                                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center">
                                    <GraduationCap size={16} />
                                </div>
                                <h3 className="text-base font-extrabold text-slate-900">{t.sp_card_3_t}</h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{t.sp_card_3_d}</p>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* =========================================================================
                    BAND 3: THREE WORKSPACES (Cascading Card Entrances)
                    ========================================================================= */}
                <section id="workspaces" className="py-16 sm:py-20 bg-white border-t border-slate-200 px-4 sm:px-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={VIEWPORT_CONFIG}
                            transition={{ duration: 0.38, ease: FLY_EASE }}
                            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5"
                        >
                            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                                {t.pillars_heading}
                            </h2>
                            <span className="text-xs font-mono font-bold text-slate-500">
                                LGR22 • Åk 7–9
                            </span>
                        </motion.div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <motion.div
                                initial={{ opacity: 0, y: 46, scale: 0.95 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={VIEWPORT_CONFIG}
                                transition={{ duration: 0.44, delay: 0, ease: FLY_EASE }}
                                className="bg-[#f9fbf7] rounded-2xl p-6 border border-slate-200 flex flex-col justify-between gap-6"
                            >
                                <div className="space-y-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center">
                                        <Layers size={18} />
                                    </div>
                                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{t.p1_title}</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">{t.p1_desc}</p>
                                </div>

                                <div className="bg-white rounded-xl border border-slate-300 shadow-2xs p-3.5 space-y-2">
                                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                                        <span className="text-[10px] font-extrabold text-slate-900">
                                            Studieplan • Algebra
                                        </span>
                                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-50 border border-amber-300 text-amber-900">
                                            KOD: BJQBUH
                                        </span>
                                    </div>
                                    <div className="space-y-1.5 text-[10.5px]">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3.5 h-3.5 rounded-[3px] border-[1.5px] border-slate-800 shrink-0" />
                                            <span className="px-1.5 py-0.2 rounded bg-sky-50 border border-sky-200 text-sky-900 text-[8.5px] font-extrabold uppercase">
                                                Genomgång
                                            </span>
                                            <span className="font-bold text-slate-800 truncate">Ekvationer med parentes</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3.5 h-3.5 rounded-[3px] border-[1.5px] border-slate-800 shrink-0" />
                                            <span className="px-1.5 py-0.2 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 font-mono text-[8.5px] font-extrabold">
                                                Nivå 2
                                            </span>
                                            <span className="font-semibold text-slate-700 truncate">Förenkla uttryck</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3.5 h-3.5 rounded-[3px] border-[1.5px] border-slate-800 shrink-0" />
                                            <span className="px-1.5 py-0.2 rounded bg-amber-50 border border-amber-200 text-amber-950 text-[8.5px] font-extrabold uppercase">
                                                Delprov
                                            </span>
                                            <span className="font-bold text-slate-800 truncate">Auto-rättning (12 frågor)</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 46, scale: 0.95 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={VIEWPORT_CONFIG}
                                transition={{ duration: 0.44, delay: 0.1, ease: FLY_EASE }}
                                className="bg-[#f9fbf7] rounded-2xl p-6 border border-slate-200 flex flex-col justify-between gap-6"
                            >
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
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 46, scale: 0.95 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={VIEWPORT_CONFIG}
                                transition={{ duration: 0.44, delay: 0.2, ease: FLY_EASE }}
                                className="bg-[#f9fbf7] rounded-2xl p-6 border border-slate-200 flex flex-col justify-between gap-6"
                            >
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
                                            <div className={`transition-opacity duration-300 ${testLabToggle ? 'opacity-100' : 'opacity-0 absolute'}`}>
                                                <div className="transform scale-[0.45] origin-center">
                                                    <VisualRenderer data={{ geometry: { type: 'cylinder', labels: { r: '7', h: '3' } } }} />
                                                </div>
                                            </div>
                                            <div className={`transition-opacity duration-300 ${!testLabToggle ? 'opacity-100' : 'opacity-0 absolute'}`}>
                                                <div className="transform scale-[0.45] origin-center">
                                                    <VisualRenderer data={{ geometry: { type: 'cylinder', labels: { r: '5', h: '8' } } }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* =========================================================================
                    BAND 4: INTERACTIVE STUDIO STAGE (Dramatic Stage Rise)
                    ========================================================================= */}
                <section id="studio-stage" className="py-20 sm:py-24 bg-[#0f172a] text-white border-t border-slate-800 px-4 sm:px-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={VIEWPORT_CONFIG}
                            transition={{ duration: 0.42, ease: FLY_EASE }}
                            className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
                        >
                            <div className="space-y-2 max-w-2xl">
                                <p className="text-xs font-bold text-emerald-400">{t.stage_eyebrow}</p>
                                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                                    {t.stage_title}
                                </h2>
                                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                                    {t.stage_desc}
                                </p>
                            </div>

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
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 52, scale: 0.96 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={VIEWPORT_CONFIG}
                            transition={{ duration: 0.5, delay: 0.1, ease: FLY_EASE }}
                        >
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
                        </motion.div>
                    </div>
                </section>

                {/* =========================================================================
                    BAND 5: REAL LIVE LESSON CLASS MATRIX (Fly-In Matrix)
                    ========================================================================= */}
                <section id="live-matrix" className="py-16 sm:py-24 bg-white border-t border-slate-200 px-4 sm:px-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: -34 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={VIEWPORT_CONFIG}
                            transition={{ duration: 0.42, ease: FLY_EASE }}
                            className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
                        >
                            <div className="space-y-3 max-w-2xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold border border-rose-200">
                                    <Signal size={14} className="text-rose-600" />
                                    <span>{t.live_badge}</span>
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                                    {t.live_title}
                                </h2>
                                <p className="text-base text-slate-600 leading-relaxed">
                                    {t.live_desc}
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.96 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={VIEWPORT_CONFIG}
                            transition={{ duration: 0.48, delay: 0.1, ease: FLY_EASE }}
                            className="bg-[#f4f6f8] rounded-2xl border border-slate-300 shadow-lg overflow-hidden"
                        >
                            <div className="bg-white px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-300 shrink-0">
                                        <div className="text-[8px] font-bold uppercase text-slate-400 leading-none">KOD</div>
                                        <div className="font-mono text-xs font-black tracking-wider text-slate-900">BJQBUH</div>
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                                            {t.live_session_title}
                                        </div>
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span>Live Lektion</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-700 inline-flex items-center gap-1.5">
                                        <Users size={13} className="text-slate-500" />
                                        <span>17</span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setShowFacit(prev => !prev)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-1.5 border ${
                                            showFacit
                                                ? 'bg-amber-500 text-white border-amber-600'
                                                : 'bg-amber-400 hover:bg-amber-500 text-slate-950 border-amber-500'
                                        }`}
                                    >
                                        <Eye size={13} />
                                        <span>FACIT</span>
                                    </button>
                                    <span className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-extrabold uppercase tracking-wider select-none">
                                        AVSLUTA
                                    </span>
                                </div>
                            </div>

                            <div className="overflow-x-auto p-3 sm:p-4">
                                <div className="min-w-[780px] space-y-2">
                                    <div className="grid grid-cols-[120px_54px_repeat(8,minmax(74px,1fr))] gap-1.5 items-center bg-white/80 px-2.5 py-2 rounded-xl border border-slate-200">
                                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
                                            {t.live_results_label}
                                        </div>
                                        <div />
                                        {LIVE_COLUMNS.map(col => (
                                            <div key={col.id} className="h-4 bg-slate-200 rounded overflow-hidden flex">
                                                <div
                                                    className="bg-emerald-500 h-full transition-all"
                                                    style={{ width: `${col.greenPct}%` }}
                                                />
                                                <div
                                                    className="bg-rose-500 h-full transition-all"
                                                    style={{ width: `${col.redPct}%` }}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-[120px_54px_repeat(8,minmax(74px,1fr))] gap-1.5 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                                        <div>{t.live_student_col}</div>
                                        <div className="text-center">{t.live_done_col}</div>
                                        {LIVE_COLUMNS.map(col => (
                                            <div key={col.id} className="text-center font-mono">
                                                {col.id}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-1.5">
                                        {liveMatrix.map(row => (
                                            <div
                                                key={row.id}
                                                className="grid grid-cols-[120px_54px_repeat(8,minmax(74px,1fr))] gap-1.5 items-center bg-white px-2.5 py-1.5 rounded-xl border border-slate-200"
                                            >
                                                <div className="text-xs font-bold text-slate-800 truncate">
                                                    {row.name}
                                                </div>
                                                <div className="text-center">
                                                    <span
                                                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-extrabold tabular-nums ${
                                                            row.klar === 100
                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                        }`}
                                                    >
                                                        {row.klar}%
                                                    </span>
                                                </div>

                                                {row.cells.map((cell, cIdx) => {
                                                    const displayVal = showFacit
                                                        ? LIVE_COLUMNS[cIdx].answer
                                                        : cell.val;

                                                    if (showFacit) {
                                                        return (
                                                            <div
                                                                key={cIdx}
                                                                className="h-7 rounded-md bg-amber-50 border border-amber-300 text-amber-950 font-mono text-[11px] font-extrabold flex items-center justify-center px-1 truncate"
                                                            >
                                                                {displayVal}
                                                            </div>
                                                        );
                                                    }

                                                    if (cell.status === 'correct') {
                                                        return (
                                                            <div
                                                                key={cIdx}
                                                                className="h-7 rounded-md bg-emerald-500 text-white font-mono text-[11px] font-bold flex items-center justify-center px-1 truncate shadow-2xs"
                                                            >
                                                                {displayVal}
                                                            </div>
                                                        );
                                                    }

                                                    if (cell.status === 'wrong') {
                                                        return (
                                                            <div
                                                                key={cIdx}
                                                                className="h-7 rounded-md bg-rose-500 text-white font-mono text-[11px] font-bold flex items-center justify-center px-1 truncate shadow-2xs"
                                                            >
                                                                {displayVal}
                                                            </div>
                                                        );
                                                    }

                                                    if (cell.status === 'help') {
                                                        return (
                                                            <div
                                                                key={cIdx}
                                                                className="h-7 rounded-md bg-sky-500 text-white font-mono text-[10px] font-extrabold uppercase flex items-center justify-center px-1 truncate shadow-2xs"
                                                            >
                                                                {displayVal}
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <div
                                                            key={cIdx}
                                                            className="h-7 rounded-md bg-slate-200/80 border border-slate-200"
                                                        />
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* =========================================================================
                    FOOTER & TEACHER CTA
                    ========================================================================= */}
                <footer id="landing-footer" className="bg-[#f9fbf7] border-t border-slate-200 py-14 px-4 sm:px-8 text-slate-900">
                    <motion.div
                        initial={{ opacity: 0, y: 32, scale: 0.97 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={VIEWPORT_CONFIG}
                        transition={{ duration: 0.42, ease: FLY_EASE }}
                        className="max-w-7xl mx-auto flex flex-col gap-10"
                    >
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
                    </motion.div>
                </footer>
            </div>
        </MotionConfig>
    );
}