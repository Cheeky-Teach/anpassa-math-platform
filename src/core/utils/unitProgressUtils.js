// src/core/utils/unitProgressUtils.js
import { CATEGORIES } from '../../constants/localization';

export const getTopicDisplayName = (topicId, lang = 'sv') => {
    if (!topicId) return '';
    for (const catKey in CATEGORIES) {
        const found = CATEGORIES[catKey]?.topics?.find(t => t.id === topicId);
        if (found) return found.label[lang] || found.label.sv || topicId;
    }
    return String(topicId).replace(/_/g, ' ');
};

export const getPartDisplayTitle = (part, partIndex, lang = 'sv') => {
    if (part?.customTitle && part.customTitle.trim()) {
        return part.customTitle;
    }
    const prefix = lang === 'sv' ? 'Del' : 'Part';
    const topicLabel = getTopicDisplayName(part?.topicId, lang);
    return topicLabel ? `${prefix} ${partIndex + 1}: ${topicLabel}` : `${prefix} ${partIndex + 1}`;
};

export const normalizePartsPayload = (rawPayload = []) => {
    if (!Array.isArray(rawPayload) || rawPayload.length === 0) return [];

    if (rawPayload[0]?.type === 'part' || rawPayload[0]?.type === 'section') {
        return rawPayload.map((part, pIdx) => ({
            ...part,
            type: 'part',
            id: part.id || `part_${pIdx}_${part.topicId || 'sec'}`,
            steps: Array.isArray(part.steps)
                ? part.steps.map((s, sIdx) => ({
                      ...s,
                      id:
                          s.id ||
                          (s.type === 'test'
                              ? `step_test_${pIdx}_${sIdx}`
                              : s.sheetId
                                ? `step_inst_${s.sheetId}`
                                : `step_prac_${s.topic || part.topicId}_${s.level || sIdx}`),
                      type: s.type || (s.sheetId ? 'instruction' : 'practice')
                  }))
                : []
        }));
    }

    const grouped = {};
    const parts = [];

    rawPayload.forEach((item, idx) => {
        const topic = item.topic || item.topicId || 'generic';
        if (!grouped[topic]) {
            const newPart = {
                id: `part_${topic}_${idx}`,
                type: 'part',
                topicId: topic,
                customTitle: null,
                steps: []
            };
            grouped[topic] = newPart;
            parts.push(newPart);
        }
        grouped[topic].steps.push({
            ...item,
            id: item.id || (item.sheetId ? `step_inst_${item.sheetId}` : `step_prac_${topic}_${item.level}`),
            type: item.type || (item.sheetId ? 'instruction' : 'practice')
        });
    });

    return parts;
};

export const checkIsStepCompleted = (step, completedIds = []) => {
    if (!step || !Array.isArray(completedIds)) return false;
    if (step.id && completedIds.includes(step.id)) return true;

    if (step.type === 'practice') {
        const stepTopic = step.topic || step.topicId;
        const stepLevel = Number(step.level);
        return completedIds.some(id => {
            if (id === step.id) return true;
            if (typeof id === 'string') {
                if (id === `${stepTopic}_${stepLevel}`) return true;
                if (id === `step_prac_${stepTopic}_${stepLevel}`) return true;
                if (id.includes(`_${stepTopic}_`) && id.endsWith(`_${stepLevel}`)) return true;
            }
            return false;
        });
    }
    return false;
};

export const getUnitProgressStorageKey = (profile, activeBucket) => {
    const studentId = profile?.id || 'guest_student';
    const bucketId = activeBucket?.id || 'default_bucket';
    return `progress_${studentId}_${bucketId}`;
};

export const readCompletedStepIds = (storageKey) => {
    try {
        const raw = localStorage.getItem(storageKey);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

export const persistStepComplete = (storageKey, stepId, currentIds = []) => {
    if (!stepId || currentIds.includes(stepId)) return currentIds;
    const updated = [...currentIds, stepId];
    try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (err) {
        console.error('Failed to save unit progress:', err);
    }
    return updated;
};

export const getNextUnitStep = (allSteps = [], currentStepId) => {
    const idx = allSteps.findIndex(s => s.id === currentStepId);
    if (idx !== -1 && idx + 1 < allSteps.length) {
        return allSteps[idx + 1];
    }
    return null;
};