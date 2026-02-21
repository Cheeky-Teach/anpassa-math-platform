import { MathUtils } from '../utils/MathUtils.js';

export class ProbabilityGen {
    // --- CONTEXT LIBRARY ---
    private static readonly SCENARIOS = {
        containers: [
            { sv: "en påse", en: "a bag" },
            { sv: "en ask", en: "a box" },
            { sv: "en burk", en: "a jar" },
            { sv: "en skål", en: "a bowl" }
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
        // Adaptive Fallback
        if (level === 1 && options.hideConcept && options.exclude?.includes('visual_calc')) {
            return this.level2_StandardGroups(lang, undefined, options);
        }

        switch (level) {
            case 1: return this.level1_Visuals(lang, undefined, options);
            case 2: 
                // Mix dice and group ratios in Level 2
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
        if (options?.exclude && options.exclude.length > 0) {
            filtered = filtered.filter(v => !options.exclude.includes(v.key));
        }
        if (options?.hideConcept) {
            filtered = filtered.filter(v => v.type !== 'concept');
        }
        if (filtered.length === 0) return pool[pool.length - 1].key;
        return MathUtils.randomChoice(filtered.map(v => v.key));
    }

    // --- LEVEL 1: VISUALS ---
    private level1_Visuals(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'visual_calc', type: 'calculate' },
            { key: 'visual_spinner', type: 'calculate' },
            { key: 'visual_not', type: 'calculate' },
            { key: 'visual_or', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const counts = [MathUtils.randomInt(2, 5), MathUtils.randomInt(2, 5), MathUtils.randomInt(1, 4)];
        const total = counts.reduce((a, b) => a + b, 0);
        const colorLabels = lang === 'sv' ? ["Röda", "Blåa", "Gröna"] : ["Red", "Blue", "Green"];

        if (v === 'visual_spinner') {
            const sections = MathUtils.randomChoice([4, 6, 8, 10]);
            const win = MathUtils.randomInt(1, sections - 1);
            const ans = this.rawFraction(win, sections);
            return {
                renderData: {
                    description: lang === 'sv' ? `Ett lyckohjul är indelat i ${sections} lika stora sektorer. ${win} sektorer ger vinst. Vad är sannolikheten för vinst?` : `A spinner is divided into ${sections} equal sectors. ${win} sectors are winning sectors. What is the probability of winning?`,
                    answerType: 'fraction',
                    geometry: { type: 'probability_spinner', sections }
                },
                token: this.toBase64(ans), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? `Det finns ${sections} sektorer totalt.` : `There are ${sections} sectors total.` },
                    { text: lang === 'sv' ? `Det finns ${win} vinstsektorer.` : `There are ${win} winning sectors.` },
                    { text: lang === 'sv' ? "Sannolikheten = gynnsamma utfall / möjliga utfall." : "Probability = favorable outcomes / possible outcomes.", latex: `P = \\frac{${win}}{${sections}}` },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
                ]
            };
        }

        if (v === 'visual_not') {
            const target = MathUtils.randomInt(0, 2);
            const favorable = total - counts[target];
            const ans = this.rawFraction(favorable, total);
            return {
                renderData: {
                    description: lang === 'sv' ? `Vad är sannolikheten att du INTE drar en ${colorLabels[target].toLowerCase()} kula?` : `What is the probability that you do NOT pick a ${colorLabels[target].toLowerCase()} marble?`,
                    answerType: 'fraction',
                    geometry: { type: 'probability_marbles', items: { red: counts[0], blue: counts[1], green: counts[2] } }
                },
                token: this.toBase64(ans), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? `Det finns ${total} kulor totalt.` : `There are ${total} marbles total.` },
                    { text: lang === 'sv' ? `Räkna alla som inte är ${colorLabels[target].toLowerCase()}.` : `Count all that are not ${colorLabels[target].toLowerCase()}.`, latex: `${total} - ${counts[target]} = ${favorable}` },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
                ]
            };
        }

        const target = MathUtils.randomInt(0, 2);
        const ans = this.rawFraction(counts[target], total);
        return {
            renderData: {
                description: lang === 'sv' ? `Vad är sannolikheten att du drar en ${colorLabels[target].toLowerCase()} kula?` : `What is the probability that you pick a ${colorLabels[target].toLowerCase()} marble?`,
                answerType: 'fraction',
                geometry: { type: 'probability_marbles', items: { red: counts[0], blue: counts[1], green: counts[2] } }
            },
            token: this.toBase64(ans), variationKey: 'visual_calc', type: 'calculate',
            clues: [
                { text: lang === 'sv' ? `Det finns ${counts[target]} st ${colorLabels[target].toLowerCase()} kulor.` : `There are ${counts[target]} ${colorLabels[target].toLowerCase()} marbles.` },
                { text: lang === 'sv' ? `Det finns totalt ${total} kulor.` : `There are ${total} marbles in total.` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ]
        };
    }

    // --- LEVEL 2: DICE PROBABILITY (New Method) ---
    private level2_Dice(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'dice_single', type: 'calculate' },
            { key: 'dice_parity', type: 'calculate' },
            { key: 'dice_range', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);

        if (v === 'dice_single') {
            const target = MathUtils.randomInt(1, 6);
            const ans = this.rawFraction(1, 6);
            return {
                renderData: {
                    description: lang === 'sv' ? `Vad är sannolikheten att få en ${target}:a när du kastar en vanlig sexsidig tärning?` : `What is the probability of rolling a ${target} when tossing a standard six-sided die?`,
                    answerType: 'fraction'
                },
                token: this.toBase64(ans), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? "En vanlig tärning har 6 sidor (1, 2, 3, 4, 5, 6)." : "A standard die has 6 sides (1, 2, 3, 4, 5, 6)." },
                    { text: lang === 'sv' ? `Det finns bara en sida som är en ${target}.` : `There is only one side that is a ${target}.` },
                    { text: lang === 'sv' ? "Sannolikheten = gynnsamma utfall / möjliga utfall." : "Probability = favorable outcomes / possible outcomes.", latex: `\\frac{1}{6}` },
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
                token: this.toBase64(ans), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? `De ${label} talen på en tärning är: ${set}.` : `The ${label} numbers on a die are: ${set}.` },
                    { text: lang === 'sv' ? "Det finns 3 gynnsamma utfall av totalt 6 möjliga." : "There are 3 favorable outcomes out of a total of 6 possible." },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
                ]
            };
        }

        // dice_range (Higher/Lower)
        const limit = MathUtils.randomInt(2, 5);
        const isHigher = Math.random() > 0.5;
        const op = isHigher ? (lang === 'sv' ? "större än" : "higher than") : (lang === 'sv' ? "mindre än" : "lower than");
        
        let favorable = 0;
        for (let i = 1; i <= 6; i++) {
            if (isHigher && i > limit) favorable++;
            if (!isHigher && i < limit) favorable++;
        }
        const ans = this.rawFraction(favorable, 6);

        return {
            renderData: {
                description: lang === 'sv' ? `Vad är sannolikheten att slå ett tal som är ${op} ${limit}?` : `What is the probability of rolling a number ${op} ${limit}?`,
                answerType: 'fraction'
            },
            token: this.toBase64(ans), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? `Lista alla tal på tärningen som är ${op} ${limit}.` : `List all numbers on the die that are ${op} ${limit}.` },
                { text: lang === 'sv' ? `Det finns ${favorable} sådana tal.` : `There are ${favorable} such numbers.` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ]
        };
    }

    // --- LEVEL 2: STANDARD GROUPS ---
    private level2_StandardGroups(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'group_ratio', type: 'calculate' },
            { key: 'group_ternary', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool, options);
        const items = MathUtils.randomChoice(ProbabilityGen.SCENARIOS.items);
        const labels = lang === 'sv' ? items.sv : items.en;

        if (v === 'group_ratio') {
            const r1 = MathUtils.randomInt(1, 5), r2 = MathUtils.randomInt(2, 6);
            const total = r1 + r2;
            const ans = this.rawFraction(r1, total);
            return {
                renderData: {
                    description: lang === 'sv' ? `I en grupp är förhållandet mellan ${labels[0]} och ${labels[1]} föremål ${r1}:${r2}. Vad är sannolikheten att dra ett ${labels[0]} föremål?` : `In a group, the ratio between ${labels[0]} and ${labels[1]} items is ${r1}:${r2}. What is the probability of picking a ${labels[0]} item?`,
                    answerType: 'fraction'
                },
                token: this.toBase64(ans), variationKey: v, type: 'calculate',
                clues: [
                    { text: lang === 'sv' ? `Det finns ${r1} delar ${labels[0]} och ${r2} delar ${labels[1]}.` : `There are ${r1} parts ${labels[0]} and ${r2} parts ${labels[1]}.` },
                    { text: lang === 'sv' ? "Beräkna totalen." : "Calculate the total.", latex: `${r1} + ${r2} = ${total}` },
                    { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
                ]
            };
        }

        const a = MathUtils.randomInt(4, 10), b = MathUtils.randomInt(4, 10);
        const total = MathUtils.randomChoice([25, 30, 40]);
        const other = total - a - b;
        const ans = this.rawFraction(other, total);
        return {
            renderData: {
                description: lang === 'sv' ? `I en grupp på ${total} föremål är ${a} stycken ${labels[0]} och ${b} stycken ${labels[1]}. Resten är ${labels[2]}. Vad är sannolikheten att dra ett ${labels[2]} föremål?` : `In a group of ${total} items, ${a} are ${labels[0]} and ${b} are ${labels[1]}. The rest are ${labels[2]}. What is the probability of picking a ${labels[2]} item?`,
                answerType: 'fraction'
            },
            token: this.toBase64(ans), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? `Beräkna först antalet ${labels[2]}.` : `First calculate the number of ${labels[2]}.`, latex: `${total} - ${a} - ${b} = ${other}` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ]
        };
    }

    // --- LEVEL 5: PROBABILITY TREES ---
    private level5_ProbabilityTree(lang: string, variationKey?: string, options: any = {}): any {
        const v = variationKey || 'tree_calc';
        const c1 = MathUtils.randomInt(3, 5), c2 = MathUtils.randomInt(2, 4);
        const total = c1 + c2;
        const ansN = c1 * c2;
        const ansD = total * (total - 1);
        const ans = this.rawFraction(ansN, ansD);

        return {
            renderData: {
                description: lang === 'sv' ? `Du drar två föremål utan återläggning. Det finns ${c1} röda och ${c2} blåa. Vad är sannolikheten att du drar en röd först och sen en blå?` : `You pick two items without replacement. There are ${c1} red and ${c2} blue. What is the probability that you pick a red first and then a blue?`,
                answerType: 'fraction',
                geometry: { type: 'probability_tree', groups: lang === 'sv' ? ["Röd", "Blå"] : ["Red", "Blue"], initialCounts: [c1, c2], targetBranch: 's2_1' }
            },
            token: this.toBase64(ans), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? `Sannolikhet för röd först: P = ${c1}/${total}` : `Prob. for red first: P = ${c1}/${total}` },
                { text: lang === 'sv' ? `Sannolikhet för blå sen: P = ${c2}/${total-1}` : `Prob. for blue next: P = ${c2}/${total-1}` },
                { text: lang === 'sv' ? "Multiplicera längs grenen." : "Multiply along the branch.", latex: `\\frac{${c1}}{${total}} · \\frac{${c2}}{${total-1}}` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ]
        };
    }

    // --- LEVEL 6: EVENT CHAINS ---
    private level6_EventChains(lang: string, variationKey?: string, options: any = {}): any {
        const v = variationKey || 'chain_any_order';
        const a = MathUtils.randomInt(3, 4), b = MathUtils.randomInt(3, 4);
        const total = a + b;
        const p1N = a * b, p2N = b * a;
        const den = total * (total - 1);
        const ans = this.rawFraction(p1N + p2N, den);

        return {
            renderData: {
                description: lang === 'sv' ? `Du drar två föremål ur en påse med ${a} röda och ${b} blåa utan återläggning. Vad är sannolikheten att du får en av varje färg?` : `You pick two items from a bag with ${a} red and ${b} blue without replacement. What is the probability of getting one of each color?`,
                answerType: 'fraction'
            },
            token: this.toBase64(ans), variationKey: v, type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Det finns två sätt: (Röd sen Blå) ELLER (Blå sen Röd)." : "There are two ways: (Red then Blue) OR (Blue then Red)." },
                { text: lang === 'sv' ? "Beräkna båda och addera dem." : "Calculate both and add them.", latex: `\\frac{${a}·${b}}{${total}·${total-1}} + \\frac{${b}·${a}}{${total}·${total-1}}` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ]
        };
    }

    // --- LEVEL 3: CONCEPTS & LOGIC ---
    private level3_ConceptsAndLogic(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'concept' | 'calculate'}[] = [
            { key: 'concept_likelihood', type: 'concept' },
            { key: 'concept_validity', type: 'concept' }
        ];
        const v = variationKey || this.getVariation(pool, options);

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
                token: this.toBase64(label), variationKey: v, type: 'concept',
                clues: [
                    { text: lang === 'sv' ? "Analysera om händelsen kan ske eller ej." : "Analyze if the event can happen or not." },
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
            token: this.toBase64(valid), variationKey: v, type: 'concept',
            clues: [
                { text: lang === 'sv' ? "Sannolikhet är alltid mellan 0 och 1." : "Probability is always between 0 and 1." },
                { text: lang === 'sv' ? `Svar: ${valid}` : `Answer: ${valid}` }
            ]
        };
    }

    // --- LEVEL 4: COMPLEMENTARY ---
    private level4_Complementary(lang: string, variationKey?: string, options: any = {}): any {
        const pWin = MathUtils.randomInt(1, 4) * 10;
        const pLose = 100 - pWin;
        return {
            renderData: {
                description: lang === 'sv' ? `Chansen att vinna i ett lotteri är ${pWin}%. Vad är sannolikheten att man INTE vinner?` : `The chance of winning a lottery is ${pWin}%. What is the probability of NOT winning?`,
                answerType: 'numeric', suffix: '%'
            },
            token: this.toBase64(pLose.toString()), variationKey: 'comp_multi', type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Summan av händelsen och dess komplement är 100%." : "The sum of the event and its complement is 100%." },
                { text: lang === 'sv' ? `Svar: ${pLose}%` : `Answer: ${pLose}%` }
            ]
        };
    }

    // --- LEVEL 7: COMBINATORICS ---
    private level7_Combinatorics(lang: string, variationKey?: string, options: any = {}): any {
        const c1 = MathUtils.randomInt(3, 5), c2 = MathUtils.randomInt(2, 4);
        const ans = c1 * c2;
        return {
            renderData: {
                description: lang === 'sv' ? `Du har ${c1} olika tröjor och ${c2} olika byxor. På hur många sätt kan du kombinera dem till en outfit?` : `You have ${c1} different shirts and ${c2} different pants. In how many ways can you combine them into an outfit?`,
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()), variationKey: 'comb_constraint', type: 'calculate',
            clues: [
                { text: lang === 'sv' ? "Använd multiplikationsprincipen." : "Use the multiplication principle.", latex: `${c1} · ${c2} = ${ans}` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ]
        };
    }

    // --- LEVEL 8: COMPLEX PATHWAYS ---
    private level8_CombinatoricsComplex(lang: string, variationKey?: string, options: any = {}): any {
        const layers = [1, MathUtils.randomInt(2, 3), MathUtils.randomInt(2, 4), 1];
        const totalPaths = layers[1] * layers[2];
        return {
            renderData: {
                description: lang === 'sv' ? "Hur många olika vägar finns det från punkt A till punkt B?" : "How many different paths are there from point A to point B?",
                answerType: 'numeric',
                geometry: { type: 'probability_tree', subtype: 'pathway', layers, obstacles: [] }
            },
            token: this.toBase64(totalPaths.toString()), variationKey: 'pathways_basic', type: 'calculate',
            clues: [
                { text: lang === 'sv' ? `Multiplicera antalet vägar: ${layers[1]} · ${layers[2]} = ${totalPaths}` : `Multiply the paths: ${layers[1]} · ${layers[2]} = ${totalPaths}` },
                { text: lang === 'sv' ? `Svar: ${totalPaths}` : `Answer: ${totalPaths}` }
            ]
        };
    }

    private level5_Mixed(lang: string, options: any): any {
        const lvl = MathUtils.randomInt(1, 4);
        return this.generate(lvl, lang, options);
    }
}