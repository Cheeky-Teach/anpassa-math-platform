// src/components/shared/workedExampleMapper.js
export const DEFAULT_VISIBILITY = {
  showPromptText: true,
  showPromptLatex: true,
  showPromptOptions: true,
  showVisual: true,
  showStepText: true,
  showStepLatex: true
};

export const DEFAULT_TYPOGRAPHY = {
  promptTextSize: 'sm',
  promptLatexSize: 'sm',
  stepTextSize: 'sm',
  stepLatexSize: 'sm'
};

export const DEFAULT_CARD_LAYOUT = {
  leftWidthPct: 38,
  solutionWidthPx: 176,
  visualZoom: 1,
  visualOffsetX: 0,
  visualOffsetY: 0
};

export function normalizeSummonedToExample(rawItem, index = 0) {
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
            blankVisual: false,
            hidden: false,
            hideText: false,
            hideLatex: false
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
          blankVisual: Boolean(clue.blankVisual),
          hidden: Boolean(clue.hidden),
          hideText: Boolean(clue.hideText),
          hideLatex: Boolean(clue.hideLatex)
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
    promptText:
      rawItem?.promptText ||
      rd?.description ||
      rawItem?.text ||
      '',
    promptLatex:
      rawItem?.promptLatex ||
      rd?.latex ||
      rawItem?.latex ||
      '',
    hasCustomEdits: Boolean(rawItem?.hasCustomEdits),
    clues,
    overrides: null,
    rawItem
  };
}

/**
 * Helper to resolve visible clue index back to original example.clues index
 * (since hidden clues are filtered out when rendering WorkedExampleCard).
 */
function resolveRealClueIndex(clues = [], visibleIdx) {
  let seenVisible = 0;
  for (let i = 0; i < clues.length; i++) {
    if (clues[i]?.hidden) continue;
    if (seenVisible === visibleIdx) return i;
    seenVisible += 1;
  }
  return visibleIdx;
}

