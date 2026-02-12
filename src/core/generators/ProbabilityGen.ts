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
            const why = lang === 'sv' 
                ? `Sannolikhet handlar om att dela de "bra" fälten (${winSections}) med alla fält som finns (${sections}).` 
                : `Probability is about dividing the "good" sections (${winSections}) by all available sections (${sections}).`;

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Ett lyckohjul har ${sections} lika stora delar. ${winSections} av dem ger vinst. Vad är sannolikheten att du vinner?` 
                        : `A spinner has ${sections} equal parts. ${winSections} of them are winning sections. What is the probability of winning?`,
                    answerType: 'fraction',
                    geometry: { type: 'probability_spinner', sections }
                },
                token: this.toBase64(this.rawFraction(winSections, sections)),
                clues: [{ text: why, latex: `P = \\frac{${winSections}}{${sections}}` }],
                metadata: { variation_key: 'visual_spinner', difficulty: 1 }
            };
        }

        if (v === 'visual_not') {
            const targetIdx = MathUtils.randomInt(0, 2);
            const ansCount = total - counts[targetIdx];
            const whyStep1 = lang === 'sv' 
                ? `Vi vill veta sannolikheten att händelsen INTE sker. Räkna först hur många föremål som har en annan färg än ${labels[targetIdx].toLowerCase()}.` 
                : `We want the probability that the event does NOT happen. First, count how many items have a color other than ${labels[targetIdx].toLowerCase()}.`;

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `I ${container.sv} finns ${total} kulor. Vad är sannolikheten att du INTE drar en ${labels[targetIdx].toLowerCase()} kula?` 
                        : `In ${container.en} there are ${total} marbles. What is the probability that you do NOT pick a ${labels[targetIdx].toLowerCase()} marble?`,
                    answerType: 'fraction',
                    geometry: { type: 'probability_marbles', items: { red: counts[0], blue: counts[1], green: counts[2] } }
                },
                token: this.toBase64(this.rawFraction(ansCount, total)),
                clues: [
                    { text: whyStep1, latex: `${total} - ${counts[targetIdx]} = ${ansCount}` },
                    { text: lang === 'sv' ? "Dela nu de gilitiga alternativen med det totala antalet." : "Now divide the valid options by the total number.", latex: `\\frac{${ansCount}}{${total}}` }
                ],
                metadata: { variation_key: 'visual_not', difficulty: 2 }
            };
        }

        if (v === 'visual_or') {
            const indices = MathUtils.shuffle([0, 1, 2]);
            const idx1 = indices[0], idx2 = indices[1];
            const ansCount = counts[idx1] + counts[idx2];
            const why = lang === 'sv' 
                ? `När vi letar efter "antingen eller" lägger vi ihop antalet ${labels[idx1].toLowerCase()} och ${labels[idx2].toLowerCase()} kulor.` 
                : `When looking for "either or," we add the number of ${labels[idx1].toLowerCase()} and ${labels[idx2].toLowerCase()} marbles together.`;

            return {
                renderData: {
                    description: lang === 'sv'
                        ? `Vad är sannolikheten att du får antingen en ${labels[idx1].toLowerCase()} eller en ${labels[idx2].toLowerCase()} kula?`
                        : `What is the probability that you get either a ${labels[idx1].toLowerCase()} or a ${labels[idx2].toLowerCase()} marble?`,
                    answerType: 'fraction',
                    geometry: { type: 'probability_marbles', items: { red: counts[0], blue: counts[1], green: counts[2] } }
                },
                token: this.toBase64(this.rawFraction(ansCount, total)),
                clues: [{ text: why, latex: `\\frac{${counts[idx1]} + ${counts[idx2]}}{${total}} = \\frac{${ansCount}}{${total}}` }],
                metadata: { variation_key: 'visual_or', difficulty: 2 }
            };
        }

        const target = MathUtils.randomInt(0, 2);
        return {
            renderData: {
                description: lang === 'sv' ? `Vad är sannolikheten att du drar en ${labels[target].toLowerCase()} kula?` : `What is the probability that you pick a ${labels[target].toLowerCase()} marble?`,
                answerType: 'fraction',
                geometry: { type: 'probability_marbles', items: { red: counts[0], blue: counts[1], green: counts[2] } }
            },
            token: this.toBase64(this.rawFraction(counts[target], total)),
            clues: [{ text: lang === 'sv' ? "Sannolikhet = (Antal gynsamma utfall) / (Totala antalet utfall)." : "Probability = (Number of desired outcomes) / (Total number of outcomes).", latex: `\\frac{${counts[target]}}{${total}}` }],
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
            const why = lang === 'sv' 
                ? `Förhållandet ${r1}:${r2} betyder att det finns totalt ${totalParts} delar. Vi vill veta andelen för den första sorten.` 
                : `The ratio ${r1}:${r2} means there are ${totalParts} parts in total. We want the share for the first type.`;

            return {
                renderData: { 
                    description: lang === 'sv' 
                        ? `Förhållandet mellan ${labels[0]} och ${labels[1]} är ${r1}:${r2}. Vad är sannolikheten att slumpmässigt välja en ${labels[0]}?` 
                        : `The ratio between ${labels[0]} and ${labels[1]} is ${r1}:${r2}. What is the probability of randomly picking a ${labels[0]}?`, 
                    answerType: 'fraction' 
                },
                token: this.toBase64(this.rawFraction(r1, totalParts)),
                clues: [{ text: why, latex: `\\frac{${r1}}{${r1} + ${r2}} = \\frac{${r1}}{${totalParts}}` }],
                metadata: { variation_key: 'group_ratio', difficulty: 3 }
            };
        }

        const a = MathUtils.randomInt(3, 8), b = MathUtils.randomInt(3, 8), extra = MathUtils.randomInt(2, 6);
        const total = a + b + extra;
        const why = lang === 'sv' 
            ? `Först räknar vi ut hur många ${labels[2]} det finns genom att dra bort de kända grupperna från totalen.` 
            : `First, calculate how many ${labels[2]} there are by subtracting the known groups from the total.`;

        return {
            renderData: { 
                description: lang === 'sv' 
                    ? `I en låda finns ${total} saker. ${a} är ${labels[0]} och ${b} är ${labels[1]}. Resten är ${labels[2]}. Vad är sannolikheten att få en ${labels[2]}?` 
                    : `In a box there are ${total} items. ${a} are ${labels[0]} and ${b} are ${labels[1]}. The rest are ${labels[2]}. What is the probability of picking a ${labels[2]}?`, 
                answerType: 'fraction' 
            },
            token: this.toBase64(this.rawFraction(extra, total)),
            clues: [
                { text: why, latex: `${total} - ${a} - ${b} = ${extra}` },
                { text: lang === 'sv' ? "Nu kan vi skriva sannolikheten som ett bråk." : "Now we can write the probability as a fraction.", latex: `\\frac{${extra}}{${total}}` }
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
                clues: [{ text: lang === 'sv' ? "Tänk på om händelsen kan ske, måste ske, eller har 50% chans." : "Think about if the event can happen, must happen, or has a 50% chance." }],
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
                clues: [{ text: lang === 'sv' ? "Gör om bråken till decimaltal för att lättare se vilket som är störst." : "Convert the fractions to decimals to see which is largest.", latex: `\\frac{${aN}}{${aD}} \\approx ${valA.toFixed(2)} \\quad \\text{vs} \\quad \\frac{${bN}}{${bD}} \\approx ${valB.toFixed(2)}` }],
                metadata: { variation_key: 'concept_compare', difficulty: 3 }
            };
        }

        const validVal = (MathUtils.randomInt(1, 99) / 100).toString();
        const invalidVals = [
            (MathUtils.randomInt(11, 20) / 10).toString(), 
            ("-" + (MathUtils.randomInt(1, 5) / 10)).toString(),
            (MathUtils.randomInt(101, 150) + "%")
        ];

        return {
            renderData: {
                description: lang === 'sv' ? "Vilket värde kan vara en riktig sannolikhet?" : "Which value can be a real probability?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([validVal, ...invalidVals])
            },
            token: this.toBase64(validVal),
            clues: [{ text: lang === 'sv' ? "En sannolikhet måste vara mellan 0 och 1 (eller 0% och 100%)." : "A probability must be between 0 and 1 (or 0% and 100%)." }],
            metadata: { variation_key: 'concept_validity', difficulty: 1 }
        };
    }

    // --- LEVEL 4: COMPLEMENTARY ---
    private level4_Complementary(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['comp_at_least', 'comp_multi', 'comp_lie']);

        if (v === 'comp_at_least') {
            const d = MathUtils.randomChoice([3, 4, 5, 6]);
            const trials = MathUtils.randomInt(2, 3);
            const pNoneN = Math.pow(d - 1, trials);
            const pNoneD = Math.pow(d, trials);
            const ansN = pNoneD - pNoneN;

            const whyStep1 = lang === 'sv' 
                ? `När vi söker "minst en" är det lättast att räkna ut risken att händelsen ALDRIG sker.` 
                : `When looking for "at least one," it is easiest to calculate the risk of the event NEVER happening.`;

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Chansen att vinna är 1/${d}. Om du spelar ${trials} gånger, vad är sannolikheten att du vinner MINST en gång?` 
                        : `The chance of winning is 1/${d}. If you play ${trials} times, what is the probability of winning AT LEAST once?`,
                    answerType: 'fraction'
                },
                token: this.toBase64(this.rawFraction(ansN, pNoneD)),
                clues: [
                    { text: whyStep1, latex: `P(\\text{Aldrig}) = (\\frac{${d-1}}{${d}})^{${trials}} = \\frac{${pNoneN}}{${pNoneD}}` },
                    { text: lang === 'sv' ? "Dra sedan bort den risken från 1 (helheten)." : "Then subtract that risk from 1 (the whole).", latex: `1 - \\frac{${pNoneN}}{${pNoneD}} = \\frac{${ansN}}{${pNoneD}}` }
                ],
                metadata: { variation_key: 'comp_at_least', difficulty: 4 }
            };
        }

        if (v === 'comp_lie') {
            const lieVal = (MathUtils.randomInt(11, 20) / 10).toString();
            const lie = lang === 'sv' ? `Summan av alla utfall kan bli ${lieVal}` : `The sum of all outcomes can be ${lieVal}`;
            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket påstående är FEL?" : "Which statement is FALSE?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([lie, lang === 'sv' ? "Summan av alla utfall är alltid 1" : "The sum of all outcomes is always 1", "P(A) + P(not A) = 1"])
                },
                token: this.toBase64(lie),
                clues: [{ text: lang === 'sv' ? "Alla möjliga händelser tillsammans måste alltid bli exakt 1." : "All possible events together must always equal exactly 1." }],
                metadata: { variation_key: 'comp_lie', difficulty: 2 }
            };
        }

        const pA = MathUtils.randomInt(1, 4) * 10, pB = MathUtils.randomInt(1, 4) * 10;
        const pRest = 100 - pA - pB;
        return {
            renderData: {
                description: lang === 'sv' ? `I ett lotteri är chansen för storvinst ${pA}% och småvinst ${pB}%. Vad är chansen att du INTE vinner något?` : `In a lottery, the chance for a big prize is ${pA}% and a small prize is ${pB}%. What is the chance you do NOT win anything?`,
                answerType: 'numeric', suffix: '%'
            },
            token: this.toBase64(pRest.toString()),
            clues: [{ text: lang === 'sv' ? "Ta 100% och dra bort alla chanser till vinst." : "Take 100% and subtract all winning chances.", latex: `100\\% - ${pA}\\% - ${pB}\\% = ${pRest}\\%` }],
            metadata: { variation_key: 'comp_multi', difficulty: 2 }
        };
    }

    // --- LEVEL 5: PROBABILITY TREES ---
    private level5_ProbabilityTree(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['tree_missing', 'tree_calc']);

        if (v === 'tree_missing') {
            const d1 = MathUtils.randomInt(2, 4), d2 = MathUtils.randomInt(2, 5);
            const dTot = d1 * d2;
            const why = lang === 'sv' 
                ? `Längs en gren multiplicerar vi sannolikheterna. Om vi saknar en del använder vi division.` 
                : `Along a branch, we multiply the probabilities. If a part is missing, we use division.`;

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `En gren slutar på 1/${dTot}. Om det första steget var 1/${d1}, vad var det andra steget?` 
                        : `A branch ends at 1/${dTot}. If the first step was 1/${d1}, what was the second step?`,
                    answerType: 'fraction'
                },
                token: this.toBase64(this.rawFraction(1, d2)),
                clues: [{ text: why, latex: `\\frac{1}{${dTot}} \\div \\frac{1}{${d1}} = \\frac{1}{${d2}}` }],
                metadata: { variation_key: 'tree_missing', difficulty: 3 }
            };
        }

        const c1 = MathUtils.randomInt(2, 4), c2 = MathUtils.randomInt(2, 4);
        const tot = c1 + c2;
        const why = lang === 'sv' 
            ? `Vi multiplicerar chansen för det första draget med chansen för det andra. Eftersom vi inte lägger tillbaka minskar totalen.` 
            : `We multiply the chance of the first pick by the chance of the second. Since we don't replace, the total decreases.`;

        return {
            renderData: {
                description: lang === 'sv' 
                    ? `Du drar två saker utan återläggning. Det finns ${c1} stycken A och ${c2} stycken B. Sannolikhet för först en A, sen en B?` 
                    : `You pick two items without replacement. There are ${c1} of A and ${c2} of B. Probability of first an A, then a B?`,
                answerType: 'fraction',
                geometry: { type: 'probability_tree', groups: ["A", "B"], initialCounts: [c1, c2], targetBranch: 's2_1' }
            },
            token: this.toBase64(this.rawFraction(c1 * c2, tot * (tot - 1))),
            clues: [{ text: why, latex: `\\frac{${c1}}{${tot}} \\cdot \\frac{${c2}}{${tot-1}} = \\frac{${c1*c2}}{${tot*(tot-1)}}` }],
            metadata: { variation_key: 'tree_calc', difficulty: 3 }
        };
    }

    // --- LEVEL 6: EVENT CHAINS ---
    private level6_EventChains(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['chain_any_order', 'chain_fixed_order']);
        const a = MathUtils.randomInt(3, 5), b = MathUtils.randomInt(3, 5);
        const total = a + b;

        if (v === 'chain_any_order') {
            const why = lang === 'sv' 
                ? `Här finns två vägar: (Röd sen Blå) eller (Blå sen Röd). Vi räknar ut båda och lägger ihop dem.` 
                : `There are two paths here: (Red then Blue) or (Blue then Red). We calculate both and add them.`;

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `I en skål finns ${a} röda och ${b} blåa frukter. Om du drar två utan återläggning, vad är chansen för en av varje färg?` 
                        : `In a bowl are ${a} red and ${b} blue fruits. If you pick two without replacement, what is the chance for one of each color?`,
                    answerType: 'fraction'
                },
                token: this.toBase64(this.rawFraction((a * b) * 2, total * (total - 1))),
                clues: [{ text: why, latex: `2 \\cdot (\\frac{${a}}{${total}} \\cdot \\frac{${b}}{${total-1}})` }],
                metadata: { variation_key: 'chain_any_order', difficulty: 4 }
            };
        }

        const why = lang === 'sv' 
            ? `När vi drar samma färg två gånger minskar både antalet blåa och det totala antalet till det andra draget.` 
            : `When picking the same color twice, both the number of blue items and the total decrease for the second pick.`;

        return {
            renderData: {
                description: lang === 'sv' ? `Vad är sannolikheten att dra två blåa i rad? (Totalt ${a} röda, ${b} blåa).` : `What is the probability of picking two blue in a row? (Total ${a} red, ${b} blue).`,
                answerType: 'fraction'
            },
            token: this.toBase64(this.rawFraction(b * (b - 1), total * (total - 1))),
            clues: [{ text: why, latex: `\\frac{${b}}{${total}} \\cdot \\frac{${b-1}}{${total-1}}` }],
            metadata: { variation_key: 'chain_fixed_order', difficulty: 3 }
        };
    }

    // --- LEVEL 7: COMBINATORICS ---
    private level7_Combinatorics(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['comb_constraint', 'comb_handshake']);

        if (v === 'comb_constraint') {
            const c1 = MathUtils.randomInt(3, 6), c2 = MathUtils.randomInt(2, 5);
            const why = lang === 'sv' 
                ? `Multiplicera antalet val för tröjor med antalet val för byxor för att hitta alla unika kombinationer.` 
                : `Multiply the number of choices for shirts by the number of choices for pants to find all unique combinations.`;

            return {
                renderData: {
                    description: lang === 'sv' ? `Du har ${c1} tröjor och ${c2} byxor. På hur många sätt kan du kombinera dem?` : `You have ${c1} shirts and ${c2} pants. In how many ways can you combine them?`,
                    answerType: 'numeric'
                },
                token: this.toBase64((c1 * c2).toString()),
                clues: [{ text: why, latex: `${c1} \\cdot ${c2} = ${c1*c2}` }],
                metadata: { variation_key: 'comb_constraint', difficulty: 3 }
            };
        }

        const n = MathUtils.randomInt(5, 12);
        const why = lang === 'sv' 
            ? `Varje person skakar hand med n-1 andra. Vi delar med 2 eftersom en handskakning räknas för två personer.` 
            : `Each person shakes hands with n-1 others. We divide by 2 because one handshake counts for two people.`;

        return {
            renderData: {
                description: lang === 'sv' ? `${n} personer skakar hand med alla på en fest. Hur många handskakningar sker?` : `${n} people shake hands with everyone at a party. How many handshakes occur?`,
                answerType: 'numeric'
            },
            token: this.toBase64(((n * (n - 1)) / 2).toString()),
            clues: [{ text: why, latex: `\\frac{${n} \\cdot (${n}-1)}{2} = ${ (n*(n-1))/2 }` }],
            metadata: { variation_key: 'comb_handshake', difficulty: 3 }
        };
    }

    // --- LEVEL 8: COMPLEX PATHWAYS ---
    private level8_CombinatoricsComplex(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['pathways_basic', 'pathways_blocked', 'pathways_prob']);
        const layers = [1, MathUtils.randomInt(2, 3), MathUtils.randomInt(2, 3), 1];
        let totalPaths = 1;
        for (let i = 1; i < layers.length - 1; i++) totalPaths *= layers[i];

        const obstacles: any[] = [];
        if (v !== 'pathways_basic') {
            const possibleEdges = [];
            for (let l = 0; l < layers.length - 1; l++) {
                for (let f = 0; f < layers[l]; f++) {
                    for (let t = 0; t < layers[l+1]; t++) possibleEdges.push({ layer: l, from: f, to: t });
                }
            }
            obstacles.push(MathUtils.randomChoice(possibleEdges));
        }

        const validCount = this.countValidPaths(layers, obstacles);
        const ans = v === 'pathways_prob' ? this.rawFraction(validCount, totalPaths) : validCount.toString();

        const whyBasic = lang === 'sv' ? "Räkna hur många val du har i varje steg och multiplicera dem." : "Count how many choices you have at each step and multiply them.";

        return {
            renderData: {
                description: lang === 'sv' ? "Hur många vägar finns från A till B?" : "How many paths are there from A to B?",
                answerType: v === 'pathways_prob' ? 'fraction' : 'numeric',
                geometry: { type: 'probability_tree', subtype: 'pathway', layers, obstacles }
            },
            token: this.toBase64(ans),
            clues: [{ text: whyBasic, latex: v === 'pathways_prob' ? `\\frac{\\text{Öppna vägar}}{\\text{Totala vägar}} = \\frac{${validCount}}{${totalPaths}}` : `${layers[1]} \\cdot ${layers[2]} ...` }],
            metadata: { variation_key: v, difficulty: 5 }
        };
    }

    private countValidPaths(layers: number[], obstacles: any[]): number {
        const memo = new Map<string, number>();
        const find = (lIdx: number, nIdx: number): number => {
            if (lIdx === layers.length - 1) return 1;
            const key = `${lIdx}-${nIdx}`;
            if (memo.has(key)) return memo.get(key)!;
            let count = 0;
            for (let next = 0; next < layers[lIdx + 1]; next++) {
                if (!obstacles.some(o => o.layer === lIdx && o.from === nIdx && o.to === next)) {
                    count += find(lIdx + 1, next);
                }
            }
            memo.set(key, count);
            return count;
        };
        return find(0, 0);
    }
}