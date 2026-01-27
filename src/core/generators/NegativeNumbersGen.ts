import { MathUtils } from '../utils/MathUtils';

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

    // Level 1: Simple (-5 + 3, 2 - 8)
    private level1_AddSubSimple(lang: string): any {
        const start = MathUtils.randomInt(-10, 10);
        const change = MathUtils.randomInt(1, 10);
        const op = Math.random() > 0.5 ? '+' : '-';
        const ans = op === '+' ? start + change : start - change;

        return {
            renderData: { 
                latex: `${start} ${op} ${change}`, 
                description: lang === 'sv' ? "Beräkna" : "Calculate", 
                answerType: 'text' 
            },
            token: Buffer.from(ans.toString()).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Tänk på en termometer." : "Think of a thermometer." },
                { 
                    text: op === '+' 
                        ? (lang === 'sv' ? "Du går UPPÅT på termometern." : "You move UP the thermometer.") 
                        : (lang === 'sv' ? "Du går NEDÅT på termometern." : "You move DOWN the thermometer.") 
                }
            ]
        };
    }

    // Level 2: Double signs (5 - (-3))
    private level2_AddSubHard(lang: string): any {
        const a = MathUtils.randomInt(-10, 10);
        const b = MathUtils.randomInt(-10, -1); // Negative second number
        const op = Math.random() > 0.5 ? '+' : '-';
        const ans = op === '+' ? a + b : a - b;

        return {
            renderData: { 
                latex: `${a} ${op} (${b})`, 
                description: lang === 'sv' ? "Beräkna" : "Calculate", 
                answerType: 'text' 
            },
            token: Buffer.from(ans.toString()).toString('base64'),
            clues: [
                { 
                    text: op === '-' 
                        ? (lang === 'sv' ? "Två minus blir plus: $(-)$ och $(-)$ blir $(+)$" : "Two minuses become plus: $(-)$ and $(-)$ becomes $(+)$") 
                        : (lang === 'sv' ? "Plus och minus blir minus." : "Plus and minus becomes minus.")
                },
                {
                    latex: op === '-' ? `${a} + ${Math.abs(b)}` : `${a} - ${Math.abs(b)}`
                }
            ]
        };
    }

    // Level 3: Multiplication (-5 * -5)
    private level3_Multiplication(lang: string): any {
        const a = MathUtils.randomInt(2, 9) * (Math.random() > 0.5 ? 1 : -1);
        const b = MathUtils.randomInt(2, 9) * (Math.random() > 0.5 ? 1 : -1);
        const ans = a * b;

        return {
            renderData: { 
                latex: `${a} \\cdot ${b < 0 ? '('+b+')' : b}`, 
                description: lang === 'sv' ? "Beräkna" : "Calculate", 
                answerType: 'text' 
            },
            token: Buffer.from(ans.toString()).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Lika tecken ger PLUS. Olika tecken ger MINUS." : "Same signs give PLUS. Different signs give MINUS." }
            ]
        };
    }

    // Level 4: Division
    private level4_Division(lang: string): any {
        const b = MathUtils.randomInt(2, 9) * (Math.random() > 0.5 ? 1 : -1);
        const ans = MathUtils.randomInt(2, 9) * (Math.random() > 0.5 ? 1 : -1);
        const a = b * ans;

        return {
            renderData: { 
                latex: `\\frac{${a}}{${b}}`, 
                description: lang === 'sv' ? "Beräkna" : "Calculate", 
                answerType: 'text' 
            },
            token: Buffer.from(ans.toString()).toString('base64'),
            clues: [
                { text: lang === 'sv' ? "Samma regel som multiplikation: Lika tecken (+) och Olika tecken (-)." : "Same rule as multiplication: Same signs (+) and Different signs (-)." }
            ]
        };
    }

    private level5_Mixed(lang: string): any {
        const lvl = MathUtils.randomInt(1, 4);
        return this.generate(lvl, lang);
    }
}