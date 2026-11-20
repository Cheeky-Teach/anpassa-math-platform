// src/components/views/PosterNotesStudio.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Printer,
  Monitor,
  Plus,
  Minus,
  Save,
  HelpCircle,
  GraduationCap,
  KeyRound,
  Maximize2
} from 'lucide-react';
import QuestionSummoner from './QuestionSummoner';
import { PRESENTATION_THEMES } from '../../constants/presentationThemes';
import { useSheetSaver } from '../../hooks/useSheetSaver';
import SaveChoiceModal from '../modals/SaveChoiceModal';
import SpotlightTour from '../shared/SpotlightTour';
import PreferencesToggle from '../ui/PreferencesToggle.jsx';
import {
  normalizeSummonedToExample,
  applyCardPartAction
} from '../shared/workedExampleMapper';
import WorkedExampleSlotControls from '../shared/WorkedExampleSlotControls';
import { AutoFitSlotBox, SheetArtboard } from '../shared/AutoFitSlotBox';
import {
  PAPER_SPECS,
  LAYOUT_PRESETS,
  computeSlotMaxHeightPx,
  parseExamplesFromPacket,
  buildPagesFromExamples
} from './poster-studio/posterLayoutEngine';
import PosterProjectorModal from './poster-studio/PosterProjectorModal';

const TUTORIAL_STORAGE_KEY = 'anpassa_poster_notes_tour_seen_v2';

