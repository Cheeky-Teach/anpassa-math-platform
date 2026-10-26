// src/hooks/useGameQuestionPool.js
import { useState, useCallback } from 'react';
import { 
    fetchBatchQuestions, 
    fetchSingleQuestion, 
    normalizeActivityQuestion 
} from '../lib/activityQuestionClient.js';

/**
 * Extracts seeds (topics, variations, levels) from a worksheet or presentation packet
 */
export function extractSeedsFromPacket(packet = []) {
    const safePacket = Array.isArray(packet) 
        ? packet 
        : Array.isArray(packet?.livePacket) 
            ? packet.livePacket 
            : Array.isArray(packet?.tiles) 
                ? packet.tiles 
                : [];

    const topics = new Set();
    const variations = new Set();
    const levels = new Set();

    safePacket.forEach(item => {
        const topic = item.topicId || item.topic || item.topic_id;
        const variation = item.variationKey || item.variation || item.variation_key;
        const level = item.level || item.resolvedData?.level || 1;

        if (topic) topics.add(topic);
        if (variation) variations.add(variation);
        if (level) levels.add(Number(level));
    });

    return {
        topics: Array.from(topics),
        variations: Array.from(variations),
        levels: Array.from(levels).sort((a, b) => a - b),
        count: safePacket.length
    };
}

/**
 * Distributes a [minLevel, maxLevel] range across N rows evenly.
 * E.g., min: 1, max: 4, rows: 4 => [1, 2, 3, 4]
 * E.g., min: 1, max: 5, rows: 3 => [1, 3, 5]
 */
export function interpolateLevelRange(minLevel, maxLevel, rowCount) {
    if (rowCount <= 1) return [minLevel];
    const step = (maxLevel - minLevel) / (rowCount - 1);
    return Array.from({ length: rowCount }, (_, r) => Math.round(minLevel + r * step));
}

export function useGameQuestionPool({ lang = 'sv' } = {}) {
    const [pool, setPool] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Helper: Validates whether a tile actually has visible content
    const isTileEmpty = (tile) => {
        if (!tile) return true;
        const rd = tile.renderData || tile.resolvedData?.renderData || {};
        const desc = typeof rd.description === 'object' 
            ? (rd.description?.[lang] || rd.description?.sv || rd.description?.en) 
            : rd.description;
        
        const hasText = typeof desc === 'string' && desc.trim().length > 0;
        const hasLatex = typeof rd.latex === 'string' && rd.latex.trim().length > 0;
        const hasVisual = Boolean(rd.geometry || rd.graph || rd.pattern || rd.marbles);

        return !hasText && !hasLatex && !hasVisual;
    };

    const generateGridFromSeeds = useCallback(async ({
        topics = [],
        categories = [],
        columns = 4,
        rows = 4,
        startLevel = 1,
        wordProblems = false
    }) => {
        setIsLoading(true);
        try {
            const requests = [];

            for (let c = 0; c < columns; c++) {
                const catObj = categories[c];
                const topicId = catObj?.topic || topics[c % topics.length] || 'equations';

                // Determine min/max range for this column
                const minLevel = Number(catObj?.minLevel ?? catObj?.startLevel ?? startLevel ?? 1);
                const maxLevel = Number(catObj?.maxLevel ?? (minLevel + rows - 1));

                // Calculate the stepped difficulty for each row in this column
                const columnLevels = interpolateLevelRange(minLevel, maxLevel, rows);

                for (let r = 0; r < rows; r++) {
                    const slotId = `c${c}_r${r}`;
                    const targetLevel = columnLevels[r];

                    requests.push({
                        slotId,
                        topic: topicId,
                        level: targetLevel,
                        wordProblem: wordProblems,
                        minLevel,
                        maxLevel
                    });
                }
            }

            // 1. Initial Batch Fetch
            const rawQuestions = await fetchBatchQuestions(requests, lang);
            
            const nextPool = {};
            requests.forEach((req, idx) => {
                const q = rawQuestions[idx] || {};
                nextPool[req.slotId] = {
                    ...q,
                    slotId: req.slotId,
                    topicId: req.topic,
                    level: req.level,
                    minLevel: req.minLevel,
                    maxLevel: req.maxLevel,
                    wordProblem: wordProblems
                };
            });

            // 2. AUTOMATIC POST-BATCH AUTO-HEAL
            const emptySlots = Object.keys(nextPool).filter(slotId => isTileEmpty(nextPool[slotId]));

            if (emptySlots.length > 0) {
                console.warn(`[Auto-healing ${emptySlots.length} empty tiles]:`, emptySlots);

                await Promise.all(
                    emptySlots.map(async (slotId) => {
                        const originalReq = requests.find(r => r.slotId === slotId);
                        if (!originalReq) return;

                        try {
                            // Retry via single question endpoint with retry loop
                            let healedQuestion = await fetchSingleQuestion({
                                topic: originalReq.topic,
                                level: originalReq.level,
                                wordProblem: true,
                                lang
                            });

                            // Fallback to pure math if story generation fails
                            if (isTileEmpty(healedQuestion)) {
                                healedQuestion = await fetchSingleQuestion({
                                    topic: originalReq.topic,
                                    level: originalReq.level,
                                    wordProblem: false,
                                    lang
                                });
                                healedQuestion.showLatex = true;
                            }

                            nextPool[slotId] = {
                                ...healedQuestion,
                                slotId,
                                topicId: originalReq.topic,
                                level: originalReq.level,
                                minLevel: originalReq.minLevel,
                                maxLevel: originalReq.maxLevel,
                                wordProblem: wordProblems
                            };
                        } catch (err) {
                            console.error(`Auto-heal failed for ${slotId}:`, err);
                        }
                    })
                );
            }

            setPool(nextPool);
        } catch (err) {
            console.error("Failed to generate grid from seeds:", err);
        } finally {
            setIsLoading(false);
        }
    }, [lang]);

    // Single slot regeneration
    const regenerateSlot = useCallback(async (slotId) => {
        const current = pool[slotId];
        if (!current) return;

        try {
            let nextQ = await fetchSingleQuestion({
                topic: current.topicId,
                level: current.level || 1,
                wordProblem: current.wordProblem,
                lang
            });

            // Fallback if empty
            if (isTileEmpty(nextQ)) {
                nextQ = await fetchSingleQuestion({
                    topic: current.topicId,
                    level: current.level || 1,
                    wordProblem: false,
                    lang
                });
                nextQ.showLatex = true;
            }

            setPool(prev => ({
                ...prev,
                [slotId]: {
                    ...nextQ,
                    slotId,
                    topicId: current.topicId,
                    level: current.level,
                    minLevel: current.minLevel,
                    maxLevel: current.maxLevel,
                    wordProblem: current.wordProblem
                }
            }));
        } catch (err) {
            console.error(`Failed to regenerate slot ${slotId}:`, err);
        }
    }, [pool, lang]);

    const updateSlotManually = useCallback((slotId, updates) => {
        setPool(prev => prev[slotId] ? {
            ...prev,
            [slotId]: { ...prev[slotId], ...updates }
        } : prev);
    }, []);

    const ingestAsIs = useCallback((tilesArray = []) => {
        const nextPool = {};
        tilesArray.forEach((tile, idx) => {
            const slotId = tile.slotId || `c${idx % 4}_r${Math.floor(idx / 4)}`;
            nextPool[slotId] = { ...tile, slotId };
        });
        setPool(nextPool);
    }, []);

    return {
        pool,
        isLoading,
        generateGridFromSeeds,
        regenerateSlot,
        updateSlotManually,
        ingestAsIs
    };
}