export function applyCardPartAction(example, action, payload) {
  if (action === 'toggleClueBlank' && payload) {
    const realIdx = resolveRealClueIndex(example.clues, payload.idx);
    const { field } = payload;
    const nextClues = (example.clues || []).map((c, cIdx) =>
      cIdx === realIdx ? { ...c, [field]: !c[field] } : c
    );
    return { ...example, clues: nextClues };
  }

  if (action === 'toggleHideClue' && payload !== undefined) {
    const visibleIdx = typeof payload === 'object' ? payload.idx : payload;
    const realIdx = resolveRealClueIndex(example.clues, visibleIdx);
    const nextClues = (example.clues || []).map((c, cIdx) =>
      cIdx === realIdx ? { ...c, hidden: !c.hidden } : c
    );
    return { ...example, clues: nextClues };
  }

  if (action === 'toggleHideClueText' && payload !== undefined) {
    const visibleIdx = typeof payload === 'object' ? payload.idx : payload;
    const realIdx = resolveRealClueIndex(example.clues, visibleIdx);
    const nextClues = (example.clues || []).map((c, cIdx) =>
      cIdx === realIdx ? { ...c, hideText: !c.hideText } : c
    );
    return { ...example, clues: nextClues };
  }

  if (action === 'toggleHideClueLatex' && payload !== undefined) {
    const visibleIdx = typeof payload === 'object' ? payload.idx : payload;
    const realIdx = resolveRealClueIndex(example.clues, visibleIdx);
    const nextClues = (example.clues || []).map((c, cIdx) =>
      cIdx === realIdx ? { ...c, hideLatex: !c.hideLatex } : c
    );
    return { ...example, clues: nextClues };
  }

  if (action === 'restoreHiddenClues') {
    const nextClues = (example.clues || []).map((c) => ({
      ...c,
      hidden: false,
      hideText: false,
      hideLatex: false
    }));
    return { ...example, clues: nextClues };
  }

  if (action === 'editClueText' && payload) {
    const realIdx = resolveRealClueIndex(example.clues, payload.idx);
    const nextText = String(payload.text ?? '');
    const nextClues = (example.clues || []).map((c, cIdx) =>
      cIdx === realIdx
        ? { ...c, text: nextText, sv: nextText, en: nextText }
        : c
    );
    return { ...example, hasCustomEdits: true, clues: nextClues };
  }

  if (action === 'editClueLatex' && payload) {
    const realIdx = resolveRealClueIndex(example.clues, payload.idx);
    const nextLatex = String(payload.latex ?? '').trim();
    const nextClues = (example.clues || []).map((c, cIdx) =>
      cIdx === realIdx ? { ...c, latex: nextLatex || null } : c
    );
    return { ...example, hasCustomEdits: true, clues: nextClues };
  }

  if (action === 'editPromptText' && payload !== undefined) {
    const nextPrompt = String(typeof payload === 'object' ? payload.text : payload);
    return {
      ...example,
      hasCustomEdits: true,
      promptText: nextPrompt
    };
  }

  if (action === 'stacked') {
    return {
      ...example,
      overrides: {
        ...(example.overrides || {}),
        layout: {
          ...(example.overrides?.layout || {}),
          stacked: Boolean(payload)
        }
      }
    };
  }

  if (action === 'editCallout' && payload !== undefined) {
    return {
      ...example,
      hasCustomEdits: true,
      overrides: {
        ...(example.overrides || {}),
        callout: {
          ...(example.overrides?.callout || {}),
          ...(typeof payload === 'object' ? payload : { text: String(payload) })
        }
      }
    };
  }

  if (action === 'visualOffset' && payload) {
    return {
      ...example,
      overrides: {
        ...(example.overrides || {}),
        layout: {
          ...(example.overrides?.layout || {}),
          visualOffsetX: payload.x ?? 0,
          visualOffsetY: payload.y ?? 0
        }
      }
    };
  }

  if (action === 'visualZoom') {
    return {
      ...example,
      overrides: {
        ...(example.overrides || {}),
        layout: {
          ...(example.overrides?.layout || {}),
          visualZoom: payload
        }
      }
    };
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
    return {
      ...example,
      overrides: {
        ...(example.overrides || {}),
        visibility: {
          ...(example.overrides?.visibility || {}),
          [action]: payload
        }
      }
    };
  }

  if (
    [
      'promptTextSize',
      'promptLatexSize',
      'stepTextSize',
      'stepLatexSize'
    ].includes(action)
  ) {
    return {
      ...example,
      overrides: {
        ...(example.overrides || {}),
        typography: {
          ...(example.overrides?.typography || {}),
          [action]: payload
        }
      }
    };
  }

  return example;
}

export function buildWorkedCardItem(
  example,
  {
    lang = 'sv',
    isTeacherKey = false,
    isProjector = false,
    isPosterMode = false,
    projectorPacingMode = 'guided_blanks',
    revealStepCount = 0
  } = {}
) {
  const baseRaw = example.rawItem || {};
  const baseResolved = baseRaw.resolvedData || {};
  const baseRenderData = baseResolved.renderData || baseResolved || {};

  let runningRevealBudget = revealStepCount;
  const mappedClues = [];

  for (const clue of example.clues || []) {
    // Skip steps hidden by the teacher so step numbers & projector counts stay aligned
    if (clue.hidden) continue;

    const rawText = clue[lang] || clue.text || clue.sv || clue.en || '';
    const originalText = clue.hideText ? '' : rawText;
    const originalLatex = clue.hideLatex ? null : (clue.latex || null);

    // If both parts of a step were hidden, omit the empty step row
    if (!originalText && !originalLatex) continue;

    if (isPosterMode) {
      mappedClues.push({
        text: originalText,
        sv: originalText,
        en: originalText,
        latex: originalLatex,
        _blankText: false,
        _blankLatex: false
      });
    } else if (!isProjector && isTeacherKey) {
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
        description: example.promptText || baseRenderData.description || '',
        latex: example.promptLatex || baseRenderData.latex || ''
      }
    }
  };
}

