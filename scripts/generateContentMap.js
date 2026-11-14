// scripts/generateContentMap.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import your metadata sources directly
import { SKILL_BUCKETS } from '../src/constants/skillBuckets.js';
import { CATEGORIES, LEVEL_DESCRIPTIONS } from '../src/constants/localization.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = 'http://localhost:5173/api/question'; // Ensure your local dev server is running!

// Map SKILL_BUCKETS top-level keys to localization CATEGORIES keys where they differ
const CATEGORY_KEY_MAP = {
    geometry_cat: 'geometry',
    data: 'statistics'
};

// Cross-domain & foundational curriculum bridges (keeps skillBuckets.js untouched)
// Format: "targetTopic:targetLevel": ["prereqTopic:prereqLevel", ...]
const CURRICULUM_BRIDGES = {
    // Arithmetic internal & cross-topic flows
    "order_of_operations:1": ["basic_arithmetic:4", "basic_arithmetic:7"],
    "order_of_operations:4": ["exponents:1"],
    "negatives:1": ["basic_arithmetic:2"],
    "fractions_basics:1": ["basic_arithmetic:7"],
    "fraction_arith:1": ["fractions_basics:4"],
    "fraction_arith:2": ["fractions_basics:4"],
    "fraction_arith:3": ["fractions_basics:3"],
    "fraction_arith:6": ["negatives:1", "fraction_arith:1"],
    "fraction_arith:7": ["order_of_operations:1", "fraction_arith:4"],
    "fraction_arith:8": ["exponents:1", "fraction_arith:6"],
    "ten_powers:1": ["place_value:2", "basic_arithmetic:6"],
    "exponents:1": ["basic_arithmetic:4"],
    "exponents:2": ["ten_powers:1"],
    "exponents:3": ["ten_powers:3", "exponents:2"],
    "percent:1": ["fractions_basics:5", "place_value:2"],
    "percent:2": ["basic_arithmetic:7"],
    "change_factor:1": ["percent:5", "basic_arithmetic:6"],
    "change_factor:5": ["exponents:1", "change_factor:4"],

    // Algebra bridges
    "expressions:1": ["basic_arithmetic:1", "negatives:1"],
    "expressions:2": ["order_of_operations:1", "expressions:1"],
    "expressions:3": ["basic_arithmetic:5", "expressions:1"],
    "expressions:5": ["negatives:2", "expressions:3"],
    "equations:1": ["basic_arithmetic:1", "negatives:1"],
    "equations:2": ["equations:1", "order_of_operations:1"],
    "equations:3": ["expressions:3", "equations:2"],
    "equations:4": ["expressions:1", "equations:2"],
    "equations_word:1": ["equations:2"],
    "patterns:2": ["expressions:1"],
    "patterns:3": ["expressions:1", "patterns:2"],
    "patterns:5": ["equations:2", "patterns:4"],
    "algebraic_geometry:1": ["expressions:1", "geometry:1"],
    "algebraic_geometry:2": ["equations:2", "algebraic_geometry:1"],
    "algebraic_geometry:3": ["expressions:2", "geometry:2"],
    "algebraic_geometry:4": ["equations:2", "algebraic_geometry:3"],
    "algebraic_geometry:5": ["expressions:1", "angles:2"],
    "algebraic_geometry:6": ["equations:2", "angles:2"],
    "graphs:1": ["negatives:1"],
    "graphs:2": ["negatives:4", "fraction_arith:1"],
    "graphs:3": ["patterns:4", "graphs:2"],
    "graphs:4": ["graphs:1", "graphs:2"],

    // Geometry bridges
    "unit_conversion:1": ["ten_powers:1"],
    "geometry:1": ["basic_arithmetic:1"],
    "geometry:2": ["basic_arithmetic:4", "geometry:1"],
    "geometry:3": ["basic_arithmetic:7", "geometry:2"],
    "geometry:5": ["basic_arithmetic:6", "exponents:1"],
    "scale:1": ["unit_conversion:1", "basic_arithmetic:4"],
    "scale:2": ["unit_conversion:1", "scale:1"],
    "scale:4": ["fraction_arith:1", "scale:2"],
    "scale:5": ["similarity:2"],
    "scale:6": ["similarity:3"],
    "scale:7": ["exponents:1", "geometry:2", "scale:5"],
    "scale:8": ["exponents:1", "volume:1", "scale:7"],
    "volume:1": ["geometry:2", "basic_arithmetic:5"],
    "volume:2": ["geometry:3", "volume:1"],
    "volume:3": ["geometry:5", "volume:1"],
    "volume:7": ["unit_conversion:3", "volume:1"],
    "volume:8": ["geometry:2", "geometry:5", "volume:3"],
    "similarity:1": ["fraction_arith:1", "geometry:2"],
    "similarity:2": ["equations:1", "similarity:1"],
    "pythagoras:1": ["exponents:1", "geometry:3"],
    "pythagoras:2": ["exponents:4", "pythagoras:1"],
    "pythagoras:3": ["equations:1", "pythagoras:2"],
    "pythagoras:5": ["negatives:2", "graphs:1", "pythagoras:2"],

    // Data, Statistics & Probability bridges
    "statistics:2": ["basic_arithmetic:1", "basic_arithmetic:7"],
    "statistics:4": ["equations:1", "statistics:2"],
    "statistics:6": ["percent:3", "statistics:2"],
    "probability:1": ["fractions_basics:1", "fractions_basics:4"],
    "probability:2": ["fractions_basics:5", "percent:1"],
    "probability:4": ["percent:1", "fraction_arith:1"],
    "probability:5": ["basic_arithmetic:4"],
    "probability:6": ["fraction_arith:4", "probability:5"],
    "probability:7": ["fraction_arith:4", "probability:6"]
};

