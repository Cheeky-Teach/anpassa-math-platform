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

    /**
     * Converts numbers/signs into Unicode superscripts for clear button display.
     */
    private toSup(num: number | string): string {
        const map: any = {
            '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
            '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻'
        };
        return num.toString().split('').map(char => map[char] || char).join('');
    }

    // --- LEVEL 1: MULT/DIV BY 10, 100, 1000 & POWERS ---
    private level1_MultDivBig(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['big_mult_std', 'big_div_std', 'big_missing_factor', 'power_discovery']);

        if (v === 'big_mult_std' || v === 'big_div_std') {
            const power = MathUtils.randomChoice([10, 100, 1000, 10000]);
            const isMult = v === 'big_mult_std';
            const num = MathUtils.randomInt(5, 95) / (Math.random() > 0.5 ? 1 : 10);
            const ans = isMult ? num * power : this.fixFloat(num / power);
            const zeros = Math.round(Math.log10(power));

            return {
                renderData: {
                    latex: isMult ? `${num} \\cdot ${power}` : `${num} / ${power}`,
                    description: lang === 'sv' ? "Beräkna uttryckets värde." : "Calculate the value of the expression.",
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { 
                        text: lang === 'sv' ? `Räkna antalet nollor i talet ${power}. Det avgör hur många steg kommat ska flyttas.` : `Count the number of zeros in ${power}. This determines how many places the decimal moves.`, 
                        latex: `10^{${zeros}} = ${power}` 
                    },
                    { 
                        text: lang === 'sv' ? `Flytta kommat ${zeros} steg åt ${isMult ? 'höger (talet blir större).' : 'vänster (talet blir mindre).'}` : `Move the decimal ${zeros} places to the ${isMult ? 'right (making the number larger).' : 'left (making the number smaller).'}`, 
                        latex: `${num} \\rightarrow ${ans}`
                    },
                    { text: lang === 'sv' ? "Svaret blir:" : "The answer is:", latex: `${ans}` }
                ],
                metadata: { variation_key: v, difficulty: 1 }
            };
        }

        if (v === 'big_missing_factor') {
            const power = MathUtils.randomChoice([10, 100, 1000]);
            const num = MathUtils.randomInt(5, 50);
            const isMult = Math.random() > 0.5;
            const res = isMult ? num * power : this.fixFloat(num / power);

            return {
                renderData: {
                    latex: isMult ? `${num} \\cdot ? = ${res}` : `${num} / ? = ${res}`,
                    description: lang === 'sv' ? "Vilken tiopotens saknas?" : "Which power of ten is missing?",
                    answerType: 'numeric'
                },
                token: this.toBase64(power.toString()),
                clues: [
                    { text: lang === 'sv' ? `Jämför ${num} med ${res}. Hur många steg har kommatecknet flyttats?` : `Compare ${num} with ${res}. How many places has the decimal point moved?` },
                    { text: lang === 'sv' ? `Varje steg motsvarar en nolla efter ettan.` : `Each step corresponds to a zero after the one.`, latex: `10^{${Math.round(Math.log10(power))}} = ${power}` },
                    { text: lang === 'sv' ? "Den saknade tiopotensen är:" : "The missing power of ten is:", latex: `${power}` }
                ],
                metadata: { variation_key: 'big_missing_factor', difficulty: 2 }
            };
        }

        const pVal = MathUtils.randomInt(2, 6);
        const num = Math.pow(10, pVal);
        return {
            renderData: {
                description: lang === 'sv' ? `Skriv talet ${this.formatNum(num)} som en potens med basen 10.` : `Write ${num} as a power with base 10.`,
                latex: `${num} = 10^{?}`,
                answerType: 'structured_power'
            },
            token: this.toBase64(`10^${pVal}`),
            clues: [
                { text: lang === 'sv' ? `Antalet nollor efter siffran 1 motsvarar exponenten i tiopotensen.` : `The number of zeros after the digit 1 corresponds to the exponent in the power of ten.`, latex: `10^{${pVal}} = ${num}` },
                { text: lang === 'sv' ? "Svaret i potensform är:" : "The answer in power form is:", latex: `10^{${pVal}}` }
            ],
            metadata: { variation_key: 'power_discovery', difficulty: 2 }
        };
    }

    private formatNum(n: number): string {
        return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    // --- LEVEL 2: CONCEPTUAL RECIPROCALS ---
    private level2_Concepts(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['reciprocal_equivalence', 'concept_spot_lie']);

        if (v === 'reciprocal_equivalence') {
            const scenarios = [
                { op: 'mul', val: 0.1, equiv: 10, equivOp: 'div' },
                { op: 'mul', val: 0.01, equiv: 100, equivOp: 'div' },
                { op: 'div', val: 0.1, equiv: 10, equivOp: 'mul' },
                { op: 'div', val: 0.01, equiv: 100, equivOp: 'mul' }
            ];
            const s = MathUtils.randomChoice(scenarios);
            const opText = lang === 'sv' ? (s.op === 'mul' ? "multiplicera med" : "dividera med") : (s.op === 'mul' ? "multiplying by" : "dividing by");
            const targetText = lang === 'sv' ? (s.equivOp === 'mul' ? "multiplicera med..." : "dividera med...") : (s.equivOp === 'mul' ? "multiplying by..." : "dividing by...");

            return {
                renderData: {
                    description: lang === 'sv' ? `Att ${opText} ${s.val.toString().replace('.', ',')} ger samma resultat som att ${targetText}` : `To ${opText} ${s.val} gives the same result as ${targetText}`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle(["10", "100", "0,1", "0,01", "1000"])
                },
                token: this.toBase64(s.equiv.toString()),
                clues: [
                    { text: lang === 'sv' ? `Kom ihåg att ${s.val.toString().replace('.', ',')} är en ${s.equiv === 10 ? 'tiondel' : 'hundradel'}.` : `Remember that ${s.val} is one ${s.equiv === 10 ? 'tenth' : 'hundredth'}.`, latex: `${s.val.toString().replace('.', ',')} = \\frac{1}{${s.equiv}}` },
                    { text: lang === 'sv' ? "Rätt tal att använda är:" : "The correct number to use is:", latex: `${s.equiv}` }
                ],
                metadata: { variation_key: 'reciprocal_equivalence', difficulty: 2 }
            };
        }

        const num = MathUtils.randomInt(3, 9) * 10;
        const sTrue = `${num} · 0,1 = ${num/10}`;
        const sLie = `${num} · 0,1 = ${num * 10}`;

        return {
            renderData: {
                description: lang === 'sv' ? "Vilket påstående är FALSKT?" : "Which statement is FALSE?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([sTrue, sLie, `${num} / 0,1 = ${num * 10}`])
            },
            token: this.toBase64(sLie),
            clues: [
                { text: lang === 'sv' ? "Multiplikation med ett tal mindre än 1 (som 0,1) gör talet mindre, inte större." : "Multiplication with a number less than 1 (like 0.1) makes the number smaller, not larger.", latex: `${num} \\cdot 0,1 = ${num/10}` },
                { text: lang === 'sv' ? "Denna beräkning stämmer alltså inte:" : "This calculation is therefore incorrect:", latex: `\\text{${sLie}}` }
            ],
            metadata: { variation_key: 'concept_spot_lie', difficulty: 2 }
        };
    }

    // --- LEVEL 3: DECIMAL POWERS ---
    private level3_DecimalPowers(lang: string, variationKey?: string): any {
        const v = variationKey || MathUtils.randomChoice(['decimal_div_std', 'decimal_mult_std', 'decimal_logic_trap']);
        const factor = MathUtils.randomChoice([0.1, 0.01]);
        const num = MathUtils.randomInt(5, 50);

        if (v === 'decimal_div_std') {
            const ans = this.fixFloat(num / factor);
            const equivMult = Math.round(1 / factor);
            return {
                renderData: {
                    latex: `${num} / ${factor.toString().replace('.', ',')}`,
                    description: lang === 'sv' ? "Beräkna resultatet." : "Calculate the result.",
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang === 'sv' ? `Division med ${factor.toString().replace('.', ',')} är samma sak som multiplikation med ${equivMult}.` : `Division by ${factor} is the same as multiplication by ${equivMult}.`, latex: `\\frac{${num}}{${factor.toString().replace('.', ',')}} = ${num} \\cdot ${equivMult}` },
                    { text: lang === 'sv' ? "Resultatet blir:" : "The result is:", latex: `${ans}` }
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
                    description: lang === 'sv' ? "Beräkna resultatet." : "Calculate the result.",
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { text: lang === 'sv' ? `Multiplikation med ${factor.toString().replace('.', ',')} är detsamma som division med ${equivDiv}.` : `Multiplication by ${factor} is the same as division by ${equivDiv}.`, latex: `${num} \\cdot ${factor.toString().replace('.', ',')} = \\frac{${num}}{${equivDiv}}` },
                    { text: lang === 'sv' ? "Svaret är:" : "The answer is:", latex: `${ans}` }
                ],
                metadata: { variation_key: 'decimal_mult_std', difficulty: 3 }
            };
        }

        const isMult = Math.random() > 0.5;
        const result = isMult ? this.fixFloat(num * factor) : this.fixFloat(num / factor);
        const correctStmt = `${num} ${isMult ? '·' : '/'} ${factor.toString().replace('.', ',')} = ${result.toString().replace('.', ',')}`;

        return {
            renderData: {
                description: lang === 'sv' ? "Vilket påstående är korrekt?" : "Which statement is correct?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([
                    correctStmt,
                    `${num} ${isMult ? '·' : '/'} ${1/factor} = ${result.toString().replace('.', ',')}`,
                    `${num} ${isMult ? '·' : '/'} 1 = ${result.toString().replace('.', ',')}`
                ])
            },
            token: this.toBase64(correctStmt),
            clues: [
                { text: lang === 'sv' ? `Kontrollera om resultatet (${result.toString().replace('.', ',')}) är rimligt för räknesättet.` : `Check if the result (${result}) is reasonable for the operation.` },
                { text: lang === 'sv' ? "Det korrekta påståendet är:" : "The correct statement is:", latex: `\\text{${correctStmt}}` }
            ],
            metadata: { variation_key: 'decimal_logic_trap', difficulty: 3 }
        };
    }
}