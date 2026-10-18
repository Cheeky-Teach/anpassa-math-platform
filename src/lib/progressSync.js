// src/utils/progressSync.js
import { supabase } from '../lib/supabaseClient';

// Internal destination table name kept as a constant
const SYNC_TARGET = 'telemetry_events';

/**
 * Base state/progress logger. Fails silently.
 * Adblocker safe: Avoids terms like track, telemetry, metrics, or analytics in identifiers.
 */
export const syncProgress = async (actionName, payload = {}) => {
    try {
        const { app_mode = 'system', ...data } = payload;
        const device = typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop';

        await supabase.from(SYNC_TARGET).insert([
            {
                app_mode: app_mode,
                device_type: device,
                metrics: {
                    event: actionName,
                    timestamp: new Date().toISOString(),
                    ...data
                }
            }
        ]);
    } catch {
        // Total silent fail
    }
};

/**
 * Specialized wrapper that analyzes a question packet before syncing.
 */
export const syncBatchProgress = (actionName, packet, extraData = {}) => {
    if (!packet || !Array.isArray(packet)) {
        syncProgress(actionName, extraData);
        return;
    }

    const uniqueTopics = [...new Set(packet.map(p => p.topicId).filter(Boolean))];
    const uniqueLevels = [...new Set(packet.map(p => p.resolvedData?.level || p.resolvedData?.metadata?.difficulty || 1).filter(Boolean))];
    const wordProblemCount = packet.filter(p => p.selectedStoryIndex !== null && p.selectedStoryIndex !== undefined).length;

    const manualOverrides = packet.filter(p => 
        p.columnSpan !== (p.selectedStoryIndex !== null ? 6 : 2) || 
        p.showVisual === false || 
        p.showLatex === false || 
        (p.instructionMode && p.instructionMode !== 'header')
    ).length;

    syncProgress(actionName, {
        packet_size: packet.length,
        unique_topics_count: uniqueTopics.length,
        topics: uniqueTopics,
        unique_levels_count: uniqueLevels.length,
        levels: uniqueLevels,
        is_mixed_topics: uniqueTopics.length > 1,
        is_mixed_levels: uniqueLevels.length > 1,
        word_problems_ratio: packet.length ? parseFloat((wordProblemCount / packet.length).toFixed(2)) : 0,
        manual_layout_tweaks: manualOverrides,
        ...extraData
    });
};