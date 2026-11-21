// src/components/shared/WorkedExampleSlotControls.jsx
import React from 'react';
import {
  Trash2,
  LayoutGrid,
  X,
  RefreshCcw,
  Shuffle,
  GripVertical,
  SlidersHorizontal,
  Columns,
  Eye,
  Presentation
} from 'lucide-react';
import WorkedExampleCard from './WorkedExampleCard.jsx';
import PosterCardRenderer from './PosterCardRenderer.jsx';
import {
  DEFAULT_CARD_LAYOUT,
  buildWorkedCardItem,
  getDisplayOptionsForExample
} from './workedExampleMapper';

export default function WorkedExampleSlotControls({
  example,
  lang = 'sv',
  isTeacherKey = false,
  isProjector = false,
  isPosterMode = false,
  posterLayout = 'classic',
  isLandscape = false,
  themeSkin = 'classic',
  colorPalette = 'amber',
  textZoom = 1.1,
  projectorPacingMode = 'guided_blanks',
  revealStepCount = 0,
  compact = false,
  defaultStacked = false,
  writingSpace = 'standard',
  blankStyle = 'line',
  blankHeights = {},
  onBlankHeightChange = null,
  cardClass = '',
  className = '',
  isMenuOpen = false,
  onToggleMenu = null,
  isRegenerating = false,
  onRegenerate = null,
  onPosterizeCard = null,
  onUpdatePart = null,
  onUpdateOverride = null,
  onResetOverrides = null,
  onRemove = null,
  draggableProps = null
}) {
  if (!example) {
    return (
      <div className="h-full min-h-[120px] rounded-2xl border-2 border-dashed border-[var(--border-strong)] bg-[var(--bg-surface)] flex flex-col items-center justify-center p-4 text-center text-[var(--text-muted)]">
        <LayoutGrid size={18} className="mb-1 opacity-70" />
        <p className="text-xs font-bold">
          {lang === 'sv'
            ? 'Tom plats — hämta uppgifter för att fylla'
            : 'Open slot — summon questions to fill'}
        </p>
      </div>
    );
  }

  const cardItem = buildWorkedCardItem(example, {
    lang,
    isTeacherKey,
    isProjector,
    isPosterMode,
    projectorPacingMode,
    revealStepCount
  });

  const displayOptions = getDisplayOptionsForExample(example, {
    isProjector,
    isPosterMode,
    themeSkin,
    colorPalette,
    textZoom,
    compact,
    defaultStacked,
    writingSpace,
    blankStyle,
    blankHeights,
    onBlankHeightChange
  });

  const hasStories =
    Array.isArray(example.rawItem?.resolvedData?.renderData?.availableStories) &&
    example.rawItem.resolvedData.renderData.availableStories.length > 1;

  const exLayout = example.overrides?.layout || {};
  const curLeftPct = exLayout.leftWidthPct ?? DEFAULT_CARD_LAYOUT.leftWidthPct;
  const curSolPx = exLayout.solutionWidthPx ?? DEFAULT_CARD_LAYOUT.solutionWidthPx;
  const isCurrentlyStacked = exLayout.stacked ?? defaultStacked;
  const showColumnControls = !isPosterMode || posterLayout === 'classic';

  const hiddenCount = (example.clues || []).reduce(
    (sum, c) => sum + (c.hidden ? 1 : (c.hideText ? 1 : 0) + (c.hideLatex ? 1 : 0)),
    0
  );

  return (
    <div
      {...(draggableProps?.containerProps || {})}
      className={`relative group rounded-2xl transition-all h-full flex flex-col ${cardClass} ${className} ${
        draggableProps?.isDragging ? 'opacity-40' : ''
      }`}
    >
      {!isProjector && (
        <div
          className={`flex items-center justify-between gap-2 px-1 print:hidden shrink-0 ${
            isPosterMode
              ? 'absolute -top-7 left-0 right-0 z-30'
              : 'mb-1'
          }`}
        >
          <div className="flex items-center gap-1 min-w-0">
            {draggableProps?.onHandlePointerDown && (
              <span
                onPointerDown={draggableProps.onHandlePointerDown}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-grab active:cursor-grabbing"
                title={lang === 'sv' ? 'Dra för att flytta' : 'Drag to reorder'}
              >
                <GripVertical size={13} />
              </span>
            )}
            <span className="text-xs font-bold text-[var(--text-muted)] truncate">
              {example.title}
            </span>
          </div>

          <div
            style={{
              transform: 'scale(var(--slot-inv-scale, 1))',
              transformOrigin: 'top right'
            }}
            className="flex items-center gap-1 shrink-0 z-20"
          >
            {example.topicId && example.variationKey && onRegenerate && (
              <button
                type="button"
                disabled={isRegenerating}
                onClick={(e) => {
                  e.stopPropagation();
                  onRegenerate(example, 'numbers');
                }}
                className="px-2 py-0.5 text-xs font-bold text-[var(--text-muted)] hover:text-emerald-700 hover:bg-[var(--bg-surface)] rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <RefreshCcw size={11} className={isRegenerating ? 'animate-spin' : ''} />
                <span>{lang === 'sv' ? 'Nytt exempel' : 'New example'}</span>
              </button>
            )}

            {hasStories && onRegenerate && (
              <button
                type="button"
                disabled={isRegenerating}
                onClick={(e) => {
                  e.stopPropagation();
                  onRegenerate(example, 'story');
                }}
                className="px-2 py-0.5 text-xs font-bold text-[var(--text-muted)] hover:text-amber-700 hover:bg-[var(--bg-surface)] rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <Shuffle size={11} />
                <span>{lang === 'sv' ? 'Byt text' : 'Swap story'}</span>
              </button>
            )}

            {!isPosterMode && onPosterizeCard && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPosterizeCard(example);
                }}
                className="px-2 py-0.5 text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                title={
                  lang === 'sv'
                    ? 'Öppna detta exempel som klassrumsaffisch'
                    : 'Open this example as a classroom poster'
                }
              >
                <Presentation size={11} />
                <span>{lang === 'sv' ? 'Gör affisch' : 'Posterize'}</span>
              </button>
            )}

            {showColumnControls && onUpdatePart && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdatePart('stacked', !isCurrentlyStacked);
                }}
                className={`px-2 py-0.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                  isCurrentlyStacked
                    ? 'bg-amber-600 text-white'
                    : 'bg-[var(--bg-surface)] text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-main)]'
                }`}
                title={
                  lang === 'sv'
                    ? 'Växla mellan sidokolumner och staplad (vertikal)'
                    : 'Toggle side-by-side vs. stacked (vertical)'
                }
              >
                <span>
                  {isCurrentlyStacked
                    ? lang === 'sv'
                      ? 'Staplad'
                      : 'Stacked'
                    : lang === 'sv'
                      ? 'Sidokolumn'
                      : 'Side-by-side'}
                </span>
              </button>
            )}

            {showColumnControls && onToggleMenu && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMenu();
                }}
                className={`px-2 py-0.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                  isMenuOpen
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[var(--bg-surface)] text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-main)]'
                }`}
              >
                <SlidersHorizontal size={11} />
                <span>{lang === 'sv' ? 'Kolumner' : 'Columns'}</span>
              </button>
            )}

            {hiddenCount > 0 && onUpdatePart && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdatePart('restoreHiddenClues');
                }}
                className="px-2 py-0.5 text-xs font-bold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                title={lang === 'sv' ? 'Visa dolda steg/rutor igen' : 'Restore hidden steps/boxes'}
              >
                <Eye size={11} />
                <span>
                  {lang === 'sv' ? `Visa dolda (${hiddenCount})` : `Restore (${hiddenCount})`}
                </span>
              </button>
            )}

            {onRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="px-2 py-0.5 text-xs font-bold text-[var(--text-muted)] hover:text-rose-600 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 size={11} />
                <span>{lang === 'sv' ? 'Ta bort' : 'Remove'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {!isProjector && showColumnControls && isMenuOpen && onUpdateOverride && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: 'calc(100% / var(--slot-inv-scale, 1))',
            transform: 'scale(var(--slot-inv-scale, 1))',
            transformOrigin: 'top left'
          }}
          className="mb-2 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-strong)] shadow-lg text-[var(--text-main)] space-y-2.5 print:hidden z-30 relative"
        >
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <Columns size={13} className="text-emerald-600" />
              {lang === 'sv' ? 'Kolumnbredd' : 'Column Widths'}
            </span>
            <div className="flex items-center gap-2">
              {example.overrides && onResetOverrides && (
                <button
                  type="button"
                  onClick={onResetOverrides}
                  className="text-xs font-bold text-amber-700 hover:underline cursor-pointer"
                >
                  {lang === 'sv' ? 'Återställ' : 'Reset'}
                </button>
              )}
              {onToggleMenu && (
                <button
                  type="button"
                  onClick={onToggleMenu}
                  className="p-0.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-[var(--text-muted)]">
                <span>{lang === 'sv' ? 'Uppgift / Steg' : 'Problem / Steps'}</span>
                <span className="font-mono">
                  {curLeftPct}% / {100 - curLeftPct}%
                </span>
              </div>
              <input
                type="range"
                min={25}
                max={55}
                step={1}
                value={curLeftPct}
                onChange={(e) =>
                  onUpdateOverride('layout', 'leftWidthPct', Number(e.target.value))
                }
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-[var(--text-muted)]">
                <span>{lang === 'sv' ? 'Lösningskolumn' : 'Solution Column'}</span>
                <span className="font-mono">{curSolPx}px</span>
              </div>
              <input
                type="range"
                min={120}
                max={420}
                step={4}
                value={curSolPx}
                onChange={(e) =>
                  onUpdateOverride('layout', 'solutionWidthPx', Number(e.target.value))
                }
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {isPosterMode ? (
        <div className="flex-1 min-h-0 flex flex-col">
          <PosterCardRenderer
            item={cardItem}
            lang={lang}
            posterLayout={posterLayout}
            isLandscape={isLandscape}
            displayOptions={displayOptions}
            onUpdatePart={!isProjector ? onUpdatePart : null}
          />
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col">
          <WorkedExampleCard
            item={cardItem}
            lang={lang}
            isPrintMode={isProjector}
            displayOptions={displayOptions}
            onUpdatePart={!isProjector ? onUpdatePart : null}
          />
        </div>
      )}
    </div>
  );
}