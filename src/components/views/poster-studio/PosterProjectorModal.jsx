// src/components/views/poster-studio/PosterProjectorModal.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, RotateCcw, Minus, Plus } from 'lucide-react';
import WorkedExampleSlotControls from '../../shared/WorkedExampleSlotControls';
import { buildProjectorSlides } from './posterLayoutEngine';

function countExampleRevealSteps(ex, pacingMode) {
  if (!ex || pacingMode === 'all_shown') return 0;
  if (pacingMode === 'step_by_step') {
    return ex.clues?.length || 0;
  }
  return (ex.clues || []).reduce((sum, clue) => {
    const blanksInClue =
      (clue.blankText ? 1 : 0) +
      (clue.blankLatex ? 1 : 0) +
      (clue.blankVisual ? 1 : 0);
    return sum + blanksInClue;
  }, 0);
}

export default function PosterProjectorModal({
  isOpen,
  onClose,
  examples,
  examplesById,
  initialSlideIndex = 0,
  cardsPerSlide,
  onChangeCardsPerSlide,
  pacingMode,
  onChangePacingMode,
  writingSpace = 'standard',
  blankStyle = 'line',
  cardClass = '',
  lang = 'sv'
}) {
  const [slideIndex, setSlideIndex] = useState(initialSlideIndex);
  const [revealStepCount, setRevealStepCount] = useState(0);
  const [textZoom, setTextZoom] = useState(1.1);

  useEffect(() => {
    if (isOpen) {
      setSlideIndex(initialSlideIndex);
      setRevealStepCount(0);
    }
  }, [isOpen, initialSlideIndex]);

  const slides = useMemo(
    () => buildProjectorSlides(examples, cardsPerSlide),
    [examples, cardsPerSlide]
  );

  useEffect(() => {
    if (slideIndex >= slides.length) {
      setSlideIndex(Math.max(0, slides.length - 1));
    }
  }, [slides.length, slideIndex]);

  const currentSlide = slides[slideIndex] || slides[0];
  const currentExamples = useMemo(() => {
    if (!currentSlide) return [];
    return (currentSlide.exampleIds || [])
      .map((id) => (id ? examplesById[id] : null))
      .filter(Boolean);
  }, [currentSlide, examplesById]);

  // Sequential per-card step allocation: Card 1 finishes all blanks/steps before Card 2 starts
  const cardAllocations = useMemo(() => {
    let remainingBudget = revealStepCount;
    let totalSlideSteps = 0;

    const items = currentExamples.map((ex) => {
      const cardTotalSteps = countExampleRevealSteps(ex, pacingMode);
      const allocatedSteps = Math.min(remainingBudget, cardTotalSteps);
      const isReceivingFocus =
        pacingMode !== 'all_shown' &&
        remainingBudget < cardTotalSteps &&
        totalSlideSteps <= revealStepCount;

      remainingBudget = Math.max(0, remainingBudget - cardTotalSteps);
      totalSlideSteps += cardTotalSteps;

      return {
        example: ex,
        cardTotalSteps,
        allocatedSteps,
        isReceivingFocus
      };
    });

    return { items, totalSlideSteps };
  }, [currentExamples, pacingMode, revealStepCount]);

  const maxSteps = cardAllocations.totalSlideSteps;

  const handleNext = useCallback(() => {
    if (pacingMode !== 'all_shown' && revealStepCount < maxSteps) {
      setRevealStepCount((prev) => prev + 1);
      return;
    }
    if (slideIndex < slides.length - 1) {
      setSlideIndex((prev) => prev + 1);
      setRevealStepCount(0);
    }
  }, [pacingMode, revealStepCount, maxSteps, slideIndex, slides.length]);

  const handlePrev = useCallback(() => {
    if (pacingMode !== 'all_shown' && revealStepCount > 0) {
      setRevealStepCount((prev) => prev - 1);
      return;
    }
    if (slideIndex > 0) {
      setSlideIndex((prev) => prev - 1);
      setRevealStepCount(0);
    }
  }, [pacingMode, revealStepCount, slideIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      const tag = e.target?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || e.target?.isContentEditable) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        setTextZoom((z) => Math.min(1.6, Number((z + 0.1).toFixed(2))));
      } else if (e.key === '-') {
        e.preventDefault();
        setTextZoom((z) => Math.max(0.8, Number((z - 0.1).toFixed(2))));
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[var(--bg-canvas)] text-[var(--text-main)] flex flex-col overflow-hidden">
      {/* Top Projector Control Bar */}
      <div className="px-5 py-2.5 bg-[var(--bg-card)] text-[var(--text-main)] border-b border-[var(--border-main)] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={slideIndex === 0 && revealStepCount === 0}
            className="p-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-main)] disabled:opacity-30 cursor-pointer"
            title={lang === 'sv' ? 'Föregående (Vänsterpil)' : 'Previous (Left Arrow)'}
          >
            <ChevronLeft size={18} />
          </button>

          <span className="text-xs font-mono font-bold px-2">
            {lang === 'sv' ? 'Bild' : 'Slide'} {slides.length > 0 ? slideIndex + 1 : 0} /{' '}
            {slides.length}
            {pacingMode !== 'all_shown' && maxSteps > 0
              ? ` · ${revealStepCount}/${maxSteps}`
              : ''}
          </span>

          <button
            type="button"
            onClick={handleNext}
            disabled={
              slideIndex >= slides.length - 1 &&
              (pacingMode === 'all_shown' || revealStepCount >= maxSteps)
            }
            className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-30 cursor-pointer"
            title={lang === 'sv' ? 'Nästa (Högerpil / Mellanslag)' : 'Next (Right Arrow / Space)'}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* 1-Card vs 2-Card Toggle */}
        <div className="flex items-center gap-1 bg-[var(--bg-surface)] border border-[var(--border-main)] p-1 rounded-xl text-xs font-bold">
          {[
            { count: 1, sv: '1 kort', en: '1 Card' },
            { count: 2, sv: '2 kort', en: '2 Cards' }
          ].map((opt) => (
            <button
              key={opt.count}
              type="button"
              onClick={() => {
                onChangeCardsPerSlide(opt.count);
                setSlideIndex(0);
                setRevealStepCount(0);
              }}
              className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                cardsPerSlide === opt.count
                  ? 'bg-sky-600 text-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {lang === 'sv' ? opt.sv : opt.en}
            </button>
          ))}
        </div>

        {/* Overall Text & Content Zoom Control */}
        <div
          className="flex items-center gap-1 bg-[var(--bg-surface)] border border-[var(--border-main)] p-1 rounded-xl text-xs font-bold"
          title={lang === 'sv' ? 'Zooma textstorlek (+ / -)' : 'Zoom text size (+ / -)'}
        >
          <button
            type="button"
            onClick={() => setTextZoom((z) => Math.max(0.8, Number((z - 0.1).toFixed(2))))}
            disabled={textZoom <= 0.8}
            className="p-1 rounded-lg hover:bg-[var(--bg-card)] disabled:opacity-30 cursor-pointer"
          >
            <Minus size={13} />
          </button>
          <button
            type="button"
            onClick={() => setTextZoom(1.1)}
            className="px-1.5 font-mono text-[var(--text-main)] hover:text-emerald-600 cursor-pointer"
            title={lang === 'sv' ? 'Återställ zoom' : 'Reset zoom'}
          >
            {Math.round(textZoom * 100)}%
          </button>
          <button
            type="button"
            onClick={() => setTextZoom((z) => Math.min(1.6, Number((z + 0.1).toFixed(2))))}
            disabled={textZoom >= 1.6}
            className="p-1 rounded-lg hover:bg-[var(--bg-card)] disabled:opacity-30 cursor-pointer"
          >
            <Plus size={13} />
          </button>
        </div>

        {/* Pacing Mode Toggle */}
        <div className="flex items-center gap-1 bg-[var(--bg-surface)] border border-[var(--border-main)] p-1 rounded-xl text-xs font-bold">
          {[
            { id: 'guided_blanks', sv: 'Luckor i turordning', en: 'Guided Blanks' },
            { id: 'step_by_step', sv: 'Steg för steg', en: 'Step-by-Step' },
            { id: 'all_shown', sv: 'Visa allt', en: 'All Shown' }
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                onChangePacingMode(m.id);
                setRevealStepCount(0);
              }}
              className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                pacingMode === m.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {lang === 'sv' ? m.sv : m.en}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {pacingMode !== 'all_shown' && (
            <button
              type="button"
              onClick={() => setRevealStepCount(0)}
              className="px-2.5 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-main)] text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>{lang === 'sv' ? 'Nollställ' : 'Reset'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
            title={lang === 'sv' ? 'Stäng projektor (Esc)' : 'Close Projector (Esc)'}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Full-Viewport Slide Stage */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 flex flex-col drafting-desk-bg">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`proj-slide-${slideIndex}-${cardsPerSlide}`}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={`w-full flex-1 min-h-0 ${
              cardsPerSlide === 2
                ? 'grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch'
                : 'flex flex-col items-stretch'
            }`}
          >
            {cardAllocations.items.map(({ example: ex, allocatedSteps, isReceivingFocus }) => (
              <div
                key={ex.id}
                className={`w-full h-full min-h-0 flex flex-col rounded-2xl transition-shadow [&_.worked-example-container]:flex-1 [&_.worked-example-container]:w-full [&_.worked-example-container]:max-w-none ${
                  cardsPerSlide === 2 && isReceivingFocus
                    ? 'ring-2 ring-emerald-500/70'
                    : ''
                }`}
              >
                <WorkedExampleSlotControls
                  example={ex}
                  lang={lang}
                  isProjector={true}
                  textZoom={textZoom}
                  projectorPacingMode={pacingMode}
                  revealStepCount={allocatedSteps}
                  compact={cardsPerSlide === 2}
                  writingSpace={writingSpace}
                  blankStyle={blankStyle}
                  cardClass={cardClass}
                  className="flex-1 flex flex-col min-h-0 w-full"
                />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}