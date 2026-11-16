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
                    icon: <Beaker size={28} className="text-emerald-600 dark:text-emerald-400" />,
                    badge: "Steg 1 av 3: Välj & Mixa",
                    body: (
                        <div className="space-y-5">
                            <p className="text-sm sm:text-base text-[var(--text-main)] leading-relaxed font-medium">
                                I Testlabbet sätter du ihop dina egna anpassade tester. Du kan blanda olika områden och välja precis vilka svårighetsnivåer du vill träna på.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-5 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl shadow-2xs">
                                    <h4 className="text-xs font-bold uppercase text-[var(--text-main)] mb-1.5 tracking-wider">
                                        Mixa områden & nivåer
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                                        Klicka på kategorierna och välj vilka delmoment som ska ingå. Klicka på nivå-bubblorna på varje kort för att bestämma svårighetsgraden.
                                    </p>
                                </div>

                                <div className="p-5 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl shadow-2xs">
                                    <h4 className="text-xs font-bold uppercase text-[var(--text-main)] mb-1.5 tracking-wider">
                                        Välj testlängd
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                                        Välj ett fast antal frågor (från 5 upp till 50), eller välj <strong>∞ (Obegränsat pass)</strong> för att räkna så länge du vill med pauser.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Öva, Provläge & Coach",
                    subtitle: "Välj hur du vill ha feedback under testets gång.",
                    icon: <Sliders size={28} className="text-emerald-600 dark:text-emerald-400" />,
                    badge: "Steg 2 av 3: Inställningar",
                    body: (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-strong)] shadow-2xs">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
                                        Öva vs. Provläge
                                    </span>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                        I <strong>Öva</strong> får du direkt veta om ditt svar var rätt eller fel. I <strong>Provläge</strong> döljs resultaten tills du lämnar in hela testet.
                                    </p>
                                </div>

                                <div className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-strong)] shadow-2xs">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
                                        Problemlösning
                                    </span>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                        Om du väljer områden med textuppgifter omvandlas talen till vardagsnära berättelser.
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-3">
                                <span className="text-xl shrink-0">💡</span>
                                <div className="text-xs">
                                    <strong className="text-emerald-900 dark:text-emerald-200 font-bold block mb-0.5">Behöver du hjälp under testet?</strong>
                                    <p className="text-emerald-800 dark:text-emerald-300 leading-relaxed font-medium">
                                        Klicka på <strong>"Hjälp!"</strong> på en fråga för att öppna den animerade whiteboard-coachen som visar hur du löser uppgiften steg för steg.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Resultatrapport & Genomgång",
                    subtitle: "Se vad du klarade och granska fullständiga lösningar.",
                    icon: <Award size={28} className="text-amber-500" />,
                    badge: "Steg 3 av 3: Resultat",
                    body: (
                        <div className="space-y-4">
                            <p className="text-xs sm:text-sm text-[var(--text-main)] leading-relaxed font-medium">
                                När testet är klart får du en komplett diagnos som visar din träffsäkerhet per kategori.
                            </p>

                            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl space-y-2.5 shadow-2xs">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                                    Vad du ser på resultatskärmen:
                                </h4>
                                <ul className="space-y-2 text-xs text-[var(--text-muted)] font-medium">
                                    <li className="flex items-start gap-2.5">
                                        <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                        <span><strong>Procentuell översikt:</strong> Se hur många procent rätt du hade i varje kategori.</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                        <span><strong>Detaljerad genomgång:</strong> Alla uppgifter visas med ditt svar och rätt svar.</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <Zap size={15} className="text-amber-500 shrink-0 mt-0.5" />
                                        <span><strong>Visa lösning:</strong> Fäll ut hela den matematiska uträkningen steg för steg.</span>
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
                    icon: <Beaker size={28} className="text-emerald-600 dark:text-emerald-400" />,
                    badge: "Step 1 of 3: Select & Mix",
                    body: (
                        <div className="space-y-5">
                            <p className="text-sm sm:text-base text-[var(--text-main)] leading-relaxed font-medium">
                                In the Test Lab, you can customize your own practice assessments. Mix and match modules and choose the exact difficulty levels you want to tackle.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-5 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl shadow-2xs">
                                    <h4 className="text-xs font-bold uppercase text-[var(--text-main)] mb-1.5 tracking-wider">
                                        Mix topics & levels
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                                        Click categories and toggle topics on each card. Click individual level bubbles to customize question difficulty.
                                    </p>
                                </div>

                                <div className="p-5 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl shadow-2xs">
                                    <h4 className="text-xs font-bold uppercase text-[var(--text-main)] mb-1.5 tracking-wider">
                                        Set test length
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                                        Choose a fixed question count (5 to 50), or select <strong>∞ (Infinite session)</strong> to keep practicing with break milestones.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Practice vs. Exam Mode & Coach",
                    subtitle: "Choose how feedback and walkthroughs are delivered during your test.",
                    icon: <Sliders size={28} className="text-emerald-600 dark:text-emerald-400" />,
                    badge: "Step 2 of 3: Modes & Support",
                    body: (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-strong)] shadow-2xs">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
                                        Practice vs. Exam Mode
                                    </span>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                        In <strong>Practice Mode</strong>, you receive immediate feedback. In <strong>Exam Mode</strong>, results are hidden until submission.
                                    </p>
                                </div>

                                <div className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-strong)] shadow-2xs">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
                                        Word Problems
                                    </span>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                        Transforms standard equations into story-based challenges when enabled.
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-3">
                                <span className="text-xl shrink-0">💡</span>
                                <div className="text-xs">
                                    <strong className="text-emerald-900 dark:text-emerald-200 font-bold block mb-0.5">Need help during the test?</strong>
                                    <p className="text-emerald-800 dark:text-emerald-300 leading-relaxed font-medium">
                                        Click the <strong>"Help!"</strong> button on questions to open the animated whiteboard coach for a step-by-step walkthrough.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Test Report & Full Review",
                    subtitle: "Analyze performance metrics and inspect complete worked solutions.",
                    icon: <Award size={28} className="text-amber-500" />,
                    badge: "Step 3 of 3: Results",
                    body: (
                        <div className="space-y-4">
                            <p className="text-xs sm:text-sm text-[var(--text-main)] leading-relaxed font-medium">
                                Upon finishing your test, a diagnostic report breaks down your accuracy across all tested categories.
                            </p>

                            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl space-y-2.5 shadow-2xs">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                                    What is shown on your results screen:
                                </h4>
                                <ul className="space-y-2 text-xs text-[var(--text-muted)] font-medium">
                                    <li className="flex items-start gap-2.5">
                                        <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                        <span><strong>Category scores:</strong> See percentage accuracy bars for each math domain.</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                        <span><strong>Side-by-side comparison:</strong> Review every question alongside your answer.</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <Zap size={15} className="text-amber-500 shrink-0 mt-0.5" />
                                        <span><strong>Step-by-step breakdown:</strong> Click "Show Solution" to reveal complete calculations.</span>
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
                    icon: <Beaker size={28} className="text-emerald-600 dark:text-emerald-400" />,
                    badge: "Steg 1 av 4: Konfiguration",
                    body: (
                        <div className="space-y-5">
                            <p className="text-sm sm:text-base text-[var(--text-main)] leading-relaxed font-medium">
                                I Testlabbet bygger du unika digitala diagnoser och övningsprov. Du kan använda färdiga prov-snabbval eller handplocka exakta nivåer.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-5 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl shadow-2xs">
                                    <h4 className="text-xs font-bold uppercase text-[var(--text-main)] mb-1.5 tracking-wider">
                                        Handplocka nivåer
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                                        Klicka på valfri kategori och markera specifika nivåer per delmoment för att enkelt differentiera svårighetsgraden.
                                    </p>
                                </div>

                                <div className="p-5 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl shadow-2xs">
                                    <h4 className="text-xs font-bold uppercase text-[var(--text-main)] mb-1.5 tracking-wider">
                                        Anpassa provlängd
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                                        Välj ett bestämt antal frågor eller välj <strong>∞ (Obegränsat pass)</strong> för kontinuerlig träning med automatiska etappkontroller.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Provläge, Textuppgifter & Coach",
                    subtitle: "Styr feedback, kontextualisering och steg-för-steg-stöd.",
                    icon: <Sliders size={28} className="text-emerald-600 dark:text-emerald-400" />,
                    badge: "Steg 2 av 4: Inställningar",
                    body: (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl shadow-2xs">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-1">
                                        Provläge vs. Öva
                                    </span>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                        I <strong>Provläge</strong> döljs alla rättningar tills testet lämnas in. I <strong>Öva</strong> får eleven direkt feedback.
                                    </p>
                                </div>

                                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl shadow-2xs">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
                                        Problemlösning
                                    </span>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                        Förvandlar standardekvationer till ungdomsanpassade berättelser.
                                    </p>
                                </div>

                                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl shadow-2xs">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                                        Ledtrådar / Coach
                                    </span>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                        Tillåt en "Hjälp!"-knapp under testet som visar animerade lösningar steg för steg.
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-3">
                                <span className="text-lg shrink-0">✨</span>
                                <span className="leading-relaxed">Alla inställningar bakas automatiskt in i din unika testkod och delningslänk!</span>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Dela testlänk med elever",
                    subtitle: "Så här når dina elever testet utan krångel.",
                    icon: <Share2 size={28} className="text-rose-500" />,
                    badge: "Steg 3 av 4: Delning & Åtkomst",
                    body: (
                        <div className="space-y-4">
                            <div className="p-5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-3 shadow-2xs">
                                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                                    <KeyRound size={20} strokeWidth={2.5} />
                                </div>
                                <div className="space-y-1.5">
                                    <h4 className="text-xs font-extrabold uppercase text-rose-950 dark:text-rose-200 tracking-wider">
                                        VIKTIGT: Hur eleverna får tillgång till testet
                                    </h4>
                                    <p className="text-xs text-rose-900 dark:text-rose-300 leading-relaxed font-medium">
                                        För att eleverna ska få obegränsad tillgång till ditt slumpade test räcker det inte bara att klicka på länken. Eleverna måste:
                                    </p>
                                    <ol className="list-decimal pl-4 space-y-1 text-xs text-rose-950 dark:text-rose-100 font-bold">
                                        <li>Klicka på din delade testlänk.</li>
                                        <li>Ange din <strong>giltiga klasskod</strong> i rutan för <em>"Egen träning"</em> på startsidan.</li>
                                        <li>Därefter låses det skräddarsydda provet upp med obegränsade slumpade tal!</li>
                                    </ol>
                                </div>
                            </div>

                            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl space-y-1.5 shadow-2xs">
                                <h4 className="text-xs font-bold uppercase text-[var(--text-main)] tracking-wider">
                                    Kopiera länken:
                                </h4>
                                <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                    Klicka på <strong>"Kopiera länk"</strong> i vänsterpanelen. Länken innehåller hela din provkonfiguration och är redo att klistras in i ert lärplattformssystem.
                                </p>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Resultatrapport & Lösningssteg",
                    subtitle: "Följ upp elevernas resultat med fullständig analys.",
                    icon: <Award size={28} className="text-amber-500" />,
                    badge: "Steg 4 av 4: Diagnostik",
                    body: (
                        <div className="space-y-4">
                            <p className="text-xs sm:text-sm text-[var(--text-main)] leading-relaxed font-medium">
                                När testet slutförs genereras en överskådlig diagnosrapport med detaljerade resultat per kategori.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl shadow-2xs">
                                    <h4 className="text-xs font-bold uppercase text-[var(--text-main)] mb-1 tracking-wider">
                                        Kategoridiagnos
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                        Färgkodade staplar visar träffsäkerheten inom respektive område.
                                    </p>
                                </div>

                                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl shadow-2xs">
                                    <h4 className="text-xs font-bold uppercase text-[var(--text-main)] mb-1 tracking-wider">
                                        Steg-för-steg facit
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                        Under detaljerad genomgång kan eleven fälla ut kompletta uträkningssteg.
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
                    icon: <Beaker size={28} className="text-emerald-600 dark:text-emerald-400" />,
                    badge: "Step 1 of 4: Configuration",
                    body: (
                        <div className="space-y-5">
                            <p className="text-sm sm:text-base text-[var(--text-main)] leading-relaxed font-medium">
                                In the Test Lab, you can construct custom digital quizzes and practice exams. Choose pre-built national test presets or hand-pick specific levels.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-5 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl shadow-2xs">
                                    <h4 className="text-xs font-bold uppercase text-[var(--text-main)] mb-1.5 tracking-wider">
                                        Hand-pick levels
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                                        Click into categories and select specific levels per topic to easily differentiate difficulty.
                                    </p>
                                </div>

                                <div className="p-5 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl shadow-2xs">
                                    <h4 className="text-xs font-bold uppercase text-[var(--text-main)] mb-1.5 tracking-wider">
                                        Configure length
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                                        Set a specific question count or select <strong>∞ (Infinite session)</strong> for open-ended practice.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Exam Mode, Word Problems & Coach",
                    subtitle: "Control feedback timing, context, and step-by-step guidance.",
                    icon: <Sliders size={28} className="text-emerald-600 dark:text-emerald-400" />,
                    badge: "Step 2 of 4: Settings",
                    body: (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl shadow-2xs">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-1">
                                        Exam vs. Practice
                                    </span>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                        In <strong>Exam Mode</strong>, grading is hidden until submission. In <strong>Practice Mode</strong>, students receive instant feedback.
                                    </p>
                                </div>

                                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl shadow-2xs">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
                                        Word Problems
                                    </span>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                        Converts standard equations into story-based challenges when enabled.
                                    </p>
                                </div>

                                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl shadow-2xs">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                                        Clues / Coach
                                    </span>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                        Allow a "Help!" button for step-by-step animated walkthroughs.
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-3">
                                <span className="text-lg shrink-0">✨</span>
                                <span className="leading-relaxed">All settings are automatically encoded into your shareable link!</span>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Sharing Test Links with Students",
                    subtitle: "How students access your custom test with your class code.",
                    icon: <Share2 size={28} className="text-rose-500" />,
                    badge: "Step 3 of 4: Sharing & Access",
                    body: (
                        <div className="space-y-4">
                            <div className="p-5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-3 shadow-2xs">
                                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                                    <KeyRound size={20} strokeWidth={2.5} />
                                </div>
                                <div className="space-y-1.5">
                                    <h4 className="text-xs font-extrabold uppercase text-rose-950 dark:text-rose-200 tracking-wider">
                                        CRITICAL: How Students Access the Test
                                    </h4>
                                    <p className="text-xs text-rose-900 dark:text-rose-300 leading-relaxed font-medium">
                                        To gain full access to your custom randomized test, students must:
                                    </p>
                                    <ol className="list-decimal pl-4 space-y-1 text-xs text-rose-950 dark:text-rose-100 font-bold">
                                        <li>Click your shared test link.</li>
                                        <li>Enter your <strong>valid class code</strong> in the <em>"Self-Practice"</em> box on the landing page.</li>
                                        <li>The custom assessment will instantly unlock!</li>
                                    </ol>
                                </div>
                            </div>

                            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl space-y-1.5 shadow-2xs">
                                <h4 className="text-xs font-bold uppercase text-[var(--text-main)] tracking-wider">
                                    Copying the link:
                                </h4>
                                <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                    Click <strong>"Copy Link"</strong> in the sidebar. The URL contains your full assessment preset.
                                </p>
                            </div>
                        </div>
                    )
                },
                {
                    title: "Test Report & Solution Guides",
                    subtitle: "Review class accuracy and explore worked solutions.",
                    icon: <Award size={28} className="text-amber-500" />,
                    badge: "Step 4 of 4: Analytics",
                    body: (
                        <div className="space-y-4">
                            <p className="text-xs sm:text-sm text-[var(--text-main)] leading-relaxed font-medium">
                                Once finished, students receive a full diagnostic report displaying accuracy across every category.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl shadow-2xs">
                                    <h4 className="text-xs font-bold uppercase text-[var(--text-main)] mb-1 tracking-wider">
                                        Category breakdown
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                        Visual percentage bars highlight accuracy per domain.
                                    </p>
                                </div>

                                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl shadow-2xs">
                                    <h4 className="text-xs font-bold uppercase text-[var(--text-main)] mb-1 tracking-wider">
                                        Step-by-step solutions
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                        Students can click "Show Solution" on any question to view the full breakdown.
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
        <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150 select-none font-sans">
            <div className="bg-[var(--bg-card)] text-[var(--text-main)] w-full max-w-4xl h-auto max-h-[90vh] rounded-2xl shadow-2xl border border-[var(--border-strong)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="px-6 py-4 border-b border-[var(--border-main)] flex items-center justify-between bg-[var(--bg-surface)] shrink-0 shadow-2xs">
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-[var(--bg-card)] border border-[var(--border-strong)] flex items-center justify-center shrink-0 shadow-2xs">
                            {current.icon}
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-0.5 font-mono">
                                {current.badge}
                            </span>
                            <h3 className="text-lg sm:text-xl font-extrabold text-[var(--text-main)] tracking-tight leading-tight">
                                {current.title}
                            </h3>
                        </div>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose} 
                        className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer border border-[var(--border-main)] shadow-2xs"
                        title={lang === 'sv' ? "Stäng" : "Close"}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Subtitle Bar */}
                <div className="px-6 py-3 bg-[var(--bg-surface)] border-b border-[var(--border-main)]">
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                        {current.subtitle}
                    </p>
                </div>

                {/* Body Content */}
                <div className="p-6 sm:p-8 overflow-y-auto max-h-[55vh] custom-scrollbar bg-[var(--bg-canvas)]">
                    {current.body}
                </div>

                {/* Footer Navigation */}
                <div className="px-6 py-4 border-t border-[var(--border-main)] bg-[var(--bg-surface)] flex items-center justify-between shrink-0 shadow-2xs">
                    <button
                        type="button"
                        onClick={() => setStep(s => Math.max(0, s - 1))}
                        disabled={step === 0}
                        className="px-4 py-2 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-card)] text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-main)] disabled:opacity-20 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                        <ChevronLeft size={16} /> <span>{lang === 'sv' ? "Föregående" : "Back"}</span>
                    </button>

                    {/* Step Dots */}
                    <div className="flex gap-2 items-center">
                        {currentLangSteps.map((_, i) => (
                            <button
                                type="button"
                                key={i}
                                onClick={() => setStep(i)}
                                className={`h-2 rounded-full transition-all cursor-pointer ${
                                    step === i 
                                        ? 'bg-emerald-600 w-8' 
                                        : 'bg-[var(--border-strong)] hover:bg-[var(--text-muted)] w-2'
                                }`}
                                title={`Steg ${i + 1}`}
                            />
                        ))}
                    </div>

                    {step < currentLangSteps.length - 1 ? (
                        <button
                            type="button"
                            onClick={() => setStep(s => Math.min(currentLangSteps.length - 1, s + 1))}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-2xs transition-all cursor-pointer active:scale-[0.98] flex items-center gap-1.5"
                        >
                            <span>{lang === 'sv' ? "Nästa" : "Next"}</span> <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-2xs transition-all cursor-pointer active:scale-[0.98] flex items-center gap-1.5"
                        >
                            <span>{lang === 'sv' ? "Kom igång" : "Get started"}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}