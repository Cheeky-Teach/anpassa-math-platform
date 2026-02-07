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

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    private fixFloat(n: number) { 
        return parseFloat(n.toFixed(8)); 
    }

    // --- LEVEL 1: MULT/DIV BY 10, 100, 1000 & POWERS ---
    private level1_MultDivBig(lang: string): any {
        const variation = Math.random();

        // Variation A: Standard Forward Calc (10, 100, 1000)
        if (variation < 0.3) {
            const power = MathUtils.randomChoice([10, 100, 1000, 10000]);
            const isMult = Math.random() > 0.5;
            const num = MathUtils.randomInt(5, 95) / (Math.random() > 0.5 ? 1 : 10);
            const ans = isMult ? num * power : this.fixFloat(num / power);
            const zeros = Math.round(Math.log10(power));

            return {
                renderData: {
                    latex: isMult ? `${num} \\cdot ${power}` : `${num} / ${power}`,
                    description: lang === 'sv' ? "Beräkna resultatet." : "Calculate the result.",
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? `Steg 1: Identifiera antalet nollor i talet ${power}. Det är ${zeros} stycken.` 
                            : `Step 1: Identify the number of zeros in ${power}. There are ${zeros}.`, 
                        latex: `10^{${zeros}} = ${power}` 
                    },
                    { 
                        text: lang === 'sv' 
                            ? `Steg 2: Flytta kommatecknet ${zeros} steg åt ${isMult ? 'höger (talet blir större)' : 'vänster (talet blir mindre)'}.` 
                            : `Step 2: Move the decimal point ${zeros} steps to the ${isMult ? 'right (larger)' : 'left (smaller)'}.`, 
                        latex: isMult ? `${num} \\rightarrow ${ans}` : `${num} \\rightarrow ${ans}`
                    }
                ],
                metadata: { variation: isMult ? 'big_mult_std' : 'big_div_std', difficulty: 1 }
            };
        }

        // Variation B: Missing Power Factor (Inverse)
        if (variation < 0.6) {
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
                    { 
                        text: lang === 'sv' 
                            ? `Steg 1: Jämför starttalet (${num}) med resultatet (${res}). Se hur många steg kommat har flyttats.` 
                            : `Step 1: Compare the start number (${num}) with the result (${res}). See how many places the decimal has moved.`, 
                        latex: "" 
                    },
                    { 
                        text: lang === 'sv' 
                            ? `Varje steg motsvarar en nolla i tiopotensen. Här har det flyttats ${Math.round(Math.log10(power))} steg.` 
                            : `Each step corresponds to a zero in the power of ten. Here it moved ${Math.round(Math.log10(power))} steps.`, 
                        latex: `10^{${Math.round(Math.log10(power))}} = ${power}` 
                    }
                ],
                metadata: { variation: 'big_missing_factor', difficulty: 2 }
            };
        }

        // Variation C: Power Discovery
        const power = MathUtils.randomInt(2, 6);
        const num = Math.pow(10, power);
        return {
            renderData: {
                description: lang === 'sv' ? `Skriv talet ${num.toLocaleString(lang)} som en potens med basen 10:` : `Write the number ${num.toLocaleString(lang)} as a power with base 10:`,
                latex: `${num} = 10^{?}`,
                answerType: 'structured_power'
            },
            token: this.toBase64(`10^${power}`),
            clues: [
                { 
                    text: lang === 'sv' 
                        ? `Steg 1: Räkna hur många nollor som finns efter 1:an.` 
                        : `Step 1: Count how many zeros follow the 1.`, 
                    latex: "" 
                },
                { 
                    text: lang === 'sv' 
                        ? `Antalet nollor (${power}) är exakt det tal som ska stå i exponenten.` 
                        : `The number of zeros (${power}) is exactly the value that goes in the exponent.`, 
                    latex: `10^{${power}} = ${num}` 
                }
            ],
            metadata: { variation: 'power_discovery', difficulty: 2 }
        };
    }

    // --- LEVEL 2: CONCEPTUAL RECIPROCALS ---
    private level2_Concepts(lang: string): any {
        const variation = Math.random();

        // Variation A: The "Same As" Reciprocal Logic
        if (variation < 0.4) {
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
                        ? `Att ${opText} ${s.val} är samma sak som att ${targetText}` 
                        : `To ${opText} ${s.val} is the same as ${targetText}`,
                    answerType: 'multiple_choice',
                    options: MathUtils.shuffle(["10", "100", "0.1", "0.01", "1000"])
                },
                token: this.toBase64(s.equiv.toString()),
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? `Steg 1: Kom ihåg att ${s.val} är en ${s.equiv === 10 ? 'tiondel' : 'hundradel'}.` 
                            : `Step 1: Remember that ${s.val} is one ${s.equiv === 10 ? 'tenth' : 'hundredth'}.`, 
                        latex: `${s.val} = \\frac{1}{${s.equiv}}` 
                    },
                    { 
                        text: lang === 'sv' 
                            ? `Att ta en ${s.equiv === 10 ? 'tiondel' : 'hundradel'} av något (multiplikation) är samma sak som att dela det med ${s.equiv}.` 
                            : `Taking one ${s.equiv === 10 ? 'tenth' : 'hundredth'} of something (multiplication) is the same as dividing it by ${s.equiv}.`, 
                        latex: ""
                    }
                ],
                metadata: { variation: 'reciprocal_equivalence', difficulty: 2 }
            };
        }

        // Variation B: Spot the Lie
        const generateStmt = (isCorrect: boolean) => {
            const num = MathUtils.randomInt(2, 9) * 10;
            const type = MathUtils.randomInt(1, 3);
            if (type === 1) { // Mult 0.1
                return isCorrect ? `${num} x 0.1 = ${num/10}` : `${num} x 0.1 = ${num * 10}`;
            } else if (type === 2) { // Div 0.1
                return isCorrect ? `${num} / 0.1 = ${num * 10}` : `${num} / 0.1 = ${num / 10}`;
            } else { // Mult 0.01
                return isCorrect ? `${num} x 0.01 = ${this.fixFloat(num/100)}` : `${num} x 0.01 = ${num / 10}`;
            }
        };

        const sTrue1 = generateStmt(true);
        const sTrue2 = generateStmt(true);
        const sFalse = generateStmt(false);

        return {
            renderData: {
                description: lang === 'sv' ? "Vilket påstående är FALSKT?" : "Which statement is FALSE?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle([sTrue1, sTrue2, sFalse])
            },
            token: this.toBase64(sFalse),
            clues: [
                { 
                    text: lang === 'sv' ? "Steg 1: Kontrollera om talet blir större eller mindre. Multiplikation med decimaler mindre än 1 (0.1, 0.01) ska göra talet MINDRE." : "Step 1: Check if the number gets larger or smaller. Multiplying by decimals less than 1 (0.1, 0.01) should make the number SMALLER.", 
                    latex: "" 
                }
            ],
            metadata: { variation: 'concept_spot_lie', difficulty: 2 }
        };
    }

    // --- LEVEL 3: DECIMAL POWERS (0.1, 0.01, 0.001) ---
    private level3_DecimalPowers(lang: string): any {
        const variation = Math.random();
        const factor = MathUtils.randomChoice([0.1, 0.01, 0.001]);
        const num = MathUtils.randomInt(5, 50);

        // Variation A: Division by Decimals (Crucial: Result gets larger)
        if (variation < 0.4) {
            const ans = this.fixFloat(num / factor);
            const equivMult = Math.round(1 / factor);
            
            return {
                renderData: {
                    latex: `${num} / ${factor}`,
                    description: lang === 'sv' ? "Beräkna divisionen." : "Calculate the division.",
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? `Steg 1: Att dela med ${factor} är samma sak som att multiplicera med ${equivMult}.` 
                            : `Step 1: Dividing by ${factor} is the same as multiplying by ${equivMult}.`, 
                        latex: `\\frac{1}{${factor}} = ${equivMult}` 
                    },
                    { 
                        text: lang === 'sv' 
                            ? `När vi delar med ett tal mindre än 1 så blir resultatet alltid STÖRRE.` 
                            : `When we divide by a number less than 1, the result always gets LARGER.`, 
                        latex: `${num} \\cdot ${equivMult} = ${ans}` 
                    }
                ],
                metadata: { variation: 'decimal_div_std', difficulty: 3 }
            };
        }

        // Variation B: Multiplication by Decimals (Result gets smaller)
        if (variation < 0.7) {
            const ans = this.fixFloat(num * factor);
            const equivDiv = Math.round(1 / factor);

            return {
                renderData: {
                    latex: `${num} \\cdot ${factor}`,
                    description: lang === 'sv' ? "Beräkna multiplikationen." : "Calculate the multiplication.",
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [
                    { 
                        text: lang === 'sv' 
                            ? `Steg 1: Att multiplicera med ${factor} är samma sak som att dela med ${equivDiv}.` 
                            : `Step 1: Multiplying by ${factor} is the same as dividing by ${equivDiv}.`, 
                        latex: `${factor} = \\frac{1}{${equivDiv}}` 
                    },
                    { 
                        text: lang === 'sv' 
                            ? `Flytta kommatecknet åt vänster för att göra talet mindre.` 
                            : `Move the decimal point to the left to make the number smaller.`, 
                        latex: `${num} / ${equivDiv} = ${ans}` 
                    }
                ],
                metadata: { variation: 'decimal_mult_std', difficulty: 3 }
            };
        }

        // Variation C: Inverse Factor Discovery (Spot the Lie/Mixed)
        const isMult = Math.random() > 0.5;
        const correctFactor = factor;
        const wrongFactor = MathUtils.randomChoice([10, 100].filter(f => f !== 1/correctFactor));
        
        const result = isMult ? this.fixFloat(num * correctFactor) : this.fixFloat(num / correctFactor);
        const symbol = isMult ? "x" : "/";

        const options = [
            `${num} ${symbol} ${correctFactor} = ${result}`,
            `${num} ${symbol} ${wrongFactor} = ${result}`,
            `${num} ${symbol} 1 = ${result}`
        ];

        return {
            renderData: {
                description: lang === 'sv' ? "Vilket påstående stämmer?" : "Which statement is correct?",
                answerType: 'multiple_choice',
                options: MathUtils.shuffle(options)
            },
            token: this.toBase64(options[0]),
            clues: [
                { 
                    text: lang === 'sv' 
                        ? `Steg 1: Se om resultatet (${result}) är större eller mindre än starttalet (${num}).` 
                        : `Step 1: Check if the result (${result}) is larger or smaller than the start number (${num}).`, 
                    latex: "" 
                },
                { 
                    text: lang === 'sv' 
                        ? `Om du ${isMult ? 'multiplicerar' : 'dividerar'} och talet blir ${isMult ? 'mindre' : 'större'} så har du använt en decimal (t.ex. ${correctFactor}).` 
                        : `If you ${isMult ? 'multiply' : 'divide'} and the number gets ${isMult ? 'smaller' : 'larger'}, you used a decimal (e.g., ${correctFactor}).`, 
                    latex: "" 
                }
            ],
            metadata: { variation: 'decimal_logic_trap', difficulty: 3 }
        };
    }
}