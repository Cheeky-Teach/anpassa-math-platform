/**
 * Normalizes and aggregates raw telemetry events across all application modes.
 */
export function aggregateProgress(events = [], filters = {}) {
    const { dateRange = 'all', device = 'all', appMode = 'all', topicSearch = '' } = filters;
    const now = Date.now();

    const filtered = events.filter(row => {
        const payload = row.metrics || row.progress || {};
        const timestamp = new Date(row.created_at).getTime();

        if (dateRange === '7d' && now - timestamp > 7 * 86400000) return false;
        if (dateRange === '30d' && now - timestamp > 30 * 86400000) return false;
        if (device !== 'all' && row.device_type !== device) return false;
        if (appMode !== 'all' && row.app_mode !== appMode) return false;

        if (topicSearch.trim()) {
            const search = topicSearch.toLowerCase();
            const keys = Object.keys(payload).join('_').toLowerCase();
            if (!keys.includes(search)) return false;
        }
        return true;
    });

    return {
        contentHealth: computeContentHealth(filtered),
        teacherWorkflow: computeTeacherWorkflow(filtered),
        classroomDynamics: computeClassroomDynamics(filtered),
        totalEventCount: filtered.length
    };
}

function computeContentHealth(events) {
    const topicMap = {};
    const overrides = [];
    const scratchpadCorrelations = { withScratchpad: { correct: 0, total: 0 }, withoutScratchpad: { correct: 0, total: 0 } };
    const testModeSplit = { exam: { correct: 0, total: 0 }, practice: { correct: 0, total: 0 } };

    events.forEach(row => {
        const payload = row.metrics || row.progress || {};
        const mode = row.app_mode || 'practice'; 

        Object.entries(payload).forEach(([key, val]) => {
            // 1. Friction Matrix & Practice/Exam Split
            if (key.includes('_L') && typeof val === 'object' && val.attempts !== undefined) {
                const [topic, lvlStr] = key.split('_L');
                const lvl = parseInt(lvlStr) || 1;
                const mapKey = `${topic}__L${lvl}`;

                if (!topicMap[mapKey]) {
                    topicMap[mapKey] = { topic, level: lvl, attempts: 0, correct: 0, wrong: 0, reRolls: 0, totalTime: 0, totalClues: 0 };
                }

                const rawAttempts = val.attempts || 0;
                const correct = val.correct || 0;
                const timeSpent = val.time_spent || 0;
                const clues = val.clues || 0;

                // 🟢 ANTI-SPAM OUTLIER FILTER: Cap button-mashing failures
                let validAttempts = rawAttempts;
                if (rawAttempts > 4 && correct === 0) {
                    validAttempts = 4; // Cap penalty at 4 consecutive wrong answers
                } else if (rawAttempts > 6) {
                    validAttempts = correct + 3; // If they eventually got it, cap the wrong guesses
                }
                
                topicMap[mapKey].attempts += validAttempts;
                topicMap[mapKey].correct += correct;
                topicMap[mapKey].wrong += Math.max(0, validAttempts - correct);
                topicMap[mapKey].totalTime += timeSpent;
                topicMap[mapKey].totalClues += clues;

                // Assign to correct bucket (Exam vs Practice)
                if (['test_lab', 'exam', 'live_session', 'teacher_live', 'student_live'].includes(mode)) {
                    testModeSplit.exam.total += validAttempts;
                    testModeSplit.exam.correct += correct;
                } else {
                    testModeSplit.practice.total += validAttempts;
                    testModeSplit.practice.correct += correct;
                }

                // Scratchpad Tracking
                if (lvl >= 3) {
                    if (val.used_scratchpad === true) {
                        scratchpadCorrelations.withScratchpad.total += validAttempts;
                        scratchpadCorrelations.withScratchpad.correct += correct;
                    } else {
                        scratchpadCorrelations.withoutScratchpad.total += validAttempts;
                        scratchpadCorrelations.withoutScratchpad.correct += correct;
                    }
                }
            }

            // 2. Overrides & Hotspots
            if (key === 'live_manual_correction') {
                overrides.push({
                    topic: val.topic, level: val.level, answer_type: val.answer_type, 
                    student_answer: val.student_answer, changed_to_correct: val.changed_to_correct
                });
            }
            if (key === 'live_question_regenerated' || key === 'donow_question_regenerated') {
                const mapKey = `${val.topic || 'unknown'}__L${val.level || 1}`;
                if (topicMap[mapKey]) topicMap[mapKey].reRolls += (val.count || 1);
            }
        });
    });

    const frictionMatrix = Object.values(topicMap).map(row => ({
        ...row,
        accuracy: row.attempts > 0 ? Math.round((row.correct / row.attempts) * 100) : 0,
        // 🟢 EXPORTING NEW METRICS: Time & Clues
        avgTime: row.attempts > 0 ? Math.round(row.totalTime / row.attempts) : 0,
        avgClues: row.attempts > 0 ? Number((row.totalClues / row.attempts).toFixed(1)) : 0
    })).sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts);

    const scratchpadEfficacy = {
        with: scratchpadCorrelations.withScratchpad.total > 0 
            ? Math.round((scratchpadCorrelations.withScratchpad.correct / scratchpadCorrelations.withScratchpad.total) * 100) : 0,
        without: scratchpadCorrelations.withoutScratchpad.total > 0 
            ? Math.round((scratchpadCorrelations.withoutScratchpad.correct / scratchpadCorrelations.withoutScratchpad.total) * 100) : 0
    };

    return { frictionMatrix, overrides, scratchpadCorrelations, scratchpadEfficacy, testModeSplit };
}

