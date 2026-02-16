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

    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_Visuals(lang);
            case 2: return this.level2_StandardGroups(lang);
            case 3: return this.level3_ConceptsAndLogic(lang);
            case 4: return this.level4_Complementary(lang);
            case 5: return this.level5_ProbabilityTree(lang);
            case 6: return this.level6_EventChains(lang);
            case 7: return this.level7_Combinatorics(lang);
            case 8: return this.level8_CombinatoricsComplex(lang);
            default: return this.level1_Visuals(lang);
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

    // --- LEVEL 1: VISUALS ---
    private level1_Visuals(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['visual_not', 'visual_or', 'visual_calc', 'visual_spinner']);
        const counts = [MathUtils.randomInt(2, 5), MathUtils.randomInt(2, 5), MathUtils.randomInt(1, 4)];
        const total = counts.reduce((a, b) => a + b, 0);
        const labels = lang === 'sv' ? ["Röd", "Blå", "Grön"] : ["Red", "Blue", "Green"];
        const container = MathUtils.randomChoice(ProbabilityGen.SCENARIOS.containers);

        if (v === 'visual_spinner') {
            const sections = MathUtils.randomChoice([4, 6, 8, 10, 12]);
            const winSections = MathUtils.randomInt(1, sections - 1);
            const ans = this.rawFraction(winSections, sections);

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Ett lyckohjul har ${sections} lika stora delar. ${winSections} av dem ger vinst. Vad är sannolikheten att du vinner?` 
                        : `A spinner has ${sections} equal parts. ${winSections} of them are winning sections. What is the probability of winning?`,
                    answerType: 'fraction',
                    geometry: { type: 'probability_spinner', sections }
                },
                token: this.toBase64(ans),
                clues: [
                    { 
                        text: lang === 'sv' ? "Sannolikheten beräknas genom att dela antalet vinstfält med det totala antalet fält." : "Probability is calculated by dividing the winning sections by the total number of sections.", 
                        latex: `P = \\frac{\\text{Gynnsamma}}{\\text{Möjliga}} \\rightarrow \\frac{${winSections}}{${sections}}` 
                    },
                    { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${ans}` }
                ],
                metadata: { variation_key: 'visual_spinner', difficulty: 1 }
            };
        }

        if (v === 'visual_not') {
            const targetIdx = MathUtils.randomInt(0, 2);
            const ansCount = total - counts[targetIdx];
            const ans = this.rawFraction(ansCount, total);

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `I ${container.sv} finns ${total} kulor. Vad är sannolikheten att du INTE drar en ${labels[targetIdx].toLowerCase()} kula?` 
                        : `In ${container.en} there are ${total} marbles. What is the probability that you do NOT pick a ${labels[targetIdx].toLowerCase()} marble?`,
                    answerType: 'fraction',
                    geometry: { type: 'probability_marbles', items: { red: counts[0], blue: counts[1], green: counts[2] } }
                },
                token: this.toBase64(ans),
                clues: [
                    { 
                        text: lang === 'sv' ? `Räkna först hur många kulor som inte är ${labels[targetIdx].toLowerCase()}.` : `First, count how many marbles are not ${labels[targetIdx].toLowerCase()}.`, 
                        latex: `${total} - ${counts[targetIdx]} = ${ansCount} \\rightarrow \\text{Andel} = \\frac{${ansCount}}{${total}}` 
                    },
                    { text: lang === 'sv' ? "Sannolikheten är:" : "The probability is:", latex: `${ans}` }
                ],
                metadata: { variation_key: 'visual_not', difficulty: 2 }
            };
        }

        if (v === 'visual_or') {
            const indices = MathUtils.shuffle([0, 1, 2]);
            const idx1 = indices[0], idx2 = indices[1];
            const ansCount = counts[idx1] + counts[idx2];
            const ans = this.rawFraction(ansCount, total);

            return {
                renderData: {
                    description: lang === 'sv'
                        ? `Vad är sannolikheten att du får antingen en ${labels[idx1].toLowerCase()} eller en ${labels[idx2].toLowerCase()} kula?`
                        : `What is the probability that you get either a ${labels[idx1].toLowerCase()} or a ${labels[idx2].toLowerCase()} marble?`,
                    answerType: 'fraction',
                    geometry: { type: 'probability_marbles', items: { red: counts[0], blue: counts[1], green: counts[2] } }
                },
                token: this.toBase64(ans),
                clues: [
                    { 
                        text: lang === 'sv' ? `Lägg ihop antalet för de två färgerna som efterfrågas.` : `Add the counts for the two colors requested.`, 
                        latex: `${counts[idx1]} + ${counts[idx2]} = ${ansCount} \\rightarrow \\frac{${ansCount}}{${total}}` 
                    },
                    { text: lang === 'sv' ? "Svaret blir:" : "The answer is:", latex: `${ans}` }
                ],
                metadata: { variation_key: 'visual_or', difficulty: 2 }
            };
        }

        const target = MathUtils.randomInt(0, 2);
        const ans = this.rawFraction(counts[target], total);
        return {
            renderData: {
                description: lang === 'sv' ? `Vad är sannolikheten att du drar en ${labels[target].toLowerCase()} kula?` : `What is the probability that you pick a ${labels[target].toLowerCase()} marble?`,
                answerType: 'fraction',
                geometry: { type: 'probability_marbles', items: { red: counts[0], blue: counts[1], green: counts[2] } }
            },
            token: this.toBase64(ans),
            clues: [
                { text: lang === 'sv' ? "Sannolikhet = (Antal gynsamma utfall) / (Totala antalet utfall)." : "Probability = (Number of desired outcomes) / (Total number of outcomes).", latex: `\\frac{${counts[target]}}{${total}}` },
                { text: lang === 'sv' ? "Resultat:" : "Result:", latex: `${ans}` }
            ],
            metadata: { variation_key: 'visual_calc', difficulty: 1 }
        };
    }

    // --- LEVEL 2: GROUPS & RATIOS ---
    private level2_StandardGroups(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['group_ratio', 'group_ternary']);
        const ctx = MathUtils.randomChoice(ProbabilityGen.SCENARIOS.items);
        const labels = lang === 'sv' ? ctx.sv : ctx.en;

        if (v === 'group_ratio') {
            const r1 = MathUtils.randomInt(1, 6), r2 = MathUtils.randomInt(1, 6);
            const totalParts = r1 + r2;
            const ans = this.rawFraction(r1, totalParts);

            return {
                renderData: { 
                    description: lang === 'sv' 
                        ? `Förhållandet mellan ${labels[0]} och ${labels[1]} är ${r1}:${r2}. Vad är sannolikheten att dra en ${labels[0]}?` 
                        : `The ratio between ${labels[0]} and ${labels[1]} is ${r1}:${r2}. What is the probability of picking a ${labels[0]}?`, 
                    answerType: 'fraction' 
                },
                token: this.toBase64(ans),
                clues: [
                    { text: lang === 'sv' ? "Summera delarna i förhållandet för att få det totala antalet delar." : "Sum the parts in the ratio to get the total number of parts.", latex: `${r1} + ${r2} = ${totalParts} \\rightarrow P = \\frac{${r1}}{${totalParts}}` },
                    { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${ans}` }
                ],
                metadata: { variation_key: 'group_ratio', difficulty: 3 }
            };
        }

        const a = MathUtils.randomInt(3, 8), b = MathUtils.randomInt(3, 8), extra = MathUtils.randomInt(2, 6);
        const total = a + b + extra;
        const ans = this.rawFraction(extra, total);

        return {
            renderData: { 
                description: lang === 'sv' 
                    ? `I en låda finns ${total} saker. ${a} är ${labels[0]} och ${b} är ${labels[1]}. Resten är ${labels[2]}. Vad är sannolikheten att få en ${labels[2]}?` 
                    : `In a box there are ${total} items. ${a} are ${labels[0]} and ${b} are ${labels[1]}. The rest are ${labels[2]}. What is the probability of picking a ${labels[2]}?`, 
                answerType: 'fraction' 
            },
            token: this.toBase64(ans),
            clues: [
                { text: lang === 'sv' ? `Räkna först ut antalet ${labels[2]} genom subtraktion.` : `First, calculate the count of ${labels[2]} using subtraction.`, latex: `${total} - ${a} - ${b} = ${extra} \\rightarrow \\frac{${extra}}{${total}}` },
                { text: lang === 'sv' ? "Sannolikheten blir:" : "The probability becomes:", latex: `${ans}` }
            ],
            metadata: { variation_key: 'group_ternary', difficulty: 2 }
        };
    }

    // --- LEVEL 3: CONCEPTS & LOGIC ---
    private level3_ConceptsAndLogic(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['concept_compare', 'concept_validity', 'concept_likelihood']);

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
                token: this.toBase64(label),
                clues: [
                    { text: lang === 'sv' ? "Bedöm om händelsen aldrig kan ske (0), alltid måste ske (1) eller har en 50/50-chans (0,5)." : "Assess if the event can never happen (0), must always happen (1), or has a 50/50 chance (0.5)." },
                    { text: lang === 'sv' ? "Rätt svar är:" : "The correct answer is:", latex: `\\text{${label}}` }
                ],
                metadata: { variation_key: 'concept_likelihood', difficulty: 1 }
            };
        }

        if (v === 'concept_compare') {
            const aD = MathUtils.randomInt(3, 5), bD = MathUtils.randomInt(6, 10);
            const aN = 1, bN = MathUtils.randomInt(2, 4);
            const valA = aN / aD, valB = bN / bD;

            const l1 = MathUtils.randomChoice(ProbabilityGen.SCENARIOS.lotteries);
            const l2 = MathUtils.randomChoice(ProbabilityGen.SCENARIOS.lotteries.filter(x => x !== l1));
            const options = lang === 'sv' ? [l1.sv, l2.sv, "Lika stor"] : [l1.en, l2.en, "Equal"];
            const ans = valB > valA ? options[1] : (valA > valB ? options[0] : options[2]);

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Var är chansen störst: I ${l1.sv} (chans ${aN}/${aD}) eller i ${l2.sv} (chans ${bN}/${bD})?` 
                        : `Where is the chance greatest: In ${l1.en} (chance ${aN}/${aD}) or in ${l2.en} (chance ${bN}/${bD})?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle(options)
                },
                token: this.toBase64(ans),
                clues: [
                    { text: lang === 'sv' ? "Gör om bråken till decimalform för att jämföra värdena." : "Convert the fractions to decimals to compare the values.", latex: `\\frac{${aN}}{${aD}} \\approx ${valA.toFixed(2)} \\quad \\text{vs} \\quad \\frac{${bN}}{${bD}} \\approx ${valB.toFixed(2)}` },
                    { text: lang === 'sv' ? "Det största värdet är:" : "The largest value is:", latex: `\\text{${ans}}` }
                ],
                metadata: { variation_key: 'concept_compare', difficulty: 3 }
            };
        }

        const validVal = (MathUtils.randomInt(1, 99) / 100).toString();
        const invalidVals = [ (MathUtils.randomInt(11, 20) / 10).toString(), ("-" + (MathUtils.randomInt(1, 5) / 10)).toString() ];

        return {
            renderData: {
                description: lang === 'sv' ? "Vilket värde kan representera en sannolikhet?" : "Which value can represent a probability?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([validVal, ...invalidVals])
            },
            token: this.toBase64(validVal),
            clues: [
                { text: lang === 'sv' ? "En sannolikhet måste ligga mellan 0 och 1. Värden under noll eller över ett är omöjliga." : "A probability must be between 0 and 1. Values below zero or above one are impossible." },
                { text: lang === 'sv' ? "Det giltiga värdet är:" : "The valid value is:", latex: `${validVal}` }
            ],
            metadata: { variation_key: 'concept_validity', difficulty: 1 }
        };
    }

    // --- LEVEL 4: COMPLEMENTARY ---
    private level4_Complementary(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['comp_at_least', 'comp_multi', 'comp_lie']);

        if (v === 'comp_at_least') {
            const d = MathUtils.randomChoice([3, 4, 5]);
            const trials = 2;
            const pNoneN = Math.pow(d - 1, trials);
            const pNoneD = Math.pow(d, trials);
            const ansN = pNoneD - pNoneN;
            const ans = this.rawFraction(ansN, pNoneD);

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Chansen att vinna är 1/${d}. Om du spelar ${trials} gånger, vad är sannolikheten att vinna MINST en gång?` 
                        : `The chance of winning is 1/${d}. If you play ${trials} times, what is the probability of winning AT LEAST once?`,
                    answerType: 'fraction'
                },
                token: this.toBase64(ans),
                clues: [
                    { text: lang === 'sv' ? "Räkna ut risken att händelsen ALDRIG sker först." : "First, calculate the risk of the event NEVER happening.", latex: `P(\\text{Aldrig}) = \\frac{${d-1}}{${d}} \\cdot \\frac{${d-1}}{${d}} = \\frac{${pNoneN}}{${pNoneD}} \\rightarrow P(\\text{Minst en}) = 1 - \\frac{${pNoneN}}{${pNoneD}}` },
                    { text: lang === 'sv' ? "Svaret blir:" : "The answer is:", latex: `${ans}` }
                ],
                metadata: { variation_key: 'comp_at_least', difficulty: 4 }
            };
        }

        if (v === 'comp_lie') {
            const lieVal = "1.5";
            const lie = lang === 'sv' ? `Summan av alla utfall kan bli ${lieVal}` : `The sum of all outcomes can be ${lieVal}`;
            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket påstående är FELAKTIGT?" : "Which statement is INCORRECT?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([lie, lang === 'sv' ? "Summan av alla utfall är alltid 1" : "The sum of all outcomes is always 1", "P(A) + P(not A) = 1"])
                },
                token: this.toBase64(lie),
                clues: [
                    { text: lang === 'sv' ? "Summan av alla möjliga händelser i ett experiment måste alltid bli exakt 100% eller 1." : "The sum of all possible events in an experiment must always equal exactly 100% or 1." },
                    { text: lang === 'sv' ? "Felaktigt påstående:" : "Incorrect statement:", latex: `\\text{${lie}}` }
                ],
                metadata: { variation_key: 'comp_lie', difficulty: 2 }
            };
        }

        const pA = 20, pB = 30;
        const pRest = 100 - pA - pB;
        return {
            renderData: {
                description: lang === 'sv' ? `Chans för vinst A: ${pA}%, vinst B: ${pB}%. Vad är chansen att INTE vinna något?` : `Chance for prize A: ${pA}%, prize B: ${pB}%. What is the chance of NOT winning anything?`,
                answerType: 'numeric', suffix: '%'
            },
            token: this.toBase64(pRest.toString()),
            clues: [
                { text: lang === 'sv' ? "Dra bort alla kända vinstchanser från helheten (100%)." : "Subtract all known winning chances from the whole (100%).", latex: `100\\% - (${pA}\\% + ${pB}\\%) = ${pRest}\\%` },
                { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${pRest}\\%` }
            ],
            metadata: { variation_key: 'comp_multi', difficulty: 2 }
        };
    }

    // --- LEVEL 5: PROBABILITY TREES ---
    private level5_ProbabilityTree(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['tree_missing', 'tree_calc']);

        if (v === 'tree_missing') {
            const d1 = 2, d2 = 3, dTot = 6;
            return {
                renderData: {
                    description: lang === 'sv' ? `En gren slutar på 1/${dTot}. Första steget var 1/${d1}. Vad var andra steget?` : `A branch ends at 1/${dTot}. The first step was 1/${d1}. What was the second step?`,
                    answerType: 'fraction'
                },
                token: this.toBase64(this.rawFraction(1, d2)),
                clues: [
                    { text: lang === 'sv' ? "Sannolikheter längs en gren multipliceras. För att hitta en saknad del dividerar vi resultatet med den kända delen." : "Probabilities along a branch are multiplied. To find a missing part, divide the result by the known part.", latex: `\\frac{1}{${dTot}} \\div \\frac{1}{${d1}} = \\frac{1}{${d2}}` },
                    { text: lang === 'sv' ? "Det saknade steget är:" : "The missing step is:", latex: `\\frac{1}{${d2}}` }
                ],
                metadata: { variation_key: 'tree_missing', difficulty: 3 }
            };
        }

        const c1 = 3, c2 = 2;
        const tot = 5;
        const ansN = c1 * c2, ansD = tot * (tot - 1);
        const ans = this.rawFraction(ansN, ansD);

        return {
            renderData: {
                description: lang === 'sv' ? `Dra två kulor utan återläggning. ${c1} Röda, ${c2} Blå. Sannolikhet för Röd sen Blå?` : `Pick two marbles without replacement. ${c1} Red, ${c2} Blue. Probability of Red then Blue?`,
                answerType: 'fraction',
                geometry: { type: 'probability_tree', groups: ["R", "B"], initialCounts: [c1, c2], targetBranch: 's2_1' }
            },
            token: this.toBase64(ans),
            clues: [
                { text: lang === 'sv' ? "Multiplicera chansen för det första draget med chansen för det andra. Glöm inte att totalen minskar." : "Multiply the chance of the first pick by the chance of the second. Don't forget that the total decreases.", latex: `\\frac{${c1}}{${tot}} \\cdot \\frac{${c2}}{${tot-1}} = \\frac{${ansN}}{${ansD}}` },
                { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${ans}` }
            ],
            metadata: { variation_key: 'tree_calc', difficulty: 3 }
        };
    }

    // --- LEVEL 6: EVENT CHAINS ---
    private level6_EventChains(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['chain_any_order', 'chain_fixed_order']);
        const a = 3, b = 3;
        const total = 6;

        if (v === 'chain_any_order') {
            const ansN = (a * b) * 2;
            const ansD = total * (total - 1);
            const ans = this.rawFraction(ansN, ansD);

            return {
                renderData: {
                    description: lang === 'sv' ? `Dra två frukter utan återläggning (${a} Röda, ${b} Blå). Chans för en av varje färg?` : `Pick two fruits without replacement (${a} Red, ${b} Blue). Chance for one of each color?`,
                    answerType: 'fraction'
                },
                token: this.toBase64(ans),
                clues: [
                    { text: lang === 'sv' ? "Det finns två möjliga ordningar: (Röd, Blå) eller (Blå, Röd). Beräkna en gren och dubblera resultatet." : "There are two possible orders: (Red, Blue) or (Blue, Red). Calculate one branch and double the result.", latex: `2 \\cdot (\\frac{${a}}{${total}} \\cdot \\frac{${b}}{${total-1}}) = \\frac{${ansN}}{${ansD}}` },
                    { text: lang === 'sv' ? "Total chans:" : "Total chance:", latex: `${ans}` }
                ],
                metadata: { variation_key: 'chain_any_order', difficulty: 4 }
            };
        }

        const ansN = b * (b - 1);
        const ansD = total * (total - 1);
        const ans = this.rawFraction(ansN, ansD);

        return {
            renderData: {
                description: lang === 'sv' ? `Vad är sannolikheten att dra två blåa i rad? (Totalt ${a} röda, ${b} blåa).` : `What is the probability of picking two blue in a row? (Total ${a} red, ${b} blue).`,
                answerType: 'fraction'
            },
            token: this.toBase64(ans),
            clues: [
                { text: lang === 'sv' ? "Minska både antalet blåa och det totala antalet inför det andra draget." : "Decrease both the count of blue and the total count before the second pick.", latex: `\\frac{${b}}{${total}} \\cdot \\frac{${b-1}}{${total-1}} = \\frac{${ansN}}{${ansD}}` },
                { text: lang === 'sv' ? "Svaret blir:" : "The answer is:", latex: `${ans}` }
            ],
            metadata: { variation_key: 'chain_fixed_order', difficulty: 3 }
        };
    }

    // --- LEVEL 7: COMBINATORICS ---
    private level7_Combinatorics(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['comb_constraint', 'comb_handshake']);

        if (v === 'comb_constraint') {
            const c1 = 4, c2 = 3;
            const ans = (c1 * c2).toString();
            return {
                renderData: {
                    description: lang === 'sv' ? `Du har ${c1} tröjor och ${c2} byxor. På hur många sätt kan du kombinera dem?` : `You have ${c1} shirts and ${c2} pants. In how many ways can you combine them?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans),
                clues: [
                    { text: lang === 'sv' ? "Använd multiplikationsprincipen: multiplicera antalet val i det första steget med antalet val i det andra." : "Use the multiplication principle: multiply the choices in the first step by the choices in the second.", latex: `${c1} \\cdot ${c2} = ${ans}` },
                    { text: lang === 'sv' ? "Antal kombinationer:" : "Number of combinations:", latex: `${ans}` }
                ],
                metadata: { variation_key: 'comb_constraint', difficulty: 3 }
            };
        }

        const n = 6;
        const ans = ((n * (n - 1)) / 2).toString();
        return {
            renderData: {
                description: lang === 'sv' ? `${n} personer skakar hand med alla på en fest. Hur många handskakningar sker?` : `${n} people shake hands with everyone at a party. How many handshakes occur?`,
                answerType: 'numeric'
            },
            token: this.toBase64(ans),
            clues: [
                { text: lang === 'sv' ? "Varje person skakar hand med n-1 andra. Dela med 2 eftersom varje handskakning sker mellan två personer." : "Each person shakes hands with n-1 others. Divide by 2 because each handshake happens between two people.", latex: `\\frac{${n} \\cdot ${n-1}}{2} = ${ans}` },
                { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${ans}` }
            ],
            metadata: { variation_key: 'comb_handshake', difficulty: 3 }
        };
    }

    // --- LEVEL 8: COMPLEX PATHWAYS ---
    private level8_CombinatoricsComplex(lang: string, variationKey?: string): any {
        const v = variationKey || 'pathways_basic';
        const layers = [1, 2, 3, 1];
        const totalPaths = 6;
        const ans = v === 'pathways_prob' ? this.rawFraction(totalPaths, totalPaths) : totalPaths.toString();

        return {
            renderData: {
                description: lang === 'sv' ? "Hur många vägar finns från A till B?" : "How many paths are there from A to B?",
                answerType: v === 'pathways_prob' ? 'fraction' : 'numeric',
                geometry: { type: 'probability_tree', subtype: 'pathway', layers, obstacles: [] }
            },
            token: this.toBase64(ans),
            clues: [
                { text: lang === 'sv' ? "Räkna valen i varje lager och multiplicera dem." : "Count the choices in each layer and multiply them.", latex: `${layers[1]} \\cdot ${layers[2]} = ${totalPaths}` },
                { text: lang === 'sv' ? "Antalet vägar är:" : "The number of paths is:", latex: `${ans}` }
            ],
            metadata: { variation_key: v, difficulty: 5 }
        };
    }
}