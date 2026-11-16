// src/components/modals/PresentationTutorialModal.jsx
import React, { useState } from 'react';
import { 
    X, ChevronRight, ChevronLeft, Monitor, Layers, 
    Sparkles, Presentation, FileQuestion, Plus,
    RefreshCw, Users, Palette, Radio, Clock
} from 'lucide-react';

export default function PresentationTutorialModal({ isOpen, onClose, lang = 'sv' }) {
    const [step, setStep] = useState(0);

    if (!isOpen) return null;

    const contentData = {
        sv: [
            {
                title: "Välkommen till Presentationsläge",
                subtitle: "Gör om dina arbetsblad och matteuppgifter till en interaktiv genomgång.",
                icon: <Presentation size={24} className="text-amber-600 dark:text-amber-400" />,
                badge: "Steg 1 av 4: Översikt",
                body: (
                    <div className="space-y-4">
                        <p className="text-xs sm:text-sm text-[var(--text-main)] leading-relaxed font-medium">
                            I Presentationsläget förvandlas dina sparade uppgifter till en professionell bildvisning i 16:9-format. 
                            Du får en digital whiteboard, färdiga laborativa verktyg och möjligheten att låta eleverna bygga och rita sina egna svar i realtid.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl flex flex-col justify-between">
                                <div>
                                    <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-3 shadow-2xs">
                                        <Monitor size={20} />
                                    </div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] mb-1">
                                        16:9 Storbild
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                                        Kristallklar visning anpassad för projektorer, smartboards och elevernas egna skärmar.
                                    </p>
                                </div>
                                <span className="mt-4 text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400 tracking-wider">
                                    Biograf-format →
                                </span>
                            </div>

                            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl flex flex-col justify-between">
                                <div>
                                    <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center mb-3 shadow-2xs">
                                        <Palette size={20} />
                                    </div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] mb-1">
                                        Laborativ tavla
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                                        Dra ut färdiga algebrabrickor, 2D/3D-figurer, bråkdelar och koordinatsystem direkt på tavlan.
                                    </p>
                                </div>
                                <span className="mt-4 text-[10px] font-bold uppercase text-sky-700 dark:text-sky-400 tracking-wider">
                                    Verktygslådor →
                                </span>
                            </div>

                            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl flex flex-col justify-between">
                                <div>
                                    <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center mb-3 shadow-2xs">
                                        <Users size={20} />
                                    </div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] mb-1">
                                        Elevsvar live
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                                        Låt eleverna laborera på sina egna enheter och skicka in sina tavlor så att du kan lyfta dem framför klassen.
                                    </p>
                                </div>
                                <span className="mt-4 text-[10px] font-bold uppercase text-rose-700 dark:text-rose-400 tracking-wider">
                                    Klassrums-interaktion →
                                </span>
                            </div>
                        </div>
                    </div>
                )
            },
            {
                title: "Från arbetsblad till slides på 1 klick",
                subtitle: "Ladda in sparade uppgifter och fördela dem automatiskt på egna sidor.",
                icon: <Layers size={24} className="text-sky-600 dark:text-sky-400" />,
                badge: "Steg 2 av 4: Skapa bildspel",
                body: (
                    <div className="space-y-3.5">
                        <div className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl flex items-start gap-3">
                            <span className="w-7 h-7 rounded-lg bg-sky-600 text-white font-bold font-mono flex items-center justify-center shrink-0 text-xs shadow-2xs">
                                1
                            </span>
                            <div>
                                <h4 className="text-xs font-bold text-[var(--text-main)] mb-0.5">
                                    Hämta uppgifter från ditt bibliotek
                                </h4>
                                <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                    Öppna ett sparat blad direkt via Question Studio genom att klicka på <strong>"Presentera"</strong>, eller klicka på <strong>"Uppgift"</strong> i vänstermenyn för att plocka in nya tal från generatorerna.
                                </p>
                            </div>
                        </div>

                        <div className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl flex items-start gap-3">
                            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold font-mono flex items-center justify-center shrink-0 text-xs shadow-2xs">
                                2
                            </span>
                            <div>
                                <h4 className="text-xs font-bold text-[var(--text-main)] mb-0.5">
                                    Blixtsnabb uppdelning: 1 uppgift per slide
                                </h4>
                                <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                    Gå till fliken <strong>"Uppgifter"</strong> i vänstermenyn och klicka på knappen <strong>"Fördela 1 uppgift per slide"</strong>. Systemet skapar ögonblickligen en dedikerad presentationssida för varje fråga.
                                </p>
                            </div>
                        </div>

                        <div className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl flex items-start gap-3">
                            <span className="w-7 h-7 rounded-lg bg-stone-800 text-white font-bold font-mono flex items-center justify-center shrink-0 text-xs shadow-2xs">
                                3
                            </span>
                            <div>
                                <h4 className="text-xs font-bold text-[var(--text-main)] mb-0.5">
                                    Ordna och fäst uppgifter
                                </h4>
                                <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                    I fliken <strong>"Slides"</strong> kan du dubbelklicka på sidans namn för att byta titel, dra i handtaget för att flytta ordningen, eller klicka på skärmikonen på valfri uppgift för att fästa den på aktuell sida.
                                </p>
                            </div>
                        </div>
                    </div>
                )
            },
            {
                title: "Interaktiva whiteboard-verktyg",
                subtitle: "Rita, skriv och dra ut laborativa hjälpmedel med verktygslådan.",
                icon: <Palette size={24} className="text-emerald-600 dark:text-emerald-400" />,
                badge: "Steg 3 av 4: Laborativ Canvas",
                body: (
                    <div className="space-y-4">
                        <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                                De inbyggda verktygslådorna (Bottom Toolbar)
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[var(--text-main)] font-medium">
                                <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] flex items-start gap-2.5">
                                    <span className="px-2 py-0.5 bg-amber-600 text-white font-bold font-mono rounded text-[10px]">x</span>
                                    <div>
                                        <strong className="block text-[var(--text-main)] font-bold mb-0.5">Algebrabrickor:</strong>
                                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">Skapa $x$-, $x^2$- och enhetsbrickor. Flytta mellan led med automatisk teckenväxling.</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] flex items-start gap-2.5">
                                    <span className="px-2 py-0.5 bg-sky-600 text-white font-bold font-mono rounded text-[10px]">½</span>
                                    <div>
                                        <strong className="block text-[var(--text-main)] font-bold mb-0.5">Bråkmodeller:</strong>
                                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">Bråkcirklar och rektanglar med justerbara nämnare och täljare.</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] flex items-start gap-2.5">
                                    <span className="px-2 py-0.5 bg-blue-600 text-white font-bold font-mono rounded text-[10px]">3D</span>
                                    <div>
                                        <strong className="block text-[var(--text-main)] font-bold mb-0.5">2D & 3D-Geometri:</strong>
                                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">Cylindrar, koner och prismor med synliga måttlinjer.</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] flex items-start gap-2.5">
                                    <span className="px-2 py-0.5 bg-indigo-600 text-white font-bold font-mono rounded text-[10px]">(x,y)</span>
                                    <div>
                                        <strong className="block text-[var(--text-main)] font-bold mb-0.5">Koordinatsystem:</strong>
                                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">Rutnät med skalbara axlar för punkter och linjära funktioner.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border-main)] border-l-4 border-l-amber-500 rounded-xl text-xs text-[var(--text-main)] font-medium flex items-center gap-3">
                            <span className="text-lg shrink-0">💡</span>
                            <span className="leading-relaxed">
                                Alla ritningar, linjer och objekt sparas automatiskt på den specifika sliden när du klickar på <strong>"Spara"</strong> i toppmenyn.
                            </span>
                        </div>
                    </div>
                )
            },
            {
                title: "Live-lektioner & ny omgång",
                subtitle: "Kör interaktivt med klassen och starta nya utmaningar på samma slide.",
                icon: <Radio size={24} className="text-rose-600 dark:text-rose-400" />,
                badge: "Steg 4 av 4: Interaktiv Lektion",
                body: (
                    <div className="space-y-4">
                        <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl">
                            <ol className="space-y-3 text-xs sm:text-sm text-[var(--text-main)] font-medium list-decimal pl-4">
                                <li className="leading-relaxed">
                                    <strong>Gå Live:</strong> Eleverna ansluter på sina egna enheter och ser exakt samma 16:9-bild.
                                </li>
                                <li className="leading-relaxed">
                                    <strong>Inskickade svar:</strong> Eleverna har tillgång till pennor och verktygslådor och skickar in sin tavla via panelen <em>"Dina Svar"</em>.
                                </li>
                                <li className="leading-relaxed">
                                    <strong>Realtidsvy:</strong> I lärarvyn ser du allas inskickade lösningar. Klicka på valfri elev för att förstora och lyfta fram intressanta resonemang.
                                </li>
                                <li className="leading-relaxed">
                                    <strong>Ny Omgång:</strong> Klicka på <em>"Ny Omgång"</em> när som helst. Alla elevsvar nollställs direkt så klassen kan lösa en ny uppgift på samma slide!
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
                            <span className="text-lg shrink-0">✨</span>
                            <span className="leading-relaxed">
                                För sidor med slumpade matteuppgifter visas knappen <strong>"Slumpa Ny"</strong> istället, vilket direkt ger klassen nya tal i samma uppgiftsformat.
                            </span>
                        </div>
                    </div>
                )
            }
        ],
        en: [
            {
                title: "Welcome to Presentation Mode",
                subtitle: "Turn worksheets and math problems into interactive presentations.",
                icon: <Presentation size={24} className="text-amber-600 dark:text-amber-400" />,
                badge: "Step 1 of 4: Overview",
                body: (
                    <div className="space-y-4">
                        <p className="text-xs sm:text-sm text-[var(--text-main)] leading-relaxed font-medium">
                            Presentation Mode turns your saved math content into a 16:9 widescreen slide deck. 
                            You get an interactive digital whiteboard, built-in manipulatives, and real-time student participation on classroom devices.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl flex flex-col justify-between">
                                <div>
                                    <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-3 shadow-2xs">
                                        <Monitor size={20} />
                                    </div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] mb-1">
                                        16:9 Widescreen
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                                        Optimized aspect ratio designed for smartboards, classroom projectors, and student screens.
                                    </p>
                                </div>
                                <span className="mt-4 text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400 tracking-wider">
                                    Stage View →
                                </span>
                            </div>

                            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl flex flex-col justify-between">
                                <div>
                                    <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center mb-3 shadow-2xs">
                                        <Palette size={20} />
                                    </div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] mb-1">
                                        Manipulative Bins
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                                        Spawn algebra tiles, 2D/3D geometry models, fraction shapes, and coordinate planes on demand.
                                    </p>
                                </div>
                                <span className="mt-4 text-[10px] font-bold uppercase text-sky-700 dark:text-sky-400 tracking-wider">
                                    Tool Drawers →
                                </span>
                            </div>

                            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl flex flex-col justify-between">
                                <div>
                                    <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center mb-3 shadow-2xs">
                                        <Users size={20} />
                                    </div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] mb-1">
                                        Live Student Work
                                    </h4>
                                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                                        Students manipulate tools on their own devices and submit their boards for live class discussion.
                                    </p>
                                </div>
                                <span className="mt-4 text-[10px] font-bold uppercase text-rose-700 dark:text-rose-400 tracking-wider">
                                    Classroom Interaction →
                                </span>
                            </div>
                        </div>
                    </div>
                )
            },
            {
                title: "From Worksheet to Slides in 1 Click",
                subtitle: "Import saved questions and distribute them automatically onto separate slides.",
                icon: <Layers size={24} className="text-sky-600 dark:text-sky-400" />,
                badge: "Step 2 of 4: Slide Generation",
                body: (
                    <div className="space-y-3.5">
                        <div className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl flex items-start gap-3">
                            <span className="w-7 h-7 rounded-lg bg-sky-600 text-white font-bold font-mono flex items-center justify-center shrink-0 text-xs shadow-2xs">
                                1
                            </span>
                            <div>
                                <h4 className="text-xs font-bold text-[var(--text-main)] mb-0.5">
                                    Load questions from your library
                                </h4>
                                <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                    Open any saved worksheet by clicking <strong>"Present"</strong> in Question Studio, or click <strong>"Math"</strong> in the left sidebar to summon fresh generator templates.
                                </p>
                            </div>
                        </div>

                        <div className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl flex items-start gap-3">
                            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold font-mono flex items-center justify-center shrink-0 text-xs shadow-2xs">
                                2
                            </span>
                            <div>
                                <h4 className="text-xs font-bold text-[var(--text-main)] mb-0.5">
                                    Instant deck creation: 1 question per slide
                                </h4>
                                <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                    Go to the <strong>"Questions"</strong> tab in the sidebar and click <strong>"1 question per slide"</strong>. The system instantly generates a dedicated presentation slide for every single question.
                                </p>
                            </div>
                        </div>

                        <div className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl flex items-start gap-3">
                            <span className="w-7 h-7 rounded-lg bg-stone-800 text-white font-bold font-mono flex items-center justify-center shrink-0 text-xs shadow-2xs">
                                3
                            </span>
                            <div>
                                <h4 className="text-xs font-bold text-[var(--text-main)] mb-0.5">
                                    Organize and pin problems
                                </h4>
                                <p className="text-xs text-[var(--text-muted)] leading-relaxed font-medium">
                                    Under the <strong>"Slides"</strong> tab, double-click a slide name to rename it, drag handles to reorder, or click the screen icon next to any problem to pin it to your active slide.
                                </p>
                            </div>
                        </div>
                    </div>
                )
            },
            {
                title: "Interactive Canvas & Manipulatives",
                subtitle: "Draw, annotate, and spawn visual math tools with the bottom toolbar.",
                icon: <Palette size={24} className="text-emerald-600 dark:text-emerald-400" />,
                badge: "Step 3 of 4: Digital Tools",
                body: (
                    <div className="space-y-4">
                        <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                                Tool Drawers (Bottom Toolbar)
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[var(--text-main)] font-medium">
                                <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] flex items-start gap-2.5">
                                    <span className="px-2 py-0.5 bg-amber-600 text-white font-bold font-mono rounded text-[10px]">x</span>
                                    <div>
                                        <strong className="block text-[var(--text-main)] font-bold mb-0.5">Algebra Tiles:</strong>
                                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">Spawn $x$, $x^2$, and unit tiles. Drag across equal sign to switch signs automatically.</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] flex items-start gap-2.5">
                                    <span className="px-2 py-0.5 bg-sky-600 text-white font-bold font-mono rounded text-[10px]">½</span>
                                    <div>
                                        <strong className="block text-[var(--text-main)] font-bold mb-0.5">Fraction Shapes:</strong>
                                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">Circles and bars with adjustable numerators/denominators.</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] flex items-start gap-2.5">
                                    <span className="px-2 py-0.5 bg-blue-600 text-white font-bold font-mono rounded text-[10px]">3D</span>
                                    <div>
                                        <strong className="block text-[var(--text-main)] font-bold mb-0.5">2D & 3D Geometry:</strong>
                                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">Cylinders, cones, and prisms with explicit dimension markers.</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-main)] flex items-start gap-2.5">
                                    <span className="px-2 py-0.5 bg-indigo-600 text-white font-bold font-mono rounded text-[10px]">(x,y)</span>
                                    <div>
                                        <strong className="block text-[var(--text-main)] font-bold mb-0.5">Coordinate Axes:</strong>
                                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">Scaled coordinate planes for plotting points and linear functions.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border-main)] border-l-4 border-l-amber-500 rounded-xl text-xs text-[var(--text-main)] font-medium flex items-center gap-3">
                            <span className="text-lg shrink-0">💡</span>
                            <span className="leading-relaxed">
                                All annotations, shapes, and moved objects are saved directly to that slide when you click <strong>"Save"</strong> in the top bar.
                            </span>
                        </div>
                    </div>
                )
            },
            {
                title: "Live Lessons & New Rounds",
                subtitle: "Run interactive sessions and pose multiple challenges on the same slide.",
                icon: <Radio size={24} className="text-rose-600 dark:text-rose-400" />,
                badge: "Step 4 of 4: Classroom Practice",
                body: (
                    <div className="space-y-4">
                        <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl">
                            <ol className="space-y-3 text-xs sm:text-sm text-[var(--text-main)] font-medium list-decimal pl-4">
                                <li className="leading-relaxed">
                                    <strong>Go Live:</strong> Students join on their devices and see your active 16:9 slide.
                                </li>
                                <li className="leading-relaxed">
                                    <strong>Submissions:</strong> Students use pens and tool drawers to submit their boards via the <em>"Your Answers"</em> panel.
                                </li>
                                <li className="leading-relaxed">
                                    <strong>Real-time View:</strong> Teacher view populates live submissions. Click any board to spotlight and discuss with the class.
                                </li>
                                <li className="leading-relaxed">
                                    <strong>New Round:</strong> Click <em>"New Round"</em> anytime. All student boards reset instantly so they can solve your next prompt on the same slide!
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
                                    For student privacy, all student submissions, whiteboard drawings, and response records are permanently deleted after <strong>7 days</strong>. Be sure to export or print PDF summary reports from the Session Archive before the 7-day period expires!
                                </p>
                            </div>
                        </div>

                        <div className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl text-xs text-[var(--text-main)] font-medium flex items-center gap-3">
                            <span className="text-lg shrink-0">✨</span>
                            <span className="leading-relaxed">
                                For slides with randomized math problems, the button shows <strong>"Regen"</strong> instead, instantly giving the class new numbers in the same format.
                            </span>
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