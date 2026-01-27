import { MathUtils } from '../utils/MathUtils';

export class LinearGraphGenerator {
    public generate(level: number, lang: string = 'sv') {
        switch (level) {
            case 1: return this.level1_FindM(lang);
            case 2: return this.level2_FindK_Pos(lang);
            case 3: return this.level3_FindK_Neg(lang);
            case 4: return this.level4_FindFunction(lang);
            case 5: return this.level5_Mixed(lang);
            default: return this.level1_FindM(lang);
        }
    }

    private level1_FindM(lang: string) {
        const m = MathUtils.randomInt(-5, 5);
        const k = 1; 
        return {
            renderData: {
                graph: { range: 10, lines: [{ slope: k, intercept: m, color: '#2563eb' }] },
                description: lang === 'sv' ? "Bestäm m-värdet (skärning med y-axeln)." : "Determine the m-value (y-intercept).",
                answerType: 'text'
            },
            token: Buffer.from(m.toString()).toString('base64'),
            clues: [{ text: lang === 'sv' ? "Var skär linjen den lodräta axeln (y)?" : "Where does the line cross the vertical axis (y)?" }]
        };
    }

    private level2_FindK_Pos(lang: string) {
        const k = MathUtils.randomInt(1, 4);
        return {
            renderData: {
                graph: { range: 10, lines: [{ slope: k, intercept: 0, color: '#16a34a' }] },
                description: lang === 'sv' ? "Bestäm k-värdet (lutningen)." : "Determine the k-value (slope).",
                answerType: 'text'
            },
            token: Buffer.from(k.toString()).toString('base64'),
            clues: [{ latex: `k = \\frac{\\Delta y}{\\Delta x}` }]
        };
    }

    private level3_FindK_Neg(lang: string) {
        const k = MathUtils.randomInt(-4, -1);
        const m = MathUtils.randomInt(2, 8); 
        return {
            renderData: {
                graph: { range: 10, lines: [{ slope: k, intercept: m, color: '#dc2626' }] },
                description: lang === 'sv' ? "Bestäm k-värdet." : "Determine the slope (k).",
                answerType: 'text'
            },
            token: Buffer.from(k.toString()).toString('base64'),
            clues: [{ text: lang === 'sv' ? "Linjen går nedåt, så k är negativt." : "The line goes down, so k is negative." }]
        };
    }

    private level4_FindFunction(lang: string) {
        const k = MathUtils.randomChoice([1, 2, -1, -2]);
        const m = MathUtils.randomInt(-3, 3);
        const sign = m < 0 ? '-' : '+';
        const kStr = (k === 1) ? 'x' : (k === -1 ? '-x' : `${k}x`);
        const ans = m === 0 ? `y=${kStr}` : `y=${kStr}${sign}${Math.abs(m)}`;

        return {
            renderData: {
                graph: { range: 10, lines: [{ slope: k, intercept: m, color: '#7c3aed' }] },
                description: lang === 'sv' ? "Skriv funktionens formel (y=kx+m)." : "Write the equation (y=kx+m).",
                answerType: 'text'
            },
            token: Buffer.from(ans).toString('base64'),
            clues: [{ latex: `y = kx + m` }]
        };
    }

    private level5_Mixed(lang: string) {
        return this.generate(MathUtils.randomInt(1, 4), lang);
    }
}