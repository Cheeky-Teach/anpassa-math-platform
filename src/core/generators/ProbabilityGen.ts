import { MathUtils } from '../utils/MathUtils.js';

export class ProbabilityGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_Visuals(lang);
            case 2: return this.level2_StandardGroups(lang);
            case 3: return this.level3_Percentages(lang);
            case 4: return this.level4_Complementary(lang);
            case 5: return this.level5_ProbabilityTree(lang); // New Level
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

    // Helper for "nice" percentage-friendly numbers
    private getNiceRatio() {
        const d = MathUtils.randomChoice([2, 4, 5, 10, 20, 25, 50]);
        const n = MathUtils.randomInt(1, d - 1);
        const pct = (n / d) * 100;
        return { n, d, pct };
    }

    // --- LEVEL 1: Visual Foundations (Answer as Fraction) ---
    private level1_Visuals(lang: string): any {
        const red = MathUtils.randomInt(2, 6);
        const blue = MathUtils.randomInt(2, 6);
        const green = MathUtils.randomInt(1, 5);
        const total = red + blue + green;
        
        const subType = MathUtils.randomChoice(['single', 'or', 'not']);
        let fav = 0;
        let desc = "";

        if (subType === 'or') {
            fav = red + blue;
            desc = lang === 'sv' 
                ? `I en påse finns det ${red} röda, ${blue} blåa och ${green} gröna kulor. Vad är sannolikheten att du drar en röd eller en blå kula?`
                : `A bag contains ${red} red, ${blue} blue, and ${green} green marbles. What is the probability that you pick a red or a blue marble?`;
        } else if (subType === 'not') {
            fav = total - red; 
            desc = lang === 'sv'
                ? `I en påse finns det ${red} röda, ${blue} blåa och ${green} gröna kulor. Vad är sannolikheten att du INTE drar en röd kula?`
                : `A bag contains ${red} red, ${blue} blue, and ${green} green marbles. What is the probability that you do NOT pick a red marble?`;
        } else {
            fav = red;
            desc = lang === 'sv'
                ? `I en påse finns det ${red} röda, ${blue} blåa och ${green} gröna kulor. Vad är sannolikheten att du drar en röd kula?`
                : `A bag contains ${red} red, ${blue} blue, and ${green} green marbles. What is the probability that you pick a red marble?`;
        }

        return {
            renderData: {
                description: desc,
                answerType: 'fraction',
                geometry: { type: 'probability_marbles', items: { red, blue, green } }
            },
            token: this.toBase64(this.simplifyFraction(fav, total)),
            clues: [
                { 
                    text: lang === 'sv' ? "Räkna antalet gynsamma utfall som matchar frågan." : "Count the number of favorable outcomes that match the question.",
                    latex: `\\text{${lang === 'sv' ? 'Gynsamma' : 'Favorable'}} = ${fav}`
                },
                { 
                    text: lang === 'sv' ? "Dela antalet gynsamma utfall med det totala antalet kulor." : "Divide the number of favorable outcomes by the total number of marbles.",
                    latex: `P = \\frac{${fav}}{${total}}`
                }
            ]
        };
    }

    // --- LEVEL 2: Randomized Groups (Answer as Fraction) ---
    private level2_Groups(lang: string): any {
        const scenarios = [
            { itemSv: "personer", aSv: "vuxna", bSv: "barn", itemEn: "people", aEn: "adults", bEn: "children" },
            { itemSv: "bilar", aSv: "elbilar", bSv: "bensinbilar", itemEn: "cars", aEn: "electric cars", bEn: "petrol cars" },
            { itemSv: "pendlare", aSv: "tågresenärer", bSv: "bussresenärer", itemEn: "commuters", aEn: "train riders", bEn: "bus riders" },
            { itemSv: "användare", aSv: "iPhone-användare", bSv: "Android-användare", itemEn: "users", aEn: "iPhone users", bEn: "Android users" }
        ];

        const s = MathUtils.randomChoice(scenarios);
        const aCount = MathUtils.randomInt(5, 15);
        const bCount = MathUtils.randomInt(5, 15);
        const total = aCount + bCount;
        const targetA = MathUtils.randomInt(0, 1) === 1;
        const fav = targetA ? aCount : bCount;
        const targetName = targetA ? (lang === 'sv' ? s.aSv : s.aEn) : (lang === 'sv' ? s.bSv : s.bEn);

        const desc = lang === 'sv'
            ? `I en grupp om ${total} ${s.itemSv} finns det ${aCount} ${s.aSv} och ${bCount} ${s.bSv}. Vad är sannolikheten att en slumpmässigt vald person är ${targetName}?`
            : `In a group of ${total} ${s.itemEn}, there are ${aCount} ${s.aEn} and ${bCount} ${s.bEn}. What is the probability that a randomly chosen person is ${targetName}?`;

        return {
            renderData: { description: desc, answerType: 'fraction' },
            token: this.toBase64(this.simplifyFraction(fav, total)),
            clues: [
                { text: lang === 'sv' ? "Först beräknar vi det totala antalet i gruppen." : "First, we calculate the total number in the group.", latex: `${aCount} + ${bCount} = ${total}` },
                { text: lang === 'sv' ? "Sannolikheten skrivs som andelen av det hela." : "Probability is written as the part of the whole.", latex: `\\frac{${fav}}{${total}}` }
            ]
        };
    }

    // --- LEVEL 3: Percentages (L1/L2 logic + 3 New scenarios) ---
    private level3_Percentages(lang: string): any {
        const ratio = this.getNiceRatio();
        const type = MathUtils.randomChoice(['visual', 'group', 'factor', 'exam', 'sports', 'factory']);

        let desc = "";
        let steps = [];

        if (type === 'visual') {
            desc = lang === 'sv'
                ? `I en samling med ${ratio.d} kulor är ${ratio.n} stycken röda. Vad är sannolikheten i procent att du drar en röd kula?`
                : `In a collection of ${ratio.d} marbles, ${ratio.n} are red. What is the probability in percent that you pick a red marble?`;
            steps.push({ text: lang === 'sv' ? "Skriv först sannolikheten som ett bråk." : "First write the probability as a fraction.", latex: `\\frac{${ratio.n}}{${ratio.d}}` });
        } 
        else if (type === 'group') {
            desc = lang === 'sv'
                ? `I en klass med ${ratio.d} elever har ${ratio.n} elever glasögon. Hur många procent av eleverna har glasögon?`
                : `In a class of ${ratio.d} students, ${ratio.n} students wear glasses. What percentage of the students wear glasses?`;
            steps.push({ text: lang === 'sv' ? "Dela antalet med glasögon med totala antalet." : "Divide the number with glasses by the total number.", latex: `\\frac{${ratio.n}}{${ratio.d}}` });
        }
        else if (type === 'factor') {
            const limit = MathUtils.randomChoice([10, 20, 25, 50]);
            const step = MathUtils.randomChoice([2, 5, 10]);
            const count = Math.floor(limit / step);
            const ans = (count / limit) * 100;
            desc = lang === 'sv'
                ? `Du drar en siffra mellan 1 och ${limit}. Vad är sannolikheten i procent att siffran är en faktor av ${step}?`
                : `You pick a number between 1 and ${limit}. What is the probability in percent that the number is a multiple of ${step}?`;
            
            return {
                renderData: { description: desc, answerType: 'numeric', suffix: '%' },
                token: this.toBase64(ans.toString()),
                clues: [{ text: lang === 'sv' ? "Hitta andelen som ett bråk först." : "Find the share as a fraction first.", latex: `\\frac{${count}}{${limit}} = ${ans}\\%` }]
            };
        }
        else if (type === 'exam') {
            desc = lang === 'sv'
                ? `På ett prov deltog ${ratio.d} elever. ${ratio.n} av dem fick högsta betyg. Vad är sannolikheten i procent att en slumpmässigt vald elev fick högsta betyg?`
                : `In an exam with ${ratio.d} students, ${ratio.n} received the highest grade. What is the probability in percent that a randomly chosen student received the highest grade?`;
            steps.push({ text: lang === 'sv' ? "Beräkna andelen framgångsrika prov." : "Calculate the share of successful exams.", latex: `\\frac{${ratio.n}}{${ratio.d}}` });
        }
        else if (type === 'sports') {
            desc = lang === 'sv'
                ? `En basketspelare kastar ${ratio.d} straffkast och sätter ${ratio.n} av dem. Vad är sannolikheten i procent att nästa kast går i mål?`
                : `A basketball player takes ${ratio.d} free throws and makes ${ratio.n} of them. What is the probability in percent that the next throw scores?`;
            steps.push({ text: lang === 'sv' ? "Andelen lyckade kast ger oss sannolikheten." : "The share of successful throws gives us the probability.", latex: `\\frac{${ratio.n}}{${ratio.d}}` });
        }
        else { // factory
            desc = lang === 'sv'
                ? `I en kontroll av ${ratio.d} glödlampor upptäcktes det att ${ratio.n} var trasiga. Vad är sannolikheten i procent att en slumpmässigt vald lampa är defekt?`
                : `In a quality check of ${ratio.d} lightbulbs, ${ratio.n} were found to be defective. What is the probability in percent that a randomly chosen bulb is defective?`;
            steps.push({ text: lang === 'sv' ? "Dela antalet trasiga med det totala antalet kontrollerade." : "Divide the number of defective items by the total number checked.", latex: `\\frac{${ratio.n}}{${ratio.d}}` });
        }

        steps.push({ text: lang === 'sv' ? "Multiplicera med 100 för att få svaret i procent." : "Multiply by 100 to get the answer in percent.", latex: `\\frac{${ratio.n}}{${ratio.d}} \\cdot 100 = ${ratio.pct}\\%` });

        return {
            renderData: { description: desc, answerType: 'numeric', suffix: '%' },
            token: this.toBase64(ratio.pct.toString()),
            clues: steps
        };
    }

    // --- LEVEL 4: Complementary Logic (10 Scenarios) ---
    private level4_Complementary(lang: string): any {
        const scenarios = [
            { sv: "risken för regn är {x}%", en: "the risk of rain is {x}%", max: 95 },
            { sv: "chansen att vinna är {x}%", en: "the chance of winning is {x}%", max: 50 },
            { sv: "sannolikheten att bussen är försenad är {x}%", en: "the probability that the bus is late is {x}%", max: 40 },
            { sv: "andelen trasiga varor är {x}%", en: "the share of defective goods is {x}%", max: 10 },
            { sv: "risken att förlora matchen är {x}%", en: "the risk of losing the match is {x}%", max: 60 },
            { sv: "chansen för solsken imorgon är {x}%", en: "the chance of sunshine tomorrow is {x}%", max: 90 },
            { sv: "sannolikheten för rött ljus är {x}%", en: "the probability of a red light is {x}%", max: 70 },
            { sv: "risken att batteriet tar slut är {x}%", en: "the risk of the battery running out is {x}%", max: 30 },
            { sv: "sannolikheten för en nitlott är {x}%", en: "the probability of a losing ticket is {x}%", max: 95 },
            { sv: "risken att missa tåget är {x}%", en: "the risk of missing the train is {x}%", max: 20 }
        ];

        const s = MathUtils.randomChoice(scenarios);
        const x = MathUtils.randomInt(5, s.max);
        const ans = 100 - x;

        const desc = lang === 'sv'
            ? `Om ${s.sv.replace('{x}', x.toString())}, vad är sannolikheten för komplementhändelsen?`
            : `If ${s.en.replace('{x}', x.toString())}, what is the probability of the complementary event?`;

        return {
            renderData: { description: desc, answerType: 'numeric', suffix: '%' },
            token: this.toBase64(ans.toString()),
            clues: [
                { text: lang === 'sv' ? "Hela sannolikheten är 100%. Dra bort den kända chansen för att hitta motsatsen." : "The total probability is 100%. Subtract the known chance to find the opposite.", latex: `100\\% - ${x}\\% = ${ans}\\%` }
            ]
        };
    }

 // New Level 5: Probability Trees
    private level5_ProbabilityTree(lang: string): any {
        const scenarios = [
            { sv: ["Röda", "Blå"], en: ["Red", "Blue"], itemSv: "kulor", itemEn: "marbles" },
            { sv: ["Svarta", "Vita"], en: ["Black", "White"], itemSv: "strumpor", itemEn: "socks" },
            { sv: ["Äpplen", "Päron"], en: ["Apples", "Pears"], itemSv: "frukter", itemEn: "fruits" },
            { sv: ["Hela", "Trasiga"], en: ["Working", "Broken"], itemSv: "lampor", itemEn: "bulbs" },
            { sv: ["Mörka", "Ljusa"], en: ["Dark", "Milk"], itemSv: "chokladbitar", itemEn: "chocolates" }
        ];

        const s = MathUtils.randomChoice(scenarios);
        const counts = [MathUtils.randomInt(4, 8), MathUtils.randomInt(4, 8)];
        const groups = lang === 'sv' ? s.sv : s.en;
        const total = counts[0] + counts[1];

        // Randomly pick which branch to hide
        // s1_0, s1_1 (Stage 1) or s2_0..3 (Stage 2)
        const targetBranch = MathUtils.randomChoice(['s1_0', 's1_1', 's2_0', 's2_1', 's2_2', 's2_3']);
        
        let answerNum = 0;
        let answerDen = total;

        if (targetBranch.startsWith('s1')) {
            answerNum = targetBranch === 's1_0' ? counts[0] : counts[1];
        } else {
            answerDen = total - 1;
            if (targetBranch === 's2_0') answerNum = counts[0] - 1; // Pick A after A
            if (targetBranch === 's2_1') answerNum = counts[1];     // Pick B after A
            if (targetBranch === 's2_2') answerNum = counts[0];     // Pick A after B
            if (targetBranch === 's2_3') answerNum = counts[1] - 1; // Pick B after B
        }

        const desc = lang === 'sv'
            ? `I träddiagrammet visas sannolikheten för att dra två ${s.itemSv} utan återläggning. Beräkna värdet för $x$.`
            : `The tree diagram shows the probability of drawing two ${s.itemEn} without replacement. Calculate the value of $x$.`;

        return {
            renderData: {
                description: desc,
                answerType: 'fraction',
                geometry: {
                    type: 'probability_tree',
                    groups,
                    initialCounts: counts,
                    targetBranch
                }
            },
            token: this.toBase64(this.simplifyFraction(answerNum, answerDen)),
            clues: [
                { text: lang === 'sv' ? "Kom ihåg att nämnaren minskar i andra steget." : "Remember the denominator decreases in the second stage.", latex: `\\text{Total} = ${total} \\rightarrow ${total - 1}` },
                { text: lang === 'sv' ? "Om vi drar en av samma färg minskar täljaren också." : "If we draw the same color, the numerator also decreases." }
            ]
        };
    }

    // --- LEVEL 6: Event Chains (10 Scenarios - Without Replacement) ---
    private level6_EventChains(lang: string): any {
        const scenarios = [
            { itemSv: "godisbitar", itemEn: "candies", aNameSv: "sura", bNameSv: "söta", aNameEn: "sour", bNameEn: "sweet" },
            { itemSv: "frukter", itemEn: "fruits", aNameSv: "äpplen", bNameSv: "päron", aNameEn: "apples", bNameEn: "pears" },
            { itemSv: "strumpor", itemEn: "socks", aNameSv: "vita", bNameSv: "svarta", aNameEn: "white", bNameEn: "black" },
            { itemSv: "tennisbollar", itemEn: "tennis balls", aNameSv: "nya", bNameSv: "gamla", aNameEn: "new", bNameEn: "old" },
            { itemSv: "kort", itemEn: "cards", aNameSv: "spader", bNameSv: "hjärter", aNameEn: "spades", bNameEn: "hearts" },
            { itemSv: "cupcakes", itemEn: "cupcakes", aNameSv: "vanilj", bNameSv: "choklad", aNameEn: "vanilla", bNameEn: "chocolate" },
            { itemSv: "spelmarker", itemEn: "game tokens", aNameSv: "guld", bNameSv: "silver", aNameEn: "gold", bNameEn: "silver" },
            { itemSv: "skruvar", itemEn: "screws", aNameSv: "långa", bNameSv: "korta", aNameEn: "long", bNameEn: "short" },
            { itemSv: "namnlappar", itemEn: "name tags", aNameSv: "tjejer", bNameSv: "killar", aNameEn: "girls", bNameEn: "boys" },
            { itemSv: "pennor", itemEn: "pens", aNameSv: "blåa", bNameSv: "svarta", aNameEn: "blue", bNameEn: "black" }
        ];

        const s = MathUtils.randomChoice(scenarios);
        const aCount = MathUtils.randomInt(4, 6);
        const bCount = MathUtils.randomInt(4, 6);
        const total = aCount + bCount;

        const p1N = aCount;
        const p1D = total;
        const p2N = aCount - 1; 
        const p2D = total - 1; 

        const desc = lang === 'sv'
            ? `I en behållare finns det ${aCount} ${s.aNameSv} och ${bCount} ${s.bNameSv} ${s.itemSv}. Du tar ut en slumpmässigt och lägger den åt sidan. Sedan tar du en till. Vad är sannolikheten att båda är ${s.aNameSv}?`
            : `In a container, there are ${aCount} ${s.aNameEn} and ${bCount} ${s.bNameEn} ${s.itemEn}. You pick one at random and set it aside. Then you pick another one. What is the probability that both are ${s.aNameEn}?`;

        return {
            renderData: { description: desc, answerType: 'fraction' },
            token: this.toBase64(this.simplifyFraction(p1N * p2N, p1D * p2D)),
            clues: [
                { text: lang === 'sv' ? "Första draget:" : "First draw:", latex: `P(\\text{1}) = \\frac{${p1N}}{${p1D}}` },
                { text: lang === 'sv' ? "Andra draget (en är borta, så både täljare och nämnare minskar!):" : "Second draw (one is gone, so both numerator and denominator decrease!):", latex: `P(\\text{2}) = \\frac{${p2N}}{${p2D}}` },
                { text: lang === 'sv' ? "Multiplicera stegen för att få den totala sannolikheten." : "Multiply the steps to get the total probability.", latex: `\\frac{${p1N}}{${p1D}} \\cdot \\frac{${p2N}}{${p2D}}` }
            ]
        };
    }

    private level7_Combinatorics(lang: string): any {
        const mode = MathUtils.randomChoice(['multi_set', 'handshakes']);

        if (mode === 'handshakes') {
            const n = MathUtils.randomInt(5, 12);
            const ans = (n * (n - 1)) / 2;
            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `I ett rum träffas ${n} personer och alla skakar hand med varandra exakt en gång. Hur många handskakningar sker totalt?` 
                        : `In a room, ${n} people meet and everyone shakes hands with each other exactly once. How many handshakes occur in total?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang === 'sv' ? `Varje person (${n} st) hälsar på ${n - 1} andra.` : `Each person (${n}) greets ${n - 1} others.` },
                    { text: lang === 'sv' ? "Dela med 2 eftersom person A till B är samma handskakning som B till A." : "Divide by 2 because person A to B is the same handshake as B to A.", latex: `\\frac{${n} \\cdot ${n - 1}}{2}` }
                ]
            };
        }

        // --- SCENARIO: MULTI-SET COMBINATIONS ---
        const scenarios = [
            { sv: ["mössor", "halsdukar", "vantar"], en: ["hats", "scarves", "gloves"] },
            { sv: ["tröjor", "byxor", "strumpor"], en: ["shirts", "pants", "socks"] },
            { sv: ["huvudrätter", "drycker", "efterrätter"], en: ["mains", "drinks", "desserts"] },
            { sv: ["telefoner", "skal", "hörlurar"], en: ["phones", "cases", "headphones"] },
            { sv: ["flygresor", "hotell", "utflykter"], en: ["flights", "hotels", "tours"] },
            { sv: ["cyklar", "hjälmar", "lås"], en: ["bikes", "helmets", "locks"] }
        ];

        const s = MathUtils.randomChoice(scenarios);
        const v = [MathUtils.randomInt(2, 5), MathUtils.randomInt(2, 5), MathUtils.randomInt(2, 5)];
        const items = lang === 'sv' ? s.sv : s.en;
        const ans = v[0] * v[1] * v[2];

        return {
            renderData: {
                description: lang === 'sv' 
                    ? `Du ska välja en kombination av ${v[0]} ${items[0]}, ${v[1]} ${items[1]} och ${v[2]} ${items[2]}. Hur många olika kombinationer är möjliga?`
                    : `You are choosing a combination of ${v[0]} ${items[0]}, ${v[1]} ${items[1]}, and ${v[2]} ${items[2]}. How many different combinations are possible?`,
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? "För varje val i första gruppen finns det flera val i nästa. Vi multiplicerar därför antalen." : "For every choice in the first group, there are multiple choices in the next. Therefore, we multiply the counts.",
                    latex: `${v[0]} \\cdot ${v[1]} \\cdot ${v[2]} = ${ans}` 
                }
            ]
        };
    }

    private level8_CombinatoricsComplex(lang: string): any {
        const mode = MathUtils.randomChoice(['pathways_basic', 'pathways_blocked', 'pathways_prob']);

        // --- PATHWAY GENERATION LOGIC ---
        // Build dynamic layers: [A, Split1, Split2, (Optional Split3), B]
        const layers = [1];
        const n1 = MathUtils.randomChoice([2, 3]);
        const n2 = MathUtils.randomChoice([2, 3]);
        layers.push(n1, n2);
        
        const hasExtraSplit = MathUtils.randomInt(0, 1) === 1;
        if (hasExtraSplit) layers.push(2);
        layers.push(1);

        // Calculate total possible paths (without blocks)
        let totalPaths = 1;
        for (let i = 1; i < layers.length - 1; i++) {
            totalPaths *= layers[i];
        }

        const obstacles: any[] = [];
        const isBlockedMode = mode === 'pathways_blocked' || mode === 'pathways_prob';

        if (isBlockedMode) {
            // Find all possible edges in the network
            const allEdges: any[] = [];
            for (let l = 0; l < layers.length - 1; l++) {
                for (let f = 0; f < layers[l]; f++) {
                    for (let t = 0; t < layers[l + 1]; t++) {
                        allEdges.push({ layer: l, from: f, to: t });
                    }
                }
            }

            // Randomly block 1-3 pathways, ensuring at least one full path remains
            const numToBlock = MathUtils.randomInt(1, 3);
            const shuffledEdges = [...allEdges].sort(() => Math.random() - 0.5);
            
            for (const edge of shuffledEdges) {
                if (obstacles.length >= numToBlock) break;
                
                // Tentatively block
                const testObstacles = [...obstacles, edge];
                if (this.hasValidPath(layers, testObstacles)) {
                    obstacles.push(edge);
                }
            }
        }

        const validPathCount = this.countValidPaths(layers, obstacles);

        if (mode === 'pathways_basic') {
            const desc = lang === 'sv'
                ? `Figuren visar möjliga vägar från A till B. På hur många olika sätt kan man gå från A till B?`
                : `The figure shows possible paths from A to B. In how many different ways can you travel from A to B?`;
            
            return {
                renderData: {
                    description: desc,
                    answerType: 'numeric',
                    geometry: { type: 'probability_tree', subtype: 'pathway', layers, obstacles: [] }
                },
                token: this.toBase64(totalPaths.toString()),
                clues: [
                    { text: lang === 'sv' ? "Multiplicera antalet val i varje steg." : "Multiply the number of choices at each stage.", latex: layers.slice(1, -1).join(' \\cdot ') + ` = ${totalPaths}` }
                ]
            };
        }

        if (mode === 'pathways_blocked') {
            const desc = lang === 'sv'
                ? `De röda symbolerna markerar vägar som är blockerade. Hur många fungerande vägar finns kvar från A till B?`
                : `The red symbols mark blocked paths. How many viable paths remain from A to B?`;

            return {
                renderData: {
                    description: desc,
                    answerType: 'numeric',
                    geometry: { type: 'probability_tree', subtype: 'pathway', layers, obstacles }
                },
                token: this.toBase64(validPathCount.toString()),
                clues: [
                    { text: lang === 'sv' ? "Räkna hur många kompletta vägar som går att följa utan att passera ett rött kryss." : "Count how many complete paths can be followed without passing a red cross." },
                    { text: lang === 'sv' ? "Tips: Följ varje startväg och se hur många slutstationer den kan nå." : "Tip: Follow each starting path and see how many endpoints it can reach." }
                ]
            };
        }

        // pathways_prob
        const desc = lang === 'sv'
            ? `Om du väljer en väg från A till B helt slumpmässigt, vad är sannolikheten att vägen du väljer är öppen?`
            : `If you choose a path from A to B completely at random, what is the probability that the path you choose is open?`;

        return {
            renderData: {
                description: desc,
                answerType: 'fraction',
                geometry: { type: 'probability_tree', subtype: 'pathway', layers, obstacles }
            },
            token: this.toBase64(`${validPathCount}/${totalPaths}`),
            clues: [
                { text: lang === 'sv' ? "Sannolikhet = (Öppna vägar) / (Totala vägar)" : "Probability = (Open paths) / (Total paths)" },
                { text: lang === 'sv' ? `Det finns totalt ${totalPaths} kombinationer av vägar, och ${validPathCount} av dem är öppna.` : `There are ${totalPaths} total combinations of paths, and ${validPathCount} of them are open.`, latex: `\\frac{${validPathCount}}{${totalPaths}}` }
            ]
        };
    }

    // --- HELPER METHODS FOR PATHWAYS ---

    private hasValidPath(layers: number[], obstacles: any[]): boolean {
        return this.countValidPaths(layers, obstacles) > 0;
    }

    private countValidPaths(layers: number[], obstacles: any[]): number {
        const memo = new Map<string, number>();

        const find = (layerIdx: number, nodeIdx: number): number => {
            if (layerIdx === layers.length - 1) return 1;
            const key = `${layerIdx}-${nodeIdx}`;
            if (memo.has(key)) return memo.get(key)!;

            let count = 0;
            const nextLayerSize = layers[layerIdx + 1];
            for (let nextNode = 0; nextNode < nextLayerSize; nextNode++) {
                // Check if the edge to nextNode is blocked
                const isBlocked = obstacles.some(o => 
                    o.layer === layerIdx && o.from === nodeIdx && o.to === nextNode
                );
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