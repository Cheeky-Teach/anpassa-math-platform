import { MathUtils } from '../utils/MathUtils.js';
import { enrichQuestionMetadata } from '../utils/WordProblemDecorator.js';

export class ProbabilityGen {
    // --- CONTEXT LIBRARY (16 Dynamic Scenarios) ---
    private static readonly SCENARIOS = {
        containers: [
            { sv: "en påse", en: "a bag" },
            { sv: "en ask", en: "a box" },
            { sv: "en burk", en: "a jar" },
            { sv: "en skål", en: "a bowl" },
            { sv: "en grupp", en: "a group" },
            { sv: "en låda", en: "a crate" }
        ],
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
            { container: { sv: "en parkering", en: "a parking lot" }, items: [{ sv: ["elbil", "elbilar"], en: ["electric car", "electric cars"] }, { sv: ["bensinbil", "bensinbilar"], en: ["petrol car", "petrol cars"] }] },
            { container: { sv: "en ficka", en: "a pocket" }, items: [{ sv: ["silvermynt", "silvermynt"], en: ["silver coin", "silver coins"] }, { sv: ["guldmynt", "guldmynt"], en: ["gold coin", "gold coins"] }] },
            { container: { sv: "ett klassrum", en: "a classroom" }, items: [{ sv: ["elev med glasögon", "elever med glasögon"], en: ["student with glasses", "students with glasses"] }, { sv: ["elev utan glasögon", "elever utan glasögon"], en: ["student without glasses", "students without glasses"] }] },
            { container: { sv: "en besticklåda", en: "a cutlery tray" }, items: [{ sv: ["gaffel", "gafflar"], en: ["fork", "forks"] }, { sv: ["sked", "skedar"], en: ["spoon", "spoons"] }] },
            { container: { sv: "ett hägn", en: "an enclosure" }, items: [{ sv: ["zebra", "zebror"], en: ["zebra", "zebras"] }, { sv: ["antilop", "antiloper"], en: ["antelope", "antelopes"] }] },
            { container: { sv: "en plåt", en: "a tray" }, items: [{ sv: ["kanelbulle", "kanelbullar"], en: ["cinnamon bun", "cinnamon buns"] }, { sv: ["wienerbröd", "wienerbröd"], en: ["danish pastry", "danish pastries"] }] },
            { container: { sv: "en hög", en: "a pile" }, items: [{ sv: ["rött kort", "röda kort"], en: ["red card", "red cards"] }, { sv: ["svart kort", "svarta kort"], en: ["black card", "black cards"] }] },
            { container: { sv: "ett kontor", en: "an office" }, items: [{ sv: ["laptop", "laptops"], en: ["laptop", "laptops"] }, { sv: ["stationär dator", "stationära datorer"], en: ["desktop computer", "desktop computers"] }] },
            { container: { sv: "en korg", en: "a basket" }, items: [{ sv: ["persika", "persikor"], en: ["peach", "peaches"] }, { sv: ["plommon", "plommon"], en: ["plum", "plums"] }] },
            { container: { sv: "ett gym", en: "a gym" }, items: [{ sv: ["hantel", "hantlar"], en: ["dumbbell", "dumbbells"] }, { sv: ["skivstång", "skivstänger"], en: ["barbell", "barbells"] }] },
            { container: { sv: "en samling", en: "a collection" }, items: [{ sv: ["vinylskiva", "vinylskivor"], en: ["vinyl record", "vinyl records"] }, { sv: ["CD-skiva", "CD-skivor"], en: ["CD", "CDs"] }] },
            { container: { sv: "en garderob", en: "a wardrobe" }, items: [{ sv: ["t-shirt", "t-shirts"], en: ["t-shirt", "t-shirts"] }, { sv: ["hoodie", "hoodies"], en: ["hoodie", "hoodies"] }] },
            { container: { sv: "en utfart", en: "an exit" }, items: [{ sv: ["motorcykel", "motorcyklar"], en: ["motorcycle", "motorcycles"] }, { sv: ["lastbil", "lastbilar"], en: ["truck", "trucks"] }] },
            { container: { sv: "en meny", en: "a menu" }, items: [{ sv: ["vegetarisk rätt", "vegetariska rätter"], en: ["vegetarian dish", "vegetarian dishes"] }, { sv: ["köttbi-rätt", "köttbi-rätter"], en: ["meat dish", "meat dishes"] }] },
            { container: { sv: "en påse", en: "a bag" }, items: [{ sv: ["grön paprika", "gröna paprikor"], en: ["green pepper", "green peppers"] }, { sv: ["gul paprika", "gula paprikor"], en: ["yellow pepper", "yellow peppers"] }] },
            { container: { sv: "en pennfodral", en: "a case" }, items: [{ sv: ["blyertspenna", "blyertspennor"], en: ["pencil", "pencils"] }, { sv: ["tuschpenna", "tuschpennor"], en: ["marker", "markers"] }] }
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
        let questionData: any;

        switch (level) {
            case 1: questionData = this.level1_Visuals(lang, undefined, options); break;
            case 2: questionData = Math.random() > 0.5 ? this.level2_Dice(lang, undefined, options) : this.level2_StandardGroups(lang, undefined, options); break;
            case 3: questionData = this.level3_ConceptsAndLogic(lang, undefined, options); break;
            case 4: questionData = this.level5_ProbabilityTree(lang, undefined, options); break; 
            case 5: questionData = this.level6_EventChains(lang, undefined, options); break;
            case 6: questionData = this.level7_Combinatorics(lang, undefined, options); break;
            case 7: questionData = this.level8_CombinatoricsComplex(lang, undefined, options); break;
            default: questionData = this.level1_Visuals(lang, undefined, options); break;
        }

        // 🟢 Run through the decorator
        enrichQuestionMetadata(questionData);

        // 🟢 Practice Mode Level-Wide Override
        const WORD_PROBLEM_ELIGIBLE_LEVELS = [1, 2, 3, 4, 5, 6, 7];
        if (WORD_PROBLEM_ELIGIBLE_LEVELS.includes(level)) {
            if (!questionData.metadata) questionData.metadata = {};
            questionData.metadata.levelSupportsWordProblems = true;
        }

        return questionData;
    }

    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'visual_not':
            case 'visual_or':
            case 'visual_calc':
            case 'visual_spinner':
            case 'comp_multi': // Now handled by Level 1
            case 'comp_at_least':
            case 'comp_lie':
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

