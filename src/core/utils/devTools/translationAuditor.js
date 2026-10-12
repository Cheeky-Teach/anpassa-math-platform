import { CATEGORIES, LEVEL_DESCRIPTIONS } from '../../../constants/localization';

export const runTranslationAudit = () => {
    const issues = [];
    let totalChecked = 0;

    const getVars = (str) => [...(str.match(/\{[^}]+\}/g) || [])].sort().join(',');

    Object.entries(CATEGORIES).forEach(([catKey, cat]) => {
        totalChecked++;
        if (!cat.label?.sv || !cat.label?.en) {
            issues.push({ type: 'Category', id: catKey, issue: 'Missing SV or EN label', sv: cat.label?.sv, en: cat.label?.en });
        }

        (cat.topics || []).forEach(topic => {
            totalChecked++;
            if (!topic.label?.sv || !topic.label?.en) {
                issues.push({ type: 'Topic', id: topic.id, issue: 'Missing SV or EN label', sv: topic.label?.sv, en: topic.label?.en });
            }

            const levels = LEVEL_DESCRIPTIONS[topic.id];
            if (levels) {
                Object.entries(levels).forEach(([lvl, desc]) => {
                    totalChecked++;
                    const sv = desc?.sv || "";
                    const en = desc?.en || "";
                    
                    if (!sv || !en) {
                        issues.push({ type: `Level Desc (${topic.id} L${lvl})`, id: `${topic.id}_L${lvl}`, issue: 'Missing translation', sv, en });
                    } else {
                        const svVars = getVars(sv);
                        const enVars = getVars(en);
                        if (svVars !== enVars) {
                            issues.push({ type: `Level Desc (${topic.id} L${lvl})`, id: `${topic.id}_L${lvl}`, issue: 'Variable mismatch', sv, en });
                        }
                    }
                });
            }
        });
    });

    return { issues, totalChecked };
};