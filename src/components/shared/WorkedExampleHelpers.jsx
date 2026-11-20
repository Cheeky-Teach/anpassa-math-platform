// src/components/shared/WorkedExampleHelpers.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GripHorizontal, Plus, Minus, Eye, EyeOff, RotateCcw } from 'lucide-react';
import MathDisplay from './MathDisplay';
import VisualRenderer from '../visuals/VisualRenderer';
import { compileAnchoredStory } from '../../core/utils/storyCompiler';

export const SIZE_STEPS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

export const PROMPT_TEXT_SIZE_MAP = {
    xs: 'text-[10px]',
    sm: 'text-[11px]',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base',
    '2xl': 'text-lg sm:text-xl'
};

export const PROMPT_LATEX_SIZE_MAP = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-2xl',
    '2xl': 'text-2xl sm:text-3xl'
};

export const STEP_TEXT_SIZE_MAP = {
    xs: 'text-[9px]',
    sm: 'text-[10px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm',
    '2xl': 'text-base sm:text-lg'
};

export const STEP_LATEX_SIZE_MAP = {
    xs: 'text-[10px]',
    sm: 'text-[11px]',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-lg',
    '2xl': 'text-xl sm:text-2xl'
};

export function stepSize(current = 'sm', delta = 1) {
    const idx = SIZE_STEPS.indexOf(current);
    const safeIdx = idx === -1 ? 1 : idx;
    const nextIdx = Math.min(SIZE_STEPS.length - 1, Math.max(0, safeIdx + delta));
    return SIZE_STEPS[nextIdx];
}

export function normalizeClues(rawClues = [], lang = 'sv') {
    if (!Array.isArray(rawClues)) return [];
    return rawClues.map((c) => {
        if (typeof c === 'object' && c !== null) {
            return {
                text: c[lang] || c.text || '',
                latex: c.latex || null,
                isTextBlank: Boolean(c._blankText ?? c.blankText),
                isLatexBlank: Boolean(c._blankLatex ?? c.blankLatex),
                wasTextBlank: Boolean(c._wasTextBlank),
                wasLatexBlank: Boolean(c._wasLatexBlank)
            };
        }
        return {
            text: String(c),
            latex: null,
            isTextBlank: false,
            isLatexBlank: false,
            wasTextBlank: false,
            wasLatexBlank: false
        };
    });
}

export function hasRenderableVisual(rd) {
    return Boolean(
        rd && (
            rd.graph || rd.geometry || rd.pattern || rd.volume ||
            rd.marbles || rd.spinner || rd.freqTable || rd.percentGrid ||
            rd.scale || rd.similarity || rd.tree
        )
    );
}

export function useVisualPan({
    isEditable,
    visualZoom,
    visualOffsetX,
    visualOffsetY,
    onUpdatePart,
    onToggleMenu
}) {
    const [dragPan, setDragPan] = useState(null);
    const listenersRef = useRef(null);

    useEffect(() => {
        return () => {
            if (listenersRef.current) {
                window.removeEventListener('pointermove', listenersRef.current.move);
                window.removeEventListener('pointerup', listenersRef.current.up);
            }
        };
    }, []);

    const startVisualPan = (e) => {
        if (!isEditable) return;
        e.stopPropagation();

        const startX = e.clientX;
        const startY = e.clientY;
        const baseX = visualOffsetX;
        const baseY = visualOffsetY;
        const maxPanX = Math.round(56 * visualZoom);
        const maxPanY = Math.round(44 * visualZoom);
        let moved = false;

        setDragPan({ x: baseX, y: baseY });

        const handleMove = (moveEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;

            setDragPan({
                x: Math.max(-maxPanX, Math.min(maxPanX, baseX + dx)),
                y: Math.max(-maxPanY, Math.min(maxPanY, baseY + dy))
            });
        };

        const handleUp = (upEvent) => {
            const dx = upEvent.clientX - startX;
            const dy = upEvent.clientY - startY;
            const finalX = Math.max(-maxPanX, Math.min(maxPanX, baseX + dx));
            const finalY = Math.max(-maxPanY, Math.min(maxPanY, baseY + dy));

            setDragPan(null);
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('pointerup', handleUp);
            listenersRef.current = null;

            if (moved && typeof onUpdatePart === 'function') {
                onUpdatePart('visualOffset', { x: finalX, y: finalY });
            } else if (!moved && typeof onToggleMenu === 'function') {
                onToggleMenu();
            }
        };

        listenersRef.current = { move: handleMove, up: handleUp };
        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleUp);
    };

    return {
        startVisualPan,
        activePanX: dragPan ? dragPan.x : visualOffsetX,
        activePanY: dragPan ? dragPan.y : visualOffsetY
    };
}

