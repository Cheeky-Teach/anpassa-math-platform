import { MathUtils } from '../utils/MathUtils.js';

export class PatternsGen {
    public generate(level: number, lang: string = 'sv'): any {
        switch (level) {
            case 1: return this.level1_NextNumber(lang);
            case 2: return this.level2_HighTerm(lang);
            case 3: return this.level3_VisualFormula(lang);
            case 4: return this.level4_TableToFormula(lang);
            case 5: return this.level5_ReverseEngineering(lang);
            default: return this.level1_NextNumber(lang);
        }
    }

    private toBase64(str: string): string {
        return Buffer.from(str).toString('base64');
    }

    private level1_NextNumber(lang: string): any {
        const diff = MathUtils.randomInt(2, 6);
        const start = MathUtils.randomInt(2, 10);
        const sequence = [start, start + diff, start + diff * 2, start + diff * 3];
        const isFindingDiff = MathUtils.randomInt(0, 1) === 0;
        const answer = isFindingDiff ? diff : start + diff * 4;

        const desc = lang === 'sv' 
            ? (isFindingDiff ? "Vad är skillnaden (differensen) mellan talen i mönstret?" : "Vilket tal kommer härnäst i sifferföljden?") 
            : (isFindingDiff ? "What is the common difference between the numbers in the pattern?" : "What is the next number in the sequence?");

        return {
            renderData: {
                description: desc,
                answerType: 'numeric',
                geometry: {
                    type: 'pattern',
                    subtype: 'sequence',
                    sequence: [...sequence, (isFindingDiff ? sequence[3] + diff : '?')]
                }
            },
            token: this.toBase64(answer.toString()),
            clues: [
                { text: lang === 'sv' ? "Ta ett tal minus talet innan för att se ökningen." : "Subtract a number by the one before it to see the increase.", latex: `${sequence[1]} - ${sequence[0]} = ${diff}` }
            ]
        };
    }

    private level2_HighTerm(lang: string): any {
        const diff = MathUtils.randomInt(3, 8);
        const start = MathUtils.randomInt(5, 20); 
        const targetN = MathUtils.randomChoice([10, 20, 50]);
        const answer = start + (targetN - 1) * diff;
        const sequence = [start, start + diff, start + diff * 2];

        const desc = lang === 'sv'
            ? `Ett mönster börjar ${sequence.join(', ')}. Vilket värde har figur ${targetN}?`
            : `A pattern starts ${sequence.join(', ')}. What is the value of figure ${targetN}?`;

        return {
            renderData: {
                description: desc,
                answerType: 'numeric',
                geometry: { type: 'pattern', subtype: 'sequence', sequence: [...sequence, '...'] }
            },
            token: this.toBase64(answer.toString()),
            clues: [
                { text: lang === 'sv' ? `Ökningen är ${diff}.` : `The increase is ${diff}.`, latex: `a = ${diff}` },
                { text: lang === 'sv' ? `Använd formeln: Figur 1 + (n-1) * ökning.` : `Use the formula: Figure 1 + (n-1) * increase.`, latex: `${start} + (${targetN}-1) \\cdot ${diff}` }
            ]
        };
    }

