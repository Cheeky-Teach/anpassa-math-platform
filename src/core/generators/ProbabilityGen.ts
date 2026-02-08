import { MathUtils } from '../utils/MathUtils.js';

export class ProbabilityGen {
    // --- CONTEXT LIBRARY ---
    private static readonly SCENARIOS = {
        containers: [
            { sv: "en påse", en: "a bag" },
            { sv: "en urna", en: "an urn" },
            { sv: "en glasburk", en: "a glass jar" },
            { sv: "en låda", en: "a box" },
            { sv: "en skål", en: "a bowl" }
        ],
        items: [
            { sv: ["röda", "blåa", "gröna"], en: ["red", "blue", "green"], type: "marbles" },
            { sv: ["sura", "söta", "starka"], en: ["sour", "sweet", "spicy"], type: "candies" },
            { sv: ["vuxna", "barn", "pensionärer"], en: ["adults", "children", "seniors"], type: "people" },
            { sv: ["elbilar", "bensinbilar", "hybridbilar"], en: ["electric", "petrol", "hybrid"], type: "cars" },
            { sv: ["äpplen", "bananer", "päron"], en: ["apples", "bananas", "pears"], type: "fruits" },
            { sv: ["spader", "hjärter", "klöver"], en: ["spades", "hearts", "clubs"], type: "cards" }
        ],
        lotteries: [
            { sv: "Lotteri Alfa", en: "Lottery Alpha" },
            { sv: "Lotteri Beta", en: "Lottery Beta" },
            { sv: "Spelhjul X", en: "Spinner X" },
            { sv: "Spelhjul Y", en: "Spinner Y" }
        ],
        likelihood: [
            { category: 'impossible', sv: ["att slå en 7:a med en vanlig tärning", "att en triangel har 4 hörn", "att det snöar vid +40 grader"], en: ["rolling a 7 on a standard die", "a triangle having 4 corners", "it snowing at +40°C"], val: 0 },
            { category: 'certain', sv: ["att solen går upp imorgon", "att få krona eller klave vid ett myntkast", "att slå under 7 med en tärning"], en: ["the sun rising tomorrow", "getting heads or tails on a coin flip", "rolling under 7 on a die"], val: 1 },
            { category: 'even', sv: ["att få krona vid slantsingling", "att slå ett jämnt tal med en tärning", "att dra ett rött kort ur en kortlek"], en: ["getting heads on a coin toss", "rolling an even number on a die", "picking a red card from a deck"], val: 0.5 }
        ],
        atLeastOne: [
            { sv: "ett frö gror", en: "a seed sprouts", denoms: [2, 3, 4, 5] },
            { sv: "en skytt träffar målet", en: "a shooter hits the target", denoms: [2, 3, 5, 10] },
            { sv: "en lott ger vinst", en: "a ticket is a winner", denoms: [4, 5, 10, 20] }
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

    /**
     * Phase 2: Targeted Generation
     */
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
            const sections = MathUtils.randomChoice([4, 6, 8, 10]);
            const winSections = MathUtils.randomInt(1, sections / 2);
            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Ett lyckohjul är uppdelat i ${sections} lika stora fält. ${winSections} av fälten ger vinst. Vad är sannolikheten att du vinner på ett snurr?` 
                        : `A spinner is divided into ${sections} equal sections. ${winSections} of the sections result in a win. What is the probability that you win on one spin?`,
                    answerType: 'fraction',
                    geometry: { type: 'probability_spinner', sections }
                },
                token: this.toBase64(this.rawFraction(winSections, sections)),
                clues: [{ text: lang === 'sv' ? "Sannolikheten beräknas genom att dela antalet vinstfält med det totala antalet fält på hjulet." : "Probability is calculated by dividing the number of winning sections by the total number of sections on the wheel.", latex: `P = \\frac{${winSections}}{${sections}}` }],
                metadata: { variation_key: 'visual_spinner', difficulty: 1 }
            };
        }

        if (v === 'visual_not') {
            const targetIdx = MathUtils.randomInt(0, 2);
            const ansCount = total - counts[targetIdx];
            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `I ${container.sv} finns totalt ${total} kulor. Om du drar en kula utan att titta, vad är sannolikheten att du INTE får en ${labels[targetIdx].toLowerCase()} kula?` 
                        : `In ${container.en}, there are ${total} marbles. If you pick one without looking, what is the probability that you do NOT pick a ${labels[targetIdx].toLowerCase()} marble?`,
                    answerType: 'fraction',
                    geometry: { type: 'probability_marbles', items: { red: counts[0], blue: counts[1], green: counts[2] } }
                },
                token: this.toBase64(this.rawFraction(ansCount, total)),
                clues: [
                    { text: lang === 'sv' ? "Sannolikheten för 'inte' innebär att vi räknar alla kulor som har en annan färg än den som nämns." : "The probability of 'not' means we count all marbles that have a color other than the one mentioned.", latex: `${total} - ${counts[targetIdx]} = ${ansCount}` },
                    { text: lang === 'sv' ? "Dela sedan antalet 'giltiga' kulor med det totala antalet." : "Then divide the number of 'valid' marbles by the total number.", latex: `\\frac{${ansCount}}{${total}}` }
                ],
                metadata: { variation_key: 'visual_not', difficulty: 2 }
            };
        }

        if (v === 'visual_or') {
            const idx1 = 0, idx2 = 1;
            const ansCount = counts[idx1] + counts[idx2];
            return {
                renderData: {
                    description: lang === 'sv'
                        ? `Du ska dra en kula ur en samling. Hur stor är sannolikheten att du får antingen en ${labels[idx1].toLowerCase()} eller en ${labels[idx2].toLowerCase()} kula?`
                        : `You are picking a marble from a collection. What is the probability that you get either a ${labels[idx1].toLowerCase()} or a ${labels[idx2].toLowerCase()} marble?`,
                    answerType: 'fraction',
                    geometry: { type: 'probability_marbles', items: { red: counts[0], blue: counts[1], green: counts[2] } }
                },
                token: this.toBase64(this.rawFraction(ansCount, total)),
                clues: [{ text: lang === 'sv' ? "När vi söker sannolikheten för 'antingen eller' adderar vi antalet önskade kulor från båda grupperna." : "When seeking the probability for 'either or', we add the number of desired marbles from both groups.", latex: `${counts[idx1]} + ${counts[idx2]} = ${ansCount}` }],
                metadata: { variation_key: 'visual_or', difficulty: 2 }
            };
        }

        const target = MathUtils.randomInt(0, 2);
        return {
            renderData: {
                description: lang === 'sv' ? `Studera kulorna i behållaren. Om du drar en slumpmässig kula, vad är sannolikheten att den är ${labels[target].toLowerCase()}?` : `Study the marbles in the container. If you pick a random marble, what is the probability that it is ${labels[target].toLowerCase()}?`,
                answerType: 'fraction',
                geometry: { type: 'probability_marbles', items: { red: counts[0], blue: counts[1], green: counts[2] } }
            },
            token: this.toBase64(this.rawFraction(counts[target], total)),
            clues: [{ text: lang === 'sv' ? "Sannolikhet beräknas alltid som antalet önskade utfall (vinst) delat med det totala antalet möjliga utfall." : "Probability is always calculated as the number of desired outcomes (wins) divided by the total number of possible outcomes.", latex: `\\frac{${counts[target]}}{${total}}` }],
            metadata: { variation_key: 'visual_calc', difficulty: 1 }
        };
    }

    // --- LEVEL 2: GROUPS & RATIOS ---
    private level2_StandardGroups(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['group_ratio', 'group_ternary']);
        const ctx = MathUtils.randomChoice(ProbabilityGen.SCENARIOS.items);
        const labels = lang === 'sv' ? ctx.sv : ctx.en;

        if (v === 'group_ratio') {
            const r1 = MathUtils.randomInt(1, 5), r2 = MathUtils.randomInt(1, 5);
            const total = r1 + r2;
            return {
                renderData: { 
                    description: lang === 'sv' 
                        ? `I en samling är förhållandet mellan ${labels[0]} och ${labels[1]} exakt ${r1}:${r2}. Vad är sannolikheten att slumpmässigt välja en ${labels[0]}?` 
                        : `In a collection, the ratio of ${labels[0]} to ${labels[1]} is ${r1}:${r2}. What is the probability of randomly picking a ${labels[0]}?`, 
                    answerType: 'fraction' 
                },
                token: this.toBase64(this.rawFraction(r1, total)),
                clues: [
                    { text: lang === 'sv' ? "Förhållandet visar hur många 'delar' det finns av varje sort. Räkna först ut det totala antalet delar." : "The ratio shows how many 'parts' there are of each type. First, calculate the total number of parts.", latex: `${r1} + ${r2} = ${total}` },
                    { text: lang === 'sv' ? "Sannolikheten är antalet delar av den sort du söker genom det totala antalet delar." : "The probability is the number of parts of the type you seek divided by the total number of parts.", latex: `\\frac{${r1}}{${total}}` }
                ],
                metadata: { variation_key: 'group_ratio', difficulty: 3 }
            };
        }

        const a = MathUtils.randomInt(4, 10), b = MathUtils.randomInt(4, 10), extra = MathUtils.randomInt(4, 10);
        const total = a + b + extra;
        return {
            renderData: { 
                description: lang === 'sv' 
                    ? `I en låda finns totalt ${total} föremål. ${a} stycken är ${labels[0]} och ${b} stycken är ${labels[1]}. Resten är ${labels[2]}. Vad är sannolikheten att få en ${labels[2]}?` 
                    : `In a box, there are ${total} items in total. ${a} are ${labels[0]} and ${b} are ${labels[1]}. The rest are ${labels[2]}. What is the probability of picking a ${labels[2]}?`, 
                answerType: 'fraction' 
            },
            token: this.toBase64(this.rawFraction(extra, total)),
            clues: [{ text: lang === 'sv' ? `Börja med att ta reda på hur många ${labels[2]} det finns genom att dra bort de andra från totalen.` : `Start by finding out how many ${labels[2]} there are by subtracting the others from the total.`, latex: `${total} - (${a} + ${b}) = ${extra}` }],
            metadata: { variation_key: 'group_ternary', difficulty: 2 }
        };
    }

    // --- LEVEL 3: CONCEPTS & LOGIC ---
    private level3_ConceptsAndLogic(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['concept_compare', 'concept_validity', 'concept_likelihood']);

        if (v === 'concept_likelihood') {
            const cat = MathUtils.randomChoice(['impossible', 'certain', 'even']);
            const scenario = MathUtils.randomChoice(ProbabilityGen.SCENARIOS.likelihood.find(x => x.category === cat)!.sv);
            const scenarioEn = MathUtils.randomChoice(ProbabilityGen.SCENARIOS.likelihood.find(x => x.category === cat)!.en);
            const labelSv = cat === 'impossible' ? "Omöjligt" : (cat === 'certain' ? "Säkert" : "Hälften/Hälften");
            const labelEn = cat === 'impossible' ? "Impossible" : (cat === 'certain' ? "Certain" : "Even chance");

            return {
                renderData: {
                    description: lang === 'sv' ? `Hur skulle du beskriva sannolikheten för följande händelse: ${scenario}?` : `How would you describe the probability of the following event: ${scenarioEn}?`,
                    answerType: 'multiple_choice',
                    options: lang === 'sv' ? ["Omöjligt", "Säkert", "Hälften/Hälften"] : ["Impossible", "Certain", "Even chance"]
                },
                token: this.toBase64(lang === 'sv' ? labelSv : labelEn),
                clues: [{ text: lang === 'sv' ? "Sannolikhet 0 betyder att något aldrig kan hända, medan 1 betyder att det garanterat händer." : "Probability 0 means something can never happen, while 1 means it is guaranteed to happen." }],
                metadata: { variation_key: 'concept_likelihood', difficulty: 1 }
            };
        }

        if (v === 'concept_compare') {
            const aN = 1, aD = 4, bN = 2, bD = 5;
            const l1 = MathUtils.randomChoice(ProbabilityGen.SCENARIOS.lotteries);
            const l2 = MathUtils.randomChoice(ProbabilityGen.SCENARIOS.lotteries.filter(x => x !== l1));
            const options = lang === 'sv' ? [l1.sv, l2.sv, "Lika stor"] : [l1.en, l2.en, "Equal"];
            const ans = (bN / bD) > (aN / aD) ? options[1] : options[0];

            return {
                renderData: {
                    description: lang === 'sv' ? `Var är chansen störst att vinna: I ${l1.sv} (vinstchans ${aN}/${aD}) eller i ${l2.sv} (vinstchans ${bN}/${bD})?` : `Where is the best chance to win: In ${l1.en} (chance ${aN}/${aD}) or in ${l2.en} (chance ${bN}/${bD})?`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle(options)
                },
                token: this.toBase64(ans),
                clues: [{ text: lang === 'sv' ? "Gör om bråken till decimaltal eller procent för att lättare se vilket som är störst." : "Convert the fractions to decimals or percentages to more easily see which is largest.", latex: `\\frac{1}{4} = 0,25 \\quad \\text{vs} \\quad \\frac{2}{5} = 0,40` }],
                metadata: { variation_key: 'concept_compare', difficulty: 3 }
            };
        }

        const valid = "0.75";
        return {
            renderData: {
                description: lang === 'sv' ? "Vilket av följande värden är en korrekt angiven sannolikhet?" : "Which of the following values is a correctly stated probability?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([valid, "1.5", "-0.1", "110%"])
            },
            token: this.toBase64(valid),
            clues: [{ text: lang === 'sv' ? "En sannolikhet kan aldrig vara mindre än 0 eller större än 1 (100%)." : "A probability can never be less than 0 or greater than 1 (100%)." }],
            metadata: { variation_key: 'concept_validity', difficulty: 1 }
        };
    }

    // --- LEVEL 4: COMPLEMENTARY ---
    private level4_Complementary(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['comp_at_least', 'comp_multi', 'comp_lie']);
        const scenario = MathUtils.randomChoice(ProbabilityGen.SCENARIOS.atLeastOne);
        const d = MathUtils.randomChoice(scenario.denoms);

        if (v === 'comp_at_least') {
            const trials = 2;
            const pNoneN = Math.pow(d - 1, trials);
            const pNoneD = Math.pow(d, trials);
            const ansN = pNoneD - pNoneN;

            return {
                renderData: {
                    description: lang === 'sv' ? `Chansen att ${scenario.sv} är 1/${d}. Om försöket görs ${trials} gånger, vad är sannolikheten att det lyckas MINST en gång?` : `The chance that ${scenario.en} is 1/${d}. If the attempt is made ${trials} times, what is the probability it succeeds AT LEAST once?`,
                    answerType: 'fraction'
                },
                token: this.toBase64(this.rawFraction(ansN, pNoneD)),
                clues: [
                    { text: lang === 'sv' ? "Tricket för 'minst en gång' är att först räkna ut risken att händelsen ALDRIG sker." : "The trick for 'at least once' is to first calculate the risk of the event NEVER happening.", latex: `P(\\text{Aldrig}) = (\\frac{${d-1}}{${d}})^2 = \\frac{${pNoneN}}{${pNoneD}}` },
                    { text: lang === 'sv' ? "Sannolikheten för minst en vinst är sedan 1 minus risken för ingen vinst." : "The probability for at least one win is then 1 minus the risk of no wins.", latex: `1 - \\frac{${pNoneN}}{${pNoneD}} = \\frac{${ansN}}{${pNoneD}}` }
                ],
                metadata: { variation_key: 'comp_at_least', difficulty: 4 }
            };
        }

        if (v === 'comp_lie') {
            const p1 = 0.3, p2 = 0.4, p3 = 0.3;
            const lie = lang === 'sv' ? "Summan av alla utfall kan bli 1.5" : "The sum of all outcomes can be 1.5";
            return {
                renderData: {
                    description: lang === 'sv' ? "Vilket påstående om komplementhändelser är FALSKT?" : "Which statement about complementary events is FALSE?",
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([lie, lang === 'sv' ? "Summan av alla utfall är alltid 1" : "The sum of all outcomes is always 1", lang === 'sv' ? "P(A) + P(inte A) = 1" : "P(A) + P(not A) = 1"])
                },
                token: this.toBase64(lie),
                clues: [{ text: lang === 'sv' ? "I ett slumpförsök måste summan av sannolikheterna för alla möjliga utfall alltid bli exakt 1 (100%)." : "In a random experiment, the sum of probabilities for all possible outcomes must always be exactly 1 (100%)." }],
                metadata: { variation_key: 'comp_lie', difficulty: 2 }
            };
        }

        const pA = MathUtils.randomInt(2, 6) * 10, pB = MathUtils.randomInt(1, 3) * 10;
        const pRest = 100 - pA - pB;
        return {
            renderData: {
                description: lang === 'sv' ? `I ett lotteri är chansen för storvinst ${pA}% och småvinst ${pB}%. Vad är sannolikheten att man INTE vinner någonting?` : `In a lottery, the chance for a big prize is ${pA}% and a small prize is ${pB}%. What is the probability of NOT winning anything?`,
                answerType: 'numeric', suffix: '%'
            },
            token: this.toBase64(pRest.toString()),
            clues: [{ text: lang === 'sv' ? "Addera alla vinstchanser och dra bort summan från 100%." : "Add all winning chances and subtract the sum from 100%.", latex: `100\\% - (${pA}\\% + ${pB}\\%) = ${pRest}\\%` }],
            metadata: { variation_key: 'comp_multi', difficulty: 2 }
        };
    }

    // --- LEVEL 5: PROBABILITY TREES ---
    private level5_ProbabilityTree(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['tree_missing', 'tree_calc']);
        const d1 = MathUtils.randomInt(2, 3), d2 = MathUtils.randomInt(3, 5);
        const dTot = d1 * d2;

        if (v === 'tree_missing') {
            return {
                renderData: {
                    description: lang === 'sv' ? `En gren i ett sannolikhetsträd slutar på sannolikheten 1/${dTot}. Om det första steget i grenen var 1/${d1}, vad var då sannolikheten i det andra steget?` : `A branch in a probability tree ends with the probability 1/${dTot}. If the first step in the branch was 1/${d1}, what was the probability in the second step?`,
                    answerType: 'fraction'
                },
                token: this.toBase64(this.rawFraction(1, d2)),
                clues: [{ text: lang === 'sv' ? "Sannolikheter längs en gren multipliceras. För att hitta en saknad del i en multiplikation använder vi division." : "Probabilities along a branch are multiplied. To find a missing part in a multiplication, we use division.", latex: `\\frac{1}{${dTot}} \\div \\frac{1}{${d1}} = \\frac{1}{${d2}}` }],
                metadata: { variation_key: 'tree_missing', difficulty: 3 }
            };
        }

        const c1 = 3, c2 = 4, tot = 7;
        return {
            renderData: {
                description: lang === 'sv' ? `Du drar två föremål ur en behållare utan att lägga tillbaka det första. Det finns ${c1} stycken A och ${c2} stycken B. Vad är sannolikheten att dra först en A och sedan en B?` : `You pick two items from a container without replacing the first one. There are ${c1} of type A and ${c2} of type B. What is the probability of picking first an A and then a B?`,
                answerType: 'fraction',
                geometry: { type: 'probability_tree', groups: ["A", "B"], initialCounts: [c1, c2], targetBranch: 's2_1' }
            },
            token: this.toBase64(this.rawFraction(c1 * c2, tot * (tot - 1))),
            clues: [{ text: lang === 'sv' ? "Multiplicera chansen för första draget med chansen för det andra. Kom ihåg att totala antalet föremål minskar med 1." : "Multiply the chance of the first draw by the chance of the second. Remember that the total number of items decreases by 1.", latex: `\\frac{${c1}}{${tot}} \\cdot \\frac{${c2}}{${tot-1}}` }],
            metadata: { variation_key: 'tree_calc', difficulty: 3 }
        };
    }

    // --- LEVEL 6: EVENT CHAINS ---
    private level6_EventChains(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['chain_any_order', 'chain_fixed_order']);
        const a = 4, b = 5, total = 9;

        if (v === 'chain_any_order') {
            const n = (a * b) * 2, d = total * (total - 1);
            return {
                renderData: {
                    description: lang === 'sv' ? `I en skål finns ${a} röda och ${b} blåa frukter. Om du drar två frukter utan återläggning, vad är sannolikheten att du får en av varje färg?` : `In a bowl there are ${a} red and ${b} blue fruits. If you pick two fruits without replacement, what is the probability that you get one of each color?`,
                    answerType: 'fraction'
                },
                token: this.toBase64(this.rawFraction(n, d)),
                clues: [
                    { text: lang === 'sv' ? "Det finns två möjliga sätt att vinna: (Röd sen Blå) eller (Blå sen Röd)." : "There are two possible ways to win: (Red then Blue) or (Blue then Red)." },
                    { text: lang === 'sv' ? "Beräkna sannolikheten för båda vägarna och addera dem." : "Calculate the probability for both paths and add them together.", latex: `2 \\cdot (\\frac{${a}}{${total}} \\cdot \\frac{${b}}{${total-1}})` }
                ],
                metadata: { variation_key: 'chain_any_order', difficulty: 4 }
            };
        }

        return {
            renderData: {
                description: lang === 'sv' ? `Sannolikheten att dra två blåa föremål i rad utan återläggning? (Totalt finns ${a} röda och ${b} blåa).` : `Probability of picking two blue items in a row without replacement? (There are ${a} red and ${b} blue total).`,
                answerType: 'fraction'
            },
            token: this.toBase64(this.rawFraction(b * (b - 1), total * (total - 1))),
            clues: [{ text: lang === 'sv' ? "Vid dragning av samma färg minskar både antalet blåa föremål och det totala antalet inför det andra draget." : "When drawing the same color, both the number of blue items and the total number decrease before the second draw.", latex: `\\frac{${b}}{${total}} \\cdot \\frac{${b-1}}{${total-1}}` }],
            metadata: { variation_key: 'chain_fixed_order', difficulty: 3 }
        };
    }

    // --- LEVEL 7: COMBINATORICS ---
    private level7_Combinatorics(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['comb_constraint', 'comb_handshake']);

        if (v === 'comb_constraint') {
            const c1 = MathUtils.randomInt(3, 5), c2 = MathUtils.randomInt(2, 4);
            return {
                renderData: {
                    description: lang === 'sv' ? `Du ska välja en outfit. Du har ${c1} olika tröjor och ${c2} olika byxor att välja mellan. På hur många unika sätt kan du kombinera dina kläder?` : `You are choosing an outfit. You have ${c1} different shirts and ${c2} different pants to choose from. In how many unique ways can you combine your clothes?`,
                    answerType: 'numeric'
                },
                token: this.toBase64((c1 * c2).toString()),
                clues: [{ text: lang === 'sv' ? "För att hitta totala antalet kombinationer multiplicerar vi antalet val i varje kategori med varandra." : "To find the total number of combinations, we multiply the number of choices in each category with each other.", latex: `${c1} \\cdot ${c2} = ${c1*c2}` }],
                metadata: { variation_key: 'comb_constraint', difficulty: 3 }
            };
        }

        const n = MathUtils.randomInt(5, 10);
        return {
            renderData: {
                description: lang === 'sv' ? `${n} personer träffas på en fest och alla skakar hand med alla precis en gång. Hur många handskakningar sker totalt?` : `${n} people meet at a party and everyone shakes hands with everyone exactly once. How many handshakes occur in total?`,
                answerType: 'numeric'
            },
            token: this.toBase64(((n * (n - 1)) / 2).toString()),
            clues: [{ text: lang === 'sv' ? "Vi använder formeln för att räkna unika par: n(n-1)/2. Vi delar med 2 eftersom en handskakning sker mellan två personer samtidigt." : "We use the formula for counting unique pairs: n(n-1)/2. We divide by 2 because a handshake happens between two people simultaneously.", latex: `\\frac{${n} \\cdot (${n}-1)}{2}` }],
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

        let desc = lang === 'sv' ? "Diagrammet visar vägar mellan A och B. På hur många sätt kan man gå hela vägen?" : "The diagram shows paths between A and B. In how many ways can you travel the whole distance?";
        if (v === 'pathways_blocked') desc = lang === 'sv' ? "Röda kryss markerar blockerade stigar. Hur många fungerande vägar finns kvar från A till B?" : "Red marks indicate blocked paths. How many working paths remain from A to B?";
        if (v === 'pathways_prob') desc = lang === 'sv' ? "Om du väljer en väg helt slumpmässigt, vad är sannolikheten att just den vägen är öppen hela vägen?" : "If you choose a path completely at random, what is the probability that the specific path is open all the way?";

        return {
            renderData: {
                description: desc,
                answerType: v === 'pathways_prob' ? 'fraction' : 'numeric',
                geometry: { type: 'probability_tree', subtype: 'pathway', layers, obstacles }
            },
            token: this.toBase64(ans),
            clues: [{ text: lang === 'sv' ? "Multiplicera antalet val i varje steg för att få totalen. Vid blockeringar räknar du endast de vägar som inte passerar ett kryss." : "Multiply the number of choices at each step to get the total. For blockages, count only the paths that do not pass through a cross." }],
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