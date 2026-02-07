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
            { category: 'impossible', sv: ["slå en 7:a med en tärning", "en triangel med 4 hörn", "snö vid +40 grader"], en: ["rolling a 7 on a die", "a triangle having 4 corners", "it snowing at +40°C"], val: 0 },
            { category: 'certain', sv: ["att solen går upp imorgon", "få krona eller klave", "slå under 7 med en tärning"], en: ["the sun rising tomorrow", "getting heads or tails", "rolling under 7 on a die"], val: 1 },
            { category: 'even', sv: ["att få krona vid slantsingling", "slå ett jämnt tal", "dra ett rött kort"], en: ["getting heads", "rolling an even number", "picking a red card"], val: 0.5 }
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

    /**
     * Returns a raw fraction string (n/d) without simplification.
     */
    private rawFraction(n: number, d: number): string {
        return `${n}/${d}`;
    }

    // --- LEVEL 1: Visuals & Linguistic Logic ---
    private level1_Visuals(lang: string): any {
        const variation = Math.random();
        const counts = [MathUtils.randomInt(2, 5), MathUtils.randomInt(2, 5), MathUtils.randomInt(1, 4)];
        const total = counts.reduce((a, b) => a + b, 0);
        const labels = lang === 'sv' ? ["Röd", "Blå", "Grön"] : ["Red", "Blue", "Green"];
        const container = MathUtils.randomChoice(ProbabilityGen.SCENARIOS.containers);

        if (variation < 0.33) {
            const targetIdx = MathUtils.randomInt(0, 2);
            const ansCount = total - counts[targetIdx];
            const desc = lang === 'sv' 
                ? `I ${container.sv} finns det totalt ${total} kulor. Om du drar en slumpmässig kula, vad är sannolikheten att du INTE får en ${labels[targetIdx].toLowerCase()} kula?` 
                : `In ${container.en}, there are ${total} marbles in total. If you pick a marble at random, what is the probability that you do NOT pick a ${labels[targetIdx].toLowerCase()} marble?`;
            
            return {
                renderData: {
                    description: desc,
                    answerType: 'fraction',
                    geometry: { type: 'probability_marbles', items: { red: counts[0], blue: counts[1], green: counts[2] } }
                },
                token: this.toBase64(this.rawFraction(ansCount, total)),
                clues: [
                    { text: lang === 'sv' ? "Sannolikheten för 'inte röd' omfattar alla utfall som inte har just den färgen." : "The probability of 'not red' includes all outcomes that do not have that specific color.", latex: "" },
                    { text: lang === 'sv' ? "Räkna ihop antalet kulor som har andra färger." : "Add up the number of marbles with other colors.", latex: `${total} - ${counts[targetIdx]} = ${ansCount}` },
                    { text: lang === 'sv' ? "Sannolikheten skrivs som antalet önskade kulor delat med totala antalet kulor." : "The probability is written as the number of desired marbles divided by the total number of marbles.", latex: `\\frac{${ansCount}}{${total}}` }
                ],
                metadata: { variation: 'visual_not', difficulty: 2 }
            };
        }

        if (variation < 0.66) {
            const idx1 = 0, idx2 = 1;
            const ansCount = counts[idx1] + counts[idx2];
            const desc = lang === 'sv'
                ? `Du ska dra en kula ur en burk med kulor. Hur stor är sannolikheten att du får antingen en ${labels[idx1].toLowerCase()} eller en ${labels[idx2].toLowerCase()} kula?`
                : `You are going to pick a marble from a jar of marbles. What is the probability that you get either a ${labels[idx1].toLowerCase()} or a ${labels[idx2].toLowerCase()} marble?`;

            return {
                renderData: {
                    description: desc,
                    answerType: 'fraction',
                    geometry: { type: 'probability_marbles', items: { red: counts[0], blue: counts[1], green: counts[2] } }
                },
                token: this.toBase64(this.rawFraction(ansCount, total)),
                clues: [
                    { text: lang === 'sv' ? "Eftersom båda färgerna räknas som vinst, lägger vi ihop deras antal för att få täljaren." : "Since both colors count as a win, we add their counts together to get the numerator.", latex: `${counts[idx1]} + ${counts[idx2]} = ${ansCount}` },
                    { text: lang === 'sv' ? "Sannolikheten är summan av de önskade kulorna delat med totala antalet." : "The probability is the sum of the desired marbles divided by the total number.", latex: `\\frac{${ansCount}}{${total}}` }
                ],
                metadata: { variation: 'visual_or', difficulty: 2 }
            };
        }

        const target = MathUtils.randomInt(0, 2);
        const desc = lang === 'sv' 
            ? `Titta på kulorna i behållaren. Om du tar en kula utan att titta, vad är sannolikheten att den är ${labels[target].toLowerCase()}?` 
            : `Look at the marbles in the container. If you pick a marble without looking, what is the probability that it is ${labels[target].toLowerCase()}?`;
        
        return {
            renderData: {
                description: desc,
                answerType: 'fraction',
                geometry: { type: 'probability_marbles', items: { red: counts[0], blue: counts[1], green: counts[2] } }
            },
            token: this.toBase64(this.rawFraction(counts[target], total)),
            clues: [
                { text: lang === 'sv' ? "Sannolikhet beräknas som antalet önskade utfall genom det totala antalet utfall." : "Probability is calculated as the number of desired outcomes over the total number of outcomes.", latex: `\\frac{\\text{Antal ${labels[target]}}}{\\text{Totalt}} = \\frac{${counts[target]}}{${total}}` }
            ],
            metadata: { variation: 'visual_calc', difficulty: 1 }
        };
    }

    // --- LEVEL 2: Standard Groups & Ratios ---
    private level2_StandardGroups(lang: string): any {
        const variation = Math.random();
        const ctx = MathUtils.randomChoice(ProbabilityGen.SCENARIOS.items);
        const labels = lang === 'sv' ? ctx.sv : ctx.en;

        if (variation < 0.5) {
            const r1 = MathUtils.randomInt(1, 4), r2 = MathUtils.randomInt(1, 4);
            const total = r1 + r2;
            const desc = lang === 'sv' 
                ? `I en samling är förhållandet mellan ${labels[0]} och ${labels[1]} exakt ${r1}:${r2}. Vad är sannolikheten att dra en ${labels[0]}?` 
                : `In a collection, the ratio of ${labels[0]} to ${labels[1]} is ${r1}:${r2}. What is the probability of picking a ${labels[0]}?`;
            
            return {
                renderData: { description: desc, answerType: 'fraction' },
                token: this.toBase64(this.rawFraction(r1, total)),
                clues: [
                    { text: lang === 'sv' ? "Förhållandet visar hur delarna fördelar sig. Vi måste först veta det totala antalet delar för att få nämnaren." : "The ratio shows how the parts are distributed. We must first know the total number of parts to get the denominator.", latex: `${r1} + ${r2} = ${total}` },
                    { text: lang === 'sv' ? "Sannolikheten är delens antal genom hela summan." : "The probability is the part count over the entire sum.", latex: `\\frac{${r1}}{${total}}` }
                ],
                metadata: { variation: 'group_ratio', difficulty: 3 }
            };
        }

        const a = MathUtils.randomInt(5, 12), b = MathUtils.randomInt(5, 12), extra = MathUtils.randomInt(5, 15);
        const total = a + b + extra;
        const desc = lang === 'sv' 
            ? `Det finns totalt ${total} objekt i en låda. ${a} stycken är ${labels[0]} och ${b} stycken är ${labels[1]}. Resten är ${labels[2]}. Vad är sannolikheten att få en ${labels[2]}?` 
            : `There are ${total} items total in a box. ${a} are ${labels[0]} and ${b} are ${labels[1]}. The rest are ${labels[2]}. What is the probability of picking a ${labels[2]}?`;
        
        return {
            renderData: { description: desc, answerType: 'fraction' },
            token: this.toBase64(this.rawFraction(extra, total)),
            clues: [
                { text: lang === 'sv' ? "Börja med att räkna ut hur många som finns i den sista gruppen genom subtraktion." : "Start by calculating how many are in the final group using subtraction.", latex: `${total} - (${a} + ${b}) = ${extra}` },
                { text: lang === 'sv' ? "Sannolikheten är gruppens antal genom totalen." : "The probability is the group's count over the total.", latex: `\\frac{${extra}}{${total}}` }
            ],
            metadata: { variation: 'group_ternary', difficulty: 2 }
        };
    }

    // --- LEVEL 3: Concepts & Qualitative Logic ---
    private level3_ConceptsAndLogic(lang: string): any {
        const variation = Math.random();

        if (variation < 0.4) {
            const aN = MathUtils.randomInt(1, 3), aD = MathUtils.randomChoice([4, 5]);
            const bN = aN * 2, bD = aD * 2 + MathUtils.randomChoice([-1, 1]);
            const p1 = aN / aD, p2 = bN / bD;

            const l1 = MathUtils.randomChoice(ProbabilityGen.SCENARIOS.lotteries);
            const l2 = MathUtils.randomChoice(ProbabilityGen.SCENARIOS.lotteries.filter(x => x !== l1));

            const desc = lang === 'sv' ? `Jämför ${l1.sv} (${aN}/${aD}) med ${l2.sv} (${bN}/${bD}). Var är chansen för vinst högst?` : `Compare ${l1.en} (${aN}/${aD}) with ${l2.en} (${bN}/${bD}). Where is the chance highest?`;
            const options = lang === 'sv' ? [l1.sv, l2.sv, "Lika stor"] : [l1.en, l2.en, "Equal"];
            const ans = p1 > p2 ? options[0] : (p2 > p1 ? options[1] : options[2]);

            return {
                renderData: { description: desc, answerType: 'multiple_choice', options: MathUtils.shuffle(options) },
                token: this.toBase64(ans),
                clues: [{ text: lang === 'sv' ? "Omvandla bråken till decimaltal för att enkelt jämföra chanserna." : "Convert the fractions to decimals to easily compare the chances.", latex: `\\frac{${aN}}{${aD}} \\approx ${p1.toFixed(2)} \\text{ vs } \\frac{${bN}}{${bD}} \\approx ${p2.toFixed(2)}` }],
                metadata: { variation: 'concept_compare', difficulty: 3 }
            };
        }

        const valid = MathUtils.randomFloat(0.1, 0.9, 1).toString();
        const invalid = MathUtils.randomChoice(["1.5", "-0.2", "120%"]);
        return {
            renderData: {
                description: lang === 'sv' ? "Vilket av dessa värden är en matematiskt MÖJLIG sannolikhet?" : "Which of these values is a mathematically POSSIBLE probability?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([valid, invalid, "2.0"])
            },
            token: this.toBase64(valid),
            clues: [{ text: lang === 'sv' ? "Sannolikhet mäts alltid mellan 0 (omöjligt) och 1 (säkert)." : "Probability is always measured between 0 (impossible) and 1 (certain).", latex: "0 \\le P \\le 1" }],
            metadata: { variation: 'concept_validity', difficulty: 1 }
        };
    }

    // --- LEVEL 4: Complementary & "At Least One" ---
    private level4_Complementary(lang: string): any {
        const variation = Math.random();
        const scenario = MathUtils.randomChoice(ProbabilityGen.SCENARIOS.atLeastOne);
        const d = MathUtils.randomChoice(scenario.denoms);

        if (variation < 0.5) {
            const trials = MathUtils.randomChoice([2, 3]);
            const pNoneN = Math.pow(d - 1, trials);
            const pNoneD = Math.pow(d, trials);
            const ansN = pNoneD - pNoneN;

            return {
                renderData: {
                    description: lang === 'sv' ? `Chansen att ${scenario.sv} är 1/${d}. Om du gör ${trials} försök, vad är chansen att det sker MINST en gång?` : `The chance that ${scenario.en} is 1/${d}. If you try ${trials} times, what is the chance it happens AT LEAST once?`,
                    answerType: 'fraction'
                },
                token: this.toBase64(this.rawFraction(ansN, pNoneD)),
                clues: [
                    { text: lang === 'sv' ? "Det är ofta enklare att räkna ut risken för att händelsen ALDRIG sker och sedan ta 'resten' upp till 1." : "It is often simpler to calculate the risk of the event NEVER occurring and then take 'the rest' up to 1.", latex: "" },
                    { text: lang === 'sv' ? "Risken att misslyckas i alla försök är:" : "The risk of failing in all attempts is:", latex: "(\\frac{" + (d - 1) + "}{" + d + "})^" + trials + " = \\frac{" + pNoneN + "}{" + pNoneD + "}" },
                    { text: lang === 'sv' ? "Svaret är hela sannolikheten minus risken för totalt misslyckande." : "The answer is the full probability minus the risk of total failure.", latex: "1 - \\frac{" + pNoneN + "}{" + pNoneD + "} = \\frac{" + ansN + "}{" + pNoneD + "}" }
                ],
                metadata: { variation: 'comp_at_least', difficulty: 4 }
            };
        }

        const p1 = MathUtils.randomInt(2, 4) * 10, p2 = MathUtils.randomInt(1, 2) * 10;
        const p3 = 100 - (p1 + p2);
        return {
            renderData: {
                description: lang === 'sv' ? `Chansen för Guld är ${p1}% och Silver ${p2}%. Sannolikhet att INTE få någon av dessa medaljer?` : `The chance for Gold is ${p1}% and Silver ${p2}%. Probability of NOT getting either medal?`,
                answerType: 'numeric', suffix: '%'
            },
            token: this.toBase64(p3.toString()),
            clues: [{ text: lang === 'sv' ? "Summan av alla utfall är 100%. Addera de kända chanserna och se vad som återstår." : "The sum of all outcomes is 100%. Add the known chances and see what remains.", latex: `100 - (${p1} + ${p2}) = ${p3}` }],
            metadata: { variation: 'comp_multi', difficulty: 2 }
        };
    }

    // --- LEVEL 5: Probability Trees ---
    private level5_ProbabilityTree(lang: string): any {
        const variation = Math.random();
        const d1 = MathUtils.randomInt(2, 4), d2 = MathUtils.randomInt(2, 5);
        const dRes = d1 * d2;

        if (variation < 0.5) {
            return {
                renderData: {
                    description: lang === 'sv' ? `En gren i ett träd slutar på 1/${dRes}. Om första steget har chansen 1/${d1}, vad har nästa steg för chans?` : `A branch ends at 1/${dRes}. If the first step has a chance of 1/${d1}, what is the chance of the next step?`,
                    answerType: 'fraction',
                    latex: `\\frac{1}{${d1}} \\cdot x = \\frac{1}{${dRes}}`
                },
                token: this.toBase64(this.rawFraction(1, d2)),
                clues: [{ text: lang === 'sv' ? "Vi multiplicerar sannolikheter längs grenarna. Dela den totala sannolikheten med det kända steget för att hitta x." : "We multiply along branches. Divide the total probability by the known step to find x.", latex: `x = \\frac{1}{${dRes}} \\div \\frac{1}{${d1}} = \\frac{1}{${d2}}` }],
                metadata: { variation: 'tree_missing', difficulty: 3 }
            };
        }

        const c1 = MathUtils.randomInt(3, 5), c2 = MathUtils.randomInt(3, 5);
        const tot = c1 + c2;
        return {
            renderData: {
                description: lang === 'sv' ? `Du drar två objekt utan återläggning (A sen B). [A:${c1}, B:${c2}]` : `Pick two items without replacement (A then B). [A:${c1}, B:${c2}]`,
                answerType: 'fraction',
                geometry: { type: 'probability_tree', groups: ["A", "B"], initialCounts: [c1, c2], targetBranch: 's2_1' }
            },
            token: this.toBase64(this.rawFraction(c1 * c2, tot * (tot - 1))),
            clues: [{ text: lang === 'sv' ? "Multiplicera chanserna för varje steg. Tänk på att totalen minskar med 1 efter första draget." : "Multiply the chances for each step. Remember the total decreases by 1 after the first draw.", latex: `\\frac{${c1}}{${tot}} \\cdot \\frac{${c2}}{${tot - 1}}` }],
            metadata: { variation: 'tree_calc', difficulty: 3 }
        };
    }

    // --- LEVEL 6: Event Chains (Any Order) ---
    private level6_EventChains(lang: string): any {
        const a = MathUtils.randomInt(3, 5), b = MathUtils.randomInt(3, 5), total = a + b;

        if (Math.random() < 0.6) {
            const n = (a * b) * 2, d = total * (total - 1);
            return {
                renderData: {
                    description: lang === 'sv' ? `I en skål finns ${a} röda och ${b} blåa frukter. Sannolikhet att dra en av varje (utan återläggning)?` : `In a bowl are ${a} red and ${b} blue fruits. Probability of picking one of each (no replacement)?`,
                    answerType: 'fraction'
                },
                token: this.toBase64(this.rawFraction(n, d)),
                clues: [
                    { text: lang === 'sv' ? "Det finns två vinnande vägar: (Röd sen Blå) ELLER (Blå sen Röd)." : "There are two winning paths: (Red then Blue) OR (Blue then Red)." },
                    { text: lang === 'sv' ? "Beräkna båda vägarna och lägg ihop dem." : "Calculate both paths and add them together.", latex: `(\\frac{${a}}{${total}} \\cdot \\frac{${b}}{${total - 1}}) \\cdot 2` }
                ],
                metadata: { variation: 'chain_any_order', difficulty: 4 }
            };
        }

        return {
            renderData: {
                description: lang === 'sv' ? `Sannolikhet för Blå sen Blå (utan återläggning)? (R:${a}, B:${b})` : `Probability of Blue then Blue (no replacement)? (R:${a}, B:${b})`,
                answerType: 'fraction'
            },
            token: this.toBase64(this.rawFraction(b * (b - 1), total * (total - 1))),
            clues: [{ text: lang === 'sv' ? "När du drar samma sort minskar både antalet önskade objekt och totalen i steg 2." : "When picking the same type, both the desired object count and the total decrease in step 2.", latex: `\\frac{${b}}{${total}} \\cdot \\frac{${b - 1}}{${total - 1}}` }],
            metadata: { variation: 'chain_fixed_order', difficulty: 3 }
        };
    }

    // --- LEVEL 7: Combinatorics ---
    private level7_Combinatorics(lang: string): any {
        const variation = Math.random();

        if (variation < 0.5) {
            const c1 = MathUtils.randomInt(2, 4), c2 = MathUtils.randomInt(2, 4);
            return {
                renderData: {
                    description: lang === 'sv' ? `Du väljer kläder. Det finns ${c1} tröjor och ${c2} byxor, men bara 1 par skor passar. Hur många kombinationer finns?` : `Picking clothes. There are ${c1} shirts and ${c2} pants, but only 1 pair of shoes fits. How many combinations?`,
                    answerType: 'numeric'
                },
                token: this.toBase64((c1 * c2).toString()),
                clues: [{ text: lang === 'sv' ? "Multiplicera antalet val i varje kategori för att få totala antalet kombinationer." : "Multiply the number of choices in each category to get the total combinations.", latex: `${c1} \\cdot ${c2} \\cdot 1` }],
                metadata: { variation: 'comb_constraint', difficulty: 3 }
            };
        }

        const n = MathUtils.randomInt(6, 12);
        return {
            renderData: {
                description: lang === 'sv' ? `${n} personer träffas och alla skakar hand med alla. Hur många handskakningar sker totalt?` : `${n} people meet and everyone shakes hands. How many handshakes total?`,
                answerType: 'numeric'
            },
            token: this.toBase64(((n * (n - 1)) / 2).toString()),
            clues: [{ text: lang === 'sv' ? "Använd formeln n(n-1)/2 för att räkna par utan att dubbelräkna samma handskakning." : "Use the formula n(n-1)/2 to count pairs without double-counting the same handshake.", latex: `\\frac{${n} \\cdot (${n} - 1)}{2}` }],
            metadata: { variation: 'comb_handshake', difficulty: 3 }
        };
    }

    // --- LEVEL 8: Sophisticated Pathways ---
    private level8_CombinatoricsComplex(lang: string): any {
        const mode = MathUtils.randomChoice(['pathways_basic', 'pathways_blocked', 'pathways_prob']);
        
        // Define Network Topology: 
        // Either [1, start_nodes, 1] or [1, start_nodes, mid_nodes, 1]
        const layers = [1];
        const hasMiddle = Math.random() > 0.5;
        
        layers.push(MathUtils.randomChoice([2, 3])); // Start Nodes
        if (hasMiddle) layers.push(MathUtils.randomChoice([2, 3])); // Middle Nodes
        layers.push(1); // End Node

        // Calculate total possible paths (unblocked)
        let totalPaths = 1;
        for (let i = 1; i < layers.length - 1; i++) {
            totalPaths *= layers[i];
        }

        // Generate and Block Obstacles (1 to 3 edges)
        const allEdges: any[] = [];
        for (let l = 0; l < layers.length - 1; l++) {
            for (let f = 0; f < layers[l]; f++) {
                for (let t = 0; t < layers[l + 1]; t++) {
                    allEdges.push({ layer: l, from: f, to: t });
                }
            }
        }

        const obstacles: any[] = [];
        if (mode !== 'pathways_basic') {
            const numBlocks = MathUtils.randomInt(1, 3);
            const shuffledEdges = [...allEdges].sort(() => Math.random() - 0.5);
            
            for (const edge of shuffledEdges) {
                if (obstacles.length >= numBlocks) break;
                
                // Tentatively block and check if at least one path remains
                const testObstacles = [...obstacles, edge];
                if (this.countValidPaths(layers, testObstacles) > 0) {
                    obstacles.push(edge);
                }
            }
        }

        const validCount = this.countValidPaths(layers, obstacles);
        const ans = mode === 'pathways_prob' ? this.rawFraction(validCount, totalPaths) : validCount.toString();

        let desc = "";
        if (mode === 'pathways_basic') {
            desc = lang === 'sv' ? "Diagrammet visar möjliga vägar från A till B. På hur många olika sätt kan man gå hela vägen?" : "The diagram shows possible paths from A to B. In how many different ways can you go all the way?";
        } else if (mode === 'pathways_blocked') {
            desc = lang === 'sv' ? "De röda symbolerna markerar blockerade stigar. Hur många fungerande vägar finns kvar från A till B?" : "The red symbols mark blocked paths. How many working paths remain from A to B?";
        } else {
            desc = lang === 'sv' ? "Om du väljer en väg helt slumpmässigt, vad är sannolikheten att vägen du väljer är öppen hela vägen?" : "If you choose a path completely at random, what is the probability that the path you choose is open all the way?";
        }

        return {
            renderData: {
                description: desc,
                answerType: mode === 'pathways_prob' ? 'fraction' : 'numeric',
                geometry: { type: 'probability_tree', subtype: 'pathway', layers, obstacles }
            },
            token: this.toBase64(ans),
            clues: [
                { 
                    text: lang === 'sv' 
                        ? "En väg är en unik kombination av val i varje steg. Multiplicera antalet val i varje del." 
                        : "A path is a unique combination of choices at each step. Multiply the number of choices in each part.", 
                    latex: layers.slice(1, -1).join(' \\cdot ') + ` = ${totalPaths}` 
                },
                { 
                    text: lang === 'sv' 
                        ? (mode === 'pathways_prob' ? "Sannolikhet = (Öppna vägar) / (Totala vägar)" : "Räkna endast de vägar där ingen länk är rödmarkerad.") 
                        : (mode === 'pathways_prob' ? "Probability = (Open paths) / (Total paths)" : "Count only paths where no link is marked red."),
                    latex: mode === 'pathways_prob' ? `\\frac{${validCount}}{${totalPaths}}` : "" 
                }
            ],
            metadata: { variation: mode, difficulty: 5 }
        };
    }

    // --- HELPER METHODS FOR PATHWAYS ---

    private countValidPaths(layers: number[], obstacles: any[]): number {
        const memo = new Map<string, number>();

        const find = (layerIdx: number, nodeIdx: number): number => {
            if (layerIdx === layers.length - 1) return 1;
            const key = `${layerIdx}-${nodeIdx}`;
            if (memo.has(key)) return memo.get(key)!;

            let count = 0;
            for (let nextNode = 0; nextNode < layers[layerIdx + 1]; nextNode++) {
                const isBlocked = obstacles.some(o => o.layer === layerIdx && o.from === nodeIdx && o.to === nextNode);
                if (!isBlocked) {
                    count += find(layerIdx + 1, nextNode);
                }
            }
            memo.set(key, count);
            return count;
        };

        return find(0, 0);
    }
}