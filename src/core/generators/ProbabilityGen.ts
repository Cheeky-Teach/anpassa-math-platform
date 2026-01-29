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

    // Level 1: Visuals - Pedagogical focus on "Part vs Whole"
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
                    geometry: { type: 'probability_marbles', items: { red, blue, green } }
                },
                token: this.toBase64(ans),
                clues: [
                    { 
                        text: lang === 'sv' ? "Sannolikhet är 'delen' delat med 'det hela'. Börja med att räkna hur många kulor som har rätt färg." : "Probability is 'part' divided by 'whole'. Start by counting the correct marbles.",
                        latex: `\\text{Antal } ${targetName} = ${targetVal}`
                    },
                    { 
                        text: lang === 'sv' ? "Räkna sedan alla kulor som finns totalt. Sätt det talet underst i bråket." : "Then count all marbles total. Put that number at the bottom.",
                        latex: `\\frac{${targetVal}}{${total}}`
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
                    { text: lang === 'sv' ? "Hur många blå fält ser du? Det är täljaren (talet där uppe)." : "How many blue sections? That is the numerator (top number)." },
                    { text: lang === 'sv' ? "Hur många fält finns det totalt? Det är nämnaren (talet där nere)." : "How many sections total? That is the denominator (bottom number)." }
                ]
            };
        }
    }

    // Level 2: Standard Randomness - Concept: Equal Probability
    private level2_StandardRandomness(lang: string): any {
        const scenario = MathUtils.randomChoice(['die', 'card']);

        if (scenario === 'die') {
            const mode = MathUtils.randomChoice(['gt', 'lt', 'even', 'odd']);
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
            } else {
                favorable = 3; labelSv = "udda tal"; labelEn = "an odd number";
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
                clues: [
                    { text: lang === 'sv' ? "En tärning har 6 sidor totalt. Det är talet där nere." : "A die has 6 sides total. That's the bottom number.", latex: "6" },
                    { text: lang === 'sv' ? `Räkna hur många sidor som passar in på "${labelSv}".` : `Count how many sides match "${labelEn}".`, latex: `${favorable}` }
                ]
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
                    { text: lang === 'sv' ? "En kortlek har 4 färger: Hjärter, Spader, Ruter, Klöver. Alla är lika vanliga." : "A deck has 4 suits: Hearts, Spades, Diamonds, Clubs. All equally likely." },
                    { text: lang === 'sv' ? "Eftersom 1 av 4 färger är Hjärter, är chansen:" : "Since 1 of 4 suits is Hearts, the chance is:", latex: "\\frac{1}{4}" }
                ]
            };
        }
    }

    // Level 3: Probability as Percent - Real World Context
    private level3_PercentConversion(lang: string): any {
        const scenarios = [
            { 
                sv: (t, f) => `Du kastar pil ${t} gånger och träffar tavlan ${f} gånger. Vad är din träffsäkerhet i procent?`,
                en: (t, f) => `You throw a dart ${t} times and hit the board ${f} times. What is your accuracy in percent?`, 
            },
            { 
                sv: (t, f) => `En klass har ${t} elever. ${f} elever har keps. Hur stor andel har keps (i procent)?`,
                en: (t, f) => `A class has ${t} students. ${f} students wear caps. What percent wear caps?`, 
            }
        ];

        const total = MathUtils.randomChoice([10, 20, 25, 50]);
        const favorable = MathUtils.randomInt(1, total - 1);
        const percent = (favorable / total) * 100;
        
        const s = MathUtils.randomChoice(scenarios);
        const descText = lang === 'sv' ? s.sv(total, favorable) : s.en(total, favorable);

        return {
            renderData: {
                description: descText,
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
            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Sannolikheten för regn är ${rainChance}%. Vad är sannolikheten att det INTE regnar?`
                        : `The probability of rain is ${rainChance}%. What is the probability it does NOT rain?`,
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
            
            return {
                renderData: {
                    description: lang === 'sv'
                        ? `I en påse finns ${total} kulor. ${red} är röda. Vad är sannolikheten att dra en kula som INTE är röd? (Svara i bråkform)`
                        : `A bag has ${total} marbles. ${red} are red. What is the probability of picking a marble that is NOT red? (Answer as fraction)`,
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

    // Level 5: Compound (Multiplying)
    private level5_CompoundIndependent(lang: string): any {
        const s = MathUtils.randomChoice(['2coins', 'coin_die']);
        
        if (s === '2coins') {
            return {
                renderData: { 
                    description: lang === 'sv' 
                        ? "Du singlar slant med två mynt. Vad är sannolikheten att BÅDA visar Krona? (Svara i bråkform)"
                        : "You flip two coins. What is the probability BOTH show Heads? (Answer as fraction)", 
                    answerType: 'text' 
                },
                token: this.toBase64("1/4"),
                clues: [
                    { text: lang === 'sv' ? "Händelserna sker oberoende av varandra. Sannolikheten för ETT mynt är 1/2." : "Events happen independently. Probability for ONE coin is 1/2." },
                    { text: lang === 'sv' ? "När det står 'och'/'båda', ska vi multiplicera sannolikheterna." : "When it says 'and'/'both', multiply the probabilities.", latex: "\\frac{1}{2} \\cdot \\frac{1}{2}" }
                ]
            };
        } else {
            return {
                renderData: { 
                    description: lang === 'sv'
                        ? "Du singlar slant och slår en tärning. Vad är sannolikheten för Krona OCH en 6:a? (Svara i bråkform)"
                        : "You flip a coin and roll a die. What is the probability of Heads AND a 6? (Answer as fraction)", 
                    answerType: 'text' 
                },
                token: this.toBase64("1/12"),
                clues: [
                    { text: lang === 'sv' ? "Sannolikhet för Krona = 1/2. Sannolikhet för en 6:a = 1/6." : "Prob for Heads = 1/2. Prob for a 6 = 1/6." },
                    { text: lang === 'sv' ? "Multiplicera dem för att få sannolikheten för båda samtidigt." : "Multiply them to get probability for both.", latex: `\\frac{1}{2} \\cdot \\frac{1}{6}` }
                ]
            };
        }
    }

    // Level 6: Combinations
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