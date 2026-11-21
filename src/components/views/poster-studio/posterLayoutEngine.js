// src/components/views/poster-studio/posterLayoutEngine.js
import { normalizeSummonedToExample } from '../../shared/workedExampleMapper';
import { SHEET_PADDING_PX } from '../../shared/AutoFitSlotBox';

export const PAPER_SPECS = {
  A4_PORTRAIT: {
    labelSv: 'A4 Stående',
    labelEn: 'A4 Portrait',
    widthMm: 210,
    heightMm: 297,
    widthPx: 794,
    heightPx: 1123,
    pageCss: 'A4 portrait'
  },
  A4_LANDSCAPE: {
    labelSv: 'A4 Liggande',
    labelEn: 'A4 Landscape',
    widthMm: 297,
    heightMm: 210,
    widthPx: 1123,
    heightPx: 794,
    pageCss: 'A4 landscape'
  },
  A3_PORTRAIT: {
    labelSv: 'A3 Stående',
    labelEn: 'A3 Portrait',
    widthMm: 297,
    heightMm: 420,
    widthPx: 1123,
    heightPx: 1587,
    pageCss: 'A3 portrait'
  },
  A3_LANDSCAPE: {
    labelSv: 'A3 Liggande',
    labelEn: 'A3 Landscape',
    widthMm: 420,
    heightMm: 297,
    widthPx: 1587,
    heightPx: 1123,
    pageCss: 'A3 landscape'
  }
};

export const POSTER_CANVAS_MULTIPLIER = 1.25;

export function getEffectivePaperSpec(paperFormat, isPosterMode = false) {
  const base = PAPER_SPECS[paperFormat] || PAPER_SPECS.A4_PORTRAIT;
  if (!isPosterMode) return base;
  return {
    ...base,
    widthPx: Math.round(base.widthPx * POSTER_CANVAS_MULTIPLIER),
    heightPx: Math.round(base.heightPx * POSTER_CANVAS_MULTIPLIER)
  };
}

export const LAYOUT_PRESETS = {
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

/**
 * Computes the exact allotted vertical pixel budget for each card slot
 * on a sheet so AutoFitSlotBox scales cards cleanly inside their bounds.
 */
export function computeSlotMaxHeightPx(activePaper, layoutPreset, twoUpDirection = 'vertical') {
  // Printable height minus sheet padding, title bar (~44px), and brand footer (~26px)
  const usableHeight = activePaper.heightPx - SHEET_PADDING_PX * 2 - 74;

  if (layoutPreset === '4-up') {
    return Math.floor((usableHeight - 12) / 2);
  }
  if (layoutPreset === '2-up' && twoUpDirection === 'vertical') {
    return Math.floor((usableHeight - 16) / 2);
  }
  if (layoutPreset === 'notes_flow') {
    return Math.floor((usableHeight - 48) / 3);
  }
  if (layoutPreset === 'A5_BOOKLET') {
    // Accounts for page number footer below each half-page
    return Math.floor(usableHeight - 28);
  }
  // '1-up' or horizontal '2-up'
  return Math.floor(usableHeight);
}

export function parseExamplesFromPacket(packet) {
  if (packet?.examples && typeof packet.examples === 'object') {
    const list = Array.isArray(packet.examples)
      ? packet.examples
      : Object.values(packet.examples);
    return list.map((ex, idx) => {
      const normalized = normalizeSummonedToExample(ex, idx);
      return {
        ...normalized,
        promptText: ex.promptText || normalized.promptText,
        promptLatex: ex.promptLatex || normalized.promptLatex,
        hasCustomEdits: Boolean(ex.hasCustomEdits),
        overrides: ex.overrides || null
      };
    });
  }
  return [];
}

export function imposeA5BookletSpreads(examplesList) {
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

export function buildPagesFromExamples(examplesList, layoutPreset = '1-up') {
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

export function buildProjectorSlides(examplesList, cardsPerSlide = 1) {
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