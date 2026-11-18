// src/components/shared/QuestionPromptCard.jsx
import React, { useMemo } from 'react';
import MathDisplay from './MathDisplay';
import VisualRenderer from '../visuals/VisualRenderer';
import WordProblemVisualGuard from '../ui/WordProblemVisualGuard';

export default function QuestionPromptCard({
    question,
    lang = 'sv',
    isWordProblem = false,
    showText = true,
    showLatex = true,
    showVisual = true,
    allowVisualReveal = true,
    headerSlot = null,
    footerSlot = null,
    layout = 'stacked', // 'stacked' | 'compact'
    className = ''
}) {
    const rd = useMemo(() => {
        if (!question) return {};
        return question.resolvedData?.renderData || question.renderData || question;
    }, [question]);

    const effectiveWordProblem = Boolean(
        isWordProblem ||
        rd?.isWordProblemApplied ||
        question?.metadata?.isWordProblemApplied ||
        question?.resolvedData?.metadata?.isWordProblemApplied ||
        (question?.selectedStoryIndex !== null && question?.selectedStoryIndex !== undefined)
    );

    const descriptionText = useMemo(() => {
        const raw = rd?.description ?? question?.text ?? question?.prompt ?? '';
        if (typeof raw === 'object' && raw !== null) {
            return raw[lang] || raw.sv || raw.en || '';
        }
        return String(raw || '');
    }, [rd, question, lang]);

    const hasVisual = Boolean(
        rd?.geometry ||
        rd?.graph ||
        rd?.pattern ||
        rd?.marbles ||
        rd?.diagram ||
        rd?.visualType ||
        rd?.frequencyTable
    );

    const alwaysShowVisual = Boolean(
        rd?.graph ||
        rd?.geometry?.type === 'frequency_table' ||
        rd?.frequencyTable
    );

    const shouldRenderLatex = Boolean(
        showLatex &&
        rd?.latex &&
        !effectiveWordProblem &&
        !rd?.hideLatex &&
        !question?.hideLatex &&
        !rd?.geometry
    );

    const questionKey =
        question?.variationKey ||
        question?.metadata?.variation_key ||
        question?.metadata?.variationKey ||
        question?.id;

    if (!question) return null;

    return (
        <div className={`w-full flex flex-col justify-between ${className}`}>
            {headerSlot && (
                <div className="w-full shrink-0">
                    {headerSlot}
                </div>
            )}

            {/* Top Visual & Equation Stage */}
            {(hasVisual || shouldRenderLatex) && (
                <div
                    className={`w-full whiteboard-protect flex flex-col justify-center items-center border-b border-[var(--border-main)] relative overflow-hidden ${
                        layout === 'compact' ? 'py-2.5 px-3 min-h-[120px]' : 'py-3 sm:py-4 px-4 min-h-[150px] sm:min-h-[190px]'
                    }`}
                >
                    <WordProblemVisualGuard
                        isActive={effectiveWordProblem}
                        lang={lang}
                        questionKey={questionKey}
                        alwaysShow={alwaysShowVisual}
                        allowReveal={allowVisualReveal}
                    >
                        <div className="w-full flex flex-col justify-center items-center gap-3">
                            {showVisual && hasVisual && (
                                <div className="w-full max-w-[420px] min-h-[100px] flex justify-center items-center mx-auto overflow-visible empty:hidden">
                                    <VisualRenderer
                                        data={rd}
                                        isWordProblem={effectiveWordProblem}
                                    />
                                </div>
                            )}

                            {shouldRenderLatex && (
                                <div className="text-2xl xl:text-3xl font-serif text-[var(--text-main)] flex justify-center items-center text-center px-4 max-w-full overflow-x-auto no-scrollbar">
                                    <MathDisplay content={`$$${rd.latex}$$`} />
                                </div>
                            )}
                        </div>
                    </WordProblemVisualGuard>
                </div>
            )}

            {/* Prompt Description */}
            {showText && descriptionText && (
                <div className={`${layout === 'compact' ? 'py-4 px-3' : 'py-5 sm:py-6 px-4'} text-center max-w-2xl mx-auto`}>
                    <div className="text-lg sm:text-xl font-bold text-[var(--text-main)] leading-relaxed">
                        <MathDisplay content={descriptionText} />
                    </div>
                </div>
            )}

            {footerSlot && (
                <div className="w-full shrink-0">
                    {footerSlot}
                </div>
            )}
        </div>
    );
}