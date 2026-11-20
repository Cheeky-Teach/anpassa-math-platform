// src/components/views/PosterNotesStudio.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Printer,
  Monitor,
  Plus,
  Trash2,
  LayoutGrid,
  Save,
  X,
  RotateCcw,
  RefreshCcw,
  Shuffle,
  GripVertical,
  SlidersHorizontal,
  Columns,
  HelpCircle,
  GraduationCap,
  KeyRound
} from 'lucide-react';
import QuestionSummoner from './QuestionSummoner';
import WorkedExampleCard from '../shared/WorkedExampleCard.jsx';
import { PRESENTATION_THEMES } from '../../constants/presentationThemes';
import { useSheetSaver } from '../../hooks/useSheetSaver';
import SaveChoiceModal from '../modals/SaveChoiceModal';
import SpotlightTour from '../shared/SpotlightTour';
import PreferencesToggle from '../ui/PreferencesToggle.jsx';

const PAPER_SPECS = {
  A4_PORTRAIT: {
    labelSv: 'A4 Stående',
    labelEn: 'A4 Portrait',
    widthMm: 210,
    heightMm: 297,
    pageCss: 'A4 portrait'
  },
  A4_LANDSCAPE: {
    labelSv: 'A4 Liggande',
    labelEn: 'A4 Landscape',
    widthMm: 297,
    heightMm: 210,
    pageCss: 'A4 landscape'
  },
  A3_PORTRAIT: {
    labelSv: 'A3 Stående',
    labelEn: 'A3 Portrait',
    widthMm: 297,
    heightMm: 420,
    pageCss: 'A3 portrait'
  },
  A3_LANDSCAPE: {
    labelSv: 'A3 Liggande',
    labelEn: 'A3 Landscape',
    widthMm: 420,
    heightMm: 297,
    pageCss: 'A3 landscape'
  }
};

const LAYOUT_PRESETS = {
  '1-up': {
    perPage: 1,
    sv: '1 per blad',
    en: '1 per sheet'
  },
  '2-up': {
    perPage: 2,
    sv: '2 per blad',
    en: '2 per sheet'
  },
  '4-up': {
    perPage: 4,
    sv: '4-rutnät',
    en: '4-Grid'
  },
  notes_flow: {
    perPage: 3,
    sv: 'Anteckningsflöde',
    en: 'Notes Flow'
  },
  A5_BOOKLET: {
    perPage: 2,
    sv: 'A5-häfte (uppslag)',
    en: 'A5 Booklet Spread'
  }
};

const DEFAULT_VISIBILITY = {
  showPromptText: true,
  showPromptLatex: true,
  showPromptOptions: true,
  showVisual: true,
  showStepText: true,
  showStepLatex: true
};

const DEFAULT_TYPOGRAPHY = {
  promptTextSize: 'sm',
  promptLatexSize: 'sm',
  stepTextSize: 'sm',
  stepLatexSize: 'sm'
};

const DEFAULT_CARD_LAYOUT = {
  leftWidthPct: 38,
  solutionWidthPx: 176,
  visualZoom: 1,
  visualOffsetX: 0,
  visualOffsetY: 0
};

const TUTORIAL_STORAGE_KEY = 'anpassa_poster_notes_tour_seen_v2';

function normalizeSummonedToExample(rawItem, index = 0) {
  const rd =
    rawItem?.resolvedData?.renderData ||
    rawItem?.resolvedData ||
    rawItem?.renderData ||
    {};
  const rawClues = rawItem?.clues || rawItem?.resolvedData?.clues || [];

  const clues = Array.isArray(rawClues)
    ? rawClues.map((clue, cIdx) => {
        if (typeof clue === 'string') {
          return {
            id: `clue_${Date.now()}_${index}_${cIdx}`,
            text: clue,
            sv: clue,
            en: clue,
            latex: null,
            visual: null,
            blankText: false,
            blankLatex: false,
            blankVisual: false
          };
        }
        const resolvedText = clue.text || clue.sv || clue.en || '';
        return {
          id: clue.id || `clue_${Date.now()}_${index}_${cIdx}`,
          text: resolvedText,
          sv: clue.sv || resolvedText,
          en: clue.en || resolvedText,
          latex: clue.latex || null,
          visual: clue.visual || null,
          blankText: Boolean(clue.blankText),
          blankLatex: Boolean(clue.blankLatex),
          blankVisual: Boolean(clue.blankVisual)
        };
      })
    : [];

  return {
    id: rawItem?.id || `ex_${Date.now()}_${index}`,
    origin: rawItem?.origin || 'summoned',
    topicId: rawItem?.topicId || '',
    variationKey: rawItem?.variationKey || '',
    name: rawItem?.name || rd?.title || `Exempel ${index + 1}`,
    title: rawItem?.name || rd?.title || `Exempel ${index + 1}`,
    promptText: rd?.description || rawItem?.text || '',
    promptLatex: rd?.latex || '',
    clues,
    overrides: null,
    rawItem
  };
}

function parseExamplesFromPacket(packet) {
  if (packet?.examples && typeof packet.examples === 'object') {
    const list = Array.isArray(packet.examples)
      ? packet.examples
      : Object.values(packet.examples);
    return list.map((ex, idx) => ({
      ...normalizeSummonedToExample(ex, idx),
      overrides: ex.overrides || null
    }));
  }
  return [];
}

