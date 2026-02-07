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
            { category: 'impossible', sv: ["slå en 7:a med en vanlig tärning", "att en triangel har 4 hörn", "att det snöar vid +40 grader"], en: ["rolling a 7 on a standard die", "a triangle having 4 corners", "it snowing at +40°C"], val: 0 },
            { category: 'certain', sv: ["att solen går upp imorgon", "att få krona eller klave vid ett kast", "att slå under 7 med en tärning"], en: ["the sun rising tomorrow", "getting heads or tails on a flip", "rolling under 7 on a die"], val: 1 },
            { category: 'even', sv: ["att få krona vid slantsingling", "att slå ett jämnt tal med en tärning", "att dra ett rött kort ur en kortlek"], en: ["getting heads when flipping a coin", "rolling an even number on a die", "picking a red card from a deck"], val: 0.5 }
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

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    private simplifyFraction(n: number, d: number): string {
        const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
        const divisor = gcd(n, d);
        return `${n / divisor}/${d / divisor}`;
    }

    // --- LEVEL 1: Visuals & Linguistic Logic ---
    private level1_Visuals(lang: string): any {
        const variation = Math.random();
        const counts = [MathUtils.randomInt(2, 5), MathUtils.randomInt(2, 5), MathUtils.randomInt(1, 4)];
        const total = counts.reduce((a, b) => a + b, 0);
        const labels = lang === 'sv' ? ["Röd", "Blå", "Grön"] : ["Red", "Blue", "Green"];
        const container = MathUtils.randomChoice(ProbabilityGen.SCENARIOS.containers);

        if (variation < 0.33) {
            // Variation: "NOT" Logic
            const targetIdx = MathUtils.randomInt(0, 2);
            const ansCount = total - counts[targetIdx];
            const desc = lang === 'sv' 
                ? `I ${container.sv} finns det totalt ${total} kulor. Om du drar en kula utan att titta, vad är sannolikheten att du INTE får en ${labels[targetIdx].toLowerCase()} kula?` 
                : `In ${container.en}, there are ${total} marbles in total. If you pick a marble without looking, what is the probability that you do NOT pick a ${labels[targetIdx].toLowerCase()} marble?`;
            
            return {
                renderData: {
                    description: desc,
                    answerType: 'fraction',
                    geometry: { type: 'probability_marbles', items: { red: counts[0], blue: counts[1], green: counts[2] } }
                },
                token: this.toBase64(this.simplifyFraction(ansCount, total)),
                clues: [
                    { text: lang === 'sv' ? "Sannolikheten för 'inte röd' omfattar alla utfall som inte är just röda." : "The probability of 'not red' covers all outcomes that are anything but red.", latex: "" },
                    { text: lang === 'sv' ? "Räkna ihop antalet kulor som har andra färger." : "Sum up the number of marbles that have other colors.", latex: `${total} - ${counts[targetIdx]} = ${ansCount}` },
                    { text: lang === 'sv' ? "Dela sedan det antalet med det totala antalet kulor." : "Then divide that count by the total number of marbles.", latex: `\\frac{${ansCount}}{${total}}` }
                ],
                metadata: { variation: 'visual_not', difficulty: 2 }
            };
        }

        if (variation < 0.66) {
            // Variation: "OR" Logic
            const idx1 = 0, idx2 = 1;
            const ansCount = counts[idx1] + counts[idx2];
            const desc = lang === 'sv'
                ? `Du ska dra en kula ur en burk med färgade kulor. Hur stor är sannolikheten att du får antingen en ${labels[idx1].toLowerCase()} eller en ${labels[idx2].toLowerCase()} kula?`
                : `You are going to pick a marble from a jar of colored marbles. What is the probability that you get either a ${labels[idx1].toLowerCase()} or a ${labels[idx2].toLowerCase()} marble?`;

            return {
                renderData: {
                    description: desc,
                    answerType: 'fraction',
                    geometry: { type: 'probability_marbles', items: { red: counts[0], blue: counts[1], green: counts[2] } }
                },
                token: this.toBase64(this.simplifyFraction(ansCount, total)),
                clues: [
                    { text: lang === 'sv' ? "När vi söker sannolikheten för 'A eller B' lägger vi ihop antalen för båda dessa färger." : "When seeking the probability for 'A or B', we add the counts for both of these colors.", latex: `${counts[idx1]} + ${counts[idx2]} = ${ansCount}` },
                    { text: lang === 'sv' ? "Sannolikheten beräknas som summan av de önskade kulorna delat med det hela." : "The probability is calculated as the sum of the desired marbles divided by the whole.", latex: `\\frac{${ansCount}}{${total}}` }
                ],
                metadata: { variation: 'visual_or', difficulty: 2 }
            };
        }

        // Standard Visual Calculation
        const target = MathUtils.randomInt(0, 2);
        const desc = lang === 'sv'
            ? `Titta på kulorna i behållaren. Om du blundar och tar en kula, hur stor är sannolikheten att den är ${labels[target].toLowerCase()}?`
            : `Look at the marbles in the container. If you close your eyes and pick a marble, what is the probability that it is ${labels[target].toLowerCase()}?`;
        
        return {
            renderData: {
                description: desc,
                answerType: 'fraction',
                geometry: { type: 'probability_marbles', items: { red: counts[0], blue: counts[1], green: counts[2] } }
            },
            token: this.toBase64(this.simplifyFraction(counts[target], total)),
            clues: [
                { text: lang === 'sv' ? "Räkna först hur många kulor det finns av den efterfrågade färgen." : "First, count how many marbles there are of the requested color.", latex: "" },
                { text: lang === 'sv' ? "Dela sedan det antalet med det totala antalet kulor i behållaren." : "Then divide that count by the total number of marbles in the container.", latex: `\\frac{${counts[target]}}{${total}}` }
            ],
            metadata: { variation: 'visual_calc', difficulty: 1 }
        };
    }

    // --- LEVEL 2: Ratios & Ternary Logic ---
    private level2_StandardGroups(lang: string): any {
        const variation = Math.random();
        const ctx = MathUtils.randomChoice(ProbabilityGen.SCENARIOS.items);
        const labels = lang === 'sv' ? ctx.sv : ctx.en;

        if (variation < 0.5) {
            // Ratio Logic
            const r1 = MathUtils.randomInt(1, 4), r2 = MathUtils.randomInt(1, 4);
            const totalParts = r1 + r2;
            const desc = lang === 'sv' 
                ? `I en samling är förhållandet mellan ${labels[0]} och ${labels[1]} exakt ${r1}:${r2}. Om du väljer en slumpmässigt, vad är sannolikheten att det är en ${labels[0]}?` 
                : `In a collection, the ratio of ${labels[0]} to ${labels[1]} is exactly ${r1}:${r2}. If you choose one at random, what is the probability that it is a ${labels[0]}?`;
            
            return {
                renderData: {
                    description: desc,
                    answerType: 'fraction'
                },
                token: this.toBase64(this.simplifyFraction(r1, totalParts)),
                clues: [
                    { text: lang === 'sv' ? "Ett förhållande visar hur delarna fördelar sig. För att få sannolikheten behöver vi först veta det totala antalet delar." : "A ratio shows how the parts are distributed. To get the probability, we first need to know the total number of parts.", latex: `${r1} + ${r2} = ${totalParts}` },
                    { text: lang === 'sv' ? "Sannolikheten är sedan andelen av den specifika delen i förhållande till helheten." : "The probability is then the share of that specific part in relation to the whole.", latex: `\\frac{${r1}}{${totalParts}}` }
                ],
                metadata: { variation: 'group_ratio', difficulty: 3 }
            };
        }

        // Ternary Missing Logic
        const a = MathUtils.randomInt(5, 12), b = MathUtils.randomInt(5, 12);
        const total = a + b + MathUtils.randomInt(5, 15);
        const c = total - (a + b);
        const desc = lang === 'sv'
            ? `Det finns totalt ${total} ${ctx.sv[0] === 'äpplen' ? 'frukter' : ctx.type} i en låda. Av dessa är ${a} stycken ${labels[0]} och ${b} stycken ${labels[1]}. De övriga är ${labels[2]}. Hur stor är sannolikheten att en slumpmässigt vald är en ${labels[2]}?`
            : `There are a total of ${total} ${ctx.en[0] === 'apples' ? 'fruits' : ctx.type} in a box. Of these, ${a} are ${labels[0]} and ${b} are ${labels[1]}. The rest are ${labels[2]}. What is the probability that a randomly chosen one is a ${labels[2]}?`;

        return {
            renderData: {
                description: desc,
                answerType: 'fraction'
            },
            token: this.toBase64(this.simplifyFraction(c, total)),
            clues: [
                { text: lang === 'sv' ? "Räkna först ut hur många det finns i den tredje gruppen genom att dra bort de kända grupperna från totalen." : "First calculate how many are in the third group by subtracting the known groups from the total.", latex: `${total} - (${a} + ${b}) = ${c}` },
                { text: lang === 'sv' ? "Sannolikheten beräknas sedan genom att dela gruppens antal med det totala antalet." : "The probability is then calculated by dividing the group count by the total count.", latex: `\\frac{${c}}{${total}}` }
            ],
            metadata: { variation: 'group_ternary', difficulty: 2 }
        };
    }

    // --- LEVEL 3: Concepts & Comparative Logic ---
    private level3_ConceptsAndLogic(lang: string): any {
        const variation = Math.random();

        if (variation < 0.4) {
            // System Comparison
            const l1 = MathUtils.randomChoice(ProbabilityGen.SCENARIOS.lotteries);
            const l2 = MathUtils.randomChoice(ProbabilityGen.SCENARIOS.lotteries.filter(l => l !== l1));
            
            const aN = MathUtils.randomInt(1, 3), aD = MathUtils.randomChoice([4, 5]);
            const bN = aN * 2, bD = aD * 2 + MathUtils.randomChoice([-1, 0, 1]);
            const p1 = aN / aD, p2 = bN / bD;

            const desc = lang === 'sv' 
                ? `Vi jämför två system. I ${l1.sv} är chansen för vinst ${aN} av ${aD}. I ${l2.sv} är chansen ${bN} av ${bD}. Vid vilket system är sannolikheten för vinst högst?` 
                : `We are comparing two systems. In ${l1.en}, the chance of winning is ${aN} out of ${aD}. In ${l2.en}, the chance is ${bN} out of ${bD}. In which system is the probability of winning highest?`;
            
            const options = lang === 'sv' ? [l1.sv, l2.sv, "Lika stor"] : [l1.en, l2.en, "Equal chance"];
            const ans = p1 > p2 ? options[0] : (p2 > p1 ? options[1] : options[2]);

            return {
                renderData: { description: desc, answerType: 'multiple_choice', options: MathUtils.shuffle(options) },
                token: this.toBase64(ans),
                clues: [
                    { text: lang === 'sv' ? "För att jämföra sannolikheter är det lättast att göra om bråken till decimaltal eller hitta en gemensam nämnare." : "To compare probabilities, it's easiest to convert the fractions to decimals or find a common denominator.", latex: "" },
                    { text: lang === 'sv' ? "Beräkna värdet för varje system." : "Calculate the value for each system.", latex: `\\frac{${aN}}{${aD}} = ${p1.toFixed(2)} \\quad \\text{vs} \\quad \\frac{${bN}}{${bD}} = ${p2.toFixed(2)}` }
                ],
                metadata: { variation: 'concept_compare', difficulty: 3 }
            };
        }

        // Validity Check
        const valid = MathUtils.randomFloat(0.1, 0.9, 1).toString();
        const invalid = MathUtils.randomChoice(["1.4", "-0.1", "105%", "-10%"]);
        return {
            renderData: {
                description: lang === 'sv' ? "En matematiker har räknat ut chansen för en händelse. Vilket av dessa värden är ett matematiskt MÖJLIGT resultat för en sannolikhet?" : "A mathematician has calculated the chance of an event. Which of these values is a mathematically POSSIBLE result for a probability?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([valid, invalid, "3.0"])
            },
            token: this.toBase64(valid),
            clues: [{ text: lang === 'sv' ? "Kom ihåg huvudregeln: Sannolikhet mäts alltid på en skala från 0 (helt omöjligt) till 1 (helt säkert)." : "Remember the main rule: Probability is always measured on a scale from 0 (completely impossible) to 1 (completely certain).", latex: "0 \\le P \\le 1" }],
            metadata: { variation: 'concept_validity', difficulty: 1 }
        };
    }

    // --- LEVEL 4: Complementary & "At Least One" ---
    private level4_Complementary(lang: string): any {
        const variation = Math.random();
        const scenario = MathUtils.randomChoice(ProbabilityGen.SCENARIOS.atLeastOne);
        const d = MathUtils.randomChoice(scenario.denoms);

        if (variation < 0.5) {
            // General At Least One
            const trials = MathUtils.randomChoice([2, 3]);
            const pNoneN = Math.pow(d - 1, trials);
            const pNoneD = Math.pow(d, trials);
            const ansN = pNoneD - pNoneN;

            const desc = lang === 'sv' 
                ? `Anta att sannolikheten för att ${scenario.sv} är 1/${d}. Om experimentet utförs ${trials} gånger efter varandra, vad är sannolikheten att händelsen sker MINST en gång?` 
                : `Suppose the probability that ${scenario.en} is 1/${d}. If the experiment is performed ${trials} times in a row, what is the probability that the event happens AT LEAST once?`;

            return {
                renderData: {
                    description: desc,
                    answerType: 'fraction'
                },
                token: this.toBase64(`${ansN}/${pNoneD}`),
                clues: [
                    { text: lang === 'sv' ? "Istället för att räkna alla lyckade vägar är det enklare att räkna ut risken att händelsen ALDRIG sker, och sedan ta 'resten' upp till 1." : "Instead of counting all successful paths, it's simpler to calculate the risk that the event NEVER occurs, and then take 'the rest' up to 1.", latex: "" },
                    { text: lang === 'sv' ? `Beräkna sannolikheten att misslyckas ${trials} gånger i rad.` : `Calculate the probability of failing ${trials} times in a row.`, latex: "(\\frac{" + (d - 1) + "}{" + d + "})^" + trials + " = \\frac{" + pNoneN + "}{" + pNoneD + "}" },
                    { text: lang === 'sv' ? "Subtrahera detta från 1 (hela sannolikheten) för att få svaret." : "Subtract this from 1 (the full probability) to get the answer.", latex: "1 - \\frac{" + pNoneN + "}{" + pNoneD + "} = \\frac{" + ansN + "}{" + pNoneD + "}" }
                ],
                metadata: { variation: 'comp_at_least', difficulty: 4 }
            };
        }

        // Multi-outcome Complement
        const p1 = MathUtils.randomInt(2, 4) * 10, p2 = MathUtils.randomInt(1, 2) * 10;
        const p3 = 100 - (p1 + p2);
        const desc = lang === 'sv'
            ? `I en tävling beräknas chansen för att vinna guld vara ${p1}% och chansen för silver vara ${p2}%. Om vi antar att man inte kan vinna både och, vad är sannolikheten att man INTE vinner någon av dessa medaljer?`
            : `In a competition, the chance of winning gold is estimated at ${p1}% and the chance of silver at ${p2}%. Assuming one cannot win both, what is the probability of NOT winning either of these medals?`;

        return {
            renderData: {
                description: desc,
                answerType: 'numeric', suffix: '%'
            },
            token: this.toBase64(p3.toString()),
            clues: [
                { text: lang === 'sv' ? "Summan av alla möjliga utfall i en situation är alltid 100%. Komplementhändelsen är det som återstår." : "The sum of all possible outcomes in a situation is always 100%. The complementary event is what remains.", latex: "" },
                { text: lang === 'sv' ? "Addera de gynsamma chanserna och subtrahera summan från 100%." : "Add the favorable chances and subtract the sum from 100%.", latex: `100 - (${p1} + ${p2}) = ${p3}` }
            ],
            metadata: { variation: 'comp_multi', difficulty: 2 }
        };
    }

    // --- LEVEL 5: Probability Trees ---
    private level5_ProbabilityTree(lang: string): any {
        const variation = Math.random();
        const d1 = MathUtils.randomInt(2, 4), d2 = MathUtils.randomInt(2, 5);
        const dRes = d1 * d2;

        if (variation < 0.5) {
            // Missing Variable
            const desc = lang === 'sv'
                ? `I ett träddiagram slutar en specifik gren i den totala sannolikheten 1/${dRes}. Om det första steget i diagrammet har sannolikheten 1/${d1}, vilken sannolikhet måste då det andra steget ha?`
                : `In a tree diagram, a specific branch ends with a total probability of 1/${dRes}. If the first step in the diagram has a probability of 1/${d1}, what probability must the second step have?`;

            return {
                renderData: {
                    description: desc,
                    answerType: 'fraction',
                    latex: `\\frac{1}{${d1}} \\cdot x = \\frac{1}{${dRes}}`
                },
                token: this.toBase64(`1/${d2}`),
                clues: [
                    { text: lang === 'sv' ? "Eftersom man multiplicerar sannolikheter längs grenarna i ett träd, kan vi använda division för att räkna baklänges." : "Since probabilities are multiplied along branches in a tree, we can use division to calculate backwards.", latex: "" },
                    { text: lang === 'sv' ? "Dela den totala sannolikheten med det första stegets sannolikhet." : "Divide the total probability by the first step's probability.", latex: `x = \\frac{1}{${dRes}} \\div \\frac{1}{${d1}} = \\frac{1}{${d2}}` }
                ],
                metadata: { variation: 'tree_missing', difficulty: 3 }
            };
        }

        // Tree Calculation
        const c1 = MathUtils.randomInt(3, 5), c2 = MathUtils.randomInt(3, 5);
        const tot = c1 + c2;
        const desc = lang === 'sv'
            ? `Du ska dra två kulor ur en påse utan att lägga tillbaka den första kula du tar. Påsen innehåller ${c1} kulor av färg A och ${c2} kulor av färg B. Beräkna sannolikheten att du drar färg A först och sedan färg B.`
            : `You are going to pick two marbles from a bag without putting the first one back. The bag contains ${c1} marbles of color A and ${c2} marbles of color B. Calculate the probability that you pick color A first and then color B.`;

        return {
            renderData: {
                description: desc,
                answerType: 'fraction',
                geometry: { type: 'probability_tree', groups: ["A", "B"], initialCounts: [c1, c2], targetBranch: 's2_1' }
            },
            token: this.toBase64(this.simplifyFraction(c1 * c2, tot * (tot - 1))),
            clues: [
                { text: lang === 'sv' ? "Multiplicera sannolikheten för det första steget med sannolikheten för det andra steget." : "Multiply the probability for the first step by the probability for the second step.", latex: "" },
                { text: lang === 'sv' ? "Tänk på att det totala antalet kulor minskar med 1 efter det första draget." : "Keep in mind that the total number of marbles decreases by 1 after the first draw.", latex: `\\frac{${c1}}{${tot}} \\cdot \\frac{${c2}}{${tot - 1}}` }
            ],
            metadata: { variation: 'tree_calc', difficulty: 3 }
        };
    }

    // --- LEVEL 6: Event Chains (Any Order) ---
    private level6_EventChains(lang: string): any {
        const variation = Math.random();
        const a = MathUtils.randomInt(3, 5), b = MathUtils.randomInt(3, 5);
        const total = a + b;
        const ctx = MathUtils.randomChoice(ProbabilityGen.SCENARIOS.items);
        const labels = lang === 'sv' ? ctx.sv : ctx.en;

        if (variation < 0.6) {
            // Any Order
            const desc = lang === 'sv'
                ? `I en ask finns det ${a} ${labels[0]} och ${b} ${labels[1]} ${ctx.sv[0] === 'röda' ? 'kulor' : ctx.sv[0] === 'sura' ? 'godisbitar' : ctx.type}. Du drar två stycken slumpmässigt utan återläggning. Vad är sannolikheten att du får exakt en av varje sort (i valfri ordning)?`
                : `In a box, there are ${a} ${labels[0]} and ${b} ${labels[1]} ${ctx.en[0] === 'red' ? 'marbles' : ctx.en[0] === 'sour' ? 'candies' : ctx.type}. You pick two at random without replacement. What is the probability that you get exactly one of each kind (in any order)?`;

            const n = (a * b) * 2;
            const d = total * (total - 1);
            return {
                renderData: {
                    description: desc,
                    answerType: 'fraction'
                },
                token: this.toBase64(this.simplifyFraction(n, d)),
                clues: [
                    { text: lang === 'sv' ? "Det finns två olika sätt att lyckas: (Sort 1 sen Sort 2) ELLER (Sort 2 sen Sort 1)." : "There are two different ways to succeed: (Type 1 then Type 2) OR (Type 2 then Type 1).", latex: "" },
                    { text: lang === 'sv' ? "Räkna ut sannolikheten för båda dessa vägar och addera dem sedan." : "Calculate the probability for both of these paths and then add them together.", latex: `(\\frac{${a}}{${total}} \\cdot \\frac{${b}}{${total - 1}}) + (\\frac{${b}}{${total}} \\cdot \\frac{${a}}{${total - 1}})` }
                ],
                metadata: { variation: 'chain_any_order', difficulty: 4 }
            };
        }

        // Fixed Order
        const desc = lang === 'sv'
            ? `En behållare innehåller ${a} stycken ${labels[0]} och ${b} stycken ${labels[1]}. Om du tar ut två stycken utan att lägga tillbaka den första, vad är sannolikheten att båda är ${labels[1]}?`
            : `A container contains ${a} pieces of ${labels[0]} and ${b} pieces of ${labels[1]}. If you take out two without putting the first one back, what is the probability that both are ${labels[1]}?`;

        return {
            renderData: {
                description: desc,
                answerType: 'fraction'
            },
            token: this.toBase64(this.simplifyFraction(b * (b - 1), total * (total - 1))),
            clues: [
                { text: lang === 'sv' ? "Både antalet önskade objekt och det totala antalet i behållaren minskar med 1 inför det andra draget." : "Both the number of desired objects and the total number in the container decrease by 1 for the second draw.", latex: "" },
                { text: lang === 'sv' ? "Multiplicera sannolikheten för första och andra draget." : "Multiply the probability for the first and second draw.", latex: `\\frac{${b}}{${total}} \\cdot \\frac{${b - 1}}{${total - 1}}` }
            ],
            metadata: { variation: 'chain_fixed_order', difficulty: 3 }
        };
    }

    // --- LEVEL 7: Combinatorics & Constraints ---
    private level7_Combinatorics(lang: string): any {
        const variation = Math.random();

        if (variation < 0.5) {
            // Constrained Multi-set
            const c1 = MathUtils.randomInt(2, 4), c2 = MathUtils.randomInt(2, 4);
            const desc = lang === 'sv'
                ? `Du ska sätta ihop en outfit. Du kan välja mellan ${c1} olika tröjor och ${c2} olika par byxor, men du har bara ett par skor som fungerar. På hur många olika sätt kan du kombinera dina kläder?`
                : `You are putting together an outfit. You can choose between ${c1} different shirts and ${c2} different pairs of pants, but you only have one pair of shoes that works. In how many different ways can you combine your clothes?`;

            return {
                renderData: {
                    description: desc,
                    answerType: 'numeric'
                },
                token: this.toBase64((c1 * c2).toString()),
                clues: [{ text: lang === 'sv' ? "Multiplicera antalet valmöjligheter i varje kategori för att få det totala antalet kombinationer." : "Multiply the number of choices in each category to get the total number of combinations.", latex: `${c1} \\cdot ${c2} \\cdot 1` }],
                metadata: { variation: 'comb_constraint', difficulty: 3 }
            };
        }

        // Handshake
        const n = MathUtils.randomInt(6, 12);
        const desc = lang === 'sv'
            ? `I ett rum befinner sig ${n} personer. Om alla hälsar på varandra genom att skaka hand exakt en gång, hur många handskakningar sker det då sammanlagt?`
            : `In a room there are ${n} people. If everyone greets each other by shaking hands exactly once, how many handshakes occur in total?`;

        return {
            renderData: {
                description: desc,
                answerType: 'numeric'
            },
            token: this.toBase64(((n * (n - 1)) / 2).toString()),
            clues: [
                { text: lang === 'sv' ? "Använd formeln n(n-1)/2 för att räkna ut unika par, vilket hindrar att samma handskakning räknas två gånger." : "Use the formula n(n-1)/2 to calculate unique pairs, which prevents the same handshake from being counted twice.", latex: `\\frac{${n} \\cdot ${n - 1}}{2}` }
            ],
            metadata: { variation: 'comb_handshake', difficulty: 3 }
        };
    }

    // --- LEVEL 8: Sophisticated Pathways & Constraints ---
    private level8_CombinatoricsComplex(lang: string): any {
        const variation = Math.random();

        if (variation < 0.4) {
            // VIA POINT Constraint
            const s1 = MathUtils.randomChoice([2, 3]), s2 = MathUtils.randomChoice([2, 3]);
            const desc = lang === 'sv' 
                ? `En vandrare ska ta sig från punkt A till stad B via en rastplats C. Mellan A och C finns det ${s1} olika stigar, och mellan C och B finns det ${s2} olika stigar. På hur många olika sätt kan vandraren gå?` 
                : `A hiker is going from point A to city B via a rest area C. Between A and C there are ${s1} different paths, and between C and B there are ${s2} different paths. In how many different ways can the hiker go?`;
            
            return {
                renderData: {
                    description: desc,
                    answerType: 'numeric',
                    geometry: { type: 'probability_tree', subtype: 'pathway', layers: [1, s1, 1, s2, 1] }
                },
                token: this.toBase64((s1 * s2).toString()),
                clues: [{ text: lang === 'sv' ? "För att få det totala antalet vägar multiplicerar vi antalet val för varje delsträcka." : "To get the total number of paths, we multiply the number of choices for each segment.", latex: `${s1} \\cdot ${s2}` }],
                metadata: { variation: 'pathway_via', difficulty: 4 }
            };
        }

        // Original Sophisticated Pathway Logic
        const mode = MathUtils.randomChoice(['pathways_basic', 'pathways_blocked', 'pathways_prob']);
        const layers = [1, MathUtils.randomChoice([2, 3]), MathUtils.randomChoice([2, 3]), 1];
        let totalPaths = 1;
        for (let i = 1; i < layers.length - 1; i++) totalPaths *= layers[i];

        const obstacles: any[] = [];
        if (mode !== 'pathways_basic') {
            const allEdges: any[] = [];
            for (let l = 0; l < layers.length - 1; l++) {
                for (let f = 0; f < layers[l]; f++) {
                    for (let t = 0; t < layers[l + 1]; t++) {
                        allEdges.push({ layer: l, from: f, to: t });
                    }
                }
            }
            obstacles.push(MathUtils.randomChoice(allEdges));
        }

        const validCount = this.countValidPaths(layers, obstacles);
        const ans = mode === 'pathways_prob' ? `${validCount}/${totalPaths}` : validCount.toString();

        let desc = "";
        if (mode === 'pathways_basic') {
            desc = lang === 'sv' ? "Titta på diagrammet som visar möjliga vägar från A till B. Hur många olika sätt finns det att gå hela vägen?" : "Look at the diagram showing possible paths from A to B. How many different ways are there to go all the way?";
        } else if (mode === 'pathways_blocked') {
            desc = lang === 'sv' ? "De röda symbolerna i diagrammet markerar blockerade stigar. Hur många fungerande vägar finns kvar från A till B?" : "The red symbols in the diagram mark blocked paths. How many working paths remain from A to B?";
        } else {
            desc = lang === 'sv' ? "Om du väljer en väg i nätverket helt slumpmässigt, vad är sannolikheten att vägen du väljer är öppen hela vägen?" : "If you choose a path in the network completely at random, what is the probability that the path you choose is open all the way?";
        }

        return {
            renderData: {
                description: desc, 
                answerType: mode === 'pathways_prob' ? 'fraction' : 'numeric',
                geometry: { type: 'probability_tree', subtype: 'pathway', layers, obstacles }
            },
            token: this.toBase64(ans),
            clues: [{ text: lang === 'sv' ? "Följ de tillgängliga vägarna i diagrammet från start till slut och räkna dem." : "Follow the available paths in the diagram from start to finish and count them.", latex: mode === 'pathways_prob' ? `\\frac{\\text{Öppna vägar}}{\\text{Totala vägar}}` : "" }],
            metadata: { variation: mode, difficulty: 5 }
        };
    }

    private countValidPaths(layers: number[], obstacles: any[]): number {
        const find = (layerIdx: number, nodeIdx: number): number => {
            if (layerIdx === layers.length - 1) return 1;
            let count = 0;
            for (let nextNode = 0; nextNode < layers[layerIdx + 1]; nextNode++) {
                const isBlocked = obstacles.some(o => o.layer === layerIdx && o.from === nodeIdx && o.to === nextNode);
                if (!isBlocked) count += find(layerIdx + 1, nextNode);
            }
            return count;
        };
        return find(0, 0);
    }
}