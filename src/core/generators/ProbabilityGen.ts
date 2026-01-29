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
                sv: (t, f) => `Du kastar pil ${t} gånger och träffar tavlan ${f} gånger. Vad är din träffsäkerhet i procent?`,
                en: (t, f) => `You throw a dart ${t} times and hit the board ${f} times. What is your accuracy in percent?`, 
                context: 'darts' 
            },
            { 
                sv: (t, f) => `En klass har ${t} elever. ${f} elever har glasögon. Hur stor andel har glasögon?`,
                en: (t, f) => `A class has ${t} students. ${f} students wear glasses. What percent wear glasses?`, 
                context: 'class' 
            },
            { 
                sv: (t, f) => `Du drar en lott ur en låda med ${t} lotter. ${f} st är vinstlotter. Vad är vinstchansen?`,
                en: (t, f) => `You pick a ticket from a box of ${t}. ${f} are winning tickets. What is the chance to win?`, 
                context: 'lottery' 
            },
            // NEW SCENARIOS ---
            {
                sv: (t, f) => `Det har regnat ${f} av de senaste ${t} dagarna. Hur stor andel är det?`,
                en: (t, f) => `It rained on ${f} of the last ${t} days. What percentage is that?`,
                context: 'weather'
            },
            {
                sv: (t, f) => `I en låda med ${t} glödlampor är ${f} trasiga. Hur många procent är trasiga?`,
                en: (t, f) => `In a box of ${t} light bulbs, ${f} are broken. What percent are broken?`,
                context: 'quality'
            },
            {
                sv: (t, f) => `En fotbollsspelare skjuter ${t} skott och gör mål ${f} gånger. Vad är målchansen?`,
                en: (t, f) => `A soccer player takes ${t} shots and scores ${f} goals. What is the goal percentage?`,
                context: 'sports'
            },
            {
                sv: (t, f) => `Du passerar ${t} trafikljus. ${f} visade grönt. Hur stor andel var gröna?`,
                en: (t, f) => `You pass ${t} traffic lights. ${f} were green. What percentage were green?`,
                context: 'traffic'
            },
            {
                sv: (t, f) => `I en undersökning med ${t} personer svarade ${f} "Ja". Hur många procent sa Ja?`,
                en: (t, f) => `In a survey of ${t} people, ${f} said "Yes". What percent said Yes?`,
                context: 'survey'
            },
            {
                sv: (t, f) => `Du planterade ${t} frön. ${f} av dem växte upp. Vad är grobarheten?`,
                en: (t, f) => `You planted ${t} seeds. ${f} of them sprouted. What is the germination rate?`,
                context: 'seeds'
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
                    { text: lang === 'sv' ? "Händelserna sker oberoende av varandra. Sannolikheten för ETT mynt är 1/2." : "Events happen independently. Probability for ONE coin is 1/2." },
                    { text: lang === 'sv' ? "När det står 'och'/'båda', ska vi multiplicera sannolikheterna." : "When it says 'and'/'both', multiply the probabilities.", latex: "\\frac{1}{2} \\cdot \\frac{1}{2}" }
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
                    { latex: `P(\\text{Krona}) = \\frac{1}{2}, \\quad P(6) = \\frac{1}{6}` },
                    { latex: `\\frac{1}{2} \\cdot \\frac{1}{6}` }
                ]
            };
        }
    }

    // Level 6: Combinations (Simple Tree Diagrams logic)
    private level6_Combinatorics(lang: string): any {
        const A = MathUtils.randomInt(2, 5);
        const B = MathUtils.randomInt(2, 6);
        const total = A * B;

        const scenarios = [
            { 
                sv: `Du har ${A} tröjor och ${B} byxor. Hur många olika outfits kan du välja?`, 
                en: `You have ${A} shirts and ${B} pants. How many different outfits can you choose?`
            },
            {
                sv: `En meny har ${A} förrätter och ${B} varmrätter. Hur många olika måltider finns det?`,
                en: `A menu has ${A} starters and ${B} main courses. How many different meals are there?`
            }
        ];

        const s = MathUtils.randomChoice(scenarios);
        
        return {
            renderData: {
                description: lang === 'sv' ? s.sv : s.en,
                answerType: 'numeric'
            },
            token: this.toBase64(total.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? "För varje val du gör i första gruppen, har du alla val i andra gruppen." : "For every choice in the first group, you have all choices in the second.",
                },
                { 
                    text: lang === 'sv' ? "Vi använder multiplikationsprincipen: Ta antal i grupp 1 gånger antal i grupp 2." : "Use multiplication principle: Count 1 times Count 2.",
                    latex: `${A} \\cdot ${B}` 
                }
            ]
        };
    }
}