const PROJECTOR_TIERS = ['lg', 'xl', '2xl', '3xl'];

function resolveProjectorTier(textZoom = 1.1, isTwoUp = false) {
  const baseIdx = isTwoUp ? 1 : 2;
  const stepOffset = Math.round((textZoom - 1.1) / 0.15);
  const clampedIdx = Math.max(0, Math.min(PROJECTOR_TIERS.length - 1, baseIdx + stepOffset));
  return PROJECTOR_TIERS[clampedIdx];
}

export function getDisplayOptionsForExample(
  example,
  {
    isProjector = false,
    isPosterMode = false,
    themeSkin = 'classic',
    colorPalette = 'amber',
    textZoom = 1.1,
    compact = false,
    defaultStacked = false,
    writingSpace = 'standard',
    blankStyle = 'line',
    blankHeights = {},
    onBlankHeightChange = null
  } = {}
) {
  const exTypo = example.overrides?.typography || {};
  const exVis = example.overrides?.visibility || {};
  const exLayout = example.overrides?.layout || {};
  const isStacked = isProjector
    ? compact
      ? true
      : Boolean(exLayout.stacked)
    : (exLayout.stacked ?? defaultStacked);

  const projectorSingle = isProjector && !compact;
  const projectorTwoUp = isProjector && compact;
  const effectiveZoom = isProjector ? textZoom : 1;
  const projTier = isProjector ? resolveProjectorTier(effectiveZoom, projectorTwoUp) : null;

  const baseSolPx = projectorSingle
    ? Math.max(300, exLayout.solutionWidthPx ?? DEFAULT_CARD_LAYOUT.solutionWidthPx)
    : projectorTwoUp
      ? Math.max(220, exLayout.solutionWidthPx ?? DEFAULT_CARD_LAYOUT.solutionWidthPx)
      : isPosterMode
        ? Math.max(240, exLayout.solutionWidthPx ?? DEFAULT_CARD_LAYOUT.solutionWidthPx)
        : (exLayout.solutionWidthPx ?? DEFAULT_CARD_LAYOUT.solutionWidthPx);

  return {
    compact: isProjector || isPosterMode ? false : (compact || isStacked),
    stacked: isStacked,
    writingSpace,
    blankStyle,
    themeSkin,
    colorPalette,
    callout: example.overrides?.callout || null,
    leftWidthPct: exLayout.leftWidthPct ?? DEFAULT_CARD_LAYOUT.leftWidthPct,
    solutionWidthPx: isProjector ? Math.round(baseSolPx * effectiveZoom) : baseSolPx,
    visualZoom: projectorSingle
      ? Math.max(1.2, (exLayout.visualZoom ?? DEFAULT_CARD_LAYOUT.visualZoom) * effectiveZoom)
      : projectorTwoUp
        ? Math.max(1.05, (exLayout.visualZoom ?? DEFAULT_CARD_LAYOUT.visualZoom) * effectiveZoom)
        : isPosterMode
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
    promptTextSize: isProjector
      ? projTier
      : (exTypo.promptTextSize ?? (isPosterMode ? '2xl' : DEFAULT_TYPOGRAPHY.promptTextSize)),
    promptLatexSize: isProjector
      ? projTier
      : (exTypo.promptLatexSize ?? (isPosterMode ? '3xl' : DEFAULT_TYPOGRAPHY.promptLatexSize)),
    stepTextSize: isProjector
      ? projTier
      : (exTypo.stepTextSize ?? (isPosterMode ? '2xl' : DEFAULT_TYPOGRAPHY.stepTextSize)),
    stepLatexSize: isProjector
      ? projTier
      : (exTypo.stepLatexSize ?? (isPosterMode ? '3xl' : DEFAULT_TYPOGRAPHY.stepLatexSize)),
    blankHeights,
    onBlankHeightChange: !isProjector && !isPosterMode ? onBlankHeightChange : null
  };
}