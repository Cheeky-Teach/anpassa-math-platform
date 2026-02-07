import { MathUtils } from '../utils/MathUtils.js';

export class FractionBasicsGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_Visuals(lang);
            case 2: return this.level2_PartsOfQuantity(lang);
            case 3: return this.level3_MixedImproper(lang);
            case 4: return this.level4_SimplifyExtend(lang);
            case 5: return this.level5_Decimals(lang);
            default: return this.level1_Visuals(lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    private gcd(a: number, b: number): number {
        return MathUtils.gcd(a, b);
    }

    // --- LEVEL 1: VISUAL CONCEPTS ---
    private level1_Visuals(lang: string): any {
        const variation = Math.random();

        // VARIATION A: Spot the Lie (Percent Grid)
        if (variation < 0.3) {
            // Generate dynamic percentages
            const p = MathUtils.randomChoice([10, 20, 25, 40, 50, 60, 75, 80, 90]);
            const fractionN = p;
            const fractionD = 100;
            
            // Generate simplified fraction for the "True" statement
            const div = this.gcd(fractionN, fractionD);
            const simpleN = fractionN / div;
            const simpleD = fractionD / div;

            const statementPercent = `${p}%`;
            const statementFraction = `${simpleN}/${simpleD}`;
            
            // Generate a dynamic "Lie"
            let statementFalse = "";
            if (p < 50) {
                statementFalse = lang === 'sv' ? "Mer än hälften" : "More than half";
            } else if (p === 50) {
                statementFalse = lang === 'sv' ? "Mindre än 1/4" : "Less than 1/4";
            } else {
                statementFalse = lang === 'sv' ? "Mindre än hälften" : "Less than half";
            }

            const options = MathUtils.shuffle([statementPercent, statementFraction, statementFalse]);

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? "Titta på figuren. Vilket påstående är FALSKT?" 
                        : "Look at the figure. Which statement is FALSE?",
                    answerType: 'multiple_choice',
                    options: options,
                    geometry: {
                        type: 'percent_grid',
                        total: 100,
                        colored: p
                    }
                },
                token: this.toBase64(statementFalse),
                clues: [
                    { text: lang==='sv' ? "Hälften är 50 rutor." : "Half is 50 squares.", latex: "50/100" },
                    { text: lang==='sv' ? `Det är ${p} färgade rutor. Jämför det med påståendena.` : `There are ${p} colored squares. Compare that with the statements.`, latex: `${p} \\neq ${statementFalse}` }
                ],
                metadata: { variation: 'visual_lie', difficulty: 1 }
            };
        }

        // VARIATION B: Inverse Logic (Word Problem)
        if (variation < 0.6) {
            const fractionD = MathUtils.randomInt(3, 8);
            const countPerPart = MathUtils.randomInt(2, 6);
            const total = countPerPart * fractionD;
            
            return {
                renderData: {
                    description: lang === 'sv'
                        ? `Du har ${total} kulor. 1/${fractionD} av dem är röda. Hur många är röda?`
                        : `You have ${total} marbles. 1/${fractionD} of them are red. How many are red?`,
                    answerType: 'numeric',
                    geometry: null // No visual, force mental model
                },
                token: this.toBase64(countPerPart.toString()),
                clues: [
                    { 
                        text: lang==='sv' ? `Dela totalen i ${fractionD} lika stora högar.` : `Divide the total into ${fractionD} equal piles.`, 
                        latex: `${total} / ${fractionD}` 
                    }
                ],
                metadata: { variation: 'visual_inverse', difficulty: 2 }
            };
        }

        // VARIATION C: Standard Visuals (Marbles)
        const red = MathUtils.randomInt(1, 5);
        const blue = MathUtils.randomInt(1, 5);
        const green = MathUtils.randomInt(1, 5);
        const totalItems = red + blue + green;
        const target = MathUtils.randomChoice(['red', 'blue', 'green']);
        
        let count = 0;
        let colorName = "";
        if (target === 'red') { count = red; colorName = lang==='sv'?'röda':'red'; }
        else if (target === 'blue') { count = blue; colorName = lang==='sv'?'blåa':'blue'; }
        else { count = green; colorName = lang==='sv'?'gröna':'green'; }

        return {
            renderData: {
                description: lang === 'sv' 
                    ? `Hur stor andel är ${colorName}?` 
                    : `What fraction are ${colorName}?`,
                answerType: 'fraction',
                geometry: { type: 'probability_marbles', items: { red, blue, green } }
            },
            token: this.toBase64(`${count}/${totalItems}`),
            clues: [
                { text: lang==='sv' ? "Räkna hur många du har av den färgen, och dela med totala antalet." : "Count how many of that color, and divide by the total number.", latex: `\\frac{\\text{${colorName}}}{\\text{Total}}` }
            ],
            metadata: { variation: 'visual_calc', difficulty: 1 }
        };
    }

    // --- LEVEL 2: PARTS OF QUANTITY ---
    private level2_PartsOfQuantity(lang: string): any {
        const variation = Math.random();

        // VARIATION A: Inverse (Find the Whole)
        if (variation < 0.3) {
            const denom = MathUtils.randomChoice([3, 4, 5, 6, 8, 10]);
            const partValue = MathUtils.randomChoice([5, 10, 15, 20, 25, 50, 100]);
            const total = partValue * denom;

            return {
                renderData: {
                    description: lang === 'sv'
                        ? `1/${denom} av ett pris är ${partValue} kr. Hur mycket är hela priset?`
                        : `1/${denom} of a prize is ${partValue} kr. How much is the total prize?`,
                    answerType: 'numeric',
                    suffix: 'kr'
                },
                token: this.toBase64(total.toString()),
                clues: [
                    { 
                        text: lang==='sv' ? `Om en del är värd ${partValue}, och det finns ${denom} delar totalt, multiplicera för att få helheten.` : `If one part is worth ${partValue}, and there are ${denom} parts total, multiply to get the whole.`,
                        latex: `${partValue} \\cdot ${denom}` 
                    }
                ],
                metadata: { variation: 'part_inverse', difficulty: 2 }
            };
        }

        // VARIATION B: Comparison Check
        if (variation < 0.6) {
            const d1 = MathUtils.randomInt(2, 5);
            const mult1 = MathUtils.randomInt(2, 6);
            const t1 = d1 * mult1;
            
            const d2 = MathUtils.randomInt(2, 5);
            const mult2 = MathUtils.randomInt(2, 6);
            const t2 = d2 * mult2;

            if (mult1 === mult2) return this.level2_PartsOfQuantity(lang);

            const isFirstLarger = mult1 > mult2;
            const winningOpt = isFirstLarger 
                ? `1/${d1} ${lang==='sv'?'av':'of'} ${t1}`
                : `1/${d2} ${lang==='sv'?'av':'of'} ${t2}`;
            
            const losingOpt = isFirstLarger
                ? `1/${d2} ${lang==='sv'?'av':'of'} ${t2}`
                : `1/${d1} ${lang==='sv'?'av':'of'} ${t1}`;

            const q = lang === 'sv' ? `Vilket är störst?` : `Which is largest?`;

            return {
                renderData: {
                    description: q,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([winningOpt, losingOpt])
                },
                token: this.toBase64(winningOpt),
                clues: [
                    { text: lang==='sv' ? "Räkna ut värdet för varje alternativ." : "Calculate the value for each option.", latex: `${t1} / ${d1} \\text{ vs } ${t2} / ${d2}` },
                    { text: lang==='sv' ? "Jämför svaren." : "Compare the answers.", latex: `${mult1} \\text{ vs } ${mult2}` }
                ],
                metadata: { variation: 'part_compare', difficulty: 2 }
            };
        }

        // VARIATION C: Standard Calculation
        const denom = MathUtils.randomChoice([3, 4, 5, 6, 8, 10]);
        const mult = MathUtils.randomInt(2, 12);
        const total = denom * mult;

        return {
            renderData: {
                description: lang === 'sv' ? "Beräkna:" : "Calculate:",
                latex: `\\frac{1}{${denom}} \\text{ ${lang==='sv'?'av':'of'} } ${total}`,
                answerType: 'numeric'
            },
            token: this.toBase64(mult.toString()),
            clues: [
                { text: lang==='sv' ? "Dela helheten med nämnaren." : "Divide the whole by the denominator.", latex: `${total} / ${denom}` }
            ],
            metadata: { variation: 'part_calc', difficulty: 1 }
        };
    }

    // --- LEVEL 3: MIXED & IMPROPER ---
    private level3_MixedImproper(lang: string): any {
        const variation = Math.random();

        // VARIATION A: Bounds Check (True/False)
        if (variation < 0.3) {
            const w = MathUtils.randomInt(2, 6);
            const den = MathUtils.randomInt(3, 8);
            const num = MathUtils.randomInt(1, den - 1);
            const improper = w * den + num; 

            const isGreater = Math.random() > 0.5;
            const compareVal = isGreater ? w : w + 1; 
            
            const correctAnswer = (improper/den > compareVal) ? (lang==='sv'?'Ja':'Yes') : (lang==='sv'?'Nej':'No');
            const wrongAnswer = (improper/den > compareVal) ? (lang==='sv'?'Nej':'No') : (lang==='sv'?'Ja':'Yes');

            return {
                renderData: {
                    description: lang==='sv' 
                        ? `Är detta bråk större än ${compareVal}?` 
                        : `Is this fraction greater than ${compareVal}?`,
                    latex: `\\frac{${improper}}{${den}}`,
                    answerType: 'multiple_choice',
                    options: [correctAnswer, wrongAnswer]
                },
                token: this.toBase64(correctAnswer),
                clues: [
                    { 
                        text: lang==='sv' ? `Gör om heltalet ${compareVal} till bråk med nämnare ${den}.` : `Convert the integer ${compareVal} to a fraction with denominator ${den}.`,
                        latex: `${compareVal} = \\frac{${compareVal*den}}{${den}}`
                    },
                    {
                        text: lang==='sv' ? "Jämför nu täljarna." : "Now compare the numerators.",
                        latex: `${improper} \\text{ vs } ${compareVal*den}`
                    }
                ],
                metadata: { variation: 'mixed_bounds', difficulty: 2 }
            };
        }

        // VARIATION B: Missing Part
        if (variation < 0.6) {
            const w = MathUtils.randomInt(1, 5);
            const d = MathUtils.randomInt(3, 9);
            const n = MathUtils.randomInt(1, d - 1);
            const imp = w * d + n;

            return {
                renderData: {
                    description: lang==='sv' ? "Vilket tal saknas?" : "What number is missing?",
                    latex: `${w}\\frac{?}{${d}} = \\frac{${imp}}{${d}}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(n.toString()),
                clues: [
                    { text: lang==='sv' ? "Multiplicera heltalet med nämnaren och addera täljaren (det saknade talet)." : "Multiply the whole number by the denominator and add the numerator (the missing number).", latex: `${w} \\cdot ${d} + ? = ${imp}` },
                    { text: lang==='sv' ? "Räkna ut vad som fattas." : "Calculate what is missing.", latex: `${w*d} + ? = ${imp}` }
                ],
                metadata: { variation: 'mixed_missing', difficulty: 2 }
            };
        }

        // VARIATION C: Standard Conversion
        const isToImp = Math.random() > 0.5;
        const w = MathUtils.randomInt(1, 6);
        const d = MathUtils.randomInt(3, 9);
        const n = MathUtils.randomInt(1, d - 1);
        const imp = w * d + n;

        if (isToImp) {
            return {
                renderData: {
                    description: lang==='sv' ? "Skriv i bråkform (osammansatt form):" : "Write as improper fraction:",
                    latex: `${w}\\frac{${n}}{${d}}`,
                    answerType: 'fraction'
                },
                token: this.toBase64(`${imp}/${d}`),
                clues: [
                    { text: lang==='sv' ? "Multiplicera heltalet med nämnaren och lägg till täljaren." : "Multiply the whole number by the denominator and add the numerator.", latex: `${w} \\cdot ${d} + ${n}` }
                ],
                metadata: { variation: 'mixed_convert_imp', difficulty: 2 }
            };
        } else {
            return {
                renderData: {
                    description: lang==='sv' ? "Skriv i blandad form:" : "Write as mixed number:",
                    latex: `\\frac{${imp}}{${d}}`,
                    answerType: 'mixed_fraction'
                },
                token: this.toBase64(`${w} ${n}/${d}`),
                clues: [
                    { text: lang==='sv' ? "Hur många hela gånger går nämnaren i täljaren?" : "How many whole times does the denominator fit in the numerator?", latex: `${imp} / ${d} = ${w} \\text{ rest } ${n}` }
                ],
                metadata: { variation: 'mixed_convert_mix', difficulty: 2 }
            };
        }
    }

    // --- LEVEL 4: SIMPLIFY & EXTEND ---
    private level4_SimplifyExtend(lang: string): any {
        const variation = Math.random();

        // VARIATION A: Missing Factor (Equivalent Fractions)
        if (variation < 0.3) {
            const baseN = MathUtils.randomInt(1, 5);
            const baseD = MathUtils.randomInt(baseN + 1, 9);
            const factor = MathUtils.randomInt(2, 6);
            
            const targetD = baseD * factor;
            const targetN = baseN * factor; 

            return {
                renderData: {
                    description: lang==='sv' ? "Hitta täljaren:" : "Find the numerator:",
                    latex: `\\frac{${baseN}}{${baseD}} = \\frac{?}{${targetD}}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(targetN.toString()),
                clues: [
                    { 
                        text: lang==='sv' ? `Vad multiplicerades nämnaren ${baseD} med för att få ${targetD}?` : `What was the denominator ${baseD} multiplied by to get ${targetD}?`, 
                        latex: `${baseD} \\cdot ${factor} = ${targetD}` 
                    },
                    { 
                        text: lang==='sv' ? "Gör samma sak med täljaren." : "Do the same to the numerator.", 
                        latex: `${baseN} \\cdot ${factor}` 
                    }
                ],
                metadata: { variation: 'simplify_missing', difficulty: 3 }
            };
        }

        // VARIATION B: Concept Check
        if (variation < 0.6) {
            const type = MathUtils.randomInt(1, 3);
            const k = MathUtils.randomInt(2, 10);
            
            let q = "";
            let stmtTrue = "";
            let stmtFalse = "";
            let clue = "";

            if (type === 1) {
                q = lang === 'sv' 
                    ? `Vad händer med värdet om du multiplicerar både täljare och nämnare med ${k}?`
                    : `What happens to the value if you multiply both numerator and denominator by ${k}?`;
                stmtTrue = lang === 'sv' ? "Värdet är detsamma" : "Value stays the same";
                stmtFalse = lang === 'sv' ? "Värdet blir större" : "Value gets larger";
                clue = "1/2 = 2/4 = 3/6";
            } else if (type === 2) {
                q = lang === 'sv' 
                    ? `Vad händer med värdet om du dividerar både täljare och nämnare med ${k}?`
                    : `What happens to the value if you divide both numerator and denominator by ${k}?`;
                stmtTrue = lang === 'sv' ? "Värdet är detsamma" : "Value stays the same";
                stmtFalse = lang === 'sv' ? "Värdet blir mindre" : "Value gets smaller";
                clue = "4/8 = 1/2";
            } else {
                q = lang === 'sv'
                    ? `Vad händer med värdet om du ENDAST multiplicerar täljaren med ${k}?`
                    : `What happens to the value if you ONLY multiply the numerator by ${k}?`;
                stmtTrue = lang === 'sv' ? "Värdet ändras" : "Value changes";
                stmtFalse = lang === 'sv' ? "Värdet är detsamma" : "Value stays the same";
                clue = `1/2 \\neq ${k}/2`;
            }
            
            return {
                renderData: {
                    description: q,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle([stmtFalse, stmtTrue])
                },
                token: this.toBase64(stmtTrue),
                clues: [
                    { text: lang==='sv' ? "Tänk på ett enkelt bråk som 1/2 och testa." : "Think of a simple fraction like 1/2 and test it.", latex: clue }
                ],
                metadata: { variation: 'simplify_concept', difficulty: 3 }
            };
        }

        // VARIATION C: Standard Simplify
        const factor = MathUtils.randomInt(2, 6);
        const simpN = MathUtils.randomInt(1, 9);
        const simpD = MathUtils.randomInt(simpN + 1, 15);
        
        if (this.gcd(simpN, simpD) !== 1) return this.level4_SimplifyExtend(lang);

        const bigN = simpN * factor;
        const bigD = simpD * factor;

        return {
            renderData: {
                description: lang==='sv' ? "Förkorta bråket så långt det går:" : "Simplify the fraction fully:",
                latex: `\\frac{${bigN}}{${bigD}}`,
                answerType: 'fraction'
            },
            token: this.toBase64(`${simpN}/${simpD}`),
            clues: [
                { text: lang==='sv' ? `Hitta ett tal som både ${bigN} och ${bigD} kan delas med (största gemensamma delare).` : `Find a number that both ${bigN} and ${bigD} can be divided by (GCD).`, latex: `\\text{GCD} = ${factor}` },
                { text: lang==='sv' ? "Dela både täljare och nämnare med detta tal." : "Divide both numerator and denominator by this number.", latex: `\\div ${factor}` }
            ],
            metadata: { variation: 'simplify_calc', difficulty: 3 }
        };
    }

    // --- LEVEL 5: DECIMALS ---
    private level5_Decimals(lang: string): any {
        const variation = Math.random();

        // VARIATION A: Inequality Check
        if (variation < 0.3) {
            const d = MathUtils.randomChoice([2, 4, 5, 10]);
            const n = MathUtils.randomInt(1, d - 1);
            const fracVal = n / d;
            
            let compareDec = MathUtils.randomFloat(0.1, 0.9, 1);
            if (compareDec === fracVal) compareDec += 0.1;

            const correct = fracVal > compareDec ? ">" : "<";
            
            return {
                renderData: {
                    description: lang==='sv' ? "Välj rätt tecken:" : "Choose the correct sign:",
                    latex: `\\frac{${n}}{${d}} \\text{ [ ? ] } ${compareDec}`,
                    answerType: 'multiple_choice',
                    options: [">", "<", "="]
                },
                token: this.toBase64(correct),
                clues: [
                    { text: lang==='sv' ? `Gör om bråket till decimaltal först.` : `Convert the fraction to a decimal first.`, latex: `${n}/${d} = ${fracVal}` },
                    { text: lang==='sv' ? "Jämför nu decimaltalen." : "Now compare the decimals.", latex: `${fracVal} \\text{ vs } ${compareDec}` }
                ],
                metadata: { variation: 'decimal_inequality', difficulty: 3 }
            };
        }

        // VARIATION B: Standard Translation
        const benchmarks = [
            { f: "1/2", d: 0.5 }, { f: "1/4", d: 0.25 }, { f: "3/4", d: 0.75 },
            { f: "1/5", d: 0.2 }, { f: "2/5", d: 0.4 }, { f: "3/5", d: 0.6 }, { f: "4/5", d: 0.8 },
            { f: "1/10", d: 0.1 }, { f: "3/10", d: 0.3 }, { f: "7/10", d: 0.7 }, { f: "9/10", d: 0.9 }
        ];
        const item = MathUtils.randomChoice(benchmarks);
        const toDec = Math.random() > 0.5;

        if (toDec) {
            return {
                renderData: { description: lang==='sv' ? "Skriv som decimaltal:" : "Write as decimal:", latex: item.f, answerType: 'numeric' },
                token: this.toBase64(item.d.toString()),
                clues: [
                    { text: lang==='sv' ? "Utför divisionen: Täljare delat med nämnare." : "Perform the division: Numerator divided by denominator.", latex: "" }
                ],
                metadata: { variation: 'decimal_to_dec', difficulty: 3 }
            };
        } else {
            return {
                renderData: { description: lang==='sv' ? "Skriv som bråk (enklaste form):" : "Write as fraction (simplest form):", latex: item.d.toString(), answerType: 'fraction' },
                token: this.toBase64(item.f),
                clues: [
                    { text: lang==='sv' ? "Tänk på siffrornas position. Första decimalen är tiondelar, andra är hundradelar." : "Think about place value. First decimal is tenths, second is hundredths.", latex: "" }
                ],
                metadata: { variation: 'decimal_to_frac', difficulty: 3 }
            };
        }
    }
}