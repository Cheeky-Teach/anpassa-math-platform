// src/components/shared/WorkedExampleHelpers.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Eye,
    EyeOff,
    Minus,
    Plus,
    GripHorizontal,
    RotateCcw,
    Pencil,
    Check,
    X
} from 'lucide-react';
import MathDisplay from './MathDisplay';
import VisualRenderer from '../visuals/VisualRenderer';
import { compileAnchoredStory } from '../../core/utils/storyCompiler';
import { resolveCardTheme } from './posterThemes';

export const SIZE_STEPS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl'];

export const PROMPT_TEXT_SIZE_MAP = {
    xs: 'text-[10px]',
    sm: 'text-[11px]',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base',
    '2xl': 'text-xl',
    '3xl': 'text-2xl',
    '4xl': 'text-3xl',
    '5xl': 'text-4xl',
    '6xl': 'text-5xl',
    '7xl': 'text-6xl'
};

export const PROMPT_LATEX_SIZE_MAP = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-2xl',
    '2xl': 'text-3xl',
    '3xl': 'text-4xl',
    '4xl': 'text-5xl',
    '5xl': 'text-6xl',
    '6xl': 'text-7xl',
    '7xl': 'text-8xl'
};

export const STEP_TEXT_SIZE_MAP = {
    xs: 'text-[9px]',
    sm: 'text-[10px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm',
    '2xl': 'text-lg',
    '3xl': 'text-xl',
    '4xl': 'text-2xl',
    '5xl': 'text-3xl',
    '6xl': 'text-4xl',
    '7xl': 'text-5xl'
};

