// src/components/shared/UnitStudyGuideBanner.jsx
import React, { useState, useMemo } from 'react';
import {
    BookOpen, Target, Beaker, Layers, ChevronDown, ChevronUp,
    HelpCircle, CheckCircle2, Compass, ChevronLeft
} from 'lucide-react';
import { CATEGORIES } from '../../constants/localization';

const getTopicAndCategory = (topicId, lang = 'sv') => {
    if (!topicId) return { topicName: '', categoryName: '' };
    for (const catKey in CATEGORIES) {
        const cat = CATEGORIES[catKey];
        const found = cat?.topics?.find(t => t.id === topicId);
        if (found) {
            return {
                topicName: found.label?.[lang] || found.label?.sv || topicId,
                categoryName: cat.label?.[lang] || cat.label?.sv || catKey
            };
        }
    }
    return { topicName: topicId.replace(/_/g, ' '), categoryName: '' };
};

export default function UnitStudyGuideBanner({
    bucket,
    completedStepIds = [],
    lang = 'sv',
    onOpenTestLab = null,
    onChangeUnit = null
}) {
    const parts = Array.isArray(bucket?.payload) ? bucket.payload : [];
    const totalSteps = parts.reduce((acc, p) => acc + (p.steps?.length || 0), 0);
    const completedCount = completedStepIds.length;

    const [isGuideOpen, setIsGuideOpen] = useState(completedCount === 0);

    const summary = useMemo(() => {
        const catSet = new Set();
        const topicSet = new Set();
        let walkthroughs = 0;
        let levels = 0;
        let checkpoints = 0;

        parts.forEach(part => {
            (part.steps || []).forEach(step => {
                if (step.type === 'instruction' || step.sheetId) {
                    walkthroughs++;
                } else if (step.type === 'test') {
                    checkpoints++;
                } else {
                    levels++;
                    const tId = step.topic || step.topicId;
                    const { topicName, categoryName } = getTopicAndCategory(tId, lang);
                    if (categoryName) catSet.add(categoryName);
                    if (topicName) topicSet.add(topicName);
                }
            });
        });

        return {
            categories: Array.from(catSet),
            topics: Array.from(topicSet),
            walkthroughs,
            levels,
            checkpoints
        };
    }, [parts, lang]);

    if (!bucket || bucket === 'FREE_PLAY') return null;

    const progressPct = totalSteps > 0 ? Math.min(100, Math.round((completedCount / totalSteps) * 100)) : 0;

    const t = {
        sv: {
            eyebrow: "Studieplan & Arbetsordning",
            orderIntro: "Arbeta igenom delarna nedan i ordning uppifrån och ned. Varje steg bockas av automatiskt när du är klar.",
            toggleShow: "Instruktioner",
            toggleHide: "Dölj guide",
            step1Title: "1. Börja med genomgången",
            step1Desc: "Öppna eventuella genomgångar först för att se hur uppgifterna löses steg för steg.",
            step2Title: "2. Träna nivå för nivå",
            step2Desc: "Gör övningsnivåerna i ordning. Kör du fast? Klicka på Hjälp / Exempel inne i uppgiften.",
            step3Title: "3. Testa dig själv i delprov & Test Lab",
            step3Desc: "Avsluta med delproven, eller bygg egna övningspass på svåra nivåer i Test Lab inför prov.",
            openTestLab: "Test Lab",
            changeUnit: "Byt område",
            completedLabel: "avklarade steg"
        },
        en: {
            eyebrow: "Unit Study Guide & Roadmap",
            orderIntro: "Work through the parts below in order from top to bottom. Each step checks off automatically as you complete it.",
            toggleShow: "Instructions",
            toggleHide: "Hide guide",
            step1Title: "1. Start with walkthroughs",
            step1Desc: "Open any walkthrough slides first to see worked step-by-step derivations.",
            step2Title: "2. Practice level by level",
            step2Desc: "Complete the practice levels in sequence. Stuck? Click Help / Example inside any question.",
            step3Title: "3. Check understanding in Checkpoints & Test Lab",
            step3Desc: "Finish with checkpoints, or build custom practice sessions on tricky levels in Test Lab.",
            openTestLab: "Test Lab",
            changeUnit: "Change Unit",
            completedLabel: "steps completed"
        }
    }[lang] || {};

    return (
        <div className="bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-2xl p-4 sm:p-5 mb-4 shadow-2xs space-y-4 font-sans text-[var(--text-main)]">
            
            {/* TOP NAVIGATION & CONTEXT BAR (Impossible-to-miss Back / Change Unit anchor) */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-[var(--border-main)]">
                <div className="flex items-center gap-2.5 flex-wrap">
                    {onChangeUnit && (
                        <button
                            type="button"
                            onClick={onChangeUnit}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:bg-emerald-600 text-[var(--text-main)] hover:text-white border border-[var(--border-strong)] hover:border-emerald-600 text-xs font-extrabold transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
                        >
                            <ChevronLeft size={15} strokeWidth={2.5} />
                            <span>{t.changeUnit}</span>
                        </button>
                    )}

                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        <Compass size={14} />
                        <span>{t.eyebrow}</span>
                        {bucket.folder && (
                            <>
                                <span className="text-[var(--text-muted)]">•</span>
                                <span className="text-[var(--text-muted)]">{bucket.folder}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Right-Aligned Workspace Tools (Test Lab | Guide Toggle) */}
                <div className="inline-flex items-center bg-[var(--bg-surface)] p-1 rounded-xl border border-[var(--border-main)]">
                    {onOpenTestLab && (
                        <button
                            type="button"
                            onClick={onOpenTestLab}
                            className="px-3 py-1 rounded-lg text-xs font-bold text-amber-800 dark:text-amber-300 hover:bg-[var(--bg-card)] flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                            <Beaker size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>{t.openTestLab}</span>
                        </button>
                    )}

                    {onOpenTestLab && (
                        <div className="w-px h-4 bg-[var(--border-strong)] mx-1 shrink-0" />
                    )}

                    <button
                        type="button"
                        onClick={() => setIsGuideOpen(prev => !prev)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isGuideOpen
                                ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-2xs border border-[var(--border-main)]'
                                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                        }`}
                    >
                        <HelpCircle size={13} className="text-sky-600 shrink-0" />
                        <span>{isGuideOpen ? t.toggleHide : t.toggleShow}</span>
                        {isGuideOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                </div>
            </div>

            {/* MAIN HEADER ROW: Unit Title & Pills Left + Progress Card Right */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0 flex-1">
                    <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-[var(--text-main)]">
                        {bucket.name}
                    </h2>

                    <p className="text-xs font-medium text-[var(--text-muted)]">
                        {t.orderIntro}
                    </p>

                    {/* Topic & Category Summary Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {summary.categories.map(cat => (
                            <span
                                key={cat}
                                className="px-2.5 py-0.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-main)] text-[11px] font-bold text-[var(--text-main)]"
                            >
                                {cat}
                            </span>
                        ))}
                        {summary.topics.map(tp => (
                            <span
                                key={tp}
                                className="px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold text-emerald-900 dark:text-emerald-300"
                            >
                                {tp}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Progress Bar Readout */}
                {totalSteps > 0 && (
                    <div className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl px-4 py-2.5 shrink-0 lg:min-w-[230px]">
                        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                            <span className="text-[var(--text-muted)] flex items-center gap-1.5">
                                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                                <span>{completedCount} / {totalSteps} {t.completedLabel}</span>
                            </span>
                            <span className="font-mono text-emerald-700 dark:text-emerald-400">
                                {progressPct}%
                            </span>
                        </div>
                        <div className="w-full h-2 bg-[var(--bg-card)] rounded-full overflow-hidden border border-[var(--border-main)]">
                            <div
                                className="h-full bg-emerald-600 transition-all duration-300"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Collapsible 3-Step Student Instructions */}
            {isGuideOpen && (
                <div className="pt-3 border-t border-[var(--border-main)] grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in duration-150">
                    <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-sky-800 dark:text-sky-300">
                            <BookOpen size={14} />
                            <span>{t.step1Title}</span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                            {t.step1Desc}
                        </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-800 dark:text-emerald-300">
                            <Target size={14} />
                            <span>{t.step2Title}</span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                            {t.step2Desc}
                        </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-800 dark:text-amber-300">
                            <Layers size={14} />
                            <span>{t.step3Title}</span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                            {t.step3Desc}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}