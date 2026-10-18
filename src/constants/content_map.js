// src/constants/content_map.js
import { SKILL_BUCKETS } from './skillBuckets';
import { CATEGORIES, LEVEL_DESCRIPTIONS } from './localization';

/**
 * CONTENT_MAP (Pure Metadata Architecture — Zero Generator Imports)
 * Built dynamically from SKILL_BUCKETS and localization constants.
 */
export const CONTENT_MAP = Object.entries(SKILL_BUCKETS).map(([categoryId, categoryData]) => {
    const localizationData = CATEGORIES[categoryId];

    return {
        id: categoryId, 
        category: categoryId,
        title: localizationData ? localizationData.label : categoryData.name,
        color: localizationData ? localizationData.color : 'indigo',
        topics: Object.entries(categoryData.topics).map(([topicId, topicData]) => {
            
            const levelMap = {};
            topicData.variations.forEach(variation => {
                const lvl = variation.level || 1;
                
                // 1. Initialize the level entry
                if (!levelMap[lvl]) {
                    levelMap[lvl] = {
                        lvl: lvl,
                        ex: variation.desc?.sv || variation.name?.sv || "Matematikuppgift", 
                        desc: variation.name, 
                        student_desc: (LEVEL_DESCRIPTIONS[topicId] && LEVEL_DESCRIPTIONS[topicId][lvl]) 
                            ? LEVEL_DESCRIPTIONS[topicId][lvl] 
                            : { sv: variation.name, en: variation.name },
                        teacher_desc: variation.desc,
                        prerequisite: lvl > 1 ? { topic: topicId, level: lvl - 1 } : null,
                        variations: [] 
                    };
                }

                // 2. Register variation metadata without running generators
                levelMap[lvl].variations.push({
                    key: variation.key,
                    name: variation.name,
                    desc: variation.desc,
                    ex: variation.desc?.sv || variation.name?.sv || ""
                });
            });

            const levelsArray = Object.values(levelMap).sort((a, b) => a.lvl - b.lvl);

            return {
                id: topicId,
                name: topicData.name, 
                label: topicData.name,
                levels: levelsArray
            };
        })
    };
});