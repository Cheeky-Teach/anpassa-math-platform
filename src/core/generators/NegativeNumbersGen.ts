import { MathUtils } from '../utils/MathUtils.js';

export class NegativeNumbersGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_AddSubSimple(lang);
            case 2: return this.level2_AddSubHard(lang);
            case 3: return this.level3_Multiplication(lang);
            case 4: return this.level4_Division(lang);
            case 5: return this.level5_Mixed(lang);
            default: return this.level1_AddSubSimple(lang);
        }
    }

    private p(n: number): string {
        return n < 0 ? `(${n})` : `${n}`;
    }

    // Level 1: Simple (-5 + 3, 2 - 8)
    private level1_AddSubSimple(lang: string): any {
        // Range logic from legacy: 10 range, min -10
        const start = MathUtils.randomInt(-10, 10);
        const change = MathUtils.randomInt(1, 10);
        const op = Math.random() > 0.5 ? '+' : '-';
        const ans = op === '+' ? start + change : start - change;

        return {
            renderData: { 
                latex: `${start} ${op} ${change}`, 
                description: lang === 'sv' ? "Beräkna." : "Calculate.", 
                answerType: 'text' 
            },
            token: Buffer.from(ans.toString()).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Tänk på en termometer." : "Think of a thermometer." },
                { 
                    text: op === '+' 
                        ? (lang === 'sv' ? `Starta på ${start} och gå ${change} steg UPPÅT.` : `Start at ${start} and go ${change} steps UP.`) 
                        : (lang === 'sv' ? `Starta på ${start} och gå ${change} steg NEDÅT.` : `Start at ${start} and go ${change} steps DOWN.`) 
                }
            ]
        };
    }

    // Level 2: Double signs (5 - (-3))
    private level2_AddSubHard(lang: string): any {
        const a = MathUtils.randomInt(-10, 10);
        const b = MathUtils.randomInt(-10, -1); // Negative second number ensures double sign
        const op = Math.random() > 0.5 ? '+' : '-';
        const ans = op === '+' ? a + b : a - b;

        let ruleText = "";
        let ruleLatex = "";

        // Pedagogical Logic
        if (op === '+') {
            // Adding a negative: 5 + (-3) -> 5 - 3
            ruleText = lang === 'sv' ? "Plus och minus bredvid varandra blir MINUS." : "Plus and minus next to each other become MINUS.";
            ruleLatex = `${a} - ${Math.abs(b)}`;
        } else {
            // Subtracting a negative: 5 - (-3) -> 5 + 3
            ruleText = lang === 'sv' ? "Två minus bredvid varandra blir PLUS." : "Two minuses next to each other become PLUS.";
            ruleLatex = `${a} + ${Math.abs(b)}`;
        }

        return {
            renderData: { 
                latex: `${a} ${op} (${b})`, 
                description: lang === 'sv' ? "Beräkna." : "Calculate.", 
                answerType: 'text' 
            },
            token: Buffer.from(ans.toString()).toString('base64'),
            clues: [
                { text: ruleText, latex: ruleLatex },
                { text: lang === 'sv' ? "Räkna nu ut det nya uttrycket." : "Now calculate the new expression." }
            ]
        };
    }

    // Level 3: Multiplication (-5 * -5)
    private level3_Multiplication(lang: string): any {
        // Ensure non-zero to emphasize sign rules
        let a = 0, b = 0;
        while(a===0) a = MathUtils.randomInt(-10, 10);
        while(b===0) b = MathUtils.randomInt(-10, 10);
        
        const ans = a * b;
        const sameSign = (a > 0 && b > 0) || (a < 0 && b < 0);

        return {
            renderData: { 
                latex: `${this.p(a)} \\cdot ${this.p(b)}`, 
                description: lang === 'sv' ? "Beräkna." : "Calculate.", 
                answerType: 'text' 
            },
            token: Buffer.from(ans.toString()).toString('base64'),
            clues: [
                { 
                    text: sameSign 
                    ? (lang === 'sv' ? "Lika tecken ger PLUS (+)." : "Same signs give PLUS (+).") 
                    : (lang === 'sv' ? "Olika tecken ger MINUS (-)." : "Different signs give MINUS (-).") 
                },
                {
                    text: lang === 'sv' ? `Multiplicera siffrorna: ${Math.abs(a)} * ${Math.abs(b)}` : `Multiply the numbers: ${Math.abs(a)} * ${Math.abs(b)}`,
                    latex: `\\mathbf{${ans}}`
                }
            ]
        };
    }

    // Level 4: Division
    private level4_Division(lang: string): any {
        let b = 0;
        while(b === 0) b = MathUtils.randomInt(-10, 10);
        
        const maxRes = Math.floor(100 / Math.abs(b));
        let res = 0;
        while(res === 0) res = MathUtils.randomInt(-maxRes, maxRes);
        
        const a = res * b;
        const ans = res;
        
        const sameSign = (a > 0 && b > 0) || (a < 0 && b < 0);

        return {
            renderData: { 
                latex: `\\frac{${a}}{${b}}`, 
                description: lang === 'sv' ? "Beräkna." : "Calculate.", 
                answerType: 'text' 
            },
            token: Buffer.from(ans.toString()).toString('base64'),
            clues: [
                { 
                    text: sameSign 
                    ? (lang === 'sv' ? "Lika tecken ger PLUS (+)." : "Same signs give PLUS (+).") 
                    : (lang === 'sv' ? "Olika tecken ger MINUS (-)." : "Different signs give MINUS (-).") 
                },
                {
                    text: lang === 'sv' ? `Dividera siffrorna: ${Math.abs(a)} / ${Math.abs(b)}` : `Divide the numbers: ${Math.abs(a)} / ${Math.abs(b)}`
                }
            ]
        };
    }

    private level5_Mixed(lang: string): any {
        const lvl = MathUtils.randomInt(1, 4);
        return this.generate(lvl, lang);
    }
}