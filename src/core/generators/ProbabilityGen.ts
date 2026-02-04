import { MathUtils } from '../utils/MathUtils.js';

export class ProbabilityGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_Visuals(lang);
            case 2: return this.level2_Groups(lang);
            case 3: return this.level3_Percentages(lang); 
            case 4: return this.level4_Complementary(lang);
            case 5: return this.level5_EventChains(lang); 
            case 6: return this.level6_Combinatorics(lang);
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
                ? `I en kontroll av ${ratio.d} glödlampor upptäcktes det att ${ratio.n} var defekta. Vad är sannolikheten i procent att en slumpmässigt vald lampa är defekt?`
                : `In a quality check of ${ratio.d} lightbulbs, ${ratio.n} were found to be defective. What is the probability in percent that a randomly chosen bulb is defective?`;
            steps.push({ text: lang === 'sv' ? "Dela antalet defekta med det totala antalet kontrollerade." : "Divide the number of defective items by the total number checked.", latex: `\\frac{${ratio.n}}{${ratio.d}}` });
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
            { sv: "andelen defekta varor är {x}%", en: "the share of defective goods is {x}%", max: 10 },
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
            ? `Om ${s.sv.replace('{x}', x.toString())}, vad är sannolikheten för komplementhändelsen (motsatsen)?`
            : `If ${s.en.replace('{x}', x.toString())}, what is the probability of the complementary event (the opposite)?`;

        return {
            renderData: { description: desc, answerType: 'numeric', suffix: '%' },
            token: this.toBase64(ans.toString()),
            clues: [
                { text: lang === 'sv' ? "Hela sannolikheten är 100%. Dra bort den kända chansen för att hitta motsatsen." : "The total probability is 100%. Subtract the known chance to find the opposite.", latex: `100\\% - ${x}\\% = ${ans}\\%` }
            ]
        };
    }

    // --- LEVEL 5: Event Chains (10 Scenarios - Without Replacement) ---
    private level5_EventChains(lang: string): any {
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

    // --- LEVEL 6: Combinatorics (Multiplication Principle) ---
    private level6_Combinatorics(lang: string): any {
        const type = MathUtils.randomChoice(['pin', 'menu', 'handshake']);

        if (type === 'pin') {
            const digits = MathUtils.randomChoice([3, 4]);
            const ans = Math.pow(10, digits);
            return {
                renderData: {
                    description: lang === 'sv' ? `Hur många olika ${digits}-siffriga koder kan skapas om siffrorna 0-9 får upprepas?` : `How many different ${digits}-digit codes can be created if the digits 0-9 can repeat?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [{ text: lang === 'sv' ? "Det finns 10 val för varje siffra i koden." : "There are 10 choices for each digit in the code.", latex: `10^${digits}` }]
            };
        }

        if (type === 'handshake') {
            const n = MathUtils.randomInt(5, 12);
            const ans = (n * (n - 1)) / 2;
            return {
                renderData: {
                    description: lang === 'sv' ? `I ett rum träffas ${n} personer och alla skakar hand med varandra exakt en gång. Hur många handskakningar sker totalt?` : `In a room, ${n} people meet and everyone shakes hands with each other exactly once. How many handshakes occur in total?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [{ text: lang === 'sv' ? "Varje person hälsar på n-1 andra, men vi delar på två eftersom person A till B är samma som B till A." : "Each person greets n-1 others, but we divide by two because person A to B is the same as B to A.", latex: `\\frac{${n} \\cdot ${n-1}}{2}` }]
            };
        }

        const s = MathUtils.randomInt(2, 4);
        const m = MathUtils.randomInt(3, 5);
        const d = MathUtils.randomInt(2, 3);
        return {
            renderData: {
                description: lang === 'sv' ? `En meny har ${s} förrätter, ${m} varmrätter och ${d} efterrätter. Hur många olika 3-rätters menyer kan man kombinera?` : `A menu has ${s} starters, ${m} mains, and ${d} desserts. How many different 3-course combinations are possible?`,
                answerType: 'numeric'
            },
            token: this.toBase64((s * m * d).toString()),
            clues: [{ text: lang === 'sv' ? "Multiplicera antalet val i varje kategori med varandra." : "Multiply the number of choices in each category with each other.", latex: `${s} \\cdot ${m} \\cdot ${d}` }]
        };
    }
}