import { MathUtils } from '../utils/MathUtils.js';

export class ProbabilityGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_Visuals(lang);
            case 2: return this.level2_StandardRandomness(lang);
            case 3: return this.level3_PercentConversion(lang);
            case 4: return this.level4_Complementary(lang);
            case 5: return this.level5_CompoundIndependent(lang);
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
        return `${n/divisor}/${d/divisor}`;
    }

    // Level 1: Visual Probability (Marbles & Spinners)
    private level1_Visuals(lang: string): any {
        const type = MathUtils.randomChoice(['marbles', 'spinner']);
        
        if (type === 'marbles') {
            const red = MathUtils.randomInt(1, 5);
            const blue = MathUtils.randomInt(1, 5);
            const green = MathUtils.randomInt(1, 5);
            const total = red + blue + green;
            
            const target = MathUtils.randomChoice(['red', 'blue', 'green']);
            const targetVal = target === 'red' ? red : (target === 'blue' ? blue : green);
            const targetName = lang === 'sv' ? (target === 'red' ? 'röd' : (target === 'blue' ? 'blå' : 'grön')) : target;

            const desc = lang === 'sv' 
                ? `Vad är sannolikheten att dra en ${targetName} kula? (Svara i bråkform)`
                : `What is the probability of picking a ${targetName} marble? (Answer as fraction)`;

            const ans = this.simplifyFraction(targetVal, total);

            return {
                renderData: {
                    description: desc,
                    answerType: 'text',
                    geometry: { 
                        type: 'probability_marbles', 
                        items: { red, blue, green } 
                    }
                },
                token: this.toBase64(ans),
                clues: [
                    { 
                        text: lang === 'sv' ? `Antal ${targetName}a kulor: ${targetVal}` : `Number of ${targetName} marbles: ${targetVal}`,
                        latex: `\\frac{\\text{Delen}}{\\text{Det hela}}`
                    },
                    { 
                        text: lang === 'sv' ? `Totalt antal kulor: ${total}` : `Total marbles: ${total}`,
                        latex: `${red} + ${blue} + ${green} = ${total}`
                    }
                ]
            };
        } else {
            // Spinner
            const sections = MathUtils.randomInt(3, 6);
            const desc = lang === 'sv' 
                ? `Vad är sannolikheten att pilen stannar på blått? (Svara i bråkform)`
                : `What is the probability the arrow lands on blue? (Answer as fraction)`;
            
            return {
                renderData: {
                    description: desc,
                    answerType: 'text',
                    geometry: { type: 'probability_spinner', sections: sections, target: 1 }
                },
                token: this.toBase64(`1/${sections}`),
                clues: [
                    { text: lang === 'sv' ? "Hur många blåa fält finns det?" : "How many blue sections are there?" },
                    { text: lang === 'sv' ? "Hur många fält finns det totalt?" : "How many sections total?" }
                ]
            };
        }
    }

    // Level 2: Dice & Decks
    private level2_StandardRandomness(lang: string): any {
        const scenario = MathUtils.randomChoice(['die', 'card']);

        if (scenario === 'die') {
            const mode = MathUtils.randomChoice(['gt', 'lt', 'even', 'odd', 'exact']);
            let favorable = 0;
            let labelSv = "", labelEn = "";

            if (mode === 'gt') {
                const n = MathUtils.randomInt(1, 4);
                favorable = 6 - n;
                labelSv = `större än ${n}`; labelEn = `greater than ${n}`;
            } else if (mode === 'lt') {
                const n = MathUtils.randomInt(3, 6);
                favorable = n - 1;
                labelSv = `mindre än ${n}`; labelEn = `less than ${n}`;
            } else if (mode === 'even') {
                favorable = 3; labelSv = "jämnt tal"; labelEn = "an even number";
            } else if (mode === 'odd') {
                favorable = 3; labelSv = "udda tal"; labelEn = "an odd number";
            } else {
                favorable = 1; 
                const n = MathUtils.randomInt(1, 6);
                labelSv = `en ${n}:a`; labelEn = `a ${n}`;
            }

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Du kastar en tärning. Vad är sannolikheten att få ${labelSv}? (Svara i bråkform)`
                        : `You roll a die. What is the probability of getting ${labelEn}? (Answer as fraction)`,
                    answerType: 'text',
                    geometry: { type: 'scale_single', shape: 'cube', label: '1-6' } 
                },
                token: this.toBase64(this.simplifyFraction(favorable, 6)),
                clues: [{ text: "Gynsamma utfall / Möjliga utfall", latex: `\\frac{${favorable}}{6}` }]
            };
        } 
        else {
            return {
                renderData: {
                    description: lang === 'sv' 
                        ? "Du drar ett kort ur en lek (52 kort). Vad är sannolikheten att det är Hjärter? (Svara i bråkform)"
                        : "You pick a card from a deck (52 cards). What is the probability it is Hearts? (Answer as fraction)",
                    answerType: 'text'
                },
                token: this.toBase64("1/4"),
                clues: [
                    { text: lang === 'sv' ? "Det finns 4 färger: Hjärter, Spader, Ruter, Klöver." : "There are 4 suits: Hearts, Spades, Diamonds, Clubs." },
                    { text: lang === 'sv' ? "Varje färg är lika sannolik." : "Each suit is equally likely." }
                ]
            };
        }
    }

    // Level 3: Probability as Percent (Expanded Scenarios)
    private level3_PercentConversion(lang: string): any {
        // Scenarios where percentage makes sense
        const scenarios = [
            { 
                sv: (t:number, f:number) => `Du kastar pil ${t} gånger och träffar tavlan ${f} gånger. Vad är din träffsäkerhet i procent?`,
                en: (t:number, f:number) => `You throw a dart ${t} times and hit the board ${f} times. What is your accuracy in percent?`
            },
            { 
                sv: (t:number, f:number) => `En klass har ${t} elever. ${f} elever har glasögon. Hur stor andel har glasögon?`,
                en: (t:number, f:number) => `A class has ${t} students. ${f} students wear glasses. What percent wear glasses?`
            },
            { 
                sv: (t:number, f:number) => `Du drar en lott ur en låda med ${t} lotter. ${f} st är vinstlotter. Vad är vinstchansen?`,
                en: (t:number, f:number) => `You pick a ticket from a box of ${t}. ${f} are winning tickets. What is the chance to win?`
            },
            {
                sv: (t:number, f:number) => `Det har regnat ${f} av de senaste ${t} dagarna. Hur stor andel är det?`,
                en: (t:number, f:number) => `It rained on ${f} of the last ${t} days. What percentage is that?`
            },
            {
                sv: (t:number, f:number) => `I en låda med ${t} glödlampor är ${f} trasiga. Hur många procent är trasiga?`,
                en: (t:number, f:number) => `In a box of ${t} light bulbs, ${f} are broken. What percent are broken?`
            },
            {
                sv: (t:number, f:number) => `En fotbollsspelare skjuter ${t} skott och gör mål ${f} gånger. Vad är målchansen?`,
                en: (t:number, f:number) => `A soccer player takes ${t} shots and scores ${f} goals. What is the goal percentage?`
            },
            {
                sv: (t:number, f:number) => `Du passerar ${t} trafikljus. ${f} visade grönt. Hur stor andel var gröna?`,
                en: (t:number, f:number) => `You pass ${t} traffic lights. ${f} were green. What percentage were green?`
            },
            {
                sv: (t:number, f:number) => `I en undersökning med ${t} personer svarade ${f} "Ja". Hur många procent sa Ja?`,
                en: (t:number, f:number) => `In a survey of ${t} people, ${f} said "Yes". What percent said Yes?`
            },
            {
                sv: (t:number, f:number) => `Du planterade ${t} frön. ${f} av dem växte upp. Vad är grobarheten?`,
                en: (t:number, f:number) => `You planted ${t} seeds. ${f} of them sprouted. What is the germination rate?`
            }
        ];

        // Ensure numbers result in clean percentages (10, 20, 25, 50 as bases)
        const total = MathUtils.randomChoice([10, 20, 25, 50]);
        const favorable = MathUtils.randomInt(1, total - 1);
        const percent = (favorable / total) * 100;
        
        const s = MathUtils.randomChoice(scenarios);
        const descText = lang === 'sv' ? s.sv(total, favorable) : s.en(total, favorable);
        const instruction = lang === 'sv' ? "(Svara i procent)" : "(Answer in percent)";

        return {
            renderData: {
                description: `${descText} ${instruction}`,
                answerType: 'numeric',
                suffix: '%'
            },
            token: this.toBase64(percent.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? "Börja med att ställa upp det som ett bråk (delen genom det hela)." : "Start by writing it as a fraction (part over whole).", 
                    latex: `\\frac{${favorable}}{${total}}` 
                },
                { 
                    text: lang === 'sv' ? "För att få procent, multiplicera bråket med 100." : "To get percent, multiply the fraction by 100.", 
                    latex: `\\frac{${favorable}}{${total}} \\cdot 100 = ${percent}` 
                }
            ]
        };
    }

    // Level 4: Complementary Events (P(Not))
    private level4_Complementary(lang: string): any {
        const type = MathUtils.randomInt(1, 2);
        
        if (type === 1) { // Percent
            const rainChance = MathUtils.randomInt(1, 9) * 10;
            const desc = lang === 'sv'
                ? `Sannolikheten för regn är ${rainChance}%. Vad är sannolikheten att det INTE regnar?`
                : `The probability of rain is ${rainChance}%. What is the probability it does NOT rain?`;
                
            return {
                renderData: {
                    description: desc,
                    answerType: 'numeric',
                    suffix: '%'
                },
                token: this.toBase64((100 - rainChance).toString()),
                clues: [
                    { text: lang === 'sv' ? "Hela sannolikheten (regn + inte regn) måste bli 100%." : "The total probability (rain + not rain) must be 100%." },
                    { text: lang === 'sv' ? "Ta bort regnchansen från 100%." : "Subtract rain chance from 100%.", latex: `100\\% - ${rainChance}\\%` }
                ]
            };
        } else { // Fraction
            const total = MathUtils.randomInt(5, 20);
            const red = MathUtils.randomInt(1, total - 2);
            
            const desc = lang === 'sv'
                ? `I en påse finns ${total} kulor. ${red} är röda. Vad är sannolikheten att dra en kula som INTE är röd? (Svara i bråkform)`
                : `A bag has ${total} marbles. ${red} are red. What is the probability of picking a marble that is NOT red? (Answer as fraction)`;

            return {
                renderData: {
                    description: desc,
                    answerType: 'text'
                },
                token: this.toBase64(this.simplifyFraction(total - red, total)),
                clues: [
                    { text: lang === 'sv' ? "Om vi inte vill ha röda, vilka kulor räknas då? Jo, alla andra." : "If we don't want red, which marbles count? All the others." },
                    { text: lang === 'sv' ? "Subtrahera de röda från totalen." : "Subtract the red ones from the total.", latex: `${total} - ${red} = ${total - red}` },
                    { latex: `\\frac{${total - red}}{${total}}` }
                ]
            };
        }
    }

    // Level 5: Compound Independent Events (Multiplying)
    private level5_CompoundIndependent(lang: string): any {
        const s = MathUtils.randomChoice(['2coins', 'coin_die']);
        
        if (s === '2coins') {
            const desc = lang === 'sv' 
                ? "Du singlar slant med två mynt. Vad är sannolikheten att BÅDA visar Krona? (Svara i bråkform)"
                : "You flip two coins. What is the probability BOTH show Heads? (Answer as fraction)";
            
            return {
                renderData: { description: desc, answerType: 'text' },
                token: this.toBase64("1/4"),
                clues: [
                    { text: lang === 'sv' ? "Sannolikheten för ETT mynt är 1/2." : "Probability for ONE coin is 1/2." },
                    { text: lang === 'sv' ? "För att BÅDA ska hända måste vi multiplicera." : "For BOTH to happen, we multiply.", latex: "\\frac{1}{2} \\cdot \\frac{1}{2}" }
                ]
            };
        } else {
            const desc = lang === 'sv'
                ? "Du singlar slant och slår en tärning. Vad är sannolikheten för Krona OCH en 6:a? (Svara i bråkform)"
                : "You flip a coin and roll a die. What is the probability of Heads AND a 6? (Answer as fraction)";
            
            return {
                renderData: { description: desc, answerType: 'text' },
                token: this.toBase64("1/12"),
                clues: [
                    { text: lang === 'sv' ? "Sannolikhet för Krona = 1/2. Sannolikhet för 6:a = 1/6." : "Prob for Heads = 1/2. Prob for 6 = 1/6." },
                    { text: lang === 'sv' ? "Multiplicera dem:" : "Multiply them:", latex: `\\frac{1}{2} \\cdot \\frac{1}{6}` }
                ]
            };
        }
    }

    // Level 6: Combinatorics (Scaffolded Difficulty)
    private level6_Combinatorics(lang: string): any {
        // Scenarios:
        // 1. Basic Multiplication Principle (A * B) - e.g. Outfits, Meals
        // 2. Multi-Step Multiplication (A * B * C) - e.g. Code Lock, Paths
        // 3. Permutations (Arrangements) - e.g. Books on shelf, Runners podium
        // 4. Combinations Logic (Selections) - e.g. Handshakes
        
        const type = MathUtils.randomChoice(['basic', 'multi', 'perm', 'select']);
        
        // --- 1. Basic Multiplication (Outfits/Menu) ---
        if (type === 'basic') {
            const A = MathUtils.randomInt(3, 6);
            const B = MathUtils.randomInt(3, 8);
            const total = A * B;
            const isOutfits = Math.random() > 0.5;

            const desc = isOutfits
                ? (lang === 'sv' ? `Du har ${A} tröjor och ${B} byxor. Hur många olika outfits kan du välja?` : `You have ${A} shirts and ${B} pants. How many different outfits can you choose?`)
                : (lang === 'sv' ? `En meny har ${A} förrätter och ${B} varmrätter. Hur många olika måltider kan man beställa?` : `A menu has ${A} starters and ${B} main courses. How many different meals can you order?`);

            return {
                renderData: { description: desc, answerType: 'numeric' },
                token: this.toBase64(total.toString()),
                clues: [
                    { text: lang === 'sv' ? `Steg 1: Du har ${A} val i första gruppen.` : `Step 1: You have ${A} choices in the first group.` },
                    { text: lang === 'sv' ? `Steg 2: För VARJE val i första gruppen, har du ${B} val i andra.` : `Step 2: For EACH choice in the first group, you have ${B} choices in the second.` },
                    { text: lang === 'sv' ? "Steg 3: Multiplicera antalen." : "Step 3: Multiply the numbers.", latex: `${A} \\cdot ${B}` }
                ]
            };
        }

        // --- 2. Multi-Step (Code Lock / Paths) ---
        if (type === 'multi') {
            const digits = MathUtils.randomInt(3, 4);
            const total = Math.pow(10, digits); // 10 * 10 * 10...
            
            const desc = lang === 'sv'
                ? `Ett kodlås har ${digits} siffror (0-9). Hur många olika kombinationer finns det?`
                : `A code lock has ${digits} digits (0-9). How many different combinations are there?`;

            return {
                renderData: { description: desc, answerType: 'numeric' },
                token: this.toBase64(total.toString()),
                clues: [
                    { text: lang === 'sv' ? "Position 1: Du kan välja mellan 10 siffror (0-9)." : "Position 1: You can choose from 10 digits (0-9)." },
                    { text: lang === 'sv' ? "Position 2: Du har fortfarande 10 val (siffrorna kan upprepas)." : "Position 2: You still have 10 choices (digits can repeat)." },
                    { text: lang === 'sv' ? "Multiplicera antalet möjligheter för alla positioner." : "Multiply the possibilities for all positions.", latex: digits === 3 ? "10 \\cdot 10 \\cdot 10" : "10 \\cdot 10 \\cdot 10 \\cdot 10" }
                ]
            };
        }

        // --- 3. Permutations (Arrangements / Podium) ---
        if (type === 'perm') {
            const n = MathUtils.randomInt(3, 5);
            // Factorial logic: n!
            let total = 1;
            let latexStr = "";
            for(let i=n; i>=1; i--) { 
                total *= i; 
                latexStr += (i === 1 ? "1" : `${i} \\cdot `);
            }

            const desc = lang === 'sv'
                ? `${n} böcker ska ställas på en hylla. På hur många olika sätt kan de ordnas?`
                : `${n} books are to be placed on a shelf. In how many different ways can they be arranged?`;

            return {
                renderData: { description: desc, answerType: 'numeric' },
                token: this.toBase64(total.toString()),
                clues: [
                    { text: lang === 'sv' ? `Plats 1: Du kan välja vilken som helst av de ${n} böckerna.` : `Spot 1: You can choose any of the ${n} books.` },
                    { text: lang === 'sv' ? `Plats 2: Nu finns det ${n-1} böcker kvar att välja på.` : `Spot 2: Now there are ${n-1} books left to choose from.` },
                    { text: lang === 'sv' ? "Fortsätt så för alla platser och multiplicera talen." : "Continue for all spots and multiply the numbers.", latex: latexStr }
                ]
            };
        }

        // --- 4. Selection (Handshakes / Pairs) ---
        // Logic: n * (n-1) / 2
        const n = MathUtils.randomInt(4, 8);
        const total = (n * (n - 1)) / 2;
        
        const desc = lang === 'sv'
            ? `Alla ${n} personer i ett rum skakar hand med varandra en gång. Hur många handskakningar blir det totalt?`
            : `All ${n} people in a room shake hands with each other once. How many handshakes occur in total?`;

        return {
            renderData: { description: desc, answerType: 'numeric' },
            token: this.toBase64(total.toString()),
            clues: [
                { text: lang === 'sv' ? "Tänk dig att person 1 skakar hand med alla andra (n-1)." : "Imagine person 1 shakes hands with everyone else (n-1)." },
                { text: lang === 'sv' ? "Om alla n personer gör det får vi n * (n-1) handskakningar." : "If all n people do this, we get n * (n-1) handshakes." },
                { text: lang === 'sv' ? "Men då har vi räknat varje handskakning två gånger (A med B, och B med A). Dela med 2." : "But we counted every handshake twice (A with B, and B with A). Divide by 2.", latex: `\\frac{${n} \\cdot ${n-1}}{2}` }
            ]
        };
    }
}