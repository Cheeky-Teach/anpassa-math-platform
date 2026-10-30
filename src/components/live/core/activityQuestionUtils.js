// src/components/activities/utils/activityQuestionUtils.js
import { supabase } from '../../../lib/supabaseClient';
import { liveCreateRoom } from '../../live/core/liveCreateRoom';

/**
 * 1. UNIFIED ACTIVITY SAVING (to `saved_sheets`)
 * Handles authentication, payload structure, and upsert branching.
 */
export async function saveActivityToLibrary({
    sheetId = null,
    title,
    type,
    packet,
    config = {},
    visibility = 'private',
    autoTopics = []
}) {
    const { data: authData } = await supabase.auth.getUser();
    const teacherId = authData?.user?.id;
    if (!teacherId) throw new Error("Not authenticated");

    const payload = {
        title: title.trim(),
        type,
        user_id: teacherId,
        visibility,
        auto_topics: autoTopics,
        packet,
        config
    };

    let res;
    if (sheetId) {
        res = await supabase.from('saved_sheets').update(payload).eq('id', sheetId).select().single();
    } else {
        res = await supabase.from('saved_sheets').insert([payload]).select().single();
    }

    if (res.error) throw res.error;
    return res.data;
}

/**
 * 2. UNIVERSAL REGENERATE SINGLE QUESTION
 * Purges prior responses in room, requests fresh numbers, stamps regenVersion.
 */
export async function universalRegenerateQuestion({
    roomId,
    questionIndex,
    topicId,
    variationKey = null,
    wordProblem = false,
    lang = 'sv',
    formatFn = null
}) {
    if (!topicId || topicId === 'custom' || topicId === 'imported') {
        return null;
    }

    if (roomId && questionIndex !== undefined && questionIndex !== null) {
        try {
            await supabase
                .from('responses')
                .delete()
                .eq('room_id', roomId)
                .eq('question_index', questionIndex);
        } catch (err) {
            console.error("[universalRegenerateQuestion] Failed to delete previous responses:", err);
        }
    }

    const wpParam = Boolean(wordProblem);
    const varParam = variationKey ? `&variation=${variationKey}` : '';
    const url = `/api/question?topic=${topicId}${varParam}&lang=${lang}&wordProblem=${wpParam}`;

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to fetch fresh question: ${res.statusText}`);
    }
    const freshData = await res.json();
    const newRegenVersion = Date.now();
    
    if (formatFn) {
        const formatted = formatFn(freshData, questionIndex);
        return { ...formatted, regenVersion: newRegenVersion };
    }

    return { ...freshData, regenVersion: newRegenVersion };
}

/**
 * 3. UNIVERSAL REGENERATE ALL (BATCH)
 * Iterates through questions, handles custom fallbacks, and applies formatter.
 */
export async function universalRegenerateAll({
    items = [],
    roomId = null,
    lang = 'sv',
    formatFn = null,
    onCustomFallback = null
}) {
    const updatedPromises = items.map(async (item, idx) => {
        const effectiveTopicId = item.topicId !== 'imported' && item.topicId !== 'custom' 
            ? item.topicId 
            : (item.resolvedData?.topicId || item.renderData?.topicId || null);

        if (!effectiveTopicId || effectiveTopicId === 'custom') {
            return onCustomFallback ? onCustomFallback(item) : item;
        }

        try {
            const fresh = await universalRegenerateQuestion({
                roomId,
                questionIndex: idx + 1,
                topicId: effectiveTopicId,
                variationKey: item.variationKey || item.resolvedData?.variationKey || null,
                wordProblem: item.wordProblem,
                lang,
                formatFn
            });

            return fresh ? { ...fresh, id: item.id, name: item.name, topicId: effectiveTopicId } : item;
        } catch {
            return item;
        }
    });

    return Promise.all(updatedPromises);
}

/**
 * 4. UNIVERSAL LIVE ROOM BROADCAST
 * Syncs the active question data to the `rooms` table.
 */
export async function broadcastRoomQuestionState({
    roomId,
    activeQuestionData
}) {
    if (!roomId || !activeQuestionData) return;

    try {
        const { error } = await supabase
            .from('rooms')
            .update({
                active_question_data: {
                    ...activeQuestionData,
                    updated_at: new Date().toISOString()
                }
            })
            .eq('id', roomId);

        if (error) console.error("[broadcastRoomQuestionState] Broadcast error:", error);
    } catch (err) {
        console.error("[broadcastRoomQuestionState] Exception:", err);
    }
}

/**
 * 5. SAFE ROOM CLOSURE
 * Matches the Supabase rooms schema (`status: 'closed'`).
 */
export async function closeActiveRoom(roomId) {
    if (!roomId) return { success: false, error: 'No roomId provided' };
    try {
        const { error } = await supabase
            .from('rooms')
            .update({
                status: 'closed',
                active_question_data: {
                    terminated: true,
                    mode: 'terminated'
                }
            })
            .eq('id', roomId);

        if (error) {
            console.error("[closeActiveRoom] Error closing room:", error);
            return { success: false, error };
        }
        return { success: true };
    } catch (err) {
        console.error("[closeActiveRoom] Exception closing room:", err);
        return { success: false, error: err };
    }
}

/**
 * 6. UNPACK & NORMALIZE SAVED ACTIVITY
 * Normalizes different packet variations from `saved_sheets`.
 */
export function unpackSavedActivity(sheetRecord) {
    if (!sheetRecord) return { title: '', packet: [], config: {}, sheetId: null, type: null };

    const rawPacket = sheetRecord.packet || sheetRecord.data?.packet || [];
    const rawConfig = sheetRecord.config || sheetRecord.data?.config || {};
    const title = sheetRecord.title || sheetRecord.data?.title || '';
    const sheetId = sheetRecord.id || null;

    let packet = [];
    if (Array.isArray(rawPacket)) {
        packet = rawPacket;
    } else if (Array.isArray(rawPacket.tiles)) {
        packet = rawPacket.tiles;
    } else if (Array.isArray(rawPacket.questions)) {
        packet = rawPacket.questions;
    } else if (Array.isArray(rawPacket.livePacket)) {
        packet = rawPacket.livePacket;
    }

    return {
        sheetId,
        title,
        packet,
        config: rawConfig,
        type: sheetRecord.type || sheetRecord.activity_mode || 'activity_custom'
    };
}

/**
 * 7. ESCALATE LOCAL ACTIVITY TO LIVE ROOM
 * Provisions an authenticated live room for an active engine on-the-fly,
 * seeds the room with the engine's current in-memory packet, and synchronizes initial board state.
 */
export async function escalateActivityToLiveRoom({
    teacherId,
    profile,
    title,
    mode,
    gameKey,
    packet = [],
    settings = {},
    initialBroadcastData = null
}) {
    const newRoom = await liveCreateRoom({
        teacherId,
        profile,
        title: title || "Live Session",
        mode,
        packet: Array.isArray(packet) ? packet : (packet?.tiles || packet?.livePacket || []),
        settings: {
            ...settings,
            deliveryMode: 'digital'
        }
    });

    if (!newRoom) {
        throw new Error("Could not initialize live room.");
    }

    if (initialBroadcastData) {
        await broadcastRoomQuestionState({
            roomId: newRoom.id,
            activeQuestionData: {
                mode,
                gameKey: gameKey || mode.replace('activity_', ''),
                ...initialBroadcastData,
                updated_at: new Date().toISOString()
            }
        });
    }

    return newRoom;
}