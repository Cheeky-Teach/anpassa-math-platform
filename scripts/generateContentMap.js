// scripts/generateContentMap.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import your metadata sources directly
import { SKILL_BUCKETS } from '../src/constants/skillBuckets.js';
import { CATEGORIES, LEVEL_DESCRIPTIONS } from '../src/constants/localization.js'; // Adjust path if needed

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = 'http://localhost:5173/api/question'; // Ensure your local dev server is running!

async function generateContentMap() {
    console.log("🚀 Starting Content Map generation script...");

    const generatedMap = [];

    for (const [categoryId, categoryData] of Object.entries(SKILL_BUCKETS)) {
        const localizationData = CATEGORIES[categoryId];
        const categoryObj = {
            id: categoryId,
            category: categoryId,
            title: localizationData ? localizationData.label : categoryData.name,
            color: localizationData ? localizationData.color : 'indigo',
            topics: []
        };

        for (const [topicId, topicData] of Object.entries(categoryData.topics)) {
            console.log(`📂 Processing topic: ${topicId}...`);
            const levelMap = {};

            for (const variation of topicData.variations) {
                const lvl = variation.level || 1;
                
                // Skip concept/theory/MCQ variations to stick strictly to calculate types
                const k = variation.key.toLowerCase();
                const isConceptOrMCQ = ['concept', 'theory', 'foundations', 'id', 'begrepp', 'lie', 'spot', 'choice', 'mcq'].some(kw => k.includes(kw));
                if (isConceptOrMCQ) continue;

                if (!levelMap[lvl]) {
                    let liveExampleLatex = "";
                    let liveExampleDesc = "";

                    // Fetch a live example from your local server API
                    try {
                        const url = `${API_BASE}?topic=${topicId}&variation=${variation.key}&lang=sv&wordProblem=false`;
                        const res = await fetch(url);
                        if (res.ok) {
                            const data = await res.json();
                            liveExampleLatex = data?.renderData?.latex ? `$$${data.renderData.latex}$$` : "";
                            liveExampleDesc = data?.renderData?.description?.sv || data?.renderData?.description || "";
                        }
                    } catch (err) {
                        console.warn(`⚠️ Could not fetch example for ${topicId} [lvl ${lvl}]: ${err.message}`);
                    }

                    levelMap[lvl] = {
                        lvl: lvl,
                        ex: liveExampleLatex || liveExampleDesc || variation.desc?.sv || variation.name?.sv || "Matematikuppgift",
                        desc: variation.name,
                        student_desc: LEVEL_DESCRIPTIONS[topicId]?.[lvl] || { sv: variation.name, en: variation.name },
                        teacher_desc: variation.desc,
                        variations: []
                    };
                }

                levelMap[lvl].variations.push({
                    key: variation.key,
                    name: variation.name,
                    desc: variation.desc
                });
            }

            const levelsArray = Object.values(levelMap).sort((a, b) => a.lvl - b.lvl);

            categoryObj.topics.push({
                id: topicId,
                name: topicData.name,
                label: topicData.name,
                levels: levelsArray
            });
        }

        generatedMap.push(categoryObj);
    }

    // Output the generated map as a static JS file
    const fileContent = `/**
 * AUTO-GENERATED CONTENT MAP (Static Snapshot with Live Examples)
 * Generated on: ${new Date().toISOString()}
 */
export const CONTENT_MAP = ${JSON.stringify(generatedMap, null, 4)};
`;

    const outputPath = path.join(__dirname, '../src/constants/content_map.generated.js');
    fs.writeFileSync(outputPath, fileContent, 'utf8');
    console.log(`✅ Successfully generated static content map at: ${outputPath}`);
}

generateContentMap();