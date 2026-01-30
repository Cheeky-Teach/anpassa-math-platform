import { MathUtils } from '../utils/MathUtils.js';

export class ExponentsGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_Foundations(lang);
            case 2: return this.level2_PowersOfTen(lang);
            case 3: return this.level3_ScientificNotation(lang);
            case 4: return this.level4_SquareRoots(lang);
            case 5: return this.level5_LawsBasic(lang);
            case 6: return this.level6_LawsAdvanced(lang);
            default: return this.level1_Foundations(lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    // Level 1: Foundations & Zero Rule
    private level1_Foundations(lang: string): any {
        const type = MathUtils.randomInt(1, 3);
        
        if (type === 1) { // Zero Rule
            const base = MathUtils.randomInt(5, 1000);
            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna:" : "Calculate:",
                    latex: `${base}^0`,
                    answerType: 'numeric'
                },
                token: this.toBase64("1"),
                clues: [{ text: lang === 'sv' ? "Alla tal (utom 0) upphöjt till 0 blir 1." : "Any number (except 0) to the power of 0 is 1." }]
            };
        } 
        else if (type === 2) { // Write as power
            const base = MathUtils.randomInt(2, 9);
            const exp = MathUtils.randomInt(3, 6);
            const expanded = Array(exp).fill(base).join(' \\cdot ');
            
            return {
                renderData: {
                    description: lang === 'sv' ? "Skriv som en potens:" : "Write as a power:",
                    latex: expanded,
                    answerType: 'structured_power' // UI: [ ] ^ [ ]
                },
                token: this.toBase64(`${base}^${exp}`),
                clues: [
                    { text: lang === 'sv' ? "Basen är talet som multipliceras." : "The base is the number being multiplied." },
                    { text: lang === 'sv' ? "Exponenten är antalet gånger det upprepas." : "The exponent is how many times it repeats." }
                ]
            };
        }
        else { // Calculate simple power
            const base = MathUtils.randomInt(2, 5);
            const exp = MathUtils.randomInt(2, 4);
            const ans = Math.pow(base, exp);
            
            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna värdet:" : "Calculate the value:",
                    latex: `${base}^${exp}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(ans.toString()),
                clues: [{ latex: `${Array(exp).fill(base).join('\\cdot')} = ${ans}` }]
            };
        }
    }

    // Level 2: Powers of 10
    private level2_PowersOfTen(lang: string): any {
        const type = MathUtils.randomChoice(['pos', 'neg', 'calc']);
        
        if (type === 'pos') {
            const exp = MathUtils.randomInt(3, 6);
            const num = Math.pow(10, exp);
            return {
                renderData: {
                    description: lang === 'sv' ? "Skriv som en tiopotens:" : "Write as a power of 10:",
                    latex: `${num}`, // e.g. 10000
                    answerType: 'structured_power',
                    prefillBase: "10" // Optional hint for UI to prefill base
                },
                token: this.toBase64(`10^${exp}`),
                clues: [{ text: lang === 'sv' ? "Räkna nollorna." : "Count the zeros." }]
            };
        }
        else if (type === 'neg') {
            const exp = MathUtils.randomInt(2, 4); // 0.01, 0.001
            let decimal = "0.";
            for(let i=0; i<exp-1; i++) decimal += "0";
            decimal += "1";
            
            return {
                renderData: {
                    description: lang === 'sv' ? "Skriv som en tiopotens:" : "Write as a power of 10:",
                    latex: decimal,
                    answerType: 'structured_power',
                    prefillBase: "10"
                },
                token: this.toBase64(`10^-${exp}`),
                clues: [{ text: lang === 'sv' ? "För decimaltal är exponenten negativ. Räkna decimalerna." : "For decimals, the exponent is negative. Count the decimal places." }]
            };
        }
        else {
            const exp = MathUtils.randomInt(2, 5);
            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna:" : "Calculate:",
                    latex: `10^${exp}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(Math.pow(10, exp).toString()),
                clues: [{ text: lang === 'sv' ? `En etta följt av ${exp} nollor.` : `A one followed by ${exp} zeros.` }]
            };
        }
    }

    // Level 3: Scientific Notation
    private level3_ScientificNotation(lang: string): any {
        const isBig = MathUtils.randomInt(0, 1) === 1;
        
        if (isBig) {
            const mantissa = MathUtils.randomInt(1, 9) + (MathUtils.randomInt(1, 9) / 10); // e.g. 4.5
            const exp = MathUtils.randomInt(3, 6);
            const num = Math.round(mantissa * Math.pow(10, exp));
            
            return {
                renderData: {
                    description: lang === 'sv' ? "Skriv i grundpotensform (vetenskaplig form):" : "Write in scientific notation:",
                    latex: `${num}`, // e.g. 45000
                    answerType: 'structured_scientific' // UI: [ ] * 10 ^ [ ]
                },
                token: this.toBase64(`${mantissa}*10^${exp}`),
                clues: [
                    { text: lang === 'sv' ? "Flytta kommatecknet så att bara en siffra (1-9) är till vänster." : "Move decimal so only one digit (1-9) is to the left." },
                    { latex: `${mantissa} \\cdot 10^${exp}` }
                ]
            };
        } else {
            const mantissa = MathUtils.randomInt(1, 9);
            const exp = MathUtils.randomInt(3, 5); // -3 to -5
            let numStr = (mantissa * Math.pow(10, -exp)).toFixed(exp);
            
            return {
                renderData: {
                    description: lang === 'sv' ? "Skriv i grundpotensform:" : "Write in scientific notation:",
                    latex: numStr,
                    answerType: 'structured_scientific'
                },
                token: this.toBase64(`${mantissa}*10^-${exp}`),
                clues: [{ latex: `${mantissa} \\cdot 10^{-${exp}}` }]
            };
        }
    }

    // Level 4: Square Roots & Estimation
    private level4_SquareRoots(lang: string): any {
        const type = MathUtils.randomChoice(['calc', 'est']);

        if (type === 'calc') {
            const base = MathUtils.randomInt(1, 15);
            return {
                renderData: {
                    description: lang === 'sv' ? "Beräkna:" : "Calculate:",
                    latex: `\\sqrt{${base*base}}`,
                    answerType: 'numeric'
                },
                token: this.toBase64(base.toString()),
                clues: [{ text: lang === 'sv' ? "Vilket tal gånger sig självt?" : "Which number times itself?" }]
            };
        } else {
            // Estimation
            const low = MathUtils.randomInt(3, 9);
            const high = low + 1;
            const target = MathUtils.randomInt((low*low)+1, (high*high)-1);
            
            return {
                renderData: {
                    description: lang === 'sv' ? "Mellan vilka två heltal ligger:" : "Between which two integers does this lie:",
                    latex: `\\sqrt{${target}}`,
                    answerType: 'structured_range' // UI: [ ] < sqrt < [ ]
                },
                token: this.toBase64(`${low}:${high}`),
                clues: [
                    { latex: `\\sqrt{${low*low}} = ${low}` },
                    { latex: `\\sqrt{${high*high}} = ${high}` },
                    { text: lang === 'sv' ? `${target} ligger mellan ${low*low} och ${high*high}.` : `${target} is between ${low*low} and ${high*high}.` }
                ]
            };
        }
    }

    // Level 5: Laws Basic
    private level5_LawsBasic(lang: string): any {
        const mode = MathUtils.randomChoice(['mult', 'div']);
        const baseVar = 'x';
        const a = MathUtils.randomInt(2, 6);
        const b = MathUtils.randomInt(2, 6);
        
        if (mode === 'mult') {
            const ans = a + b;
            return {
                renderData: {
                    description: lang === 'sv' ? "Förenkla:" : "Simplify:",
                    latex: `x^${a} \\cdot x^${b}`,
                    answerType: 'structured_power',
                    prefillBase: 'x'
                },
                token: this.toBase64(`x^${ans}`),
                clues: [{ text: lang === 'sv' ? "Addera exponenterna vid multiplikation." : "Add exponents when multiplying.", latex: `${a} + ${b} = ${ans}` }]
            };
        } else {
            // Division (ensure a > b)
            const big = Math.max(a, b) + 2;
            const small = Math.min(a, b);
            const ans = big - small;
             return {
                renderData: {
                    description: lang === 'sv' ? "Förenkla:" : "Simplify:",
                    latex: `\\frac{x^${big}}{x^${small}}`,
                    answerType: 'structured_power',
                    prefillBase: 'x'
                },
                token: this.toBase64(`x^${ans}`),
                clues: [{ text: lang === 'sv' ? "Subtrahera exponenterna vid division." : "Subtract exponents when dividing.", latex: `${big} - ${small} = ${ans}` }]
            };
        }
    }

    // Level 6: Advanced Laws
    private level6_LawsAdvanced(lang: string): any {
        const a = MathUtils.randomInt(2, 4);
        const b = MathUtils.randomInt(2, 4);
        const ans = a * b;
        
        return {
             renderData: {
                description: lang === 'sv' ? "Förenkla:" : "Simplify:",
                latex: `(x^${a})^${b}`,
                answerType: 'structured_power',
                prefillBase: 'x'
            },
            token: this.toBase64(`x^${ans}`),
            clues: [{ text: lang === 'sv' ? "Multiplicera exponenterna (potens av potens)." : "Multiply the exponents (power of power).", latex: `${a} \\cdot ${b} = ${ans}` }]
        };
    }
}