function imposeA5BookletSpreads(examplesList) {
  if (!examplesList.length) {
    return [
      {
        id: 'booklet_sheet_1_front',
        pageNumber: 1,
        sheetNumber: 1,
        isBackSide: false,
        layout: 'A5_BOOKLET',
        leftA5Number: 2,
        rightA5Number: 1,
        slotExampleIds: [null, null]
      }
    ];
  }

  const totalPages = Math.ceil(examplesList.length / 4) * 4;
  const padded = [...examplesList];
  while (padded.length < totalPages) {
    padded.push(null);
  }

  const sheetCount = totalPages / 4;
  const spreads = [];

  for (let s = 0; s < sheetCount; s++) {
    const frontLeftNum = totalPages - 2 * s;
    const frontRightNum = 2 * s + 1;
    const backLeftNum = 2 * s + 2;
    const backRightNum = totalPages - 2 * s - 1;

    spreads.push({
      id: `booklet_sheet_${s + 1}_front`,
      pageNumber: spreads.length + 1,
      sheetNumber: s + 1,
      isBackSide: false,
      layout: 'A5_BOOKLET',
      leftA5Number: frontLeftNum,
      rightA5Number: frontRightNum,
      slotExampleIds: [
        padded[frontLeftNum - 1]?.id || null,
        padded[frontRightNum - 1]?.id || null
      ]
    });

    spreads.push({
      id: `booklet_sheet_${s + 1}_back`,
      pageNumber: spreads.length + 1,
      sheetNumber: s + 1,
      isBackSide: true,
      layout: 'A5_BOOKLET',
      leftA5Number: backLeftNum,
      rightA5Number: backRightNum,
      slotExampleIds: [
        padded[backLeftNum - 1]?.id || null,
        padded[backRightNum - 1]?.id || null
      ]
    });
  }

  return spreads;
}

function buildProjectorSlides(examplesList, cardsPerSlide = 1) {
  const step = cardsPerSlide === 2 ? 2 : 1;
  if (!examplesList.length) return [];

  const slides = [];
  for (let i = 0; i < examplesList.length; i += step) {
    slides.push({
      id: `proj_slide_${slides.length + 1}`,
      exampleIds: examplesList.slice(i, i + step).map((ex) => ex.id)
    });
  }
  return slides;
}

