// src/components/modals/TestLabTutorialModal.jsx
import React, { useState } from 'react';
import { 
    X, ChevronRight, ChevronLeft, Beaker, Sparkles, 
    Play, Info, Share2, Award, Zap, Sliders, CheckCircle2, Lock, KeyRound
} from 'lucide-react';

export default function TestLabTutorialModal({ isOpen, onClose, lang = 'sv', userRole = 'teacher' }) {
    const [step, setStep] = useState(0);

    if (!isOpen) return null;

    const isTeacher = ['teacher', 'super_admin'].includes(userRole);

    const contentData = {
        student: {
            sv: [
                {
                    title: "Välkommen till Testlabbet!",
                    subtitle: "Skapa egna prov och träna på exakt de områden du behöver.",
                    icon: <Beaker size={36} className="text-indigo-600" />,
                    badge: "Steg 1 av 3: Välj & Mixa",
                    body: (
                        <div className="space-y-6">
                            <p className="text-lg sm:text-xl text-slate-800 leading-relaxed font-medium">
                                I Testlabbet sätter du ihop dina egna anpassade tester. Du kan blanda olika områden och välja precis vilka svårighetsnivåer du vill träna på.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="p-6 bg-indigo-50/80 border-2 border-indigo-200 rounded-3xl">
                                    <h4 className="text-lg font-black uppercase text-indigo-950 mb-2">
                                        Mixa områden & nivåer
                                    </h4>
                                    <p className="text-sm sm:text-base text-indigo-900 font-medium leading-relaxed">
                                        Klicka på kategorierna och välj vilka delmoment som ska ingå. Klicka på nivå-bubblorna (1–10) på varje kort för att bestämma svårighetsgraden.
                                    </p>
                                </div>

                                <div className="p-6 bg-emerald-50/80 border-2 border-emerald-200 rounded-3xl">
                                    <h4 className="text-lg font-black uppercase text-emerald-950 mb-2">
                                        Välj testlängd
                                    </h4>
                                    <p className="text-sm sm:text-base text-emerald-900 font-medium leading-relaxed">
                                        Välj ett fast antal frågor (från 5 upp till 50), eller välj <strong>∞ (Obegränsat pass)</strong> för att räkna så länge du vill med pauser och delrapporter var 15:e fråga.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Öva, Provläge & Coach",
                    subtitle: "Välj hur du vill ha feedback under testets gång.",
                    icon: <Sliders size={36} className="text-emerald-600" />,
                    badge: "Steg 2 av 3: Inställningar",
                    body: (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="p-5 bg-white rounded-3xl border-2 border-slate-200 shadow-xs">
                                    <span className="text-xs font-black uppercase tracking-wider text-indigo-600 block mb-1">
                                        Öva vs. Provläge
                                    </span>
                                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                        I <strong>Öva</strong> får du direkt veta om ditt svar var rätt eller fel. I <strong>Provläge</strong> döljs resultaten tills du lämnar in hela testet.
                                    </p>
                                </div>

                                <div className="p-5 bg-white rounded-3xl border-2 border-slate-200 shadow-xs">
                                    <span className="text-xs font-black uppercase tracking-wider text-amber-600 block mb-1">
                                        Problemlösning
                                    </span>
                                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                        Om du väljer områden som har textuppgifter tänds knappen <strong>"Problemlösning"</strong>. Då omvandlas talen till vardagsnära berättelser.
                                    </p>
                                </div>
                            </div>

                            <div className="p-5 bg-purple-50 border-2 border-purple-200 rounded-3xl flex items-start gap-4">
                                <span className="text-3xl shrink-0">💡</span>
                                <div>
                                    <strong className="text-purple-950 text-base block mb-0.5">Behöver du hjälp under testet?</strong>
                                    <p className="text-sm text-purple-900 leading-relaxed font-medium">
                                        Om testet tillåter det finns en <strong>"Hjälp!"</strong>-knapp på varje fråga. Klicka på den för att öppna den animerade whiteboard-coachen som visar hur du löser uppgiften steg för steg.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Resultatrapport & Genomgång",
                    subtitle: "Se vad du klarade och granska fullständiga lösningar.",
                    icon: <Award size={36} className="text-amber-500" />,
                    badge: "Steg 3 av 3: Resultat",
                    body: (
                        <div className="space-y-6">
                            <p className="text-lg sm:text-xl text-slate-800 leading-relaxed font-medium">
                                När testet är klart får du en komplett diagnos som visar din träffsäkerhet per kategori.
                            </p>

                            <div className="p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl space-y-4">
                                <h4 className="text-base font-black uppercase text-slate-900 tracking-tight">
                                    Vad du ser på resultatskärmen:
                                </h4>
                                <ul className="space-y-3 text-sm sm:text-base text-slate-700 font-medium">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                                        <span><strong>Procentuell översikt:</strong> Se hur många procent rätt du hade i varje matematikkategori.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                                        <span><strong>Detaljerad genomgång:</strong> Alla uppgifter visas sida vid sida med ditt svar och det korrekta svaret.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Zap size={20} className="text-amber-500 shrink-0 mt-0.5" />
                                        <span><strong>Visa lösning:</strong> Klicka på knappen "Visa lösning" på valfri uppgift för att fälla ut hela den matematiska uträkningen steg för steg.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )
                }
            ],
            en: [
                {
                    title: "Welcome to the Test Lab!",
                    subtitle: "Build custom practice tests and master the exact topics you need.",
                    icon: <Beaker size={36} className="text-indigo-600" />,
                    badge: "Step 1 of 3: Select & Mix",
                    body: (
                        <div className="space-y-6">
                            <p className="text-lg sm:text-xl text-slate-800 leading-relaxed font-medium">
                                In the Test Lab, you can customize your own practice assessments. Mix and match different modules and choose the exact difficulty levels you want to tackle.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="p-6 bg-indigo-50/80 border-2 border-indigo-200 rounded-3xl">
                                    <h4 className="text-lg font-black uppercase text-indigo-950 mb-2">
                                        Mix topics & levels
                                    </h4>
                                    <p className="text-sm sm:text-base text-indigo-900 font-medium leading-relaxed">
                                        Click categories across the top and toggle topics on each card. Click individual level bubbles (1–10) to customize question difficulty.
                                    </p>
                                </div>

                                <div className="p-6 bg-emerald-50/80 border-2 border-emerald-200 rounded-3xl">
                                    <h4 className="text-lg font-black uppercase text-emerald-950 mb-2">
                                        Set test length
                                    </h4>
                                    <p className="text-sm sm:text-base text-emerald-900 font-medium leading-relaxed">
                                        Choose a fixed question count (from 5 to 50), or select <strong>∞ (Infinite session)</strong> to keep practicing with break milestones every 15 questions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Practice vs. Exam Mode & Coach",
                    subtitle: "Choose how feedback and walkthroughs are delivered during your test.",
                    icon: <Sliders size={36} className="text-emerald-600" />,
                    badge: "Step 2 of 3: Modes & Support",
                    body: (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="p-5 bg-white rounded-3xl border-2 border-slate-200 shadow-xs">
                                    <span className="text-xs font-black uppercase tracking-wider text-indigo-600 block mb-1">
                                        Practice vs. Exam Mode
                                    </span>
                                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                        In <strong>Practice Mode</strong>, you receive immediate feedback after each answer. In <strong>Exam Mode</strong>, all results are hidden until the final report.
                                    </p>
                                </div>

                                <div className="p-5 bg-white rounded-3xl border-2 border-slate-200 shadow-xs">
                                    <span className="text-xs font-black uppercase tracking-wider text-amber-600 block mb-1">
                                        Word Problems
                                    </span>
                                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                        When eligible topics are selected, the <strong>"Word Problems"</strong> toggle activates, transforming standard equations into story-based challenges.
                                    </p>
                                </div>
                            </div>

                            <div className="p-5 bg-purple-50 border-2 border-purple-200 rounded-3xl flex items-start gap-4">
                                <span className="text-3xl shrink-0">💡</span>
                                <div>
                                    <strong className="text-purple-950 text-base block mb-0.5">Need help during the test?</strong>
                                    <p className="text-sm text-purple-900 leading-relaxed font-medium">
                                        If enabled for your test, a <strong>"Help!"</strong> button appears on questions. Click it to open the animated whiteboard coach for a step-by-step walkthrough.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Test Report & Full Review",
                    subtitle: "Analyze performance metrics and inspect complete worked solutions.",
                    icon: <Award size={36} className="text-amber-500" />,
                    badge: "Step 3 of 3: Results",
                    body: (
                        <div className="space-y-6">
                            <p className="text-lg sm:text-xl text-slate-800 leading-relaxed font-medium">
                                Upon finishing your test, a diagnostic report breaks down your accuracy across all tested categories.
                            </p>

                            <div className="p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl space-y-4">
                                <h4 className="text-base font-black uppercase text-slate-900 tracking-tight">
                                    What is shown on your results screen:
                                </h4>
                                <ul className="space-y-3 text-sm sm:text-base text-slate-700 font-medium">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                                        <span><strong>Category scores:</strong> See percentage accuracy bars for each math domain.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                                        <span><strong>Side-by-side comparison:</strong> Review every question alongside your submitted answer and the correct solution.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Zap size={20} className="text-amber-500 shrink-0 mt-0.5" />
                                        <span><strong>Step-by-step breakdown:</strong> Click "Show Solution" on any problem to reveal the complete mathematical deduction steps.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )
                }
            ]
        },
        teacher: {
            sv: [
                {
                    title: "Testlabbet: Skapa differentierade prov",
                    subtitle: "Mixa och matcha ämnen, nivåer och frågemängder för din klass.",
                    icon: <Beaker size={36} className="text-indigo-600" />,
                    badge: "Steg 1 av 4: Konfiguration",
                    body: (
                        <div className="space-y-6">
                            <p className="text-lg sm:text-xl text-slate-800 leading-relaxed font-medium">
                                I Testlabbet bygger du unika digitala diagnoser och övningsprov. Du kan använda färdiga nationella prov-snabbval (t.ex. NP-GEO) eller handplocka exakta nivåer.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="p-6 bg-indigo-50/80 border-2 border-indigo-200 rounded-3xl">
                                    <h4 className="text-lg font-black uppercase text-indigo-950 mb-2">
                                        Handplocka nivåer
                                    </h4>
                                    <p className="text-sm sm:text-base text-indigo-900 font-medium leading-relaxed">
                                        Klicka på valfri kategori och markera specifika nivåer (1–10) per delmoment. På så sätt kan du enkelt differentiera svårighetsgraden för olika elevgrupper.
                                    </p>
                                </div>

                                <div className="p-6 bg-emerald-50/80 border-2 border-emerald-200 rounded-3xl">
                                    <h4 className="text-lg font-black uppercase text-emerald-950 mb-2">
                                        Anpassa provlängd
                                    </h4>
                                    <p className="text-sm sm:text-base text-emerald-900 font-medium leading-relaxed">
                                        Välj ett bestämt antal frågor (5, 10, 20, 50) eller välj <strong>∞ (Obegränsat pass)</strong> för kontinuerlig träning med automatiska etappkontroller var 15:e fråga.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Provläge, Textuppgifter & Coach",
                    subtitle: "Styr feedback, kontextualisering och steg-för-steg-stöd.",
                    icon: <Sliders size={36} className="text-emerald-600" />,
                    badge: "Steg 2 av 4: Inställningar",
                    body: (
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-5 bg-white border-2 border-slate-200 rounded-2xl shadow-xs">
                                    <span className="text-xs font-black uppercase text-rose-600 block mb-1">
                                        Provläge vs. Öva
                                    </span>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                                        I <strong>Provläge</strong> döljs alla rättningar tills testet lämnas in. I <strong>Öva</strong> får eleven direkt feedback.
                                    </p>
                                </div>

                                <div className="p-5 bg-white border-2 border-slate-200 rounded-2xl shadow-xs">
                                    <span className="text-xs font-black uppercase text-emerald-600 block mb-1">
                                        Problemlösning
                                    </span>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                                        När valda områden stöder det aktiveras <strong>"Problemlösning"</strong> som förvandlar ekvationer till ungdomsanpassade berättelser.
                                    </p>
                                </div>

                                <div className="p-5 bg-white border-2 border-slate-200 rounded-2xl shadow-xs">
                                    <span className="text-xs font-black uppercase text-indigo-600 block mb-1">
                                        Ledtrådar / Coach
                                    </span>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                                        Aktivera <strong>Coach</strong> för att tillåta en "Hjälp!"-knapp under testet som visar animerade lösningar steg för steg.
                                    </p>
                                </div>
                            </div>

                            <div className="p-5 bg-indigo-50 border-2 border-indigo-200 rounded-3xl text-sm sm:text-base text-indigo-950 font-semibold flex items-center gap-4">
                                <span className="text-3xl shrink-0">✨</span>
                                <span className="leading-relaxed">Alla inställningar du gör (inklusive valda områden, nivåer och lägen) bakas automatiskt in i din unika testkod och delningslänk!</span>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Dela testlänk med elever",
                    subtitle: "Så här når dina elever testet utan krångel.",
                    icon: <Share2 size={36} className="text-rose-500" />,
                    badge: "Steg 3 av 4: Delning & Åtkomst",
                    body: (
                        <div className="space-y-6">
                            {/* 🚨 CRITICAL LINK ACCESS & CLASS CODE NOTICE */}
                            <div className="p-6 bg-rose-50 border-2 border-rose-300 rounded-3xl flex items-start gap-4 shadow-sm">
                                <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                                    <KeyRound size={26} strokeWidth={2.5} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-base sm:text-lg font-black uppercase text-rose-950 tracking-tight">
                                        VIKTIGT: Hur eleverna får tillgång till testet
                                    </h4>
                                    <p className="text-sm sm:text-base text-rose-900 leading-relaxed font-semibold">
                                        För att eleverna ska få obegränsad tillgång till ditt slumpade test räcker det <strong>inte bara att klicka på länken</strong>. Eleverna måste:
                                    </p>
                                    <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm text-rose-950 font-bold">
                                        <li>Klicka på din delade testlänk (t.ex. via Teams, Google Classroom eller mail).</li>
                                        <li>På startsidan måste de ange din <strong>giltiga klasskod</strong> i rutan för <em>"Egen träning"</em>.</li>
                                        <li>Därefter låses det skräddarsydda provet upp med obegränsade slumpade tal!</li>
                                    </ol>
                                </div>
                            </div>

                            <div className="p-5 bg-slate-50 border-2 border-slate-200 rounded-3xl space-y-3">
                                <h4 className="text-base font-black uppercase text-slate-900 tracking-tight">
                                    Kopiera länken:
                                </h4>
                                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                    Klicka på <strong>"Kopiera länk"</strong> i vänsterpanelen. Länken innehåller hela din provkonfiguration och är redo att klistras in i ditt klassrumssystem.
                                </p>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Resultatrapport & Lösningssteg",
                    subtitle: "Följ upp elevernas resultat med fullständig analys.",
                    icon: <Award size={36} className="text-amber-500" />,
                    badge: "Steg 4 av 4: Diagnostik",
                    body: (
                        <div className="space-y-6">
                            <p className="text-lg sm:text-xl text-slate-800 leading-relaxed font-medium">
                                När testet slutförs genereras en överskådlig diagnosrapport med detaljerade resultat per kategori.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="p-5 bg-white border-2 border-slate-200 rounded-3xl shadow-xs">
                                    <h4 className="text-base font-black text-slate-900 uppercase mb-1">
                                        Kategoridiagnos
                                    </h4>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                                        Färgkodade staplar visar träffsäkerheten inom respektive område så att du omedelbart ser vilka delar som behöver repeteras.
                                    </p>
                                </div>

                                <div className="p-5 bg-white border-2 border-slate-200 rounded-3xl shadow-xs">
                                    <h4 className="text-base font-black text-slate-900 uppercase mb-1">
                                        Steg-för-steg facit
                                    </h4>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                                        Under "Detaljerad genomgång" kan eleven fälla ut kompletta matematiska uträkningssteg för varje enskild uppgift.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                }
            ],
            en: [
                {
                    title: "Test Lab: Differentiated Assessments",
                    subtitle: "Mix and match modules, levels, and question volumes for your class.",
                    icon: <Beaker size={36} className="text-indigo-600" />,
                    badge: "Step 1 of 4: Configuration",
                    body: (
                        <div className="space-y-6">
                            <p className="text-lg sm:text-xl text-slate-800 leading-relaxed font-medium">
                                In the Test Lab, you can construct custom digital quizzes and practice exams. Choose pre-built national test presets (e.g. NP-GEO) or hand-pick specific levels.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="p-6 bg-indigo-50/80 border-2 border-indigo-200 rounded-3xl">
                                    <h4 className="text-lg font-black uppercase text-indigo-950 mb-2">
                                        Hand-pick levels
                                    </h4>
                                    <p className="text-sm sm:text-base text-indigo-900 font-medium leading-relaxed">
                                        Click into any category and select specific level bubbles (1–10). This makes it easy to differentiate content for diverse student groups.
                                    </p>
                                </div>

                                <div className="p-6 bg-emerald-50/80 border-2 border-emerald-200 rounded-3xl">
                                    <h4 className="text-lg font-black uppercase text-emerald-950 mb-2">
                                        Configure length
                                    </h4>
                                    <p className="text-sm sm:text-base text-emerald-900 font-medium leading-relaxed">
                                        Set a specific question count (5, 10, 20, 50) or select <strong>∞ (Infinite session)</strong> for open-ended practice with progress checks every 15 problems.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Exam Mode, Word Problems & Coach",
                    subtitle: "Control feedback timing, context, and step-by-step guidance.",
                    icon: <Sliders size={36} className="text-emerald-600" />,
                    badge: "Step 2 of 4: Settings",
                    body: (
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-5 bg-white border-2 border-slate-200 rounded-2xl shadow-xs">
                                    <span className="text-xs font-black uppercase text-rose-600 block mb-1">
                                        Exam vs. Practice
                                    </span>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                                        In <strong>Exam Mode</strong>, grading is hidden until submission. In <strong>Practice Mode</strong>, students receive instant feedback.
                                    </p>
                                </div>

                                <div className="p-5 bg-white border-2 border-slate-200 rounded-2xl shadow-xs">
                                    <span className="text-xs font-black uppercase text-emerald-600 block mb-1">
                                        Word Problems
                                    </span>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                                        When eligible topics are active, the <strong>"Word Problems"</strong> toggle converts pure math into relatable narrative problems.
                                    </p>
                                </div>

                                <div className="p-5 bg-white border-2 border-slate-200 rounded-2xl shadow-xs">
                                    <span className="text-xs font-black uppercase text-indigo-600 block mb-1">
                                        Clues / Coach
                                    </span>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                                        Enable <strong>Coach</strong> to grant a "Help!" button that provides step-by-step animated solution breakdowns.
                                    </p>
                                </div>
                            </div>

                            <div className="p-5 bg-indigo-50 border-2 border-indigo-200 rounded-3xl text-sm sm:text-base text-indigo-950 font-semibold flex items-center gap-4">
                                <span className="text-3xl shrink-0">✨</span>
                                <span className="leading-relaxed">All your choices (including selected topics, levels, and modes) are automatically encoded into your shareable link!</span>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Sharing Test Links with Students",
                    subtitle: "How students access your custom test with your class code.",
                    icon: <Share2 size={36} className="text-rose-500" />,
                    badge: "Step 3 of 4: Sharing & Access",
                    body: (
                        <div className="space-y-6">
                            {/* 🚨 CRITICAL LINK ACCESS & CLASS CODE NOTICE */}
                            <div className="p-6 bg-rose-50 border-2 border-rose-300 rounded-3xl flex items-start gap-4 shadow-sm">
                                <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                                    <KeyRound size={26} strokeWidth={2.5} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-base sm:text-lg font-black uppercase text-rose-950 tracking-tight">
                                        CRITICAL: How Students Access the Test
                                    </h4>
                                    <p className="text-sm sm:text-base text-rose-900 leading-relaxed font-semibold">
                                        To gain full access to your custom randomized test, students <strong>cannot simply click the link alone</strong>. They must:
                                    </p>
                                    <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm text-rose-950 font-bold">
                                        <li>Click your shared test link (via Teams, Google Classroom, email, etc.).</li>
                                        <li>On the landing page, enter your <strong>valid class code</strong> in the <em>"Egen träning"</em> (Self-Practice) box.</li>
                                        <li>The custom assessment will instantly unlock with unlimited randomized questions!</li>
                                    </ol>
                                </div>
                            </div>

                            <div className="p-5 bg-slate-50 border-2 border-slate-200 rounded-3xl space-y-3">
                                <h4 className="text-base font-black uppercase text-slate-900 tracking-tight">
                                    Copying the link:
                                </h4>
                                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                    Click <strong>"Copy Link"</strong> in the sidebar. The URL contains your full assessment preset and is ready to share.
                                </p>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Test Report & Solution Guides",
                    subtitle: "Review class accuracy and explore worked solutions.",
                    icon: <Award size={36} className="text-amber-500" />,
                    badge: "Step 4 of 4: Analytics",
                    body: (
                        <div className="space-y-6">
                            <p className="text-lg sm:text-xl text-slate-800 leading-relaxed font-medium">
                                Once finished, students receive a full diagnostic report displaying accuracy across every category.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="p-5 bg-white border-2 border-slate-200 rounded-3xl shadow-xs">
                                    <h4 className="text-base font-black text-slate-900 uppercase mb-1">
                                        Category breakdown
                                    </h4>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                                        Visual percentage bars highlight accuracy per domain, revealing areas needing extra practice.
                                    </p>
                                </div>

                                <div className="p-5 bg-white border-2 border-slate-200 rounded-3xl shadow-xs">
                                    <h4 className="text-base font-black text-slate-900 uppercase mb-1">
                                        Step-by-step solutions
                                    </h4>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                                        Under the detailed review section, students can click "Show Solution" on any question to view the full mathematical breakdown.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                }
            ]
        }
    };

    const roleKey = isTeacher ? 'teacher' : 'student';
    const currentLangSteps = contentData[roleKey][lang] || contentData[roleKey].sv;
    const current = currentLangSteps[step];

    return (
        <div className="fixed inset-0 z-[500] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] shadow-2xl border-2 border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-8 sm:px-10 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
                            {current.icon}
                        </div>
                        <div>
                            <span className="text-sm sm:text-base font-black uppercase tracking-widest text-indigo-600 block mb-0.5">
                                {current.badge}
                            </span>
                            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                                {current.title}
                            </h3>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2.5 text-slate-400 hover:text-slate-800 rounded-2xl hover:bg-slate-200/60 transition-colors cursor-pointer"
                        title={lang === 'sv' ? "Stäng" : "Close"}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Subtitle Bar */}
                <div className="px-8 sm:px-10 py-4 bg-indigo-50/60 border-b border-indigo-100/60">
                    <p className="text-base font-extrabold text-indigo-950 uppercase tracking-wide">
                        {current.subtitle}
                    </p>
                </div>

                {/* Body Content */}
                <div className="p-8 sm:p-10 overflow-y-auto max-h-[60vh] custom-scrollbar">
                    {current.body}
                </div>

                {/* Footer Navigation */}
                <div className="px-8 sm:px-10 py-6 border-t border-slate-100 bg-slate-50/90 flex items-center justify-between">
                    <button
                        onClick={() => setStep(s => Math.max(0, s - 1))}
                        disabled={step === 0}
                        className="px-6 py-3 text-sm sm:text-base font-black uppercase tracking-wider text-slate-500 hover:text-slate-900 disabled:opacity-0 transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <ChevronLeft size={22} /> {lang === 'sv' ? "Föregående" : "Back"}
                    </button>

                    {/* Step Dots */}
                    <div className="flex gap-2.5 items-center">
                        {currentLangSteps.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setStep(i)}
                                className={`h-3 rounded-full transition-all cursor-pointer ${
                                    step === i 
                                        ? 'bg-indigo-600 w-10' 
                                        : 'bg-slate-300 hover:bg-slate-400 w-3'
                                }`}
                                title={`Steg ${i + 1}`}
                            />
                        ))}
                    </div>

                    {step < currentLangSteps.length - 1 ? (
                        <button
                            onClick={() => setStep(s => Math.min(currentLangSteps.length - 1, s + 1))}
                            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm sm:text-base font-black uppercase tracking-wider flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
                        >
                            {lang === 'sv' ? "Nästa steg" : "Next step"} <ChevronRight size={22} />
                        </button>
                    ) : (
                        <button
                            onClick={onClose}
                            className="px-9 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm sm:text-base font-black uppercase tracking-wider shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
                        >
                            {lang === 'sv' ? "Kom igång nu!" : "Get started!"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}