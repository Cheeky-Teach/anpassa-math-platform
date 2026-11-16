// src/components/modals/StudioTutorialModal.jsx
import React, { useState } from 'react';
import { 
    X, ChevronRight, ChevronLeft, BookOpen, Layers, 
    Radio, Sparkles, Send, Grid3X3, FileText,
    Calculator, Type, Map as MapIcon, Clock
} from 'lucide-react';

export default function StudioTutorialModal({ isOpen, onClose, lang = 'sv' }) {
    const [step, setStep] = useState(0);

    if (!isOpen) return null;

    const contentData = {
        sv: [
            {
                title: "Välkommen till Question Studio",
                subtitle: "Din kreativa verktygslåda för arbetsblad, Do Now och live-lektioner.",
                icon: <Sparkles size={24} className="text-amber-500" />,
                badge: "Steg 1 av 4: Översikt",
                body: (
                    <div className="space-y-4">
                        <p className="text-xs sm:text-sm text-[var(--text-main)] leading-relaxed font-medium">
                            I Question Studio skapar du individanpassat och variationsrikt matematikmaterial på några sekunder. 
                            Välj om du vill skriva ut till papper, visa snabba startuppgifter på projektorn eller köra en interaktiv lektion i realtid.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl flex flex-col justify-between">
                                <div>
                                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-2xs">
                                        <FileText size={20} />
                                    </div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] mb-1">
                                        Arbetsblad
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                                        Klassisk A4-layout med anpassningsbar skrivyta, svarsrader och fullständigt facit för utskrift.
                                    </p>
                                </div>
                                <span className="mt-4 text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">
                                    PDF & Utskrift →
                                </span>
                            </div>

                            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl flex flex-col justify-between">
                                <div>
                                    <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center mb-3 shadow-2xs">
                                        <Grid3X3 size={20} />
                                    </div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] mb-1">
                                        Do Now Grid
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                                        4–6 startuppgifter med stor text, perfekt anpassade för klassrummets projektor eller storskärm.
                                    </p>
                                </div>
                                <span className="mt-4 text-[10px] font-bold uppercase text-sky-700 dark:text-sky-400 tracking-wider">
                                    Projektorvy →
                                </span>
                            </div>

                            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl flex flex-col justify-between">
                                <div>
                                    <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center mb-3 shadow-2xs">
                                        <Radio size={20} />
                                    </div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] mb-1">
                                        Live-Lektion
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                                        Eleverna ansluter med en enkel 6-ställig kod och svarar direkt från sina egna skärmar.
                                    </p>
                                </div>
                                <span className="mt-4 text-[10px] font-bold uppercase text-rose-700 dark:text-rose-400 tracking-wider">
                                    Realtidsmatris →
                                </span>
                            </div>
                        </div>
                    </div>
                )
            },
            {
                title: "Arbeta i de 4 panelerna",
                subtitle: "Arbetsflödet rör sig logiskt från vänster till höger över skärmen.",
                icon: <Layers size={24} className="text-sky-600 dark:text-sky-400" />,
                badge: "Steg 2 av 4: Navigering",
                body: (
                    <div className="space-y-3">
                        <div className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl flex items-start gap-3">
                            <span className="w-7 h-7 rounded-lg bg-sky-600 text-white font-bold font-mono flex items-center justify-center shrink-0 text-xs shadow-2xs">
                                1
                            </span>
                            <div>
                                <h4 className="text-xs font-bold text-[var(--text-main)] mb-0.5">
                                    Pane 1: Välj Ämnesområde
                                </h4>
                                <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                    I vänstermenyn hittar du hela kursplanen indelad i moduler – som t.ex. Bråk, Procent, Algebra eller Geometri. Klicka på ett ämne för att öppna dess tillgängliga nivåer.
                                </p>
                            </div>
                        </div>

                        <div className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl flex items-start gap-3">
                            <span className="w-7 h-7 rounded-lg bg-sky-600 text-white font-bold font-mono flex items-center justify-center shrink-0 text-xs shadow-2xs">
                                2
                            </span>
                            <div>
                                <h4 className="text-xs font-bold text-[var(--text-main)] mb-0.5">
                                    Pane 2: Välj Svårighetsnivå & Typ
                                </h4>
                                <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                    Här listas nivåerna 1–10. Färgade brickor visar om uppgiften tränar <strong>Räkna</strong>, <strong>Begrepp</strong> eller <strong>Visuell förståelse</strong>. Justera antal med <strong>+ / -</strong> och klicka <em>Lägg till</em>.
                                </p>
                            </div>
                        </div>

                        <div className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl flex items-start gap-3">
                            <span className="w-7 h-7 rounded-lg bg-sky-600 text-white font-bold font-mono flex items-center justify-center shrink-0 text-xs shadow-2xs">
                                3
                            </span>
                            <div>
                                <h4 className="text-xs font-bold text-[var(--text-main)] mb-0.5">
                                    Pane 3: Arbetsytan (Canvas / Sidan)
                                </h4>
                                <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                    Här ser du materialet växa fram. Växla till <strong>Layout</strong> för att se det verkliga A4-formatet, anpassa rutad skrivyta eller dra i korten för att byta ordning.
                                </p>
                            </div>
                        </div>

                        <div className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl flex items-start gap-3">
                            <span className="w-7 h-7 rounded-lg bg-sky-600 text-white font-bold font-mono flex items-center justify-center shrink-0 text-xs shadow-2xs">
                                4
                            </span>
                            <div>
                                <h4 className="text-xs font-bold text-[var(--text-main)] mb-0.5">
                                    Pane 4: Valda Frågor & Facit
                                </h4>
                                <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                    Din sammanställning. Här kan du snabbt ta bort enstaka frågor eller aktivera om facit ska genereras automatiskt längst bak.
                                </p>
                            </div>
                        </div>
                    </div>
                )
            },
            {
                title: "Textuppgifter & snabbkontroller",
                subtitle: "Gör uppgifterna mer verklighetsförankrade med ett enda klick.",
                icon: <BookOpen size={24} className="text-emerald-600 dark:text-emerald-400" />,
                badge: "Steg 3 av 4: Anpassning",
                body: (
                    <div className="space-y-4">
                        <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl space-y-1.5">
                            <div className="flex items-center gap-2">
                                <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400" />
                                <h4 className="text-xs font-extrabold text-[var(--text-main)] uppercase tracking-tight">
                                    Problemlösning / Textuppgifter
                                </h4>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                Slå på switchen <strong>"Problemlösning"</strong> högst upp i Pane 2. Systemet behåller de matematiska talen men bäddar in dem i engagerande berättelser anpassade för åldersgruppen.
                            </p>
                        </div>

                        <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                                Knappar på varje uppgiftskort (Pane 3)
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[var(--text-main)] font-medium">
                                <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] flex items-start gap-2.5">
                                    <span className="px-2 py-0.5 bg-sky-600 text-white font-bold font-mono rounded text-[10px]">W</span>
                                    <div>
                                        <strong className="block text-[var(--text-main)] font-bold mb-0.5">Bredd:</strong>
                                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">Växla mellan helsida W6, halv bredd W3 eller tredjedel W2.</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] flex items-start gap-2.5">
                                    <span className="px-2 py-0.5 bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-strong)] font-bold font-mono rounded text-[10px]">+ / -</span>
                                    <div>
                                        <strong className="block text-[var(--text-main)] font-bold mb-0.5">Arbetsyta:</strong>
                                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">Lägg till 8 mm rutad skrivyta direkt under beräkningen.</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] flex items-start gap-2.5">
                                    <Calculator size={16} className="text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="block text-[var(--text-main)] font-bold mb-0.5">Slumpa tal:</strong>
                                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">Byt ut siffrorna i talet utan att ändra frågetypen.</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] flex items-start gap-2.5">
                                    <Type size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="block text-[var(--text-main)] font-bold mb-0.5">Slumpa text:</strong>
                                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">Få en ny berättelse med samma matematiska struktur.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            },
            {
                title: "Starta en live-lektion",
                subtitle: "Koppla upp hela klassen och följ deras resonemang i realtid.",
                icon: <Send size={24} className="text-rose-600 dark:text-rose-400" />,
                badge: "Steg 4 av 4: Live i klassrummet",
                body: (
                    <div className="space-y-4">
                        <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl">
                            <ol className="space-y-2.5 text-xs sm:text-sm text-[var(--text-main)] font-medium list-decimal pl-4">
                                <li className="leading-relaxed">
                                    Klicka på den röda <strong>"Live"</strong>-knappen i toppmenyn när du har valt dina frågor.
                                </li>
                                <li className="leading-relaxed">
                                    Välj lektionstyp: <strong>Öppet tempo</strong> (eleverna räknar själva) eller <strong>Lärarlett</strong> (du byter fråga för alla).
                                </li>
                                <li className="leading-relaxed">
                                    Klicka <strong>Starta</strong>. Projektorn visar en sexsiffrig klasskod (t.ex. <em>XK92FA</em>).
                                </li>
                                <li className="leading-relaxed">
                                    Eleverna går in på sidan på sina datorer/iPad, klickar <strong>Elev</strong> och skriver in koden.
                                </li>
                                <li className="leading-relaxed">
                                    Svaren rullar in i din <strong>Realtidsmatris</strong>. Klicka på valfri elev för att se deras uträkningar eller tavelritningar direkt!
                                </li>
                            </ol>
                        </div>

                        {/* Critical Data Retention Callout */}
                        <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] border-l-4 border-l-rose-600 rounded-xl flex items-start gap-3">
                            <div className="p-2 bg-rose-600 text-white rounded-xl shrink-0 mt-0.5">
                                <Clock size={18} strokeWidth={2.5} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xs sm:text-sm font-extrabold uppercase text-rose-700 dark:text-rose-400 tracking-tight">
                                    VIKTIGT: Elevdata sparas endast i 7 dagar!
                                </h4>
                                <p className="text-xs text-[var(--text-main)] leading-relaxed font-medium">
                                    Av sekretesskäl raderas alla elevresultat, tavelritningar och svar automatiskt efter <strong>7 dagar</strong>. Skriv ut eller spara rapporter som PDF från Lektionsarkivet i Dashboarden innan veckan är slut!
                                </p>
                            </div>
                        </div>

                        <div className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl text-xs text-[var(--text-main)] font-medium flex items-center gap-3">
                            <span className="text-lg shrink-0">💡</span>
                            <span className="leading-relaxed">
                                Vill du visa uppgifterna på tavlan utan elevsvar? Klicka på den gula knappen <strong>"Presentera"</strong> istället!
                            </span>
                        </div>
                    </div>
                )
            }
        ],
        en: [
            {
                title: "Welcome to Question Studio",
                subtitle: "Your creative toolkit for worksheets, Do Now grids, and live lessons.",
                icon: <Sparkles size={24} className="text-amber-500" />,
                badge: "Step 1 of 4: Overview",
                body: (
                    <div className="space-y-4">
                        <p className="text-xs sm:text-sm text-[var(--text-main)] leading-relaxed font-medium">
                            In Question Studio, you can generate customized, varied math assignments in seconds. 
                            Choose whether to print paper copies, project quick warm-ups on your smartboard, or run interactive live sessions.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl flex flex-col justify-between">
                                <div>
                                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-2xs">
                                        <FileText size={20} />
                                    </div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] mb-1">
                                        Worksheet
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                                        Printable A4 layout with configurable work areas, solution grids, and full answer keys.
                                    </p>
                                </div>
                                <span className="mt-4 text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">
                                    PDF & Print →
                                </span>
                            </div>

                            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl flex flex-col justify-between">
                                <div>
                                    <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center mb-3 shadow-2xs">
                                        <Grid3X3 size={20} />
                                    </div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] mb-1">
                                        Do Now Grid
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                                        4–6 quick warm-up questions optimized with large font sizes for classroom projectors.
                                    </p>
                                </div>
                                <span className="mt-4 text-[10px] font-bold uppercase text-sky-700 dark:text-sky-400 tracking-wider">
                                    Projector Mode →
                                </span>
                            </div>

                            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl flex flex-col justify-between">
                                <div>
                                    <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center mb-3 shadow-2xs">
                                        <Radio size={20} />
                                    </div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] mb-1">
                                        Live Lesson
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                                        Students connect with a simple 6-letter room code and submit answers from their own devices.
                                    </p>
                                </div>
                                <span className="mt-4 text-[10px] font-bold uppercase text-rose-700 dark:text-rose-400 tracking-wider">
                                    Live Matrix →
                                </span>
                            </div>
                        </div>
                    </div>
                )
            },
            {
                title: "Working Across the 4 Panes",
                subtitle: "The workflow moves logically from left to right across your screen.",
                icon: <Layers size={24} className="text-sky-600 dark:text-sky-400" />,
                badge: "Step 2 of 4: Navigation",
                body: (
                    <div className="space-y-3">
                        <div className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl flex items-start gap-3">
                            <span className="w-7 h-7 rounded-lg bg-sky-600 text-white font-bold font-mono flex items-center justify-center shrink-0 text-xs shadow-2xs">
                                1
                            </span>
                            <div>
                                <h4 className="text-xs font-bold text-[var(--text-main)] mb-0.5">
                                    Pane 1: Topic Catalog
                                </h4>
                                <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                    Browse the full math curriculum on the left – Fractions, Percentages, Algebra, or Geometry. Click any topic to load its difficulty levels.
                                </p>
                            </div>
                        </div>

                        <div className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl flex items-start gap-3">
                            <span className="w-7 h-7 rounded-lg bg-sky-600 text-white font-bold font-mono flex items-center justify-center shrink-0 text-xs shadow-2xs">
                                2
                            </span>
                            <div>
                                <h4 className="text-xs font-bold text-[var(--text-main)] mb-0.5">
                                    Pane 2: Levels & Question Types
                                </h4>
                                <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                    Select difficulty (Levels 1–10). Colored badges indicate whether questions practice <strong>Calculations</strong>, <strong>Concepts</strong>, or <strong>Visual Models</strong>. Set the quantity and click <em>Add</em>.
                                </p>
                            </div>
                        </div>

                        <div className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl flex items-start gap-3">
                            <span className="w-7 h-7 rounded-lg bg-sky-600 text-white font-bold font-mono flex items-center justify-center shrink-0 text-xs shadow-2xs">
                                3
                            </span>
                            <div>
                                <h4 className="text-xs font-bold text-[var(--text-main)] mb-0.5">
                                    Pane 3: Workspace (The Canvas)
                                </h4>
                                <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                    Preview your assignment. Switch to <strong>Layout</strong> to see the real A4 sheet preview, add squared work areas, or drag cards to reorder them.
                                </p>
                            </div>
                        </div>

                        <div className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl flex items-start gap-3">
                            <span className="w-7 h-7 rounded-lg bg-sky-600 text-white font-bold font-mono flex items-center justify-center shrink-0 text-xs shadow-2xs">
                                4
                            </span>
                            <div>
                                <h4 className="text-xs font-bold text-[var(--text-main)] mb-0.5">
                                    Pane 4: Selected Queue & Answer Key
                                </h4>
                                <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                    Your table of contents. Delete individual questions, inspect expressions, or toggle whether to automatically append a full answer key.
                                </p>
                            </div>
                        </div>
                    </div>
                )
            },
            {
                title: "Word Problems & Quick Controls",
                subtitle: "Make math contextual and interactive with one click.",
                icon: <BookOpen size={24} className="text-emerald-600 dark:text-emerald-400" />,
                badge: "Step 3 of 4: Customization",
                body: (
                    <div className="space-y-4">
                        <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl space-y-1.5">
                            <div className="flex items-center gap-2">
                                <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400" />
                                <h4 className="text-xs font-extrabold text-[var(--text-main)] uppercase tracking-tight">
                                    Contextual Word Problems
                                </h4>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                Turn on the <strong>"Word Problems"</strong> toggle at the top of Pane 2. The engine keeps the exact numbers and calculations while embedding them into relatable, age-appropriate narratives.
                            </p>
                        </div>

                        <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                                Controls on each question card (Pane 3)
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[var(--text-main)] font-medium">
                                <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] flex items-start gap-2.5">
                                    <span className="px-2 py-0.5 bg-sky-600 text-white font-bold font-mono rounded text-[10px]">W</span>
                                    <div>
                                        <strong className="block text-[var(--text-main)] font-bold mb-0.5">Width:</strong>
                                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">Toggle between full width W6, half width W3, or one-third width W2.</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] flex items-start gap-2.5">
                                    <span className="px-2 py-0.5 bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-strong)] font-bold font-mono rounded text-[10px]">+ / -</span>
                                    <div>
                                        <strong className="block text-[var(--text-main)] font-bold mb-0.5">Work Area:</strong>
                                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">Add 8mm squared grid space under questions for student calculations.</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] flex items-start gap-2.5">
                                    <Calculator size={16} className="text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="block text-[var(--text-main)] font-bold mb-0.5">Shuffle Numbers:</strong>
                                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">Randomize values while preserving the question format.</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] flex items-start gap-2.5">
                                    <Type size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="block text-[var(--text-main)] font-bold mb-0.5">Shuffle Story:</strong>
                                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">Generate a fresh narrative scenario for the same equation.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            },
            {
                title: "Hosting a Live Lesson",
                subtitle: "Connect the entire classroom and follow student work in real time.",
                icon: <Send size={24} className="text-rose-600 dark:text-rose-400" />,
                badge: "Step 4 of 4: Live Classrooms",
                body: (
                    <div className="space-y-4">
                        <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl">
                            <ol className="space-y-2.5 text-xs sm:text-sm text-[var(--text-main)] font-medium list-decimal pl-4">
                                <li className="leading-relaxed">
                                    Click the red <strong>"Live"</strong> button in the top menu bar once you have queued your questions.
                                </li>
                                <li className="leading-relaxed">
                                    Choose session pacing: <strong>Open Pace</strong> (students work freely) or <strong>Teacher-Led</strong> (you control the active problem).
                                </li>
                                <li className="leading-relaxed">
                                    Click <strong>Start</strong>. The board will display a 6-letter class code (e.g. <em>XK92FA</em>).
                                </li>
                                <li className="leading-relaxed">
                                    Students navigate to the app, select <strong>Student</strong>, and enter the code with their name.
                                </li>
                                <li className="leading-relaxed">
                                    Answers stream into your <strong>Live Matrix</strong> in real time. Click on any student cell to inspect their scratchpad calculations or drawings!
                                </li>
                            </ol>
                        </div>

                        {/* Critical Data Retention Callout */}
                        <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] border-l-4 border-l-rose-600 rounded-xl flex items-start gap-3">
                            <div className="p-2 bg-rose-600 text-white rounded-xl shrink-0 mt-0.5">
                                <Clock size={18} strokeWidth={2.5} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xs sm:text-sm font-extrabold uppercase text-rose-700 dark:text-rose-400 tracking-tight">
                                    CRITICAL: Student Data is Purged After 7 Days!
                                </h4>
                                <p className="text-xs text-[var(--text-main)] leading-relaxed font-medium">
                                    For student privacy, all individual live responses and session records are permanently deleted after 7 days. Be sure to export reports before expiry!
                                </p>
                            </div>
                        </div>

                        <div className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl text-xs text-[var(--text-main)] font-medium flex items-center gap-3">
                            <span className="text-lg shrink-0">💡</span>
                            <span className="leading-relaxed">Want to present the problems slide-by-slide without collecting answers? Click the yellow <strong>"Present"</strong> button instead!</span>
                        </div>
                    </div>
                )
            }
        ]
    };

    const currentLangSteps = contentData[lang] || contentData.sv;
    const current = currentLangSteps[step];

    return (
        <div className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150 select-none font-sans">
            <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 text-[var(--text-main)]">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-[var(--border-main)] flex items-center justify-between bg-[var(--bg-surface)] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] shadow-2xl border border-[var(--border-main)] flex items-center justify-center shrink-0">
                            {current.icon}
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-0.5">
                                {current.badge}
                            </span>
                            <h3 className="text-base sm:text-lg font-extrabold text-[var(--text-main)] tracking-tight leading-snug">
                                {current.title}
                            </h3>
                        </div>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose} 
                        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-xl hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
                        title={lang === 'sv' ? "Stäng" : "Close"}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Subtitle Bar */}
                <div className="px-6 py-2.5 bg-[var(--bg-surface)] border-b border-[var(--border-main)]">
                    <p className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wide">
                        {current.subtitle}
                    </p>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto max-h-[55vh] custom-scrollbar bg-[var(--bg-card)]">
                    {current.body}
                </div>

                {/* Footer Navigation */}
                <div className="px-6 py-3.5 border-t border-[var(--border-main)] bg-[var(--bg-surface)] flex items-center justify-between shrink-0">
                    <button
                        type="button"
                        onClick={() => setStep(s => Math.max(0, s - 1))}
                        disabled={step === 0}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-main)] disabled:opacity-0 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                        <ChevronLeft size={16} /> {lang === 'sv' ? "Föregående" : "Back"}
                    </button>

                    {/* Step Dots */}
                    <div className="flex gap-2 items-center">
                        {currentLangSteps.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setStep(i)}
                                className={`h-2 rounded-full transition-all cursor-pointer ${
                                    step === i 
                                        ? 'bg-emerald-600 w-8' 
                                        : 'bg-[var(--border-strong)] hover:opacity-80 w-2'
                                }`}
                                title={`Steg ${i + 1}`}
                            />
                        ))}
                    </div>

                    {step < currentLangSteps.length - 1 ? (
                        <button
                            type="button"
                            onClick={() => setStep(s => Math.min(currentLangSteps.length - 1, s + 1))}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-2xs transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
                        >
                            <span>{lang === 'sv' ? "Nästa" : "Next"}</span> <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
                        >
                            {lang === 'sv' ? "Kom igång!" : "Get started!"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}