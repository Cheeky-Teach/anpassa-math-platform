// scripts/liveRoomMatrix.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateStudentAdvance, validateStudentInput } from '../src/lib/livePacingEngine.js';

function simulateStudentLiveTransition({
    settings = {},
    localPacket = [],
    currentIndex = 0,
    answers = {},
    scratchpad = {},
    canvasElements = {},
    completed = {},
    action = { type: 'SUBMIT', targetIdx: 0 }
}) {
    if (action.type === 'SUBMIT') {
        const targetIdx = action.targetIdx !== undefined ? action.targetIdx : currentIndex;
        const currentItem = localPacket[targetIdx];
        if (!currentItem || completed[targetIdx]) {
            return { error: 'ALREADY_COMPLETED_OR_INVALID', currentIndex, completed };
        }

        const rawAnswer = answers[targetIdx];
        const canvasData = canvasElements[targetIdx] || [];
        const scratchpadSteps = (scratchpad[targetIdx] || []).filter(s => s.trim().length > 0);

        const hasAnswer = rawAnswer !== undefined && String(rawAnswer).trim() !== "";
        const hasCanvas = canvasData.length > 0;
        const hasScratchpad = scratchpadSteps.length > 0;
        const isMultipleChoice = currentItem.answerType === 'multiple_choice';
        const isFreeText = currentItem.answerType === 'free_text';

        // 🟢 Calls REAL production validation logic from src/lib/livePacingEngine.js
        const validation = validateStudentInput({
            responseStyle: settings.responseStyle || 'flexible',
            hasAnswer,
            hasCanvas,
            hasScratchpad,
            isMultipleChoice,
            isFreeText
        });

        if (!validation.valid) {
            return { error: validation.error, currentIndex, completed };
        }

        const updatedCompleted = { ...completed, [targetIdx]: 'correct' };

        // 🟢 Calls REAL production auto-advance logic from src/lib/livePacingEngine.js
        const advance = evaluateStudentAdvance({
            currentIdx: targetIdx,
            totalQuestions: localPacket.length,
            settings,
            updatedCompleted
        });

        return {
            success: true,
            currentIndex: advance.showSummary ? 'FINAL_REVIEW' : advance.nextIndex,
            completed: updatedCompleted
        };
    }

    if (action.type === 'NAVIGATE') {
        const allowed = settings.pacing === 'open';
        if (!allowed) {
            return { error: 'NAVIGATION_LOCKED', currentIndex, completed };
        }
        const target = Math.max(0, Math.min(localPacket.length - 1, action.targetIdx));
        return { success: true, currentIndex: target, completed };
    }

    return { error: 'UNKNOWN_ACTION', currentIndex, completed };
}

describe('Live Classroom Setting Matrix Exhaustive Suite', () => {
    const samplePacket = [
        { id: 'q1', originalIndex: 0, answerType: 'standard' },
        { id: 'q2', originalIndex: 1, answerType: 'multiple_choice' },
        { id: 'q3', originalIndex: 2, answerType: 'free_text' }
    ];

    const PACINGS = ['open', 'progressive', 'teacher'];
    const RESPONSE_STYLES = ['flexible', 'answer_only', 'scratchpad_only', 'canvas_only'];

    PACINGS.forEach(pacing => {
        RESPONSE_STYLES.forEach(responseStyle => {
            describe(`Configuration: Pacing = ${pacing} | ResponseStyle = ${responseStyle}`, () => {
                
                it('verifies submission validity and index progression', () => {
                    const settings = {
                        pacing,
                        responseStyle,
                        allowScratchpad: true,
                        allowCanvas: true,
                        summary: true
                    };

                    const answers = { 0: '42' };
                    const scratchpad = { 0: ['x = 42'] };
                    const canvasElements = { 0: [{ id: 'stroke1', type: 'line' }] };

                    const result = simulateStudentLiveTransition({
                        settings,
                        localPacket: samplePacket,
                        currentIndex: 0,
                        answers,
                        scratchpad,
                        canvasElements,
                        completed: {},
                        action: { type: 'SUBMIT', targetIdx: 0 }
                    });

                    assert.equal(result.success, true);
                    assert.equal(result.completed[0], 'correct');

                    if (pacing === 'progressive' || pacing === 'open') {
                        assert.equal(result.currentIndex, 1);
                    } else if (pacing === 'teacher') {
                        assert.equal(result.currentIndex, 0); // Holds until teacher pushes
                    }
                });

                it('verifies pagination lock rules', () => {
                    const settings = { pacing, responseStyle };
                    
                    const navResult = simulateStudentLiveTransition({
                        settings,
                        localPacket: samplePacket,
                        currentIndex: 0,
                        completed: {},
                        action: { type: 'NAVIGATE', targetIdx: 1 }
                    });

                    if (pacing === 'open') {
                        assert.equal(navResult.success, true);
                        assert.equal(navResult.currentIndex, 1);
                    } else {
                        assert.equal(navResult.error, 'NAVIGATION_LOCKED');
                    }
                });
            });
        });
    });

    it('progressive pacing successfully advances through all questions to completion', () => {
        const settings = { pacing: 'progressive', responseStyle: 'flexible', summary: true };
        let state = {
            settings,
            localPacket: samplePacket,
            currentIndex: 0,
            answers: { 0: '1', 1: '2', 2: '3' },
            completed: {}
        };

        // Submit Q1
        let res = simulateStudentLiveTransition({ ...state, action: { type: 'SUBMIT', targetIdx: 0 } });
        assert.equal(res.currentIndex, 1);
        state.completed = res.completed;
        state.currentIndex = res.currentIndex;

        // Submit Q2
        res = simulateStudentLiveTransition({ ...state, action: { type: 'SUBMIT', targetIdx: 1 } });
        assert.equal(res.currentIndex, 2);
        state.completed = res.completed;
        state.currentIndex = res.currentIndex;

        // Submit Q3
        res = simulateStudentLiveTransition({ ...state, action: { type: 'SUBMIT', targetIdx: 2 } });
        assert.equal(res.currentIndex, 'FINAL_REVIEW');
    });
});