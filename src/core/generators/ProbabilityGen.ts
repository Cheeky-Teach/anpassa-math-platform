import { MathUtils } from '../utils/MathUtils.js';

export class ProbabilityGen {
    // --- CONTEXT LIBRARY (Restored & Expanded to 16 Scenarios) ---
    private static readonly SCENARIOS = {
        containers: [
            { sv: "en påse", en: "a bag" },
            { sv: "en ask", en: "a box" },
            { sv: "en burk", en: "a jar" },
            { sv: "en skål", en: "a bowl" },
            { sv: "en grupp", en: "a group" },
            { sv: "en låda", en: "a crate" }
        ],
        // 16 Scenarios for Level 5 and 6
        chainScenarios: [
            { container: { sv: "en påse", en: "a bag" }, items: [{ sv: ["röd kula", "röda kulor"], en: ["red marble", "red marbles"] }, { sv: ["blå kula", "blåa kulor"], en: ["blue marble", "blue marbles"] }] },
            { container: { sv: "en klass", en: "a class" }, items: [{ sv: ["pojke", "pojkar"], en: ["boy", "boys"] }, { sv: ["flicka", "flickor"], en: ["girl", "girls"] }] },
            { container: { sv: "en skål", en: "a bowl" }, items: [{ sv: ["äpple", "äpplen"], en: ["apple", "apples"] }, { sv: ["päron", "päron"], en: ["pear", "pears"] }] },
            { container: { sv: "en låda", en: "a box" }, items: [{ sv: ["vit strumpa", "vita strumpor"], en: ["white sock", "white socks"] }, { sv: ["svart strumpa", "svarta strumpor"], en: ["black sock", "black socks"] }] },
            { container: { sv: "en hylla", en: "a shelf" }, items: [{ sv: ["mattebok", "matteböcker"], en: ["math book", "math books"] }, { sv: ["deckare", "deckare"], en: ["mystery book", "mystery books"] }] },
            { container: { sv: "en burk", en: "a jar" }, items: [{ sv: ["chokladkaka", "chokladkakor"], en: ["chocolate cookie", "chocolate cookies"] }, { sv: ["havrekaka", "havrekakor"], en: ["oatmeal cookie", "oatmeal cookies"] }] },
            { container: { sv: "ett lag", en: "a team" }, items: [{ sv: ["vänsterhänt spelare", "vänsterhänta spelare"], en: ["left-handed player", "left-handed players"] }, { sv: ["högerhänt spelare", "högerhänta spelare"], en: ["right-handed player", "right-handed players"] }] },
            { container: { sv: "en buss", en: "a bus" }, items: [{ sv: ["person med hatt", "personer med hatt"], en: ["person with a hat", "people with hats"] }, { sv: ["person utan hatt", "personer utan hatt"], en: ["person without a hat", "people without hats"] }] },
            { container: { sv: "en vas", en: "a vase" }, items: [{ sv: ["tulpan", "tulpaner"], en: ["tulip", "tulips"] }, { sv: ["ros", "rosor"], en: ["rose", "roses"] }] },
            { container: { sv: "en verktygslåda", en: "a toolbox" }, items: [{ sv: ["skruvmejsel", "skruvmejslar"], en: ["screwdriver", "screwdrivers"] }, { sv: ["hammare", "hammare"], en: ["hammer", "hammers"] }] },
            { container: { sv: "ett förråd", en: "a storage" }, items: [{ sv: ["fungerande lampa", "fungerande lampor"], en: ["working bulb", "working bulbs"] }, { sv: ["trasig lampa", "trasiga lampor"], en: ["broken bulb", "broken bulbs"] }] },
            { container: { sv: "en kortlek", en: "a deck" }, items: [{ sv: ["hjärterkort", "hjärterkort"], en: ["heart card", "heart cards"] }, { sv: ["spaderkort", "spaderkort"], en: ["spade card", "spade cards"] }] },
            { container: { sv: "en kennel", en: "a kennel" }, items: [{ sv: ["hund", "hundar"], en: ["dog", "dogs"] }, { sv: ["katt", "katter"], en: ["cat", "cats"] }] },
            { container: { sv: "en trädgård", en: "a garden" }, items: [{ sv: ["ek", "ekar"], en: ["oak tree", "oak trees"] }, { sv: ["tall", "tallar"], en: ["pine tree", "pine trees"] }] },
            { container: { sv: "en butik", en: "a store" }, items: [{ sv: ["iPhone", "iPhones"], en: ["iPhone", "iPhones"] }, { sv: ["Android-telefon", "Android-telefoner"], en: ["Android phone", "Android phones"] }] },
            { container: { sv: "en parkering", en: "a parking lot" }, items: [{ sv: ["elbil", "elbilar"], en: ["electric car", "electric cars"] }, { sv: ["bensinbil", "bensinbilar"], en: ["petrol car", "petrol cars"] }] }
        ],
        items: [
            { sv: ["röda", "blåa", "gröna"], en: ["red", "blue", "green"], type: "marbles" },
            { sv: ["sura", "söta", "starka"], en: ["sour", "sweet", "spicy"], type: "candies" },
            { sv: ["äpplen", "bananer", "päron"], en: ["apples", "bananas", "pears"], type: "fruits" }
        ],
        lotteries: [
            { sv: "Lotteri A", en: "Lottery A" },
            { sv: "Lotteri B", en: "Lottery B" },
            { sv: "Hjul X", en: "Spinner X" },
            { sv: "Hjul Y", en: "Spinner Y" }
        ],
        likelihood: [
            { category: 'impossible', sv: ["att slå en 7:a med en vanlig tärning", "att en triangel har 4 hörn"], en: ["rolling a 7 on a standard die", "a triangle having 4 corners"], val: 0 },
            { category: 'certain', sv: ["att det blir natt efter dag", "att få krona eller klave vid ett myntkast"], en: ["night following day", "getting heads or tails on a coin flip"], val: 1 },
            { category: 'even', sv: ["att få krona vid slantsingling", "att slå ett jämnt tal med en tärning"], en: ["getting heads on a coin toss", "rolling an even number on a die"], val: 0.5 }
        ]
    };