function computeTeacherWorkflow(events) {
    let worksheetsPrinted = 0;
    let donowGenerated = 0;
    let presentationsSaved = 0;
    
    // Detailed feature tracking
    const printHabits = { includeAnswerKey: 0, detailedSteps: 0, compactAnswers: 0, framedLayout: 0, totalWorkspaceHeight: 0 };
    const whiteboardTools = { text: 0, math: 0, both: 0, withLatex: 0 };
    const customPrompts = { count: 0, totalLength: 0 };
    const presetsUsed = {};
    
    // Global Packet metrics
    let totalPacketSize = 0;
    let packetCount = 0;
    let wordProblemsSum = 0;
    let mixedTopicsCount = 0;
    let mixedLevelsCount = 0;
    let manualLayoutTweaks = 0;

    events.forEach(row => {
        const payload = row.metrics || row.progress || {};

        Object.entries(payload).forEach(([key, val]) => {
            if (key === 'worksheet_export' || key === 'worksheet_printed') {
                worksheetsPrinted += val.count || 1;
                totalPacketSize += val.packet_size || val.avg_size || val.size || 0;
                wordProblemsSum += val.word_problems_ratio || 0;
                if (val.is_mixed_topics) mixedTopicsCount++;
                if (val.is_mixed_levels) mixedLevelsCount++;
                manualLayoutTweaks += val.manual_layout_tweaks || 0;
                packetCount += 1;

                if (val.include_answer_key) printHabits.includeAnswerKey += 1;
                if (val.answer_style === 'detailed') printHabits.detailedSteps += 1;
                if (val.answer_style === 'compact') printHabits.compactAnswers += 1;
                if (val.layout_style === 'framed') printHabits.framedLayout += 1;
                printHabits.totalWorkspaceHeight += val.workspace_height || 0;
            }
            if (key === 'donow_generation') {
                donowGenerated += val.count || 1;
                totalPacketSize += val.packet_size || val.size || 0;
                wordProblemsSum += val.word_problems_ratio || 0;
                packetCount += 1;
            }
            if (key === 'presentation_saved') presentationsSaved += 1;

            if (key === 'whiteboard_clue_pushed') {
                if (val.tool_used) whiteboardTools[val.tool_used] = (whiteboardTools[val.tool_used] || 0) + 1;
                if (val.has_latex) whiteboardTools.withLatex += 1;
            }
            if (key === 'custom_prompt_added') {
                customPrompts.count += 1;
                customPrompts.totalLength += val.prompt_length || 0;
            }
            if (key === 'test_session_started' && val.selected_preset) {
                presetsUsed[val.selected_preset] = (presetsUsed[val.selected_preset] || 0) + 1;
            }
        });
    });

    return {
        counts: { worksheetsPrinted, donowGenerated, presentationsSaved },
        printHabits: {
            ...printHabits,
            avgWorkspaceHeight: worksheetsPrinted > 0 ? Math.round(printHabits.totalWorkspaceHeight / worksheetsPrinted) : 0
        },
        whiteboardTools,
        customPrompts: {
            ...customPrompts,
            avgLength: customPrompts.count > 0 ? Math.round(customPrompts.totalLength / customPrompts.count) : 0
        },
        packetComposition: {
            avgSize: packetCount > 0 ? Math.round(totalPacketSize / packetCount) : 0,
            avgWordProblemRatio: packetCount > 0 ? Math.round((wordProblemsSum / packetCount) * 100) : 0,
            mixedTopicsPercent: packetCount > 0 ? Math.round((mixedTopicsCount / packetCount) * 100) : 0,
            mixedLevelsPercent: packetCount > 0 ? Math.round((mixedLevelsCount / packetCount) * 100) : 0,
            totalManualLayoutTweaks: manualLayoutTweaks
        },
        presetsUsed
    };
}

function computeClassroomDynamics(events) {
    const pacingCohorts = { open: { sessions: 0 }, progressive: { sessions: 0 }, teacher: { sessions: 0 } };
    const orderSplit = { original: 0, randomized: 0 };
    const dropoffFunnels = {};
    let totalTimerSeconds = 0;
    let timerEventCount = 0;
    let totalKicked = 0;
    let totalAbandoned = 0;
    let totalReviewedResults = 0;
    let rehydratedCount = 0;
    let restoredAnswersSum = 0;

    events.forEach(row => {
        const payload = row.metrics || row.progress || {};
        
        Object.entries(payload).forEach(([key, val]) => {
            if (key === 'test_session_abandoned' || key === 'student_abandoned_session') {
                const step = val.questions_answered || 1;
                dropoffFunnels[step] = (dropoffFunnels[step] || 0) + 1;
                totalAbandoned += 1;
            }
            if (key === 'live_session_started') {
                if (val.pacing && pacingCohorts[val.pacing]) pacingCohorts[val.pacing].sessions += 1;
                if (val.order) orderSplit[val.order] = (orderSplit[val.order] || 0) + 1;
            }
            if (key === 'donow_session_started' && val.initial_timer_seconds) {
                totalTimerSeconds += val.initial_timer_seconds;
                timerEventCount += 1;
            }
            if (key === 'live_student_kicked') totalKicked += 1;
            if (key === 'student_reviewed_results') totalReviewedResults += 1;
            
            if (key === 'student_session_rehydrated') {
                rehydratedCount += 1;
                restoredAnswersSum += val.restored_answer_count || 0;
            }
        });
    });

    return {
        pacingCohorts,
        orderSplit,
        timerAverageSeconds: timerEventCount > 0 ? Math.round(totalTimerSeconds / timerEventCount) : 0,
        retention: { totalKicked, totalAbandoned, totalReviewedResults },
        rehydration: {
            rehydratedCount,
            avgRestoredAnswers: rehydratedCount > 0 ? Math.round(restoredAnswersSum / rehydratedCount) : 0
        },
        dropoffFunnels
    };
}