export default function PosterNotesStudio({
  profile,
  lang = 'sv',
  initialSheetId = null,
  initialTitle = '',
  initialPacket = null,
  initialConfig = null,
  onClose
}) {
  const themeKeys = useMemo(() => Object.keys(PRESENTATION_THEMES || {}), []);
  const defaultThemeId = themeKeys[0] || 'clean';

  const [sheetId, setSheetId] = useState(initialSheetId);
  const [title, setTitle] = useState(
    initialTitle || (lang === 'sv' ? 'Affischer & Anteckningar' : 'Posters & Notes')
  );
  const [printVariant, setPrintVariant] = useState(initialConfig?.printVariant || 'student');
  const [paperFormat, setPaperFormat] = useState(initialConfig?.paperFormat || 'A4_PORTRAIT');
  const [layoutPreset, setLayoutPreset] = useState(initialConfig?.layoutPreset || '1-up');
  const [twoUpDirection, setTwoUpDirection] = useState(
    initialConfig?.twoUpDirection || 'vertical'
  );
  const [themeId, setThemeId] = useState(initialConfig?.themeId || defaultThemeId);
  const [blankStyle, setBlankStyle] = useState(initialConfig?.blankStyle || 'line');
  const [writingSpace, setWritingSpace] = useState(initialConfig?.writingSpace || 'standard');
  const [blankHeightsByExample, setBlankHeightsByExample] = useState(
    initialConfig?.blankHeightsByExample || {}
  );

  // Viewport Zoom ('fit' | 'manual')
  const deskContainerRef = useRef(null);
  const [zoomMode, setZoomMode] = useState('fit');
  const [manualZoom, setManualZoom] = useState(0.85);
  const [fitZoom, setFitZoom] = useState(0.85);

  const [examples, setExamples] = useState(() => parseExamplesFromPacket(initialPacket));
  const [activeMenuExampleId, setActiveMenuExampleId] = useState(null);
  const [regeneratingId, setRegeneratingId] = useState(null);
  const [draggedExampleId, setDraggedExampleId] = useState(null);
  const [canDragCard, setCanDragCard] = useState(false);

  const [activePageIndex, setActivePageIndex] = useState(0);
  const [isSummonerOpen, setIsSummonerOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Projector state
  const [isProjectorOpen, setIsProjectorOpen] = useState(false);
  const [projectorInitialSlide, setProjectorInitialSlide] = useState(0);
  const [projectorCardsPerSlide, setProjectorCardsPerSlide] = useState(
    initialConfig?.projectorCardsPerSlide || 1
  );
  const [projectorPacingMode, setProjectorPacingMode] = useState(
    initialConfig?.projectorPacingMode || 'guided_blanks'
  );

  const activeTheme = PRESENTATION_THEMES?.[themeId] || PRESENTATION_THEMES?.[defaultThemeId] || {};
  const activePaper = PAPER_SPECS[paperFormat] || PAPER_SPECS.A4_PORTRAIT;
  const isTeacherKey = printVariant === 'teacher';
  const isNarrowColumnLayout =
    layoutPreset === 'A5_BOOKLET' ||
    (layoutPreset === '2-up' && twoUpDirection === 'horizontal');

  // Deterministic pagination: automatically pushes overflow sequences onto new pages
  const pages = useMemo(
    () => buildPagesFromExamples(examples, layoutPreset),
    [examples, layoutPreset]
  );

  useEffect(() => {
    if (activePageIndex >= pages.length) {
      setActivePageIndex(Math.max(0, pages.length - 1));
    }
  }, [pages.length, activePageIndex]);

  const slotMaxHeightPx = useMemo(
    () => computeSlotMaxHeightPx(activePaper, layoutPreset, twoUpDirection),
    [activePaper, layoutPreset, twoUpDirection]
  );

  // Auto-calculate Fit-to-Desk zoom
  useEffect(() => {
    const el = deskContainerRef.current;
    if (!el) return;

    const computeFit = () => {
      const availableWidth = Math.max(320, el.clientWidth - 64);
      const rawFit = availableWidth / activePaper.widthPx;
      setFitZoom(Math.max(0.45, Math.min(1, Number(rawFit.toFixed(2)))));
    };

    computeFit();
    const ro = new ResizeObserver(computeFit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [activePaper.widthPx]);

  const effectiveZoom = zoomMode === 'fit' ? fitZoom : manualZoom;

  // Sync incoming saved sheet props if opened without remounting
  useEffect(() => {
    setSheetId(initialSheetId ?? null);
  }, [initialSheetId]);

  useEffect(() => {
    if (initialTitle) setTitle(initialTitle);
  }, [initialTitle]);

  useEffect(() => {
    if (initialPacket) setExamples(parseExamplesFromPacket(initialPacket));
  }, [initialPacket]);

  useEffect(() => {
    if (!initialConfig) return;
    if (initialConfig.paperFormat) setPaperFormat(initialConfig.paperFormat);
    if (initialConfig.layoutPreset) setLayoutPreset(initialConfig.layoutPreset);
    if (initialConfig.twoUpDirection) setTwoUpDirection(initialConfig.twoUpDirection);
    if (initialConfig.themeId) setThemeId(initialConfig.themeId);
    if (initialConfig.blankStyle) setBlankStyle(initialConfig.blankStyle);
    if (initialConfig.writingSpace) setWritingSpace(initialConfig.writingSpace);
    if (initialConfig.printVariant) setPrintVariant(initialConfig.printVariant);
    if (initialConfig.blankHeightsByExample) {
      setBlankHeightsByExample(initialConfig.blankHeightsByExample);
    }
  }, [initialConfig]);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(TUTORIAL_STORAGE_KEY)) {
        const timer = setTimeout(() => setShowTutorial(true), 350);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore storage access errors
    }
  }, []);

  const handleCloseTutorial = useCallback(() => {
    try {
      window.localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    } catch {
      // Ignore storage access errors
    }
    setShowTutorial(false);
  }, []);

  const studioTourSteps = useMemo(
    () => [
      {
        selector: '[data-tour="summon-btn"]',
        title: { sv: '1. Hämta genomgångsexempel', en: '1. Summon Worked Examples' },
        description: {
          sv: 'Klicka här för att välja matematiska moment och lägga till färdiga genomgångskort.',
          en: 'Click here to pick math topics and add worked example cards.'
        }
      },
      {
        selector: '[data-tour="layout-controls"]',
        title: { sv: '2. Välj bladlayout & pappersformat', en: '2. Choose Sheet Layout & Paper' },
        description: {
          sv: 'Växla mellan affisch (1 per blad), 2 per blad, 4-rutnät, anteckningsflöde eller dubbelsidigt A5-häfte.',
          en: 'Switch between poster (1 per sheet), 2 per sheet, 4-grid, notes flow, or A5 booklet spreads.'
        }
      },
      {
        selector: '[data-tour="sheet-stage"]',
        title: { sv: '3. Klicka på kortdelar för att skapa luckor', en: '3. Click Card Parts to Create Blanks' },
        description: {
          sv: 'Klicka på text eller formel direkt på arket för att skapa skrivluckor och dra i skrivhöjden—kortet skalas automatiskt för att passa bladet.',
          en: 'Click any text or equation on the sheet to create blanks and drag writing height—the card auto-scales to fit its slot.'
        }
      },
      {
        selector: '[data-tour="projector-print-actions"]',
        title: { sv: '4. Elev/Facit, projektor & utskrift', en: '4. Student/Teacher Key, Projector & Print' },
        description: {
          sv: 'Växla mellan Elev och Facit (*), starta projektorläget på tavlan eller skriv ut direkt.',
          en: 'Switch between Student and Teacher Key (*), launch Projector Mode, or print directly.'
        }
      }
    ],
    []
  );

  useEffect(() => {
    if (!canDragCard) return;
    const resetDrag = () => setCanDragCard(false);
    window.addEventListener('pointerup', resetDrag);
    window.addEventListener('dragend', resetDrag);
    return () => {
      window.removeEventListener('pointerup', resetDrag);
      window.removeEventListener('dragend', resetDrag);
    };
  }, [canDragCard]);

  const {
    isSaving,
    showSaveChoiceModal,
    setShowSaveChoiceModal,
    executeSave,
    triggerSave
  } = useSheetSaver({
    sheetId,
    setSheetId,
    title,
    setTitle,
    lang,
    buildPayload: ({ userId, finalTitle }) => ({
      title: finalTitle,
      type: 'poster_notes',
      user_id: userId,
      visibility: 'private',
      school_name: profile?.school_name?.trim() || null,
      packet: { schemaVersion: 1, examples, pages },
      config: {
        schemaVersion: 1,
        paperFormat,
        layoutPreset,
        twoUpDirection,
        themeId,
        blankStyle,
        writingSpace,
        printVariant,
        blankHeightsByExample,
        projectorPacingMode,
        projectorCardsPerSlide
      },
      auto_topics: [...new Set(examples.map((ex) => ex.topicId).filter(Boolean))]
    })
  });

  const examplesById = useMemo(() => {
    const map = {};
    examples.forEach((ex) => {
      map[ex.id] = ex;
    });
    return map;
  }, [examples]);

  const handleSelectLayoutPreset = (nextPreset) => {
    setLayoutPreset(nextPreset);
    if (
      (nextPreset === 'A5_BOOKLET' ||
        (nextPreset === '2-up' && twoUpDirection === 'horizontal')) &&
      (paperFormat === 'A4_PORTRAIT' || paperFormat === 'A3_PORTRAIT')
    ) {
      setPaperFormat(paperFormat === 'A4_PORTRAIT' ? 'A4_LANDSCAPE' : 'A3_LANDSCAPE');
    }
  };

  const handleSummonItems = (summonedItems) => {
    if (!Array.isArray(summonedItems) || summonedItems.length === 0) return;
    const normalized = summonedItems.map((item, idx) =>
      normalizeSummonedToExample(item, examples.length + idx)
    );
    setExamples((prev) => [...prev, ...normalized]);
    setIsSummonerOpen(false);
  };

  const handleRegenerateExample = async (example, mode = 'numbers') => {
    if (!example || regeneratingId) return;

    if (example.hasCustomEdits) {
      const warningMsg =
        lang === 'sv'
          ? 'Du har gjort egna textändringar i det här exemplet. Om du slumpar fram ett nytt exempel skrivs dina ändringar över. Vill du fortsätta?'
          : 'You have custom text edits in this example. Generating a new example will overwrite your edits. Continue?';
      if (!window.confirm(warningMsg)) return;
    }

    if (mode === 'story') {
      const stories = example.rawItem?.resolvedData?.renderData?.availableStories;
      if (Array.isArray(stories) && stories.length > 1) {
        const currentIdx = example.rawItem?.selectedStoryIndex ?? 0;
        let nextIdx = Math.floor(Math.random() * stories.length);
        if (nextIdx === currentIdx) nextIdx = (nextIdx + 1) % stories.length;
        const nextNorm = normalizeSummonedToExample(
          {
            ...example.rawItem,
            promptText: undefined,
            promptLatex: undefined,
            selectedStoryIndex: nextIdx
          },
          0
        );

        const preservedClues = nextNorm.clues.map((newClue, cIdx) => {
          const oldClue = example.clues?.[cIdx];
          if (!oldClue) return newClue;
          return {
            ...newClue,
            blankText: Boolean(oldClue.blankText),
            blankLatex: Boolean(oldClue.blankLatex),
            blankVisual: Boolean(oldClue.blankVisual),
            hidden: Boolean(oldClue.hidden),
            hideText: Boolean(oldClue.hideText),
            hideLatex: Boolean(oldClue.hideLatex)
          };
        });

        setExamples((prev) =>
          prev.map((ex) =>
            ex.id === example.id
              ? {
                  ...nextNorm,
                  clues: preservedClues,
                  id: example.id,
                  title: example.title || nextNorm.title,
                  hasCustomEdits: false,
                  overrides: example.overrides
                }
              : ex
          )
        );
        return;
      }
    }

    if (!example.topicId || !example.variationKey) return;

    setRegeneratingId(example.id);
    try {
      const isWP =
        example.rawItem?.selectedStoryIndex !== null &&
        example.rawItem?.selectedStoryIndex !== undefined;
      const res = await fetch(
        `/api/question?topic=${encodeURIComponent(example.topicId)}&variation=${encodeURIComponent(
          example.variationKey
        )}&lang=${encodeURIComponent(lang)}&wordProblem=${isWP}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const freshData = await res.json();

      const freshRenderData = freshData.renderData || freshData;
      const mergedRaw = {
        ...(example.rawItem || {}),
        id: example.id,
        topicId: example.topicId,
        variationKey: example.variationKey,
        promptText: freshRenderData.description || freshData.text || '',
        promptLatex: freshRenderData.latex || freshData.latex || '',
        clues: freshData.clues || freshData.resolvedData?.clues || [],
        renderData: freshRenderData,
        resolvedData: freshData
      };
      const refreshed = normalizeSummonedToExample(mergedRaw, 0);

      // Preserve guided-note structure (blanks & hidden parts) while resetting custom text edits
      const preservedClues = refreshed.clues.map((newClue, cIdx) => {
        const oldClue = example.clues?.[cIdx];
        if (!oldClue) return newClue;
        return {
          ...newClue,
          blankText: Boolean(oldClue.blankText),
          blankLatex: Boolean(oldClue.blankLatex),
          blankVisual: Boolean(oldClue.blankVisual),
          hidden: Boolean(oldClue.hidden),
          hideText: Boolean(oldClue.hideText),
          hideLatex: Boolean(oldClue.hideLatex)
        };
      });

      setExamples((prev) =>
        prev.map((ex) =>
          ex.id === example.id
            ? {
                ...refreshed,
                clues: preservedClues,
                id: example.id,
                title: example.title || refreshed.title,
                hasCustomEdits: false,
                overrides: example.overrides
              }
            : ex
        )
      );
    } catch (err) {
      console.error('Failed to regenerate example:', err);
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleDropExample = (targetId) => {
    if (!draggedExampleId || draggedExampleId === targetId) {
      setDraggedExampleId(null);
      setCanDragCard(false);
      return;
    }
    setExamples((prev) => {
      const fromIdx = prev.findIndex((ex) => ex.id === draggedExampleId);
      const toIdx = prev.findIndex((ex) => ex.id === targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(fromIdx, 1);
      copy.splice(toIdx, 0, moved);
      return copy;
    });
    setDraggedExampleId(null);
    setCanDragCard(false);
  };

  const openProjectorAt = (pageIdx = activePageIndex) => {
    const targetPage = pages[pageIdx];
    const firstExId = (targetPage?.slotExampleIds || []).find(Boolean);
    const seqIdx = firstExId ? examples.findIndex((ex) => ex.id === firstExId) : 0;
    const mappedSlide =
      seqIdx > 0 ? Math.floor(seqIdx / (projectorCardsPerSlide === 2 ? 2 : 1)) : 0;

    setProjectorInitialSlide(Math.max(0, mappedSlide));
    setIsProjectorOpen(true);
  };

  const scrollToSheet = (targetIdx) => {
    const clamped = Math.max(0, Math.min(pages.length - 1, targetIdx));
    setActivePageIndex(clamped);
    const node = deskContainerRef.current?.querySelector(`[data-sheet-index="${clamped}"]`);
    node?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderSlot = (exId, { compact = false } = {}) => {
    const example = exId ? examplesById[exId] : null;
    return (
      <AutoFitSlotBox maxHeightPx={slotMaxHeightPx} disabled={!example}>
        <WorkedExampleSlotControls
          example={example}
          lang={lang}
          isTeacherKey={isTeacherKey}
          compact={compact}
          defaultStacked={isNarrowColumnLayout}
          writingSpace={writingSpace}
          blankStyle={blankStyle}
          blankHeights={example ? blankHeightsByExample[example.id] || {} : {}}
          onBlankHeightChange={
            example
              ? (stepIdx, kind, nextH) =>
                  setBlankHeightsByExample((prev) => ({
                    ...prev,
                    [example.id]: {
                      ...(prev[example.id] || {}),
                      [`${stepIdx}:${kind}`]: nextH
                    }
                  }))
              : null
          }
          cardClass={activeTheme.cardClass || ''}
          isMenuOpen={Boolean(example && activeMenuExampleId === example.id)}
          onToggleMenu={
            example
              ? () => setActiveMenuExampleId((prev) => (prev === example.id ? null : example.id))
              : null
          }
          isRegenerating={Boolean(example && regeneratingId === example.id)}
          onRegenerate={handleRegenerateExample}
          onUpdatePart={
            example
              ? (action, payload) =>
                  setExamples((prev) =>
                    prev.map((item) =>
                      item.id === example.id ? applyCardPartAction(item, action, payload) : item
                    )
                  )
              : null
          }
          onUpdateOverride={
            example
              ? (section, key, value) =>
                  setExamples((prev) =>
                    prev.map((item) =>
                      item.id === example.id
                        ? {
                            ...item,
                            overrides: {
                              ...(item.overrides || {}),
                              [section]: { ...(item.overrides?.[section] || {}), [key]: value }
                            }
                          }
                        : item
                    )
                  )
              : null
          }
          onResetOverrides={
            example
              ? () => {
                  setExamples((prev) =>
                    prev.map((item) =>
                      item.id === example.id ? { ...item, overrides: null } : item
                    )
                  );
                  setBlankHeightsByExample((prev) => {
                    const next = { ...prev };
                    delete next[example.id];
                    return next;
                  });
                }
              : null
          }
          onRemove={
            example
              ? () => {
                  setExamples((prev) => prev.filter((item) => item.id !== example.id));
                  if (activeMenuExampleId === example.id) setActiveMenuExampleId(null);
                }
              : null
          }
          draggableProps={
            example
              ? {
                  isDragging: draggedExampleId === example.id,
                  onHandlePointerDown: () => setCanDragCard(true),
                  containerProps: {
                    draggable: canDragCard,
                    onDragStart: (e) => {
                      if (!canDragCard) {
                        e.preventDefault();
                        return;
                      }
                      setDraggedExampleId(example.id);
                      e.dataTransfer.effectAllowed = 'move';
                    },
                    onDragOver: (e) => e.preventDefault(),
                    onDrop: (e) => {
                      e.preventDefault();
                      handleDropExample(example.id);
                    },
                    onDragEnd: () => {
                      setDraggedExampleId(null);
                      setCanDragCard(false);
                    }
                  }
                }
              : null
          }
        />
      </AutoFitSlotBox>
    );
  };

  const renderPageContent = (pg) => {
    const slots = pg.slotExampleIds || [];

    if (layoutPreset === '4-up') {
      return (
        <div className="grid grid-cols-2 gap-3">
          {slots.map((exId, slotIdx) => (
            <div key={`${pg.id}_slot_${slotIdx}`} className="min-w-0">
              {renderSlot(exId, { compact: true })}
            </div>
          ))}
        </div>
      );
    }

    if (layoutPreset === 'A5_BOOKLET') {
      return (
        <div className="grid grid-cols-2 gap-6 items-stretch flex-1 relative">
          <div className="pr-3 border-r-2 border-dashed border-[var(--border-strong)] flex flex-col justify-between">
            <div className="flex-1">{renderSlot(slots[0] || null, { compact: true })}</div>
            <div className="flex items-center justify-between text-xs font-mono font-bold text-[var(--text-muted)] mt-1">
              <span>{lang === 'sv' ? `Sida ${pg.leftA5Number ?? 2}` : `Page ${pg.leftA5Number ?? 2}`}</span>
              <span className="print:hidden text-[10px]">
                {lang === 'sv'
                  ? `Ark ${pg.sheetNumber || 1} (${pg.isBackSide ? 'Baksida' : 'Framsida'})`
                  : `Sheet ${pg.sheetNumber || 1} (${pg.isBackSide ? 'Back' : 'Front'})`}
              </span>
            </div>
          </div>

          <div className="pl-1 flex flex-col justify-between">
            <div className="flex-1">{renderSlot(slots[1] || null, { compact: true })}</div>
            <div className="text-xs font-mono font-bold text-[var(--text-muted)] mt-1 text-right">
              {lang === 'sv' ? `Sida ${pg.rightA5Number ?? 1}` : `Page ${pg.rightA5Number ?? 1}`}
            </div>
          </div>
        </div>
      );
    }

    if (layoutPreset === 'notes_flow') {
      return (
        <div className="flex flex-col gap-3">
          {slots.map((exId, slotIdx) => (
            <div
              key={`${pg.id}_slot_${slotIdx}`}
              className={slotIdx > 0 ? 'pt-2 border-t border-dashed border-[var(--border-main)]' : ''}
            >
              {renderSlot(exId, { compact: true })}
            </div>
          ))}
        </div>
      );
    }

    if (layoutPreset === '2-up' && twoUpDirection === 'horizontal') {
      return (
        <div className="grid grid-cols-2 gap-5 items-stretch flex-1">
          {slots.map((exId, slotIdx) => (
            <div key={`${pg.id}_slot_${slotIdx}`} className="min-w-0 flex flex-col">
              {renderSlot(exId, { compact: true })}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        {slots.map((exId, slotIdx) => (
          <div key={`${pg.id}_slot_${slotIdx}`}>{renderSlot(exId, { compact: false })}</div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`poster-studio-root fixed inset-0 z-30 flex flex-col bg-[var(--bg-canvas)] text-[var(--text-main)] select-none ${
        activeTheme.wrapperClass || ''
      }`}
      style={activeTheme.cssVars || {}}
    >
      <style>{`
        .poster-sheet-artboard {
          font-size: 14px;
        }
        @media print {
          @page {
            size: ${activePaper.pageCss};
            margin: 0;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            height: auto !important;
            overflow: visible !important;
          }
          .poster-studio-root,
          .poster-studio-root * {
            visibility: visible !important;
          }
          .poster-studio-root,
          .poster-studio-body {
            position: static !important;
            inset: auto !important;
            display: block !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            background: white !important;
          }
          .poster-sheet-sizer {
            width: var(--sheet-w-mm) !important;
            height: var(--sheet-h-mm) !important;
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
            break-after: page;
            page-break-after: always;
          }
          .poster-sheet-sizer:last-child {
            break-after: auto;
            page-break-after: auto;
          }
          .poster-sheet-artboard {
            transform: none !important;
            width: 100% !important;
            height: 100% !important;
            padding: 10mm !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      {/* Top Studio Bar */}
      <header className="relative z-50 px-4 sm:px-6 py-2.5 bg-[var(--bg-card)] border-b border-[var(--border-main)] flex items-center justify-between gap-3 shrink-0 print:hidden">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-main)] text-xs font-bold cursor-pointer shrink-0"
          >
            <ChevronLeft size={14} />
            <span>{lang === 'sv' ? 'Tillbaka' : 'Back'}</span>
          </button>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder={
              lang === 'sv' ? 'Titel på affisch eller anteckningar...' : 'Poster or notes title...'
            }
            className="bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg px-3 py-1.5 text-sm font-bold outline-none focus:border-emerald-600 max-w-xs w-full"
          />

          <button
            type="button"
            onClick={() => triggerSave()}
            disabled={isSaving}
            className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-strong)] text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-40"
          >
            <Save size={13} className="text-emerald-600" />
            <span>{lang === 'sv' ? 'Spara' : 'Save'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowTutorial(true)}
            className="px-2.5 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-main)] text-xs font-bold flex items-center gap-1 cursor-pointer"
            title={lang === 'sv' ? 'Visa snabbguide' : 'Show quick tour'}
          >
            <HelpCircle size={14} className="text-sky-600" />
            <span className="hidden md:inline">{lang === 'sv' ? 'Guide' : 'Guide'}</span>
          </button>

          <PreferencesToggle />

          <button
            type="button"
            data-tour="summon-btn"
            onClick={() => setIsSummonerOpen(true)}
            className="btn-brand px-3 py-1.5 text-xs cursor-pointer"
          >
            <Plus size={14} />
            <span>{lang === 'sv' ? 'Hämta uppgifter' : 'Summon Questions'}</span>
          </button>

          <div data-tour="projector-print-actions" className="flex items-center gap-2">
            <div
              className="flex items-center bg-[var(--bg-surface)] border border-[var(--border-main)] p-0.5 rounded-xl"
              title={
                lang === 'sv'
                  ? 'Växla mellan elevblad med luckor och facit med alla steg'
                  : 'Switch between student blanks and teacher key with all steps'
              }
            >
              <button
                type="button"
                onClick={() => setPrintVariant('student')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                  !isTeacherKey
                    ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-2xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <GraduationCap size={13} />
                <span>{lang === 'sv' ? 'Elev' : 'Student'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPrintVariant('teacher')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                  isTeacherKey
                    ? 'bg-emerald-600 text-white'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <KeyRound size={13} />
                <span>{lang === 'sv' ? 'Facit' : 'Teacher Key'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => openProjectorAt(activePageIndex)}
              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Monitor size={14} />
              <span>{lang === 'sv' ? 'Projektor' : 'Projector'}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-strong)] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer size={14} />
              <span>
                {isTeacherKey
                  ? lang === 'sv'
                    ? 'Skriv ut facit'
                    : 'Print Key'
                  : lang === 'sv'
                    ? 'Skriv ut'
                    : 'Print'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="poster-studio-body flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar */}
        <aside className="w-64 bg-[var(--bg-card)] border-r border-[var(--border-main)] p-4 space-y-4 overflow-y-auto shrink-0 print:hidden">
          <div data-tour="layout-controls" className="space-y-3">
            <div>
              <label className="text-xs font-bold tracking-wider text-[var(--text-muted)] block mb-1.5">
                {lang === 'sv' ? 'Pappersformat' : 'Paper Format'}
              </label>
              <select
                value={paperFormat}
                onChange={(e) => setPaperFormat(e.target.value)}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg px-3 py-2 text-xs font-bold outline-none"
              >
                {Object.entries(PAPER_SPECS).map(([key, spec]) => (
                  <option key={key} value={key}>
                    {lang === 'sv' ? spec.labelSv : spec.labelEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold tracking-wider text-[var(--text-muted)] block mb-1.5">
                {lang === 'sv' ? 'Bladlayout' : 'Sheet Layout'}
              </label>
              <div className="grid grid-cols-1 gap-1 bg-[var(--bg-surface)] p-1 rounded-xl border border-[var(--border-main)]">
                {Object.entries(LAYOUT_PRESETS).map(([presetKey, spec]) => (
                  <button
                    key={presetKey}
                    type="button"
                    onClick={() => handleSelectLayoutPreset(presetKey)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold text-left cursor-pointer transition-colors ${
                      layoutPreset === presetKey
                        ? 'bg-emerald-600 text-white'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    {lang === 'sv' ? spec.sv : spec.en}
                  </button>
                ))}
              </div>

              {layoutPreset === '2-up' && (
                <div className="mt-2.5">
                  <span className="text-xs font-bold tracking-wider text-[var(--text-muted)] block mb-1">
                    {lang === 'sv' ? 'Placering (2 per blad)' : '2-up Arrangement'}
                  </span>
                  <div className="grid grid-cols-2 gap-1 bg-[var(--bg-surface)] p-1 rounded-xl border border-[var(--border-main)]">
                    {[
                      { id: 'vertical', sv: 'Ovanpå varandra', en: 'Top / Bottom' },
                      { id: 'horizontal', sv: 'Sida vid sida', en: 'Side by Side' }
                    ].map((dir) => (
                      <button
                        key={dir.id}
                        type="button"
                        onClick={() => {
                          setTwoUpDirection(dir.id);
                          if (dir.id === 'horizontal' && paperFormat === 'A4_PORTRAIT') {
                            setPaperFormat('A4_LANDSCAPE');
                          } else if (dir.id === 'vertical' && paperFormat === 'A4_LANDSCAPE') {
                            setPaperFormat('A4_PORTRAIT');
                          }
                        }}
                        className={`py-1 px-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          twoUpDirection === dir.id
                            ? 'bg-[var(--bg-card)] text-[var(--brand-text)]'
                            : 'text-[var(--text-muted)]'
                        }`}
                      >
                        {lang === 'sv' ? dir.sv : dir.en}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {themeKeys.length > 0 && (
            <div>
              <label className="text-xs font-bold tracking-wider text-[var(--text-muted)] block mb-1.5">
                {lang === 'sv' ? 'Stiltema' : 'Visual Theme'}
              </label>
              <select
                value={themeId}
                onChange={(e) => setThemeId(e.target.value)}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-lg px-3 py-2 text-xs font-bold outline-none"
              >
                {themeKeys.map((key) => (
                  <option key={key} value={key}>
                    {PRESENTATION_THEMES[key]?.name?.[lang] ||
                      PRESENTATION_THEMES[key]?.name?.sv ||
                      key}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-3 border-t border-[var(--border-main)] space-y-2.5">
            <div>
              <span className="text-xs font-bold tracking-wider text-[var(--text-muted)] block mb-1">
                {lang === 'sv' ? 'Skrivutrymme (handstil)' : 'Handwriting Space'}
              </span>
              <div className="grid grid-cols-2 gap-1 bg-[var(--bg-surface)] p-1 rounded-xl border border-[var(--border-main)]">
                {[
                  { id: 'standard', sv: 'Standard', en: 'Standard' },
                  { id: 'generous', sv: 'Rymligt', en: 'Generous' }
                ].map((ws) => (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => setWritingSpace(ws.id)}
                    className={`py-1 rounded-lg text-xs font-bold cursor-pointer ${
                      writingSpace === ws.id
                        ? 'bg-[var(--bg-card)] text-[var(--brand-text)]'
                        : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {lang === 'sv' ? ws.sv : ws.en}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold tracking-wider text-[var(--text-muted)] block mb-1">
                {lang === 'sv' ? 'Typ av skrivlucka' : 'Blank Style'}
              </span>
              <div className="grid grid-cols-3 gap-1 bg-[var(--bg-surface)] p-1 rounded-xl border border-[var(--border-main)]">
                {[
                  { id: 'line', sv: 'Linje', en: 'Line' },
                  { id: 'box', sv: 'Ruta', en: 'Box' },
                  { id: 'dotted', sv: 'Prick', en: 'Dotted' }
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setBlankStyle(st.id)}
                    className={`py-1 rounded-lg text-xs font-bold cursor-pointer ${
                      blankStyle === st.id
                        ? 'bg-[var(--bg-card)] text-[var(--brand-text)]'
                        : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {lang === 'sv' ? st.sv : st.en}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Center Canva-Style Drafting Desk Stage */}
        <div className="flex-1 flex flex-col relative overflow-hidden min-h-0">
          <main
            ref={deskContainerRef}
            data-tour="sheet-stage"
            className="flex-1 overflow-auto p-10 pb-20 print:p-0 print:overflow-visible flex flex-col items-center gap-10 print:gap-0 drafting-desk-bg"
          >
            {pages.map((pg, idx) => (
              <SheetArtboard
                key={pg.id}
                idx={idx}
                totalPages={pages.length}
                activePaper={activePaper}
                zoom={effectiveZoom}
                isActive={activePageIndex === idx}
                onSelect={() => setActivePageIndex(idx)}
                lang={lang}
              >
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between border-b-2 border-stone-900 pb-2 mb-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-extrabold tracking-tight">{title}</h2>
                      {isTeacherKey && (
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-600 text-emerald-800 font-mono text-xs font-bold">
                          {lang === 'sv'
                            ? 'FACIT · * = elevlucka'
                            : 'TEACHER KEY · * = student blank'}
                        </span>
                      )}
                      <span className="print:hidden text-xs font-mono px-1.5 py-0.5 rounded-lg bg-[var(--bg-surface)] text-[var(--text-muted)]">
                        {lang === 'sv'
                          ? LAYOUT_PRESETS[layoutPreset]?.sv
                          : LAYOUT_PRESETS[layoutPreset]?.en}
                      </span>
                    </div>
                    <span className="print:hidden text-xs font-mono font-bold text-[var(--text-muted)]">
                      {idx + 1} / {pages.length}
                    </span>
                  </div>

                  {renderPageContent(pg)}
                </div>

                {/* Anpassa.app Brand Footer */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none select-none pt-1.5 mt-1.5 border-t border-stone-200/80 flex items-center justify-between text-[10px] font-mono text-stone-400 shrink-0"
                >
                  <span>
                    {lang === 'sv' ? 'Skapad med Anpassa.app' : 'Created with Anpassa.app'}
                  </span>
                  <span className="font-bold text-stone-500">anpassa.app</span>
                </div>
              </SheetArtboard>
            ))}
          </main>

          {/* Floating Bottom-Right Page & Zoom Bar */}
          <div className="print:hidden absolute bottom-4 right-5 z-30 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[var(--bg-card)]/95 backdrop-blur-xs border border-[var(--border-strong)] shadow-lg text-xs font-bold">
            {pages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => scrollToSheet(activePageIndex - 1)}
                  disabled={activePageIndex === 0}
                  className="p-1 rounded-lg hover:bg-[var(--bg-surface)] disabled:opacity-30 cursor-pointer"
                  title={lang === 'sv' ? 'Föregående blad' : 'Previous sheet'}
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="font-mono px-1 text-[var(--text-main)]">
                  {lang === 'sv' ? 'Blad' : 'Sheet'} {activePageIndex + 1}/{pages.length}
                </span>
                <button
                  type="button"
                  onClick={() => scrollToSheet(activePageIndex + 1)}
                  disabled={activePageIndex >= pages.length - 1}
                  className="p-1 rounded-lg hover:bg-[var(--bg-surface)] disabled:opacity-30 cursor-pointer"
                  title={lang === 'sv' ? 'Nästa blad' : 'Next sheet'}
                >
                  <ChevronRight size={14} />
                </button>
                <div className="h-4 w-px bg-[var(--border-main)] mx-1" />
              </>
            )}

            <button
              type="button"
              onClick={() => {
                setZoomMode('manual');
                setManualZoom(
                  Math.max(0.45, Math.min(1.25, Number((effectiveZoom - 0.1).toFixed(2))))
                );
              }}
              disabled={effectiveZoom <= 0.45}
              className="p-1 rounded-lg hover:bg-[var(--bg-surface)] disabled:opacity-30 cursor-pointer"
              title={lang === 'sv' ? 'Zooma ut' : 'Zoom out'}
            >
              <Minus size={14} />
            </button>

            <span className="font-mono w-11 text-center text-[var(--text-main)]">
              {Math.round(effectiveZoom * 100)}%
            </span>

            <button
              type="button"
              onClick={() => {
                setZoomMode('manual');
                setManualZoom(
                  Math.max(0.45, Math.min(1.25, Number((effectiveZoom + 0.1).toFixed(2))))
                );
              }}
              disabled={effectiveZoom >= 1.25}
              className="p-1 rounded-lg hover:bg-[var(--bg-surface)] disabled:opacity-30 cursor-pointer"
              title={lang === 'sv' ? 'Zooma in' : 'Zoom in'}
            >
              <Plus size={14} />
            </button>

            <button
              type="button"
              onClick={() => setZoomMode('fit')}
              className={`ml-0.5 px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors ${
                zoomMode === 'fit'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
              title={lang === 'sv' ? 'Anpassa efter fönster' : 'Fit to window'}
            >
              <Maximize2 size={11} />
              <span>{lang === 'sv' ? 'Anpassa' : 'Fit'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Shared Spotlight Walkthrough Tutorial */}
      <SpotlightTour
        steps={studioTourSteps}
        isOpen={showTutorial && !isProjectorOpen && !isSummonerOpen}
        onClose={handleCloseTutorial}
        lang={lang}
      />

      {/* Save Overwrite vs. Save as Copy Modal */}
      <SaveChoiceModal
        isOpen={showSaveChoiceModal}
        onClose={() => setShowSaveChoiceModal(false)}
        onOverwrite={async () => {
          setShowSaveChoiceModal(false);
          await executeSave({ forceNewCopy: false, silent: false });
        }}
        onSaveAsCopy={async () => {
          setShowSaveChoiceModal(false);
          await executeSave({ forceNewCopy: true, silent: false });
        }}
        lang={lang}
        itemTypeLabel={{
          sv: 'affisch / anteckningar',
          en: 'poster / notes'
        }}
      />

      {/* Question Summoner Modal */}
      {isSummonerOpen && (
        <QuestionSummoner
          lang={lang}
          onClose={() => setIsSummonerOpen(false)}
          onSummon={handleSummonItems}
        />
      )}

      {/* Classroom Projector Modal */}
      <PosterProjectorModal
        isOpen={isProjectorOpen}
        onClose={() => setIsProjectorOpen(false)}
        examples={examples}
        examplesById={examplesById}
        initialSlideIndex={projectorInitialSlide}
        cardsPerSlide={projectorCardsPerSlide}
        onChangeCardsPerSlide={setProjectorCardsPerSlide}
        pacingMode={projectorPacingMode}
        onChangePacingMode={setProjectorPacingMode}
        writingSpace={writingSpace}
        blankStyle={blankStyle}
        cardClass={activeTheme.cardClass || ''}
        lang={lang}
      />
    </div>
  );
}