    public generate(level: number, lang: string = 'sv', options: any = {}): any {
        if (level === 1 && options.hideConcept && options.exclude?.includes('visual_calc')) {
            return this.level2_StandardGroups(lang, undefined, options);
        }

        switch (level) {
            case 1: return this.level1_Visuals(lang, undefined, options);
            case 2: 
                const subType = Math.random() > 0.5 ? 'dice' : 'groups';
                return subType === 'dice' ? this.level2_Dice(lang, undefined, options) : this.level2_StandardGroups(lang, undefined, options);
            case 3: return this.level3_ConceptsAndLogic(lang, undefined, options);
            case 4: return this.level4_Complementary(lang, undefined, options);
            case 5: return this.level5_ProbabilityTree(lang, undefined, options);
            case 6: return this.level6_EventChains(lang, undefined, options);
            case 7: return this.level7_Combinatorics(lang, undefined, options);
            case 8: return this.level8_CombinatoricsComplex(lang, undefined, options);
            default: return this.level1_Visuals(lang, undefined, options);
        }
    }

    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'visual_not':
            case 'visual_or':
            case 'visual_calc':
            case 'visual_spinner':
                return this.level1_Visuals(lang, key);
            case 'group_ratio':
            case 'group_ternary':
                return this.level2_StandardGroups(lang, key);
            case 'dice_single':
            case 'dice_parity':
            case 'dice_range':
                return this.level2_Dice(lang, key);
            case 'concept_compare':
            case 'concept_validity':
            case 'concept_likelihood':
                return this.level3_ConceptsAndLogic(lang, key);
            case 'comp_at_least':
            case 'comp_multi':
            case 'comp_lie':
                return this.level4_Complementary(lang, key);
            case 'tree_missing':
            case 'tree_calc':
                return this.level5_ProbabilityTree(lang, key);
            case 'chain_any_order':
            case 'chain_fixed_order':
                return this.level6_EventChains(lang, key);
            case 'comb_constraint':
            case 'comb_handshake':
                return this.level7_Combinatorics(lang, key);
            case 'pathways_basic':
            case 'pathways_blocked':
            case 'pathways_prob':
                return this.level8_CombinatoricsComplex(lang, key);
            default:
                return this.generate(1, lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    private rawFraction(n: number, d: number): string {
        return `${n}/${d}`;
    }

    private getVariation(pool: {key: string, type: 'concept' | 'calculate'}[], options: any): string {
        let filtered = pool;
        if (options?.exclude) filtered = filtered.filter(v => !options.exclude.includes(v.key));
        if (options?.hideConcept) filtered = filtered.filter(v => v.type !== 'concept');
        if (filtered.length === 0) return pool[pool.length - 1].key;
        return MathUtils.randomChoice(filtered.map(v => v.key));
    }

    // --- LEVEL 1: VISUALS (Upgraded with 2-color variation) ---
    private level1_Visuals(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'calculate'}[] = [
            { key: 'visual_calc', type: 'calculate' },
            { key: 'visual_spinner', type: 'calculate' },
            { key: 'visual_not', type: 'calculate' },
            { key: 'visual_or', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool as any, options);
        const colorLabels = lang === 'sv' ? ["Röda", "Blåa", "Gröna"] : ["Red", "Blue", "Green"];

        if (v === 'visual_spinner' || v === 'visual_or') {
            const sections = MathUtils.randomChoice([8, 10, 12]);
            const winA = MathUtils.randomInt(1, Math.floor(sections / 3));
            const winB = MathUtils.randomInt(1, Math.floor(sections / 3));
            const isOr = v === 'visual_or';
            
            const favorable = isOr ? winA + winB : winA;
            const ans = this.rawFraction(favorable, sections);
            const targetText = isOr 
                ? (lang === 'sv' ? `${colorLabels[0].toLowerCase()} ELLER ${colorLabels[1].toLowerCase()}` : `${colorLabels[0].toLowerCase()} OR ${colorLabels[1].toLowerCase()}`)
                : (lang === 'sv' ? colorLabels[0].toLowerCase() : colorLabels[0].toLowerCase());

            return {
                renderData: {
                    description: lang === 'sv' ? `Ett lyckohjul har ${sections} delar. ${winA} är ${colorLabels[0].toLowerCase()} och ${winB} är ${colorLabels[1].toLowerCase()}. Vad är sannolikheten att stanna på ${targetText}?` : `A spinner has ${sections} sections. ${winA} are ${colorLabels[0].toLowerCase()} and ${winB} are ${colorLabels[1].toLowerCase()}. What is the probability of landing on ${targetText}?`,
                    answerType: 'fraction',
                    geometry: { type: 'probability_spinner', sections, counts: { red: winA, blue: winB } }
                },
                token: this.toBase64(ans), variationKey: v, clues: [
                    { text: lang === 'sv' ? "Steg 1: Sannolikheten beräknas som antalet gynnsamma utfall dividerat med totala antalet möjliga utfall." : "Step 1: Probability is calculated as the number of favorable outcomes divided by the total number of possible outcomes.", latex: `P = \\frac{\\text{gynnsamma}}{\\text{möjliga}}` },
                    { text: lang === 'sv' ? `Steg 2: Identifiera de gynnsamma utfallen (${targetText}).` : `Step 2: Identify the favorable outcomes (${targetText}).`, latex: isOr ? `${winA} + ${winB} = ${favorable}` : `${winA}` },
                    { text: lang === 'sv' ? `Steg 3: Ställ upp sannolikheten med totalen ${sections}.` : `Step 3: Set up the probability with the total ${sections}.`, latex: `\\frac{${favorable}}{${sections}}` },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
                ]
            };
        }

        const counts = [MathUtils.randomInt(2, 6), MathUtils.randomInt(2, 6), MathUtils.randomInt(2, 6)];
        const total = counts.reduce((a, b) => a + b, 0);
        const target = MathUtils.randomInt(0, 2);
        const isNot = v === 'visual_not';
        const favorable = isNot ? total - counts[target] : counts[target];
        const ans = this.rawFraction(favorable, total);

        return {
            renderData: {
                description: lang === 'sv' ? `Vad är sannolikheten att du ${isNot ? 'INTE' : ''} drar en ${colorLabels[target].toLowerCase()} kula?` : `What is the probability that you ${isNot ? 'NOT' : ''} pick a ${colorLabels[target].toLowerCase()} marble?`,
                answerType: 'fraction',
                geometry: { type: 'probability_marbles', items: { red: counts[0], blue: counts[1], green: counts[2] } }
            },
            token: this.toBase64(ans), variationKey: v, clues: [
                { text: lang === 'sv' ? "Steg 1: Beräkna det totala antalet möjliga utfall genom att addera alla kulor." : "Step 1: Calculate the total number of possible outcomes by adding all marbles.", latex: `${counts[0]} + ${counts[1]} + ${counts[2]} = ${total}` },
                { text: lang === 'sv' ? `Steg 2: Hitta antalet gynnsamma utfall (${isNot ? 'inte ' : ''}${colorLabels[target].toLowerCase()}).` : `Step 2: Find the number of favorable outcomes (${isNot ? 'not ' : ''}${colorLabels[target].toLowerCase()}).`, latex: isNot ? `${total} - ${counts[target]} = ${favorable}` : `${counts[target]}` },
                { text: lang === 'sv' ? "Steg 3: Svara i bråkform: gynnsamma / möjliga." : "Step 3: Answer in fraction form: favorable / possible.", latex: `\\frac{${favorable}}{${total}}` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ]
        };
    }

    // --- LEVEL 2: DICE PROBABILITY (Upgraded Clues) ---
    private level2_Dice(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'calculate'}[] = [
            { key: 'dice_single', type: 'calculate' },
            { key: 'dice_parity', type: 'calculate' },
            { key: 'dice_range', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool as any, options);

        if (v === 'dice_single') {
            const target = MathUtils.randomInt(1, 6);
            const ans = this.rawFraction(1, 6);
            return {
                renderData: {
                    description: lang === 'sv' ? `Vad är sannolikheten att få en ${target}:a när du kastar en vanlig sexsidig tärning?` : `What is the probability of rolling a ${target} when tossing a standard six-sided die?`,
                    answerType: 'fraction'
                },
                token: this.toBase64(ans), variationKey: v, clues: [
                    { text: lang === 'sv' ? "Steg 1: En vanlig tärning har 6 sidor (1, 2, 3, 4, 5, 6)." : "Step 1: A standard die has 6 sides (1, 2, 3, 4, 5, 6)." },
                    { text: lang === 'sv' ? `Steg 2: Det finns bara en sida som är en ${target}.` : `Step 2: There is only one side that is a ${target}.`, latex: `1` },
                    { text: lang === 'sv' ? "Steg 3: Sannolikheten = gynnsamma utfall / möjliga utfall." : "Step 3: Probability = favorable outcomes / possible outcomes.", latex: `\\frac{1}{6}` },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
                ]
            };
        }

        if (v === 'dice_parity') {
            const isEven = Math.random() > 0.5;
            const label = isEven ? (lang === 'sv' ? "jämnt" : "even") : (lang === 'sv' ? "udda" : "odd");
            const set = isEven ? "2, 4, 6" : "1, 3, 5";
            const ans = this.rawFraction(3, 6);
            return {
                renderData: {
                    description: lang === 'sv' ? `Vad är sannolikheten att slå ett ${label} tal med en vanlig tärning?` : `What is the probability of rolling an ${label} number with a standard die?`,
                    answerType: 'fraction'
                },
                token: this.toBase64(ans), variationKey: v, clues: [
                    { text: lang === 'sv' ? `Steg 1: De ${label} talen på en tärning är: ${set}.` : `Step 1: The ${label} numbers on a die are: ${set}.` },
                    { text: lang === 'sv' ? "Steg 2: Det finns 3 gynnsamma utfall av totalt 6 möjliga." : "Step 2: There are 3 favorable outcomes out of a total of 6 possible.", latex: `\\frac{3}{6}` },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
                ]
            };
        }

        const limit = MathUtils.randomInt(2, 5);
        const isHigher = Math.random() > 0.5;
        const op = isHigher ? (lang === 'sv' ? "större än" : "higher than") : (lang === 'sv' ? "mindre än" : "lower than");
        
        let favorable = 0;
        let favSet = [];
        for (let i = 1; i <= 6; i++) {
            if ((isHigher && i > limit) || (!isHigher && i < limit)) {
                favorable++;
                favSet.push(i);
            }
        }
        const ans = this.rawFraction(favorable, 6);

        return {
            renderData: {
                description: lang === 'sv' ? `Vad är sannolikheten att slå ett tal som är ${op} ${limit}?` : `What is the probability of rolling a number ${op} ${limit}?`,
                answerType: 'fraction'
            },
            token: this.toBase64(ans), variationKey: v, clues: [
                { text: lang === 'sv' ? `Steg 1: Lista alla tal på tärningen som är ${op} ${limit}.` : `Step 1: List all numbers on the die that are ${op} ${limit}.`, latex: favSet.join(', ') },
                { text: lang === 'sv' ? `Steg 2: Det finns ${favorable} sådana tal av 6 möjliga.` : `Step 2: There are ${favorable} such numbers out of 6 possible.`, latex: `\\frac{${favorable}}{6}` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ]
        };
    }

    // --- LEVEL 2: STANDARD GROUPS (Upgraded Clues) ---
    private level2_StandardGroups(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'calculate'}[] = [
            { key: 'group_ratio', type: 'calculate' },
            { key: 'group_ternary', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool as any, options);
        const items = MathUtils.randomChoice(ProbabilityGen.SCENARIOS.items);
        const labels = lang === 'sv' ? items.sv : items.en;

        if (v === 'group_ratio') {
            const r1 = MathUtils.randomInt(1, 8), r2 = MathUtils.randomInt(2, 10);
            const total = r1 + r2;
            const ans = this.rawFraction(r1, total);
            return {
                renderData: {
                    description: lang === 'sv' ? `I en grupp är förhållandet mellan ${labels[0]} och ${labels[1]} föremål ${r1}:${r2}. Vad är sannolikheten att dra ett ${labels[0]} föremål?` : `In a group, the ratio between ${labels[0]} and ${labels[1]} items is ${r1}:${r2}. What is the probability of picking a ${labels[0]} item?`,
                    answerType: 'fraction'
                },
                token: this.toBase64(ans), variationKey: v, clues: [
                    { text: lang === 'sv' ? `Steg 1: Förhållandet betyder att det finns ${r1} delar ${labels[0]} och ${r2} delar ${labels[1]}.` : `Step 1: The ratio means there are ${r1} parts ${labels[0]} and ${r2} parts ${labels[1]}.` },
                    { text: lang === 'sv' ? "Steg 2: Beräkna det totala antalet delar." : "Step 2: Calculate the total number of parts.", latex: `${r1} + ${r2} = ${total}` },
                    { text: lang === 'sv' ? `Steg 3: Sannolikheten är gynnsamma delar (${r1}) delat med totalen.` : `Step 3: The probability is favorable parts (${r1}) divided by the total.`, latex: `\\frac{${r1}}{${total}}` },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
                ]
            };
        }

        const a = MathUtils.randomInt(4, 15), b = MathUtils.randomInt(4, 15);
        const total = MathUtils.randomChoice([40, 50, 60]);
        const other = total - a - b;
        const ans = this.rawFraction(other, total);
        return {
            renderData: {
                description: lang === 'sv' ? `I en grupp på ${total} föremål är ${a} stycken ${labels[0]} och ${b} stycken ${labels[1]}. Resten är ${labels[2]}. Vad är sannolikheten att dra ett ${labels[2]} föremål?` : `In a group of ${total} items, ${a} are ${labels[0]} and ${b} are ${labels[1]}. The rest are ${labels[2]}. What is the probability of picking a ${labels[2]} item?`,
                answerType: 'fraction'
            },
            token: this.toBase64(ans), variationKey: v, clues: [
                { text: lang === 'sv' ? `Steg 1: Beräkna först antalet föremål av sorten ${labels[2]}.` : `Step 1: First calculate the number of items of type ${labels[2]}.`, latex: `${total} - ${a} - ${b} = ${other}` },
                { text: lang === 'sv' ? `Steg 2: Sannolikheten är ${other} gynnsamma av ${total} totala.` : `Step 2: The probability is ${other} favorable out of ${total} total.`, latex: `\\frac{${other}}{${total}}` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ]
        };
    }

    // --- LEVEL 5 & 6 HELPER: DYNAMIC SCENARIOS (Updated range & types) ---
    private getChainScenario(lang: string) {
        const scenario = MathUtils.randomChoice(ProbabilityGen.SCENARIOS.chainScenarios);
        const c1 = MathUtils.randomInt(10, 25); 
        const c2 = MathUtils.randomInt(8, 20);
        const total = c1 + c2;

        const t1Idx = MathUtils.randomInt(0, 1);
        const t2Idx = MathUtils.randomInt(0, 1);

        const n1 = t1Idx === 0 ? c1 : c2;
        let n2 = t2Idx === 0 ? c1 : c2;
        if (t1Idx === t2Idx) n2 -= 1; 

        const label1 = lang === 'sv' ? scenario.items[t1Idx].sv[0] : scenario.items[t1Idx].en[0];
        const label2 = lang === 'sv' ? scenario.items[t2Idx].sv[0] : scenario.items[t2Idx].en[0];
        const container = lang === 'sv' ? scenario.container.sv : scenario.container.en;
        
        const countText = lang === 'sv'
            ? `I ${container} finns det ${c1} ${scenario.items[0].sv[1]} och ${c2} ${scenario.items[1].sv[1]}.`
            : `In ${container}, there are ${c1} ${scenario.items[0].en[1]} and ${c2} ${scenario.items[1].en[1]}.`;

        return { c1, c2, total, n1, n2, label1, label2, container, countText, t1Idx, t2Idx, scenario };
    }

    // --- LEVEL 5: PROBABILITY TREE (Scenario Bank Refactor) ---
    private level5_ProbabilityTree(lang: string, variationKey?: string, options: any = {}): any {
        const s = this.getChainScenario(lang);
        const ansN = s.n1 * s.n2;
        const ansD = s.total * (s.total - 1);
        const ans = this.rawFraction(ansN, ansD);

        const desc = lang === 'sv'
            ? `${s.countText} Du drar två slumpmässigt utan återläggning. Vad är sannolikheten att du drar en ${s.label1} först och därefter en ${s.label2}?`
            : `${s.countText} You pick two at random without replacement. What is the probability that you pick a ${s.label1} first and then a ${s.label2}?`;

        return {
            renderData: {
                description: desc, answerType: 'fraction',
                geometry: { type: 'probability_tree', groups: lang === 'sv' ? [s.scenario.items[0].sv[0], s.scenario.items[1].sv[0]] : [s.scenario.items[0].en[0], s.scenario.items[1].en[0]], initialCounts: [s.c1, s.c2], targetBranch: 's2_1' }
            },
            token: this.toBase64(ans), variationKey: 'tree_calc', clues: [
                { text: lang === 'sv' ? "Steg 1: Sannolikheten för händelser i flera steg beräknas genom att multiplicera sannolikheten för varje steg." : "Step 1: Probability for multi-step events is calculated by multiplying the probability of each step.", latex: `P(A \\text{ och } B) = P(A) \\cdot P(B|A)` },
                { text: lang === 'sv' ? `Steg 2: Sannolikhet för första valet (${s.label1}).` : `Step 2: Probability for the first pick (${s.label1}).`, latex: `\\frac{${s.n1}}{${s.total}}` },
                { text: lang === 'sv' ? `Steg 3: Sannolikhet för andra valet (${s.label2}) när ett föremål saknas.` : `Step 3: Probability for the second pick (${s.label2}) when one item is missing.`, latex: `\\frac{${s.n2}}{${s.total - 1}}` },
                { text: lang === 'sv' ? "Steg 4: Multiplicera täljare med täljare och nämnare med nämnare." : "Step 4: Multiply numerator by numerator and denominator by denominator.", latex: `\\frac{${s.n1}}{${s.total}} \\cdot \\frac{${s.n2}}{${s.total - 1}} = \\frac{${ansN}}{${ansD}}` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ]
        };
    }

    // --- LEVEL 6: EVENT CHAINS (Scenario Bank Refactor) ---
    private level6_EventChains(lang: string, variationKey?: string, options: any = {}): any {
        const s = this.getChainScenario(lang);
        const p1N = s.c1 * s.c2;
        const p2N = s.c2 * s.c1;
        const den = s.total * (s.total - 1);
        const ans = this.rawFraction(p1N + p2N, den);

        const desc = lang === 'sv'
            ? `${s.countText} Du väljer ut två slumpmässigt utan återläggning. Vad är sannolikheten att du får en av varje sort?`
            : `${s.countText} You choose two at random without replacement. What is the probability of getting one of each kind?`;

        return {
            renderData: { description: desc, answerType: 'fraction' },
            token: this.toBase64(ans), variationKey: 'chain_any_order', clues: [
                { text: lang === 'sv' ? "Steg 1: 'En av varje' betyder att vi antingen drar (A sen B) eller (B sen A). Vi adderar dessa sannolikheter." : "Step 1: 'One of each' means we either draw (A then B) or (B then A). We add these probabilities.", latex: `P = P(A,B) + P(B,A)` },
                { text: lang === 'sv' ? "Steg 2: Beräkna sannolikheten för (A sen B)." : "Step 2: Calculate the probability of (A then B).", latex: `\\frac{${s.c1}}{${s.total}} \\cdot \\frac{${s.c2}}{${s.total-1}} = \\frac{${p1N}}{${den}}` },
                { text: lang === 'sv' ? "Steg 3: Beräkna sannolikheten för (B sen A)." : "Step 3: Calculate the probability of (B then A).", latex: `\\frac{${s.c2}}{${s.total}} \\cdot \\frac{${s.c1}}{${s.total-1}} = \\frac{${p2N}}{${den}}` },
                { text: lang === 'sv' ? "Steg 4: Addera resultaten från de två vägarna." : "Step 4: Add the results from the two paths.", latex: `\\frac{${p1N}}{${den}} + \\frac{${p2N}}{${den}} = \\frac{${p1N + p2N}}{${den}}` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ]
        };
    }

    // --- LEVEL 3: CONCEPTS & LOGIC (Upgraded Clues) ---
    private level3_ConceptsAndLogic(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'concept_likelihood', type: 'concept' },
            { key: 'concept_validity', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool as any, options);

        if (v === 'concept_likelihood') {
            const cat = MathUtils.randomChoice(['impossible', 'certain', 'even']);
            const scenarioObj = ProbabilityGen.SCENARIOS.likelihood.find(x => x.category === cat)!;
            const scenario = MathUtils.randomChoice(lang === 'sv' ? scenarioObj.sv : scenarioObj.en);
            const label = lang === 'sv' 
                ? (cat === 'impossible' ? "Omöjligt" : cat === 'certain' ? "Säkert" : "Hälften/Hälften")
                : (cat === 'impossible' ? "Impossible" : cat === 'certain' ? "Certain" : "Even chance");

            return {
                renderData: {
                    description: lang === 'sv' ? `Hur sannolikt är det: "${scenario}"?` : `How likely is this: "${scenario}"?`,
                    answerType: 'multiple_choice',
                    options: lang === 'sv' ? ["Omöjligt", "Säkert", "Hälften/Hälften"] : ["Impossible", "Certain", "Even chance"]
                },
                token: this.toBase64(label), variationKey: v, clues: [
                    { text: lang === 'sv' ? "Steg 1: Analysera om händelsen alltid sker, aldrig sker eller sker hälften av gångerna." : "Step 1: Analyze if the event always happens, never happens, or happens half of the time." },
                    { text: lang === 'sv' ? `Svar: ${label}` : `Answer: ${label}` }
                ]
            };
        }

        const valid = (MathUtils.randomInt(1, 99) / 100).toString();
        const invalid = [ (MathUtils.randomInt(11, 20) / 10).toString(), ("-" + (MathUtils.randomInt(1, 5) / 10)).toString() ];
        return {
            renderData: {
                description: lang === 'sv' ? "Vilket värde kan representera en sannolikhet?" : "Which value can represent a probability?",
                answerType: 'multiple_choice', options: MathUtils.shuffle([valid, ...invalid])
            },
            token: this.toBase64(valid), variationKey: v, clues: [
                { text: lang === 'sv' ? "Steg 1: Sannolikhet uttrycks som ett värde mellan 0 (omöjligt) och 1 (säkert)." : "Step 1: Probability is expressed as a value between 0 (impossible) and 1 (certain).", latex: `0 \\le P \\le 1` },
                { text: lang === 'sv' ? `Svar: ${valid}` : `Answer: ${valid}` }
            ]
        };
    }

    // --- LEVEL 4: COMPLEMENTARY (Upgraded Clues) ---
    private level4_Complementary(lang: string, variationKey?: string, options: any = {}): any {
        const pWin = MathUtils.randomInt(1, 9) * 10;
        const pLose = 100 - pWin;
        return {
            renderData: {
                description: lang === 'sv' ? `Chansen att vinna i ett lotteri är ${pWin}%. Vad är sannolikheten att man INTE vinner?` : `The chance of winning a lottery is ${pWin}%. What is the probability of NOT winning?`,
                answerType: 'numeric', suffix: '%'
            },
            token: this.toBase64(pLose.toString()), variationKey: 'comp_multi', clues: [
                { text: lang === 'sv' ? "Steg 1: Summan av en händelse och dess komplementhändelse (motsats) är alltid 100%." : "Step 1: The sum of an event and its complement (opposite) is always 100%.", latex: `P(A) + P(A^c) = 100\\%` },
                { text: lang === 'sv' ? "Steg 2: Subtrahera vinstchansen från 100%." : "Step 2: Subtract the win chance from 100%.", latex: `100\\% - ${pWin}\\% = ${pLose}\\%` },
                { text: lang === 'sv' ? `Svar: ${pLose}%` : `Answer: ${pLose}%` }
            ]
        };
    }

    // --- LEVEL 7: COMBINATORICS (Increased Range) ---
    private level7_Combinatorics(lang: string, variationKey?: string, options: any = {}): any {
        const c1 = MathUtils.randomInt(10, 25); 
        const c2 = MathUtils.randomInt(8, 20);
        const ans = c1 * c2;
        
        const sc = MathUtils.randomChoice([
            { sv: ["tröjor", "byxor"], en: ["shirts", "pants"] },
            { sv: ["förrätter", "varmrätter"], en: ["starters", "main courses"] },
            { sv: ["smaker", "tillbehör"], en: ["flavors", "toppings"] }
        ]);

        return {
            renderData: {
                description: lang === 'sv' ? `Du har ${c1} olika ${sc.sv[0]} och ${c2} olika ${sc.sv[1]}. På hur många sätt kan du kombinera dem?` : `You have ${c1} different ${sc.en[0]} and ${c2} different ${sc.en[1]}. In how many ways can you combine them?`,
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()), variationKey: 'comb_constraint', clues: [
                { text: lang === 'sv' ? "Steg 1: Använd multiplikationsprincipen: om du ska göra två val oberoende av varandra multipliceras antalet möjligheter." : "Step 1: Use the multiplication principle: if you are making two independent choices, multiply the number of possibilities.", latex: `N = n_1 \\cdot n_2` },
                { text: lang === 'sv' ? "Steg 2: Multiplicera antalet alternativ." : "Step 2: Multiply the number of options.", latex: `${c1} \\cdot ${c2} = ${ans}` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ]
        };
    }

    // --- LEVEL 8: COMPLEX PATHWAYS (With Obstacles) ---
    private level8_CombinatoricsComplex(lang: string, variationKey?: string, options: any = {}): any {
        const layers = [1, MathUtils.randomInt(2, 4), MathUtils.randomInt(2, 4), 1];
        const c1 = layers[1];
        const c2 = layers[2];
        const totalPossible = c1 * c2;
        
        // Generate 1-3 unique blocked edges between layer 1 and layer 2
        const obstacles: any[] = [];
        const numObstacles = MathUtils.randomInt(1, 3);
        while (obstacles.length < numObstacles) {
            const obs = { layer: 1, from: MathUtils.randomInt(0, c1 - 1), to: MathUtils.randomInt(0, c2 - 1) };
            if (!obstacles.find(o => o.from === obs.from && o.to === obs.to)) {
                obstacles.push(obs);
            }
        }

        const ans = totalPossible - obstacles.length;

        return {
            renderData: {
                description: lang === 'sv' ? "Hur många vägar finns från A till B? Streckade linjer med röda märken är blockerade." : "How many paths exist from A to B? Dashed lines with red marks are blocked.",
                answerType: 'numeric',
                geometry: { type: 'probability_tree', subtype: 'pathway', layers, obstacles }
            },
            token: this.toBase64(ans.toString()), variationKey: obstacles.length > 0 ? 'pathways_blocked' : 'pathways_basic', clues: [
                { text: lang === 'sv' ? "Steg 1: Beräkna först det totala antalet vägar utan blockeringar genom att multiplicera lagrens noder." : "Step 1: First calculate the total paths without blocks by multiplying the nodes of the layers.", latex: `${c1} \\cdot ${c2} = ${totalPossible}` },
                { text: lang === 'sv' ? `Steg 2: Identifiera antalet blockerade vägar (röda kryss).` : `Step 2: Identify the number of blocked paths (red crosses).`, latex: `${obstacles.length}` },
                { text: lang === 'sv' ? "Steg 3: Subtrahera de blockerade vägarna från totalen." : "Step 3: Subtract the blocked paths from the total.", latex: `${totalPossible} - ${obstacles.length} = ${ans}` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ]
        };
    }
}