export const STEP_LATEX_SIZE_MAP = {
    xs: 'text-[10px]',
    sm: 'text-[11px]',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-lg',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
    '6xl': 'text-6xl',
    '7xl': 'text-7xl'
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
            style={{
                transform: 'scale(var(--slot-inv-scale, 1))',
                transformOrigin: 'top left'
            }}
            className="print:hidden absolute top-full mt-1 left-0 z-40 flex items-center gap-1 px-1.5 py-1 rounded-lg bg-slate-900 text-white shadow-lg border border-slate-700 text-[10px] font-bold whitespace-nowrap"
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

function renderCompactOptions(options = []) {
    return (
        <div className="grid grid-cols-2 gap-1.5 pt-1">
            {options.map((opt, idx) => (
                <div
                    key={`opt-${idx}`}
                    className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-800 flex items-center gap-1.5"
                >
                    <span className="font-mono font-bold text-slate-400">
                        {String.fromCharCode(65 + idx)}.
                    </span>
                    <MathDisplay content={String(opt)} />
                </div>
            ))}
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
    showPromptOptions,
    promptTextClass,
    promptLatexClass,
    curPromptTextSize,
    curPromptLatexSize,
    openMenuKey,
    setOpenMenuKey,
    onUpdatePart
}) {
    const [editingPrompt, setEditingPrompt] = useState(false);

    const compiledStory =
        item?.selectedStoryIndex !== null &&
        item?.selectedStoryIndex !== undefined &&
        Array.isArray(rd?.availableStories)
            ? compileAnchoredStory(rd, item.selectedStoryIndex, lang)
            : null;

    const description =
        compiledStory?.description ||
        rd?.description ||
        rd?.text ||
        item?.promptText ||
        '';

    const [promptDraft, setPromptDraft] = useState(description);

    useEffect(() => {
        if (!editingPrompt) setPromptDraft(description);
    }, [description, editingPrompt]);

    const commitPromptEdit = () => {
        setEditingPrompt(false);
        if (promptDraft !== description) {
            onUpdatePart?.('editPromptText', promptDraft);
        }
    };

    return (
        <div className="space-y-2">
            {(description || !showPromptText) && (showPromptText || isEditable) && (
                <div className="relative group/part">
                    {editingPrompt && isEditable ? (
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="space-y-1.5 bg-white p-2 rounded-lg border-2 border-emerald-500 shadow-sm"
                        >
                            <textarea
                                autoFocus
                                rows={2}
                                value={promptDraft}
                                onChange={(e) => setPromptDraft(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        commitPromptEdit();
                                    } else if (e.key === 'Escape') {
                                        setEditingPrompt(false);
                                        setPromptDraft(description);
                                    }
                                }}
                                className="w-full text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded px-2 py-1 outline-none focus:border-emerald-600 resize-y"
                            />
                            <div className="flex justify-end gap-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingPrompt(false);
                                        setPromptDraft(description);
                                    }}
                                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                                >
                                    {lang === 'sv' ? 'Avbryt' : 'Cancel'}
                                </button>
                                <button
                                    type="button"
                                    onClick={commitPromptEdit}
                                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                                >
                                    {lang === 'sv' ? 'Spara' : 'Apply'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {isEditable && openMenuKey === 'promptText' && (
                                <FloatingPartMenu
                                    onDecrease={() =>
                                        onUpdatePart('promptTextSize', stepSize(curPromptTextSize, -1))
                                    }
                                    onIncrease={() =>
                                        onUpdatePart('promptTextSize', stepSize(curPromptTextSize, 1))
                                    }
                                    onToggleHide={() => onUpdatePart('showPromptText', !showPromptText)}
                                    isHidden={!showPromptText}
                                    hideLabel={lang === 'sv' ? 'Dölj' : 'Hide'}
                                    showLabel={lang === 'sv' ? 'Visa' : 'Show'}
                                    extraActions={
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setOpenMenuKey(null);
                                                setPromptDraft(description);
                                                setEditingPrompt(true);
                                            }}
                                            className="px-1.5 py-0.5 rounded hover:bg-slate-700 flex items-center gap-1 cursor-pointer"
                                            title={lang === 'sv' ? 'Redigera text' : 'Edit text'}
                                        >
                                            <Pencil size={10} />
                                            <span>{lang === 'sv' ? 'Ändra' : 'Edit'}</span>
                                        </button>
                                    }
                                    onClose={() => setOpenMenuKey(null)}
                                />
                            )}

                            <div
                                onClick={(e) => {
                                    if (!isEditable) return;
                                    e.stopPropagation();
                                    setOpenMenuKey((prev) => (prev === 'promptText' ? null : 'promptText'));
                                }}
                                onDoubleClick={(e) => {
                                    if (!isEditable) return;
                                    e.stopPropagation();
                                    setOpenMenuKey(null);
                                    setPromptDraft(description);
                                    setEditingPrompt(true);
                                }}
                                className={`rounded-lg transition-all ${
                                    isEditable
                                        ? 'cursor-pointer hover:ring-2 hover:ring-amber-400 px-1.5 py-0.5 -mx-1.5'
                                        : ''
                                }`}
                            >
                                {showPromptText ? (
                                    <div className={`${promptTextClass} font-semibold text-slate-800 leading-snug`}>
                                        <MathDisplay content={description} />
                                    </div>
                                ) : (
                                    <div className="print:hidden text-[11px] font-mono italic text-slate-400 border border-dashed border-slate-300 rounded-lg px-2.5 py-1 bg-slate-50/70">
                                        {lang === 'sv' ? 'Text dold (klicka för att visa)' : 'Text hidden (click to restore)'}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}

            {rd?.latex && !rd?.geometry && (showPromptLatex || isEditable) && (
                <div className="relative group/part">
                    {isEditable && openMenuKey === 'promptLatex' && (
                        <FloatingPartMenu
                            onDecrease={() =>
                                onUpdatePart('promptLatexSize', stepSize(curPromptLatexSize, -1))
                            }
                            onIncrease={() =>
                                onUpdatePart('promptLatexSize', stepSize(curPromptLatexSize, 1))
                            }
                            onToggleHide={() => onUpdatePart('showPromptLatex', !showPromptLatex)}
                            isHidden={!showPromptLatex}
                            hideLabel={lang === 'sv' ? 'Dölj' : 'Hide'}
                            showLabel={lang === 'sv' ? 'Visa' : 'Show'}
                            onClose={() => setOpenMenuKey(null)}
                        />
                    )}

                    <div
                        onClick={(e) => {
                            if (!isEditable) return;
                            e.stopPropagation();
                            setOpenMenuKey((prev) => (prev === 'promptLatex' ? null : 'promptLatex'));
                        }}
                        className={`rounded-xl transition-all ${
                            isEditable ? 'cursor-pointer hover:ring-2 hover:ring-amber-400' : ''
                        }`}
                    >
                        {showPromptLatex ? (
                            <div
                                className={`bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs text-center font-serif ${promptLatexClass} font-bold text-slate-950 overflow-x-auto`}
                            >
                                <MathDisplay content={`$$${rd.latex}$$`} />
                            </div>
                        ) : (
                            <div className="print:hidden text-[11px] font-mono italic text-slate-400 border border-dashed border-slate-300 rounded-xl px-2.5 py-1.5 text-center bg-slate-50/70">
                                {lang === 'sv' ? 'Formel dold (klicka för att visa)' : 'Equation hidden (click to restore)'}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {rd?.options && rd.options.length > 0 && (showPromptOptions || isEditable) && (
                <div className="relative group/part">
                    {isEditable && openMenuKey === 'promptOptions' && (
                        <FloatingPartMenu
                            onToggleHide={() => onUpdatePart('showPromptOptions', !showPromptOptions)}
                            isHidden={!showPromptOptions}
                            hideLabel={lang === 'sv' ? 'Dölj' : 'Hide'}
                            showLabel={lang === 'sv' ? 'Visa' : 'Show'}
                            onClose={() => setOpenMenuKey(null)}
                        />
                    )}

                    <div
                        onClick={(e) => {
                            if (!isEditable) return;
                            e.stopPropagation();
                            setOpenMenuKey((prev) => (prev === 'promptOptions' ? null : 'promptOptions'));
                        }}
                        className={isEditable ? 'cursor-pointer hover:ring-2 hover:ring-amber-400 rounded-lg' : ''}
                    >
                        {showPromptOptions ? (
                            renderCompactOptions(rd.options)
                        ) : (
                            <div className="print:hidden text-[11px] font-mono italic text-slate-400 border border-dashed border-slate-300 rounded-lg px-2.5 py-1 text-center bg-slate-50/70">
                                {lang === 'sv' ? 'Alternativ dolda' : 'Options hidden'}
                            </div>
                        )}
                    </div>
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

const ROW_ENTER_TRANSITION = {
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
    clues = [],
    lang = 'sv',
    isEditable = false,
    spaciousWriting = false,
    blankStyle = 'line',
    showStepText = true,
    showStepLatex = true,
    stepTextClass = 'text-[10px]',
    stepLatexClass = 'text-[11px]',
    curStepTextSize = 'sm',
    curStepLatexSize = 'sm',
    solutionColStyle,
    solutionColClass = 'w-44',
    blankHeights = {},
    onBlankHeightChange = null,
    openMenuKey = null,
    setOpenMenuKey = null,
    onUpdatePart = null,
    cardTheme = null
}) {
    const [editingField, setEditingField] = useState(null); // { idx, kind: 'text' | 'latex', value: string }

    const commitStepEdit = () => {
        if (!editingField) return;
        const { idx, kind, value } = editingField;
        setEditingField(null);
        if (kind === 'text') {
            onUpdatePart?.('editClueText', { idx, text: value });
        } else if (kind === 'latex') {
            onUpdatePart?.('editClueLatex', { idx, latex: value });
        }
    };

    return (
        <div className="flex-1 min-w-0 flex flex-col">
            <div className="relative flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900/80">
                    {lang === 'sv' ? 'Lösning steg-för-steg' : 'Step-by-Step Solution'}
                </span>

                {isEditable && (
                    <div
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            transform: 'scale(var(--slot-inv-scale, 1))',
                            transformOrigin: 'top right'
                        }}
                        className="print:hidden flex items-center gap-1.5 z-20"
                    >
                        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg bg-slate-900 text-white text-[9px] font-mono font-bold shadow-2xs">
                            <span className="text-slate-300 pr-0.5">Text</span>
                            <button
                                type="button"
                                onClick={() =>
                                    onUpdatePart?.('stepTextSize', stepSize(curStepTextSize, -1))
                                }
                                disabled={SIZE_STEPS.indexOf(curStepTextSize) <= 0}
                                className="p-0.5 rounded hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                                title={lang === 'sv' ? 'Mindre stegtext' : 'Smaller step text'}
                            >
                                <Minus size={10} />
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    onUpdatePart?.('stepTextSize', stepSize(curStepTextSize, 1))
                                }
                                disabled={SIZE_STEPS.indexOf(curStepTextSize) >= SIZE_STEPS.length - 1}
                                className="p-0.5 rounded hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                                title={lang === 'sv' ? 'Större stegtext' : 'Larger step text'}
                            >
                                <Plus size={10} />
                            </button>
                            <button
                                type="button"
                                onClick={() => onUpdatePart?.('showStepText', !showStepText)}
                                className="p-0.5 rounded hover:bg-slate-700 cursor-pointer"
                                title={showStepText ? (lang === 'sv' ? 'Dölj' : 'Hide') : (lang === 'sv' ? 'Visa' : 'Show')}
                            >
                                {showStepText ? (
                                    <Eye size={10} className="text-amber-300" />
                                ) : (
                                    <EyeOff size={10} className="text-emerald-400" />
                                )}
                            </button>
                        </div>

                        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg bg-slate-900 text-white text-[9px] font-mono font-bold shadow-2xs">
                            <span className="text-slate-300 pr-0.5">
                                {lang === 'sv' ? 'Svar' : 'Math'}
                            </span>
                            <button
                                type="button"
                                onClick={() =>
                                    onUpdatePart?.('stepLatexSize', stepSize(curStepLatexSize, -1))
                                }
                                disabled={SIZE_STEPS.indexOf(curStepLatexSize) <= 0}
                                className="p-0.5 rounded hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                                title={lang === 'sv' ? 'Mindre formel' : 'Smaller math'}
                            >
                                <Minus size={10} />
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    onUpdatePart?.('stepLatexSize', stepSize(curStepLatexSize, 1))
                                }
                                disabled={SIZE_STEPS.indexOf(curStepLatexSize) >= SIZE_STEPS.length - 1}
                                className="p-0.5 rounded hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                                title={lang === 'sv' ? 'Större formel' : 'Larger math'}
                            >
                                <Plus size={10} />
                            </button>
                            <button
                                type="button"
                                onClick={() => onUpdatePart?.('showStepLatex', !showStepLatex)}
                                className="p-0.5 rounded hover:bg-slate-700 cursor-pointer"
                                title={showStepLatex ? (lang === 'sv' ? 'Dölj' : 'Hide') : (lang === 'sv' ? 'Visa' : 'Show')}
                            >
                                {showStepLatex ? (
                                    <Eye size={10} className="text-amber-300" />
                                ) : (
                                    <EyeOff size={10} className="text-emerald-400" />
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-2 flex-1 flex flex-col justify-between">
                <AnimatePresence initial={false}>
                    {clues.map((step, idx) => {
                        const isTextBlank = step.isTextBlank;
                        const isLatexBlank = step.isLatexBlank;
                        const hasText = Boolean(step.text);
                        const hasLatex = Boolean(step.latex);
                        const textBlankHeight = blankHeights[`${idx}:text`];
                        const latexBlankHeight = blankHeights[`${idx}:latex`];

                        const isEditingThisText = editingField?.idx === idx && editingField?.kind === 'text';
                        const isEditingThisLatex = editingField?.idx === idx && editingField?.kind === 'latex';

                        return (
                            <motion.div
                                key={`step-${idx}`}
                                layout="position"
                                initial={{ opacity: 0, y: 12, scale: 0.985 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                transition={ROW_ENTER_TRANSITION}
                                className="group/step relative flex items-stretch gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs flex-1"
                            >
                                {/* Step Number Badge + Remove Whole Step Button */}
                                <div className="relative shrink-0 mt-0.5">
                                    <div
                                        className={`w-6 h-6 rounded-full font-mono font-bold text-[11px] flex items-center justify-center border ${
                                            cardTheme?.stepCircleClass ||
                                            'bg-amber-100 text-amber-950 border-amber-300'
                                        }`}
                                    >
                                        {idx + 1}
                                    </div>
                                    {isEditable && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onUpdatePart?.('toggleHideClue', { idx });
                                            }}
                                            className="print:hidden opacity-0 group-hover/step:opacity-100 transition-opacity absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xs cursor-pointer"
                                            title={lang === 'sv' ? 'Dölj detta steg från bladet' : 'Hide this step from sheet'}
                                        >
                                            <X size={9} />
                                        </button>
                                    )}
                                </div>

                                {/* Step Explanation Text Column */}
                                <div className="flex-1 min-w-0 flex items-start pt-1">
                                    {!hasText ? (
                                        <span className="text-[10px] font-mono italic text-slate-300 select-none">—</span>
                                    ) : isEditingThisText && isEditable ? (
                                        <div
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-full space-y-1 bg-slate-50 p-1.5 rounded-lg border-2 border-emerald-500"
                                        >
                                            <textarea
                                                autoFocus
                                                rows={2}
                                                value={editingField.value}
                                                onChange={(e) =>
                                                    setEditingField((prev) => ({ ...prev, value: e.target.value }))
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        commitStepEdit();
                                                    } else if (e.key === 'Escape') {
                                                        setEditingField(null);
                                                    }
                                                }}
                                                className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 outline-none focus:border-emerald-600 resize-y"
                                            />
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingField(null)}
                                                    className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 cursor-pointer"
                                                >
                                                    <X size={10} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={commitStepEdit}
                                                    className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white cursor-pointer"
                                                >
                                                    <Check size={10} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : showStepText ? (
                                        <div
                                            onClick={(e) => {
                                                if (!isEditable) return;
                                                e.stopPropagation();
                                                onUpdatePart?.('toggleClueBlank', { idx, field: 'blankText' });
                                            }}
                                            title={
                                                isEditable
                                                    ? lang === 'sv'
                                                        ? 'Klicka för skrivlucka · Hovra för att redigera eller dölja'
                                                        : 'Click for student blank · Hover to edit or hide'
                                                    : undefined
                                            }
                                            className={`group/text relative w-full h-full flex items-start rounded-lg transition-all ${
                                                isEditable
                                                    ? 'cursor-pointer hover:bg-amber-50/70 px-1.5 py-0.5 -mx-1.5'
                                                    : ''
                                            }`}
                                        >
                                            {isEditable && (
                                                <div
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="print:hidden opacity-0 group-hover/text:opacity-100 transition-opacity absolute -top-3 right-0 z-20 flex items-center gap-0.5 bg-white border border-slate-300 rounded-md px-1 py-0.5 shadow-xs"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setEditingField({ idx, kind: 'text', value: step.text || '' })
                                                        }
                                                        className="p-0.5 text-slate-600 hover:text-emerald-700 cursor-pointer"
                                                        title={lang === 'sv' ? 'Redigera text' : 'Edit text'}
                                                    >
                                                        <Pencil size={10} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            onUpdatePart?.('toggleHideClueText', { idx })
                                                        }
                                                        className="p-0.5 text-slate-600 hover:text-rose-600 cursor-pointer"
                                                        title={lang === 'sv' ? 'Dölj textdel helt' : 'Hide text completely'}
                                                    >
                                                        <EyeOff size={10} />
                                                    </button>
                                                </div>
                                            )}

                                            <AnimatePresence mode="wait" initial={false}>
                                                {isTextBlank ? (
                                                    <motion.div
                                                        key="text-blank"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{ duration: 0.14 }}
                                                        className="w-full h-full flex items-center"
                                                    >
                                                        <PrintWriteBlank
                                                            kind={blankStyle}
                                                            spacious={spaciousWriting}
                                                            multiLine={true}
                                                            lang={lang}
                                                            heightPx={textBlankHeight}
                                                            onHeightChange={
                                                                isEditable && onBlankHeightChange
                                                                    ? (nextH) => onBlankHeightChange(idx, 'text', nextH)
                                                                    : null
                                                            }
                                                        />
                                                    </motion.div>
                                                ) : (
                                                    <motion.span
                                                        key={`text-shown-${idx}-${step.text}`}
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
                                                                title={lang === 'sv' ? 'Elevlucka' : 'Student blank'}
                                                                className="inline-block mr-1 text-emerald-700 font-mono font-black"
                                                            >
                                                                *
                                                            </span>
                                                        )}
                                                        <MathDisplay content={step.text} />
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ) : (
                                        <span className="print:hidden text-[10px] font-mono italic text-slate-400">
                                            {lang === 'sv' ? 'Text dold' : 'Text hidden'}
                                        </span>
                                    )}
                                </div>

                                {/* Step Solution / Equation Column */}
                                {hasLatex && (
                                    <div
                                        style={{
                                            ...(solutionColStyle || {}),
                                            maxWidth: '45%'
                                        }}
                                        onClick={(e) => {
                                            if (!isEditable || !showStepLatex || isEditingThisLatex) return;
                                            e.stopPropagation();
                                            onUpdatePart?.('toggleClueBlank', { idx, field: 'blankLatex' });
                                        }}
                                        title={
                                            isEditable && showStepLatex
                                                ? lang === 'sv'
                                                    ? 'Klicka för skrivlucka · Hovra för att redigera eller dölja'
                                                    : 'Click for student blank · Hover to edit or hide'
                                                : undefined
                                        }
                                        className={`group/latex relative shrink-0 ${solutionColClass} rounded-lg border px-2 py-1 flex flex-col justify-center items-center transition-all ${
                                            isLatexBlank
                                                ? 'bg-white border-transparent'
                                                : step.wasLatexBlank
                                                    ? 'bg-emerald-50/40 border-2 border-dashed border-emerald-600/80'
                                                    : 'bg-slate-50 border-slate-200/80'
                                        } ${
                                            isEditable && showStepLatex && !isEditingThisLatex
                                                ? 'cursor-pointer hover:border-amber-400 hover:bg-amber-50/50'
                                                : ''
                                        }`}
                                    >
                                        {isEditable && !isEditingThisLatex && (
                                            <div
                                                onClick={(e) => e.stopPropagation()}
                                                className="print:hidden opacity-0 group-hover/latex:opacity-100 transition-opacity absolute -top-3 right-0 z-20 flex items-center gap-0.5 bg-white border border-slate-300 rounded-md px-1 py-0.5 shadow-xs"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setEditingField({ idx, kind: 'latex', value: step.latex || '' })
                                                    }
                                                    className="p-0.5 text-slate-600 hover:text-emerald-700 cursor-pointer"
                                                    title={lang === 'sv' ? 'Redigera formel (LaTeX)' : 'Edit equation (LaTeX)'}
                                                >
                                                    <Pencil size={10} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onUpdatePart?.('toggleHideClueLatex', { idx })
                                                    }
                                                    className="p-0.5 text-slate-600 hover:text-rose-600 cursor-pointer"
                                                    title={lang === 'sv' ? 'Dölj svarsruta helt' : 'Hide solution box completely'}
                                                >
                                                    <EyeOff size={10} />
                                                </button>
                                            </div>
                                        )}

                                        {isEditingThisLatex && isEditable ? (
                                            <div
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-full space-y-1 bg-white p-1 rounded border-2 border-emerald-500"
                                            >
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    value={editingField.value}
                                                    onChange={(e) =>
                                                        setEditingField((prev) => ({ ...prev, value: e.target.value }))
                                                    }
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            commitStepEdit();
                                                        } else if (e.key === 'Escape') {
                                                            setEditingField(null);
                                                        }
                                                    }}
                                                    className="w-full font-mono text-[11px] text-slate-900 bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 outline-none focus:border-emerald-600"
                                                />
                                                {editingField.value && (
                                                    <div className="text-center font-serif text-xs text-slate-700 py-0.5 overflow-x-auto">
                                                        <MathDisplay content={`$$${editingField.value}$$`} />
                                                    </div>
                                                )}
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingField(null)}
                                                        className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 cursor-pointer"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={commitStepEdit}
                                                        className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white cursor-pointer"
                                                    >
                                                        <Check size={10} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : showStepLatex ? (
                                            <AnimatePresence mode="wait" initial={false}>
                                                {isLatexBlank ? (
                                                    <motion.div
                                                        key="latex-blank"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{ duration: 0.14 }}
                                                        className="w-full h-full flex items-center"
                                                    >
                                                        <PrintWriteBlank
                                                            kind={blankStyle}
                                                            spacious={spaciousWriting}
                                                            multiLine={false}
                                                            lang={lang}
                                                            heightPx={latexBlankHeight}
                                                            onHeightChange={
                                                                isEditable && onBlankHeightChange
                                                                    ? (nextH) => onBlankHeightChange(idx, 'latex', nextH)
                                                                    : null
                                                            }
                                                        />
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key={`latex-shown-${idx}-${step.latex}`}
                                                        initial={{ opacity: 0, y: 5, scale: 0.98 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        transition={CONTENT_REVEAL_TRANSITION}
                                                        className={`relative w-full min-w-0 overflow-x-auto font-serif ${stepLatexClass} font-bold text-slate-950 text-center py-0.5`}
                                                    >
                                                        {step.wasLatexBlank && (
                                                            <span
                                                                title={lang === 'sv' ? 'Elevlucka' : 'Student blank'}
                                                                className="mr-1 text-emerald-700 font-mono font-black text-xs align-top"
                                                            >
                                                                *
                                                            </span>
                                                        )}
                                                        <MathDisplay content={`$$${step.latex}$$`} />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        ) : (
                                            <span className="print:hidden text-[10px] font-mono italic text-slate-400">
                                                {lang === 'sv' ? 'Svar dolt' : 'Hidden'}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}

export function StackedCardBody(props) {
    const { hasVisual, showVisual, isEditable } = props;
    const showVisualBox = hasVisual && (showVisual || isEditable);

    return (
        <div className="flex-1 min-h-0 flex flex-col gap-2.5 w-full">
            <div className="flex flex-row items-start justify-between gap-3 pb-2 border-b border-amber-200/80">
                <div className={showVisualBox ? 'flex-1 min-w-0' : 'w-full'}>
                    <PromptSection {...props} />
                </div>

                {showVisualBox && (
                    <VisualSection {...props} className="w-40 shrink-0 min-h-[104px]" />
                )}
            </div>

            <ClueRowsSection {...props} />
        </div>
    );
}