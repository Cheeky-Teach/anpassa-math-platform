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
        return `${n / divisor}/${d / divisor}`;
    }

    // Level 1: Visual Probability (Now with "OR" logic)
    private level1_Visuals(lang: string): any {
        const type = MathUtils.randomChoice(['marbles', 'spinner', 'or_logic']);
        
        const red = MathUtils.randomInt(1, 4);
        const blue = MathUtils.randomInt(1, 4);
        const green = MathUtils.randomInt(1, 4);
        const total = red + blue + green;

        if (type === 'or_logic') {
            const targets = MathUtils.shuffle(['röd', 'blå', 'grön']);
            const t1 = targets[0];
            const t2 = targets[1];
            const t1Val = t1 === 'röd' ? red : (t1 === 'blå' ? blue : green);
            const t2Val = t2 === 'röd' ? red : (t2 === 'blå' ? blue : green);
            
            const desc = lang === 'sv' 
                ? `Vad är sannolikheten att dra en ${t1} ELLER en ${t2} kula? (Bråkform)`
                : `What is the probability of picking a ${t1 === 'röd' ? 'red' : t1 === 'blå' ? 'blue' : 'green'} OR a ${t2 === 'röd' ? 'red' : t2 === 'blå' ? 'blue' : 'green'} marble? (Fraction)`;

            return {
                renderData: {
                    description: desc,
                    answerType: 'fraction',
                    geometry: { type: 'probability_marbles', items: { red, blue, green } }
                },
                token: this.toBase64(this.simplifyFraction(t1Val + t2Val, total)),
                clues: [
                    { text: lang === 'sv' ? "När vi säger ELLER menar vi att båda färgerna är bra utfall. Lägg ihop dem." : "When we say OR, we mean both colors are favorable outcomes. Add them together.", latex: `${t1Val} + ${t2Val} = ${t1Val + t2Val}` },
                    { text: lang === 'sv' ? "Dela sedan antalet gynnsamma utfall med det totala antalet kulor." : "Then divide the number of favorable outcomes by the total number of marbles.", latex: `P = \\frac{${t1Val + t2Val}}{${total}}` }
                ]
            };
        }

        if (type === 'marbles') {
            const target = MathUtils.randomChoice(['red', 'blue', 'green']);
            const targetVal = target === 'red' ? red : (target === 'blue' ? blue : green);
            const targetName = lang === 'sv' ? (target === 'red' ? 'röd' : (target === 'blue' ? 'blå' : 'grön')) : target;

            return {
                renderData: {
                    description: lang === 'sv' ? `Vad är sannolikheten att dra en ${targetName} kula? (Bråkform)` : `Prob of ${target} marble?`,
                    answerType: 'fraction',
                    geometry: { type: 'probability_marbles', items: { red, blue, green } }
                },
                token: this.toBase64(this.simplifyFraction(targetVal, total)),
                clues: [
                    { text: lang === 'sv' ? `Räkna först de ${targetName} kulorna.` : `Count the ${target} marbles.`, latex: `${targetVal}` },
                    { text: lang === 'sv' ? "Dela med totala antalet." : "Divide by the total count.", latex: `\\frac{${targetVal}}{${total}}` }
                ]
            };
        } else {
            const sections = MathUtils.randomChoice([4, 5, 8, 10]);
            const targetSections = MathUtils.randomInt(1, Math.floor(sections/2));
            return {
                renderData: {
                    description: lang === 'sv' ? `Om ${targetSections} av ${sections} fält är blåa, vad är sannolikheten att pilen stannar på blått? (Svara i bråkform)` : `If ${targetSections} of ${sections} sections are blue, what is the probability? (Answer as fraction)`,
                    answerType: 'fraction',
                    geometry: { type: 'probability_spinner', sections: sections, target: targetSections }
                },
                token: this.toBase64(this.simplifyFraction(targetSections, sections)),
                clues: [
                    { text: lang === 'sv' ? "Sannolikhet = Gynnsamma utfall / Möjliga utfall." : "Probability = Favorable / Possible.", latex: `\\frac{${targetSections}}{${sections}}` }
                ]
            };
        }
    }

    // Level 2: Dice & Decks (Added Prime numbers and Face cards)
    private level2_StandardRandomness(lang: string): any {
        const scenario = MathUtils.randomChoice(['die_prime', 'card_face', 'die_not']);

        if (scenario === 'die_prime') {
            const primes = [2, 3, 5];
            return {
                renderData: {
                    description: lang === 'sv' ? "Du kastar en tärning. Vad är sannolikheten att få ett primtal? (Svara i bråkform)" : "Probability of rolling a prime number? (Fraction)",
                    answerType: 'fraction',
                    geometry: { type: 'scale_single', shape: 'cube', label: '1-6' }
                },
                token: this.toBase64("1/2"),
                clues: [
                    { text: lang === 'sv' ? "Primtalen på en tärning är 2, 3 och 5." : "The prime numbers on a die are 2, 3, and 5.", latex: "\\text{Antal} = 3" },
                    { text: lang === 'sv' ? "Det finns 6 sidor totalt. 3 av 6 är hälften." : "There are 6 sides total. 3 out of 6 is half.", latex: "\\frac{3}{6} = \\frac{1}{2}" }
                ]
            };
        } else if (scenario === 'die_not') {
            const n = MathUtils.randomInt(1, 6);
            return {
                renderData: {
                    description: lang === 'sv' ? `Du kastar en tärning. Vad är sannolikheten att du INTE får en ${n}:a? (Svara i bråkform)` : `Prob of NOT rolling a ${n}? (Answer as fraction)`,
                    answerType: 'fraction'
                },
                token: this.toBase64("5/6"),
                clues: [
                    { text: lang === 'sv' ? "Det finns 5 siffror som inte är målet." : "There are 5 numbers that are not the target.", latex: "6 - 1 = 5" },
                    { text: lang === 'sv' ? "Dela med totala antalet sidor." : "Divide by total sides.", latex: "\\frac{5}{6}" }
                ]
            };
        } else {
            const type = MathUtils.randomChoice(['face', 'ace', 'black']);
            let favorable = type === 'face' ? 12 : (type === 'ace' ? 4 : 26);
            let desc = type === 'face' 
                ? (lang === 'sv' ? "Sannolikhet för klädda kort (K, Q, J)?" : "Prob of a face card?")
                : (type === 'ace' ? (lang === 'sv' ? "Sannolikhet för ett Ess?" : "Prob of an Ace?") : (lang === 'sv' ? "Sannolikhet för ett svart kort?" : "Prob of a black card?"));

            return {
                renderData: { description: `${desc} (Bråkform)`, answerType: 'fraction' },
                token: this.toBase64(this.simplifyFraction(favorable, 52)),
                clues: [
                    { text: lang === 'sv' ? `Det finns ${favorable} sådana kort i en lek på 52 kort.` : `There are ${favorable} such cards in a 52-card deck.` },
                    { text: lang === 'sv' ? "Ställ upp som bråk och förkorta om det går." : "Set up as fraction and simplify if possible.", latex: `\\frac{${favorable}}{52}` }
                ]
            };
        }
    }

    // Level 3: Percent Conversion (Added "Inverse" logic)
    private level3_PercentConversion(lang: string): any {
        const type = MathUtils.randomChoice(['standard', 'inverse']);
        const total = MathUtils.randomChoice([10, 20, 25, 50, 100]);
        const fav = MathUtils.randomInt(1, total / 2);
        const prob = (fav / total) * 100;

        if (type === 'inverse') {
            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Sannolikheten att vinna på en lott är ${prob}%. Om det finns ${total} lotter totalt, hur många är vinstlotter?` 
                        : `The win probability is ${prob}%. If there are ${total} tickets, how many are winners?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(fav.toString()),
                clues: [
                    { text: lang === 'sv' ? "Här ska vi räkna ut delen." : "Here we calculate the part.", latex: `${prob}\\% \\text{ av } ${total}` },
                    { text: lang === 'sv' ? "Gör om procent till decimaltal och multiplicera med totalen." : "Convert percent to decimal and multiply by total.", latex: `${prob / 100} \\cdot ${total} = ${fav}` }
                ]
            };
        } else {
            return {
                renderData: {
                    description: lang === 'sv' ? `I en grupp på ${total} personer är ${fav} vänsterhänta. Hur många procent är det?` : `In a group of ${total}, ${fav} are left-handed. What percent is that?`,
                    answerType: 'numeric',
                    suffix: '%'
                },
                token: this.toBase64(prob.toString()),
                clues: [
                    { text: lang === 'sv' ? "Dela delen med det hela för att få ett decimaltal." : "Divide part by whole to get a decimal.", latex: `${fav} / ${total} = ${fav / total}` },
                    { text: lang === 'sv' ? "Multiplicera med 100 för att få procent." : "Multiply by 100 to get percent.", latex: `${fav / total} \\cdot 100 = ${prob}\\%` }
                ]
            };
        }
    }

    // Level 4: Complementary Events (Sum of 1)
    private level4_Complementary(lang: string): any {
        const mode = MathUtils.randomChoice(['triple', 'standard']);
        if (mode === 'triple') {
            const p1 = MathUtils.randomInt(1, 4) / 10;
            const p2 = MathUtils.randomInt(1, 4) / 10;
            const p3 = Math.round((1 - p1 - p2) * 10) / 10;
            const targets = lang === 'sv' ? ['Vinst', 'Förlust', 'Oavgjort'] : ['Win', 'Loss', 'Draw'];

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `I ett spel är chansen för ${targets[0]} ${p1*100}% och chansen för ${targets[1]} ${p2*100}%. Vad är chansen för ${targets[2]}?` 
                        : `Chance for ${targets[0]} is ${p1*100}%, ${targets[1]} is ${p2*100}%. Prob of ${targets[2]}?`,
                    answerType: 'numeric', suffix: '%'
                },
                token: this.toBase64((p3 * 100).toString()),
                clues: [
                    { text: lang === 'sv' ? "Summan av alla möjliga händelser måste vara 100%." : "Sum of all outcomes must be 100%." },
                    { text: lang === 'sv' ? "Addera de kända chanserna och dra bort från 100%." : "Add known chances and subtract from 100%.", latex: `100\\% - (${p1*100}\\% + ${p2*100}\\%)` }
                ]
            };
        } else {
            const days = lang === 'sv' ? 7 : 7;
            const weekend = 2;
            return {
                renderData: {
                    description: lang === 'sv' ? "Vad är sannolikheten att en slumpmässigt vald veckodag INTE är en helgdag (lör/sön)? (Svara i bråkform)" : "Prob that a random day is NOT a weekend? (Answer as fraction)",
                    answerType: 'fraction'
                },
                token: this.toBase64("5/7"),
                clues: [
                    { text: lang === 'sv' ? "Det finns 7 dagar totalt. 2 är helgdagar." : "7 days total, 2 are weekends.", latex: "7 - 2 = 5" },
                    { text: lang === 'sv' ? "5 dagar är vardagar." : "5 days are weekdays.", latex: "\\frac{5}{7}" }
                ]
            };
        }
    }

    // Level 5: Compound Independent (Added "At least one")
    private level5_CompoundIndependent(lang: string): any {
        const mode = MathUtils.randomChoice(['standard', 'at_least_one']);
        
        if (mode === 'at_least_one') {
            return {
                renderData: {
                    description: lang === 'sv' 
                        ? "Du singlar slant två gånger. Vad är sannolikheten att få MINST en Krona? (Svara i bråkform)" 
                        : "Flip a coin twice. Prob of at least one Heads? (Fraction)",
                    answerType: 'fraction'
                },
                token: this.toBase64("3/4"),
                clues: [
                    { text: lang === 'sv' ? "De möjliga utfallen är: (K,K), (K,G), (G,K), (G,G)." : "Possible outcomes: (H,H), (H,T), (T,H), (T,T)." },
                    { text: lang === 'sv' ? "Endast (G,G) har ingen Krona. 3 av 4 utfall har minst en Krona." : "Only (T,T) has no heads. 3 out of 4 have at least one.", latex: "\\frac{3}{4}" }
                ]
            };
        } else {
            const p1 = 1 / 6;
            const n = MathUtils.randomInt(2, 6);
            return {
                renderData: {
                    description: lang === 'sv' ? `Vad är sannolikheten att slå en ${n}:a två gånger i rad med en tärning? (Svara i bråkform)` : `Prob of rolling a ${n} twice in a row? (Answer as fraction)`,
                    answerType: 'fraction'
                },
                token: this.toBase64("1/36"),
                clues: [
                    { text: lang === 'sv' ? "Händelserna är oberoende. Multiplicera chanserna." : "Independent events. Multiply the chances.", latex: "\\frac{1}{6} \\cdot \\frac{1}{6}" }
                ]
            };
        }
    }

    // Level 6: Combinatorics (Added restricted digits)
    private level6_Combinatorics(lang: string): any {
        const mode = MathUtils.randomChoice(['basic', 'restricted_pin', 'handshakes']);

        if (mode === 'restricted_pin') {
            const len = 3;
            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Hur många 3-siffriga koder kan man skapa om den första siffran inte får vara 0?` 
                        : `How many 3-digit PINs can be made if the first digit cannot be 0?`,
                    answerType: 'numeric'
                },
                token: this.toBase64("900"),
                clues: [
                    { text: lang === 'sv' ? "Första siffran har 9 val (1-9)." : "First digit has 9 choices (1-9).", latex: "9" },
                    { text: lang === 'sv' ? "De andra två siffrorna har 10 val var (0-9)." : "The other two have 10 choices each (0-9).", latex: "10 \\cdot 10" },
                    { text: lang === 'sv' ? "Multiplicera alla steg." : "Multiply all steps.", latex: "9 \\cdot 10 \\cdot 10 = 900" }
                ]
            };
        } else if (mode === 'handshakes') {
            const n = MathUtils.randomInt(5, 10);
            const ans = (n * (n - 1)) / 2;
            return {
                renderData: {
                    description: lang === 'sv' ? `${n} personer träffas och alla skakar hand med varandra en gång. Hur många handskakningar sker?` : `${n} people meet and everyone shakes hands once. How many handshakes?`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang === 'sv' ? `Varje person (${n}) hälsar på ${n-1} andra.` : `Each person (${n}) greets ${n-1} others.` },
                    { text: lang === 'sv' ? "Eftersom A-B är samma handskakning som B-A måste vi dela med 2." : "Since A-B is the same as B-A, we divide by 2.", latex: `\\frac{${n} \\cdot ${n-1}}{2}` }
                ]
            };
        } else {
            const A = MathUtils.randomInt(3, 5);
            const B = MathUtils.randomInt(3, 5);
            const C = MathUtils.randomInt(2, 4);
            return {
                renderData: {
                    description: lang === 'sv' ? `Du har ${A} tröjor, ${B} byxor och ${C} par skor. Hur många outfits?` : `You have ${A} shirts, ${B} pants, and ${C} shoes. How many outfits?`,
                    answerType: 'numeric'
                },
                token: this.toBase64((A * B * C).toString()),
                clues: [{ text: lang === 'sv' ? "Multiplikationsprincipen: multiplicera antalet val i varje kategori." : "Multiplication principle: multiply the number of choices.", latex: `${A} \\cdot ${B} \\cdot ${C}` }]
            };
        }
    }
}