export function FloatingPartMenu({
    onDecrease,
    onIncrease,
    onToggleHide,
    isHidden = false,
    hideLabel,
    showLabel,
    extraActions = null,
    onClose
}) {
    return (
        <div
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="print:hidden absolute -top-9 left-0 z-40 flex items-center gap-1 px-1.5 py-1 rounded-lg bg-slate-900 text-white shadow-lg border border-slate-700 text-[10px] font-bold whitespace-nowrap"
        >
            {onDecrease && (
                <button
                    type="button"
                    onClick={onDecrease}
                    className="p-1 rounded hover:bg-slate-700 cursor-pointer"
                    title="Smaller"
                >
                    <Minus size={11} />
                </button>
            )}
            {onIncrease && (
                <button
                    type="button"
                    onClick={onIncrease}
                    className="p-1 rounded hover:bg-slate-700 cursor-pointer"
                    title="Larger"
                >
                    <Plus size={11} />
                </button>
            )}
            {extraActions}
            {onToggleHide && (
                <button
                    type="button"
                    onClick={onToggleHide}
                    className="px-1.5 py-0.5 rounded hover:bg-slate-700 flex items-center gap-1 cursor-pointer"
                >
                    {isHidden ? (
                        <Eye size={11} className="text-emerald-400" />
                    ) : (
                        <EyeOff size={11} className="text-amber-300" />
                    )}
                    <span>{isHidden ? (showLabel || 'Show') : (hideLabel || 'Hide')}</span>
                </button>
            )}
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    className="px-1 text-slate-400 hover:text-white cursor-pointer"
                >
                    ×
                </button>
            )}
        </div>
    );
}

