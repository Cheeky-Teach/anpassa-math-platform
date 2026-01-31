import { MathUtils } from '../utils/MathUtils.js';

export class LinearGraphGenerator {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_FindM(lang);
            case 2: return this.level2_FindK_Pos(lang);
            case 3: return this.level3_FindK_Neg(lang);
            case 4: return this.level4_FindFunction(lang);
            case 5: return this.level5_Mixed(lang);
            default: return this.level1_FindM(lang);
        }
    }

    private level1_FindM(lang: string): any {
        const m = MathUtils.randomInt(-4, 4);
        return {
            renderData: { 
                graph: { range: 10, lines: [{ slope: 1, intercept: m, color: '#2563eb' }] }, 
                description: lang === 'sv' ? "Bestäm m-värdet (var skär linjen y-axeln?)." : "Determine the m-value (y-intercept).", 
                answerType: 'text' 
            },
            token: Buffer.from(m.toString()).toString('base64'),
            serverData: { answer: m, solutionSteps: [
                { text: lang === 'sv' ? "m är värdet där linjen skär y-axeln." : "m is where the line crosses the y-axis." },
                { latex: `(0, ${m})` }
            ]}
        };
    }

    private level2_FindK_Pos(lang: string): any {
        const k = MathUtils.randomInt(1, 3);
        return {
            renderData: { 
                graph: { range: 10, lines: [{ slope: k, intercept: 0, color: '#16a34a' }] }, 
                description: lang === 'sv' ? "Bestäm k-värdet (lutningen)." : "Determine the k-value (slope).", 
                answerType: 'text' 
            },
            token: Buffer.from(k.toString()).toString('base64'),
            serverData: { answer: k, solutionSteps: [
                { text: lang === 'sv' ? "Gå 1 steg åt höger. Hur många steg går du upp?" : "Go 1 step right. How many steps up?", latex: `\\Delta x = 1, \\Delta y = ${k}` }
            ]}
        };
    }

    private level3_FindK_Neg(lang: string): any {
        const k = MathUtils.randomInt(-3, -1);
        return {
            renderData: { 
                graph: { range: 10, lines: [{ slope: k, intercept: 5, color: '#dc2626' }] }, 
                description: lang === 'sv' ? "Bestäm k-värdet (lutningen)." : "Determine the k-value (slope).", 
                answerType: 'text' 
            },
            token: Buffer.from(k.toString()).toString('base64'),
            serverData: { answer: k, solutionSteps: [
                { text: lang === 'sv' ? "Linjen lutar nedåt, så k är negativt." : "Line slopes down, so k is negative.", latex: `k = ${k}` }
            ]}
        };
    }

    private level4_FindFunction(lang: string): any {
        const k = MathUtils.randomChoice([1, 2, -1, -2]);
        const m = MathUtils.randomInt(-3, 3);
        
        // Pretty formatting for equation
        let eq = `y=${k}x`;
        if (m > 0) eq += `+${m}`;
        else if (m < 0) eq += `${m}`; // m includes '-'
        
        return {
            renderData: { 
                graph: { range: 10, lines: [{ slope: k, intercept: m, color: '#7c3aed' }] }, 
                description: lang === 'sv' ? "Skriv formeln (y=kx+m)." : "Write the formula (y=kx+m).", 
                answerType: 'text' 
            },
            token: Buffer.from(eq).toString('base64'),
            serverData: { answer: eq, solutionSteps: [
                { text: lang === 'sv' ? "1. Hitta m (y-skärning)." : "1. Find m (intercept).", latex: `m=${m}` },
                { text: lang === 'sv' ? "2. Hitta k (lutning)." : "2. Find k (slope).", latex: `k=${k}` }
            ]}
        };
    }

    private level5_Mixed(lang: string): any {
        return this.generate(MathUtils.randomInt(1, 4), lang);
    }
}