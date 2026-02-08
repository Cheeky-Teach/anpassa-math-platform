import { MathUtils } from '../utils/MathUtils.js';

export class TenPowersGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_MultDivBig(lang);
            case 2: return this.level2_Concepts(lang);
            case 3: return this.level3_DecimalPowers(lang);
            default: return this.level1_MultDivBig(lang);
        }
    }

    /**
     * Phase 2: Targeted Generation
     * Allows the Question Studio to request a specific skill bucket.
     */
    public generateByVariation(key: string, lang: string = 'sv'): any {
        switch (key) {
            case 'big_mult_std':
            case 'big_div_std':
            case 'big_missing_factor':
            case 'power_discovery':
                return this.level1_MultDivBig(lang, key);
            
            case 'reciprocal_equivalence':
            case 'concept_spot_lie':
                return this.level2_Concepts(lang, key);
            
            case 'decimal_div_std':
            case 'decimal_mult_std':
            case 'decimal_logic_trap':
                return this.level3_DecimalPowers(lang, key);

            default:
                return this.generate(1, lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    private fixFloat(n: number) { 
        return parseFloat(n.toFixed(8)); 
    }

    // --- LEVEL 1: MULT/DIV BY 10, 100, 1000 & POWERS ---
    private level1_MultDivBig(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['big_mult_std', 'big_div_std', 'big_missing_factor', 'power_discovery']);

        // Variation A: Standard Forward Calc (10, 100, 1000)
        if (v === 'big_mult_std' || v === 'big_div_std') {
            const power = MathUtils.randomChoice([10, 100, 1000, 10000]);
            const isMult = v === 'big_mult_std';
            const num = MathUtils.randomInt(5, 95) / (Math.random() > 0.5 ? 1 : 10);
            const ans = isMult ? num * power : this.fixFloat(num / power);
            const zeros = Math.round(Math.log10(power));

            const desc = lang === 'sv' 
                ? "Beräkna värdet av uttrycket nedan." 
                : "Calculate the value of the expression below.";

            return {
                renderData: {
                    latex: isMult ? `${num} \\cdot ${power}` : `${num} / ${power}`,
                    description: desc,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? `Steg 1: Räkna antalet nollor i talet ${power}. Det är ${zeros} stycken.` 
                            : `Step 1: Count the number of zeros in ${power}. There are ${zeros}.`, 
                        latex: `10^{${zeros}} = ${power}` 
                    },
                    { 
                        text: lang === 'sv' 
                            ? `Steg 2: Flytta kommatecknet ${zeros} steg åt ${isMult ? 'höger så att talet blir större.' : 'vänster så att talet blir mindre.'}` 
                            : `Step 2: Move the decimal point ${zeros} steps to the ${isMult ? 'right to make the number larger.' : 'left to make the number smaller.'}`, 
                        latex: `${num} \\rightarrow ${ans}`
                    }
                ],
                metadata: { variation_key: v, difficulty: 1 }
            };
        }

        // Variation B: Missing Power Factor (Inverse)
        if (v === 'big_missing_factor') {
            const power = MathUtils.randomChoice([10, 100, 1000]);
            const num = MathUtils.randomInt(5, 50);
            const isMult = Math.random() > 0.5;
            const res = isMult ? num * power : this.fixFloat(num / power);

            return {
                renderData: {
                    latex: isMult ? `${num} \\cdot ? = ${res}` : `${num} / ? = ${res}`,
                    description: lang === 'sv' ? "Vilken tiopotens saknas för att likheten ska stämma?" : "Which power of ten is missing for the equality to be correct?",
                    answerType: 'numeric'
                },
                token: this.toBase64(power.toString()),
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? `Jämför starttalet ${num} med resultatet ${res}. Hur många steg har kommatecknet flyttats?` 
                            : `Compare the start number ${num} with the result ${res}. How many places has the decimal point moved?`, 
                        latex: "" 
                    },
                    { 
                        text: lang === 'sv' 
                            ? `Varje steg motsvarar en nolla. Eftersom det flyttats ${Math.round(Math.log10(power))} steg är den saknade tiopotensen en etta följd av ${Math.round(Math.log10(power))} nollor.` 
                            : `Each step corresponds to one zero. Since it moved ${Math.round(Math.log10(power))} places, the missing power is a one followed by ${Math.round(Math.log10(power))} zeros.`, 
                        latex: `10^{${Math.round(Math.log10(power))}} = ${power}` 
                    }
                ],
                metadata: { variation_key: 'big_missing_factor', difficulty: 2 }
            };
        }

        // Variation C: Power Discovery
        const pVal = MathUtils.randomInt(2, 6);
        const num = Math.pow(10, pVal);
        return {
            renderData: {
                description: lang === 'sv' ? `Skriv talet ${num.toLocaleString(lang)} som en potens med basen 10.` : `Write the number ${num.toLocaleString(lang)} as a power with base 10.`,
                latex: `${num} = 10^{?}`,
                answerType: 'structured_power'
            },
            token: this.toBase64(`10^${pVal}`),
            clues: [
                { 
                    text: lang === 'sv' 
                        ? `Räkna hur många nollor som följer efter siffran 1. Antalet nollor är samma sak som exponenten i en tiopotens.` 
                        : `Count how many zeros follow the digit 1. The number of zeros is the same as the exponent in a power of ten.`, 
                    latex: `10^{${pVal}} = ${num}` 
                }
            ],
            metadata: { variation_key: 'power_discovery', difficulty: 2 }
        };
    }

    // --- LEVEL 2: CONCEPTUAL RECIPROCALS ---
    private level2_Concepts(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['reciprocal_equivalence', 'concept_spot_lie']);

        // Variation A: The "Same As" Reciprocal Logic
        if (v === 'reciprocal_equivalence') {
            const scenarios = [
                { op: 'mul', val: 0.1, equiv: 10, equivOp: 'div' },
                { op: 'mul', val: 0.01, equiv: 100, equivOp: 'div' },
                { op: 'div', val: 0.1, equiv: 10, equivOp: 'mul' },
                { op: 'div', val: 0.01, equiv: 100, equivOp: 'mul' }
            ];
            const s = MathUtils.randomChoice(scenarios);
            const opText = lang === 'sv' 
                ? (s.op === 'mul' ? "multiplicera med" : "dividera med") 
                : (s.op === 'mul' ? "multiplying by" : "dividing by");
            const targetText = lang === 'sv'
                ? (s.equivOp === 'mul' ? "multiplicera med..." : "dividera med...")
                : (s.equivOp === 'mul' ? "multiplying by..." : "dividing by...");

            return {
                renderData: {
                    description: lang === 'sv' 
                        ? `Att ${opText} ${s.val} ger samma resultat som att ${targetText}` 
                        : `To ${opText} ${s.val} gives the same result as ${targetText}`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle(["10", "100", "0.1", "0.01", "1000"])
                },
                token: this.toBase64(s.equiv.toString()),
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? `Kom ihåg att ${s.val} motsvarar en ${s.equiv === 10 ? 'tiondel' : 'hundradel'}.` 
                            : `Remember that ${s.val} corresponds to one ${s.equiv === 10 ? 'tenth' : 'hundredth'}.`, 
                        latex: `${s.val} = \\frac{1}{${s.equiv}}` 
                    },
                    { 
                        text: lang === 'sv' 
                            ? `Att räkna ut en ${s.equiv === 10 ? 'tiondel' : 'hundradel'} av ett tal är matematiskt identiskt med att dela talet med ${s.equiv}.` 
                            : `Calculating one ${s.equiv === 10 ? 'tenth' : 'hundredth'} of a number is mathematically identical to dividing the number by ${s.equiv}.`, 
                        latex: ""
                    }
                ],
                metadata: { variation_key: 'reciprocal_equivalence', difficulty: 2 }
            };
        }

        // Variation B: Spot the Lie
        const generateStmt = (isCorrect: boolean) => {
            const num = MathUtils.randomInt(3, 9) * 10;
            const type = MathUtils.randomInt(1, 3);
            if (type === 1) { // Mult 0.1
                return isCorrect ? `${num} · 0,1 = ${num/10}` : `${num} · 0,1 = ${num * 10}`;
            } else if (type === 2) { // Div 0.1
                return isCorrect ? `${num} / 0,1 = ${num * 10}` : `${num} / 0,1 = ${num / 10}`;
            } else { // Mult 0.01
                return isCorrect ? `${num} · 0,01 = ${this.fixFloat(num/100).toString().replace('.', ',')}` : `${num} · 0,01 = ${num / 10}`;
            }
        };

        const sFalse = generateStmt(false);
        return {
            renderData: {
                description: lang === 'sv' ? "Vilket av följande påståenden om tiopotenser är FALSKT?" : "Which of the following statements about powers of ten is FALSE?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([generateStmt(true), generateStmt(true), sFalse])
            },
            token: this.toBase64(sFalse),
            clues: [
                { 
                    text: lang === 'sv' ? "Kontrollera om talet i resultatet har blivit större eller mindre. Multiplikation med tal mindre än 1 ska göra talet mindre, medan division ska göra det större." : "Check if the resulting number has become larger or smaller. Multiplying by numbers less than 1 should make the number smaller, while division should make it larger.", 
                    latex: "" 
                }
            ],
            metadata: { variation_key: 'concept_spot_lie', difficulty: 2 }
        };
    }

    // --- LEVEL 3: DECIMAL POWERS (0.1, 0.01, 0.001) ---
    private level3_DecimalPowers(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['decimal_div_std', 'decimal_mult_std', 'decimal_logic_trap']);
        const factor = MathUtils.randomChoice([0.1, 0.01, 0.001]);
        const num = MathUtils.randomInt(5, 50);

        if (v === 'decimal_div_std') {
            const ans = this.fixFloat(num / factor);
            const equivMult = Math.round(1 / factor);
            
            return {
                renderData: {
                    latex: `${num} / ${factor.toString().replace('.', ',')}`,
                    description: lang === 'sv' ? "Beräkna resultatet av divisionen." : "Calculate the result of the division.",
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? `Att dividera med ${factor.toString().replace('.', ',')} är detsamma som att multiplicera med ${equivMult}.` 
                            : `Dividing by ${factor} is the same as multiplying by ${equivMult}.`, 
                        latex: `\\frac{1}{${factor}} = ${equivMult}` 
                    },
                    { 
                        text: lang === 'sv' 
                            ? `När vi dividerar med ett tal som är mindre än 1 blir resultatet alltid STÖRRE än starttalet.` 
                            : `When we divide by a number less than 1, the result is always LARGER than the starting number.`, 
                        latex: `${num} \\cdot ${equivMult} = ${ans}` 
                    }
                ],
                metadata: { variation_key: 'decimal_div_std', difficulty: 3 }
            };
        }

        if (v === 'decimal_mult_std') {
            const ans = this.fixFloat(num * factor);
            const equivDiv = Math.round(1 / factor);

            return {
                renderData: {
                    latex: `${num} \\cdot ${factor.toString().replace('.', ',')}`,
                    description: lang === 'sv' ? "Beräkna resultatet av multiplikationen." : "Calculate the result of the multiplication.",
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? `Att multiplicera med ${factor.toString().replace('.', ',')} är samma sak som att dividera med ${equivDiv}.` 
                            : `Multiplying by ${factor} is the same as dividing by ${equivDiv}.`, 
                        latex: `${factor} = \\frac{1}{${equivDiv}}` 
                    },
                    { 
                        text: lang === 'sv' 
                            ? `Flytta kommatecknet åt vänster för att göra talet mindre.` 
                            : `Move the decimal point to the left to make the number smaller.`, 
                        latex: `${num} / ${equivDiv} = ${ans}` 
                    }
                ],
                metadata: { variation_key: 'decimal_mult_std', difficulty: 3 }
            };
        }

        // Variation C: Decimal Logic Discovery (Inverse)
        const isMult = Math.random() > 0.5;
        const result = isMult ? this.fixFloat(num * factor) : this.fixFloat(num / factor);
        const correctStmt = lang === 'sv' 
            ? `${num} ${isMult ? '·' : '/'} ${factor.toString().replace('.', ',')} = ${result.toString().replace('.', ',')}`
            : `${num} ${isMult ? '·' : '/'} ${factor} = ${result}`;

        return {
            renderData: {
                description: lang === 'sv' ? "Vilket av följande påståenden är matematiskt korrekt?" : "Which of the following statements is mathematically correct?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([
                    correctStmt,
                    lang === 'sv' ? `${num} ${isMult ? '·' : '/'} ${1/factor} = ${result.toString().replace('.', ',')}` : `${num} ${isMult ? '·' : '/'} ${1/factor} = ${result}`,
                    lang === 'sv' ? `${num} ${isMult ? '·' : '/'} 1 = ${result.toString().replace('.', ',')}` : `${num} ${isMult ? '·' : '/'} 1 = ${result}`
                ])
            },
            token: this.toBase64(correctStmt),
            clues: [
                { 
                    text: lang === 'sv' 
                        ? `Kontrollera om resultatet (${result.toString().replace('.', ',')}) är större eller mindre än starttalet (${num}).` 
                        : `Check if the result (${result}) is larger or smaller than the start number (${num}).`, 
                    latex: "" 
                }
            ],
            metadata: { variation_key: 'decimal_logic_trap', difficulty: 3 }
        };
    }
}