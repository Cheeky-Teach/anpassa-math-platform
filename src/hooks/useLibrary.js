import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useLibrary(profile = null, lang = 'sv') {
    const [savedSheets, setSavedSheets] = useState([]);
    const [folders, setFolders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [libraryTab, setLibraryTab] = useState('private'); // 'private' | 'school' | 'public'
    const [isTrashView, setIsTrashView] = useState(false);

    const fetchLibrary = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setIsLoading(true);
        try {
            if (libraryTab === 'private' && !isTrashView) {
                const { data: folderData, error: folderError } = await supabase
                    .from('folders')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('name');
                if (!folderError) setFolders(folderData || []);
            } else {
                setFolders([]);
            }

            let query = supabase.from('saved_sheets').select('*').order('updated_at', { ascending: false });

            if (libraryTab === 'private') {
                query = query.eq('user_id', user.id);
                if (isTrashView) query = query.not('deleted_at', 'is', null);
                else query = query.is('deleted_at', null);
            } else if (libraryTab === 'school') {
                query = query.eq('visibility', 'school').eq('school_name', profile?.school_name).is('deleted_at', null);
            } else {
                query = query.eq('visibility', 'public').is('deleted_at', null);
            }

            const { data, error } = await query;
            if (error) throw error;
            setSavedSheets(data || []);
        } catch (err) {
            console.error("Library fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [libraryTab, isTrashView, profile?.school_name]);

    useEffect(() => {
        fetchLibrary();
    }, [fetchLibrary]);

    const createFolder = async (name) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !name.trim()) return;
        const { error } = await supabase.from('folders').insert([{ user_id: user.id, name: name.trim() }]);
        if (error) throw error;
        await fetchLibrary();
    };

    const renameFolder = async (folderId, newName) => {
        if (!folderId || !newName.trim()) return;
        const { error } = await supabase.from('folders').update({ name: newName.trim() }).eq('id', folderId);
        if (error) throw error;
        await fetchLibrary();
    };

    const deleteFolder = async (folderId) => {
        const { error } = await supabase.from('folders').delete().eq('id', folderId);
        if (error) throw error;
        await fetchLibrary();
    };

    const moveSheet = async (sheetId, targetFolderId) => {
        const { error } = await supabase.from('saved_sheets').update({ folder_id: targetFolderId }).eq('id', sheetId);
        if (error) throw error;
        await fetchLibrary();
    };

    const softDeleteSheet = async (sheetId) => {
        const { error } = await supabase.from('saved_sheets').update({ deleted_at: new Date().toISOString() }).eq('id', sheetId);
        if (error) throw error;
        await fetchLibrary();
    };

    const restoreSheet = async (sheetId) => {
        const { error } = await supabase.from('saved_sheets').update({ deleted_at: null }).eq('id', sheetId);
        if (error) throw error;
        await fetchLibrary();
    };

    const hardDeleteSheet = async (sheetId) => {
        const { error } = await supabase.from('saved_sheets').delete().eq('id', sheetId);
        if (error) throw error;
        await fetchLibrary();
    };

    const duplicateSheet = async (sheet) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const copyPrefix = lang === 'sv' ? "Kopia av " : "Copy of ";
        const duplicatePayload = {
            title: `${copyPrefix}${sheet.title || (lang === 'sv' ? "Namnlöst arbete" : "Untitled Work")}`,
            type: sheet.type,
            user_id: user.id,
            visibility: 'private',
            school_name: profile?.school_name?.trim() || null,
            school_id: profile?.school_id || null,
            packet: sheet.packet,
            config: sheet.config || {},
            auto_topics: sheet.auto_topics || [],
            folder_id: sheet.folder_id || null
        };

        const { error } = await supabase.from('saved_sheets').insert([duplicatePayload]);
        if (error) throw error;
        await fetchLibrary();
    };

    const cloneSheet = async (sheetId) => {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.rpc('clone_worksheet', { target_id: sheetId, new_user_id: user.id });
        if (error) throw error;
        setLibraryTab('private');
        await fetchLibrary();
    };

    return {
        savedSheets,
        folders,
        isLoading,
        libraryTab,
        setLibraryTab,
        isTrashView,
        setIsTrashView,
        fetchLibrary,
        createFolder,
        renameFolder,
        deleteFolder,
        moveSheet,
        softDeleteSheet,
        restoreSheet,
        hardDeleteSheet,
        duplicateSheet,
        cloneSheet
    };
}