/**
 * Configuration for how the system handles struggles and success.
 */
export const PROGRESSION_THRESHOLDS = {
    FAILURES_TO_DETOUR: 6, // Consecutive incorrect answers required to trigger a detour
    STREAK_TO_RETURN: 3    // Consecutive correct answers required to complete the warm-up detour
};

/**
 * Analyzes the student's recent history to determine if they need to be sent
 * to a prerequisite "warm-up" level.
 * 
 * @param {Array} history - The student's answer history from App.jsx
 * @param {String} currentTopic - The ID of the topic they are currently practicing
 * @param {Number} currentLevel - The level they are currently practicing
 * @param {Array} contentMap - The global CONTENT_MAP array containing prerequisites
 * @returns {Object} { shouldDetour: boolean, detourTopic?: string, detourLevel?: number }
 */
export const checkDetourTrigger = (history, currentTopic, currentLevel, contentMap) => {
    // 1. If they haven't answered enough questions yet, no detour needed
    if (!history || history.length < PROGRESSION_THRESHOLDS.FAILURES_TO_DETOUR) {
        return { shouldDetour: false };
    }

    // 2. Grab the most recent attempts
    const recentHistory = history.slice(0, PROGRESSION_THRESHOLDS.FAILURES_TO_DETOUR);
    
    // 3. Are all of these recent attempts incorrect for the CURRENT topic and level?
    const isStruggling = recentHistory.every(
        attempt => !attempt.correct && attempt.topic === currentTopic && attempt.level === currentLevel
    );

    if (!isStruggling) {
        return { shouldDetour: false };
    }

    // 4. Find the topic data in the content map
    let topicData = null;
    for (const category of contentMap) {
        const found = category.topics.find(t => t.id === currentTopic);
        if (found) {
            topicData = found;
            break;
        }
    }

    if (!topicData || !topicData.levels) {
        return { shouldDetour: false };
    }

    // 5. Check if the current level has a hardcoded prerequisite
    const levelData = topicData.levels.find(l => l.lvl === currentLevel);
    
    if (levelData && levelData.prerequisite) {
        return {
            shouldDetour: true,
            detourTopic: levelData.prerequisite.topic,
            detourLevel: levelData.prerequisite.level
        };
    }

    // If no prerequisite is defined, they just stay on the current level
    return { shouldDetour: false };
};

/**
 * Evaluates if a student has successfully completed their warm-up detour.
 * 
 * @param {Number} currentStreak - The student's active streak on the detour level
 * @returns {Boolean}
 */
export const checkDetourCompletion = (currentStreak) => {
    return currentStreak >= PROGRESSION_THRESHOLDS.STREAK_TO_RETURN;
};