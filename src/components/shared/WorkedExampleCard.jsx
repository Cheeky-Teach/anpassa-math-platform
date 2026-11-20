// src/components/shared/WorkedExampleCard.jsx
import React, { useState, useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import {
    PROMPT_TEXT_SIZE_MAP,
    PROMPT_LATEX_SIZE_MAP,
    STEP_TEXT_SIZE_MAP,
    STEP_LATEX_SIZE_MAP,
    normalizeClues,
    hasRenderableVisual,
    useVisualPan,
    PromptSection,
    VisualSection,
    ClueRowsSection,
    StackedCardBody
} from './WorkedExampleHelpers.jsx';

export default function WorkedExampleCard({
    item,
    lang = 'sv',
    isPrintMode = false,
    displayOptions = null,
    onUpdatePart = null
}) {
    if (!item) return null;

    const opts = displayOptions || {};
    const isEditable = !isPrintMode && typeof onUpdatePart === 'function';
    const compact = Boolean(opts.compact);
    const spaciousWriting = opts.writingSpace === 'generous';
    const blankStyle = opts.blankStyle || 'line';

    const leftWidthPct = Math.min(60, Math.max(22, Number(opts.leftWidthPct) || (compact ? 36 : 38)));
    const visualZoom = Math.min(1.6, Math.max(0.5, Number(opts.visualZoom) || (compact ? 0.85 : 1)));
    const visualOffsetX = Number(opts.visualOffsetX) || 0;
    const visualOffsetY = Number(opts.visualOffsetY) || 0;

    const [openMenuKey, setOpenMenuKey] = useState(null);

    useEffect(() => {
        if (!openMenuKey) return;
        const handleOutsideClick = () => {
            setOpenMenuKey(null);
        };
        window.addEventListener('click', handleOutsideClick);
        return () => window.removeEventListener('click', handleOutsideClick);
    }, [openMenuKey]);

    const { startVisualPan, activePanX, activePanY } = useVisualPan({
        isEditable,
        visualZoom,
        visualOffsetX,
        visualOffsetY,
        onUpdatePart,
        onToggleMenu: () => setOpenMenuKey((prev) => (prev === 'visual' ? null : 'visual'))
    });

    const blankHeights = opts.blankHeights || {};
    const onBlankHeightChange = opts.onBlankHeightChange || null;

    const showPromptText = opts.showPromptText !== false;
    const showPromptLatex = opts.showPromptLatex !== false;
    const showPromptOptions = opts.showPromptOptions !== false;
    const showVisual = opts.showVisual !== false;
    const showStepText = opts.showStepText !== false;
    const showStepLatex = opts.showStepLatex !== false;

    const curPromptTextSize = opts.promptTextSize || (compact ? 'xs' : 'sm');
    const curPromptLatexSize = opts.promptLatexSize || (compact ? 'xs' : 'sm');
    const curStepTextSize = opts.stepTextSize || (compact ? 'xs' : 'sm');
    const curStepLatexSize = opts.stepLatexSize || (compact ? 'xs' : 'sm');

    const promptTextClass = PROMPT_TEXT_SIZE_MAP[curPromptTextSize] || 'text-[11px]';
    const promptLatexClass = PROMPT_LATEX_SIZE_MAP[curPromptLatexSize] || 'text-sm';
    const stepTextClass = STEP_TEXT_SIZE_MAP[curStepTextSize] || 'text-[10px]';
    const stepLatexClass = STEP_LATEX_SIZE_MAP[curStepLatexSize] || 'text-[11px]';

    const solutionColStyle = opts.solutionWidthPx
        ? { width: `${Number(opts.solutionWidthPx)}px` }
        : undefined;
    const solutionColClass = opts.solutionWidthPx
        ? ''
        : compact
            ? 'w-32'
            : spaciousWriting
                ? 'w-52'
                : 'w-44';

    const stacked = Boolean(opts.stacked);
    const rd = item.resolvedData?.renderData || item.resolvedData || item.renderData || {};
    const hasVisual = hasRenderableVisual(rd);
    const clues = normalizeClues(item.clues || item.resolvedData?.clues || [], lang);
    const labelBadge = lang === 'sv' ? 'Exempel' : 'Example';

    const sharedProps = {
        item,
        rd,
        clues,
        lang,
        isEditable,
        spaciousWriting,
        blankStyle,
        hasVisual,
        showPromptText,
        showPromptLatex,
        showPromptOptions,
        showVisual,
        showStepText,
        showStepLatex,
        promptTextClass,
        promptLatexClass,
        stepTextClass,
        stepLatexClass,
        curPromptTextSize,
        curPromptLatexSize,
        curStepTextSize,
        curStepLatexSize,
        visualZoom,
        visualOffsetX,
        visualOffsetY,
        activePanX,
        activePanY,
        startVisualPan,
        solutionColStyle,
        solutionColClass,
        blankHeights,
        onBlankHeightChange,
        openMenuKey,
        setOpenMenuKey,
        onUpdatePart
    };

    return (
        <MotionConfig reducedMotion={isPrintMode ? 'always' : 'user'}>
            <div
                onClick={() => isEditable && setOpenMenuKey(null)}
                className={`whiteboard-protect worked-example-container w-full rounded-xl border-2 border-amber-400 bg-amber-50/20 ${
                    compact ? 'p-2' : spaciousWriting ? 'p-3.5 sm:p-4' : 'p-2.5 sm:p-3'
                } text-slate-900 break-inside-avoid select-none relative overflow-visible m-0`}
            >
                <div className="flex items-center gap-2 border-b border-amber-300 pb-1.5 mb-2.5">
                    <span className={`px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black ${isPrintMode && !compact ? 'text-xs' : 'text-[9px]'} uppercase tracking-wider shrink-0`}>
                        {labelBadge}
                    </span>
                    <span className={`${isPrintMode && !compact ? 'text-sm' : 'text-[10px]'} font-black uppercase tracking-wider text-amber-950 truncate`}>
                        {item.name}
                    </span>
                </div>

                {stacked ? (
                    <StackedCardBody {...sharedProps} />
                ) : (
                    <div className={`worked-example-grid flex flex-row items-stretch ${compact ? 'gap-2' : 'gap-3'} w-full`}>
                        <div
                            style={{ width: `${leftWidthPct}%` }}
                            className={`shrink-0 flex flex-col justify-between ${compact ? 'pr-1.5' : 'pr-2'} border-r border-amber-200`}
                        >
                            <PromptSection {...sharedProps} />

                            {hasVisual && (showVisual || isEditable) && (
                                <VisualSection {...sharedProps} className="w-full min-h-[120px] my-2" />
                            )}
                        </div>

                        <ClueRowsSection {...sharedProps} />
                    </div>
                )}
            </div>
        </MotionConfig>
    );
}