// src/components/shared/PosterCardRenderer.jsx
import React, { useState, useEffect } from 'react';
import { Lightbulb, Pencil, Check, X, Sparkles, ArrowDown, ArrowRight } from 'lucide-react';
import MathDisplay from './MathDisplay';
import WorkedExampleCard from './WorkedExampleCard';
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
  stepSize
} from './WorkedExampleHelpers';
import { resolveCardTheme } from './posterThemes';

export default function PosterCardRenderer({
  item,
  lang = 'sv',
  posterLayout = 'wave-columns',
  isLandscape = false,
  displayOptions = null,
  onUpdatePart = null
}) {
  if (!item) return null;

  if (posterLayout === 'classic') {
    return (
      <WorkedExampleCard
        item={item}
        lang={lang}
        isPrintMode={false}
        displayOptions={displayOptions}
        onUpdatePart={onUpdatePart}
      />
    );
  }

  const opts = displayOptions || {};
  const isEditable = typeof onUpdatePart === 'function';
  const isInkSaver = opts.themeSkin === 'ink-saver';
  const cardTheme = resolveCardTheme(opts.themeSkin || 'modern-clean', opts.colorPalette || 'emerald');
  const pal = cardTheme.palette;

  const [openMenuKey, setOpenMenuKey] = useState(null);
  const [editingField, setEditingField] = useState(null);

  useEffect(() => {
    if (!openMenuKey) return;
    const close = () => setOpenMenuKey(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [openMenuKey]);

  const rd = item.resolvedData?.renderData || item.resolvedData || item.renderData || {};
  const hasVisual = hasRenderableVisual(rd);
  const showVisual = opts.showVisual !== false;
  const visualZoom = Math.min(1.8, Math.max(0.6, Number(opts.visualZoom) || 1.25));
  const visualOffsetX = Number(opts.visualOffsetX) || 0;
  const visualOffsetY = Number(opts.visualOffsetY) || 0;

  const { startVisualPan, activePanX, activePanY } = useVisualPan({
    isEditable,
    visualZoom,
    visualOffsetX,
    visualOffsetY,
    onUpdatePart,
    onToggleMenu: () => setOpenMenuKey((prev) => (prev === 'visual' ? null : 'visual'))
  });

  const clues = normalizeClues(item.clues || item.resolvedData?.clues || [], lang);

  const curPromptTextSize = opts.promptTextSize || '2xl';
  const curPromptLatexSize = opts.promptLatexSize || '3xl';
  const curStepTextSize = opts.stepTextSize || '2xl';
  const curStepLatexSize = opts.stepLatexSize || '3xl';

  const promptTextClass = PROMPT_TEXT_SIZE_MAP[curPromptTextSize] || 'text-xl';
  const promptLatexClass = PROMPT_LATEX_SIZE_MAP[curPromptLatexSize] || 'text-4xl';
  const stepTextClass = STEP_TEXT_SIZE_MAP[curStepTextSize] || 'text-lg';
  const stepLatexClass = STEP_LATEX_SIZE_MAP[curStepLatexSize] || 'text-3xl';

  const callout = opts.callout || {};
  const showCallout = Boolean(callout.enabled);
  const calloutTitle =
    callout.title || (lang === 'sv' ? 'Kom ihåg!' : 'Remember!');
  const calloutText =
    callout.text ||
    (lang === 'sv'
      ? 'Klicka här för att skriva en viktig regel eller minnestips...'
      : 'Click here to write a key rule or memory tip...');

  const isDense = clues.length >= 4;
  const adaptiveGridCols = isLandscape
    ? clues.length >= 3
      ? 'grid-cols-3'
      : clues.length === 2
        ? 'grid-cols-2'
        : 'grid-cols-1'
    : 'grid-cols-1';

  const commitInlineEdit = () => {
    if (!editingField) return;
    const { kind, idx, value, title } = editingField;
    setEditingField(null);
    if (kind === 'text') {
      onUpdatePart?.('editClueText', { idx, text: value });
    } else if (kind === 'latex') {
      onUpdatePart?.('editClueLatex', { idx, latex: value });
    } else if (kind === 'callout') {
      onUpdatePart?.('editCallout', { enabled: true, title, text: value });
    }
  };

  // Shared inline-editable step content
  const renderStepBody = (step, idx, { centeredMath = true, lightMathBox = true } = {}) => {
    const isEditingText = editingField?.kind === 'text' && editingField?.idx === idx;
    const isEditingLatex = editingField?.kind === 'latex' && editingField?.idx === idx;

    return (
      <>
        {step.text && opts.showStepText !== false && (
          <div className="mb-2.5">
            {isEditingText ? (
              <div onClick={(e) => e.stopPropagation()} className="space-y-1.5">
                <textarea
                  autoFocus
                  rows={2}
                  value={editingField.value}
                  onChange={(e) =>
                    setEditingField((prev) => ({ ...prev, value: e.target.value }))
                  }
                  className="w-full text-sm font-semibold text-slate-900 bg-white border-2 border-emerald-500 rounded-lg p-2 outline-none"
                />
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingField(null)}
                    className="px-2 py-0.5 rounded bg-slate-200 text-xs font-bold cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={commitInlineEdit}
                    className="px-2 py-0.5 rounded bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                  >
                    <Check size={12} />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDoubleClick={() =>
                  isEditable && setEditingField({ kind: 'text', idx, value: step.text })
                }
                className={`group/txt relative ${stepTextClass} font-semibold text-slate-800 leading-snug rounded-lg ${
                  isEditable ? 'hover:bg-slate-100/80 px-1.5 py-0.5 -mx-1.5 cursor-text' : ''
                }`}
              >
                <MathDisplay content={step.text} />
                {isEditable && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingField({ kind: 'text', idx, value: step.text });
                    }}
                    className="print:hidden opacity-0 group-hover/txt:opacity-100 inline-flex ml-1.5 p-1 rounded bg-white border border-slate-300 text-slate-600 hover:text-emerald-700 cursor-pointer align-middle"
                    title={lang === 'sv' ? 'Redigera text' : 'Edit text'}
                  >
                    <Pencil size={11} />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {step.latex && opts.showStepLatex !== false && (
          <div className="mt-auto">
            {isEditingLatex ? (
              <div onClick={(e) => e.stopPropagation()} className="space-y-1.5">
                <input
                  type="text"
                  autoFocus
                  value={editingField.value}
                  onChange={(e) =>
                    setEditingField((prev) => ({ ...prev, value: e.target.value }))
                  }
                  className="w-full font-mono text-sm text-slate-900 bg-white border-2 border-emerald-500 rounded-lg px-2 py-1 outline-none"
                />
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingField(null)}
                    className="px-2 py-0.5 rounded bg-slate-200 text-xs font-bold cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={commitInlineEdit}
                    className="px-2 py-0.5 rounded bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                  >
                    <Check size={12} />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDoubleClick={() =>
                  isEditable && setEditingField({ kind: 'latex', idx, value: step.latex })
                }
                className={`group/ltx relative ${
                  lightMathBox ? `px-3 py-2 rounded-xl bg-slate-50/90 border ${cardTheme.subtleBorder}` : ''
                } font-serif ${stepLatexClass} font-bold text-slate-950 ${
                  centeredMath ? 'text-center' : 'text-right'
                }`}
              >
                <MathDisplay content={`$$${step.latex}$$`} />
                {isEditable && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingField({ kind: 'latex', idx, value: step.latex });
                    }}
                    className="print:hidden opacity-0 group-hover/ltx:opacity-100 absolute top-1.5 right-1.5 p-1 rounded bg-white border border-slate-300 text-slate-600 hover:text-emerald-700 cursor-pointer"
                    title={lang === 'sv' ? 'Redigera formel' : 'Edit math'}
                  >
                    <Pencil size={11} />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  // Optional Editable Callout Box ("Kom ihåg / Regel")
  const renderCalloutBox = () => {
    if (!showCallout) return null;
    const isEditingCallout = editingField?.kind === 'callout';

    return (
      <div
        className={`p-4 rounded-2xl bg-white border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] flex items-start gap-3 shrink-0`}
      >
        <div className={`p-2 rounded-xl ${cardTheme.badgeClass} shrink-0 mt-0.5`}>
          <Lightbulb size={18} />
        </div>

        <div className="flex-1 min-w-0">
          {isEditingCallout ? (
            <div onClick={(e) => e.stopPropagation()} className="space-y-2 text-slate-900">
              <input
                type="text"
                value={editingField.title}
                onChange={(e) =>
                  setEditingField((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full text-xs font-black uppercase tracking-wider bg-white border border-slate-300 rounded px-2 py-1"
              />
              <textarea
                autoFocus
                rows={2}
                value={editingField.value}
                onChange={(e) =>
                  setEditingField((prev) => ({ ...prev, value: e.target.value }))
                }
                className="w-full text-sm font-semibold bg-white border-2 border-emerald-500 rounded-lg p-2 outline-none"
              />
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setEditingField(null)}
                  className="px-2.5 py-1 rounded-lg bg-slate-200 text-xs font-bold cursor-pointer"
                >
                  {lang === 'sv' ? 'Avbryt' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={commitInlineEdit}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                >
                  {lang === 'sv' ? 'Spara' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() =>
                isEditable &&
                setEditingField({
                  kind: 'callout',
                  title: calloutTitle,
                  value: callout.text || ''
                })
              }
              className={isEditable ? 'cursor-pointer group/callout' : ''}
            >
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="text-xs font-black uppercase tracking-wider text-slate-950">
                  {calloutTitle}
                </span>
                {isEditable && (
                  <span className="print:hidden text-[10px] font-mono opacity-60 group-hover/callout:opacity-100 flex items-center gap-1">
                    <Pencil size={10} />
                    {lang === 'sv' ? 'Klicka för att ändra' : 'Click to edit'}
                  </span>
                )}
              </div>
              <div className="text-base font-bold leading-snug text-slate-900">
                <MathDisplay content={calloutText} />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Counter-scaled quick typography controls
  const renderPosterTypographyBar = () => {
    if (!isEditable) return null;
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: 'scale(var(--slot-inv-scale, 1))',
          transformOrigin: 'top right'
        }}
        className="print:hidden flex items-center gap-2 text-[10px] font-mono font-bold z-20 shrink-0"
      >
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900 text-white shadow-sm">
          <span className="text-slate-300">{lang === 'sv' ? 'Uppgift' : 'Prompt'}</span>
          <button
            type="button"
            onClick={() => {
              onUpdatePart('promptTextSize', stepSize(curPromptTextSize, -1));
              onUpdatePart('promptLatexSize', stepSize(curPromptLatexSize, -1));
            }}
            className="px-1 hover:bg-slate-700 rounded cursor-pointer"
          >
            -
          </button>
          <button
            type="button"
            onClick={() => {
              onUpdatePart('promptTextSize', stepSize(curPromptTextSize, 1));
              onUpdatePart('promptLatexSize', stepSize(curPromptLatexSize, 1));
            }}
            className="px-1 hover:bg-slate-700 rounded cursor-pointer"
          >
            +
          </button>
        </div>

        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900 text-white shadow-sm">
          <span className="text-slate-300">{lang === 'sv' ? 'Steg' : 'Steps'}</span>
          <button
            type="button"
            onClick={() => {
              onUpdatePart('stepTextSize', stepSize(curStepTextSize, -1));
              onUpdatePart('stepLatexSize', stepSize(curStepLatexSize, -1));
            }}
            className="px-1 hover:bg-slate-700 rounded cursor-pointer"
          >
            -
          </button>
          <button
            type="button"
            onClick={() => {
              onUpdatePart('stepTextSize', stepSize(curStepTextSize, 1));
              onUpdatePart('stepLatexSize', stepSize(curStepLatexSize, 1));
            }}
            className="px-1 hover:bg-slate-700 rounded cursor-pointer"
          >
            +
          </button>
        </div>
      </div>
    );
  };

  const sharedPromptProps = {
    item,
    rd,
    lang,
    isEditable,
    showPromptText: opts.showPromptText !== false,
    showPromptLatex: opts.showPromptLatex !== false,
    showPromptOptions: opts.showPromptOptions !== false,
    promptTextClass,
    promptLatexClass,
    curPromptTextSize,
    curPromptLatexSize,
    openMenuKey,
    setOpenMenuKey,
    onUpdatePart
  };

  const sharedVisualProps = {
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
    onUpdatePart
  };

  // =========================================================================
  // 1. WAVE & PILLARS ("Vågor & Pelare" — Full-Color Top + Tinted Wave Canvas)
  // =========================================================================
  if (posterLayout === 'wave-columns') {
    const lowerWaveBg = isInkSaver ? '#ffffff' : pal.lightHex;
    const upperWaveBg = isInkSaver ? '#0f172a' : pal.hexPrimary;

    return (
      <div
        onClick={() => isEditable && setOpenMenuKey(null)}
        className="whiteboard-protect w-full flex flex-col justify-between rounded-3xl border-2 border-slate-900 overflow-hidden"
        style={{ backgroundColor: lowerWaveBg }}
      >
        {/* Wavy Header Banner */}
        <div className="relative shrink-0" style={{ backgroundColor: upperWaveBg }}>
          <div className="px-7 pt-6 pb-8 flex items-start justify-between gap-4 text-white">
            <div>
              <h3 className="text-3xl font-black tracking-tight drop-shadow-2xs">
                {item.name}
              </h3>
            </div>
            {renderPosterTypographyBar()}
          </div>

          <svg
            viewBox="0 0 1200 72"
            preserveAspectRatio="none"
            className="w-full h-8 block -mb-px"
          >
            <path
              d="M0,24 C320,88 880,-24 1200,36 L1200,72 L0,72 Z"
              fill={lowerWaveBg}
            />
          </svg>
        </div>

        <div
          className={`px-6 pb-5 pt-2 flex-1 flex flex-col justify-between ${
            isDense ? 'gap-3' : 'gap-5'
          }`}
        >
          {/* Crisp White Floating Problem Card */}
          <div className="p-4 rounded-2xl bg-white border-2 border-slate-900/15 shadow-sm flex flex-row items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <PromptSection {...sharedPromptProps} />
            </div>
            {hasVisual && (showVisual || isEditable) && (
              <VisualSection {...sharedVisualProps} className="w-48 shrink-0 min-h-[130px]" />
            )}
          </div>

          {/* Step Pillars with Protruding Circular Medallions & Curved Bottom-Right Accent */}
          <div
            className={`grid ${adaptiveGridCols} ${
              isDense ? 'gap-3 pt-3' : 'gap-5 pt-4'
            } flex-1 content-stretch`}
          >
            {clues.map((step, idx) => (
              <div
                key={`wave-step-${idx}`}
                className={`group/step relative ${
                  isDense ? 'pt-5 px-3.5 pb-3.5' : 'pt-6 px-4 pb-5'
                } rounded-2xl rounded-br-[44px] bg-white border border-slate-900/15 shadow-md flex flex-col justify-between`}
                style={{
                  borderRightWidth: '6px',
                  borderBottomWidth: '6px',
                  borderRightColor: upperWaveBg,
                  borderBottomColor: upperWaveBg
                }}
              >
                <div
                  className="absolute -top-5 left-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-white flex items-center justify-center font-mono font-black text-base shadow-md border-[3px]"
                  style={{ borderColor: upperWaveBg, color: isInkSaver ? '#0f172a' : pal.hexDark }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </div>

                {isEditable && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdatePart?.('toggleHideClue', { idx });
                    }}
                    className="print:hidden opacity-0 group-hover/step:opacity-100 absolute top-2 right-2 p-1 rounded-lg bg-rose-50 text-rose-600 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}

                {renderStepBody(step, idx)}
              </div>
            ))}
          </div>

          {renderCalloutBox()}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. DIAGONAL SLASH ("Diagonal Split" — Full-Poster Diagonal Color Seam + Skewed Badges)
  // =========================================================================
  if (posterLayout === 'diagonal-split') {
    const slashPrimary = isInkSaver ? '#0f172a' : pal.hexPrimary;
    const slashSecondary = isInkSaver ? '#ffffff' : `${pal.lightHex}66`;
    const slashGradient = isLandscape
      ? `linear-gradient(112deg, ${slashPrimary} 0%, ${slashPrimary} 43%, ${slashSecondary} 43.3%, ${slashSecondary} 100%)`
      : `linear-gradient(164deg, ${slashPrimary} 0%, ${slashPrimary} 38%, ${slashSecondary} 38.3%, ${slashSecondary} 100%)`;

    return (
      <div
        onClick={() => isEditable && setOpenMenuKey(null)}
        className="whiteboard-protect w-full rounded-3xl border-2 border-slate-900 p-6 flex flex-col justify-between gap-5"
        style={{ background: slashGradient }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="bg-slate-950 text-white px-4 py-2.5 -skew-x-6 shadow-md">
            <div className="skew-x-6">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-white/75 block">
                {lang === 'sv' ? 'GENOMGÅNG' : 'WORKED EXAMPLE'}
              </span>
              <h3 className="text-2xl font-black tracking-tight">{item.name}</h3>
            </div>
          </div>
          {renderPosterTypographyBar()}
        </div>

        <div
          className={`flex-1 grid ${
            isLandscape ? 'grid-cols-12 items-center' : 'grid-cols-1'
          } gap-5`}
        >
          <div className={isLandscape ? 'col-span-5' : ''}>
            <div className="p-5 rounded-2xl bg-white border-2 border-slate-900 shadow-[6px_6px_0px_#0f172a] space-y-3">
              <span
                className="inline-block px-3 py-0.5 text-xs font-mono font-black uppercase tracking-wider text-white -skew-x-12"
                style={{ backgroundColor: slashPrimary }}
              >
                <span className="inline-block skew-x-12">
                  {lang === 'sv' ? 'Uppgift' : 'Problem'}
                </span>
              </span>
              <PromptSection {...sharedPromptProps} />
              {hasVisual && (showVisual || isEditable) && (
                <VisualSection {...sharedVisualProps} className="w-full min-h-[140px]" />
              )}
            </div>
          </div>

          <div
            className={`${isLandscape ? 'col-span-7' : ''} grid ${
              isLandscape && clues.length >= 4 ? 'grid-cols-2' : 'grid-cols-1'
            } content-center gap-3`}
          >
            {clues.map((step, idx) => (
              <div
                key={`diag-step-${idx}`}
                className="group/step relative p-4 rounded-2xl bg-white border-2 border-slate-900 shadow-sm flex items-start gap-3.5"
              >
                <div
                  className="px-3 py-1 -skew-x-12 text-white font-mono font-black text-sm shrink-0 mt-0.5 shadow-2xs"
                  style={{ backgroundColor: slashPrimary }}
                >
                  <span className="inline-block skew-x-12">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  {renderStepBody(step, idx, { centeredMath: false, lightMathBox: false })}
                </div>

                {isEditable && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdatePart?.('toggleHideClue', { idx });
                    }}
                    className="print:hidden opacity-0 group-hover/step:opacity-100 p-1 rounded-lg bg-rose-50 text-rose-600 cursor-pointer shrink-0"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {renderCalloutBox()}
      </div>
    );
  }

  // =========================================================================
  // 3. TILTED COLLAGE ("Kollage & Djup" — Saturated Canvas + Rotated Backing Layer)
  // =========================================================================
  if (posterLayout === 'tilted-collage') {
    const collageBg = isInkSaver
      ? '#0f172a'
      : `linear-gradient(135deg, ${pal.hexPrimary} 0%, ${pal.hexDark} 100%)`;

    return (
      <div
        onClick={() => isEditable && setOpenMenuKey(null)}
        className="whiteboard-protect w-full p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden"
        style={{ background: collageBg }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-6 rounded-3xl bg-white/25 rotate-[2.2deg] scale-[0.99] pointer-events-none"
        />

        <div className="relative z-10 w-full h-full rounded-2xl bg-white/95 backdrop-blur-xs p-6 shadow-2xl flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between gap-3 border-b-2 border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <span
                className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white"
                style={{ backgroundColor: isInkSaver ? '#0f172a' : pal.hexPrimary }}
              >
                {lang === 'sv' ? 'Exempel' : 'Example'}
              </span>
              <h3 className="text-2xl font-black tracking-tight text-slate-950">{item.name}</h3>
            </div>
            {renderPosterTypographyBar()}
          </div>

          <div
            className="p-4 rounded-2xl border-2 flex flex-row items-center justify-between gap-4"
            style={{
              backgroundColor: isInkSaver ? '#f8fafc' : `${pal.lightHex}55`,
              borderColor: isInkSaver ? '#0f172a' : pal.hexPrimary
            }}
          >
            <div className="flex-1 min-w-0">
              <PromptSection {...sharedPromptProps} />
            </div>
            {hasVisual && (showVisual || isEditable) && (
              <VisualSection {...sharedVisualProps} className="w-48 shrink-0 min-h-[130px]" />
            )}
          </div>

          <div className={`grid ${adaptiveGridCols} gap-3 flex-1 content-start`}>
            {clues.map((step, idx) => (
              <div
                key={`collage-step-${idx}`}
                className="group/step relative p-4 rounded-2xl bg-white border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="w-7 h-7 rounded-full font-mono font-black text-xs text-white flex items-center justify-center"
                    style={{ backgroundColor: isInkSaver ? '#0f172a' : pal.hexPrimary }}
                  >
                    {idx + 1}
                  </span>
                  {isEditable && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdatePart?.('toggleHideClue', { idx });
                      }}
                      className="print:hidden opacity-0 group-hover/step:opacity-100 p-1 rounded bg-rose-50 text-rose-600 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
                {renderStepBody(step, idx)}
              </div>
            ))}
          </div>

          {renderCalloutBox()}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. STEP FLOWCHART ("Flödesschema 01 → 02" — Full-Bleed Tinted Backdrop + Floating Cards)
  // =========================================================================
  if (posterLayout === 'step-flow') {
    const flowBg = isInkSaver
      ? '#ffffff'
      : `linear-gradient(160deg, ${pal.lightHex} 0%, #ffffff 55%, ${pal.lightHex}99 100%)`;

    return (
      <div
        onClick={() => isEditable && setOpenMenuKey(null)}
        style={{ background: flowBg }}
        className="whiteboard-protect w-full p-6 rounded-3xl border-[3px] border-slate-900 flex flex-col justify-between gap-4"
      >
        <div className="flex items-center justify-between gap-4 pb-3 border-b-2 border-slate-900/15">
          <div className="flex items-center gap-3">
            <span
              className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white shadow-xs"
              style={{ backgroundColor: isInkSaver ? '#0f172a' : pal.hexPrimary }}
            >
              {lang === 'sv' ? 'Steg för steg' : 'Step by Step'}
            </span>
            <h3 className="text-2xl font-black tracking-tight text-slate-950">{item.name}</h3>
          </div>
          {renderPosterTypographyBar()}
        </div>

        {/* Crisp White Floating Problem Card */}
        <div className="p-4 rounded-2xl bg-white border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] flex flex-row items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <PromptSection {...sharedPromptProps} />
          </div>
          {hasVisual && (showVisual || isEditable) && (
            <VisualSection {...sharedVisualProps} className="w-48 shrink-0 min-h-[130px]" />
          )}
        </div>

        {/* Connected Flowchart Step Cards */}
        <div className={`grid ${adaptiveGridCols} gap-3 flex-1 content-stretch`}>
          {clues.map((step, idx) => (
            <div key={`flow-wrap-${idx}`} className="flex flex-col justify-between">
              <div className="group/step relative flex-1 p-4 rounded-2xl bg-white border-2 border-slate-900 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className="px-3 py-0.5 rounded-full font-mono font-black text-sm text-white"
                    style={{ backgroundColor: isInkSaver ? '#0f172a' : pal.hexPrimary }}
                  >
                    {lang === 'sv' ? `STEG ${idx + 1}` : `STEP ${idx + 1}`}
                  </span>
                  {isEditable && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdatePart?.('toggleHideClue', { idx });
                      }}
                      className="print:hidden opacity-0 group-hover/step:opacity-100 p-1 rounded bg-rose-50 text-rose-600 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
                {renderStepBody(step, idx)}
              </div>

              {!isLandscape && clues.length < 4 && idx < clues.length - 1 && (
                <div
                  className="flex justify-center pt-1.5"
                  style={{ color: isInkSaver ? '#0f172a' : pal.hexPrimary }}
                >
                  <ArrowDown size={22} strokeWidth={3} />
                </div>
              )}
            </div>
          ))}
        </div>

        {renderCalloutBox()}
      </div>
    );
  }

  // =========================================================================
  // 5. EDITORIAL ("Minimalistisk Affisch" — Bold Colored Outer Mat + Crisp Editorial Sheet)
  // =========================================================================
  const editorialMatBg = isInkSaver ? '#0f172a' : pal.hexPrimary;

  return (
    <div
      onClick={() => isEditable && setOpenMenuKey(null)}
      style={{ backgroundColor: editorialMatBg }}
      className="whiteboard-protect w-full p-5 rounded-3xl flex flex-col"
    >
      <div className="w-full h-full rounded-2xl bg-white p-7 flex flex-col justify-between gap-5 shadow-xl">
        <div className="border-b-4 border-slate-900 pb-3 flex items-end justify-between gap-4">
          <div>
            <span
              className="text-xs font-mono font-black uppercase tracking-[0.2em]"
              style={{ color: isInkSaver ? '#0f172a' : pal.hexPrimary }}
            >
              {lang === 'sv' ? 'MATEMATIK · REFERENS' : 'MATHEMATICS · REFERENCE'}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 mt-0.5">
              {item.name}
            </h3>
          </div>
          {renderPosterTypographyBar()}
        </div>

        <div className="flex flex-row items-start justify-between gap-6 pb-4 border-b border-slate-300">
          <div className="flex-1 min-w-0">
            <PromptSection {...sharedPromptProps} />
          </div>
          {hasVisual && (showVisual || isEditable) && (
            <VisualSection {...sharedVisualProps} className="w-48 shrink-0 min-h-[140px]" />
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between divide-y divide-slate-200">
          {clues.map((step, idx) => (
            <div key={`ed-step-${idx}`} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-6">
              <div className="flex items-baseline gap-3 flex-1 min-w-0">
                <span
                  className="font-mono font-black text-base"
                  style={{ color: isInkSaver ? '#0f172a' : pal.hexPrimary }}
                >
                  0{idx + 1}.
                </span>
                {step.text && opts.showStepText !== false && (
                  <div className={`${stepTextClass} font-semibold text-slate-800 leading-snug`}>
                    <MathDisplay content={step.text} />
                  </div>
                )}
              </div>
              {step.latex && opts.showStepLatex !== false && (
                <div className={`font-serif ${stepLatexClass} font-bold text-slate-950 shrink-0`}>
                  <MathDisplay content={`$$${step.latex}$$`} />
                </div>
              )}
            </div>
          ))}
        </div>

        {renderCalloutBox()}
      </div>
    </div>
  );
}