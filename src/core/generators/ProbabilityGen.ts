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
                ? `Vad är sannolikheten att dra en ${targetName} kula? (Svara som bråk, t.ex. 1/4)`
                : `What is the probability of picking a ${targetName} marble? (Answer as fraction, e.g., 1/4)`;

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
                        text: lang === 'sv' ? `Räkna antalet ${targetName}a kulor.` : `Count the ${targetName} marbles.`,
                        latex: `${targetVal}`
                    },
                    { 
                        text: lang === 'sv' ? "Räkna alla kulor totalt." : "Count all marbles total.",
                        latex: `${red} + ${blue} + ${green} = ${total}`
                    }
                ]
            };
        } else {
            // Spinner
            const sections = MathUtils.randomInt(3, 6);
            const desc = lang === 'sv' 
                ? `Vad är sannolikheten att pilen stannar på blått? (1 av ${sections} fält är blått)`
                : `What is the probability the arrow lands on blue? (1 of ${sections} sections is blue)`;
            
            return {
                renderData: {
                    description: desc,
                    answerType: 'text',
                    geometry: { type: 'probability_spinner', sections: sections, target: 1 }
                },
                token: this.toBase64(`1/${sections}`),
                clues: [
                    { text: lang === 'sv' ? "Det finns 1 blått fält." : "There is 1 blue section." },
                    { text: lang === 'sv' ? `Totalt finns det ${sections} fält.` : `There are ${sections} sections total.` }
                ]
            };
        }
    }

    // Level 2: Dice, Coins, Decks
    private level2_StandardRandomness(lang: string): any {
        const scenario = MathUtils.randomChoice(['die', 'card', 'coin']);

        if (scenario === 'die') {
            const sides = 6;
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
                favorable = 3; labelSv = "jämnt"; labelEn = "even";
            } else if (mode === 'odd') {
                favorable = 3; labelSv = "udda"; labelEn = "odd";
            } else {
                favorable = 1; 
                const n = MathUtils.randomInt(1, 6);
                labelSv = `en ${n}:a`; labelEn = `a ${n}`;
            }

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Du slår en vanlig tärning (1-6). Vad är sannolikheten att få ${labelSv}?`
                        : `You roll a standard die (1-6). What is the probability of getting ${labelEn}?`,
                    answerType: 'text',
                    geometry: { type: 'scale_single', shape: 'cube', label: '1-6' } // Reusing legacy icon
                },
                token: this.toBase64(this.simplifyFraction(favorable, 6)),
                clues: [{ text: "Gynsamma utfall / Möjliga utfall", latex: `\\frac{${favorable}}{6}` }]
            };
        } 
        else if (scenario === 'coin') {
            // Flip 3 coins, get 3 heads? Or simple 1 coin? Let's do simple for Level 2.
            // Actually, let's do "Picking a card suit" to add variety
            return {
                renderData: {
                    description: lang === 'sv' 
                        ? "Du drar ett kort ur en lek (52 kort). Vad är sannolikheten att det är Hjärter?"
                        : "You pick a card from a deck (52 cards). What is the probability it is Hearts?",
                    answerType: 'text'
                },
                token: this.toBase64("1/4"),
                clues: [
                    { text: lang === 'sv' ? "Det finns 4 färger (Hjärter, Spader, Ruter, Klöver)." : "There are 4 suits (Hearts, Spades, Diamonds, Clubs)." },
                    { latex: "\\frac{13}{52} = \\frac{1}{4}" }
                ]
            };
        }
        return this.level1_Visuals(lang); // Fallback
    }

    // Level 3: Probability as Percent
    private level3_PercentConversion(lang: string): any {
        const total = MathUtils.randomChoice([4, 5, 10, 20, 25, 50]);
        const favorable = MathUtils.randomInt(1, total - 1);
        const percent = (favorable / total) * 100;

        const scenarios = [
            { sv: "lotter vinner", en: "tickets win", objSv: "lotter", objEn: "tickets" },
            { sv: "dagar regnar", en: "days rain", objSv: "dagar", objEn: "days" },
            { sv: "skott träffar", en: "shots hit", objSv: "skott", objEn: "shots" }
        ];
        const s = MathUtils.randomChoice(scenarios);

        const desc = lang === 'sv' 
            ? `Av ${total} ${s.objSv} så ${s.sv} ${favorable} st. Vad är sannolikheten i procent?`
            : `Out of ${total} ${s.objEn}, ${favorable} ${s.en}. What is the probability in percent?`;

        return {
            renderData: {
                description: desc,
                answerType: 'numeric',
                suffix: '%'
            },
            token: this.toBase64(percent.toString()),
            clues: [
                { latex: `\\frac{${favorable}}{${total}}` },
                { text: lang === 'sv' ? "Gör om bråket till procent." : "Convert fraction to percent.", latex: `\\frac{${favorable}}{${total}} \\cdot 100` }
            ]
        };
    }

    // Level 4: Complementary Events (P(Not))
    private level4_Complementary(lang: string): any {
        const type = MathUtils.randomInt(1, 3);
        
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
                clues: [{ text: "Total = 100%", latex: `100\\% - ${rainChance}\\%` }]
            };
        } else { // Fraction
            const total = MathUtils.randomInt(5, 20);
            const red = MathUtils.randomInt(1, total - 2);
            
            return {
                renderData: {
                    description: lang === 'sv'
                        ? `I en påse finns ${total} kulor. ${red} är röda. Vad är sannolikheten att dra en kula som INTE är röd?`
                        : `A bag has ${total} marbles. ${red} are red. What is the probability of picking a marble that is NOT red?`,
                    answerType: 'text'
                },
                token: this.toBase64(this.simplifyFraction(total - red, total)),
                clues: [
                    { text: lang === 'sv' ? "Hur många är inte röda?" : "How many are not red?", latex: `${total} - ${red} = ${total - red}` },
                    { latex: `\\frac{${total - red}}{${total}}` }
                ]
            };
        }
    }

    // Level 5: Compound Independent Events (Multiplying)
    private level5_CompoundIndependent(lang: string): any {
        // Scenario: 2 Coins, Coin + Die, 2 Spins
        const s = MathUtils.randomChoice(['2coins', 'coin_die']);
        
        if (s === '2coins') {
            const desc = lang === 'sv' 
                ? "Du singlar slant med två mynt. Vad är sannolikheten att BÅDA visar Krona (Heads)? Svara med bråk."
                : "You flip two coins. What is the probability BOTH show Heads? Answer with a fraction.";
            
            return {
                renderData: { description: desc, answerType: 'text' },
                token: this.toBase64("1/4"),
                clues: [
                    { text: lang === 'sv' ? "Mynt 1: 1/2. Mynt 2: 1/2." : "Coin 1: 1/2. Coin 2: 1/2." },
                    { text: lang === 'sv' ? "Multiplicera sannolikheterna." : "Multiply probabilities.", latex: "\\frac{1}{2} \\cdot \\frac{1}{2}" }
                ]
            };
        } else {
            const desc = lang === 'sv'
                ? "Du singlar slant och slår en tärning. Vad är sannolikheten för Krona OCH en 6:a?"
                : "You flip a coin and roll a die. What is the probability of Heads AND a 6?";
            
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
        // Scenario: Outfits, Menu
        const A = MathUtils.randomInt(2, 5);
        const B = MathUtils.randomInt(2, 6);
        const C = MathUtils.randomInt(1, 3); // Optional 3rd layer
        
        const useThree = C > 1;
        const total = useThree ? A * B * C : A * B;

        const scenarios = [
            { 
                sv: `Du har ${A} tröjor och ${B} byxor.`, 
                en: `You have ${A} shirts and ${B} pants.`,
                qSv: "Hur många olika outfits kan du välja?",
                qEn: "How many different outfits can you choose?"
            },
            {
                sv: `En meny har ${A} förrätter och ${B} varmrätter.`,
                en: `A menu has ${A} starters and ${B} main courses.`,
                qSv: "Hur många olika måltider finns det?",
                qEn: "How many different meals are there?"
            }
        ];

        if (useThree) {
            scenarios.push({
                sv: `Du ska resa från A till B (${A} vägar), sen B till C (${B} vägar), sen C till D (${C} vägar).`,
                en: `Travel from A to B (${A} ways), then B to C (${B} ways), then C to D (${C} ways).`,
                qSv: "Hur många olika vägar finns det totalt?",
                qEn: "How many different routes are there total?"
            });
        }

        const s = MathUtils.randomChoice(scenarios);
        
        return {
            renderData: {
                description: `${lang === 'sv' ? s.sv : s.en} ${lang === 'sv' ? s.qSv : s.qEn}`,
                answerType: 'numeric'
            },
            token: this.toBase64(total.toString()),
            clues: [
                { 
                    text: lang === 'sv' ? "Multiplicera antalet alternativ." : "Multiply the number of options.",
                    latex: useThree ? `${A} \\cdot ${B} \\cdot ${C}` : `${A} \\cdot ${B}` 
                }
            ]
        };
    }
}