    private level3_VisualFormula(lang: string): any {
        // an + b
        // a = increase per step 
        // b = initial constant
        const a = MathUtils.randomChoice([2, 3, 4]); // 2: Triangles, 3: Squares, 4: Houses
        const extraSticks = MathUtils.randomInt(0, 3); // Standalone variety
        const b = 1 + extraSticks; // Base connecting side (1) + randomized variety

        const getFigures = () => {
            const figs = [];
            const size = 25;
            for (let n = 1; n <= 3; n++) {
                const sticks = [];
                let currentX = 10;
                const startY = 75;

                // 1. Draw Standalone extra sticks (Adds to 'b')
                for (let k = 0; k < extraSticks; k++) {
                    sticks.push({ x1: currentX, y1: startY - size, x2: currentX, y2: startY });
                    currentX += 8;
                }

                currentX += 5; // Gap before pattern starts
                const patternStartX = currentX;

                // 2. Draw the "Initial Boundary" (The +1 in an + 1)
                if (a === 2) { // Triangle start (left diag)
                    sticks.push({ x1: patternStartX + size/2, y1: startY - size, x2: patternStartX, y2: startY });
                } else { // Square/House start (left wall)
                    sticks.push({ x1: patternStartX, y1: startY - size, x2: patternStartX, y2: startY });
                }

                // 3. Draw the Chain (The 'an' part)
                for (let i = 0; i < n; i++) {
                    const x = patternStartX + i * size;
                    const y = startY;

                    if (a === 2) { // Triangle: Each adds Bottom + Right Diag
                        sticks.push({ x1: x, y1: y, x2: x + size, y2: y }); // Bottom
                        sticks.push({ x1: x + size/2, y1: y - size, x2: x + size, y2: y }); // Right diag
                    } else if (a === 3) { // Square: Each adds Top + Bottom + Right Wall
                        sticks.push({ x1: x, y1: y, x2: x + size, y2: y }); // Bottom
                        sticks.push({ x1: x, y1: y - size, x2: x + size, y2: y - size }); // Top
                        sticks.push({ x1: x + size, y1: y - size, x2: x + size, y2: y }); // Right wall
                    } else if (a === 4) { // House: Each adds Bottom + Right Wall + 2 Roof parts
                        sticks.push({ x1: x, y1: y, x2: x + size, y2: y }); // Floor
                        sticks.push({ x1: x + size, y1: y - size, x2: x + size, y2: y }); // Right wall
                        sticks.push({ x1: x + size/2, y1: y - size - 15, x2: x, y2: y - size }); // Roof L
                        sticks.push({ x1: x + size/2, y1: y - size - 15, x2: x + size, y2: y - size }); // Roof R
                    }
                }
                figs.push({ sticks, width: patternStartX + n * size + 20, height: 100 });
            }
            return figs;
        };

        const formula = `${a}n+${b}`;

        return {
            renderData: {
                description: lang === 'sv' 
                    ? `Vilket uttryck beskriver antalet stickor i figur $n$?` 
                    : `Which expression describes the number of sticks in figure $n$?`,
                answerType: 'text',
                geometry: {
                    type: 'pattern',
                    subtype: 'matchsticks',
                    figures: getFigures()
                }
            },
            token: this.toBase64(formula),
            clues: [
                {
                    text: lang === 'sv' ? "Hur många stickor läggs till för varje ny figur? Det är talet framför n." : "How many sticks are added for each new figure? That is the number in front of n.",
                    latex: `a = ${a}`
                },
                {
                    text: lang === 'sv' ? `I Figur 1 (n=1) finns det ${a + b} stickor. Testa: $${a} \\cdot 1 + b = ${a + b}$.` : `In Figure 1 (n=1) there are ${a + b} sticks. Test: $${a} \\cdot 1 + b = ${a + b}$.`,
                    latex: `b = ${b}`
                }
            ]
        };
    }

    private level4_TableToFormula(lang: string): any {
        const a = MathUtils.randomInt(2, 7);
        const b = MathUtils.randomInt(-5, 5);
        const formula = `${a}n${b > 0 ? '+' + b : (b < 0 ? b : '')}`;

        return {
            renderData: {
                description: lang === 'sv' ? "Skriv formeln för tabellen (använd n):" : "Write the formula for the table (use n):",
                answerType: 'text',
                geometry: {
                    type: 'frequency_table',
                    headers: ["n", lang === 'sv' ? "Värde" : "Value"],
                    rows: [[1, a + b], [2, 2 * a + b], [3, 3 * a + b], [4, 4 * a + b]]
                }
            },
            token: this.toBase64(formula),
            clues: [
                { text: lang === 'sv' ? "Hitta skillnaden mellan värdena (a)." : "Find the difference between values (a).", latex: `a = ${a}` }
            ]
        };
    }

    private level5_ReverseEngineering(lang: string): any {
        const a = MathUtils.randomInt(3, 8);
        const b = MathUtils.randomInt(2, 10);
        const n = MathUtils.randomInt(10, 30);
        const total = a * n + b;
        const formula = `${a}n + ${b}`;

        return {
            renderData: {
                description: lang === 'sv'
                    ? `Ett mönster följer formeln $V = ${formula}$. Vilket nummer ($n$) har figuren med värdet ${total}?`
                    : `A pattern follows the formula $V = ${formula}$. Which figure number ($n$) has the value ${total}?`,
                answerType: 'numeric'
            },
            token: this.toBase64(n.toString()),
            clues: [
                { text: lang === 'sv' ? "Ställ upp en ekvation:" : "Set up an equation:", latex: `${a}n + ${b} = ${total}` },
                { text: lang === 'sv' ? "Ta bort konstanten och dela sedan med a." : "Remove the constant and then divide by a.", latex: `n = (${total} - ${b}) / ${a}` }
            ]
        };
    }
}