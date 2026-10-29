// src/components/activities/utils/activityQuestionUtils.js
import { supabase } from '../../../lib/supabaseClient';

/**
 * Universally regenerates an algorithmic question slot,
 * deletes prior student responses in Supabase to allow re-answering,
 * and stamps a unique `regenVersion` to reset student UI state.
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

    // 1. Wipe previous student responses from Supabase so students can answer anew
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

    // 2. Fetch fresh numbers from backend API
    const wpParam = Boolean(wordProblem);
    const varParam = variationKey ? `&variation=${variationKey}` : '';
    const url = `/api/question?topic=${topicId}${varParam}&lang=${lang}&wordProblem=${wpParam}`;

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to fetch fresh question: ${res.statusText}`);
    }
    const freshData = await res.json();

    // 3. Stamp fresh regenVersion to force student inputs to reset
    const newRegenVersion = Date.now();
    
    if (formatFn) {
        const formatted = formatFn(freshData, questionIndex);
        return {
            ...formatted,
            regenVersion: newRegenVersion
        };
    }

    return {
        ...freshData,
        regenVersion: newRegenVersion
    };
}

export async function closeActiveRoom(roomId) {
    if (!roomId) return { success: false, error: 'No roomId provided' };
    try {
        const { error } = await supabase
            .from('rooms')
            .update({
                status: 'closed', // 🟢 Matches your Supabase rooms schema
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