function buildSkillGraph(generatedMap) {
    const nodes = {};
    const searchIndex = [];

    // 1. Register every topic & level node
    for (const cat of generatedMap) {
        const normalizedCatId = CATEGORY_KEY_MAP[cat.id] || cat.id;
        const locCat = CATEGORIES[normalizedCatId];

        for (const topic of cat.topics) {
            const levelNumbers = new Set([
                ...topic.levels.map(l => Number(l.lvl)),
                ...Object.keys(LEVEL_DESCRIPTIONS[topic.id] || {}).map(Number)
            ]);

            const sortedLevels = Array.from(levelNumbers).filter(n => !isNaN(n)).sort((a, b) => a - b);

            for (const lvl of sortedLevels) {
                const nodeId = `${topic.id}:${lvl}`;
                const levelObj = topic.levels.find(l => Number(l.lvl) === lvl);
                const descObj = LEVEL_DESCRIPTIONS[topic.id]?.[lvl] || levelObj?.student_desc || { sv: `Nivå ${lvl}`, en: `Level ${lvl}` };
                const topicLabel = topic.label || topic.name || { sv: topic.id, en: topic.id };

                // Auto-infer intra-topic staircase prerequisite (level - 1)
                const prereqSet = new Set();
                const prevLvl = sortedLevels.filter(l => l < lvl).pop();
                if (prevLvl) {
                    prereqSet.add(`${topic.id}:${prevLvl}`);
                }

                // Add explicit cross-domain & heuristic curriculum bridges
                if (CURRICULUM_BRIDGES[nodeId]) {
                    for (const bridgeId of CURRICULUM_BRIDGES[nodeId]) {
                        prereqSet.add(bridgeId);
                    }
                }
                const rawDesc = LEVEL_DESCRIPTIONS[topic.id]?.[lvl] || levelObj?.student_desc || { sv: `Nivå ${lvl}`, en: `Level ${lvl}` };
                const normalizedDesc = typeof rawDesc === 'object' && rawDesc.sv && typeof rawDesc.sv === 'object'
                    ? rawDesc.sv
                    : (typeof rawDesc === 'object' ? rawDesc : { sv: rawDesc, en: rawDesc });

                // Fallback to nearest lower level's variation key for mixed/recap levels (e.g., equations:7)
                const fallbackLevelObj = levelObj || [...topic.levels].reverse().find(l => Number(l.lvl) < lvl && l.variations?.length);

                nodes[nodeId] = {
                    id: nodeId,
                    topicId: topic.id,
                    level: lvl,
                    category: normalizedCatId,
                    color: locCat?.color || cat.color || 'indigo',
                    topicLabel,
                    levelDesc: normalizedDesc,
                    example: levelObj?.ex || fallbackLevelObj?.ex || "",
                    sampleVariationKey: levelObj?.variations?.[0]?.key || fallbackLevelObj?.variations?.[0]?.key || null,
                    prerequisites: Array.from(prereqSet),
                    unlocks: []
                };

                searchIndex.push({
                    id: nodeId,
                    topicId: topic.id,
                    level: lvl,
                    category: normalizedCatId,
                    categoryLabel: locCat?.label || cat.title,
                    topicLabel,
                    levelDesc: nodes[nodeId].levelDesc,
                    example: nodes[nodeId].example,
                    keywords: [
                        topic.id,
                        topicLabel.sv,
                        topicLabel.en,
                        nodes[nodeId].levelDesc.sv,
                        nodes[nodeId].levelDesc.en,
                        `nivå ${lvl}`,
                        `level ${lvl}`
                    ].filter(Boolean).join(' ').toLowerCase()
                });
            }
        }
    }

    // 2. Filter out any dangling prerequisite references & populate reverse `unlocks` edges
    for (const node of Object.values(nodes)) {
        node.prerequisites = node.prerequisites.filter(prereqId => Boolean(nodes[prereqId]));
        for (const prereqId of node.prerequisites) {
            if (!nodes[prereqId].unlocks.includes(node.id)) {
                nodes[prereqId].unlocks.push(node.id);
            }
        }
    }

    // 3. Compute topological depth tier for visual layout on the Begreppskarta
    const memoTier = {};
    const getTier = (nodeId, visiting = new Set()) => {
        if (memoTier[nodeId] !== undefined) return memoTier[nodeId];
        if (visiting.has(nodeId)) return 0; // Guard against cycles
        visiting.add(nodeId);

        const node = nodes[nodeId];
        if (!node || node.prerequisites.length === 0) {
            memoTier[nodeId] = 0;
            return 0;
        }

        const maxPrereqTier = Math.max(...node.prerequisites.map(pId => getTier(pId, new Set(visiting))));
        memoTier[nodeId] = maxPrereqTier + 1;
        return memoTier[nodeId];
    };

    for (const nodeId of Object.keys(nodes)) {
        nodes[nodeId].tier = getTier(nodeId);
    }

    return { nodes, searchIndex };
}

