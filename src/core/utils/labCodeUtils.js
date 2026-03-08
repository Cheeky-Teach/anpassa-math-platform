/**
 * LAB CODE UTILITIES
 * Handles serverless encoding/decoding of Practice Lab configurations.
 */

// 1. CANONICAL TOPIC INDEX
// This list MUST remain in this exact order to ensure codes are valid forever.
// It maps the Topic IDs used in api/batch.ts and api/question.ts to a 2-digit index.
export const TOPIC_INDEX = [
    'arithmetic',           // 00
    'order_of_operations',  // 01
    'fraction_basics',      // 02
    'fraction_arith',       // 03
    'negative',             // 04
    'ten_powers',           // 05
    'exponents',            // 06
    'percent',              // 07
    'expressions',          // 08
    'equations',            // 09
    'equations_word',       // 10
    'patterns',             // 11
    'graphs',               // 12
    'geometry',             // 13
    'scale',                // 14
    'volume',               // 15
    'similarity',           // 16
    'pythagoras',           // 17
    'angles',               // 18
    'probability',          // 19
    'statistics',           // 20
    'change_factor'         // 21
];

// 2. NATIONAL TEST BUNDLE PRESETS
// These are hardcoded < 10 character codes for curriculum categories.
export const BUNDLE_PRESETS = {
    'NPTS': { category: 'arithmetic', title: 'NP: Taluppfattning' }, //
    'NPAL': { category: 'algebra', title: 'NP: Algebra & Mönster' },  //
    'NPGE': { category: 'geometry', title: 'NP: Geometri' },          //
    'NPDA': { category: 'statistics', title: 'NP: Sannolikhet & Data' } //
};

/**
 * Encodes a config object into a short string.
 * Format: [indices]_[maxLevel][mode][limit]
 */
export const encodeConfig = (config) => {
    const { meta, selection } = config;

    // Check if it's a National Test preset
    if (meta.isNationalTest && meta.bundleId) {
        return `${meta.bundleId}_${meta.globalMaxLevel}${meta.mode === 'exam' ? 'E' : 'P'}${meta.limit}`;
    }

    // Build topic indices (2-digit per topic)
    const indices = Object.keys(selection)
        .filter(topicId => selection[topicId].enabled)
        .map(topicId => {
            const idx = TOPIC_INDEX.indexOf(topicId);
            return idx !== -1 ? idx.toString().padStart(2, '0') : null;
        })
        .filter(Boolean)
        .join('');

    // Suffix: maxLevel (1-9), Mode (E/P), Limit (0-50)
    const modeChar = meta.mode === 'exam' ? 'E' : 'P';
    return `${indices}_${meta.globalMaxLevel}${modeChar}${meta.limit}`;
};

/**
 * Decodes a short string back into a full config object.
 */
export const decodeConfig = (code) => {
    if (!code) return null;

    try {
        const [topicPart, settingsPart] = code.split('_');
        
        // Initial Meta Setup
        const meta = {
            mode: settingsPart.includes('E') ? 'exam' : 'practice',
            limit: parseInt(settingsPart.slice(2)) || 50,
            globalMaxLevel: parseInt(settingsPart[0]) || 9,
            isNationalTest: false,
            bundleId: null
        };

        const selection = {};

        // Handle Presets (e.g., NPAL)
        if (BUNDLE_PRESETS[topicPart]) {
            meta.isNationalTest = true;
            meta.bundleId = topicPart;
            // Preset enables all topics in that curriculum category
            // This logic will be handled by the View to ensure accuracy.
        } else {
            // Handle Custom (e.g., 0911)
            // Split string into 2-digit chunks
            for (let i = 0; i < topicPart.length; i += 2) {
                const idx = parseInt(topicPart.slice(i, i + 2));
                const topicId = TOPIC_INDEX[idx];
                if (topicId) {
                    selection[topicId] = { enabled: true, min: 1, max: meta.globalMaxLevel };
                }
            }
        }

        return { meta, selection };
    } catch (e) {
        console.error("Lab Code Decoding Error:", e);
        return null;
    }
};