function buildPagesFromExamples(examplesList, layoutPreset = '1-up') {
  if (layoutPreset === 'A5_BOOKLET') {
    return imposeA5BookletSpreads(examplesList);
  }

  const presetSpec = LAYOUT_PRESETS[layoutPreset] || LAYOUT_PRESETS['1-up'];
  const perPage = presetSpec.perPage;

  if (!examplesList.length) {
    return [
      {
        id: 'page_1',
        pageNumber: 1,
        layout: layoutPreset,
        slotExampleIds: Array(perPage).fill(null)
      }
    ];
  }

  const pages = [];
  for (let i = 0; i < examplesList.length; i += perPage) {
    const slice = examplesList.slice(i, i + perPage).map((ex) => ex.id);
    while (slice.length < perPage) {
      slice.push(null);
    }
    pages.push({
      id: `page_${pages.length + 1}`,
      pageNumber: pages.length + 1,
      layout: layoutPreset,
      slotExampleIds: slice
    });
  }
  return pages;
}

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

  // Student vs Teacher Key toggle ('student' | 'teacher')
  const [printVariant, setPrintVariant] = useState(
    initialConfig?.printVariant || 'student'
  );

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

  const initialExamples = useMemo(
    () => parseExamplesFromPacket(initialPacket),
    [initialPacket]
  );

  const [examples, setExamples] = useState(initialExamples);
  const [activeMenuExampleId, setActiveMenuExampleId] = useState(null);
  const [regeneratingId, setRegeneratingId] = useState(null);
  const [draggedExampleId, setDraggedExampleId] = useState(null);
  const [canDragCard, setCanDragCard] = useState(false);

  const [pages, setPages] = useState(() => {
    if (Array.isArray(initialPacket?.pages) && initialPacket.pages.length > 0) {
      return initialPacket.pages;
    }
    return buildPagesFromExamples(initialExamples, initialConfig?.layoutPreset || '1-up');
  });

  const [activePageIndex, setActivePageIndex] = useState(0);
  const [isSummonerOpen, setIsSummonerOpen] = useState(false);

  // Sync incoming saved sheet props if opened without remounting
  useEffect(() => {
    setSheetId(initialSheetId ?? null);
  }, [initialSheetId]);

  useEffect(() => {
    if (initialTitle) setTitle(initialTitle);
  }, [initialTitle]);

  useEffect(() => {
    if (!initialPacket) return;
    const parsed = parseExamplesFromPacket(initialPacket);
    setExamples(parsed);
    if (Array.isArray(initialPacket.pages) && initialPacket.pages.length > 0) {
      setPages(initialPacket.pages);
    }
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

  // Spotlight tutorial state (uses shared SpotlightTour component)
  const [showTutorial, setShowTutorial] = useState(false);

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
        title: {
          sv: '1. Hämta genomgångsexempel',
          en: '1. Summon Worked Examples'
        },
        description: {
          sv: 'Klicka här för att välja matematiska moment och lägga till färdiga genomgångskort med steg-för-steg-lösningar.',
          en: 'Click here to pick math topics and add worked example cards complete with step-by-step solutions.'
        }
      },
      {
        selector: '[data-tour="layout-controls"]',
        title: {
          sv: '2. Välj bladlayout & pappersformat',
          en: '2. Choose Sheet Layout & Paper'
        },
        description: {
          sv: 'Växla mellan affisch (1 per blad), 2 per blad (ovanpå varandra eller sida vid sida), 4-rutnät, anteckningsflöde eller dubbelsidigt A5-häfte.',
          en: 'Switch between poster (1 per sheet), 2 per sheet (top/bottom or side-by-side), 4-grid, notes flow, or saddle-stitch A5 booklet spreads.'
        }
      },
      {
        selector: '[data-tour="sheet-stage"]',
        title: {
          sv: '3. Klicka på kortdelar för att skapa luckor',
          en: '3. Click Card Parts to Create Blanks'
        },
        description: {
          sv: 'Klicka på valfri text, formel eller figur direkt på arket för att göra den till en skrivlucka för eleverna, ändra textstorlek eller dra i skrivluckans höjd.',
          en: 'Click any text, equation, or figure directly on the sheet to turn it into a student fill-in blank, adjust typography, or drag blank heights.'
        }
      },
      {
        selector: '[data-tour="projector-print-actions"]',
        title: {
          sv: '4. Elev/Facit, projektor & utskrift',
          en: '4. Student/Teacher Key, Projector & Print'
        },
        description: {
          sv: 'Växla mellan Elevversion och Facit (där elevluckorna markeras med *), starta projektorläget på tavlan eller skriv ut direkt.',
          en: 'Switch between Student and Teacher Key (highlighting student blanks with *), launch Projector Mode on the board, or print directly.'
        }
      }
    ],
    []
  );

  // Projector state (sequential reading order + 1 or 2 cards per slide)
  const [isProjectorOpen, setIsProjectorOpen] = useState(false);
  const [projectorSlideIndex, setProjectorSlideIndex] = useState(0);
  const [projectorCardsPerSlide, setProjectorCardsPerSlide] = useState(
    initialConfig?.projectorCardsPerSlide || 1
  );
  const [projectorPacingMode, setProjectorPacingMode] = useState(
    initialConfig?.projectorPacingMode || 'guided_blanks'
  );
  const [revealStepCount, setRevealStepCount] = useState(0);

  const isNarrowColumnLayout =
    layoutPreset === 'A5_BOOKLET' ||
    (layoutPreset === '2-up' && twoUpDirection === 'horizontal');

  const handleSelectLayoutPreset = (nextPreset) => {
    setLayoutPreset(nextPreset);
    if (nextPreset === 'A5_BOOKLET') {
      if (paperFormat === 'A4_PORTRAIT') setPaperFormat('A4_LANDSCAPE');
      else if (paperFormat === 'A3_PORTRAIT') setPaperFormat('A3_LANDSCAPE');
    } else if (nextPreset === '2-up' && twoUpDirection === 'horizontal') {
      if (paperFormat === 'A4_PORTRAIT') setPaperFormat('A4_LANDSCAPE');
      else if (paperFormat === 'A3_PORTRAIT') setPaperFormat('A3_LANDSCAPE');
    }
  };

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

  useEffect(() => {
    setPages((prevPages) => {
      const nextPages = buildPagesFromExamples(examples, layoutPreset);
      if (activePageIndex >= nextPages.length) {
        setActivePageIndex(Math.max(0, nextPages.length - 1));
      }
      return nextPages.length ? nextPages : prevPages;
    });
  }, [examples, layoutPreset]);

  const packetPayload = useMemo(
    () => ({
      schemaVersion: 1,
      examples,
      pages
    }),
    [examples, pages]
  );

  const configPayload = useMemo(
    () => ({
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
    }),
    [
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
    ]
  );

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
      packet: packetPayload,
      config: configPayload,
      auto_topics: [...new Set(examples.map((ex) => ex.topicId).filter(Boolean))]
    })
  });

  const activeTheme = PRESENTATION_THEMES?.[themeId] || PRESENTATION_THEMES?.[defaultThemeId] || {};
  const activePaper = PAPER_SPECS[paperFormat] || PAPER_SPECS.A4_PORTRAIT;

  const examplesById = useMemo(() => {
    const map = {};
    examples.forEach((ex) => {
      map[ex.id] = ex;
    });
    return map;
  }, [examples]);

  const handleSummonItems = (summonedItems) => {
    if (!Array.isArray(summonedItems) || summonedItems.length === 0) return;
    const normalized = summonedItems.map((item, idx) =>
      normalizeSummonedToExample(item, examples.length + idx)
    );
    setExamples((prev) => [...prev, ...normalized]);
    setIsSummonerOpen(false);
  };

  const handleRemoveExample = (exampleId) => {
    setExamples((prev) => {
      const next = prev.filter((ex) => ex.id !== exampleId);
      if (activeMenuExampleId === exampleId) {
        setActiveMenuExampleId(null);
      }
      return next;
    });
  };

  const updateExampleOverride = (exampleId, section, key, value) => {
    setExamples((prev) =>
      prev.map((ex) => {
        if (ex.id !== exampleId) return ex;
        return {
          ...ex,
          overrides: {
            ...(ex.overrides || {}),
            [section]: {
              ...(ex.overrides?.[section] || {}),
              [key]: value
            }
          }
        };
      })
    );
  };

  const resetExampleOverrides = (exampleId) => {
    setExamples((prev) =>
      prev.map((ex) => (ex.id === exampleId ? { ...ex, overrides: null } : ex))
    );
    setBlankHeightsByExample((prev) => {
      const next = { ...prev };
      delete next[exampleId];
      return next;
    });
  };

  const handleCardPartUpdate = useCallback((exampleId, action, payload) => {
    if (action === 'toggleClueBlank' && payload) {
      const { idx, field } = payload;
      setExamples((prev) =>
        prev.map((ex) => {
          if (ex.id !== exampleId) return ex;
          const nextClues = (ex.clues || []).map((c, cIdx) =>
            cIdx === idx ? { ...c, [field]: !c[field] } : c
          );
          return { ...ex, clues: nextClues };
        })
      );
      return;
    }

    if (action === 'stacked') {
      setExamples((prev) =>
        prev.map((ex) => {
          if (ex.id !== exampleId) return ex;
          return {
            ...ex,
            overrides: {
              ...(ex.overrides || {}),
              layout: {
                ...(ex.overrides?.layout || {}),
                stacked: Boolean(payload)
              }
            }
          };
        })
      );
      return;
    }

    if (action === 'visualOffset' && payload) {
      setExamples((prev) =>
        prev.map((ex) => {
          if (ex.id !== exampleId) return ex;
          return {
            ...ex,
            overrides: {
              ...(ex.overrides || {}),
              layout: {
                ...(ex.overrides?.layout || {}),
                visualOffsetX: payload.x ?? 0,
                visualOffsetY: payload.y ?? 0
              }
            }
          };
        })
      );
      return;
    }

    if (action === 'visualZoom') {
      setExamples((prev) =>
        prev.map((ex) => {
          if (ex.id !== exampleId) return ex;
          return {
            ...ex,
            overrides: {
              ...(ex.overrides || {}),
              layout: {
                ...(ex.overrides?.layout || {}),
                visualZoom: payload
              }
            }
          };
        })
      );
      return;
    }

    if (
      [
        'showPromptText',
        'showPromptLatex',
        'showPromptOptions',
        'showVisual',
        'showStepText',
        'showStepLatex'
      ].includes(action)
    ) {
      setExamples((prev) =>
        prev.map((ex) => {
          if (ex.id !== exampleId) return ex;
          return {
            ...ex,
            overrides: {
              ...(ex.overrides || {}),
              visibility: {
                ...(ex.overrides?.visibility || {}),
                [action]: payload
              }
            }
          };
        })
      );
      return;
    }

    if (
      [
        'promptTextSize',
        'promptLatexSize',
        'stepTextSize',
        'stepLatexSize'
      ].includes(action)
    ) {
      setExamples((prev) =>
        prev.map((ex) => {
          if (ex.id !== exampleId) return ex;
          return {
            ...ex,
            overrides: {
              ...(ex.overrides || {}),
              typography: {
                ...(ex.overrides?.typography || {}),
                [action]: payload
              }
            }
          };
        })
      );
    }
  }, []);

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

  const handleRegenerateExample = async (example, mode = 'numbers') => {
    if (!example || regeneratingId) return;

    if (mode === 'story') {
      const stories = example.rawItem?.resolvedData?.renderData?.availableStories;
      if (Array.isArray(stories) && stories.length > 1) {
        const currentIdx = example.rawItem?.selectedStoryIndex ?? 0;
        let nextIdx = Math.floor(Math.random() * stories.length);
        if (nextIdx === currentIdx) nextIdx = (nextIdx + 1) % stories.length;
        const nextRaw = { ...example.rawItem, selectedStoryIndex: nextIdx };
        const nextNorm = normalizeSummonedToExample(nextRaw, 0);
        setExamples((prev) =>
          prev.map((ex) =>
            ex.id === example.id
              ? {
                  ...nextNorm,
                  id: example.id,
                  title: example.title || nextNorm.title,
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

      const mergedRaw = {
        ...(example.rawItem || {}),
        id: example.id,
        topicId: example.topicId,
        variationKey: example.variationKey,
        clues: freshData.clues || freshData.resolvedData?.clues || [],
        renderData: freshData.renderData || freshData,
        resolvedData: freshData
      };
      const refreshed = normalizeSummonedToExample(mergedRaw, 0);

      // Preserve any blank toggles the teacher set on the previous clues
      const preservedClues = refreshed.clues.map((newClue, cIdx) => {
        const oldClue = example.clues?.[cIdx];
        if (!oldClue) return newClue;
        return {
          ...newClue,
          blankText: Boolean(oldClue.blankText),
          blankLatex: Boolean(oldClue.blankLatex),
          blankVisual: Boolean(oldClue.blankVisual)
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

  const handleBlankHeightChange = useCallback((exampleId, stepIdx, kind, nextHeight) => {
    setBlankHeightsByExample((prev) => ({
      ...prev,
      [exampleId]: {
        ...(prev[exampleId] || {}),
        [`${stepIdx}:${kind}`]: nextHeight
      }
    }));
  }, []);

  const projectorSlides = useMemo(
    () => buildProjectorSlides(examples, projectorCardsPerSlide),
    [examples, projectorCardsPerSlide]
  );

  useEffect(() => {
    if (projectorSlideIndex >= projectorSlides.length) {
      setProjectorSlideIndex(Math.max(0, projectorSlides.length - 1));
    }
  }, [projectorSlides.length, projectorSlideIndex]);

  const currentProjectorSlide = projectorSlides[projectorSlideIndex] || projectorSlides[0];
  const currentProjectorExamples = useMemo(() => {
    if (!currentProjectorSlide) return [];
    return (currentProjectorSlide.exampleIds || [])
      .map((id) => (id ? examplesById[id] : null))
      .filter(Boolean);
  }, [currentProjectorSlide, examplesById]);

  const maxProjectorSteps = useMemo(() => {
    if (projectorPacingMode === 'all_shown') return 0;
    if (projectorPacingMode === 'step_by_step') {
      return currentProjectorExamples.reduce((sum, ex) => sum + (ex.clues?.length || 0), 0);
    }
    return currentProjectorExamples.reduce((sum, ex) => {
      return (
        sum +
        (ex.clues || []).reduce((cSum, clue) => {
          const blanksInClue =
            (clue.blankText ? 1 : 0) +
            (clue.blankLatex ? 1 : 0) +
            (clue.blankVisual ? 1 : 0);
          return cSum + blanksInClue;
        }, 0)
      );
    }, 0);
  }, [projectorPacingMode, currentProjectorExamples]);

  const openProjectorAt = (pageIdx = activePageIndex) => {
    const targetPage = pages[pageIdx];
    const firstExId = (targetPage?.slotExampleIds || []).find(Boolean);
    const seqIdx = firstExId ? examples.findIndex((ex) => ex.id === firstExId) : 0;
    const mappedSlide =
      seqIdx > 0 ? Math.floor(seqIdx / (projectorCardsPerSlide === 2 ? 2 : 1)) : 0;

    setProjectorSlideIndex(Math.min(mappedSlide, Math.max(0, projectorSlides.length - 1)));
    setRevealStepCount(0);
    setIsProjectorOpen(true);
  };

  const handleProjectorNext = useCallback(() => {
    if (projectorPacingMode !== 'all_shown' && revealStepCount < maxProjectorSteps) {
      setRevealStepCount((prev) => prev + 1);
      return;
    }
    if (projectorSlideIndex < projectorSlides.length - 1) {
      setProjectorSlideIndex((prev) => prev + 1);
      setRevealStepCount(0);
    }
  }, [
    projectorPacingMode,
    revealStepCount,
    maxProjectorSteps,
    projectorSlideIndex,
    projectorSlides.length
  ]);

  const handleProjectorPrev = useCallback(() => {
    if (projectorPacingMode !== 'all_shown' && revealStepCount > 0) {
      setRevealStepCount((prev) => prev - 1);
      return;
    }
    if (projectorSlideIndex > 0) {
      setProjectorSlideIndex((prev) => prev - 1);
      setRevealStepCount(0);
    }
  }, [projectorPacingMode, revealStepCount, projectorSlideIndex]);

  useEffect(() => {
    if (!isProjectorOpen) return;

    const onKeyDown = (e) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      const tag = e.target?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || e.target?.isContentEditable) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        handleProjectorNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handleProjectorPrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsProjectorOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isProjectorOpen, handleProjectorNext, handleProjectorPrev]);

  const isTeacherKey = printVariant === 'teacher';

  const buildWorkedCardItem = (example, { isProjector = false } = {}) => {
    const baseRaw = example.rawItem || {};
    const baseResolved = baseRaw.resolvedData || {};
    const baseRenderData = baseResolved.renderData || baseResolved || {};

    let runningRevealBudget = revealStepCount;

    const mappedClues = [];
    for (const clue of example.clues || []) {
      const originalText = clue[lang] || clue.text || clue.sv || clue.en || '';
      const originalLatex = clue.latex || null;

      if (!isProjector && isTeacherKey) {
        const wasTextBlanked = Boolean(clue.blankText) && Boolean(originalText);
        const wasLatexBlanked = Boolean(clue.blankLatex) && Boolean(originalLatex);

        mappedClues.push({
          text: originalText,
          sv: originalText,
          en: originalText,
          latex: originalLatex,
          _blankText: false,
          _blankLatex: false,
          _wasTextBlank: wasTextBlanked,
          _wasLatexBlank: wasLatexBlanked
        });
      } else if (!isProjector || projectorPacingMode === 'all_shown') {
        const isTextBlanked = Boolean(clue.blankText) && Boolean(originalText);
        const isLatexBlanked = Boolean(clue.blankLatex) && Boolean(originalLatex);

        mappedClues.push({
          text: originalText,
          sv: originalText,
          en: originalText,
          latex: originalLatex,
          _blankText: isTextBlanked,
          _blankLatex: isLatexBlanked
        });
      } else if (projectorPacingMode === 'step_by_step') {
        if (runningRevealBudget > 0) {
          runningRevealBudget -= 1;
          mappedClues.push({
            text: originalText,
            sv: originalText,
            en: originalText,
            latex: originalLatex,
            _blankText: false,
            _blankLatex: false
          });
        }
      } else {
        let hideText = Boolean(clue.blankText) && Boolean(originalText);
        let hideLatex = Boolean(clue.blankLatex) && Boolean(originalLatex);

        if (hideText && runningRevealBudget > 0) {
          hideText = false;
          runningRevealBudget -= 1;
        }
        if (hideLatex && runningRevealBudget > 0) {
          hideLatex = false;
          runningRevealBudget -= 1;
        }

        mappedClues.push({
          text: originalText,
          sv: originalText,
          en: originalText,
          latex: originalLatex,
          _blankText: hideText,
          _blankLatex: hideLatex
        });
      }
    }

    return {
      ...baseRaw,
      id: example.id,
      name: example.title || example.name || baseRaw.name,
      topicId: example.topicId || baseRaw.topicId,
      variationKey: example.variationKey || baseRaw.variationKey,
      selectedStoryIndex: baseRaw.selectedStoryIndex ?? null,
      isWorkedExample: true,
      clues: mappedClues,
      resolvedData: {
        ...baseResolved,
        clues: mappedClues,
        renderData: {
          ...baseRenderData,
          ...(baseRaw.renderData || {}),
          description: example.promptText ?? baseRenderData.description ?? '',
          latex: example.promptLatex ?? baseRenderData.latex ?? ''
        }
      }
    };
  };

  const getDisplayOptionsForExample = (example, { isProjector = false, compact = false } = {}) => {
    const exTypo = example.overrides?.typography || {};
    const exVis = example.overrides?.visibility || {};
    const exLayout = example.overrides?.layout || {};
    const isStacked = isProjector
      ? (compact ? true : Boolean(exLayout.stacked))
      : (exLayout.stacked ?? isNarrowColumnLayout);

    const projectorBoost = isProjector && !compact;
    const projectorTwoUpBoost = isProjector && compact;

    return {
      compact: compact || isStacked,
      stacked: isStacked,
      writingSpace,
      blankStyle,
      leftWidthPct: exLayout.leftWidthPct ?? DEFAULT_CARD_LAYOUT.leftWidthPct,
      solutionWidthPx: projectorBoost
        ? Math.max(300, exLayout.solutionWidthPx ?? DEFAULT_CARD_LAYOUT.solutionWidthPx)
        : projectorTwoUpBoost
          ? Math.max(210, exLayout.solutionWidthPx ?? DEFAULT_CARD_LAYOUT.solutionWidthPx)
          : (exLayout.solutionWidthPx ?? DEFAULT_CARD_LAYOUT.solutionWidthPx),
      visualZoom: projectorBoost
        ? Math.max(1.25, exLayout.visualZoom ?? DEFAULT_CARD_LAYOUT.visualZoom)
        : (exLayout.visualZoom ?? DEFAULT_CARD_LAYOUT.visualZoom),
      visualOffsetX: exLayout.visualOffsetX ?? DEFAULT_CARD_LAYOUT.visualOffsetX,
      visualOffsetY: exLayout.visualOffsetY ?? DEFAULT_CARD_LAYOUT.visualOffsetY,
      showPromptText: exVis.showPromptText ?? DEFAULT_VISIBILITY.showPromptText,
      showPromptLatex: exVis.showPromptLatex ?? DEFAULT_VISIBILITY.showPromptLatex,
      showPromptOptions: exVis.showPromptOptions ?? DEFAULT_VISIBILITY.showPromptOptions,
      showVisual: exVis.showVisual ?? DEFAULT_VISIBILITY.showVisual,
      showStepText: exVis.showStepText ?? DEFAULT_VISIBILITY.showStepText,
      showStepLatex: exVis.showStepLatex ?? DEFAULT_VISIBILITY.showStepLatex,
      promptTextSize: projectorBoost
        ? '2xl'
        : projectorTwoUpBoost
          ? 'lg'
          : (exTypo.promptTextSize ?? DEFAULT_TYPOGRAPHY.promptTextSize),
      promptLatexSize: projectorBoost
        ? '2xl'
        : projectorTwoUpBoost
          ? 'lg'
          : (exTypo.promptLatexSize ?? DEFAULT_TYPOGRAPHY.promptLatexSize),
      stepTextSize: projectorBoost
        ? '2xl'
        : projectorTwoUpBoost
          ? 'lg'
          : (exTypo.stepTextSize ?? DEFAULT_TYPOGRAPHY.stepTextSize),
      stepLatexSize: projectorBoost
        ? '2xl'
        : projectorTwoUpBoost
          ? 'lg'
          : (exTypo.stepLatexSize ?? DEFAULT_TYPOGRAPHY.stepLatexSize),
      blankHeights: blankHeightsByExample[example.id] || {},
      onBlankHeightChange: !isProjector
        ? (stepIdx, kind, nextH) => handleBlankHeightChange(example.id, stepIdx, kind, nextH)
        : null
    };
  };

  const renderExampleSlot = (example, { isProjector = false, compact = false } = {}) => {
    if (!example) {
      return (
        <div className="min-h-[140px] h-full rounded-2xl border-2 border-dashed border-[var(--border-strong)] bg-[var(--bg-surface)] flex flex-col items-center justify-center p-5 text-center text-[var(--text-muted)]">
          <LayoutGrid size={20} className="mb-1.5 opacity-70" />
          <p className="text-xs font-bold">
            {lang === 'sv'
              ? 'Tom plats — hämta uppgifter för att fylla'
              : 'Open slot — summon questions to fill'}
          </p>
        </div>
      );
    }

    const cardItem = buildWorkedCardItem(example, { isProjector });
    const displayOptions = getDisplayOptionsForExample(example, { isProjector, compact });
    const isMenuOpen = !isProjector && activeMenuExampleId === example.id;
    const isRegen = regeneratingId === example.id;
    const hasStories =
      Array.isArray(example.rawItem?.resolvedData?.renderData?.availableStories) &&
      example.rawItem.resolvedData.renderData.availableStories.length > 1;

    const exLayout = example.overrides?.layout || {};
    const curLeftPct = exLayout.leftWidthPct ?? DEFAULT_CARD_LAYOUT.leftWidthPct;
    const curSolPx = exLayout.solutionWidthPx ?? DEFAULT_CARD_LAYOUT.solutionWidthPx;
    const isCurrentlyStacked = exLayout.stacked ?? isNarrowColumnLayout;

    return (
      <div
        draggable={!isProjector && canDragCard}
        onDragStart={(e) => {
          if (isProjector || !canDragCard) {
            e.preventDefault();
            return;
          }
          setDraggedExampleId(example.id);
          e.dataTransfer.effectAllowed = 'move';
        }}
        onDragOver={(e) => {
          if (!isProjector) e.preventDefault();
        }}
        onDrop={(e) => {
          if (isProjector) return;
          e.preventDefault();
          handleDropExample(example.id);
        }}
        onDragEnd={() => {
          setDraggedExampleId(null);
          setCanDragCard(false);
        }}
        className={`relative group rounded-2xl transition-all ${activeTheme.cardClass || ''} ${
          draggedExampleId === example.id ? 'opacity-40' : ''
        }`}
      >
        {!isProjector && (
          <div className="flex items-center justify-between gap-2 mb-1 px-1 print:hidden">
            <div className="flex items-center gap-1 min-w-0">
              <span
                onPointerDown={() => setCanDragCard(true)}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-grab active:cursor-grabbing"
                title={lang === 'sv' ? 'Dra för att flytta' : 'Drag to reorder'}
              >
                <GripVertical size={13} />
              </span>
              <span className="text-xs font-bold text-[var(--text-muted)] truncate">
                {example.title}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {example.topicId && example.variationKey && (
                <button
                  type="button"
                  disabled={isRegen}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRegenerateExample(example, 'numbers');
                  }}
                  className="px-2 py-0.5 text-xs font-bold text-[var(--text-muted)] hover:text-emerald-700 hover:bg-[var(--bg-surface)] rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  <RefreshCcw size={11} className={isRegen ? 'animate-spin' : ''} />
                  <span>{lang === 'sv' ? 'Nytt exempel' : 'New example'}</span>
                </button>
              )}

              {hasStories && (
                <button
                  type="button"
                  disabled={isRegen}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRegenerateExample(example, 'story');
                  }}
                  className="px-2 py-0.5 text-xs font-bold text-[var(--text-muted)] hover:text-amber-700 hover:bg-[var(--bg-surface)] rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  <Shuffle size={11} />
                  <span>{lang === 'sv' ? 'Byt text' : 'Swap story'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardPartUpdate(example.id, 'stacked', !isCurrentlyStacked);
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
                    ? (lang === 'sv' ? 'Staplad' : 'Stacked')
                    : (lang === 'sv' ? 'Sidokolumn' : 'Side-by-side')}
                </span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenuExampleId((prev) => (prev === example.id ? null : example.id));
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

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveExample(example.id);
                }}
                className="px-2 py-0.5 text-xs font-bold text-[var(--text-muted)] hover:text-rose-600 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 size={11} />
                <span>{lang === 'sv' ? 'Ta bort' : 'Remove'}</span>
              </button>
            </div>
          </div>
        )}

        {!isProjector && isMenuOpen && (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="mb-2 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-strong)] shadow-lg text-[var(--text-main)] space-y-2.5 print:hidden z-30 relative"
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <Columns size={13} className="text-emerald-600" />
                {lang === 'sv' ? 'Kolumnbredd' : 'Column Widths'}
              </span>
              <div className="flex items-center gap-2">
                {example.overrides && (
                  <button
                    type="button"
                    onClick={() => resetExampleOverrides(example.id)}
                    className="text-xs font-bold text-amber-700 hover:underline cursor-pointer"
                  >
                    {lang === 'sv' ? 'Återställ' : 'Reset'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveMenuExampleId(null)}
                  className="p-0.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                >
                  <X size={13} />
                </button>
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
                    updateExampleOverride(example.id, 'layout', 'leftWidthPct', Number(e.target.value))
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
                  min={136}
                  max={240}
                  step={4}
                  value={curSolPx}
                  onChange={(e) =>
                    updateExampleOverride(
                      example.id,
                      'layout',
                      'solutionWidthPx',
                      Number(e.target.value)
                    )
                  }
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        <WorkedExampleCard
          item={cardItem}
          lang={lang}
          isPrintMode={isProjector}
          displayOptions={displayOptions}
          onUpdatePart={
            !isProjector
              ? (action, payload) => handleCardPartUpdate(example.id, action, payload)
              : null
          }
        />
      </div>
    );
  };

  const renderPageContent = (pg) => {
    const slots = pg.slotExampleIds || [];

    if (layoutPreset === '4-up') {
      return (
        <div className="grid grid-cols-2 gap-3">
          {slots.map((exId, slotIdx) => (
            <div key={`${pg.id}_slot_${slotIdx}`} className="min-w-0">
              {renderExampleSlot(exId ? examplesById[exId] : null, { compact: true })}
            </div>
          ))}
        </div>
      );
    }

    if (layoutPreset === 'A5_BOOKLET') {
      const leftId = slots[0] || null;
      const rightId = slots[1] || null;

      return (
        <div className="flex flex-col flex-1">
          <div className="print:hidden mb-2 px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-main)] border-l-4 border-l-amber-600 text-xs font-semibold text-[var(--text-main)] flex items-center justify-between">
            <span>
              {lang === 'sv'
                ? `Ark ${pg.sheetNumber || 1} (${pg.isBackSide ? 'Baksida' : 'Framsida'}) — Häftesordning`
                : `Sheet ${pg.sheetNumber || 1} (${pg.isBackSide ? 'Back' : 'Front'}) — Saddle-stitch order`}
            </span>
            <span className="font-mono text-xs text-[var(--text-muted)]">
              {lang === 'sv' ? 'Dubbelsidigt: vänd kortsida' : 'Duplex: flip on short edge'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6 items-stretch flex-1 relative">
            <div className="pr-3 border-r-2 border-dashed border-[var(--border-strong)] flex flex-col justify-between">
              <div className="flex-1">
                {renderExampleSlot(leftId ? examplesById[leftId] : null, { compact: true })}
              </div>
              <div className="text-xs font-mono font-bold text-[var(--text-muted)] mt-2 text-left">
                {lang === 'sv' ? `Sida ${pg.leftA5Number ?? 2}` : `Page ${pg.leftA5Number ?? 2}`}
              </div>
            </div>

            <div className="pl-1 flex flex-col justify-between">
              <div className="flex-1">
                {renderExampleSlot(rightId ? examplesById[rightId] : null, { compact: true })}
              </div>
              <div className="text-xs font-mono font-bold text-[var(--text-muted)] mt-2 text-right">
                {lang === 'sv' ? `Sida ${pg.rightA5Number ?? 1}` : `Page ${pg.rightA5Number ?? 1}`}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (layoutPreset === 'notes_flow') {
      return (
        <div className="flex flex-col gap-5">
          {slots.map((exId, slotIdx) => {
            const ex = exId ? examplesById[exId] : null;
            return (
              <div
                key={`${pg.id}_slot_${slotIdx}`}
                className={slotIdx > 0 ? 'pt-4 border-t border-dashed border-[var(--border-main)]' : ''}
              >
                <div className="text-xs font-mono font-bold tracking-wider text-[var(--text-muted)] mb-1">
                  {lang === 'sv' ? `Avsnitt ${slotIdx + 1}` : `Section ${slotIdx + 1}`}
                </div>
                {renderExampleSlot(ex, { compact: true })}
              </div>
            );
          })}
        </div>
      );
    }

    if (layoutPreset === '2-up' && twoUpDirection === 'horizontal') {
      return (
        <div className="grid grid-cols-2 gap-5 items-stretch flex-1">
          {slots.map((exId, slotIdx) => (
            <div key={`${pg.id}_slot_${slotIdx}`} className="min-w-0 flex flex-col">
              {renderExampleSlot(exId ? examplesById[exId] : null, { compact: true })}
            </div>
          ))}
        </div>
      );
    }

    // Default '1-up' or vertical '2-up'
    return (
      <div className="flex flex-col gap-4">
        {slots.map((exId, slotIdx) => (
          <div key={`${pg.id}_slot_${slotIdx}`}>
            {renderExampleSlot(exId ? examplesById[exId] : null, { compact: false })}
          </div>
        ))}
      </div>
    );
  };

  const renderBrandAttribution = () => {
    if (layoutPreset === 'A5_BOOKLET') {
      return (
        <div
          aria-hidden="true"
          className="pointer-events-none select-none pt-2 mt-2 border-t border-stone-200/80 grid grid-cols-2 gap-6 text-[10px] font-mono text-stone-400"
        >
          <div className="pr-3 flex items-center justify-between">
            <span>{lang === 'sv' ? 'Skapad med Anpassa.app' : 'Created with Anpassa.app'}</span>
            <span className="font-bold text-stone-500">anpassa.app</span>
          </div>
          <div className="pl-1 flex items-center justify-between">
            <span>{lang === 'sv' ? 'Skapad med Anpassa.app' : 'Created with Anpassa.app'}</span>
            <span className="font-bold text-stone-500">anpassa.app</span>
          </div>
        </div>
      );
    }

    return (
      <div
        aria-hidden="true"
        className="pointer-events-none select-none pt-2 mt-2 border-t border-stone-200/80 flex items-center justify-between text-[10px] font-mono text-stone-400"
      >
        <span>{lang === 'sv' ? 'Skapad med Anpassa.app' : 'Created with Anpassa.app'}</span>
        <span className="font-bold text-stone-500">anpassa.app</span>
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
            {/* Student / Teacher Key Version Switch */}
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
        {/* Left Sidebar: Sheet, Layout & Blank Format Settings */}
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

        {/* Center Sheet Preview Stage */}
        <main
          data-tour="sheet-stage"
          className="flex-1 overflow-auto p-6 print:p-0 print:overflow-visible flex flex-col items-center gap-6 print:gap-0 drafting-desk-bg"
        >
          {pages.map((pg, idx) => (
            <div
              key={pg.id}
              onClick={() => setActivePageIndex(idx)}
              style={{
                width: `${activePaper.widthMm}mm`,
                minHeight: `${activePaper.heightMm}mm`
              }}
              className={`relative overflow-hidden whiteboard-protect bg-white text-stone-900 shadow-xl print:shadow-none border print:border-0 p-[10mm] flex flex-col justify-between gap-4 break-after-page last:break-after-auto ${
                activePageIndex === idx
                  ? 'ring-2 ring-sky-600/50 print:ring-0 border-stone-300'
                  : 'border-stone-200'
              }`}
            >
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between border-b-2 border-stone-900 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold tracking-tight">{title}</h2>
                    {isTeacherKey && (
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-600 text-emerald-800 font-mono text-xs font-bold">
                        {lang === 'sv' ? 'FACIT · * = elevlucka' : 'TEACHER KEY · * = student blank'}
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

              {renderBrandAttribution()}
            </div>
          ))}
        </main>
      </div>

      {/* Shared Spotlight Walkthrough Tutorial */}
      <SpotlightTour
        steps={studioTourSteps}
        isOpen={showTutorial && !isProjectorOpen && !isSummonerOpen}
        onClose={handleCloseTutorial}
        lang={lang}
      />

      {/* Save Overwrite vs. Save as Copy Modal (identical to QuestionStudio) */}
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

      {/* Lightweight Projector Mode Overlay: Full-Screen Classroom Stage + 1/2 Card Toggle */}
      {isProjectorOpen && (
        <div className="fixed inset-0 z-50 bg-[var(--bg-canvas)] text-[var(--text-main)] flex flex-col">
          {/* Top Control Bar */}
          <div className="px-5 py-2.5 bg-[var(--bg-card)] text-[var(--text-main)] border-b border-[var(--border-main)] flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleProjectorPrev}
                disabled={projectorSlideIndex === 0 && revealStepCount === 0}
                className="p-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-main)] disabled:opacity-30 cursor-pointer"
                title={lang === 'sv' ? 'Föregående (Vänsterpil)' : 'Previous (Left Arrow)'}
              >
                <ChevronLeft size={18} />
              </button>

              <span className="text-xs font-mono font-bold px-2">
                {lang === 'sv' ? 'Bild' : 'Slide'}{' '}
                {projectorSlides.length > 0 ? projectorSlideIndex + 1 : 0} / {projectorSlides.length}
                {projectorPacingMode !== 'all_shown' && maxProjectorSteps > 0
                  ? ` · ${revealStepCount}/${maxProjectorSteps}`
                  : ''}
              </span>

              <button
                type="button"
                onClick={handleProjectorNext}
                disabled={
                  projectorSlideIndex >= projectorSlides.length - 1 &&
                  (projectorPacingMode === 'all_shown' || revealStepCount >= maxProjectorSteps)
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
                    setProjectorCardsPerSlide(opt.count);
                    setProjectorSlideIndex(0);
                    setRevealStepCount(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                    projectorCardsPerSlide === opt.count
                      ? 'bg-sky-600 text-white'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {lang === 'sv' ? opt.sv : opt.en}
                </button>
              ))}
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
                    setProjectorPacingMode(m.id);
                    setRevealStepCount(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                    projectorPacingMode === m.id
                      ? 'bg-emerald-600 text-white'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {lang === 'sv' ? m.sv : m.en}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {projectorPacingMode !== 'all_shown' && (
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
                onClick={() => setIsProjectorOpen(false)}
                className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                title={lang === 'sv' ? 'Stäng projektor (Esc)' : 'Close Projector (Esc)'}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Full-Viewport Slide Stage */}
          <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-start drafting-desk-bg">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`proj-slide-${projectorSlideIndex}-${projectorCardsPerSlide}`}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className={`w-full flex-1 ${
                  projectorCardsPerSlide === 2
                    ? 'grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch'
                    : 'flex flex-col'
                }`}
              >
                {currentProjectorExamples.map((ex) => (
                  <div
                    key={ex.id}
                    className="w-full flex flex-col [&_.worked-example-container]:flex-1"
                  >
                    {renderExampleSlot(ex, {
                      isProjector: true,
                      compact: projectorCardsPerSlide === 2
                    })}
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}