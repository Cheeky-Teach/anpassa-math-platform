// src/lib/livePacingEngine.js
export function evaluateStudentAdvance({ currentIdx, totalQuestions, settings, updatedCompleted }) {
    if (settings.pacing === 'progressive') {
        if (currentIdx < totalQuestions - 1) {
            return { nextIndex: currentIdx + 1, showSummary: false };
        }
        return { nextIndex: currentIdx, showSummary: Boolean(settings.summary) };
    }

    if (settings.pacing === 'open') {
        const nextUnansweredIdx = Array.from({ length: totalQuestions }).findIndex((_, idx) => !updatedCompleted[idx]);
        if (nextUnansweredIdx !== -1) {
            return { nextIndex: nextUnansweredIdx, showSummary: false };
        }
        if (currentIdx < totalQuestions - 1) {
            return { nextIndex: currentIdx + 1, showSummary: false };
        }
        return { nextIndex: currentIdx, showSummary: Boolean(settings.summary) };
    }

    return { nextIndex: currentIdx, showSummary: false };
}

export function validateStudentInput({ responseStyle, hasAnswer, hasCanvas, hasScratchpad, isMultipleChoice, isFreeText }) {
    if (responseStyle === 'answer_only' && !hasAnswer) {
        return { valid: false, error: 'ANSWER_REQUIRED' };
    }
    if (responseStyle === 'canvas_only' && !hasCanvas && !isMultipleChoice) {
        return { valid: false, error: 'CANVAS_REQUIRED' };
    }
    if (responseStyle === 'scratchpad_only' && !hasScratchpad && !hasAnswer && !isFreeText) {
        return { valid: false, error: 'SCRATCHPAD_REQUIRED' };
    }
    if (!hasAnswer && !hasCanvas && !hasScratchpad) {
        return { valid: false, error: 'NO_INPUT' };
    }
    return { valid: true };
}