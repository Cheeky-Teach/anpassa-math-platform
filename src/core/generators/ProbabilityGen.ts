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
        // Adaptive Fallback: If Level 1 is mastered, push to Level 2
        if (level === 1 && options.hideConcept && options.exclude?.includes('visual_calc')) {
            return this.level2_StandardGroups(lang, undefined, options);
        }

        switch (level) {
            case 1: return this.level1_Visuals(lang, undefined, options);
            case 2: return this.level2_StandardGroups(lang, undefined, options);
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
                    { text: lang === 'sv' ? "Steg 1: Räkna det totala antalet möjliga utfall (alla sektorer på hjulet)." : "Step 1: Count the total number of possible outcomes (all sectors on the spinner)." },
                    { text: lang === 'sv' ? `Det finns ${sections} sektorer totalt.` : `There are ${sections} sectors total.` },
                    { text: lang === 'sv' ? "Steg 2: Räkna antalet gynnsamma utfall (de sektorer som ger vinst)." : "Step 2: Count the number of favorable outcomes (the sectors that win)." },
                    { text: lang === 'sv' ? `Det finns ${win} vinstsektorer.` : `There are ${win} winning sectors.` },
                    { text: lang === 'sv' ? "Steg 3: Sannolikheten skrivs som gynnsamma utfall delat med möjliga utfall." : "Step 3: Probability is written as favorable outcomes divided by possible outcomes.", latex: `P = \\frac{${win}}{${sections}}` },
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
                    { text: lang === 'sv' ? "Steg 1: Räkna det totala antalet kulor i bilden." : "Step 1: Count the total number of marbles in the image." },
                    { text: lang === 'sv' ? `Det finns ${total} kulor totalt.` : `There are ${total} marbles total.` },
                    { text: lang === 'sv' ? `Steg 2: Räkna hur många kulor som INTE är ${colorLabels[target].toLowerCase()}.` : `Step 2: Count how many marbles are NOT ${colorLabels[target].toLowerCase()}.` },
                    { text: lang === 'sv' ? `Det finns ${favorable} sådana kulor.` : `There are ${favorable} such marbles.`, latex: `${total} - ${counts[target]} = ${favorable}` },
                    { text: lang === 'sv' ? "Steg 3: Ställ upp sannolikheten." : "Step 3: Set up the probability.", latex: `P = \\frac{${favorable}}{${total}}` },
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
                { text: lang === 'sv' ? "Steg 1: Räkna antalet kulor av den önskade färgen." : "Step 1: Count the number of marbles of the desired color." },
                { text: lang === 'sv' ? `Det finns ${counts[target]} st ${colorLabels[target].toLowerCase()} kulor.` : `There are ${counts[target]} ${colorLabels[target].toLowerCase()} marbles.` },
                { text: lang === 'sv' ? "Steg 2: Räkna det totala antalet kulor i behållaren." : "Step 2: Count the total number of marbles in the container." },
                { text: lang === 'sv' ? `Det finns totalt ${total} kulor.` : `There are ${total} marbles in total.` },
                { text: lang === 'sv' ? "Steg 3: Dividera antalet önskade kulor med det totala antalet." : "Step 3: Divide the number of desired marbles by the total number.", latex: `\\frac{${counts[target]}}{${total}}` },
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
                    { text: lang === 'sv' ? "Steg 1: Ett förhållande (ratio) visar hur många delar det finns av varje sort." : "Step 1: A ratio shows how many parts there are of each kind." },
                    { text: lang === 'sv' ? `Här finns det ${r1} delar ${labels[0]} och ${r2} delar ${labels[1]}.` : `Here there are ${r1} parts ${labels[0]} and ${r2} parts ${labels[1]}.` },
                    { text: lang === 'sv' ? "Steg 2: Beräkna det totala antalet delar." : "Step 2: Calculate the total number of parts.", latex: `${r1} + ${r2} = ${total}` },
                    { text: lang === 'sv' ? `Steg 3: Sannolikheten är antalet delar av den efterfrågade sorten (${r1}) delat med totalen (${total}).` : `Step 3: The probability is the number of parts of the requested kind (${r1}) divided by the total (${total}).`, latex: `\\frac{${r1}}{${total}}` },
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
                { text: lang === 'sv' ? `Steg 1: Beräkna hur många föremål som är ${labels[2]}.` : `Step 1: Calculate how many items are ${labels[2]}.` },
                { text: lang === 'sv' ? `Ta totalen och dra bort de andra sorterna.` : `Take the total and subtract the other kinds.`, latex: `${total} - ${a} - ${b} = ${other}` },
                { text: lang === 'sv' ? "Steg 2: Sannolikheten för detta utfall är dess antal dividerat med totalen." : "Step 2: The probability for this outcome is its count divided by the total.", latex: `\\frac{${other}}{${total}}` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ]
        };
    }

    // --- LEVEL 5: PROBABILITY TREES (Atomic Steps) ---
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
                { text: lang === 'sv' ? "Steg 1: Beräkna sannolikheten för det första draget (röd)." : "Step 1: Calculate the probability for the first pick (red)." },
                { text: lang === 'sv' ? `Det finns ${c1} röda av ${total} totalt.` : `There are ${c1} red out of ${total} total.`, latex: `P(\\text{Röd}_1) = \\frac{${c1}}{${total}}` },
                { text: lang === 'sv' ? "Steg 2: Beräkna sannolikheten för det andra draget (blå), givet att en röd redan dragits." : "Step 2: Calculate the probability for the second pick (blue), given that a red has already been picked." },
                { text: lang === 'sv' ? `Nu finns det ${c2} blåa kvar, men det totala antalet har minskat med ett.` : `Now there are ${c2} blue left, but the total count has decreased by one.`, latex: `P(\\text{Blå}_2) = \\frac{${c2}}{${total-1}}` },
                { text: lang === 'sv' ? "Steg 3: Multiplicera sannolikheterna för de två stegen längs grenen." : "Step 3: Multiply the probabilities for the two steps along the branch.", latex: `\\frac{${c1}}{${total}} · \\frac{${c2}}{${total-1}}` },
                { text: lang === 'sv' ? "Uträkning:" : "Calculation:", latex: `\\frac{${c1} · ${c2}}{${total} · ${total-1}} = \\frac{${ansN}}{${ansD}}` },
                { text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}` }
            ]
        };
    }

    // --- LEVEL 6: EVENT CHAINS (Atomic Steps) ---
    private level6_EventChains(lang: string, variationKey?: string, options: any = {}): any {
        const v = variationKey || 'chain_any_order';
        const a = MathUtils.randomInt(3, 4), b = MathUtils.randomInt(3, 4);
        const total = a + b;
        
        // P(One of each color)
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
                { text: lang === 'sv' ? "Steg 1: Identifiera de två olika sätten (ordningarna) man kan få en av varje färg." : "Step 1: Identify the two different ways (orders) you can get one of each color." },
                { text: lang === 'sv' ? "Sätt 1: Röd först, sen Blå. Sätt 2: Blå först, sen Röd." : "Way 1: Red first, then Blue. Way 2: Blue first, then Red." },
                { text: lang === 'sv' ? "Steg 2: Beräkna sannolikheten för Sätt 1 (Röd sen Blå)." : "Step 2: Calculate the probability for Way 1 (Red then Blue).", latex: `\\frac{${a}}{${total}} · \\frac{${b}}{${total-1}} = \\frac{${p1N}}{${den}}` },
                { text: lang === 'sv' ? "Steg 3: Beräkna sannolikheten för Sätt 2 (Blå sen Röd)." : "Step 3: Calculate the probability for Way 2 (Blue then Red).", latex: `\\frac{${b}}{${total}} · \\frac{${a}}{${total-1}} = \\frac{${p2N}}{${den}}` },
                { text: lang === 'sv' ? "Steg 4: Addera de två olika sannolikheterna för att få totalsvaret." : "Step 4: Add the two different probabilities to get the total answer.", latex: `\\frac{${p1N}}{${den}} + \\frac{${p2N}}{${den}} = \\frac{${p1N + p2N}}{${den}}` },
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
                    { text: lang === 'sv' ? "Steg 1: Analysera händelsen. Kan den någonsin ske? Sker den varje gång?" : "Step 1: Analyze the event. Can it ever happen? Does it happen every time?" },
                    { text: lang === 'sv' ? "Sannolikhet mäts på en skala från 0 (omöjligt) till 1 (säkert)." : "Probability is measured on a scale from 0 (impossible) to 1 (certain)." },
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
                { text: lang === 'sv' ? "Steg 1: En sannolikhet kan aldrig vara mindre än 0 eller större än 1 (100%)." : "Step 1: A probability can never be less than 0 or greater than 1 (100%)." },
                { text: lang === 'sv' ? `Värdet ${valid} ligger inom det giltiga intervallet.` : `The value ${valid} is within the valid range.` },
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
                { text: lang === 'sv' ? "Steg 1: Summan av sannolikheten för att något händer och att det INTE händer är alltid 100%." : "Step 1: The sum of the probability of something happening and it NOT happening is always 100%." },
                { text: lang === 'sv' ? "Steg 2: Dra bort sannolikheten för vinst från 100%." : "Step 2: Subtract the probability of winning from 100%.", latex: `100\\% - ${pWin}\\% = ${pLose}\\%` },
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
                { text: lang === 'sv' ? "Steg 1: Använd multiplikationsprincipen. För varje val i det första steget finns ett antal val i det andra." : "Step 1: Use the multiplication principle. For every choice in the first step, there are a number of choices in the second." },
                { text: lang === 'sv' ? "Steg 2: Multiplicera antalet tröjor med antalet byxor." : "Step 2: Multiply the number of shirts by the number of pants.", latex: `${c1} · ${c2} = ${ans}` },
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
                { text: lang === 'sv' ? "Steg 1: Räkna antalet vägar (val) i varje enskilt lager." : "Step 1: Count the number of paths (choices) in each individual layer." },
                { text: lang === 'sv' ? `Lager 1 har ${layers[1]} vägar och lager 2 har ${layers[2]} vägar.` : `Layer 1 has ${layers[1]} paths and layer 2 has ${layers[2]} paths.` },
                { text: lang === 'sv' ? "Steg 2: Multiplicera antalet vägar i de olika lagren med varandra." : "Step 2: Multiply the number of paths in the different layers together.", latex: `${layers[1]} · ${layers[2]} = ${totalPaths}` },
                { text: lang === 'sv' ? `Svar: ${totalPaths}` : `Answer: ${totalPaths}` }
            ]
        };
    }

    private level5_Mixed(lang: string, options: any): any {
        const lvl = MathUtils.randomInt(1, 4);
        return this.generate(lvl, lang, options);
    }
}