export function PrintWriteBlank({
    kind = 'line',
    spacious = false,
    hint = '',
    heightPx = null,
    onHeightChange = null,
    minHeight = 32,
    maxHeight = 220,
    multiLine = false,
    lang = 'sv'
}) {
    const [draggingHeight, setDraggingHeight] = useState(null);
    const listenersRef = useRef(null);

    useEffect(() => {
        return () => {
            if (listenersRef.current) {
                window.removeEventListener('pointermove', listenersRef.current.move);
                window.removeEventListener('pointerup', listenersRef.current.up);
            }
        };
    }, []);

    const presetDefault = spacious ? 46 : 34;
    const resolvedHeight = draggingHeight ?? heightPx ?? presetDefault;

    const handlePointerDown = (e) => {
        if (!onHeightChange) return;
        e.preventDefault();
        e.stopPropagation();

        const startY = e.clientY;
        const startHeight = resolvedHeight;
        setDraggingHeight(startHeight);

        const handlePointerMove = (moveEvent) => {
            const deltaY = moveEvent.clientY - startY;
            const rawNext = Math.max(minHeight, Math.min(maxHeight, startHeight + deltaY));
            const snapped = Math.round(rawNext / 4) * 4;
            setDraggingHeight(snapped);
        };

        const handlePointerUp = (upEvent) => {
            const deltaY = upEvent.clientY - startY;
            const rawNext = Math.max(minHeight, Math.min(maxHeight, startHeight + deltaY));
            const snapped = Math.round(rawNext / 4) * 4;

            setDraggingHeight(null);
            onHeightChange(snapped);

            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            listenersRef.current = null;
        };

        listenersRef.current = { move: handlePointerMove, up: handlePointerUp };
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
    };

    const dragBadge = onHeightChange && (
        <div className="print:hidden flex items-center justify-end gap-1 mt-auto pt-1">
            {draggingHeight !== null && (
                <span className="text-[9px] font-mono font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded pointer-events-none">
                    {draggingHeight}px
                </span>
            )}
            <button
                type="button"
                onPointerDown={handlePointerDown}
                onClick={(e) => e.stopPropagation()}
                title={lang === 'sv' ? 'Dra ned/upp för skrivhöjd' : 'Drag up/down for writing height'}
                className="px-1.5 py-0.5 rounded bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 shadow-2xs cursor-ns-resize flex items-center gap-0.5 text-[9px] font-mono font-bold"
            >
                <GripHorizontal size={11} />
                <span>{resolvedHeight}</span>
            </button>
        </div>
    );

    if (!multiLine) {
        const boxBorderClass =
            kind === 'dotted'
                ? 'border-2 border-dotted border-amber-500/80'
                : kind === 'line'
                    ? 'border border-amber-400/90'
                    : 'border-2 border-dashed border-amber-500/80';

        return (
            <div
                onPointerDown={(e) => e.stopPropagation()}
                style={{ minHeight: `${resolvedHeight}px` }}
                className={`relative w-full h-full px-2.5 pt-1.5 pb-1.5 rounded-lg ${boxBorderClass} bg-white flex flex-col justify-between select-none`}
            >
                {hint && (
                    <span className="text-[8px] font-bold uppercase tracking-wider text-amber-800/60 leading-none pointer-events-none">
                        {hint}
                    </span>
                )}
                {dragBadge}
            </div>
        );
    }

    if (kind === 'box') {
        return (
            <div
                onPointerDown={(e) => e.stopPropagation()}
                style={{ minHeight: `${resolvedHeight}px` }}
                className="relative w-full px-3 pt-1.5 pb-2 rounded-lg border-2 border-dashed border-amber-500/80 bg-white flex flex-col justify-between select-none"
            >
                {hint && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-800/70 leading-none mb-1 pointer-events-none">
                        {hint}
                    </span>
                )}
                {dragBadge}
            </div>
        );
    }

    const lineSpacingPx = spacious ? 28 : 24;
    const headerAllowancePx = hint ? 14 : 4;
    const availableHeight = Math.max(lineSpacingPx, resolvedHeight - headerAllowancePx);
    const lineCount = Math.max(1, Math.floor(availableHeight / lineSpacingPx));
    const ruleClass =
        kind === 'dotted'
            ? 'border-b-2 border-dotted border-slate-500'
            : 'border-b-2 border-slate-600/80';

    return (
        <div
            onPointerDown={(e) => e.stopPropagation()}
            style={{ minHeight: `${resolvedHeight}px` }}
            className="relative w-full pt-0.5 pb-1 flex flex-col justify-start select-none"
        >
            {hint && (
                <span className="text-[9px] font-semibold text-slate-400 leading-none mb-0.5 pointer-events-none">
                    {hint}
                </span>
            )}

            <div className="flex flex-col justify-start">
                {Array.from({ length: lineCount }).map((_, rIdx) => (
                    <div
                        key={`rule-${rIdx}`}
                        style={{ height: `${lineSpacingPx}px` }}
                        className={`w-full ${ruleClass}`}
                    />
                ))}
            </div>

            {dragBadge}
        </div>
    );
}

