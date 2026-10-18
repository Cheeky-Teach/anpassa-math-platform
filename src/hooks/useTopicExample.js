// src/hooks/useTopicExample.js
import { useState, useEffect } from 'react';

export function useTopicExample(topicId, variationKey, lang = 'sv') {
    const [example, setExample] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!topicId || !variationKey) return;

        let isMounted = true;
        setLoading(true);

        fetch(`/api/question?topic=${topicId}&variation=${variationKey}&lang=${lang}&wordProblem=false`)
            .then(res => res.json())
            .then(data => {
                if (isMounted && data?.renderData) {
                    setExample(data.renderData);
                }
            })
            .catch(err => console.error("Failed to load topic example:", err))
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => { isMounted = false; };
    }, [topicId, variationKey, lang]);

    return { example, loading };
}