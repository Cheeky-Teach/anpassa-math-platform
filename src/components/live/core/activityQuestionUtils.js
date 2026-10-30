// src/components/activities/utils/activityQuestionUtils.js
import { supabase } from '../../../lib/supabaseClient';
import { useState, useEffect, useRef } from 'react';

export function useActivityEngineSession({
    session = null,
    initialConfig = null,
    isLiveHost = false,
    profile = null,
    onClose = null
}) {
    // 🟢 1. Universal Session & Code Resolution
    const effectiveSession = session || initialConfig?.session || initialConfig?.room || null;
    const effectiveLiveHost = Boolean(isLiveHost || effectiveSession?.id);
    const effectiveClassCode = effectiveSession?.class_code || effectiveSession?.room_code || initialConfig?.room_code || '';
    const effectiveRoomId = effectiveSession?.id || initialConfig?.roomId || null;

    const userRole = String(profile?.role || '').toLowerCase();
    const canHostLiveRoom = userRole === 'teacher' || userRole === 'super_admin';
    const deliveryMode = initialConfig?.settings?.deliveryMode || initialConfig?.deliveryMode || (effectiveLiveHost ? 'digital' : 'physical');
    const isDigitalMode = effectiveLiveHost || (deliveryMode === 'digital' && canHostLiveRoom);

    const [activeRoomId, setActiveRoomId] = useState(effectiveRoomId);
    const [activeClassCode, setActiveClassCode] = useState(effectiveClassCode);
    const [liveResponses, setLiveResponses] = useState([]);

    const roomIdRef = useRef(effectiveRoomId);
    useEffect(() => {
        roomIdRef.current = effectiveRoomId;
        if (effectiveRoomId && effectiveRoomId !== activeRoomId) setActiveRoomId(effectiveRoomId);
        if (effectiveClassCode && effectiveClassCode !== activeClassCode) setActiveClassCode(effectiveClassCode);
    }, [effectiveRoomId, effectiveClassCode]);

    // 🟢 2. Unified Realtime Responses Stream
    useEffect(() => {
        const roomId = activeRoomId || effectiveRoomId;
        if (!isDigitalMode || !roomId) return;

        const fetchInitial = async () => {
            const { data } = await supabase.from('responses').select('*').eq('room_id', roomId);
            if (data) setLiveResponses(data);
        };
        fetchInitial();

        const channel = supabase.channel(`live_feed_${roomId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'responses', filter: `room_id=eq.${roomId}` }, 
                payload => setLiveResponses(prev => [...prev, payload.new]))
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'responses', filter: `room_id=eq.${roomId}` }, 
                payload => setLiveResponses(prev => prev.map(r => r.id === payload.new.id ? payload.new : r)))
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [isDigitalMode, activeRoomId, effectiveRoomId]);

    // 🟢 3. Unified Broadcast Helper
    const broadcast = async (activeQuestionData) => {
        const roomId = activeRoomId || effectiveRoomId;
        if (!isDigitalMode || !roomId) return;
        await broadcastRoomQuestionState({ roomId, activeQuestionData });
    };

    // 🟢 4. Guaranteed Teardown Helper
    const closeRoom = async (confirmMessage = "Vill du avsluta live-rummet för eleverna?") => {
        const roomId = activeRoomId || effectiveRoomId || roomIdRef.current;
        if (effectiveLiveHost && roomId) {
            if (window.confirm(confirmMessage)) {
                await closeActiveRoom(roomId);
                setActiveRoomId(null);
                setActiveClassCode('');
            }
        }
        if (onClose) onClose();
    };

    return {
        session: effectiveSession,
        roomId: activeRoomId || effectiveRoomId,
        classCode: activeClassCode || effectiveClassCode,
        isLive: isDigitalMode,
        isLiveHost: effectiveLiveHost,
        liveResponses,
        setLiveResponses,
        broadcast,
        closeRoom
    };
}


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