export function PromptSection({
    item,
    rd,
    lang,
    isEditable,
    showPromptText,
    showPromptLatex,
    showPromptOptions = true,
    promptTextClass,
    promptLatexClass,
    curPromptTextSize,
    curPromptLatexSize,
    openMenuKey,
    setOpenMenuKey,
    onUpdatePart
}) {
    const rawOptions = rd?.options || rd?.choices || rd?.alternatives || item?.options;
    const hasOptions = Array.isArray(rawOptions) && rawOptions.length > 0;

    return (
        <div className="space-y-1.5">
            <div className="text-[8px] font-black uppercase tracking-widest text-amber-900/60">
                {lang === 'sv' ? 'Uppgift' : 'Problem'}
            </div>

            {(showPromptText || isEditable) && (
                <div
                    onClick={(e) => {
                        if (!isEditable) return;
                        e.stopPropagation();
                        setOpenMenuKey((prev) => (prev === 'promptText' ? null : 'promptText'));
                    }}
                    className={`relative rounded-lg transition-colors ${
                        isEditable ? 'hover:bg-amber-100/60 cursor-pointer px-1 -mx-1' : ''
                    } ${!showPromptText ? 'border border-dashed border-amber-300 px-1.5 py-0.5 opacity-60' : ''}`}
                >
                    {isEditable && openMenuKey === 'promptText' && (
                        <FloatingPartMenu
                            onDecrease={() => onUpdatePart('promptTextSize', stepSize(curPromptTextSize, -1))}
                            onIncrease={() => onUpdatePart('promptTextSize', stepSize(curPromptTextSize, 1))}
                            onToggleHide={() => onUpdatePart('showPromptText', !showPromptText)}
                            isHidden={!showPromptText}
                            hideLabel={lang === 'sv' ? 'Dölj' : 'Hide'}
                            showLabel={lang === 'sv' ? 'Visa' : 'Show'}
                            onClose={() => setOpenMenuKey(null)}
                        />
                    )}
                    {showPromptText ? (
                        <div className={`${promptTextClass} font-bold leading-snug text-slate-900`}>
                            <MathDisplay content={compileAnchoredStory(item, lang) || rd?.description || item.name} />
                        </div>
                    ) : (
                        <span className="print:hidden text-[9px] italic text-amber-900/70">
                            {lang === 'sv' ? 'Uppgiftstext dold' : 'Problem text hidden'}
                        </span>
                    )}
                </div>
            )}

            {rd?.latex && !rd?.geometry && (showPromptLatex || isEditable) && (
                <div
                    onClick={(e) => {
                        if (!isEditable) return;
                        e.stopPropagation();
                        setOpenMenuKey((prev) => (prev === 'promptLatex' ? null : 'promptLatex'));
                    }}
                    className={`relative rounded-lg ${
                        isEditable ? 'cursor-pointer hover:ring-2 hover:ring-amber-400' : ''
                    } ${
                        showPromptLatex
                            ? `py-1.5 px-2.5 bg-white/90 border border-amber-200/80 text-center font-serif ${promptLatexClass} font-bold text-slate-950 shadow-xs overflow-x-auto`
                            : 'print:hidden py-1 px-2 border border-dashed border-amber-300 text-center opacity-60'
                    }`}
                >
                    {isEditable && openMenuKey === 'promptLatex' && (
                        <FloatingPartMenu
                            onDecrease={() => onUpdatePart('promptLatexSize', stepSize(curPromptLatexSize, -1))}
                            onIncrease={() => onUpdatePart('promptLatexSize', stepSize(curPromptLatexSize, 1))}
                            onToggleHide={() => onUpdatePart('showPromptLatex', !showPromptLatex)}
                            isHidden={!showPromptLatex}
                            hideLabel={lang === 'sv' ? 'Dölj' : 'Hide'}
                            showLabel={lang === 'sv' ? 'Visa' : 'Show'}
                            onClose={() => setOpenMenuKey(null)}
                        />
                    )}
                    {showPromptLatex ? (
                        <MathDisplay content={`$$${rd.latex}$$`} />
                    ) : (
                        <span className="text-[9px] italic text-amber-900/70">
                            {lang === 'sv' ? 'Formel dold' : 'Math hidden'}
                        </span>
                    )}
                </div>
            )}

            {hasOptions && (showPromptOptions || isEditable) && (
                <div
                    onClick={(e) => {
                        if (!isEditable) return;
                        e.stopPropagation();
                        setOpenMenuKey((prev) => (prev === 'promptOptions' ? null : 'promptOptions'));
                    }}
                    className={`relative rounded-lg ${
                        isEditable ? 'cursor-pointer hover:ring-2 hover:ring-amber-400' : ''
                    } ${
                        !showPromptOptions
                            ? 'print:hidden py-1 px-2 border border-dashed border-amber-300 text-center opacity-60'
                            : ''
                    }`}
                >
                    {isEditable && openMenuKey === 'promptOptions' && (
                        <FloatingPartMenu
                            onToggleHide={() => onUpdatePart('showPromptOptions', !showPromptOptions)}
                            isHidden={!showPromptOptions}
                            hideLabel={lang === 'sv' ? 'Dölj' : 'Hide'}
                            showLabel={lang === 'sv' ? 'Visa' : 'Show'}
                            onClose={() => setOpenMenuKey(null)}
                        />
                    )}

                    {showPromptOptions ? (
                        <div className="grid grid-cols-2 gap-1 pt-0.5">
                            {rawOptions.map((opt, optIdx) => {
                                const label = String.fromCharCode(65 + optIdx);
                                const optContent =
                                    typeof opt === 'object' && opt !== null
                                        ? opt[lang] || opt.text || opt.label || opt.latex || ''
                                        : String(opt);

                                return (
                                    <div
                                        key={`opt-${optIdx}`}
                                        className={`flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/90 border border-amber-200/80 ${promptTextClass} text-slate-900`}
                                    >
                                        <span className="font-mono font-black text-[9px] text-amber-800 shrink-0">
                                            {label}.
                                        </span>
                                        <div className="min-w-0 truncate">
                                            <MathDisplay content={optContent} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <span className="text-[9px] italic text-amber-900/70">
                            {lang === 'sv' ? 'Svarsalternativ dolda' : 'Choices hidden'}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

export function VisualSection({
    rd,
    lang,
    isEditable,
    showVisual,
    visualZoom,
    visualOffsetX,
    visualOffsetY,
    activePanX,
    activePanY,
    startVisualPan,
    openMenuKey,
    setOpenMenuKey,
    onUpdatePart,
    className = ''
}) {
    return (
        <div
            onPointerDown={showVisual ? startVisualPan : undefined}
            onClick={(e) => {
                if (!isEditable) return;
                e.stopPropagation();
                if (!showVisual) {
                    setOpenMenuKey((prev) => (prev === 'visual' ? null : 'visual'));
                }
            }}
            className={`relative flex items-center justify-center overflow-visible rounded-lg bg-white/80 border border-amber-200/80 p-2 ${
                isEditable
                    ? showVisual
                        ? 'cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-amber-400'
                        : 'cursor-pointer opacity-60'
                    : ''
            } ${className}`}
        >
            {isEditable && showVisual && (
                <div
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    className="print:hidden absolute top-1.5 right-1.5 z-20 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-900/85 text-white text-[10px] font-mono font-bold shadow-xs"
                >
                    <button
                        type="button"
                        onClick={() => {
                            const nextZoom = Math.max(0.5, Number((visualZoom - 0.1).toFixed(2)));
                            onUpdatePart('visualZoom', nextZoom);
                            const maxPan = Math.round(48 * nextZoom);
                            onUpdatePart('visualOffset', {
                                x: Math.max(-maxPan, Math.min(maxPan, visualOffsetX)),
                                y: Math.max(-maxPan, Math.min(maxPan, visualOffsetY))
                            });
                        }}
                        className="p-0.5 rounded hover:bg-slate-700 cursor-pointer"
                        title={lang === 'sv' ? 'Zooma ut' : 'Zoom out'}
                    >
                        <Minus size={10} />
                    </button>
                    <span className="px-1 select-none">{Math.round(visualZoom * 100)}%</span>
                    <button
                        type="button"
                        onClick={() => {
                            const nextZoom = Math.min(1.6, Number((visualZoom + 0.1).toFixed(2)));
                            onUpdatePart('visualZoom', nextZoom);
                        }}
                        className="p-0.5 rounded hover:bg-slate-700 cursor-pointer"
                        title={lang === 'sv' ? 'Zooma in' : 'Zoom in'}
                    >
                        <Plus size={10} />
                    </button>
                    {(visualZoom !== 1 || visualOffsetX !== 0 || visualOffsetY !== 0) && (
                        <button
                            type="button"
                            onClick={() => {
                                onUpdatePart('visualZoom', 1);
                                onUpdatePart('visualOffset', { x: 0, y: 0 });
                            }}
                            className="p-0.5 rounded hover:bg-slate-700 cursor-pointer ml-0.5"
                            title={lang === 'sv' ? 'Återställ zoom & position' : 'Reset zoom & pan'}
                        >
                            <RotateCcw size={10} />
                        </button>
                    )}
                </div>
            )}

            {isEditable && openMenuKey === 'visual' && (
                <FloatingPartMenu
                    onDecrease={() =>
                        onUpdatePart('visualZoom', Math.max(0.5, Number((visualZoom - 0.1).toFixed(2))))
                    }
                    onIncrease={() =>
                        onUpdatePart('visualZoom', Math.min(1.6, Number((visualZoom + 0.1).toFixed(2))))
                    }
                    onToggleHide={() => onUpdatePart('showVisual', !showVisual)}
                    isHidden={!showVisual}
                    hideLabel={lang === 'sv' ? 'Dölj' : 'Hide'}
                    showLabel={lang === 'sv' ? 'Visa' : 'Show'}
                    extraActions={
                        <button
                            type="button"
                            onClick={() => {
                                onUpdatePart('visualZoom', 1);
                                onUpdatePart('visualOffset', { x: 0, y: 0 });
                            }}
                            className="p-1 rounded hover:bg-slate-700 cursor-pointer"
                            title={lang === 'sv' ? 'Återställ position & zoom' : 'Reset position & zoom'}
                        >
                            <RotateCcw size={11} />
                        </button>
                    }
                    onClose={() => setOpenMenuKey(null)}
                />
            )}

            {showVisual ? (
                <div
                    style={{
                        transform: `translate(${activePanX}px, ${activePanY}px) scale(${visualZoom})`
                    }}
                    className="w-fit h-fit flex items-center justify-center origin-center"
                >
                    <VisualRenderer data={rd} isWordProblem={false} />
                </div>
            ) : (
                <span className="print:hidden text-[9px] italic text-amber-900/70">
                    {lang === 'sv' ? 'Figur dold' : 'Visual hidden'}
                </span>
            )}
        </div>
    );
}

const STEP_TRANSITION = {
    type: 'spring',
    stiffness: 420,
    damping: 32,
    mass: 0.7
};

const CONTENT_REVEAL_TRANSITION = {
    duration: 0.22,
    ease: [0.22, 1, 0.36, 1]
};

export function ClueRowsSection({
    clues,
    lang,
    isEditable,
    spaciousWriting,
    blankStyle,
    showStepText,
    showStepLatex,
    stepTextClass,
    stepLatexClass,
    curStepTextSize,
    curStepLatexSize,
    solutionColStyle,
    solutionColClass,
    blankHeights,
    onBlankHeightChange,
    openMenuKey,
    setOpenMenuKey,
    onUpdatePart
}) {
    return (
        <div className={`w-full min-w-0 flex flex-col justify-start ${spaciousWriting ? 'space-y-2.5' : 'space-y-1.5'}`}>
            <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-amber-900/60 pb-0.5 border-b border-amber-200/60">
                <span>{lang === 'sv' ? 'Steg / Förklaring' : 'Steps / Explanation'}</span>
                <span style={solutionColStyle} className={`${solutionColClass} shrink-0 text-center`}>
                    {lang === 'sv' ? 'Lösning' : 'Solution'}
                </span>
            </div>

            <AnimatePresence initial={false}>
                {clues.map((step, idx) => {
                    const hasBlank = step.isTextBlank || step.isLatexBlank;
                    const textMenuKey = `step-${idx}-text`;
                    const latexMenuKey = `step-${idx}-latex`;

                    return (
                        <motion.div
                            key={`step-${idx}`}
                            layout="position"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6, transition: { duration: 0.14 } }}
                            transition={STEP_TRANSITION}
                            className={`flex ${hasBlank ? 'items-start' : 'items-center'} justify-between gap-2 ${
                                spaciousWriting ? 'py-1.5' : 'py-0.5'
                            } border-b border-amber-100/70 last:border-0`}
                        >
                            <div className="flex items-start gap-1.5 min-w-0 flex-1 pr-1">
                                <span className="font-mono font-black text-[9px] text-amber-900 shrink-0 mt-0.5">
                                    {idx + 1}.
                                </span>

                                <div
                                    onClick={(e) => {
                                        if (!isEditable) return;
                                        e.stopPropagation();
                                        setOpenMenuKey((prev) => (prev === textMenuKey ? null : textMenuKey));
                                    }}
                                    className={`relative flex-1 min-w-0 rounded ${
                                        isEditable ? 'cursor-pointer hover:bg-amber-100/60 px-1 -mx-1' : ''
                                    }`}
                                >
                                    {isEditable && openMenuKey === textMenuKey && (
                                        <FloatingPartMenu
                                            onDecrease={() => onUpdatePart('stepTextSize', stepSize(curStepTextSize, -1))}
                                            onIncrease={() => onUpdatePart('stepTextSize', stepSize(curStepTextSize, 1))}
                                            onToggleHide={() => onUpdatePart('toggleClueBlank', { idx, field: 'blankText' })}
                                            isHidden={step.isTextBlank}
                                            hideLabel={lang === 'sv' ? 'Lucka' : 'Blank'}
                                            showLabel={lang === 'sv' ? 'Visa text' : 'Show text'}
                                            onClose={() => setOpenMenuKey(null)}
                                        />
                                    )}

                                    <AnimatePresence mode="wait" initial={false}>
                                        {!showStepText ? (
                                            <motion.span
                                                key="text-hidden"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={CONTENT_REVEAL_TRANSITION}
                                                className="text-[9px] italic text-slate-400"
                                            >
                                                {lang === 'sv' ? 'Dold' : 'Hidden'}
                                            </motion.span>
                                        ) : step.isTextBlank ? (
                                            <motion.div
                                                key="text-blank"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={CONTENT_REVEAL_TRANSITION}
                                            >
                                                <PrintWriteBlank
                                                    kind={blankStyle}
                                                    spacious={spaciousWriting}
                                                    multiLine={true}
                                                    lang={lang}
                                                    hint={lang === 'sv' ? 'Skriv förklaring' : 'Write explanation'}
                                                    heightPx={blankHeights[`${idx}:text`] ?? null}
                                                    onHeightChange={
                                                        onBlankHeightChange
                                                            ? (nextH) => onBlankHeightChange(idx, 'text', nextH)
                                                            : null
                                                    }
                                                />
                                            </motion.div>
                                        ) : (
                                            <motion.span
                                                key="text-shown"
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={CONTENT_REVEAL_TRANSITION}
                                                className={`block ${stepTextClass} leading-snug ${
                                                    step.wasTextBlank
                                                        ? 'font-extrabold text-slate-950 px-2 py-1 rounded-md border-2 border-dashed border-emerald-600/80 bg-emerald-50/40'
                                                        : 'font-semibold text-slate-800'
                                                }`}
                                            >
                                                {step.wasTextBlank && (
                                                    <span
                                                        className="inline-block mr-1 font-mono font-extrabold text-emerald-700"
                                                        title={lang === 'sv' ? 'Lucka i elevversionen' : 'Blank in student version'}
                                                    >
                                                        *
                                                    </span>
                                                )}
                                                <MathDisplay content={step.text} />
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div
                                style={solutionColStyle}
                                onClick={(e) => {
                                    if (!isEditable || !step.latex) return;
                                    e.stopPropagation();
                                    setOpenMenuKey((prev) => (prev === latexMenuKey ? null : latexMenuKey));
                                }}
                                className={`relative ${solutionColClass} shrink-0 flex flex-col items-stretch justify-center rounded-md ${
                                    spaciousWriting ? 'min-h-[38px] p-1' : 'py-0.5 px-1'
                                } ${
                                    step.isLatexBlank
                                        ? 'bg-transparent'
                                        : step.wasLatexBlank
                                            ? 'bg-emerald-50/40 border-2 border-dashed border-emerald-600/80 shadow-xs'
                                            : 'bg-white/90 border border-amber-200/70 shadow-xs'
                                } ${isEditable && step.latex ? 'cursor-pointer hover:ring-2 hover:ring-amber-400' : ''}`}
                            >
                                {isEditable && openMenuKey === latexMenuKey && (
                                    <FloatingPartMenu
                                        onDecrease={() => onUpdatePart('stepLatexSize', stepSize(curStepLatexSize, -1))}
                                        onIncrease={() => onUpdatePart('stepLatexSize', stepSize(curStepLatexSize, 1))}
                                        onToggleHide={() => onUpdatePart('toggleClueBlank', { idx, field: 'blankLatex' })}
                                        isHidden={step.isLatexBlank}
                                        hideLabel={lang === 'sv' ? 'Lucka' : 'Blank'}
                                        showLabel={lang === 'sv' ? 'Visa formel' : 'Show math'}
                                        onClose={() => setOpenMenuKey(null)}
                                    />
                                )}

                                <AnimatePresence mode="wait" initial={false}>
                                    {!showStepLatex ? (
                                        <motion.span
                                            key="latex-hidden"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={CONTENT_REVEAL_TRANSITION}
                                            className="text-[9px] italic text-slate-400 text-center"
                                        >
                                            {lang === 'sv' ? 'Dold' : 'Hidden'}
                                        </motion.span>
                                    ) : step.isLatexBlank ? (
                                        <motion.div
                                            key="latex-blank"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={CONTENT_REVEAL_TRANSITION}
                                        >
                                            <PrintWriteBlank
                                                kind={blankStyle}
                                                spacious={spaciousWriting}
                                                multiLine={false}
                                                lang={lang}
                                                hint={lang === 'sv' ? 'Uträkning' : 'Working'}
                                                heightPx={blankHeights[`${idx}:latex`] ?? null}
                                                onHeightChange={
                                                    onBlankHeightChange
                                                        ? (nextH) => onBlankHeightChange(idx, 'latex', nextH)
                                                        : null
                                                }
                                            />
                                        </motion.div>
                                    ) : step.latex ? (
                                        <motion.div
                                            key="latex-shown"
                                            initial={{ opacity: 0, y: 5, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={CONTENT_REVEAL_TRANSITION}
                                            className={`relative font-serif ${stepLatexClass} font-bold text-slate-950 text-center py-0.5`}
                                        >
                                            {step.wasLatexBlank && (
                                                <span
                                                    className="absolute top-0 right-0.5 font-mono text-[10px] font-extrabold text-emerald-700 leading-none"
                                                    title={lang === 'sv' ? 'Lucka i elevversionen' : 'Blank in student version'}
                                                >
                                                    *
                                                </span>
                                            )}
                                            <MathDisplay content={`$$${step.latex}$$`} />
                                        </motion.div>
                                    ) : (
                                        <motion.span
                                            key="latex-see-text"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={CONTENT_REVEAL_TRANSITION}
                                            className="text-[9px] italic text-slate-400 text-center"
                                        >
                                            {lang === 'sv' ? 'Se text' : 'See text'}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}

export function StackedCardBody(props) {
    const { hasVisual, showVisual, isEditable } = props;
    const showVisualBox = hasVisual && (showVisual || isEditable);

    return (
        <div className="flex flex-col gap-2.5 w-full">
            <div className="flex flex-row items-start justify-between gap-3 pb-2 border-b border-amber-200/80">
                <div className={showVisualBox ? 'flex-1 min-w-0' : 'w-full'}>
                    <PromptSection {...props} />
                </div>

                {showVisualBox && (
                    <VisualSection {...props} className="w-28 sm:w-40 lg:w-48 shrink-0 min-h-[104px]" />
                )}
            </div>

            <ClueRowsSection {...props} />
        </div>
    );
}