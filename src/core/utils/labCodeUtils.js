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
    'simplify',             // 08
    'equation',             // 09
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
    'NP-TAL': { category: 'arithmetic', title: 'Taluppfattning' },
    'NP-ALG': { category: 'algebra', title: 'Algebra & Mönster' },
    'NP-GEO': { category: 'geometry', title: 'Geometri' },
    'NP-STA': { category: 'statistics', title: 'Sannolikhet & Statistik' },
    'NP-ALL': { category: 'all', title: 'Alla områden' }
};


/**
 * Encodes a config object into a short string.
 * NEW Format: [Index(2)Mask(3)]_[maxLevel][mode][limit]
 */
export const encodeConfig = (config) => {
    const { meta, selection } = config;
    
    // If it's a pure, unmodified preset, keep the short readable code
    if (meta.isNationalTest && meta.bundleId) {
        return `${meta.bundleId}_${meta.globalMaxLevel}${meta.mode === 'exam' ? 'E' : 'P'}${meta.limit}`;
    }

    // Build custom string: Each topic gets a 5-char block
    const topicPart = Object.keys(selection)
        .filter(topicId => selection[topicId].enabled)
        .map(topicId => {
            const idx = TOPIC_INDEX.indexOf(topicId);
            if (idx === -1) return null;
            
            // 1. Generate bitmask for levels 1-9
            // Level 1 = 2^0, Level 2 = 2^1... Level 9 = 2^8
            const levels = selection[topicId].levels || [];
            const mask = levels.reduce((acc, lvl) => acc + Math.pow(2, lvl - 1), 0);
            
            // 2. Format: 2-digit Index + 3-digit Hex Mask (max 511 is '1ff')
            return idx.toString().padStart(2, '0') + mask.toString(16).padStart(3, '0');
        })
        .filter(Boolean)
        .join('');

    const modeChar = meta.mode === 'exam' ? 'E' : 'P';
    return `${topicPart}_${meta.globalMaxLevel}${modeChar}${meta.limit}`;
};

/**
 * Decodes a string back into a config object with individual levels.
 */
export const decodeConfig = (code) => {
    if (!code) return null;
    try {
        const [topicPart, settingsPart] = code.split('_');
        
        const meta = {
            mode: settingsPart.includes('E') ? 'exam' : 'practice',
            limit: parseInt(settingsPart.slice(2)) || 0,
            globalMaxLevel: parseInt(settingsPart[0]) || 9,
            isNationalTest: false,
            bundleId: null
        };

        const selection = {};

        if (BUNDLE_PRESETS[topicPart]) {
            meta.isNationalTest = true;
            meta.bundleId = topicPart;
        } else {
            // Process 5-character blocks: Index(2) + Mask(3)
            for (let i = 0; i < topicPart.length; i += 5) {
                const topicIdx = parseInt(topicPart.slice(i, i + 2));
                const hexMask = topicPart.slice(i + 2, i + 5);
                const topicId = TOPIC_INDEX[topicIdx];
                
                if (topicId) {
                    const mask = parseInt(hexMask, 16);
                    const selectedLevels = [];
                    // Check bits 0 through 8 (Levels 1-9)
                    for (let bit = 0; bit < 9; bit++) {
                        if ((mask >> bit) & 1) {
                            selectedLevels.push(bit + 1);
                        }
                    }
                    selection[topicId] = { enabled: true, levels: selectedLevels };
                }
            }
        }
        return { meta, selection };
    } catch (e) {
        console.error("Decoding Error:", e);
        return null;
    }
};