import { MathUtils } from '../utils/MathUtils.js';

export class ProbabilityGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_Visuals(lang);
            case 2: return this.level2_StandardGroups(lang);
            case 3: return this.level3_Percentages(lang);
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

    // --- LEVEL 1: Visual Foundations ---
    private level1_Visuals(lang: string): any {
        const variation = Math.random();

        // VARIATION A: Inverse Logic (Probability -> Count)
        if (variation < 0.3) {
            const red = MathUtils.randomInt(2, 6);
            const total = red * MathUtils.randomChoice([2, 3, 4]); 
            const probD = total / red; 
            
            const desc = lang === 'sv'
                ? `I en påse med ${total} kulor är sannolikheten att dra en röd kula 1/${probD}. Hur många röda kulor finns det?`
                : `In a bag of ${total} marbles, the probability of picking a red marble is 1/${probD}. How many red marbles are there?`;

            return {
                renderData: {
                    description: desc,
                    answerType: 'numeric',
                    geometry: null
                },
                token: this.toBase64(red.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? "Sannolikheten 1/X betyder att '1 av X' kulor är röd." : "A probability of 1/X means '1 out of X' marbles is red.", 
                        latex: `P(\\text{Röd}) = \\frac{1}{${probD}}` 
                    },
                    {
                        text: lang === 'sv' ? "Dela det totala antalet kulor i lika stora grupper enligt sannolikheten." : "Divide the total number of marbles into equal groups according to the probability.",
                        latex: `${total} \\div ${probD} = ${red}`
                    }
                ]
            };
        }

        // VARIATION B: Spot the Lie (Dynamic Visual Ratios)
        if (variation < 0.6) {
            const red = MathUtils.randomInt(2, 6);
            const blue = MathUtils.randomInt(1, 5); 
            const total = red + blue;
            
            const pBlue = blue/total;
            
            // 1. Generate TRUE statements
            const trueStatements = [];
            trueStatements.push(lang === 'sv' ? `P(Röd) = ${red}/${total}` : `P(Red) = ${red}/${total}`);
            
            if (red > blue) {
                trueStatements.push(lang === 'sv' ? "Det är störst chans att dra Röd" : "It is most likely to pick Red");
            } else if (blue > red) {
                trueStatements.push(lang === 'sv' ? "Det är störst chans att dra Blå" : "It is most likely to pick Blue");
            } else {
                trueStatements.push(lang === 'sv' ? "Chansen är lika stor för båda färgerna" : "The chance is equal for both colors");
            }

            // 2. Generate FALSE statement (The Lie)
            let lie = "";
            const lieType = MathUtils.randomInt(0, 2);
            
            if (lieType === 0) {
                // Percentage Lie
                if (pBlue < 0.5) {
                    lie = lang === 'sv' ? "Chansen att dra Blå är över 50%" : "The chance to pick Blue is over 50%";
                } else {
                    lie = lang === 'sv' ? "Chansen att dra Blå är under 50%" : "The chance to pick Blue is under 50%";
                }
            } else if (lieType === 1) {
                // Impossible Lie
                lie = lang === 'sv' ? "Det är omöjligt att dra en Röd kula" : "It is impossible to pick a Red marble";
            } else {
                // Fraction Lie (Flip numerator/denominator logic)
                lie = lang === 'sv' ? `P(Blå) = ${total}/${blue}` : `P(Blue) = ${total}/${blue}`;
            }

            const options = MathUtils.shuffle([trueStatements[0], trueStatements[1], lie]);

            return {
                renderData: {
                    description: lang === 'sv' ? "Titta på bilden. Vilket påstående är FALSKT?" : "Look at the image. Which statement is FALSE?",
                    answerType: 'multiple_choice',
                    options: options,
                    geometry: { type: 'probability_marbles', items: { red, blue, green: 0 } }
                },
                token: this.toBase64(lie),
                clues: [
                    { 
                        text: lang === 'sv' ? `Räkna antalet kulor av varje färg.` : `Count the marbles of each color.`,
                        latex: `\\text{Red}: ${red}, \\text{Blue}: ${blue}`
                    }
                ]
            };
        }

        // VARIATION C: Standard Visual Calc
        const red = MathUtils.randomInt(2, 5);
        const blue = MathUtils.randomInt(2, 5);
        const green = MathUtils.randomInt(1, 4);
        const total = red + blue + green;
        
        return {
            renderData: {
                description: lang === 'sv' 
                    ? `Vad är sannolikheten att dra en röd kula?`
                    : `What is the probability of picking a red marble?`,
                answerType: 'fraction',
                geometry: { type: 'probability_marbles', items: { red, blue, green } }
            },
            token: this.toBase64(this.simplifyFraction(red, total)),
            clues: [
                { 
                    text: lang === 'sv' ? "Sannolikhet är delen delat med det hela." : "Probability is the part divided by the whole.", 
                    latex: `P = \\frac{\\text{Antal röda}}{\\text{Total}}` 
                },
                {
                    latex: `\\frac{${red}}{${total}}`
                }
            ]
        };
    }

    // --- LEVEL 2: Randomized Groups ---
    private level2_StandardGroups(lang: string): any {
        const scenarios = [
            { itemSv: "personer", aSv: "vuxna", bSv: "barn", itemEn: "people", aEn: "adults", bEn: "children" },
            { itemSv: "bilar", aSv: "elbilar", bSv: "bensinbilar", itemEn: "cars", aEn: "electric cars", bEn: "petrol cars" },
            { itemSv: "pendlare", aSv: "tågresenärer", bSv: "bussresenärer", itemEn: "commuters", aEn: "train riders", bEn: "bus riders" },
            { itemSv: "användare", aSv: "iPhone-användare", bSv: "Android-användare", itemEn: "users", aEn: "iPhone users", bEn: "Android users" },
            { itemSv: "djur", aSv: "hundar", bSv: "katter", itemEn: "animals", aEn: "dogs", bEn: "cats" },
            { itemSv: "frukter", aSv: "äpplen", bSv: "bananer", itemEn: "fruits", aEn: "apples", bEn: "bananas" },
            { itemSv: "bestick", aSv: "gafflar", bSv: "skedar", itemEn: "cutlery", aEn: "forks", bEn: "spoons" },
            { itemSv: "träd", aSv: "granar", bSv: "björkar", itemEn: "trees", aEn: "pines", bEn: "birches" },
            { itemSv: "fordon", aSv: "lastbilar", bSv: "motorcyklar", itemEn: "vehicles", aEn: "trucks", bEn: "motorcycles" },
            { itemSv: "leksaker", aSv: "klossar", bSv: "bilar", itemEn: "toys", aEn: "blocks", bEn: "cars" },
            { itemSv: "böcker", aSv: "deckare", bSv: "romaner", itemEn: "books", aEn: "mysteries", bEn: "novels" },
            { itemSv: "drycker", aSv: "mjölkpaket", bSv: "juicepaket", itemEn: "drinks", aEn: "milk cartons", bEn: "juice cartons" },
            { itemSv: "bollar", aSv: "fotbollar", bSv: "tennisbollar", itemEn: "balls", aEn: "footballs", bEn: "tennis balls" },
            { itemSv: "blommor", aSv: "rosor", bSv: "tulpaner", itemEn: "flowers", aEn: "roses", bEn: "tulips" },
            { itemSv: "fåglar", aSv: "duvor", bSv: "skator", itemEn: "birds", aEn: "pigeons", bEn: "magpies" },
            { itemSv: "instrument", aSv: "gitarrer", bSv: "trummor", itemEn: "instruments", aEn: "guitars", bEn: "drums" },
            { itemSv: "möbler", aSv: "stolar", bSv: "bord", itemEn: "furniture", aEn: "chairs", bEn: "tables" },
            { itemSv: "enheter", aSv: "datorer", bSv: "surfplattor", itemEn: "devices", aEn: "computers", bEn: "tablets" },
            { itemSv: "bakverk", aSv: "bullar", bSv: "kakor", itemEn: "pastries", aEn: "buns", bEn: "cookies" }
        ];

        const s = MathUtils.randomChoice(scenarios);
        const aCount = MathUtils.randomInt(5, 15);
        const bCount = MathUtils.randomInt(5, 15);
        const total = aCount + bCount;
        
        const targetA = MathUtils.randomInt(0, 1) === 1;
        const targetCount = targetA ? aCount : bCount;
        const targetName = targetA ? (lang === 'sv' ? s.aSv : s.aEn) : (lang === 'sv' ? s.bSv : s.bEn);
        const groupName = lang === 'sv' ? s.itemSv : s.itemEn;

        const desc = lang === 'sv'
            ? `I en grupp på ${total} ${groupName} är ${aCount} ${s.aSv} och resten ${s.bSv}. Vad är sannolikheten att en slumpmässigt vald är ${targetName}?`
            : `In a group of ${total} ${groupName}, ${aCount} are ${s.aEn} and the rest are ${s.bEn}. What is the probability that a randomly chosen one is ${targetName}?`;

        return {
            renderData: { description: desc, answerType: 'fraction' },
            token: this.toBase64(this.simplifyFraction(targetCount, total)),
            clues: [
                { 
                    text: lang === 'sv' ? "För att hitta sannolikheten, dela antalet du söker med det totala antalet i gruppen." : "To find the probability, divide the number you are looking for by the total number in the group.", 
                    latex: `\\frac{\\text{Antal ${targetName}}}{\\text{Total}} = \\frac{${targetCount}}{${total}}` 
                }
            ]
        };
    }

    // --- LEVEL 3: Percentages & Comparison ---
    private level3_Percentages(lang: string): any {
        const variation = Math.random();

        // VARIATION A: Concept Check (Bounds)
        if (variation < 0.3) {
            const q = lang==='sv' ? "Vilken sannolikhet beskriver en händelse som är OMÖJLIG?" : "Which probability describes an IMPOSSIBLE event?";
            const optCorrect = "0%";
            const optPossible = "1%";
            const optCertain = "100%";
            
            return {
                renderData: {
                    description: q,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([optCorrect, optPossible, optCertain])
                },
                token: this.toBase64(optCorrect),
                clues: [
                    { 
                        text: lang === 'sv' ? "Om något är omöjligt kan det aldrig hända. Det motsvarar 0 av 100 gånger." : "If something is impossible, it can never happen. This corresponds to 0 out of 100 times.", 
                        latex: "0\\%" 
                    }
                ]
            };
        }

        // VARIATION B: Event Comparison (Die vs Random)
        if (variation < 0.6) { 
            const dieLimit = MathUtils.randomInt(2, 5); 
            const dieType = MathUtils.randomChoice(['>', '<', 'odd', 'even', 'exact']);
            let probA = 0;
            let labelA = "";

            if (dieType === '>') {
                const count = 6 - dieLimit;
                probA = count / 6;
                labelA = lang==='sv' ? `Slå mer än ${dieLimit} med en tärning` : `Rolling > ${dieLimit} on a die`;
            } else if (dieType === '<') {
                const count = dieLimit - 1;
                probA = count / 6;
                labelA = lang==='sv' ? `Slå mindre än ${dieLimit} med en tärning` : `Rolling < ${dieLimit} on a die`;
            } else if (dieType === 'odd') {
                probA = 0.5;
                labelA = lang==='sv' ? "Slå udda med en tärning" : "Rolling an Odd number";
            } else if (dieType === 'even') {
                probA = 0.5;
                labelA = lang==='sv' ? "Slå jämnt med en tärning" : "Rolling an Even number";
            } else {
                probA = 1/6;
                labelA = lang==='sv' ? `Slå exakt en ${dieLimit}:a` : `Rolling exactly a ${dieLimit}`;
            }

            const probB_Percent = MathUtils.randomInt(10, 90); 
            const probB = probB_Percent / 100;
            
            // Escape % for LaTeX
            const labelB = lang==='sv' 
                ? `Det regnar imorgon (${probB_Percent}\\% )` 
                : `It rains tomorrow (${probB_Percent}\\% )`;

            let answer = "";
            const A_perc = Math.round(probA * 100);
            
            if (Math.abs(probA - probB) < 0.01) {
                return this.level3_Percentages(lang);
            }

            if (probA > probB) {
                answer = lang==='sv' ? "Alternativ A" : "Option A";
            } else {
                answer = lang==='sv' ? "Alternativ B" : "Option B";
            }

            return {
                renderData: {
                    description: lang==='sv' ? "Vilken händelse är mest sannolik?" : "Which event is more likely?",
                    latex: `\\begin{array}{l} A: \\text{${labelA}} \\\\[8pt] B: \\text{${labelB}} \\end{array}`,
                    answerType: 'multiple_choice',
                    options: [lang==='sv'?"Alternativ A":"Option A", lang==='sv'?"Alternativ B":"Option B"]
                },
                token: this.toBase64(answer),
                clues: [
                    { 
                        text: lang==='sv' ? `Gör om A till procent.` : `Convert A to percent.`,
                        latex: `P(A) \\approx ${A_perc}\\%`
                    },
                    {
                        text: lang==='sv' ? `Jämför procenten.` : `Compare the percentages.`,
                        latex: `${A_perc}\\% \\text{ vs } ${probB_Percent}\\%`
                    }
                ]
            };
        }

        // VARIATION C: Probability Logic (Distributions & Expectation)
        const subType = MathUtils.randomChoice(['distribution', 'expectation']);

        if (subType === 'distribution') {
            // SCENARIO: Sum to 100%
            const scenarios = [
                { sv: "ett lyckohjul", en: "a wheel of fortune", a: "Röd", b: "Blå", c: "Grön", aEn: "Red", bEn: "Blue", cEn: "Green" },
                { sv: "en valurnan", en: "a ballot box", a: "Kandidat A", b: "Kandidat B", c: "Kandidat C", aEn: "Candidate A", bEn: "Candidate B", cEn: "Candidate C" },
                { sv: "en väderprognos", en: "a weather forecast", a: "Sol", b: "Regn", c: "Molnigt", aEn: "Sun", bEn: "Rain", cEn: "Cloudy" }
            ];
            const s = MathUtils.randomChoice(scenarios);
            
            const p1 = MathUtils.randomChoice([10, 20, 25, 30, 40]);
            const p2 = MathUtils.randomChoice([10, 15, 20, 25]);
            const p3 = 100 - p1 - p2; // The missing part
            
            const labelA = lang === 'sv' ? s.a : s.aEn;
            const labelB = lang === 'sv' ? s.b : s.bEn;
            const labelC = lang === 'sv' ? s.c : s.cEn;
            const item = lang === 'sv' ? s.sv : s.en;

            const desc = lang === 'sv'
                ? `För ${item} är sannolikheten för ${labelA} ${p1}% och för ${labelB} ${p2}%. Vad är sannolikheten för ${labelC}?`
                : `For ${item}, the probability of ${labelA} is ${p1}% and ${labelB} is ${p2}%. What is the probability of ${labelC}?`;
            
            return {
                renderData: {
                    description: desc,
                    answerType: 'numeric',
                    suffix: '%'
                },
                token: this.toBase64(p3.toString()),
                clues: [
                    {
                        text: lang === 'sv' ? "Summan av alla sannolikheter är alltid 100%." : "The sum of all probabilities is always 100%.",
                        latex: `100\\% - (${p1}\\% + ${p2}\\%)`
                    }
                ]
            };
        } else {
            // SCENARIO: Expected Value (Percent -> Count)
            const scenarios = [
                { sv: "att vinna på lotteriet", en: "winning the lottery" },
                { sv: "att ett frö gror", en: "a seed sprouting" },
                { sv: "att en produkt är defekt", en: "a product being defective" },
                { sv: "att göra mål på straff", en: "scoring a penalty" }
            ];
            const s = MathUtils.randomChoice(scenarios);
            
            const percent = MathUtils.randomChoice([10, 20, 25, 50]); // Nice numbers
            const total = MathUtils.randomChoice([10, 20, 40, 50, 100]);
            const ans = (percent / 100) * total;
            const action = lang === 'sv' ? s.sv : s.en;

            const desc = lang === 'sv'
                ? `Sannolikheten för ${action} är ${percent}%. Om du gör ${total} försök, hur många gånger förväntas det hända?`
                : `The probability of ${action} is ${percent}%. If you make ${total} attempts, how many times is it expected to happen?`;

            return {
                renderData: {
                    description: desc,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    {
                        text: lang === 'sv' ? "Gör om procenten till decimalform eller bråk." : "Convert the percent to decimal or fraction.",
                        latex: `${percent}\\% = ${percent/100}`
                    },
                    {
                        text: lang === 'sv' ? "Multiplicera sannolikheten med antalet försök." : "Multiply the probability by the number of attempts.",
                        latex: `${percent/100} \\cdot ${total}`
                    }
                ]
            };
        }
    }

    // --- LEVEL 4: Complementary (Expanded) ---
    private level4_Complementary(lang: string): any {
        const scenarios = [
            // Original
            { sv: "risken för regn är {x}%", en: "the risk of rain is {x}%", max: 95 },
            { sv: "chansen att vinna är {x}%", en: "the chance of winning is {x}%", max: 50 },
            { sv: "sannolikheten att bussen är försenad är {x}%", en: "the probability that the bus is late is {x}%", max: 40 },
            { sv: "andelen trasiga varor är {x}%", en: "the share of defective goods is {x}%", max: 10 },
            { sv: "risken att förlora matchen är {x}%", en: "the risk of losing the match is {x}%", max: 60 },
            { sv: "chansen för solsken imorgon är {x}%", en: "the chance of sunshine tomorrow is {x}%", max: 90 },
            { sv: "sannolikheten för rött ljus är {x}%", en: "the probability of a red light is {x}%", max: 70 },
            { sv: "risken att batteriet tar slut är {x}%", en: "the risk of the battery running out is {x}%", max: 30 },
            { sv: "sannolikheten för en nitlott är {x}%", en: "the probability of a losing ticket is {x}%", max: 95 },
            { sv: "risken att missa tåget är {x}%", en: "the risk of missing the train is {x}%", max: 20 },
            // Expanded
            { sv: "chansen för snö är {x}%", en: "the chance of snow is {x}%", max: 80 },
            { sv: "batteriet är laddat till {x}%", en: "the battery is charged to {x}%", max: 90 },
            { sv: "nedladdningen är {x}% klar", en: "the download is {x}% complete", max: 99 },
            { sv: "{x}% av eleverna är närvarande", en: "{x}% of the students are present", max: 95 },
            { sv: "{x}% av fröna grodde", en: "{x}% of the seeds sprouted", max: 90 },
            { sv: "målvakten räddar {x}% av skotten", en: "the goalie saves {x}% of the shots", max: 95 },
            { sv: "{x}% klarade provet", en: "{x}% passed the exam", max: 90 },
            { sv: "chansen att hitta en sittplats är {x}%", en: "the chance of finding a seat is {x}%", max: 60 },
            { sv: "du svarade rätt på {x}% av frågorna", en: "you answered {x}% of the questions correctly", max: 95 },
            { sv: "himlen är täckt av moln till {x}%", en: "the sky is covered by clouds to {x}%", max: 90 },
            { sv: "du har klarat {x}% av spelet", en: "you have completed {x}% of the game", max: 90 },
            { sv: "skytten träffar målet {x}% av gångerna", en: "the shooter hits the target {x}% of the time", max: 80 },
            { sv: "maskinen fungerar {x}% av tiden", en: "the machine works {x}% of the time", max: 95 },
            { sv: "tåget kommer i tid {x}% av gångerna", en: "the train arrives on time {x}% of the time", max: 90 },
            { sv: "hotellet är bokat till {x}%", en: "the hotel is booked to {x}%", max: 95 }
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
                { 
                    text: lang === 'sv' ? "Summan av alla utfall är alltid 100%. Komplementhändelsen är 'resten'." : "The sum of all outcomes is always 100%. The complementary event is 'the rest'.", 
                    latex: `100\\% - ${x}\\% = \\text{?}` 
                }
            ]
        };
    }

    // --- LEVEL 5: Probability Trees ---
    private level5_ProbabilityTree(lang: string): any {
        const variation = Math.random();

        // VARIATION A: Concept Check (Dependency)
        if (variation < 0.3) {
            const desc = lang==='sv' 
                ? "I ett träddiagram utan återläggning, varför minskar nämnaren i steg 2?" 
                : "In a tree diagram without replacement, why does the denominator decrease in step 2?";
            
            const optCorrect = lang==='sv' ? "Ett föremål är borta" : "One item is removed";
            const optWrong = lang==='sv' ? "Sannolikheten ökar alltid" : "Probability always increases";
            
            return {
                renderData: {
                    description: desc,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([optCorrect, optWrong]),
                    geometry: {
                        type: 'probability_tree',
                        groups: ["A", "B"], initialCounts: [3, 2], targetBranch: 's2_0' // Just for visual context
                    }
                },
                token: this.toBase64(optCorrect),
                clues: [
                    {
                        text: lang === 'sv' ? "När du tar något ur påsen och inte lägger tillbaka det, finns det färre saker kvar." : "When you take something out of the bag and don't put it back, there are fewer items left.",
                        latex: "\\text{Ny total} = \\text{Gammal total} - 1"
                    }
                ]
            };
        }

        // VARIATION B: Missing Variable
        if (variation < 0.6) {
            const n1 = 1, d1 = 2;
            const n2 = 1, d2 = 3; 
            const nRes = 1, dRes = 6;

            return {
                renderData: {
                    description: lang==='sv' ? "Vad är sannolikheten för den andra grenen om totalen är 1/6?" : "What is the probability of the second branch if the total is 1/6?",
                    latex: `\\frac{1}{2} \\cdot x = \\frac{1}{6}`,
                    answerType: 'fraction'
                },
                token: this.toBase64("1/3"),
                clues: [
                    { 
                        text: lang==='sv' ? "Vi multiplicerar sannolikheter längs grenarna. Använd division för att gå baklänges." : "We multiply probabilities along branches. Use division to go backwards.", 
                        latex: `x = \\frac{1}{6} \\div \\frac{1}{2}` 
                    }
                ]
            };
        }

        // VARIATION C: Standard Calculation
        const c1 = MathUtils.randomInt(3, 6);
        const c2 = MathUtils.randomInt(3, 6);
        const tot = c1+c2;
        
        const p1N = c1, p1D = tot;
        const p2N = c2, p2D = tot - 1;
        
        return {
            renderData: {
                description: lang==='sv' 
                    ? `Du drar två kulor utan återläggning (Först A, sen B). Beräkna sannolikheten.` 
                    : `Pick two marbles without replacement (First A, then B). Calculate probability.`,
                answerType: 'fraction',
                geometry: {
                    type: 'probability_tree',
                    groups: ["A", "B"], initialCounts: [c1, c2], targetBranch: 's2_1'
                }
            },
            token: this.toBase64(this.simplifyFraction(p1N * p2N, p1D * p2D)),
            clues: [
                {
                    text: lang === 'sv' ? "Följ grenarna i diagrammet. Första draget påverkar det andra (en kula mindre)." : "Follow the branches. The first draw affects the second (one less marble).",
                    latex: `P(\\text{A}) = \\frac{${p1N}}{${p1D}}, P(\\text{B}) = \\frac{${p2N}}{${p2D}}`
                },
                {
                    text: lang === 'sv' ? "Multiplicera sannolikheterna för att få totalen." : "Multiply the probabilities to get the total.",
                    latex: `\\frac{${p1N}}{${p1D}} \\cdot \\frac{${p2N}}{${p2D}}`
                }
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