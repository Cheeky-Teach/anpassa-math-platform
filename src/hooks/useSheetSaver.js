// src/hooks/useSheetSaver.js
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useSheetSaver({
    sheetId,
    setSheetId,
    title,
    setTitle,
    lang = 'sv',
    buildPayload,
    onSaveSuccess
}) {
    const [isSaving, setIsSaving] = useState(false);
    const [showSaveChoiceModal, setShowSaveChoiceModal] = useState(false);

    const executeSave = async ({ forceNewCopy = false, silent = false } = {}) => {
        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const defaultTitle = lang === 'sv' ? "Namnlöst arbete" : "Untitled Work";
            let targetTitle = (title || '').trim() || defaultTitle;
            const copyTag = lang === 'sv' ? '(Kopia)' : '(Copy)';

            if (forceNewCopy && !targetTitle.includes(copyTag)) {
                targetTitle = `${targetTitle} ${copyTag}`;
                setTitle?.(targetTitle);
            }

            const payload = buildPayload({
                userId: user.id,
                finalTitle: targetTitle
            });

            let res;
            if (sheetId && !forceNewCopy) {
                res = await supabase
                    .from('saved_sheets')
                    .update(payload)
                    .eq('id', sheetId)
                    .select()
                    .single();
            } else {
                res = await supabase
                    .from('saved_sheets')
                    .insert([payload])
                    .select()
                    .single();
            }

            if (res.error) throw res.error;

            setSheetId(res.data.id);
            await onSaveSuccess?.(res.data, { forceNewCopy, silent });

            if (!silent) {
                alert(
                    forceNewCopy || !sheetId
                        ? (lang === 'sv' ? "En ny kopia har sparats!" : "Saved as a new copy!")
                        : (lang === 'sv' ? "Ändringarna har sparats!" : "Changes saved!")
                );
            }

            return res.data.id;
        } catch (err) {
            console.error("Save Error:", err);
            if (!silent) {
                alert(lang === 'sv' ? "Kunde inte spara." : "Failed to save.");
            }
            return null;
        } finally {
            setIsSaving(false);
        }
    };

    const triggerSave = async ({ silent = false } = {}) => {
        if (sheetId && !silent) {
            setShowSaveChoiceModal(true);
            return sheetId;
        }
        return await executeSave({ forceNewCopy: false, silent });
    };

    return {
        isSaving,
        setIsSaving,
        showSaveChoiceModal,
        setShowSaveChoiceModal,
        executeSave,
        triggerSave
    };
}