// src/utils/progressSync.js

/**
 * Base progress sender. Fails silently.
 * Adblocker safe: Avoids words like 'track', 'telemetry', or 'analytics'.
 */
export const syncProgress = (actionName, payload = {}) => {
    try {
        const { app_mode = 'system', ...metrics } = payload;
        
        fetch('/api/save-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                app_mode: app_mode,
                device_type: window.innerWidth < 768 ? 'mobile' : 'desktop',
                progress: {
                    event: actionName,
                    timestamp: new Date().toISOString(),
                    ...metrics
                }
            })
        }).catch(() => {}); 
    } catch (err) {
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