    // --- LEVEL 1: BASICS (Now includes Visuals and Complementary logic) ---
    private level1_Visuals(lang: string, variationKey?: string, options: any = {}): any {
        const pool: {key: string, type: 'calculate'}[] = [
            { key: 'visual_calc', type: 'calculate' },
            { key: 'visual_spinner', type: 'calculate' },
            { key: 'visual_not', type: 'calculate' },
            { key: 'visual_or', type: 'calculate' },
            { key: 'comp_multi', type: 'calculate' }
        ];
        const v = variationKey || this.getVariation(pool as any, options);

        // --- COMPLEMENTARY LOGIC (Merged from Level 4) ---
        if (v === 'comp_multi' || v === 'comp_at_least' || v === 'comp_lie') {
            const pWin = MathUtils.randomInt(1, 9) * 10;
            const pLose = 100 - pWin;
            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Chansen att vinna i ett lotteri är ${pWin}%. Vad är sannolikheten att man INTE vinner?` 
                        : `The chance of winning a lottery is ${pWin}%. What is the probability of NOT winning?`,
                    answerType: 'numeric', suffix: '%'
                },
                token: this.toBase64(pLose.toString()), variationKey: v, clues: [
                    { 
                        text: lang === 'sv' ? "Hela chansen för allt som kan hända i lotteriet är alltid 100% totalt." : "The full chance for everything that can happen in the lottery is always 100% in total.", 
                        latex: `100\\%` 
                    },
                    { 
                        text: lang === 'sv' ? `För att hitta chansen att INTE vinna drar vi bort vinstchansen (${pWin}%) från hela potten på 100%.` : `To find the chance of NOT winning, simply subtract the winning chance (${pWin}%) from the full 100% total.`, 
                        latex: `100\\% - \\mathbf{${pWin}\\%} = \\mathbf{${pLose}\\%}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${pLose}%` : `Answer: ${pLose}%`, 
                        latex: `${pLose}\\%` 
                    }
                ]
            };
        }

        const colorLabels = lang === 'sv' ? ["Röda", "Blåa", "Gröna"] : ["Red", "Blue", "Green"];

        // Spinner/OR variation
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
                    description: lang === 'sv' ? `Ett lyckohjul har ${sections} delar. ${winA} är ${colorLabels[0].toLowerCase()} och ${winB} är ${colorLabels[1].toLowerCase()}. Vad är sannolikheten att hjulet stannar på ${targetText}?` : `A spinner has ${sections} sections. ${winA} are ${colorLabels[0].toLowerCase()} and ${winB} are ${colorLabels[1].toLowerCase()}. What is the probability of landing on ${targetText}?`,
                    answerType: 'fraction',
                    geometry: { type: 'probability_spinner', sections, counts: { red: winA, blue: winB } }
                },
                token: this.toBase64(ans), variationKey: v, clues: [
                    { 
                        text: lang === 'sv' ? "Chansen skriver vi som ett bråk: Siffran du letar efter ska stå däruppe, och alla tårtbitar totalt ska stå där nere." : "We write the chance as a fraction: The number you are searching for goes on top, and all pie sections in total go at the bottom.", 
                        latex: `\\text{Chans} = \\frac{\\text{Delarna du letar efter}}{\\text{Alla tårtbitar totalt}}` 
                    },
                    { 
                        text: lang === 'sv' ? (isOr ? `Räkna ihop vinstbitarna du letar efter: plussa ihop ${colorLabels[0].toLowerCase()} (${winA}) och ${colorLabels[1].toLowerCase()} (${winB}).` : `Kolla hur många bitar som matchar färgen du letar efter (${colorLabels[0].toLowerCase()}).`) : (isOr ? `Count up the winning slices you are looking for: add ${colorLabels[0].toLowerCase()} (${winA}) and ${colorLabels[1].toLowerCase()} (${winB}) together.` : `Check how many sections match the color you are looking for (${colorLabels[0].toLowerCase()}).`), 
                        latex: isOr ? `\\text{Önskade bitar} = ${winA} + ${winB} = \\mathbf{${favorable}}` : `\\text{Önskade bitar} = \\mathbf{${favorable}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Sätt nu upp ditt chans-bråk med vinstbitarna däruppe och alla hjulets delar (${sections}) där nere.` : `Now set up your chance fraction with the winning parts on top and all the wheel's sections (${sections}) at the bottom.`, 
                        latex: `\\text{Chans} = \\frac{\\mathbf{${favorable}}}{\\mathbf{${sections}}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                        latex: `\\frac{${favorable}}{${sections}}` 
                    }
                ]
            };
        }

        // Standard Visual Calculation (Marbles)
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
                { 
                    text: lang === 'sv' ? "Vi bygger ett enkelt chans-bråk: Delarna vi söker ska stå överst, och alla kulor i påsen sammanlagt ska stå underst." : "We construct a simple chance fraction: The parts we are looking for belong on top, and all the marbles in the bag combined belong at the bottom.", 
                    latex: `\\text{Chans} = \\frac{\\text{Delarna du söker}}{\\text{Alla sammanlagt}}` 
                },
                { 
                    text: lang === 'sv' ? `Räkna först ut hur många kulor det finns i påsen sammanlagt.` : `First, figure out how many total marbles are in the bag altogether.`, 
                    latex: `\\text{Alla sammanlagt} = ${counts[0]} + ${counts[1]} + ${counts[2]} = \\mathbf{${total}}` 
                },
                { 
                    text: lang === 'sv' ? (isNot ? `Räkna nu hur många kulor som INTE är ${colorLabels[target].toLowerCase()}: Ta bort de ${counts[target]} färgade från hela högen.` : `Räkna hur många kulor som matchar färgen du letar efter (${colorLabels[target].toLowerCase()}).`) : (isNot ? `Now count how many marbles are NOT ${colorLabels[target].toLowerCase()}: Remove those ${counts[target]} colored ones from the total pile.` : `Count how many marbles match the specific color you are looking for (${colorLabels[target].toLowerCase()}).`), 
                    latex: isNot ? `\\text{Delarna du söker} = ${total} - ${counts[target]} = \\mathbf{${favorable}}` : `\\text{Delarna du söker} = \\mathbf{${favorable}}` 
                },
                { 
                    text: lang === 'sv' ? "Ställ upp chans-bråket med dina två uträknade värden:" : "Place your two calculated values directly into the finished chance fraction layout:", 
                    latex: `\\text{Chans} = \\frac{\\mathbf{${favorable}}}{\\mathbf{${total}}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${favorable}/${total}` : `Answer: ${favorable}/${total}`, 
                    latex: `\\frac{${favorable}}{${total}}` 
                }
            ]
        };
    }

    // --- LEVEL 2: DICE PROBABILITY ---
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
                    { 
                        text: lang === 'sv' ? "En helt vanlig tärning har 6 sidor totalt: 1, 2, 3, 4, 5 och 6." : "A standard playing die has 6 total faces: 1, 2, 3, 4, 5, and 6.", 
                        latex: `\\text{Sidor totalt} = 6` 
                    },
                    { 
                        text: lang === 'sv' ? `Bland de 6 sidorna finns det bara EN enda ensam sida som har siffran ${target}.` : `Among those 6 faces, there is only ONE single face that features the digit ${target}.`, 
                        latex: `\\text{Önskade sidor} = 1` 
                    },
                    { 
                        text: lang === 'sv' ? "Skriv chans-bråket genom att sätta din önskade sida överst och alla sidor underst:" : "Write the chance fraction by setting your desired outcome face on top and all faces below:", 
                        latex: `\\text{Chans} = \\frac{\\mathbf{1}}{\\mathbf{6}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: 1/6` : `Answer: 1/6`, 
                        latex: `\\frac{1}{6}` 
                    }
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
                    { 
                        text: lang === 'sv' ? `Räkna upp hur många sidor på tärningen som visar ett ${label} tal: det är siffrorna ${set}.` : `Count how many faces on the die show an ${label} number: those are the options ${set}.`, 
                        latex: `\\text{Önskade sidor} = \\mathbf{3}` 
                    },
                    { 
                        text: lang === 'sv' ? "En tärning har 6 sidor sammanlagt. Sätt dina 3 önskade alternativ överst i chans-bråket:" : "A playing die features 6 faces total. Place your 3 desired outcomes on top of the chance fraction:", 
                        latex: `\\text{Chans} = \\frac{\\mathbf{3}}{\\mathbf{6}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: 3/6` : `Answer: 3/6`, 
                        latex: `\\frac{3}{6}` 
                    }
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
                { 
                    text: lang === 'sv' ? `Leta upp och räkna alla sidor på tärningen som faktiskt är ${op} ${limit}.` : `Look up and count all the faces on the die that are actually ${op} ${limit}.`, 
                    latex: `\\text{Matchande sidor: } ${favSet.join(', ')}` 
                },
                { 
                    text: lang === 'sv' ? `Det finns exakt ${favorable} stycken sidor som stämmer överens med kravet.` : `There are exactly ${favorable} outcome faces that meet that rule criteria.`, 
                    latex: `\\text{Önskade sidor} = \\mathbf{${favorable}}` 
                },
                { 
                    text: lang === 'sv' ? "Ställ upp bråket med de önskade sidorna överst och tärningens 6 sidor underst:" : "Set up the fraction with the matching layout count on top and the die's 6 total faces below:", 
                    latex: `\\text{Chans} = \\frac{\\mathbf{${favorable}}}{\\mathbf{6}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${favorable}/6` : `Answer: ${favorable}/6`, 
                    latex: `\\frac{${favorable}}{6}` 
                }
            ]
        };
    }

    // --- LEVEL 2: STANDARD GROUPS ---
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
                    { 
                        text: lang === 'sv' ? `Förhållandet berättar i vilka proportioner högarna är uppdelade: Det betyder att det går ${r1} st ${labels[0]} på varje ${r2} st ${labels[1]}.` : `The ratio statement directly displays the step proportions: It maps out ${r1} pieces of ${labels[0]} for every ${r2} pieces of ${labels[1]}.`, 
                        latex: `${r1} : ${r2}` 
                    },
                    { 
                        text: lang === 'sv' ? `Räkna ut hur många delar det finns sammanlagt i hela gruppen genom att plussa ihop dem.` : `Calculate how many parts exist combined inside the entire group framework by adding them together.`, 
                        latex: `\\text{Hela totalen} = ${r1} + ${r2} = \\mathbf{${total}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Ställ upp chans-bråket med antalet delar du letar efter (${r1}) överst på strecket:` : `Set up the chance fraction with the amount parameter value you are tracking (${r1}) on top of the bar line:`, 
                        latex: `\\text{Chans} = \\frac{\\mathbf{${r1}}}{\\mathbf{${total}}}` 
                    },
                    { 
                        text: lang === 'sv' ? `Svar: ${r1}/${total}` : `Answer: ${r1}/${total}`, 
                        latex: `\\frac{${r1}}{${total}}` 
                    }
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
                { 
                    text: lang === 'sv' ? `Börja med att ta reda på hur många föremål det finns kvar till den sista dolda sorten (${labels[2]}). Ta hela totalen minus de kända sorterna.` : `Start by figuring out how many items are left over for the final hidden category (${labels[2]}). Take the complete total minus the known categories.`, 
                    latex: `\\text{Antal ${labels[2]}} = ${total} - ${a} - ${b} = \\mathbf{${other}}` 
                },
                { 
                    text: lang === 'sv' ? `Ställ upp chans-bråket genom att placera de ${other} st sökta föremålen överst och hela grupptotalen (${total}) underst.` : `Now set up the chance fraction layout by placing the discovered ${other} items on top and the total group size (${total}) at the bottom.`, 
                    latex: `\\text{Chans} = \\frac{\\mathbf{${other}}}{\\mathbf{${total}}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${other}/${total}` : `Answer: ${other}/${total}`, 
                    latex: `\\frac{${other}}{${total}}` 
                }
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
            const numericVal = scenarioObj.val;

            return {
                renderData: {
                    description: lang === 'sv' ? `Hur sannolikt är det: "${scenario}"?` : `How likely is this: "${scenario}"?`,
                    answerType: 'multiple_choice',
                    options: lang === 'sv' ? ["Omöjligt", "Säkert", "Hälften/Hälften"] : ["Impossible", "Certain", "Even chance"]
                },
                token: this.toBase64(label), variationKey: v, type: 'concept', clues: [
                    { 
                        text: lang === 'sv' ? `Tänk efter logiskt: händelsen "${scenario}" har ett bestämt matematiskt värde på chans-skalan.` : `Think logically: the event "${scenario}" has a specific mathematical position on our scale.`,
                        latex: `\\text{Mätpunkt} = \\mathbf{${numericVal}}`
                    },
                    { 
                        text: lang === 'sv' ? `Detta motsvarar det rätta svaret: ${label}.` : `This matches the correct choice item: ${label}.`,
                        latex: `\\text{Svar} = \\text{${label}}` 
                    }
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
            token: this.toBase64(valid), variationKey: v, type: 'concept', clues: [
                { 
                    text: lang === 'sv' ? "Kom ihåg grundregeln för chanser: En chans kan aldrig vara mindre än 0% (helt omöjligt) och aldrig någonsin högre än 100% (helt säkert)." : "Remember the core rule of chances: A chance can never drop below 0% (totally impossible) and can never exceed 100% (absolutely certain).", 
                    latex: `0\\% \\le \\text{Chans} \\le 100\\%` 
                },
                { 
                    text: lang === 'sv' ? "Gör vi om procentgränserna till decimalform betyder det att ett chans-tal MÅSTE ligga inklämt mellan 0 och 1,00." : "Converting the percentage limits into standard decimal values means that a valid chance value MUST sit locked between 0 and 1.00.", 
                    latex: `0 \\le \\text{Chans-tal} \\le 1,00` 
                },
                { 
                    text: lang === 'sv' ? `Tittar vi på alternativen ser vi att bara talet ${valid.replace('.', ',')} ligger perfekt inuti den tillåtna skalan.` : `Reviewing our options layout grid, only the specific value ${valid.replace('.', ',')} sits safely inside the allowed scaling limits.`, 
                    latex: `\\mathbf{0 \\le ${valid.replace('.', ',')} \\le 1,00}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${valid}` : `Answer: ${valid}`, 
                    latex: `\\text{Värde} = ${valid.replace('.', ',')}` 
                }
            ]
        };
    }

    // --- LEVEL 5 & 6 HELPER: DYNAMIC SCENARIOS ---
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

    // --- LEVEL 5: PROBABILITY TREE ---
    private level5_ProbabilityTree(lang: string, variationKey?: string, options: any = {}): any {
        const s = this.getChainScenario(lang);
        const ansN = s.n1 * s.n2;
        const ansD = s.total * (s.total - 1);
        const ans = this.rawFraction(ansN, ansD);

        return {
            renderData: {
                description: lang === 'sv' ? `${s.countText} Du drar två slumpmässigt utan återläggning. Vad är sannolikheten att du drar en ${s.label1} först och därefter en ${s.label2}?` : `${s.countText} You pick two at random without replacement. What is the probability that you pick a ${s.label1} first and then a ${s.label2}?`,
                answerType: 'fraction',
                geometry: { type: 'probability_tree', groups: lang === 'sv' ? [s.scenario.items[0].sv[0], s.scenario.items[1].sv[0]] : [s.scenario.items[0].en[0], s.scenario.items[1].en[0]], initialCounts: [s.c1, s.c2], targetBranch: 's2_1' }
            },
            token: this.toBase64(ans), variationKey: 'tree_calc', clues: [
                { 
                    text: lang === 'sv' ? `Här ska vi göra två drag efter varandra. Det superviktiga ordet är UTAN ÅTERLÄGGNING. Det betyder att när vi plockat det första föremålet är det borta, så totalen minskar med ett till nästa gång!` : `Here we are executing two picks in a row. The most critical detail is WITHOUT REPLACEMENT. This means that once the first item is selected, it is gone permanently—so the total count reduces by one for the next turn!`, 
                    latex: `\\text{Totala startantalet} = ${s.total}` 
                },
                { 
                    text: lang === 'sv' ? `Räkna ut chans-bråket för det första valet (${s.label1}): Det finns ${s.n1} st av totalt ${s.total} prylar.` : `Calculate the chance fraction for the first pick (${s.label1}): There are ${s.n1} matching items out of ${s.total} items total.`, 
                    latex: `\\text{Chans 1} = \\frac{${s.n1}}{${s.total}}` 
                },
                { 
                    text: lang === 'sv' ? `Räkna ut chans-bråket för det andra valet (${s.label2}): Nu finns det bara ${s.total - 1} prylar kvar totalt, och antalet matchningar är ${s.n2}.` : `Calculate the chance fraction for the second pick (${s.label2}): Now there are only ${s.total - 1} items remaining total, and the available matching count is ${s.n2}.`, 
                    latex: `\\text{Chans 2} = \\frac{${s.n2}}{\\mathbf{${s.total - 1}}}` 
                },
                { 
                    text: lang === 'sv' ? "För att hitta den totala chansen att båda sakerna händer efter varandra, gångrar (multiplicerar) vi de två bråken rakt över." : "To calculate the combined total chain chance of both events taking place consecutively, we multiply the two fractional blocks straight across.", 
                    latex: `\\text{Total chans} = \\frac{${s.n1}}{${s.total}} \\cdot \\frac{${s.n2}}{${s.total - 1}}` 
                },
                { 
                    text: lang === 'sv' ? `Gångra täljarna för sig (${s.n1} · ${s.n2} = ${ansN}) och nämnarna för sig (${s.total} · ${s.total - 1} = ${ansD}):` : `Multiply the numerators independently (${s.n1} · ${s.n2} = ${ansN}) and the denominators independently (${s.total} · ${s.total - 1} = ${ansD}):`, 
                    latex: `\\text{Total chans} = \\frac{\\mathbf{${s.n1} \\cdot ${s.n2}}}{\\mathbf{${s.total} \\cdot ${s.total - 1}}} = \\frac{\\mathbf{${ansN}}}{\\mathbf{${ansD}}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                    latex: `\\frac{${ansN}}{${ansD}}` 
                }
            ]
        };
    }

    // --- LEVEL 6: EVENT CHAINS ---
    private level6_EventChains(lang: string, variationKey?: string, options: any = {}): any {
        const s = this.getChainScenario(lang);
        const p1N = s.c1 * s.c2;
        const p2N = s.c2 * s.c1;
        const den = s.total * (s.total - 1);
        const ans = this.rawFraction(p1N + p2N, den);

        return {
            renderData: { description: lang === 'sv' ? `${s.countText} Du väljer två slumpmässigt utan återläggning. Vad är sannolikheten att få en av varje sort?` : `${s.countText} You choose two at random without replacement. What is the probability of getting one of each kind?`, answerType: 'fraction' },
            token: this.toBase64(ans), variationKey: 'chain_any_order', clues: [
                { 
                    text: lang === 'sv' ? `Att få "en av varje sort" kan hända på två sätt: Antingen får du (${s.label1} först, sen ${s.label2}) ELLER så får du tvärtom. Vi måste räkna ut båda vägarna och plussa ihop dem.` : `Reaching "one of each kind" can take place along two separate paths: Either you pull (${s.label1} first, then ${s.label2}) OR you pull the exact opposite order. We must calculate both paths and add them together.`, 
                    latex: `\\text{Total chans} = \\text{Chans}_{(\\text{Väg 1})} + \\text{Chans}_{(\\text{Väg 2})}` 
                },
                { 
                    text: lang === 'sv' ? `Räkna ut Väg 1: gångra chanserna efter varandra. Kom ihåg att totalen sjunker till ${s.total - 1} i andra steget!` : `Calculate Path 1: multiply the tracking steps sequence. Remember the total drops down to ${s.total - 1} on the second pull!`, 
                    latex: `\\text{Chans}_{(\\text{Väg 1})} = \\frac{${s.c1}}{${s.total}} \\cdot \\frac{${s.c2}}{${s.total - 1}} = \\mathbf{\\frac{${p1N}}{${den}}}` 
                },
                { 
                    text: lang === 'sv' ? `Räkna ut Väg 2 (omvänd ordning): gångra chanserna på samma sätt. Det blir också samma bottennummer.` : `Calculate Path 2 (the reverse order layout): multiply the tracking step values symmetrically. It yields identical denominator limits.`, 
                    latex: `\\text{Chans}_{(\\text{Väg 2})} = \\frac{${s.c2}}{${s.total}} \\cdot \\frac{${s.c1}}{${s.total - 1}} = \\mathbf{\\frac{${p2N}}{${den}}}` 
                },
                { 
                    text: lang === 'sv' ? `Plussa till sist ihop de två bråksvaren. Eftersom bottennumren är likadana (${den}) lägger vi bara ihop siffrorna där uppe.` : `Finally, add those two separate fraction results together. Since the bottom numbers are identical (${den}), we simply combine the values on top.`, 
                    latex: `\\text{Total chans} = \\frac{${p1N}}{${den}} + \\frac{${p2N}}{${den}} = \\frac{\\mathbf{${p1N} + ${p2N}}}{${den}} = \\mathbf{\\frac{${p1N + p2N}}{${den}}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                    latex: `\\frac{${p1N + p2N}}{${den}}` 
                }
            ]
        };
    }

    // --- LEVEL 7: COMBINATORICS ---
    private level7_Combinatorics(lang: string, variationKey?: string, options: any = {}): any {
        const c1 = MathUtils.randomInt(5, 15);
        const c2 = MathUtils.randomInt(8, 20);
        const ans = c1 * c2;
        return {
            renderData: {
                description: lang === 'sv' ? `En restaurang har ${c1} förrätter och ${c2} varmrätter. På hur många sätt kan du kombinera dem?` : `A restaurant has ${c1} starters and ${c2} main courses. In how many ways can you combine them?`,
                answerType: 'numeric'
            },
            token: this.toBase64(ans.toString()), variationKey: 'comb_constraint', clues: [
                { 
                    text: lang === 'sv' ? `När vi ska kombinera alternativ från två olika listor, gångrar (multiplicerar) vi helt enkelt antalet val i den första listan med antalet val i den andra listan.` : `When pairing items from two distinct separate lists, we simply multiply the number of options in the first list by the number of choices in the second list.`, 
                    latex: `\\text{Totala kombinationer} = \\text{val}_1 \\cdot \\text{val}_2` 
                },
                { 
                    text: lang === 'sv' ? `Gångra alternativen med varandra på raden: ${c1} stycken förrätter multiplicerat med ${c2} stycken varmrätter.` : `Multiply the option totals together on the line: ${c1} starters multiplied by ${c2} main courses.`, 
                    latex: `\\text{Totala kombinationer} = \\mathbf{${c1} \\cdot ${c2}}` 
                },
                { 
                    text: lang === 'sv' ? "Räkna ut multiplikationen för att bestämma totalsvaret." : "Calculate the multiplication to determine the total count.", 
                    latex: `\\text{Totala kombinationer} = \\mathbf{${ans}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                    latex: `${ans}` 
                }
            ]
        };
    }

    // --- LEVEL 8: COMPLEX PATHWAYS ---
    private level8_CombinatoricsComplex(lang: string, variationKey?: string, options: any = {}): any {
        const layers = [1, MathUtils.randomInt(2, 4), MathUtils.randomInt(2, 4), 1];
        const c1 = layers[1];
        const c2 = layers[2];
        const totalPossible = c1 * c2;
        
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
            token: this.toBase64(ans.toString()), variationKey: obstacles.length > 0 ? 'pathways_blocked' : 'pathways_basic', 
            clues: [
                { 
                    text: lang === 'sv' ? `För att ta oss från punkt A till punkt B passerar vi först en korsning med ${c1} linjer, och därefter en uppsättning med ${c2} linjer.` : `To travel from point A to point B, we first pass through a crossing of ${c1} tracks, and then a secondary set of ${c2} tracks.`, 
                    latex: `\\text{Totala möljiga vägar} = \\text{linjer}_1 \\cdot \\text{linjer}_2` 
                },
                { 
                    text: lang === 'sv' ? `Räkna ut alla tänkbara vägar om ingenting var avstängt: ${c1} gånger ${c2} ger oss totalt ${totalPossible} vägar.` : `Calculate all imaginable routes if nothing was broken: ${c1} times ${c2} yields a maximum total of ${totalPossible} pathways.`, 
                    latex: `\\text{Totala möjliga vägar} = ${c1} \\cdot ${c2} = \\mathbf{${totalPossible}}` 
                },
                obstacles.length > 0 ? {
                    text: lang === 'sv' ? `Kika på bilden och räkna antalet blockerade avstängda vägar (streckade linjer med röda märken). Det finns exakt ${obstacles.length} stängda linjer.` : `Look closely at the diagram and count the blocked routes (dashed lines with red marks). There are exactly ${obstacles.length} closed lines.`,
                    latex: `\\text{Blockerade vägar} = \\mathbf{${obstacles.length}}`
                } : {
                    text: lang === 'sv' ? "Eftersom det inte finns några röda spärrar eller trasiga linjer i den här uppgiften, går noll vägar bort." : "Since there are zero red barriers or broken lines inside this diagram, zero routes are lost.",
                    latex: `\\text{Blockerade vägar} = \\mathbf{0}`
                },
                { 
                    text: lang === 'sv' ? `Dra bort de stängda linjerna (${obstacles.length}) från hela totalen (${totalPossible}) för att se hur många vägar som fortfarande fungerar.` : `Subtract the closed paths (${obstacles.length}) from the total possible maximum (${totalPossible}) to calculate how many pathways still work.`, 
                    latex: `\\text{Fungerande vägar} = ${totalPossible} \\mathbf{- ${obstacles.length}}` 
                },
                { 
                    text: lang === 'sv' ? "Utför subtraktionen för att fastställa det slutgiltiga antalet fungerande vägar." : "Perform the subtraction step to establish the final total count of working pathways.", 
                    latex: `\\text{Fungerande vägar} = \\mathbf{${ans}}` 
                },
                { 
                    text: lang === 'sv' ? `Svar: ${ans}` : `Answer: ${ans}`, 
                    latex: `${ans}` 
                }
            ]
        };
    }
}