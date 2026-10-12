// src/core/utils/devTools/useProgressData.js
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { aggregateProgress } from './progressAggregator';

export function useProgressData(filters) {
    const [rawLogs, setRawLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            // Directly query the progress_logs table created for telemetry
            const { data, error: qErr } = await supabase
                .from('telemetry_events')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(2000); // Pulls the latest 2,000 progress events

            if (qErr) throw qErr;
            setRawLogs(data || []);
        } catch (err) {
            console.error('Failed to fetch progress logs from Supabase:', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    // Aggregates raw logs entirely on the client side using our aggregator engine
    const aggregated = useMemo(() => {
        return aggregateProgress(rawLogs, filters);
    }, [rawLogs, filters]);

    return { aggregated, loading, error, refetch: fetchLogs };
}