async function generateContentMap() {
    console.log("🚀 Starting Content Map & Begreppskarta generation script...");

    const generatedMap = [];

    for (const [categoryId, categoryData] of Object.entries(SKILL_BUCKETS)) {
        const normalizedCatId = CATEGORY_KEY_MAP[categoryId] || categoryId;
        const localizationData = CATEGORIES[normalizedCatId] || CATEGORIES[categoryId];
        const categoryObj = {
            id: categoryId,
            category: normalizedCatId,
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
                const filterPattern = /(^|_)(concept|theory|foundations|begrepp|mcq|choice|spot|lie)(_|$)/;
                const isConceptOrMCQ = filterPattern.test(k);
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
                label: localizationData?.topics?.find(t => t.id === topicId)?.label || topicData.name,
                levels: levelsArray
            });
        }

        generatedMap.push(categoryObj);
    }

    // 1. Write static content map
    const contentMapFile = `/**
 * AUTO-GENERATED CONTENT MAP (Static Snapshot with Live Examples)
 * Generated on: ${new Date().toISOString()}
 */
export const CONTENT_MAP = ${JSON.stringify(generatedMap, null, 4)};
`;
    const contentMapPath = path.join(__dirname, '../src/constants/content_map.generated.js');
    fs.writeFileSync(contentMapPath, contentMapFile, 'utf8');
    console.log(`✅ Successfully generated static content map at: ${contentMapPath}`);

    // 2. Build & write Begreppskarta skill graph
    const { nodes, searchIndex } = buildSkillGraph(generatedMap);
    const skillGraphFile = `/**
 * AUTO-GENERATED BEGREPPSKARTA / CONCEPT MAP GRAPH
 * Generated on: ${new Date().toISOString()}
 * Do not edit manually — generated via scripts/generateContentMap.js
 */
export const SKILL_GRAPH = ${JSON.stringify(nodes, null, 4)};

export const CONCEPT_SEARCH_INDEX = ${JSON.stringify(searchIndex, null, 4)};

/**
 * Returns the ordered prerequisite chain (upstream -> target) for a given topic & level.
 * Ideal for TeacherHubManager "Auto-Fill Prerequisites" and student detour routing.
 */
export function getPrerequisiteChain(topicId, level, maxDepth = 4) {
    const targetId = \`\${topicId}:\${level}\`;
    const visited = new Set();
    const ordered = [];

    function visit(nodeId, depth) {
        if (!SKILL_GRAPH[nodeId] || visited.has(nodeId) || depth > maxDepth) return;
        visited.add(nodeId);
        for (const prereqId of SKILL_GRAPH[nodeId].prerequisites) {
            visit(prereqId, depth + 1);
        }
        ordered.push(SKILL_GRAPH[nodeId]);
    }

    visit(targetId, 0);
    return ordered;
}
`;
    const skillGraphPath = path.join(__dirname, '../src/constants/skillGraph.js');
    fs.writeFileSync(skillGraphPath, skillGraphFile, 'utf8');
    console.log(`✅ Successfully generated Begreppskarta skill graph (${Object.keys(nodes).length} nodes) at: ${skillGraphPath}`);
}

generateContentMap();